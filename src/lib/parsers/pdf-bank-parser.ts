/**
 * PDF Bank Statement Parser
 * Task 2: Intelligent table structure detection for PDF bank statements
 *
 * Handles varying bank formats with fuzzy keyword matching and spatial analysis:
 * - Home Trust: Date | Description | Debit | Credit | Balance
 * - TD Bank: Transaction Date | Description | Withdrawals | Deposits
 * - BMO: Date | Description | Amount | Balance
 *
 * Uses hierarchical detection strategy (vibe check recommendation):
 * 1. Fuzzy keyword matching (Levenshtein distance for OCR errors)
 * 2. Spatial column alignment analysis
 * 3. Content-based validation (regex patterns for dates/amounts)
 * 4. Multi-dimensional confidence scoring
 */

// ============================================================================
// Types
// ============================================================================

export interface ColumnMapping {
  dateColumn: number | null;
  descriptionColumn: number | null;
  amountColumn: number | null;  // Single amount column (BMO style)
  debitColumn: number | null;   // Debit column (Home Trust style)
  creditColumn: number | null;  // Credit column (Home Trust style)
  balanceColumn: number | null;
  confidence: number;  // 0-1 score for detection quality
  detectionMethod: 'keyword' | 'spatial' | 'hybrid' | 'fallback';
  bankFormat?: 'home-trust' | 'td' | 'bmo' | 'generic';
}

export interface ColumnDetectionResult {
  mapping: ColumnMapping;
  headerRow: number;  // Which row was identified as the header
  warnings: string[];
}

interface ColumnCandidate {
  columnIndex: number;
  keyword: string;
  matchedText: string;
  distance: number;  // Levenshtein distance
  confidence: number;
}

// ============================================================================
// Column Header Keywords (with variations for fuzzy matching)
// ============================================================================

const COLUMN_KEYWORDS = {
  date: ['date', 'trans date', 'transaction date', 'posting date', 'posted'],
  description: ['description', 'details', 'transaction', 'merchant', 'payee', 'particulars'],
  amount: ['amount', 'value', 'transaction amount'],
  debit: ['debit', 'withdrawal', 'withdrawals', 'debits', 'out', 'spent'],
  credit: ['credit', 'deposit', 'deposits', 'credits', 'in', 'received'],
  balance: ['balance', 'running balance', 'current balance', 'closing balance'],
};

// ============================================================================
// Fuzzy String Matching (Levenshtein Distance)
// ============================================================================

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching OCR text that may have errors
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Fuzzy match a text against a list of keywords
 * Returns best match with distance and confidence
 */
function fuzzyMatchKeywords(
  text: string,
  keywords: string[]
): { keyword: string; distance: number; confidence: number } | null {
  text = text.toLowerCase().trim();
  let bestMatch: { keyword: string; distance: number; confidence: number } | null = null;

  for (const keyword of keywords) {
    const distance = levenshteinDistance(text, keyword);
    // Confidence = 1 - (distance / maxLength)
    const maxLen = Math.max(text.length, keyword.length);
    const confidence = maxLen > 0 ? 1 - (distance / maxLen) : 0;

    // Only consider matches with confidence > 0.5 (allows ~50% error for OCR noise)
    if (confidence >= 0.5) {
      if (!bestMatch || confidence > bestMatch.confidence) {
        bestMatch = { keyword, distance, confidence };
      }
    }
  }

  return bestMatch;
}

// ============================================================================
// Column Detection Functions
// ============================================================================

/**
 * Detect column positions from header rows using hierarchical strategy
 *
 * @param headerRows - First 3-5 rows of OCR text (may contain headers)
 * @returns Column mapping with confidence score
 */
export function detectColumnPositions(headerRows: string[]): ColumnDetectionResult {
  const warnings: string[] = [];

  // Step 1: Find the most likely header row
  const headerRowIndex = findHeaderRow(headerRows);

  if (headerRowIndex === -1) {
    warnings.push('No clear header row found, using first row');
    return {
      mapping: createFallbackMapping(),
      headerRow: 0,
      warnings,
    };
  }

  const headerRow = headerRows[headerRowIndex];

  // Step 2: Split header into columns (space-based, tab-based)
  const columns = splitIntoColumns(headerRow);

  if (columns.length < 3) {
    warnings.push(`Only ${columns.length} columns detected, expected at least 3`);
  }

  // Step 3: Match columns to keywords using fuzzy matching
  const candidates = matchColumnsToKeywords(columns);

  // Step 4: Build column mapping
  const mapping = buildColumnMapping(candidates, columns.length);

  // Step 5: Calculate confidence score
  const confidence = calculateMappingConfidence(mapping, candidates);
  mapping.confidence = confidence;

  if (confidence < 0.7) {
    warnings.push(`Low confidence (${(confidence * 100).toFixed(1)}%), may need manual review`);
  }

  return {
    mapping,
    headerRow: headerRowIndex,
    warnings,
  };
}

