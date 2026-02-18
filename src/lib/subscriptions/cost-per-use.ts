/**
 * Cost-Per-Use Calculator for Subscriptions
 *
 * Calculates the effective cost per use of subscriptions based on
 * usage tracking data. Helps identify underused subscriptions.
 */

import type { Subscription, BillingCycle } from "@/types/budget";

export interface CostPerUseResult {
  subscriptionId: string;
  name: string;
  monthlyAmount: number;
  usageCount: number;
  costPerUse: number;
  rating: "great" | "good" | "fair" | "poor";
}

/**
 * Convert billing amount to monthly equivalent.
 */
function toMonthlyAmount(amount: number, cycle: BillingCycle): number {
  switch (cycle) {
    case "weekly":
      return amount * (52 / 12);
    case "bi-weekly":
      return amount * (26 / 12);
    case "monthly":
      return amount;
    case "quarterly":
      return amount / 3;
    case "annual":
      return amount / 12;
    default:
      return amount;
  }
}

/**
 * Get expected monthly usage count based on usage frequency.
 */
function getExpectedMonthlyUses(frequency: Subscription["usageFrequency"]): number {
  switch (frequency) {
    case "daily":
      return 30;
    case "weekly":
      return 4;
    case "monthly":
      return 1;
    case "rarely":
      return 0.5;
    default:
      return 1;
  }
}

/**
 * Calculate cost per use for a single subscription.
 */
export function calculateCostPerUse(
  amount: number,
  billingCycle: BillingCycle,
  usageCount: number
): number {
  if (usageCount <= 0) return Infinity;
  const monthly = toMonthlyAmount(amount, billingCycle);
  return monthly / usageCount;
}

/**
 * Rate the value of a subscription based on cost per use.
 */
function rateValue(costPerUse: number): CostPerUseResult["rating"] {
  if (costPerUse <= 1) return "great";
  if (costPerUse <= 5) return "good";
  if (costPerUse <= 15) return "fair";
  return "poor";
}

/**
 * Rank subscriptions by cost-per-use (highest cost first).
 */
export function rankByCostPerUse(subscriptions: Subscription[]): CostPerUseResult[] {
  return subscriptions
    .filter((sub) => sub.status === "active" && sub.usageCount !== undefined)
    .map((sub) => {
      const monthlyAmount = toMonthlyAmount(sub.amount, sub.billingCycle);
      const usageCount = sub.usageCount ?? 0;
      const costPerUse = usageCount > 0 ? monthlyAmount / usageCount : Infinity;

      return {
        subscriptionId: sub.id,
        name: sub.name,
        monthlyAmount,
        usageCount,
        costPerUse: Number.isFinite(costPerUse) ? costPerUse : monthlyAmount,
        rating: rateValue(costPerUse),
      };
    })
    .sort((a, b) => b.costPerUse - a.costPerUse);
}

/**
 * Get subscriptions that are poor value (candidates for cancellation).
 */
export function getCancellationCandidates(subscriptions: Subscription[]): CostPerUseResult[] {
  return rankByCostPerUse(subscriptions).filter((r) => r.rating === "poor");
}
