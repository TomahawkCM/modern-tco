/**
 * AI-Powered Smart Column Mapper
 * Intelligently maps CSV columns to transaction fields using OpenAI
 *
 * Features:
 * - Analyzes column names + sample data to infer purpose
 * - Handles multi-column amounts (Debit/Credit vs single Amount)
 * - Detects date formats automatically
 * - Provides confidence scores for each mapping
 * - Saves custom mappings for future imports
 *
 * Privacy: Only sends column names and sample values (no account numbers)
 */

import { chatCompletionJSON, cleanDescriptionForAI } from './openai-service';
import type { CSVRow, BankConfig } from '@/types/budget';

// ============================================================================
// Types
// ============================================================================

export interface ColumnMapping {
  dateColumn: string | null;
  descriptionColumn: string | null;
  amountColumn: string | null; // Single amount column
  debitColumn: string | null; // Debit column (if split format)
  creditColumn: string | null; // Credit column (if split format)
  balanceColumn: string | null; // Optional balance column
  confidence: number; // 0-1 overall confidence
  columnConfidences: Record<string, number>; // Per-column confidence
  detectionMethod: 'ai-analysis' | 'pattern-matching' | 'user-manual';
  amountFormat: 'single' | 'split'; // Single amount vs Debit/Credit
  dateFormat?: string; // Detected date format (e.g., 'MM/dd/yyyy')
}

export interface ColumnAnalysisResult {
  mapping: ColumnMapping;
  suggestions: string[]; // Helpful suggestions for user
  warnings: string[]; // Potential issues detected
  samplePreview: Array<{
    date: string;
    description: string;
    amount: number;
    original: CSVRow;
  }>;
}

interface AIColumnMappingResponse {
  date_column: string | null;
  description_column: string | null;
  amount_column: string | null;
  debit_column: string | null;
  credit_column: string | null;
  balance_column: string | null;
  confidence: number;
  column_confidences: Record<string, number>;
  amount_format: 'single' | 'split';
  date_format: string;
  reasoning: string;
  suggestions: string[];
  warnings: string[];
}

// ============================================================================
// Column Type Patterns
// ============================================================================

