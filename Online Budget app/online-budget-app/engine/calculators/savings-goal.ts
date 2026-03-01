/**
 * Savings Goal Calculator
 *
 * Calculate savings projections with compound interest.
 * Supports two modes:
 * - "when": Given monthly contribution, calculate completion date
 * - "howMuch": Given target date, calculate required monthly contribution
 *
 * Ported from offline app — Decimal.js replaced with native Math.
 * All functions are pure, accept/return regular numbers.
 */

import type { SavingsGoalInput, SavingsGoalResult } from "./types";

/** Round to 2 decimal places (cents) */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Calculate savings goal projections
 *
 * @param input - Savings goal calculator inputs
 * @returns Calculated results including timeline or required contribution
 */
export function calculateSavingsGoal(
  input: SavingsGoalInput
): SavingsGoalResult {
  const {
    mode,
    goalAmount,
    currentSavings,
    monthlyContribution = 0,
    targetDate,
    expectedAnnualReturn = 0,
  } = input;

  const monthlyRate = expectedAnnualReturn / 100 / 12;
  const hasInterest = expectedAnnualReturn > 0;

  if (mode === "when") {
    return calculateWhenMode(
      goalAmount,
      currentSavings,
      monthlyContribution,
      monthlyRate,
      hasInterest
    );
  } else {
    return calculateHowMuchMode(
      goalAmount,
      currentSavings,
      targetDate!,
      monthlyRate,
      hasInterest
    );
  }
}

/**
 * Calculate when the goal will be reached given monthly contribution
 */
function calculateWhenMode(
  goalAmount: number,
  currentSavings: number,
  monthlyContribution: number,
  monthlyRate: number,
  hasInterest: boolean
): SavingsGoalResult {
  const projections: SavingsGoalResult["projections"] = [];
  let balance = currentSavings;
  let totalContributions = currentSavings;
  let totalInterest = 0;
  let month = 0;
  const maxMonths = 600; // 50 years cap

  // Add initial state
  projections.push({
    month: 0,
    date: new Date(),
    balance: round2(balance),
    contributions: round2(totalContributions),
    interest: 0,
  });

  // Project forward until goal is reached or max months
  while (balance < goalAmount && month < maxMonths) {
    month++;

    // Add monthly contribution
    balance += monthlyContribution;
    totalContributions += monthlyContribution;

    // Apply interest if any
    if (hasInterest) {
      const interest = balance * monthlyRate;
      balance += interest;
      totalInterest += interest;
    }

    // Add to projections (sample at intervals for large timelines)
    if (month <= 24 || month % 12 === 0 || balance >= goalAmount) {
      const projDate = new Date();
      projDate.setMonth(projDate.getMonth() + month);
      projections.push({
        month,
        date: projDate,
        balance: round2(balance),
        contributions: round2(totalContributions),
        interest: round2(totalInterest),
      });
    }
  }

  const completionDate = new Date();
  completionDate.setMonth(completionDate.getMonth() + month);

  const progressPercent =
    goalAmount > 0 ? Math.min(100, (currentSavings / goalAmount) * 100) : 0;

  return {
    monthsToGoal: month,
    completionDate,
    projectedAmount: round2(balance),
    totalContributions: round2(totalContributions),
    totalInterestEarned: round2(totalInterest),
    progressPercent: round2(progressPercent),
    projections,
  };
}

/**
 * Calculate required monthly contribution to reach goal by target date
 */
function calculateHowMuchMode(
  goalAmount: number,
  currentSavings: number,
  targetDate: Date,
  monthlyRate: number,
  hasInterest: boolean
): SavingsGoalResult {
  // Calculate months until target date
  const now = new Date();
  const months = Math.max(
    1,
    (targetDate.getFullYear() - now.getFullYear()) * 12 +
      (targetDate.getMonth() - now.getMonth())
  );

  let requiredMonthly: number;

  if (hasInterest) {
    // Future Value formula with compound interest
    // FV = PV * (1 + r)^n + PMT * ((1 + r)^n - 1) / r
    // Solve for PMT:
    // PMT = (FV - PV * (1 + r)^n) * r / ((1 + r)^n - 1)

    const compoundFactor = Math.pow(1 + monthlyRate, months);
    const futureValueOfCurrent = currentSavings * compoundFactor;
    const amountNeededFromContributions = goalAmount - futureValueOfCurrent;

    if (amountNeededFromContributions <= 0) {
      // Current savings will grow to meet goal
      requiredMonthly = 0;
    } else {
      const annuityFactor = (compoundFactor - 1) / monthlyRate;
      requiredMonthly = amountNeededFromContributions / annuityFactor;
    }
  } else {
    // Simple calculation without interest
    const amountNeeded = goalAmount - currentSavings;
    requiredMonthly = amountNeeded > 0 ? amountNeeded / months : 0;
  }

  // Generate projections with the calculated monthly contribution
  const monthlyContribution = Math.max(0, round2(requiredMonthly));
  const projections: SavingsGoalResult["projections"] = [];
  let balance = currentSavings;
  let totalContributions = currentSavings;
  let totalInterest = 0;

  projections.push({
    month: 0,
    date: new Date(),
    balance: round2(balance),
    contributions: round2(totalContributions),
    interest: 0,
  });

  for (let m = 1; m <= months; m++) {
    balance += monthlyContribution;
    totalContributions += monthlyContribution;

    if (hasInterest) {
      const interest = balance * monthlyRate;
      balance += interest;
      totalInterest += interest;
    }

    // Sample projections
    if (m <= 12 || m % 12 === 0 || m === months) {
      const projDate = new Date();
      projDate.setMonth(projDate.getMonth() + m);
      projections.push({
        month: m,
        date: projDate,
        balance: round2(balance),
        contributions: round2(totalContributions),
        interest: round2(totalInterest),
      });
    }
  }

  const progressPercent =
    goalAmount > 0 ? Math.min(100, (currentSavings / goalAmount) * 100) : 0;

  return {
    requiredMonthlyContribution: monthlyContribution,
    projectedAmount: round2(balance),
    totalContributions: round2(totalContributions),
    totalInterestEarned: round2(totalInterest),
    progressPercent: round2(progressPercent),
    projections,
  };
}
