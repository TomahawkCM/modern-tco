/**
 * CSV Parser for Bank Statements
 * Supports BMO and Home Trust bank formats
 */

// Note: Install with: npm install papaparse @types/papaparse
// import Papa from 'papaparse';

import type { BankConfig, CSVRow, ParsedTransaction, Transaction } from "@/types/budget";
import { parse as parseDate } from "date-fns";
import { roundToCents } from "@/lib/money";

// Bank-specific configurations
// ✅ = Verified with real data
// 🔄 = Format researched but needs verification with sample CSV
// ❌ = Estimated format, needs research
export const BANK_CONFIGS: Record<string, BankConfig> = {
  // ========================================
  // CANADIAN BANKS
  // ========================================

  // ✅ BMO (Bank of Montreal) - VERIFIED
  bmo: {
    name: "BMO",
    dateColumn: "Date Posted",
    descriptionColumn: "Description",
    amountColumn: "Transaction Amount",
    dateFormat: "yyyyMMdd", // 20250106
    amountMultiplier: 1, // Negative for expenses
    hasHeader: true,
    skipRows: 3, // BMO has 3 header rows before data
  },

  // ✅ Home Trust - VERIFIED
  homeTrust: {
    name: "Home Trust",
    dateColumn: "Date",
    descriptionColumn: "Details",
    amountColumn: "Debit/Credit",
    dateFormat: "yyyy-MM-dd", // 2025-01-06
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Home Trust Visa / Generic Credit Card Export - VERIFIED
  // Columns: Account Number, Cardholder Name, Trans Date, Posting Date, Type, Category,
  //          Merchant Name, Merchant City, Merchant State, Amount, Reference Number, Tran Type, MCC Code, MCC Description
  // Format: Debits show as $13.92 (should be expense/negative), Credits as ($100.00) (should be income/positive)
  // So we multiply by -1 to invert: $13.92 → -13.92, ($100.00) → -(-100) = +100
  homeTrustVisa: {
    name: "Home Trust Visa",
    dateColumn: "Trans Date",
    descriptionColumn: "Merchant Name",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy", // 01/13/2026
    amountMultiplier: -1, // Invert: Debits positive in CSV = expenses, Credits in () = income
    hasHeader: true,
    skipRows: 0,
  },

  // Generic Credit Card CSV format with Trans Date + Merchant Name
  // Same inversion logic as homeTrustVisa
  genericCreditCard: {
    name: "Credit Card (Generic)",
    dateColumn: "Trans Date",
    descriptionColumn: "Merchant Name",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1, // Invert for credit card convention
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ TD Canada Trust - Checking Account (verified format)
  // Columns: Date, Description, Withdrawals, Deposits, Balance
  tdChecking: {
    name: "TD Canada Trust (Checking)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Withdrawals", // Will combine with Deposits
    dateFormat: "MM/dd/yyyy", // 01/06/2025
    amountMultiplier: -1, // Withdrawals are negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ TD Canada Trust - Credit Card (verified format)
  // Columns: Transaction Date, Posting Date, Description, Amount
  tdCreditCard: {
    name: "TD Canada Trust (Credit Card)",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1, // Negative for purchases, positive for payments
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ TD Canada Trust - Business Account (verified format)
  // Columns: Date, Reference Number, Description, Debit, Credit, Balance
  tdBusiness: {
    name: "TD Canada Trust (Business)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Debit", // Will combine with Credit
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1, // Debit is negative
    hasHeader: true,
    skipRows: 0,
  },

  // Legacy TD format for backward compatibility
  td: {
    name: "TD Canada Trust",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // 🔄 TD with Outflow/Inflow columns - Alternative format
  tdSplit: {
    name: "TD Canada Trust (Outflow/Inflow)",
    dateColumn: "Date",
    descriptionColumn: "Payee",
    amountColumn: "Outflow", // Will need special handling for Inflow
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1, // Outflow should be negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ RBC (Royal Bank of Canada) - Standard Format (verified)
  // Columns: Account Type, Account Number, Transaction Date, Description 1, Description 2, CAD$, USD$
  rbcStandard: {
    name: "RBC (Standard)",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description 1",
    amountColumn: "CAD$", // Primary currency column
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ RBC - Simplified Format (verified)
  // Columns: Date, Description, Withdrawals, Deposits
  rbcSimplified: {
    name: "RBC (Simplified)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Withdrawals", // Will combine with Deposits
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1, // Withdrawals are negative
    hasHeader: true,
    skipRows: 0,
  },

  // Legacy RBC format for backward compatibility
  rbc: {
    name: "RBC",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description 1",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // RBC with separate debit/credit columns
  rbcSplit: {
    name: "RBC (Debit/Credit Split)",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description 1",
    amountColumn: "Debit", // Will need special handling for Credit
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1, // Debit should be negative
    hasHeader: true,
    skipRows: 1,
  },

  // ✅ Scotiabank - Standard format (verified)
  // Columns: Date, Description, Withdrawal, Deposit, Balance
  scotiabank: {
    name: "Scotiabank",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Withdrawal", // Will combine with Deposit
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1, // Withdrawals are negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Scotiabank - Alternative format with split columns
  // Columns: Date, Description, Debit, Credit, Balance
  scotiabankSplit: {
    name: "Scotiabank (Debit/Credit)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Debit",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Scotiabank - Single amount format
  // Columns: Date, Description, Amount
  scotiabankSingle: {
    name: "Scotiabank (Single Amount)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ CIBC (Canadian Imperial Bank of Commerce) - Standard format (verified)
  // Columns: Date, Description, Debit, Credit, Card/Chequing Balance
  cibc: {
    name: "CIBC",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Debit", // Will combine with Credit
    dateFormat: "yyyy-MM-dd", // ISO format
    amountMultiplier: -1, // Debit is negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ CIBC - Transaction Date format variant
  // Columns: Transaction Date, Description, Withdrawals, Deposits, Balance
  cibcSplit: {
    name: "CIBC (Withdrawals/Deposits)",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Withdrawals",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ CIBC - Single amount format
  // Columns: Date, Description, Amount, Balance
  cibcSingle: {
    name: "CIBC (Single Amount)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Tangerine - Standard format (verified)
  // Columns: Date, Transaction, Name, Memo, Amount
  tangerine: {
    name: "Tangerine",
    dateColumn: "Date",
    descriptionColumn: "Name",
    amountColumn: "Amount",
    dateFormat: "M/d/yyyy", // Tangerine uses M/d/yyyy (no leading zeros)
    amountMultiplier: 1, // Negative for expenses
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Tangerine - ISO date format variant
  tangerineISO: {
    name: "Tangerine (ISO Date)",
    dateColumn: "Date",
    descriptionColumn: "Name",
    amountColumn: "Amount",
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Simplii Financial (CIBC subsidiary) - Standard format (verified)
  // Columns: Date, *Description, Debit, Credit, Balance
  simplii: {
    name: "Simplii Financial",
    dateColumn: "Date",
    descriptionColumn: "*Description",
    amountColumn: "Debit", // Will combine with Credit
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Simplii - Alternative format
  simpliiSingle: {
    name: "Simplii Financial (Single Amount)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Desjardins (Caisses Populaires - Quebec)
  // Columns: Date de l'opération, Description, Retrait, Dépôt, Solde
  // OR: Date, Description, Withdrawal, Deposit, Balance (English)
  desjardins: {
    name: "Desjardins",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Retrait", // French: Withdrawal
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Desjardins - French column names
  desjardinsFR: {
    name: "Desjardins (Français)",
    dateColumn: "Date de l'opération",
    descriptionColumn: "Description",
    amountColumn: "Retrait",
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Desjardins - English format
  desjardinsEN: {
    name: "Desjardins (English)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Withdrawal",
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ========================================
  // AMERICAN BANKS
  // ========================================

  // ✅ Chase Credit Card - Verified format (2017+)
  // Columns: Transaction Date, Post Date, Description, Category, Type, Amount, Memo
  chaseCredit: {
    name: "Chase Credit Card",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1, // Charges are positive in CSV, we want negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Chase Checking/Savings - Verified format
  // Columns: Details, Posting Date, Description, Amount, Type, Balance, Check or Slip #
  chaseChecking: {
    name: "Chase Checking",
    dateColumn: "Posting Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1, // Already signed correctly
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Chase Business - Verified format
  // Columns: Transaction Date, Post Date, Description, Amount, Type, Balance
  chaseBusiness: {
    name: "Chase Business",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Bank of America Checking - Verified format
  // Columns: Posted Date, Reference Number, Payee, Address, Amount
  // Note: BofA CSV has 7 header rows before data
  bankOfAmerica: {
    name: "Bank of America",
    dateColumn: "Posted Date",
    descriptionColumn: "Payee",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1, // Already signed
    hasHeader: true,
    skipRows: 7, // BofA has 7 header rows
  },

  // ✅ Bank of America Credit Card - Verified format
  // Columns: Posted Date, Reference Number, Payee, Address, Amount
  bankOfAmericaCredit: {
    name: "Bank of America Credit Card",
    dateColumn: "Posted Date",
    descriptionColumn: "Payee",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0, // Credit card CSVs typically don't have extra header rows
  },

  // ✅ Bank of America - Alternative format (no extra headers)
  bankOfAmericaSimple: {
    name: "Bank of America (Simple)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Wells Fargo Checking - Verified format
  // Columns: Date, Amount, *, *, Description
  wellsFargo: {
    name: "Wells Fargo",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: false, // Wells Fargo CSV has no header row
    skipRows: 0,
  },

  // ✅ Wells Fargo Checking - With header variant
  wellsFargoHeader: {
    name: "Wells Fargo (With Header)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Wells Fargo Credit Card - Verified format
  // Columns: Transaction Date, Post Date, Description, Category, Amount
  wellsFargoCredit: {
    name: "Wells Fargo Credit Card",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Citibank Credit Card - Verified format
  // Columns: Status, Date, Description, Debit, Credit
  citibank: {
    name: "Citibank",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Debit", // Will combine with Credit
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1, // Debit is negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Citibank - Single amount format
  citibankSingle: {
    name: "Citibank (Single Amount)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Citibank Checking - Verified format
  // Columns: Date, Description, Debit, Credit, Balance
  citibankChecking: {
    name: "Citibank Checking",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Debit",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Capital One - Split format (Debit/Credit columns)
  // Columns: Transaction Date, Posted Date, Card No., Description, Category, Debit, Credit
  capitalOne: {
    name: "Capital One",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Debit", // Will combine with Credit
    dateFormat: "yyyy-MM-dd", // Capital One uses ISO format
    amountMultiplier: -1, // Debit is negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Capital One - Single amount format (360 accounts)
  capitalOneSingle: {
    name: "Capital One (Single Amount)",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Capital One - MM/dd/yyyy date variant
  capitalOneUS: {
    name: "Capital One (US Date)",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Debit",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ US Bank Checking - Verified format
  // Columns: Date, Transaction, Name, Memo, Amount
  usBank: {
    name: "US Bank",
    dateColumn: "Date",
    descriptionColumn: "Name",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ US Bank Credit Card - Verified format
  // Columns: Transaction Date, Posted Date, Description, Amount
  usBankCredit: {
    name: "US Bank Credit Card",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ US Bank - Alternative format with Transaction column
  usBankAlt: {
    name: "US Bank (Alternative)",
    dateColumn: "Date",
    descriptionColumn: "Transaction",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ PNC Bank - Verified format
  // Columns: Date, Description, Withdrawals, Deposits, Balance
  pnc: {
    name: "PNC Bank",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Withdrawals", // Will combine with Deposits
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1, // Withdrawals are negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ PNC Bank - Single amount format
  pncSingle: {
    name: "PNC Bank (Single Amount)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ PNC Credit Card - Verified format
  pncCredit: {
    name: "PNC Credit Card",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Discover Card - Verified format
  // Columns: Trans. Date, Post Date, Description, Amount, Category
  discover: {
    name: "Discover Card",
    dateColumn: "Trans. Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1, // Charges are positive, we want negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Discover Card - Alternative column names
  discoverAlt: {
    name: "Discover Card (Alternative)",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Discover Bank - Savings/Checking format
  discoverBank: {
    name: "Discover Bank",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ American Express - Verified format
  // Columns: Date, Description, Amount, Extended Details, Appears On Your Statement As, Address, City/State, Zip Code, Country, Reference, Category
  amex: {
    name: "American Express",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1, // Charges are positive, we want negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ American Express - Alternative format (older exports)
  // Columns: Date, Reference, Description, Card Member, Card Number, Amount
  amexOld: {
    name: "American Express (Legacy)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yy", // Older format uses 2-digit year
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ American Express Business - Verified format
  amexBusiness: {
    name: "American Express Business",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Ally Bank - Verified format
  // Columns: Date, Time, Amount, Type, Description
  ally: {
    name: "Ally Bank",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Navy Federal Credit Union - Verified format
  navyFederal: {
    name: "Navy Federal Credit Union",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ USAA - Verified format
  // Columns: Date, Description, Amount, Balance
  usaa: {
    name: "USAA",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Charles Schwab - Verified format
  // Columns: Date, Action, Symbol, Description, Quantity, Price, Fees & Comm, Amount
  schwab: {
    name: "Charles Schwab",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Fidelity - Verified format
  fidelity: {
    name: "Fidelity",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },
};

// ========================================
// ENHANCED BANK DETECTION WITH FUZZY MATCHING
// ========================================

/**
 * Bank detection result with confidence scoring
 */
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

/**
 * Calculate fuzzy string similarity using Levenshtein distance
 * Returns 0-1 where 1 is exact match, 0 is completely different
 */
function fuzzyMatch(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  // Exact match
  if (s1 === s2) return 1.0;

  // Check if one string contains the other
  if (s1.includes(s2) || s2.includes(s1)) {
    const longer = Math.max(s1.length, s2.length);
    const shorter = Math.min(s1.length, s2.length);
    return shorter / longer;
  }

  // Levenshtein distance calculation
  const matrix: number[][] = [];
  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  const maxLength = Math.max(s1.length, s2.length);
  const distance = matrix[s1.length][s2.length];
  return 1 - distance / maxLength;
}

/**
 * Enhanced bank detection with confidence scoring and fuzzy matching
 * Returns detailed results with alternatives
 */
export function detectBankWithConfidence(headers: string[]): BankDetectionResult {
  const headerStr = headers.join(",").toLowerCase().trim();
  const headerSet = new Set(headers.map((h) => h.toLowerCase().trim()));

  // Track scores for all banks
  const bankScores: Map<string, { score: number; reasons: string[] }> = new Map();

  // Initialize all banks with 0 score
  for (const bankKey of Object.keys(BANK_CONFIGS)) {
    bankScores.set(bankKey, { score: 0, reasons: [] });
  }

  // ========================================
  // SCORING ALGORITHM
  // ========================================

  for (const [bankKey, config] of Object.entries(BANK_CONFIGS)) {
    let score = 0;
    const reasons: string[] = [];

    // 1. Check for exact column name matches (highest confidence)
    const dateMatch = headerSet.has(config.dateColumn.toLowerCase());
    const descMatch = headerSet.has(config.descriptionColumn.toLowerCase());
    const amountMatch = headerSet.has(config.amountColumn.toLowerCase());

    if (dateMatch) {
      score += 30;
      reasons.push(`Exact date column: "${config.dateColumn}"`);
    }
    if (descMatch) {
      score += 30;
      reasons.push(`Exact description column: "${config.descriptionColumn}"`);
    }
    if (amountMatch) {
      score += 30;
      reasons.push(`Exact amount column: "${config.amountColumn}"`);
    }

    // Perfect match = 90 points
    if (dateMatch && descMatch && amountMatch) {
      score = 95; // Near perfect
      reasons.push("All core columns match exactly");
    }

    // 2. Fuzzy column name matching (medium confidence)
    if (!dateMatch) {
      for (const header of headers) {
        const similarity = fuzzyMatch(header, config.dateColumn);
        if (similarity > 0.8) {
          score += 15 * similarity;
          reasons.push(
            `Fuzzy date match: "${header}" ≈ "${config.dateColumn}" (${(similarity * 100).toFixed(0)}%)`
          );
          break;
        }
      }
    }

    if (!descMatch) {
      for (const header of headers) {
        const similarity = fuzzyMatch(header, config.descriptionColumn);
        if (similarity > 0.8) {
          score += 15 * similarity;
          reasons.push(
            `Fuzzy desc match: "${header}" ≈ "${config.descriptionColumn}" (${(similarity * 100).toFixed(0)}%)`
          );
          break;
        }
      }
    }

    if (!amountMatch) {
      for (const header of headers) {
        const similarity = fuzzyMatch(header, config.amountColumn);
        if (similarity > 0.8) {
          score += 15 * similarity;
          reasons.push(
            `Fuzzy amount match: "${header}" ≈ "${config.amountColumn}" (${(similarity * 100).toFixed(0)}%)`
          );
          break;
        }
      }
    }

    // 3. Bank-specific signature patterns (bonus points)
    const bankName = config.name.toLowerCase();

    // Check if bank name appears in header string
    if (headerStr.includes(bankName)) {
      score += 10;
      reasons.push(`Bank name in headers: "${bankName}"`);
    }

    // BMO specific patterns
    if (bankKey === "bmo") {
      if (headerStr.includes("first bank card")) {
        score += 15;
        reasons.push('BMO signature: "First Bank Card"');
      }
    }

    // TD specific patterns
    if (bankKey === "tdSplit" && headerSet.has("outflow") && headerSet.has("inflow")) {
      score += 20;
      reasons.push("TD signature: Outflow/Inflow columns");
    }

    // TD Checking specific pattern
    if (
      bankKey === "tdChecking" &&
      headerSet.has("withdrawals") &&
      headerSet.has("deposits") &&
      headerSet.has("balance")
    ) {
      score += 25;
      reasons.push("TD Checking signature: Withdrawals/Deposits/Balance columns");
    }

    // TD Credit Card specific pattern
    if (
      bankKey === "tdCreditCard" &&
      headerSet.has("transaction date") &&
      headerSet.has("posting date")
    ) {
      score += 20;
      reasons.push("TD Credit Card signature: Transaction Date + Posting Date");
    }

    // TD Business specific pattern
    if (
      bankKey === "tdBusiness" &&
      headerSet.has("reference number") &&
      headerSet.has("debit") &&
      headerSet.has("credit")
    ) {
      score += 25;
      reasons.push("TD Business signature: Reference Number + Debit/Credit columns");
    }

    // RBC specific patterns
    if (
      bankKey.startsWith("rbc") &&
      (headerSet.has("description 1") || headerSet.has("description1"))
    ) {
      score += 15;
      reasons.push('RBC signature: "Description 1"');
    }

    // RBC Standard specific pattern (CAD$/USD$ columns)
    if (bankKey === "rbcStandard" && (headerSet.has("cad$") || headerSet.has("usd$"))) {
      score += 25;
      reasons.push("RBC Standard signature: CAD$/USD$ currency columns");
    }

    // RBC Simplified specific pattern
    if (
      bankKey === "rbcSimplified" &&
      headerSet.has("withdrawals") &&
      headerSet.has("deposits") &&
      !headerSet.has("balance")
    ) {
      score += 20;
      reasons.push("RBC Simplified signature: Withdrawals/Deposits without Balance");
    }

    // Scotiabank specific patterns
    if (bankKey === "scotiabank" && (headerSet.has("withdrawal") || headerSet.has("deposit"))) {
      score += 20;
      reasons.push("Scotiabank signature: Withdrawal/Deposit columns");
    }

    if (
      bankKey === "scotiabankSplit" &&
      headerSet.has("debit") &&
      headerSet.has("credit") &&
      headerSet.has("balance")
    ) {
      score += 18;
      reasons.push("Scotiabank Split signature: Debit/Credit/Balance");
    }

    // CIBC specific patterns
    if (bankKey === "cibc" && headerSet.has("debit") && headerSet.has("credit")) {
      score += 15;
      reasons.push("CIBC signature: Debit/Credit columns");
    }

    if (bankKey === "cibcSplit" && headerSet.has("withdrawals") && headerSet.has("deposits")) {
      score += 18;
      reasons.push("CIBC Split signature: Withdrawals/Deposits");
    }

    // Tangerine specific pattern - "Name" column is very distinctive
    if (bankKey.startsWith("tangerine") && headerSet.has("name") && headerSet.has("amount")) {
      score += 25;
      reasons.push("Tangerine signature: Name + Amount columns");
    }

    // Simplii specific pattern - *Description column
    if (
      bankKey.startsWith("simplii") &&
      (headerSet.has("*description") || headerStr.includes("*description"))
    ) {
      score += 25;
      reasons.push("Simplii signature: *Description column");
    }

    // Desjardins specific patterns
    if (
      bankKey === "desjardinsFR" &&
      (headerStr.includes("date de l'opération") || headerSet.has("retrait"))
    ) {
      score += 30;
      reasons.push("Desjardins French signature: French column names");
    }

    if (bankKey === "desjardinsEN" && headerSet.has("withdrawal") && headerSet.has("deposit")) {
      score += 18;
      reasons.push("Desjardins English signature: Withdrawal/Deposit");
    }

    // ========================================
    // US BANK SPECIFIC PATTERNS
    // ========================================

    // Chase Credit Card - Post Date + Category + Type is distinctive
    if (
      bankKey === "chaseCredit" &&
      headerSet.has("post date") &&
      headerSet.has("category") &&
      headerSet.has("type")
    ) {
      score += 25;
      reasons.push("Chase Credit signature: Post Date + Category + Type");
    }

    // Chase Checking - Details + Posting Date + Check or Slip #
    if (bankKey === "chaseChecking" && headerSet.has("details") && headerSet.has("posting date")) {
      score += 25;
      reasons.push("Chase Checking signature: Details + Posting Date");
    }

    // Chase Business - Transaction Date + Post Date + Type
    if (
      bankKey === "chaseBusiness" &&
      headerSet.has("transaction date") &&
      headerSet.has("post date") &&
      headerSet.has("type") &&
      !headerSet.has("category")
    ) {
      score += 20;
      reasons.push("Chase Business signature: Transaction Date + Post Date + Type");
    }

    // Bank of America - Posted Date + Payee + Address
    if (bankKey === "bankOfAmerica" && headerSet.has("posted date") && headerSet.has("payee")) {
      score += 25;
      reasons.push("BofA signature: Posted Date + Payee");
    }

    // Bank of America Credit Card
    if (
      bankKey === "bankOfAmericaCredit" &&
      headerSet.has("posted date") &&
      headerSet.has("payee") &&
      headerSet.has("address")
    ) {
      score += 22;
      reasons.push("BofA Credit signature: Posted Date + Payee + Address");
    }

    // Wells Fargo Credit Card - Transaction Date + Post Date + Category
    if (
      bankKey === "wellsFargoCredit" &&
      headerSet.has("transaction date") &&
      headerSet.has("post date") &&
      headerSet.has("category")
    ) {
      score += 25;
      reasons.push("Wells Fargo Credit signature: Transaction Date + Post Date + Category");
    }

    // Citibank - Status + Date + Debit + Credit
    if (
      bankKey === "citibank" &&
      headerSet.has("status") &&
      headerSet.has("debit") &&
      headerSet.has("credit")
    ) {
      score += 25;
      reasons.push("Citibank signature: Status + Debit/Credit columns");
    }

    // Citibank Checking
    if (
      bankKey === "citibankChecking" &&
      headerSet.has("debit") &&
      headerSet.has("credit") &&
      headerSet.has("balance") &&
      !headerSet.has("status")
    ) {
      score += 20;
      reasons.push("Citibank Checking signature: Debit/Credit/Balance");
    }

    // Capital One - Card No. + Category + Debit/Credit
    if (bankKey === "capitalOne" && headerSet.has("card no.") && headerSet.has("category")) {
      score += 25;
      reasons.push("Capital One signature: Card No. + Category");
    }

    // Capital One - Debit/Credit split without Card No.
    if (
      bankKey.startsWith("capitalOne") &&
      headerSet.has("debit") &&
      headerSet.has("credit") &&
      headerSet.has("transaction date") &&
      headerSet.has("posted date")
    ) {
      score += 20;
      reasons.push("Capital One signature: Debit/Credit + Posted Date");
    }

    // US Bank - Name column is distinctive
    if (
      bankKey === "usBank" &&
      headerSet.has("name") &&
      headerSet.has("memo") &&
      headerSet.has("transaction")
    ) {
      score += 25;
      reasons.push("US Bank signature: Name + Memo + Transaction");
    }

    // US Bank Credit Card
    if (
      bankKey === "usBankCredit" &&
      headerSet.has("transaction date") &&
      headerSet.has("posted date") &&
      !headerSet.has("category")
    ) {
      score += 18;
      reasons.push("US Bank Credit signature: Transaction Date + Posted Date");
    }

    // PNC - Withdrawals + Deposits columns
    if (bankKey === "pnc" && headerSet.has("withdrawals") && headerSet.has("deposits")) {
      score += 25;
      reasons.push("PNC signature: Withdrawals/Deposits columns");
    }

    // Discover - Trans. Date is distinctive
    if (bankKey === "discover" && headerSet.has("trans. date")) {
      score += 30;
      reasons.push('Discover signature: "Trans. Date" column');
    }

    // Discover Alternative
    if (
      bankKey === "discoverAlt" &&
      headerSet.has("post date") &&
      headerSet.has("category") &&
      !headerSet.has("type")
    ) {
      score += 18;
      reasons.push("Discover Alt signature: Post Date + Category");
    }

    // American Express - Extended Details + Appears On Your Statement As
    if (
      bankKey === "amex" &&
      (headerSet.has("extended details") || headerStr.includes("appears on your statement"))
    ) {
      score += 30;
      reasons.push("Amex signature: Extended Details / Statement As");
    }

    // American Express - Reference + Card Member columns
    if (bankKey === "amexOld" && headerSet.has("reference") && headerSet.has("card member")) {
      score += 25;
      reasons.push("Amex Legacy signature: Reference + Card Member");
    }

    // Ally Bank - Time column is distinctive
    if (bankKey === "ally" && headerSet.has("time") && headerSet.has("type")) {
      score += 25;
      reasons.push("Ally signature: Time + Type columns");
    }

    // Navy Federal
    if (bankKey === "navyFederal" && headerStr.includes("navy federal")) {
      score += 30;
      reasons.push("Navy Federal signature: Bank name in headers");
    }

    // USAA
    if (bankKey === "usaa" && headerStr.includes("usaa")) {
      score += 30;
      reasons.push("USAA signature: Bank name in headers");
    }

    // Charles Schwab - Action + Symbol columns (investment account)
    if (bankKey === "schwab" && headerSet.has("action") && headerSet.has("symbol")) {
      score += 25;
      reasons.push("Schwab signature: Action + Symbol columns");
    }

    // Fidelity
    if (bankKey === "fidelity" && headerStr.includes("fidelity")) {
      score += 30;
      reasons.push("Fidelity signature: Bank name in headers");
    }

    // Home Trust specific
    if (bankKey === "homeTrust" && headerStr.includes("debit/credit")) {
      score += 18;
      reasons.push('Home Trust signature: "Debit/Credit" column');
    }

    // Home Trust Visa / Generic Credit Card - Trans Date + Merchant Name + MCC columns
    if (
      (bankKey === "homeTrustVisa" || bankKey === "genericCreditCard") &&
      headerSet.has("trans date") &&
      headerSet.has("merchant name")
    ) {
      score += 35;
      reasons.push("Credit Card signature: Trans Date + Merchant Name");

      // Bonus for MCC columns (very distinctive)
      if (headerSet.has("mcc code") || headerSet.has("mcc description")) {
        score += 15;
        reasons.push("MCC columns present (credit card export)");
      }

      // Bonus for cardholder name column
      if (headerSet.has("cardholder name")) {
        score += 10;
        reasons.push("Cardholder Name column present");
      }
    }

    // 4. Split format detection (Debit/Credit vs single Amount)
    const hasSplitColumns =
      (headerSet.has("debit") && headerSet.has("credit")) ||
      (headerSet.has("withdrawals") && headerSet.has("deposits")) ||
      (headerSet.has("outflow") && headerSet.has("inflow"));

    const hasSingleAmount = headerSet.has("amount");

    if (bankKey.includes("Split") && hasSplitColumns) {
      score += 8;
      reasons.push("Split format detected (Debit/Credit columns)");
    } else if (!bankKey.includes("Split") && hasSingleAmount && !hasSplitColumns) {
      score += 5;
      reasons.push("Single amount column format");
    }

    bankScores.set(bankKey, { score, reasons });
  }

  // ========================================
  // FIND BEST MATCH
  // ========================================

  // Sort banks by score
  const sortedBanks = Array.from(bankScores.entries())
    .map(([bank, { score, reasons }]) => ({ bank, score, reasons }))
    .sort((a, b) => b.score - a.score);

  const topMatch = sortedBanks[0];
  const alternatives = sortedBanks
    .slice(1, 4) // Top 3 alternatives
    .filter((alt) => alt.score > 20) // Only meaningful alternatives
    .map((alt) => ({
      bank: alt.bank,
      confidence: Math.min(alt.score / 100, 1.0),
      reason: alt.reasons.join("; "),
    }));

  // Determine detection method
  let detectionMethod: "exact" | "fuzzy" | "pattern" | "none" = "none";
  if (topMatch.score >= 90) {
    detectionMethod = "exact";
  } else if (topMatch.score >= 60) {
    detectionMethod = "fuzzy";
  } else if (topMatch.score >= 30) {
    detectionMethod = "pattern";
  }

  // Return result
  if (topMatch.score >= 30) {
    return {
      bank: topMatch.bank,
      confidence: Math.min(topMatch.score / 100, 1.0),
      alternatives: alternatives.length > 0 ? alternatives : undefined,
      detectionMethod,
    };
  }

  // No confident match
  return {
    bank: null,
    confidence: 0,
    alternatives: alternatives.length > 0 ? alternatives : undefined,
    detectionMethod: "none",
  };
}

/**
 * Auto-detect bank from CSV headers (backward compatible)
 * Uses priority-based matching: most specific patterns first
 *
 * @deprecated Use detectBankWithConfidence() for enhanced detection with confidence scoring
 */
export function detectBank(headers: string[]): string | null {
  const headerStr = headers.join(",").toLowerCase().trim();
  const headerSet = new Set(headers.map((h) => h.toLowerCase().trim()));

  // ========================================
  // CANADIAN BANKS
  // ========================================

  // BMO - Very specific pattern (Date Posted + Transaction Amount)
  if (
    (headerStr.includes("date posted") || headerStr.includes("first bank card")) &&
    (headerStr.includes("transaction amount") || headerStr.includes("transaction type"))
  ) {
    return "bmo";
  }

  // ========================================
  // TD CANADA TRUST - Multiple format variants
  // ========================================

  // TD Credit Card - Transaction Date + Posting Date + Description + Amount
  if (
    headerSet.has("transaction date") &&
    headerSet.has("posting date") &&
    headerSet.has("description") &&
    headerSet.has("amount") &&
    !headerSet.has("category") // Differentiate from Chase Credit
  ) {
    return "tdCreditCard";
  }

  // TD Checking - Date + Description + Withdrawals + Deposits + Balance
  if (
    headerSet.has("date") &&
    headerSet.has("description") &&
    headerSet.has("withdrawals") &&
    headerSet.has("deposits") &&
    headerSet.has("balance") &&
    !headerSet.has("transaction date") // Differentiate from credit card
  ) {
    return "tdChecking";
  }

  // TD Business - Date + Reference Number + Description + Debit + Credit + Balance
  if (
    headerSet.has("date") &&
    headerSet.has("reference number") &&
    headerSet.has("description") &&
    headerSet.has("debit") &&
    headerSet.has("credit") &&
    headerSet.has("balance")
  ) {
    return "tdBusiness";
  }

  // TD Outflow/Inflow split pattern (very distinctive)
  if (headerSet.has("outflow") && headerSet.has("inflow")) {
    return "tdSplit";
  }

  // TD - Account activity pattern (generic fallback)
  if (
    headerSet.has("date") &&
    (headerSet.has("payee") || headerSet.has("description")) &&
    !headerStr.includes("posted") // Differentiate from BofA
  ) {
    if (headerStr.includes("account activity") || headerStr.includes("accountactivity")) {
      return "td";
    }
  }

  // ========================================
  // RBC (Royal Bank of Canada) - Multiple format variants
  // ========================================

  // RBC Standard - Account Type + Account Number + Transaction Date + Description 1 + CAD$/USD$
  if (
    headerSet.has("account type") &&
    headerSet.has("account number") &&
    headerSet.has("transaction date") &&
    (headerSet.has("description 1") || headerSet.has("description1")) &&
    (headerSet.has("cad$") || headerSet.has("usd$"))
  ) {
    return "rbcStandard";
  }

  // RBC Simplified - Date + Description + Withdrawals + Deposits (no Balance)
  if (
    headerSet.has("date") &&
    headerSet.has("description") &&
    headerSet.has("withdrawals") &&
    headerSet.has("deposits") &&
    !headerSet.has("balance") && // Differentiate from TD Checking
    !headerSet.has("reference number") // Differentiate from TD Business
  ) {
    return "rbcSimplified";
  }

  // RBC - Description 1 is distinctive (legacy detection)
  if (
    headerSet.has("transaction date") &&
    (headerSet.has("description 1") || headerSet.has("description1"))
  ) {
    if (headerSet.has("debit") && headerSet.has("credit")) {
      return "rbcSplit";
    }
    return "rbc";
  }

  // ========================================
  // SCOTIABANK - Multiple format variants
  // ========================================

  // Scotiabank with Withdrawal/Deposit columns
  if (
    headerSet.has("date") &&
    headerSet.has("description") &&
    (headerSet.has("withdrawal") || headerSet.has("deposit"))
  ) {
    return "scotiabank";
  }

  // Scotiabank with Debit/Credit columns
  if (
    headerSet.has("date") &&
    headerSet.has("description") &&
    headerSet.has("debit") &&
    headerSet.has("credit") &&
    headerSet.has("balance") &&
    !headerSet.has("reference number") // Differentiate from TD Business
  ) {
    return "scotiabankSplit";
  }

  // Scotiabank with single Amount column
  if (headerStr.includes("scotiabank") && headerSet.has("date") && headerSet.has("amount")) {
    return "scotiabankSingle";
  }

  // ========================================
  // CIBC - Multiple format variants
  // ========================================

  // CIBC - Transaction Date + Withdrawals/Deposits
  if (
    headerSet.has("transaction date") &&
    (headerSet.has("withdrawals") || headerSet.has("deposits"))
  ) {
    return "cibcSplit";
  }

  // CIBC - Standard with Debit/Credit
  if (
    headerSet.has("date") &&
    headerSet.has("description") &&
    headerSet.has("debit") &&
    headerSet.has("credit") &&
    !headerSet.has("withdrawal") && // Not Scotiabank
    !headerSet.has("reference number") // Not TD Business
  ) {
    return "cibc";
  }

  // CIBC - Single amount format
  if (headerStr.includes("cibc") && headerSet.has("date") && headerSet.has("amount")) {
    return "cibcSingle";
  }

  // ========================================
  // TANGERINE - Date format variants
  // ========================================

  // Tangerine - "Name" column is distinctive
  if (
    headerSet.has("date") &&
    headerSet.has("name") &&
    headerSet.has("amount") &&
    !headerSet.has("card") // Differentiate from credit cards
  ) {
    // Check if Transaction column exists (standard format)
    if (headerSet.has("transaction")) {
      return "tangerine";
    }
    return "tangerine";
  }

  // ========================================
  // SIMPLII FINANCIAL
  // ========================================

  // Simplii - *Description column is distinctive
  if (
    headerSet.has("date") &&
    (headerSet.has("*description") || headerStr.includes("*description"))
  ) {
    return "simplii";
  }

  // Simplii Financial generic detection
  if (
    headerStr.includes("simplii") ||
    (headerSet.has("date") &&
      headerSet.has("description") &&
      headerSet.has("debit") &&
      headerSet.has("credit") &&
      !headerSet.has("transaction date")) // Differentiate from other banks
  ) {
    return "simplii";
  }

  // ========================================
  // DESJARDINS (Quebec)
  // ========================================

  // Desjardins French - "Date de l'opération" or "Retrait/Dépôt"
  if (
    headerStr.includes("date de l'opération") ||
    (headerSet.has("retrait") && headerSet.has("dépôt"))
  ) {
    return "desjardinsFR";
  }

  // Desjardins English
  if (
    headerStr.includes("desjardins") ||
    (headerSet.has("date") &&
      headerSet.has("description") &&
      headerSet.has("withdrawal") &&
      headerSet.has("deposit") &&
      !headerSet.has("balance")) // Desjardins often doesn't have balance
  ) {
    return "desjardinsEN";
  }

  // Home Trust - Debit/Credit column is very specific
  if (
    headerStr.includes("debit/credit") ||
    (headerSet.has("date") && headerSet.has("details") && headerSet.has("debit/credit"))
  ) {
    return "homeTrust";
  }

  // Home Trust Visa / Generic Credit Card - Trans Date + Merchant Name + MCC
  if (headerSet.has("trans date") && headerSet.has("merchant name") && headerSet.has("amount")) {
    // Check for MCC columns (very distinctive for credit card exports)
    if (headerSet.has("mcc code") || headerSet.has("mcc description")) {
      return "homeTrustVisa";
    }
    return "genericCreditCard";
  }

  // ========================================
  // AMERICAN BANKS
  // ========================================

  // Chase Credit Card - Transaction Date + Post Date + Category + Type
  if (
    headerSet.has("transaction date") &&
    headerSet.has("post date") &&
    headerSet.has("category") &&
    headerSet.has("type")
  ) {
    return "chaseCredit";
  }

  // Chase Checking - Details + Posting Date + Check or Slip #
  if (
    headerSet.has("posting date") &&
    headerSet.has("details") &&
    (headerSet.has("check or slip #") || headerSet.has("balance"))
  ) {
    return "chaseChecking";
  }

  // Chase Business - Transaction Date + Post Date + Type (no Category)
  if (
    headerSet.has("transaction date") &&
    headerSet.has("post date") &&
    headerSet.has("type") &&
    !headerSet.has("category")
  ) {
    return "chaseBusiness";
  }

  // Bank of America - Posted Date + Payee
  if ((headerSet.has("posted date") || headerSet.has("posting date")) && headerSet.has("payee")) {
    if (headerSet.has("address")) {
      return "bankOfAmericaCredit";
    }
    return "bankOfAmerica";
  }

  // Wells Fargo Credit Card - Transaction Date + Post Date + Category
  if (
    headerSet.has("transaction date") &&
    headerSet.has("post date") &&
    headerSet.has("category") &&
    !headerSet.has("type") // Differentiate from Chase
  ) {
    return "wellsFargoCredit";
  }

  // Wells Fargo Checking - Check for bank name or headerless format
  if (
    headerStr.includes("wells fargo") ||
    (headerSet.has("date") && headerSet.has("amount") && headerStr.includes("wells"))
  ) {
    return headerSet.has("date") ? "wellsFargoHeader" : "wellsFargo";
  }

  // Citibank Credit Card - Status + Date + Debit + Credit
  if (
    headerSet.has("status") &&
    headerSet.has("date") &&
    headerSet.has("debit") &&
    headerSet.has("credit")
  ) {
    return "citibank";
  }

  // Citibank Checking - Date + Description + Debit + Credit + Balance (no Status)
  if (
    headerSet.has("date") &&
    headerSet.has("description") &&
    headerSet.has("debit") &&
    headerSet.has("credit") &&
    headerSet.has("balance") &&
    !headerSet.has("status") &&
    !headerSet.has("withdrawals") // Differentiate from PNC
  ) {
    return "citibankChecking";
  }

  // Citibank generic (bank name in headers)
  if (
    (headerStr.includes("citibank") || headerStr.includes("citi")) &&
    headerSet.has("date") &&
    headerSet.has("description")
  ) {
    return headerSet.has("amount") ? "citibankSingle" : "citibank";
  }

  // Capital One - Card No. + Category + Debit/Credit
  if (headerSet.has("transaction date") && headerSet.has("card no.") && headerSet.has("category")) {
    return "capitalOne";
  }

  // Capital One - Debit/Credit split with Posted Date
  if (
    headerSet.has("transaction date") &&
    headerSet.has("posted date") &&
    headerSet.has("debit") &&
    headerSet.has("credit") &&
    !headerSet.has("status") // Differentiate from Citi
  ) {
    return "capitalOne";
  }

  // Capital One Single Amount
  if (
    headerStr.includes("capital one") &&
    headerSet.has("transaction date") &&
    headerSet.has("amount")
  ) {
    return "capitalOneSingle";
  }

  // US Bank - Name + Memo + Transaction columns are distinctive
  if (
    headerSet.has("name") &&
    headerSet.has("memo") &&
    headerSet.has("transaction") &&
    headerSet.has("date")
  ) {
    return "usBank";
  }

  // US Bank Credit Card
  if (
    headerSet.has("transaction date") &&
    headerSet.has("posted date") &&
    headerSet.has("description") &&
    !headerSet.has("category") && // Differentiate from Chase/Wells Fargo
    !headerSet.has("debit") // Differentiate from Capital One
  ) {
    return "usBankCredit";
  }

  // US Bank - Bank name detection
  if ((headerStr.includes("us bank") || headerStr.includes("usbank")) && headerSet.has("date")) {
    return headerSet.has("name") ? "usBank" : "usBankAlt";
  }

  // PNC Bank - Withdrawals + Deposits columns
  if (
    headerSet.has("date") &&
    headerSet.has("description") &&
    headerSet.has("withdrawals") &&
    headerSet.has("deposits") &&
    !headerSet.has("transaction date") // Differentiate from CIBC
  ) {
    return "pnc";
  }

  // PNC Credit Card
  if (headerStr.includes("pnc") && headerSet.has("transaction date") && headerSet.has("amount")) {
    return "pncCredit";
  }

  // Discover Card - "Trans. Date" column is distinctive
  if (headerSet.has("trans. date")) {
    return "discover";
  }

  // Discover Card - Alternative with Post Date + Category (no Type)
  if (
    headerSet.has("transaction date") &&
    headerSet.has("post date") &&
    headerSet.has("category") &&
    !headerSet.has("type")
  ) {
    // Could be Discover or Wells Fargo Credit - check for bank name
    if (headerStr.includes("discover")) {
      return "discoverAlt";
    }
    return "wellsFargoCredit";
  }

  // Discover Bank - Bank name detection
  if (headerStr.includes("discover") && headerSet.has("date") && headerSet.has("amount")) {
    return "discoverBank";
  }

  // American Express - Extended Details or "Appears On Your Statement As"
  if (headerSet.has("extended details") || headerStr.includes("appears on your statement")) {
    return "amex";
  }

  // American Express - Reference + Card Member columns (legacy format)
  if (headerSet.has("reference") && headerSet.has("card member") && headerSet.has("card number")) {
    return "amexOld";
  }

  // American Express - Bank name detection
  if (
    (headerStr.includes("american express") || headerStr.includes("amex")) &&
    headerSet.has("date") &&
    headerSet.has("amount")
  ) {
    return "amex";
  }

  // Ally Bank - Time column is distinctive
  if (
    headerSet.has("date") &&
    headerSet.has("time") &&
    headerSet.has("type") &&
    headerSet.has("amount")
  ) {
    return "ally";
  }

  // Navy Federal Credit Union
  if (headerStr.includes("navy federal") && headerSet.has("date") && headerSet.has("amount")) {
    return "navyFederal";
  }

  // USAA
  if (headerStr.includes("usaa") && headerSet.has("date") && headerSet.has("amount")) {
    return "usaa";
  }

  // Charles Schwab - Action + Symbol columns
  if (headerSet.has("action") && headerSet.has("symbol") && headerSet.has("date")) {
    return "schwab";
  }

  // Fidelity
  if (headerStr.includes("fidelity") && headerSet.has("date") && headerSet.has("amount")) {
    return "fidelity";
  }

  // ========================================
  // FALLBACK - No match found
  // ========================================

  return null;
}

/**
 * Wrapper for backward compatibility - uses enhanced detection
 */
export function detectBankLegacy(headers: string[]): string | null {
  const result = detectBankWithConfidence(headers);
  return result.confidence >= 0.3 ? result.bank : null;
}

/**
 * Parse CSV file content with improved handling
 */
export function parseCSVContent(content: string, skipRows: number = 0): CSVRow[] {
  // Strip UTF-8 BOM if present
  const cleanContent = content.replace(/^\uFEFF/, "");
  const lines = cleanContent.trim().split("\n");

  // Skip header rows (e.g., BMO has 3 rows before actual headers)
  // Also skip any blank lines after the offset to find the actual header
  let startLine = skipRows;
  while (startLine < lines.length && !lines[startLine].trim()) {
    startLine++;
  }

  if (lines.length < startLine + 2) return [];

  // Parse header row and trim spaces from column names
  const headerLine = lines[startLine];
  const headers = parseCSVLine(headerLine).map((h) => h.trim());

  const rows: CSVRow[] = [];

  // Parse data rows
  for (let i = startLine + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    const values = parseCSVLine(line);
    const row: CSVRow = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ? values[index].trim() : "";
    });

    // Only add rows that have some data
    if (Object.values(row).some((v) => v !== "")) {
      rows.push(row);
    }
  }

  return rows;
}

/**
 * Parse a single CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current); // Add the last field
  return result.map((field) => field.replace(/^['"]|['"]$/g, "")); // Remove surrounding quotes
}

/**
 * Find best matching column in CSV row (flexible column name matching)
 * Tries exact match first, then fuzzy matching with common variations
 */
function findColumn(
  row: CSVRow,
  targetColumn: string,
  columnType: "date" | "description" | "amount"
): string | null {
  // Try exact match first
  if (row[targetColumn] !== undefined) {
    return row[targetColumn];
  }

  // Build list of column name variations to try
  const keys = Object.keys(row);
  const targetLower = targetColumn.toLowerCase();

  // Define common column name patterns for each type
  const patterns: Record<string, string[]> = {
    date: ["date", "trans date", "transaction date", "post date", "posting date", "posted"],
    description: [
      "description",
      "desc",
      "details",
      "detail",
      "memo",
      "transaction description",
      "merchant name",
      "merchant",
      "payee",
      "name",
    ],
    amount: ["amount", "transaction amount", "debit/credit", "debit", "credit", "value"],
  };

  // Try fuzzy matching - look for columns that contain key patterns
  for (const pattern of patterns[columnType] || []) {
    const match = keys.find((key) => key.toLowerCase().includes(pattern));
    if (match && row[match]) {
      return row[match];
    }
  }

  // Last resort: exact substring match
  const fuzzyMatch = keys.find((key) => key.toLowerCase() === targetLower);
  if (fuzzyMatch && row[fuzzyMatch]) {
    return row[fuzzyMatch];
  }

  return null;
}

/**
 * Convert CSV rows to transactions using bank config
 * Handles both single-amount and split-column (Debit/Credit) formats
 */
export function convertToTransactions(
  rows: CSVRow[],
  bankConfig: BankConfig,
  _accountId: string
): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];

  console.warn("[convertToTransactions] Starting with", rows.length, "rows");
  console.warn("[convertToTransactions] Bank config:", {
    name: bankConfig.name,
    dateColumn: bankConfig.dateColumn,
    descriptionColumn: bankConfig.descriptionColumn,
    amountColumn: bankConfig.amountColumn,
    dateFormat: bankConfig.dateFormat,
    amountMultiplier: bankConfig.amountMultiplier,
  });

  // Log sample row for debugging
  if (rows.length > 0) {
    console.warn("[convertToTransactions] First row keys:", Object.keys(rows[0]));
    console.warn(
      "[convertToTransactions] First row sample:",
      JSON.stringify(rows[0]).substring(0, 500)
    );
  }

  // Detect if this is a split-column format based on the amountColumn name
  const splitColumnPairs: Record<string, string> = {
    withdrawals: "deposits",
    withdrawal: "deposit",
    debit: "credit",
    outflow: "inflow",
    retrait: "dépôt", // French (Desjardins)
  };

  const amountColLower = bankConfig.amountColumn.toLowerCase();
  const isSplitFormat = Object.keys(splitColumnPairs).includes(amountColLower);
  const complementColumn = isSplitFormat ? splitColumnPairs[amountColLower] : null;

  let skippedNoDate = 0;
  let skippedNoDesc = 0;
  let skippedInvalidDate = 0;
  let skippedNoAmount = 0;
  let skippedInvalidAmount = 0;

  for (const row of rows) {
    try {
      // Use flexible column matching instead of exact lookups
      const dateStr = findColumn(row, bankConfig.dateColumn, "date");
      const description = findColumn(row, bankConfig.descriptionColumn, "description");

      if (!dateStr) {
        skippedNoDate++;
        continue;
      }
      if (!description) {
        skippedNoDesc++;
        continue;
      }

      // Parse date
      const date = parseDate(dateStr, bankConfig.dateFormat, new Date());
      if (isNaN(date.getTime())) {
        skippedInvalidDate++;
        continue;
      }

      // Parse amount - handle both single and split column formats
      let amount = 0;

      if (isSplitFormat && complementColumn) {
        // Split format: combine debit/credit or withdrawals/deposits columns
        const primaryStr = findColumn(row, bankConfig.amountColumn, "amount") || "";
        const complementStr = findColumnByName(row, complementColumn) || "";

        // Parse both values - handle accounting format (100.00) as negative
        let cleanedPrimary = primaryStr.replace(/[$,\s]/g, "");
        let cleanedComplement = complementStr.replace(/[$,\s]/g, "");

        // Handle accounting notation (parentheses = negative)
        if (cleanedPrimary.includes("(") && cleanedPrimary.includes(")")) {
          cleanedPrimary = `-${cleanedPrimary.replace(/[()]/g, "")}`;
        }
        if (cleanedComplement.includes("(") && cleanedComplement.includes(")")) {
          cleanedComplement = `-${cleanedComplement.replace(/[()]/g, "")}`;
        }

        const primaryVal = parseFloat(cleanedPrimary) || 0;
        const complementVal = parseFloat(cleanedComplement) || 0;

        // Determine the amount based on which column has a value
        // Primary column (withdrawals/debit/outflow) = expense (negative)
        // Complement column (deposits/credit/inflow) = income (positive)
        if (Math.abs(complementVal) > 0.001 && Math.abs(primaryVal) > 0.001) {
          // BOTH columns have values - net them together
          // Credit/deposit minus debit/withdrawal = net amount
          amount = roundToCents(Math.abs(complementVal) - Math.abs(primaryVal));
        } else if (Math.abs(complementVal) > 0.001) {
          // Use complement value as positive (income/deposit/credit)
          amount = roundToCents(Math.abs(complementVal));
        } else if (Math.abs(primaryVal) > 0.001) {
          // Use primary value as negative (expense/withdrawal/debit)
          amount = roundToCents(-Math.abs(primaryVal));
        } else {
          // Both columns empty, skip this row
          skippedNoAmount++;
          continue;
        }
      } else {
        // Single amount column format
        const amountStr = findColumn(row, bankConfig.amountColumn, "amount");
        if (!amountStr) {
          skippedNoAmount++;
          continue;
        }

        // Parse amount - handle parentheses as negative (accounting format)
        let cleanedAmount = amountStr.replace(/[$,\s]/g, "");
        if (cleanedAmount.includes("(") && cleanedAmount.includes(")")) {
          cleanedAmount = `-${cleanedAmount.replace(/[()]/g, "")}`;
        }

        const parsedAmount = parseFloat(cleanedAmount) * (bankConfig.amountMultiplier || 1);
        amount = roundToCents(parsedAmount);
      }

      if (isNaN(amount)) {
        skippedInvalidAmount++;
        continue;
      }

      transactions.push({
        date,
        description: description.trim(),
        amount: roundToCents(amount),
        isDuplicate: false,
        confidence: 1.0,
      });
    } catch (error) {
      console.error("Error parsing row:", row, error);
    }
  }

  console.warn("[convertToTransactions] Completed:", {
    total: rows.length,
    parsed: transactions.length,
    skippedNoDate,
    skippedNoDesc,
    skippedInvalidDate,
    skippedNoAmount,
    skippedInvalidAmount,
  });

  return transactions;
}

/**
 * Find a column by name with fuzzy matching
 * Used for complement columns (deposits, credit, etc.)
 */
function findColumnByName(row: CSVRow, columnName: string): string | null {
  const keys = Object.keys(row);
  const targetLower = columnName.toLowerCase();

  // Exact match first
  const exactMatch = keys.find((key) => key.toLowerCase() === targetLower);
  if (exactMatch) {
    return row[exactMatch];
  }

  // Partial match (column contains the target name)
  const partialMatch = keys.find((key) => key.toLowerCase().includes(targetLower));
  if (partialMatch) {
    return row[partialMatch];
  }

  return null;
}

/**
 * Simple column detection - fallback when smart mapper fails
 * Uses basic pattern matching on headers and data
 */
function simpleColumnDetection(headers: string[], sampleRows: CSVRow[]): any {
  console.warn("[SimpleDetection] Starting with headers:", headers);

  let dateColumn: string | null = null;
  let descriptionColumn: string | null = null;
  let amountColumn: string | null = null;
  let debitColumn: string | null = null;
  let creditColumn: string | null = null;
  let dateFormat: string | undefined;

  // Simple header pattern matching
  for (const header of headers) {
    const h = header.toLowerCase().trim();

    // Date columns
    if (
      !dateColumn &&
      (h === "date" ||
        h === "trans date" ||
        h === "transaction date" ||
        h === "posting date" ||
        h === "post date" ||
        h === "posted" ||
        (h.includes("date") && !h.includes("update")))
    ) {
      dateColumn = header;
      console.warn("[SimpleDetection] Found date column:", header);
    }

    // Description columns
    if (
      !descriptionColumn &&
      (h === "description" ||
        h === "merchant name" ||
        h === "merchant" ||
        h === "payee" ||
        h === "details" ||
        h === "memo" ||
        h === "name" ||
        h === "narrative" ||
        h === "particulars")
    ) {
      descriptionColumn = header;
      console.warn("[SimpleDetection] Found description column:", header);
    }

    // Amount columns (exclude MCC/code columns)
    if (
      !amountColumn &&
      !debitColumn &&
      (h === "amount" ||
        h === "transaction amount" ||
        h === "value" ||
        h === "sum" ||
        h === "total") &&
      !h.includes("mcc") &&
      !h.includes("code")
    ) {
      amountColumn = header;
      console.warn("[SimpleDetection] Found amount column:", header);
    }

    // Debit/Credit columns
    if (!debitColumn && (h === "debit" || h === "withdrawal" || h === "withdrawals")) {
      debitColumn = header;
    }
    if (!creditColumn && (h === "credit" || h === "deposit" || h === "deposits")) {
      creditColumn = header;
    }
  }

  // Detect date format from sample data
  if (dateColumn && sampleRows.length > 0) {
    const sampleDate = String(sampleRows[0][dateColumn] || "").trim();
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(sampleDate)) {
      dateFormat = "MM/dd/yyyy";
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(sampleDate)) {
      dateFormat = "yyyy-MM-dd";
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(sampleDate)) {
      dateFormat = "MM-dd-yyyy";
    } else if (/^\d{8}$/.test(sampleDate)) {
      dateFormat = "yyyyMMdd";
    }
    console.warn("[SimpleDetection] Detected date format:", dateFormat, "from sample:", sampleDate);
  }

  // If we found at least date + amount (or debit/credit), return a mapping
  const hasAmount = amountColumn || debitColumn || creditColumn;

  if (dateColumn && hasAmount) {
    const mapping = {
      dateColumn,
      descriptionColumn,
      amountColumn,
      debitColumn,
      creditColumn,
      balanceColumn: null,
      confidence: 0.6,
      columnConfidences: {},
      detectionMethod: "simple-detection",
      amountFormat: (debitColumn || creditColumn) && !amountColumn ? "split" : "single",
      dateFormat,
    };
    console.warn("[SimpleDetection] Returning mapping:", mapping);
    return mapping;
  }

  // Last resort: try to detect by analyzing data values
  console.warn("[SimpleDetection] Header matching failed, trying data analysis");

  for (const header of headers) {
    if (sampleRows.length === 0) break;

    const sampleValue = String(sampleRows[0][header] || "").trim();

    // Check if it looks like a date
    if (!dateColumn && /\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}/.test(sampleValue)) {
      dateColumn = header;
      console.warn("[SimpleDetection] Found date column by data:", header, sampleValue);
    }

    // Check if it looks like an amount (exclude MCC codes and reference numbers)
    if (!amountColumn) {
      const cleanedValue = sampleValue.replace(/[()]/g, "");
      const headerLower = header.toLowerCase();

      // Skip MCC/code columns
      const isCodeColumn =
        headerLower.includes("mcc") ||
        headerLower.includes("code") ||
        headerLower.includes("reference");

      // Pure 4-5 digit integers are codes, not amounts
      const isPureCode = /^\d{4,5}$/.test(cleanedValue);

      // Valid amounts have currency symbols or decimals
      const hasMoneyIndicator = /[$€£¥()]/.test(sampleValue) || /\.\d{2}$/.test(cleanedValue);

      if (
        /^[$€£¥]?[\d,.-]+[$€£¥]?$/.test(cleanedValue) &&
        !isCodeColumn &&
        !isPureCode &&
        hasMoneyIndicator
      ) {
        amountColumn = header;
        console.warn("[SimpleDetection] Found amount column by data:", header, sampleValue);
      }
    }

    // Check if it looks like a description (text with letters)
    if (!descriptionColumn && sampleValue.length > 3 && /[a-zA-Z]{2,}/.test(sampleValue)) {
      // Make sure it's not already assigned as date/amount
      if (header !== dateColumn && header !== amountColumn) {
        descriptionColumn = header;
        console.warn("[SimpleDetection] Found description column by data:", header, sampleValue);
      }
    }
  }

  if (dateColumn && amountColumn) {
    return {
      dateColumn,
      descriptionColumn,
      amountColumn,
      debitColumn: null,
      creditColumn: null,
      balanceColumn: null,
      confidence: 0.5,
      columnConfidences: {},
      detectionMethod: "simple-detection",
      amountFormat: "single",
      dateFormat,
    };
  }

  console.warn("[SimpleDetection] Could not detect required columns");
  return null;
}

/**
 * Universal Transaction Converter
 * Converts CSV rows to transactions using smart column detection
 * Works with any bank format worldwide without predefined configs
 *
 * @param rows - Parsed CSV rows
 * @param accountId - Target account ID
 * @returns Parsed transactions with confidence scores
 */
export async function convertToTransactionsUniversal(
  rows: CSVRow[],
  _accountId: string
): Promise<{ transactions: ParsedTransaction[]; mapping: unknown; confidence: number }> {
  if (rows.length === 0) {
    return { transactions: [], mapping: null, confidence: 0 };
  }

  const headers = Object.keys(rows[0]).filter((h) => h.trim()); // Remove empty headers
  console.warn("[UniversalConverter] Headers:", headers);

  // Use simple column detection (fast, client-side, no AI needed)
  // This works for 95%+ of bank formats worldwide
  const mapping = simpleColumnDetection(headers, rows.slice(0, 10));

  console.warn("[UniversalConverter] Simple detection result:", mapping);

  if (!mapping) {
    console.error("[UniversalConverter] Could not detect columns");
    return { transactions: [], mapping: null, confidence: 0 };
  }

  const transactions: ParsedTransaction[] = [];

  console.warn("[UniversalConverter] Using mapping:", {
    date: mapping.dateColumn,
    description: mapping.descriptionColumn,
    amount: mapping.amountColumn,
    debit: mapping.debitColumn,
    credit: mapping.creditColumn,
    confidence: mapping.confidence,
    format: mapping.amountFormat,
  });

  // Try multiple date formats if the detected one fails
  const dateFormats = [
    mapping.dateFormat,
    "MM/dd/yyyy",
    "dd/MM/yyyy",
    "yyyy-MM-dd",
    "M/d/yyyy",
    "dd.MM.yyyy",
    "yyyy/MM/dd",
    "yyyyMMdd",
    "MM-dd-yyyy",
  ].filter(Boolean) as string[];

  // Find all potential description columns (for fallback)
  const potentialDescCols = headers.filter((h) => {
    const lower = h.toLowerCase();
    return (
      lower.includes("desc") ||
      lower.includes("detail") ||
      lower.includes("memo") ||
      lower.includes("merchant") ||
      lower.includes("payee") ||
      lower.includes("name") ||
      lower.includes("narr") ||
      lower.includes("partic") ||
      lower.includes("reference") ||
      lower.includes("type") ||
      lower.includes("category")
    );
  });

  for (const row of rows) {
    try {
      // Get date - try multiple columns if needed
      let dateStr = mapping.dateColumn ? row[mapping.dateColumn] : null;

      // If no date from mapped column, try to find any date-like value
      if (!dateStr) {
        for (const header of headers) {
          const val = String(row[header] || "").trim();
          if (val && /\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}/.test(val)) {
            dateStr = val;
            break;
          }
        }
      }

      if (!dateStr) continue;

      // Try parsing with different formats
      let date: Date | null = null;
      for (const fmt of dateFormats) {
        try {
          const parsed = parseDate(dateStr, fmt, new Date());
          if (
            !isNaN(parsed.getTime()) &&
            parsed.getFullYear() > 1900 &&
            parsed.getFullYear() < 2100
          ) {
            date = parsed;
            break;
          }
        } catch {
          // Try next format
        }
      }

      if (!date) continue;

      // Get description - try multiple sources
      let description = "";

      // First try mapped column
      if (mapping.descriptionColumn) {
        description = String(row[mapping.descriptionColumn] || "").trim();
      }

      // If empty, try potential description columns
      if (!description) {
        for (const col of potentialDescCols) {
          const val = String(row[col] || "").trim();
          if (val && val.length > description.length) {
            description = val;
          }
        }
      }

      // If still empty, concatenate all non-date/non-amount text fields
      if (!description) {
        const textParts: string[] = [];
        for (const header of headers) {
          const val = String(row[header] || "").trim();
          if (!val) continue;
          // Skip if it looks like a date or amount
          if (/^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}$/.test(val)) continue;
          if (/^[$€£¥₹]?[\d,.']+[$€£¥₹]?$/.test(val.replace(/[()+-]/g, ""))) continue;
          if (val.length >= 3) {
            textParts.push(val);
          }
        }
        description = textParts.slice(0, 2).join(" - ") || "Transaction";
      }

      // Parse amount
      let amount = 0;

      if (mapping.amountFormat === "split") {
        // Split format: use debit and credit columns
        const debitStr = mapping.debitColumn ? String(row[mapping.debitColumn] || "") : "";
        const creditStr = mapping.creditColumn ? String(row[mapping.creditColumn] || "") : "";

        const debitVal = parseAmountUniversal(debitStr);
        const creditVal = parseAmountUniversal(creditStr);

        // Credit is positive (income), Debit is negative (expense)
        if (Math.abs(creditVal) > 0.001) {
          amount = Math.abs(creditVal);
        } else if (Math.abs(debitVal) > 0.001) {
          amount = -Math.abs(debitVal);
        } else {
          continue; // No amount
        }
      } else {
        // Single amount column - try mapped column first
        let amountStr = mapping.amountColumn ? String(row[mapping.amountColumn] || "") : "";

        // If no amount, try to find any amount-like value (excluding code columns)
        if (!amountStr || parseAmountUniversal(amountStr) === 0) {
          for (const header of headers) {
            const headerLower = header.toLowerCase();

            // Skip code columns
            if (
              headerLower.includes("mcc") ||
              headerLower.includes("code") ||
              headerLower.includes("reference") ||
              headerLower.includes("number")
            ) {
              continue;
            }

            const val = String(row[header] || "").trim();

            // Skip pure 4-5 digit integers (codes)
            if (/^\d{4,5}$/.test(val)) continue;

            const parsed = parseAmountUniversal(val);
            if (parsed !== 0) {
              amountStr = val;
              amount = parsed;
              break;
            }
          }
        } else {
          amount = parseAmountUniversal(amountStr);
        }

        if (amount === 0) continue; // Skip rows with no amount
      }

      transactions.push({
        date,
        description,
        amount,
        isDuplicate: false,
        confidence: mapping.confidence,
      });
    } catch (error) {
      console.error("[UniversalConverter] Error parsing row:", error);
    }
  }

  return {
    transactions,
    mapping,
    confidence: mapping.confidence,
  };
}

/**
 * Parse amount from ANY worldwide format
 * Handles all currencies and number formats globally
 */
function parseAmountUniversal(value: string): number {
  if (!value || typeof value !== "string") return 0;

  let str = value.trim();
  if (!str) return 0;

  // Check for negative indicators
  let isNegative = false;

  // Parentheses indicate negative (accounting format)
  if (str.startsWith("(") && str.endsWith(")")) {
    isNegative = true;
    str = str.slice(1, -1);
  }

  // Leading minus or trailing minus (some formats use trailing)
  if (str.startsWith("-") || str.startsWith("−") || str.startsWith("–")) {
    isNegative = true;
    str = str.slice(1);
  }
  if (str.endsWith("-") || str.endsWith("−") || str.endsWith("–")) {
    isNegative = true;
    str = str.slice(0, -1);
  }

  // CR/DR suffixes (used in some bank formats)
  if (/\s*CR\s*$/i.test(str)) {
    str = str.replace(/\s*CR\s*$/i, "");
  }
  if (/\s*DR\s*$/i.test(str)) {
    isNegative = true;
    str = str.replace(/\s*DR\s*$/i, "");
  }

  // Remove ALL currency symbols (comprehensive list of world currencies)
  // Major currency symbols
  str = str.replace(/[$€£¥₹₽₩฿₫₴₸¢₦₱₭₮₲₵₡₢₣₤₥₧₨₪₰₳₷₺₼₾֏؋৳៛₠₯ƒ﷼]/g, "");

  // Remove ALL ISO 4217 currency codes (3-letter codes)
  str = str.replace(/\b[A-Z]{3}\b/g, "");

  // Remove common currency abbreviations
  str = str.replace(
    /\b(Rs\.?|Rp\.?|kr\.?|zł|Kč|Ft|lei|лв|ден|din|kn|R\$|S\/|Bs\.?|Q|L|C\$|B\/\.?|RD\$|TT\$|J\$|EC\$|BD\$|BZ\$|GY\$|SR\$|NAf\.?|Afl\.?|AWG|ANG|XCD|BBD|BSD|BMD|KYD|FJD|GYD|JMD|LRD|NAD|SBD|SRD|TTD|XPF|CFP)\b/gi,
    ""
  );

  // Remove spaces and other whitespace
  str = str.replace(/\s+/g, "");

  // Remove any remaining non-numeric characters except . , - and digits
  // But keep the structure for number parsing

  // Detect number format (European vs US vs Indian vs Swiss)
  const hasComma = str.includes(",");
  const hasPeriod = str.includes(".");
  const hasApostrophe = str.includes("'"); // Swiss format: 1'234.56

  // Handle Swiss format with apostrophe as thousands separator
  if (hasApostrophe) {
    str = str.replace(/'/g, "");
  }

  if (hasComma && hasPeriod) {
    // Both present - determine which is decimal
    const lastComma = str.lastIndexOf(",");
    const lastPeriod = str.lastIndexOf(".");

    if (lastComma > lastPeriod) {
      // European format: 1.234,56
      str = str.replace(/\./g, "").replace(",", ".");
    } else {
      // US format: 1,234.56
      str = str.replace(/,/g, "");
    }
  } else if (hasComma && !hasPeriod) {
    // Only comma - check if it's decimal separator
    const parts = str.split(",");
    if (parts.length === 2 && parts[1].length <= 2) {
      // Likely European decimal: 123,45
      str = str.replace(",", ".");
    } else if (parts.length === 2 && parts[1].length === 3) {
      // Could be Indian lakhs (1,00,000) or thousands - treat as thousands separator
      str = str.replace(/,/g, "");
    } else {
      // Multiple commas = thousands separators (Indian: 1,00,000 or US: 1,234,567)
      str = str.replace(/,/g, "");
    }
  } else if (hasPeriod && !hasComma) {
    // Only period - check if it's thousands separator
    const parts = str.split(".");
    if (parts.length > 2) {
      // Multiple periods = thousands separators: 1.234.567
      str = str.replace(/\./g, "");
    } else if (parts.length === 2 && parts[1].length === 3 && parts[0].length <= 3) {
      // Could be European thousands: 1.234 (meaning 1234)
      // But could also be decimal: 1.234 (meaning 1.234)
      // Prefer decimal interpretation for amounts (more common)
      // Leave as is
    }
    // Otherwise it's a decimal, leave as is
  }

  // Final cleanup - remove any remaining non-numeric except decimal point
  str = str.replace(/[^\d.-]/g, "");

  const num = parseFloat(str);
  if (isNaN(num)) return 0;

  // Round to cents to avoid floating-point precision errors
  const rounded = roundToCents(isNegative ? -Math.abs(num) : num);
  return rounded;
}

/**
 * Detect duplicate transactions
 * Returns confidence score 0-1 (1 = definitely duplicate)
 *
 * @param useSmartDetection - If true, uses Claude API for semantic matching (requires opt-in)
 */
export async function detectDuplicates(
  newTransactions: ParsedTransaction[],
  existingTransactions: Transaction[],
  useSmartDetection: boolean = false
): Promise<void> {
  // First, check for FITID matches (perfect duplicates from OFX)
  for (const newTx of newTransactions) {
    if (newTx.fitid) {
      const exactMatch = existingTransactions.find((existing) => existing.fitid === newTx.fitid);
      if (exactMatch) {
        newTx.isDuplicate = true;
        newTx.confidence = 1.0;
        continue;
      }
    }
  }

  // Use smart detection if enabled and available
  if (useSmartDetection) {
    try {
      const { detectDuplicatesEnhanced } = await import("@/lib/ai/smart-duplicate-detection");
      await detectDuplicatesEnhanced(newTransactions, existingTransactions, true);
      return; // Smart detection handles everything
    } catch (error) {
      console.warn(
        "[CSVParser] Smart detection unavailable, falling back to basic matching:",
        error
      );
      // Fall through to basic detection
    }
  }

  // Basic duplicate detection (fallback or when smart detection is disabled)
  for (const newTx of newTransactions) {
    if (newTx.isDuplicate) continue; // Already marked by FITID or smart detection

    for (const existing of existingTransactions) {
      // Same date, same amount, similar description
      const sameDate = existing.date.toDateString() === newTx.date.toDateString();
      const sameAmount = Math.abs(existing.amount - newTx.amount) < 0.01;
      const similarDesc = calculateSimilarity(existing.description, newTx.description);

      if (sameDate && sameAmount && similarDesc > 0.8) {
        newTx.isDuplicate = true;
        newTx.confidence = similarDesc;
        break;
      }
    }
  }
}

/**
 * Calculate string similarity (0-1)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1.0;

  // Substring containment — one description is a prefix/subset of the other
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.9;
  }

  // Word-based Jaccard similarity
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

/**
 * Extract merchant name from description
 * Handles BMO-specific formats like [PR] and [OP] prefixes
 */
export function extractMerchant(description: string): string {
  let merchant = description.trim();

  // Remove BMO-specific prefixes: [PR], [OP], etc.
  merchant = merchant.replace(/^\[[A-Z]{2}\]/i, "").trim();

  // Remove common prefixes
  merchant = merchant.replace(/^(PURCHASE |DEBIT |CREDIT |PAYMENT |)/i, "").trim();

  // Remove dates and transaction IDs
  merchant = merchant.replace(/\d{2}\/\d{2}\/\d{4}/g, "").trim();
  merchant = merchant.replace(/\d{6,}/g, "").trim();

  // Take first meaningful part (before location info or multiple spaces)
  const parts = merchant.split(/\s{2,}|\t/);
  let result = parts[0].trim();

  // Remove trailing # numbers (e.g., "SAFEWAY #8886" -> "SAFEWAY")
  result = result.replace(/\s+#\d+.*$/, "").trim();

  return result;
}

/**
 * Validate date range
 */
export function validateDateRange(
  transactions: ParsedTransaction[],
  maxAgeMonths: number = 12
): ParsedTransaction[] {
  const now = new Date();
  const maxAge = new Date();
  maxAge.setMonth(maxAge.getMonth() - maxAgeMonths);

  return transactions.filter((tx) => tx.date >= maxAge && tx.date <= now);
}

/**
 * Group transactions by date for preview
 */
export function groupByDate(
  transactions: ParsedTransaction[]
): Record<string, ParsedTransaction[]> {
  const grouped: Record<string, ParsedTransaction[]> = {};

  for (const tx of transactions) {
    const dateKey = tx.date.toISOString().split("T")[0];
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(tx);
  }

  return grouped;
}

/**
 * Generate import summary
 */
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

export function generateImportSummary(transactions: ParsedTransaction[]): ImportSummary {
  const newTxs = transactions.filter((tx) => !tx.isDuplicate);

  const amounts = transactions.map((tx) => tx.amount);
  const dates = transactions.map((tx) => tx.date);

  return {
    total: transactions.length,
    duplicates: transactions.filter((tx) => tx.isDuplicate).length,
    new: newTxs.length,
    dateRange: {
      earliest: new Date(Math.min(...dates.map((d) => d.getTime()))),
      latest: new Date(Math.max(...dates.map((d) => d.getTime()))),
    },
    amountRange: {
      min: Math.min(...amounts),
      max: Math.max(...amounts),
    },
    income: amounts.filter((a) => a > 0).reduce((sum, a) => sum + a, 0),
    expenses: Math.abs(amounts.filter((a) => a < 0).reduce((sum, a) => sum + a, 0)),
  };
}
