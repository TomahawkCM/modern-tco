"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { analytics } from "@/lib/analytics";
import { useAuth } from "@/contexts/AuthContext";

type IdleScheduler = (callback: () => void) => void;

const scheduleIdle: IdleScheduler = (callback) => {
  if (typeof window === "undefined") {
    return;
  }

  const win = window as typeof window & {
    requestIdleCallback?: (cb: () => void) => number;
  };

  if (typeof win.requestIdleCallback === "function") {
    win.requestIdleCallback(() => {
      callback();
    });
    return;
  }

  window.setTimeout(callback, 300);
};

export function AnalyticsClient() {
  const pathname = usePathname();
  const search = useSearchParams();
  const { user } = useAuth();

  // Init + identify
  useEffect(() => {
    scheduleIdle(() => {
      void analytics.init();
    });
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    scheduleIdle(() => {
      void analytics.identify(user.id, { email: user.email || undefined });
    });
  }, [user?.email, user?.id]);

  // Capture pageviews on route changes
  useEffect(() => {
    if (!pathname) return;
    const query = search ? search.toString() : '';
    const path = query ? `${pathname}?${query}` : pathname;
    scheduleIdle(() => {
      void analytics.pageview(path);
    });
  }, [pathname, search]);

  return null;
}
