/**
 * RTL (Right-to-Left) Support Utilities
 *
 * Provides hooks and utilities for RTL language support in the Budget App
 * Supports: Arabic (ar-AE, ar-SA), Hebrew (he-IL), Persian (fa-IR), Urdu (ur-PK)
 *
 * Usage:
 * ```tsx
 * import { useRTL, useDirection } from '@/lib/rtl-utils';
 *
 * function MyComponent() {
 *   const isRTL = useRTL();
 *   const dir = useDirection();
 *
 *   return <div dir={dir}>{isRTL ? 'RTL mode' : 'LTR mode'}</div>;
 * }
 * ```
 */

import { LOCALE_METADATA, type SupportedLocale } from '@/i18n/config';
import { getCurrentLocale } from './locale-storage';

/**
 * Get the text direction for a given locale
 * @param locale - The locale to check (e.g., 'ar-SA', 'en-US')
 * @returns 'rtl' or 'ltr'
 */
export function getLocaleDirection(locale: SupportedLocale): 'rtl' | 'ltr' {
  return LOCALE_METADATA[locale]?.dir || 'ltr';
}

/**
 * Check if a locale is RTL
 * @param locale - The locale to check
 * @returns true if the locale is RTL
 */
export function isRTLLocale(locale: SupportedLocale): boolean {
  return getLocaleDirection(locale) === 'rtl';
}

/**
 * Get the current text direction based on the active locale
 * @returns 'rtl' or 'ltr'
 */
export function getCurrentDirection(): 'rtl' | 'ltr' {
  if (typeof window === 'undefined') {
    return 'ltr'; // Default for SSR
  }

  const locale = getCurrentLocale();
  return getLocaleDirection(locale);
}

/**
 * Check if the current locale is RTL
 * @returns true if current locale is RTL
 */
export function isCurrentLocaleRTL(): boolean {
  return getCurrentDirection() === 'rtl';
}

/**
 * React hook to get RTL status for the current locale
 *
 * Note: This is a client-side only hook. For server-side rendering,
 * use getLocaleDirection() with the locale passed from the server.
 *
 * @returns true if the current locale is RTL
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isRTL = useRTL();
 *
 *   return (
 *     <div className={isRTL ? 'text-right' : 'text-left'}>
 *       Content
 *     </div>
 *   );
 * }
 * ```
 */
export function useRTL(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return isCurrentLocaleRTL();
}

/**
 * React hook to get text direction for the current locale
 *
 * @returns 'rtl' or 'ltr'
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const dir = useDirection();
 *
 *   return <div dir={dir}>Content</div>;
 * }
 * ```
 */
export function useDirection(): 'rtl' | 'ltr' {
  if (typeof window === 'undefined') {
    return 'ltr';
  }

  return getCurrentDirection();
}

/**
 * Get RTL-aware alignment class
 * Automatically flips 'left' and 'right' based on text direction
 *
 * @param align - The alignment ('left' or 'right')
 * @returns The appropriate alignment for the current direction
 *
 * @example
 * ```tsx
 * const alignment = getRTLAlignment('left'); // returns 'right' in RTL mode
 * ```
 */
export function getRTLAlignment(align: 'left' | 'right'): 'left' | 'right' {
  const isRTL = isCurrentLocaleRTL();

  if (!isRTL) return align;

  // Flip alignment in RTL mode
  return align === 'left' ? 'right' : 'left';
}

/**
 * RTL-aware padding/margin utilities
 * Converts 'start' and 'end' to appropriate 'left' or 'right' based on direction
 *
 * @param side - 'start' or 'end'
 * @returns 'left' or 'right' based on text direction
 *
 * @example
 * ```tsx
 * const paddingClass = `p${getRTLSide('start')}-4`; // 'pl-4' in LTR, 'pr-4' in RTL
 * ```
 */
export function getRTLSide(side: 'start' | 'end'): 'left' | 'right' {
  const isRTL = isCurrentLocaleRTL();

  if (side === 'start') {
    return isRTL ? 'right' : 'left';
  } else {
    return isRTL ? 'left' : 'right';
  }
}

/**
 * List of RTL locale codes
 * Useful for validation and filtering
 */
export const RTL_LOCALES: SupportedLocale[] = [
  'ar-AE',  // Arabic (UAE)
  'ar-SA',  // Arabic (Saudi Arabia)
  'fa-IR',  // Persian (Iran)
  'he-IL',  // Hebrew (Israel)
  'ur-PK',  // Urdu (Pakistan)
];

/**
 * Check if a locale code is in the RTL list
 * @param locale - The locale to check
 * @returns true if the locale is RTL
 */
export function isRTLLocaleCode(locale: string): boolean {
  return RTL_LOCALES.includes(locale as SupportedLocale);
}
