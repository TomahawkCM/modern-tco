/**
 * i18n Configuration
 *
 * Defines supported locales, default locale, and locale validation
 */

export type SupportedLocale = 'en-US' | 'en-IN' | 'ko-KR' | 'en-XA';

/**
 * Supported locales (includes dev-only pseudo-locale en-XA in development)
 */
export const SUPPORTED_LOCALES: SupportedLocale[] =
  process.env.NODE_ENV === 'development'
    ? ['en-US', 'en-IN', 'ko-KR', 'en-XA']
    : ['en-US', 'en-IN', 'ko-KR'];

export const DEFAULT_LOCALE: SupportedLocale = 'en-US';

/**
 * Locale metadata for display and formatting
 */
export const LOCALE_METADATA = {
  'en-US': {
    label: 'English (US)',
    dir: 'ltr' as const,
    currency: 'USD',
    numberingSystem: 'standard' as const,
  },
  'en-IN': {
    label: 'English (India)',
    dir: 'ltr' as const,
    currency: 'INR',
    numberingSystem: 'lakh-crore' as const,
  },
  'ko-KR': {
    label: '한국어 (Korean)',
    dir: 'ltr' as const,
    currency: 'KRW',
    numberingSystem: 'standard' as const,
  },
  'en-XA': {
    label: '[Þšéüðó-Ļóçálé ÉÑ-XÁ~~~] (Dev Only)',
    dir: 'ltr' as const,
    currency: 'USD',
    numberingSystem: 'standard' as const,
  },
} as const;

/**
 * Validate if a locale is supported
 */
export function isValidLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

/**
 * Get locale from string with fallback to default
 */
export function getValidLocale(locale?: string | null): SupportedLocale {
  if (locale && isValidLocale(locale)) {
    return locale;
  }
  return DEFAULT_LOCALE;
}

/**
 * Get browser's preferred locale from supported locales
 */
export function getBrowserLocale(): SupportedLocale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  const browserLang = navigator.language || navigator.languages?.[0];

  // Try exact match first
  if (browserLang && isValidLocale(browserLang)) {
    return browserLang;
  }

  // Try language prefix match (e.g., 'ko' matches 'ko-KR')
  const langPrefix = browserLang?.split('-')[0];
  const prefixMatch = SUPPORTED_LOCALES.find((locale) => locale.startsWith(langPrefix || ''));

  return prefixMatch || DEFAULT_LOCALE;
}
