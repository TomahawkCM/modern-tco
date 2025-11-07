'use client';

/**
 * Recurring Transactions Component (Phase 4)
 * Task 4.2.3: Display detected recurring transactions
 * 
 * Shows subscriptions and recurring bills
 */

import { RefreshCw, Calendar, DollarSign } from 'lucide-react';
import type { RecurringPattern } from '@/lib/analytics/recurring-detector';
import type { Transaction } from '@/types/budget';

interface RecurringTransactionsProps {
  patterns: RecurringPattern[];
}

export function RecurringTransactions({ patterns }: RecurringTransactionsProps) {
  if (patterns.length === 0) {
    return null;
  }

  const frequencyColors = {
    weekly: 'bg-teal-100 text-teal-700',
    biweekly: 'bg-gray-200 text-gray-700',
    monthly: 'bg-teal-100 text-teal-700',
    quarterly: 'bg-gray-200 text-gray-700',
  };

  const frequencyLabels = {
    weekly: 'Weekly',
    biweekly: 'Bi-weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
  };

  // Calculate total monthly recurring cost
  const totalMonthly = patterns.reduce((sum, p) => {
    const monthlyAmount = p.frequency === 'weekly' ? p.averageAmount * 4.33
      : p.frequency === 'biweekly' ? p.averageAmount * 2.17
      : p.frequency === 'monthly' ? p.averageAmount
      : p.averageAmount / 3;
    return sum + monthlyAmount;
  }, 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Recurring Transactions</h3>
          <p className="text-sm text-gray-600 mt-2">
            Detected subscriptions and bills
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-600">Estimated Monthly</div>
          <div className="text-xl font-bold text-teal-600">
            ${totalMonthly.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {patterns.map((pattern, index) => {
          const daysUntilNext = Math.ceil(
            (pattern.nextExpectedDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          const isUpcoming = daysUntilNext >= 0 && daysUntilNext <= 7;

          return (
            <div
              key={index}
              className={`border rounded-lg p-4 ${
                isUpcoming ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCw className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold text-gray-900">{pattern.merchant}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      frequencyColors[pattern.frequency]
                    }`}>
                      {frequencyLabels[pattern.frequency]}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3 h-3" />
                      <span>${pattern.averageAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>Next: {pattern.nextExpectedDate.toLocaleDateString()}</span>
                      {isUpcoming && (
                        <span className="text-amber-700 font-medium">
                          (in {daysUntilNext} day{daysUntilNext !== 1 ? 's' : ''})
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    {pattern.occurrences} occurrence{pattern.occurrences !== 1 ? 's' : ''} detected
                    {' • '}
                    {pattern.category}
                    {pattern.subcategory && ` - ${pattern.subcategory}`}
                    {' • '}
                    {(pattern.confidence * 100).toFixed(0)}% confidence
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    ${pattern.averageAmount.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    per {pattern.frequency === 'biweekly' ? '2 weeks' : pattern.frequency.replace('ly', '')}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {patterns.length > 3 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            Showing {patterns.length} recurring transaction pattern{patterns.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Group transactions by normalized merchant name
 */
function groupByMerchant(transactions: Transaction[]): Map<string, Transaction[]> {
  const grouped = new Map<string, Transaction[]>();
  
  transactions.forEach(tx => {
    if (tx.amount >= 0) return; // Only expenses
    
    const key = tx.description.toUpperCase().trim();
    
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(tx);
  });
  
  return grouped;
}

