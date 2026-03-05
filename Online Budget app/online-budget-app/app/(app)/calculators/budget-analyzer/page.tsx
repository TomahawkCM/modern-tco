"use client";

/**
 * 50/30/20 Budget Analyzer Page
 *
 * Analyze spending against the 50/30/20 rule with progress bars.
 */

import { useState, useMemo } from "react";
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
import { CurrencyInput } from "@/components/calculators";
import { calculateBudgetAnalysis } from "@/engine/calculators";
import type { CategoryMapping, BudgetBucket } from "@/engine/calculators";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { SupportedLocale } from "@/i18n/config";
import { usePrimaryCurrency } from "@/contexts/currency-context";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BudgetAnalyzerPage() {
  const t = useTranslations("calculators");
  const locale = useLocale() as SupportedLocale;
  const currency = usePrimaryCurrency();

  // Form state
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  const [needsSpending, setNeedsSpending] = useState(2500);
  const [wantsSpending, setWantsSpending] = useState(1500);
  const [savingsAmount, setSavingsAmount] = useState(500);

  // Calculate results
  const result = useMemo(() => {
    const transactionTotals = [
      { categoryId: "needs", categoryName: "Needs", total: -needsSpending },
      { categoryId: "wants", categoryName: "Wants", total: -wantsSpending },
      { categoryId: "savings", categoryName: "Savings", total: -savingsAmount },
    ];

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
    {
      icon: React.ReactNode;
      textColor: string;
      bgColor: string;
      borderColor: string;
      barColor: string;
    }
  > = {
    needs: {
      icon: <Home className="h-5 w-5" />,
      textColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/5",
      borderColor: "border-blue-500/30",
      barColor: "bg-blue-500",
    },
    wants: {
      icon: <Sparkles className="h-5 w-5" />,
      textColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-500/5",
      borderColor: "border-purple-500/30",
      barColor: "bg-purple-500",
    },
    savings: {
      icon: <PiggyBank className="h-5 w-5" />,
      textColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-500/5",
      borderColor: "border-green-500/30",
      barColor: "bg-green-500",
    },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/calculators"
          className="mt-1 rounded-lg p-2 transition-colors hover:bg-muted"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
            <PieChart className="h-8 w-8 text-green-500 dark:text-green-400" />
            {t("budgetAnalyzer.title")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("budgetAnalyzer.subtitle")}</p>
        </div>
      </div>

      {/* Rule Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>{t("budgetAnalyzer.ruleExplanation")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3 rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
              <Home className="mt-0.5 h-6 w-6 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-semibold text-foreground">50% {t("budgetAnalyzer.needs")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("budgetAnalyzer.needsDescription")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-purple-500/30 bg-purple-500/5 p-4">
              <Sparkles className="mt-0.5 h-6 w-6 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="font-semibold text-foreground">30% {t("budgetAnalyzer.wants")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("budgetAnalyzer.wantsDescription")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/5 p-4">
              <PiggyBank className="mt-0.5 h-6 w-6 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-semibold text-foreground">20% {t("budgetAnalyzer.savings")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("budgetAnalyzer.savingsDescription")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t("budgetAnalyzer.inputTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <CurrencyInput
              label={t("budgetAnalyzer.monthlyIncome")}
              value={monthlyIncome}
              onChange={setMonthlyIncome}
              currency={currency}
              locale={locale}
              min={0}
              helperText={t("budgetAnalyzer.monthlyIncomeHelp")}
            />

            <div className="border-t border-border pt-4">
              <p className="mb-4 text-sm text-muted-foreground">
                {t("budgetAnalyzer.enterSpending")}
              </p>

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
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card
            className={cn(
              result.isBalanced
                ? "border-green-500/30 bg-green-500/5"
                : "border-yellow-500/30 bg-yellow-500/5"
            )}
          >
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center gap-3">
                {result.isBalanced ? (
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                )}
                <h3 className="text-lg font-semibold text-foreground">
                  {result.isBalanced
                    ? t("budgetAnalyzer.balanced")
                    : t("budgetAnalyzer.needsAdjustment")}
                </h3>
              </div>
              {!result.isBalanced && result.recommendations.length > 0 && (
                <ul className="space-y-2">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="text-yellow-600 dark:text-yellow-400">&#8226;</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Bucket Analysis Cards */}
          {(["needs", "wants", "savings"] as BudgetBucket[]).map((bucket) => {
            const analysis = result[bucket];
            const config = bucketConfig[bucket];

            return (
              <Card key={bucket} className={cn(config.bgColor, config.borderColor)}>
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={config.textColor}>{config.icon}</span>
                      <h3 className="font-semibold text-foreground">
                        {t(`budgetAnalyzer.${bucket}`)}
                      </h3>
                    </div>
                    <span
                      className={cn(
                        "rounded px-2 py-1 text-sm font-medium",
                        analysis.isOverBudget
                          ? bucket === "savings"
                            ? "bg-green-500/20 text-green-600 dark:text-green-400"
                            : "bg-red-500/20 text-red-600 dark:text-red-400"
                          : "bg-green-500/20 text-green-600 dark:text-green-400"
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
                      <span className="text-muted-foreground">
                        {t("budgetAnalyzer.actual")}:{" "}
                        {formatPercent(analysis.actualPercent / 100, locale, 0)}
                      </span>
                      <span className="text-muted-foreground">
                        {t("budgetAnalyzer.target")}:{" "}
                        {formatPercent(analysis.targetPercent / 100, locale, 0)}
                      </span>
                    </div>
                    <div className="relative h-3 overflow-hidden rounded-full bg-muted">
                      {/* Target marker */}
                      <div
                        className="absolute bottom-0 top-0 z-10 w-0.5 bg-foreground/30"
                        style={{ left: `${analysis.targetPercent}%` }}
                      />
                      {/* Actual bar */}
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          analysis.isOverBudget && bucket !== "savings"
                            ? "bg-red-500"
                            : config.barColor
                        )}
                        style={{ width: `${Math.min(100, analysis.actualPercent)}%` }}
                      />
                    </div>
                  </div>

                  {/* Amount comparison */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t("budgetAnalyzer.actual")}</p>
                      <p className="text-lg font-bold text-foreground">
                        {formatCurrency(analysis.actualAmount, currency, locale)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("budgetAnalyzer.target")}</p>
                      <p className="text-lg font-bold text-muted-foreground">
                        {formatCurrency(analysis.targetAmount, currency, locale)}
                      </p>
                    </div>
                  </div>

                  {/* Variance */}
                  <div className="mt-4 border-t border-border/50 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("budgetAnalyzer.variance")}
                      </span>
                      <span
                        className={cn(
                          "font-medium",
                          analysis.variance > 0
                            ? bucket === "savings"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-green-400"
                        )}
                      >
                        {analysis.variance > 0 ? "+" : ""}
                        {formatCurrency(analysis.variance, currency, locale)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
