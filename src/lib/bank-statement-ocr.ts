/**
 * Bank Statement OCR Utilities
 * PDF Import Project - Task 1
 *
 * Extracts MULTIPLE transactions from PDF bank statements using OCR.
 * Handles tabular data (rows/columns) unlike receipt-ocr.ts (single transaction).
 *
 * Key Differences from receipt-ocr.ts:
 * - Input: Multi-page bank statement PDFs (5-10 pages)
 * - Output: ParsedTransaction[] (array of transactions)
 * - Structure: Tabular data with columns (Date, Description, Amount/Debit/Credit)
 * - Pages: Process 5-10 pages sequentially for memory efficiency
 */

import Tesseract from 'tesseract.js';
import { convertPdfToImages, isPdfFile } from './pdf-to-image';
import type { ParsedTransaction } from '../types/budget';
import {
  detectColumnPositions,
  parseAmountColumns,
  groupMultiLineTransactions,
  type ColumnMapping
} from './parsers/pdf-bank-parser';

// ============================================================================
// Types
// ============================================================================

export interface BankStatementResult {
  transactions: ParsedTransaction[];
  rawText: string;
  pagesProcessed: number;
  averageConfidence: number;
  errors: string[];
  warnings: string[];
  diagnostics: {
    totalLinesProcessed: number;
    linesFilteredAsHeaders: number;
    transactionGroupsFormed: number;
    transactionsParsed: number;
    transactionsFailedToParse: number;
    pageBreakdown: Array<{
      pageNumber: number;
      linesExtracted: number;
      transactionsFound: number;
      confidence: number;
    }>;
  };
}

interface DetectedTransaction {
  date: Date | null;
  description: string;
  amount: number | null;
  confidence: number;
  lineNumber: number;
  rawLine: string;
}

interface ColumnPositions {
  dateColumn: number;
  descriptionColumn: number;
  amountColumn: number;
  debitColumn?: number;
  creditColumn?: number;
}

// ============================================================================
// Main Entry Point
// ============================================================================

/**
 * Extract multiple transactions from a PDF bank statement
 *
 * @param file - PDF bank statement file
 * @param accountId - Account ID for transactions
 * @param onProgress - Progress callback (current page, total pages)
 * @returns Array of parsed transactions with metadata
 */
