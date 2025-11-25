/**
 * AI-Powered Smart Error Recovery
 * Analyzes import failures and provides intelligent recovery suggestions
 *
 * Features:
 * - Pattern-based error detection for common issues
 * - AI-powered analysis for complex errors
 * - Auto-fix capabilities for high-confidence issues
 * - User-friendly recovery suggestions
 * - File encoding detection and fixes
 *
 * Goal: Reduce import failure rate by 70%
 */

import { chatCompletionJSON } from './openai-service';

// ============================================================================
// Types
// ============================================================================

export type ErrorCategory =
  | 'format_detection'
  | 'encoding'
  | 'csv_parsing'
  | 'bank_detection'
  | 'column_mapping'
  | 'ofx_parsing'
  | 'pdf_ocr'
  | 'data_validation'
  | 'corrupted_file'
  | 'unknown';

export type RecoverySuggestionType =
  | 'auto_fix'
  | 'user_action'
  | 'alternative_method'
  | 'file_reexport';

export interface RecoverySuggestion {
  type: RecoverySuggestionType;
  title: string;
  description: string;
  actionLabel?: string; // Button label for user action
  autoFixable: boolean; // Can this be fixed automatically?
  confidence: number; // 0-1 confidence in this suggestion
  technicalDetails?: string; // For advanced users
}

export interface ErrorAnalysisResult {
  category: ErrorCategory;
  severity: 'low' | 'medium' | 'high'; // Impact on import
  canRecover: boolean; // Is recovery possible?
  suggestions: RecoverySuggestion[];
  aiAnalysis?: string; // AI's explanation of the error
  detectedIssues: string[]; // Specific issues found
}

interface AIErrorAnalysisResponse {
  category: ErrorCategory;
  severity: 'low' | 'medium' | 'high';
  can_recover: boolean;
  detected_issues: string[];
  suggestions: Array<{
    type: RecoverySuggestionType;
    title: string;
    description: string;
    action_label: string;
    auto_fixable: boolean;
    confidence: number;
    technical_details?: string;
  }>;
  ai_explanation: string;
}

// ============================================================================
// Error Pattern Detection
// ============================================================================

/**
 * Common error patterns for fast detection
 */
const ERROR_PATTERNS = {
  encoding: [
    /encoding/i,
    /character/i,
    /utf-8/i,
    /ascii/i,
    /invalid.*byte/i,
    /malformed.*character/i,
  ],
  format_detection: [
    /unsupported.*format/i,
    /unable to detect.*format/i,
    /low confidence.*format/i,
    /invalid.*file.*format/i,
  ],
  csv_parsing: [
    /no data found/i,
    /empty.*file/i,
    /csv.*parsing/i,
    /incorrectly formatted/i,
    /invalid.*csv/i,
  ],
  bank_detection: [
    /could not.*detect.*bank/i,
    /invalid bank configuration/i,
    /unknown bank/i,
    /bank.*not found/i,
  ],
  column_mapping: [
    /column.*mapping/i,
    /missing.*column/i,
    /invalid.*column/i,
    /failed to apply.*mapping/i,
  ],
  ofx_parsing: [
    /ofx/i,
    /qfx/i,
    /<OFX>.*not found/i,
    /account information not found/i,
    /balance.*not found/i,
  ],
  pdf_ocr: [
    /ocr/i,
    /pdf/i,
    /low.*confidence/i,
    /unable to extract/i,
  ],
  corrupted_file: [
    /corrupted/i,
    /malformed/i,
    /unexpected.*end/i,
    /invalid.*structure/i,
  ],
};

/**
 * Detect error category from error message using patterns
 */
function detectErrorCategory(errorMessage: string): ErrorCategory {
  const msg = errorMessage.toLowerCase();

  for (const [category, patterns] of Object.entries(ERROR_PATTERNS)) {
    if (patterns.some((pattern) => pattern.test(msg))) {
      return category as ErrorCategory;
    }
  }

  return 'unknown';
}

// ============================================================================
// Pattern-Based Recovery (Fast Path)
// ============================================================================

/**
 * Get recovery suggestions based on known error patterns
 * Fast path before calling AI
 */
