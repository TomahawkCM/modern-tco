/**
 * Date Formatting Utilities
 *
 * Timezone-aware date formatting with locale support
 */

import type { SupportedLocale } from '../config';

/**
 * Format date with locale-specific formatting
 *
 * @param date - Date to format (Date object, timestamp, or ISO string)
 * @param locale - Locale for formatting rules
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date(), 'en-US')  // "12/29/2025"
 * formatDate(new Date(), 'ko-KR')  // "2025. 12. 29."
 * formatDate(new Date(), 'en-IN')  // "29/12/2025"
 */
export function formatDate(
  date: Date | number | string,
  locale: SupportedLocale = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date:', date);
      return 'Invalid date';
    }

    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
}

/**
 * Format date with time
 *
 * @param date - Date to format
 * @param locale - Locale for formatting rules
 * @param includeSeconds - Whether to include seconds
 * @returns Formatted date and time string
 *
 * @example
 * formatDateTime(new Date(), 'en-US')  // "12/29/2025, 4:30 PM"
 * formatDateTime(new Date(), 'ko-KR')  // "2025. 12. 29. 오후 4:30"
 */
export function formatDateTime(
  date: Date | number | string,
  locale: SupportedLocale = 'en-US',
  includeSeconds: boolean = false
): string {
  return formatDate(date, locale, {
    dateStyle: 'short',
    timeStyle: includeSeconds ? 'medium' : 'short',
  });
}

/**
 * Format time only
 *
 * @param date - Date to format
 * @param locale - Locale for formatting rules
 * @param includeSeconds - Whether to include seconds
 * @returns Formatted time string
 *
 * @example
 * formatTime(new Date(), 'en-US')  // "4:30 PM"
 * formatTime(new Date(), 'ko-KR')  // "오후 4:30"
 */
export function formatTime(
  date: Date | number | string,
  locale: SupportedLocale = 'en-US',
  includeSeconds: boolean = false
): string {
  return formatDate(date, locale, {
    timeStyle: includeSeconds ? 'medium' : 'short',
  });
}

/**
 * Format date in long format
 *
 * @param date - Date to format
 * @param locale - Locale for formatting rules
 * @returns Long formatted date string
 *
 * @example
 * formatLongDate(new Date(), 'en-US')  // "December 29, 2025"
 * formatLongDate(new Date(), 'ko-KR')  // "2025년 12월 29일"
 */
export function formatLongDate(date: Date | number | string, locale: SupportedLocale = 'en-US'): string {
  return formatDate(date, locale, {
    dateStyle: 'long',
  });
}

/**
 * Format date relative to now (e.g., "2 days ago", "in 3 hours")
 * Uses Intl.RelativeTimeFormat
 *
 * @param date - Date to format
 * @param locale - Locale for formatting rules
 * @returns Relative time string
 *
 * @example
 * formatRelativeTime(yesterday, 'en-US')  // "1 day ago"
 * formatRelativeTime(tomorrow, 'ko-KR')   // "1일 후"
 */
export function formatRelativeTime(date: Date | number | string, locale: SupportedLocale = 'en-US'): string {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    const now = new Date();
    const diffMs = dateObj.getTime() - now.getTime();
    const diffSeconds = Math.round(diffMs / 1000);
    const diffMinutes = Math.round(diffSeconds / 60);
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);
    const diffWeeks = Math.round(diffDays / 7);
    const diffMonths = Math.round(diffDays / 30);
    const diffYears = Math.round(diffDays / 365);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (Math.abs(diffYears) >= 1) {
      return rtf.format(diffYears, 'year');
    } else if (Math.abs(diffMonths) >= 1) {
      return rtf.format(diffMonths, 'month');
    } else if (Math.abs(diffWeeks) >= 1) {
      return rtf.format(diffWeeks, 'week');
    } else if (Math.abs(diffDays) >= 1) {
      return rtf.format(diffDays, 'day');
    } else if (Math.abs(diffHours) >= 1) {
      return rtf.format(diffHours, 'hour');
    } else if (Math.abs(diffMinutes) >= 1) {
      return rtf.format(diffMinutes, 'minute');
    } else {
      return rtf.format(diffSeconds, 'second');
    }
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return 'Invalid date';
  }
}

/**
 * Format date with timezone awareness
 *
 * @param date - Date to format
 * @param locale - Locale for formatting rules
 * @param timezone - IANA timezone (e.g., 'America/New_York', 'Asia/Kolkata')
 * @param options - Additional formatting options
 * @returns Formatted date string in specified timezone
 *
 * @example
 * formatDateWithTimezone(new Date(), 'en-US', 'America/New_York')
 * formatDateWithTimezone(new Date(), 'en-IN', 'Asia/Kolkata')
 */
export function formatDateWithTimezone(
  date: Date | number | string,
  locale: SupportedLocale = 'en-US',
  timezone: string,
  options?: Intl.DateTimeFormatOptions
): string {
  return formatDate(date, locale, {
    ...options,
    timeZone: timezone,
  });
}

/**
 * Get user's timezone
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Format date for input fields (YYYY-MM-DD)
 *
 * @param date - Date to format
 * @returns ISO date string (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date | number | string): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return '';
  }

  return dateObj.toISOString().split('T')[0];
}

/**
 * Parse date from input field (YYYY-MM-DD)
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object or null if invalid
 */
export function parseDateFromInput(dateString: string): Date | null {
  if (!dateString) return null;

  const date = new Date(dateString + 'T00:00:00');
  return isNaN(date.getTime()) ? null : date;
}
