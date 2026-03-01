"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
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
