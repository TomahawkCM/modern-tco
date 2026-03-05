"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const FALLBACKS: Record<string, string> = {
  title: "Something went wrong",
  defaultMessage: "An unexpected error occurred.",
  tryAgain: "Try again",
  goToDashboard: "Go to Dashboard",
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Always call the hook (rules of hooks), but fall back to English strings
  // if the i18n provider is not mounted (e.g. error before providers render)
  const rawT = useTranslations("errors");
  const t = (key: string) => {
    try {
      return rawT(key as never);
    } catch {
      return FALLBACKS[key] ?? key;
    }
  };

  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{t("title")}</h2>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        {error.message || t("defaultMessage")}
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="default">
          {t("tryAgain")}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">{t("goToDashboard")}</Link>
        </Button>
      </div>
    </div>
  );
}
