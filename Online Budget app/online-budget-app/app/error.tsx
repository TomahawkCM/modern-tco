"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        Something went wrong
      </h2>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        {error.message || "An unexpected error occurred."}
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="default">
          Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
