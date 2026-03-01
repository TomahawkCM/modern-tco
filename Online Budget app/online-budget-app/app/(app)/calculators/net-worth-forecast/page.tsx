"use client";

/**
 * Net Worth Forecaster Calculator Page
 *
 * Project net worth over time with configurable assets and liabilities.
 */

import { useState, useMemo, useCallback, Suspense } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, BarChart3, Sparkles, Plus, Trash2 } from "lucide-react";
import {
  CurrencyInput,
  PercentInput,
  ResultsPanel,
  TransparencyPanel,
} from "@/components/calculators";
import { forecastNetWorth } from "@/engine/calculators";
import type { Asset, Liability } from "@/engine/calculators";
import { formatCurrency } from "@/lib/format";
import type { SupportedLocale } from "@/i18n/config";
import { LOCALE_METADATA } from "@/i18n/config";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

function ChartSkeleton() {
  return (
    <div
      className="flex w-full animate-pulse items-center justify-center rounded-lg bg-muted"
      style={{ height: 350 }}
    >
      <span className="text-sm text-muted-foreground">Loading chart...</span>
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
  const currency = localeMeta.currency;

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

  const updateAsset = useCallback(
    (index: number, field: keyof Asset, value: string | number) => {
      setAssets((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)));
    },
    []
  );

  const updateLiability = useCallback(
    (index: number, field: keyof Liability, value: string | number) => {
      setLiabilities((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
    },
    []
  );

  const addAsset = useCallback(() => {
    setAssets((prev) => [
      ...prev,
      { name: "New Asset", currentValue: 0, annualGrowthRate: 5 },
    ]);
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
          href="/calculators"
          className="mt-1 rounded-lg p-2 transition-colors hover:bg-muted"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
            <BarChart3 className="h-8 w-8 text-primary" />
            {t("netWorthForecast.title")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("netWorthForecast.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <div className="space-y-6">
          {/* Assets */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>{t("netWorthForecast.addAsset")}</CardTitle>
              <button
                onClick={addAsset}
                className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-500"
              >
                <Plus className="h-4 w-4" />
                {t("netWorthForecast.addAsset")}
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {assets.map((asset, i) => (
                <div key={i} className="space-y-3 rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={asset.name}
                      onChange={(e) => updateAsset(i, "name", e.target.value)}
                      className="rounded border border-input bg-transparent px-2 py-1 text-sm text-foreground"
                    />
                    <button
                      onClick={() => removeAsset(i)}
                      className="text-muted-foreground hover:text-destructive"
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
            </CardContent>
          </Card>

          {/* Liabilities */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>{t("netWorthForecast.addLiability")}</CardTitle>
              <button
                onClick={addLiability}
                className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500"
              >
                <Plus className="h-4 w-4" />
                {t("netWorthForecast.addLiability")}
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {liabilities.map((liability, i) => (
                <div key={i} className="space-y-3 rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={liability.name}
                      onChange={(e) => updateLiability(i, "name", e.target.value)}
                      className="rounded border border-input bg-transparent px-2 py-1 text-sm text-foreground"
                    />
                    <button
                      onClick={() => removeLiability(i)}
                      className="text-muted-foreground hover:text-destructive"
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
            </CardContent>
          </Card>

          {/* Projection Years */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label>{t("netWorthForecast.years")}</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={1}
                    max={30}
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="min-w-[3rem] text-center text-lg font-bold text-foreground">
                    {years}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  {t("netWorthForecast.resultTitle")}
                </h3>
              </div>
              <div className="py-4 text-center">
                <p className="mb-2 text-3xl font-bold text-foreground">
                  {formatCurrency(result.projectedNetWorth, currency, locale)}
                </p>
                <p className="text-muted-foreground">
                  {t("netWorthForecast.totalGrowth")}:{" "}
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {formatCurrency(result.totalGrowth, currency, locale)}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

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
        <Card>
          <CardHeader>
            <CardTitle>{t("netWorthForecast.chartTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartSkeleton />}>
              <ResponsiveContainer width="100%" height={350}>
                <LazyAreaChart data={chartData}>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
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
                    dataKey="totalAssets"
                    stroke="#10b981"
                    fill="url(#colorAssets)"
                    name={t("netWorthForecast.totalAssets") ?? "Total Assets"}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalLiabilities"
                    stroke="#ef4444"
                    fill="none"
                    strokeDasharray="3 3"
                    name={t("netWorthForecast.totalLiabilities") ?? "Total Liabilities"}
                  />
                  <Area
                    type="monotone"
                    dataKey="netWorth"
                    stroke="#3b82f6"
                    fill="url(#colorNetWorth)"
                    name={t("netWorthForecast.netWorthLabel") ?? "Net Worth"}
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
