const GENERIC_TOKENS = new Set([
  "PAYMENT",
  "TRANSFER",
  "DEPOSIT",
  "WITHDRAWAL",
  "DEBIT",
  "CREDIT",
  "PURCHASE",
  "ONLINE PURCHASE",
  "PAYMENT RECEIVED",
  "DIRECT DEPOSIT",
  "E-TRANSFER",
  "INTERAC",
  "ATM",
  "FEE",
  "INTEREST",
  "CHARGE",
  "REFUND",
]);

const DATE_PATTERN =
  /\s+\d{1,2}(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\d{2,4}$/i;
const REF_NUMBER_PATTERN = /\s+#\d+$/;
const LOCATION_SUFFIX = /\s{2,}[A-Z]{2,}\s+[A-Z]{2,3}\s*$/;
const TRAILING_DIGITS = /\s+\d{3,}$/;

/**
 * Extract a normalized merchant token from a transaction description.
 * Returns null if the description is generic, too short, or all digits.
 * Pure function — no side effects.
 */
export function extractMerchantToken(description: string): string | null {
  let token = description.trim().toUpperCase();

  if (token.length < 3) return null;

  // Strip trailing noise in order of specificity
  token = token
    .replace(DATE_PATTERN, "")
    .replace(REF_NUMBER_PATTERN, "")
    .replace(TRAILING_DIGITS, "")
    .replace(LOCATION_SUFFIX, "")
    .trim();

  if (token.length < 3) return null;
  if (/^\d+$/.test(token)) return null;
  if (GENERIC_TOKENS.has(token)) return null;

  return token;
}
