"use client";

/**
 * Budget Progress Widget
 *
 * Shows progress bars comparing actual spending vs budget per category
 */

import { EmptyState } from "@/components/budget/states/EmptyState";
import { GlassCard } from "@/components/budget/ui/GlassCard";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";
import { db } from "@/lib/budget-db";
import { useLiveQuery } from "dexie-react-hooks";
import { Target, TrendingUp } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import NextLink from "next/link";
import { useMemo } from "react";
import type { WidgetConfig } from "../types";

interface BudgetProgressWidgetProps {
  config: WidgetConfig;
}

interface BudgetProgressItem {
  categoryName: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  color: string;
}

export function BudgetProgressWidget({ config }: BudgetProgressWidgetProps) {
  const t = useTranslations("dashboard.widgets.budgetProgress");
  const format = useFormatter();
  const currency = useDefaultCurrency();

  // Fetch budgets
  const budgets = useLiveQuery(() => db.budgets.toArray()) || [];

  // Fetch categories for colors/names
  const categories = useLiveQuery(() => db.categories.toArray()) || [];

  // Fetch current month transactions
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

  // Calculate budget progress for each category
  const budgetProgress = useMemo<BudgetProgressItem[]>(() => {
    if (budgets.length === 0) return [];

    // Group spending by category name
    const spendingByCategory = new Map<string, number>();
    transactions.forEach((tx) => {
      const catName = tx.category || "Uncategorized";
      spendingByCategory.set(catName, (spendingByCategory.get(catName) || 0) + Math.abs(tx.amount));
    });

    return budgets
      .map((budget) => {
        const category = categories.find((c) => c.id === budget.categoryId);
        const categoryName = category?.name || "Unknown";
        const spent = spendingByCategory.get(categoryName) || 0;
        const percentage = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 150) : 0;

        return {
          categoryName,
          budgeted: budget.amount,
          spent,
          remaining: budget.amount - spent,
          percentage,
          isOverBudget: spent > budget.amount,
          color: category?.color || "#64748b",
        };
      })
      .sort((a, b) => b.percentage - a.percentage); // Sort by percentage (highest first)
  }, [budgets, categories, transactions]);

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
            <div className="rounded-lg bg-emerald-500/20 p-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">{t("title")}</h3>
          </div>
          <NextLink
            href="/budget-app/budgets"
            className="text-xs text-slate-400 transition-colors hover:text-white"
          >
            {t("viewAll")}
          </NextLink>
        </div>

        {/* Content */}
        {budgetProgress.length === 0 ? (
          <EmptyState
            icon={Target}
            title={t("noBudgets")}
            description={t("createBudget")}
            actionLabel={t("createBudget")}
            onAction={() => (window.location.href = "/budget-app/budgets")}
            className="min-h-[200px] border-none bg-transparent p-0"
          />
        ) : (
          <div className="custom-scrollbar max-h-[280px] space-y-4 overflow-y-auto pr-1">
            {budgetProgress.slice(0, 5).map((item) => (
              <ProgressItem
                key={item.categoryName}
                item={item}
                format={format}
                t={t}
                currency={currency}
              />
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

interface ProgressItemProps {
  item: BudgetProgressItem;
  format: ReturnType<typeof useFormatter>;
  t: ReturnType<typeof useTranslations>;
  currency: string;
}

function ProgressItem({ item, format, t, currency }: ProgressItemProps) {
  const barColor = item.isOverBudget
    ? "bg-red-500"
    : item.percentage > 80
      ? "bg-amber-500"
      : "bg-emerald-500";

  const textColor = item.isOverBudget
    ? "text-red-400"
    : item.percentage > 80
      ? "text-amber-400"
      : "text-emerald-400";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-sm font-medium text-slate-200">{item.categoryName}</span>
        </div>
        <div className="text-right">
          <span className={`text-xs font-medium ${textColor}`}>
            {format.number(item.spent, { style: "currency", currency })}
          </span>
          <span className="text-xs text-slate-500">
            {" / "}
            {format.number(item.budgeted, { style: "currency", currency })}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 overflow-hidden rounded-full bg-slate-700">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(item.percentage, 100)}%` }}
        />
      </div>

      {/* Status text */}
      <div className="flex justify-between text-xs">
        {item.isOverBudget ? (
          <span className="text-red-400">
            {t("overBudget", {
              amount: format.number(Math.abs(item.remaining), {
                style: "currency",
                currency,
              }),
            })}
          </span>
        ) : (
          <span className="text-slate-500">
            {t("remaining")}: {format.number(item.remaining, { style: "currency", currency })}
          </span>
        )}
        <span className="text-slate-400">{Math.round(item.percentage)}%</span>
      </div>
    </div>
  );
}
