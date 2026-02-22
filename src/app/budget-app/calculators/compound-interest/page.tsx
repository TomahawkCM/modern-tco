"use client";

/**
 * Compound Interest Calculator Page
 *
 * Visualize how investments grow with compound interest over time.
 * Supports different compounding frequencies.
 */

import { useState, useMemo, lazy, Suspense } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Sparkles } from "lucide-react";
import {
  CurrencyInput,
  PercentInput,
  ResultsPanel,
  TransparencyPanel,
  ExportButton,
} from "@/components/budget/calculators";
import { compoundInterest, COMPOUND_INTEREST_COLUMNS } from "@/lib/financial-engine";
import type { CompoundingFrequency } from "@/lib/financial-engine";
import { formatCurrency } from "@/i18n/utils/formatCurrency";
import { formatPercent } from "@/i18n/utils/formatNumber";
import type { SupportedLocale } from "@/i18n/config";
import { LOCALE_METADATA } from "@/i18n/config";
import { cn } from "@/lib/utils";

const CompoundInterestChart = lazy(() =>
  import("recharts").then((mod) => {
    const Chart = ({
      data,
      locale,
      currency,
    }: {
      data: { period: number; contributions: number; interest: number }[];
      locale: SupportedLocale;
      currency: string;
    }) => {
      const { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } =
        mod;
      return (
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorContributions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="period"
              stroke="#64748b"
              tick={{ fontSize: 12 }}
              label={{ value: "Year", position: "insideBottomRight", offset: -5, fill: "#64748b" }}
            />
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
              labelFormatter={(label: number) => `Year ${label}`}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="contributions"
              stackId="1"
              stroke="#3b82f6"
              fill="url(#colorContributions)"
              name="Contributions"
            />
            <Area
              type="monotone"
              dataKey="interest"
              stackId="1"
              stroke="#10b981"
              fill="url(#colorInterest)"
              name="Interest Earned"
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    };
    return { default: Chart };
  })
);

function ChartSkeleton() {
  return (
    <div
      className="flex w-full animate-pulse items-center justify-center rounded-lg bg-slate-800"
      style={{ height: 350 }}
    >
      <span className="text-sm text-slate-500">Loading chart...</span>
    </div>
  );
}

const FREQUENCIES: CompoundingFrequency[] = [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "semiannually",
  "annually",
];

export default function CompoundInterestCalculatorPage() {
  const t = useTranslations("calculators");
  const locale = useLocale() as SupportedLocale;
  const localeMeta = LOCALE_METADATA[locale] || LOCALE_METADATA["en-US"];
  const currency = localeMeta.currency as string;

  const [principal, setPrincipal] = useState(10000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [annualRate, setAnnualRate] = useState(7);
  const [years, setYears] = useState(20);
  const [frequency, setFrequency] = useState<CompoundingFrequency>("monthly");

  const result = useMemo(
    () =>
      compoundInterest({
        principal,
        periodicContribution: monthlyContribution,
        annualRate,
        years,
        compoundingFrequency: frequency,
      }),
    [principal, monthlyContribution, annualRate, years, frequency]
  );

  const chartData = useMemo(
    () =>
      result.timeline.map((point) => ({
        period: point.period,
        contributions: point.contributions,
        interest: point.interest,
      })),
    [result.timeline]
  );

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
            <TrendingUp className="h-8 w-8 text-indigo-400" />
            {t("compoundInterest.title")}
          </h1>
          <p className="mt-2 text-slate-400">{t("compoundInterest.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <div className="space-y-6 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h2 className="text-lg font-semibold text-white">{t("compoundInterest.inputTitle")}</h2>

          <div className="space-y-5">
            <CurrencyInput
              label={t("compoundInterest.initialDeposit")}
              value={principal}
              onChange={setPrincipal}
              currency={currency}
              locale={locale}
              min={0}
            />

            <CurrencyInput
              label={t("compoundInterest.monthlyContribution")}
              value={monthlyContribution}
              onChange={setMonthlyContribution}
              currency={currency}
              locale={locale}
              min={0}
            />

            <PercentInput
              label={t("compoundInterest.annualRate")}
              value={annualRate}
              onChange={setAnnualRate}
              locale={locale}
              min={0}
              max={30}
              helperText={t("compoundInterest.annualRateHelp")}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                {t("compoundInterest.years")}
              </label>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(Math.max(1, Math.min(50, Number(e.target.value))))}
                min={1}
                max={50}
                className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                {t("compoundInterest.compoundingFrequency")}
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as CompoundingFrequency)}
                className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f} value={f}>
                    {t(`compoundInterest.frequency.${f}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Hero Result */}
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-6">
            <div className="mb-4 flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-indigo-400" />
              <h3 className="text-lg font-semibold text-white">
                {t("compoundInterest.resultTitle")}
              </h3>
            </div>
            <div className="py-4 text-center">
              <p className="mb-2 text-3xl font-bold text-white">
                {formatCurrency(result.futureValue, currency, locale)}
              </p>
              <p className="text-slate-400">
                {t("compoundInterest.interestEarned")}:{" "}
                <span className="font-medium text-green-400">
                  {formatCurrency(result.totalInterest, currency, locale)}
                </span>
              </p>
            </div>
          </div>

          <ResultsPanel
            title={t("compoundInterest.resultTitle")}
            currency={currency}
            locale={locale}
            columns={2}
            results={[
              {
                label: t("compoundInterest.finalBalance"),
                value: result.futureValue,
                type: "currency",
                highlight: true,
              },
              {
                label: t("compoundInterest.totalContributions"),
                value: result.totalContributions,
                type: "currency",
              },
              {
                label: t("compoundInterest.interestEarned"),
                value: result.totalInterest,
                type: "currency",
                variant: "success",
              },
              {
                label: t("compoundInterest.effectiveRate"),
                value: result.effectiveAnnualRate,
                type: "percent",
              },
            ]}
          />

          <TransparencyPanel
            assumptions={[
              {
                label: t("compoundInterest.assumptionCompounding"),
                value: t(`compoundInterest.frequency.${frequency}`),
              },
              {
                label: t("compoundInterest.assumptionTiming"),
                value: t("compoundInterest.assumptionTiming"),
              },
              {
                label: t("compoundInterest.assumptionReinvest"),
                value: t("compoundInterest.assumptionReinvest"),
              },
            ]}
            formula={t("compoundInterest.formulaText")}
            formulaExplanation={t("compoundInterest.formulaExplanation")}
          />
        </div>
      </div>

      {/* Chart */}
      {result.timeline.length > 1 && (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{t("compoundInterest.chartTitle")}</h3>
            <ExportButton
              filename="compound-interest"
              columns={COMPOUND_INTEREST_COLUMNS}
              rows={result.timeline as unknown as Record<string, unknown>[]}
            />
          </div>
          <Suspense fallback={<ChartSkeleton />}>
            <CompoundInterestChart data={chartData} locale={locale} currency={currency} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
