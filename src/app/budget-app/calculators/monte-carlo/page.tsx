"use client";

/**
 * Monte Carlo Simulation Page
 *
 * Probabilistic financial modeling with percentile-band visualization.
 * Two modes: Accumulation (saving) and Withdrawal (retirement drawdown).
 */

import {
  CurrencyInput,
  PercentInput,
  ResultsPanel,
  TransparencyPanel,
} from "@/components/budget/calculators";
import type { SupportedLocale } from "@/i18n/config";
import { LOCALE_METADATA } from "@/i18n/config";
import { formatCurrency } from "@/i18n/utils/formatCurrency";
import { formatPercent } from "@/i18n/utils/formatNumber";
import { runMonteCarlo } from "@/lib/financial-engine";
import { cn } from "@/lib/utils";
import { ArrowLeft, Dices, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Suspense, lazy, useMemo, useState } from "react";

// ---------------------------------------------------------------------------
// Lazy-loaded fan chart (percentile bands)
// ---------------------------------------------------------------------------

const MonteCarloChart = lazy(() =>
  import("recharts").then((mod) => {
    const Chart = ({
      data,
      locale,
      currency,
    }: {
      data: {
        year: number;
        p10: number;
        p25: number;
        p50: number;
        p75: number;
        p90: number;
      }[];
      locale: SupportedLocale;
      currency: string;
    }) => {
      const { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } =
        mod;

      return (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="mcOuter" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="mcInner" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="year"
              stroke="#64748b"
              tick={{ fontSize: 12 }}
              label={{
                value: "Year",
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
              labelFormatter={(label: number) => `Year ${label}`}
            />
            <Legend />

            {/* Outer band: P10 – P90 */}
            <Area
              type="monotone"
              dataKey="p90"
              stackId="outer"
              stroke="none"
              fill="url(#mcOuter)"
              name="90th Percentile"
            />
            <Area
              type="monotone"
              dataKey="p10"
              stackId="outer_base"
              stroke="#8b5cf640"
              strokeDasharray="4 2"
              fill="none"
              name="10th Percentile"
            />

            {/* Inner band: P25 – P75 */}
            <Area
              type="monotone"
              dataKey="p75"
              stackId="inner"
              stroke="none"
              fill="url(#mcInner)"
              name="75th Percentile"
            />
            <Area
              type="monotone"
              dataKey="p25"
              stackId="inner_base"
              stroke="#8b5cf680"
              strokeDasharray="2 2"
              fill="none"
              name="25th Percentile"
            />

            {/* Median line */}
            <Area
              type="monotone"
              dataKey="p50"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              fill="none"
              name="Median (50th)"
              dot={false}
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
      style={{ height: 400 }}
    >
      <span className="text-sm text-slate-500">Loading chart...</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

type SimMode = "accumulation" | "withdrawal";

export default function MonteCarloPage() {
  const t = useTranslations("calculators");
  const locale = useLocale() as SupportedLocale;
  const localeMeta = LOCALE_METADATA[locale] || LOCALE_METADATA["en-US"];
  const currency = localeMeta.currency as string;

  // Mode
  const [mode, setMode] = useState<SimMode>("accumulation");

  // Inputs
  const [initialBalance, setInitialBalance] = useState(100000);
  const [monthlyAmount, setMonthlyAmount] = useState(1000);
  const [expectedReturn, setExpectedReturn] = useState(7);
  const [volatility, setVolatility] = useState(15);
  const [inflationRate, setInflationRate] = useState(3);
  const [years, setYears] = useState(30);
  const [simulations, setSimulations] = useState(1000);

  // Run simulation
  const result = useMemo(
    () =>
      runMonteCarlo({
        initialBalance,
        monthlyContribution: mode === "accumulation" ? monthlyAmount : 0,
        monthlyWithdrawal: mode === "withdrawal" ? monthlyAmount : 0,
        expectedAnnualReturn: expectedReturn,
        annualVolatility: volatility,
        inflationRate,
        years,
        simulations,
        seed: 42,
      }),
    [
      initialBalance,
      monthlyAmount,
      expectedReturn,
      volatility,
      inflationRate,
      years,
      simulations,
      mode,
    ]
  );

  const chartData = useMemo(
    () =>
      result.percentiles.map((p) => ({
        year: p.year,
        p10: p.p10,
        p25: p.p25,
        p50: p.p50,
        p75: p.p75,
        p90: p.p90,
      })),
    [result.percentiles]
  );

  // Success rate badge
  const getSuccessBadge = () => {
    if (result.successRate >= 80) {
      return {
        text: t("monteCarlo.badgeStrong"),
        color: "bg-green-500/20 text-green-400 border-green-500/50",
      };
    }
    if (result.successRate >= 50) {
      return {
        text: t("monteCarlo.badgeCaution"),
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      };
    }
    return {
      text: t("monteCarlo.badgeRisk"),
      color: "bg-red-500/20 text-red-400 border-red-500/50",
    };
  };

  const badge = getSuccessBadge();

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
            <Dices className="h-8 w-8 text-purple-400" />
            {t("monteCarlo.title")}
          </h1>
          <p className="mt-2 text-slate-400">{t("monteCarlo.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <div className="space-y-6">
          {/* Mode Toggle */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
            <label className="mb-3 block text-sm font-medium text-slate-300">
              {t("monteCarlo.scenarioMode")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode("accumulation")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                  mode === "accumulation"
                    ? "bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/50"
                    : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-300"
                )}
              >
                <TrendingUp className="h-4 w-4" />
                {t("monteCarlo.modeAccumulation")}
              </button>
              <button
                onClick={() => setMode("withdrawal")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                  mode === "withdrawal"
                    ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/50"
                    : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-300"
                )}
              >
                <TrendingDown className="h-4 w-4" />
                {t("monteCarlo.modeWithdrawal")}
              </button>
            </div>
          </div>

          {/* Main inputs */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">{t("monteCarlo.inputTitle")}</h2>

            <div className="space-y-5">
              <CurrencyInput
                label={t("monteCarlo.initialBalance")}
                value={initialBalance}
                onChange={setInitialBalance}
                currency={currency}
                locale={locale}
                min={0}
              />

              <CurrencyInput
                label={
                  mode === "accumulation"
                    ? t("monteCarlo.monthlyContribution")
                    : t("monteCarlo.monthlyWithdrawal")
                }
                value={monthlyAmount}
                onChange={setMonthlyAmount}
                currency={currency}
                locale={locale}
                min={0}
              />

              <PercentInput
                label={t("monteCarlo.expectedReturn")}
                value={expectedReturn}
                onChange={setExpectedReturn}
                locale={locale}
                min={0}
                max={20}
                helperText={t("monteCarlo.expectedReturnHelp")}
              />

              <PercentInput
                label={t("monteCarlo.volatility")}
                value={volatility}
                onChange={setVolatility}
                locale={locale}
                min={0}
                max={40}
                helperText={t("monteCarlo.volatilityHelp")}
              />

              <PercentInput
                label={t("monteCarlo.inflationRate")}
                value={inflationRate}
                onChange={setInflationRate}
                locale={locale}
                min={0}
                max={10}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  {t("monteCarlo.timeHorizon")}
                </label>
                <input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(Math.max(1, Math.min(50, Number(e.target.value))))}
                  min={1}
                  max={50}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  {t("monteCarlo.simulations")}
                </label>
                <select
                  value={simulations}
                  onChange={(e) => setSimulations(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={100}>100</option>
                  <option value={500}>500</option>
                  <option value={1000}>1,000</option>
                  <option value={2500}>2,500</option>
                  <option value={5000}>5,000</option>
                  <option value={10000}>10,000</option>
                </select>
                <p className="text-xs text-slate-500">{t("monteCarlo.simulationsHelp")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Hero Result */}
          <div
            className={cn(
              "rounded-xl border p-6",
              result.successRate >= 80
                ? "border-green-500/30 bg-green-500/10"
                : result.successRate >= 50
                  ? "border-yellow-500/30 bg-yellow-500/10"
                  : "border-red-500/30 bg-red-500/10"
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">{t("monteCarlo.heroTitle")}</h3>
              </div>
              <span
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium",
                  badge.color
                )}
              >
                {badge.text}
              </span>
            </div>

            <div className="py-4 text-center">
              <p className="mb-1 text-4xl font-bold text-white">
                {formatPercent(result.successRate / 100, locale, 1)}
              </p>
              <p className="text-sm text-slate-400">{t("monteCarlo.successRateLabel")}</p>

              {/* Visual gauge bar */}
              <div className="mx-auto mt-4 h-3 max-w-xs overflow-hidden rounded-full bg-slate-700">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    result.successRate >= 80
                      ? "bg-gradient-to-r from-green-500 to-emerald-400"
                      : result.successRate >= 50
                        ? "bg-gradient-to-r from-yellow-500 to-amber-400"
                        : "bg-gradient-to-r from-red-500 to-rose-400"
                  )}
                  style={{ width: `${Math.min(100, result.successRate)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {t("monteCarlo.successRateDescription", {
                  total: result.totalSimulations,
                  failures: result.failureCount,
                })}
              </p>
            </div>
          </div>

          <ResultsPanel
            title={t("monteCarlo.resultsTitle")}
            currency={currency}
            locale={locale}
            columns={2}
            results={[
              {
                label: t("monteCarlo.medianFinal"),
                value: result.medianFinalBalance,
                type: "currency",
                highlight: true,
              },
              {
                label: t("monteCarlo.p90Final"),
                value: result.percentiles[result.percentiles.length - 1]?.p90 ?? 0,
                type: "currency",
                variant: "success",
              },
              {
                label: t("monteCarlo.p10Final"),
                value: result.percentiles[result.percentiles.length - 1]?.p10 ?? 0,
                type: "currency",
                variant:
                  (result.percentiles[result.percentiles.length - 1]?.p10 ?? 0) <= 0
                    ? "danger"
                    : undefined,
              },
              {
                label: t("monteCarlo.totalSimulations"),
                value: `${result.totalSimulations.toLocaleString()}`,
                type: "text",
              },
            ]}
          />

          <TransparencyPanel
            assumptions={[
              {
                label: t("monteCarlo.assumptionReturns"),
                value: t("monteCarlo.assumptionReturnsValue"),
              },
              {
                label: t("monteCarlo.assumptionVolatility"),
                value: formatPercent(volatility / 100, locale, 1),
              },
              {
                label: t("monteCarlo.assumptionInflation"),
                value:
                  mode === "withdrawal"
                    ? t("monteCarlo.assumptionInflationApplied")
                    : t("monteCarlo.assumptionInflationNone"),
              },
              {
                label: t("monteCarlo.assumptionPRNG"),
                value: t("monteCarlo.assumptionPRNGValue"),
              },
            ]}
            formula={t("monteCarlo.formulaText")}
            formulaExplanation={t("monteCarlo.formulaExplanation")}
          />
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{t("monteCarlo.chartTitle")}</h3>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-6 rounded bg-purple-500/20" />
                P10–P90
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-6 rounded bg-purple-500/40" />
                P25–P75
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-6 bg-purple-500" />
                Median
              </span>
            </div>
          </div>
          <Suspense fallback={<ChartSkeleton />}>
            <MonteCarloChart data={chartData} locale={locale} currency={currency} />
          </Suspense>
        </div>
      )}
    </div>
  );
}