function getPatternBasedSuggestions(
  errorMessage: string,
  category: ErrorCategory
): RecoverySuggestion[] {
  const suggestions: RecoverySuggestion[] = [];

  switch (category) {
    case 'encoding':
      suggestions.push({
        type: 'auto_fix',
        title: 'Try UTF-8 Encoding',
        description:
          'The file appears to have encoding issues. We can attempt to re-read it with different character encodings.',
        actionLabel: 'Auto-Fix Encoding',
        autoFixable: true,
        confidence: 0.85,
        technicalDetails: 'Will try UTF-8, UTF-16, Latin-1, and Windows-1252 encodings',
      });
      suggestions.push({
        type: 'user_action',
        title: 'Re-export from Bank',
        description:
          'Download the CSV file again from your bank and ensure "UTF-8" encoding is selected if available.',
        autoFixable: false,
        confidence: 0.9,
      });
      break;

    case 'format_detection':
      suggestions.push({
        type: 'user_action',
        title: 'Select Format Manually',
        description:
          'The file format could not be auto-detected. Please select the correct format (CSV, OFX, QFX, or PDF) manually.',
        actionLabel: 'Choose Format',
        autoFixable: false,
        confidence: 0.95,
      });
      suggestions.push({
        type: 'file_reexport',
        title: 'Export as CSV',
        description:
          'CSV is the most universally supported format. Try exporting your transactions as CSV from your bank.',
        autoFixable: false,
        confidence: 0.8,
      });
      break;

    case 'csv_parsing':
      if (errorMessage.toLowerCase().includes('empty')) {
        suggestions.push({
          type: 'user_action',
          title: 'Check File Contents',
          description:
            'The CSV file appears to be empty. Verify that the file downloaded correctly and contains transaction data.',
          autoFixable: false,
          confidence: 0.95,
        });
      } else {
        suggestions.push({
          type: 'auto_fix',
          title: 'Skip Header Rows',
          description:
            'The CSV might have extra header rows. We can try skipping 1-3 rows to find the actual data.',
          actionLabel: 'Auto-Detect Headers',
          autoFixable: true,
          confidence: 0.75,
        });
        suggestions.push({
          type: 'alternative_method',
          title: 'Use Column Mapper',
          description:
            'Use the AI Column Mapping Wizard to manually specify which columns contain date, description, and amount.',
          actionLabel: 'Open Column Mapper',
          autoFixable: false,
          confidence: 0.85,
        });
      }
      break;

    case 'bank_detection':
      suggestions.push({
        type: 'alternative_method',
        title: 'Use AI Column Mapper',
        description:
          'The AI Column Mapping Wizard can handle ANY bank format, even ones we\'ve never seen before.',
        actionLabel: 'Launch AI Mapper',
        autoFixable: false,
        confidence: 0.95,
      });
      suggestions.push({
        type: 'user_action',
        title: 'Select Bank Manually',
        description:
          'Choose your bank from the dropdown menu instead of using auto-detection.',
        actionLabel: 'Choose Bank',
        autoFixable: false,
        confidence: 0.9,
      });
      break;

    case 'column_mapping':
      suggestions.push({
        type: 'auto_fix',
        title: 'Re-analyze Columns',
        description:
          'We can re-run the AI column analysis with more sample rows to improve accuracy.',
        actionLabel: 'Re-analyze',
        autoFixable: true,
        confidence: 0.7,
      });
      suggestions.push({
        type: 'user_action',
        title: 'Manual Column Selection',
        description:
          'Review the column mappings in the AI Column Mapper and adjust any incorrect assignments.',
        actionLabel: 'Review Mappings',
        autoFixable: false,
        confidence: 0.9,
      });
      break;

    case 'ofx_parsing':
      suggestions.push({
        type: 'file_reexport',
        title: 'Re-download OFX File',
        description:
          'The OFX file may be corrupted or incomplete. Download it again from your bank.',
        autoFixable: false,
        confidence: 0.8,
      });
      suggestions.push({
        type: 'alternative_method',
        title: 'Try CSV Format',
        description:
          'Export your transactions as CSV instead of OFX. CSV is simpler and less prone to errors.',
        autoFixable: false,
        confidence: 0.85,
      });
      break;

    case 'pdf_ocr':
      suggestions.push({
        type: 'user_action',
        title: 'Use Manual Column Mapper',
        description:
          'PDF OCR confidence is low. Use the manual column mapper to specify which columns contain transaction data.',
        actionLabel: 'Open Mapper',
        autoFixable: false,
        confidence: 0.9,
      });
      suggestions.push({
        type: 'alternative_method',
        title: 'Export as CSV or OFX',
        description:
          'PDF parsing is less reliable than structured formats. Export as CSV or OFX if your bank supports it.',
        autoFixable: false,
        confidence: 0.95,
      });
      break;

    case 'corrupted_file':
      suggestions.push({
        type: 'file_reexport',
        title: 'Re-download File',
        description:
          'The file appears to be corrupted or incomplete. Download it again from your bank.',
        autoFixable: false,
        confidence: 0.9,
      });
      suggestions.push({
        type: 'user_action',
        title: 'Check File Size',
        description:
          'Verify the file size is reasonable (not 0 bytes or suspiciously small). The download may have failed.',
        autoFixable: false,
        confidence: 0.85,
      });
      break;

    default:
      suggestions.push({
        type: 'user_action',
        title: 'Try Different File Format',
        description:
          'If possible, export your transactions in a different format (CSV, OFX, or QFX) and try again.',
        autoFixable: false,
        confidence: 0.7,
      });
  }

  return suggestions;
}

