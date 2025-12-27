'use client';

/**
 * Subscription Cost Analysis Component
 *
 * Provides visual analysis of subscription spending:
 * - Monthly/annual cost breakdown by category
 * - Cost distribution pie chart
 * - Savings suggestions
 * - Upcoming charges timeline
 */

import { useMemo, lazy, Suspense } from 'react';
import type { Subscription } from '@/types/budget';
import type { SubscriptionPattern } from '@/lib/subscription-detector';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Calendar,
  PieChart,
  BarChart2,
} from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';

interface SubscriptionCostChartProps {
  manualSubscriptions: Subscription[];
  autoDetectedPatterns: SubscriptionPattern[];
}

interface CategoryCost {
  name: string;
  monthly: number;
  annual: number;
  count: number;
  color: string;
}

interface SavingSuggestion {
  type: 'inactive' | 'duplicate' | 'high-cost' | 'unused-trial';
  title: string;
  description: string;
  potentialSavings: number;
  subscriptionIds: string[];
}

// Color palette for categories
const CATEGORY_COLORS = [
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#f97316', // orange
  '#ef4444', // red
  '#22c55e', // green
  '#eab308', // yellow
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#6366f1', // indigo
];

function ChartLoadingSkeleton() {
  return (
    <div className="w-full h-64 bg-muted/50 rounded-lg animate-pulse flex items-center justify-center">
      <span className="text-muted-foreground text-sm">Loading chart...</span>
    </div>
  );
}

