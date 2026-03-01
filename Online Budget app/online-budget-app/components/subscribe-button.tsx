"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslations } from "next-intl";

export function SubscribeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("common.subscribe");

  async function handleSubscribe() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || t("checkoutError"));
      }
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button onClick={handleSubscribe} disabled={loading}>
        {loading ? t("loading") : t("button")}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
