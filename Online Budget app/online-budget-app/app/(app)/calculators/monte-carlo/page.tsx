"use client";

/**
 * Monte Carlo Simulation Page
 *
 * Probabilistic financial modeling with percentile-band visualization.
 * Two modes: Accumulation (saving) and Withdrawal (retirement drawdown).
 */

import { useState, useMemo, Suspense } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Dices, Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import {
  CurrencyInput,
  PercentInput,
  ResultsPanel,
  TransparencyPanel,
} from "@/components/calculators";
import { runMonteCarlo } from "@/engine/calculators";
import { formatCurrency, formatPercent } from "@/lib/format";
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
      style={{ height: 400 }}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

type SimMode = "accumulation" | "withdrawal";

export default function MonteCarloPage() {
  const t = useTranslations("calculators");
  const tc = useTranslations("common");
  const locale = useLocale() as SupportedLocale;
  const currency = usePrimaryCurrency();

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
        color: "bg-green-500/20 text-green-600 border-green-500/50 dark:text-green-400",
      };
    }
    if (result.successRate >= 50) {
      return {
        text: t("monteCarlo.badgeCaution"),
        color: "bg-yellow-500/20 text-yellow-600 border-yellow-500/50 dark:text-yellow-400",
      };
    }
    return {
      text: t("monteCarlo.badgeRisk"),
      color: "bg-red-500/20 text-red-600 border-red-500/50 dark:text-red-400",
    };
  };

  const badge = getSuccessBadge();

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
            <Dices className="h-8 w-8 text-purple-500 dark:text-purple-400" />
            {t("monteCarlo.title")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("monteCarlo.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <div className="space-y-6">
          {/* Mode Toggle */}
          <Card>
            <CardContent className="pt-6">
              <Label className="mb-3 block">{t("monteCarlo.scenarioMode")}</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMode("accumulation")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                    mode === "accumulation"
                      ? "bg-purple-500/20 text-purple-600 ring-1 ring-purple-500/50 dark:text-purple-300"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                      ? "bg-amber-500/20 text-amber-600 ring-1 ring-amber-500/50 dark:text-amber-300"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <TrendingDown className="h-4 w-4" />
                  {t("monteCarlo.modeWithdrawal")}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Main inputs */}
          <Card>
            <CardHeader>
              <CardTitle>{t("monteCarlo.inputTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
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
                <Label>{t("monteCarlo.timeHorizon")}</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="min-w-[3rem] text-center text-lg font-bold text-foreground">
                    {years}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("monteCarlo.simulations")}</Label>
                <select
                  value={simulations}
                  onChange={(e) => setSimulations(Number(e.target.value))}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value={100}>100</option>
                  <option value={500}>500</option>
                  <option value={1000}>1,000</option>
                  <option value={2500}>2,500</option>
                  <option value={5000}>5,000</option>
                  <option value={10000}>10,000</option>
                </select>
                <p className="text-xs text-muted-foreground">{t("monteCarlo.simulationsHelp")}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Hero Result */}
          <Card
            className={cn(
              result.successRate >= 80
                ? "border-green-500/30 bg-green-500/5"
                : result.successRate >= 50
                  ? "border-yellow-500/30 bg-yellow-500/5"
                  : "border-red-500/30 bg-red-500/5"
            )}
          >
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-purple-500 dark:text-purple-400" />
                  <h3 className="text-lg font-semibold text-foreground">
                    {t("monteCarlo.heroTitle")}
                  </h3>
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
                <p className="mb-1 text-4xl font-bold text-foreground">
                  {formatPercent(result.successRate / 100, locale, 1)}
                </p>
                <p className="text-sm text-muted-foreground">{t("monteCarlo.successRateLabel")}</p>

                {/* Visual gauge bar */}
                <div className="mx-auto mt-4 h-3 max-w-xs overflow-hidden rounded-full bg-muted">
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
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("monteCarlo.successRateDescription", {
                    total: result.totalSimulations,
                    failures: result.failureCount,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

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
                value: `${result.totalSimulations.toLocaleString(locale)}`,
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t("monteCarlo.chartTitle")}</CardTitle>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-6 rounded bg-purple-500/20" />
                  P10-P90
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-6 rounded bg-purple-500/40" />
                  P25-P75
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-0.5 w-6 bg-purple-500" />
                  Median
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartSkeleton label={tc("loadingChart")} />}>
              <ResponsiveContainer width="100%" height={400}>
                <LazyAreaChart data={chartData}>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="year"
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
                    labelFormatter={(label: unknown) => `Year ${label}`}
                  />
                  <Legend />

                  {/* Outer band: P10 - P90 */}
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

                  {/* Inner band: P25 - P75 */}
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
                </LazyAreaChart>
              </ResponsiveContainer>
            </Suspense>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
