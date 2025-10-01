'use client';

import { useLayoutEffect } from 'react';

/**
 * AccessibilityInitializer - Prevents React hydration errors for accessibility features
 *
 * HYDRATION FIX: This component was created to solve React Error #418
 * See HYDRATION_FIX_SUMMARY.md for complete context
 *
 * PROBLEM: Previous implementation used inline script in <head> that modified DOM
 * before React hydration, causing server/client mismatch
 *
 * SOLUTION: Apply accessibility settings AFTER React hydration using useLayoutEffect
 * - useLayoutEffect runs synchronously before browser paint (minimal FOUC)
 * - Server renders clean HTML without attributes
 * - Client applies attributes after hydration completes
 * - No server/client mismatch = No Error #418
 *
 * CSS Styling: Global styles in layout.tsx respond to data attributes
 * - html[data-large-text="1"] { font-size: 18px; }
 * - html[data-high-contrast="1"] body { filter: contrast(1.15) saturate(1.1); }
 */
export function AccessibilityInitializer() {
  useLayoutEffect(() => {
    try {
      // Apply large text setting
      const largeText = localStorage.getItem('tco-large-text');
      if (largeText === '1') {
        document.documentElement.setAttribute('data-large-text', '1');
      }

      // Apply high contrast setting
      const highContrast = localStorage.getItem('tco-high-contrast');
      if (highContrast === '1') {
        document.documentElement.setAttribute('data-high-contrast', '1');
      }
    } catch (e) {
      // Silently fail if localStorage is unavailable (SSR, private browsing, etc.)
      console.warn('Accessibility settings unavailable:', e);
    }
  }, []);

  return null; // This component doesn't render anything
}
