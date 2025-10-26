// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Environment detection
  environment: process.env.NODE_ENV,

  // Ignore common errors that aren't actionable
  ignoreErrors: [
    // Supabase connection timeouts (non-critical)
    "ECONNREFUSED",
    "ETIMEDOUT",
  ],

  // Custom fingerprinting for better error grouping
  beforeSend(event, hint) {
    // Add custom context for Tanium TCO app
    if (event.contexts) {
      event.contexts.app = {
        name: "Tanium TCO LMS",
        version: "1.0.0",
      };
    }

    return event;
  },
});
