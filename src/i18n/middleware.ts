/**
 * i18n Middleware Configuration
 *
 * Locale detection and negotiation for next-intl
 * This file will be imported by Next.js middleware when implemented
 */

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type SupportedLocale } from "./config";

/**
 * Get locale from request headers (Accept-Language)
 */
export function getLocaleFromHeaders(acceptLanguage?: string | null): SupportedLocale {
  if (!acceptLanguage) {
    return DEFAULT_LOCALE;
  }

  // Parse Accept-Language header
  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [locale, q = "1"] = lang.trim().split(";q=");
      return {
        locale: locale.trim(),
        quality: parseFloat(q),
      };
    })
    .sort((a, b) => b.quality - a.quality);

  // Try to find exact match
  for (const { locale } of languages) {
    if (SUPPORTED_LOCALES.includes(locale as SupportedLocale)) {
      return locale as SupportedLocale;
    }
  }

  // Try to find language prefix match
  for (const { locale } of languages) {
    const langPrefix = locale.split("-")[0];
    const match = SUPPORTED_LOCALES.find((supported) => supported.startsWith(langPrefix));
    if (match) {
      return match;
    }
  }

  return DEFAULT_LOCALE;
}

/**
 * Middleware configuration for next-intl
 * To be used in middleware.ts at project root
 */
export const localeConfig = {
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localeDetection: true,
};