export async function extractBankStatementData(
  file: File,
  accountId: string,
  onProgress?: (current: number, total: number) => void
): Promise<BankStatementResult> {
  try {
    // Validate file is a PDF
    if (!isPdfFile(file)) {
      throw new Error('File must be a PDF');
    }

    // Convert PDF pages to images (max 20 pages for bank statements)
    const pages = await convertPdfToImages(file, 20);

    if (pages.length === 0) {
      throw new Error('PDF has no pages');
    }

    const allTransactions: DetectedTransaction[] = [];
    const allRawText: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    const pageBreakdown: Array<{
      pageNumber: number;
      linesExtracted: number;
      transactionsFound: number;
      confidence: number;
    }> = [];
    let totalConfidence = 0;
    let confidenceCount = 0;
    let totalLinesProcessed = 0;
    let totalLinesFilteredAsHeaders = 0;
    let totalTransactionGroupsFormed = 0;
    let totalTransactionsParsed = 0;
    let totalTransactionsFailedToParse = 0;

    // Process each page sequentially (memory efficiency)
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];

      // Report progress
      if (onProgress) {
        onProgress(i + 1, pages.length);
      }

      try {
        // Perform OCR on this page
        const result = await Tesseract.recognize(page.canvas, 'eng');
        const rawText = result.data.text;
        const ocrTextConfidence = result.data.confidence / 100;

        // Store raw text for debugging
        allRawText.push(`--- Page ${page.pageNumber} (OCR: ${(ocrTextConfidence * 100).toFixed(1)}%) ---\n${rawText}`);

        // Count lines before parsing
        const linesBeforeParsing = rawText.split('\n').filter(line => line.trim()).length;
        totalLinesProcessed += linesBeforeParsing;

        // Parse transactions from this page with enhanced diagnostics
        const pageResult = parseTableRowsWithDiagnostics(rawText, page.pageNumber);
        const pageTransactions = pageResult.transactions;

        // Track filtering and parsing statistics
        totalLinesFilteredAsHeaders += pageResult.linesFilteredAsHeaders;
        totalTransactionGroupsFormed += pageResult.transactionGroupsFormed;
        totalTransactionsParsed += pageResult.transactionsParsed;
        totalTransactionsFailedToParse += pageResult.transactionsFailed;

        // Add to results
        allTransactions.push(...pageTransactions);

        // Track page breakdown
        const pageConfidence = pageTransactions.length > 0
          ? pageTransactions.reduce((sum, tx) => sum + tx.confidence, 0) / pageTransactions.length
          : 0;

        pageBreakdown.push({
          pageNumber: page.pageNumber,
          linesExtracted: linesBeforeParsing,
          transactionsFound: pageTransactions.length,
          confidence: pageConfidence,
        });

        // Track COLUMN DETECTION confidence (not OCR text confidence)
        // Use the confidence from the first transaction on this page as proxy for page confidence
        if (pageTransactions.length > 0) {
          totalConfidence += pageTransactions[0].confidence;
          confidenceCount++;
        } else {
          warnings.push(`⚠️ Page ${page.pageNumber}: No transactions found (${linesBeforeParsing} lines extracted)`);
        }

        // Log detailed breakdown
        console.log(`[PDF OCR] Page ${page.pageNumber} breakdown:`, {
          linesExtracted: linesBeforeParsing,
          linesFiltered: pageResult.linesFilteredAsHeaders,
          groupsFormed: pageResult.transactionGroupsFormed,
          transactionsParsed: pageResult.transactionsParsed,
          transactionsFailed: pageResult.transactionsFailed,
          ocrConfidence: `${(ocrTextConfidence * 100).toFixed(1)}%`,
        });

      } catch (error) {
        const errorMsg = `Error processing page ${page.pageNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    // Convert to ParsedTransaction format
    const parsedTransactions: ParsedTransaction[] = allTransactions.map(tx => ({
      date: tx.date || new Date(),
      description: tx.description,
      amount: tx.amount || 0,
      isDuplicate: false,
      confidence: tx.confidence,
      requiresReview: tx.confidence < 0.7 || !tx.date || !tx.amount,
    }));

    // Calculate average confidence
    const averageConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0;

    // Add summary warnings
    if (totalTransactionsParsed === 0 && totalLinesProcessed > 0) {
      warnings.push('🚨 No transactions were successfully parsed. Please check column mapping or try manual import.');
    } else if (totalTransactionsParsed < totalTransactionGroupsFormed * 0.5) {
      warnings.push(`⚠️ Only ${totalTransactionsParsed} of ${totalTransactionGroupsFormed} transaction groups were successfully parsed (${Math.round((totalTransactionsParsed / totalTransactionGroupsFormed) * 100)}% success rate).`);
    }

    if (totalLinesFilteredAsHeaders > totalLinesProcessed * 0.5) {
      warnings.push(`⚠️ ${totalLinesFilteredAsHeaders} lines were filtered as headers (${Math.round((totalLinesFilteredAsHeaders / totalLinesProcessed) * 100)}% of total lines). This seems unusually high.`);
    }

    // Log final summary
    console.log('[PDF OCR] Final Summary:', {
      pagesProcessed: pages.length,
      totalLines: totalLinesProcessed,
      linesFiltered: totalLinesFilteredAsHeaders,
      groupsFormed: totalTransactionGroupsFormed,
      transactionsParsed: totalTransactionsParsed,
      transactionsFailed: totalTransactionsFailedToParse,
      averageConfidence: `${(averageConfidence * 100).toFixed(1)}%`,
      successRate: totalTransactionGroupsFormed > 0
        ? `${Math.round((totalTransactionsParsed / totalTransactionGroupsFormed) * 100)}%`
        : '0%',
    });

    return {
      transactions: parsedTransactions,
      rawText: allRawText.join('\n\n'),
      pagesProcessed: pages.length,
      averageConfidence,
      errors,
      warnings,
      diagnostics: {
        totalLinesProcessed,
        linesFilteredAsHeaders: totalLinesFilteredAsHeaders,
        transactionGroupsFormed: totalTransactionGroupsFormed,
        transactionsParsed: totalTransactionsParsed,
        transactionsFailedToParse: totalTransactionsFailedToParse,
        pageBreakdown,
      },
    };

  } catch (error) {
    console.error('Bank statement OCR failed:', error);
    return {
      transactions: [],
      rawText: '',
      pagesProcessed: 0,
      averageConfidence: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      warnings: [],
      diagnostics: {
        totalLinesProcessed: 0,
        linesFilteredAsHeaders: 0,
        transactionGroupsFormed: 0,
        transactionsParsed: 0,
        transactionsFailedToParse: 0,
        pageBreakdown: [],
      },
    };
  }
}

// ============================================================================
// Table Row Parsing
// ============================================================================

interface ParseTableRowsResult {
  transactions: DetectedTransaction[];
  linesFilteredAsHeaders: number;
  transactionGroupsFormed: number;
  transactionsParsed: number;
  transactionsFailed: number;
}

/**
 * Parse tabular transaction data from OCR text with diagnostics
 *
 * @param rawText - Raw OCR text from a page
 * @param pageNumber - Page number for debugging
 * @returns Parse result with diagnostics
 */
export function parseTableRowsWithDiagnostics(rawText: string, pageNumber: number = 1): ParseTableRowsResult {
  const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  if (lines.length === 0) {
    return {
      transactions: [],
      linesFilteredAsHeaders: 0,
      transactionGroupsFormed: 0,
      transactionsParsed: 0,
      transactionsFailed: 0,
    };
  }

  // Step 1: Detect column positions from first 5 rows (header detection)
  const headerRows = lines.slice(0, Math.min(5, lines.length));
  const columnDetection = detectColumnPositions(headerRows);
  const {mapping} = columnDetection;

  console.log('[parseTableRows] Column detection:', {
    bankFormat: mapping.bankFormat,
    confidence: mapping.confidence,
    method: mapping.detectionMethod,
    warnings: columnDetection.warnings
  });

  // Step 2: Extract transaction rows (skip header row and filter headers/footers)
  const linesBeforeFiltering = lines.length - (columnDetection.headerRow + 1);
  const transactionRows = lines
    .slice(columnDetection.headerRow + 1)
    .filter(line => !isHeaderOrFooter(line));

  const linesFiltered = linesBeforeFiltering - transactionRows.length;

  console.log('[parseTableRows] Page', pageNumber, '- Lines:', lines.length, '| Transaction rows after filtering:', transactionRows.length, '| Filtered as headers:', linesFiltered);

  if (transactionRows.length === 0) {
    console.warn('[parseTableRows] No transaction rows found on page', pageNumber);
    return {
      transactions: [],
      linesFilteredAsHeaders: linesFiltered,
      transactionGroupsFormed: 0,
      transactionsParsed: 0,
      transactionsFailed: 0,
    };
  }

  // Step 3: Group multi-line transactions
  const groupedRows = groupMultiLineTransactions(transactionRows);
  console.log('[parseTableRows] Grouped into', groupedRows.length, 'transaction groups');

  // Step 4: Parse each transaction group
  const transactions: DetectedTransaction[] = [];
  let parsedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < groupedRows.length; i++) {
    const rowGroup = groupedRows[i];
    const mainRow = rowGroup[0];
    const continuationRows = rowGroup.slice(1);

    // Parse transaction using column mapping
    const transaction = parseTransactionRowWithMapping(mainRow, mapping, i + 1);

    if (transaction) {
      // Append continuation lines to description
      if (continuationRows.length > 0) {
        const continuationText = continuationRows.join(' ').trim();
        transaction.description = `${transaction.description} ${continuationText}`.trim();
      }

      transactions.push(transaction);
      parsedCount++;
    } else {
      failedCount++;
      console.warn(`[parseTableRows] Failed to parse transaction group ${i + 1}:`, mainRow);
    }
  }

  console.log('[parseTableRows] Successfully parsed:', parsedCount, '| Failed to parse:', failedCount);

  return {
    transactions,
    linesFilteredAsHeaders: linesFiltered,
    transactionGroupsFormed: groupedRows.length,
    transactionsParsed: parsedCount,
    transactionsFailed: failedCount,
  };
}

/**
 * Parse tabular transaction data from OCR text
 *
 * Strategy:
 * 1. Split text into lines
 * 2. Detect column positions using intelligent detection (Task 2)
 * 3. Group multi-line transactions
 * 4. Parse each transaction using column mapping
 *
 * @param rawText - Raw OCR text from a page
 * @param pageNumber - Page number for debugging
 * @returns Array of detected transactions
 */
export function parseTableRows(rawText: string, pageNumber: number = 1): DetectedTransaction[] {
  const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  if (lines.length === 0) {
    return [];
  }

  // Step 1: Detect column positions from first 5 rows (header detection)
  const headerRows = lines.slice(0, Math.min(5, lines.length));
  const columnDetection = detectColumnPositions(headerRows);
  const {mapping} = columnDetection;

  console.log('[parseTableRows] Column detection:', {
    bankFormat: mapping.bankFormat,
    confidence: mapping.confidence,
    method: mapping.detectionMethod,
    warnings: columnDetection.warnings
  });

  // Step 2: Extract transaction rows (skip header row and filter headers/footers)
  const transactionRows = lines
    .slice(columnDetection.headerRow + 1)
    .filter(line => !isHeaderOrFooter(line));

  console.log('[parseTableRows] Page', pageNumber, '- Lines:', lines.length, '| Transaction rows after filtering:', transactionRows.length);

  if (transactionRows.length === 0) {
    console.warn('[parseTableRows] No transaction rows found on page', pageNumber);
    return [];
  }

  // Step 3: Group multi-line transactions
  const groupedRows = groupMultiLineTransactions(transactionRows);
  console.log('[parseTableRows] Grouped into', groupedRows.length, 'transaction groups');

  // Step 4: Parse each transaction group
  const transactions: DetectedTransaction[] = [];
  let parsedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < groupedRows.length; i++) {
    const rowGroup = groupedRows[i];
    const mainRow = rowGroup[0];
    const continuationRows = rowGroup.slice(1);

    // Parse transaction using column mapping
    const transaction = parseTransactionRowWithMapping(mainRow, mapping, i + 1);

    if (transaction) {
      // Append continuation lines to description
      if (continuationRows.length > 0) {
        const continuationText = continuationRows.join(' ').trim();
        transaction.description = `${transaction.description} ${continuationText}`.trim();
      }

      transactions.push(transaction);
      parsedCount++;
    } else {
      failedCount++;
    }
  }

  console.log('[parseTableRows] Successfully parsed:', parsedCount, '| Failed to parse:', failedCount);

  return transactions;
}

/**
 * Check if a line is a header, footer, or balance line (should be skipped)
 *
 * IMPROVED VERSION: More precise matching to avoid filtering valid transaction rows
 *
 * Strategy:
 * 1. Match header keywords ONLY when they appear as column headers (not in descriptions)
 * 2. Require exact keyword matches or header-specific patterns
 * 3. Don't filter lines that contain transaction data (dates, amounts)
 */
function isHeaderOrFooter(line: string): boolean {
  // Normalize for comparison
  const normalized = line.toLowerCase().trim();

  // If line contains amount patterns, it's probably a transaction, not a header
  const hasAmount = /\$?\d+\.\d{2}/.test(line);
  const hasDate = /\d{1,2}[\\/\-\.]\d{1,2}[\\/\-\.]\d{2,4}/.test(line);

  // If it has transaction indicators (date or amount), don't filter it
  // UNLESS it's explicitly a summary line
  if (hasAmount || hasDate) {
    // Check for summary/balance lines (these should be filtered even with amounts)
    const summaryPatterns = [
      /balance brought forward/i,
      /balance carried forward/i,
      /opening balance/i,
      /closing balance/i,
      /^subtotal/i,
      /^total(?:\s+balance)?:/i,
      /^grand total/i,
    ];

    return summaryPatterns.some(pattern => pattern.test(line));
  }

  // Header patterns - match EXACT header keywords (not partial matches)
  const headerPatterns = [
    /^date\s*$/i,                          // "Date" alone
    /^transaction\s+date\s*$/i,            // "Transaction Date" alone
    /^posting\s+date\s*$/i,                // "Posting Date" alone
    /^description\s*$/i,                   // "Description" alone
    /^amount\s*$/i,                        // "Amount" alone
    /^debit\s*$/i,                         // "Debit" alone
    /^credit\s*$/i,                        // "Credit" alone
    /^balance\s*$/i,                       // "Balance" alone
    /^date\s+description\s+/i,             // Multi-column header row
    /^date\s+transaction\s+/i,             // Multi-column header row
    /^\s*date\s+amount\s+balance\s*/i,     // Common header format
  ];

  // Footer patterns
  const footerPatterns = [
    /^\d+\s+of\s+\d+$/i,                   // Page numbers like "1 of 5"
    /^page\s+\d+/i,                        // "Page 1", "Page 2"
    /^continued/i,                         // "Continued", "Continued on next page"
    /^statement\s+period/i,                // "Statement Period"
    /^account\s+number/i,                  // "Account Number"
    /^for\s+period\s+ending/i,             // "For period ending"
  ];

  // Check all patterns
  const skipPatterns = [...headerPatterns, ...footerPatterns];
  const shouldSkip = skipPatterns.some(pattern => pattern.test(line));

  // Debug logging for filtered lines
  if (shouldSkip) {
    console.log('[isHeaderOrFooter] Filtering line:', line.substring(0, 80));
  }

  return shouldSkip;
}

/**
 * Parse a transaction row using intelligent column mapping (Task 2)
 *
 * @param line - Single line of OCR text
 * @param mapping - Column mapping from detectColumnPositions()
 * @param lineNumber - Line number for debugging
 * @returns Parsed transaction or null if not valid
 */
function parseTransactionRowWithMapping(
  line: string,
  mapping: ColumnMapping,
  lineNumber: number
): DetectedTransaction | null {
  try {
    // Extract date
    const date = extractDateFromLine(line);

    // Extract amount using intelligent column detection
    const amount = parseAmountColumns(line, mapping);

    // Extract description (everything between date and amount)
    const description = extractDescriptionFromLine(line, date, amount);

    // Calculate confidence based on column detection and extraction success
    let confidence = mapping.confidence * 0.5; // Start with column detection confidence
    if (date) confidence += 0.2;
    if (amount !== null) confidence += 0.2;
    if (description && description.length >= 3) confidence += 0.1;

    // Only return transaction if we have at least date OR amount
    if (!date && amount === null) {
      return null;
    }

    return {
      date,
      description: description || 'Unknown',
      amount,
      confidence,
      lineNumber,
      rawLine: line,
    };

  } catch (error) {
    console.warn(`Failed to parse line ${lineNumber}: ${line}`, error);
    return null;
  }
}

/**
 * Parse a single line of text as a transaction (legacy fallback)
 *
 * Expected formats:
 * - "01/15/2025  STARBUCKS  -12.45"
 * - "2025-01-15  NETFLIX SUBSCRIPTION  25.00"
 * - "Jan 15  Skip The Dishes  18.50"
 * - "15/01/2025  ATM WITHDRAWAL  100.00  50.00  150.00" (Date, Desc, Debit, Credit, Balance)
 *
 * @param line - Single line of OCR text
 * @param lineNumber - Line number for debugging
 * @returns Parsed transaction or null if not a valid transaction
 */
export function parseTransactionRow(line: string, lineNumber: number): DetectedTransaction | null {
  try {
    // Extract date
    const date = extractDateFromLine(line);

    // Extract amount (could be debit/credit or single amount)
    const amount = extractAmountFromLine(line);

    // Extract description (everything between date and amount)
    const description = extractDescriptionFromLine(line, date, amount);

    // Calculate confidence based on what we successfully extracted
    let confidence = 0.5; // Base confidence
    if (date) confidence += 0.2;
    if (amount !== null) confidence += 0.2;
    if (description && description.length >= 3) confidence += 0.1;

    // Only return transaction if we have at least date OR amount
    if (!date && amount === null) {
      return null;
    }

    return {
      date,
      description: description || 'Unknown',
      amount,
      confidence,
      lineNumber,
      rawLine: line,
    };

  } catch (error) {
    console.warn(`Failed to parse line ${lineNumber}: ${line}`, error);
    return null;
  }
}

// ============================================================================
// Field Extraction Functions
// ============================================================================

/**
 * Extract date from a line of text
 * Supports multiple date formats commonly found on bank statements
 */
function extractDateFromLine(line: string): Date | null {
  const datePatterns = [
    // MM/DD/YYYY or MM-DD-YYYY or MM.DD.YYYY
    /(\d{1,2})[\\/\-\.](\d{1,2})[\\/\-\.](\d{4})/,
    // YYYY/MM/DD or YYYY-MM-DD
    /(\d{4})[\\/\-](\d{1,2})[\\/\-](\d{1,2})/,
    // DD Month or Month DD (e.g., "15 Jan" or "Jan 15")
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})/i,
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*/i,
  ];

  for (const pattern of datePatterns) {
    const match = line.match(pattern);
    if (match) {
      try {
        let date: Date | null = null;

        if (pattern === datePatterns[0]) {
          // MM/DD/YYYY (US format)
          const [, month, day, year] = match;
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else if (pattern === datePatterns[1]) {
          // YYYY/MM/DD (ISO format)
          const [, year, month, day] = match;
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else if (pattern === datePatterns[2]) {
          // Month DD (assume current year)
          const [, month, day] = match;
          const monthNum = getMonthNumber(month);
          if (monthNum !== null) {
            date = new Date(new Date().getFullYear(), monthNum, parseInt(day));
          }
        } else if (pattern === datePatterns[3]) {
          // DD Month (assume current year)
          const [, day, month] = match;
          const monthNum = getMonthNumber(month);
          if (monthNum !== null) {
            date = new Date(new Date().getFullYear(), monthNum, parseInt(day));
          }
        }

        // Validate date
        if (date && !isNaN(date.getTime())) {
          // Ensure date is not in the future and not too old (> 10 years)
          const now = new Date();
          const tenYearsAgo = new Date();
          tenYearsAgo.setFullYear(now.getFullYear() - 10);

          if (date <= now && date >= tenYearsAgo) {
            return date;
          }
        }
      } catch {
        // Continue to next pattern
      }
    }
  }

  return null;
}

/**
 * Extract amount from a line of text
 * Handles negative amounts (expenses) and positive (income)
 */
function extractAmountFromLine(line: string): number | null {
  // Strategy: Check for negative patterns first, then positive
  // This prevents "-12.45" from matching both negative and positive patterns

  const amounts: number[] = [];

  // Pattern 1: Explicit negative with minus sign (-$123.45 or -123.45)
  const negativeMatches = Array.from(line.matchAll(/-\$?([\d,]+\.\d{2})/g));
  for (const match of negativeMatches) {
    if (match && match[1]) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(amount) && amount !== 0) {
        amounts.push(-Math.abs(amount));
      }
    }
  }

  // Pattern 2: Parentheses for negative (($123.45) or (123.45))
  const parenthesesMatches = Array.from(line.matchAll(/\(\$?([\d,]+\.\d{2})\)/g));
  for (const match of parenthesesMatches) {
    if (match && match[1]) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(amount) && amount !== 0) {
        amounts.push(-Math.abs(amount));
      }
    }
  }

  // Pattern 3: Positive amounts ($123.45 or 123.45)
  // Only check if we haven't found negative amounts
  if (amounts.length === 0) {
    const positiveMatches = Array.from(line.matchAll(/\$?([\d,]+\.\d{2})/g));
    for (const match of positiveMatches) {
      if (match && match[1]) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(amount) && amount !== 0) {
          amounts.push(amount);
        }
      }
    }
  }

  if (amounts.length === 0) {
    return null;
  }

  // If multiple amounts found, use the rightmost one (typically the transaction amount)
  // Bank statements often have: Description | Debit | Credit | Balance
  // We want the transaction amount (debit or credit), not the balance
  return amounts[amounts.length - 1];
}

/**
 * Extract description from line (everything between date and amount)
 */
function extractDescriptionFromLine(line: string, date: Date | null, amount: number | null): string {
  let cleanLine = line;

  // Remove date from line if found
  if (date) {
    // Remove date patterns from line
    cleanLine = cleanLine.replace(/\d{1,2}[\\/\-\.]\d{1,2}[\\/\-\.]\d{4}/g, '');
    cleanLine = cleanLine.replace(/\d{4}[\\/\-]\d{1,2}[\\/\-]\d{1,2}/g, '');
    cleanLine = cleanLine.replace(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}/gi, '');
    cleanLine = cleanLine.replace(/\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*/gi, '');
  }

  // Remove amount from line if found
  if (amount !== null) {
    // Remove all currency patterns
    cleanLine = cleanLine.replace(/-?\$?[\d,]+\.\d{2}/g, '');
    cleanLine = cleanLine.replace(/\(\$?[\d,]+\.\d{2}\)/g, '');
  }

  // Clean up whitespace
  cleanLine = cleanLine.replace(/\s+/g, ' ').trim();

  // If description is too short or empty, return placeholder
  if (cleanLine.length < 3) {
    return 'Transaction';
  }

  return cleanLine;
}

/**
 * Convert month name to number (0-11)
 */
function getMonthNumber(monthName: string): number | null {
  const months = [
    'jan', 'feb', 'mar', 'apr', 'may', 'jun',
    'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
  ];

  const index = months.findIndex(m => monthName.toLowerCase().startsWith(m));
  return index !== -1 ? index : null;
}
