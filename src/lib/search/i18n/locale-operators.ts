/**
 * Localized Search Operators
 *
 * Maps localized operator names to canonical English operators.
 * This allows users to type "betrag:>50" (German) or "カテゴリー:食品" (Japanese)
 * which gets canonicalized to "amount:>50" / "category:食品" before parsing.
 *
 * English operators always work in every locale — canonicalization is additive.
 */

import type { AbstractIntlMessages } from "next-intl";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Map of localized operator → canonical English operator */
export type OperatorMap = Record<string, string>;

/** Map of localized value → canonical English value (for type:, date: etc.) */
export type ValueMap = Record<string, string>;

export interface LocalizedOperators {
  /** Operator prefix map: e.g. { "betrag": "amount", "kategorie": "category" } */
  operators: OperatorMap;
  /** Value map for type: operator: e.g. { "einnahmen": "income", "ausgaben": "expense" } */
  typeValues: ValueMap;
  /** Value map for date: operator: e.g. { "heute": "today", "gestern": "yesterday" } */
  dateValues: ValueMap;
  /** Value map for is: operator: e.g. { "wiederkehrend": "recurring" } */
  isValues: ValueMap;
}

// ---------------------------------------------------------------------------
// Canonical English operators (always available)
// ---------------------------------------------------------------------------

const CANONICAL_OPERATORS = new Set([
  "amount",
  "category",
  "cat",
  "date",
  "account",
  "acc",
  "type",
  "tag",
  "merchant",
  "from",
  "is",
]);

const CANONICAL_TYPE_VALUES = new Set(["income", "expense"]);
const CANONICAL_DATE_VALUES = new Set([
  "today",
  "yesterday",
  "last7",
  "lastweek",
  "last30",
  "lastmonth",
  "thismonth",
  "thisyear",
  "lastyear",
]);
const CANONICAL_IS_VALUES = new Set(["recurring", "split", "income", "expense"]);

// ---------------------------------------------------------------------------
// Build operator map from translations
// ---------------------------------------------------------------------------

/**
 * Build a LocalizedOperators map from next-intl translation messages.
 *
 * Expects the messages to contain a `searchOperators` namespace with keys like:
 * - `amount`, `category`, `date`, `account`, `type`, `tag`, `merchant`, `is`
 * - `typeIncome`, `typeExpense`
 * - `dateToday`, `dateYesterday`, `dateLast7`, etc.
 * - `isRecurring`, `isSplit`
 *
 * @param messages - The translations object for the current locale
 * @returns A LocalizedOperators structure for canonicalization
 */
export function buildOperatorMap(
  messages: AbstractIntlMessages | undefined
): LocalizedOperators | null {
  if (!messages) return null;

  const searchOps = messages["searchOperators"] as Record<string, string> | undefined;
  if (!searchOps) return null;

  const operators: OperatorMap = {};
  const typeValues: ValueMap = {};
  const dateValues: ValueMap = {};
  const isValues: ValueMap = {};

  // Operator prefixes
  const operatorKeys: Record<string, string> = {
    amount: "amount",
    category: "category",
    date: "date",
    account: "account",
    type: "type",
    tag: "tag",
    merchant: "merchant",
    is: "is",
  };

  for (const [msgKey, canonical] of Object.entries(operatorKeys)) {
    const localized = searchOps[msgKey];
    if (localized && typeof localized === "string") {
      const lowerLocalized = localized.toLowerCase();
      if (!CANONICAL_OPERATORS.has(lowerLocalized)) {
        operators[lowerLocalized] = canonical;
      }
    }
  }

  // Type values
  const typeKeys: Record<string, string> = {
    typeIncome: "income",
    typeExpense: "expense",
  };
  for (const [msgKey, canonical] of Object.entries(typeKeys)) {
    const localized = searchOps[msgKey];
    if (localized && typeof localized === "string") {
      const lowerLocalized = localized.toLowerCase();
      if (!CANONICAL_TYPE_VALUES.has(lowerLocalized)) {
        typeValues[lowerLocalized] = canonical;
      }
    }
  }

  // Date values
  const dateKeys: Record<string, string> = {
    dateToday: "today",
    dateYesterday: "yesterday",
    dateLast7: "last7",
    dateLastWeek: "lastweek",
    dateLast30: "last30",
    dateLastMonth: "lastmonth",
    dateThisMonth: "thismonth",
    dateThisYear: "thisyear",
    dateLastYear: "lastyear",
  };
  for (const [msgKey, canonical] of Object.entries(dateKeys)) {
    const localized = searchOps[msgKey];
    if (localized && typeof localized === "string") {
      const lowerLocalized = localized.toLowerCase();
      if (!CANONICAL_DATE_VALUES.has(lowerLocalized)) {
        dateValues[lowerLocalized] = canonical;
      }
    }
  }

  // Is: values
  const isKeys: Record<string, string> = {
    isRecurring: "recurring",
    isSplit: "split",
    isIncome: "income",
    isExpense: "expense",
  };
  for (const [msgKey, canonical] of Object.entries(isKeys)) {
    const localized = searchOps[msgKey];
    if (localized && typeof localized === "string") {
      const lowerLocalized = localized.toLowerCase();
      if (!CANONICAL_IS_VALUES.has(lowerLocalized)) {
        isValues[lowerLocalized] = canonical;
      }
    }
  }

  // Return null if no localized operators were found (English locale)
  const hasAny =
    Object.keys(operators).length > 0 ||
    Object.keys(typeValues).length > 0 ||
    Object.keys(dateValues).length > 0 ||
    Object.keys(isValues).length > 0;

  if (!hasAny) return null;

  return { operators, typeValues, dateValues, isValues };
}

