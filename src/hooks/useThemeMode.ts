/**
 * useThemeMode Hook
 *
 * Detects and provides current theme mode (light/dark/high-contrast)
 * Used for theme-aware chart colors and accessibility features
 */

import { useEffect, useState } from 'react';
import type { ThemeMode } from '@/lib/budget-chart-colors';

export function useThemeMode(): ThemeMode {
  const [theme, setTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    // Check for high-contrast mode first (Windows high contrast, forced colors)
    const isHighContrast = window.matchMedia('(prefers-contrast: more)').matches ||
      window.matchMedia('(forced-colors: active)').matches;

    if (isHighContrast) {
      setTheme('high-contrast');
      return;
    }

    // Check for dark mode
    const isDark =
      document.documentElement.classList.contains('dark') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    setTheme(isDark ? 'dark' : 'light');

    // Listen for theme changes
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: more)');

    const handleChange = () => {
      const isHighContrast = highContrastQuery.matches;
      const isDark = document.documentElement.classList.contains('dark') || darkModeQuery.matches;

      if (isHighContrast) {
        setTheme('high-contrast');
      } else if (isDark) {
        setTheme('dark');
      } else {
        setTheme('light');
      }
    };

    darkModeQuery.addEventListener('change', handleChange);
    highContrastQuery.addEventListener('change', handleChange);

    // MutationObserver for class changes on html element
    const observer = new MutationObserver(handleChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      darkModeQuery.removeEventListener('change', handleChange);
      highContrastQuery.removeEventListener('change', handleChange);
      observer.disconnect();
    };
  }, []);

  return theme;
}
