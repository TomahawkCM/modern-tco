"use client";

import { useCallback, useEffect, useState } from "react";

interface UseInsightOptions {
  /** Defer fetching until enabled becomes true. Defaults to true. */
  enabled?: boolean;
}

interface UseInsightResult {
  narrative: string | null;
  loading: boolean;
  error: string | null;
  isSubscriptionRequired: boolean;
  refetch: () => void;
}

/**
 * Generic client-side hook for fetching insight narratives.
 * Handles loading, error, and subscription-gate (403) states.
 */
export function useInsight(
  url: string,
  options: UseInsightOptions = {},
): UseInsightResult {
  const { enabled = true } = options;
  const [narrative, setNarrative] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubscriptionRequired, setIsSubscriptionRequired] = useState(false);

  const fetchInsight = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsSubscriptionRequired(false);

    try {
      const res = await fetch(url);

      if (res.status === 403) {
        setIsSubscriptionRequired(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? `Request failed (${res.status})`);
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data.ok === false) {
        setError(data.error ?? "Unknown error");
      } else {
        setNarrative(data.narrative);
      }
    } catch {
      setError("Unable to load insight");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (enabled) {
      fetchInsight();
    }
  }, [enabled, fetchInsight]);

  return { narrative, loading, error, isSubscriptionRequired, refetch: fetchInsight };
}