// ---------------------------------------------------------------------------
// Query canonicalization
// ---------------------------------------------------------------------------

/**
 * Replace localized operators in a query string with canonical English.
 *
 * Examples (German):
 *   "betrag:>50 kategorie:Lebensmittel" → "amount:>50 category:Lebensmittel"
 *   "datum:heute typ:ausgaben" → "date:today type:expense"
 *
 * English operators are always preserved unchanged.
 *
 * @param query - The raw user query
 * @param localizedOps - The locale's operator map (null = English, skip canonicalization)
 * @returns Canonicalized query string
 */
export function canonicalizeQuery(
  query: string,
  localizedOps: LocalizedOperators | null
): string {
  if (!localizedOps || !query) return query;

  let result = query;

  // Replace localized operator prefixes: "betrag:" → "amount:"
  // Uses adaptive boundary: \b for Latin scripts, lookaround for CJK
  for (const [localized, canonical] of Object.entries(localizedOps.operators)) {
    const pattern = new RegExp(`${adaptiveBoundary(localized, "start")}${escapeRegex(localized)}:`, "gi");
    result = result.replace(pattern, `${canonical}:`);
  }

  // Replace localized type values: "type:ausgaben" → "type:expense"
  for (const [localized, canonical] of Object.entries(localizedOps.typeValues)) {
    const pattern = new RegExp(`(type:)${escapeRegex(localized)}${adaptiveBoundary(localized, "end")}`, "gi");
    result = result.replace(pattern, `$1${canonical}`);
  }

  // Replace localized date values: "date:heute" → "date:today"
  for (const [localized, canonical] of Object.entries(localizedOps.dateValues)) {
    const pattern = new RegExp(`(date:)${escapeRegex(localized)}${adaptiveBoundary(localized, "end")}`, "gi");
    result = result.replace(pattern, `$1${canonical}`);
  }

  // Replace localized is: values: "is:wiederkehrend" → "is:recurring"
  for (const [localized, canonical] of Object.entries(localizedOps.isValues)) {
    const pattern = new RegExp(`(is:)${escapeRegex(localized)}${adaptiveBoundary(localized, "end")}`, "gi");
    result = result.replace(pattern, `$1${canonical}`);
  }

  // Also handle negated operators: "-betrag:" → "-amount:"
  for (const [localized, canonical] of Object.entries(localizedOps.operators)) {
    const pattern = new RegExp(`-${escapeRegex(localized)}:`, "gi");
    result = result.replace(pattern, `-${canonical}:`);
  }

  return result;
}

/**
 * Escape special regex characters in a string.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Check if text contains CJK / non-Latin characters where \b won't work */
const HAS_CJK = /[\u2E80-\u9FFF\uAC00-\uD7AF\u3040-\u30FF\u0E00-\u0E7F\u1780-\u17FF\u1000-\u109F]/;

/**
 * Create an adaptive word boundary pattern.
 * `\b` only works for Latin word characters (\w). For CJK operators,
 * we skip the boundary entirely since CJK characters are distinctive
 * enough to avoid false positives.
 */
function adaptiveBoundary(keyword: string, _position: "start" | "end"): string {
  if (HAS_CJK.test(keyword)) {
    return "";
  }
  return "\\b";
}

// ---------------------------------------------------------------------------
// Operator map cache
// ---------------------------------------------------------------------------

let cachedOperatorMap: LocalizedOperators | null = null;
let cachedOperatorLocale = "";

/**
 * Get or build the operator map for a locale.
 * Caches the result for the current locale.
 */
export function getOperatorMap(
  locale: string,
  messages: AbstractIntlMessages | undefined
): LocalizedOperators | null {
  if (locale === cachedOperatorLocale && cachedOperatorMap !== undefined) {
    return cachedOperatorMap;
  }

  cachedOperatorMap = buildOperatorMap(messages);
  cachedOperatorLocale = locale;
  return cachedOperatorMap;
}

/**
 * Clear the operator map cache (useful for testing).
 */
export function clearOperatorMapCache(): void {
  cachedOperatorMap = null;
  cachedOperatorLocale = "";
}