// Comprehensive column patterns for worldwide bank formats
const COLUMN_PATTERNS = {
  date: [
    /^date$/i,
    /^trans.*date/i,          // Trans Date, Transaction Date
    /^posting.*date/i,        // Posting Date
    /^posted.*date/i,         // Posted Date
    /^post.*date/i,           // Post Date
    /^process.*date/i,        // Process Date
    /^entry.*date/i,          // Entry Date
    /^value.*date/i,          // Value Date
    /^trade.*date/i,          // Trade Date
    /^settlement.*date/i,     // Settlement Date
    /^effective.*date/i,      // Effective Date
    /^book.*date/i,           // Book Date
    /^fecha/i,                // Spanish: Fecha
    /^datum/i,                // German/Dutch: Datum
    /^data/i,                 // Italian/Portuguese: Data
    /日期/,                    // Chinese: 日期
    /日付/,                    // Japanese: 日付
    /날짜/,                    // Korean: 날짜
  ],
  description: [
    /^description/i,
    /^desc$/i,
    /^details/i,
    /^detail$/i,
    /^memo/i,
    /^payee/i,
    /^merchant.*name/i,       // Merchant Name
    /^merchant$/i,            // Merchant
    /^vendor/i,               // Vendor
    /^name$/i,                // Name (be careful - might be cardholder)
    /^transaction.*desc/i,    // Transaction Description
    /^particulars/i,          // Particulars (UK/India)
    /^narrative/i,            // Narrative
    /^reference/i,            // Reference (sometimes description)
    /^beneficiary/i,          // Beneficiary
    /^recipient/i,            // Recipient
    /^payer/i,                // Payer
    /^concepto/i,             // Spanish: Concepto
    /^beschreibung/i,         // German: Beschreibung
    /^omschrijving/i,         // Dutch: Omschrijving
    /^descrizione/i,          // Italian: Descrizione
    /^descrição/i,            // Portuguese: Descrição
    /摘要|描述|商户/,           // Chinese: Summary/Description/Merchant
    /摘要|説明/,               // Japanese: Summary/Description
  ],
  amount: [
    /^amount$/i,
    /^transaction.*amount/i,
    /^value$/i,
    /^sum$/i,
    /^total$/i,
    /^money/i,
    /^payment.*amount/i,
    /^net.*amount/i,
    /^gross.*amount/i,
    /^monto/i,                // Spanish: Monto
    /^betrag/i,               // German: Betrag
    /^bedrag/i,               // Dutch: Bedrag
    /^importo/i,              // Italian: Importo
    /^valor/i,                // Portuguese/Spanish: Valor
    /金額|金额/,               // Chinese/Japanese: Amount
  ],
  debit: [
    /^debit/i,
    /^withdrawal/i,
    /^withdrawals/i,
    /^outflow/i,
    /^out$/i,
    /^spent/i,
    /^expense/i,
    /^payment$/i,
    /^dr$/i,
    /^charge/i,
    /^purchases/i,
    /^débito/i,               // Spanish/Portuguese: Débito
    /^soll/i,                 // German: Soll
    /^af$/i,                  // Dutch: Af
    /^uscita/i,               // Italian: Uscita
    /支出|借方/,               // Chinese: Expense/Debit
  ],
  credit: [
    /^credit/i,
    /^deposit/i,
    /^deposits/i,
    /^inflow/i,
    /^in$/i,
    /^received/i,
    /^income/i,
    /^cr$/i,
    /^refund/i,
    /^crédito/i,              // Spanish/Portuguese: Crédito
    /^haben/i,                // German: Haben
    /^bij$/i,                 // Dutch: Bij
    /^entrata/i,              // Italian: Entrata
    /收入|贷方/,               // Chinese: Income/Credit
  ],
  balance: [
    /balance/i,
    /running.*balance/i,
    /current.*balance/i,
    /closing.*balance/i,
    /available.*balance/i,
    /saldo/i,                 // Spanish/Italian/Portuguese/German: Saldo
    /kontostand/i,            // German: Kontostand
    /余额/,                    // Chinese: Balance
  ],
};

// Common date formats worldwide
const DATE_PATTERNS = [
  { regex: /^\d{4}-\d{2}-\d{2}$/, format: 'yyyy-MM-dd' },           // ISO: 2024-01-15
  { regex: /^\d{2}\/\d{2}\/\d{4}$/, format: 'MM/dd/yyyy' },         // US: 01/15/2024
  { regex: /^\d{2}-\d{2}-\d{4}$/, format: 'MM-dd-yyyy' },           // US alt: 01-15-2024
  { regex: /^\d{1,2}\/\d{1,2}\/\d{4}$/, format: 'M/d/yyyy' },       // US flexible: 1/5/2024
  { regex: /^\d{2}\/\d{2}\/\d{2}$/, format: 'MM/dd/yy' },           // US short: 01/15/24
  { regex: /^\d{4}\/\d{2}\/\d{2}$/, format: 'yyyy/MM/dd' },         // Japan: 2024/01/15
  { regex: /^\d{2}\.\d{2}\.\d{4}$/, format: 'dd.MM.yyyy' },         // European: 15.01.2024
  { regex: /^\d{8}$/, format: 'yyyyMMdd' },                          // Compact: 20240115
  { regex: /^\d{2}\s+\w{3}\s+\d{4}$/i, format: 'dd MMM yyyy' },     // UK: 15 Jan 2024
  { regex: /^\w{3}\s+\d{2},?\s+\d{4}$/i, format: 'MMM dd, yyyy' },  // US verbose: Jan 15, 2024
];

