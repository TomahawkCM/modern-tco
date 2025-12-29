/**
 * Locale Preferences Storage
 *
 * localStorage utilities for persisting locale, region, currency, and week start preferences
 * Key: budget_app_locale_prefs
 *
 * NOTE: Supabase sync will be added in Task 11
 */

import { type SupportedLocale, getValidLocale, DEFAULT_LOCALE } from '../i18n/config';
import type { CurrencyCode } from '../i18n/utils/formatCurrency';

const STORAGE_KEY = 'budget_app_locale_prefs';

export interface LocalePreferences {
  /** Selected language locale */
  locale: SupportedLocale;

  /** Region/country code (e.g., 'US', 'IN', 'KR') */
  region?: string;

  /** Preferred currency */
  currency?: CurrencyCode;

  /** Week start day: 0 = Sunday, 1 = Monday */
  weekStart?: 0 | 1;

  /** User's timezone (IANA format) */
  timezone?: string;

  /** Last updated timestamp */
  updatedAt?: number;
}

/**
 * Get locale preferences from localStorage
 * Returns default preferences if not set or invalid
 */
export function getLocalePreferences(): LocalePreferences {
  if (typeof window === 'undefined') {
    return {
      locale: DEFAULT_LOCALE,
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        locale: DEFAULT_LOCALE,
      };
    }

    const parsed = JSON.parse(stored) as LocalePreferences;

    // Validate locale
    const validLocale = getValidLocale(parsed.locale);

    return {
      ...parsed,
      locale: validLocale,
    };
  } catch (error) {
    console.error('Error reading locale preferences:', error);
    return {
      locale: DEFAULT_LOCALE,
    };
  }
}

/**
 * Save locale preferences to localStorage
 * Updates the updatedAt timestamp automatically
 */
export function setLocalePreferences(prefs: Partial<LocalePreferences>): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const current = getLocalePreferences();
    const updated: LocalePreferences = {
      ...current,
      ...prefs,
      updatedAt: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch custom event for components to react to changes
    window.dispatchEvent(
      new CustomEvent('localePreferencesChanged', {
        detail: updated,
      })
    );
  } catch (error) {
    console.error('Error saving locale preferences:', error);
  }
}

/**
 * Update specific locale preference field
 */
export function updateLocalePreference<K extends keyof LocalePreferences>(
  key: K,
  value: LocalePreferences[K]
): void {
  setLocalePreferences({ [key]: value });
}

/**
 * Reset locale preferences to defaults
 */
export function resetLocalePreferences(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);

    // Dispatch reset event
    window.dispatchEvent(
      new CustomEvent('localePreferencesChanged', {
        detail: { locale: DEFAULT_LOCALE },
      })
    );
  } catch (error) {
    console.error('Error resetting locale preferences:', error);
  }
}

/**
 * Get current locale from preferences
 */
export function getCurrentLocale(): SupportedLocale {
  return getLocalePreferences().locale;
}

/**
 * Set current locale
 */
export function setCurrentLocale(locale: SupportedLocale): void {
  updateLocalePreference('locale', locale);
}

/**
 * Get current currency from preferences
 */
export function getCurrentCurrency(): CurrencyCode | undefined {
  return getLocalePreferences().currency;
}

/**
 * Set current currency
 */
export function setCurrentCurrency(currency: CurrencyCode): void {
  updateLocalePreference('currency', currency);
}

/**
 * Get week start preference (0 = Sunday, 1 = Monday)
 */
export function getWeekStart(): 0 | 1 {
  return getLocalePreferences().weekStart ?? 0;
}

/**
 * Set week start preference
 */
export function setWeekStart(weekStart: 0 | 1): void {
  updateLocalePreference('weekStart', weekStart);
}

/**
 * Check if preferences were recently updated (within last 5 minutes)
 * Used for Supabase sync conflict resolution (Task 11)
 */
export function wasRecentlyUpdated(prefs: LocalePreferences): boolean {
  if (!prefs.updatedAt) return false;
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  return prefs.updatedAt > fiveMinutesAgo;
}
