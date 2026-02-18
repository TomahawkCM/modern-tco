"use client";

/**
 * Income vs Expenses Widget
 *
 * Compares total income vs expenses for the current month
 */

import { GlassCard } from "@/components/budget/ui/GlassCard";
import { db } from "@/lib/budget-db";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowDownRight, ArrowUpRight, BarChart3, Plus, Scale } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import NextLink from "next/link";
import { useMemo } from "react";
import type { WidgetConfig } from "../types";

interface IncomeVsExpensesWidgetProps {
  config: WidgetConfig;
}

export function IncomeVsExpensesWidget({ config }: IncomeVsExpensesWidgetProps) {
  const t = useTranslations("dashboard.widgets.incomeVsExpenses");
  const format = useFormatter();

  // Fetch current month transactions
  const transactions =
    useLiveQuery(async () => {
      try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const startTime = startOfMonth.getTime();

        // Use filter instead of where for reliable Date comparison
        // IndexedDB date indexing can be unreliable across browsers
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

  // Calculate income, expenses, and net
  const { income, expenses, net } = useMemo(() => {
    const income = transactions
      .filter((tx) => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const expenses = transactions
      .filter((tx) => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    return { income, expenses, net: income - expenses };
  }, [transactions]);

  // Calculate bar widths (relative to max value)
  const maxValue = Math.max(income, expenses, 1);
  const incomeWidth = (income / maxValue) * 100;
  const expenseWidth = (expenses / maxValue) * 100;

  const hasData = transactions.length > 0;

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
            <div className="rounded-lg bg-blue-500/20 p-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">{t("title")}</h3>
          </div>
          <span className="text-xs text-slate-400">{t("thisMonth")}</span>
        </div>

        {/* Content */}
        {!hasData ? (
          <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
            <Scale className="mb-3 h-12 w-12 text-slate-600" />
            <p className="text-sm text-slate-500">{t("noData")}</p>
            <NextLink
              href="/budget-app/transactions"
              className="mt-4 flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-300 transition-colors hover:bg-blue-600/30"
            >
              <Plus className="h-4 w-4" />
              {t("addTransactions")}
            </NextLink>
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-center space-y-6">
            {/* Income Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-medium text-slate-300">{t("income")}</span>
                </div>
                <span className="text-sm font-semibold text-emerald-400">
                  {format.number(income, { style: "currency", currency: "USD" })}
                </span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700"
                  style={{ width: `${incomeWidth}%` }}
                />
              </div>
            </div>

            {/* Expenses Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="h-4 w-4 text-rose-400" />
                  <span className="text-sm font-medium text-slate-300">{t("expenses")}</span>
                </div>
                <span className="text-sm font-semibold text-rose-400">
                  {format.number(expenses, { style: "currency", currency: "USD" })}
                </span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-700"
                  style={{ width: `${expenseWidth}%` }}
                />
              </div>
            </div>

            {/* Net Summary */}
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-400">{t("net")}</span>
                <span
                  className={`text-xl font-bold ${net >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                >
                  {net >= 0 ? "+" : ""}
                  {format.number(net, { style: "currency", currency: "USD" })}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {net >= 0
                  ? `You're saving ${format.number((net / income) * 100 || 0, { maximumFractionDigits: 1 })}% of your income`
                  : `You're overspending by ${format.number(Math.abs(net), { style: "currency", currency: "USD" })}`}
              </p>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
