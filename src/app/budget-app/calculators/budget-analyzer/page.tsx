"use client";

/**
 * 50/30/20 Budget Analyzer Page
 *
 * Analyze spending against the 50/30/20 rule
 */

import { useState, useMemo, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  ArrowLeft,
  PieChart,
  Home,
  Sparkles,
  PiggyBank,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { CurrencyInput } from "@/components/budget/calculators";
import { calculateBudgetAnalysis, getDefaultMappings } from "@/lib/calculators/budget-analyzer";
import { formatCurrency } from "@/i18n/utils/formatCurrency";
import { formatPercent } from "@/i18n/utils/formatNumber";
import type { SupportedLocale } from "@/i18n/config";
import type { BucketAnalysis, CategoryMapping, BudgetBucket } from "@/lib/calculators/types";
import { LOCALE_METADATA } from "@/i18n/config";
import { cn } from "@/lib/utils";

export default function BudgetAnalyzerPage() {
  const t = useTranslations("calculators");
  const locale = useLocale() as SupportedLocale;
  const localeMeta = LOCALE_METADATA[locale] || LOCALE_METADATA["en-US"];
  const currency = localeMeta.currency as string;

  // Form state
  const [monthlyIncome, setMonthlyIncome] = useState(5000);

  // Manual spending inputs for demo (in real app, would pull from transactions)
  const [needsSpending, setNeedsSpending] = useState(2500);
  const [wantsSpending, setWantsSpending] = useState(1500);
  const [savingsAmount, setSavingsAmount] = useState(500);

  // Calculate results
  const result = useMemo(() => {
    // Create mock transaction totals from manual inputs
    const transactionTotals = [
      { categoryId: "needs", categoryName: "Needs", total: -needsSpending },
      { categoryId: "wants", categoryName: "Wants", total: -wantsSpending },
      { categoryId: "savings", categoryName: "Savings", total: -savingsAmount },
    ];

    // Create mappings for the three buckets
    const categoryMappings: CategoryMapping[] = [
      { categoryId: "needs", categoryName: "Needs", bucket: "needs" },
      { categoryId: "wants", categoryName: "Wants", bucket: "wants" },
      { categoryId: "savings", categoryName: "Savings", bucket: "savings" },
    ];

    return calculateBudgetAnalysis({
      monthlyNetIncome: monthlyIncome,
      categoryMappings,
      transactionTotals,
    });
  }, [monthlyIncome, needsSpending, wantsSpending, savingsAmount]);

  // Bucket display config
  const bucketConfig: Record<
    BudgetBucket,
    { icon: React.ReactNode; color: string; bgColor: string; borderColor: string }
  > = {
    needs: {
      icon: <Home className="h-5 w-5" />,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
    },
    wants: {
      icon: <Sparkles className="h-5 w-5" />,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
    },
    savings: {
      icon: <PiggyBank className="h-5 w-5" />,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
    },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/budget-app/calculators"
          className="mt-1 rounded-lg p-2 transition-colors hover:bg-slate-800"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="h-5 w-5 text-slate-400" />
        </Link>
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
            <PieChart className="h-8 w-8 text-green-400" />
            {t("budgetAnalyzer.title")}
          </h1>
          <p className="mt-2 text-slate-400">{t("budgetAnalyzer.subtitle")}</p>
        </div>
      </div>

      {/* Rule Explanation */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">
          {t("budgetAnalyzer.ruleExplanation")}
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-start gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
            <Home className="mt-0.5 h-6 w-6 text-blue-400" />
            <div>
              <p className="font-semibold text-white">50% {t("budgetAnalyzer.needs")}</p>
              <p className="text-sm text-slate-400">{t("budgetAnalyzer.needsDescription")}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-purple-500/30 bg-purple-500/10 p-4">
            <Sparkles className="mt-0.5 h-6 w-6 text-purple-400" />
            <div>
              <p className="font-semibold text-white">30% {t("budgetAnalyzer.wants")}</p>
              <p className="text-sm text-slate-400">{t("budgetAnalyzer.wantsDescription")}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
            <PiggyBank className="mt-0.5 h-6 w-6 text-green-400" />
            <div>
              <p className="font-semibold text-white">20% {t("budgetAnalyzer.savings")}</p>
              <p className="text-sm text-slate-400">{t("budgetAnalyzer.savingsDescription")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <div className="space-y-6 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h2 className="text-lg font-semibold text-white">{t("budgetAnalyzer.inputTitle")}</h2>

          <div className="space-y-5">
            <CurrencyInput
              label={t("budgetAnalyzer.monthlyIncome")}
              value={monthlyIncome}
              onChange={setMonthlyIncome}
              currency={currency}
              locale={locale}
              min={0}
              helperText={t("budgetAnalyzer.monthlyIncomeHelp")}
            />

            <div className="border-t border-slate-700 pt-4">
              <p className="mb-4 text-sm text-slate-400">{t("budgetAnalyzer.enterSpending")}</p>

              <div className="space-y-4">
                <CurrencyInput
                  label={`${t("budgetAnalyzer.needs")} (${t("budgetAnalyzer.needsExamples")})`}
                  value={needsSpending}
                  onChange={setNeedsSpending}
                  currency={currency}
                  locale={locale}
                  min={0}
                />

                <CurrencyInput
                  label={`${t("budgetAnalyzer.wants")} (${t("budgetAnalyzer.wantsExamples")})`}
                  value={wantsSpending}
                  onChange={setWantsSpending}
                  currency={currency}
                  locale={locale}
                  min={0}
                />

                <CurrencyInput
                  label={`${t("budgetAnalyzer.savings")} (${t("budgetAnalyzer.savingsExamples")})`}
                  value={savingsAmount}
                  onChange={setSavingsAmount}
                  currency={currency}
                  locale={locale}
                  min={0}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Status Card */}
          <div
            className={cn(
              "rounded-xl border p-6",
              result.isBalanced
                ? "border-green-500/30 bg-green-500/10"
                : "border-yellow-500/30 bg-yellow-500/10"
            )}
          >
            <div className="mb-4 flex items-center gap-3">
              {result.isBalanced ? (
                <CheckCircle className="h-6 w-6 text-green-400" />
              ) : (
                <AlertCircle className="h-6 w-6 text-yellow-400" />
              )}
              <h3 className="text-lg font-semibold text-white">
                {result.isBalanced
                  ? t("budgetAnalyzer.balanced")
                  : t("budgetAnalyzer.needsAdjustment")}
              </h3>
            </div>
            {!result.isBalanced && result.recommendations.length > 0 && (
              <ul className="space-y-2">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-yellow-400">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Bucket Analysis Cards */}
          {(["needs", "wants", "savings"] as BudgetBucket[]).map((bucket) => {
            const analysis = result[bucket];
            const config = bucketConfig[bucket];

            return (
              <div
                key={bucket}
                className={cn("rounded-xl border p-6", config.bgColor, config.borderColor)}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={config.color}>{config.icon}</span>
                    <h3 className="font-semibold text-white">{t(`budgetAnalyzer.${bucket}`)}</h3>
                  </div>
                  <span
                    className={cn(
                      "rounded px-2 py-1 text-sm",
                      analysis.isOverBudget
                        ? bucket === "savings"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                        : "bg-green-500/20 text-green-400"
                    )}
                  >
                    {analysis.isOverBudget
                      ? bucket === "savings"
                        ? t("budgetAnalyzer.exceeding")
                        : t("budgetAnalyzer.over")
                      : t("budgetAnalyzer.under")}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-400">
                      {t("budgetAnalyzer.actual")}:{" "}
                      {formatPercent(analysis.actualPercent / 100, locale, 0)}
                    </span>
                    <span className="text-slate-400">
                      {t("budgetAnalyzer.target")}:{" "}
                      {formatPercent(analysis.targetPercent / 100, locale, 0)}
                    </span>
                  </div>
                  <div className="relative h-3 overflow-hidden rounded-full bg-slate-700">
                    {/* Target marker */}
                    <div
                      className="absolute bottom-0 top-0 z-10 w-0.5 bg-white/50"
                      style={{ left: `${analysis.targetPercent}%` }}
                    />
                    {/* Actual bar */}
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        analysis.isOverBudget && bucket !== "savings"
                          ? "bg-red-500"
                          : config.color.replace("text-", "bg-")
                      )}
                      style={{ width: `${Math.min(100, analysis.actualPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Amount comparison */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">{t("budgetAnalyzer.actual")}</p>
                    <p className="text-lg font-bold text-white">
                      {formatCurrency(analysis.actualAmount, currency, locale)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">{t("budgetAnalyzer.target")}</p>
                    <p className="text-lg font-bold text-slate-400">
                      {formatCurrency(analysis.targetAmount, currency, locale)}
                    </p>
                  </div>
                </div>

                {/* Variance */}
                <div className="mt-4 border-t border-slate-700/50 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">{t("budgetAnalyzer.variance")}</span>
                    <span
                      className={cn(
                        "font-medium",
                        analysis.variance > 0
                          ? bucket === "savings"
                            ? "text-green-400"
                            : "text-red-400"
                          : "text-green-400"
                      )}
                    >
                      {analysis.variance > 0 ? "+" : ""}
                      {formatCurrency(analysis.variance, currency, locale)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
