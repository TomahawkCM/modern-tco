"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { analytics } from "@/lib/analytics";
import { useAuth } from "@/contexts/AuthContext";

export function AnalyticsClient() {
  const pathname = usePathname();
  const search = useSearchParams();
  const { user } = useAuth();

  // Init + identify
  useEffect(() => {
    const idle = (window as any).requestIdleCallback as undefined | ((cb: any) => void);
    const start = () => analytics.init();
    if (idle) idle(start);
    else setTimeout(start, 300);
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    const idle = (window as any).requestIdleCallback as undefined | ((cb: any) => void);
    const start = () => analytics.identify(user.id!, { email: user.email || undefined });
    if (idle) idle(start);
    else setTimeout(start, 300);
  }, [user?.id]);

  // Capture pageviews on route changes
  useEffect(() => {
    const path = pathname + (search?.toString() ? `?${search.toString()}` : "");
    const idle = (window as any).requestIdleCallback as undefined | ((cb: any) => void);
    const send = () => analytics.pageview(path);
    if (idle) idle(send);
    else setTimeout(send, 300);
  }, [pathname, search]);

  return null;
}
