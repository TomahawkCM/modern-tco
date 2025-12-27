/**
 * CSV Parser for Bank Statements
 * Supports BMO and Home Trust bank formats
 */

// Note: Install with: npm install papaparse @types/papaparse
// import Papa from 'papaparse';

import type {
  BankConfig,
  CSVRow,
  ParsedTransaction,
  Transaction,
} from '@/types/budget';
import { parse as parseDate } from 'date-fns';

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
    name: 'BMO',
    dateColumn: 'Date Posted',
    descriptionColumn: 'Description',
    amountColumn: 'Transaction Amount',
    dateFormat: 'yyyyMMdd', // 20250106
    amountMultiplier: 1, // Negative for expenses
    hasHeader: true,
    skipRows: 3, // BMO has 3 header rows before data
  },

  // ✅ Home Trust - VERIFIED
  homeTrust: {
    name: 'Home Trust',
    dateColumn: 'Date',
    descriptionColumn: 'Details',
    amountColumn: 'Debit/Credit',
    dateFormat: 'yyyy-MM-dd', // 2025-01-06
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ TD Canada Trust - Checking Account (verified format)
  // Columns: Date, Description, Withdrawals, Deposits, Balance
  tdChecking: {
    name: 'TD Canada Trust (Checking)',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Withdrawals', // Will combine with Deposits
    dateFormat: 'MM/dd/yyyy', // 01/06/2025
    amountMultiplier: -1, // Withdrawals are negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ TD Canada Trust - Credit Card (verified format)
  // Columns: Transaction Date, Posting Date, Description, Amount
  tdCreditCard: {
    name: 'TD Canada Trust (Credit Card)',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1, // Negative for purchases, positive for payments
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ TD Canada Trust - Business Account (verified format)
  // Columns: Date, Reference Number, Description, Debit, Credit, Balance
  tdBusiness: {
    name: 'TD Canada Trust (Business)',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Debit', // Will combine with Credit
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: -1, // Debit is negative
    hasHeader: true,
    skipRows: 0,
  },

  // Legacy TD format for backward compatibility
  td: {
    name: 'TD Canada Trust',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // 🔄 TD with Outflow/Inflow columns - Alternative format
  tdSplit: {
    name: 'TD Canada Trust (Outflow/Inflow)',
    dateColumn: 'Date',
    descriptionColumn: 'Payee',
    amountColumn: 'Outflow', // Will need special handling for Inflow
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: -1, // Outflow should be negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ RBC (Royal Bank of Canada) - Standard Format (verified)
  // Columns: Account Type, Account Number, Transaction Date, Description 1, Description 2, CAD$, USD$
  rbcStandard: {
    name: 'RBC (Standard)',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Description 1',
    amountColumn: 'CAD$', // Primary currency column
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ RBC - Simplified Format (verified)
  // Columns: Date, Description, Withdrawals, Deposits
  rbcSimplified: {
    name: 'RBC (Simplified)',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Withdrawals', // Will combine with Deposits
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: -1, // Withdrawals are negative
    hasHeader: true,
    skipRows: 0,
  },

  // Legacy RBC format for backward compatibility
  rbc: {
    name: 'RBC',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Description 1',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // RBC with separate debit/credit columns
  rbcSplit: {
    name: 'RBC (Debit/Credit Split)',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Description 1',
    amountColumn: 'Debit', // Will need special handling for Credit
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: -1, // Debit should be negative
    hasHeader: true,
    skipRows: 1,
  },

  // ✅ Scotiabank - Standard format (verified)
  // Columns: Date, Description, Withdrawal, Deposit, Balance
  scotiabank: {
    name: 'Scotiabank',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Withdrawal', // Will combine with Deposit
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: -1, // Withdrawals are negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Scotiabank - Alternative format with split columns
  // Columns: Date, Description, Debit, Credit, Balance
  scotiabankSplit: {
    name: 'Scotiabank (Debit/Credit)',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Debit',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Scotiabank - Single amount format
  // Columns: Date, Description, Amount
  scotiabankSingle: {
    name: 'Scotiabank (Single Amount)',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ CIBC (Canadian Imperial Bank of Commerce) - Standard format (verified)
  // Columns: Date, Description, Debit, Credit, Card/Chequing Balance
  cibc: {
    name: 'CIBC',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Debit', // Will combine with Credit
    dateFormat: 'yyyy-MM-dd', // ISO format
    amountMultiplier: -1, // Debit is negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ CIBC - Transaction Date format variant
  // Columns: Transaction Date, Description, Withdrawals, Deposits, Balance
  cibcSplit: {
    name: 'CIBC (Withdrawals/Deposits)',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Description',
    amountColumn: 'Withdrawals',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ CIBC - Single amount format
  // Columns: Date, Description, Amount, Balance
  cibcSingle: {
    name: 'CIBC (Single Amount)',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'yyyy-MM-dd',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Tangerine - Standard format (verified)
  // Columns: Date, Transaction, Name, Memo, Amount
  tangerine: {
    name: 'Tangerine',
    dateColumn: 'Date',
    descriptionColumn: 'Name',
    amountColumn: 'Amount',
    dateFormat: 'M/d/yyyy', // Tangerine uses M/d/yyyy (no leading zeros)
    amountMultiplier: 1, // Negative for expenses
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Tangerine - ISO date format variant
  tangerineISO: {
    name: 'Tangerine (ISO Date)',
    dateColumn: 'Date',
    descriptionColumn: 'Name',
    amountColumn: 'Amount',
    dateFormat: 'yyyy-MM-dd',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Simplii Financial (CIBC subsidiary) - Standard format (verified)
  // Columns: Date, *Description, Debit, Credit, Balance
  simplii: {
    name: 'Simplii Financial',
    dateColumn: 'Date',
    descriptionColumn: '*Description',
    amountColumn: 'Debit', // Will combine with Credit
    dateFormat: 'yyyy-MM-dd',
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Simplii - Alternative format
  simpliiSingle: {
    name: 'Simplii Financial (Single Amount)',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'yyyy-MM-dd',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Desjardins (Caisses Populaires - Quebec)
  // Columns: Date de l'opération, Description, Retrait, Dépôt, Solde
  // OR: Date, Description, Withdrawal, Deposit, Balance (English)
  desjardins: {
    name: 'Desjardins',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Retrait', // French: Withdrawal
    dateFormat: 'yyyy-MM-dd',
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Desjardins - French column names
  desjardinsFR: {
    name: 'Desjardins (Français)',
    dateColumn: "Date de l'opération",
    descriptionColumn: 'Description',
    amountColumn: 'Retrait',
    dateFormat: 'yyyy-MM-dd',
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Desjardins - English format
  desjardinsEN: {
    name: 'Desjardins (English)',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Withdrawal',
    dateFormat: 'yyyy-MM-dd',
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
    name: 'Chase Credit Card',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: -1, // Charges are positive in CSV, we want negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Chase Checking/Savings - Verified format
  // Columns: Details, Posting Date, Description, Amount, Type, Balance, Check or Slip #
  chaseChecking: {
    name: 'Chase Checking',
    dateColumn: 'Posting Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1, // Already signed correctly
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Chase Business - Verified format
  // Columns: Transaction Date, Post Date, Description, Amount, Type, Balance
  chaseBusiness: {
    name: 'Chase Business',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Bank of America Checking - Verified format
  // Columns: Posted Date, Reference Number, Payee, Address, Amount
  // Note: BofA CSV has 7 header rows before data
  bankOfAmerica: {
    name: 'Bank of America',
    dateColumn: 'Posted Date',
    descriptionColumn: 'Payee',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1, // Already signed
    hasHeader: true,
    skipRows: 7, // BofA has 7 header rows
  },

  // ✅ Bank of America Credit Card - Verified format
  // Columns: Posted Date, Reference Number, Payee, Address, Amount
  bankOfAmericaCredit: {
    name: 'Bank of America Credit Card',
    dateColumn: 'Posted Date',
    descriptionColumn: 'Payee',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0, // Credit card CSVs typically don't have extra header rows
  },

  // ✅ Bank of America - Alternative format (no extra headers)
  bankOfAmericaSimple: {
    name: 'Bank of America (Simple)',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Wells Fargo Checking - Verified format
  // Columns: Date, Amount, *, *, Description
  wellsFargo: {
    name: 'Wells Fargo',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: false, // Wells Fargo CSV has no header row
    skipRows: 0,
  },

  // ✅ Wells Fargo Checking - With header variant
  wellsFargoHeader: {
    name: 'Wells Fargo (With Header)',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Wells Fargo Credit Card - Verified format
  // Columns: Transaction Date, Post Date, Description, Category, Amount
  wellsFargoCredit: {
    name: 'Wells Fargo Credit Card',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Citibank Credit Card - Verified format
  // Columns: Status, Date, Description, Debit, Credit
  citibank: {
    name: 'Citibank',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Debit', // Will combine with Credit
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: -1, // Debit is negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Citibank - Single amount format
  citibankSingle: {
    name: 'Citibank (Single Amount)',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Citibank Checking - Verified format
  // Columns: Date, Description, Debit, Credit, Balance
  citibankChecking: {
    name: 'Citibank Checking',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Debit',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Capital One - Split format (Debit/Credit columns)
  // Columns: Transaction Date, Posted Date, Card No., Description, Category, Debit, Credit
  capitalOne: {
    name: 'Capital One',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Description',
    amountColumn: 'Debit', // Will combine with Credit
    dateFormat: 'yyyy-MM-dd', // Capital One uses ISO format
    amountMultiplier: -1, // Debit is negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Capital One - Single amount format (360 accounts)
  capitalOneSingle: {
    name: 'Capital One (Single Amount)',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'yyyy-MM-dd',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Capital One - MM/dd/yyyy date variant
  capitalOneUS: {
    name: 'Capital One (US Date)',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Description',
    amountColumn: 'Debit',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ US Bank Checking - Verified format
  // Columns: Date, Transaction, Name, Memo, Amount
  usBank: {
    name: 'US Bank',
    dateColumn: 'Date',
    descriptionColumn: 'Name',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ US Bank Credit Card - Verified format
  // Columns: Transaction Date, Posted Date, Description, Amount
  usBankCredit: {
    name: 'US Bank Credit Card',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ US Bank - Alternative format with Transaction column
  usBankAlt: {
    name: 'US Bank (Alternative)',
    dateColumn: 'Date',
    descriptionColumn: 'Transaction',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ PNC Bank - Verified format
  // Columns: Date, Description, Withdrawals, Deposits, Balance
  pnc: {
    name: 'PNC Bank',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Withdrawals', // Will combine with Deposits
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: -1, // Withdrawals are negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ PNC Bank - Single amount format
  pncSingle: {
    name: 'PNC Bank (Single Amount)',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ PNC Credit Card - Verified format
  pncCredit: {
    name: 'PNC Credit Card',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Discover Card - Verified format
  // Columns: Trans. Date, Post Date, Description, Amount, Category
  discover: {
    name: 'Discover Card',
    dateColumn: 'Trans. Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: -1, // Charges are positive, we want negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Discover Card - Alternative column names
  discoverAlt: {
    name: 'Discover Card (Alternative)',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Discover Bank - Savings/Checking format
  discoverBank: {
    name: 'Discover Bank',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ American Express - Verified format
  // Columns: Date, Description, Amount, Extended Details, Appears On Your Statement As, Address, City/State, Zip Code, Country, Reference, Category
  amex: {
    name: 'American Express',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: -1, // Charges are positive, we want negative
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ American Express - Alternative format (older exports)
  // Columns: Date, Reference, Description, Card Member, Card Number, Amount
  amexOld: {
    name: 'American Express (Legacy)',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yy', // Older format uses 2-digit year
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ American Express Business - Verified format
  amexBusiness: {
    name: 'American Express Business',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Ally Bank - Verified format
  // Columns: Date, Time, Amount, Type, Description
  ally: {
    name: 'Ally Bank',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'yyyy-MM-dd',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Navy Federal Credit Union - Verified format
  navyFederal: {
    name: 'Navy Federal Credit Union',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ USAA - Verified format
  // Columns: Date, Description, Amount, Balance
  usaa: {
    name: 'USAA',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Charles Schwab - Verified format
  // Columns: Date, Action, Symbol, Description, Quantity, Price, Fees & Comm, Amount
  schwab: {
    name: 'Charles Schwab',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ✅ Fidelity - Verified format
  fidelity: {
    name: 'Fidelity',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
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
  detectionMethod: 'exact' | 'fuzzy' | 'pattern' | 'none';
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
  const headerStr = headers.join(',').toLowerCase().trim();
  const headerSet = new Set(headers.map(h => h.toLowerCase().trim()));

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
      reasons.push('All core columns match exactly');
    }

    // 2. Fuzzy column name matching (medium confidence)
    if (!dateMatch) {
      for (const header of headers) {
        const similarity = fuzzyMatch(header, config.dateColumn);
        if (similarity > 0.8) {
          score += 15 * similarity;
          reasons.push(`Fuzzy date match: "${header}" ≈ "${config.dateColumn}" (${(similarity * 100).toFixed(0)}%)`);
          break;
        }
      }
    }

    if (!descMatch) {
      for (const header of headers) {
        const similarity = fuzzyMatch(header, config.descriptionColumn);
        if (similarity > 0.8) {
          score += 15 * similarity;
          reasons.push(`Fuzzy desc match: "${header}" ≈ "${config.descriptionColumn}" (${(similarity * 100).toFixed(0)}%)`);
          break;
        }
      }
    }

    if (!amountMatch) {
      for (const header of headers) {
        const similarity = fuzzyMatch(header, config.amountColumn);
        if (similarity > 0.8) {
          score += 15 * similarity;
          reasons.push(`Fuzzy amount match: "${header}" ≈ "${config.amountColumn}" (${(similarity * 100).toFixed(0)}%)`);
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
    if (bankKey === 'bmo') {
      if (headerStr.includes('first bank card')) {
        score += 15;
        reasons.push('BMO signature: "First Bank Card"');
      }
    }

    // TD specific patterns
    if (bankKey === 'tdSplit' && headerSet.has('outflow') && headerSet.has('inflow')) {
      score += 20;
      reasons.push('TD signature: Outflow/Inflow columns');
    }

    // TD Checking specific pattern
    if (bankKey === 'tdChecking' && headerSet.has('withdrawals') && headerSet.has('deposits') && headerSet.has('balance')) {
      score += 25;
      reasons.push('TD Checking signature: Withdrawals/Deposits/Balance columns');
    }

    // TD Credit Card specific pattern
    if (bankKey === 'tdCreditCard' && headerSet.has('transaction date') && headerSet.has('posting date')) {
      score += 20;
      reasons.push('TD Credit Card signature: Transaction Date + Posting Date');
    }

    // TD Business specific pattern
    if (bankKey === 'tdBusiness' && headerSet.has('reference number') && headerSet.has('debit') && headerSet.has('credit')) {
      score += 25;
      reasons.push('TD Business signature: Reference Number + Debit/Credit columns');
    }

    // RBC specific patterns
    if (bankKey.startsWith('rbc') && (headerSet.has('description 1') || headerSet.has('description1'))) {
      score += 15;
      reasons.push('RBC signature: "Description 1"');
    }

    // RBC Standard specific pattern (CAD$/USD$ columns)
    if (bankKey === 'rbcStandard' && (headerSet.has('cad$') || headerSet.has('usd$'))) {
      score += 25;
      reasons.push('RBC Standard signature: CAD$/USD$ currency columns');
    }

    // RBC Simplified specific pattern
    if (bankKey === 'rbcSimplified' && headerSet.has('withdrawals') && headerSet.has('deposits') && !headerSet.has('balance')) {
      score += 20;
      reasons.push('RBC Simplified signature: Withdrawals/Deposits without Balance');
    }

    // Scotiabank specific patterns
    if (bankKey === 'scotiabank' && (headerSet.has('withdrawal') || headerSet.has('deposit'))) {
      score += 20;
      reasons.push('Scotiabank signature: Withdrawal/Deposit columns');
    }

    if (bankKey === 'scotiabankSplit' && headerSet.has('debit') && headerSet.has('credit') && headerSet.has('balance')) {
      score += 18;
      reasons.push('Scotiabank Split signature: Debit/Credit/Balance');
    }

    // CIBC specific patterns
    if (bankKey === 'cibc' && headerSet.has('debit') && headerSet.has('credit')) {
      score += 15;
      reasons.push('CIBC signature: Debit/Credit columns');
    }

    if (bankKey === 'cibcSplit' && headerSet.has('withdrawals') && headerSet.has('deposits')) {
      score += 18;
      reasons.push('CIBC Split signature: Withdrawals/Deposits');
    }

    // Tangerine specific pattern - "Name" column is very distinctive
    if (bankKey.startsWith('tangerine') && headerSet.has('name') && headerSet.has('amount')) {
      score += 25;
      reasons.push('Tangerine signature: Name + Amount columns');
    }

    // Simplii specific pattern - *Description column
    if (bankKey.startsWith('simplii') && (headerSet.has('*description') || headerStr.includes('*description'))) {
      score += 25;
      reasons.push('Simplii signature: *Description column');
    }

    // Desjardins specific patterns
    if (bankKey === 'desjardinsFR' && (headerStr.includes("date de l'opération") || headerSet.has('retrait'))) {
      score += 30;
      reasons.push('Desjardins French signature: French column names');
    }

    if (bankKey === 'desjardinsEN' && headerSet.has('withdrawal') && headerSet.has('deposit')) {
      score += 18;
      reasons.push('Desjardins English signature: Withdrawal/Deposit');
    }

    // ========================================
    // US BANK SPECIFIC PATTERNS
    // ========================================

    // Chase Credit Card - Post Date + Category + Type is distinctive
    if (bankKey === 'chaseCredit' && headerSet.has('post date') && headerSet.has('category') && headerSet.has('type')) {
      score += 25;
      reasons.push('Chase Credit signature: Post Date + Category + Type');
    }

    // Chase Checking - Details + Posting Date + Check or Slip #
    if (bankKey === 'chaseChecking' && headerSet.has('details') && headerSet.has('posting date')) {
      score += 25;
      reasons.push('Chase Checking signature: Details + Posting Date');
    }

    // Chase Business - Transaction Date + Post Date + Type
    if (bankKey === 'chaseBusiness' && headerSet.has('transaction date') && headerSet.has('post date') && headerSet.has('type') && !headerSet.has('category')) {
      score += 20;
      reasons.push('Chase Business signature: Transaction Date + Post Date + Type');
    }

    // Bank of America - Posted Date + Payee + Address
    if (bankKey === 'bankOfAmerica' && headerSet.has('posted date') && headerSet.has('payee')) {
      score += 25;
      reasons.push('BofA signature: Posted Date + Payee');
    }

    // Bank of America Credit Card
    if (bankKey === 'bankOfAmericaCredit' && headerSet.has('posted date') && headerSet.has('payee') && headerSet.has('address')) {
      score += 22;
      reasons.push('BofA Credit signature: Posted Date + Payee + Address');
    }

    // Wells Fargo Credit Card - Transaction Date + Post Date + Category
    if (bankKey === 'wellsFargoCredit' && headerSet.has('transaction date') && headerSet.has('post date') && headerSet.has('category')) {
      score += 25;
      reasons.push('Wells Fargo Credit signature: Transaction Date + Post Date + Category');
    }

    // Citibank - Status + Date + Debit + Credit
    if (bankKey === 'citibank' && headerSet.has('status') && headerSet.has('debit') && headerSet.has('credit')) {
      score += 25;
      reasons.push('Citibank signature: Status + Debit/Credit columns');
    }

    // Citibank Checking
    if (bankKey === 'citibankChecking' && headerSet.has('debit') && headerSet.has('credit') && headerSet.has('balance') && !headerSet.has('status')) {
      score += 20;
      reasons.push('Citibank Checking signature: Debit/Credit/Balance');
    }

    // Capital One - Card No. + Category + Debit/Credit
    if (bankKey === 'capitalOne' && headerSet.has('card no.') && headerSet.has('category')) {
      score += 25;
      reasons.push('Capital One signature: Card No. + Category');
    }

    // Capital One - Debit/Credit split without Card No.
    if (bankKey.startsWith('capitalOne') && headerSet.has('debit') && headerSet.has('credit') && headerSet.has('transaction date') && headerSet.has('posted date')) {
      score += 20;
      reasons.push('Capital One signature: Debit/Credit + Posted Date');
    }

    // US Bank - Name column is distinctive
    if (bankKey === 'usBank' && headerSet.has('name') && headerSet.has('memo') && headerSet.has('transaction')) {
      score += 25;
      reasons.push('US Bank signature: Name + Memo + Transaction');
    }

    // US Bank Credit Card
    if (bankKey === 'usBankCredit' && headerSet.has('transaction date') && headerSet.has('posted date') && !headerSet.has('category')) {
      score += 18;
      reasons.push('US Bank Credit signature: Transaction Date + Posted Date');
    }

    // PNC - Withdrawals + Deposits columns
    if (bankKey === 'pnc' && headerSet.has('withdrawals') && headerSet.has('deposits')) {
      score += 25;
      reasons.push('PNC signature: Withdrawals/Deposits columns');
    }

    // Discover - Trans. Date is distinctive
    if (bankKey === 'discover' && headerSet.has('trans. date')) {
      score += 30;
      reasons.push('Discover signature: "Trans. Date" column');
    }

    // Discover Alternative
    if (bankKey === 'discoverAlt' && headerSet.has('post date') && headerSet.has('category') && !headerSet.has('type')) {
      score += 18;
      reasons.push('Discover Alt signature: Post Date + Category');
    }

    // American Express - Extended Details + Appears On Your Statement As
    if (bankKey === 'amex' && (headerSet.has('extended details') || headerStr.includes('appears on your statement'))) {
      score += 30;
      reasons.push('Amex signature: Extended Details / Statement As');
    }

    // American Express - Reference + Card Member columns
    if (bankKey === 'amexOld' && headerSet.has('reference') && headerSet.has('card member')) {
      score += 25;
      reasons.push('Amex Legacy signature: Reference + Card Member');
    }

    // Ally Bank - Time column is distinctive
    if (bankKey === 'ally' && headerSet.has('time') && headerSet.has('type')) {
      score += 25;
      reasons.push('Ally signature: Time + Type columns');
    }

    // Navy Federal
    if (bankKey === 'navyFederal' && headerStr.includes('navy federal')) {
      score += 30;
      reasons.push('Navy Federal signature: Bank name in headers');
    }

    // USAA
    if (bankKey === 'usaa' && headerStr.includes('usaa')) {
      score += 30;
      reasons.push('USAA signature: Bank name in headers');
    }

    // Charles Schwab - Action + Symbol columns (investment account)
    if (bankKey === 'schwab' && headerSet.has('action') && headerSet.has('symbol')) {
      score += 25;
      reasons.push('Schwab signature: Action + Symbol columns');
    }

    // Fidelity
    if (bankKey === 'fidelity' && headerStr.includes('fidelity')) {
      score += 30;
      reasons.push('Fidelity signature: Bank name in headers');
    }

    // Home Trust specific
    if (bankKey === 'homeTrust' && headerStr.includes('debit/credit')) {
      score += 18;
      reasons.push('Home Trust signature: "Debit/Credit" column');
    }

    // 4. Split format detection (Debit/Credit vs single Amount)
    const hasSplitColumns =
      (headerSet.has('debit') && headerSet.has('credit')) ||
      (headerSet.has('withdrawals') && headerSet.has('deposits')) ||
      (headerSet.has('outflow') && headerSet.has('inflow'));

    const hasSingleAmount = headerSet.has('amount');

    if (bankKey.includes('Split') && hasSplitColumns) {
      score += 8;
      reasons.push('Split format detected (Debit/Credit columns)');
    } else if (!bankKey.includes('Split') && hasSingleAmount && !hasSplitColumns) {
      score += 5;
      reasons.push('Single amount column format');
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
    .filter(alt => alt.score > 20) // Only meaningful alternatives
    .map(alt => ({
      bank: alt.bank,
      confidence: Math.min(alt.score / 100, 1.0),
      reason: alt.reasons.join('; '),
    }));

  // Determine detection method
  let detectionMethod: 'exact' | 'fuzzy' | 'pattern' | 'none' = 'none';
  if (topMatch.score >= 90) {
    detectionMethod = 'exact';
  } else if (topMatch.score >= 60) {
    detectionMethod = 'fuzzy';
  } else if (topMatch.score >= 30) {
    detectionMethod = 'pattern';
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
    detectionMethod: 'none',
  };
}

/**
 * Auto-detect bank from CSV headers (backward compatible)
 * Uses priority-based matching: most specific patterns first
 *
 * @deprecated Use detectBankWithConfidence() for enhanced detection with confidence scoring
 */
export function detectBank(headers: string[]): string | null {
  const headerStr = headers.join(',').toLowerCase().trim();
  const headerSet = new Set(headers.map(h => h.toLowerCase().trim()));

  // ========================================
  // CANADIAN BANKS
  // ========================================

  // BMO - Very specific pattern (Date Posted + Transaction Amount)
  if (
    (headerStr.includes('date posted') || headerStr.includes('first bank card')) &&
    (headerStr.includes('transaction amount') || headerStr.includes('transaction type'))
  ) {
    return 'bmo';
  }

  // ========================================
  // TD CANADA TRUST - Multiple format variants
  // ========================================

  // TD Credit Card - Transaction Date + Posting Date + Description + Amount
  if (
    headerSet.has('transaction date') &&
    headerSet.has('posting date') &&
    headerSet.has('description') &&
    headerSet.has('amount') &&
    !headerSet.has('category') // Differentiate from Chase Credit
  ) {
    return 'tdCreditCard';
  }

  // TD Checking - Date + Description + Withdrawals + Deposits + Balance
  if (
    headerSet.has('date') &&
    headerSet.has('description') &&
    headerSet.has('withdrawals') &&
    headerSet.has('deposits') &&
    headerSet.has('balance') &&
    !headerSet.has('transaction date') // Differentiate from credit card
  ) {
    return 'tdChecking';
  }

  // TD Business - Date + Reference Number + Description + Debit + Credit + Balance
  if (
    headerSet.has('date') &&
    headerSet.has('reference number') &&
    headerSet.has('description') &&
    headerSet.has('debit') &&
    headerSet.has('credit') &&
    headerSet.has('balance')
  ) {
    return 'tdBusiness';
  }

  // TD Outflow/Inflow split pattern (very distinctive)
  if (headerSet.has('outflow') && headerSet.has('inflow')) {
    return 'tdSplit';
  }

  // TD - Account activity pattern (generic fallback)
  if (
    headerSet.has('date') &&
    (headerSet.has('payee') || headerSet.has('description')) &&
    !headerStr.includes('posted') // Differentiate from BofA
  ) {
    if (headerStr.includes('account activity') || headerStr.includes('accountactivity')) {
      return 'td';
    }
  }

  // ========================================
  // RBC (Royal Bank of Canada) - Multiple format variants
  // ========================================

  // RBC Standard - Account Type + Account Number + Transaction Date + Description 1 + CAD$/USD$
  if (
    headerSet.has('account type') &&
    headerSet.has('account number') &&
    headerSet.has('transaction date') &&
    (headerSet.has('description 1') || headerSet.has('description1')) &&
    (headerSet.has('cad$') || headerSet.has('usd$'))
  ) {
    return 'rbcStandard';
  }

  // RBC Simplified - Date + Description + Withdrawals + Deposits (no Balance)
  if (
    headerSet.has('date') &&
    headerSet.has('description') &&
    headerSet.has('withdrawals') &&
    headerSet.has('deposits') &&
    !headerSet.has('balance') && // Differentiate from TD Checking
    !headerSet.has('reference number') // Differentiate from TD Business
  ) {
    return 'rbcSimplified';
  }

  // RBC - Description 1 is distinctive (legacy detection)
  if (
    headerSet.has('transaction date') &&
    (headerSet.has('description 1') || headerSet.has('description1'))
  ) {
    if (headerSet.has('debit') && headerSet.has('credit')) {
      return 'rbcSplit';
    }
    return 'rbc';
  }

  // ========================================
  // SCOTIABANK - Multiple format variants
  // ========================================

  // Scotiabank with Withdrawal/Deposit columns
  if (
    headerSet.has('date') &&
    headerSet.has('description') &&
    (headerSet.has('withdrawal') || headerSet.has('deposit'))
  ) {
    return 'scotiabank';
  }

  // Scotiabank with Debit/Credit columns
  if (
    headerSet.has('date') &&
    headerSet.has('description') &&
    headerSet.has('debit') &&
    headerSet.has('credit') &&
    headerSet.has('balance') &&
    !headerSet.has('reference number') // Differentiate from TD Business
  ) {
    return 'scotiabankSplit';
  }

  // Scotiabank with single Amount column
  if (
    headerStr.includes('scotiabank') &&
    headerSet.has('date') &&
    headerSet.has('amount')
  ) {
    return 'scotiabankSingle';
  }

  // ========================================
  // CIBC - Multiple format variants
  // ========================================

  // CIBC - Transaction Date + Withdrawals/Deposits
  if (
    headerSet.has('transaction date') &&
    (headerSet.has('withdrawals') || headerSet.has('deposits'))
  ) {
    return 'cibcSplit';
  }

  // CIBC - Standard with Debit/Credit
  if (
    headerSet.has('date') &&
    headerSet.has('description') &&
    headerSet.has('debit') &&
    headerSet.has('credit') &&
    !headerSet.has('withdrawal') && // Not Scotiabank
    !headerSet.has('reference number') // Not TD Business
  ) {
    return 'cibc';
  }

  // CIBC - Single amount format
  if (
    headerStr.includes('cibc') &&
    headerSet.has('date') &&
    headerSet.has('amount')
  ) {
    return 'cibcSingle';
  }

  // ========================================
  // TANGERINE - Date format variants
  // ========================================

  // Tangerine - "Name" column is distinctive
  if (
    headerSet.has('date') &&
    headerSet.has('name') &&
    headerSet.has('amount') &&
    !headerSet.has('card') // Differentiate from credit cards
  ) {
    // Check if Transaction column exists (standard format)
    if (headerSet.has('transaction')) {
      return 'tangerine';
    }
    return 'tangerine';
  }

  // ========================================
  // SIMPLII FINANCIAL
  // ========================================

  // Simplii - *Description column is distinctive
  if (
    headerSet.has('date') &&
    (headerSet.has('*description') || headerStr.includes('*description'))
  ) {
    return 'simplii';
  }

  // Simplii Financial generic detection
  if (
    headerStr.includes('simplii') ||
    (headerSet.has('date') &&
      headerSet.has('description') &&
      headerSet.has('debit') &&
      headerSet.has('credit') &&
      !headerSet.has('transaction date')) // Differentiate from other banks
  ) {
    return 'simplii';
  }

  // ========================================
  // DESJARDINS (Quebec)
  // ========================================

  // Desjardins French - "Date de l'opération" or "Retrait/Dépôt"
  if (
    headerStr.includes("date de l'opération") ||
    (headerSet.has('retrait') && headerSet.has('dépôt'))
  ) {
    return 'desjardinsFR';
  }

  // Desjardins English
  if (
    headerStr.includes('desjardins') ||
    (headerSet.has('date') &&
      headerSet.has('description') &&
      headerSet.has('withdrawal') &&
      headerSet.has('deposit') &&
      !headerSet.has('balance')) // Desjardins often doesn't have balance
  ) {
    return 'desjardinsEN';
  }

  // Home Trust - Debit/Credit column is very specific
  if (
    headerStr.includes('debit/credit') ||
    (headerSet.has('date') && headerSet.has('details') && headerSet.has('debit/credit'))
  ) {
    return 'homeTrust';
  }

  // ========================================
  // AMERICAN BANKS
  // ========================================

  // Chase Credit Card - Transaction Date + Post Date + Category + Type
  if (
    headerSet.has('transaction date') &&
    headerSet.has('post date') &&
    headerSet.has('category') &&
    headerSet.has('type')
  ) {
    return 'chaseCredit';
  }

  // Chase Checking - Details + Posting Date + Check or Slip #
  if (
    headerSet.has('posting date') &&
    headerSet.has('details') &&
    (headerSet.has('check or slip #') || headerSet.has('balance'))
  ) {
    return 'chaseChecking';
  }

  // Chase Business - Transaction Date + Post Date + Type (no Category)
  if (
    headerSet.has('transaction date') &&
    headerSet.has('post date') &&
    headerSet.has('type') &&
    !headerSet.has('category')
  ) {
    return 'chaseBusiness';
  }

  // Bank of America - Posted Date + Payee
  if (
    (headerSet.has('posted date') || headerSet.has('posting date')) &&
    headerSet.has('payee')
  ) {
    if (headerSet.has('address')) {
      return 'bankOfAmericaCredit';
    }
    return 'bankOfAmerica';
  }

  // Wells Fargo Credit Card - Transaction Date + Post Date + Category
  if (
    headerSet.has('transaction date') &&
    headerSet.has('post date') &&
    headerSet.has('category') &&
    !headerSet.has('type') // Differentiate from Chase
  ) {
    return 'wellsFargoCredit';
  }

  // Wells Fargo Checking - Check for bank name or headerless format
  if (
    headerStr.includes('wells fargo') ||
    (headerSet.has('date') && headerSet.has('amount') && headerStr.includes('wells'))
  ) {
    return headerSet.has('date') ? 'wellsFargoHeader' : 'wellsFargo';
  }

  // Citibank Credit Card - Status + Date + Debit + Credit
  if (
    headerSet.has('status') &&
    headerSet.has('date') &&
    headerSet.has('debit') &&
    headerSet.has('credit')
  ) {
    return 'citibank';
  }

  // Citibank Checking - Date + Description + Debit + Credit + Balance (no Status)
  if (
    headerSet.has('date') &&
    headerSet.has('description') &&
    headerSet.has('debit') &&
    headerSet.has('credit') &&
    headerSet.has('balance') &&
    !headerSet.has('status') &&
    !headerSet.has('withdrawals') // Differentiate from PNC
  ) {
    return 'citibankChecking';
  }

  // Citibank generic (bank name in headers)
  if (
    (headerStr.includes('citibank') || headerStr.includes('citi')) &&
    headerSet.has('date') &&
    headerSet.has('description')
  ) {
    return headerSet.has('amount') ? 'citibankSingle' : 'citibank';
  }

  // Capital One - Card No. + Category + Debit/Credit
  if (
    headerSet.has('transaction date') &&
    headerSet.has('card no.') &&
    headerSet.has('category')
  ) {
    return 'capitalOne';
  }

  // Capital One - Debit/Credit split with Posted Date
  if (
    headerSet.has('transaction date') &&
    headerSet.has('posted date') &&
    headerSet.has('debit') &&
    headerSet.has('credit') &&
    !headerSet.has('status') // Differentiate from Citi
  ) {
    return 'capitalOne';
  }

  // Capital One Single Amount
  if (
    headerStr.includes('capital one') &&
    headerSet.has('transaction date') &&
    headerSet.has('amount')
  ) {
    return 'capitalOneSingle';
  }

  // US Bank - Name + Memo + Transaction columns are distinctive
  if (
    headerSet.has('name') &&
    headerSet.has('memo') &&
    headerSet.has('transaction') &&
    headerSet.has('date')
  ) {
    return 'usBank';
  }

  // US Bank Credit Card
  if (
    headerSet.has('transaction date') &&
    headerSet.has('posted date') &&
    headerSet.has('description') &&
    !headerSet.has('category') && // Differentiate from Chase/Wells Fargo
    !headerSet.has('debit') // Differentiate from Capital One
  ) {
    return 'usBankCredit';
  }

  // US Bank - Bank name detection
  if (
    (headerStr.includes('us bank') || headerStr.includes('usbank')) &&
    headerSet.has('date')
  ) {
    return headerSet.has('name') ? 'usBank' : 'usBankAlt';
  }

  // PNC Bank - Withdrawals + Deposits columns
  if (
    headerSet.has('date') &&
    headerSet.has('description') &&
    headerSet.has('withdrawals') &&
    headerSet.has('deposits') &&
    !headerSet.has('transaction date') // Differentiate from CIBC
  ) {
    return 'pnc';
  }

  // PNC Credit Card
  if (
    headerStr.includes('pnc') &&
    headerSet.has('transaction date') &&
    headerSet.has('amount')
  ) {
    return 'pncCredit';
  }

  // Discover Card - "Trans. Date" column is distinctive
  if (headerSet.has('trans. date')) {
    return 'discover';
  }

  // Discover Card - Alternative with Post Date + Category (no Type)
  if (
    headerSet.has('transaction date') &&
    headerSet.has('post date') &&
    headerSet.has('category') &&
    !headerSet.has('type')
  ) {
    // Could be Discover or Wells Fargo Credit - check for bank name
    if (headerStr.includes('discover')) {
      return 'discoverAlt';
    }
    return 'wellsFargoCredit';
  }

  // Discover Bank - Bank name detection
  if (
    headerStr.includes('discover') &&
    headerSet.has('date') &&
    headerSet.has('amount')
  ) {
    return 'discoverBank';
  }

  // American Express - Extended Details or "Appears On Your Statement As"
  if (
    headerSet.has('extended details') ||
    headerStr.includes('appears on your statement')
  ) {
    return 'amex';
  }

  // American Express - Reference + Card Member columns (legacy format)
  if (
    headerSet.has('reference') &&
    headerSet.has('card member') &&
    headerSet.has('card number')
  ) {
    return 'amexOld';
  }

  // American Express - Bank name detection
  if (
    (headerStr.includes('american express') || headerStr.includes('amex')) &&
    headerSet.has('date') &&
    headerSet.has('amount')
  ) {
    return 'amex';
  }

  // Ally Bank - Time column is distinctive
  if (
    headerSet.has('date') &&
    headerSet.has('time') &&
    headerSet.has('type') &&
    headerSet.has('amount')
  ) {
    return 'ally';
  }

  // Navy Federal Credit Union
  if (
    headerStr.includes('navy federal') &&
    headerSet.has('date') &&
    headerSet.has('amount')
  ) {
    return 'navyFederal';
  }

  // USAA
  if (
    headerStr.includes('usaa') &&
    headerSet.has('date') &&
    headerSet.has('amount')
  ) {
    return 'usaa';
  }

  // Charles Schwab - Action + Symbol columns
  if (
    headerSet.has('action') &&
    headerSet.has('symbol') &&
    headerSet.has('date')
  ) {
    return 'schwab';
  }

  // Fidelity
  if (
    headerStr.includes('fidelity') &&
    headerSet.has('date') &&
    headerSet.has('amount')
  ) {
    return 'fidelity';
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
  const lines = content.trim().split('\n');

  // Skip header rows (e.g., BMO has 3 rows before actual headers)
  const startLine = skipRows;

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
      row[header] = values[index] ? values[index].trim() : '';
    });

    // Only add rows that have some data
    if (Object.values(row).some(v => v !== '')) {
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
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === "'" || char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current); // Add the last field
  return result.map((field) => field.replace(/^['"]|['"]$/g, '')); // Remove surrounding quotes
}

/**
 * Find best matching column in CSV row (flexible column name matching)
 * Tries exact match first, then fuzzy matching with common variations
 */
function findColumn(row: CSVRow, targetColumn: string, columnType: 'date' | 'description' | 'amount'): string | null {
  // Try exact match first
  if (row[targetColumn] !== undefined) {
    return row[targetColumn];
  }

  // Build list of column name variations to try
  const keys = Object.keys(row);
  const targetLower = targetColumn.toLowerCase();

  // Define common column name patterns for each type
  const patterns: Record<string, string[]> = {
    date: ['date', 'trans date', 'transaction date', 'post date', 'posting date', 'posted'],
    description: ['description', 'desc', 'details', 'detail', 'memo', 'transaction description'],
    amount: ['amount', 'transaction amount', 'debit/credit', 'debit', 'credit', 'value'],
  };

  // Try fuzzy matching - look for columns that contain key patterns
  for (const pattern of patterns[columnType] || []) {
    const match = keys.find(key => key.toLowerCase().includes(pattern));
    if (match && row[match]) {
      return row[match];
    }
  }

  // Last resort: exact substring match
  const fuzzyMatch = keys.find(key => key.toLowerCase() === targetLower);
  if (fuzzyMatch && row[fuzzyMatch]) {
    return row[fuzzyMatch];
  }

  return null;
}

/**
 * Convert CSV rows to transactions using bank config
 */
export function convertToTransactions(
  rows: CSVRow[],
  bankConfig: BankConfig,
  accountId: string
): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];

  for (const row of rows) {
    try {
      // Use flexible column matching instead of exact lookups
      const dateStr = findColumn(row, bankConfig.dateColumn, 'date');
      const description = findColumn(row, bankConfig.descriptionColumn, 'description');
      const amountStr = findColumn(row, bankConfig.amountColumn, 'amount');

      if (!dateStr || !description || !amountStr) continue;

      // Parse date
      const date = parseDate(dateStr, bankConfig.dateFormat, new Date());
      if (isNaN(date.getTime())) continue;

      // Parse amount
      const amount =
        parseFloat(amountStr.replace(/[$,]/g, '')) *
        (bankConfig.amountMultiplier || 1);
      if (isNaN(amount)) continue;

      transactions.push({
        date,
        description: description.trim(),
        amount,
        isDuplicate: false,
        confidence: 1.0,
      });
    } catch (error) {
      console.error('Error parsing row:', row, error);
    }
  }

  return transactions;
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
      const exactMatch = existingTransactions.find(
        (existing) => existing.fitid === newTx.fitid
      );
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
      const { detectDuplicatesEnhanced } = await import('@/lib/ai/smart-duplicate-detection');
      await detectDuplicatesEnhanced(newTransactions, existingTransactions, true);
      return; // Smart detection handles everything
    } catch (error) {
      console.warn('[CSVParser] Smart detection unavailable, falling back to basic matching:', error);
      // Fall through to basic detection
    }
  }

  // Basic duplicate detection (fallback or when smart detection is disabled)
  for (const newTx of newTransactions) {
    if (newTx.isDuplicate) continue; // Already marked by FITID or smart detection

    for (const existing of existingTransactions) {
      // Same date, same amount, similar description
      const sameDate =
        existing.date.toDateString() === newTx.date.toDateString();
      const sameAmount = Math.abs(existing.amount - newTx.amount) < 0.01;
      const similarDesc = calculateSimilarity(
        existing.description,
        newTx.description
      );

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
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1.0;

  // Simple similarity: count matching words
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
  merchant = merchant.replace(/^\[[A-Z]{2}\]/i, '').trim();

  // Remove common prefixes
  merchant = merchant
    .replace(/^(PURCHASE |DEBIT |CREDIT |PAYMENT |)/i, '')
    .trim();

  // Remove dates and transaction IDs
  merchant = merchant.replace(/\d{2}\/\d{2}\/\d{4}/g, '').trim();
  merchant = merchant.replace(/\d{6,}/g, '').trim();

  // Take first meaningful part (before location info or multiple spaces)
  const parts = merchant.split(/\s{2,}|\t/);
  let result = parts[0].trim();

  // Remove trailing # numbers (e.g., "SAFEWAY #8886" -> "SAFEWAY")
  result = result.replace(/\s+#\d+.*$/, '').trim();

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
    const dateKey = tx.date.toISOString().split('T')[0];
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

export function generateImportSummary(
  transactions: ParsedTransaction[]
): ImportSummary {
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
    expenses: Math.abs(
      amounts.filter((a) => a < 0).reduce((sum, a) => sum + a, 0)
    ),
  };
}
