"use client";

/**
 * Spending Trend Chart Component
 * Shows income vs expense trend over time as a line chart.
 * Ported from offline app with shadcn/zinc semantic styling.
 */

import { useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  LazyLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "@/components/charts/lazy-charts";

interface TrendDataPoint {
  /** Display label for the month (e.g., "Jan 2026") */
  month: string;
  /** Income amount in display units */
  income: number;
  /** Expense amount in display units (positive number) */
  expenses: number;
}

interface SpendingTrendChartProps {
  data: TrendDataPoint[];
  currency: string;
  formatAmount: (amt: { amountMinor: number; currency: string }) => string;
}

const CHART_COLORS = {
  income: "#10b981", // emerald-500
  expenses: "#ef4444", // red-500
  grid: "hsl(var(--border))",
};

export function SpendingTrendChart({ data, currency, formatAmount }: SpendingTrendChartProps) {
  const t = useTranslations("reports");

  const tooltipFormatter = useCallback(
    (value: number) => formatAmount({ amountMinor: Math.round(value * 100), currency }),
    [formatAmount, currency]
  );

  // Calculate summary stats
  const stats = useMemo(() => {
    if (data.length === 0) return null;

    const totalIncome = data.reduce((s, d) => s + d.income, 0);
    const totalExpenses = data.reduce((s, d) => s + d.expenses, 0);
    const avgIncome = totalIncome / data.length;
    const avgExpenses = totalExpenses / data.length;
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    return {
      avgIncome,
      avgExpenses,
      netSavings,
      savingsRate,
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-2 text-lg font-semibold text-foreground">{t("trend.title")}</h3>
        <p className="text-sm text-muted-foreground">{t("trend.noData")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">{t("trend.title")}</h3>

      {/* Stats Summary */}
      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4 sm:grid-cols-4">
          <div>
            <div className="text-xs text-muted-foreground">{t("trend.avgIncome")}</div>
            <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              {formatAmount({
                amountMinor: Math.round(stats.avgIncome * 100),
                currency,
              })}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{t("trend.avgExpenses")}</div>
            <div className="text-lg font-semibold text-red-600 dark:text-red-400">
              {formatAmount({
                amountMinor: Math.round(stats.avgExpenses * 100),
                currency,
              })}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{t("trend.netSavings")}</div>
            <div
              className={`text-lg font-semibold ${
                stats.netSavings >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatAmount({
                amountMinor: Math.round(stats.netSavings * 100),
                currency,
              })}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{t("trend.savingsRate")}</div>
            <div
              className={`text-lg font-semibold ${
                stats.savingsRate >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {stats.savingsRate.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LazyLineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="month"
              className="text-muted-foreground"
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              className="text-muted-foreground"
              tick={{ fontSize: 12 }}
              tickLine={false}
              tickFormatter={(value: number) =>
                formatAmount({ amountMinor: Math.round(value * 100), currency })
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                borderColor: "hsl(var(--border))",
                borderRadius: "0.5rem",
                color: "hsl(var(--popover-foreground))",
              }}
              formatter={(value: number | undefined, name: string | undefined) => [
                tooltipFormatter(value ?? 0),
                name === "income" ? t("trend.income") : t("trend.expenses"),
              ]}
              labelStyle={{ color: "hsl(var(--muted-foreground))" }}
            />
            <Legend
              formatter={(value: string) =>
                value === "income" ? t("trend.income") : t("trend.expenses")
              }
            />

            {/* Income line (green) */}
            <Line
              type="monotone"
              dataKey="income"
              stroke={CHART_COLORS.income}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS.income, r: 3 }}
              activeDot={{ r: 5 }}
              name="income"
            />

            {/* Expenses line (red) */}
            <Line
              type="monotone"
              dataKey="expenses"
              stroke={CHART_COLORS.expenses}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS.expenses, r: 3 }}
              activeDot={{ r: 5 }}
              name="expenses"
            />
          </LazyLineChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        {t("trend.footer", { months: data.length })}
      </p>
    </div>
  );
}
