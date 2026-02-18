"use client";

/**
 * Locale & Formatting Settings Panel
 *
 * Allows users to configure language, region, currency, and week start preferences
 * with live format previews
 */

import { useState, useEffect } from "react";
import {
  SUPPORTED_LOCALES,
  LOCALE_METADATA,
  type SupportedLocale,
  getBrowserLocale,
} from "@/i18n/config";
import type { CurrencyCode } from "@/i18n/utils/formatCurrency";
import {
  getLocalePreferences,
  setLocalePreferences,
  resetLocalePreferences,
  type LocalePreferences,
} from "@/lib/locale-storage";
import { FormatPreview } from "./FormatPreview";

export function LocaleSettingsPanel() {
  const [preferences, setPreferences] = useState<LocalePreferences>(getLocalePreferences());
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Listen for preference changes from other components
    const handlePreferencesChanged = (event: CustomEvent) => {
      setPreferences(event.detail);
      setHasChanges(false);
    };

    window.addEventListener("localePreferencesChanged", handlePreferencesChanged as EventListener);
    return () => {
      window.removeEventListener(
        "localePreferencesChanged",
        handlePreferencesChanged as EventListener
      );
    };
  }, []);

  const handleLocaleChange = (locale: SupportedLocale) => {
    const updated = { ...preferences, locale };
    setPreferences(updated);
    setHasChanges(true);
  };

  const handleCurrencyChange = (currency: CurrencyCode) => {
    const updated = { ...preferences, currency };
    setPreferences(updated);
    setHasChanges(true);
  };

  const handleWeekStartChange = (weekStart: 0 | 1) => {
    const updated = { ...preferences, weekStart };
    setPreferences(updated);
    setHasChanges(true);
  };

  const handleSave = () => {
    setLocalePreferences(preferences);
    setHasChanges(false);
  };

  const handleReset = () => {
    const browserLocale = getBrowserLocale();
    const defaultPreferences: LocalePreferences = {
      locale: browserLocale,
      currency: LOCALE_METADATA[browserLocale].currency as CurrencyCode,
      weekStart: 0,
    };
    setPreferences(defaultPreferences);
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="mb-2 text-lg font-semibold">Locale & Formatting</h2>
        <p className="text-sm text-muted-foreground">
          Configure language, region, currency, and formatting preferences
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Language Dropdown */}
        <div className="space-y-2">
          <label htmlFor="language" className="text-sm font-medium">
            Language
          </label>
          <select
            id="language"
            value={preferences.locale}
            onChange={(e) => handleLocaleChange(e.target.value as SupportedLocale)}
            className="w-full rounded-md border bg-background px-3 py-2"
          >
            {SUPPORTED_LOCALES.map((locale) => (
              <option key={locale} value={locale}>
                {LOCALE_METADATA[locale].label}
              </option>
            ))}
          </select>
        </div>

        {/* Currency Dropdown */}
        <div className="space-y-2">
          <label htmlFor="currency" className="text-sm font-medium">
            Currency
          </label>
          <select
            id="currency"
            value={preferences.currency || LOCALE_METADATA[preferences.locale].currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="INR">INR - Indian Rupee</option>
            <option value="KRW">KRW - Korean Won</option>
            <option value="SGD">SGD - Singapore Dollar</option>
            <option value="PHP">PHP - Philippine Peso</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
          </select>
        </div>

        {/* Week Start Dropdown */}
        <div className="space-y-2">
          <label htmlFor="weekStart" className="text-sm font-medium">
            Week Starts On
          </label>
          <select
            id="weekStart"
            value={preferences.weekStart ?? 0}
            onChange={(e) => handleWeekStartChange(Number(e.target.value) as 0 | 1)}
            className="w-full rounded-md border bg-background px-3 py-2"
          >
            <option value={0}>Sunday</option>
            <option value={1}>Monday</option>
          </select>
        </div>
      </div>

      {/* Live Preview */}
      <div className="rounded-lg border bg-muted/50 p-4">
        <h3 className="mb-3 text-sm font-medium">Format Preview</h3>
        <FormatPreview
          locale={preferences.locale}
          currency={preferences.currency || LOCALE_METADATA[preferences.locale].currency}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save Changes
        </button>
        <button
          onClick={handleReset}
          className="rounded-md border px-4 py-2 transition-colors hover:bg-muted/50"
        >
          Reset to Browser Defaults
        </button>
      </div>

      {hasChanges && (
        <p className="text-sm text-amber-600 dark:text-amber-500">You have unsaved changes</p>
      )}
    </div>
  );
}
