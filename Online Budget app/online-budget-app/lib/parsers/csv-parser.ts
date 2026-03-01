/**
 * CSV Parser for Bank Statements
 * Supports 50+ bank-specific CSV configurations with fuzzy matching and confidence scoring.
 * Universal CSV converter with smart column detection.
 *
 * Ported from offline Budget App (src/lib/parsers/csv-parser.ts)
 */

import { parse as parseDate } from "date-fns";
import type {
  BankConfig,
  BankDetectionResult,
  CSVRow,
  ColumnMapping,
  ExistingTransaction,
  ImportSummary,
  ParsedTransaction,
} from "./types";

/** Round to cents to avoid floating-point precision errors */
function roundToCents(value: number): number {
  if (!isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

// ============================================================================
// Bank-specific CSV configurations
// ============================================================================

// Bank configs are defined inline here (matching the offline csv-parser.ts).
// For the regional bank config library, see bank-configs.ts.

export const BANK_CONFIGS: Record<string, BankConfig> = {
  // ========================================
  // CANADIAN BANKS
  // ========================================

  bmo: {
    name: "BMO",
    dateColumn: "Date Posted",
    descriptionColumn: "Description",
    amountColumn: "Transaction Amount",
    dateFormat: "yyyyMMdd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 3,
  },

  homeTrust: {
    name: "Home Trust",
    dateColumn: "Date",
    descriptionColumn: "Details",
    amountColumn: "Debit/Credit",
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  homeTrustVisa: {
    name: "Home Trust Visa",
    dateColumn: "Trans Date",
    descriptionColumn: "Merchant Name",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  genericCreditCard: {
    name: "Credit Card (Generic)",
    dateColumn: "Trans Date",
    descriptionColumn: "Merchant Name",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  tdChecking: {
    name: "TD Canada Trust (Checking)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Withdrawals",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  tdCreditCard: {
    name: "TD Canada Trust (Credit Card)",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  tdBusiness: {
    name: "TD Canada Trust (Business)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Debit",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

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

  tdSplit: {
    name: "TD Canada Trust (Outflow/Inflow)",
    dateColumn: "Date",
    descriptionColumn: "Payee",
    amountColumn: "Outflow",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  rbcStandard: {
    name: "RBC (Standard)",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description 1",
    amountColumn: "CAD$",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  rbcSimplified: {
    name: "RBC (Simplified)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Withdrawals",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

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

  rbcSplit: {
    name: "RBC (Debit/Credit Split)",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description 1",
    amountColumn: "Debit",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 1,
  },

  scotiabank: {
    name: "Scotiabank",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Withdrawal",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

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

  cibc: {
    name: "CIBC",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Debit",
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

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

  tangerine: {
    name: "Tangerine",
    dateColumn: "Date",
    descriptionColumn: "Name",
    amountColumn: "Amount",
    dateFormat: "M/d/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

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

  simplii: {
    name: "Simplii Financial",
    dateColumn: "Date",
    descriptionColumn: "*Description",
    amountColumn: "Debit",
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

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

  desjardins: {
    name: "Desjardins",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Retrait",
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  desjardinsFR: {
    name: "Desjardins (Fran\u00E7ais)",
    dateColumn: "Date de l'op\u00E9ration",
    descriptionColumn: "Description",
    amountColumn: "Retrait",
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

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

  chaseCredit: {
    name: "Chase Credit Card",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  chaseChecking: {
    name: "Chase Checking",
    dateColumn: "Posting Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

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

  bankOfAmerica: {
    name: "Bank of America",
    dateColumn: "Posted Date",
    descriptionColumn: "Payee",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 7,
  },

  bankOfAmericaCredit: {
    name: "Bank of America Credit Card",
    dateColumn: "Posted Date",
    descriptionColumn: "Payee",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

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

  wellsFargo: {
    name: "Wells Fargo",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: 1,
    hasHeader: false,
    skipRows: 0,
  },

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

  citibank: {
    name: "Citibank",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Debit",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

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

  capitalOne: {
    name: "Capital One",
    dateColumn: "Transaction Date",
    descriptionColumn: "Description",
    amountColumn: "Debit",
    dateFormat: "yyyy-MM-dd",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

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

  pnc: {
    name: "PNC Bank",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Withdrawals",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

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

  discover: {
    name: "Discover Card",
    dateColumn: "Trans. Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

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

  amex: {
    name: "American Express",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yyyy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  amexOld: {
    name: "American Express (Legacy)",
    dateColumn: "Date",
    descriptionColumn: "Description",
    amountColumn: "Amount",
    dateFormat: "MM/dd/yy",
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

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

// ============================================================================
// ENHANCED BANK DETECTION WITH FUZZY MATCHING
// ============================================================================

/**
 * Calculate fuzzy string similarity using Levenshtein distance
 * Returns 0-1 where 1 is exact match, 0 is completely different
 */
function fuzzyMatch(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1.0;

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
    matrix[0]![j] = j;
  }

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i]![j] = Math.min(
        matrix[i - 1]![j]! + 1,
        matrix[i]![j - 1]! + 1,
        matrix[i - 1]![j - 1]! + cost
      );
    }
  }

  const maxLength = Math.max(s1.length, s2.length);
  const distance = matrix[s1.length]![s2.length]!;
  return 1 - distance / maxLength;
}

/**
 * Enhanced bank detection with confidence scoring and fuzzy matching
 */
export function detectBankWithConfidence(headers: string[]): BankDetectionResult {
  const headerStr = headers.join(",").toLowerCase().trim();
  const headerSet = new Set(headers.map((h) => h.toLowerCase().trim()));

  const bankScores = new Map<string, { score: number; reasons: string[] }>();

  for (const bankKey of Object.keys(BANK_CONFIGS)) {
    bankScores.set(bankKey, { score: 0, reasons: [] });
  }

  for (const [bankKey, config] of Object.entries(BANK_CONFIGS)) {
    let score = 0;
    const reasons: string[] = [];

    // 1. Check for exact column name matches
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

    if (dateMatch && descMatch && amountMatch) {
      score = 95;
      reasons.push("All core columns match exactly");
    }

    // 2. Fuzzy column name matching
    if (!dateMatch) {
      for (const header of headers) {
        const similarity = fuzzyMatch(header, config.dateColumn);
        if (similarity > 0.8) {
          score += 15 * similarity;
          reasons.push(
            `Fuzzy date match: "${header}" ~ "${config.dateColumn}" (${(similarity * 100).toFixed(0)}%)`
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
            `Fuzzy desc match: "${header}" ~ "${config.descriptionColumn}" (${(similarity * 100).toFixed(0)}%)`
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
            `Fuzzy amount match: "${header}" ~ "${config.amountColumn}" (${(similarity * 100).toFixed(0)}%)`
          );
          break;
        }
      }
    }

    // 3. Bank-specific signature patterns
    const bankName = config.name.toLowerCase();
    if (headerStr.includes(bankName)) {
      score += 10;
      reasons.push(`Bank name in headers: "${bankName}"`);
    }

    // BMO specific
    if (bankKey === "bmo" && headerStr.includes("first bank card")) {
      score += 15;
      reasons.push('BMO signature: "First Bank Card"');
    }

    // TD specific
    if (bankKey === "tdSplit" && headerSet.has("outflow") && headerSet.has("inflow")) {
      score += 20;
      reasons.push("TD signature: Outflow/Inflow columns");
    }
    if (
      bankKey === "tdChecking" &&
      headerSet.has("withdrawals") &&
      headerSet.has("deposits") &&
      headerSet.has("balance")
    ) {
      score += 25;
      reasons.push("TD Checking signature: Withdrawals/Deposits/Balance columns");
    }
    if (
      bankKey === "tdCreditCard" &&
      headerSet.has("transaction date") &&
      headerSet.has("posting date")
    ) {
      score += 20;
      reasons.push("TD Credit Card signature: Transaction Date + Posting Date");
    }
    if (
      bankKey === "tdBusiness" &&
      headerSet.has("reference number") &&
      headerSet.has("debit") &&
      headerSet.has("credit")
    ) {
      score += 25;
      reasons.push("TD Business signature: Reference Number + Debit/Credit columns");
    }

    // RBC specific
    if (
      bankKey.startsWith("rbc") &&
      (headerSet.has("description 1") || headerSet.has("description1"))
    ) {
      score += 15;
      reasons.push('RBC signature: "Description 1"');
    }
    if (bankKey === "rbcStandard" && (headerSet.has("cad$") || headerSet.has("usd$"))) {
      score += 25;
      reasons.push("RBC Standard signature: CAD$/USD$ currency columns");
    }
    if (
      bankKey === "rbcSimplified" &&
      headerSet.has("withdrawals") &&
      headerSet.has("deposits") &&
      !headerSet.has("balance")
    ) {
      score += 20;
      reasons.push("RBC Simplified signature: Withdrawals/Deposits without Balance");
    }

    // Scotiabank specific
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

    // CIBC specific
    if (bankKey === "cibc" && headerSet.has("debit") && headerSet.has("credit")) {
      score += 15;
      reasons.push("CIBC signature: Debit/Credit columns");
    }
    if (bankKey === "cibcSplit" && headerSet.has("withdrawals") && headerSet.has("deposits")) {
      score += 18;
      reasons.push("CIBC Split signature: Withdrawals/Deposits");
    }

    // Tangerine specific
    if (bankKey.startsWith("tangerine") && headerSet.has("name") && headerSet.has("amount")) {
      score += 25;
      reasons.push("Tangerine signature: Name + Amount columns");
    }

    // Simplii specific
    if (
      bankKey.startsWith("simplii") &&
      (headerSet.has("*description") || headerStr.includes("*description"))
    ) {
      score += 25;
      reasons.push("Simplii signature: *Description column");
    }

    // Desjardins specific
    if (
      bankKey === "desjardinsFR" &&
      (headerStr.includes("date de l'op\u00E9ration") || headerSet.has("retrait"))
    ) {
      score += 30;
      reasons.push("Desjardins French signature: French column names");
    }
    if (bankKey === "desjardinsEN" && headerSet.has("withdrawal") && headerSet.has("deposit")) {
      score += 18;
      reasons.push("Desjardins English signature: Withdrawal/Deposit");
    }

    // US BANK SPECIFIC PATTERNS
    if (
      bankKey === "chaseCredit" &&
      headerSet.has("post date") &&
      headerSet.has("category") &&
      headerSet.has("type")
    ) {
      score += 25;
      reasons.push("Chase Credit signature: Post Date + Category + Type");
    }
    if (bankKey === "chaseChecking" && headerSet.has("details") && headerSet.has("posting date")) {
      score += 25;
      reasons.push("Chase Checking signature: Details + Posting Date");
    }
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
    if (bankKey === "bankOfAmerica" && headerSet.has("posted date") && headerSet.has("payee")) {
      score += 25;
      reasons.push("BofA signature: Posted Date + Payee");
    }
    if (
      bankKey === "bankOfAmericaCredit" &&
      headerSet.has("posted date") &&
      headerSet.has("payee") &&
      headerSet.has("address")
    ) {
      score += 22;
      reasons.push("BofA Credit signature: Posted Date + Payee + Address");
    }
    if (
      bankKey === "wellsFargoCredit" &&
      headerSet.has("transaction date") &&
      headerSet.has("post date") &&
      headerSet.has("category")
    ) {
      score += 25;
      reasons.push("Wells Fargo Credit signature: Transaction Date + Post Date + Category");
    }
    if (
      bankKey === "citibank" &&
      headerSet.has("status") &&
      headerSet.has("debit") &&
      headerSet.has("credit")
    ) {
      score += 25;
      reasons.push("Citibank signature: Status + Debit/Credit columns");
    }
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
    if (bankKey === "capitalOne" && headerSet.has("card no.") && headerSet.has("category")) {
      score += 25;
      reasons.push("Capital One signature: Card No. + Category");
    }
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
    if (
      bankKey === "usBank" &&
      headerSet.has("name") &&
      headerSet.has("memo") &&
      headerSet.has("transaction")
    ) {
      score += 25;
      reasons.push("US Bank signature: Name + Memo + Transaction");
    }
    if (
      bankKey === "usBankCredit" &&
      headerSet.has("transaction date") &&
      headerSet.has("posted date") &&
      !headerSet.has("category")
    ) {
      score += 18;
      reasons.push("US Bank Credit signature: Transaction Date + Posted Date");
    }
    if (bankKey === "pnc" && headerSet.has("withdrawals") && headerSet.has("deposits")) {
      score += 25;
      reasons.push("PNC signature: Withdrawals/Deposits columns");
    }
    if (bankKey === "discover" && headerSet.has("trans. date")) {
      score += 30;
      reasons.push('Discover signature: "Trans. Date" column');
    }
    if (
      bankKey === "discoverAlt" &&
      headerSet.has("post date") &&
      headerSet.has("category") &&
      !headerSet.has("type")
    ) {
      score += 18;
      reasons.push("Discover Alt signature: Post Date + Category");
    }
    if (
      bankKey === "amex" &&
      (headerSet.has("extended details") || headerStr.includes("appears on your statement"))
    ) {
      score += 30;
      reasons.push("Amex signature: Extended Details / Statement As");
    }
    if (bankKey === "amexOld" && headerSet.has("reference") && headerSet.has("card member")) {
      score += 25;
      reasons.push("Amex Legacy signature: Reference + Card Member");
    }
    if (bankKey === "ally" && headerSet.has("time") && headerSet.has("type")) {
      score += 25;
      reasons.push("Ally signature: Time + Type columns");
    }
    if (bankKey === "navyFederal" && headerStr.includes("navy federal")) {
      score += 30;
      reasons.push("Navy Federal signature: Bank name in headers");
    }
    if (bankKey === "usaa" && headerStr.includes("usaa")) {
      score += 30;
      reasons.push("USAA signature: Bank name in headers");
    }
    if (bankKey === "schwab" && headerSet.has("action") && headerSet.has("symbol")) {
      score += 25;
      reasons.push("Schwab signature: Action + Symbol columns");
    }
    if (bankKey === "fidelity" && headerStr.includes("fidelity")) {
      score += 30;
      reasons.push("Fidelity signature: Bank name in headers");
    }
    if (bankKey === "homeTrust" && headerStr.includes("debit/credit")) {
      score += 18;
      reasons.push('Home Trust signature: "Debit/Credit" column');
    }
    if (
      (bankKey === "homeTrustVisa" || bankKey === "genericCreditCard") &&
      headerSet.has("trans date") &&
      headerSet.has("merchant name")
    ) {
      score += 35;
      reasons.push("Credit Card signature: Trans Date + Merchant Name");
      if (headerSet.has("mcc code") || headerSet.has("mcc description")) {
        score += 15;
        reasons.push("MCC columns present (credit card export)");
      }
      if (headerSet.has("cardholder name")) {
        score += 10;
        reasons.push("Cardholder Name column present");
      }
    }

    // 4. Split format detection
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

  // Find best match
  const sortedBanks = Array.from(bankScores.entries())
    .map(([bank, { score, reasons }]) => ({ bank, score, reasons }))
    .sort((a, b) => b.score - a.score);

  const topMatch = sortedBanks[0]!;
  const alternatives = sortedBanks
    .slice(1, 4)
    .filter((alt) => alt.score > 20)
    .map((alt) => ({
      bank: alt.bank,
      confidence: Math.min(alt.score / 100, 1.0),
      reason: alt.reasons.join("; "),
    }));

  let detectionMethod: "exact" | "fuzzy" | "pattern" | "none" = "none";
  if (topMatch.score >= 90) {
    detectionMethod = "exact";
  } else if (topMatch.score >= 60) {
    detectionMethod = "fuzzy";
  } else if (topMatch.score >= 30) {
    detectionMethod = "pattern";
  }

  if (topMatch.score >= 30) {
    return {
      bank: topMatch.bank,
      confidence: Math.min(topMatch.score / 100, 1.0),
      alternatives: alternatives.length > 0 ? alternatives : undefined,
      detectionMethod,
    };
  }

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
 * @deprecated Use detectBankWithConfidence() for enhanced detection
 */
export function detectBank(headers: string[]): string | null {
  const headerStr = headers.join(",").toLowerCase().trim();
  const headerSet = new Set(headers.map((h) => h.toLowerCase().trim()));

  // CANADIAN BANKS
  if (
    (headerStr.includes("date posted") || headerStr.includes("first bank card")) &&
    (headerStr.includes("transaction amount") || headerStr.includes("transaction type"))
  ) {
    return "bmo";
  }

  // TD CANADA TRUST
  if (
    headerSet.has("transaction date") &&
    headerSet.has("posting date") &&
    headerSet.has("description") &&
    headerSet.has("amount") &&
    !headerSet.has("category")
  ) {
    return "tdCreditCard";
  }
  if (
    headerSet.has("date") &&
    headerSet.has("description") &&
    headerSet.has("withdrawals") &&
    headerSet.has("deposits") &&
    headerSet.has("balance") &&
    !headerSet.has("transaction date")
  ) {
    return "tdChecking";
  }
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
  if (headerSet.has("outflow") && headerSet.has("inflow")) {
    return "tdSplit";
  }
  if (
    headerSet.has("date") &&
    (headerSet.has("payee") || headerSet.has("description")) &&
    !headerStr.includes("posted")
  ) {
    if (headerStr.includes("account activity") || headerStr.includes("accountactivity")) {
      return "td";
    }
  }

  // RBC
  if (
    headerSet.has("account type") &&
    headerSet.has("account number") &&
    headerSet.has("transaction date") &&
    (headerSet.has("description 1") || headerSet.has("description1")) &&
    (headerSet.has("cad$") || headerSet.has("usd$"))
  ) {
    return "rbcStandard";
  }
  if (
    headerSet.has("date") &&
    headerSet.has("description") &&
    headerSet.has("withdrawals") &&
    headerSet.has("deposits") &&
    !headerSet.has("balance") &&
    !headerSet.has("reference number")
  ) {
    return "rbcSimplified";
  }
  if (
    headerSet.has("transaction date") &&
    (headerSet.has("description 1") || headerSet.has("description1"))
  ) {
    if (headerSet.has("debit") && headerSet.has("credit")) {
      return "rbcSplit";
    }
    return "rbc";
  }

  // SCOTIABANK
  if (
    headerSet.has("date") &&
    headerSet.has("description") &&
    (headerSet.has("withdrawal") || headerSet.has("deposit"))
  ) {
    return "scotiabank";
  }
  if (
    headerSet.has("date") &&
    headerSet.has("description") &&
    headerSet.has("debit") &&
    headerSet.has("credit") &&
    headerSet.has("balance") &&
    !headerSet.has("reference number")
  ) {
    return "scotiabankSplit";
  }
  if (headerStr.includes("scotiabank") && headerSet.has("date") && headerSet.has("amount")) {
    return "scotiabankSingle";
  }

  // CIBC
  if (
    headerSet.has("transaction date") &&
    (headerSet.has("withdrawals") || headerSet.has("deposits"))
  ) {
    return "cibcSplit";
  }
  if (
    headerSet.has("date") &&
    headerSet.has("description") &&
    headerSet.has("debit") &&
    headerSet.has("credit") &&
    !headerSet.has("withdrawal") &&
    !headerSet.has("reference number")
  ) {
    return "cibc";
  }
  if (headerStr.includes("cibc") && headerSet.has("date") && headerSet.has("amount")) {
    return "cibcSingle";
  }

  // TANGERINE
  if (
    headerSet.has("date") &&
    headerSet.has("name") &&
    headerSet.has("amount") &&
    !headerSet.has("card")
  ) {
    return "tangerine";
  }

  // SIMPLII FINANCIAL
  if (
    headerSet.has("date") &&
    (headerSet.has("*description") || headerStr.includes("*description"))
  ) {
    return "simplii";
  }
  if (
    headerStr.includes("simplii") ||
    (headerSet.has("date") &&
      headerSet.has("description") &&
      headerSet.has("debit") &&
      headerSet.has("credit") &&
      !headerSet.has("transaction date"))
  ) {
    return "simplii";
  }

  // DESJARDINS
  if (
    headerStr.includes("date de l'op\u00E9ration") ||
    (headerSet.has("retrait") && headerSet.has("d\u00E9p\u00F4t"))
  ) {
    return "desjardinsFR";
  }
  if (
    headerStr.includes("desjardins") ||
    (headerSet.has("date") &&
      headerSet.has("description") &&
      headerSet.has("withdrawal") &&
      headerSet.has("deposit") &&
      !headerSet.has("balance"))
  ) {
    return "desjardinsEN";
  }

  // HOME TRUST
  if (
    headerStr.includes("debit/credit") ||
    (headerSet.has("date") && headerSet.has("details") && headerSet.has("debit/credit"))
  ) {
    return "homeTrust";
  }
  if (headerSet.has("trans date") && headerSet.has("merchant name") && headerSet.has("amount")) {
    if (headerSet.has("mcc code") || headerSet.has("mcc description")) {
      return "homeTrustVisa";
    }
    return "genericCreditCard";
  }

  // AMERICAN BANKS
  if (
    headerSet.has("transaction date") &&
    headerSet.has("post date") &&
    headerSet.has("category") &&
    headerSet.has("type")
  ) {
    return "chaseCredit";
  }
  if (
    headerSet.has("posting date") &&
    headerSet.has("details") &&
    (headerSet.has("check or slip #") || headerSet.has("balance"))
  ) {
    return "chaseChecking";
  }
  if (
    headerSet.has("transaction date") &&
    headerSet.has("post date") &&
    headerSet.has("type") &&
    !headerSet.has("category")
  ) {
    return "chaseBusiness";
  }
  if ((headerSet.has("posted date") || headerSet.has("posting date")) && headerSet.has("payee")) {
    if (headerSet.has("address")) {
      return "bankOfAmericaCredit";
    }
    return "bankOfAmerica";
  }
  if (
    headerSet.has("transaction date") &&
    headerSet.has("post date") &&
    headerSet.has("category") &&
    !headerSet.has("type")
  ) {
    if (headerStr.includes("discover")) {
      return "discoverAlt";
    }
    return "wellsFargoCredit";
  }
  if (
    headerStr.includes("wells fargo") ||
    (headerSet.has("date") && headerSet.has("amount") && headerStr.includes("wells"))
  ) {
    return headerSet.has("date") ? "wellsFargoHeader" : "wellsFargo";
  }
  if (
    headerSet.has("status") &&
    headerSet.has("date") &&
    headerSet.has("debit") &&
    headerSet.has("credit")
  ) {
    return "citibank";
  }
  if (
    headerSet.has("date") &&
    headerSet.has("description") &&
    headerSet.has("debit") &&
    headerSet.has("credit") &&
    headerSet.has("balance") &&
    !headerSet.has("status") &&
    !headerSet.has("withdrawals")
  ) {
    return "citibankChecking";
  }
  if (
    (headerStr.includes("citibank") || headerStr.includes("citi")) &&
    headerSet.has("date") &&
    headerSet.has("description")
  ) {
    return headerSet.has("amount") ? "citibankSingle" : "citibank";
  }
  if (headerSet.has("transaction date") && headerSet.has("card no.") && headerSet.has("category")) {
    return "capitalOne";
  }
  if (
    headerSet.has("transaction date") &&
    headerSet.has("posted date") &&
    headerSet.has("debit") &&
    headerSet.has("credit") &&
    !headerSet.has("status")
  ) {
    return "capitalOne";
  }
  if (
    headerStr.includes("capital one") &&
    headerSet.has("transaction date") &&
    headerSet.has("amount")
  ) {
    return "capitalOneSingle";
  }
  if (
    headerSet.has("name") &&
    headerSet.has("memo") &&
    headerSet.has("transaction") &&
    headerSet.has("date")
  ) {
    return "usBank";
  }
  if (
    headerSet.has("transaction date") &&
    headerSet.has("posted date") &&
    headerSet.has("description") &&
    !headerSet.has("category") &&
    !headerSet.has("debit")
  ) {
    return "usBankCredit";
  }
  if ((headerStr.includes("us bank") || headerStr.includes("usbank")) && headerSet.has("date")) {
    return headerSet.has("name") ? "usBank" : "usBankAlt";
  }
  if (
    headerSet.has("date") &&
    headerSet.has("description") &&
    headerSet.has("withdrawals") &&
    headerSet.has("deposits") &&
    !headerSet.has("transaction date")
  ) {
    return "pnc";
  }
  if (headerStr.includes("pnc") && headerSet.has("transaction date") && headerSet.has("amount")) {
    return "pncCredit";
  }
  if (headerSet.has("trans. date")) {
    return "discover";
  }
  if (headerStr.includes("discover") && headerSet.has("date") && headerSet.has("amount")) {
    return "discoverBank";
  }
  if (headerSet.has("extended details") || headerStr.includes("appears on your statement")) {
    return "amex";
  }
  if (headerSet.has("reference") && headerSet.has("card member") && headerSet.has("card number")) {
    return "amexOld";
  }
  if (
    (headerStr.includes("american express") || headerStr.includes("amex")) &&
    headerSet.has("date") &&
    headerSet.has("amount")
  ) {
    return "amex";
  }
  if (
    headerSet.has("date") &&
    headerSet.has("time") &&
    headerSet.has("type") &&
    headerSet.has("amount")
  ) {
    return "ally";
  }
  if (headerStr.includes("navy federal") && headerSet.has("date") && headerSet.has("amount")) {
    return "navyFederal";
  }
  if (headerStr.includes("usaa") && headerSet.has("date") && headerSet.has("amount")) {
    return "usaa";
  }
  if (headerSet.has("action") && headerSet.has("symbol") && headerSet.has("date")) {
    return "schwab";
  }
  if (headerStr.includes("fidelity") && headerSet.has("date") && headerSet.has("amount")) {
    return "fidelity";
  }

  return null;
}

/**
 * Wrapper for backward compatibility - uses enhanced detection
 */
export function detectBankLegacy(headers: string[]): string | null {
  const result = detectBankWithConfidence(headers);
  return result.confidence >= 0.3 ? result.bank : null;
}

// ============================================================================
// CSV Parsing
// ============================================================================

/**
 * Parse CSV file content with improved handling
 */
export function parseCSVContent(content: string, skipRows: number = 0): CSVRow[] {
  // Strip UTF-8 BOM if present
  const cleanContent = content.replace(/^\uFEFF/, "");
  const lines = cleanContent.trim().split("\n");

  // Skip header rows (e.g., BMO has 3 rows before actual headers)
  let startLine = skipRows;
  while (startLine < lines.length && !lines[startLine]!.trim()) {
    startLine++;
  }

  if (lines.length < startLine + 2) return [];

  const headerLine = lines[startLine]!;
  const headers = parseCSVLine(headerLine).map((h) => h.trim());

  const rows: CSVRow[] = [];

  for (let i = startLine + 1; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const row: CSVRow = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ? values[index]!.trim() : "";
    });

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

  result.push(current);
  return result.map((field) => field.replace(/^['"]|['"]$/g, ""));
}

/**
 * Find best matching column in CSV row (flexible column name matching)
 */
function findColumn(
  row: CSVRow,
  targetColumn: string,
  columnType: "date" | "description" | "amount"
): string | null {
  if (row[targetColumn] !== undefined) {
    return row[targetColumn]!;
  }

  const keys = Object.keys(row);

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

  for (const pattern of patterns[columnType] ?? []) {
    const match = keys.find((key) => key.toLowerCase().includes(pattern));
    if (match && row[match]) {
      return row[match]!;
    }
  }

  const targetLower = targetColumn.toLowerCase();
  const fuzzyMatchResult = keys.find((key) => key.toLowerCase() === targetLower);
  if (fuzzyMatchResult && row[fuzzyMatchResult]) {
    return row[fuzzyMatchResult]!;
  }

  return null;
}

/**
 * Find a column by name with fuzzy matching
 */
function findColumnByName(row: CSVRow, columnName: string): string | null {
  const keys = Object.keys(row);
  const targetLower = columnName.toLowerCase();

  const exactMatch = keys.find((key) => key.toLowerCase() === targetLower);
  if (exactMatch) {
    return row[exactMatch]!;
  }

  const partialMatch = keys.find((key) => key.toLowerCase().includes(targetLower));
  if (partialMatch) {
    return row[partialMatch]!;
  }

  return null;
}

// ============================================================================
// Transaction Conversion
// ============================================================================

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

  // Detect split-column format
  const splitColumnPairs: Record<string, string> = {
    withdrawals: "deposits",
    withdrawal: "deposit",
    debit: "credit",
    outflow: "inflow",
    retrait: "d\u00E9p\u00F4t",
  };

  const amountColLower = bankConfig.amountColumn.toLowerCase();
  const isSplitFormat = Object.keys(splitColumnPairs).includes(amountColLower);
  const complementColumn = isSplitFormat ? splitColumnPairs[amountColLower]! : null;

  for (const row of rows) {
    try {
      const dateStr = findColumn(row, bankConfig.dateColumn, "date");
      const description = findColumn(row, bankConfig.descriptionColumn, "description");

      if (!dateStr) continue;
      if (!description) continue;

      const date = parseDate(dateStr, bankConfig.dateFormat, new Date());
      if (isNaN(date.getTime())) continue;

      let amount = 0;

      if (isSplitFormat && complementColumn) {
        const primaryStr = findColumn(row, bankConfig.amountColumn, "amount") ?? "";
        const complementStr = findColumnByName(row, complementColumn) ?? "";

        let cleanedPrimary = primaryStr.replace(/[$,\s]/g, "");
        let cleanedComplement = complementStr.replace(/[$,\s]/g, "");

        if (cleanedPrimary.includes("(") && cleanedPrimary.includes(")")) {
          cleanedPrimary = `-${cleanedPrimary.replace(/[()]/g, "")}`;
        }
        if (cleanedComplement.includes("(") && cleanedComplement.includes(")")) {
          cleanedComplement = `-${cleanedComplement.replace(/[()]/g, "")}`;
        }

        const primaryVal = parseFloat(cleanedPrimary) || 0;
        const complementVal = parseFloat(cleanedComplement) || 0;

        if (Math.abs(complementVal) > 0.001 && Math.abs(primaryVal) > 0.001) {
          amount = roundToCents(Math.abs(complementVal) - Math.abs(primaryVal));
        } else if (Math.abs(complementVal) > 0.001) {
          amount = roundToCents(Math.abs(complementVal));
        } else if (Math.abs(primaryVal) > 0.001) {
          amount = roundToCents(-Math.abs(primaryVal));
        } else {
          continue;
        }
      } else {
        const amountStr = findColumn(row, bankConfig.amountColumn, "amount");
        if (!amountStr) continue;

        let cleanedAmount = amountStr.replace(/[$,\s]/g, "");
        if (cleanedAmount.includes("(") && cleanedAmount.includes(")")) {
          cleanedAmount = `-${cleanedAmount.replace(/[()]/g, "")}`;
        }

        const parsedAmount = parseFloat(cleanedAmount) * (bankConfig.amountMultiplier ?? 1);
        amount = roundToCents(parsedAmount);
      }

      if (isNaN(amount)) continue;

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

  return transactions;
}

// ============================================================================
// Simple Column Detection (for universal converter)
// ============================================================================

function simpleColumnDetection(headers: string[], sampleRows: CSVRow[]): ColumnMapping | null {
  let dateColumn: string | null = null;
  let descriptionColumn: string | null = null;
  let amountColumn: string | null = null;
  let debitColumn: string | null = null;
  let creditColumn: string | null = null;
  let dateFormat: string | undefined;

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
    const sampleDate = String(sampleRows[0]![dateColumn] ?? "").trim();
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(sampleDate)) {
      dateFormat = "MM/dd/yyyy";
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(sampleDate)) {
      dateFormat = "yyyy-MM-dd";
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(sampleDate)) {
      dateFormat = "MM-dd-yyyy";
    } else if (/^\d{8}$/.test(sampleDate)) {
      dateFormat = "yyyyMMdd";
    }
  }

  const hasAmount = amountColumn || debitColumn || creditColumn;

  if (dateColumn && hasAmount) {
    return {
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
  }

  // Last resort: try to detect by analyzing data values
  for (const header of headers) {
    if (sampleRows.length === 0) break;

    const sampleValue = String(sampleRows[0]![header] ?? "").trim();

    if (!dateColumn && /\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}/.test(sampleValue)) {
      dateColumn = header;
    }

    if (!amountColumn) {
      const cleanedValue = sampleValue.replace(/[()]/g, "");
      const headerLower = header.toLowerCase();
      const isCodeColumn =
        headerLower.includes("mcc") ||
        headerLower.includes("code") ||
        headerLower.includes("reference");
      const isPureCode = /^\d{4,5}$/.test(cleanedValue);
      const hasMoneyIndicator =
        /[$\u20AC\u00A3\u00A5()]/.test(sampleValue) || /\.\d{2}$/.test(cleanedValue);

      if (
        /^[$\u20AC\u00A3\u00A5]?[\d,.-]+[$\u20AC\u00A3\u00A5]?$/.test(cleanedValue) &&
        !isCodeColumn &&
        !isPureCode &&
        hasMoneyIndicator
      ) {
        amountColumn = header;
      }
    }

    if (!descriptionColumn && sampleValue.length > 3 && /[a-zA-Z]{2,}/.test(sampleValue)) {
      if (header !== dateColumn && header !== amountColumn) {
        descriptionColumn = header;
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

  return null;
}

// ============================================================================
// Universal Transaction Converter
// ============================================================================

/**
 * Universal Transaction Converter
 * Converts CSV rows to transactions using smart column detection
 * Works with any bank format worldwide without predefined configs
 */
export async function convertToTransactionsUniversal(
  rows: CSVRow[],
  _accountId: string
): Promise<{
  transactions: ParsedTransaction[];
  mapping: ColumnMapping | null;
  confidence: number;
}> {
  if (rows.length === 0) {
    return { transactions: [], mapping: null, confidence: 0 };
  }

  const headers = Object.keys(rows[0]!).filter((h) => h.trim());
  const mapping = simpleColumnDetection(headers, rows.slice(0, 10));

  if (!mapping) {
    return { transactions: [], mapping: null, confidence: 0 };
  }

  const transactions: ParsedTransaction[] = [];

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
      // Get date
      let dateStr = mapping.dateColumn ? (row[mapping.dateColumn] ?? null) : null;

      if (!dateStr) {
        for (const header of headers) {
          const val = String(row[header] ?? "").trim();
          if (val && /\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}/.test(val)) {
            dateStr = val;
            break;
          }
        }
      }

      if (!dateStr) continue;

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

      // Get description
      let description = "";
      if (mapping.descriptionColumn) {
        description = String(row[mapping.descriptionColumn] ?? "").trim();
      }
      if (!description) {
        for (const col of potentialDescCols) {
          const val = String(row[col] ?? "").trim();
          if (val && val.length > description.length) {
            description = val;
          }
        }
      }
      if (!description) {
        const textParts: string[] = [];
        for (const header of headers) {
          const val = String(row[header] ?? "").trim();
          if (!val) continue;
          if (/^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}$/.test(val)) continue;
          if (
            /^[$\u20AC\u00A3\u00A5\u20B9]?[\d,.']+[$\u20AC\u00A3\u00A5\u20B9]?$/.test(
              val.replace(/[()+-]/g, "")
            )
          )
            continue;
          if (val.length >= 3) {
            textParts.push(val);
          }
        }
        description = textParts.slice(0, 2).join(" - ") || "Transaction";
      }

      // Parse amount
      let amount = 0;

      if (mapping.amountFormat === "split") {
        const debitStr = mapping.debitColumn ? String(row[mapping.debitColumn] ?? "") : "";
        const creditStr = mapping.creditColumn ? String(row[mapping.creditColumn] ?? "") : "";

        const debitVal = parseAmountUniversal(debitStr);
        const creditVal = parseAmountUniversal(creditStr);

        if (Math.abs(creditVal) > 0.001) {
          amount = Math.abs(creditVal);
        } else if (Math.abs(debitVal) > 0.001) {
          amount = -Math.abs(debitVal);
        } else {
          continue;
        }
      } else {
        let amountStr = mapping.amountColumn ? String(row[mapping.amountColumn] ?? "") : "";

        if (!amountStr || parseAmountUniversal(amountStr) === 0) {
          for (const header of headers) {
            const headerLower = header.toLowerCase();
            if (
              headerLower.includes("mcc") ||
              headerLower.includes("code") ||
              headerLower.includes("reference") ||
              headerLower.includes("number")
            ) {
              continue;
            }
            const val = String(row[header] ?? "").trim();
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

        if (amount === 0) continue;
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

// ============================================================================
// Universal Amount Parsing
// ============================================================================

/**
 * Parse amount from ANY worldwide format
 * Handles all currencies and number formats globally
 */
function parseAmountUniversal(value: string): number {
  if (!value || typeof value !== "string") return 0;

  let str = value.trim();
  if (!str) return 0;

  let isNegative = false;

  // Parentheses indicate negative (accounting format)
  if (str.startsWith("(") && str.endsWith(")")) {
    isNegative = true;
    str = str.slice(1, -1);
  }

  // Leading/trailing minus or special dashes
  if (str.startsWith("-") || str.startsWith("\u2212") || str.startsWith("\u2013")) {
    isNegative = true;
    str = str.slice(1);
  }
  if (str.endsWith("-") || str.endsWith("\u2212") || str.endsWith("\u2013")) {
    isNegative = true;
    str = str.slice(0, -1);
  }

  // CR/DR suffixes
  if (/\s*CR\s*$/i.test(str)) {
    str = str.replace(/\s*CR\s*$/i, "");
  }
  if (/\s*DR\s*$/i.test(str)) {
    isNegative = true;
    str = str.replace(/\s*DR\s*$/i, "");
  }

  // Remove ALL currency symbols
  str = str.replace(
    /[$\u20AC\u00A3\u00A5\u20B9\u20BD\u20A9\u0E3F\u20AB\u20B4\u20B8\u00A2\u20A6\u20B1\u20AD\u20AE\u20B2\u20B5\u20A1\u20A2\u20A3\u20A4\u20A5\u20A7\u20A8\u20AA\u20B0\u20B3\u20B7\u20BA\u20BC\u20BE\u058F\u060B\u09F3\u17DB\u20A0\u20AF\u0192\uFDFC]/g,
    ""
  );

  // Remove ISO 4217 currency codes
  str = str.replace(/\b[A-Z]{3}\b/g, "");

  // Remove common currency abbreviations
  str = str.replace(
    /\b(Rs\.?|Rp\.?|kr\.?|z\u0142|K\u010D|Ft|lei|\u043B\u0432|\u0434\u0435\u043D|din|kn|R\$|S\/|Bs\.?|Q|L|C\$|B\/\.?|RD\$|TT\$|J\$|EC\$|BD\$|BZ\$|GY\$|SR\$|NAf\.?|Afl\.?|AWG|ANG|XCD|BBD|BSD|BMD|KYD|FJD|GYD|JMD|LRD|NAD|SBD|SRD|TTD|XPF|CFP)\b/gi,
    ""
  );

  // Remove spaces
  str = str.replace(/\s+/g, "");

  // Handle Swiss format with apostrophe as thousands separator
  const hasApostrophe = str.includes("'");
  if (hasApostrophe) {
    str = str.replace(/'/g, "");
  }

  const hasComma = str.includes(",");
  const hasPeriod = str.includes(".");

  if (hasComma && hasPeriod) {
    const lastComma = str.lastIndexOf(",");
    const lastPeriod = str.lastIndexOf(".");
    if (lastComma > lastPeriod) {
      str = str.replace(/\./g, "").replace(",", ".");
    } else {
      str = str.replace(/,/g, "");
    }
  } else if (hasComma && !hasPeriod) {
    const parts = str.split(",");
    if (parts.length === 2 && parts[1]!.length <= 2) {
      str = str.replace(",", ".");
    } else if (parts.length === 2 && parts[1]!.length === 3) {
      str = str.replace(/,/g, "");
    } else {
      str = str.replace(/,/g, "");
    }
  } else if (hasPeriod && !hasComma) {
    const parts = str.split(".");
    if (parts.length > 2) {
      str = str.replace(/\./g, "");
    }
  }

  str = str.replace(/[^\d.-]/g, "");

  const num = parseFloat(str);
  if (isNaN(num)) return 0;

  return roundToCents(isNegative ? -Math.abs(num) : num);
}

// ============================================================================
// Duplicate Detection
// ============================================================================

/**
 * Detect duplicate transactions
 */
export async function detectDuplicates(
  newTransactions: ParsedTransaction[],
  existingTransactions: ExistingTransaction[]
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

  // Basic duplicate detection
  for (const newTx of newTransactions) {
    if (newTx.isDuplicate) continue;

    for (const existing of existingTransactions) {
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

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Extract merchant name from description
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

  // Take first meaningful part
  const parts = merchant.split(/\s{2,}|\t/);
  let result = parts[0]!.trim();

  // Remove trailing # numbers
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
    const dateKey = tx.date.toISOString().split("T")[0]!;
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey]!.push(tx);
  }

  return grouped;
}

/**
 * Generate import summary
 */
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
