"use client";

/**
 * FIRE (Financial Independence, Retire Early) Calculator Page
 *
 * Calculate FIRE number, years to FIRE, and track progress toward
 * Lean FIRE, Coast FIRE, and Fat FIRE milestones.
 */

import { useState, useMemo, Suspense } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Flame, Check, X } from "lucide-react";
import {
  CurrencyInput,
  PercentInput,
  ResultsPanel,
  TransparencyPanel,
} from "@/components/calculators";
import { calculateFIRE } from "@/engine/calculators";
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

export default function FIRECalculatorPage() {
  const t = useTranslations("calculators");
  const locale = useLocale() as SupportedLocale;
  const localeMeta = LOCALE_METADATA[locale] || LOCALE_METADATA["en-US"];
  const currency = localeMeta.currency;

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
          href="/calculators"
          className="mt-1 rounded-lg p-2 transition-colors hover:bg-muted"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
            <Flame className="h-8 w-8 text-orange-500" />
            {t("fire.title")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("fire.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t("fire.inputTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>{t("fire.currentAge")}</Label>
              <Input
                type="number"
                value={currentAge}
                onChange={(e) =>
                  setCurrentAge(
                    Math.max(18, Math.min(80, Number(e.target.value)))
                  )
                }
                min={18}
                max={80}
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
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {/* Hero Result */}
          <Card className="border-orange-500/30 bg-orange-500/5">
            <CardContent className="pt-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                {t("fire.resultTitle")}
              </h3>
              <div className="py-4 text-center">
                <p className="mb-2 text-3xl font-bold text-foreground">
                  {formatCurrency(result.fireNumber, currency, locale)}
                </p>
                <p className="text-muted-foreground">
                  {result.alreadyFIRE
                    ? t("fire.heroAlready")
                    : t("fire.heroOnTrack", { age: result.fireAge })}
                </p>
              </div>
            </CardContent>
          </Card>

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
          <Card>
            <CardHeader>
              <CardTitle>{t("fire.milestones")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {milestones.map((m) => (
                <div
                  key={m.label}
                  className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    {m.reached ? (
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <span className="font-medium text-foreground">
                        {m.label}
                      </span>
                      <p className="text-xs text-muted-foreground">{m.help}</p>
                    </div>
                  </div>
                  <span className="font-medium text-foreground">
                    {formatCurrency(m.value, currency, locale)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

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
        <Card>
          <CardHeader>
            <CardTitle>{t("fire.chartTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartSkeleton />}>
              <ResponsiveContainer width="100%" height={350}>
                <LazyAreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorFireBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="age" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
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
                    dataKey="balance"
                    stroke="#f97316"
                    fill="url(#colorFireBalance)"
                    name={t("fire.chartPortfolio") ?? "Portfolio"}
                  />
                  <Area
                    type="monotone"
                    dataKey="fireTarget"
                    stroke="#ef4444"
                    fill="none"
                    strokeDasharray="5 5"
                    name={t("fire.chartTarget") ?? "FIRE Target"}
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
