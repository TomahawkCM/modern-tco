/**
 * Format Detection Module
 * Automatically detects file format (CSV, OFX, QFX, QBO, QIF, MT940, CAMT.053)
 * based on content analysis. Used by import wizard to route files to appropriate parsers.
 */

export type FileFormat =
  | "csv"
  | "ofx"
  | "qfx"
  | "qbo"
  | "pdf"
  | "qif"
  | "mt940"
  | "camt053"
  | "unknown";

export interface FormatDetectionResult {
  format: FileFormat;
  confidence: number; // 0-1 scale
  details: {
    extension?: string;
    contentSignature?: string;
    mimeType?: string;
  };
  suggestions?: string[]; // Helpful messages if confidence is low
}

/**
 * Detect file format from file object
 * Combines extension, MIME type, and content analysis
 */
export async function detectFileFormat(file: File): Promise<FormatDetectionResult> {
  const extension = getFileExtension(file.name);
  const mimeType = file.type;

  // Read first 1000 bytes for content analysis
  const preview = await readFilePreview(file, 1000);
  const contentFormat = detectFromContent(preview);

  // Combine signals for final decision
  return combineSignals(extension, mimeType, contentFormat, file.name);
}

/**
 * Detect format from file content (first N bytes)
 */
export function detectFromContent(content: string): {
  format: FileFormat;
  confidence: number;
  signature?: string;
} {
  const trimmed = content.trim();
  const upper = trimmed.toUpperCase();

  // ========================================
  // PDF (starts with %PDF- signature)
  // ========================================
  if (trimmed.startsWith("%PDF-")) {
    return {
      format: "pdf",
      confidence: 0.99,
      signature: "PDF",
    };
  }

  // ========================================
  // XML-based formats (OFX 2.x, CAMT.053)
  // ========================================
  if (trimmed.startsWith("<?xml") || trimmed.startsWith("<?XML")) {
    // Check if it contains <OFX> tag
    if (upper.includes("<OFX>") || upper.includes("<OFX ")) {
      return {
        format: "ofx",
        confidence: 0.95,
        signature: "XML-OFX",
      };
    }
    // Check for CAMT.053 (ISO 20022 bank-to-customer statement)
    if (upper.includes("URN:ISO:STD:ISO:20022:TECH:XSD:CAMT.053")) {
      return {
        format: "camt053",
        confidence: 0.95,
        signature: "CAMT053",
      };
    }
    // Might be some other XML format
    return {
      format: "unknown",
      confidence: 0.3,
      signature: "XML-UNKNOWN",
    };
  }

  // ========================================
  // OFX 1.x (SGML with OFXHEADER)
  // ========================================
  if (upper.includes("OFXHEADER:") || upper.includes("<OFXHEADER>")) {
    return {
      format: "ofx",
      confidence: 0.95,
      signature: "SGML-OFX",
    };
  }

  // ========================================
  // QFX (Quicken format with QFXHEADER)
  // ========================================
  if (upper.includes("QFXHEADER:") || upper.includes("<QFXHEADER>")) {
    return {
      format: "qfx",
      confidence: 0.95,
      signature: "QFX",
    };
  }

  // ========================================
  // CAMT.053 without XML declaration (starts with <Document>)
  // ========================================
  if (trimmed.startsWith("<Document") && upper.includes("URN:ISO:STD:ISO:20022:TECH:XSD:CAMT.053")) {
    return {
      format: "camt053",
      confidence: 0.95,
      signature: "CAMT053",
    };
  }

  // ========================================
  // QIF (Quicken Interchange Format)
  // Lines starting with !Type: or records with D/T/P prefixes delimited by ^
  // Note: QBO also uses !Type: but QIF has ^ record delimiters
  // ========================================
  if (trimmed.startsWith("!Type:") || upper.includes("!TYPE:")) {
    // Distinguish QIF from QBO: QIF has ^ record delimiters with D/T/P field prefixes
    const hasRecordDelimiters = trimmed.includes("^");
    const hasQIFFields = /^[DTP]/m.test(trimmed.substring(trimmed.indexOf("\n") + 1));

    if (hasRecordDelimiters && hasQIFFields) {
      return {
        format: "qif",
        confidence: 0.9,
        signature: "QIF",
      };
    }

    // Fall through to QBO detection if no QIF markers
    return {
      format: "qbo",
      confidence: 0.9,
      signature: "QBO",
    };
  }

  // ========================================
  // MT940 (SWIFT bank statement format)
  // Starts with :20: or :25: SWIFT message tags
  // ========================================
  if (/^:20:/.test(trimmed) || /^:25:/.test(trimmed) || /^\{1:/.test(trimmed)) {
    return {
      format: "mt940",
      confidence: 0.95,
      signature: "MT940",
    };
  }

  // ========================================
  // CSV (comma-separated with consistent structure)
  // ========================================
  const looksLikeCSV = analyzeCSVStructure(content);
  if (looksLikeCSV.isCSV) {
    return {
      format: "csv",
      confidence: looksLikeCSV.confidence,
      signature: "CSV",
    };
  }

  // ========================================
  // Unknown format
  // ========================================
  return {
    format: "unknown",
    confidence: 0,
  };
}

/**
 * Analyze if content looks like CSV
 */
function analyzeCSVStructure(content: string): {
  isCSV: boolean;
  confidence: number;
} {
  const lines = content.split("\n").filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return { isCSV: false, confidence: 0 };
  }

  // Check if lines contain commas
  const linesWithCommas = lines.filter((line) => line.includes(","));
  const commaRatio = linesWithCommas.length / lines.length;

  if (commaRatio < 0.5) {
    return { isCSV: false, confidence: 0 };
  }

  // Check if first line looks like headers (letters, spaces, capitals)
  const firstLine = lines[0];
  const hasLetters = /[a-zA-Z]/.test(firstLine);
  const hasCommas = firstLine.includes(",");

  if (!hasLetters || !hasCommas) {
    return { isCSV: false, confidence: 0.2 };
  }

  // Check column count consistency
  const columnCounts = lines.slice(0, 10).map((line) => {
    return line.split(",").length;
  });

  const uniqueCounts = new Set(columnCounts);
  const isConsistent = uniqueCounts.size <= 2; // Allow slight variation

  let confidence = 0.5;
  if (commaRatio > 0.8) confidence += 0.2;
  if (isConsistent) confidence += 0.2;
  if (hasLetters) confidence += 0.1;

  return {
    isCSV: confidence > 0.5,
    confidence: Math.min(confidence, 0.9), // Max 0.9 for content-only detection
  };
}

