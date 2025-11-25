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

  // 🔄 TD Canada Trust - Format from bank2ynab, needs verification
  td: {
    name: 'TD Canada Trust',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount', // May use Outflow/Inflow instead
    dateFormat: 'MM/dd/yyyy', // 01/06/2025
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // 🔄 TD with separate columns - Alternative format
  tdSplit: {
    name: 'TD Canada Trust (Split)',
    dateColumn: 'Date',
    descriptionColumn: 'Payee',
    amountColumn: 'Outflow', // Will need special handling for Inflow
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: -1, // Outflow should be negative
    hasHeader: true,
    skipRows: 0,
  },

  // 🔄 RBC (Royal Bank of Canada) - Estimated format
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

  // 🔄 RBC with separate debit/credit - Alternative format
  rbcSplit: {
    name: 'RBC (Split)',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Description 1',
    amountColumn: 'Debit', // Will need special handling for Credit
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: -1, // Debit should be negative
    hasHeader: true,
    skipRows: 1,
  },

  // 🔄 Scotiabank - Highly customizable, common format
  scotiabank: {
    name: 'Scotiabank',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // 🔄 Scotiabank with split columns - Alternative format
  scotiabankSplit: {
    name: 'Scotiabank (Split)',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Debit',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // 🔄 CIBC (Canadian Imperial Bank of Commerce) - Estimated
  cibc: {
    name: 'CIBC',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // 🔄 CIBC with split columns - Alternative format
  cibcSplit: {
    name: 'CIBC (Split)',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Description',
    amountColumn: 'Withdrawals',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: -1,
    hasHeader: true,
    skipRows: 0,
  },

  // 🔄 Tangerine - Modern format estimated
  tangerine: {
    name: 'Tangerine',
    dateColumn: 'Date',
    descriptionColumn: 'Name',
    amountColumn: 'Amount',
    dateFormat: 'yyyy-MM-dd', // 2025-01-06
    amountMultiplier: 1, // Negative for expenses
    hasHeader: true,
    skipRows: 0,
  },

  // 🔄 Simplii Financial (CIBC subsidiary) - Estimated
  simplii: {
    name: 'Simplii Financial',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'yyyy-MM-dd',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ========================================
  // AMERICAN BANKS
  // ========================================

  // 🔄 Bank of America - Format from bank2ynab
  bankOfAmerica: {
    name: 'Bank of America',
    dateColumn: 'Posted Date',
    descriptionColumn: 'Payee',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy', // 01/06/2025
    amountMultiplier: 1, // Negative for expenses
    hasHeader: true,
    skipRows: 7, // BofA has 7 header rows
  },

  // 🔄 Chase Bank - Format from bank2ynab (Credit Card 2017)
  chaseCredit: {
    name: 'Chase Credit Card',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // 🔄 Chase Checking - Estimated format
  chaseChecking: {
    name: 'Chase Checking',
    dateColumn: 'Posting Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // 🔄 Capital One - Format researched
  capitalOne: {
    name: 'Capital One',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Description',
    amountColumn: 'Debit', // May need to handle Credit column separately
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: -1, // Debit should be negative
    hasHeader: true,
    skipRows: 0,
  },

  // 🔄 Capital One single amount - Alternative format
  capitalOneSingle: {
    name: 'Capital One (Single Amount)',
    dateColumn: 'Transaction Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ❌ Wells Fargo - Estimated format (needs research)
  wellsFargo: {
    name: 'Wells Fargo',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ❌ Citibank - Estimated format (needs research)
  citibank: {
    name: 'Citibank',
    dateColumn: 'Date',
    descriptionColumn: 'Description',
    amountColumn: 'Amount',
    dateFormat: 'MM/dd/yyyy',
    amountMultiplier: 1,
    hasHeader: true,
    skipRows: 0,
  },

  // ❌ US Bank - Estimated format (needs research)
  usBank: {
    name: 'US Bank',
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

    // RBC specific patterns
    if (bankKey.startsWith('rbc') && (headerSet.has('description 1') || headerSet.has('description1'))) {
      score += 15;
      reasons.push('RBC signature: "Description 1"');
    }

    // Chase specific patterns
    if (bankKey === 'chaseCredit' && headerSet.has('post date') && headerSet.has('category')) {
      score += 15;
      reasons.push('Chase Credit signature: Post Date + Category');
    }

    // Bank of America specific
    if (bankKey === 'bankOfAmerica' && headerSet.has('posted date') && headerSet.has('payee')) {
      score += 15;
      reasons.push('BofA signature: Posted Date + Payee');
    }

    // Capital One specific
    if (bankKey.startsWith('capitalOne')) {
      if (headerSet.has('debit') && headerSet.has('credit') && headerSet.has('transaction date')) {
        score += 12;
        reasons.push('Capital One signature: Debit/Credit split');
      }
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

  // TD Canada Trust - Outflow/Inflow split pattern (very distinctive)
  if (headerSet.has('outflow') && headerSet.has('inflow')) {
    return 'tdSplit';
  }

  // TD - Account activity pattern
  if (
    headerSet.has('date') &&
    (headerSet.has('payee') || headerSet.has('description')) &&
    !headerStr.includes('posted') // Differentiate from BofA
  ) {
    // Check if it might be TD based on date format or filename
    // This is a weaker match - may need filename pattern
    if (headerStr.includes('account activity') || headerStr.includes('accountactivity')) {
      return 'td';
    }
  }

  // RBC - Description 1 is distinctive
  if (
    headerSet.has('transaction date') &&
    (headerSet.has('description 1') || headerSet.has('description1'))
  ) {
    if (headerSet.has('debit') && headerSet.has('credit')) {
      return 'rbcSplit';
    }
    return 'rbc';
  }

  // Scotiabank - Look for Scotia-specific patterns
  if (
    headerStr.includes('scotiabank') ||
    (headerSet.has('date') &&
      headerSet.has('description') &&
      (headerSet.has('debit') && headerSet.has('credit') && headerSet.has('balance')))
  ) {
    if (headerSet.has('debit') && headerSet.has('credit')) {
      return 'scotiabankSplit';
    }
    return 'scotiabank';
  }

  // CIBC - Transaction Date + Withdrawals/Deposits is distinctive
  if (
    headerSet.has('transaction date') &&
    (headerSet.has('withdrawals') || headerSet.has('deposits'))
  ) {
    return 'cibcSplit';
  }

  // CIBC - Basic pattern
  if (
    headerSet.has('date') &&
    headerSet.has('description') &&
    headerStr.includes('cibc')
  ) {
    return 'cibc';
  }

  // Tangerine - "Name" column is distinctive
  if (
    headerSet.has('date') &&
    headerSet.has('name') &&
    headerSet.has('amount') &&
    !headerSet.has('card') // Differentiate from credit cards
  ) {
    return 'tangerine';
  }

  // Simplii Financial (CIBC subsidiary)
  if (
    headerStr.includes('simplii') ||
    (headerSet.has('date') &&
      headerSet.has('description') &&
      headerStr.includes('yyyy-mm-dd')) // Check for ISO date format hint
  ) {
    return 'simplii';
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

  // Bank of America - "Posted Date" + "Payee" is distinctive
  if (
    (headerSet.has('posted date') || headerSet.has('posting date')) &&
    headerSet.has('payee')
  ) {
    return 'bankOfAmerica';
  }

  // Chase Credit Card - Very specific pattern
  if (
    headerSet.has('transaction date') &&
    headerSet.has('post date') &&
    headerSet.has('category') &&
    headerSet.has('type')
  ) {
    return 'chaseCredit';
  }

  // Chase Checking - "Posting Date" + "Details" + "Check or Slip #"
  if (
    headerSet.has('posting date') &&
    headerSet.has('details') &&
    (headerSet.has('check or slip #') || headerSet.has('balance'))
  ) {
    return 'chaseChecking';
  }

  // Capital One - "Transaction Date" + Split Debit/Credit
  if (
    headerSet.has('transaction date') &&
    headerSet.has('debit') &&
    headerSet.has('credit') &&
    (headerSet.has('posted date') || headerStr.includes('capital one'))
  ) {
    return 'capitalOne';
  }

  // Capital One Single Amount - Alternative format
  if (
    headerSet.has('transaction date') &&
    headerSet.has('description') &&
    headerSet.has('amount') &&
    !headerSet.has('payee') // Differentiate from BofA
  ) {
    return 'capitalOneSingle';
  }

  // Wells Fargo - Generic pattern (needs better detection)
  if (
    headerStr.includes('wells fargo') ||
    (headerSet.has('date') && headerSet.has('amount') && headerStr.includes('wells'))
  ) {
    return 'wellsFargo';
  }

  // Citibank - Generic pattern (needs better detection)
  if (
    headerStr.includes('citibank') || headerStr.includes('citi') &&
    headerSet.has('date') &&
    headerSet.has('description')
  ) {
    return 'citibank';
  }

  // US Bank - Generic pattern (needs better detection)
  if (
    (headerStr.includes('us bank') || headerStr.includes('usbank')) &&
    headerSet.has('date') &&
    headerSet.has('description')
  ) {
    return 'usBank';
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
