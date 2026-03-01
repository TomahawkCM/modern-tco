/**
 * Shared types for import parsers
 * Used by CSV, OFX, QFX, and format detection modules
 */

// ============================================================================
// Core Types
// ============================================================================

/** A row from a parsed CSV file, keyed by column header */
export interface CSVRow {
  [key: string]: string;
}

/** A parsed transaction ready for import */
export interface ParsedTransaction {
  date: Date;
  description: string;
  amount: number; // positive = income, negative = expense (in major units, e.g., dollars)
  isDuplicate: boolean;
  confidence: number; // 0-1 for duplicate detection
  currency?: string; // ISO 4217 currency code (e.g., 'USD', 'EUR', 'JPY')
  fitid?: string; // OFX: Financial Institution Transaction ID (for perfect duplicate detection)
  checkNum?: string; // OFX: Check number if applicable
  transactionType?: string; // OFX: TRNTYPE (DEBIT, CREDIT, CHECK, etc.)
  // Smart duplicate detection details
  duplicateReason?: string; // Explanation of why it was flagged
  matchedTransactionId?: string; // ID of matched existing transaction
  requiresReview?: boolean; // True if confidence is below threshold and needs manual review
  // Source format tracking
  sourceFormat?: "csv" | "ofx" | "qfx" | "qbo" | "pdf" | "qif" | "mt940" | "camt053";
}

/** Existing transaction from the database (for duplicate detection) */
export interface ExistingTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  fitid?: string;
}

// ============================================================================
// Bank Configuration Types
// ============================================================================

/** Configuration for parsing a specific bank's CSV format */
export interface BankConfig {
  name: string;
  dateColumn: string;
  descriptionColumn: string;
  amountColumn: string;
  dateFormat: string;
  amountMultiplier?: number;
  hasHeader?: boolean;
  skipRows?: number;
  // Asian bank support - encoding and decimal separator
  encoding?: "UTF-8" | "Shift-JIS" | "GB2312" | "EUC-KR" | "Big5";
  decimalSeparator?: "." | ",";
  thousandSeparator?: "," | "." | " " | "";
  region?: "NA" | "EU" | "UK" | "AU" | "ASIA";
  // Verification metadata
  verified?: boolean;
  verifiedDate?: string;
  sampleRowCount?: number;
  communityContributed?: boolean;
}

/** Bank detection result with confidence scoring */
export interface BankDetectionResult {
  bank: string | null;
  confidence: number; // 0-1 scale (0 = no match, 1 = perfect match)
  alternatives?: Array<{
    bank: string;
    confidence: number;
    reason: string;
  }>;
  detectionMethod: "exact" | "fuzzy" | "pattern" | "none";
}

// ============================================================================
// Format Detection Types
// ============================================================================

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

// ============================================================================
// OFX Types
// ============================================================================

export interface OFXTransaction {
  TRNTYPE: string;
  DTPOSTED: string;
  TRNAMT: string;
  FITID: string;
  NAME?: string;
  MEMO?: string;
  CHECKNUM?: string;
}

export interface OFXAccountInfo {
  BANKID?: string;
  ACCTID: string;
  ACCTTYPE: string;
}

export interface OFXBalances {
  ledgerBalance: number;
  ledgerDate: Date;
  availableBalance?: number;
  availableDate?: Date;
}

export interface OFXData {
  version: string;
  currency: string;
  accountInfo: OFXAccountInfo;
  transactions: OFXTransaction[];
  balances: OFXBalances;
  dateStart?: Date;
  dateEnd?: Date;
}

export interface ParsedOFXAccount {
  accountInfo: OFXAccountInfo;
  transactions: ParsedTransaction[];
  balances: OFXBalances;
  currency: string;
}

// ============================================================================
// Import Summary
// ============================================================================

export interface ImportSummary {
  total: number;
  duplicates: number;
  new: number;
  dateRange: {
    earliest: Date;
    latest: Date;
  };
  amountRange: {
    min: number;
    max: number;
  };
  income: number;
  expenses: number;
}

// ============================================================================
// Column Mapping (for universal converter)
// ============================================================================

export interface ColumnMapping {
  dateColumn: string | null;
  descriptionColumn: string | null;
  amountColumn: string | null;
  debitColumn: string | null;
  creditColumn: string | null;
  balanceColumn: string | null;
  confidence: number;
  columnConfidences: Record<string, number>;
  detectionMethod: string;
  amountFormat: "single" | "split";
  dateFormat?: string;
}
