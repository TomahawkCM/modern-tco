'use client';

/**
 * Subscriptions Page
 *
 * Displays detected recurring subscriptions with:
 * - Active subscriptions with next charge dates
 * - Monthly cost breakdown
 * - Subscription history and trends
 * - Cancellation warnings
 *
 * Uses AI-powered merchant classification + pattern detection
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/budget-db';
import type { Transaction } from '@/types/budget';
import {
  detectSubscriptions,
  enrichSubscriptionsWithMerchantData,
  calculateMonthlySubscriptionCost,
  getActiveSubscriptions,
  getInactiveSubscriptions,
  type SubscriptionPattern,
} from '@/lib/subscription-detector';
import { SubscriptionCard } from '@/components/budget/SubscriptionCard';
import { Loader2, TrendingUp, DollarSign, Calendar, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export default function SubscriptionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  async function loadSubscriptions() {
    setIsLoading(true);

    try {
      // Load last 12 months of transactions for pattern detection
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const allTransactions = await db.transactions
        .where('date')
        .above(twelveMonthsAgo)
        .toArray();

      setTransactions(allTransactions);

      // Detect subscriptions
      const detected = detectSubscriptions(allTransactions, 'bmo');

      // Enrich with merchant catalog data (is_subscription flag)
      const enriched = await enrichSubscriptionsWithMerchantData(detected);

      setSubscriptions(enriched);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const activeSubscriptions = getActiveSubscriptions(subscriptions);
  const inactiveSubscriptions = getInactiveSubscriptions(subscriptions);
  const monthlyTotal = calculateMonthlySubscriptionCost(activeSubscriptions);
  const annualTotal = monthlyTotal * 12;

  const displayedSubscriptions = showInactive ? subscriptions : activeSubscriptions;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-teal-500 animate-spin" />
          <p className="text-muted-foreground">Analyzing subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Subscriptions</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                AI-detected recurring payments and subscriptions
              </p>
            </div>
            <button
              onClick={() => router.push('/budget-app')}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Active Subscriptions */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Active</h3>
              <TrendingUp className="w-5 h-5 text-teal-500" />
            </div>
            <p className="text-3xl font-bold text-foreground">{activeSubscriptions.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {inactiveSubscriptions.length} inactive
            </p>
          </div>

          {/* Monthly Cost */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Monthly</h3>
              <DollarSign className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              ${monthlyTotal.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Estimated cost</p>
          </div>

          {/* Annual Cost */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Annual</h3>
              <Calendar className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              ${annualTotal.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Projected spend</p>
          </div>

          {/* Upcoming Charges */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Next 7 Days</h3>
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {activeSubscriptions.filter(sub => {
                if (!sub.next_expected_charge) return false;
                const daysUntil = Math.floor(
                  (sub.next_expected_charge.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                return daysUntil >= 0 && daysUntil <= 7;
              }).length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Upcoming charges</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-border">
          <button
            onClick={() => setShowInactive(false)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              !showInactive
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Active ({activeSubscriptions.length})
          </button>
          <button
            onClick={() => setShowInactive(true)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              showInactive
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({subscriptions.length})
          </button>
        </div>

        {/* Subscriptions List */}
        {displayedSubscriptions.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No subscriptions detected
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Import your transactions to detect recurring subscriptions automatically.
              We analyze patterns like Netflix, Spotify, and other monthly services.
            </p>
            <button
              onClick={() => router.push('/budget-app/import')}
              className="mt-6 px-6 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
            >
              Import Transactions
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayedSubscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onViewTransactions={() => {
                  // Navigate to transactions page filtered by merchant
                  router.push(`/budget-app/transactions?merchant=${subscription.merchant_token}`);
                }}
              />
            ))}
          </div>
        )}

        {/* Help Text */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            How Subscription Detection Works
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            We analyze your transactions to detect recurring patterns (same merchant, similar amount, regular cadence).
            Subscriptions are enriched with AI data from OpenAI to identify services like Netflix, Spotify, etc.
            Detection requires at least 2 occurrences with 60%+ confidence in the pattern.
          </p>
        </div>
      </div>
    </div>
  );
}
