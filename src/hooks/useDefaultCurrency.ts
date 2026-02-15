"use client";

import { useLocale } from "next-intl";
import { LOCALE_METADATA, type SupportedLocale } from "@/i18n/config";

/**
 * Returns the default currency for the current locale.
 * Uses LOCALE_METADATA mapping (e.g., en-US → USD, en-CA → CAD, de-DE → EUR).
 */
export function useDefaultCurrency(): string {
  const locale = useLocale() as SupportedLocale;
  const meta = LOCALE_METADATA[locale] || LOCALE_METADATA["en-US"];
  return meta.currency;
}
