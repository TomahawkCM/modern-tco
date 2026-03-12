"use client";

/**
 * Subscription Cost Analysis Component
 *
 * Provides visual analysis of subscription spending:
 * - Monthly/annual cost breakdown by category
 * - Cost distribution pie chart
 * - Savings suggestions
 * - Upcoming charges timeline
 */

import { useMemo, lazy, Suspense } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";
import { formatCurrency } from "@/i18n/utils/formatCurrency";
import type { Subscription } from "@/types/budget";
import type { SubscriptionPattern } from "@/lib/subscription-detector";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Calendar,
  PieChart,
  BarChart2,
} from "lucide-react";
import { format, differenceInDays, addDays } from "date-fns";

interface SubscriptionCostChartProps {
  manualSubscriptions: Subscription[];
  autoDetectedPatterns: SubscriptionPattern[];
}

interface CategoryCost {
  name: string;
  monthly: number;
  annual: number;
  count: number;
  color: string;
}

interface SavingSuggestion {
  type: "inactive" | "duplicate" | "high-cost" | "unused-trial";
  title: string;
  description: string;
  potentialSavings: number;
  subscriptionIds: string[];
}

// Color palette for categories
const CATEGORY_COLORS = [
  "#14b8a6", // teal
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#f97316", // orange
  "#ef4444", // red
  "#22c55e", // green
  "#eab308", // yellow
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#6366f1", // indigo
];

function ChartLoadingSkeleton() {
  const t = useTranslations("subscriptionCostChart");
  return (
    <div className="flex h-64 w-full animate-pulse items-center justify-center rounded-lg bg-muted/50">
      <span className="text-sm text-muted-foreground">{t("loadingChart")}</span>
    </div>
  );
}

