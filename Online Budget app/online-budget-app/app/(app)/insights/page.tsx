"use client";

import { MonthlySummaryCard } from "@/components/insights/monthly-summary-card";
import { AnomalyCard } from "@/components/insights/anomaly-card";
import { SubscriptionDetectionCard } from "@/components/insights/subscription-detection-card";
import { BudgetRiskCard } from "@/components/insights/budget-risk-card";
import { AffordabilityCard } from "@/components/insights/affordability-card";

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Financial Insights
        </h1>
        <p className="text-sm text-muted-foreground">
          AI-powered analysis of your finances
        </p>
      </div>

      <MonthlySummaryCard />

      <div className="grid gap-6 md:grid-cols-2">
        <AnomalyCard />
        <BudgetRiskCard />
      </div>

      <SubscriptionDetectionCard />
      <AffordabilityCard />
    </div>
  );
}
