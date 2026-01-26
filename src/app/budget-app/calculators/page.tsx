'use client';

/**
 * Financial Calculators Hub
 *
 * Central page for accessing all financial calculators
 */

import { useTranslations } from 'next-intl';
import {
  Shield,
  TrendingDown,
  Target,
  Repeat,
  PieChart,
} from 'lucide-react';
import { CalculatorCard } from '@/components/budget/calculators';

export default function CalculatorsPage() {
  const t = useTranslations('calculators');

  const calculators = [
    {
      id: 'emergency-fund',
      title: t('emergencyFund.title'),
      description: t('emergencyFund.description'),
      href: '/budget-app/calculators/emergency-fund',
      icon: <Shield className="w-6 h-6" />,
      color: 'teal' as const,
    },
    {
      id: 'debt-payoff',
      title: t('debtPayoff.title'),
      description: t('debtPayoff.description'),
      href: '/budget-app/calculators/debt-payoff',
      icon: <TrendingDown className="w-6 h-6" />,
      color: 'orange' as const,
    },
    {
      id: 'savings-goal',
      title: t('savingsGoal.title'),
      description: t('savingsGoal.description'),
      href: '/budget-app/calculators/savings-goal',
      icon: <Target className="w-6 h-6" />,
      color: 'blue' as const,
    },
    {
      id: 'subscription-cost',
      title: t('subscriptionCost.title'),
      description: t('subscriptionCost.description'),
      href: '/budget-app/calculators/subscription-cost',
      icon: <Repeat className="w-6 h-6" />,
      color: 'purple' as const,
    },
    {
      id: 'budget-analyzer',
      title: t('budgetAnalyzer.title'),
      description: t('budgetAnalyzer.description'),
      href: '/budget-app/calculators/budget-analyzer',
      icon: <PieChart className="w-6 h-6" />,
      color: 'green' as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">{t('hub.title')}</h1>
        <p className="text-slate-400 mt-2">{t('hub.subtitle')}</p>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {calculators.map((calc) => (
          <CalculatorCard
            key={calc.id}
            title={calc.title}
            description={calc.description}
            href={calc.href}
            icon={calc.icon}
            color={calc.color}
          />
        ))}
      </div>

      {/* Info Section */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          {t('hub.infoTitle')}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-teal-400">
              {t('hub.privacyTitle')}
            </h3>
            <p className="text-sm text-slate-400">
              {t('hub.privacyDescription')}
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-teal-400">
              {t('hub.accuracyTitle')}
            </h3>
            <p className="text-sm text-slate-400">
              {t('hub.accuracyDescription')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
