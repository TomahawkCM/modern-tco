"use client";

/**
 * Inflation Impact Calculator Page
 *
 * Visualize how inflation erodes purchasing power over time.
 * Features presets, dual-line chart, and year-by-year table.
 */

import { useState, useMemo, lazy, Suspense } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, TrendingDown, AlertTriangle } from "lucide-react";
import {
  CurrencyInput,
  PercentInput,
  ResultsPanel,
  TransparencyPanel,
} from "@/components/budget/calculators";
import { purchasingPowerOverTime } from "@/lib/financial-engine";
import { formatCurrency } from "@/i18n/utils/formatCurrency";
import { formatPercent } from "@/i18n/utils/formatNumber";
import type { SupportedLocale } from "@/i18n/config";
import { LOCALE_METADATA } from "@/i18n/config";
import { cn } from "@/lib/utils";

const InflationChart = lazy(() =>
  import("recharts").then((mod) => {
    const Chart = ({
      data,
      locale,
      currency,
      nominalLabel,
      realLabel,
      yearLabel,
      yearFormatter,
    }: {
      data: { year: number; nominalValue: number; realValue: number }[];
      locale: SupportedLocale;
      currency: string;
      nominalLabel: string;
      realLabel: string;
      yearLabel: string;
      yearFormatter: (label: number) => string;
    }) => {
      const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } =
        mod;
      return (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="year"
              stroke="#64748b"
              tick={{ fontSize: 12 }}
              label={{
                value: yearLabel,
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
              labelFormatter={(label: number) => yearFormatter(label)}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="nominalValue"
              stroke="#64748b"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name={nominalLabel}
            />
            <Line
              type="monotone"
              dataKey="realValue"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              name={realLabel}
            />
          </LineChart>
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

export default function InflationCalculatorPage() {
  const t = useTranslations("calculators");
  const locale = useLocale() as SupportedLocale;
  const localeMeta = LOCALE_METADATA[locale] || LOCALE_METADATA["en-US"];
  const currency = localeMeta.currency as string;

  const [currentAmount, setCurrentAmount] = useState(100000);
  const [inflationRate, setInflationRate] = useState(3);
  const [years, setYears] = useState(20);

  const result = useMemo(
    () => purchasingPowerOverTime({ currentAmount, annualInflationRate: inflationRate, years }),
    [currentAmount, inflationRate, years]
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
            <TrendingDown className="h-8 w-8 text-rose-400" />
            {t("inflation.title")}
          </h1>
          <p className="mt-2 text-slate-400">{t("inflation.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <div className="space-y-6 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h2 className="text-lg font-semibold text-white">{t("inflation.inputTitle")}</h2>

          <div className="space-y-5">
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
              <label className="block text-sm font-medium text-slate-300">
                {t("inflation.presets")}
              </label>
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
                        ? "border border-rose-500/50 bg-rose-500/20 text-rose-400"
                        : "border border-slate-600 bg-slate-700/50 text-slate-400 hover:bg-slate-700"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Years slider */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                {t("inflation.timeHorizon")}: {years}
              </label>
              <input
                type="range"
                min={1}
                max={40}
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full accent-rose-500"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>1</span>
                <span>10</span>
                <span>20</span>
                <span>30</span>
                <span>40</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Hero Stat */}
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6">
            <div className="mb-4 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-rose-400" />
              <h3 className="text-lg font-semibold text-white">{t("inflation.heroTitle")}</h3>
            </div>
            <p className="text-center text-lg text-slate-300">
              {t("inflation.heroDescription", {
                amount: formatCurrency(currentAmount, currency, locale),
                futureAmount: formatCurrency(result.futureValue, currency, locale),
                years,
              })}
            </p>
          </div>

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
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">{t("inflation.chartTitle")}</h3>
          <Suspense fallback={<ChartSkeleton />}>
            <InflationChart
              data={result.timeline}
              locale={locale}
              currency={currency}
              nominalLabel={t("inflation.chartNominal")}
              realLabel={t("inflation.chartReal")}
              yearLabel={t("chart.yearLabel")}
              yearFormatter={(label: number) => t("chart.year", { n: label })}
            />
          </Suspense>
        </div>
      )}

      {/* Year-by-Year Table */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">{t("inflation.tableTitle")}</h3>
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-800">
              <tr className="border-b border-slate-700 text-slate-400">
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
                  className="border-b border-slate-700/50 text-slate-300 last:border-0"
                >
                  <td className="px-3 py-2">{point.year}</td>
                  <td className="px-3 py-2 text-end">
                    {formatCurrency(point.nominalValue, currency, locale)}
                  </td>
                  <td className="px-3 py-2 text-end">
                    {formatCurrency(point.realValue, currency, locale)}
                  </td>
                  <td className="px-3 py-2 text-end text-rose-400">
                    {formatCurrency(point.nominalValue - point.realValue, currency, locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