// ============================================================================
// AI-Powered Analysis
// ============================================================================

/**
 * Analyze error using AI for complex cases
 *
 * @param errorMessage - The error message from import
 * @param fileInfo - Information about the file being imported
 * @param context - Additional context (file content sample, etc.)
 */
export async function analyzeErrorWithAI(
  errorMessage: string,
  fileInfo: {
    name: string;
    size: number;
    type: string;
  },
  context?: {
    fileSample?: string; // First 500 characters of file
    stackTrace?: string;
  }
): Promise<ErrorAnalysisResult> {
  // First try pattern-based detection (fast path)
  const category = detectErrorCategory(errorMessage);
  const patternSuggestions = getPatternBasedSuggestions(errorMessage, category);

  // If we have high-confidence pattern matches, return immediately
  if (
    patternSuggestions.length > 0 &&
    patternSuggestions.some((s) => s.confidence >= 0.9)
  ) {
    console.log('[ErrorRecovery] High-confidence pattern match:', category);
    return {
      category,
      severity: getSeverity(category),
      canRecover: true,
      suggestions: patternSuggestions,
      detectedIssues: [errorMessage],
    };
  }

  // Complex error - use AI analysis
  console.log('[ErrorRecovery] Using AI for complex error analysis...');

  const prompt = buildErrorAnalysisPrompt(errorMessage, fileInfo, context);

  const response = await chatCompletionJSON<AIErrorAnalysisResponse>(prompt, {
    model: 'gpt-3.5-turbo',
    temperature: 0.3,
    maxTokens: 600,
    cacheKey: `error-recovery-${errorMessage.slice(0, 50)}`,
    systemPrompt:
      'You are an expert in file import error analysis and recovery. Analyze errors and provide actionable recovery suggestions. Respond with valid JSON only.',
  });

  if (!response.success || !response.data) {
    console.error('[ErrorRecovery] AI analysis failed:', response.error);
    // Fallback to pattern-based suggestions
    return {
      category,
      severity: getSeverity(category),
      canRecover: patternSuggestions.length > 0,
      suggestions: patternSuggestions,
      detectedIssues: [errorMessage],
    };
  }

  const aiResult = response.data;

  // Combine AI suggestions with pattern-based suggestions
  const allSuggestions: RecoverySuggestion[] = aiResult.suggestions.map((s) => ({
    type: s.type,
    title: s.title,
    description: s.description,
    actionLabel: s.action_label,
    autoFixable: s.auto_fixable,
    confidence: s.confidence,
    technicalDetails: s.technical_details,
  }));

  // Add pattern-based suggestions that aren't duplicates
  for (const patternSugg of patternSuggestions) {
    if (!allSuggestions.some((s) => s.title === patternSugg.title)) {
      allSuggestions.push(patternSugg);
    }
  }

  // Sort by confidence (highest first)
  allSuggestions.sort((a, b) => b.confidence - a.confidence);

  return {
    category: aiResult.category,
    severity: aiResult.severity,
    canRecover: aiResult.can_recover,
    suggestions: allSuggestions.slice(0, 4), // Max 4 suggestions
    aiAnalysis: aiResult.ai_explanation,
    detectedIssues: aiResult.detected_issues,
  };
}

/**
 * Build AI error analysis prompt
 */
