/**
 * QIF (Quicken Interchange Format) Parser
 * Parses QIF files into ParsedTransaction format.
 *
 * QIF format uses single-letter line prefixes:
 *   D = Date
 *   T = Amount
 *   P = Payee
 *   M = Memo
 *   C = Cleared status (*, X, or empty)
 *   N = Check number
 *   L = Category
 *   ^ = End of record
 *   !Type:xxx = Account type header
 */

import type { ParsedTransaction } from "@/types/budget";
import { parseDate } from "./intl-date-parser";
import { parseAmount } from "./intl-amount-parser";

export interface QIFParseOptions {
  locale?: string;
}

/**
 * Parse a QIF file content into transactions.
 *
 * @param content - Raw QIF file content
 * @param options - Parsing options
 * @returns Array of parsed transactions
 */
export function parseQIFFile(content: string, options: QIFParseOptions = {}): ParsedTransaction[] {
  const { locale } = options;
  const lines = content.split(/\r?\n/);
  const transactions: ParsedTransaction[] = [];

  let currentDate: string | null = null;
  let currentAmount: string | null = null;
  let currentPayee: string | null = null;
  let currentMemo: string | null = null;
  let currentCheckNum: string | null = null;
  let currentCleared = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length === 0) continue;

    const prefix = trimmed[0];
    const value = trimmed.substring(1).trim();

    switch (prefix) {
      case "!":
        // Type header — skip
        break;

      case "D":
        currentDate = value;
        break;

      case "T":
        currentAmount = value;
        break;

      case "P":
        currentPayee = value;
        break;

      case "M":
        currentMemo = value;
        break;

      case "C":
        currentCleared = value === "*" || value === "X" || value.toLowerCase() === "x";
        break;

      case "N":
        currentCheckNum = value;
        break;

      case "L":
        // Category — skip for now
        break;

      case "^":
        // End of record — create transaction
        if (currentDate || currentAmount) {
          const date = currentDate ? parseDate(currentDate, locale) : null;
          const amount = currentAmount ? parseAmount(currentAmount, locale) : null;

          const description =
            [currentPayee, currentMemo].filter(Boolean).join(" - ") || "Unknown Transaction";

          transactions.push({
            date: date || new Date(),
            description,
            amount: amount || 0,
            isDuplicate: false,
            confidence: date && amount !== null ? 0.9 : 0.5,
            checkNum: currentCheckNum || undefined,
            sourceFormat: "qif",
            requiresReview: !date || amount === null,
          });
        }

        // Reset for next record
        currentDate = null;
        currentAmount = null;
        currentPayee = null;
        currentMemo = null;
        currentCheckNum = null;
        currentCleared = false;
        break;

      default:
        // Unknown prefix — ignore
        break;
    }
  }

  // Handle last record if file doesn't end with ^
  if (currentDate || currentAmount) {
    const date = currentDate ? parseDate(currentDate, locale) : null;
    const amount = currentAmount ? parseAmount(currentAmount, locale) : null;

    const description =
      [currentPayee, currentMemo].filter(Boolean).join(" - ") || "Unknown Transaction";

    transactions.push({
      date: date || new Date(),
      description,
      amount: amount || 0,
      isDuplicate: false,
      confidence: date && amount !== null ? 0.9 : 0.5,
      checkNum: currentCheckNum || undefined,
      sourceFormat: "qif",
      requiresReview: !date || amount === null,
    });
  }

  return transactions;
}

/**
 * Detect if content is a QIF file.
 * QIF files start with !Type: header.
 */
export function isQIFContent(content: string): boolean {
  const trimmed = content.trim();
  return trimmed.startsWith("!Type:") || trimmed.startsWith("!type:");
}

/**
 * Get the account type from QIF content.
 */
export function getQIFAccountType(content: string): string | null {
  const match = content.match(/^!Type:(\w+)/im);
  return match ? match[1] : null;
}
