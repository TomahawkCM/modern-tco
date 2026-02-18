/**
 * Emergency Fund Calculator
 *
 * Calculate emergency fund targets and timeline
 */

import { roundToCents, divideAmount, multiplyAmount, subtractAmounts } from "@/lib/money";
import type { EmergencyFundInput, EmergencyFundResult } from "./types";

/**
 * Calculate emergency fund projections
 *
 * @param input - Emergency fund calculator inputs
 * @returns Calculated results including timeline and progress
 */
export function calculateEmergencyFund(input: EmergencyFundInput): EmergencyFundResult {
  const { monthlyExpenses, targetMonths, currentSavings, monthlyContribution } = input;

  // Calculate target amount
  const targetAmount = roundToCents(multiplyAmount(monthlyExpenses, targetMonths));

  // Calculate amount still needed
  const amountNeeded = roundToCents(Math.max(0, subtractAmounts(targetAmount, currentSavings)));

  // Calculate months to reach goal
  let monthsToGoal = 0;
  if (amountNeeded > 0 && monthlyContribution > 0) {
    monthsToGoal = Math.ceil(divideAmount(amountNeeded, monthlyContribution));
  }

  // Calculate completion date
  const completionDate = new Date();
  completionDate.setMonth(completionDate.getMonth() + monthsToGoal);

  // Calculate progress percentage
  const progressPercent =
    targetAmount > 0 ? Math.min(100, roundToCents((currentSavings / targetAmount) * 100)) : 0;

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
