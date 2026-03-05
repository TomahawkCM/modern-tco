import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Only enable in production and preview deployments
  enabled: process.env.NODE_ENV === "production",

  // Performance: sample 10% of server transactions
  tracesSampleRate: 0.1,

  environment: process.env.VERCEL_ENV ?? "development",
});
