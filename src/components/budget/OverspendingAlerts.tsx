"use client";

/**
 * Overspending Alerts Component (Phase 4)
 * Task 4.2.2: Display overspending alerts
 *
 * Shows warnings when user is projected to exceed budget
 */

import { useTranslations, useLocale } from "next-intl";
import { AlertTriangle, TrendingUp } from "lucide-react";
import type { OverspendingAlert } from "@/lib/analytics/overspending-detector";
import { formatCurrency } from "@/i18n/utils/formatCurrency";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";

interface OverspendingAlertsProps {
  alerts: OverspendingAlert[];
}

export function OverspendingAlerts({ alerts }: OverspendingAlertsProps) {
  const t = useTranslations("overspendingAlerts");
  const currency = useDefaultCurrency();
  const locale = useLocale();
  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert, index) => {
        const percentageUsed = (alert.currentSpent / alert.budgetAmount) * 100;
        const projectedPercentage = (alert.projectedSpending / alert.budgetAmount) * 100;

        return (
          <div
            key={index}
            className={`rounded-lg border-s-4 p-4 ${
              alert.severity === "danger"
                ? "border-red-500 bg-red-50"
                : "border-amber-500 bg-amber-50"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertTriangle
                  className={`h-5 w-5 ${
                    alert.severity === "danger" ? "text-red-600" : "text-amber-600"
                  }`}
                />
              </div>

              <div className="flex-1">
                <div className="mb-2 flex items-center justify-between">
                  <h4
                    className={`font-semibold ${
                      alert.severity === "danger" ? "text-red-900" : "text-amber-900"
                    }`}
                  >
                    {alert.categoryName}
                  </h4>
                  <span
                    className={`text-sm font-medium ${
                      alert.severity === "danger" ? "text-red-700" : "text-amber-700"
                    }`}
                  >
                    {t("percentOfBudget", { percent: projectedPercentage.toFixed(0) })}
                  </span>
                </div>

                <p
                  className={`mb-4 text-sm ${
                    alert.severity === "danger" ? "text-red-800" : "text-amber-800"
                  }`}
                >
                  ⚠️{" "}
                  {t("exceededWarning", {
                    amount: formatCurrency(alert.projectedOverage, currency, locale),
                  })}
                </p>

                <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
                  <div>
                    <div className="text-gray-600">{t("stats.budget")}</div>
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(alert.budgetAmount, currency, locale)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">{t("stats.spentSoFar")}</div>
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(alert.currentSpent, currency, locale)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">{t("stats.projectedTotal")}</div>
                    <div
                      className={`font-semibold ${
                        alert.severity === "danger" ? "text-red-700" : "text-amber-700"
                      }`}
                    >
                      {formatCurrency(alert.projectedSpending, currency, locale)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">{t("stats.daysLeft")}</div>
                    <div className="font-semibold text-gray-900">{alert.daysRemaining}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-gray-600">{t("progress.label")}</span>
                    <span
                      className={alert.severity === "danger" ? "text-red-700" : "text-amber-700"}
                    >
                      {percentageUsed.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full transition-all ${
                        alert.severity === "danger" ? "bg-red-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Suggestion */}
                <div
                  className={`mt-4 text-xs ${
                    alert.severity === "danger" ? "text-red-700" : "text-amber-700"
                  }`}
                >
                  <TrendingUp className="me-2 inline h-3 w-3" />
                  <span className="font-medium">{t("tip.label")}</span>{" "}
                  {t("tip.reduceSpending", {
                    amount: formatCurrency(
                      alert.budgetAmount /
                        new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate(),
                      currency,
                      locale
                    ),
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
