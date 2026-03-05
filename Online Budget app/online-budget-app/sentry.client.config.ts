import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production and preview deployments
  enabled: process.env.NODE_ENV === "production",

  // Performance: sample 10% of transactions
  tracesSampleRate: 0.1,

  // Session Replay: 10% of sessions, 100% on error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [Sentry.replayIntegration()],

  // Filter out noisy non-actionable errors
  beforeSend(event) {
    const message = event.exception?.values?.[0]?.value ?? "";

    // ResizeObserver loop errors are benign browser noise
    if (message.includes("ResizeObserver loop")) return null;

    // Cancelled fetch requests (user navigated away)
    if (message.includes("AbortError") || message.includes("The operation was aborted")) {
      return null;
    }

    return event;
  },

  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? "development",
});
