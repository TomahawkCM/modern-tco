/**
 * Receipt OCR Utilities
 * Phase 7.3.1: Extract text from receipt images and PDFs using Tesseract.js
 * Parses merchant, date, and amount from receipt text
 */

import Tesseract from "tesseract.js";
import { convertPdfToImages, isPdfFile } from "./pdf-to-image";
import { parseDate as intlParseDate } from "./parsers/intl-date-parser";
import { parseAmount as intlParseAmount } from "./parsers/intl-amount-parser";

export interface ExtractedReceiptData {
  merchant: string | null;
  amount: number | null;
  date: Date | null;
  rawText: string;
  confidence: number; // 0-1
  pagesProcessed?: number; // Number of pages processed (for PDFs)
  bestPageNumber?: number; // Page number with highest confidence (for PDFs)
}

/**
 * Extract text and parse data from a receipt image or PDF
 * @param file - Image file (JPG, PNG) or PDF to process
 * @param onProgress - Optional progress callback for multi-page PDFs
 * @returns Extracted receipt data with confidence score
 */
export async function extractReceiptData(
  file: File,
  onProgress?: (current: number, total: number) => void,
  language?: string
): Promise<ExtractedReceiptData> {
  try {
    // Check if file is a PDF
    if (isPdfFile(file)) {
      return await extractFromPdf(file, onProgress, language);
    } else {
      // Process as image
      return await extractFromImage(file, language);
    }
  } catch (error) {
    console.error("OCR extraction failed:", error);
    return {
      merchant: null,
      amount: null,
      date: null,
      rawText: "",
      confidence: 0,
    };
  }
}

/**
 * Extract data from an image file
 */
async function extractFromImage(file: File, language?: string): Promise<ExtractedReceiptData> {
  const result = await Tesseract.recognize(file, language ?? "eng");

  const rawText = result.data.text;
  const confidence = result.data.confidence / 100; // Convert to 0-1 scale

  // Parse merchant, amount, and date from the text
  const merchant = extractMerchant(rawText);
  const amount = extractAmount(rawText);
  const date = extractDate(rawText);

  return {
    merchant,
    amount,
    date,
    rawText,
    confidence,
  };
}

/**
 * Extract data from a PDF file (processes all pages, returns best result)
 */
async function extractFromPdf(
  file: File,
  onProgress?: (current: number, total: number) => void,
  language?: string
): Promise<ExtractedReceiptData> {
  // Convert PDF pages to images
  const pages = await convertPdfToImages(file, 10); // Max 10 pages

  if (pages.length === 0) {
    throw new Error("PDF has no pages");
  }

  // Process each page with OCR
  const results: Array<ExtractedReceiptData & { pageNum: number }> = [];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];

    // Report progress
    if (onProgress) {
      onProgress(i + 1, pages.length);
    }

    // Perform OCR on the page canvas
    const result = await Tesseract.recognize(page.canvas, language ?? "eng");

    const rawText = result.data.text;
    const confidence = result.data.confidence / 100;

    // Parse data from this page
    const merchant = extractMerchant(rawText);
    const amount = extractAmount(rawText);
    const date = extractDate(rawText);

    results.push({
      merchant,
      amount,
      date,
      rawText,
      confidence,
      pageNum: page.pageNumber,
    });
  }

  // Find the best result (highest confidence with valid data)
  let bestResult = results[0];
  let bestScore = calculateResultScore(bestResult);

  for (const result of results) {
    const score = calculateResultScore(result);
    if (score > bestScore) {
      bestResult = result;
      bestScore = score;
    }
  }

  // Combine raw text from all pages (for reference)
  const combinedRawText = results.map((r, i) => `--- Page ${i + 1} ---\n${r.rawText}`).join("\n\n");

  return {
    merchant: bestResult.merchant,
    amount: bestResult.amount,
    date: bestResult.date,
    rawText: combinedRawText,
    confidence: bestResult.confidence,
    pagesProcessed: pages.length,
    bestPageNumber: bestResult.pageNum,
  };
}

/**
 * Calculate a score for a result (used to find best page in multi-page PDFs)
 * Higher score = better result
 */
function calculateResultScore(result: ExtractedReceiptData & { pageNum: number }): number {
  let score = result.confidence;

  // Boost score if we found merchant
  if (result.merchant) score += 0.3;

  // Boost score if we found amount
  if (result.amount !== null) score += 0.4;

  // Boost score if we found date
  if (result.date) score += 0.2;

  return score;
}

/**
 * Known merchant patterns for Strategy A matching.
 * Each entry maps a regex to a canonical merchant name.
 */
