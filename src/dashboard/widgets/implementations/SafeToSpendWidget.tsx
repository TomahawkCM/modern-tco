"use client";

/**
 * Safe-to-Spend Widget
 *
 * Shows how much is safe to spend for the remainder of the month,
 * with daily budget breakdown and per-category progress bars.
 */

import { GlassCard } from "@/components/budget/ui/GlassCard";
import {
  calculateSafeToSpend,
  type CategoryPartial,
  type SafeToSpendData,
} from "@/lib/budget/safe-to-spend";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";
import { useLiveQuery } from "dexie-react-hooks";
import { ShieldCheck, Wallet } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import NextLink from "next/link";
import type { WidgetConfig } from "../types";

interface SafeToSpendWidgetProps {
  config: WidgetConfig;
}

export function SafeToSpendWidget({ config }: SafeToSpendWidgetProps) {
  const t = useTranslations("dashboard.widgets.safeToSpend");
  const format = useFormatter();
  const currency = useDefaultCurrency();

  // Reactively calculate safe-to-spend whenever DB data changes
  const data = useLiveQuery(
    () => calculateSafeToSpend()
  ) ?? null;

  // Size-based span class
  const spanClass =
    config.size === "large"
      ? "md:col-span-2 lg:col-span-4"
      : config.size === "medium"
        ? "md:col-span-2"
        : "";

  const formatCurrency = (value: number) =>
    format.number(value, { style: "currency", currency });

  return (
    <div className={spanClass}>
      <GlassCard className="flex h-full flex-col p-5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-cyan-500/20 p-2">
              <Wallet className="h-5 w-5 text-cyan-400" />
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
        {!data || data.partials.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
            <ShieldCheck className="mb-3 h-12 w-12 text-slate-600" />
            <p className="text-sm text-slate-500">{t("noBudgets")}</p>
            <NextLink
              href="/budget-app/budgets"
              className="mt-4 flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-600/20 px-4 py-2 text-sm font-medium text-cyan-300 transition-colors hover:bg-cyan-600/30"
            >
              <Wallet className="h-4 w-4" />
              {t("createBudget")}
            </NextLink>
          </div>
        ) : (
          <>
            {/* Total safe-to-spend & daily budget */}
            <div className="mb-4 rounded-lg bg-slate-800/50 p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-400">
                {t("totalSafe")}
              </p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(data.totalSafeToSpend)}
              </p>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                <span>
                  {t("dailyBudget")}:{" "}
                  <span className="font-medium text-cyan-400">
                    {formatCurrency(data.dailyBudget)}
                  </span>
                </span>
                <span className="text-slate-600">|</span>
                <span>
                  {t("daysRemaining", { days: data.daysRemainingInMonth })}
                </span>
              </div>
            </div>

            {/* Per-category partials */}
            <div className="custom-scrollbar max-h-[280px] space-y-4 overflow-y-auto pr-1">
              {data.partials.map((partial) => (
                <CategoryPartialItem
                  key={partial.categoryId}
                  partial={partial}
                  formatCurrency={formatCurrency}
                  t={t}
                />
              ))}
            </div>
          </>
        )}
      </GlassCard>
    </div>
  );
}

interface CategoryPartialItemProps {
  partial: CategoryPartial;
  formatCurrency: (value: number) => string;
  t: ReturnType<typeof useTranslations>;
}

function CategoryPartialItem({
  partial,
  formatCurrency,
  t,
}: CategoryPartialItemProps) {
  const barColor =
    partial.status === "danger"
      ? "bg-red-500"
      : partial.status === "caution"
        ? "bg-amber-500"
        : "bg-emerald-500";

  const textColor =
    partial.status === "danger"
      ? "text-red-400"
      : partial.status === "caution"
        ? "text-amber-400"
        : "text-emerald-400";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-200">
          {partial.categoryName}
        </span>
        <div className="text-right">
          <span className={`text-xs font-medium ${textColor}`}>
            {formatCurrency(partial.spent)}
          </span>
          <span className="text-xs text-slate-500">
            {" / "}
            {formatCurrency(partial.budgeted)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 overflow-hidden rounded-full bg-slate-700">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(partial.percentUsed, 100)}%` }}
        />
      </div>

      {/* Status text */}
      <div className="flex justify-between text-xs">
        <span className={textColor}>
          {partial.remaining > 0
            ? t("remaining", { amount: formatCurrency(partial.remaining) })
            : t("overBudget", {
                amount: formatCurrency(Math.abs(partial.remaining)),
              })}
        </span>
        <span className="text-slate-400">
          {Math.round(partial.percentUsed)}%
        </span>
      </div>
    </div>
  );
}
