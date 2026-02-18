"use client";

/**
 * Spending Insights Component (Phase 4)
 * Task 4.2.1: Display average spending insights
 *
 * Shows "You usually spend $X on Y" based on 3-month average
 */

import React from "react";
import { TrendingUp, TrendingDown, Minus, Lightbulb } from "lucide-react";
import type { SpendingInsight } from "@/lib/analytics/spending-insights";

interface SpendingInsightsProps {
  insights: SpendingInsight[];
  averageMonthlyIncome: number;
  averageMonthlySpending: number;
}

export function SpendingInsights({
  insights,
  averageMonthlyIncome,
  averageMonthlySpending,
}: SpendingInsightsProps) {
  if (insights.length === 0) {
    return null;
  }

  const averageSavings = averageMonthlyIncome - averageMonthlySpending;
  const savingsRate = averageMonthlyIncome > 0 ? (averageSavings / averageMonthlyIncome) * 100 : 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
          <Lightbulb className="h-5 w-5 text-teal-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">💡 Spending Insights</h3>
          <p className="text-sm text-gray-600">Based on your last 3 months</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4">
        <div>
          <div className="mb-2 text-xs text-gray-600">Avg Income</div>
          <div className="text-lg font-bold text-green-600">${averageMonthlyIncome.toFixed(0)}</div>
        </div>
        <div>
          <div className="mb-2 text-xs text-gray-600">Avg Spending</div>
          <div className="text-lg font-bold text-gray-900">
            ${averageMonthlySpending.toFixed(0)}
          </div>
        </div>
        <div>
          <div className="mb-2 text-xs text-gray-600">Savings Rate</div>
          <div
            className={`text-lg font-bold ${savingsRate >= 20 ? "text-green-600" : savingsRate >= 10 ? "text-amber-600" : "text-red-600"}`}
          >
            {savingsRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Category Insights */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
          Top Spending Categories
        </h4>

        {insights.map((insight, index) => {
          const trendIcon =
            insight.trend === "up" ? TrendingUp : insight.trend === "down" ? TrendingDown : Minus;

          const trendColor =
            insight.trend === "up"
              ? "text-red-600"
              : insight.trend === "down"
                ? "text-green-600"
                : "text-gray-500";

          return (
            <div
              key={index}
              className="rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{insight.category}</span>
                    {insight.subcategory && (
                      <span className="text-sm text-gray-600">• {insight.subcategory}</span>
                    )}
                  </div>

                  <p className="mb-2 text-sm text-gray-700">
                    You usually spend{" "}
                    <span className="font-bold text-teal-600">
                      ${insight.averageMonthly.toFixed(2)}
                    </span>{" "}
                    per month on this category
                  </p>

                  {/* Current vs Average */}
                  {insight.trend !== "stable" && (
                    <div className="flex items-center gap-2 text-xs">
                      {React.createElement(trendIcon, { className: `w-3 h-3 ${trendColor}` })}
                      <span className={trendColor}>
                        {insight.trend === "up" ? "Spending more" : "Spending less"} this month:{" "}
                        <span className="font-semibold">
                          {insight.variance >= 0 ? "+" : ""}${insight.variance.toFixed(2)}
                        </span>{" "}
                        ({insight.variancePercent >= 0 ? "+" : ""}
                        {insight.variancePercent.toFixed(1)}%)
                      </span>
                    </div>
                  )}

                  {insight.trend === "stable" && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Minus className="h-3 w-3" />
                      <span>Spending on track with average</span>
                    </div>
                  )}
                </div>

                <div className="text-end">
                  <div className="text-xs text-gray-600">This Month</div>
                  <div className="text-lg font-bold text-gray-900">
                    ${insight.currentMonth.toFixed(0)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Data Source Note */}
      <div className="mt-4 border-t border-gray-200 pt-4">
        <p className="text-center text-xs text-gray-500">
          Insights based on {insights[0]?.monthsAnalyzed || 3} months of transaction history
        </p>
      </div>
    </div>
  );
}
