/**
 * Affordability calculator — answers "Can I afford X?"
 *
 * Pure function — no DB, no AI, no side effects.
 * No deep simulation or long-term forecasting.
 */

import type { IncomeExpenseSummary } from "../aggregation/types";
import { absMinor } from "../money";

export interface AffordabilityInput {
  readonly monthlyIncomeMinor: number;
  readonly monthlyExpensesMinor: number;
  readonly requestedAmountMinor: number;
  readonly isRecurring: boolean;
}

export interface AffordabilityResult {
  readonly canAfford: boolean;
  readonly monthlySuplusMinor: number;
  /** Minor units remaining after the purchase. Only set when canAfford is true. */
  readonly remainingAfterMinor: number;
  /** Minor units short. Only set when canAfford is false. */
  readonly shortfallMinor: number;
  readonly comfortLevel: "comfortable" | "tight" | "unaffordable";
}

export function computeAffordability(
  input: AffordabilityInput
): AffordabilityResult {
  const surplus = Math.max(0, input.monthlyIncomeMinor - input.monthlyExpensesMinor);

  // For recurring, the cost is the monthly amount
  // For one-time, we compare against the monthly surplus
  const cost = input.requestedAmountMinor;
  const canAfford = cost <= surplus;
  const remainingAfter = canAfford ? surplus - cost : 0;
  const shortfall = canAfford ? 0 : cost - surplus;

  // Comfort level based on remaining as % of income
  let comfortLevel: "comfortable" | "tight" | "unaffordable";
  if (!canAfford) {
    comfortLevel = "unaffordable";
  } else if (input.monthlyIncomeMinor > 0 && remainingAfter / input.monthlyIncomeMinor > 0.2) {
    comfortLevel = "comfortable";
  } else {
    comfortLevel = "tight";
  }

  return {
    canAfford,
    monthlySuplusMinor: surplus,
    remainingAfterMinor: remainingAfter,
    shortfallMinor: shortfall,
    comfortLevel,
  };
}

/**
 * Compute affordability from an IncomeExpenseSummary.
 *
 * Thin adapter: applies absMinor to totalExpense (sign conversion),
 * then delegates to computeAffordability.
 * Handles the financial interpretation (negative-to-positive expense conversion)
 * so the server layer does not need to.
 *
 * @param summary             Income/expense summary from aggregateIncomeExpense
 * @param requestedAmountMinor Amount the user wants to spend (positive)
 * @param isRecurring          Whether the expense is monthly recurring
 */
export function computeAffordabilityFromSummary(
  summary: IncomeExpenseSummary,
  requestedAmountMinor: number,
  isRecurring: boolean
): AffordabilityResult {
  return computeAffordability({
    monthlyIncomeMinor: summary.totalIncome.amountMinor,
    monthlyExpensesMinor: absMinor(summary.totalExpense).amountMinor,
    requestedAmountMinor,
    isRecurring,
  });
}
