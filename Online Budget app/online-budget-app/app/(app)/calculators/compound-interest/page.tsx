"use client";

/**
 * Compound Interest Calculator Page
 *
 * Visualize how investments grow with compound interest over time.
 * Supports different compounding frequencies.
 */

import { useState, useMemo, Suspense } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, CircleDollarSign } from "lucide-react";
import {
  CurrencyInput,
  PercentInput,
  ResultsPanel,
  TransparencyPanel,
} from "@/components/calculators";
import { compoundInterest } from "@/engine/calculators";
import type { CompoundingFrequency } from "@/engine/calculators";
import { formatCurrency } from "@/lib/format";
import type { SupportedLocale } from "@/i18n/config";
import { usePrimaryCurrency } from "@/contexts/currency-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const tc = useTranslations("common");
  const locale = useLocale() as SupportedLocale;
  const currency = usePrimaryCurrency();

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
          href="/calculators"
          className="mt-1 rounded-lg p-2 transition-colors hover:bg-muted"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
            <CircleDollarSign className="h-8 w-8 text-primary" />
            {t("compoundInterest.title")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("compoundInterest.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t("compoundInterest.inputTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
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
              <Label>{t("compoundInterest.years")}</Label>
              <Input
                type="number"
                value={years}
                onChange={(e) => setYears(Math.max(1, Math.min(50, Number(e.target.value))))}
                min={1}
                max={50}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("compoundInterest.compoundingFrequency")}</Label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as CompoundingFrequency)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f} value={f}>
                    {t(`compoundInterest.frequency.${f}`)}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {/* Hero Result */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="py-6 text-center">
              <p className="mb-2 text-3xl font-bold text-foreground">
                {formatCurrency(result.futureValue, currency, locale)}
              </p>
              <p className="text-muted-foreground">
                {t("compoundInterest.interestEarned")}:{" "}
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(result.totalInterest, currency, locale)}
                </span>
              </p>
            </CardContent>
          </Card>

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
        <Card>
          <CardHeader>
            <CardTitle>{t("compoundInterest.chartTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartSkeleton label={tc("loadingChart")} />}>
              <ResponsiveContainer width="100%" height={350}>
                <LazyAreaChart data={chartData}>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="period"
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
                    fill="url(#colorContributions)"
                    name={t("compoundInterest.totalContributions")}
                  />
                  <Area
                    type="monotone"
                    dataKey="interest"
                    stackId="1"
                    stroke="#10b981"
                    fill="url(#colorInterest)"
                    name={t("compoundInterest.interestEarned")}
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