/**
 * Combine extension, MIME, and content signals
 */
function combineSignals(
  extension: string | null,
  mimeType: string,
  contentAnalysis: { format: FileFormat; confidence: number; signature?: string },
  filename: string
): FormatDetectionResult {
  const result: FormatDetectionResult = {
    format: contentAnalysis.format,
    confidence: contentAnalysis.confidence,
    details: {
      extension: extension || undefined,
      contentSignature: contentAnalysis.signature,
      mimeType: mimeType || undefined,
    },
    suggestions: [],
  };

  // ========================================
  // High confidence from content - trust it
  // ========================================
  if (contentAnalysis.confidence >= 0.9) {
    // Check if extension matches
    if (extension && extension !== contentAnalysis.format) {
      result.suggestions?.push(
        `File extension is .${extension} but content appears to be ${contentAnalysis.format.toUpperCase()}. Using detected format.`
      );
    }
    return result;
  }

  // ========================================
  // Medium confidence - use extension as tie-breaker
  // ========================================
  if (contentAnalysis.confidence >= 0.5 && contentAnalysis.confidence < 0.9) {
    if (extension && extension === contentAnalysis.format) {
      // Extension confirms content detection
      result.confidence = Math.min(result.confidence + 0.1, 1.0);
    } else if (extension && extension !== contentAnalysis.format) {
      // Mismatch - warn user
      result.suggestions?.push(
        `File extension (.${extension}) doesn't match detected format (${contentAnalysis.format.toUpperCase()}). Using detected format.`
      );
    }
    return result;
  }

  // ========================================
  // Low confidence - fall back to extension
  // ========================================
  if (contentAnalysis.confidence < 0.5) {
    // Map common extensions to formats (including aliases)
    const extensionMap: Record<string, FileFormat> = {
      csv: "csv",
      ofx: "ofx",
      qfx: "qfx",
      qbo: "qbo",
      pdf: "pdf",
      qif: "qif",
      sta: "mt940",
      mt940: "mt940",
      xml: "camt053", // XML extension could be CAMT.053 (low confidence)
    };
    const mappedFormat = extension ? extensionMap[extension] : undefined;
    if (mappedFormat) {
      result.format = mappedFormat;
      result.confidence = 0.5; // Extension-based detection has medium confidence
      result.suggestions?.push(
        `Unable to detect format from content. Using file extension (.${extension}).`
      );
    } else {
      result.format = "unknown";
      result.confidence = 0;
      result.suggestions?.push(
        `Unable to detect file format. Please ensure the file is a valid CSV, OFX, QFX, QIF, MT940, CAMT.053, or PDF bank statement.`
      );
    }
  }

  return result;
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string | null {
  const parts = filename.toLowerCase().split(".");
  if (parts.length < 2) return null;
  const ext = parts[parts.length - 1];
  return ext;
}

/**
 * Read first N bytes of file as text
 */
async function readFilePreview(file: File, bytes: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const blob = file.slice(0, bytes);

    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text || "");
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file preview"));
    };

    reader.readAsText(blob);
  });
}

