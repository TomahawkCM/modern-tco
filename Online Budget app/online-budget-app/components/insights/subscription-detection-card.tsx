"use client";

import { RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInsight } from "./use-insight";
import { SubscriptionGate } from "./subscription-gate";

export function SubscriptionDetectionCard() {
  const { narrative, loading, error, isSubscriptionRequired } = useInsight(
    "/api/insights/subscriptions",
  );

  return (
    <SubscriptionGate
      isSubscriptionRequired={isSubscriptionRequired}
      featureName="Subscription Detection"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Recurring Subscriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
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
