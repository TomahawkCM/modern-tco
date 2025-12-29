/**
 * Currency Formatting Utilities
 *
 * Multi-currency support with locale-aware formatting
 * IMPORTANT: Never sum amounts across different currencies
 */

import type { SupportedLocale } from '../config';

export type CurrencyCode = 'USD' | 'CAD' | 'INR' | 'KRW' | 'SGD' | 'PHP' | 'EUR' | 'GBP';

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
  locale: SupportedLocale = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'KRW' ? 0 : 2,
      maximumFractionDigits: currency === 'KRW' ? 0 : 2,
    }).format(amount);
  } catch (error) {
    console.error('Currency formatting error:', error);
    return `${currency} ${amount.toFixed(2)}`;
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
  locale: SupportedLocale = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: currency === 'KRW' ? 0 : 2,
      maximumFractionDigits: currency === 'KRW' ? 0 : 2,
    }).format(amount);
  } catch (error) {
    console.error('Currency value formatting error:', error);
    return amount.toFixed(currency === 'KRW' ? 0 : 2);
  }
}

/**
 * Get currency symbol for a currency code
 */
export function getCurrencySymbol(currency: CurrencyCode, locale: SupportedLocale = 'en-US'): string {
  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(0);

    // Extract symbol by removing digits and spaces
    return formatted.replace(/[\d\s]/g, '');
  } catch (error) {
    console.error('Currency symbol extraction error:', error);
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
export function sumCurrencyAmounts(
  items: Array<{ amount: number; currency: CurrencyCode }>
): { total: number; currency: CurrencyCode } {
  if (items.length === 0) {
    throw new Error('Cannot sum empty array of currency amounts');
  }

  if (!validateSameCurrency(items)) {
    throw new Error('Cannot sum amounts with different currencies');
  }

  const total = items.reduce((sum, item) => sum + item.amount, 0);
  return { total, currency: items[0].currency };
}
