"use client";

/**
 * Debt Payoff Calculator Page
 *
 * Compare snowball vs avalanche debt repayment strategies
 */

import { useState, useMemo, lazy, Suspense } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, TrendingDown, Plus, Trash2, Award, Calendar } from "lucide-react";
import { CurrencyInput, PercentInput, ResultsPanel } from "@/components/budget/calculators";
import { calculateDebtPayoff, generateDebtId } from "@/lib/calculators/debt-payoff";
import { formatCurrency } from "@/i18n/utils/formatCurrency";
import type { SupportedLocale } from "@/i18n/config";
import type { DebtAccount, DebtStrategy } from "@/lib/calculators/types";
import { LOCALE_METADATA } from "@/i18n/config";
import { cn } from "@/lib/utils";

const DebtComparisonChart = lazy(() =>
  import("recharts").then((mod) => {
    const Chart = ({
      snowballInterest,
      avalancheInterest,
      snowballMonths,
      avalancheMonths,
      locale,
      currency,
    }: {
      snowballInterest: number;
      avalancheInterest: number;
      snowballMonths: number;
      avalancheMonths: number;
      locale: SupportedLocale;
      currency: string;
    }) => {
      const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } =
        mod;
      const data = [
        { name: "Total Interest", Snowball: snowballInterest, Avalanche: avalancheInterest },
      ];
      return (
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                type="number"
                stroke="#64748b"
                tick={{ fontSize: 12 }}
                tickFormatter={(val: number) =>
                  formatCurrency(val, currency, locale).replace(/\.00$/, "")
                }
              />
              <YAxis type="category" dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #475569",
                  borderRadius: "8px",
                }}
                formatter={(value: number, name: string) => [
                  formatCurrency(value, currency, locale),
                  name,
                ]}
              />
              <Legend />
              <Bar dataKey="Snowball" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              <Bar dataKey="Avalanche" fill="#22c55e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    };
    return { default: Chart };
  })
);

