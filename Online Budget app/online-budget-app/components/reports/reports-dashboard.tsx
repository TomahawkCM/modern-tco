"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LazyPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "@/components/charts/lazy-charts";
import { SpendingTrendChart } from "@/components/charts/spending-trend-chart";
import { SpendingHeatmap } from "@/components/charts/spending-heatmap";
import { SankeyDiagram } from "@/components/charts/sankey-diagram";
import {
  DollarSignIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  PercentIcon,
  DownloadIcon,
  ImageIcon,
} from "lucide-react";
import type { MinorAmount } from "@/engine";
import type { MonthlyTotal, CategoryMonthlySpending } from "@/server/reports";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ReportsDashboardProps {
  initialMonthlyTotals: MonthlyTotal[];
  initialCategorySpending: CategoryMonthlySpending[];
  currency: string;
  locale: string;
  formatAmount: (amt: MinorAmount) => string;
}

type TimeRange = "month" | "quarter" | "year" | "all";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PIE_COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6",
  "#06b6d4", "#f97316", "#84cc16", "#ec4899", "#14b8a6",
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getDateRange(range: TimeRange): { startDate: string; endDate: string } {
  const now = new Date();
  const endDate = now.toISOString().split("T")[0];
  let startDate: string;

  switch (range) {
    case "month": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      startDate = d.toISOString().split("T")[0];
      break;
    }
    case "quarter": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 3);
      startDate = d.toISOString().split("T")[0];
      break;
    }
    case "year": {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 1);
      startDate = d.toISOString().split("T")[0];
      break;
    }
    case "all":
    default:
      startDate = "2000-01-01";
      break;
  }

  return { startDate, endDate };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ReportsDashboard({
  initialMonthlyTotals,
  initialCategorySpending,
  currency,
  formatAmount,
}: ReportsDashboardProps) {
  const t = useTranslations("reports");

  const [range, setRange] = useState<TimeRange>("year");
  const [monthlyTotals, setMonthlyTotals] = useState(initialMonthlyTotals);
  const [categorySpending, setCategorySpending] = useState(initialCategorySpending);
  const [loading, setLoading] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  /* ---- Fetch fresh data on range change ---- */

  const handleRangeChange = useCallback(async (newRange: string) => {
    const r = newRange as TimeRange;
    setRange(r);
    setLoading(true);

    const { startDate, endDate } = getDateRange(r);

    try {
      const res = await fetch(
        `/api/reports?startDate=${startDate}&endDate=${endDate}`
      );
      if (res.ok) {
        const data = await res.json();
        setMonthlyTotals(data.monthlyTotals);
        setCategorySpending(data.categorySpending);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---- Computed stats ---- */

  const stats = useMemo(() => {
    const totalIncome = monthlyTotals.reduce((s, m) => s + m.income, 0);
    const totalExpenses = monthlyTotals.reduce((s, m) => s + m.expenses, 0);
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
    return { totalIncome, totalExpenses, netSavings, savingsRate };
  }, [monthlyTotals]);

  /* ---- Pie chart data (category totals) ---- */

  const pieData = useMemo(() => {
    const byCategory = new Map<string, { key: string; total: number }>();
    for (const cs of categorySpending) {
      if (cs.categoryType !== "expense") continue;
      const existing = byCategory.get(cs.categoryKey);
      if (existing) {
        existing.total += cs.total;
      } else {
        byCategory.set(cs.categoryKey, { key: cs.categoryKey, total: cs.total });
      }
    }
    return Array.from(byCategory.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [categorySpending]);

  /* ---- Category table data ---- */

  const categoryTableData = useMemo(() => {
    const totalExpenses = pieData.reduce((s, d) => s + d.total, 0);
    return pieData.map((d) => ({
      ...d,
      percentage: totalExpenses > 0 ? (d.total / totalExpenses) * 100 : 0,
    }));
  }, [pieData]);

  /* ---- Trend chart data ---- */

  const trendData = useMemo(() => {
    return monthlyTotals.map((m) => ({
      month: m.month,
      income: m.income / 100,
      expenses: m.expenses / 100,
    }));
  }, [monthlyTotals]);

  /* ---- Heatmap data ---- */

  const heatmapData = useMemo(() => {
    // Build daily spending from category spending (approximate: distribute monthly totals evenly)
    // For a proper heatmap, we'd need daily transaction data. For now, use monthly totals spread.
    const result: { date: string; amount: number }[] = [];
    for (const m of monthlyTotals) {
      const year = parseInt(m.month.split("-")[0]);
      const month = parseInt(m.month.split("-")[1]) - 1;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const dailyExpense = m.expenses / 100 / daysInMonth;

      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        result.push({ date: dateStr, amount: dailyExpense });
      }
    }
    return result;
  }, [monthlyTotals]);

  /* ---- Sankey data ---- */

  const sankeyData = useMemo(() => {
    const flows: { source: string; target: string; value: number }[] = [];

    // Income categories as sources
    const incomeByCategory = new Map<string, number>();
    const expenseByCategory = new Map<string, number>();

    for (const cs of categorySpending) {
      if (cs.categoryType === "income") {
        const existing = incomeByCategory.get(cs.categoryKey) ?? 0;
        incomeByCategory.set(cs.categoryKey, existing + cs.total / 100);
      } else if (cs.categoryType === "expense") {
        const existing = expenseByCategory.get(cs.categoryKey) ?? 0;
        expenseByCategory.set(cs.categoryKey, existing + cs.total / 100);
      }
    }

    // If we have income and expense categories, create flows
    if (incomeByCategory.size > 0 && expenseByCategory.size > 0) {
      const totalIncome = Array.from(incomeByCategory.values()).reduce((s, v) => s + v, 0);

      for (const [incKey, incVal] of incomeByCategory) {
        const incRatio = totalIncome > 0 ? incVal / totalIncome : 0;
        for (const [expKey, expVal] of expenseByCategory) {
          const value = expVal * incRatio;
          if (value > 0) {
            flows.push({ source: incKey, target: expKey, value });
          }
        }
      }
    }

    return flows;
  }, [categorySpending]);

  /* ---- Export handlers ---- */

  const handleExportPng = useCallback(async () => {
    if (!exportRef.current) return;
    const { toPng } = await import("html-to-image");
    try {
      const dataUrl = await toPng(exportRef.current);
      const link = document.createElement("a");
      link.download = "report.png";
      link.href = dataUrl;
      link.click();
    } catch {
      // silent fail
    }
  }, []);

  const handleExportSvg = useCallback(async () => {
    if (!exportRef.current) return;
    const { toSvg } = await import("html-to-image");
    try {
      const dataUrl = await toSvg(exportRef.current);
      const link = document.createElement("a");
      link.download = "report.svg";
      link.href = dataUrl;
      link.click();
    } catch {
      // silent fail
    }
  }, []);

  /* ---- Empty state ---- */

  if (monthlyTotals.length === 0 && !loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-sm font-medium">{t("noData")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("noDataDescription")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Tabs value={range} onValueChange={handleRangeChange}>
          <TabsList>
            <TabsTrigger value="month">{t("timeRange.month")}</TabsTrigger>
            <TabsTrigger value="quarter">{t("timeRange.quarter")}</TabsTrigger>
            <TabsTrigger value="year">{t("timeRange.year")}</TabsTrigger>
            <TabsTrigger value="all">{t("timeRange.all")}</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPng}>
            <ImageIcon className="mr-1 size-4" />
            {t("export.exportAsPng")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportSvg}>
            <DownloadIcon className="mr-1 size-4" />
            {t("export.exportAsSvg")}
          </Button>
        </div>
      </div>

      {/* Exportable container */}
      <div ref={exportRef} className="space-y-6">
        {/* Summary stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <TrendingUpIcon className="size-5 text-emerald-500" />
              <div>
                <p className="text-sm text-muted-foreground">{t("stats.totalIncome")}</p>
                <p className="text-2xl font-bold">
                  {formatAmount({ amountMinor: stats.totalIncome, currency })}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <TrendingDownIcon className="size-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">{t("stats.totalExpenses")}</p>
                <p className="text-2xl font-bold">
                  {formatAmount({ amountMinor: stats.totalExpenses, currency })}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <DollarSignIcon className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t("stats.netSavings")}</p>
                <p className={`text-2xl font-bold ${stats.netSavings >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatAmount({ amountMinor: Math.abs(stats.netSavings), currency })}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <PercentIcon className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{t("stats.savingsRate")}</p>
                <p className="text-2xl font-bold">{stats.savingsRate.toFixed(1)}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Spending by category: pie chart + table */}
        {pieData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("sections.spendingByCategory")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Pie chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LazyPieChart>
                      <Pie
                        data={pieData}
                        dataKey="total"
                        nameKey="key"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ key }: { key?: string }) => key ?? ""}
                      >
                        {pieData.map((_, idx) => (
                          <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number | undefined) =>
                          value != null
                            ? formatAmount({ amountMinor: Math.round(value), currency })
                            : ""
                        }
                      />
                    </LazyPieChart>
                  </ResponsiveContainer>
                </div>

                {/* Category table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                          {t("categoryTable.category")}
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                          {t("categoryTable.amount")}
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                          {t("categoryTable.percentage")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryTableData.map((row, i) => (
                        <tr key={row.key} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="flex items-center gap-2 px-3 py-2 text-foreground">
                            <div
                              className="size-3 rounded-full"
                              style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                            />
                            {row.key}
                          </td>
                          <td className="px-3 py-2 text-right font-medium text-foreground">
                            {formatAmount({ amountMinor: Math.round(row.total), currency })}
                          </td>
                          <td className="px-3 py-2 text-right text-muted-foreground">
                            {row.percentage.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Income vs Expense trend */}
        {trendData.length > 0 && (
          <SpendingTrendChart
            data={trendData}
            currency={currency}
            formatAmount={formatAmount}
          />
        )}

        {/* Spending heatmap */}
        {heatmapData.length > 0 && (
          <SpendingHeatmap
            data={heatmapData}
            currency={currency}
            formatAmount={formatAmount}
          />
        )}

        {/* Sankey money flow */}
        {sankeyData.length > 0 && (
          <SankeyDiagram
            data={sankeyData}
            currency={currency}
            formatAmount={formatAmount}
          />
        )}
      </div>
    </div>
  );
}
