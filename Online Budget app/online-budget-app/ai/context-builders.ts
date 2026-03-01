/**
 * Context builders — serialize engine output to JSON strings for LLM consumption.
 *
 * Pure functions. No DB, no AI calls, no side effects.
 * No financial math. No numeric derivation. No aggregation.
 * No filtering. No grouping. No inference.
 *
 * Each builder accepts typed engine output, selects/renames fields,
 * and returns a JSON string via JSON.stringify().
 *
 * All numeric values are passed through unchanged from the engine.
 * Values are in minor units (cents) as computed by the engine.
 */
import type { SpendingTrend } from "../engine/insights/spending-trends";
import type { SpendingAnomaly } from "../engine/insights/anomaly-detection";
import type { DetectedSubscription } from "../engine/insights/subscription-detection";
import type { AffordabilityResult } from "../engine/insights/affordability";
import type { BudgetProgressItem } from "../engine/budgeting/budget-progress";

export function buildMonthlySummaryContext(
  trends: readonly SpendingTrend[],
  currency: string
): string {
  return JSON.stringify({
    type: "monthly_spending_summary",
    currency,
    unit: "minor",
    trends: trends.map((t) => ({
      category: t.categoryKey,
      currentAmountMinor: t.currentMinor,
      baselineAverageMinor: t.baselineAvgMinor,
      percentChange: t.percentChange,
    })),
  });
}

export function buildAnomalyContext(
  anomalies: readonly SpendingAnomaly[],
  currency: string
): string {
  return JSON.stringify({
    type: "spending_anomalies",
    currency,
    unit: "minor",
    anomalies: anomalies.map((a) => ({
      category: a.categoryKey,
      currentAmountMinor: a.currentMinor,
      baselineAverageMinor: a.baselineAvgMinor,
      deviationPercent: a.deviationPercent,
      direction: a.direction,
    })),
  });
}

export function buildSubscriptionContext(
  subscriptions: readonly DetectedSubscription[],
  currency: string
): string {
  return JSON.stringify({
    type: "detected_subscriptions",
    currency,
    unit: "minor",
    subscriptions: subscriptions.map((s) => ({
      merchant: s.merchantToken,
      averageAmountMinor: s.averageAmountMinor,
      occurrences: s.occurrences,
      latestDate: s.latestDate,
      isActive: s.isActive,
    })),
  });
}

export function buildBudgetRiskContext(
  progress: readonly BudgetProgressItem[],
  currency: string
): string {
  return JSON.stringify({
    type: "budget_risk_assessment",
    currency,
    unit: "minor",
    budgets: progress.map((b) => ({
      category: b.categoryKey,
      limitMinor: b.limitMinor,
      spentMinor: b.spentMinor,
      remainingMinor: b.remainingMinor,
      percentUsed: b.percentUsed,
      isOverBudget: b.isOverBudget,
    })),
  });
}

export function buildAffordabilityContext(
  result: AffordabilityResult,
  currency: string,
  itemDescription: string,
  isRecurring: boolean
): string {
  return JSON.stringify({
    type: "affordability_check",
    currency,
    unit: "minor",
    item: itemDescription,
    isRecurring,
    canAfford: result.canAfford,
    monthlySurplusMinor: result.monthlySuplusMinor,
    remainingAfterMinor: result.remainingAfterMinor,
    shortfallMinor: result.shortfallMinor,
    comfortLevel: result.comfortLevel,
  });
}
