/**
 * Emergency Fund Calculator
 *
 * Calculate emergency fund targets and timeline.
 * Ported from offline app — money helpers replaced with plain arithmetic.
 * All functions are pure, accept/return regular numbers.
 */

import type { EmergencyFundInput, EmergencyFundResult } from "./types";

/** Round to 2 decimal places (cents) */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Calculate emergency fund projections
 *
 * @param input - Emergency fund calculator inputs
 * @returns Calculated results including timeline and progress
 */
export function calculateEmergencyFund(
  input: EmergencyFundInput
): EmergencyFundResult {
  const { monthlyExpenses, targetMonths, currentSavings, monthlyContribution } =
    input;

  // Calculate target amount
  const targetAmount = round2(monthlyExpenses * targetMonths);

  // Calculate amount still needed
  const amountNeeded = round2(Math.max(0, targetAmount - currentSavings));

  // Calculate months to reach goal
  let monthsToGoal = 0;
  if (amountNeeded > 0 && monthlyContribution > 0) {
    monthsToGoal = Math.ceil(amountNeeded / monthlyContribution);
  }

  // Calculate completion date
  const completionDate = new Date();
  completionDate.setMonth(completionDate.getMonth() + monthsToGoal);

  // Calculate progress percentage
  const progressPercent =
    targetAmount > 0
      ? Math.min(100, round2((currentSavings / targetAmount) * 100))
      : 0;

  // Check if goal is already met
  const isGoalMet = currentSavings >= targetAmount;

  return {
    targetAmount,
    amountNeeded,
    monthsToGoal,
    completionDate,
    progressPercent,
    isGoalMet,
  };
}

/**
 * Get recommended emergency fund months based on employment type
 *
 * @param isStableEmployment - Whether the person has stable employment
 * @param hasDependents - Whether the person has dependents
 * @param isOnlyIncomeEarner - Whether this is the only income earner
 * @returns Recommended number of months of expenses
 */
export function getRecommendedMonths(
  isStableEmployment: boolean,
  hasDependents: boolean,
  isOnlyIncomeEarner: boolean
): number {
  let months = 3; // Baseline

  if (!isStableEmployment) {
    months += 3; // Freelance/contract/variable income
  }

  if (hasDependents) {
    months += 1;
  }

  if (isOnlyIncomeEarner) {
    months += 2;
  }

  return Math.min(12, months); // Cap at 12 months
}