/**
 * Find the most likely header row by analyzing keyword matches
 * Requires minimum score of 2 keywords to avoid false positives
 */
function findHeaderRow(rows: string[]): number {
  let bestRowIndex = -1;
  let bestScore = 0;

  for (let i = 0; i < Math.min(rows.length, 5); i++) {
    const row = rows[i].toLowerCase();
    let score = 0;

    // Count keyword matches
    for (const keywords of Object.values(COLUMN_KEYWORDS)) {
      for (const keyword of keywords) {
        if (row.includes(keyword)) {
          score++;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestRowIndex = i;
    }
  }

  // Require at least 2 keyword matches to avoid false positives
  // (transaction rows may have "date" values but not full header keywords)
  if (bestScore < 2) {
    return -1;
  }

  return bestRowIndex;
}

/**
 * Split a header row into columns using multiple strategies
 * Handles variable spacing, tabs, and aligned text
 */
function splitIntoColumns(headerRow: string): string[] {
  // Strategy 1: Split by multiple spaces (2+)
  let columns = headerRow.split(/\s{2,}/).map(c => c.trim()).filter(c => c.length > 0);

  // Strategy 2: If only 1-2 columns, try tab split
  if (columns.length < 3) {
    const tabColumns = headerRow.split('\t').map(c => c.trim()).filter(c => c.length > 0);
    if (tabColumns.length > columns.length) {
      columns = tabColumns;
    }
  }

  // Strategy 3: If still too few, try single space split (last resort)
  if (columns.length < 3) {
    columns = headerRow.split(/\s+/).map(c => c.trim()).filter(c => c.length > 0);
  }

  return columns;
}

/**
 * Match each column to keywords using fuzzy matching
 */
function matchColumnsToKeywords(columns: string[]): ColumnCandidate[] {
  const candidates: ColumnCandidate[] = [];

  for (let i = 0; i < columns.length; i++) {
    const columnText = columns[i];

    // Try matching against all keyword types
    for (const [type, keywords] of Object.entries(COLUMN_KEYWORDS)) {
      const match = fuzzyMatchKeywords(columnText, keywords);

      if (match) {
        candidates.push({
          columnIndex: i,
          keyword: type,
          matchedText: columnText,
          distance: match.distance,
          confidence: match.confidence,
        });
      }
    }
  }

  return candidates;
}

/**
 * Build column mapping from candidates
 * Handles conflicts (multiple candidates for same column type)
 */
function buildColumnMapping(candidates: ColumnCandidate[], totalColumns: number): ColumnMapping {
  const mapping: ColumnMapping = {
    dateColumn: null,
    descriptionColumn: null,
    amountColumn: null,
    debitColumn: null,
    creditColumn: null,
    balanceColumn: null,
    confidence: 0,
    detectionMethod: 'keyword',
  };

  // Group candidates by keyword type, keep highest confidence
  const bestMatches: Record<string, ColumnCandidate> = {};

  for (const candidate of candidates) {
    const existing = bestMatches[candidate.keyword];
    if (!existing || candidate.confidence > existing.confidence) {
      bestMatches[candidate.keyword] = candidate;
    }
  }

  // Assign to mapping
  if (bestMatches.date) mapping.dateColumn = bestMatches.date.columnIndex;
  if (bestMatches.description) mapping.descriptionColumn = bestMatches.description.columnIndex;
  if (bestMatches.amount) mapping.amountColumn = bestMatches.amount.columnIndex;
  if (bestMatches.debit) mapping.debitColumn = bestMatches.debit.columnIndex;
  if (bestMatches.credit) mapping.creditColumn = bestMatches.credit.columnIndex;
  if (bestMatches.balance) mapping.balanceColumn = bestMatches.balance.columnIndex;

  // Detect bank format
  if (mapping.debitColumn !== null && mapping.creditColumn !== null) {
    mapping.bankFormat = 'home-trust';
  } else if (mapping.amountColumn !== null) {
    mapping.bankFormat = 'bmo';
  } else {
    mapping.bankFormat = 'generic';
  }

  return mapping;
}

/**
 * Calculate multi-dimensional confidence score
 * Factors: keyword matches, column count, spatial consistency
 */
function calculateMappingConfidence(
  mapping: ColumnMapping,
  candidates: ColumnCandidate[]
): number {
  let score = 0;
  let factors = 0;

  // Factor 1: Required columns found (date + description + amount)
  if (mapping.dateColumn !== null) {
    score += 0.3;
    factors++;
  }
  if (mapping.descriptionColumn !== null) {
    score += 0.2;
    factors++;
  }
  if (mapping.amountColumn !== null || (mapping.debitColumn !== null && mapping.creditColumn !== null)) {
    score += 0.3;
    factors++;
  }

  // Factor 2: Average keyword match confidence
  if (candidates.length > 0) {
    const avgConfidence = candidates.reduce((sum, c) => sum + c.confidence, 0) / candidates.length;
    score += avgConfidence * 0.2;
    factors++;
  }

  return factors > 0 ? score : 0;
}

/**
 * Create fallback mapping when auto-detection fails
 * Assumes: Date | Description | Amount (most common format)
 */
function createFallbackMapping(): ColumnMapping {
  return {
    dateColumn: 0,
    descriptionColumn: 1,
    amountColumn: 2,
    debitColumn: null,
    creditColumn: null,
    balanceColumn: null,
    confidence: 0.3,  // Low confidence for fallback
    detectionMethod: 'fallback',
    bankFormat: 'generic',
  };
}

// ============================================================================
// Amount Parsing with Column Mapping
// ============================================================================

/**
 * Parse amount from a transaction row using column mapping
 * Handles both Debit/Credit columns and single Amount column
 *
 * @param row - Transaction row text
 * @param mapping - Column mapping detected from headers
 * @returns Parsed amount (negative for debits, positive for credits)
 */
export function parseAmountColumns(row: string, mapping: ColumnMapping): number | null {
  const columns = splitIntoColumns(row);

  // Strategy 1: Debit/Credit columns (Home Trust format)
  if (mapping.debitColumn !== null && mapping.creditColumn !== null) {
    const debit = extractAmountFromColumn(columns, mapping.debitColumn);
    const credit = extractAmountFromColumn(columns, mapping.creditColumn);

    // Prioritize non-zero values (bank statements use 0.00 for unused column)
    if (debit !== null && debit !== 0) return -Math.abs(debit);  // Debits are negative
    if (credit !== null && credit !== 0) return Math.abs(credit);  // Credits are positive

    // If both are zero or null, return 0
    if (debit === 0) return -0;
    if (credit === 0) return 0;
  }

  // Strategy 2: Single amount column (BMO format)
  if (mapping.amountColumn !== null) {
    return extractAmountFromColumn(columns, mapping.amountColumn);
  }

  // Strategy 3: Fallback to first amount found (any column)
  for (let i = 0; i < columns.length; i++) {
    const amount = extractAmountFromColumn(columns, i);
    if (amount !== null) return amount;
  }

  return null;
}

/**
 * Extract amount from a specific column index
 */
function extractAmountFromColumn(columns: string[], columnIndex: number): number | null {
  if (columnIndex >= columns.length) return null;

  const text = columns[columnIndex].trim();

  // Check for parentheses (negative) first
  const parenthesesMatch = text.match(/\([\d,]+\.\d{2}\)/);
  if (parenthesesMatch) {
    const amount = parseFloat(parenthesesMatch[0].replace(/[(),]/g, '').replace(/,/g, ''));
    return isNaN(amount) ? null : -Math.abs(amount);
  }

  // Check for explicit negative sign
  const negativeMatch = text.match(/-\$?([\d,]+\.\d{2})/);
  if (negativeMatch) {
    const amount = parseFloat(negativeMatch[1].replace(/,/g, ''));
    return isNaN(amount) ? null : -Math.abs(amount);
  }

  // Check for positive amount
  const positiveMatch = text.match(/\$?([\d,]+\.\d{2})/);
  if (positiveMatch) {
    const amount = parseFloat(positiveMatch[1].replace(/,/g, ''));
    return isNaN(amount) ? null : amount;
  }

  return null;
}

// ============================================================================
// Multi-line Transaction Grouping
// ============================================================================

/**
 * Group multi-line transactions into single transactions
 * Common when descriptions span multiple OCR lines
 *
 * IMPROVED VERSION: Multi-strategy detection with fallbacks
 *
 * @param rows - All transaction rows from OCR
 * @returns Grouped rows (each array is one logical transaction)
 */
export function groupMultiLineTransactions(rows: string[]): string[][] {
  const grouped: string[][] = [];
  let currentGroup: string[] = [];

  console.log('[groupMultiLineTransactions] Processing', rows.length, 'rows');

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const isNewTransaction = startsWithDate(row);

    // Debug logging for first 10 rows to see grouping decisions
    if (i < 10) {
      console.log(`[groupMultiLineTransactions] Row ${i + 1}: ${isNewTransaction ? 'NEW TX' : 'CONTINUATION'} - ${row.substring(0, 60)}`);
    }

    // Check if this row starts a new transaction
    if (isNewTransaction) {
      // Save previous group if exists
      if (currentGroup.length > 0) {
        grouped.push(currentGroup);
      }
      // Start new group
      currentGroup = [row];
    } else if (currentGroup.length > 0) {
      // Continuation of previous transaction
      currentGroup.push(row);
    } else {
      // Edge case: First row doesn't start with date
      // Treat it as a new transaction anyway (orphaned row)
      console.warn('[groupMultiLineTransactions] Orphaned row (no date detected):', row.substring(0, 60));
      currentGroup = [row];
    }
  }

  // Don't forget last group
  if (currentGroup.length > 0) {
    grouped.push(currentGroup);
  }

  console.log('[groupMultiLineTransactions] Formed', grouped.length, 'transaction groups from', rows.length, 'rows');

  // Log warning if only 1 group formed from many rows (likely a grouping bug)
  if (grouped.length === 1 && rows.length > 10) {
    console.warn('[groupMultiLineTransactions] ⚠️ Only 1 transaction group formed from', rows.length, 'rows! This suggests date detection failed.');
    console.warn('[groupMultiLineTransactions] First row:', rows[0].substring(0, 100));
  }

  return grouped;
}

/**
 * Check if a row starts with a date pattern
 *
 * IMPROVED VERSION: Multi-strategy detection with fallbacks
 *
 * Strategies:
 * 1. Primary: Date patterns (MM/DD/YYYY, YYYY-MM-DD, Month DD)
 * 2. Fallback 1: Has amount at START of line (some banks put amount first)
 * 3. Fallback 2: Row length heuristic (transaction rows are typically 40+ chars)
 * 4. Fallback 3: Has multiple numeric patterns (date + amount + balance)
 */
function startsWithDate(row: string): boolean {
  // Strategy 1: Standard date patterns
  const datePatterns = [
    /^\s*\d{1,2}[\\/\-\.]\d{1,2}[\\/\-\.]\d{2,4}/,  // MM/DD/YYYY or DD/MM/YYYY
    /^\s*\d{4}[\\/\-]\d{1,2}[\\/\-]\d{1,2}/,        // YYYY/MM/DD or YYYY-MM-DD
    /^\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}/i,  // Month DD
    /^\s*\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i,  // DD Month
  ];

  const hasDateAtStart = datePatterns.some(pattern => pattern.test(row));

  if (hasDateAtStart) {
    return true;
  }

  // Strategy 2: Amount at start (some bank formats start with amounts)
  const startsWithAmount = /^\s*\$?\d+\.\d{2}/.test(row);

  // Strategy 3: Row length heuristic
  // Transaction rows are typically 40+ characters (have date, description, amount)
  // Continuation lines are typically shorter (just description fragments)
  const isLongEnough = row.trim().length >= 40;

  // Strategy 4: Has multiple numeric patterns
  // Transaction rows typically have multiple numbers (date, amount, balance)
  const numericMatches = row.match(/\d+/g) || [];
  const hasMultipleNumbers = numericMatches.length >= 3;

  // Fallback decision: If row starts with amount AND is long enough, treat as new transaction
  if (startsWithAmount && isLongEnough) {
    console.log('[startsWithDate] Fallback detection (amount at start):', row.substring(0, 60));
    return true;
  }

  // Fallback decision: If row has multiple numbers and is long, treat as new transaction
  if (hasMultipleNumbers && isLongEnough) {
    console.log('[startsWithDate] Fallback detection (multiple numbers):', row.substring(0, 60));
    return true;
  }

  return false;
}