const KNOWN_MERCHANTS: [RegExp, string][] = [
  [/\bEPCOR\b/i, "EPCOR"],
  [/\bENMAX\b/i, "ENMAX"],
  [/\bBC\s*HYDRO\b/i, "BC HYDRO"],
  [/\bPG&E\b/i, "PG&E"],
  [/\bWALMART\b/i, "WALMART"],
  [/\bCOSTCO\b/i, "COSTCO"],
  [/\bSTARBUCKS\b/i, "STARBUCKS"],
  [/\b7-ELEVEN\b/i, "7-ELEVEN"],
  [/\bTIM\s*HORTONS?\b/i, "TIM HORTONS"],
  [/\bMCDONALD'?S?\b/i, "MCDONALD'S"],
  [/\bSUBWAY\b/i, "SUBWAY"],
  [/\bA&W\b/i, "A&W"],
  [/\bSAFEWAY\b/i, "SAFEWAY"],
  [/\bSHOPPERS\s*DRUG\s*MART\b/i, "SHOPPERS DRUG MART"],
  [/\bLOBLAWS?\b/i, "LOBLAWS"],
  [/\bHOME\s*DEPOT\b/i, "HOME DEPOT"],
  [/\bCANADIAN\s*TIRE\b/i, "CANADIAN TIRE"],
];

/** Words that should be ignored when they appear as standalone all-caps lines */
const SKIP_WORDS = new Set([
  "RECEIPT",
  "INVOICE",
  "BILL",
  "TOTAL",
  "SUBTOTAL",
  "TAX",
  "DATE",
  "TIME",
  "AMOUNT",
  "CHANGE",
  "CASH",
  "CREDIT",
  "DEBIT",
  "VISA",
  "MASTERCARD",
  "STATEMENT",
  "PAGE",
  "BALANCE",
]);

/**
 * Extract merchant name from receipt text using a multi-strategy approach.
 *
 * Strategy A — known merchant patterns (highest confidence)
 * Strategy B — label-based extraction ("Sold by:", "Company:", "Billed by:")
 * Strategy C — all-caps and mixed-case detection in first 10 lines
 * Strategy D — filename extraction fallback
 * Strategy E — short-line fallback (last resort)
 */
export function extractMerchant(text: string, filename?: string): string | null {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // ── Strategy A: Known merchant patterns ──────────────────────────
  const fullText = text;
  for (const [pattern, canonical] of KNOWN_MERCHANTS) {
    if (pattern.test(fullText)) return canonical;
  }

  // ── Strategy B: Label-based extraction ───────────────────────────
  const labelRe = /(?:sold\s+by|company|billed\s+by|merchant|vendor|store)\s*:\s*(.+)/i;
  for (const line of lines) {
    const m = line.match(labelRe);
    if (m) return m[1].trim();
  }

  // ── Strategy C: All-caps / mixed-case detection ──────────────────
  const maxScan = Math.min(10, lines.length);

  // C-1: all-caps lines (skip noise)
  for (let i = 0; i < maxScan; i++) {
    const line = lines[i];
    if (line.length < 3 || line.length > 60) continue;
    if (/^[A-Z][A-Z\s&'.-]+$/.test(line)) {
      const upper = line.replace(/[^A-Z]/g, "");
      if (upper.length < 3) continue;
      if (SKIP_WORDS.has(line)) continue;
      // Skip lines that look like addresses (start with digits)
      if (/^\d/.test(line)) continue;
      // Skip phone numbers
      if (/^\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/.test(line)) continue;
      // Skip account/order numbers
      if (/^#\d+$/.test(line)) continue;
      return line;
    }
  }

  // C-2: mixed-case lines (title-case or camelCase merchant names)
  for (let i = 0; i < maxScan; i++) {
    const line = lines[i];
    if (line.length < 3 || line.length > 50) continue;
    // Skip lines that start with digits, look like prices, phone numbers, or dates
    if (/^\d/.test(line)) continue;
    if (/^\$/.test(line)) continue;
    if (/^\(?\d{3}\)?[\s-]?\d{3}/.test(line)) continue;
    if (/^#\d+/.test(line)) continue;
    if (SKIP_WORDS.has(line.toUpperCase())) continue;
    // Must contain at least one letter and look like a name
    if (/^[A-Z][a-z]/.test(line) && /^[A-Za-z\s&'.-]+$/.test(line)) {
      return line;
    }
  }

  // ── Strategy D: Filename extraction ──────────────────────────────
  if (filename) {
    const base = filename.replace(/\.[^.]+$/, ""); // strip extension
    const tokens = base.split(/[_\-\s]+/);
    for (const token of tokens) {
      if (/[a-zA-Z]/.test(token) && !/^\d+$/.test(token)) {
        return token.toUpperCase();
      }
    }
  }

  // ── Strategy E: Short-line fallback ──────────────────────────────
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (line.length >= 3 && line.length <= 40 && /[a-zA-Z]/.test(line)) {
      if (/^\d/.test(line)) continue;
      if (/^\$/.test(line)) continue;
      if (/^\(?\d{3}\)?/.test(line)) continue;
      if (/^#\d+/.test(line)) continue;
      return line;
    }
  }

  return null;
}

/**
 * Extract amount from receipt text
 * Uses international amount parser for multi-locale support
 */
function extractAmount(text: string): number | null {
  // Look for total label lines first (highest confidence)
  const totalLabelPattern =
    /(?:TOTAL|AMOUNT|BALANCE|GRAND\s*TOTAL|SUMA|MONTANT|BETRAG|TOTALE|GESAMT)[\s:]*(.+)/gim;
  const labelMatches = [...text.matchAll(totalLabelPattern)];
  for (const match of labelMatches) {
    const amount = intlParseAmount(match[1].trim());
    if (amount !== null && amount > 0) {
      return amount;
    }
  }

  // Fallback: find all amounts in text and take the largest
  const lines = text.split("\n");
  const amounts: number[] = [];
  for (const line of lines) {
    const amount = intlParseAmount(line.trim());
    if (amount !== null && amount > 0) {
      amounts.push(amount);
    }
  }

  if (amounts.length > 0) {
    return Math.max(...amounts);
  }

  return null;
}

/**
 * Extract date from receipt text
 * Uses international date parser for multi-language support
 */
function extractDate(text: string): Date | null {
  // Try each line for a date (receipts often have date on its own line)
  const lines = text.split("\n");
  for (const line of lines) {
    const date = intlParseDate(line.trim());
    if (date && !isNaN(date.getTime())) {
      // Validate: not in the future and not too old (> 5 years)
      const now = new Date();
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(now.getFullYear() - 5);

      if (date <= now && date >= fiveYearsAgo) {
        return date;
      }
    }
  }

  return null;
}
