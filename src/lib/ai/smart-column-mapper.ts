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

const COLUMN_PATTERNS = {
  date: [
    /^date/i,
    /transaction.*date/i,
    /posting.*date/i,
    /posted.*date/i,
    /process.*date/i,
    /entry.*date/i,
  ],
  description: [
    /^description/i,
    /^details/i,
    /^memo/i,
    /^payee/i,
    /^merchant/i,
    /^name/i,
    /particulars/i,
    /narrative/i,
  ],
  amount: [
    /^amount/i,
    /transaction.*amount/i,
    /^value/i,
    /^sum/i,
  ],
  debit: [
    /^debit/i,
    /withdrawal/i,
    /outflow/i,
    /^out/i,
    /spent/i,
    /^dr/i,
  ],
  credit: [
    /^credit/i,
    /deposit/i,
    /inflow/i,
    /^in/i,
    /received/i,
    /^cr/i,
  ],
  balance: [
    /balance/i,
    /running.*balance/i,
    /current.*balance/i,
    /closing.*balance/i,
  ],
};

// ============================================================================
// Pattern-Based Detection (Fast Path)
// ============================================================================

/**
 * Quick column mapping using regex patterns
 * Fast path before calling AI - works for 60% of cases
 */
function detectColumnsFromPatterns(headers: string[]): ColumnMapping | null {
  const mapping: Partial<ColumnMapping> = {
    columnConfidences: {},
  };

  let totalMatches = 0;

  for (const header of headers) {
    let matched = false;

    // Try matching each column type
    for (const [type, patterns] of Object.entries(COLUMN_PATTERNS)) {
      if (patterns.some((pattern) => pattern.test(header))) {
        const key = `${type}Column` as keyof ColumnMapping;
        (mapping as any)[key] = header;
        (mapping.columnConfidences as any)[header] = 0.8;
        totalMatches++;
        matched = true;
        break;
      }
    }

    if (!matched) {
      (mapping.columnConfidences as any)[header] = 0.0;
    }
  }

  // Need at least date + description + (amount OR debit+credit)
  const hasDate = mapping.dateColumn !== undefined;
  const hasDescription = mapping.descriptionColumn !== undefined;
  const hasAmount =
    mapping.amountColumn !== undefined ||
    (mapping.debitColumn !== undefined && mapping.creditColumn !== undefined);

  if (hasDate && hasDescription && hasAmount) {
    // Determine amount format
    const amountFormat =
      mapping.debitColumn && mapping.creditColumn ? 'split' : 'single';

    return {
      dateColumn: mapping.dateColumn || null,
      descriptionColumn: mapping.descriptionColumn || null,
      amountColumn: mapping.amountColumn || null,
      debitColumn: mapping.debitColumn || null,
      creditColumn: mapping.creditColumn || null,
      balanceColumn: mapping.balanceColumn || null,
      confidence: Math.min(0.8, totalMatches / headers.length),
      columnConfidences: mapping.columnConfidences || {},
      detectionMethod: 'pattern-matching',
      amountFormat,
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
  // Try fast pattern matching first
  const patternMatch = detectColumnsFromPatterns(headers);
  if (patternMatch && patternMatch.confidence >= 0.8) {
    console.log('[SmartColumnMapper] High-confidence pattern match:', patternMatch);
    return {
      mapping: patternMatch,
      suggestions: [],
      warnings: [],
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
