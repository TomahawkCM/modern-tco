"use client";

/**
 * Spending by Category Widget
 *
 * Shows a pie chart of spending distribution by category for the current month
 */

import { GlassCard } from "@/components/budget/ui/GlassCard";
import { db } from "@/lib/budget-db";
import { useLiveQuery } from "dexie-react-hooks";
import { PieChart, Plus, ShoppingBag } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import NextLink from "next/link";
import { useMemo } from "react";
import { Cell, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { WidgetConfig } from "../types";

interface SpendingByCategoryWidgetProps {
  config: WidgetConfig;
}

interface CategorySpending {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

// Default colors for categories without defined colors
const DEFAULT_COLORS = [
  "#10b981", // emerald
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f59e0b", // amber
  "#06b6d4", // cyan
  "#ef4444", // red
  "#84cc16", // lime
];

export function SpendingByCategoryWidget({ config }: SpendingByCategoryWidgetProps) {
  const t = useTranslations("dashboard.widgets.spendingByCategory");
  const format = useFormatter();

  // Fetch categories for colors
  const categories = useLiveQuery(() => db.categories.toArray()) || [];

  // Fetch current month transactions (expenses only)
  const transactions =
    useLiveQuery(async () => {
      try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const startTime = startOfMonth.getTime();

        // Use filter instead of where for reliable Date comparison
        const allTxs = await db.transactions.toArray();
        return allTxs.filter((tx) => {
          if (tx.isSplit || tx.amount >= 0) return false;
          const txTime = new Date(tx.date).getTime();
          return txTime >= startTime;
        });
      } catch {
        return [];
      }
    }) || [];

  // Aggregate spending by category
  const { categoryData, totalSpending } = useMemo(() => {
    const categoryMap = new Map<string, number>();

    transactions.forEach((tx) => {
      const cat = tx.category || t("uncategorized");
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + Math.abs(tx.amount));
    });

    const total = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);

    const data: CategorySpending[] = Array.from(categoryMap.entries())
      .map(([name, value], index) => {
        const category = categories.find((c) => c.name === name);
        return {
          name,
          value,
          color: category?.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
          percentage: total > 0 ? (value / total) * 100 : 0,
        };
      })
      .sort((a, b) => b.value - a.value);

    return { categoryData: data, totalSpending: total };
  }, [transactions, categories, t]);

  const hasData = categoryData.length > 0;

  // Size-based span class
  const spanClass =
    config.size === "large"
      ? "md:col-span-2 lg:col-span-4"
      : config.size === "medium"
        ? "md:col-span-2"
        : "";

  return (
    <div className={spanClass}>
      <GlassCard className="flex h-full flex-col p-5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-violet-500/20 p-2">
              <PieChart className="h-5 w-5 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">{t("title")}</h3>
          </div>
          <span className="text-xs text-slate-400">{t("thisMonth")}</span>
        </div>

        {/* Content */}
        {!hasData ? (
          <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
            <ShoppingBag className="mb-3 h-12 w-12 text-slate-600" />
            <p className="text-sm text-slate-500">{t("noData")}</p>
            <NextLink
              href="/budget-app/transactions"
              className="mt-4 flex items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-600/20 px-4 py-2 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-600/30"
            >
              <Plus className="h-4 w-4" />
              {t("addTransactions")}
            </NextLink>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-4 lg:flex-row">
            {/* Pie Chart */}
            <div className="flex-shrink-0 lg:w-1/2">
              <ResponsiveContainer width="100%" height={180}>
                <RechartsPieChart>
                  <Pie
                    data={categoryData.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.slice(0, 6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as CategorySpending;
                        return (
                          <div className="rounded-lg border border-slate-700 bg-slate-800 p-2 shadow-lg">
                            <p className="text-sm font-medium text-white">{data.name}</p>
                            <p className="text-xs text-slate-400">
                              {format.number(data.value, { style: "currency", currency: "USD" })} (
                              {data.percentage.toFixed(1)}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
              {/* Center total */}
              <div className="-mt-[120px] mb-[60px] text-center">
                <p className="text-xs text-slate-400">Total</p>
                <p className="text-sm font-bold text-white">
                  {format.number(totalSpending, { style: "currency", currency: "USD" })}
                </p>
              </div>
            </div>

            {/* Legend */}
            <div className="custom-scrollbar max-h-[200px] flex-1 space-y-2 overflow-y-auto pr-1">
              {categoryData.slice(0, 6).map((cat) => (
                <div key={cat.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div
                      className="h-3 w-3 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate text-sm text-slate-300">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <span className="text-xs text-slate-400">{cat.percentage.toFixed(1)}%</span>
                    <span className="whitespace-nowrap text-sm font-medium text-white">
                      {format.number(cat.value, { style: "currency", currency: "USD" })}
                    </span>
                  </div>
                </div>
              ))}
              {categoryData.length > 6 && (
                <p className="text-center text-xs text-slate-500">
                  +{categoryData.length - 6} more categories
                </p>
              )}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
