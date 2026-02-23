/**
 * Narrator functions — one per insight type.
 *
 * Each narrator orchestrates:
 * 1. Calls matching context builder (JSON serialization)
 * 2. Passes JSON string to callNarrative (LLM call)
 * 3. Returns NarrativeResult
 *
 * No financial math. No DB access. No engine calls.
 * No numeric modification. No aggregation. No inference.
 */
import type { SpendingTrend } from "../engine/insights/spending-trends";
import type { SpendingAnomaly } from "../engine/insights/anomaly-detection";
import type { DetectedSubscription } from "../engine/insights/subscription-detection";
import type { AffordabilityResult } from "../engine/insights/affordability";
import type { BudgetProgressItem } from "../engine/budgeting/budget-progress";
import type { NarrativeResult } from "./types";
import { callNarrative } from "./client";
import {
  buildMonthlySummaryContext,
  buildAnomalyContext,
  buildSubscriptionContext,
  buildBudgetRiskContext,
  buildAffordabilityContext,
} from "./context-builders";

export async function narrateMonthlySummary(
  trends: readonly SpendingTrend[],
  currency: string
): Promise<NarrativeResult> {
  const context = buildMonthlySummaryContext(trends, currency);
  return callNarrative(
    `Explain these spending trends in 2-4 sentences. Focus on the most significant changes.\n\n${context}`
  );
}

export async function narrateAnomalies(
  anomalies: readonly SpendingAnomaly[],
  currency: string
): Promise<NarrativeResult> {
  const context = buildAnomalyContext(anomalies, currency);
  return callNarrative(
    `Explain these spending anomalies in 2-4 sentences. Note which categories changed significantly.\n\n${context}`
  );
}

export async function narrateSubscriptions(
  subscriptions: readonly DetectedSubscription[],
  currency: string
): Promise<NarrativeResult> {
  const context = buildSubscriptionContext(subscriptions, currency);
  return callNarrative(
    `Summarize these detected subscriptions in 2-4 sentences. Mention the total count and highlight the largest.\n\n${context}`
  );
}

export async function narrateBudgetRisk(
  progress: readonly BudgetProgressItem[],
  currency: string
): Promise<NarrativeResult> {
  const context = buildBudgetRiskContext(progress, currency);
  return callNarrative(
    `Explain this budget status in 2-4 sentences. Note any categories that are over budget or close to their limit.\n\n${context}`
  );
}

export async function narrateAffordability(
  result: AffordabilityResult,
  currency: string,
  itemDescription: string,
  isRecurring: boolean
): Promise<NarrativeResult> {
  const context = buildAffordabilityContext(result, currency, itemDescription, isRecurring);
  return callNarrative(
    `Explain this affordability assessment in 2-4 sentences. State whether the item is affordable and the comfort level.\n\n${context}`
  );
}
