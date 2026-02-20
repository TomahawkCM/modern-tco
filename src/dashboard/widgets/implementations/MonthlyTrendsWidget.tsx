"use client";

/**
 * Monthly Trends Widget
 *
 * Shows a line chart of income and expense trends over the last 6 months
 */

import { EmptyState } from "@/components/budget/states/EmptyState";
import { GlassCard } from "@/components/budget/ui/GlassCard";
import { db } from "@/lib/budget-db";
import { useLiveQuery } from "dexie-react-hooks";
import { LineChart, TrendingUp } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WidgetConfig } from "../types";

interface MonthlyTrendsWidgetProps {
  config: WidgetConfig;
}

interface MonthData {
  month: string;
  monthKey: string;
  income: number;
  expenses: number;
}

export function MonthlyTrendsWidget({ config }: MonthlyTrendsWidgetProps) {
  const t = useTranslations("dashboard.widgets.monthlyTrends");
  const format = useFormatter();

  // Fetch transactions from last 6 months
  const transactions =
    useLiveQuery(async () => {
      try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);
        const startTime = sixMonthsAgo.getTime();

        // Use filter instead of where for reliable Date comparison
        const allTxs = await db.transactions.toArray();
        return allTxs.filter((tx) => {
          if (tx.isSplit) return false;
          const txTime = new Date(tx.date).getTime();
          return txTime >= startTime;
        });
      } catch {
        return [];
      }
    }) || [];

  // Aggregate by month
  const monthlyData = useMemo<MonthData[]>(() => {
    // Initialize last 6 months
    const months = new Map<string, { income: number; expenses: number }>();
    const monthNames: string[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.set(key, { income: 0, expenses: 0 });

      // Format month name (e.g., "Jan", "Feb")
      const monthName = d.toLocaleDateString("en-US", { month: "short" });
      monthNames.push(monthName);
    }

    // Aggregate transactions
    transactions.forEach((tx) => {
      const date = new Date(tx.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const entry = months.get(key);
      if (entry) {
        if (tx.amount > 0) {
          entry.income += tx.amount;
        } else {
          entry.expenses += Math.abs(tx.amount);
        }
      }
    });

    // Convert to array
    const keys = Array.from(months.keys());
    return keys.map((key, index) => {
      const data = months.get(key)!;
      return {
        monthKey: key,
        month: monthNames[index],
        income: Math.round(data.income),
        expenses: Math.round(data.expenses),
      };
    });
  }, [transactions]);

  // Check if we have enough data (at least 2 months with transactions)
  const monthsWithData = monthlyData.filter((m) => m.income > 0 || m.expenses > 0).length;
  const hasEnoughData = monthsWithData >= 2;

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
            <div className="rounded-lg bg-cyan-500/20 p-2">
              <LineChart className="h-5 w-5 text-cyan-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">{t("title")}</h3>
          </div>
          <span className="text-xs text-slate-400">{t("lastSixMonths")}</span>
        </div>

        {/* Content */}
        {!hasEnoughData ? (
          <EmptyState
            icon={TrendingUp}
            title={t("notEnoughData")}
            description={t("needMoreData")}
            actionLabel={t("addTransactions")}
            onAction={() => (window.location.href = "/budget-app/transactions")}
            className="min-h-[200px] border-none bg-transparent p-0"
          />
        ) : (
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={220}>
              <RechartsLineChart
                data={monthlyData}
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={{ stroke: "#475569" }}
                  tickLine={{ stroke: "#475569" }}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={{ stroke: "#475569" }}
                  tickLine={{ stroke: "#475569" }}
                  tickFormatter={(value) =>
                    value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value}`
                  }
                  width={50}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#f1f5f9" }}
                  formatter={(value: number, name: string) => [
                    format.number(value, { style: "currency", currency: "USD" }),
                    name === "income" ? t("income") : t("expenses"),
                  ]}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "10px" }}
                  formatter={(value) => (value === "income" ? t("income") : t("expenses"))}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#10b981" }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  dot={{ fill: "#f43f5e", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#f43f5e" }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
