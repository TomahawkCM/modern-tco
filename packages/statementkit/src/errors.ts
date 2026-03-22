/**
 * Structured error types for the bank statement parsing pipeline.
 *
 * Provides programmatic error handling with error codes,
 * recovery hints, and affected line context.
 */

export type StatementKitErrorCode =
  // Format detection
  | "FORMAT_UNKNOWN"
  | "FORMAT_EMPTY_FILE"
  | "FORMAT_CORRUPTED"
  // Parse errors
  | "PARSE_INVALID_CSV"
  | "PARSE_MISSING_HEADERS"
  | "PARSE_DATE_FAILED"
  | "PARSE_AMOUNT_FAILED"
  | "PARSE_BANK_UNKNOWN"
  | "PARSE_ENCODING_ERROR"
  | "PARSE_XML_MALFORMED"
  // Validation errors
  | "VALIDATE_NO_TRANSACTIONS"
  | "VALIDATE_DATE_RANGE"
  | "VALIDATE_DUPLICATE_FITID"
  | "VALIDATE_AMOUNT_AMBIGUOUS"
  // OCR errors
  | "OCR_LOW_CONFIDENCE"
  | "OCR_NO_TEXT"
  | "OCR_CANCELLED"
  | "OCR_BROWSER_ONLY"
  | "OCR_WORKER_FAILED";

/**
 * Base error class for all StatementKit errors.
 * Provides structured error information for programmatic handling.
 */
export class StatementKitError extends Error {
  readonly code: StatementKitErrorCode;
  readonly recoveryHint: string;
  readonly affectedLine?: number;
  readonly context?: Record<string, unknown>;

  constructor(
    code: StatementKitErrorCode,
    message: string,
    options?: {
      recoveryHint?: string;
      affectedLine?: number;
      context?: Record<string, unknown>;
      cause?: Error;
    }
  ) {
    super(message);
    this.name = "StatementKitError";
    this.code = code;
    this.recoveryHint = options?.recoveryHint ?? "";
    this.affectedLine = options?.affectedLine;
    this.context = options?.context;
  }
}

/**
 * Thrown when the file format cannot be identified.
 */
export class FormatDetectionError extends StatementKitError {
  constructor(
    message: string,
    options?: {
      recoveryHint?: string;
      context?: Record<string, unknown>;
      cause?: Error;
    }
  ) {
    super("FORMAT_UNKNOWN", message, {
      recoveryHint:
        options?.recoveryHint ??
        "Ensure the file is a supported format (CSV, OFX, QIF, PDF, MT940, or CAMT.053).",
      ...options,
    });
    this.name = "FormatDetectionError";
  }
}

/**
 * Thrown when parsing fails at a specific point in the file.
 */
export class ParseError extends StatementKitError {
  constructor(
    code: StatementKitErrorCode,
    message: string,
    options?: {
      recoveryHint?: string;
      affectedLine?: number;
      context?: Record<string, unknown>;
      cause?: Error;
    }
  ) {
    super(code, message, options);
    this.name = "ParseError";
  }
}

/**
 * Thrown when parsed data fails validation checks.
 */
export class ValidationError extends StatementKitError {
  constructor(
    code: StatementKitErrorCode,
    message: string,
    options?: {
      recoveryHint?: string;
      context?: Record<string, unknown>;
      cause?: Error;
    }
  ) {
    super(code, message, options);
    this.name = "ValidationError";
  }
}

/**
 * Thrown when OCR processing fails or produces unusable results.
 */
export class OCRError extends StatementKitError {
  constructor(
    code: StatementKitErrorCode,
    message: string,
    options?: {
      recoveryHint?: string;
      context?: Record<string, unknown>;
      cause?: Error;
    }
  ) {
    super(code, message, {
      recoveryHint:
        options?.recoveryHint ??
        "Try scanning at a higher resolution (300+ DPI) or use a clearer copy of the statement.",
      ...options,
    });
    this.name = "OCRError";
  }
}
