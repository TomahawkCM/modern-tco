"use client";

/**
 * Retirement Planner Page
 *
 * Flagship calculator with progressive disclosure.
 * Two-phase projection: accumulation + withdrawal.
 */

import { useState, useMemo, Suspense } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import {
  CurrencyInput,
  PercentInput,
  ResultsPanel,
  TransparencyPanel,
} from "@/components/calculators";
import { calculateRetirement, DEFAULT_ASSUMPTIONS } from "@/engine/calculators";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { SupportedLocale } from "@/i18n/config";
import { usePrimaryCurrency } from "@/contexts/currency-context";
import { cn } from "@/lib/utils";
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
  ReferenceLine,
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

export default function RetirementPlannerPage() {
  const t = useTranslations("calculators");
  const tc = useTranslations("common");
  const locale = useLocale() as SupportedLocale;
  const currency = usePrimaryCurrency();

  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(65);
  const [currentSavings, setCurrentSavings] = useState(50000);
  const [monthlyContribution, setMonthlyContribution] = useState(1000);
  const [desiredIncome, setDesiredIncome] = useState(5000);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [preRetirementReturn, setPreRetirementReturn] = useState<number>(
    DEFAULT_ASSUMPTIONS.preRetirementReturn
  );
  const [postRetirementReturn, setPostRetirementReturn] = useState<number>(
    DEFAULT_ASSUMPTIONS.postRetirementReturn
  );
  const [inflationRate, setInflationRate] = useState<number>(DEFAULT_ASSUMPTIONS.inflationRate);
  const [lifeExpectancy, setLifeExpectancy] = useState<number>(DEFAULT_ASSUMPTIONS.lifeExpectancy);
  const [socialSecurity, setSocialSecurity] = useState<number>(
    DEFAULT_ASSUMPTIONS.socialSecurityMonthly
  );
  const [ssStartAge, setSSStartAge] = useState<number>(DEFAULT_ASSUMPTIONS.socialSecurityStartAge);

  const result = useMemo(
    () =>
      calculateRetirement({
        currentAge,
        retirementAge: Math.max(currentAge + 1, retirementAge),
        currentSavings,
        monthlyContribution,
        desiredMonthlyIncome: desiredIncome,
        preRetirementReturn,
        postRetirementReturn,
        inflationRate,
        lifeExpectancy,
        socialSecurityMonthly: socialSecurity,
        socialSecurityStartAge: ssStartAge,
      }),
    [
      currentAge,
      retirementAge,
      currentSavings,
      monthlyContribution,
      desiredIncome,
      preRetirementReturn,
      postRetirementReturn,
      inflationRate,
      lifeExpectancy,
      socialSecurity,
      ssStartAge,
    ]
  );

  const chartData = useMemo(
    () =>
      result.timeline.map((p) => ({
        age: p.age,
        accumulation: p.phase === "accumulation" ? p.balance : undefined,
        withdrawal: p.phase === "withdrawal" ? p.balance : undefined,
      })),
    [result.timeline]
  );

  const getBadge = () => {
    if (result.isSufficient && result.yearsMoneyLasts >= lifeExpectancy - retirementAge) {
      return {
        text: t("retirement.heroSufficientBadge"),
        color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/50",
        icon: <CheckCircle2 className="h-5 w-5" />,
      };
    }
    if (result.isSufficient) {
      return {
        text: t("retirement.heroNeutralBadge"),
        color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/50",
        icon: <AlertTriangle className="h-5 w-5" />,
      };
    }
    return {
      text: t("retirement.heroInsufficientBadge"),
      color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/50",
      icon: <XCircle className="h-5 w-5" />,
    };
  };

  const badge = getBadge();

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
            <TrendingUp className="h-8 w-8 text-primary" />
            {t("retirement.title")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("retirement.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("retirement.inputTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("retirement.currentAge")}</Label>
                  <Input
                    type="number"
                    value={currentAge}
                    onChange={(e) =>
                      setCurrentAge(Math.max(18, Math.min(80, Number(e.target.value))))
                    }
                    min={18}
                    max={80}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("retirement.retirementAge")}</Label>
                  <Input
                    type="number"
                    value={retirementAge}
                    onChange={(e) =>
                      setRetirementAge(
                        Math.max(currentAge + 1, Math.min(80, Number(e.target.value)))
                      )
                    }
                    min={currentAge + 1}
                    max={80}
                  />
                </div>
              </div>

              <CurrencyInput
                label={t("retirement.currentSavings")}
                value={currentSavings}
                onChange={setCurrentSavings}
                currency={currency}
                locale={locale}
                min={0}
              />

              <CurrencyInput
                label={t("retirement.monthlyContribution")}
                value={monthlyContribution}
                onChange={setMonthlyContribution}
                currency={currency}
                locale={locale}
                min={0}
              />

              <CurrencyInput
                label={t("retirement.desiredIncome")}
                value={desiredIncome}
                onChange={setDesiredIncome}
                currency={currency}
                locale={locale}
                min={0}
              />
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex w-full items-center justify-between px-6 py-4 text-start transition-colors hover:bg-muted/50"
              aria-expanded={showAdvanced}
            >
              <span className="text-sm font-medium text-foreground">
                {t("retirement.advancedTitle")}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  showAdvanced && "rotate-180"
                )}
              />
            </button>

            {showAdvanced && (
              <CardContent className="space-y-5 border-t border-border">
                <PercentInput
                  label={t("retirement.preRetirementReturn")}
                  value={preRetirementReturn}
                  onChange={setPreRetirementReturn}
                  locale={locale}
                  min={0}
                  max={15}
                  helperText={t("retirement.preRetirementReturnHelp")}
                />

                <PercentInput
                  label={t("retirement.postRetirementReturn")}
                  value={postRetirementReturn}
                  onChange={setPostRetirementReturn}
                  locale={locale}
                  min={0}
                  max={10}
                  helperText={t("retirement.postRetirementReturnHelp")}
                />

                <PercentInput
                  label={t("retirement.inflationRate")}
                  value={inflationRate}
                  onChange={setInflationRate}
                  locale={locale}
                  min={0}
                  max={10}
                />

                <div className="space-y-2">
                  <Label>{t("retirement.lifeExpectancy")}</Label>
                  <Input
                    type="number"
                    value={lifeExpectancy}
                    onChange={(e) =>
                      setLifeExpectancy(Math.max(retirementAge + 1, Number(e.target.value)))
                    }
                    min={retirementAge + 1}
                    max={110}
                  />
                </div>

                <CurrencyInput
                  label={t("retirement.socialSecurity")}
                  value={socialSecurity}
                  onChange={setSocialSecurity}
                  currency={currency}
                  locale={locale}
                  min={0}
                />

                <div className="space-y-2">
                  <Label>{t("retirement.socialSecurityAge")}</Label>
                  <Input
                    type="number"
                    value={ssStartAge}
                    onChange={(e) =>
                      setSSStartAge(Math.max(62, Math.min(70, Number(e.target.value))))
                    }
                    min={62}
                    max={70}
                  />
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Hero Result */}
          <Card
            className={cn(
              result.isSufficient
                ? "border-green-500/30 bg-green-500/5"
                : "border-red-500/30 bg-red-500/5"
            )}
          >
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  {t("retirement.resultTitle")}
                </h3>
                <span
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium",
                    badge.color
                  )}
                >
                  {badge.icon}
                  {badge.text}
                </span>
              </div>
              <div className="py-4 text-center">
                <p className="mb-2 text-2xl font-bold text-foreground">
                  {result.isSufficient
                    ? t("retirement.heroSufficient", {
                        years: result.yearsMoneyLasts,
                      })
                    : t("retirement.heroInsufficient", {
                        age: result.ageMoneyRunsOut ?? lifeExpectancy,
                      })}
                </p>
              </div>
            </CardContent>
          </Card>

          <ResultsPanel
            title={t("retirement.resultTitle")}
            currency={currency}
            locale={locale}
            columns={2}
            results={[
              {
                label: t("retirement.balanceAtRetirement"),
                value: result.balanceAtRetirement,
                type: "currency",
                highlight: true,
              },
              {
                label: t("retirement.monthlyWithdrawal"),
                value: result.monthlyWithdrawal,
                type: "currency",
              },
              {
                label: t("retirement.yearsMoneyLasts"),
                value: `${result.yearsMoneyLasts}`,
                type: "text",
              },
              {
                label:
                  result.shortfallOrSurplus >= 0
                    ? t("retirement.surplus")
                    : t("retirement.shortfall"),
                value: Math.abs(result.shortfallOrSurplus),
                type: "currency",
                variant: result.shortfallOrSurplus >= 0 ? "success" : "danger",
              },
            ]}
          />

          <TransparencyPanel
            assumptions={[
              {
                label: t("retirement.assumptionInflation"),
                value: formatPercent(inflationRate / 100, locale, 1),
              },
              {
                label: t("retirement.assumptionPreReturn"),
                value: formatPercent(preRetirementReturn / 100, locale, 1),
              },
              {
                label: t("retirement.assumptionPostReturn"),
                value: formatPercent(postRetirementReturn / 100, locale, 1),
              },
              {
                label: t("retirement.assumptionSS", { age: ssStartAge }),
                value: formatCurrency(socialSecurity, currency, locale),
              },
            ]}
            formula={t("retirement.formulaText")}
            formulaExplanation={t("retirement.formulaExplanation")}
          />
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("retirement.chartTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartSkeleton label={tc("loadingChart")} />}>
              <ResponsiveContainer width="100%" height={400}>
                <LazyAreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAccum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorWithdraw" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="age"
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
                    formatter={(value: number | undefined) => [
                      formatCurrency(value ?? 0, currency, locale),
                    ]}
                  />
                  <ReferenceLine
                    x={retirementAge}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="3 3"
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="accumulation"
                    stroke="#22c55e"
                    fill="url(#colorAccum)"
                    strokeWidth={2}
                    name={t("retirement.chartAccumulation")}
                    connectNulls={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="withdrawal"
                    stroke="#f59e0b"
                    fill="url(#colorWithdraw)"
                    strokeWidth={2}
                    name={t("retirement.chartWithdrawal")}
                    connectNulls={false}
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
