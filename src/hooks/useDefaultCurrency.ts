"use client";

import { useLocale } from "next-intl";
import { LOCALE_METADATA, type SupportedLocale } from "@/i18n/config";
import { getLocalePreferences } from "@/lib/locale-storage";

/**
 * Returns the user's preferred currency.
 * Checks localStorage first (user's explicit choice), then falls back to locale metadata.
 */
export function useDefaultCurrency(): string {
  const prefs = getLocalePreferences();
  if (prefs.currency) return prefs.currency;
  const locale = useLocale() as SupportedLocale;
  const meta = LOCALE_METADATA[locale] || LOCALE_METADATA["en-US"];
  return meta.currency;
}
