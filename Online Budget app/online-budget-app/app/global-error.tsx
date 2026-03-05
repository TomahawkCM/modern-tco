"use client";

// NOTE: This is the catastrophic error boundary. i18n may not be available here,
// so all strings are kept in English as a safe fallback.

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

function getLangFromCookie(): string {
  try {
    const match = document.cookie.match(/(?:^|;\s*)locale=([^;]*)/);
    if (match?.[1]) return match[1].split("-")[0] || "en";
  } catch {
    // cookie access may fail in some contexts
  }
  return "en";
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const lang = typeof document !== "undefined" ? getLangFromCookie() : "en";

  return (
    <html lang={lang}>
      <body
        style={{
          margin: 0,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "#fafafa",
          color: "#18181b",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Something went wrong</h2>
          <p style={{ color: "#71717a", marginBottom: "1.5rem" }}>
            {error.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={reset}
            style={{
              padding: "0.5rem 1.5rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              borderRadius: "0.375rem",
              border: "none",
              backgroundColor: "#18181b",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
