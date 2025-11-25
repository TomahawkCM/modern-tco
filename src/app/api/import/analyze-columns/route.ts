/**
 * Column Analysis API Route
 * Server-side AI-powered column mapping for CSV imports
 *
 * POST /api/import/analyze-columns
 *
 * Request Body:
 * {
 *   headers: string[],           // CSV column headers
 *   sampleData: object[],        // First 10 rows of data
 *   bankKey?: string             // Known bank key (optional)
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   mapping: ColumnMapping,
 *   suggestions: string[],
 *   warnings: string[],
 *   samplePreview: object[]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// ============================================================================
// Types
// ============================================================================

interface ColumnMapping {
  dateColumn: string | null;
  descriptionColumn: string | null;
  amountColumn: string | null;
  debitColumn: string | null;
  creditColumn: string | null;
  balanceColumn: string | null;
  confidence: number;
  columnConfidences: Record<string, number>;
  detectionMethod: 'ai-analysis' | 'pattern-matching' | 'user-manual';
  amountFormat: 'single' | 'split';
  dateFormat?: string;
}

interface ColumnAnalysisRequest {
  headers: string[];
  sampleData: Record<string, string>[];
  bankKey?: string;
}

interface ColumnAnalysisResponse {
  success: boolean;
  mapping?: ColumnMapping;
  suggestions?: string[];
  warnings?: string[];
  samplePreview?: Array<{
    date: string;
    description: string;
    amount: number;
    original: Record<string, string>;
  }>;
  error?: string;
}

// ============================================================================
// Column Type Patterns (Fast Path)
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

/**
 * Quick column mapping using regex patterns (no AI)
 */
function detectColumnsFromPatterns(headers: string[]): ColumnMapping | null {
  const mapping: Partial<ColumnMapping> = {
    columnConfidences: {},
  };

  let totalMatches = 0;

  for (const header of headers) {
    let matched = false;

    for (const [type, patterns] of Object.entries(COLUMN_PATTERNS)) {
      if (patterns.some((pattern) => pattern.test(header))) {
        const key = `${type}Column` as keyof ColumnMapping;
        (mapping as Record<string, unknown>)[key] = header;
        (mapping.columnConfidences as Record<string, number>)[header] = 0.8;
        totalMatches++;
        matched = true;
        break;
      }
    }

    if (!matched) {
      (mapping.columnConfidences as Record<string, number>)[header] = 0.0;
    }
  }

  // Need at least date + description + (amount OR debit+credit)
  const hasDate = mapping.dateColumn !== undefined;
  const hasDescription = mapping.descriptionColumn !== undefined;
  const hasAmount =
    mapping.amountColumn !== undefined ||
    (mapping.debitColumn !== undefined && mapping.creditColumn !== undefined);

  if (hasDate && hasDescription && hasAmount) {
    const amountFormat =
      mapping.debitColumn && mapping.creditColumn ? 'split' : 'single';

    return {
      dateColumn: (mapping.dateColumn as string) || null,
      descriptionColumn: (mapping.descriptionColumn as string) || null,
      amountColumn: (mapping.amountColumn as string) || null,
      debitColumn: (mapping.debitColumn as string) || null,
      creditColumn: (mapping.creditColumn as string) || null,
      balanceColumn: (mapping.balanceColumn as string) || null,
      confidence: Math.min(0.8, totalMatches / headers.length),
      columnConfidences: mapping.columnConfidences || {},
      detectionMethod: 'pattern-matching',
      amountFormat,
    };
  }

  return null;
}

/**
 * Clean description for privacy before sending to AI
 */
function cleanDescriptionForAI(description: string): string {
  let cleaned = description.trim();

  // Remove account numbers
  cleaned = cleaned.replace(/\b\d{4}[- ]?\d{4,}\b/g, '[ACCOUNT]');
  cleaned = cleaned.replace(/\bXXXX[- ]?\d{4,}\b/gi, '[ACCOUNT]');

  // Remove transaction IDs
  cleaned = cleaned.replace(/\b\d{10,}\b/g, '[ID]');

  // Remove common prefixes
  cleaned = cleaned.replace(/^\[[A-Z]{2}\]\s*/i, '');
  cleaned = cleaned.replace(/^(PURCHASE|DEBIT|CREDIT|PAYMENT|AUTH)\s+/i, '');

  // Remove dates
  cleaned = cleaned.replace(/\d{1,2}\/\d{1,2}\/\d{2,4}/g, '[DATE]');
  cleaned = cleaned.replace(/\d{4}-\d{2}-\d{2}/g, '[DATE]');

  // Clean whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Parse amount from string
 */
function parseAmount(value: unknown): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  const str = String(value).trim();

  // Handle parentheses (negative)
  if (str.includes('(') && str.includes(')')) {
    const num = parseFloat(str.replace(/[(),\s]/g, ''));
    return -Math.abs(num);
  }

  const num = parseFloat(str.replace(/[$,\s]/g, ''));
  return isNaN(num) ? 0 : num;
}

/**
 * Generate preview of how transactions will look
 */
