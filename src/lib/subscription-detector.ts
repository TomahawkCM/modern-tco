/**
 * Subscription Detection Service
 *
 * Analyzes transaction patterns to identify recurring subscriptions.
 * Combines merchant tokens, recurrence patterns, and AI is_subscription flag.
 *
 * Detection Criteria:
 * - Same merchant token (normalized)
 * - Similar amounts (±10% variance)
 * - Regular cadence (weekly, monthly, annual)
 * - Minimum 2 occurrences
 *
 * Privacy: Only uses merchant tokens and aggregated statistics
 */

import type { Transaction } from '@/types/budget';
import { extractMerchantToken } from './merchant-tokenizer';
import { differenceInDays, differenceInCalendarMonths, parseISO } from 'date-fns';

export interface SubscriptionPattern {
  id: string;
  merchant_token: string;
  merchant_name: string;
  category: string | null;
  subcategory: string | null;

  // Financial details
  average_amount: number;
  min_amount: number;
  max_amount: number;
  currency: string;

  // Recurrence details
  interval_type: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'annual' | 'irregular';
  interval_days: number; // Average days between charges
  confidence: number; // 0-1 confidence in subscription detection

  // History
  occurrence_count: number;
  first_charge: Date;
  last_charge: Date;
  next_expected_charge?: Date;

  // Metadata
  is_active: boolean;
  is_subscription_merchant: boolean; // From merchant catalog
  transaction_ids: string[];

  // Analytics
  total_spent: number;
  annual_cost_estimate: number;
}

interface RecurrenceAnalysis {
  intervals: number[]; // Days between transactions
  average_interval: number;
  variance: number;
  regularity_score: number; // 0-1, higher = more regular
}

/**
 * Detect subscriptions from a list of transactions
 */