function buildErrorAnalysisPrompt(
  errorMessage: string,
  fileInfo: { name: string; size: number; type: string },
  context?: { fileSample?: string; stackTrace?: string }
): string {
  return `Analyze this file import error and provide recovery suggestions.

**Error Message**:
${errorMessage}

**File Information**:
- Name: ${fileInfo.name}
- Size: ${fileInfo.size} bytes
- Type: ${fileInfo.type}

${context?.fileSample ? `**File Sample** (first 500 chars):\n${context.fileSample}\n` : ''}
${context?.stackTrace ? `**Stack Trace**:\n${context.stackTrace}\n` : ''}

**Task**: Analyze the error and provide recovery suggestions.

**Error Categories**: format_detection, encoding, csv_parsing, bank_detection, column_mapping, ofx_parsing, pdf_ocr, data_validation, corrupted_file, unknown

**Suggestion Types**:
- auto_fix: Can be fixed automatically (e.g., re-encoding, skipping rows)
- user_action: Requires user to do something (e.g., select bank manually)
- alternative_method: Suggest different import method (e.g., CSV instead of OFX)
- file_reexport: User needs to re-export file from bank

**Response Format** (JSON only):
{
  "category": "csv_parsing",
  "severity": "medium",
  "can_recover": true,
  "detected_issues": ["CSV has 5 empty rows at the top", "Date format not recognized"],
  "suggestions": [
    {
      "type": "auto_fix",
      "title": "Skip Header Rows",
      "description": "We detected 5 empty rows at the top. We can skip them automatically.",
      "action_label": "Auto-Skip Rows",
      "auto_fixable": true,
      "confidence": 0.95,
      "technical_details": "Will skip first 5 rows and retry parsing"
    },
    {
      "type": "user_action",
      "title": "Verify Date Format",
      "description": "The date format doesn't match expected patterns. Please verify dates are in MM/DD/YYYY format.",
      "action_label": "Review File",
      "auto_fixable": false,
      "confidence": 0.8
    }
  ],
  "ai_explanation": "The CSV file has 5 empty header rows before the actual data, causing the parser to fail. Additionally, dates may be in DD/MM/YYYY format instead of MM/DD/YYYY."
}`;
}

/**
 * Get severity level for error category
 */
function getSeverity(category: ErrorCategory): 'low' | 'medium' | 'high' {
  const severityMap: Record<ErrorCategory, 'low' | 'medium' | 'high'> = {
    format_detection: 'medium',
    encoding: 'medium',
    csv_parsing: 'high',
    bank_detection: 'low', // Can be worked around with manual selection
    column_mapping: 'medium',
    ofx_parsing: 'high',
    pdf_ocr: 'low', // Can use manual mapper
    data_validation: 'medium',
    corrupted_file: 'high',
    unknown: 'medium',
  };

  return severityMap[category];
}

// ============================================================================
// Auto-Fix Functions
// ============================================================================

/**
 * Attempt to auto-fix encoding issues
 */
export async function autoFixEncoding(file: File): Promise<{
  success: boolean;
  text?: string;
  encoding?: string;
  error?: string;
}> {
  const encodings = ['UTF-8', 'UTF-16LE', 'UTF-16BE', 'ISO-8859-1', 'windows-1252'];

  for (const encoding of encodings) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const decoder = new TextDecoder(encoding);
      const text = decoder.decode(arrayBuffer);

      // Check if the text looks reasonable (no replacement characters)
      if (!text.includes('\uFFFD') && text.length > 0) {
        console.log('[ErrorRecovery] Successfully decoded with:', encoding);
        return {
          success: true,
          text,
          encoding,
        };
      }
    } catch (error) {
      console.error(`[ErrorRecovery] Failed to decode with ${encoding}:`, error);
    }
  }

  return {
    success: false,
    error: 'Unable to decode file with any common encoding',
  };
}

/**
 * Attempt to auto-fix CSV parsing by trying different skipRows values
 */
export function autoFixCSVSkipRows(
  text: string,
  parseFunction: (text: string, skipRows: number) => any[]
): {
  success: boolean;
  rows?: any[];
  skipRows?: number;
  error?: string;
} {
  // Try skipRows 0-5
  for (let skipRows = 0; skipRows <= 5; skipRows++) {
    try {
      const rows = parseFunction(text, skipRows);
      if (rows.length > 0) {
        // Validate that the first row has reasonable data
        const firstRow = rows[0];
        const values = Object.values(firstRow);
        const hasData = values.some((v) => v && String(v).trim().length > 0);

        if (hasData) {
          console.log('[ErrorRecovery] Found valid data at skipRows:', skipRows);
          return {
            success: true,
            rows,
            skipRows,
          };
        }
      }
    } catch (error) {
      console.error(`[ErrorRecovery] Parse failed at skipRows ${skipRows}:`, error);
    }
  }

  return {
    success: false,
    error: 'No valid data found after trying skipRows 0-5',
  };
}
