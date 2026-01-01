'use client';

/**
 * Overspending Alerts Component (Phase 4)
 * Task 4.2.2: Display overspending alerts
 *
 * Shows warnings when user is projected to exceed budget
 */

import { useTranslations } from 'next-intl';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import type { OverspendingAlert } from '@/lib/analytics/overspending-detector';

interface OverspendingAlertsProps {
  alerts: OverspendingAlert[];
}

export function OverspendingAlerts({ alerts }: OverspendingAlertsProps) {
  const t = useTranslations('overspendingAlerts');
  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert, index) => {
        const percentageUsed = (alert.currentSpent / alert.budgetAmount) * 100;
        const projectedPercentage = (alert.projectedSpending / alert.budgetAmount) * 100;

        return (
          <div
            key={index}
            className={`rounded-lg border-s-4 p-4 ${
              alert.severity === 'danger'
                ? 'bg-red-50 border-red-500'
                : 'bg-amber-50 border-amber-500'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertTriangle
                  className={`w-5 h-5 ${
                    alert.severity === 'danger' ? 'text-red-600' : 'text-amber-600'
                  }`}
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4
                    className={`font-semibold ${
                      alert.severity === 'danger' ? 'text-red-900' : 'text-amber-900'
                    }`}
                  >
                    {alert.categoryName}
                  </h4>
                  <span
                    className={`text-sm font-medium ${
                      alert.severity === 'danger' ? 'text-red-700' : 'text-amber-700'
                    }`}
                  >
                    {t('percentOfBudget', { percent: projectedPercentage.toFixed(0) })}
                  </span>
                </div>

                <p
                  className={`text-sm mb-4 ${
                    alert.severity === 'danger' ? 'text-red-800' : 'text-amber-800'
                  }`}
                >
                  ⚠️ {t('exceededWarning', { amount: `$${alert.projectedOverage.toFixed(2)}` })}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <div className="text-gray-600">{t('stats.budget')}</div>
                    <div className="font-semibold text-gray-900">
                      ${alert.budgetAmount.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">{t('stats.spentSoFar')}</div>
                    <div className="font-semibold text-gray-900">
                      ${alert.currentSpent.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">{t('stats.projectedTotal')}</div>
                    <div
                      className={`font-semibold ${
                        alert.severity === 'danger' ? 'text-red-700' : 'text-amber-700'
                      }`}
                    >
                      ${alert.projectedSpending.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">{t('stats.daysLeft')}</div>
                    <div className="font-semibold text-gray-900">
                      {alert.daysRemaining}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-gray-600">{t('progress.label')}</span>
                    <span
                      className={
                        alert.severity === 'danger' ? 'text-red-700' : 'text-amber-700'
                      }
                    >
                      {percentageUsed.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        alert.severity === 'danger' ? 'bg-red-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Suggestion */}
                <div
                  className={`mt-4 text-xs ${
                    alert.severity === 'danger' ? 'text-red-700' : 'text-amber-700'
                  }`}
                >
                  <TrendingUp className="w-3 h-3 inline mr-2" />
                  <span className="font-medium">{t('tip.label')}</span>{' '}
                  {t('tip.reduceSpending', {
                    amount: `$${(
                      alert.budgetAmount / new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
                    ).toFixed(2)}`
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

