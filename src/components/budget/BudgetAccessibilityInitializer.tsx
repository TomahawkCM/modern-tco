'use client';

import { useEffect } from 'react';
import {
  applyAccessibilityPreferences,
  getAccessibilityPreferences,
} from '@/components/budget/AccessibilitySettingsPanel';

/**
 * BudgetAccessibilityInitializer
 *
 * Applies the budget app's accessibility preferences (theme mode,
 * reduced motion, font size) on load so dark mode and other options
 * work consistently across all budget pages.
 */
export function BudgetAccessibilityInitializer() {
  useEffect(() => {
    try {
      const prefs = getAccessibilityPreferences();
      applyAccessibilityPreferences(prefs);
    } catch (error) {
      // Fail silently if preferences cannot be loaded (e.g., localStorage blocked)
      console.warn('Budget accessibility preferences unavailable:', error);
    }
  }, []);

  return null;
}