function generatePreview(
  sampleRows: Record<string, string>[],
  mapping: ColumnMapping
): Array<{
  date: string;
  description: string;
  amount: number;
  original: Record<string, string>;
}> {
  return sampleRows.slice(0, 5).map((row) => {
    const date = mapping.dateColumn ? row[mapping.dateColumn] || '' : '';
    const description = mapping.descriptionColumn
      ? row[mapping.descriptionColumn] || ''
      : '';

    let amount = 0;

    if (mapping.amountFormat === 'split') {
      const debit = mapping.debitColumn
        ? parseAmount(row[mapping.debitColumn])
        : 0;
      const credit = mapping.creditColumn
        ? parseAmount(row[mapping.creditColumn])
        : 0;
      amount = credit > 0 ? credit : -Math.abs(debit);
    } else if (mapping.amountColumn) {
      amount = parseAmount(row[mapping.amountColumn]);
    }

    return { date, description, amount, original: row };
  });
}

/**
 * Create fallback mapping based on column order
 */
function createFallbackMapping(headers: string[]): ColumnMapping {
  return {
    dateColumn: headers[0] || null,
    descriptionColumn: headers[1] || null,
    amountColumn: headers[2] || null,
    debitColumn: null,
    creditColumn: null,
    balanceColumn: null,
    confidence: 0.3,
    columnConfidences: headers.reduce((acc, h) => {
      acc[h] = 0.3;
      return acc;
    }, {} as Record<string, number>),
    detectionMethod: 'pattern-matching',
    amountFormat: 'single',
  };
}

// ============================================================================
// API Handler
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse<ColumnAnalysisResponse>> {
  try {
    const body = (await request.json()) as ColumnAnalysisRequest;

    // Validation
    if (!body.headers || !Array.isArray(body.headers) || body.headers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid headers array' },
        { status: 400 }
      );
    }

    if (!body.sampleData || !Array.isArray(body.sampleData) || body.sampleData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid sampleData array' },
        { status: 400 }
      );
    }

    // Step 1: Try fast pattern matching
    const patternMatch = detectColumnsFromPatterns(body.headers);
    if (patternMatch && patternMatch.confidence >= 0.8) {
      console.log('[AnalyzeColumns] High-confidence pattern match');
      return NextResponse.json({
        success: true,
        mapping: patternMatch,
        suggestions: [],
        warnings: [],
        samplePreview: generatePreview(body.sampleData, patternMatch),
      });
    }

    // Step 2: Try AI analysis (server-side, secure)
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('[AnalyzeColumns] No OPENAI_API_KEY, using pattern matching fallback');

      // Return pattern match if available, otherwise fallback
      if (patternMatch) {
        return NextResponse.json({
          success: true,
          mapping: patternMatch,
          suggestions: ['AI analysis unavailable, using pattern matching'],
          warnings: ['Low confidence - please verify mappings'],
          samplePreview: generatePreview(body.sampleData, patternMatch),
        });
      }

      return NextResponse.json({
        success: true,
        mapping: createFallbackMapping(body.headers),
        suggestions: ['Auto-detection unavailable - using column order guess'],
        warnings: ['Please verify all mappings before importing'],
        samplePreview: [],
      });
    }

    // Build AI prompt
    const cleanedSamples = body.sampleData.slice(0, 10).map((row) => {
      const cleaned: Record<string, string> = {};
      for (const [key, value] of Object.entries(row)) {
        cleaned[key] = cleanDescriptionForAI(String(value));
      }
      return cleaned;
    });

    const prompt = `Analyze this CSV file and map columns to transaction fields.

**CSV Headers**:
${body.headers.map((h, i) => `${i + 1}. "${h}"`).join('\n')}

**Sample Data** (first 5 rows, cleaned for privacy):
${cleanedSamples
  .slice(0, 5)
  .map((row, i) => `Row ${i + 1}: ${body.headers.map((h) => `${h}="${row[h] || ''}"`).join(', ')}`)
  .join('\n')}

**Task**: Map columns to these transaction fields:
- **date_column**: Column containing transaction date (required)
- **description_column**: Column with merchant/payee name (required)
- **amount_column**: Single amount column (if single format)
- **debit_column**: Debit/withdrawal column (if split format)
- **credit_column**: Credit/deposit column (if split format)
- **balance_column**: Running balance column (optional)

**Response Format** (JSON only):
{
  "date_column": "Transaction Date",
  "description_column": "Description",
  "amount_column": null,
  "debit_column": "Withdrawals",
  "credit_column": "Deposits",
  "balance_column": "Balance",
  "confidence": 0.95,
  "column_confidences": {"Transaction Date": 1.0, "Description": 0.9},
  "amount_format": "split",
  "date_format": "MM/dd/yyyy",
  "reasoning": "Detected standard bank format",
  "suggestions": [],
  "warnings": []
}`;

    const client = new OpenAI({ apiKey });

    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a CSV column mapping expert. Respond with valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 600,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const aiResult = JSON.parse(content);

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

    return NextResponse.json({
      success: true,
      mapping,
      suggestions: aiResult.suggestions || [],
      warnings: aiResult.warnings || [],
      samplePreview: generatePreview(body.sampleData, mapping),
    });
  } catch (error) {
    console.error('[AnalyzeColumns] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
