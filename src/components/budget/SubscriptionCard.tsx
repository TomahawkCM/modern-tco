'use client';

/**
 * Subscription Card Component
 *
 * Displays individual subscription details with:
 * - Merchant name and category
 * - Cost and billing frequency
 * - Next charge date
 * - Confidence meter
 * - Quick actions (edit, delete, pause, cancel, claim)
 * - Source indicator (manual, auto-detected, merged)
 */

import type { SubscriptionPattern } from '@/lib/subscription-detector';
import type { Subscription } from '@/types/budget';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import {
  Calendar,
  TrendingUp,
  DollarSign,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Clock,
  Edit,
  Trash2,
  Pause,
  Play,
  XCircle,
  XOctagon,
  Sparkles,
  MoreVertical,
  Bell,
  Link as LinkIcon,
} from 'lucide-react';
import { useState } from 'react';

interface SubscriptionCardProps {
  subscription: SubscriptionPattern;
  source?: 'manual' | 'auto-detected' | 'merged';
  manualSubscription?: Subscription;
  onViewTransactions?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPauseResume?: () => void;
  onCancel?: () => void;
  onClaim?: () => void; // Convert auto-detected to manual
  onDismiss?: () => void; // Dismiss auto-detected (not a subscription)
}

export function SubscriptionCard({
  subscription,
  source = 'auto-detected',
  manualSubscription,
  onViewTransactions,
  onEdit,
  onDelete,
  onPauseResume,
  onCancel,
  onClaim,
  onDismiss,
}: SubscriptionCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const intervalLabel = {
    weekly: 'Weekly',
    'bi-weekly': 'Bi-weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    annual: 'Annual',
    irregular: 'Irregular',
  }[subscription.interval_type] || subscription.interval_type;

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
  const isPaused = manualSubscription?.status === 'paused';
  const isCancelled = manualSubscription?.status === 'cancelled' || !subscription.is_active;
  const isTrial = manualSubscription?.status === 'trial';

  // Calculate days until next billing
  const daysUntilBilling = subscription.next_expected_charge
    ? differenceInDays(new Date(subscription.next_expected_charge), new Date())
    : null;

  // Trial countdown
  const trialDaysLeft = manualSubscription?.trialEndDate
    ? differenceInDays(new Date(manualSubscription.trialEndDate), new Date())
    : null;

  const sourceLabel = {
    manual: { text: 'Manual', color: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800' },
    'auto-detected': { text: 'Auto-detected', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800' },
    merged: { text: 'Tracked', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800' },
  }[source];

  return (
    <div
      className={`bg-card border rounded-lg p-6 transition-all hover:shadow-md relative ${
        isCancelled
          ? 'border-border opacity-60'
          : isPaused
          ? 'border-yellow-300 dark:border-yellow-700'
          : isTrial
          ? 'border-blue-300 dark:border-blue-700'
          : 'border-border'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-lg font-semibold text-foreground">
              {subscription.merchant_name}
            </h3>
            
            {/* Source Badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${sourceLabel.color}`}>
              {source === 'auto-detected' && <Sparkles className="w-3 h-3" />}
              {source === 'manual' && <Edit className="w-3 h-3" />}
              {source === 'merged' && <LinkIcon className="w-3 h-3" />}
              {sourceLabel.text}
            </span>

            {isAiDetected && source === 'auto-detected' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-medium rounded-full border border-teal-200 dark:border-teal-800">
                <CheckCircle className="w-3 h-3" />
                AI Verified
              </span>
            )}

            {/* Status Badges */}
            {isPaused && (
              <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 text-xs font-medium rounded-full">
                Paused
              </span>
            )}
            {isCancelled && (
              <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-medium rounded-full">
                Cancelled
              </span>
            )}
            {isTrial && (
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                Trial
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

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-20 py-1">
                {onViewTransactions && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onViewTransactions();
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Transactions
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit();
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                )}
                {onPauseResume && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onPauseResume();
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                  >
                    {isPaused ? (
                      <>
                        <Play className="w-4 h-4" />
                        Resume
                      </>
                    ) : (
                      <>
                        <Pause className="w-4 h-4" />
                        Pause
                      </>
                    )}
                  </button>
                )}
                {onCancel && !isCancelled && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onCancel();
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-red-600"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel Subscription
                  </button>
                )}
                {onClaim && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onClaim();
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-teal-600"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Claim & Manage
                  </button>
                )}
                {onDismiss && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDismiss();
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-orange-50 dark:hover:bg-orange-950 flex items-center gap-2 text-orange-600"
                  >
                    <XOctagon className="w-4 h-4" />
                    Not a Subscription
                  </button>
                )}
                {onDelete && (
                  <>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete();
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-950 flex items-center gap-2 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confidence (only for auto-detected) */}
      {source === 'auto-detected' && (
        <div className="flex items-center justify-between mb-4 p-2 bg-muted/50 rounded-lg">
          <span className="text-xs text-muted-foreground">Detection Confidence</span>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${confidenceColor}`}>
              {confidenceLabel} ({(subscription.confidence * 100).toFixed(0)}%)
            </span>
            <div className="flex gap-0.5">
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
      )}

      {/* Trial Countdown */}
      {isTrial && trialDaysLeft !== null && trialDaysLeft > 0 && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">
              {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} left in trial
            </span>
          </div>
        </div>
      )}

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
        {subscription.next_expected_charge && !isCancelled && (
          <div className="flex items-center gap-3">
            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
              daysUntilBilling !== null && daysUntilBilling <= 3
                ? 'bg-red-50 dark:bg-red-950'
                : daysUntilBilling !== null && daysUntilBilling <= 7
                ? 'bg-yellow-50 dark:bg-yellow-950'
                : 'bg-purple-50 dark:bg-purple-950'
            }`}>
              <Calendar className={`w-5 h-5 ${
                daysUntilBilling !== null && daysUntilBilling <= 3
                  ? 'text-red-600 dark:text-red-400'
                  : daysUntilBilling !== null && daysUntilBilling <= 7
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-purple-600 dark:text-purple-400'
              }`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Next Charge</p>
              <p className="text-sm font-medium text-foreground">
                {format(new Date(subscription.next_expected_charge), 'MMM d')}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(subscription.next_expected_charge), { addSuffix: true })}
              </p>
            </div>
          </div>
        )}

        {/* Total Spent / Annual Cost */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-950 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {source === 'auto-detected' ? 'Total Spent' : 'Annual Cost'}
            </p>
            <p className="text-base font-semibold text-foreground">
              ${(source === 'auto-detected' ? subscription.total_spent : subscription.annual_cost_estimate).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="pt-4 border-t border-border space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {source === 'auto-detected' ? 'Occurrences' : 'Annual Cost'}:
          </span>
          <span className="font-medium text-foreground">
            {source === 'auto-detected'
              ? `${subscription.occurrence_count} charges`
              : `$${subscription.annual_cost_estimate.toFixed(2)}`}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">First Charge:</span>
          <span className="font-medium text-foreground">
            {format(new Date(subscription.first_charge), 'MMM d, yyyy')}
          </span>
        </div>
        {subscription.last_charge && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last Charge:</span>
            <span className="font-medium text-foreground">
              {format(new Date(subscription.last_charge), 'MMM d, yyyy')}
            </span>
          </div>
        )}

        {/* Reminder indicator for manual subscriptions */}
        {manualSubscription?.reminderEnabled && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Bell className="w-3 h-3" />
              Reminder:
            </span>
            <span className="font-medium text-foreground">
              {manualSubscription.reminderDaysBefore} days before
            </span>
          </div>
        )}

        {/* Payment method for manual subscriptions */}
        {manualSubscription?.paymentMethod && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Payment:</span>
            <span className="font-medium text-foreground">
              {manualSubscription.paymentMethod}
            </span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-border flex gap-2">
        {onViewTransactions && (
          <button
            onClick={onViewTransactions}
            className="flex-1 px-4 py-2 text-sm font-medium text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-950 transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Transactions
          </button>
        )}
        {onClaim && (
          <button
            onClick={onClaim}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-500 rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Claim & Manage
          </button>
        )}
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex-1 px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      {/* Warning for Low Confidence */}
      {subscription.confidence < 0.7 && source === 'auto-detected' && (
        <div className="mt-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            This subscription was detected with low confidence. Claim it to verify and manage manually.
          </p>
        </div>
      )}
    </div>
  );
}
