"use client";

/**
 * Budget Alerts Widget
 *
 * Displays overspending alerts and anomaly warnings on the dashboard.
 * Fetches data from overspending-detector and renders inline alerts.
 */

import { GlassCard } from "@/components/budget/ui/GlassCard";
import { db } from "@/lib/budget-db";
import {
  detectOverspending,
  detectCurrentOverspending,
} from "@/lib/analytics/overspending-detector";
import { useLiveQuery } from "dexie-react-hooks";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";
import { AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useMemo } from "react";
import type { WidgetConfig } from "../types";

interface BudgetAlertsWidgetProps {
  config: WidgetConfig;
}

export function BudgetAlertsWidget({ config }: BudgetAlertsWidgetProps) {
  const t = useTranslations("alerts");
  const format = useFormatter();
  const currency = useDefaultCurrency();

  const dbData = useLiveQuery(async () => {
    try {
      const [transactions, budgets, categories] = await Promise.all([
        db.transactions.toArray(),
        db.budgets.toArray(),
        db.categories.toArray(),
      ]);
      return { transactions, budgets, categories };
    } catch {
      return { transactions: [], budgets: [], categories: [] };
    }
  });

  const alerts = useMemo(() => {
    if (!dbData) return { projected: [], current: [] };
    const { transactions, budgets, categories } = dbData;
    const projected = detectOverspending(transactions, budgets, categories);
    const current = detectCurrentOverspending(transactions, budgets, categories);
    return { projected, current };
  }, [dbData]);

  const allAlerts = useMemo(() => {
    // Deduplicate: prefer current (already over) over projected
    const currentIds = new Set(alerts.current.map((a) => a.categoryId));
    const projectedOnly = alerts.projected.filter((a) => !currentIds.has(a.categoryId));
    return [...alerts.current, ...projectedOnly];
  }, [alerts]);

  const spanClass =
    config.size === "large"
      ? "md:col-span-2 lg:col-span-4"
      : config.size === "medium"
        ? "md:col-span-2"
        : "";

  return (
    <div className={spanClass}>
      <GlassCard className="flex h-full flex-col p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-amber-500/20 p-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">{t("widgetTitle")}</h3>
          {allAlerts.length > 0 && (
            <span className="ml-auto rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">
              {allAlerts.length}
            </span>
          )}
        </div>

        {allAlerts.length === 0 ? (
          <div className="flex flex-1 items-center justify-center gap-2 py-4 text-sm text-emerald-400">
            <CheckCircle className="h-4 w-4" />
            <span>{t("noAlerts")}</span>
          </div>
        ) : (
          <div className="space-y-3">
            {allAlerts.slice(0, 4).map((alert) => {
              const percentUsed = (alert.currentSpent / alert.budgetAmount) * 100;
              const isDanger = alert.severity === "danger";

              return (
                <div
                  key={alert.categoryId}
                  className={`rounded-lg border-l-4 p-3 ${
                    isDanger ? "border-red-500 bg-red-500/10" : "border-amber-500 bg-amber-500/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{alert.categoryName}</span>
                    <span
                      className={`text-xs font-medium ${isDanger ? "text-red-400" : "text-amber-400"}`}
                    >
                      {Math.round(percentUsed)}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700">
                    <div
                      className={`h-full rounded-full transition-all ${isDanger ? "bg-red-500" : "bg-amber-500"}`}
                      style={{ width: `${Math.min(percentUsed, 100)}%` }}
                    />
                  </div>

                  <div className="mt-1.5 flex justify-between text-xs text-slate-400">
                    <span>
                      {format.number(alert.currentSpent, { style: "currency", currency })} /{" "}
                      {format.number(alert.budgetAmount, { style: "currency", currency })}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" />
                      {format.number(alert.projectedSpending, { style: "currency", currency })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
