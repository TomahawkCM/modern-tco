'use client';

/**
 * Developer Tools Panel (Dev Mode Only)
 *
 * Provides QA tools for testing i18n implementation:
 * - Pseudo-locale (en-XA) toggle to identify hardcoded strings
 * - Only visible in development mode
 */

import { useState, useEffect } from 'react';
import { DEFAULT_LOCALE } from '@/i18n/config';
import {
  getLocalePreferences,
  setLocalePreferences,
  type LocalePreferences,
} from '@/lib/locale-storage';

export function DeveloperTools() {
  const [preferences, setPreferences] = useState<LocalePreferences>(getLocalePreferences());
  const [isPseudoLocale, setIsPseudoLocale] = useState(preferences.locale === 'en-XA');

  useEffect(() => {
    // Listen for preference changes
    const handlePreferencesChanged = (event: CustomEvent) => {
      const newPrefs = event.detail as LocalePreferences;
      setPreferences(newPrefs);
      setIsPseudoLocale(newPrefs.locale === 'en-XA');
    };

    window.addEventListener('localePreferencesChanged', handlePreferencesChanged as EventListener);
    return () => {
      window.removeEventListener(
        'localePreferencesChanged',
        handlePreferencesChanged as EventListener
      );
    };
  }, []);

  const handlePseudoLocaleToggle = (enabled: boolean) => {
    const newLocale = enabled ? 'en-XA' : DEFAULT_LOCALE;
    const updated: LocalePreferences = {
      ...preferences,
      locale: newLocale,
    };

    setLocalePreferences(updated);
    setIsPseudoLocale(enabled);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Developer Tools</h2>
        <p className="text-sm text-muted-foreground">
          QA tools for testing internationalization (dev mode only)
        </p>
      </div>

      {/* Pseudo-Locale Toggle */}
      <div className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
        <div className="flex items-start gap-4">
          <input
            type="checkbox"
            id="pseudo-locale"
            checked={isPseudoLocale}
            onChange={(e) => handlePseudoLocaleToggle(e.target.checked)}
            className="mt-1 h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
          />
          <div className="flex-1">
            <label htmlFor="pseudo-locale" className="block text-sm font-medium cursor-pointer">
              Enable Pseudo-Locale (en-XA)
            </label>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Replaces all translated text with accented characters. Any remaining plain English
              text is <strong>hardcoded</strong> and needs to be converted to translation keys.
            </p>
            <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border text-xs">
              <strong>Example:</strong> "Dashboard" → "[Ðášhƀóářð~~~]"
              <br />
              If you see "Dashboard" instead of "[Ðášhƀóářð~~~]", it's hardcoded!
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>• Pseudo-locale helps identify untranslated strings during development</p>
        <p>• Production builds automatically exclude en-XA locale</p>
        <p>• Switch back to a real locale to continue normal development</p>
      </div>
    </div>
  );
}