const DebtBalanceChart = lazy(() =>
  import("recharts").then((mod) => {
    const Chart = ({
      snowballSchedule,
      avalancheSchedule,
      locale,
      currency,
    }: {
      snowballSchedule: { month: number; totalRemaining: number }[];
      avalancheSchedule: { month: number; totalRemaining: number }[];
      locale: SupportedLocale;
      currency: string;
    }) => {
      const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } =
        mod;

      // Combine into one dataset
      const maxMonths = Math.max(snowballSchedule.length, avalancheSchedule.length);
      const data = [];
      for (let i = 0; i < maxMonths; i++) {
        data.push({
          month: i + 1,
          snowball: snowballSchedule[i]?.totalRemaining ?? 0,
          avalanche: avalancheSchedule[i]?.totalRemaining ?? 0,
        });
      }

      // Sample at intervals for large datasets
      const sampled =
        data.length > 60 ? data.filter((_, i) => i % 3 === 0 || i === data.length - 1) : data;

      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sampled}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 12 }} />
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
              labelFormatter={(label: number) => `Month ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="snowball"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Snowball"
            />
            <Line
              type="monotone"
              dataKey="avalanche"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              name="Avalanche"
            />
          </LineChart>
        </ResponsiveContainer>
      );
    };
    return { default: Chart };
  })
);

export default function DebtPayoffCalculatorPage() {
  const t = useTranslations("calculators");
  const locale = useLocale() as SupportedLocale;
  const localeMeta = LOCALE_METADATA[locale] || LOCALE_METADATA["en-US"];
  const currency = localeMeta.currency as string;

  // Debts state
  const [debts, setDebts] = useState<DebtAccount[]>([
    { id: generateDebtId(), name: "", balance: 0, apr: 0, minimumPayment: 0 },
  ]);

  // Extra payment state
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState(100);

  // Selected strategy for details view
  const [selectedStrategy, setSelectedStrategy] = useState<DebtStrategy>("avalanche");

  // Calculate results
  const result = useMemo(() => {
    const validDebts = debts.filter((d) => d.balance > 0 && d.minimumPayment > 0);
    return calculateDebtPayoff({
      debts: validDebts,
      extraMonthlyPayment,
    });
  }, [debts, extraMonthlyPayment]);

  // Add a new debt
  const addDebt = () => {
    setDebts([...debts, { id: generateDebtId(), name: "", balance: 0, apr: 0, minimumPayment: 0 }]);
  };

  // Remove a debt
  const removeDebt = (id: string) => {
    if (debts.length > 1) {
      setDebts(debts.filter((d) => d.id !== id));
    }
  };

  // Update a debt field
  const updateDebt = (id: string, field: keyof DebtAccount, value: string | number) => {
    setDebts(debts.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const hasDebts = debts.some((d) => d.balance > 0 && d.minimumPayment > 0);

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
            <TrendingDown className="h-8 w-8 text-orange-400" />
            {t("debtPayoff.title")}
          </h1>
          <p className="mt-2 text-slate-400">{t("debtPayoff.subtitle")}</p>
        </div>
      </div>

      {/* Debt List */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{t("debtPayoff.yourDebts")}</h2>
          <button
            onClick={addDebt}
            className="flex items-center gap-2 rounded-lg bg-orange-500/20 px-4 py-2 text-orange-400 transition-colors hover:bg-orange-500/30"
          >
            <Plus className="h-4 w-4" />
            {t("debtPayoff.addDebt")}
          </button>
        </div>

        <div className="space-y-4">
          {debts.map((debt, index) => (
            <div
              key={debt.id}
              className="grid grid-cols-1 gap-4 rounded-lg bg-slate-700/30 p-4 md:grid-cols-5"
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">
                  {t("debtPayoff.debtName")}
                </label>
                <input
                  type="text"
                  value={debt.name}
                  onChange={(e) => updateDebt(debt.id, "name", e.target.value)}
                  placeholder={t("debtPayoff.debtNamePlaceholder", { number: index + 1 })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">
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
                <label className="mb-1 block text-xs font-medium text-slate-400">
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
                <label className="mb-1 block text-xs font-medium text-slate-400">
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
                  className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={t("debtPayoff.removeDebt")}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Extra Payment */}
        <div className="mt-6 border-t border-slate-700 pt-6">
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
      </div>

      {/* Strategy Comparison */}
      {hasDebts && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Snowball */}
          <div
            className={cn(
              "cursor-pointer rounded-xl border p-6 transition-all",
              selectedStrategy === "snowball"
                ? "border-blue-500/50 bg-blue-500/10"
                : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
            )}
            onClick={() => setSelectedStrategy("snowball")}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{t("debtPayoff.snowball")}</h3>
              {result.recommendedStrategy !== "snowball" && (
                <span className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-400">
                  {t("debtPayoff.morePsychological")}
                </span>
              )}
            </div>
            <p className="mb-4 text-sm text-slate-400">{t("debtPayoff.snowballDescription")}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">{t("debtPayoff.totalInterest")}</p>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(result.snowball.totalInterest, currency, locale)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t("debtPayoff.payoffDate")}</p>
                <p className="text-xl font-bold text-white">
                  {result.snowball.totalMonths} {t("common.months")}
                </p>
              </div>
            </div>
          </div>

          {/* Avalanche */}
          <div
            className={cn(
              "cursor-pointer rounded-xl border p-6 transition-all",
              selectedStrategy === "avalanche"
                ? "border-green-500/50 bg-green-500/10"
                : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
            )}
            onClick={() => setSelectedStrategy("avalanche")}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{t("debtPayoff.avalanche")}</h3>
              {result.recommendedStrategy === "avalanche" && (
                <span className="flex items-center gap-1 rounded bg-green-500/20 px-2 py-1 text-xs text-green-400">
                  <Award className="h-3 w-3" />
                  {t("debtPayoff.recommended")}
                </span>
              )}
            </div>
            <p className="mb-4 text-sm text-slate-400">{t("debtPayoff.avalancheDescription")}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">{t("debtPayoff.totalInterest")}</p>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(result.avalanche.totalInterest, currency, locale)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t("debtPayoff.payoffDate")}</p>
                <p className="text-xl font-bold text-white">
                  {result.avalanche.totalMonths} {t("common.months")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Savings Comparison */}
      {hasDebts && result.interestSaved > 0 && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6">
          <div className="mb-2 flex items-center gap-3">
            <Award className="h-6 w-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">{t("debtPayoff.savingsTitle")}</h3>
          </div>
          <p className="text-slate-300">
            {t("debtPayoff.savingsDescription", {
              amount: formatCurrency(result.interestSaved, currency, locale),
              months: Math.abs(result.monthsSaved),
            })}
          </p>
        </div>
      )}

      {/* Strategy Comparison Charts */}
      {hasDebts && result.snowball.schedule.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              {t("debtPayoff.totalInterest")}
            </h3>
            <Suspense
              fallback={
                <div className="flex h-[200px] animate-pulse items-center justify-center rounded-lg bg-slate-800">
                  <span className="text-sm text-slate-500">Loading chart...</span>
                </div>
              }
            >
              <DebtComparisonChart
                snowballInterest={result.snowball.totalInterest}
                avalancheInterest={result.avalanche.totalInterest}
                snowballMonths={result.snowball.totalMonths}
                avalancheMonths={result.avalanche.totalMonths}
                locale={locale}
                currency={currency}
              />
            </Suspense>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">{t("debtPayoff.remaining")}</h3>
            <Suspense
              fallback={
                <div className="flex h-[300px] animate-pulse items-center justify-center rounded-lg bg-slate-800">
                  <span className="text-sm text-slate-500">Loading chart...</span>
                </div>
              }
            >
              <DebtBalanceChart
                snowballSchedule={result.snowball.schedule}
                avalancheSchedule={result.avalanche.schedule}
                locale={locale}
                currency={currency}
              />
            </Suspense>
          </div>
        </div>
      )}

      {/* Payment Schedule */}
      {hasDebts && (
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
            <Calendar className="h-5 w-5 text-slate-400" />
            {t("debtPayoff.paymentSchedule")} (
            {selectedStrategy === "snowball" ? t("debtPayoff.snowball") : t("debtPayoff.avalanche")}
            )
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-2 py-3 text-left font-medium text-slate-400">
                    {t("debtPayoff.month")}
                  </th>
                  <th className="px-2 py-3 text-right font-medium text-slate-400">
                    {t("debtPayoff.payment")}
                  </th>
                  <th className="px-2 py-3 text-right font-medium text-slate-400">
                    {t("debtPayoff.remaining")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(selectedStrategy === "snowball"
                  ? result.snowball.schedule
                  : result.avalanche.schedule
                )
                  .filter((_, i, arr) => i < 12 || i === arr.length - 1)
                  .map((month, idx) => (
                    <tr key={idx} className="border-b border-slate-700/50 last:border-0">
                      <td className="px-2 py-3 text-slate-300">
                        {new Intl.DateTimeFormat(locale, {
                          year: "numeric",
                          month: "short",
                        }).format(month.date)}
                      </td>
                      <td className="px-2 py-3 text-right text-white">
                        {formatCurrency(month.totalPayment, currency, locale)}
                      </td>
                      <td className="px-2 py-3 text-right text-slate-300">
                        {formatCurrency(month.totalRemaining, currency, locale)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
