/**
 * Accessibility Settings Panel
 * Provides UI controls for theme mode, reduced motion, and font size
 *
 * Features:
 * - Theme mode: light, dark, high-contrast, auto
 * - Reduced motion toggle
 * - Font size: 16px, 18px, 20px
 * - localStorage persistence
 * - Cross-tab synchronization via storage events
 */

'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Sun, Moon, Contrast, MonitorSmartphone, Zap, ZapOff, Type, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SeniorsModeToggle } from './SeniorsModeToggle';
import { useSeniorsModePresets } from '@/hooks/useSeniorsMode';

export type ThemeMode = 'light' | 'dark' | 'high-contrast' | 'auto';
export type FontSize = '16' | '18' | '20';

export interface AccessibilityPreferences {
  themeMode: ThemeMode;
  reducedMotion: boolean;
  fontSize: FontSize;
}

const STORAGE_KEY = 'budget-app-a11y-preferences';

// Default preferences
const defaultPreferences: AccessibilityPreferences = {
  themeMode: 'auto',
  reducedMotion: false,
  fontSize: '16',
};

/**
 * Get preferences from localStorage
 */
export function getAccessibilityPreferences(): AccessibilityPreferences {
  if (typeof window === 'undefined') return defaultPreferences;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultPreferences;

    const parsed = JSON.parse(stored);
    return {
      themeMode: parsed.themeMode || defaultPreferences.themeMode,
      reducedMotion: parsed.reducedMotion ?? defaultPreferences.reducedMotion,
      fontSize: parsed.fontSize || defaultPreferences.fontSize,
    };
  } catch (error) {
    console.error('Failed to load accessibility preferences:', error);
    return defaultPreferences;
  }
}

/**
 * Save preferences to localStorage
 */
export function saveAccessibilityPreferences(prefs: AccessibilityPreferences) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));

    // Dispatch custom event for cross-component updates
    window.dispatchEvent(new CustomEvent('a11y-preferences-updated', { detail: prefs }));
  } catch (error) {
    console.error('Failed to save accessibility preferences:', error);
  }
}

/**
 * Apply theme mode to document
 */
function applyThemeMode(mode: ThemeMode) {
  const root = document.documentElement;

  // Remove all theme classes
  root.classList.remove('light', 'dark', 'high-contrast');

  if (mode === 'auto') {
    // Use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.add(prefersDark ? 'dark' : 'light');
  } else {
    root.classList.add(mode);
  }
}

/**
 * Apply reduced motion preference
 */
function applyReducedMotion(enabled: boolean) {
  const root = document.documentElement;

  if (enabled) {
    root.classList.add('reduce-motion');
  } else {
    root.classList.remove('reduce-motion');
  }
}

/**
 * Apply font size preference
 */
function applyFontSize(size: FontSize) {
  const root = document.documentElement;
  root.style.setProperty('--base-font-size', `${size}px`);
}

/**
 * Apply all accessibility preferences
 */
export function applyAccessibilityPreferences(prefs: AccessibilityPreferences) {
  applyThemeMode(prefs.themeMode);
  applyReducedMotion(prefs.reducedMotion);
  applyFontSize(prefs.fontSize);
}

