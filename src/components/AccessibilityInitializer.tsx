'use client';

import { useLayoutEffect } from 'react';

/**
 * AccessibilityInitializer - Client component that applies accessibility settings
 * after React hydration to prevent hydration mismatch errors.
 *
 * Uses useLayoutEffect to apply settings synchronously before browser paint,
 * minimizing flash of unstyled content (FOUC).
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
      // Silently fail if localStorage is unavailable
      console.warn('Accessibility settings unavailable:', e);
    }
  }, []);

  return null; // This component doesn't render anything
}