export function detectSubscriptions(
  transactions: Transaction[],
  bankType: 'bmo' | 'generic' = 'bmo'
): SubscriptionPattern[] {
  // Step 1: Group transactions by merchant token
  const merchantGroups = groupByMerchant(transactions, bankType);

  // Step 2: Analyze each group for subscription patterns
  const subscriptions: SubscriptionPattern[] = [];

  for (const [merchantToken, txs] of merchantGroups.entries()) {
    const pattern = analyzeSubscriptionPattern(merchantToken, txs);

    if (pattern && pattern.confidence >= 0.6) {
      subscriptions.push(pattern);
    }
  }

  // Step 3: Sort by confidence (highest first)
  return subscriptions.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Group transactions by merchant token
 */
function groupByMerchant(
  transactions: Transaction[],
  bankType: 'bmo' | 'generic'
): Map<string, Transaction[]> {
  const groups = new Map<string, Transaction[]>();

  for (const tx of transactions) {
    // Only process expenses (negative amounts)
    if (tx.amount >= 0) continue;

    const merchantToken = extractMerchantToken(tx.description, bankType);
    if (!merchantToken) continue;

    const existing = groups.get(merchantToken) || [];
    existing.push(tx);
    groups.set(merchantToken, existing);
  }

  return groups;
}

/**
 * Analyze a group of transactions for subscription pattern
 */
function analyzeSubscriptionPattern(
  merchantToken: string,
  transactions: Transaction[]
): SubscriptionPattern | null {
  // Need at least 2 transactions to detect pattern
  if (transactions.length < 2) return null;

  // Sort by date (oldest first)
  const sorted = [...transactions].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Analyze recurrence
  const recurrence = analyzeRecurrence(sorted);
  if (recurrence.regularity_score < 0.5) return null; // Too irregular

  // Analyze amounts
  const amounts = sorted.map(tx => Math.abs(tx.amount));
  const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
  const minAmount = Math.min(...amounts);
  const maxAmount = Math.max(...amounts);

  // Check amount consistency (±10% variance)
  const amountVariance = (maxAmount - minAmount) / avgAmount;
  if (amountVariance > 0.1) {
    // High variance - might not be subscription
    // But give it a lower confidence score
    recurrence.regularity_score *= 0.7;
  }

  // Determine interval type
  const intervalType = categorizeInterval(recurrence.average_interval);

  // Calculate confidence
  const confidence = calculateConfidence(
    recurrence.regularity_score,
    transactions.length,
    amountVariance
  );

  // Estimate next charge
  const lastCharge = sorted[sorted.length - 1].date;
  const nextExpected = new Date(lastCharge);
  nextExpected.setDate(nextExpected.getDate() + recurrence.average_interval);

  // Check if active (last charge within 2x interval)
  const daysSinceLastCharge = differenceInDays(new Date(), lastCharge);
  const isActive = daysSinceLastCharge < (recurrence.average_interval * 2);

  // Calculate annual cost
  const annualCost = intervalType === 'monthly'
    ? avgAmount * 12
    : intervalType === 'annual'
    ? avgAmount
    : intervalType === 'weekly'
    ? avgAmount * 52
    : intervalType === 'bi-weekly'
    ? avgAmount * 26
    : intervalType === 'quarterly'
    ? avgAmount * 4
    : avgAmount * (365 / recurrence.average_interval);

  return {
    id: `sub_${merchantToken}_${Date.now()}`,
    merchant_token: merchantToken,
    merchant_name: sorted[0].description.split(' ').slice(0, 3).join(' '), // First 3 words
    category: sorted[0].category,
    subcategory: sorted[0].subcategory,

    average_amount: avgAmount,
    min_amount: minAmount,
    max_amount: maxAmount,
    currency: 'CAD', // Could be dynamic

    interval_type: intervalType,
    interval_days: Math.round(recurrence.average_interval),
    confidence,

    occurrence_count: transactions.length,
    first_charge: sorted[0].date,
    last_charge: sorted[sorted.length - 1].date,
    next_expected_charge: isActive ? nextExpected : undefined,

    is_active: isActive,
    is_subscription_merchant: false, // Updated later from merchant catalog
    transaction_ids: sorted.map(tx => tx.id),

    total_spent: amounts.reduce((sum, amt) => sum + amt, 0),
    annual_cost_estimate: annualCost,
  };
}

/**
 * Analyze recurrence pattern of transactions
 */
function analyzeRecurrence(transactions: Transaction[]): RecurrenceAnalysis {
  const intervals: number[] = [];

  for (let i = 1; i < transactions.length; i++) {
    const prev = new Date(transactions[i - 1].date);
    const curr = new Date(transactions[i].date);
    const daysDiff = differenceInDays(curr, prev);
    intervals.push(daysDiff);
  }

  const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;

  // Calculate variance
  const variance = intervals.reduce((sum, val) => {
    const diff = val - avgInterval;
    return sum + (diff * diff);
  }, 0) / intervals.length;

  const stdDev = Math.sqrt(variance);

  // Regularity score: lower std dev = more regular
  // Normalize to 0-1 scale (perfect regularity = 1)
  const regularityScore = Math.max(0, 1 - (stdDev / avgInterval));

  return {
    intervals,
    average_interval: avgInterval,
    variance,
    regularity_score: regularityScore,
  };
}

/**
 * Categorize interval into weekly/bi-weekly/monthly/quarterly/annual
 */
function categorizeInterval(days: number): 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'annual' | 'irregular' {
  if (days >= 5 && days <= 9) return 'weekly'; // ~7 days ±2
  if (days >= 12 && days <= 16) return 'bi-weekly'; // ~14 days ±2
  if (days >= 25 && days <= 35) return 'monthly'; // ~30 days ±5
  if (days >= 85 && days <= 95) return 'quarterly'; // ~90 days ±5
  if (days >= 350 && days <= 380) return 'annual'; // ~365 days ±15
  return 'irregular';
}

/**
 * Calculate subscription confidence score
 */
function calculateConfidence(
  regularityScore: number,
  occurrenceCount: number,
  amountVariance: number
): number {
  // Base confidence from regularity
  let confidence = regularityScore;

  // Boost for more occurrences (caps at 5)
  const occurrenceBoost = Math.min(occurrenceCount / 5, 1) * 0.2;
  confidence += occurrenceBoost;

  // Penalize for amount variance
  const variancePenalty = amountVariance * 0.3;
  confidence -= variancePenalty;

  // Clamp to 0-1
  return Math.max(0, Math.min(1, confidence));
}

/**
 * Enrich subscriptions with merchant catalog data
 */
export async function enrichSubscriptionsWithMerchantData(
  subscriptions: SubscriptionPattern[]
): Promise<SubscriptionPattern[]> {
  const enriched: SubscriptionPattern[] = [];

  for (const sub of subscriptions) {
    try {
      // Call merchant resolution API
      const response = await fetch(
        `/api/merchants/resolve?token=${encodeURIComponent(sub.merchant_token)}`
      );

      if (response.ok) {
        const data = await response.json();

        if (data.success) {
          // Update with merchant catalog data
          enriched.push({
            ...sub,
            merchant_name: data.canonical_name || sub.merchant_name,
            category: data.category || sub.category,
            subcategory: data.subcategory || sub.subcategory,
            is_subscription_merchant: data.is_subscription || false,
            // Boost confidence if merchant catalog says it's a subscription
            confidence: data.is_subscription
              ? Math.min(sub.confidence + 0.15, 1.0)
              : sub.confidence,
          });
        } else {
          enriched.push(sub);
        }
      } else {
        enriched.push(sub);
      }
    } catch (error) {
      console.error(`Failed to enrich subscription ${sub.merchant_token}:`, error);
      enriched.push(sub);
    }
  }

  return enriched;
}

/**
 * Get subscription by merchant token
 */
export function findSubscriptionByMerchant(
  subscriptions: SubscriptionPattern[],
  merchantToken: string
): SubscriptionPattern | undefined {
  return subscriptions.find(sub =>
    sub.merchant_token.toUpperCase() === merchantToken.toUpperCase()
  );
}

/**
 * Calculate total monthly subscription cost
 */
export function calculateMonthlySubscriptionCost(
  subscriptions: SubscriptionPattern[]
): number {
  return subscriptions
    .filter(sub => sub.is_active)
    .reduce((total, sub) => {
      if (sub.interval_type === 'monthly') {
        return total + sub.average_amount;
      } else if (sub.interval_type === 'annual') {
        return total + (sub.average_amount / 12);
      } else if (sub.interval_type === 'weekly') {
        return total + (sub.average_amount * 4.33); // avg weeks per month
      } else if (sub.interval_type === 'bi-weekly') {
        return total + (sub.average_amount * 2.17); // avg bi-weekly periods per month
      } else if (sub.interval_type === 'quarterly') {
        return total + (sub.average_amount / 3);
      } else {
        // Irregular - estimate based on interval
        return total + (sub.average_amount * (30 / sub.interval_days));
      }
    }, 0);
}

/**
 * Filter active subscriptions
 */
export function getActiveSubscriptions(
  subscriptions: SubscriptionPattern[]
): SubscriptionPattern[] {
  return subscriptions.filter(sub => sub.is_active);
}

/**
 * Filter inactive/cancelled subscriptions
 */
export function getInactiveSubscriptions(
  subscriptions: SubscriptionPattern[]
): SubscriptionPattern[] {
  return subscriptions.filter(sub => !sub.is_active);
}
