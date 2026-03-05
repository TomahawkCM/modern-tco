"use client";

/**
 * Inflation Impact Calculator Page
 *
 * Visualize how inflation erodes purchasing power over time.
 */

import { useState, useMemo, Suspense } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, TrendingDown, AlertTriangle } from "lucide-react";
import {
  CurrencyInput,
  PercentInput,
  ResultsPanel,
  TransparencyPanel,
} from "@/components/calculators";
import { purchasingPowerOverTime } from "@/engine/calculators";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { SupportedLocale } from "@/i18n/config";
import { usePrimaryCurrency } from "@/contexts/currency-context";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  LazyLineChart,
  Line,
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
      style={{ height: 350 }}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

export default function InflationCalculatorPage() {
  const t = useTranslations("calculators");
  const tc = useTranslations("common");
  const locale = useLocale() as SupportedLocale;
  const currency = usePrimaryCurrency();

  const [currentAmount, setCurrentAmount] = useState(100000);
  const [inflationRate, setInflationRate] = useState(3);
  const [years, setYears] = useState(20);

  const result = useMemo(
    () =>
      purchasingPowerOverTime({
        currentAmount,
        annualInflationRate: inflationRate,
        years,
      }),
    [currentAmount, inflationRate, years]
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
            <TrendingDown className="h-8 w-8 text-destructive" />
            {t("inflation.title")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("inflation.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t("inflation.inputTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <CurrencyInput
              label={t("inflation.currentAmount")}
              value={currentAmount}
              onChange={setCurrentAmount}
              currency={currency}
              locale={locale}
              min={0}
            />

            <PercentInput
              label={t("inflation.inflationRate")}
              value={inflationRate}
              onChange={setInflationRate}
              locale={locale}
              min={0}
              max={20}
              helperText={t("inflation.inflationRateHelp")}
            />

            {/* Presets */}
            <div className="space-y-2">
              <Label>{t("inflation.presets")}</Label>
              <div className="flex gap-2">
                {[
                  { label: t("inflation.presetLow"), value: 2 },
                  { label: t("inflation.presetAverage"), value: 3 },
                  { label: t("inflation.presetHigh"), value: 5 },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setInflationRate(preset.value)}
                    className={cn(
                      "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                      inflationRate === preset.value
                        ? "border border-destructive/50 bg-destructive/10 text-destructive"
                        : "border border-input bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Years slider */}
            <div className="space-y-2">
              <Label>
                {t("inflation.timeHorizon")}: {years}
              </Label>
              <input
                type="range"
                min={1}
                max={40}
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>10</span>
                <span>20</span>
                <span>30</span>
                <span>40</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <h3 className="text-lg font-semibold text-foreground">
                  {t("inflation.heroTitle")}
                </h3>
              </div>
              <p className="text-center text-lg text-foreground">
                {t("inflation.heroDescription", {
                  amount: formatCurrency(currentAmount, currency, locale),
                  futureAmount: formatCurrency(result.futureValue, currency, locale),
                  years,
                })}
              </p>
            </CardContent>
          </Card>

          <ResultsPanel
            title={t("inflation.resultTitle")}
            currency={currency}
            locale={locale}
            columns={2}
            results={[
              {
                label: t("inflation.purchasingPower"),
                value: result.futureValue,
                type: "currency",
                highlight: true,
              },
              {
                label: t("inflation.powerLost"),
                value: result.purchasingPowerLost,
                type: "currency",
                variant: "danger",
              },
              {
                label: t("inflation.powerRemaining"),
                value: result.purchasingPowerPercent,
                type: "percent",
                variant:
                  result.purchasingPowerPercent > 70
                    ? "success"
                    : result.purchasingPowerPercent > 50
                      ? "warning"
                      : "danger",
              },
            ]}
          />

          <TransparencyPanel
            assumptions={[
              {
                label: t("inflation.assumptionConstant"),
                value: formatPercent(inflationRate / 100, locale, 1),
              },
              {
                label: t("inflation.assumptionCompound"),
                value: t("inflation.assumptionCompound"),
              },
            ]}
            formula={t("inflation.formulaText")}
            formulaExplanation={t("inflation.formulaExplanation")}
          />
        </div>
      </div>

      {/* Chart */}
      {result.timeline.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("inflation.chartTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartSkeleton label={tc("loadingChart")} />}>
              <ResponsiveContainer width="100%" height={350}>
                <LazyLineChart data={result.timeline}>
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
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="nominalValue"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name={t("inflation.chartNominal")}
                  />
                  <Line
                    type="monotone"
                    dataKey="realValue"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                    name={t("inflation.chartReal")}
                  />
                </LazyLineChart>
              </ResponsiveContainer>
            </Suspense>
          </CardContent>
        </Card>
      )}

      {/* Year-by-Year Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("inflation.tableTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-3 py-2 text-start">{t("inflation.tableYear")}</th>
                  <th className="px-3 py-2 text-end">{t("inflation.tableNominal")}</th>
                  <th className="px-3 py-2 text-end">{t("inflation.tableReal")}</th>
                  <th className="px-3 py-2 text-end">{t("inflation.tableLost")}</th>
                </tr>
              </thead>
              <tbody>
                {result.timeline.map((point) => (
                  <tr
                    key={point.year}
                    className="border-b border-border/50 text-foreground last:border-0"
                  >
                    <td className="px-3 py-2">{point.year}</td>
                    <td className="px-3 py-2 text-end">
                      {formatCurrency(point.nominalValue, currency, locale)}
                    </td>
                    <td className="px-3 py-2 text-end">
                      {formatCurrency(point.realValue, currency, locale)}
                    </td>
                    <td className="px-3 py-2 text-end text-destructive">
                      {formatCurrency(point.nominalValue - point.realValue, currency, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
