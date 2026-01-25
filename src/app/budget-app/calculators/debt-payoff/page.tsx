'use client';

/**
 * Debt Payoff Calculator Page
 *
 * Compare snowball vs avalanche debt repayment strategies
 */

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, TrendingDown, Plus, Trash2, Award, Calendar } from 'lucide-react';
import { CurrencyInput, PercentInput, ResultsPanel } from '@/components/budget/calculators';
import { calculateDebtPayoff, generateDebtId } from '@/lib/calculators/debt-payoff';
import { formatCurrency } from '@/i18n/utils/formatCurrency';
import type { SupportedLocale } from '@/i18n/config';
import type { DebtAccount, DebtStrategy } from '@/lib/calculators/types';
import { LOCALE_METADATA } from '@/i18n/config';
import { cn } from '@/lib/utils';

export default function DebtPayoffCalculatorPage() {
  const t = useTranslations('calculators');
  const locale = useLocale() as SupportedLocale;
  const localeMeta = LOCALE_METADATA[locale] || LOCALE_METADATA['en-US'];
  const currency = localeMeta.currency as string;

  // Debts state
  const [debts, setDebts] = useState<DebtAccount[]>([
    { id: generateDebtId(), name: '', balance: 0, apr: 0, minimumPayment: 0 },
  ]);

  // Extra payment state
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState(100);

  // Selected strategy for details view
  const [selectedStrategy, setSelectedStrategy] = useState<DebtStrategy>('avalanche');

  // Calculate results
  const result = useMemo(() => {
    const validDebts = debts.filter(
      (d) => d.balance > 0 && d.minimumPayment > 0
    );
    return calculateDebtPayoff({
      debts: validDebts,
      extraMonthlyPayment,
    });
  }, [debts, extraMonthlyPayment]);

  // Add a new debt
  const addDebt = () => {
    setDebts([
      ...debts,
      { id: generateDebtId(), name: '', balance: 0, apr: 0, minimumPayment: 0 },
    ]);
  };

  // Remove a debt
  const removeDebt = (id: string) => {
    if (debts.length > 1) {
      setDebts(debts.filter((d) => d.id !== id));
    }
  };

  // Update a debt field
  const updateDebt = (id: string, field: keyof DebtAccount, value: string | number) => {
    setDebts(
      debts.map((d) =>
        d.id === id ? { ...d, [field]: value } : d
      )
    );
  };

  const hasDebts = debts.some((d) => d.balance > 0 && d.minimumPayment > 0);

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
            <TrendingDown className="w-8 h-8 text-orange-400" />
            {t('debtPayoff.title')}
          </h1>
          <p className="text-slate-400 mt-2">{t('debtPayoff.subtitle')}</p>
        </div>
      </div>

      {/* Debt List */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">
            {t('debtPayoff.yourDebts')}
          </h2>
          <button
            onClick={addDebt}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('debtPayoff.addDebt')}
          </button>
        </div>

        <div className="space-y-4">
          {debts.map((debt, index) => (
            <div
              key={debt.id}
              className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-slate-700/30 rounded-lg"
            >
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {t('debtPayoff.debtName')}
                </label>
                <input
                  type="text"
                  value={debt.name}
                  onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                  placeholder={t('debtPayoff.debtNamePlaceholder', { number: index + 1 })}
                  className="w-full py-2 px-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {t('debtPayoff.balance')}
                </label>
                <CurrencyInput
                  value={debt.balance}
                  onChange={(value) => updateDebt(debt.id, 'balance', value)}
                  currency={currency}
                  locale={locale}
                  min={0}
                  inputClassName="text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {t('debtPayoff.apr')}
                </label>
                <PercentInput
                  value={debt.apr}
                  onChange={(value) => updateDebt(debt.id, 'apr', value)}
                  locale={locale}
                  min={0}
                  max={100}
                  inputClassName="text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {t('debtPayoff.minimumPayment')}
                </label>
                <CurrencyInput
                  value={debt.minimumPayment}
                  onChange={(value) => updateDebt(debt.id, 'minimumPayment', value)}
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
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label={t('debtPayoff.removeDebt')}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Extra Payment */}
        <div className="mt-6 pt-6 border-t border-slate-700">
          <CurrencyInput
            label={t('debtPayoff.extraMonthlyPayment')}
            value={extraMonthlyPayment}
            onChange={setExtraMonthlyPayment}
            currency={currency}
            locale={locale}
            min={0}
            helperText={t('debtPayoff.extraMonthlyPaymentHelp')}
            className="max-w-sm"
          />
        </div>
      </div>

      {/* Strategy Comparison */}
      {hasDebts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Snowball */}
          <div
            className={cn(
              'rounded-xl border p-6 cursor-pointer transition-all',
              selectedStrategy === 'snowball'
                ? 'bg-blue-500/10 border-blue-500/50'
                : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
            )}
            onClick={() => setSelectedStrategy('snowball')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {t('debtPayoff.snowball')}
              </h3>
              {result.recommendedStrategy !== 'snowball' && (
                <span className="text-xs px-2 py-1 bg-slate-700 text-slate-400 rounded">
                  {t('debtPayoff.morePsychological')}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 mb-4">
              {t('debtPayoff.snowballDescription')}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">{t('debtPayoff.totalInterest')}</p>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(result.snowball.totalInterest, currency, locale)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('debtPayoff.payoffDate')}</p>
                <p className="text-xl font-bold text-white">
                  {result.snowball.totalMonths} {t('common.months')}
                </p>
              </div>
            </div>
          </div>

          {/* Avalanche */}
          <div
            className={cn(
              'rounded-xl border p-6 cursor-pointer transition-all',
              selectedStrategy === 'avalanche'
                ? 'bg-green-500/10 border-green-500/50'
                : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
            )}
            onClick={() => setSelectedStrategy('avalanche')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {t('debtPayoff.avalanche')}
              </h3>
              {result.recommendedStrategy === 'avalanche' && (
                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {t('debtPayoff.recommended')}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 mb-4">
              {t('debtPayoff.avalancheDescription')}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">{t('debtPayoff.totalInterest')}</p>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(result.avalanche.totalInterest, currency, locale)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('debtPayoff.payoffDate')}</p>
                <p className="text-xl font-bold text-white">
                  {result.avalanche.totalMonths} {t('common.months')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Savings Comparison */}
      {hasDebts && result.interestSaved > 0 && (
        <div className="bg-green-500/10 rounded-xl border border-green-500/30 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">
              {t('debtPayoff.savingsTitle')}
            </h3>
          </div>
          <p className="text-slate-300">
            {t('debtPayoff.savingsDescription', {
              amount: formatCurrency(result.interestSaved, currency, locale),
              months: Math.abs(result.monthsSaved),
            })}
          </p>
        </div>
      )}

      {/* Payment Schedule */}
      {hasDebts && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-400" />
            {t('debtPayoff.paymentSchedule')} ({selectedStrategy === 'snowball' ? t('debtPayoff.snowball') : t('debtPayoff.avalanche')})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-2 text-slate-400 font-medium">
                    {t('debtPayoff.month')}
                  </th>
                  <th className="text-right py-3 px-2 text-slate-400 font-medium">
                    {t('debtPayoff.payment')}
                  </th>
                  <th className="text-right py-3 px-2 text-slate-400 font-medium">
                    {t('debtPayoff.remaining')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(selectedStrategy === 'snowball'
                  ? result.snowball.schedule
                  : result.avalanche.schedule
                )
                  .filter((_, i, arr) => i < 12 || i === arr.length - 1)
                  .map((month, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-700/50 last:border-0"
                    >
                      <td className="py-3 px-2 text-slate-300">
                        {new Intl.DateTimeFormat(locale, {
                          year: 'numeric',
                          month: 'short',
                        }).format(month.date)}
                      </td>
                      <td className="py-3 px-2 text-right text-white">
                        {formatCurrency(month.totalPayment, currency, locale)}
                      </td>
                      <td className="py-3 px-2 text-right text-slate-300">
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
