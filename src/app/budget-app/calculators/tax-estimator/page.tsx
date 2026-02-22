"use client";

/**
 * Tax Estimator Calculator Page
 *
 * Estimate federal income tax with progressive bracket modeling.
 * Shows bracket-by-bracket breakdown and effective vs. marginal rates.
 */

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Receipt, Sparkles } from "lucide-react";
import { CurrencyInput, ResultsPanel, TransparencyPanel } from "@/components/budget/calculators";
import { calculateTaxEstimate } from "@/lib/financial-engine";
import type { FilingStatus } from "@/lib/financial-engine";
import { formatCurrency } from "@/i18n/utils/formatCurrency";
import type { SupportedLocale } from "@/i18n/config";
import { LOCALE_METADATA } from "@/i18n/config";

const FILING_STATUSES: { value: FilingStatus; labelKey: string }[] = [
  { value: "single", labelKey: "filingStatusSingle" },
  { value: "married_jointly", labelKey: "filingStatusMarriedJointly" },
  { value: "married_separately", labelKey: "filingStatusMarriedSeparately" },
  { value: "head_of_household", labelKey: "filingStatusHeadOfHousehold" },
];

export default function TaxEstimatorPage() {
  const t = useTranslations("calculators");
  const locale = useLocale() as SupportedLocale;
  const localeMeta = LOCALE_METADATA[locale] || LOCALE_METADATA["en-US"];
  const currency = localeMeta.currency as string;

  const [grossIncome, setGrossIncome] = useState(85000);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>("single");
  const [retirementContributions, setRetirementContributions] = useState(0);
  const [otherDeductions, setOtherDeductions] = useState(0);
  const [useItemized, setUseItemized] = useState(false);
  const [itemizedDeductions, setItemizedDeductions] = useState(0);

  const result = useMemo(
    () =>
      calculateTaxEstimate({
        grossIncome,
        filingStatus,
        retirementContributions,
        otherDeductions,
        useItemized,
        itemizedDeductions,
      }),
    [
      grossIncome,
      filingStatus,
      retirementContributions,
      otherDeductions,
      useItemized,
      itemizedDeductions,
    ]
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
            <Receipt className="h-8 w-8 text-emerald-400" />
            {t("taxEstimator.title")}
          </h1>
          <p className="mt-2 text-slate-400">{t("taxEstimator.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <div className="space-y-6 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h2 className="text-lg font-semibold text-white">{t("taxEstimator.inputTitle")}</h2>

          <div className="space-y-5">
            <CurrencyInput
              label={t("taxEstimator.grossIncome")}
              value={grossIncome}
              onChange={setGrossIncome}
              currency={currency}
              locale={locale}
              min={0}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                {t("taxEstimator.filingStatus")}
              </label>
              <select
                value={filingStatus}
                onChange={(e) => setFilingStatus(e.target.value as FilingStatus)}
                className="w-full rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {FILING_STATUSES.map((fs) => (
                  <option key={fs.value} value={fs.value}>
                    {t(`taxEstimator.${fs.labelKey}`)}
                  </option>
                ))}
              </select>
            </div>

            <CurrencyInput
              label={t("taxEstimator.retirementContributions")}
              value={retirementContributions}
              onChange={setRetirementContributions}
              currency={currency}
              locale={locale}
              min={0}
            />

            <CurrencyInput
              label={t("taxEstimator.otherDeductions")}
              value={otherDeductions}
              onChange={setOtherDeductions}
              currency={currency}
              locale={locale}
              min={0}
            />

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="useItemized"
                checked={useItemized}
                onChange={(e) => setUseItemized(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
              />
              <label htmlFor="useItemized" className="text-sm text-slate-300">
                {t("taxEstimator.useItemized")}
              </label>
            </div>

            {useItemized && (
              <CurrencyInput
                label={t("taxEstimator.itemizedDeductions")}
                value={itemizedDeductions}
                onChange={setItemizedDeductions}
                currency={currency}
                locale={locale}
                min={0}
              />
            )}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Hero Result */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6">
            <div className="mb-4 flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">{t("taxEstimator.resultTitle")}</h3>
            </div>
            <div className="py-4 text-center">
              <p className="mb-2 text-3xl font-bold text-white">
                {formatCurrency(result.takeHomePay, currency, locale)}
              </p>
              <p className="text-slate-400">
                {t("taxEstimator.totalTax")}:{" "}
                <span className="font-medium text-red-400">
                  {formatCurrency(result.totalTax, currency, locale)}
                </span>
              </p>
            </div>
          </div>

          <ResultsPanel
            title={t("taxEstimator.resultTitle")}
            currency={currency}
            locale={locale}
            columns={2}
            results={[
              {
                label: t("taxEstimator.takeHome"),
                value: result.takeHomePay,
                type: "currency",
                highlight: true,
              },
              {
                label: t("taxEstimator.monthlyTakeHome"),
                value: result.monthlyTakeHome,
                type: "currency",
              },
              {
                label: t("taxEstimator.totalTax"),
                value: result.totalTax,
                type: "currency",
                variant: "danger",
              },
              {
                label: t("taxEstimator.effectiveRate"),
                value: result.effectiveTaxRate,
                type: "percent",
              },
              {
                label: t("taxEstimator.marginalRate"),
                value: result.marginalTaxRate,
                type: "percent",
              },
              {
                label: t("taxEstimator.taxableIncome"),
                value: result.taxableIncome,
                type: "currency",
              },
              {
                label: t("taxEstimator.agi"),
                value: result.adjustedGrossIncome,
                type: "currency",
              },
              {
                label: t("taxEstimator.deduction", { type: result.deductionType }),
                value: result.deductionAmount,
                type: "currency",
              },
            ]}
          />

          {/* Bracket Breakdown */}
          {result.bracketBreakdown.length > 0 && (
            <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                {t("taxEstimator.bracketBreakdown")}
              </h3>
              <div className="space-y-3">
                {result.bracketBreakdown.map((bracket) => (
                  <div
                    key={bracket.rate}
                    className="flex items-center justify-between rounded-lg bg-slate-700/50 px-4 py-3"
                  >
                    <div>
                      <span className="font-medium text-white">
                        {t("taxEstimator.bracketRate", { rate: bracket.rate })}
                      </span>
                      <span className="ml-3 text-sm text-slate-400">
                        {formatCurrency(bracket.taxableInBracket, currency, locale)}
                      </span>
                    </div>
                    <span className="font-medium text-red-400">
                      {formatCurrency(bracket.taxInBracket, currency, locale)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <TransparencyPanel
            assumptions={[
              { label: t("taxEstimator.assumptionBrackets"), value: "2024" },
              { label: t("taxEstimator.assumptionDeduction"), value: result.deductionType },
              { label: t("taxEstimator.assumptionScope"), value: "Federal only" },
            ]}
            formula={t("taxEstimator.formulaText")}
            formulaExplanation={t("taxEstimator.formulaExplanation")}
          />
        </div>
      </div>
    </div>
  );
}
