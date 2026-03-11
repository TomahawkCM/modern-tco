"use client";

/**
 * FIRE (Financial Independence, Retire Early) Calculator Page
 *
 * Calculate FIRE number, years to FIRE, and track progress toward
 * Lean FIRE, Coast FIRE, and Fat FIRE milestones.
 */

import { useState, useMemo, lazy, Suspense } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Flame, Sparkles, Check, X } from "lucide-react";
import {
  CurrencyInput,
  PercentInput,
  ResultsPanel,
  TransparencyPanel,
} from "@/components/budget/calculators";
import { calculateFIRE } from "@/lib/financial-engine";
import { formatCurrency } from "@/i18n/utils/formatCurrency";
import type { SupportedLocale } from "@/i18n/config";
import { LOCALE_METADATA } from "@/i18n/config";

const FIREChart = lazy(() =>
  import("recharts").then((mod) => {
    const Chart = ({
      data,
      locale,
      currency,
      ageLabel,
      ageFormatter,
      portfolioLabel,
      fireTargetLabel,
    }: {
      data: { age: number; balance: number; fireTarget: number }[];
      locale: SupportedLocale;
      currency: string;
      ageLabel: string;
      ageFormatter: (label: number) => string;
      portfolioLabel: string;
      fireTargetLabel: string;
    }) => {
      const {
        AreaChart,
        Area,
        XAxis,
        YAxis,
        CartesianGrid,
        Tooltip,
        Legend,
        ResponsiveContainer,
        ReferenceLine,
      } = mod;
      return (
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="age"
              stroke="#64748b"
              tick={{ fontSize: 12 }}
              label={{
                value: ageLabel,
                position: "insideBottomRight",
                offset: -5,
                fill: "#64748b",
              }}
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
              labelFormatter={(label: number) => ageFormatter(label)}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#f97316"
              fill="url(#colorBalance)"
              name={portfolioLabel}
            />
            <Area
              type="monotone"
              dataKey="fireTarget"
              stroke="#ef4444"
              fill="none"
              strokeDasharray="5 5"
              name={fireTargetLabel}
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

export default function FIRECalculatorPage() {
  const t = useTranslations("calculators");
  const locale = useLocale() as SupportedLocale;
  const localeMeta = LOCALE_METADATA[locale] || LOCALE_METADATA["en-US"];
  const currency = localeMeta.currency as string;

  const [currentAge, setCurrentAge] = useState(30);
  const [annualIncome, setAnnualIncome] = useState(100000);
  const [annualExpenses, setAnnualExpenses] = useState(40000);
  const [currentSavings, setCurrentSavings] = useState(50000);
  const [expectedReturn, setExpectedReturn] = useState(7);
  const [safeWithdrawalRate, setSafeWithdrawalRate] = useState(4);
  const [inflationRate, setInflationRate] = useState(3);

  const result = useMemo(
    () =>
      calculateFIRE({
        currentAge,
        annualIncome,
        annualExpenses,
        currentSavings,
        expectedReturn,
        safeWithdrawalRate,
        inflationRate,
      }),
    [
      currentAge,
      annualIncome,
      annualExpenses,
      currentSavings,
      expectedReturn,
      safeWithdrawalRate,
      inflationRate,
    ]
  );

  const chartData = useMemo(
    () =>
      result.timeline.map((point) => ({
        age: point.age,
        balance: point.balance,
        fireTarget: point.fireTarget,
      })),
    [result.timeline]
  );

  const milestones = [
    {
      label: t("fire.leanFIRE"),
      help: t("fire.leanFIREHelp"),
      value: result.leanFIRENumber,
      reached: currentSavings >= result.leanFIRENumber,
    },
    {
      label: t("fire.coastFIRE"),
      help: t("fire.coastFIREHelp"),
      value: result.coastFIRENumber,
      reached: result.coastFIREReached,
    },
    {
      label: t("fire.fireNumber"),
      help: t("fire.fireNumberHelp"),
      value: result.fireNumber,
      reached: result.alreadyFIRE,
    },
    {
      label: t("fire.fatFIRE"),
      help: t("fire.fatFIREHelp"),
      value: result.fatFIRENumber,
      reached: currentSavings >= result.fatFIRENumber,
    },
  ];

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
            <Flame className="h-8 w-8 text-orange-400" />
            {t("fire.title")}
          </h1>
          <p className="mt-2 text-slate-400">{t("fire.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <div className="space-y-6 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h2 className="text-lg font-semibold text-white">{t("fire.inputTitle")}</h2>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                {t("fire.currentAge")}
              </label>
              <input
                type="number"
                value={currentAge}
                onChange={(e) => setCurrentAge(Math.max(18, Math.min(80, Number(e.target.value))))}
                min={18}
                max={80}
                className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <CurrencyInput
              label={t("fire.annualIncome")}
              value={annualIncome}
              onChange={setAnnualIncome}
              currency={currency}
              locale={locale}
              min={0}
            />

            <CurrencyInput
              label={t("fire.annualExpenses")}
              value={annualExpenses}
              onChange={setAnnualExpenses}
              currency={currency}
              locale={locale}
              min={0}
            />

            <CurrencyInput
              label={t("fire.currentSavings")}
              value={currentSavings}
              onChange={setCurrentSavings}
              currency={currency}
              locale={locale}
              min={0}
            />

            <PercentInput
              label={t("fire.expectedReturn")}
              value={expectedReturn}
              onChange={setExpectedReturn}
              locale={locale}
              min={0}
              max={20}
              helperText={t("fire.expectedReturnHelp")}
            />

            <PercentInput
              label={t("fire.safeWithdrawalRate")}
              value={safeWithdrawalRate}
              onChange={setSafeWithdrawalRate}
              locale={locale}
              min={1}
              max={10}
              helperText={t("fire.safeWithdrawalRateHelp")}
            />

            <PercentInput
              label={t("fire.inflationRate")}
              value={inflationRate}
              onChange={setInflationRate}
              locale={locale}
              min={0}
              max={15}
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Hero Result */}
          <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-6">
            <div className="mb-4 flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-orange-400" />
              <h3 className="text-lg font-semibold text-white">{t("fire.resultTitle")}</h3>
            </div>
            <div className="py-4 text-center">
              <p className="mb-2 text-3xl font-bold text-white">
                {formatCurrency(result.fireNumber, currency, locale)}
              </p>
              <p className="text-slate-400">
                {result.alreadyFIRE
                  ? t("fire.heroAlready")
                  : t("fire.heroOnTrack", { age: result.fireAge })}
              </p>
            </div>
          </div>

          <ResultsPanel
            title={t("fire.resultTitle")}
            currency={currency}
            locale={locale}
            columns={2}
            results={[
              {
                label: t("fire.fireNumber"),
                value: result.fireNumber,
                type: "currency",
                highlight: true,
              },
              {
                label: t("fire.yearsToFIRE"),
                value: result.yearsToFIRE,
                type: "number",
              },
              {
                label: t("fire.fireAge"),
                value: result.fireAge,
                type: "number",
              },
              {
                label: t("fire.savingsRate"),
                value: result.savingsRate,
                type: "percent",
                variant: result.savingsRate >= 50 ? "success" : undefined,
              },
              {
                label: t("fire.annualSavings"),
                value: result.annualSavings,
                type: "currency",
              },
            ]}
          />

          {/* FIRE Milestones */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">{t("fire.milestones")}</h3>
            <div className="space-y-3">
              {milestones.map((m) => (
                <div
                  key={m.label}
                  className="flex items-center justify-between rounded-lg bg-slate-700/50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    {m.reached ? (
                      <Check className="h-5 w-5 text-green-400" />
                    ) : (
                      <X className="h-5 w-5 text-slate-500" />
                    )}
                    <div>
                      <span className="font-medium text-white">{m.label}</span>
                      <p className="text-xs text-slate-400">{m.help}</p>
                    </div>
                  </div>
                  <span className="font-medium text-slate-300">
                    {formatCurrency(m.value, currency, locale)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <TransparencyPanel
            assumptions={[
              {
                label: t("fire.assumptionSWR", { rate: safeWithdrawalRate }),
                value: `${safeWithdrawalRate}%`,
              },
              {
                label: t("fire.assumptionReturn", { rate: expectedReturn }),
                value: `${expectedReturn}%`,
              },
              {
                label: t("fire.assumptionInflation", { rate: inflationRate }),
                value: `${inflationRate}%`,
              },
            ]}
            formula={t("fire.formulaText")}
            formulaExplanation={t("fire.formulaExplanation")}
          />
        </div>
      </div>

      {/* Chart */}
      {result.timeline.length > 1 && (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">{t("fire.chartTitle")}</h3>
          <Suspense fallback={<ChartSkeleton />}>
            <FIREChart
              data={chartData}
              locale={locale}
              currency={currency}
              ageLabel={t("chart.ageLabel")}
              ageFormatter={(label: number) => t("chart.age", { n: label })}
              portfolioLabel={t("chart.portfolio")}
              fireTargetLabel={t("chart.fireTarget")}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
