'use client';

/**
 * Savings Goal Calculator Page
 *
 * Calculate savings projections with compound interest
 * Two modes: "when will I reach my goal" or "how much should I save"
 */

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, Target, Calendar, DollarSign, TrendingUp, Sparkles } from 'lucide-react';
import { CurrencyInput, PercentInput, ResultsPanel } from '@/components/budget/calculators';
import { calculateSavingsGoal } from '@/lib/calculators/savings-goal';
import { formatCurrency } from '@/i18n/utils/formatCurrency';
import { formatPercent, formatNumber } from '@/i18n/utils/formatNumber';
import type { SupportedLocale } from '@/i18n/config';
import type { SavingsGoalMode } from '@/lib/calculators/types';
import { LOCALE_METADATA } from '@/i18n/config';
import { cn } from '@/lib/utils';

export default function SavingsGoalCalculatorPage() {
  const t = useTranslations('calculators');
  const locale = useLocale() as SupportedLocale;
  const localeMeta = LOCALE_METADATA[locale] || LOCALE_METADATA['en-US'];
  const currency = localeMeta.currency;

  // Mode state
  const [mode, setMode] = useState<SavingsGoalMode>('when');

  // Form state
  const [goalAmount, setGoalAmount] = useState(10000);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [targetDate, setTargetDate] = useState(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 2);
    return date.toISOString().split('T')[0];
  });
  const [expectedReturn, setExpectedReturn] = useState(5);

  // Calculate results
  const result = useMemo(() => {
    return calculateSavingsGoal({
      mode,
      goalAmount,
      currentSavings,
      monthlyContribution: mode === 'when' ? monthlyContribution : undefined,
      targetDate: mode === 'howMuch' ? new Date(targetDate) : undefined,
      expectedAnnualReturn: expectedReturn,
    });
  }, [mode, goalAmount, currentSavings, monthlyContribution, targetDate, expectedReturn]);

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
            <Target className="w-8 h-8 text-blue-400" />
            {t('savingsGoal.title')}
          </h1>
          <p className="text-slate-400 mt-2">{t('savingsGoal.subtitle')}</p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <div className="flex gap-4">
          <button
            onClick={() => setMode('when')}
            className={cn(
              'flex-1 py-3 px-4 rounded-lg font-medium transition-all',
              mode === 'when'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                : 'bg-slate-700/50 text-slate-400 border border-transparent hover:bg-slate-700'
            )}
          >
            <Calendar className="w-5 h-5 mx-auto mb-2" />
            {t('savingsGoal.modeWhen')}
          </button>
          <button
            onClick={() => setMode('howMuch')}
            className={cn(
              'flex-1 py-3 px-4 rounded-lg font-medium transition-all',
              mode === 'howMuch'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                : 'bg-slate-700/50 text-slate-400 border border-transparent hover:bg-slate-700'
            )}
          >
            <DollarSign className="w-5 h-5 mx-auto mb-2" />
            {t('savingsGoal.modeHowMuch')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">
            {t('savingsGoal.inputTitle')}
          </h2>

          <div className="space-y-5">
            {/* Goal Amount */}
            <CurrencyInput
              label={t('savingsGoal.goalAmount')}
              value={goalAmount}
              onChange={setGoalAmount}
              currency={currency}
              locale={locale}
              min={0}
            />

            {/* Current Savings */}
            <CurrencyInput
              label={t('savingsGoal.currentSavings')}
              value={currentSavings}
              onChange={setCurrentSavings}
              currency={currency}
              locale={locale}
              min={0}
            />

            {/* Monthly Contribution (when mode) */}
            {mode === 'when' && (
              <CurrencyInput
                label={t('savingsGoal.monthlyContribution')}
                value={monthlyContribution}
                onChange={setMonthlyContribution}
                currency={currency}
                locale={locale}
                min={0}
              />
            )}

            {/* Target Date (howMuch mode) */}
            {mode === 'howMuch' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  {t('savingsGoal.targetDate')}
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full py-2 px-4 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Expected Return */}
            <PercentInput
              label={t('savingsGoal.expectedReturn')}
              value={expectedReturn}
              onChange={setExpectedReturn}
              locale={locale}
              min={0}
              max={20}
              helperText={t('savingsGoal.expectedReturnHelp')}
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Main Result Card */}
          <div className="bg-blue-500/10 rounded-xl border border-blue-500/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">
                {mode === 'when'
                  ? t('savingsGoal.resultWhenTitle')
                  : t('savingsGoal.resultHowMuchTitle')}
              </h3>
            </div>

            {mode === 'when' && result.completionDate && result.monthsToGoal !== undefined && (
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-white mb-2">
                  {new Intl.DateTimeFormat(locale, {
                    year: 'numeric',
                    month: 'long',
                  }).format(result.completionDate)}
                </p>
                <p className="text-slate-400">
                  {t('savingsGoal.inMonths', { months: result.monthsToGoal })}
                </p>
              </div>
            )}

            {mode === 'howMuch' && result.requiredMonthlyContribution !== undefined && (
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-white mb-2">
                  {formatCurrency(result.requiredMonthlyContribution, currency, locale)}
                </p>
                <p className="text-slate-400">{t('savingsGoal.perMonth')}</p>
              </div>
            )}

            {/* Progress */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">
                  {formatCurrency(currentSavings, currency, locale)}
                </span>
                <span className="text-slate-400">
                  {formatCurrency(goalAmount, currency, locale)}
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, result.progressPercent)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Detailed Results */}
          <ResultsPanel
            title={t('savingsGoal.projectionTitle')}
            currency={currency}
            locale={locale}
            columns={2}
            results={[
              {
                label: t('savingsGoal.projectedAmount'),
                value: result.projectedAmount,
                type: 'currency',
                highlight: true,
              },
              {
                label: t('savingsGoal.totalContributions'),
                value: result.totalContributions,
                type: 'currency',
              },
              {
                label: t('savingsGoal.interestEarned'),
                value: result.totalInterestEarned,
                type: 'currency',
                variant: result.totalInterestEarned > 0 ? 'success' : 'default',
              },
              {
                label: t('savingsGoal.progress'),
                value: result.progressPercent,
                type: 'percent',
              },
            ]}
          />

          {/* Projection Timeline */}
          {result.projections.length > 1 && (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
              <h3 className="text-sm font-semibold text-blue-400 mb-4">
                {t('savingsGoal.timelineTitle')}
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {result.projections.slice(1).map((proj, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm py-2 border-b border-slate-700 last:border-0"
                  >
                    <span className="text-slate-400">
                      {new Intl.DateTimeFormat(locale, {
                        year: 'numeric',
                        month: 'short',
                      }).format(proj.date)}
                    </span>
                    <span className="font-medium text-white">
                      {formatCurrency(proj.balance, currency, locale)}
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
