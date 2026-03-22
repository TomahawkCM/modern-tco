/**
 * International Amount Parser
 * Handles locale-aware number parsing for all currency formats:
 * - US: 1,234.56
 * - EU: 1.234,56
 * - FR: 1 234,56
 * - IN: 1,23,456.78 (Indian numbering system)
 * - CH: 1'234.56
 */

import { NumberParser } from "@internationalized/number";

// Currency symbol to ISO 4217 code mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
  $: "USD",
  "€": "EUR",
  "£": "GBP",
  "¥": "JPY",
  "₹": "INR",
  "₽": "RUB",
  "₩": "KRW",
  "₪": "ILS",
  "₫": "VND",
  "₱": "PHP",
  "฿": "THB",
  "₺": "TRY",
  "₴": "UAH",
  "₸": "KZT",
  "₦": "NGN",
  "₵": "GHS",
  "﷼": "SAR",
  R$: "BRL",
  kr: "SEK", // Also NOK, DKK, ISK - ambiguous
  Kč: "CZK",
  zł: "PLN",
  Ft: "HUF",
  lei: "RON",
  лв: "BGN",
  RM: "MYR",
  Rp: "IDR",
  Rs: "INR",
  S$: "SGD",
  HK$: "HKD",
  NT$: "TWD",
  A$: "AUD",
  NZ$: "NZD",
  C$: "CAD",
  CHF: "CHF",
  CA$: "CAD",
  US$: "USD",
  AU$: "AUD",
  R: "ZAR",
  Br: "ETB",
  KSh: "KES",
};

// Pre-created parser cache for performance
const parserCache = new Map<string, NumberParser>();

function getParser(locale: string): NumberParser {
  if (!parserCache.has(locale)) {
    parserCache.set(locale, new NumberParser(locale, { style: "decimal" }));
  }
  return parserCache.get(locale)!;
}

/**
 * Parse an amount string in any locale format to a number.
 *
 * @param str - The amount string (e.g., "1.234,56", "$1,234.56", "1 234,56")
 * @param locale - BCP 47 locale hint (e.g., 'de-DE', 'en-US'). If not provided, auto-detects.
 * @returns Parsed number or null if parsing fails
 */