export function SubscriptionCostChart({
  manualSubscriptions,
  autoDetectedPatterns,
}: SubscriptionCostChartProps) {
  const t = useTranslations("subscriptionCostChart");
  const locale = useLocale();
  const currency = useDefaultCurrency();

  // Calculate costs by category
  const categoryBreakdown = useMemo((): CategoryCost[] => {
    const categoryMap = new Map<string, { monthly: number; count: number }>();

    // Process manual subscriptions
    for (const sub of manualSubscriptions) {
      if (sub.status !== "active" && sub.status !== "trial") continue;

      const cat = sub.category || "Uncategorized";
      const current = categoryMap.get(cat) || { monthly: 0, count: 0 };

      let monthlyCost = sub.amount;
      switch (sub.billingCycle) {
        case "weekly":
          monthlyCost = sub.amount * 4.33;
          break;
        case "bi-weekly":
          monthlyCost = sub.amount * 2.17;
          break;
        case "quarterly":
          monthlyCost = sub.amount / 3;
          break;
        case "annual":
          monthlyCost = sub.amount / 12;
          break;
      }

      categoryMap.set(cat, {
        monthly: current.monthly + monthlyCost,
        count: current.count + 1,
      });
    }

    // Process auto-detected patterns (excluding those merged with manual)
    const manualTokens = new Set(
      manualSubscriptions.filter((s) => s.merchantToken).map((s) => s.merchantToken?.toLowerCase())
    );

    for (const pattern of autoDetectedPatterns) {
      if (!pattern.is_active) continue;
      if (manualTokens.has(pattern.merchant_token.toLowerCase())) continue;

      const cat = pattern.category || "Uncategorized";
      const current = categoryMap.get(cat) || { monthly: 0, count: 0 };

      let monthlyCost = pattern.average_amount;
      switch (pattern.interval_type) {
        case "weekly":
          monthlyCost = pattern.average_amount * 4.33;
          break;
        case "annual":
          monthlyCost = pattern.average_amount / 12;
          break;
      }

      categoryMap.set(cat, {
        monthly: current.monthly + monthlyCost,
        count: current.count + 1,
      });
    }

    // Convert to array and add colors
    return Array.from(categoryMap.entries())
      .map(([name, data], index) => ({
        name,
        monthly: data.monthly,
        annual: data.monthly * 12,
        count: data.count,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.monthly - a.monthly);
  }, [manualSubscriptions, autoDetectedPatterns]);

  // Calculate total costs
  const totals = useMemo(() => {
    const monthly = categoryBreakdown.reduce((sum, cat) => sum + cat.monthly, 0);
    return {
      monthly,
      annual: monthly * 12,
      count: categoryBreakdown.reduce((sum, cat) => sum + cat.count, 0),
    };
  }, [categoryBreakdown]);

  // Generate savings suggestions
  const suggestions = useMemo((): SavingSuggestion[] => {
    const suggestions: SavingSuggestion[] = [];

    // Check for inactive/cancelled subscriptions that might still be charging
    const inactivePatterns = autoDetectedPatterns.filter((p) => !p.is_active);
    if (inactivePatterns.length > 0) {
      const totalInactive = inactivePatterns.reduce((sum, p) => {
        const monthly =
          p.interval_type === "weekly"
            ? p.average_amount * 4.33
            : p.interval_type === "annual"
              ? p.average_amount / 12
              : p.average_amount;
        return sum + monthly;
      }, 0);

      if (totalInactive > 0) {
        suggestions.push({
          type: "inactive",
          title: t("suggestions.inactiveTitle"),
          description: t("suggestions.inactiveDescription", { count: inactivePatterns.length }),
          potentialSavings: totalInactive,
          subscriptionIds: inactivePatterns.map((p) => p.id),
        });
      }
    }

    // Check for trials ending soon
    const trialsSoon = manualSubscriptions.filter((s) => {
      if (s.status !== "trial" || !s.trialEndDate) return false;
      const daysLeft = differenceInDays(new Date(s.trialEndDate), new Date());
      return daysLeft >= 0 && daysLeft <= 7;
    });

    if (trialsSoon.length > 0) {
      const trialTotal = trialsSoon.reduce((sum, s) => sum + s.amount, 0);
      suggestions.push({
        type: "unused-trial",
        title: t("suggestions.trialsTitle"),
        description: t("suggestions.trialsDescription", { count: trialsSoon.length }),
        potentialSavings: trialTotal,
        subscriptionIds: trialsSoon.map((s) => s.id),
      });
    }

    // Check for high-cost subscriptions (> 25% of total)
    const highCostThreshold = totals.monthly * 0.25;
    const highCost = [
      ...manualSubscriptions,
      ...autoDetectedPatterns.filter((p) => p.is_active),
    ].filter((sub) => {
      const amount =
        "billingCycle" in sub
          ? sub.amount
          : sub.interval_type === "annual"
            ? sub.average_amount / 12
            : sub.average_amount;
      return amount > highCostThreshold && amount > 50;
    });

    if (highCost.length > 0) {
      suggestions.push({
        type: "high-cost",
        title: t("suggestions.highCostTitle"),
        description: t("suggestions.highCostDescription"),
        potentialSavings: 0,
        subscriptionIds: highCost.map((s) => s.id),
      });
    }

    return suggestions;
  }, [manualSubscriptions, autoDetectedPatterns, totals.monthly]);

  // Upcoming charges for next 30 days
  const upcomingCharges = useMemo(() => {
    const charges: { date: Date; name: string; amount: number }[] = [];
    const now = new Date();
    const thirtyDaysOut = addDays(now, 30);

    for (const sub of manualSubscriptions) {
      if (sub.status !== "active" && sub.status !== "trial") continue;
      const nextDate = new Date(sub.nextBillingDate);
      if (nextDate >= now && nextDate <= thirtyDaysOut) {
        charges.push({
          date: nextDate,
          name: sub.name,
          amount: sub.amount,
        });
      }
    }

    for (const pattern of autoDetectedPatterns) {
      if (!pattern.is_active || !pattern.next_expected_charge) continue;
      const nextDate = new Date(pattern.next_expected_charge);
      if (nextDate >= now && nextDate <= thirtyDaysOut) {
        // Skip if already covered by manual subscription
        const hasMerged = manualSubscriptions.some(
          (s) => s.merchantToken?.toLowerCase() === pattern.merchant_token.toLowerCase()
        );
        if (!hasMerged) {
          charges.push({
            date: nextDate,
            name: pattern.merchant_name,
            amount: pattern.average_amount,
          });
        }
      }
    }

    return charges.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [manualSubscriptions, autoDetectedPatterns]);

  // Data for pie chart
  const pieData = categoryBreakdown.map((cat) => ({
    name: cat.name,
    value: cat.monthly,
    color: cat.color,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              {t("summary.monthlyCost")}
            </h3>
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(totals.monthly, currency, locale)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("summary.activeSubscriptions", { count: totals.count })}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">{t("summary.annualCost")}</h3>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(totals.annual, currency, locale)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{t("summary.projectedYearly")}</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">{t("summary.next30Days")}</h3>
            <Calendar className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {formatCurrency(
              upcomingCharges.reduce((sum, c) => sum + c.amount, 0),
              currency,
              locale
            )}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("summary.upcomingCharges", { count: upcomingCharges.length })}
          </p>
        </div>
      </div>

      {/* Cost by Category */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <PieChart className="h-5 w-5 text-teal-500" />
          {t("sections.costByCategory")}
        </h3>

        {categoryBreakdown.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">{t("emptyState")}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Pie Chart */}
            <div className="h-64">
              <Suspense fallback={<ChartLoadingSkeleton />}>
                <PieChartComponent
                  data={pieData}
                  tooltipFormatter={(value: number) => [
                    `${formatCurrency(value, currency, locale)}/mo`,
                    "Cost",
                  ]}
                />
              </Suspense>
            </div>

            {/* Category List */}
            <div className="space-y-3">
              {categoryBreakdown.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm font-medium text-foreground">{cat.name}</span>
                    <span className="text-xs text-muted-foreground">({cat.count})</span>
                  </div>
                  <div className="text-end">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(cat.monthly, currency, locale)}/mo
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(cat.annual, currency, locale)}/yr
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Savings Suggestions */}
      {suggestions.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            {t("sections.potentialSavings")}
          </h3>

          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`rounded-lg border p-4 ${
                  suggestion.type === "inactive"
                    ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950"
                    : suggestion.type === "unused-trial"
                      ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
                      : "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="flex items-center gap-2 font-medium text-foreground">
                      {suggestion.type === "inactive" && (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                      {suggestion.type === "unused-trial" && (
                        <Calendar className="h-4 w-4 text-blue-600" />
                      )}
                      {suggestion.type === "high-cost" && (
                        <TrendingDown className="h-4 w-4 text-orange-600" />
                      )}
                      {suggestion.title}
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">{suggestion.description}</p>
                  </div>
                  {suggestion.potentialSavings > 0 && (
                    <div className="text-end">
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(suggestion.potentialSavings, currency, locale)}
                      </p>
                      <p className="text-xs text-muted-foreground">{t("perMonth")}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Charges Timeline */}
      {upcomingCharges.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <BarChart2 className="h-5 w-5 text-purple-500" />
            {t("sections.upcomingCharges")}
          </h3>

          <div className="space-y-3">
            {upcomingCharges.slice(0, 10).map((charge, index) => {
              const daysUntil = differenceInDays(charge.date, new Date());
              return (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        daysUntil <= 3
                          ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
                          : daysUntil <= 7
                            ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <span className="text-sm font-bold">{daysUntil}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{charge.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(charge.date, "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-foreground">
                    {formatCurrency(charge.amount, currency, locale)}
                  </p>
                </div>
              );
            })}

            {upcomingCharges.length > 10 && (
              <p className="pt-2 text-center text-sm text-muted-foreground">
                {t("moreCharges", { count: upcomingCharges.length - 10 })}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Simple pie chart component (lazy loaded internally)
function PieChartComponent({
  data,
  tooltipFormatter,
}: {
  data: { name: string; value: number; color: string }[];
  tooltipFormatter: (value: number) => [string, string];
}) {
  return (
    <Suspense fallback={<ChartLoadingSkeleton />}>
      <LazyPieChart data={data} tooltipFormatter={tooltipFormatter} />
    </Suspense>
  );
}

const LazyPieChart = lazy(() =>
  import("recharts").then((mod) => {
    const { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } = mod;

    const Chart = ({
      data,
      tooltipFormatter,
    }: {
      data: { name: string; value: number; color: string }[];
      tooltipFormatter: (value: number) => [string, string];
    }) => (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => tooltipFormatter(value)}
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    );

    return { default: Chart };
  })
);
