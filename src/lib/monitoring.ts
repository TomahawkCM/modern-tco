"use client";

import { supabase } from "@/lib/supabase";

export type MonitoringEvent = {
  type:
    | "client_error"
    | "unhandled_rejection"
    | "page_view"
    | "api_error"
    | "performance"
    | "custom";
  data?: Record<string, unknown>;
  sessionId?: string;
};

export async function trackEvent(evt: MonitoringEvent) {
  try {
    const payload = {
      event_id: crypto?.randomUUID?.() || undefined,
      user_id: undefined,
      session_id: evt.sessionId,
      event_type: evt.type,
      event_timestamp: new Date().toISOString(),
      event_data: evt.data ?? {},
    } as any;

    // Insert is best-effort; do not throw in UI flows
    await (supabase as any).from("analytics_events").insert(payload);
  } catch (_) {
    // Swallow monitoring errors to avoid feedback loops
  }
}

export function initClientMonitoring() {
  if (typeof window === "undefined") return;
  // Avoid double-binding in Fast Refresh
  const key = "__tco_monitoring_bound__";
  if ((window as any)[key]) return;
  (window as any)[key] = true;

  window.addEventListener("error", (e) => {
    trackEvent({
      type: "client_error",
      data: {
        message: e?.error?.message || e?.message || "Unknown error",
        stack: e?.error?.stack,
        source: e?.filename,
        lineno: e?.lineno,
        colno: e?.colno,
      },
    });
  });

  window.addEventListener("unhandledrejection", (e) => {
    trackEvent({
      type: "unhandled_rejection",
      data: {
        reason: (e?.reason as any)?.message || String(e?.reason),
        stack: (e?.reason as any)?.stack,
      },
    });
  });
}

