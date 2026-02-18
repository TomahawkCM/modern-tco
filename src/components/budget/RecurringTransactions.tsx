"use client";

/**
 * Recurring Transactions Component (Phase 4)
 * Task 4.2.3: Display detected recurring transactions
 *
 * Shows subscriptions and recurring bills
 */

import { useTranslations } from "next-intl";
import { RefreshCw, Calendar, DollarSign } from "lucide-react";
import type { RecurringPattern } from "@/lib/analytics/recurring-detector";
import type { Transaction } from "@/types/budget";

interface RecurringTransactionsProps {
  patterns: RecurringPattern[];
}

export function RecurringTransactions({ patterns }: RecurringTransactionsProps) {
  const t = useTranslations("recurringTransactions");

  if (patterns.length === 0) {
    return null;
  }

  const frequencyColors = {
    weekly: "bg-teal-100 text-teal-700",
    biweekly: "bg-gray-200 text-gray-700",
    monthly: "bg-teal-100 text-teal-700",
    quarterly: "bg-gray-200 text-gray-700",
  };

  // Calculate total monthly recurring cost
  const totalMonthly = patterns.reduce((sum, p) => {
    const monthlyAmount =
      p.frequency === "weekly"
        ? p.averageAmount * 4.33
        : p.frequency === "biweekly"
          ? p.averageAmount * 2.17
          : p.frequency === "monthly"
            ? p.averageAmount
            : p.averageAmount / 3;
    return sum + monthlyAmount;
  }, 0);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{t("title")}</h3>
          <p className="mt-2 text-sm text-gray-600">{t("subtitle")}</p>
        </div>
        <div className="text-end">
          <div className="text-xs text-gray-600">{t("estimatedMonthly")}</div>
          <div className="text-xl font-bold text-teal-600">${totalMonthly.toFixed(2)}</div>
        </div>
      </div>

      <div className="space-y-4">
        {patterns.map((pattern, index) => {
          const daysUntilNext = Math.ceil(
            (pattern.nextExpectedDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          const isUpcoming = daysUntilNext >= 0 && daysUntilNext <= 7;

          return (
            <div
              key={index}
              className={`rounded-lg border p-4 ${
                isUpcoming ? "border-amber-300 bg-amber-50" : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-gray-600" />
                    <span className="font-semibold text-gray-900">{pattern.merchant}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        frequencyColors[pattern.frequency]
                      }`}
                    >
                      {t(`frequency.${pattern.frequency}`)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3 w-3" />
                      <span>${pattern.averageAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {t("next", { date: pattern.nextExpectedDate.toLocaleDateString() })}
                      </span>
                      {isUpcoming && (
                        <span className="font-medium text-amber-700">
                          {t("inDays", { count: daysUntilNext })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    {t("occurrences", { count: pattern.occurrences })}
                    {" • "}
                    {pattern.category}
                    {pattern.subcategory && ` - ${pattern.subcategory}`}
                    {" • "}
                    {t("confidence", { percent: (pattern.confidence * 100).toFixed(0) })}
                  </div>
                </div>

                <div className="text-end">
                  <div className="text-sm font-semibold text-gray-900">
                    ${pattern.averageAmount.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {pattern.frequency === "weekly" && t("perPeriod.week")}
                    {pattern.frequency === "biweekly" && t("perPeriod.twoWeeks")}
                    {pattern.frequency === "monthly" && t("perPeriod.month")}
                    {pattern.frequency === "quarterly" && t("perPeriod.quarter")}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {patterns.length > 3 && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <p className="text-center text-xs text-gray-600">
            {t("showingPatterns", { count: patterns.length })}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Group transactions by normalized merchant name
 */
function groupByMerchant(transactions: Transaction[]): Map<string, Transaction[]> {
  const grouped = new Map<string, Transaction[]>();

  transactions.forEach((tx) => {
    if (tx.amount >= 0) return; // Only expenses

    const key = tx.description.toUpperCase().trim();

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(tx);
  });

  return grouped;
}
