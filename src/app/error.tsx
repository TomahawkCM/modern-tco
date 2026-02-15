"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-black to-black">
      <div className="space-y-6 p-8 text-center">
        <h1 className="text-6xl font-bold text-red-500">Error</h1>
        <h2 className="text-2xl font-semibold text-foreground">Something went wrong</h2>
        <p className="mx-auto max-w-md text-muted-foreground">
          {error.message || "An unexpected error occurred"}
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={reset}
            className="rounded-lg bg-blue-600 px-6 py-3 text-foreground transition-colors hover:bg-blue-700"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg bg-gray-700 px-6 py-3 text-foreground transition-colors hover:bg-muted"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
