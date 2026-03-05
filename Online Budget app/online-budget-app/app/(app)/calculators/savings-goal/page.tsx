"use client";

/**
 * Savings Goal Calculator Page
 *
 * Two modes: "When will I reach my goal?" vs "How much should I save monthly?"
 */

import { useState, useMemo, Suspense } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Target, Calendar, DollarSign, Sparkles } from "lucide-react";
import { CurrencyInput, PercentInput, ResultsPanel } from "@/components/calculators";
import { calculateSavingsGoal } from "@/engine/calculators";
import type { SavingsGoalMode } from "@/engine/calculators";
import { formatCurrency } from "@/lib/format";
import type { SupportedLocale } from "@/i18n/config";
import { usePrimaryCurrency } from "@/contexts/currency-context";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  LazyAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "@/components/charts/lazy-charts";

function ChartSkeleton({ label }: { label: string }) {
  return (
    <div
      className="flex w-full animate-pulse items-center justify-center rounded-lg bg-muted"
      style={{ height: 300 }}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

export default function SavingsGoalCalculatorPage() {
  const t = useTranslations("calculators");
  const tc = useTranslations("common");
  const locale = useLocale() as SupportedLocale;
  const currency = usePrimaryCurrency();

  const [mode, setMode] = useState<SavingsGoalMode>("when");
  const [goalAmount, setGoalAmount] = useState(10000);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [targetDate, setTargetDate] = useState(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 2);
    return date.toISOString().split("T")[0]!;
  });
  const [expectedReturn, setExpectedReturn] = useState(5);

  const result = useMemo(
    () =>
      calculateSavingsGoal({
        mode,
        goalAmount,
        currentSavings,
        monthlyContribution: mode === "when" ? monthlyContribution : undefined,
        targetDate: mode === "howMuch" ? new Date(targetDate) : undefined,
        expectedAnnualReturn: expectedReturn,
      }),
    [mode, goalAmount, currentSavings, monthlyContribution, targetDate, expectedReturn]
  );

  const chartData = useMemo(
    () =>
      result.projections.slice(1).map((p) => ({
        month: p.month,
        contributions: p.contributions,
        interest: p.interest,
      })),
    [result.projections]
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
            <Target className="h-8 w-8 text-primary" />
            {t("savingsGoal.title")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("savingsGoal.subtitle")}</p>
        </div>
      </div>

      {/* Mode Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <button
              onClick={() => setMode("when")}
              className={cn(
                "flex-1 rounded-lg px-4 py-3 font-medium transition-all",
                mode === "when"
                  ? "border border-primary/50 bg-primary/10 text-primary"
                  : "border border-transparent bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Calendar className="mx-auto mb-2 h-5 w-5" />
              {t("savingsGoal.modeWhen")}
            </button>
            <button
              onClick={() => setMode("howMuch")}
              className={cn(
                "flex-1 rounded-lg px-4 py-3 font-medium transition-all",
                mode === "howMuch"
                  ? "border border-primary/50 bg-primary/10 text-primary"
                  : "border border-transparent bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <DollarSign className="mx-auto mb-2 h-5 w-5" />
              {t("savingsGoal.modeHowMuch")}
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t("savingsGoal.inputTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <CurrencyInput
              label={t("savingsGoal.goalAmount")}
              value={goalAmount}
              onChange={setGoalAmount}
              currency={currency}
              locale={locale}
              min={0}
            />

            <CurrencyInput
              label={t("savingsGoal.currentSavings")}
              value={currentSavings}
              onChange={setCurrentSavings}
              currency={currency}
              locale={locale}
              min={0}
            />

            {mode === "when" && (
              <CurrencyInput
                label={t("savingsGoal.monthlyContribution")}
                value={monthlyContribution}
                onChange={setMonthlyContribution}
                currency={currency}
                locale={locale}
                min={0}
              />
            )}

            {mode === "howMuch" && (
              <div className="space-y-2">
                <Label>{t("savingsGoal.targetDate")}</Label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              </div>
            )}

            <PercentInput
              label={t("savingsGoal.expectedReturn")}
              value={expectedReturn}
              onChange={setExpectedReturn}
              locale={locale}
              min={0}
              max={20}
              helperText={t("savingsGoal.expectedReturnHelp")}
            />
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {/* Main Result Card */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  {mode === "when"
                    ? t("savingsGoal.resultWhenTitle")
                    : t("savingsGoal.resultHowMuchTitle")}
                </h3>
              </div>

              {mode === "when" && result.completionDate && result.monthsToGoal !== undefined && (
                <div className="py-4 text-center">
                  <p className="mb-2 text-3xl font-bold text-foreground">
                    {new Intl.DateTimeFormat(locale, {
                      year: "numeric",
                      month: "long",
                    }).format(result.completionDate)}
                  </p>
                  <p className="text-muted-foreground">
                    {t("savingsGoal.inMonths", { months: result.monthsToGoal })}
                  </p>
                </div>
              )}

              {mode === "howMuch" && result.requiredMonthlyContribution !== undefined && (
                <div className="py-4 text-center">
                  <p className="mb-2 text-3xl font-bold text-foreground">
                    {formatCurrency(result.requiredMonthlyContribution, currency, locale)}
                  </p>
                  <p className="text-muted-foreground">{t("savingsGoal.perMonth")}</p>
                </div>
              )}

              {/* Progress */}
              <div className="mt-4">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {formatCurrency(currentSavings, currency, locale)}
                  </span>
                  <span className="text-muted-foreground">
                    {formatCurrency(goalAmount, currency, locale)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${Math.min(100, result.progressPercent)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <ResultsPanel
            title={t("savingsGoal.projectionTitle")}
            currency={currency}
            locale={locale}
            columns={2}
            results={[
              {
                label: t("savingsGoal.projectedAmount"),
                value: result.projectedAmount,
                type: "currency",
                highlight: true,
              },
              {
                label: t("savingsGoal.totalContributions"),
                value: result.totalContributions,
                type: "currency",
              },
              {
                label: t("savingsGoal.interestEarned"),
                value: result.totalInterestEarned,
                type: "currency",
                variant: result.totalInterestEarned > 0 ? "success" : "default",
              },
              {
                label: t("savingsGoal.progress"),
                value: result.progressPercent,
                type: "percent",
              },
            ]}
          />
        </div>
      </div>

      {/* Growth Chart */}
      {chartData.length > 2 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("savingsGoal.timelineTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartSkeleton label={tc("loadingChart")} />}>
              <ResponsiveContainer width="100%" height={300}>
                <LazyAreaChart data={chartData}>
                  <defs>
                    <linearGradient id="savContrib" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="savInterest" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(val: number) =>
                      formatCurrency(val, currency, locale).replace(/\.00$/, "")
                    }
                  />
                  <Tooltip
                    formatter={(value: number | undefined, name: string | undefined) => [
                      formatCurrency(value ?? 0, currency, locale),
                      name ?? "",
                    ]}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="contributions"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="url(#savContrib)"
                    name={t("savingsGoal.totalContributions")}
                  />
                  <Area
                    type="monotone"
                    dataKey="interest"
                    stackId="1"
                    stroke="#10b981"
                    fill="url(#savInterest)"
                    name={t("savingsGoal.interestEarned")}
                  />
                </LazyAreaChart>
              </ResponsiveContainer>
            </Suspense>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
