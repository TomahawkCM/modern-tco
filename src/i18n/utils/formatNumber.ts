/**
 * Number Formatting Utilities
 *
 * Locale-aware number formatting with special support for Indian numbering system (lakh/crore)
 */

import type { SupportedLocale } from '../config';

/**
 * Format number with locale-specific grouping
 *
 * @param value - Number to format
 * @param locale - Locale for formatting rules
 * @param options - Additional Intl.NumberFormat options
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1234567.89, 'en-US')  // "1,234,567.89"
 * formatNumber(1234567.89, 'en-IN')  // "12,34,567.89" (lakh format)
 * formatNumber(1234567, 'ko-KR')     // "1,234,567"
 */
export function formatNumber(
  value: number,
  locale: SupportedLocale = 'en-US',
  options?: Intl.NumberFormatOptions
): string {
  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch (error) {
    console.error('Number formatting error:', error);
    return value.toString();
  }
}

/**
 * Format number with compact notation (K, M, B)
 *
 * @param value - Number to format
 * @param locale - Locale for formatting rules
 * @returns Compact formatted string
 *
 * @example
 * formatCompactNumber(1500, 'en-US')      // "1.5K"
 * formatCompactNumber(1500000, 'en-US')   // "1.5M"
 * formatCompactNumber(1500000, 'ko-KR')   // "150만"
 */
export function formatCompactNumber(value: number, locale: SupportedLocale = 'en-US'): string {
  try {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    }).format(value);
  } catch (error) {
    console.error('Compact number formatting error:', error);
    return value.toString();
  }
}

/**
 * Format number as percentage
 *
 * @param value - Decimal value (0.5 = 50%)
 * @param locale - Locale for formatting rules
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 *
 * @example
 * formatPercent(0.1234, 'en-US', 2)  // "12.34%"
 * formatPercent(0.5, 'en-US', 0)     // "50%"
 */
export function formatPercent(
  value: number,
  locale: SupportedLocale = 'en-US',
  decimals: number = 2
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch (error) {
    console.error('Percentage formatting error:', error);
    return `${(value * 100).toFixed(decimals)}%`;
  }
}

/**
 * Format number with Indian numbering system labels (lakh, crore)
 * Only used for en-IN locale
 *
 * @param value - Number to format
 * @returns Formatted string with lakh/crore labels
 *
 * @example
 * formatIndianNumber(100000)    // "1 lakh"
 * formatIndianNumber(10000000)  // "1 crore"
 * formatIndianNumber(12500000)  // "1.25 crore"
 */
export function formatIndianNumber(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 10000000) {
    // Crore (10 million)
    const crores = absValue / 10000000;
    return `${sign}${crores.toFixed(2)} crore`;
  } else if (absValue >= 100000) {
    // Lakh (100 thousand)
    const lakhs = absValue / 100000;
    return `${sign}${lakhs.toFixed(2)} lakh`;
  } else {
    return formatNumber(value, 'en-IN');
  }
}

/**
 * Format number with appropriate grouping based on locale
 *
 * @param value - Number to format
 * @param locale - Locale for formatting rules
 * @param useIndianLabels - For en-IN, use lakh/crore labels instead of numeric
 * @returns Formatted number string
 */
export function formatNumberWithLocale(
  value: number,
  locale: SupportedLocale = 'en-US',
  useIndianLabels: boolean = false
): string {
  if (locale === 'en-IN' && useIndianLabels) {
    return formatIndianNumber(value);
  }
  return formatNumber(value, locale);
}

/**
 * Parse formatted number string back to number
 * Handles locale-specific group separators
 *
 * @param formattedValue - Formatted number string
 * @param locale - Locale used for formatting
 * @returns Parsed number or NaN if invalid
 */
export function parseFormattedNumber(formattedValue: string, locale: SupportedLocale = 'en-US'): number {
  // Get decimal separator for locale
  const decimalSeparator = new Intl.NumberFormat(locale).format(1.1).charAt(1);

  // Remove all characters except digits and decimal separator
  const cleaned = formattedValue
    .replace(/[^\d.,]/g, '')
    .replace(decimalSeparator === ',' ? /\./g : /,/g, '')
    .replace(decimalSeparator, '.');

  return parseFloat(cleaned);
}
