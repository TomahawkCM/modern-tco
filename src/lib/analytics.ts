// Lightweight PostHog-compatible analytics wrapper (no external deps)
// Sends events to PostHog ingestion API if NEXT_PUBLIC_POSTHOG_KEY is present.

export type AnalyticsProps = Record<string, any>;

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || "";
const DEBUG = (process.env.NEXT_PUBLIC_ANALYTICS_DEBUG || "").toLowerCase() === "true";
const HOST = (process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com").replace(/\/$/, "");
const STORAGE_ID = "ph_distinct_id";

let cachedId: string | null = null;

function uuid(): string {
  if (typeof crypto !== "undefined" && (crypto as any).randomUUID) {
    return (crypto as any).randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getDistinctId(): string {
  if (typeof window === "undefined") return "server";
  if (cachedId) return cachedId;
  try {
    const existing = localStorage.getItem(STORAGE_ID);
    if (existing) return (cachedId = existing);
    const id = uuid();
    localStorage.setItem(STORAGE_ID, id);
    cachedId = id;
    return id;
  } catch {
    return (cachedId = uuid());
  }
}

function nowIso(): string {
  try { return new Date().toISOString(); } catch { return ""; }
}

function currentUrl(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try { return window.location.href; } catch { return undefined; }
}

async function sendEvent(name: string, props?: AnalyticsProps) {
  if (!KEY || typeof window === "undefined") return; // disabled
  const distinct_id = getDistinctId();
  const payload: any = {
    api_key: KEY,
    event: name,
    properties: {
      distinct_id,
      $current_url: currentUrl(),
      ...props,
    },
    timestamp: nowIso(),
  };
  const url = `${HOST}/e/`;
  try {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.debug("[analytics]", name, { ...payload.properties, timestamp: payload.timestamp });
    }
    if (navigator?.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
      navigator.sendBeacon(url, blob);
    } else {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    }
  } catch {
    // swallow
  }
}

export const analytics = {
  init() {
    // no-op for the lightweight sender; presence of KEY enables capture
    return Boolean(KEY);
  },
  capture(name: string, props?: AnalyticsProps) {
    return sendEvent(name, props);
  },
  pageview(path?: string) {
    return sendEvent("$pageview", path ? { path } : undefined);
  },
  identify(userId?: string | null, traits?: AnalyticsProps) {
    if (!userId) return;
    return sendEvent("$identify", { distinct_id: getDistinctId(), $user_id: userId, ...traits });
  },
};
