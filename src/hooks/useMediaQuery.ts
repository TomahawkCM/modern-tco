"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe hook that tracks a CSS media query.
 * Uses `window.matchMedia` with the `change` event for instant updates
 * (no debounce — unlike `useDeviceClass` which has 150ms debounce).
 *
 * Returns `false` during SSR and on first client render before hydration,
 * which means components gated behind this hook won't render server-side.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
