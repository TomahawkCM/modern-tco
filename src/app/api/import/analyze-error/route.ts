/**
 * Error Analysis API Route
 * Server-side AI-powered error recovery for import failures
 *
 * POST /api/import/analyze-error
 *
 * Request Body:
 * {
 *   error: string,               // Error message
 *   fileInfo: { name, size, type },
 *   context?: { fileSample, stackTrace }
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   category: ErrorCategory,
 *   severity: 'low' | 'medium' | 'high',
 *   canRecover: boolean,
 *   suggestions: RecoverySuggestion[],
 *   aiAnalysis?: string
 * }
 */

import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// ============================================================================
// Types
// ============================================================================

type ErrorCategory =
  | "format_detection"
  | "encoding"
  | "csv_parsing"
  | "bank_detection"
  | "column_mapping"
  | "ofx_parsing"
  | "pdf_ocr"
  | "data_validation"
  | "corrupted_file"
  | "unknown";

type RecoverySuggestionType = "auto_fix" | "user_action" | "alternative_method" | "file_reexport";

interface RecoverySuggestion {
  type: RecoverySuggestionType;
  title: string;
  description: string;
  actionLabel?: string;
  autoFixable: boolean;
  confidence: number;
  technicalDetails?: string;
}

interface ErrorAnalysisRequest {
  error: string;
  fileInfo: {
    name: string;
    size: number;
    type: string;
  };
  context?: {
    fileSample?: string;
    stackTrace?: string;
  };
}

interface ErrorAnalysisResponse {
  success: boolean;
  category?: ErrorCategory;
  severity?: "low" | "medium" | "high";
  canRecover?: boolean;
  suggestions?: RecoverySuggestion[];
  aiAnalysis?: string;
  detectedIssues?: string[];
  error?: string;
}

// ============================================================================
// Error Pattern Detection
// ============================================================================

const ERROR_PATTERNS: Record<ErrorCategory, RegExp[]> = {
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
  pdf_ocr: [/ocr/i, /pdf/i, /low.*confidence/i, /unable to extract/i],
  data_validation: [/validation/i, /invalid.*data/i],
  corrupted_file: [/corrupted/i, /malformed/i, /unexpected.*end/i, /invalid.*structure/i],
  unknown: [],
};

/**
 * Detect error category from error message
 */
function detectErrorCategory(errorMessage: string): ErrorCategory {
  const msg = errorMessage.toLowerCase();

  for (const [category, patterns] of Object.entries(ERROR_PATTERNS)) {
    if (patterns.some((pattern) => pattern.test(msg))) {
      return category as ErrorCategory;
    }
  }

  return "unknown";
}

/**
 * Get severity for error category
 */
function getSeverity(category: ErrorCategory): "low" | "medium" | "high" {
  const severityMap: Record<ErrorCategory, "low" | "medium" | "high"> = {
    format_detection: "medium",
    encoding: "medium",
    csv_parsing: "high",
    bank_detection: "low",
    column_mapping: "medium",
    ofx_parsing: "high",
    pdf_ocr: "low",
    data_validation: "medium",
    corrupted_file: "high",
    unknown: "medium",
  };

  return severityMap[category];
}

/**
 * Get pattern-based suggestions (no AI needed)
 */
