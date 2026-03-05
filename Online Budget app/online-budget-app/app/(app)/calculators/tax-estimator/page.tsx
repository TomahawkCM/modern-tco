"use client";

/**
 * Tax Estimator Calculator Page
 *
 * Estimate federal income tax with progressive bracket modeling.
 */

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, FileText, Sparkles } from "lucide-react";
import { CurrencyInput, ResultsPanel, TransparencyPanel } from "@/components/calculators";
import { calculateTaxEstimate } from "@/engine/calculators";
import type { FilingStatus } from "@/engine/calculators";
import { formatCurrency } from "@/lib/format";
import type { SupportedLocale } from "@/i18n/config";
import { usePrimaryCurrency } from "@/contexts/currency-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const FILING_STATUSES: { value: FilingStatus; labelKey: string }[] = [
  { value: "single", labelKey: "filingStatusSingle" },
  { value: "married_jointly", labelKey: "filingStatusMarriedJointly" },
  { value: "married_separately", labelKey: "filingStatusMarriedSeparately" },
  { value: "head_of_household", labelKey: "filingStatusHeadOfHousehold" },
];

export default function TaxEstimatorPage() {
  const t = useTranslations("calculators");
  const locale = useLocale() as SupportedLocale;
  const currency = usePrimaryCurrency();

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
          href="/calculators"
          className="mt-1 rounded-lg p-2 transition-colors hover:bg-muted"
          aria-label={t("common.back")}
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
            <FileText className="h-8 w-8 text-primary" />
            {t("taxEstimator.title")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("taxEstimator.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t("taxEstimator.inputTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <CurrencyInput
              label={t("taxEstimator.grossIncome")}
              value={grossIncome}
              onChange={setGrossIncome}
              currency={currency}
              locale={locale}
              min={0}
            />

            <div className="space-y-2">
              <Label>{t("taxEstimator.filingStatus")}</Label>
              <select
                value={filingStatus}
                onChange={(e) => setFilingStatus(e.target.value as FilingStatus)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
                className="h-4 w-4 rounded border-input bg-transparent text-primary focus:ring-primary"
              />
              <label htmlFor="useItemized" className="text-sm text-foreground">
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
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {/* Hero Result */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="mb-4 flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  {t("taxEstimator.resultTitle")}
                </h3>
              </div>
              <div className="py-4 text-center">
                <p className="mb-2 text-3xl font-bold text-foreground">
                  {formatCurrency(result.takeHomePay, currency, locale)}
                </p>
                <p className="text-muted-foreground">
                  {t("taxEstimator.totalTax")}:{" "}
                  <span className="font-medium text-destructive">
                    {formatCurrency(result.totalTax, currency, locale)}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

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
            <Card>
              <CardHeader>
                <CardTitle>{t("taxEstimator.bracketBreakdown")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.bracketBreakdown.map((bracket) => (
                  <div
                    key={bracket.rate}
                    className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3"
                  >
                    <div>
                      <span className="font-medium text-foreground">
                        {t("taxEstimator.bracketRate", { rate: bracket.rate })}
                      </span>
                      <span className="ml-3 text-sm text-muted-foreground">
                        {formatCurrency(bracket.taxableInBracket, currency, locale)}
                      </span>
                    </div>
                    <span className="font-medium text-destructive">
                      {formatCurrency(bracket.taxInBracket, currency, locale)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
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
