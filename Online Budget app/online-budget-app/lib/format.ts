/**
 * Locale-aware formatting utilities for numbers, currencies, and percentages.
 */

/**
 * Format a number as currency using Intl.NumberFormat.
 */
export function formatCurrency(
  value: number,
  currency: string,
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}

/**
 * Format a number with locale-aware grouping.
 */
export function formatNumber(
  value: number,
  locale: string = "en-US",
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

/**
 * Format a decimal (0-1) as a percentage.
 */
export function formatPercent(
  value: number,
  locale: string = "en-US",
  decimals: number = 1
): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Parse a locale-formatted number string back to a number.
 * Handles locale-specific decimal separators and grouping.
 */
export function parseFormattedNumber(
  input: string,
  locale: string = "en-US"
): number {
  if (!input || input.trim() === "") return NaN;

  // Detect the decimal separator for this locale
  const parts = new Intl.NumberFormat(locale).formatToParts(1234.5);
  const decimalSep = parts.find((p) => p.type === "decimal")?.value || ".";
  const groupSep = parts.find((p) => p.type === "group")?.value || ",";

  // Strip everything except digits, decimal separator, and minus sign
  let cleaned = input.replace(/[^\d\-]/g, (char) => {
    if (char === decimalSep) return ".";
    if (char === groupSep) return "";
    return "";
  });

  // Handle case where comma is decimal separator and was replaced
  if (decimalSep === ",") {
    cleaned = input
      .replace(new RegExp(`\\${groupSep}`, "g"), "")
      .replace(decimalSep, ".");
    // Keep only digits, dot, and minus
    cleaned = cleaned.replace(/[^\d.\-]/g, "");
  }

  return parseFloat(cleaned);
}

/**
 * Get the number of decimal places for a currency.
 */
export function getCurrencyDecimals(currency: string): number {
  try {
    const parts = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).formatToParts(1);
    const fraction = parts.find((p) => p.type === "fraction");
    return fraction ? fraction.value.length : 0;
  } catch {
    return 2;
  }
}

/**
 * Get the currency symbol for display.
 */
export function getCurrencySymbol(currency: string, locale: string = "en-US"): string {
  try {
    const parts = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "symbol",
    }).formatToParts(0);
    return parts.find((p) => p.type === "currency")?.value || currency;
  } catch {
    return currency;
  }
}
