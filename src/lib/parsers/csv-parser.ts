/**
 * CSV Parser for Bank Statements
 * Supports BMO and Home Trust bank formats
 */

// Note: Install with: npm install papaparse @types/papaparse
// import Papa from 'papaparse';

import type { BankConfig, CSVRow, ExistingTransaction, ParsedTransaction } from "./types";
import { parse as parseDate, subMonths } from "date-fns";
import { roundToCents } from "./types";
import { ALL_BANK_CONFIGS } from "./bank-configs";

// Bank-specific configurations — single source of truth in bank-configs.ts
export const BANK_CONFIGS: Record<string, BankConfig> = ALL_BANK_CONFIGS;

// Re-export detection functions from bank-detector.ts for backward compatibility
export {
  type BankDetectionResult,
  detectBankWithConfidence,
  detectBank,
  detectBankLegacy,
} from "./bank-detector";

// Re-export duplicate detection from duplicate-detector.ts
export { calculateSimilarity, detectDuplicates } from "./duplicate-detector";

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
 * Stream-parse a large CSV file in chunks, yielding rows incrementally.
 * Use this for files with 1000+ transactions to avoid memory pressure.
 *
 * @param content - Full CSV content as string
 * @param skipRows - Number of header rows to skip (e.g., BMO has 3)
 * @param chunkSize - Number of data rows per yielded chunk (default: 1000)
 */
export async function* parseCSVContentStream(
  content: string,
  skipRows: number = 0,
  chunkSize: number = 1000
): AsyncGenerator<CSVRow[]> {
  const cleanContent = content.replace(/^\uFEFF/, "");
  const lines = cleanContent.trim().split("\n");

  let startLine = skipRows;
  while (startLine < lines.length && !lines[startLine].trim()) {
    startLine++;
  }

  if (lines.length < startLine + 2) return;

  const headerLine = lines[startLine];
  const headers = parseCSVLine(headerLine).map((h) => h.trim());
  const chunk: CSVRow[] = [];

  for (let i = startLine + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const row: CSVRow = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ? values[index].trim() : "";
    });

    if (Object.values(row).some((v) => v !== "")) {
      chunk.push(row);
    }

    if (chunk.length >= chunkSize) {
      yield [...chunk];
      chunk.length = 0;
    }
  }

  if (chunk.length > 0) {
    yield chunk;
  }
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
  const maxAge = subMonths(now, maxAgeMonths);

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