export function AccessibilitySettingsPanel() {
  const t = useTranslations('accessibilitySettings');
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(defaultPreferences);
  const [mounted, setMounted] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    const prefs = getAccessibilityPreferences();
    setPreferences(prefs);
    applyAccessibilityPreferences(prefs);
    setMounted(true);

    // Listen for storage events (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newPrefs = JSON.parse(e.newValue);
          setPreferences(newPrefs);
          applyAccessibilityPreferences(newPrefs);
        } catch (error) {
          console.error('Failed to sync accessibility preferences:', error);
        }
      }
    };

    // Listen for custom event (same-tab sync)
    const handlePrefsUpdate = (e: CustomEvent<AccessibilityPreferences>) => {
      setPreferences(e.detail);
      applyAccessibilityPreferences(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('a11y-preferences-updated', handlePrefsUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('a11y-preferences-updated', handlePrefsUpdate as EventListener);
    };
  }, []);

  // Update theme mode
  const updateThemeMode = (mode: ThemeMode) => {
    const newPrefs = { ...preferences, themeMode: mode };
    setPreferences(newPrefs);
    saveAccessibilityPreferences(newPrefs);
    applyAccessibilityPreferences(newPrefs);
  };

  // Toggle reduced motion
  const toggleReducedMotion = (enabled: boolean) => {
    const newPrefs = { ...preferences, reducedMotion: enabled };
    setPreferences(newPrefs);
    saveAccessibilityPreferences(newPrefs);
    applyAccessibilityPreferences(newPrefs);
  };

  // Update font size
  const updateFontSize = (size: FontSize) => {
    const newPrefs = { ...preferences, fontSize: size };
    setPreferences(newPrefs);
    saveAccessibilityPreferences(newPrefs);
    applyAccessibilityPreferences(newPrefs);
  };

  if (!mounted) {
    return <div className="animate-pulse space-y-8">
      <div className="h-32 bg-gray-200 rounded-lg"></div>
      <div className="h-24 bg-gray-200 rounded-lg"></div>
      <div className="h-32 bg-gray-200 rounded-lg"></div>
    </div>;
  }

  return (
    <div className="space-y-8">
      {/* Seniors Mode Section - Featured at top */}
      <div className="rounded-lg bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-950 dark:to-blue-950 p-6 shadow-lg border-2 border-teal-200 dark:border-teal-800">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900">
            <Users className="h-6 w-6 text-teal-600 dark:text-teal-400" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground">{t('seniorsMode.title')}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('seniorsMode.description')}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
          <SeniorsModeToggle showLabel={true} size="large" />
        </div>

        <SeniorsModePresetsSection t={t} />
      </div>

      {/* Theme Mode Section */}
      <div className="rounded-lg bg-card p-6 shadow">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">{t('themeMode.title')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('themeMode.description')}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => updateThemeMode('light')}
            className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-all ${
              preferences.themeMode === 'light'
                ? 'border-teal-600 bg-card'
                : 'border-border hover:border-border'
            }`}
            aria-pressed={preferences.themeMode === 'light'}
          >
            <Sun className="h-6 w-6 text-yellow-500" aria-hidden="true" />
            <div className="text-left">
              <div className="font-semibold text-foreground">{t('themeMode.light')}</div>
              <div className="text-xs text-muted-foreground">{t('themeMode.lightDesc')}</div>
            </div>
          </button>

          <button
            onClick={() => updateThemeMode('dark')}
            className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-all ${
              preferences.themeMode === 'dark'
                ? 'border-teal-600 bg-card'
                : 'border-border hover:border-border'
            }`}
            aria-pressed={preferences.themeMode === 'dark'}
          >
            <Moon className="h-6 w-6 text-indigo-500" aria-hidden="true" />
            <div className="text-left">
              <div className="font-semibold text-foreground">{t('themeMode.dark')}</div>
              <div className="text-xs text-muted-foreground">{t('themeMode.darkDesc')}</div>
            </div>
          </button>

          <button
            onClick={() => updateThemeMode('high-contrast')}
            className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-all ${
              preferences.themeMode === 'high-contrast'
                ? 'border-teal-600 bg-card'
                : 'border-border hover:border-border'
            }`}
            aria-pressed={preferences.themeMode === 'high-contrast'}
          >
            <Contrast className="h-6 w-6 text-gray-900" aria-hidden="true" />
            <div className="text-left">
              <div className="font-semibold text-foreground">{t('themeMode.highContrast')}</div>
              <div className="text-xs text-muted-foreground">{t('themeMode.highContrastDesc')}</div>
            </div>
          </button>

          <button
            onClick={() => updateThemeMode('auto')}
            className={`flex items-center gap-3 rounded-lg border-2 p-4 transition-all ${
              preferences.themeMode === 'auto'
                ? 'border-teal-600 bg-card'
                : 'border-border hover:border-border'
            }`}
            aria-pressed={preferences.themeMode === 'auto'}
          >
            <MonitorSmartphone className="h-6 w-6 text-teal-500" aria-hidden="true" />
            <div className="text-left">
              <div className="font-semibold text-foreground">{t('themeMode.auto')}</div>
              <div className="text-xs text-muted-foreground">{t('themeMode.autoDesc')}</div>
            </div>
          </button>
        </div>
      </div>

      {/* Reduced Motion Section */}
      <div className="rounded-lg bg-card p-6 shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {preferences.reducedMotion ? (
                <ZapOff className="h-5 w-5 text-gray-700" aria-hidden="true" />
              ) : (
                <Zap className="h-5 w-5 text-gray-700" aria-hidden="true" />
              )}
              <h3 className="text-lg font-semibold text-foreground">{t('reducedMotion.title')}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('reducedMotion.description')}
            </p>
          </div>
          <Switch
            checked={preferences.reducedMotion}
            onCheckedChange={toggleReducedMotion}
            aria-label={t('reducedMotion.toggleLabel')}
            className="ms-4"
          />
        </div>
      </div>

      {/* Font Size Section */}
      <div className="rounded-lg bg-card p-6 shadow">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Type className="h-5 w-5 text-gray-700" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-foreground">{t('fontSize.title')}</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {t('fontSize.description')}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <button
            onClick={() => updateFontSize('16')}
            className={`rounded-lg border-2 p-4 text-center transition-all ${
              preferences.fontSize === '16'
                ? 'border-teal-600 bg-teal-50'
                : 'border-border hover:border-border'
            }`}
            aria-pressed={preferences.fontSize === '16'}
          >
            <div className="text-base font-semibold text-foreground">16px</div>
            <div className="text-xs text-muted-foreground">{t('fontSize.default')}</div>
          </button>

          <button
            onClick={() => updateFontSize('18')}
            className={`rounded-lg border-2 p-4 text-center transition-all ${
              preferences.fontSize === '18'
                ? 'border-teal-600 bg-teal-50'
                : 'border-border hover:border-border'
            }`}
            aria-pressed={preferences.fontSize === '18'}
          >
            <div className="text-lg font-semibold text-foreground">18px</div>
            <div className="text-xs text-muted-foreground">{t('fontSize.large')}</div>
          </button>

          <button
            onClick={() => updateFontSize('20')}
            className={`rounded-lg border-2 p-4 text-center transition-all ${
              preferences.fontSize === '20'
                ? 'border-teal-600 bg-teal-50'
                : 'border-border hover:border-border'
            }`}
            aria-pressed={preferences.fontSize === '20'}
          >
            <div className="text-xl font-semibold text-foreground">20px</div>
            <div className="text-xs text-muted-foreground">{t('fontSize.extraLarge')}</div>
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-lg bg-muted p-4">
        <h4 className="font-semibold text-foreground mb-2">{t('infoBox.title')}</h4>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• {t('infoBox.savedAutomatically')}</li>
          <li>• {t('infoBox.syncAcrossTabs')}</li>
          <li>• {t('infoBox.storedLocally')}</li>
          <li>• {t('infoBox.seniorsOptimization')}</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Presets section for Seniors Mode with quick configuration options
 */
interface SeniorsModePresetsSectionProps {
  t: ReturnType<typeof useTranslations<'accessibilitySettings'>>;
}

function SeniorsModePresetsSection({ t }: SeniorsModePresetsSectionProps) {
  const { applyPreset, getCurrentPreset, presets } = useSeniorsModePresets();
  const currentPreset = getCurrentPreset();

  const presetKeys = {
    off: { label: 'presets.off', description: 'presets.offDesc' },
    mild: { label: 'presets.mild', description: 'presets.mildDesc' },
    moderate: { label: 'presets.moderate', description: 'presets.moderateDesc' },
    full: { label: 'presets.full', description: 'presets.fullDesc' },
  } as const;

  return (
    <div className="mt-4 pt-4 border-t border-teal-200 dark:border-teal-800">
      <p className="text-sm font-medium text-muted-foreground mb-3">{t('presets.title')}</p>
      <div className="grid grid-cols-4 gap-2">
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => applyPreset(preset)}
            className={`rounded-lg p-3 text-center transition-all min-h-[52px] ${
              currentPreset === preset
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-foreground hover:bg-teal-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
            aria-pressed={currentPreset === preset}
          >
            <div className="font-semibold text-sm">{t(presetKeys[preset].label)}</div>
            <div className={`text-xs mt-0.5 ${currentPreset === preset ? 'text-teal-100' : 'text-muted-foreground'}`}>
              {t(presetKeys[preset].description)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