export function parseAmount(str: string, locale?: string): number | null {
  if (!str || typeof str !== "string") return null;

  // Clean the string
  let cleaned = str.trim();

  // Detect negative patterns
  let isNegative = false;

  // Check for parentheses notation: (1,234.56)
  const parenMatch = cleaned.match(/^\((.+)\)$/);
  if (parenMatch) {
    cleaned = parenMatch[1].trim();
    isNegative = true;
  }

  // Check for leading minus or trailing minus (some locales use trailing)
  if (cleaned.startsWith("-") || cleaned.startsWith("−") || cleaned.startsWith("–")) {
    cleaned = cleaned.substring(1).trim();
    isNegative = true;
  } else if (cleaned.endsWith("-") || cleaned.endsWith("−")) {
    cleaned = cleaned.slice(0, -1).trim();
    isNegative = true;
  }

  // Check for CR/DR suffix (common in bank statements)
  if (/\s*DR\.?\s*$/i.test(cleaned)) {
    cleaned = cleaned.replace(/\s*DR\.?\s*$/i, "").trim();
    isNegative = true;
  } else if (/\s*CR\.?\s*$/i.test(cleaned)) {
    cleaned = cleaned.replace(/\s*CR\.?\s*$/i, "").trim();
    isNegative = false;
  }

  // Remove currency symbols
  cleaned = removeCurrencySymbols(cleaned);

  if (!cleaned || cleaned.length === 0) return null;

  // Try locale-aware parsing with @internationalized/number
  if (locale) {
    try {
      const parser = getParser(locale);
      const result = parser.parse(cleaned);
      if (!isNaN(result)) {
        return isNegative ? -Math.abs(result) : result;
      }
    } catch {
      // Fall through to heuristic parsing
    }
  }

  // Heuristic parsing: detect format from the string itself
  const result = heuristicParse(cleaned);
  if (result !== null) {
    return isNegative ? -Math.abs(result) : result;
  }

  // Last resort: try common locales
  const fallbackLocales = ["en-US", "de-DE", "fr-FR", "pt-BR", "hi-IN"];
  for (const fallbackLocale of fallbackLocales) {
    try {
      const parser = getParser(fallbackLocale);
      const fallbackResult = parser.parse(cleaned);
      if (!isNaN(fallbackResult)) {
        return isNegative ? -Math.abs(fallbackResult) : fallbackResult;
      }
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * Verbose amount parsing result with disambiguation metadata.
 */
export interface AmountParseResult {
  value: number;
  /** True when the format is genuinely ambiguous (e.g., "1,234" could be 1234 or 1.234) */
  ambiguous: boolean;
  /** How the last separator was interpreted */
  interpretedAs: "decimal" | "thousands" | "unambiguous";
}

/**
 * Parse an amount string and return metadata about disambiguation.
 * Use this when you need to know whether the result could be wrong.
 *
 * @example
 * parseAmountVerbose("1,234")     // { value: 1234, ambiguous: true, interpretedAs: "thousands" }
 * parseAmountVerbose("1,234.56")  // { value: 1234.56, ambiguous: false, interpretedAs: "unambiguous" }
 * parseAmountVerbose("1,23")      // { value: 1.23, ambiguous: false, interpretedAs: "decimal" }
 */
export function parseAmountVerbose(str: string, locale?: string): AmountParseResult | null {
  const value = parseAmount(str, locale);
  if (value === null) return null;

  // Detect ambiguity: single comma/dot with exactly 3 digits after, no locale
  const cleaned = str
    .trim()
    .replace(/[()−\-–]/g, "")
    .replace(/[\s\u00A0\u202F]/g, "")
    .replace(/'/g, "");
  const stripped = removeCurrencySymbols(cleaned)
    .replace(/\s*(?:DR|CR)\.?\s*$/i, "")
    .trim();

  const dots = (stripped.match(/\./g) || []).length;
  const commas = (stripped.match(/,/g) || []).length;

  // Ambiguous case: single separator with exactly 3 digits after
  if (!locale && ((commas === 1 && dots === 0) || (dots === 1 && commas === 0))) {
    const sep = commas === 1 ? "," : ".";
    const afterSep = stripped.split(sep)[1];
    if (afterSep && afterSep.length === 3) {
      return {
        value,
        ambiguous: true,
        interpretedAs: "thousands",
      };
    }
  }

  return { value, ambiguous: false, interpretedAs: "unambiguous" };
}

/**
 * Heuristic number parsing based on the string structure.
 * Detects decimal separator based on position and count of . and ,
 */
function heuristicParse(str: string): number | null {
  // Remove spaces and thin spaces (French format: 1 234,56)
  let cleaned = str.replace(/[\s\u00A0\u202F]/g, "");

  // Remove apostrophes (Swiss format: 1'234.56)
  cleaned = cleaned.replace(/'/g, "");

  const dots = (cleaned.match(/\./g) || []).length;
  const commas = (cleaned.match(/,/g) || []).length;

  // Only digits
  if (dots === 0 && commas === 0) {
    const result = parseFloat(cleaned);
    return isNaN(result) ? null : result;
  }

  // Single comma or dot at end with exactly 2-3 digits after it = decimal separator
  const trailingDecimalMatch = cleaned.match(/^([\d.,]+)[.,](\d{1,3})$/);
  if (trailingDecimalMatch) {
    const lastSep = cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".") ? "," : ".";
    const lastSepPos = Math.max(cleaned.lastIndexOf(","), cleaned.lastIndexOf("."));
    const afterLast = cleaned.substring(lastSepPos + 1);

    if (afterLast.length <= 3) {
      // The last separator is the decimal separator
      const intPart = cleaned.substring(0, lastSepPos).replace(/[.,]/g, "");
      const result = parseFloat(`${intPart}.${afterLast}`);
      return isNaN(result) ? null : result;
    }
  }

  // Multiple dots, one comma at end → comma is decimal (EU: 1.234.567,89)
  if (dots >= 1 && commas === 1 && cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")) {
    const normalized = cleaned.replace(/\./g, "").replace(",", ".");
    const result = parseFloat(normalized);
    return isNaN(result) ? null : result;
  }

  // Multiple commas, one dot at end → dot is decimal (US: 1,234,567.89)
  if (commas >= 1 && dots === 1 && cleaned.lastIndexOf(".") > cleaned.lastIndexOf(",")) {
    const normalized = cleaned.replace(/,/g, "");
    const result = parseFloat(normalized);
    return isNaN(result) ? null : result;
  }

  // One dot, no commas → dot is decimal (1234.56) or thousands (1.234 → 1234)
  if (dots === 1 && commas === 0) {
    const afterDot = cleaned.split(".")[1];
    // If 1-2 digits after dot, treat as decimal. If 3, ambiguous but assume decimal.
    const result = parseFloat(cleaned);
    return isNaN(result) ? null : result;
  }

  // One comma, no dots → comma could be decimal (EU) or thousands (US)
  if (commas === 1 && dots === 0) {
    const afterComma = cleaned.split(",")[1];
    if (afterComma.length <= 2) {
      // Likely decimal separator (1234,56 → 1234.56)
      const normalized = cleaned.replace(",", ".");
      const result = parseFloat(normalized);
      return isNaN(result) ? null : result;
    } else if (afterComma.length === 3) {
      // Ambiguous: could be 1,234 (US thousands) or 1,234 (EU decimal with 3 places)
      // Default to treating comma as thousands separator (more common for exactly 3 digits)
      const normalized = cleaned.replace(",", "");
      const result = parseFloat(normalized);
      return isNaN(result) ? null : result;
    }
  }

  // Fallback: remove all separators except the last one
  const allSeps = [...cleaned.matchAll(/[.,]/g)];
  if (allSeps.length > 0) {
    const lastSep = allSeps[allSeps.length - 1];
    const pos = lastSep.index;
    const before = cleaned.substring(0, pos).replace(/[.,]/g, "");
    const after = cleaned.substring(pos + 1);
    const result = parseFloat(`${before}.${after}`);
    return isNaN(result) ? null : result;
  }

  return null;
}

/**
 * Remove currency symbols from a string.
 */
function removeCurrencySymbols(str: string): string {
  let result = str;

  // Remove multi-char symbols first (order matters)
  const multiCharSymbols = [
    "CA$",
    "AU$",
    "NZ$",
    "US$",
    "HK$",
    "NT$",
    "S$",
    "R$",
    "RM",
    "Rp",
    "Rs",
    "KSh",
    "Kč",
    "zł",
    "Ft",
    "lei",
    "лв",
    "Br",
    "kr",
    "CHF",
  ];
  for (const symbol of multiCharSymbols) {
    result = result.replace(new RegExp(escapeRegex(symbol), "g"), "");
  }

  // Remove single-char symbols
  result = result.replace(/[$€£¥₹₽₩₪₫₱฿₺₴₸₦₵﷼]/g, "");

  return result.trim();
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Zero-decimal currencies — amounts should never have decimal places.
 * If a parsed amount in one of these currencies has decimals, it's likely a parsing error.
 */
const ZERO_DECIMAL_CURRENCIES = new Set([
  "JPY", // Japanese Yen
  "KRW", // South Korean Won
  "VND", // Vietnamese Dong
  "IDR", // Indonesian Rupiah
  "CLP", // Chilean Peso
  "ISK", // Icelandic Krona
  "UGX", // Ugandan Shilling
  "RWF", // Rwandan Franc
  "PYG", // Paraguayan Guarani
  "GNF", // Guinean Franc
  "KMF", // Comorian Franc
  "XAF", // Central African CFA Franc
  "XOF", // West African CFA Franc
  "XPF", // CFP Franc
  "BIF", // Burundian Franc
  "DJF", // Djiboutian Franc
  "HUF", // Hungarian Forint (technically 0 decimals in practice)
  "TWD", // New Taiwan Dollar (technically 0 in practice)
]);

/**
 * Check if a currency uses zero decimal places.
 */
export function isZeroDecimalCurrency(currencyCode: string): boolean {
  return ZERO_DECIMAL_CURRENCIES.has(currencyCode.toUpperCase());
}

/**
 * Validate an amount against its currency's decimal expectations.
 * Returns a warning message if the amount has unexpected decimals.
 *
 * @param amount - Parsed numeric amount
 * @param currencyCode - ISO 4217 currency code
 * @returns Warning message or null if valid
 */
export function validateCurrencyDecimals(amount: number, currencyCode: string): string | null {
  if (!currencyCode) return null;

  const isZeroDecimal = isZeroDecimalCurrency(currencyCode);
  const hasDecimals = amount !== Math.floor(amount);

  if (isZeroDecimal && hasDecimals) {
    return `${currencyCode} is a zero-decimal currency but amount ${amount} has decimal places. This may indicate a parsing error (e.g., thousands separator misinterpreted as decimal).`;
  }

  return null;
}

/**
 * Detect the currency from a string containing currency symbols or codes.
 *
 * @param str - String that may contain currency symbols or ISO codes
 * @returns ISO 4217 currency code or null
 */
export function detectCurrencySymbol(str: string): string | null {
  if (!str) return null;

  // Check for ISO 4217 codes (3 uppercase letters at start or end)
  const isoMatch = str.match(/\b([A-Z]{3})\b/);
  if (isoMatch) {
    const code = isoMatch[1];
    // Validate it's a known currency code (common ones)
    const knownCodes = [
      "USD",
      "EUR",
      "GBP",
      "JPY",
      "CNY",
      "INR",
      "CAD",
      "AUD",
      "CHF",
      "SEK",
      "NOK",
      "DKK",
      "NZD",
      "SGD",
      "HKD",
      "KRW",
      "TWD",
      "THB",
      "MYR",
      "IDR",
      "PHP",
      "VND",
      "BRL",
      "MXN",
      "ARS",
      "CLP",
      "COP",
      "PEN",
      "ZAR",
      "NGN",
      "KES",
      "GHS",
      "EGP",
      "TRY",
      "RUB",
      "UAH",
      "PLN",
      "CZK",
      "HUF",
      "RON",
      "BGN",
      "ISK",
      "ILS",
      "SAR",
      "AED",
      "QAR",
      "KWD",
      "BHD",
      "OMR",
      "PKR",
      "BDT",
      "LKR",
      "MMK",
      "KZT",
    ];
    if (knownCodes.includes(code)) {
      return code;
    }
  }

  // Check for multi-char symbols (check longest first)
  const sortedSymbols = Object.entries(CURRENCY_SYMBOLS).sort((a, b) => b[0].length - a[0].length);

  for (const [symbol, code] of sortedSymbols) {
    if (str.includes(symbol)) {
      return code;
    }
  }

  return null;
}
