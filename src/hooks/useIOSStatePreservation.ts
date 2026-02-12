"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Preserves app state (route + scroll position) when iOS PWA goes to background.
 * On resume, restores scroll position if the session is recent (within 1 hour).
 */
export function useIOSStatePreservation() {
  const pathname = usePathname();

  // Save state when app goes to background
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        try {
          sessionStorage.setItem(
            "app-state",
            JSON.stringify({
              route: pathname,
              scrollY: window.scrollY,
              timestamp: Date.now(),
            })
          );
        } catch {
          // sessionStorage may be unavailable in some contexts
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [pathname]);

  // On mount, restore scroll position if recent (within 1 hour)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("app-state");
      if (saved) {
        const state = JSON.parse(saved) as {
          route: string;
          scrollY: number;
          timestamp: number;
        };
        const ONE_HOUR = 3_600_000;
        if (Date.now() - state.timestamp < ONE_HOUR) {
          window.scrollTo(0, state.scrollY);
        }
        sessionStorage.removeItem("app-state");
      }
    } catch {
      // Ignore parse errors or missing sessionStorage
    }
  }, []);
}
