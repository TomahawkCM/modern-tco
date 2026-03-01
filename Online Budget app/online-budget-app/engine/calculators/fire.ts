/**
 * FIRE (Financial Independence, Retire Early) Calculator Engine
 *
 * Calculates the FIRE number, years to FIRE, and savings rate needed.
 * Ported from offline app — Decimal.js replaced with native Math.
 * All functions are pure, accept/return regular numbers.
 */

import type { FIREInput, FIREResult, FIRETimelinePoint } from "./types";

/** Round to 2 decimal places (cents) */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Calculate FIRE (Financial Independence, Retire Early) projections.
 */
export function calculateFIRE(input: FIREInput): FIREResult {
  const {
    currentAge,
    annualIncome,
    annualExpenses,
    currentSavings,
    expectedReturn,
    safeWithdrawalRate = 4.0,
    inflationRate = 3.0,
  } = input;

  // FIRE Number = annual expenses / safe withdrawal rate
  const fireNumber = round2(annualExpenses / (safeWithdrawalRate / 100));

  // Lean FIRE (50% expenses) and Fat FIRE (200% expenses)
  const leanFIRENumber = round2(fireNumber * 0.5);
  const fatFIRENumber = round2(fireNumber * 2);

  // Annual savings
  const annualSavings = round2(Math.max(0, annualIncome - annualExpenses));
  const monthlySavings = round2(annualSavings / 12);

  // Savings rate
  const savingsRate =
    annualIncome > 0
      ? Math.round((annualSavings / annualIncome) * 100 * 10) / 10
      : 0;

  // Check if already FIRE
  const alreadyFIRE = currentSavings >= fireNumber;

  // Real return rate (adjusted for inflation)
  const realReturn =
    (1 + expectedReturn / 100) / (1 + inflationRate / 100) - 1;

  // Project year-by-year to find FIRE date
  const maxYears = 80;
  const timeline: FIRETimelinePoint[] = [];
  let balance = currentSavings;
  let yearsToFIRE = 0;
  let fireReached = alreadyFIRE;

  for (let year = 0; year <= maxYears; year++) {
    const age = currentAge + year;

    // Inflation-adjusted FIRE target at this year
    const inflationFactor = Math.pow(1 + inflationRate / 100, year);
    const fireTarget = round2(fireNumber * inflationFactor);

    const reachedThisYear = balance >= fireTarget;

    if (!fireReached && reachedThisYear) {
      fireReached = true;
      yearsToFIRE = year;
    }

    timeline.push({
      age,
      year,
      balance: round2(balance),
      annualSavings: year === 0 ? 0 : annualSavings,
      fireTarget,
      fireReached: reachedThisYear,
    });

    if (fireReached && year > yearsToFIRE + 5) break;

    // Grow balance: returns + savings (inflation-adjusted savings)
    const yearSavings = annualSavings * inflationFactor;
    const growth = balance * (expectedReturn / 100);
    balance = balance + growth + yearSavings;
  }

  // If never reached FIRE
  if (!fireReached) {
    yearsToFIRE = maxYears;
  }

  const fireAge = currentAge + yearsToFIRE;

  // Annual passive income at FIRE
  const annualPassiveIncome = round2(fireNumber * (safeWithdrawalRate / 100));

  // Coast FIRE: how much you need NOW so that compound growth alone reaches FIRE by 65
  const yearsTo65 = Math.max(0, 65 - currentAge);
  let coastFIRENumber = 0;
  if (yearsTo65 > 0 && expectedReturn > 0) {
    const coastFactor = Math.pow(1 + realReturn, yearsTo65);
    coastFIRENumber = round2(fireNumber / coastFactor);
  } else {
    coastFIRENumber = fireNumber;
  }

  const coastFIREReached = currentSavings >= coastFIRENumber;

  return {
    fireNumber,
    yearsToFIRE,
    fireAge,
    savingsRate,
    annualSavings,
    monthlySavings,
    alreadyFIRE,
    annualPassiveIncome,
    coastFIRENumber,
    coastFIREReached,
    leanFIRENumber,
    fatFIRENumber,
    timeline,
  };
}
