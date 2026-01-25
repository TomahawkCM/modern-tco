'use client';

/**
 * Emergency Fund Calculator Page
 *
 * Calculate emergency fund targets and timeline
 */

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, Shield, Calendar, Target, TrendingUp, CheckCircle } from 'lucide-react';
import { CurrencyInput, ResultsPanel } from '@/components/budget/calculators';
import { calculateEmergencyFund, getRecommendedMonths } from '@/lib/calculators/emergency-fund';
import { formatCurrency } from '@/i18n/utils/formatCurrency';
import { formatPercent } from '@/i18n/utils/formatNumber';
import type { SupportedLocale } from '@/i18n/config';
import { LOCALE_METADATA } from '@/i18n/config';
import { cn } from '@/lib/utils';

export default function EmergencyFundCalculatorPage() {
  const t = useTranslations('calculators');
  const locale = useLocale() as SupportedLocale;
  const localeMeta = LOCALE_METADATA[locale] || LOCALE_METADATA['en-US'];
  const currency = localeMeta.currency as string;

  // Form state
  const [monthlyExpenses, setMonthlyExpenses] = useState(3000);
  const [targetMonths, setTargetMonths] = useState(6);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [monthlyContribution, setMonthlyContribution] = useState(500);

  // Calculate results
  const result = useMemo(() => {
    return calculateEmergencyFund({
      monthlyExpenses,
      targetMonths,
      currentSavings,
      monthlyContribution,
    });
  }, [monthlyExpenses, targetMonths, currentSavings, monthlyContribution]);

  // Recommended months based on situation
  const recommendedMonths = useMemo(() => {
    return getRecommendedMonths(true, false, false);
  }, []);

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
            <Shield className="w-8 h-8 text-teal-400" />
            {t('emergencyFund.title')}
          </h1>
          <p className="text-slate-400 mt-2">{t('emergencyFund.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">
            {t('emergencyFund.inputTitle')}
          </h2>

          <div className="space-y-5">
            {/* Monthly Expenses */}
            <CurrencyInput
              label={t('emergencyFund.monthlyExpenses')}
              value={monthlyExpenses}
              onChange={setMonthlyExpenses}
              currency={currency}
              locale={locale}
              min={0}
              helperText={t('emergencyFund.monthlyExpensesHelp')}
            />

            {/* Target Months Slider */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                {t('emergencyFund.targetMonths')}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={targetMonths}
                  onChange={(e) => setTargetMonths(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
                <span className="text-lg font-bold text-white min-w-[3rem] text-center">
                  {targetMonths}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t('emergencyFund.targetMonthsHelp', { months: recommendedMonths })}
              </p>
            </div>

            {/* Current Savings */}
            <CurrencyInput
              label={t('emergencyFund.currentSavings')}
              value={currentSavings}
              onChange={setCurrentSavings}
              currency={currency}
              locale={locale}
              min={0}
            />

            {/* Monthly Contribution */}
            <CurrencyInput
              label={t('emergencyFund.monthlyContribution')}
              value={monthlyContribution}
              onChange={setMonthlyContribution}
              currency={currency}
              locale={locale}
              min={0}
              helperText={t('emergencyFund.monthlyContributionHelp')}
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Status Card */}
          <div
            className={cn(
              'rounded-xl border p-6',
              result.isGoalMet
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-teal-500/10 border-teal-500/30'
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              {result.isGoalMet ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <Target className="w-6 h-6 text-teal-400" />
              )}
              <h3 className="text-lg font-semibold text-white">
                {result.isGoalMet
                  ? t('emergencyFund.goalMet')
                  : t('emergencyFund.goalProgress')}
              </h3>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">
                  {formatCurrency(currentSavings, currency, locale)}
                </span>
                <span className="text-slate-400">
                  {formatCurrency(result.targetAmount, currency, locale)}
                </span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    result.isGoalMet ? 'bg-green-500' : 'bg-teal-500'
                  )}
                  style={{ width: `${Math.min(100, result.progressPercent)}%` }}
                />
              </div>
              <div className="text-center mt-2">
                <span className="text-lg font-bold text-white">
                  {formatPercent(result.progressPercent / 100, locale, 0)}
                </span>
              </div>
            </div>

            {!result.isGoalMet && result.amountNeeded > 0 && (
              <p className="text-sm text-slate-300">
                {t('emergencyFund.amountNeeded', {
                  amount: formatCurrency(result.amountNeeded, currency, locale),
                })}
              </p>
            )}
          </div>

          {/* Results Panel */}
          <ResultsPanel
            title={t('emergencyFund.resultsTitle')}
            currency={currency}
            locale={locale}
            columns={2}
            results={[
              {
                label: t('emergencyFund.targetAmount'),
                value: result.targetAmount,
                type: 'currency',
                icon: <Target className="w-4 h-4" />,
                highlight: true,
              },
              {
                label: t('emergencyFund.monthsToGoal'),
                value: result.monthsToGoal,
                type: 'months',
                icon: <Calendar className="w-4 h-4" />,
              },
              {
                label: t('emergencyFund.completionDate'),
                value: result.completionDate,
                type: 'date',
                icon: <TrendingUp className="w-4 h-4" />,
              },
              {
                label: t('emergencyFund.progress'),
                value: result.progressPercent,
                type: 'percent',
                variant: result.isGoalMet ? 'success' : 'default',
              },
            ]}
          />

          {/* Tips */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <h3 className="text-sm font-semibold text-teal-400 mb-3">
              {t('emergencyFund.tipsTitle')}
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-teal-400">•</span>
                {t('emergencyFund.tip1')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-400">•</span>
                {t('emergencyFund.tip2')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-400">•</span>
                {t('emergencyFund.tip3')}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
