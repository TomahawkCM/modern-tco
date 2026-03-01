"use client";

/**
 * Subscription Cost Calculator Page
 *
 * Analyze subscription costs with category breakdowns.
 */

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft, Repeat, Plus, Trash2, PieChart } from "lucide-react";
import { CurrencyInput } from "@/components/calculators";
import {
  calculateSubscriptionCost,
  generateSubscriptionId,
  SUBSCRIPTION_CATEGORIES,
} from "@/engine/calculators";
import type { SubscriptionEntry, SubscriptionFrequency } from "@/engine/calculators";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { SupportedLocale } from "@/i18n/config";
import { LOCALE_METADATA } from "@/i18n/config";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FREQUENCIES: SubscriptionFrequency[] = [
  "weekly",
  "biweekly",
  "monthly",
  "quarterly",
  "annual",
];

export default function SubscriptionCostCalculatorPage() {
  const t = useTranslations("calculators");
  const locale = useLocale() as SupportedLocale;
  const localeMeta = LOCALE_METADATA[locale] || LOCALE_METADATA["en-US"];
  const currency = localeMeta.currency;

  const [subscriptions, setSubscriptions] = useState<SubscriptionEntry[]>([
    {
      id: generateSubscriptionId(),
      name: "",
      amount: 0,
      frequency: "monthly",
      category: "Other",
      isEssential: false,
    },
  ]);

  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [showIncomeField, setShowIncomeField] = useState(false);

  const result = useMemo(() => {
    const validSubs = subscriptions.filter((s) => s.amount > 0 && s.name.trim());
    return calculateSubscriptionCost({
      subscriptions: validSubs,
      monthlyIncome: showIncomeField && monthlyIncome > 0 ? monthlyIncome : undefined,
    });
  }, [subscriptions, monthlyIncome, showIncomeField]);

  const addSubscription = () => {
    setSubscriptions([
      ...subscriptions,
      {
        id: generateSubscriptionId(),
        name: "",
        amount: 0,
        frequency: "monthly",
        category: "Other",
        isEssential: false,
      },
    ]);
  };

  const removeSubscription = (id: string) => {
    if (subscriptions.length > 1) {
      setSubscriptions(subscriptions.filter((s) => s.id !== id));
    }
  };

  const updateSubscription = (
    id: string,
    field: keyof SubscriptionEntry,
    value: string | number | boolean
  ) => {
    setSubscriptions(
      subscriptions.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const hasSubscriptions = subscriptions.some((s) => s.amount > 0 && s.name.trim());

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
            <Repeat className="h-8 w-8 text-primary" />
            {t("subscriptionCost.title")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t("subscriptionCost.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Subscription List */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{t("subscriptionCost.yourSubscriptions")}</CardTitle>
            <button
              onClick={addSubscription}
              className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-primary transition-colors hover:bg-primary/20"
            >
              <Plus className="h-4 w-4" />
              {t("subscriptionCost.addSubscription")}
            </button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="grid grid-cols-1 gap-4 rounded-lg bg-muted/50 p-4 md:grid-cols-6"
                >
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      {t("subscriptionCost.name")}
                    </label>
                    <input
                      type="text"
                      value={sub.name}
                      onChange={(e) => updateSubscription(sub.id, "name", e.target.value)}
                      placeholder={t("subscriptionCost.namePlaceholder")}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      {t("subscriptionCost.amount")}
                    </label>
                    <CurrencyInput
                      value={sub.amount}
                      onChange={(value) => updateSubscription(sub.id, "amount", value)}
                      currency={currency}
                      locale={locale}
                      min={0}
                      inputClassName="text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      {t("subscriptionCost.frequency.label")}
                    </label>
                    <select
                      value={sub.frequency}
                      onChange={(e) =>
                        updateSubscription(sub.id, "frequency", e.target.value as SubscriptionFrequency)
                      }
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                    >
                      {FREQUENCIES.map((freq) => (
                        <option key={freq} value={freq}>
                          {t(`subscriptionCost.frequency.${freq}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={sub.isEssential}
                        onChange={(e) =>
                          updateSubscription(sub.id, "isEssential", e.target.checked)
                        }
                        className="h-4 w-4 rounded border-input bg-transparent text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">
                        {t("subscriptionCost.essential")}
                      </span>
                    </label>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => removeSubscription(sub.id)}
                      disabled={subscriptions.length === 1}
                      className="rounded-lg p-2 text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={t("subscriptionCost.remove")}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-border pt-6">
              <label className="mb-4 flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={showIncomeField}
                  onChange={(e) => setShowIncomeField(e.target.checked)}
                  className="h-4 w-4 rounded border-input bg-transparent text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">
                  {t("subscriptionCost.showIncomePercent")}
                </span>
              </label>
              {showIncomeField && (
                <CurrencyInput
                  label={t("subscriptionCost.monthlyIncome")}
                  value={monthlyIncome}
                  onChange={setMonthlyIncome}
                  currency={currency}
                  locale={locale}
                  min={0}
                  className="max-w-sm"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <h3 className="mb-4 text-sm font-medium text-primary">
                {t("subscriptionCost.totalCost")}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("subscriptionCost.daily")}</span>
                  <span className="text-lg font-bold text-foreground">
                    {formatCurrency(result.totalDaily, currency, locale)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("subscriptionCost.monthly")}</span>
                  <span className="text-2xl font-bold text-foreground">
                    {formatCurrency(result.totalMonthly, currency, locale)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("subscriptionCost.yearly")}</span>
                  <span className="text-lg font-bold text-foreground">
                    {formatCurrency(result.totalYearly, currency, locale)}
                  </span>
                </div>
                {result.percentOfIncome !== undefined && (
                  <div className="border-t border-primary/30 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {t("subscriptionCost.percentOfIncome")}
                      </span>
                      <span className="text-lg font-bold text-primary">
                        {formatPercent(result.percentOfIncome / 100, locale, 1)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {hasSubscriptions && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-4 text-sm font-medium text-muted-foreground">
                  {t("subscriptionCost.breakdown")}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">
                      {t("subscriptionCost.essentialCost")}
                    </span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(result.essentialMonthly, currency, locale)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">
                      {t("subscriptionCost.nonEssentialCost")}
                    </span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(result.nonEssentialMonthly, currency, locale)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {result.potentialYearlySavings > 0 && (
            <Card className="border-green-500/30 bg-green-500/5">
              <CardContent className="pt-6">
                <h3 className="mb-2 text-sm font-medium text-green-600 dark:text-green-400">
                  {t("subscriptionCost.potentialSavings")}
                </h3>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(result.potentialYearlySavings, currency, locale)}
                  <span className="ms-2 text-sm font-normal text-muted-foreground">
                    {t("subscriptionCost.perYear")}
                  </span>
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("subscriptionCost.potentialSavingsHelp")}
                </p>
              </CardContent>
            </Card>
          )}

          {result.byCategory.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <PieChart className="h-4 w-4" />
                  {t("subscriptionCost.byCategory")}
                </h3>
                <div className="space-y-3">
                  {result.byCategory.map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between">
                      <div>
                        <span className="text-foreground">{cat.category}</span>
                        <span className="ms-2 text-xs text-muted-foreground">({cat.count})</span>
                      </div>
                      <span className="font-medium text-foreground">
                        {formatCurrency(cat.monthly, currency, locale)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