/**
 * Validate detected format with full file content
 * Used after initial detection for additional verification
 */
export function validateFormat(
  content: string,
  detectedFormat: FileFormat
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  switch (detectedFormat) {
    case "ofx":
    case "qfx":
      // Check for required OFX elements
      if (!content.includes("<OFX>")) {
        errors.push("Missing <OFX> root element");
      }
      if (
        !content.includes("STMTTRN") &&
        !content.includes("CCSTMTTRN") &&
        !content.includes("INVSTMTTRN")
      ) {
        errors.push("No transaction data found");
      }
      break;

    case "csv":
      // Check for at least 2 rows
      const lines = content.split("\n").filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        errors.push("CSV file must have at least 2 rows (header + data)");
      }
      break;

    case "qbo":
      // Check for QuickBooks format markers
      if (!content.includes("!Type:")) {
        errors.push("Missing !Type: declaration");
      }
      break;

    case "qif":
      // Check for QIF markers
      if (!content.includes("!Type:") && !content.includes("^")) {
        errors.push("Missing QIF record markers (!Type: or ^ delimiters)");
      }
      break;

    case "mt940":
      // Check for SWIFT message tags
      if (!content.includes(":20:") && !content.includes(":25:") && !content.includes("{1:")) {
        errors.push("Missing MT940 SWIFT message tags (:20:, :25:)");
      }
      break;

    case "camt053":
      // Check for ISO 20022 CAMT.053 namespace
      if (!content.includes("camt.053")) {
        errors.push("Missing CAMT.053 namespace declaration");
      }
      break;

    default:
      errors.push(`Unsupported format: ${detectedFormat}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get human-readable format name
 */
export function getFormatDisplayName(format: FileFormat): string {
  const names: Record<FileFormat, string> = {
    csv: "CSV (Comma-Separated Values)",
    ofx: "OFX (Open Financial Exchange)",
    qfx: "QFX (Quicken)",
    qbo: "QBO (QuickBooks)",
    pdf: "PDF (Bank Statement)",
    qif: "QIF (Quicken Interchange Format)",
    mt940: "MT940 (SWIFT Bank Statement)",
    camt053: "CAMT.053 (ISO 20022 Bank Statement)",
    unknown: "Unknown Format",
  };
  return names[format] || "Unknown Format";
}

/**
 * Get supported formats list
 */
export function getSupportedFormats(): FileFormat[] {
  return ["csv", "ofx", "qfx", "pdf", "qif", "mt940", "camt053"];
}

/**
 * Check if format is supported
 */
export function isFormatSupported(format: FileFormat): boolean {
  return getSupportedFormats().includes(format);
}
