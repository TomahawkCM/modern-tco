/**
 * Locale-Aware Natural Language Keywords
 *
 * Builds locale-specific regex patterns from translation messages for
 * the natural language search parser. Allows patterns like:
 * - "teuer" (German for "expensive") → amountMin: 100
 * - "gestern" (German for "yesterday") → date filter
 * - "dépenses" (French for "expenses") → type: expense
 *
 * English keywords always work in every locale — locale keywords are additive.
 */

import type { AbstractIntlMessages } from "next-intl";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LocaleKeywordPatterns {
  /** Amount-related keyword patterns */
  amountPatterns: [RegExp, () => { amountMin?: number; amountMax?: number }][];
  /** Date keyword patterns */
  datePatterns: [RegExp, () => { dateStart: Date; dateEnd: Date }][];
  /** Type keyword patterns */
  typePatterns: [RegExp, "income" | "expense"][];
}

// ---------------------------------------------------------------------------
// Build patterns from translations
// ---------------------------------------------------------------------------

/**
 * Build locale-specific NL keyword patterns from translation messages.
 *
 * Expects messages to contain a `searchNaturalLanguage` namespace with keys:
 * - `today`, `yesterday`, `lastWeek`, `thisWeek`, `lastMonth`, `thisMonth`,
 *   `lastYear`, `thisYear`, `recently`
 * - `expensive`, `cheap`, `large`, `small`
 * - `income`, `expense`, `salary`, `deposit`, `refund`,
 *   `spent`, `purchase`, `bought`, `paid`, `bill`
 * - `over`, `under`, `around`
 */
export function buildKeywordPatterns(
  messages: AbstractIntlMessages | undefined
): LocaleKeywordPatterns | null {
  if (!messages) return null;

  const nlKeys = messages["searchNaturalLanguage"] as Record<string, string> | undefined;
  if (!nlKeys) return null;

  const amountPatterns: LocaleKeywordPatterns["amountPatterns"] = [];
  const datePatterns: LocaleKeywordPatterns["datePatterns"] = [];
  const typePatterns: LocaleKeywordPatterns["typePatterns"] = [];

  // --- Amount keywords ---
  if (nlKeys["expensive"]) {
    amountPatterns.push([
      wordBoundary(nlKeys["expensive"]),
      () => ({ amountMin: 100 }),
    ]);
  }
  if (nlKeys["cheap"]) {
    amountPatterns.push([
      wordBoundary(nlKeys["cheap"]),
      () => ({ amountMax: 25 }),
    ]);
  }
  if (nlKeys["large"]) {
    amountPatterns.push([
      wordBoundary(nlKeys["large"]),
      () => ({ amountMin: 100 }),
    ]);
  }
  if (nlKeys["small"]) {
    amountPatterns.push([
      wordBoundary(nlKeys["small"]),
      () => ({ amountMax: 25 }),
    ]);
  }

  // --- Date keywords ---
  if (nlKeys["today"]) {
    datePatterns.push([
      wordBoundary(nlKeys["today"]),
      () => {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return { dateStart: start, dateEnd: end };
      },
    ]);
  }

  if (nlKeys["yesterday"]) {
    datePatterns.push([
      wordBoundary(nlKeys["yesterday"]),
      () => {
        const start = new Date();
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);
        return { dateStart: start, dateEnd: end };
      },
    ]);
  }

  if (nlKeys["lastWeek"]) {
    datePatterns.push([
      wordBoundary(nlKeys["lastWeek"]),
      () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        return { dateStart: start, dateEnd: end };
      },
    ]);
  }

  if (nlKeys["thisWeek"]) {
    datePatterns.push([
      wordBoundary(nlKeys["thisWeek"]),
      () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const start = new Date(now);
        start.setDate(now.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);
        return { dateStart: start, dateEnd: now };
      },
    ]);
  }

  if (nlKeys["lastMonth"]) {
    datePatterns.push([
      wordBoundary(nlKeys["lastMonth"]),
      () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        return { dateStart: start, dateEnd: end };
      },
    ]);
  }

  if (nlKeys["thisMonth"]) {
    datePatterns.push([
      wordBoundary(nlKeys["thisMonth"]),
      () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return { dateStart: start, dateEnd: now };
      },
    ]);
  }

  if (nlKeys["lastYear"]) {
    datePatterns.push([
      wordBoundary(nlKeys["lastYear"]),
      () => {
        const now = new Date();
        const start = new Date(now.getFullYear() - 1, 0, 1);
        const end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        return { dateStart: start, dateEnd: end };
      },
    ]);
  }

  if (nlKeys["thisYear"]) {
    datePatterns.push([
      wordBoundary(nlKeys["thisYear"]),
      () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        return { dateStart: start, dateEnd: now };
      },
    ]);
  }

  if (nlKeys["recently"]) {
    datePatterns.push([
      wordBoundary(nlKeys["recently"]),
      () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        return { dateStart: start, dateEnd: end };
      },
    ]);
  }

  // --- Type keywords ---
  const incomeWords = [nlKeys["income"], nlKeys["salary"], nlKeys["deposit"], nlKeys["refund"]].filter(
    Boolean
  ) as string[];
  for (const word of incomeWords) {
    typePatterns.push([wordBoundary(word), "income"]);
  }

  const expenseWords = [
    nlKeys["expense"],
    nlKeys["spent"],
    nlKeys["purchase"],
    nlKeys["bought"],
    nlKeys["paid"],
    nlKeys["bill"],
  ].filter(Boolean) as string[];
  for (const word of expenseWords) {
    typePatterns.push([wordBoundary(word), "expense"]);
  }

  // Return null if no patterns were built
  const hasAny =
    amountPatterns.length > 0 || datePatterns.length > 0 || typePatterns.length > 0;
  if (!hasAny) return null;

  return { amountPatterns, datePatterns, typePatterns };
}

// ---------------------------------------------------------------------------
// Keyword pattern cache
// ---------------------------------------------------------------------------

let cachedPatterns: LocaleKeywordPatterns | null = null;
let cachedPatternsLocale = "";

/**
 * Get or build keyword patterns for a locale.
 * Caches the result for the current locale.
 */
export function getKeywordPatterns(
  locale: string,
  messages: AbstractIntlMessages | undefined
): LocaleKeywordPatterns | null {
  if (locale === cachedPatternsLocale && cachedPatterns !== undefined) {
    return cachedPatterns;
  }

  cachedPatterns = buildKeywordPatterns(messages);
  cachedPatternsLocale = locale;
  return cachedPatterns;
}

/**
 * Clear the keyword patterns cache (useful for testing).
 */
export function clearKeywordPatternsCache(): void {
  cachedPatterns = null;
  cachedPatternsLocale = "";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Create a case-insensitive word-boundary regex for a keyword.
 * For CJK text (no word boundaries), uses simple substring matching.
 */
function wordBoundary(keyword: string): RegExp {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // CJK characters don't have word boundaries in regex
  const hasCJK = /[\u2E80-\u9FFF\uAC00-\uD7AF]/.test(keyword);
  if (hasCJK) {
    return new RegExp(escaped, "i");
  }
  return new RegExp(`\\b${escaped}\\b`, "i");
}