function getPatternBasedSuggestions(
  errorMessage: string,
  category: ErrorCategory
): RecoverySuggestion[] {
  const suggestions: RecoverySuggestion[] = [];

  switch (category) {
    case "encoding":
      suggestions.push({
        type: "auto_fix",
        title: "Try UTF-8 Encoding",
        description:
          "The file appears to have encoding issues. We can attempt to re-read it with different character encodings.",
        actionLabel: "Auto-Fix Encoding",
        autoFixable: true,
        confidence: 0.85,
        technicalDetails: "Will try UTF-8, UTF-16, Latin-1, and Windows-1252 encodings",
      });
      suggestions.push({
        type: "user_action",
        title: "Re-export from Bank",
        description:
          'Download the CSV file again from your bank and ensure "UTF-8" encoding is selected if available.',
        autoFixable: false,
        confidence: 0.9,
      });
      break;

    case "format_detection":
      suggestions.push({
        type: "user_action",
        title: "Select Format Manually",
        description:
          "The file format could not be auto-detected. Please select the correct format (CSV, OFX, QFX, or PDF) manually.",
        actionLabel: "Choose Format",
        autoFixable: false,
        confidence: 0.95,
      });
      suggestions.push({
        type: "file_reexport",
        title: "Export as CSV",
        description:
          "CSV is the most universally supported format. Try exporting your transactions as CSV from your bank.",
        autoFixable: false,
        confidence: 0.8,
      });
      break;

    case "csv_parsing":
      if (errorMessage.toLowerCase().includes("empty")) {
        suggestions.push({
          type: "user_action",
          title: "Check File Contents",
          description:
            "The CSV file appears to be empty. Verify that the file downloaded correctly and contains transaction data.",
          autoFixable: false,
          confidence: 0.95,
        });
      } else {
        suggestions.push({
          type: "auto_fix",
          title: "Skip Header Rows",
          description:
            "The CSV might have extra header rows. We can try skipping 1-3 rows to find the actual data.",
          actionLabel: "Auto-Detect Headers",
          autoFixable: true,
          confidence: 0.75,
        });
        suggestions.push({
          type: "alternative_method",
          title: "Use Column Mapper",
          description:
            "Use the Column Mapping Wizard to manually specify which columns contain date, description, and amount.",
          actionLabel: "Open Column Mapper",
          autoFixable: false,
          confidence: 0.85,
        });
      }
      break;

    case "bank_detection":
      suggestions.push({
        type: "alternative_method",
        title: "Use Column Mapper",
        description:
          "The Column Mapping Wizard can handle ANY bank format, even ones we've never seen before.",
        actionLabel: "Launch Mapper",
        autoFixable: false,
        confidence: 0.95,
      });
      suggestions.push({
        type: "user_action",
        title: "Select Bank Manually",
        description: "Choose your bank from the dropdown menu instead of using auto-detection.",
        actionLabel: "Choose Bank",
        autoFixable: false,
        confidence: 0.9,
      });
      break;

    case "column_mapping":
      suggestions.push({
        type: "auto_fix",
        title: "Re-analyze Columns",
        description: "We can re-run the column analysis with more sample rows to improve accuracy.",
        actionLabel: "Re-analyze",
        autoFixable: true,
        confidence: 0.7,
      });
      suggestions.push({
        type: "user_action",
        title: "Manual Column Selection",
        description:
          "Review the column mappings in the Column Mapper and adjust any incorrect assignments.",
        actionLabel: "Review Mappings",
        autoFixable: false,
        confidence: 0.9,
      });
      break;

    case "ofx_parsing":
      suggestions.push({
        type: "file_reexport",
        title: "Re-download OFX File",
        description:
          "The OFX file may be corrupted or incomplete. Download it again from your bank.",
        autoFixable: false,
        confidence: 0.8,
      });
      suggestions.push({
        type: "alternative_method",
        title: "Try CSV Format",
        description:
          "Export your transactions as CSV instead of OFX. CSV is simpler and less prone to errors.",
        autoFixable: false,
        confidence: 0.85,
      });
      break;

    case "pdf_ocr":
      suggestions.push({
        type: "user_action",
        title: "Use Manual Column Mapper",
        description:
          "PDF OCR confidence is low. Use the manual column mapper to specify which columns contain transaction data.",
        actionLabel: "Open Mapper",
        autoFixable: false,
        confidence: 0.9,
      });
      suggestions.push({
        type: "alternative_method",
        title: "Export as CSV or OFX",
        description:
          "PDF parsing is less reliable than structured formats. Export as CSV or OFX if your bank supports it.",
        autoFixable: false,
        confidence: 0.95,
      });
      break;

    case "corrupted_file":
      suggestions.push({
        type: "file_reexport",
        title: "Re-download File",
        description:
          "The file appears to be corrupted or incomplete. Download it again from your bank.",
        autoFixable: false,
        confidence: 0.9,
      });
      suggestions.push({
        type: "user_action",
        title: "Check File Size",
        description:
          "Verify the file size is reasonable (not 0 bytes or suspiciously small). The download may have failed.",
        autoFixable: false,
        confidence: 0.85,
      });
      break;

    default:
      suggestions.push({
        type: "user_action",
        title: "Try Different File Format",
        description:
          "If possible, export your transactions in a different format (CSV, OFX, or QFX) and try again.",
        autoFixable: false,
        confidence: 0.7,
      });
  }

  return suggestions;
}

