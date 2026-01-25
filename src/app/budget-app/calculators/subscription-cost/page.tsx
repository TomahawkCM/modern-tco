'use client';

/**
 * Subscription Cost Calculator Page
 *
 * Analyze subscription costs with category breakdowns
 */

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, Repeat, Plus, Trash2, DollarSign, PieChart } from 'lucide-react';
import { CurrencyInput, ResultsPanel } from '@/components/budget/calculators';
import {
  calculateSubscriptionCost,
  generateSubscriptionId,
  SUBSCRIPTION_CATEGORIES,
} from '@/lib/calculators/subscription-cost';
import { formatCurrency } from '@/i18n/utils/formatCurrency';
import { formatPercent } from '@/i18n/utils/formatNumber';
import type { SupportedLocale } from '@/i18n/config';
import type { SubscriptionEntry, SubscriptionFrequency } from '@/lib/calculators/types';
import { LOCALE_METADATA } from '@/i18n/config';
import { cn } from '@/lib/utils';

const FREQUENCIES: SubscriptionFrequency[] = ['weekly', 'biweekly', 'monthly', 'quarterly', 'annual'];

export default function SubscriptionCostCalculatorPage() {
  const t = useTranslations('calculators');
  const locale = useLocale() as SupportedLocale;
  const localeMeta = LOCALE_METADATA[locale] || LOCALE_METADATA['en-US'];
  const currency = localeMeta.currency as string;

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<SubscriptionEntry[]>([
    {
      id: generateSubscriptionId(),
      name: '',
      amount: 0,
      frequency: 'monthly',
      category: 'Other',
      isEssential: false,
    },
  ]);

  // Monthly income for percentage calculation
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [showIncomeField, setShowIncomeField] = useState(false);

  // Calculate results
  const result = useMemo(() => {
    const validSubs = subscriptions.filter((s) => s.amount > 0 && s.name.trim());
    return calculateSubscriptionCost({
      subscriptions: validSubs,
      monthlyIncome: showIncomeField && monthlyIncome > 0 ? monthlyIncome : undefined,
    });
  }, [subscriptions, monthlyIncome, showIncomeField]);

  // Add a new subscription
  const addSubscription = () => {
    setSubscriptions([
      ...subscriptions,
      {
        id: generateSubscriptionId(),
        name: '',
        amount: 0,
        frequency: 'monthly',
        category: 'Other',
        isEssential: false,
      },
    ]);
  };

  // Remove a subscription
  const removeSubscription = (id: string) => {
    if (subscriptions.length > 1) {
      setSubscriptions(subscriptions.filter((s) => s.id !== id));
    }
  };

  // Update a subscription field
  const updateSubscription = (
    id: string,
    field: keyof SubscriptionEntry,
    value: string | number | boolean
  ) => {
    setSubscriptions(
      subscriptions.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      )
    );
  };

  const hasSubscriptions = subscriptions.some((s) => s.amount > 0 && s.name.trim());

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/budget-app/calculators"
          className="mt-1 p-2 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Repeat className="w-8 h-8 text-purple-400" />
            {t('subscriptionCost.title')}
          </h1>
          <p className="text-slate-400 mt-2">{t('subscriptionCost.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Subscription List */}
        <div className="lg:col-span-2 bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">
              {t('subscriptionCost.yourSubscriptions')}
            </h2>
            <button
              onClick={addSubscription}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('subscriptionCost.addSubscription')}
            </button>
          </div>

          <div className="space-y-4">
            {subscriptions.map((sub, index) => (
              <div
                key={sub.id}
                className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-slate-700/30 rounded-lg"
              >
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {t('subscriptionCost.name')}
                  </label>
                  <input
                    type="text"
                    value={sub.name}
                    onChange={(e) => updateSubscription(sub.id, 'name', e.target.value)}
                    placeholder={t('subscriptionCost.namePlaceholder')}
                    className="w-full py-2 px-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {t('subscriptionCost.amount')}
                  </label>
                  <CurrencyInput
                    value={sub.amount}
                    onChange={(value) => updateSubscription(sub.id, 'amount', value)}
                    currency={currency}
                    locale={locale}
                    min={0}
                    inputClassName="text-sm"
                  />
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {t('subscriptionCost.frequency.label')}
                  </label>
                  <select
                    value={sub.frequency}
                    onChange={(e) =>
                      updateSubscription(sub.id, 'frequency', e.target.value as SubscriptionFrequency)
                    }
                    className="w-full py-2 px-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {FREQUENCIES.map((freq) => (
                      <option key={freq} value={freq}>
                        {t(`subscriptionCost.frequency.${freq}`)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Essential toggle */}
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sub.isEssential}
                      onChange={(e) =>
                        updateSubscription(sub.id, 'isEssential', e.target.checked)
                      }
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-sm text-slate-300">
                      {t('subscriptionCost.essential')}
                    </span>
                  </label>
                </div>

                {/* Remove */}
                <div className="flex items-end">
                  <button
                    onClick={() => removeSubscription(sub.id)}
                    disabled={subscriptions.length === 1}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label={t('subscriptionCost.remove')}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Income field toggle */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <label className="flex items-center gap-2 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={showIncomeField}
                onChange={(e) => setShowIncomeField(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500"
              />
              <span className="text-sm text-slate-300">
                {t('subscriptionCost.showIncomePercent')}
              </span>
            </label>
            {showIncomeField && (
              <CurrencyInput
                label={t('subscriptionCost.monthlyIncome')}
                value={monthlyIncome}
                onChange={setMonthlyIncome}
                currency={currency}
                locale={locale}
                min={0}
                className="max-w-sm"
              />
            )}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Total Cost Card */}
          <div className="bg-purple-500/10 rounded-xl border border-purple-500/30 p-6">
            <h3 className="text-sm font-medium text-purple-400 mb-4">
              {t('subscriptionCost.totalCost')}
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{t('subscriptionCost.daily')}</span>
                <span className="text-lg font-bold text-white">
                  {formatCurrency(result.totalDaily, currency, locale)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{t('subscriptionCost.monthly')}</span>
                <span className="text-2xl font-bold text-white">
                  {formatCurrency(result.totalMonthly, currency, locale)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">{t('subscriptionCost.yearly')}</span>
                <span className="text-lg font-bold text-white">
                  {formatCurrency(result.totalYearly, currency, locale)}
                </span>
              </div>
              {result.percentOfIncome !== undefined && (
                <div className="pt-4 border-t border-purple-500/30">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">{t('subscriptionCost.percentOfIncome')}</span>
                    <span className="text-lg font-bold text-purple-400">
                      {formatPercent(result.percentOfIncome / 100, locale, 1)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Essential vs Non-Essential */}
          {hasSubscriptions && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
              <h3 className="text-sm font-medium text-slate-400 mb-4">
                {t('subscriptionCost.breakdown')}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">{t('subscriptionCost.essentialCost')}</span>
                  <span className="font-medium text-white">
                    {formatCurrency(result.essentialMonthly, currency, locale)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">{t('subscriptionCost.nonEssentialCost')}</span>
                  <span className="font-medium text-white">
                    {formatCurrency(result.nonEssentialMonthly, currency, locale)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Potential Savings */}
          {result.potentialYearlySavings > 0 && (
            <div className="bg-green-500/10 rounded-xl border border-green-500/30 p-6">
              <h3 className="text-sm font-medium text-green-400 mb-2">
                {t('subscriptionCost.potentialSavings')}
              </h3>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(result.potentialYearlySavings, currency, locale)}
                <span className="text-sm font-normal text-slate-400 ms-2">
                  {t('subscriptionCost.perYear')}
                </span>
              </p>
              <p className="text-xs text-slate-400 mt-2">
                {t('subscriptionCost.potentialSavingsHelp')}
              </p>
            </div>
          )}

          {/* Category Breakdown */}
          {result.byCategory.length > 0 && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
              <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                {t('subscriptionCost.byCategory')}
              </h3>
              <div className="space-y-3">
                {result.byCategory.map((cat) => (
                  <div key={cat.category} className="flex justify-between items-center">
                    <div>
                      <span className="text-slate-300">{cat.category}</span>
                      <span className="text-xs text-slate-500 ms-2">
                        ({cat.count})
                      </span>
                    </div>
                    <span className="font-medium text-white">
                      {formatCurrency(cat.monthly, currency, locale)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
