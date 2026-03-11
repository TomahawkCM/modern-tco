"use client";

/**
 * Net Worth Forecaster Calculator Page
 *
 * Project net worth over time with configurable assets and liabilities.
 * Supports multiple assets with growth rates and contributions,
 * and multiple debts with interest rates and payments.
 */

import { useState, useMemo, useCallback, lazy, Suspense } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, BarChart3, Sparkles, Plus, Trash2 } from "lucide-react";
import {
  CurrencyInput,
  PercentInput,
  ResultsPanel,
  TransparencyPanel,
} from "@/components/budget/calculators";
import { forecastNetWorth } from "@/lib/financial-engine";
import type { Asset, Liability } from "@/lib/financial-engine";
import { formatCurrency } from "@/i18n/utils/formatCurrency";
import type { SupportedLocale } from "@/i18n/config";
import { LOCALE_METADATA } from "@/i18n/config";

const NetWorthChart = lazy(() =>
  import("recharts").then((mod) => {
    const Chart = ({
      data,
      locale,
      currency,
      yearLabel,
      yearFormatter,
      totalAssetsLabel,
      totalLiabilitiesLabel,
      netWorthLabel,
    }: {
      data: { year: number; totalAssets: number; totalLiabilities: number; netWorth: number }[];
      locale: SupportedLocale;
      currency: string;
      yearLabel: string;
      yearFormatter: (label: number) => string;
      totalAssetsLabel: string;
      totalLiabilitiesLabel: string;
      netWorthLabel: string;
    }) => {
      const { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } =
        mod;
      return (
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="totalAssets"
              stroke="#10b981"
              fill="url(#colorAssets)"
              name={totalAssetsLabel}
            />
            <Area
              type="monotone"
              dataKey="totalLiabilities"
              stroke="#ef4444"
              fill="none"
              strokeDasharray="3 3"
              name={totalLiabilitiesLabel}
            />
            <Area
              type="monotone"
              dataKey="netWorth"
              stroke="#3b82f6"
              fill="url(#colorNetWorth)"
              name={netWorthLabel}
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

const DEFAULT_ASSETS: Asset[] = [
  { name: "Investments", currentValue: 150000, annualGrowthRate: 7, monthlyContribution: 1000 },
  { name: "Home", currentValue: 350000, annualGrowthRate: 3 },
];

const DEFAULT_LIABILITIES: Liability[] = [
  { name: "Mortgage", currentBalance: 250000, annualRate: 5.5, monthlyPayment: 1500 },
];

export default function NetWorthForecastPage() {
  const t = useTranslations("calculators");
  const locale = useLocale() as SupportedLocale;
  const localeMeta = LOCALE_METADATA[locale] || LOCALE_METADATA["en-US"];
  const currency = localeMeta.currency as string;

  const [assets, setAssets] = useState<Asset[]>(DEFAULT_ASSETS);
  const [liabilities, setLiabilities] = useState<Liability[]>(DEFAULT_LIABILITIES);
  const [years, setYears] = useState(20);

  const result = useMemo(
    () => forecastNetWorth({ assets, liabilities, years }),
    [assets, liabilities, years]
  );

  const chartData = useMemo(
    () =>
      result.timeline.map((point) => ({
        year: point.year,
        totalAssets: point.totalAssets,
        totalLiabilities: point.totalLiabilities,
        netWorth: point.netWorth,
      })),
    [result.timeline]
  );

  const updateAsset = useCallback((index: number, field: keyof Asset, value: string | number) => {
    setAssets((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)));
  }, []);

  const updateLiability = useCallback(
    (index: number, field: keyof Liability, value: string | number) => {
      setLiabilities((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
    },
    []
  );

  const addAsset = useCallback(() => {
    setAssets((prev) => [...prev, { name: "New Asset", currentValue: 0, annualGrowthRate: 5 }]);
  }, []);

  const addLiability = useCallback(() => {
    setLiabilities((prev) => [
      ...prev,
      { name: "New Liability", currentBalance: 0, annualRate: 5, monthlyPayment: 0 },
    ]);
  }, []);

  const removeAsset = useCallback((index: number) => {
    setAssets((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const removeLiability = useCallback((index: number) => {
    setLiabilities((prev) => prev.filter((_, i) => i !== index));
  }, []);

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
            <BarChart3 className="h-8 w-8 text-blue-400" />
            {t("netWorthForecast.title")}
          </h1>
          <p className="mt-2 text-slate-400">{t("netWorthForecast.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <div className="space-y-6">
          {/* Assets */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{t("netWorthForecast.addAsset")}</h2>
              <button
                onClick={addAsset}
                className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-500"
              >
                <Plus className="h-4 w-4" />
                {t("netWorthForecast.addAsset")}
              </button>
            </div>

            <div className="space-y-4">
              {assets.map((asset, i) => (
                <div key={i} className="space-y-3 rounded-lg border border-slate-600 p-4">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={asset.name}
                      onChange={(e) => updateAsset(i, "name", e.target.value)}
                      className="rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white"
                    />
                    <button
                      onClick={() => removeAsset(i)}
                      className="text-slate-500 hover:text-red-400"
                      aria-label={t("netWorthForecast.remove")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <CurrencyInput
                      label={t("netWorthForecast.assetValue")}
                      value={asset.currentValue}
                      onChange={(v) => updateAsset(i, "currentValue", v)}
                      currency={currency}
                      locale={locale}
                      min={0}
                    />
                    <PercentInput
                      label={t("netWorthForecast.assetGrowth")}
                      value={asset.annualGrowthRate}
                      onChange={(v) => updateAsset(i, "annualGrowthRate", v)}
                      locale={locale}
                      min={-10}
                      max={30}
                    />
                  </div>
                  <CurrencyInput
                    label={t("netWorthForecast.assetContribution")}
                    value={asset.monthlyContribution ?? 0}
                    onChange={(v) => updateAsset(i, "monthlyContribution", v)}
                    currency={currency}
                    locale={locale}
                    min={0}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Liabilities */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {t("netWorthForecast.addLiability")}
              </h2>
              <button
                onClick={addLiability}
                className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500"
              >
                <Plus className="h-4 w-4" />
                {t("netWorthForecast.addLiability")}
              </button>
            </div>

            <div className="space-y-4">
              {liabilities.map((liability, i) => (
                <div key={i} className="space-y-3 rounded-lg border border-slate-600 p-4">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={liability.name}
                      onChange={(e) => updateLiability(i, "name", e.target.value)}
                      className="rounded border border-slate-600 bg-slate-700 px-2 py-1 text-sm text-white"
                    />
                    <button
                      onClick={() => removeLiability(i)}
                      className="text-slate-500 hover:text-red-400"
                      aria-label={t("netWorthForecast.remove")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <CurrencyInput
                      label={t("netWorthForecast.liabilityBalance")}
                      value={liability.currentBalance}
                      onChange={(v) => updateLiability(i, "currentBalance", v)}
                      currency={currency}
                      locale={locale}
                      min={0}
                    />
                    <PercentInput
                      label={t("netWorthForecast.liabilityRate")}
                      value={liability.annualRate}
                      onChange={(v) => updateLiability(i, "annualRate", v)}
                      locale={locale}
                      min={0}
                      max={30}
                    />
                  </div>
                  <CurrencyInput
                    label={t("netWorthForecast.liabilityPayment")}
                    value={liability.monthlyPayment}
                    onChange={(v) => updateLiability(i, "monthlyPayment", v)}
                    currency={currency}
                    locale={locale}
                    min={0}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Projection Years */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                {t("netWorthForecast.years")}
              </label>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(Math.max(1, Math.min(50, Number(e.target.value))))}
                min={1}
                max={50}
                className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Hero Result */}
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-6">
            <div className="mb-4 flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">
                {t("netWorthForecast.resultTitle")}
              </h3>
            </div>
            <div className="py-4 text-center">
              <p className="mb-2 text-3xl font-bold text-white">
                {formatCurrency(result.projectedNetWorth, currency, locale)}
              </p>
              <p className="text-slate-400">
                {t("netWorthForecast.totalGrowth")}:{" "}
                <span className="font-medium text-green-400">
                  {formatCurrency(result.totalGrowth, currency, locale)}
                </span>
              </p>
            </div>
          </div>

          <ResultsPanel
            title={t("netWorthForecast.resultTitle")}
            currency={currency}
            locale={locale}
            columns={2}
            results={[
              {
                label: t("netWorthForecast.currentNetWorth"),
                value: result.currentNetWorth,
                type: "currency",
              },
              {
                label: t("netWorthForecast.projectedNetWorth"),
                value: result.projectedNetWorth,
                type: "currency",
                highlight: true,
              },
              {
                label: t("netWorthForecast.totalGrowth"),
                value: result.totalGrowth,
                type: "currency",
                variant: result.totalGrowth > 0 ? "success" : "danger",
              },
              {
                label: t("netWorthForecast.growthRate"),
                value: result.growthRate,
                type: "percent",
              },
              {
                label: t("netWorthForecast.millionaireYear"),
                value:
                  result.millionaireYear !== null
                    ? `Year ${result.millionaireYear}`
                    : t("netWorthForecast.never"),
                type: "text",
              },
              {
                label: t("netWorthForecast.debtFreeYear"),
                value:
                  result.debtFreeYear !== null
                    ? `Year ${result.debtFreeYear}`
                    : liabilities.length > 0
                      ? t("netWorthForecast.never")
                      : "N/A",
                type: "text",
              },
            ]}
          />

          <TransparencyPanel
            assumptions={[
              { label: t("netWorthForecast.assumptionGrowth"), value: "Monthly" },
              { label: t("netWorthForecast.assumptionInflation"), value: "3%" },
            ]}
            formula={t("netWorthForecast.formulaText")}
            formulaExplanation={t("netWorthForecast.formulaExplanation")}
          />
        </div>
      </div>

      {/* Chart */}
      {result.timeline.length > 1 && (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            {t("netWorthForecast.chartTitle")}
          </h3>
          <Suspense fallback={<ChartSkeleton />}>
            <NetWorthChart
              data={chartData}
              locale={locale}
              currency={currency}
              yearLabel={t("chart.yearLabel")}
              yearFormatter={(label: number) => t("chart.year", { n: label })}
              totalAssetsLabel={t("chart.totalAssets")}
              totalLiabilitiesLabel={t("chart.totalLiabilities")}
              netWorthLabel={t("chart.netWorth")}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