// Currency/amount patterns to detect amount columns by value (ALL world currencies)
const AMOUNT_VALUE_PATTERNS = [
  // Major currency symbols
  /^-?[$€£¥₹₽₩฿₫₴₸¢₦₱₭₮₲₵₡₢₣₤₥₧₨₪₰₳₷₺₼₾֏؋৳៛₠₯ƒ﷼]?[\d\s,.']+[$€£¥₹₽₩฿₫₴₸¢₦₱₭₮₲₵₡₢₣₤₥₧₨₪₰₳₷₺₼₾֏؋৳៛₠₯ƒ﷼]?$/,
  // Accounting format: (100.00) or ($100.00)
  /^\([$€£¥₹]?[\d,.']+\)$/,
  // With any 3-letter currency code
  /^-?[\d\s,.']+\s*[A-Z]{3}$/i,
  /^[A-Z]{3}\s*-?[\d\s,.']+$/i,
  // Plain numbers (most common)
  /^-?[\d]+[,.\s]?[\d]*$/,
  // Numbers with thousands separators
  /^-?[\d]{1,3}([,.\s']?\d{3})*([,.]\d{1,2})?$/,
  // Indian numbering: 1,00,000
  /^-?[\d]{1,2}(,\d{2})*(,\d{3})?(\.\d{2})?$/,
];

// ============================================================================
// Pattern-Based Detection (Fast Path)
// ============================================================================

/**
 * Detect if a value looks like a date
 */
function looksLikeDate(value: string): { isDate: boolean; format?: string } {
  if (!value || typeof value !== 'string') return { isDate: false };
  const trimmed = value.trim();
  
  for (const { regex, format } of DATE_PATTERNS) {
    if (regex.test(trimmed)) {
      return { isDate: true, format };
    }
  }
  return { isDate: false };
}

/**
 * Detect if a value looks like a currency/amount
 */
function looksLikeAmount(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  
  // Check against amount patterns
  for (const pattern of AMOUNT_VALUE_PATTERNS) {
    if (pattern.test(trimmed)) return true;
  }
  
  // Also check for simple numbers that could be amounts
  const cleaned = trimmed.replace(/[$€£¥,.\s()-]/g, '');
  return /^\d+$/.test(cleaned) && cleaned.length <= 12;
}

/**
 * Detect if a value looks like a description (text)
 */
function looksLikeDescription(value: string): boolean {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  
  // Too short to be meaningful description
  if (trimmed.length < 3) return false;
  
  // Contains letters and is reasonably long
  const hasLetters = /[a-zA-Z\u00C0-\u024F\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF]/.test(trimmed);
  const isNotPureNumber = !/^[\d.,\-$€£¥()\s]+$/.test(trimmed);
  
  return hasLetters && isNotPureNumber && trimmed.length >= 3;
}

/**
 * Smart column detection using both header patterns AND data analysis
 * Works for ~90% of bank formats worldwide
 */
function detectColumnsFromPatterns(headers: string[], sampleRows?: CSVRow[]): ColumnMapping | null {
  const mapping: Partial<ColumnMapping> = {
    columnConfidences: {},
  };
  const columnConfidences: Record<string, number> = {};

  // Phase 1: Header-based pattern matching
  const headerMatches: Record<string, { type: string; confidence: number }> = {};
  
  for (const header of headers) {
    columnConfidences[header] = 0;
    
    for (const [type, patterns] of Object.entries(COLUMN_PATTERNS)) {
      if (patterns.some((pattern) => pattern.test(header))) {
        headerMatches[header] = { type, confidence: 0.7 };
        columnConfidences[header] = 0.7;
        break;
      }
    }
  }

  // Phase 2: Data-based detection (analyze actual values)
  if (sampleRows && sampleRows.length > 0) {
    for (const header of headers) {
      const values = sampleRows.slice(0, 10).map(row => String(row[header] || '')).filter(v => v.trim());
      if (values.length === 0) continue;

      // Check for date columns
      const dateResults = values.map(v => looksLikeDate(v));
      const dateMatchCount = dateResults.filter(r => r.isDate).length;
      const dateConfidence = dateMatchCount / values.length;
      
      if (dateConfidence >= 0.7) {
        const existingMatch = headerMatches[header];
        if (!existingMatch || existingMatch.type !== 'date') {
          headerMatches[header] = { type: 'date', confidence: dateConfidence };
        } else {
          // Boost confidence if header AND data match
          headerMatches[header].confidence = Math.min(1.0, existingMatch.confidence + 0.2);
        }
        columnConfidences[header] = headerMatches[header].confidence;
        
        // Detect date format from first valid match
        const firstDateMatch = dateResults.find(r => r.isDate && r.format);
        if (firstDateMatch?.format) {
          (mapping as any).dateFormat = firstDateMatch.format;
        }
      }

      // Check for amount columns
      const amountMatchCount = values.filter(v => looksLikeAmount(v)).length;
      const amountConfidence = amountMatchCount / values.length;

      if (amountConfidence >= 0.6) {
        const existingMatch = headerMatches[header];
        // Determine if it's debit, credit, or generic amount based on header
        let amountType = 'amount';
        const headerLower = header.toLowerCase();
        if (/debit|withdrawal|out|expense|dr\b/i.test(headerLower)) {
          amountType = 'debit';
        } else if (/credit|deposit|in\b|income|cr\b/i.test(headerLower)) {
          amountType = 'credit';
        }

        // If header already matched an amount pattern, BOOST confidence (header + data = strong signal)
        if (existingMatch && (existingMatch.type === 'amount' || existingMatch.type === 'debit' || existingMatch.type === 'credit')) {
          headerMatches[header].confidence = Math.min(1.0, existingMatch.confidence + 0.25);
          columnConfidences[header] = headerMatches[header].confidence;
        } else if (!existingMatch || existingMatch.type !== 'date') {
          // Only set as amount if no existing match or not already a date
          // Penalize columns that look like codes (4-5 digit integers only, no currency symbols)
          const looksLikeCode = values.every(v => /^\d{4,5}$/.test(v.trim()));
          const adjustedConfidence = looksLikeCode ? amountConfidence * 0.3 : amountConfidence;

          if (!existingMatch || existingMatch.confidence < adjustedConfidence) {
            headerMatches[header] = { type: amountType, confidence: adjustedConfidence };
            columnConfidences[header] = adjustedConfidence;
          }
        }
      }

      // Check for description columns
      const descMatchCount = values.filter(v => looksLikeDescription(v)).length;
      const descConfidence = descMatchCount / values.length;

      if (descConfidence >= 0.7) {
        const existingMatch = headerMatches[header];
        // Avoid overriding date or amount detections
        if (!existingMatch || (existingMatch.type !== 'date' && existingMatch.type !== 'amount' &&
            existingMatch.type !== 'debit' && existingMatch.type !== 'credit')) {
          // Check if header suggests description (prioritize merchant/payee over generic name)
          const headerLower = header.toLowerCase();
          const isPrimaryDescription = /merchant|payee|desc|detail|memo|narr|partic/i.test(headerLower);
          const isSecondaryDescription = /name$/i.test(headerLower) && !/account|card|holder/i.test(headerLower);

          // Boost confidence for primary description headers
          let adjustedConfidence = descConfidence;
          if (isPrimaryDescription) {
            adjustedConfidence = Math.min(1.0, descConfidence + 0.2);
          } else if (isSecondaryDescription) {
            adjustedConfidence = descConfidence;
          } else {
            // Penalize columns that don't have description-like headers
            adjustedConfidence = descConfidence * 0.6;
          }

          if (existingMatch && existingMatch.type === 'description') {
            // Boost if header already matched description pattern
            headerMatches[header].confidence = Math.min(1.0, existingMatch.confidence + 0.2);
            columnConfidences[header] = headerMatches[header].confidence;
          } else if (isPrimaryDescription || isSecondaryDescription || !existingMatch) {
            headerMatches[header] = { type: 'description', confidence: adjustedConfidence };
            columnConfidences[header] = adjustedConfidence;
          }
        }
      }
    }
  }

  // Phase 3: Build final mapping from best matches
  const typeAssignments: Record<string, string> = {};
  
  // Sort by confidence and assign types
  const sortedHeaders = Object.entries(headerMatches)
    .sort((a, b) => b[1].confidence - a[1].confidence);
  
  for (const [header, { type, confidence }] of sortedHeaders) {
    // Don't assign if this type is already assigned (except for debit/credit which can coexist)
    const typeKey = `${type}Column`;
    if (type === 'debit' || type === 'credit') {
      if (!typeAssignments[typeKey]) {
        typeAssignments[typeKey] = header;
        (mapping as any)[typeKey] = header;
        columnConfidences[header] = confidence;
      }
    } else if (!Object.values(typeAssignments).includes(header) && !typeAssignments[typeKey]) {
      typeAssignments[typeKey] = header;
      (mapping as any)[typeKey] = header;
      columnConfidences[header] = confidence;
    }
  }

  mapping.columnConfidences = columnConfidences;

  // Check what we have
  const hasDate = mapping.dateColumn !== undefined;
  const hasDescription = mapping.descriptionColumn !== undefined;
  const hasAmount = mapping.amountColumn !== undefined ||
    mapping.debitColumn !== undefined ||
    mapping.creditColumn !== undefined;

  // Phase 4: If we're missing columns, try to infer from data patterns
  if (sampleRows && sampleRows.length > 0 && (!hasDate || !hasDescription || !hasAmount)) {
    for (const header of headers) {
      if (typeAssignments[`${header}Column`]) continue; // Already assigned
      
      const values = sampleRows.slice(0, 10).map(row => String(row[header] || '')).filter(v => v.trim());
      if (values.length === 0) continue;

      // If we don't have a date column, try to find one by data
      if (!mapping.dateColumn) {
        const dateResults = values.map(v => looksLikeDate(v));
        if (dateResults.filter(r => r.isDate).length >= values.length * 0.5) {
          mapping.dateColumn = header;
          columnConfidences[header] = 0.6;
          const firstDateMatch = dateResults.find(r => r.isDate && r.format);
          if (firstDateMatch?.format) {
            (mapping as any).dateFormat = firstDateMatch.format;
          }
        }
      }

      // If we don't have an amount column, try to find one by data
      if (!mapping.amountColumn && !mapping.debitColumn && !mapping.creditColumn) {
        const amountMatches = values.filter(v => looksLikeAmount(v)).length;
        if (amountMatches >= values.length * 0.5) {
          mapping.amountColumn = header;
          columnConfidences[header] = 0.6;
        }
      }

      // If we don't have a description column, use the longest text column
      if (!mapping.descriptionColumn) {
        const avgLength = values.reduce((sum, v) => sum + v.length, 0) / values.length;
        const hasText = values.some(v => /[a-zA-Z\u00C0-\u024F\u4E00-\u9FFF]/.test(v));
        if (hasText && avgLength > 5 && !looksLikeAmount(values[0])) {
          const dateCheck = looksLikeDate(values[0]);
          if (!dateCheck.isDate) {
            mapping.descriptionColumn = header;
            columnConfidences[header] = 0.5;
          }
        }
      }
    }
  }

  // Recalculate what we have after inference
  const finalHasDate = mapping.dateColumn !== undefined;
  const finalHasDescription = mapping.descriptionColumn !== undefined;
  const finalHasAmount = mapping.amountColumn !== undefined ||
    mapping.debitColumn !== undefined ||
    mapping.creditColumn !== undefined;

  // Determine amount format
  const amountFormat = (mapping.debitColumn || mapping.creditColumn) && !mapping.amountColumn 
    ? 'split' 
    : 'single';

  // Calculate overall confidence
  const assignedConfidences = Object.values(columnConfidences).filter(c => c > 0);
  const avgConfidence = assignedConfidences.length > 0 
    ? assignedConfidences.reduce((a, b) => a + b, 0) / assignedConfidences.length 
    : 0.3;

  // Always return something if we have at least date + amount (description can be empty)
  // This ensures we always try to import rather than asking the user
  if (finalHasDate && finalHasAmount) {
    return {
      dateColumn: mapping.dateColumn || null,
      descriptionColumn: mapping.descriptionColumn || null,
      amountColumn: mapping.amountColumn || null,
      debitColumn: mapping.debitColumn || null,
      creditColumn: mapping.creditColumn || null,
      balanceColumn: mapping.balanceColumn || null,
      confidence: Math.max(avgConfidence, 0.5), // Minimum 0.5 if we have date + amount
      columnConfidences,
      detectionMethod: 'pattern-matching',
      amountFormat,
      dateFormat: (mapping as any).dateFormat,
    };
  }

  // Even with just partial data, return what we found
  if (finalHasDate || finalHasDescription || finalHasAmount) {
    return {
      dateColumn: mapping.dateColumn || null,
      descriptionColumn: mapping.descriptionColumn || null,
      amountColumn: mapping.amountColumn || null,
      debitColumn: mapping.debitColumn || null,
      creditColumn: mapping.creditColumn || null,
      balanceColumn: mapping.balanceColumn || null,
      confidence: avgConfidence,
      columnConfidences,
      detectionMethod: 'pattern-matching',
      amountFormat: 'single',
      dateFormat: (mapping as any).dateFormat,
    };
  }

  // Last resort: try positional detection (Date is usually first, Description second, Amount third)
  if (headers.length >= 3) {
    return {
      dateColumn: headers[0],
      descriptionColumn: headers[1],
      amountColumn: headers[2],
      debitColumn: null,
      creditColumn: null,
      balanceColumn: null,
      confidence: 0.3,
      columnConfidences: { [headers[0]]: 0.3, [headers[1]]: 0.3, [headers[2]]: 0.3 },
      detectionMethod: 'pattern-matching',
      amountFormat: 'single',
    };
  }

  return null;
}

// ============================================================================
// AI-Powered Analysis
// ============================================================================

/**
 * Analyze CSV columns using AI with sample data
 *
 * @param headers - CSV column headers
 * @param sampleRows - First 10 rows of data
 * @returns Column mapping with confidence scores
 */
export async function analyzeColumnsWithAI(
  headers: string[],
  sampleRows: CSVRow[]
): Promise<ColumnAnalysisResult> {
  // Try smart pattern matching with data analysis first
  const patternMatch = detectColumnsFromPatterns(headers, sampleRows);
  
  if (patternMatch && patternMatch.confidence >= 0.7) {
    console.log('[SmartColumnMapper] High-confidence smart detection:', patternMatch);
    
    const suggestions: string[] = [];
    const warnings: string[] = [];
    
    // Add helpful context
    if (patternMatch.dateFormat) {
      suggestions.push(`Detected date format: ${patternMatch.dateFormat}`);
    }
    if (patternMatch.amountFormat === 'split') {
      suggestions.push('Using split Debit/Credit columns for amount calculation');
    }
    if (patternMatch.confidence < 0.9) {
      warnings.push('Please verify the column mappings before importing');
    }
    
    return {
      mapping: patternMatch,
      suggestions,
      warnings,
      samplePreview: generatePreview(sampleRows, patternMatch),
    };
  }

  // Build AI prompt
  const prompt = buildColumnAnalysisPrompt(headers, sampleRows);

  // Call OpenAI API
  const response = await chatCompletionJSON<AIColumnMappingResponse>(prompt, {
    model: 'gpt-3.5-turbo',
    temperature: 0.2, // Low temperature for consistency
    maxTokens: 600,
    cacheKey: `column-mapping-${headers.join(',')}-${sampleRows.length}`,
    systemPrompt:
      'You are a CSV column mapping expert. Analyze column headers and sample data to identify transaction fields. Respond with valid JSON only.',
  });

  if (!response.success || !response.data) {
    console.error('[SmartColumnMapper] AI analysis failed:', response.error);

    // Fallback to pattern matching if AI fails
    if (patternMatch) {
      return {
        mapping: patternMatch,
        suggestions: ['AI analysis unavailable, using pattern matching'],
        warnings: ['Low confidence - please verify mappings'],
        samplePreview: generatePreview(sampleRows, patternMatch),
      };
    }

    // Ultimate fallback: guess based on column order
    return {
      mapping: createFallbackMapping(headers),
      suggestions: ['Auto-detection failed - using column order guess'],
      warnings: ['CRITICAL: Please verify all mappings before importing'],
      samplePreview: [],
    };
  }

  const aiResult = response.data;

  // Build final mapping
  const mapping: ColumnMapping = {
    dateColumn: aiResult.date_column,
    descriptionColumn: aiResult.description_column,
    amountColumn: aiResult.amount_column,
    debitColumn: aiResult.debit_column,
    creditColumn: aiResult.credit_column,
    balanceColumn: aiResult.balance_column,
    confidence: aiResult.confidence,
    columnConfidences: aiResult.column_confidences || {},
    detectionMethod: 'ai-analysis',
    amountFormat: aiResult.amount_format,
    dateFormat: aiResult.date_format,
  };

  return {
    mapping,
    suggestions: aiResult.suggestions || [],
    warnings: aiResult.warnings || [],
    samplePreview: generatePreview(sampleRows, mapping),
  };
}

/**
 * Build AI column analysis prompt
 */
function buildColumnAnalysisPrompt(
  headers: string[],
  sampleRows: CSVRow[]
): string {
  // Clean sample data for privacy
  const cleanedSamples = sampleRows.slice(0, 10).map((row) => {
    const cleaned: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      cleaned[key] = cleanDescriptionForAI(String(value));
    }
    return cleaned;
  });

  return `Analyze this CSV file and map columns to transaction fields.

**CSV Headers**:
${headers.map((h, i) => `${i + 1}. "${h}"`).join('\n')}

**Sample Data** (first 5 rows, cleaned for privacy):
${cleanedSamples
  .slice(0, 5)
  .map(
    (row, i) =>
      `Row ${i + 1}: ${headers.map((h) => `${h}="${row[h] || ''}"`).join(', ')}`
  )
  .join('\n')}

**Task**: Map columns to these transaction fields:
- **date_column**: Column containing transaction date (required)
- **description_column**: Column with merchant/payee name (required)
- **amount_column**: Single amount column (positive for income, negative for expenses)
- **debit_column**: Debit/withdrawal column (if split format)
- **credit_column**: Credit/deposit column (if split format)
- **balance_column**: Running balance column (optional)

**Amount Format Detection**:
- If you see separate "Debit" and "Credit" columns → use "split" format
- If you see single "Amount" column → use "single" format

**Date Format Detection**:
Look at sample values to detect format: MM/dd/yyyy, dd/MM/yyyy, yyyy-MM-dd, etc.

**Confidence Scoring**:
- 1.0 = Perfect match (header names + data patterns match)
- 0.8 = High confidence (clear patterns)
- 0.6 = Medium confidence (some ambiguity)
- 0.4 = Low confidence (uncertain)
- 0.0 = Cannot determine

**Response Format** (JSON only):
{
  "date_column": "Transaction Date",
  "description_column": "Description",
  "amount_column": null,
  "debit_column": "Withdrawals",
  "credit_column": "Deposits",
  "balance_column": "Balance",
  "confidence": 0.95,
  "column_confidences": {
    "Transaction Date": 1.0,
    "Description": 0.9,
    "Withdrawals": 0.95,
    "Deposits": 0.95,
    "Balance": 0.8
  },
  "amount_format": "split",
  "date_format": "MM/dd/yyyy",
  "reasoning": "Detected standard bank format with separate debit/credit columns",
  "suggestions": ["Verify date format matches your bank's export"],
  "warnings": []
}`;
}

// ============================================================================
// Preview Generation
// ============================================================================

/**
 * Generate preview of how transactions will look after import
 */
function generatePreview(
  sampleRows: CSVRow[],
  mapping: ColumnMapping
): Array<{
  date: string;
  description: string;
  amount: number;
  original: CSVRow;
}> {
  return sampleRows.slice(0, 5).map((row) => {
    const date = mapping.dateColumn ? row[mapping.dateColumn] || '' : '';
    const description = mapping.descriptionColumn
      ? row[mapping.descriptionColumn] || ''
      : '';

    let amount = 0;

    if (mapping.amountFormat === 'split') {
      // Parse debit/credit columns
      const debit = mapping.debitColumn
        ? parseAmount(row[mapping.debitColumn])
        : 0;
      const credit = mapping.creditColumn
        ? parseAmount(row[mapping.creditColumn])
        : 0;

      // Debits are negative, credits are positive
      amount = credit > 0 ? credit : -Math.abs(debit);
    } else if (mapping.amountColumn) {
      // Parse single amount column
      amount = parseAmount(row[mapping.amountColumn]);
    }

    return {
      date,
      description,
      amount,
      original: row,
    };
  });
}

/**
 * Parse amount from string
 */
function parseAmount(value: any): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  const str = String(value).trim();

  // Handle parentheses (negative)
  if (str.includes('(') && str.includes(')')) {
    const num = parseFloat(str.replace(/[(),\s]/g, ''));
    return -Math.abs(num);
  }

  // Handle negative sign
  const num = parseFloat(str.replace(/[$,\s]/g, ''));
  return isNaN(num) ? 0 : num;
}

// ============================================================================
// Fallback Mapping
// ============================================================================

/**
 * Create fallback mapping based on column order
 * Assumes: Date | Description | Amount (most common format)
 */
function createFallbackMapping(headers: string[]): ColumnMapping {
  return {
    dateColumn: headers[0] || null,
    descriptionColumn: headers[1] || null,
    amountColumn: headers[2] || null,
    debitColumn: null,
    creditColumn: null,
    balanceColumn: null,
    confidence: 0.3, // Low confidence
    columnConfidences: headers.reduce((acc, h) => {
      acc[h] = 0.3;
      return acc;
    }, {} as Record<string, number>),
    detectionMethod: 'pattern-matching',
    amountFormat: 'single',
  };
}

// ============================================================================
// Custom Bank Config Persistence
// ============================================================================

const CUSTOM_BANKS_STORAGE_KEY = 'budget-app-custom-banks';

export interface CustomBankConfig extends BankConfig {
  customKey: string; // Unique identifier (e.g., 'custom-mybank-1')
  createdAt: number;
  usageCount: number;
}

/**
 * Save custom bank configuration for future imports
 */
export function saveCustomBankConfig(
  bankName: string,
  mapping: ColumnMapping
): CustomBankConfig {
  const customKey = `custom-${bankName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

  const config: CustomBankConfig = {
    name: bankName,
    dateColumn: mapping.dateColumn || '',
    descriptionColumn: mapping.descriptionColumn || '',
    amountColumn: mapping.amountColumn || '',
    dateFormat: mapping.dateFormat || 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
    customKey,
    createdAt: Date.now(),
    usageCount: 1,
  };

  // Load existing custom banks
  const existing = getCustomBankConfigs();
  existing.push(config);

  // Save to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(CUSTOM_BANKS_STORAGE_KEY, JSON.stringify(existing));
  }

  return config;
}

/**
 * Get all custom bank configurations
 */
export function getCustomBankConfigs(): CustomBankConfig[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(CUSTOM_BANKS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('[SmartColumnMapper] Error loading custom banks:', error);
  }

  return [];
}

/**
 * Increment usage count for custom bank config
 */
export function incrementCustomBankUsage(customKey: string): void {
  const configs = getCustomBankConfigs();
  const config = configs.find((c) => c.customKey === customKey);

  if (config) {
    config.usageCount++;
    if (typeof window !== 'undefined') {
      localStorage.setItem(CUSTOM_BANKS_STORAGE_KEY, JSON.stringify(configs));
    }
  }
}
