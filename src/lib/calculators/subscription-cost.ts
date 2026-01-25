/**
 * Subscription Cost Calculator
 *
 * Analyze subscription costs with category breakdowns
 */

import { roundToCents, sumAmounts, divideAmount, multiplyAmount } from '@/lib/money';
import type {
  SubscriptionEntry,
  SubscriptionCostInput,
  SubscriptionCostResult,
  CategoryBreakdown,
  SubscriptionFrequency,
} from './types';

/**
 * Conversion factors to monthly cost
 */
const FREQUENCY_TO_MONTHLY: Record<SubscriptionFrequency, number> = {
  weekly: 52 / 12, // ~4.33 weeks per month
  biweekly: 26 / 12, // ~2.17 bi-weeks per month
  monthly: 1,
  quarterly: 1 / 3,
  annual: 1 / 12,
};

/**
 * Convert a subscription amount to monthly cost
 */
export function toMonthlyCost(amount: number, frequency: SubscriptionFrequency): number {
  return roundToCents(multiplyAmount(amount, FREQUENCY_TO_MONTHLY[frequency]));
}

/**
 * Convert a subscription amount to yearly cost
 */
export function toYearlyCost(amount: number, frequency: SubscriptionFrequency): number {
  return roundToCents(multiplyAmount(toMonthlyCost(amount, frequency), 12));
}

/**
 * Calculate subscription cost analysis
 *
 * @param input - List of subscriptions and optional income
 * @returns Cost breakdown and analysis
 */
export function calculateSubscriptionCost(input: SubscriptionCostInput): SubscriptionCostResult {
  const { subscriptions, monthlyIncome } = input;

  if (subscriptions.length === 0) {
    return createEmptyResult();
  }

  // Calculate monthly totals for each subscription
  const monthlyTotals = subscriptions.map((sub) => ({
    ...sub,
    monthlyAmount: toMonthlyCost(sub.amount, sub.frequency),
  }));

  // Calculate totals
  const totalMonthly = sumAmounts(monthlyTotals.map((s) => s.monthlyAmount));
  const totalYearly = roundToCents(multiplyAmount(totalMonthly, 12));
  const totalWeekly = roundToCents(divideAmount(totalMonthly, 52 / 12));
  const totalDaily = roundToCents(divideAmount(totalMonthly, 30.44)); // Avg days per month

  // Calculate essential vs non-essential
  const essentialSubs = monthlyTotals.filter((s) => s.isEssential);
  const nonEssentialSubs = monthlyTotals.filter((s) => !s.isEssential);
  const essentialMonthly = sumAmounts(essentialSubs.map((s) => s.monthlyAmount));
  const nonEssentialMonthly = sumAmounts(nonEssentialSubs.map((s) => s.monthlyAmount));

  // Group by category
  const byCategory = groupByCategory(subscriptions);

  // Calculate percent of income if provided
  const percentOfIncome =
    monthlyIncome && monthlyIncome > 0
      ? roundToCents((totalMonthly / monthlyIncome) * 100)
      : undefined;

  // Potential savings (non-essential yearly cost)
  const potentialYearlySavings = roundToCents(multiplyAmount(nonEssentialMonthly, 12));

  return {
    totalDaily,
    totalWeekly,
    totalMonthly,
    totalYearly,
    essentialMonthly,
    nonEssentialMonthly,
    percentOfIncome,
    byCategory,
    potentialYearlySavings,
  };
}

/**
 * Group subscriptions by category with totals
 */
function groupByCategory(subscriptions: SubscriptionEntry[]): CategoryBreakdown[] {
  const categoryMap = new Map<string, SubscriptionEntry[]>();

  subscriptions.forEach((sub) => {
    const category = sub.category || 'Uncategorized';
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(sub);
  });

  const breakdowns: CategoryBreakdown[] = [];

  categoryMap.forEach((subs, category) => {
    const monthlyAmounts = subs.map((s) => toMonthlyCost(s.amount, s.frequency));
    const monthly = sumAmounts(monthlyAmounts);

    breakdowns.push({
      category,
      monthly,
      yearly: roundToCents(multiplyAmount(monthly, 12)),
      count: subs.length,
      subscriptions: subs,
    });
  });

  // Sort by monthly cost descending
  return breakdowns.sort((a, b) => b.monthly - a.monthly);
}

/**
 * Create empty result for when there are no subscriptions
 */
function createEmptyResult(): SubscriptionCostResult {
  return {
    totalDaily: 0,
    totalWeekly: 0,
    totalMonthly: 0,
    totalYearly: 0,
    essentialMonthly: 0,
    nonEssentialMonthly: 0,
    byCategory: [],
    potentialYearlySavings: 0,
  };
}

/**
 * Generate a unique ID for a new subscription
 */
export function generateSubscriptionId(): string {
  return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Common subscription categories
 */
export const SUBSCRIPTION_CATEGORIES = [
  'Streaming',
  'Music',
  'Software',
  'Gaming',
  'News & Media',
  'Fitness',
  'Cloud Storage',
  'Food Delivery',
  'Professional',
  'Education',
  'Other',
] as const;
