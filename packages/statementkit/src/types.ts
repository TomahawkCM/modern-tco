/**
 * SDK-owned types for the bank statement parsing pipeline.
 *
 * These types mirror the budget app's types but are self-contained,
 * making the parsers extractable into a standalone package.
 */

// ---------------------------------------------------------------------------
// Parsed Transaction (output of all parsers)
// ---------------------------------------------------------------------------

export interface ParsedTransaction {
  date: Date;
  description: string;
  amount: number;
  isDuplicate: boolean;
  confidence: number; // 0-1 for duplicate detection
  currency?: string; // ISO 4217 currency code (e.g., 'USD', 'EUR', 'JPY')
  fitid?: string; // OFX: Financial Institution Transaction ID (for perfect duplicate detection)
  checkNum?: string; // OFX: Check number if applicable
  transactionType?: string; // OFX: TRNTYPE (DEBIT, CREDIT, CHECK, etc.)
  // Smart duplicate detection details
  duplicateReason?: string; // Explanation from AI analysis
  matchedTransactionId?: string; // ID of matched existing transaction
  requiresReview?: boolean; // True if confidence is below threshold and needs manual review
  // Source format tracking
  sourceFormat?: "csv" | "ofx" | "qfx" | "qbo" | "pdf" | "qif" | "mt940" | "camt053";
  balance?: number; // Running balance if available from statement
}

// ---------------------------------------------------------------------------
// Parsed Investment Transaction (extends ParsedTransaction)
// ---------------------------------------------------------------------------

export interface ParsedInvestmentTransaction extends ParsedTransaction {
  securityId?: string; // CUSIP or ISIN
  units?: number; // Number of shares/units
  unitPrice?: number; // Price per unit
  investmentType?: "buy" | "sell" | "dividend" | "reinvest" | "transfer";
  tradeAmount?: number; // Total trade value (units * unitPrice + fees)
}

// ---------------------------------------------------------------------------
// Bank Configuration
// ---------------------------------------------------------------------------

export interface BankConfig {
  name: string;
  dateColumn: string;
  descriptionColumn: string;
  amountColumn: string;
  dateFormat: string;
  amountMultiplier?: number;
  hasHeader?: boolean;
  skipRows?: number; // Number of header rows to skip before actual data
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

// ---------------------------------------------------------------------------
// CSV Row (generic key-value from CSV parsing)
// ---------------------------------------------------------------------------

export interface CSVRow {
  [key: string]: string;
}

// ---------------------------------------------------------------------------
// OFX Types
// ---------------------------------------------------------------------------

export interface OFXTransaction {
  TRNTYPE: string; // Transaction type: DEBIT, CREDIT, CHECK, DEP, ATM, POS, etc.
  DTPOSTED: string; // Posted date (YYYYMMDDHHmmss format)
  TRNAMT: string; // Transaction amount (negative for debits)
  FITID: string; // Financial Institution Transaction ID (unique)
  NAME?: string; // Payee/merchant name
  MEMO?: string; // Transaction memo/description
  CHECKNUM?: string; // Check number (optional)
}

export interface OFXAccountInfo {
  BANKID?: string; // Bank routing number
  ACCTID: string; // Account number
  ACCTTYPE: string; // CHECKING, SAVINGS, CREDITCARD, etc.
}

export interface OFXBalances {
  ledgerBalance: number;
  ledgerDate: Date;
  availableBalance?: number;
  availableDate?: Date;
}

export interface OFXData {
  version: string; // OFX version (1.x or 2.x)
  currency: string; // Currency code (USD, CAD, etc.)
  accountInfo: OFXAccountInfo;
  transactions: OFXTransaction[];
  balances: OFXBalances;
  dateStart?: Date; // Transaction list start date
  dateEnd?: Date; // Transaction list end date
}

// ---------------------------------------------------------------------------
// Existing Transaction (for duplicate detection against app data)
// ---------------------------------------------------------------------------

export interface ExistingTransaction {
  id: string;
  date: Date;
  description: string;
  originalDescription?: string;
  amount: number;
  fitid?: string;
  merchant?: string;
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/**
 * Round a number to 2 decimal places.
 * Prevents floating-point errors in financial calculations.
 */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}