// ============================================================================
// API Handler
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse<ErrorAnalysisResponse>> {
  try {
    const body = (await request.json()) as ErrorAnalysisRequest;

    // Validation
    if (!body.error || typeof body.error !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid error message" },
        { status: 400 }
      );
    }

    if (!body.fileInfo?.name) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid fileInfo" },
        { status: 400 }
      );
    }

    // Step 1: Pattern-based detection (fast path)
    const category = detectErrorCategory(body.error);
    const patternSuggestions = getPatternBasedSuggestions(body.error, category);

    // If we have high-confidence pattern matches, return immediately (no AI needed)
    if (patternSuggestions.length > 0 && patternSuggestions.some((s) => s.confidence >= 0.9)) {
      console.log("[AnalyzeError] High-confidence pattern match:", category);
      return NextResponse.json({
        success: true,
        category,
        severity: getSeverity(category),
        canRecover: true,
        suggestions: patternSuggestions,
        detectedIssues: [body.error],
      });
    }

    // Step 2: Try AI analysis for complex cases (server-side, secure)
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn("[AnalyzeError] No OPENAI_API_KEY, using pattern matching only");
      return NextResponse.json({
        success: true,
        category,
        severity: getSeverity(category),
        canRecover: patternSuggestions.length > 0,
        suggestions: patternSuggestions,
        detectedIssues: [body.error],
      });
    }

    // Build AI prompt
    const prompt = `Analyze this file import error and provide recovery suggestions.

**Error Message**:
${body.error}

**File Information**:
- Name: ${body.fileInfo.name}
- Size: ${body.fileInfo.size} bytes
- Type: ${body.fileInfo.type}

${body.context?.fileSample ? `**File Sample** (first 500 chars):\n${body.context.fileSample}\n` : ""}

**Task**: Analyze the error and provide recovery suggestions.

**Response Format** (JSON only):
{
  "category": "csv_parsing",
  "severity": "medium",
  "can_recover": true,
  "detected_issues": ["CSV has empty rows at the top"],
  "suggestions": [
    {
      "type": "auto_fix",
      "title": "Skip Header Rows",
      "description": "We can skip empty rows automatically.",
      "action_label": "Auto-Skip Rows",
      "auto_fixable": true,
      "confidence": 0.95
    }
  ],
  "ai_explanation": "The CSV file has empty header rows before the actual data."
}`;

    const client = new OpenAI({ apiKey });

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert in file import error analysis. Respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 600,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    const aiResult = JSON.parse(content);

    // Combine AI suggestions with pattern-based suggestions
    const allSuggestions: RecoverySuggestion[] = aiResult.suggestions.map(
      (s: {
        type: RecoverySuggestionType;
        title: string;
        description: string;
        action_label?: string;
        auto_fixable: boolean;
        confidence: number;
        technical_details?: string;
      }) => ({
        type: s.type,
        title: s.title,
        description: s.description,
        actionLabel: s.action_label,
        autoFixable: s.auto_fixable,
        confidence: s.confidence,
        technicalDetails: s.technical_details,
      })
    );

    // Add pattern-based suggestions that aren't duplicates
    for (const patternSugg of patternSuggestions) {
      if (!allSuggestions.some((s) => s.title === patternSugg.title)) {
        allSuggestions.push(patternSugg);
      }
    }

    // Sort by confidence
    allSuggestions.sort((a, b) => b.confidence - a.confidence);

    return NextResponse.json({
      success: true,
      category: aiResult.category,
      severity: aiResult.severity,
      canRecover: aiResult.can_recover,
      suggestions: allSuggestions.slice(0, 4),
      aiAnalysis: aiResult.ai_explanation,
      detectedIssues: aiResult.detected_issues,
    });
  } catch (error) {
    console.error("[AnalyzeError] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
