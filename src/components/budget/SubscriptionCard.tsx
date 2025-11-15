'use client';

/**
 * Subscription Card Component
 *
 * Displays individual subscription details with:
 * - Merchant name and category
 * - Cost and billing frequency
 * - Next charge date
 * - Confidence meter
 * - Quick actions
 */

import type { SubscriptionPattern } from '@/lib/subscription-detector';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Calendar,
  TrendingUp,
  DollarSign,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Clock,
} from 'lucide-react';

interface SubscriptionCardProps {
  subscription: SubscriptionPattern;
  onViewTransactions?: () => void;
}

export function SubscriptionCard({
  subscription,
  onViewTransactions,
}: SubscriptionCardProps) {
  const intervalLabel = {
    weekly: 'Weekly',
    monthly: 'Monthly',
    annual: 'Annual',
    irregular: 'Irregular',
  }[subscription.interval_type];

  const confidenceColor =
    subscription.confidence >= 0.9
      ? 'text-green-600 dark:text-green-400'
      : subscription.confidence >= 0.7
      ? 'text-yellow-600 dark:text-yellow-400'
      : 'text-orange-600 dark:text-orange-400';

  const confidenceLabel =
    subscription.confidence >= 0.9
      ? 'High'
      : subscription.confidence >= 0.7
      ? 'Medium'
      : 'Low';

  const isAiDetected = subscription.is_subscription_merchant;

  return (
    <div
      className={`bg-card border rounded-lg p-6 transition-all hover:shadow-md ${
        subscription.is_active
          ? 'border-border'
          : 'border-border opacity-60'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-foreground">
              {subscription.merchant_name}
            </h3>
            {isAiDetected && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-medium rounded-full border border-teal-200 dark:border-teal-800">
                <CheckCircle className="w-3 h-3" />
                AI Verified
              </span>
            )}
            {!subscription.is_active && (
              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full">
                Inactive
              </span>
            )}
          </div>
          {subscription.category && (
            <p className="text-sm text-muted-foreground">
              {subscription.category}
              {subscription.subcategory && ` → ${subscription.subcategory}`}
            </p>
          )}
        </div>

        {/* Confidence Badge */}
        <div className="flex flex-col items-end">
          <span
            className={`text-xs font-medium ${confidenceColor}`}
            title={`${(subscription.confidence * 100).toFixed(0)}% confidence`}
          >
            {confidenceLabel} Confidence
          </span>
          <div className="mt-1 flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < Math.round(subscription.confidence * 5)
                    ? 'bg-teal-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Amount */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-50 dark:bg-green-950 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="text-base font-semibold text-foreground">
              ${subscription.average_amount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Frequency */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Frequency</p>
            <p className="text-base font-semibold text-foreground">{intervalLabel}</p>
          </div>
        </div>

        {/* Next Charge */}
        {subscription.next_expected_charge && (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Next Charge</p>
              <p className="text-sm font-medium text-foreground">
                {format(subscription.next_expected_charge, 'MMM d')}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(subscription.next_expected_charge, { addSuffix: true })}
              </p>
            </div>
          </div>
        )}

        {/* Total Spent */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Spent</p>
            <p className="text-base font-semibold text-foreground">
              ${subscription.total_spent.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="pt-4 border-t border-border space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Occurrences:</span>
          <span className="font-medium text-foreground">
            {subscription.occurrence_count} charges
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">First Charge:</span>
          <span className="font-medium text-foreground">
            {format(subscription.first_charge, 'MMM d, yyyy')}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last Charge:</span>
          <span className="font-medium text-foreground">
            {format(subscription.last_charge, 'MMM d, yyyy')}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Annual Cost:</span>
          <span className="font-semibold text-foreground">
            ${subscription.annual_cost_estimate.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-border flex gap-2">
        <button
          onClick={onViewTransactions}
          className="flex-1 px-4 py-2 text-sm font-medium text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950 transition-colors flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          View Transactions
        </button>
      </div>

      {/* Warning for Low Confidence */}
      {subscription.confidence < 0.7 && (
        <div className="mt-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            This subscription was detected with low confidence. Verify the pattern is correct.
          </p>
        </div>
      )}
    </div>
  );
}
