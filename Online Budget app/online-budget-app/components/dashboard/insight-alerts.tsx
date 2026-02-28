"use client";

import Link from "next/link";
import { AlertTriangle, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInsight } from "@/components/insights/use-insight";

export function InsightAlerts() {
  const { narrative, loading, isSubscriptionRequired } = useInsight(
    "/api/insights/anomalies",
  );

  if (loading) return null;

  if (isSubscriptionRequired) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="flex items-center gap-3 py-3">
          <Lightbulb className="h-5 w-5 shrink-0 text-blue-600" />
          <p className="flex-1 text-sm text-blue-700">
            Unlock AI-powered financial insights with a subscription.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/insights">Learn more</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!narrative) return null;

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="flex items-center gap-3 py-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
        <p className="flex-1 text-sm text-amber-700 line-clamp-2">
          {narrative}
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/insights">View details</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
