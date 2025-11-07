'use client';

/**
 * Spending Insights Component (Phase 4)
 * Task 4.2.1: Display average spending insights
 *
 * Shows "You usually spend $X on Y" based on 3-month average
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus, Lightbulb } from 'lucide-react';
import type { SpendingInsight } from '@/lib/analytics/spending-insights';

interface SpendingInsightsProps {
  insights: SpendingInsight[];
  averageMonthlyIncome: number;
  averageMonthlySpending: number;
}

export function SpendingInsights({ 
  insights, 
  averageMonthlyIncome,
  averageMonthlySpending 
}: SpendingInsightsProps) {
  if (insights.length === 0) {
    return null;
  }

  const averageSavings = averageMonthlyIncome - averageMonthlySpending;
  const savingsRate = averageMonthlyIncome > 0 
    ? (averageSavings / averageMonthlyIncome) * 100 
    : 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">💡 Spending Insights</h3>
          <p className="text-sm text-gray-600">Based on your last 3 months</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <div className="text-xs text-gray-600 mb-2">Avg Income</div>
          <div className="text-lg font-bold text-green-600">
            ${averageMonthlyIncome.toFixed(0)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-600 mb-2">Avg Spending</div>
          <div className="text-lg font-bold text-gray-900">
            ${averageMonthlySpending.toFixed(0)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-600 mb-2">Savings Rate</div>
          <div className={`text-lg font-bold ${savingsRate >= 20 ? 'text-green-600' : savingsRate >= 10 ? 'text-amber-600' : 'text-red-600'}`}>
            {savingsRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Category Insights */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Top Spending Categories
        </h4>
        
        {insights.map((insight, index) => {
          const trendIcon = insight.trend === 'up' ? TrendingUp
            : insight.trend === 'down' ? TrendingDown
            : Minus;
          
          const trendColor = insight.trend === 'up' ? 'text-red-600'
            : insight.trend === 'down' ? 'text-green-600'
            : 'text-gray-500';

          return (
            <div
              key={index}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">
                      {insight.category}
                    </span>
                    {insight.subcategory && (
                      <span className="text-sm text-gray-600">
                        • {insight.subcategory}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2">
                    You usually spend{' '}
                    <span className="font-bold text-teal-600">
                      ${insight.averageMonthly.toFixed(2)}
                    </span>{' '}
                    per month on this category
                  </p>

                  {/* Current vs Average */}
                  {insight.trend !== 'stable' && (
                    <div className="flex items-center gap-2 text-xs">
                      {React.createElement(trendIcon, { className: `w-3 h-3 ${trendColor}` })}
                      <span className={trendColor}>
                        {insight.trend === 'up' ? 'Spending more' : 'Spending less'} this month:{' '}
                        <span className="font-semibold">
                          {insight.variance >= 0 ? '+' : ''}${insight.variance.toFixed(2)}
                        </span>
                        {' '}({insight.variancePercent >= 0 ? '+' : ''}{insight.variancePercent.toFixed(1)}%)
                      </span>
                    </div>
                  )}
                  
                  {insight.trend === 'stable' && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Minus className="w-3 h-3" />
                      <span>Spending on track with average</span>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-xs text-gray-600">This Month</div>
                  <div className="text-lg font-bold text-gray-900">
                    ${insight.currentMonth.toFixed(0)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Data Source Note */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Insights based on {insights[0]?.monthsAnalyzed || 3} months of transaction history
        </p>
      </div>
    </div>
  );
}

