/**
 * Savings Goal Calculator
 *
 * Calculate savings projections with compound interest
 * Supports two modes:
 * - "when": Given monthly contribution, calculate completion date
 * - "howMuch": Given target date, calculate required monthly contribution
 */

import Decimal from 'decimal.js';
import { roundToCents } from '@/lib/money';
import type { SavingsGoalInput, SavingsGoalResult } from './types';

// Configure Decimal.js for financial precision
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/**
 * Calculate savings goal projections
 *
 * @param input - Savings goal calculator inputs
 * @returns Calculated results including timeline or required contribution
 */
export function calculateSavingsGoal(input: SavingsGoalInput): SavingsGoalResult {
  const {
    mode,
    goalAmount,
    currentSavings,
    monthlyContribution = 0,
    targetDate,
    expectedAnnualReturn = 0,
  } = input;

  const monthlyRate = new Decimal(expectedAnnualReturn).dividedBy(100).dividedBy(12);
  const hasInterest = expectedAnnualReturn > 0;

  if (mode === 'when') {
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
  monthlyRate: Decimal,
  hasInterest: boolean
): SavingsGoalResult {
  const projections: SavingsGoalResult['projections'] = [];
  const goal = new Decimal(goalAmount);
  let balance = new Decimal(currentSavings);
  let totalContributions = new Decimal(currentSavings);
  let totalInterest = new Decimal(0);
  let month = 0;
  const maxMonths = 600; // 50 years cap

  // Add initial state
  projections.push({
    month: 0,
    date: new Date(),
    balance: roundToCents(balance.toNumber()),
    contributions: roundToCents(totalContributions.toNumber()),
    interest: 0,
  });

  // Project forward until goal is reached or max months
  while (balance.lessThan(goal) && month < maxMonths) {
    month++;

    // Add monthly contribution
    balance = balance.plus(monthlyContribution);
    totalContributions = totalContributions.plus(monthlyContribution);

    // Apply interest if any
    if (hasInterest) {
      const interest = balance.times(monthlyRate);
      balance = balance.plus(interest);
      totalInterest = totalInterest.plus(interest);
    }

    // Add to projections (sample at intervals for large timelines)
    if (month <= 24 || month % 12 === 0 || balance.greaterThanOrEqualTo(goal)) {
      const projDate = new Date();
      projDate.setMonth(projDate.getMonth() + month);
      projections.push({
        month,
        date: projDate,
        balance: roundToCents(balance.toNumber()),
        contributions: roundToCents(totalContributions.toNumber()),
        interest: roundToCents(totalInterest.toNumber()),
      });
    }
  }

  const completionDate = new Date();
  completionDate.setMonth(completionDate.getMonth() + month);

  const progressPercent = goalAmount > 0
    ? Math.min(100, (currentSavings / goalAmount) * 100)
    : 0;

  return {
    monthsToGoal: month,
    completionDate,
    projectedAmount: roundToCents(balance.toNumber()),
    totalContributions: roundToCents(totalContributions.toNumber()),
    totalInterestEarned: roundToCents(totalInterest.toNumber()),
    progressPercent: roundToCents(progressPercent),
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
  monthlyRate: Decimal,
  hasInterest: boolean
): SavingsGoalResult {
  // Calculate months until target date
  const now = new Date();
  const months = Math.max(
    1,
    (targetDate.getFullYear() - now.getFullYear()) * 12 +
      (targetDate.getMonth() - now.getMonth())
  );

  const goal = new Decimal(goalAmount);
  const pv = new Decimal(currentSavings);

  let requiredMonthly: Decimal;

  if (hasInterest) {
    // Future Value formula with compound interest
    // FV = PV * (1 + r)^n + PMT * ((1 + r)^n - 1) / r
    // Solve for PMT:
    // PMT = (FV - PV * (1 + r)^n) * r / ((1 + r)^n - 1)

    const onePlusR = new Decimal(1).plus(monthlyRate);
    const compoundFactor = onePlusR.pow(months);
    const futureValueOfCurrent = pv.times(compoundFactor);
    const amountNeededFromContributions = goal.minus(futureValueOfCurrent);

    if (amountNeededFromContributions.lessThanOrEqualTo(0)) {
      // Current savings will grow to meet goal
      requiredMonthly = new Decimal(0);
    } else {
      const annuityFactor = compoundFactor.minus(1).dividedBy(monthlyRate);
      requiredMonthly = amountNeededFromContributions.dividedBy(annuityFactor);
    }
  } else {
    // Simple calculation without interest
    const amountNeeded = goal.minus(pv);
    requiredMonthly = amountNeeded.greaterThan(0)
      ? amountNeeded.dividedBy(months)
      : new Decimal(0);
  }

  // Generate projections with the calculated monthly contribution
  const monthlyContribution = Math.max(0, roundToCents(requiredMonthly.toNumber()));
  const projections: SavingsGoalResult['projections'] = [];
  let balance = new Decimal(currentSavings);
  let totalContributions = new Decimal(currentSavings);
  let totalInterest = new Decimal(0);

  projections.push({
    month: 0,
    date: new Date(),
    balance: roundToCents(balance.toNumber()),
    contributions: roundToCents(totalContributions.toNumber()),
    interest: 0,
  });

  for (let month = 1; month <= months; month++) {
    balance = balance.plus(monthlyContribution);
    totalContributions = totalContributions.plus(monthlyContribution);

    if (hasInterest) {
      const interest = balance.times(monthlyRate);
      balance = balance.plus(interest);
      totalInterest = totalInterest.plus(interest);
    }

    // Sample projections
    if (month <= 12 || month % 12 === 0 || month === months) {
      const projDate = new Date();
      projDate.setMonth(projDate.getMonth() + month);
      projections.push({
        month,
        date: projDate,
        balance: roundToCents(balance.toNumber()),
        contributions: roundToCents(totalContributions.toNumber()),
        interest: roundToCents(totalInterest.toNumber()),
      });
    }
  }

  const progressPercent = goalAmount > 0
    ? Math.min(100, (currentSavings / goalAmount) * 100)
    : 0;

  return {
    requiredMonthlyContribution: monthlyContribution,
    projectedAmount: roundToCents(balance.toNumber()),
    totalContributions: roundToCents(totalContributions.toNumber()),
    totalInterestEarned: roundToCents(totalInterest.toNumber()),
    progressPercent: roundToCents(progressPercent),
    projections,
  };
}
