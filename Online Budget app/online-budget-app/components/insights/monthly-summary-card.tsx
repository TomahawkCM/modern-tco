"use client";

import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInsight } from "./use-insight";
import { SubscriptionGate } from "./subscription-gate";

export function MonthlySummaryCard() {
  const { narrative, loading, error, isSubscriptionRequired } = useInsight(
    "/api/insights/monthly-summary",
  );

  return (
    <SubscriptionGate
      isSubscriptionRequired={isSubscriptionRequired}
      featureName="Monthly Summary"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {narrative && (
            <p className="whitespace-pre-line text-sm leading-relaxed">
              {narrative}
            </p>
          )}
        </CardContent>
      </Card>
    </SubscriptionGate>
  );
}
