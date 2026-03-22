/**
 * Unified Transaction Normalizer
 * Common post-processing for all parsers (PDF, OFX, QIF, MT940, CAMT.053).
 * Normalizes dates, amounts, currencies, and descriptions.
 */

import type { ParsedTransaction } from "./types";
import { parseAmount, detectCurrencySymbol } from "./intl-amount-parser";
import { parseDate } from "./intl-date-parser";

export interface NormalizeOptions {
  locale?: string;
  defaultCurrency?: string;
  deduplicateDescriptions?: boolean;
}

/**
 * Normalize a single transaction.
 * Applies consistent formatting and validation.
 */
export function normalizeTransaction(
  raw: ParsedTransaction,
  options: NormalizeOptions = {}
): ParsedTransaction {
  const { locale, defaultCurrency } = options;

  return {
    ...raw,
    // Normalize description: trim, collapse whitespace, remove control chars
    description: normalizeDescription(raw.description),
    // Ensure currency is set
    currency: raw.currency || defaultCurrency || undefined,
    // Ensure date is valid
    date: isValidDate(raw.date) ? raw.date : new Date(),
    // Mark for review if data quality is poor
    requiresReview: raw.requiresReview || !isValidDate(raw.date) || raw.amount === 0,
  };
}

/**
 * Normalize an array of transactions.
 * Applies per-transaction normalization plus cross-transaction processing.
 */
export function normalizeTransactions(
  transactions: ParsedTransaction[],
  options: NormalizeOptions = {}
): ParsedTransaction[] {
  // Detect currency if not set — check if most transactions share a currency
  const detectedCurrency = options.defaultCurrency || detectMostCommonCurrency(transactions);
  const normalizeOpts = { ...options, defaultCurrency: detectedCurrency };

  return transactions
    .map((tx) => normalizeTransaction(tx, normalizeOpts))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Normalize description text
 */
function normalizeDescription(description: string): string {
  if (!description) return "Unknown Transaction";

  const cleaned = description
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, " ")
    // Collapse multiple whitespace
    .replace(/\s+/g, " ")
    // Remove leading/trailing punctuation (common OCR artifacts)
    .replace(/^[^\w\d]+/, "")
    .replace(/[^\w\d]+$/, "")
    .trim();

  if (cleaned.length < 2) {
    return "Unknown Transaction";
  }

  return cleaned;
}

/**
 * Detect the most common currency across transactions
 */
function detectMostCommonCurrency(transactions: ParsedTransaction[]): string | undefined {
  const currencies: Record<string, number> = {};

  for (const tx of transactions) {
    if (tx.currency) {
      currencies[tx.currency] = (currencies[tx.currency] || 0) + 1;
    }
  }

  const entries = Object.entries(currencies);
  if (entries.length === 0) return undefined;

  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

/**
 * Check if a date is valid and reasonable
 */
function isValidDate(date: Date | null | undefined): boolean {
  if (!date) return false;
  if (isNaN(date.getTime())) return false;

  const now = new Date();
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(now.getFullYear() - 10);
  const nearFuture = new Date();
  nearFuture.setDate(now.getDate() + 30);

  return date >= tenYearsAgo && date <= nearFuture;
}

/**
 * Parse a raw string amount and date into a normalized transaction.
 * Useful when creating transactions from raw text extraction.
 */
export function parseRawTransaction(
  dateStr: string,
  description: string,
  amountStr: string,
  options: NormalizeOptions = {}
): ParsedTransaction | null {
  const { locale } = options;

  const date = parseDate(dateStr, locale);
  const amount = parseAmount(amountStr, locale);
  const currency = detectCurrencySymbol(amountStr);

  if (!date && amount === null) return null;

  return normalizeTransaction(
    {
      date: date || new Date(),
      description,
      amount: amount || 0,
      isDuplicate: false,
      confidence: (date ? 0.4 : 0) + (amount !== null ? 0.4 : 0) + 0.2,
      currency: currency || undefined,
      requiresReview: !date || amount === null,
    },
    options
  );
}
