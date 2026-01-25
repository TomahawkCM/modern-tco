/**
 * Currency Formatting Utilities
 *
 * Multi-currency support with locale-aware formatting
 * Supports all ISO 4217 currency codes with proper decimal handling
 * IMPORTANT: Never sum amounts across different currencies
 */

import type { SupportedLocale } from "../config";

// Common currency codes for type hints (any ISO 4217 code is valid)
export type CurrencyCode = string;

/**
 * Zero-decimal currencies that don't use fractional units
 * These currencies are formatted without decimal places
 */
export const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF", // Burundian Franc
  "CLP", // Chilean Peso
  "DJF", // Djiboutian Franc
  "GNF", // Guinean Franc
  "ISK", // Icelandic Krona
  "JPY", // Japanese Yen
  "KMF", // Comorian Franc
  "KRW", // South Korean Won
  "PYG", // Paraguayan Guarani
  "RWF", // Rwandan Franc
  "UGX", // Ugandan Shilling
  "VND", // Vietnamese Dong
  "VUV", // Vanuatu Vatu
  "XAF", // Central African CFA Franc
  "XOF", // West African CFA Franc
  "XPF", // CFP Franc
  "HUF", // Hungarian Forint (often displayed without decimals)
  "TWD", // New Taiwan Dollar (often displayed without decimals)
  "IDR", // Indonesian Rupiah (often displayed without decimals)
]);

/**
 * Get the number of decimal places for a currency
 *
 * @param currency - ISO 4217 currency code
 * @returns Number of decimal places (0 for zero-decimal currencies, 2 otherwise)
 */
export function getCurrencyDecimals(currency: string): number {
  return ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase()) ? 0 : 2;
}

/**
 * Format amount with currency symbol
 *
 * @param amount - Numeric amount to format
 * @param currency - Currency code (USD, INR, KRW, etc.)
 * @param locale - Locale for formatting rules
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1234.56, 'USD', 'en-US') // "$1,234.56"
 * formatCurrency(1234.56, 'INR', 'en-IN') // "₹1,234.56"
 * formatCurrency(1234, 'KRW', 'ko-KR')    // "₩1,234"
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode,
  locale: SupportedLocale = "en-US"
): string {
  try {
    const decimals = getCurrencyDecimals(currency);
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  } catch (error) {
    console.error("Currency formatting error:", error);
    const decimals = getCurrencyDecimals(currency);
    return `${currency} ${amount.toFixed(decimals)}`;
  }
}

/**
 * Format amount without currency symbol
 *
 * @param amount - Numeric amount
 * @param currency - Currency code (for decimal precision)
 * @param locale - Locale for formatting rules
 * @returns Formatted number string
 */
export function formatCurrencyValue(
  amount: number,
  currency: CurrencyCode,
  locale: SupportedLocale = "en-US"
): string {
  try {
    const decimals = getCurrencyDecimals(currency);
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  } catch (error) {
    console.error("Currency value formatting error:", error);
    const decimals = getCurrencyDecimals(currency);
    return amount.toFixed(decimals);
  }
}

/**
 * Get currency symbol for a currency code
 */
export function getCurrencySymbol(
  currency: CurrencyCode,
  locale: SupportedLocale = "en-US"
): string {
  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(0);

    // Extract symbol by removing digits and spaces
    return formatted.replace(/[\d\s]/g, "");
  } catch (error) {
    console.error("Currency symbol extraction error:", error);
    return currency;
  }
}

/**
 * Validate that all amounts in an array use the same currency
 * Returns true if all currencies match, false otherwise
 */
export function validateSameCurrency(items: Array<{ currency: CurrencyCode }>): boolean {
  if (items.length === 0) return true;
  const firstCurrency = items[0].currency;
  return items.every((item) => item.currency === firstCurrency);
}

/**
 * WARNING: Only use this if you've validated currencies match
 * Throws error if currencies don't match
 */
export function sumCurrencyAmounts(items: Array<{ amount: number; currency: CurrencyCode }>): {
  total: number;
  currency: CurrencyCode;
} {
  if (items.length === 0) {
    throw new Error("Cannot sum empty array of currency amounts");
  }

  if (!validateSameCurrency(items)) {
    throw new Error("Cannot sum amounts with different currencies");
  }

  const total = items.reduce((sum, item) => sum + item.amount, 0);
  return { total, currency: items[0].currency };
}
