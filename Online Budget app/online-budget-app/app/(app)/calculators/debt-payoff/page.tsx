"use client";

/**
 * Debt Payoff Calculator Page
 *
 * Compare snowball vs avalanche debt repayment strategies.
 */

import { useState, useMemo, Suspense } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, CreditCard, Plus, Trash2, Award } from "lucide-react";
import { CurrencyInput, PercentInput } from "@/components/calculators";
import { calculateDebtPayoff, generateDebtId } from "@/engine/calculators";
import type { DebtAccount, DebtStrategy } from "@/engine/calculators";
import { formatCurrency } from "@/lib/format";
import type { SupportedLocale } from "@/i18n/config";
import { LOCALE_METADATA } from "@/i18n/config";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LazyBarChart,
  Bar,
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
      style={{ height: 200 }}
    >
      <span className="text-sm text-muted-foreground">Loading chart...</span>
    </div>
  );
}

export default function DebtPayoffCalculatorPage() {
  const t = useTranslations("calculators");
  const locale = useLocale() as SupportedLocale;
  const localeMeta = LOCALE_METADATA[locale] || LOCALE_METADATA["en-US"];
  const currency = localeMeta.currency;

  const [debts, setDebts] = useState<DebtAccount[]>([
    { id: generateDebtId(), name: "", balance: 0, apr: 0, minimumPayment: 0 },
  ]);
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState(100);
  const [selectedStrategy, setSelectedStrategy] = useState<DebtStrategy>("avalanche");

  const result = useMemo(() => {
    const validDebts = debts.filter((d) => d.balance > 0 && d.minimumPayment > 0);
    return calculateDebtPayoff({ debts: validDebts, extraMonthlyPayment });
  }, [debts, extraMonthlyPayment]);

  const addDebt = () => {
    setDebts([
      ...debts,
      { id: generateDebtId(), name: "", balance: 0, apr: 0, minimumPayment: 0 },
    ]);
  };

  const removeDebt = (id: string) => {
    if (debts.length > 1) {
      setDebts(debts.filter((d) => d.id !== id));
    }
  };

  const updateDebt = (id: string, field: keyof DebtAccount, value: string | number) => {
    setDebts(debts.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const hasDebts = debts.some((d) => d.balance > 0 && d.minimumPayment > 0);

  const chartData = useMemo(() => {
    if (!hasDebts) return [];
    return [
      {
        name: t("debtPayoff.totalInterest"),
        Snowball: result.snowball.totalInterest,
        Avalanche: result.avalanche.totalInterest,
      },
    ];
  }, [hasDebts, result, t]);

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
            <CreditCard className="h-8 w-8 text-primary" />
            {t("debtPayoff.title")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("debtPayoff.subtitle")}</p>
        </div>
      </div>

      {/* Debt List */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{t("debtPayoff.yourDebts")}</CardTitle>
          <button
            onClick={addDebt}
            className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-primary transition-colors hover:bg-primary/20"
          >
            <Plus className="h-4 w-4" />
            {t("debtPayoff.addDebt")}
          </button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {debts.map((debt, index) => (
              <div
                key={debt.id}
                className="grid grid-cols-1 gap-4 rounded-lg bg-muted/50 p-4 md:grid-cols-5"
              >
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    {t("debtPayoff.debtName")}
                  </label>
                  <input
                    type="text"
                    value={debt.name}
                    onChange={(e) => updateDebt(debt.id, "name", e.target.value)}
                    placeholder={t("debtPayoff.debtNamePlaceholder", { number: index + 1 })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    {t("debtPayoff.balance")}
                  </label>
                  <CurrencyInput
                    value={debt.balance}
                    onChange={(value) => updateDebt(debt.id, "balance", value)}
                    currency={currency}
                    locale={locale}
                    min={0}
                    inputClassName="text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    {t("debtPayoff.apr")}
                  </label>
                  <PercentInput
                    value={debt.apr}
                    onChange={(value) => updateDebt(debt.id, "apr", value)}
                    locale={locale}
                    min={0}
                    max={100}
                    inputClassName="text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    {t("debtPayoff.minimumPayment")}
                  </label>
                  <CurrencyInput
                    value={debt.minimumPayment}
                    onChange={(value) => updateDebt(debt.id, "minimumPayment", value)}
                    currency={currency}
                    locale={locale}
                    min={0}
                    inputClassName="text-sm"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => removeDebt(debt.id)}
                    disabled={debts.length === 1}
                    className="rounded-lg p-2 text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={t("debtPayoff.removeDebt")}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <CurrencyInput
              label={t("debtPayoff.extraMonthlyPayment")}
              value={extraMonthlyPayment}
              onChange={setExtraMonthlyPayment}
              currency={currency}
              locale={locale}
              min={0}
              helperText={t("debtPayoff.extraMonthlyPaymentHelp")}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Strategy Comparison */}
      {hasDebts && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Snowball */}
          <Card
            className={cn(
              "cursor-pointer transition-all",
              selectedStrategy === "snowball"
                ? "border-blue-500/50 bg-blue-500/5"
                : "hover:border-muted-foreground/30"
            )}
            onClick={() => setSelectedStrategy("snowball")}
          >
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  {t("debtPayoff.snowball")}
                </h3>
                {result.recommendedStrategy !== "snowball" && (
                  <span className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                    {t("debtPayoff.morePsychological")}
                  </span>
                )}
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                {t("debtPayoff.snowballDescription")}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("debtPayoff.totalInterest")}
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {formatCurrency(result.snowball.totalInterest, currency, locale)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("debtPayoff.payoffDate")}
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {result.snowball.totalMonths} {t("common.months")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avalanche */}
          <Card
            className={cn(
              "cursor-pointer transition-all",
              selectedStrategy === "avalanche"
                ? "border-green-500/50 bg-green-500/5"
                : "hover:border-muted-foreground/30"
            )}
            onClick={() => setSelectedStrategy("avalanche")}
          >
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  {t("debtPayoff.avalanche")}
                </h3>
                {result.recommendedStrategy === "avalanche" && (
                  <span className="flex items-center gap-1 rounded bg-green-500/10 px-2 py-1 text-xs text-green-600 dark:text-green-400">
                    <Award className="h-3 w-3" />
                    {t("debtPayoff.recommended")}
                  </span>
                )}
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                {t("debtPayoff.avalancheDescription")}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("debtPayoff.totalInterest")}
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {formatCurrency(result.avalanche.totalInterest, currency, locale)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("debtPayoff.payoffDate")}
                  </p>
                  <p className="text-xl font-bold text-foreground">
                    {result.avalanche.totalMonths} {t("common.months")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Savings Comparison */}
      {hasDebts && result.interestSaved > 0 && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="mb-2 flex items-center gap-3">
              <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold text-foreground">
                {t("debtPayoff.savingsTitle")}
              </h3>
            </div>
            <p className="text-foreground">
              {t("debtPayoff.savingsDescription", {
                amount: formatCurrency(result.interestSaved, currency, locale),
                months: Math.abs(result.monthsSaved),
              })}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Interest Comparison Chart */}
      {hasDebts && chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("debtPayoff.totalInterest")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartSkeleton />}>
              <ResponsiveContainer width="100%" height={200}>
                <LazyBarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(val: number) =>
                      formatCurrency(val, currency, locale).replace(/\.00$/, "")
                    }
                  />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number | undefined, name: string | undefined) => [
                      formatCurrency(value ?? 0, currency, locale),
                      name ?? "",
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="Snowball" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="Avalanche" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </LazyBarChart>
              </ResponsiveContainer>
            </Suspense>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
