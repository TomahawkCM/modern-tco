"use client";

/**
 * Emergency Fund Calculator Page
 *
 * Calculate emergency fund targets, timeline, and progress.
 */

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  Calendar,
  Target,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { CurrencyInput, ResultsPanel } from "@/components/calculators";
import {
  calculateEmergencyFund,
  getRecommendedMonths,
} from "@/engine/calculators";
import { formatCurrency } from "@/lib/format";
import { formatPercent } from "@/lib/format";
import type { SupportedLocale } from "@/i18n/config";
import { LOCALE_METADATA } from "@/i18n/config";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function EmergencyFundCalculatorPage() {
  const t = useTranslations("calculators");
  const locale = useLocale() as SupportedLocale;
  const localeMeta = LOCALE_METADATA[locale] || LOCALE_METADATA["en-US"];
  const currency = localeMeta.currency;

  const [monthlyExpenses, setMonthlyExpenses] = useState(3000);
  const [targetMonths, setTargetMonths] = useState(6);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [monthlyContribution, setMonthlyContribution] = useState(500);

  const result = useMemo(
    () =>
      calculateEmergencyFund({
        monthlyExpenses,
        targetMonths,
        currentSavings,
        monthlyContribution,
      }),
    [monthlyExpenses, targetMonths, currentSavings, monthlyContribution]
  );

  const recommendedMonths = useMemo(
    () => getRecommendedMonths(true, false, false),
    []
  );

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
            <Shield className="h-8 w-8 text-primary" />
            {t("emergencyFund.title")}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t("emergencyFund.subtitle")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t("emergencyFund.inputTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <CurrencyInput
              label={t("emergencyFund.monthlyExpenses")}
              value={monthlyExpenses}
              onChange={setMonthlyExpenses}
              currency={currency}
              locale={locale}
              min={0}
              helperText={t("emergencyFund.monthlyExpensesHelp")}
            />

            <div className="space-y-2">
              <Label>{t("emergencyFund.targetMonths")}</Label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={targetMonths}
                  onChange={(e) => setTargetMonths(parseInt(e.target.value))}
                  className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
                />
                <span className="min-w-[3rem] text-center text-lg font-bold text-foreground">
                  {targetMonths}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("emergencyFund.targetMonthsHelp", {
                  months: recommendedMonths,
                })}
              </p>
            </div>

            <CurrencyInput
              label={t("emergencyFund.currentSavings")}
              value={currentSavings}
              onChange={setCurrentSavings}
              currency={currency}
              locale={locale}
              min={0}
            />

            <CurrencyInput
              label={t("emergencyFund.monthlyContribution")}
              value={monthlyContribution}
              onChange={setMonthlyContribution}
              currency={currency}
              locale={locale}
              min={0}
              helperText={t("emergencyFund.monthlyContributionHelp")}
            />
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card
            className={cn(
              result.isGoalMet
                ? "border-green-500/30 bg-green-500/5"
                : "border-primary/30 bg-primary/5"
            )}
          >
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center gap-3">
                {result.isGoalMet ? (
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <Target className="h-6 w-6 text-primary" />
                )}
                <h3 className="text-lg font-semibold text-foreground">
                  {result.isGoalMet
                    ? t("emergencyFund.goalMet")
                    : t("emergencyFund.goalProgress")}
                </h3>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {formatCurrency(currentSavings, currency, locale)}
                  </span>
                  <span className="text-muted-foreground">
                    {formatCurrency(result.targetAmount, currency, locale)}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      result.isGoalMet ? "bg-green-500" : "bg-primary"
                    )}
                    style={{
                      width: `${Math.min(100, result.progressPercent)}%`,
                    }}
                  />
                </div>
                <div className="mt-2 text-center">
                  <span className="text-lg font-bold text-foreground">
                    {formatPercent(result.progressPercent / 100, locale, 0)}
                  </span>
                </div>
              </div>

              {!result.isGoalMet && result.amountNeeded > 0 && (
                <p className="text-sm text-muted-foreground">
                  {t("emergencyFund.amountNeeded", {
                    amount: formatCurrency(
                      result.amountNeeded,
                      currency,
                      locale
                    ),
                  })}
                </p>
              )}
            </CardContent>
          </Card>

          <ResultsPanel
            title={t("emergencyFund.resultsTitle")}
            currency={currency}
            locale={locale}
            columns={2}
            results={[
              {
                label: t("emergencyFund.targetAmount"),
                value: result.targetAmount,
                type: "currency",
                icon: <Target className="h-4 w-4" />,
                highlight: true,
              },
              {
                label: t("emergencyFund.monthsToGoal"),
                value: result.monthsToGoal,
                type: "months",
                icon: <Calendar className="h-4 w-4" />,
              },
              {
                label: t("emergencyFund.completionDate"),
                value: result.completionDate,
                type: "date",
                icon: <TrendingUp className="h-4 w-4" />,
              },
              {
                label: t("emergencyFund.progress"),
                value: result.progressPercent,
                type: "percent",
                variant: result.isGoalMet ? "success" : "default",
              },
            ]}
          />

          {/* Tips */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-3 text-sm font-semibold text-primary">
                {t("emergencyFund.tipsTitle")}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">&#8226;</span>
                  {t("emergencyFund.tip1")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">&#8226;</span>
                  {t("emergencyFund.tip2")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">&#8226;</span>
                  {t("emergencyFund.tip3")}
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
