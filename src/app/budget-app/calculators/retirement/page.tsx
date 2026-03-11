"use client";

/**
 * Retirement Planner Page
 *
 * Flagship calculator with progressive disclosure.
 * Two-phase projection: accumulation + withdrawal.
 */

import { useState, useMemo, lazy, Suspense } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  ArrowLeft,
  Landmark,
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
} from "@/components/budget/calculators";
import { calculateRetirement } from "@/lib/financial-engine";
import { DEFAULT_ASSUMPTIONS } from "@/lib/financial-engine";
import { formatCurrency } from "@/i18n/utils/formatCurrency";
import { formatPercent } from "@/i18n/utils/formatNumber";
import type { SupportedLocale } from "@/i18n/config";
import { LOCALE_METADATA } from "@/i18n/config";
import { cn } from "@/lib/utils";

const RetirementChart = lazy(() =>
  import("recharts").then((mod) => {
    const Chart = ({
      data,
      retirementAge,
      locale,
      currency,
      accumLabel,
      withdrawLabel,
      ageLabel,
      ageFormatter,
      retirementLabel,
    }: {
      data: { age: number; balance: number; phase: string }[];
      retirementAge: number;
      locale: SupportedLocale;
      currency: string;
      accumLabel: string;
      withdrawLabel: string;
      ageLabel: string;
      ageFormatter: (label: number) => string;
      retirementLabel: string;
    }) => {
      const {
        AreaChart,
        Area,
        XAxis,
        YAxis,
        CartesianGrid,
        Tooltip,
        ReferenceLine,
        Legend,
        ResponsiveContainer,
      } = mod;

      const chartData = data.map((d) => ({
        age: d.age,
        accumulation: d.phase === "accumulation" ? d.balance : undefined,
        withdrawal: d.phase === "withdrawal" ? d.balance : undefined,
        balance: d.balance,
      }));

      return (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
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
              formatter={(value: number) => [formatCurrency(value, currency, locale)]}
              labelFormatter={(label: number) => ageFormatter(label)}
            />
            <ReferenceLine
              x={retirementAge}
              stroke="#64748b"
              strokeDasharray="3 3"
              label={{ value: retirementLabel, fill: "#94a3b8", position: "top", fontSize: 12 }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="accumulation"
              stroke="#22c55e"
              fill="url(#colorAccum)"
              strokeWidth={2}
              name={accumLabel}
              connectNulls={false}
            />
            <Area
              type="monotone"
              dataKey="withdrawal"
              stroke="#f59e0b"
              fill="url(#colorWithdraw)"
              strokeWidth={2}
              name={withdrawLabel}
              connectNulls={false}
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

export default function RetirementPlannerPage() {
  const t = useTranslations("calculators");
  const locale = useLocale() as SupportedLocale;
  const localeMeta = LOCALE_METADATA[locale] || LOCALE_METADATA["en-US"];
  const currency = localeMeta.currency as string;

  // Simple inputs (always visible)
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(65);
  const [currentSavings, setCurrentSavings] = useState(50000);
  const [monthlyContribution, setMonthlyContribution] = useState(1000);
  const [desiredIncome, setDesiredIncome] = useState(5000);

  // Advanced inputs (collapsed)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [preRetirementReturn, setPreRetirementReturn] = useState(
    DEFAULT_ASSUMPTIONS.preRetirementReturn
  );
  const [postRetirementReturn, setPostRetirementReturn] = useState(
    DEFAULT_ASSUMPTIONS.postRetirementReturn
  );
  const [inflationRate, setInflationRate] = useState(DEFAULT_ASSUMPTIONS.inflationRate);
  const [lifeExpectancy, setLifeExpectancy] = useState(DEFAULT_ASSUMPTIONS.lifeExpectancy);
  const [socialSecurity, setSocialSecurity] = useState(DEFAULT_ASSUMPTIONS.socialSecurityMonthly);
  const [ssStartAge, setSSStartAge] = useState(DEFAULT_ASSUMPTIONS.socialSecurityAge);

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
        balance: p.balance,
        phase: p.phase,
      })),
    [result.timeline]
  );

  const getBadge = () => {
    if (result.isSufficient && result.yearsMoneyLasts >= lifeExpectancy - retirementAge) {
      return {
        text: t("retirement.heroSufficientBadge"),
        color: "bg-green-500/20 text-green-400 border-green-500/50",
        icon: <CheckCircle2 className="h-5 w-5" />,
      };
    }
    if (result.isSufficient) {
      return {
        text: t("retirement.heroNeutralBadge"),
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
        icon: <AlertTriangle className="h-5 w-5" />,
      };
    }
    return {
      text: t("retirement.heroInsufficientBadge"),
      color: "bg-red-500/20 text-red-400 border-red-500/50",
      icon: <XCircle className="h-5 w-5" />,
    };
  };

  const badge = getBadge();

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
            <Landmark className="h-8 w-8 text-teal-400" />
            {t("retirement.title")}
          </h1>
          <p className="mt-2 text-slate-400">{t("retirement.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">{t("retirement.inputTitle")}</h2>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    {t("retirement.currentAge")}
                  </label>
                  <input
                    type="number"
                    value={currentAge}
                    onChange={(e) =>
                      setCurrentAge(Math.max(18, Math.min(80, Number(e.target.value))))
                    }
                    min={18}
                    max={80}
                    className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">
                    {t("retirement.retirementAge")}
                  </label>
                  <input
                    type="number"
                    value={retirementAge}
                    onChange={(e) =>
                      setRetirementAge(
                        Math.max(currentAge + 1, Math.min(80, Number(e.target.value)))
                      )
                    }
                    min={currentAge + 1}
                    max={80}
                    className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
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
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex w-full items-center justify-between p-4 text-start transition-colors hover:bg-slate-700/30"
              aria-expanded={showAdvanced}
            >
              <span className="text-sm font-medium text-slate-300">
                {t("retirement.advancedTitle")}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-slate-400 transition-transform",
                  showAdvanced && "rotate-180"
                )}
              />
            </button>

            {showAdvanced && (
              <div className="space-y-5 border-t border-slate-700 p-6">
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
                  <label className="block text-sm font-medium text-slate-300">
                    {t("retirement.lifeExpectancy")}
                  </label>
                  <input
                    type="number"
                    value={lifeExpectancy}
                    onChange={(e) =>
                      setLifeExpectancy(Math.max(retirementAge + 1, Number(e.target.value)))
                    }
                    min={retirementAge + 1}
                    max={110}
                    className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                  <label className="block text-sm font-medium text-slate-300">
                    {t("retirement.socialSecurityAge")}
                  </label>
                  <input
                    type="number"
                    value={ssStartAge}
                    onChange={(e) =>
                      setSSStartAge(Math.max(62, Math.min(70, Number(e.target.value))))
                    }
                    min={62}
                    max={70}
                    className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Hero Result */}
          <div
            className={cn(
              "rounded-xl border p-6",
              result.isSufficient
                ? "border-green-500/30 bg-green-500/10"
                : "border-red-500/30 bg-red-500/10"
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Landmark className="h-6 w-6 text-teal-400" />
                <h3 className="text-lg font-semibold text-white">{t("retirement.resultTitle")}</h3>
              </div>
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
              <p className="mb-2 text-2xl font-bold text-white">
                {result.isSufficient
                  ? t("retirement.heroSufficient", {
                      years: result.yearsMoneyLasts,
                    })
                  : t("retirement.heroInsufficient", {
                      age: result.ageMoneyRunsOut ?? lifeExpectancy,
                    })}
              </p>
            </div>
          </div>

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
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">{t("retirement.chartTitle")}</h3>
          <Suspense fallback={<ChartSkeleton />}>
            <RetirementChart
              data={chartData}
              retirementAge={retirementAge}
              locale={locale}
              currency={currency}
              accumLabel={t("retirement.chartAccumulation")}
              withdrawLabel={t("retirement.chartWithdrawal")}
              ageLabel={t("chart.ageLabel")}
              ageFormatter={(label: number) => t("chart.age", { n: label })}
              retirementLabel={t("chart.retirement")}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
