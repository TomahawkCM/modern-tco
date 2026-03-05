"use client";

/**
 * Mortgage Calculator Page
 *
 * Two modes: Payment calculation and Affordability analysis.
 * Features full amortization schedule and chart.
 */

import { useState, useMemo, Suspense } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Home, DollarSign, Calculator, ChevronDown } from "lucide-react";
import {
  CurrencyInput,
  PercentInput,
  ResultsPanel,
  TransparencyPanel,
} from "@/components/calculators";
import { generateAmortizationSchedule, calculateAffordability } from "@/engine/calculators";
import { formatCurrency } from "@/lib/format";
import type { SupportedLocale } from "@/i18n/config";
import { usePrimaryCurrency } from "@/contexts/currency-context";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type MortgageMode = "payment" | "affordability";

export default function MortgageCalculatorPage() {
  const t = useTranslations("calculators");
  const tc = useTranslations("common");
  const locale = useLocale() as SupportedLocale;
  const currency = usePrimaryCurrency();

  const [mode, setMode] = useState<MortgageMode>("payment");

  // Payment mode state
  const [loanAmount, setLoanAmount] = useState(300000);
  const [annualRate, setAnnualRate] = useState(6.5);
  const [termYears, setTermYears] = useState<15 | 30>(30);
  const [downPayment, setDownPayment] = useState(60000);
  const [extraPayment, setExtraPayment] = useState(0);

  // Affordability mode state
  const [annualIncome, setAnnualIncome] = useState(100000);
  const [monthlyDebts, setMonthlyDebts] = useState(500);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);

  // Schedule visibility
  const [showFullSchedule, setShowFullSchedule] = useState(false);

  const paymentResult = useMemo(() => {
    const actualLoan = Math.max(0, loanAmount - downPayment);
    return generateAmortizationSchedule({
      principal: actualLoan,
      annualRate,
      termMonths: termYears * 12,
      extraPayment,
    });
  }, [loanAmount, annualRate, termYears, downPayment, extraPayment]);

  const affordabilityResult = useMemo(
    () =>
      calculateAffordability({
        annualIncome,
        monthlyDebts,
        downPaymentPercent,
        annualRate,
        termMonths: termYears * 12,
      }),
    [annualIncome, monthlyDebts, downPaymentPercent, annualRate, termYears]
  );

  const chartData = useMemo(() => {
    if (mode !== "payment") return [];
    return paymentResult.schedule
      .filter((_, i) => i % 12 === 0 || i === paymentResult.schedule.length - 1)
      .map((entry) => ({
        month: entry.month,
        principal: entry.cumulativePrincipal,
        interest: entry.cumulativeInterest,
        balance: entry.balance,
      }));
  }, [paymentResult, mode]);

  const visibleSchedule = showFullSchedule
    ? paymentResult.schedule
    : [
        ...paymentResult.schedule.slice(0, 12),
        ...(paymentResult.schedule.length > 12
          ? [paymentResult.schedule[paymentResult.schedule.length - 1]!]
          : []),
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
            <Home className="h-8 w-8 text-primary" />
            {t("mortgage.title")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("mortgage.subtitle")}</p>
        </div>
      </div>

      {/* Mode Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <button
              onClick={() => setMode("payment")}
              className={cn(
                "flex-1 rounded-lg px-4 py-3 font-medium transition-all",
                mode === "payment"
                  ? "border border-primary/50 bg-primary/10 text-primary"
                  : "border border-transparent bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Calculator className="mx-auto mb-2 h-5 w-5" />
              {t("mortgage.modePayment")}
            </button>
            <button
              onClick={() => setMode("affordability")}
              className={cn(
                "flex-1 rounded-lg px-4 py-3 font-medium transition-all",
                mode === "affordability"
                  ? "border border-primary/50 bg-primary/10 text-primary"
                  : "border border-transparent bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <DollarSign className="mx-auto mb-2 h-5 w-5" />
              {t("mortgage.modeAffordability")}
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t("mortgage.inputTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {mode === "payment" ? (
              <>
                <CurrencyInput
                  label={t("mortgage.loanAmount")}
                  value={loanAmount}
                  onChange={setLoanAmount}
                  currency={currency}
                  locale={locale}
                  min={0}
                />
                <CurrencyInput
                  label={t("mortgage.downPayment")}
                  value={downPayment}
                  onChange={setDownPayment}
                  currency={currency}
                  locale={locale}
                  min={0}
                />
              </>
            ) : (
              <>
                <CurrencyInput
                  label={t("mortgage.annualIncome")}
                  value={annualIncome}
                  onChange={setAnnualIncome}
                  currency={currency}
                  locale={locale}
                  min={0}
                />
                <CurrencyInput
                  label={t("mortgage.monthlyDebts")}
                  value={monthlyDebts}
                  onChange={setMonthlyDebts}
                  currency={currency}
                  locale={locale}
                  min={0}
                />
                <PercentInput
                  label={t("mortgage.downPaymentPercent")}
                  value={downPaymentPercent}
                  onChange={setDownPaymentPercent}
                  locale={locale}
                  min={0}
                  max={50}
                />
              </>
            )}

            <PercentInput
              label={t("mortgage.annualRate")}
              value={annualRate}
              onChange={setAnnualRate}
              locale={locale}
              min={0}
              max={20}
              helperText={t("mortgage.annualRateHelp")}
            />

            {/* Term Toggle */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                {t("mortgage.term")}
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setTermYears(15)}
                  className={cn(
                    "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                    termYears === 15
                      ? "border border-primary/50 bg-primary/10 text-primary"
                      : "border border-input bg-muted text-muted-foreground"
                  )}
                >
                  {t("mortgage.term15")}
                </button>
                <button
                  onClick={() => setTermYears(30)}
                  className={cn(
                    "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                    termYears === 30
                      ? "border border-primary/50 bg-primary/10 text-primary"
                      : "border border-input bg-muted text-muted-foreground"
                  )}
                >
                  {t("mortgage.term30")}
                </button>
              </div>
            </div>

            {mode === "payment" && (
              <CurrencyInput
                label={t("mortgage.extraPayment")}
                value={extraPayment}
                onChange={setExtraPayment}
                currency={currency}
                locale={locale}
                min={0}
              />
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {mode === "payment" ? (
            <ResultsPanel
              title={t("mortgage.resultTitle")}
              currency={currency}
              locale={locale}
              columns={2}
              results={[
                {
                  label: t("mortgage.monthlyPayment"),
                  value: paymentResult.monthlyPayment + extraPayment,
                  type: "currency",
                  highlight: true,
                },
                {
                  label: t("mortgage.totalCost"),
                  value: paymentResult.totalPaid + downPayment,
                  type: "currency",
                },
                {
                  label: t("mortgage.totalInterest"),
                  value: paymentResult.totalInterest,
                  type: "currency",
                  variant: "danger",
                },
                {
                  label: t("mortgage.payoffMonths"),
                  value: paymentResult.payoffMonths,
                  type: "months",
                },
              ]}
            />
          ) : (
            <ResultsPanel
              title={t("mortgage.affordabilityTitle")}
              currency={currency}
              locale={locale}
              columns={2}
              results={[
                {
                  label: t("mortgage.maxHomePrice"),
                  value: affordabilityResult.maxHomePrice,
                  type: "currency",
                  highlight: true,
                },
                {
                  label: t("mortgage.maxLoanAmount"),
                  value: affordabilityResult.maxLoanAmount,
                  type: "currency",
                },
                {
                  label: t("mortgage.downPaymentAmount"),
                  value: affordabilityResult.downPayment,
                  type: "currency",
                },
                {
                  label: t("mortgage.dtiRatio"),
                  value: affordabilityResult.dtiRatio,
                  type: "percent",
                  variant:
                    affordabilityResult.dtiRatio > 36
                      ? "danger"
                      : affordabilityResult.dtiRatio > 28
                        ? "warning"
                        : "success",
                },
              ]}
            />
          )}

          <TransparencyPanel
            assumptions={[
              {
                label: t("mortgage.assumptionFixedRate"),
                value: t("mortgage.assumptionFixedRate"),
              },
              {
                label: t("mortgage.assumptionNoEscrow"),
                value: t("mortgage.assumptionNoEscrow"),
              },
            ]}
            formula={t("mortgage.formulaText")}
            formulaExplanation={t("mortgage.formulaExplanation")}
          />
        </div>
      </div>

      {/* Chart (payment mode only) */}
      {mode === "payment" && chartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("mortgage.scheduleTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartSkeleton label={tc("loadingChart")} />}>
              <ResponsiveContainer width="100%" height={350}>
                <LazyAreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(val: number) => `${Math.floor(val / 12)}y`}
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
                    dataKey="balance"
                    stroke="#f59e0b"
                    fill="url(#colorBalance)"
                    name={t("mortgage.scheduleBalance")}
                  />
                </LazyAreaChart>
              </ResponsiveContainer>
            </Suspense>
          </CardContent>
        </Card>
      )}

      {/* Amortization Schedule Table (payment mode only) */}
      {mode === "payment" && paymentResult.schedule.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("mortgage.scheduleTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="px-3 py-2 text-start">{t("mortgage.scheduleMonth")}</th>
                    <th className="px-3 py-2 text-end">{t("mortgage.schedulePayment")}</th>
                    <th className="px-3 py-2 text-end">{t("mortgage.schedulePrincipal")}</th>
                    <th className="px-3 py-2 text-end">{t("mortgage.scheduleInterest")}</th>
                    <th className="px-3 py-2 text-end">{t("mortgage.scheduleBalance")}</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSchedule.map((entry, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-border/50 text-foreground last:border-0"
                    >
                      <td className="px-3 py-2">{entry.month}</td>
                      <td className="px-3 py-2 text-end">
                        {formatCurrency(entry.payment, currency, locale)}
                      </td>
                      <td className="px-3 py-2 text-end">
                        {formatCurrency(entry.principal + entry.extraPayment, currency, locale)}
                      </td>
                      <td className="px-3 py-2 text-end">
                        {formatCurrency(entry.interest, currency, locale)}
                      </td>
                      <td className="px-3 py-2 text-end">
                        {formatCurrency(entry.balance, currency, locale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {paymentResult.schedule.length > 12 && (
              <button
                onClick={() => setShowFullSchedule(!showFullSchedule)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-input py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
              >
                {showFullSchedule ? t("mortgage.hideFullSchedule") : t("mortgage.showFullSchedule")}
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform", showFullSchedule && "rotate-180")}
                />
              </button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
