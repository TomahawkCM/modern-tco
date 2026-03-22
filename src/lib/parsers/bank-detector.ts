/**
 * Bank Detection Module
 *
 * Auto-detects bank format from CSV headers using fuzzy matching
 * and pattern-based scoring. Returns confidence scores and alternatives.
 */

import type { BankConfig } from "./types";
import { ALL_BANK_CONFIGS } from "./bank-configs";

// Use consolidated bank configs
const BANK_CONFIGS: Record<string, BankConfig> = ALL_BANK_CONFIGS;

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
