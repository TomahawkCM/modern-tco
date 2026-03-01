"use client";

/**
 * Savings Goal Calculator Page
 *
 * Calculate savings projections with compound interest
 * Two modes: "when will I reach my goal" or "how much should I save"
 */

import { useState, useMemo, lazy, Suspense } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Target, Calendar, DollarSign, TrendingUp, Sparkles } from "lucide-react";
import { CurrencyInput, PercentInput, ResultsPanel } from "@/components/budget/calculators";
import { calculateSavingsGoal } from "@/lib/calculators/savings-goal";
import { formatCurrency } from "@/i18n/utils/formatCurrency";
import { formatPercent, formatNumber } from "@/i18n/utils/formatNumber";
import type { SupportedLocale } from "@/i18n/config";
import type { SavingsGoalMode } from "@/lib/calculators/types";
import { LOCALE_METADATA } from "@/i18n/config";
import { cn } from "@/lib/utils";

const SavingsGrowthChart = lazy(() =>
  import("recharts").then((mod) => {
    const Chart = ({
      data,
      locale,
      currency,
    }: {
      data: { month: number; contributions: number; interest: number }[];
      locale: SupportedLocale;
      currency: string;
    }) => {
      const { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } =
        mod;
      return (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
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
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 12 }}
              tickFormatter={(val: number) =>
                formatCurrency(val, currency, locale).replace(/\.00$/, "")
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#94a3b8" }}
              formatter={(value: number, name: string) => [
                formatCurrency(value, currency, locale),
                name,
              ]}
              labelFormatter={(label: number) => `Month ${label}`}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="contributions"
              stackId="1"
              stroke="#3b82f6"
              fill="url(#savContrib)"
              name="Contributions"
            />
            <Area
              type="monotone"
              dataKey="interest"
              stackId="1"
              stroke="#10b981"
              fill="url(#savInterest)"
              name="Interest"
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    };
    return { default: Chart };
  })
);

export default function SavingsGoalCalculatorPage() {
  const t = useTranslations("calculators");
  const locale = useLocale() as SupportedLocale;
  const localeMeta = LOCALE_METADATA[locale] || LOCALE_METADATA["en-US"];
  const currency = localeMeta.currency as string;

  // Mode state
  const [mode, setMode] = useState<SavingsGoalMode>("when");

  // Form state
  const [goalAmount, setGoalAmount] = useState(10000);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [targetDate, setTargetDate] = useState(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 2);
    return date.toISOString().split("T")[0];
  });
  const [expectedReturn, setExpectedReturn] = useState(5);

  // Calculate results
  const result = useMemo(() => {
    return calculateSavingsGoal({
      mode,
      goalAmount,
      currentSavings,
      monthlyContribution: mode === "when" ? monthlyContribution : undefined,
      targetDate: mode === "howMuch" ? new Date(targetDate) : undefined,
      expectedAnnualReturn: expectedReturn,
    });
  }, [mode, goalAmount, currentSavings, monthlyContribution, targetDate, expectedReturn]);

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
            <Target className="h-8 w-8 text-blue-400" />
            {t("savingsGoal.title")}
          </h1>
          <p className="mt-2 text-slate-400">{t("savingsGoal.subtitle")}</p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
        <div className="flex gap-4">
          <button
            onClick={() => setMode("when")}
            className={cn(
              "flex-1 rounded-lg px-4 py-3 font-medium transition-all",
              mode === "when"
                ? "border border-blue-500/50 bg-blue-500/20 text-blue-400"
                : "border border-transparent bg-slate-700/50 text-slate-400 hover:bg-slate-700"
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
                ? "border border-blue-500/50 bg-blue-500/20 text-blue-400"
                : "border border-transparent bg-slate-700/50 text-slate-400 hover:bg-slate-700"
            )}
          >
            <DollarSign className="mx-auto mb-2 h-5 w-5" />
            {t("savingsGoal.modeHowMuch")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <div className="space-y-6 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h2 className="text-lg font-semibold text-white">{t("savingsGoal.inputTitle")}</h2>

          <div className="space-y-5">
            {/* Goal Amount */}
            <CurrencyInput
              label={t("savingsGoal.goalAmount")}
              value={goalAmount}
              onChange={setGoalAmount}
              currency={currency}
              locale={locale}
              min={0}
            />

            {/* Current Savings */}
            <CurrencyInput
              label={t("savingsGoal.currentSavings")}
              value={currentSavings}
              onChange={setCurrentSavings}
              currency={currency}
              locale={locale}
              min={0}
            />

            {/* Monthly Contribution (when mode) */}
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

            {/* Target Date (howMuch mode) */}
            {mode === "howMuch" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  {t("savingsGoal.targetDate")}
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Expected Return */}
            <PercentInput
              label={t("savingsGoal.expectedReturn")}
              value={expectedReturn}
              onChange={setExpectedReturn}
              locale={locale}
              min={0}
              max={20}
              helperText={t("savingsGoal.expectedReturnHelp")}
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Main Result Card */}
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-6">
            <div className="mb-4 flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">
                {mode === "when"
                  ? t("savingsGoal.resultWhenTitle")
                  : t("savingsGoal.resultHowMuchTitle")}
              </h3>
            </div>

            {mode === "when" && result.completionDate && result.monthsToGoal !== undefined && (
              <div className="py-4 text-center">
                <p className="mb-2 text-3xl font-bold text-white">
                  {new Intl.DateTimeFormat(locale, {
                    year: "numeric",
                    month: "long",
                  }).format(result.completionDate)}
                </p>
                <p className="text-slate-400">
                  {t("savingsGoal.inMonths", { months: result.monthsToGoal })}
                </p>
              </div>
            )}

            {mode === "howMuch" && result.requiredMonthlyContribution !== undefined && (
              <div className="py-4 text-center">
                <p className="mb-2 text-3xl font-bold text-white">
                  {formatCurrency(result.requiredMonthlyContribution, currency, locale)}
                </p>
                <p className="text-slate-400">{t("savingsGoal.perMonth")}</p>
              </div>
            )}

            {/* Progress */}
            <div className="mt-4">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-400">
                  {formatCurrency(currentSavings, currency, locale)}
                </span>
                <span className="text-slate-400">
                  {formatCurrency(goalAmount, currency, locale)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, result.progressPercent)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Detailed Results */}
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

          {/* Projection Timeline */}
          {result.projections.length > 1 && (
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
              <h3 className="mb-4 text-sm font-semibold text-blue-400">
                {t("savingsGoal.timelineTitle")}
              </h3>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {result.projections.slice(1).map((proj, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between border-b border-slate-700 py-2 text-sm last:border-0"
                  >
                    <span className="text-slate-400">
                      {new Intl.DateTimeFormat(locale, {
                        year: "numeric",
                        month: "short",
                      }).format(proj.date)}
                    </span>
                    <span className="font-medium text-white">
                      {formatCurrency(proj.balance, currency, locale)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Growth Chart */}
      {result.projections.length > 2 && (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            {t("savingsGoal.timelineTitle")}
          </h3>
          <Suspense
            fallback={
              <div className="flex h-[300px] animate-pulse items-center justify-center rounded-lg bg-slate-800">
                <span className="text-sm text-slate-500">Loading chart...</span>
              </div>
            }
          >
            <SavingsGrowthChart
              data={result.projections.slice(1).map((p) => ({
                month: p.month,
                contributions: p.contributions,
                interest: p.interest,
              }))}
              locale={locale}
              currency={currency}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