export function SubscriptionCostChart({
  manualSubscriptions,
  autoDetectedPatterns,
}: SubscriptionCostChartProps) {
  // Calculate costs by category
  const categoryBreakdown = useMemo((): CategoryCost[] => {
    const categoryMap = new Map<string, { monthly: number; count: number }>();

    // Process manual subscriptions
    for (const sub of manualSubscriptions) {
      if (sub.status !== 'active' && sub.status !== 'trial') continue;

      const cat = sub.category || 'Uncategorized';
      const current = categoryMap.get(cat) || { monthly: 0, count: 0 };

      let monthlyCost = sub.amount;
      switch (sub.billingCycle) {
        case 'weekly': monthlyCost = sub.amount * 4.33; break;
        case 'bi-weekly': monthlyCost = sub.amount * 2.17; break;
        case 'quarterly': monthlyCost = sub.amount / 3; break;
        case 'annual': monthlyCost = sub.amount / 12; break;
      }

      categoryMap.set(cat, {
        monthly: current.monthly + monthlyCost,
        count: current.count + 1,
      });
    }

    // Process auto-detected patterns (excluding those merged with manual)
    const manualTokens = new Set(
      manualSubscriptions.filter(s => s.merchantToken).map(s => s.merchantToken?.toLowerCase())
    );

    for (const pattern of autoDetectedPatterns) {
      if (!pattern.is_active) continue;
      if (manualTokens.has(pattern.merchant_token.toLowerCase())) continue;

      const cat = pattern.category || 'Uncategorized';
      const current = categoryMap.get(cat) || { monthly: 0, count: 0 };

      let monthlyCost = pattern.average_amount;
      switch (pattern.interval_type) {
        case 'weekly': monthlyCost = pattern.average_amount * 4.33; break;
        case 'annual': monthlyCost = pattern.average_amount / 12; break;
      }

      categoryMap.set(cat, {
        monthly: current.monthly + monthlyCost,
        count: current.count + 1,
      });
    }

    // Convert to array and add colors
    return Array.from(categoryMap.entries())
      .map(([name, data], index) => ({
        name,
        monthly: data.monthly,
        annual: data.monthly * 12,
        count: data.count,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.monthly - a.monthly);
  }, [manualSubscriptions, autoDetectedPatterns]);

  // Calculate total costs
  const totals = useMemo(() => {
    const monthly = categoryBreakdown.reduce((sum, cat) => sum + cat.monthly, 0);
    return {
      monthly,
      annual: monthly * 12,
      count: categoryBreakdown.reduce((sum, cat) => sum + cat.count, 0),
    };
  }, [categoryBreakdown]);

  // Generate savings suggestions
  const suggestions = useMemo((): SavingSuggestion[] => {
    const suggestions: SavingSuggestion[] = [];

    // Check for inactive/cancelled subscriptions that might still be charging
    const inactivePatterns = autoDetectedPatterns.filter(p => !p.is_active);
    if (inactivePatterns.length > 0) {
      const totalInactive = inactivePatterns.reduce((sum, p) => {
        const monthly = p.interval_type === 'weekly' ? p.average_amount * 4.33 :
                       p.interval_type === 'annual' ? p.average_amount / 12 :
                       p.average_amount;
        return sum + monthly;
      }, 0);

      if (totalInactive > 0) {
        suggestions.push({
          type: 'inactive',
          title: 'Potentially cancelled subscriptions',
          description: `${inactivePatterns.length} subscription(s) haven't charged recently. Verify they're actually cancelled.`,
          potentialSavings: totalInactive,
          subscriptionIds: inactivePatterns.map(p => p.id),
        });
      }
    }

    // Check for trials ending soon
    const trialsSoon = manualSubscriptions.filter(s => {
      if (s.status !== 'trial' || !s.trialEndDate) return false;
      const daysLeft = differenceInDays(new Date(s.trialEndDate), new Date());
      return daysLeft >= 0 && daysLeft <= 7;
    });

    if (trialsSoon.length > 0) {
      const trialTotal = trialsSoon.reduce((sum, s) => sum + s.amount, 0);
      suggestions.push({
        type: 'unused-trial',
        title: 'Trials ending soon',
        description: `${trialsSoon.length} trial(s) ending in the next 7 days. Cancel if you're not using them.`,
        potentialSavings: trialTotal,
        subscriptionIds: trialsSoon.map(s => s.id),
      });
    }

    // Check for high-cost subscriptions (> 25% of total)
    const highCostThreshold = totals.monthly * 0.25;
    const highCost = [...manualSubscriptions, ...autoDetectedPatterns.filter(p => p.is_active)]
      .filter(sub => {
        const amount = 'billingCycle' in sub ? sub.amount :
                      sub.interval_type === 'annual' ? sub.average_amount / 12 :
                      sub.average_amount;
        return amount > highCostThreshold && amount > 50;
      });

    if (highCost.length > 0) {
      suggestions.push({
        type: 'high-cost',
        title: 'High-cost subscriptions',
        description: 'These subscriptions represent a large portion of your spending. Consider if you\'re getting full value.',
        potentialSavings: 0,
        subscriptionIds: highCost.map(s => s.id),
      });
    }

    return suggestions;
  }, [manualSubscriptions, autoDetectedPatterns, totals.monthly]);

  // Upcoming charges for next 30 days
  const upcomingCharges = useMemo(() => {
    const charges: { date: Date; name: string; amount: number }[] = [];
    const now = new Date();
    const thirtyDaysOut = addDays(now, 30);

    for (const sub of manualSubscriptions) {
      if (sub.status !== 'active' && sub.status !== 'trial') continue;
      const nextDate = new Date(sub.nextBillingDate);
      if (nextDate >= now && nextDate <= thirtyDaysOut) {
        charges.push({
          date: nextDate,
          name: sub.name,
          amount: sub.amount,
        });
      }
    }

    for (const pattern of autoDetectedPatterns) {
      if (!pattern.is_active || !pattern.next_expected_charge) continue;
      const nextDate = new Date(pattern.next_expected_charge);
      if (nextDate >= now && nextDate <= thirtyDaysOut) {
        // Skip if already covered by manual subscription
        const hasMerged = manualSubscriptions.some(
          s => s.merchantToken?.toLowerCase() === pattern.merchant_token.toLowerCase()
        );
        if (!hasMerged) {
          charges.push({
            date: nextDate,
            name: pattern.merchant_name,
            amount: pattern.average_amount,
          });
        }
      }
    }

    return charges.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [manualSubscriptions, autoDetectedPatterns]);

  // Data for pie chart
  const pieData = categoryBreakdown.map(cat => ({
    name: cat.name,
    value: cat.monthly,
    color: cat.color,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Monthly Cost</h3>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            ${totals.monthly.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {totals.count} active subscription{totals.count !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Annual Cost</h3>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            ${totals.annual.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Projected yearly spend
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Next 30 Days</h3>
            <Calendar className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            ${upcomingCharges.reduce((sum, c) => sum + c.amount, 0).toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {upcomingCharges.length} upcoming charge{upcomingCharges.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Cost by Category */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-teal-500" />
          Cost by Category
        </h3>

        {categoryBreakdown.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No active subscriptions to analyze
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="h-64">
              <Suspense fallback={<ChartLoadingSkeleton />}>
                <PieChartComponent data={pieData} />
              </Suspense>
            </div>

            {/* Category List */}
            <div className="space-y-3">
              {categoryBreakdown.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {cat.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({cat.count})
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      ${cat.monthly.toFixed(2)}/mo
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${cat.annual.toFixed(2)}/yr
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Savings Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Potential Savings
          </h3>

          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  suggestion.type === 'inactive'
                    ? 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
                    : suggestion.type === 'unused-trial'
                    ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
                    : 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-foreground flex items-center gap-2">
                      {suggestion.type === 'inactive' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                      {suggestion.type === 'unused-trial' && <Calendar className="w-4 h-4 text-blue-600" />}
                      {suggestion.type === 'high-cost' && <TrendingDown className="w-4 h-4 text-orange-600" />}
                      {suggestion.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {suggestion.description}
                    </p>
                  </div>
                  {suggestion.potentialSavings > 0 && (
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        ${suggestion.potentialSavings.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">/month</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Charges Timeline */}
      {upcomingCharges.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-purple-500" />
            Upcoming Charges (Next 30 Days)
          </h3>

          <div className="space-y-3">
            {upcomingCharges.slice(0, 10).map((charge, index) => {
              const daysUntil = differenceInDays(charge.date, new Date());
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      daysUntil <= 3
                        ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
                        : daysUntil <= 7
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <span className="text-sm font-bold">{daysUntil}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{charge.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(charge.date, 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-foreground">
                    ${charge.amount.toFixed(2)}
                  </p>
                </div>
              );
            })}

            {upcomingCharges.length > 10 && (
              <p className="text-sm text-muted-foreground text-center pt-2">
                +{upcomingCharges.length - 10} more charges
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Simple pie chart component (lazy loaded internally)
function PieChartComponent({ data }: { data: { name: string; value: number; color: string }[] }) {
  return (
    <Suspense fallback={<ChartLoadingSkeleton />}>
      <LazyPieChart data={data} />
    </Suspense>
  );
}

const LazyPieChart = lazy(() =>
  import('recharts').then((mod) => {
    const { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } = mod;
    
    const Chart = ({ data }: { data: { name: string; value: number; color: string }[] }) => (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(2)}/mo`, 'Cost']}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    );
    
    return { default: Chart };
  })
);

