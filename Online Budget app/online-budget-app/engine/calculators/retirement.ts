/**
 * Retirement Planner Engine
 *
 * Two-phase simulation: accumulation (saving) + withdrawal (spending).
 * Ported from offline app — Decimal.js replaced with native Math.
 * All functions accept/return regular numbers (major units).
 */

import type {
  RetirementInput,
  RetirementResult,
  RetirementTimelinePoint,
} from "./types";

/** Round to 2 decimal places (cents) */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Default assumptions for retirement planning
 */
export const DEFAULT_ASSUMPTIONS = {
  preRetirementReturn: 7.0,
  postRetirementReturn: 5.0,
  inflationRate: 3.0,
  lifeExpectancy: 90,
  socialSecurityMonthly: 1800,
  socialSecurityStartAge: 67,
} as const;

/**
 * Calculate retirement projections.
 *
 * Phase 1 (Accumulation): Grow current savings + monthly contributions at preRetirementReturn
 * Phase 2 (Withdrawal): Draw down at desiredMonthlyIncome (inflation-adjusted),
 *   grow remaining at postRetirementReturn, add Social Security when eligible
 */
export function calculateRetirement(input: RetirementInput): RetirementResult {
  const {
    currentAge,
    retirementAge,
    currentSavings,
    monthlyContribution,
    desiredMonthlyIncome,
    preRetirementReturn,
    postRetirementReturn,
    inflationRate,
    lifeExpectancy,
    socialSecurityMonthly,
    socialSecurityStartAge,
  } = input;

  const timeline: RetirementTimelinePoint[] = [];

  // ==========================================
  // Phase 1: Accumulation
  // ==========================================
  const yearsToRetirement = Math.max(0, retirementAge - currentAge);
  const preReturnMonthly = preRetirementReturn / 100 / 12;

  let balance = currentSavings;

  for (let year = 0; year <= yearsToRetirement; year++) {
    const age = currentAge + year;
    if (year === 0) {
      // Record initial state
      timeline.push({
        age,
        year: 0,
        balance: round2(balance),
        phase: "accumulation",
        contributions: 0,
        growth: 0,
        withdrawals: 0,
        socialSecurity: 0,
      });
      continue;
    }

    // Simulate 12 months of contributions + growth
    let yearContributions = 0;
    let yearGrowth = 0;

    for (let month = 0; month < 12; month++) {
      const growth = balance * preReturnMonthly;
      yearGrowth += growth;
      balance = balance + growth + monthlyContribution;
      yearContributions += monthlyContribution;
    }

    timeline.push({
      age,
      year,
      balance: round2(balance),
      phase: "accumulation",
      contributions: round2(yearContributions),
      growth: round2(yearGrowth),
      withdrawals: 0,
      socialSecurity: 0,
    });
  }

  const balanceAtRetirement = round2(balance);

  // ==========================================
  // Phase 2: Withdrawal
  // ==========================================
  const postReturnMonthly = postRetirementReturn / 100 / 12;
  const maxYears = Math.max(lifeExpectancy - retirementAge + 10, 50);

  let yearsMoneyLasts = 0;
  let ageMoneyRunsOut: number | null = null;

  for (let year = 1; year <= maxYears; year++) {
    const age = retirementAge + year;
    const yearsFromNow = yearsToRetirement + year;

    // Calculate inflation-adjusted withdrawal for this year
    const inflationFactor = Math.pow(1 + inflationRate / 100, yearsFromNow);
    const adjustedMonthlyIncome = desiredMonthlyIncome * inflationFactor;

    // Social Security (also inflation-adjusted from the start)
    const ssInflationFactor = Math.pow(1 + inflationRate / 100, yearsFromNow);
    const adjustedSS =
      age >= socialSecurityStartAge
        ? socialSecurityMonthly * ssInflationFactor
        : 0;

    let yearWithdrawals = 0;
    let yearGrowth = 0;
    let yearSS = 0;

    for (let month = 0; month < 12; month++) {
      // Growth on remaining balance
      const growth = balance > 0 ? balance * postReturnMonthly : 0;
      yearGrowth += growth;
      balance += growth;

      // Add Social Security
      yearSS += adjustedSS;

      // Withdraw needed amount (reduced by Social Security)
      const neededFromSavings = Math.max(0, adjustedMonthlyIncome - adjustedSS);

      if (balance > 0) {
        const withdrawal = Math.min(balance, neededFromSavings);
        balance -= withdrawal;
        yearWithdrawals += withdrawal;
      }
    }

    const balanceVal = round2(Math.max(0, balance));

    timeline.push({
      age,
      year: yearsToRetirement + year,
      balance: balanceVal,
      phase: "withdrawal",
      contributions: 0,
      growth: round2(yearGrowth),
      withdrawals: round2(yearWithdrawals),
      socialSecurity: round2(yearSS),
    });

    if (balance > 0) {
      yearsMoneyLasts = year;
    } else if (ageMoneyRunsOut === null) {
      ageMoneyRunsOut = age;
      yearsMoneyLasts = year - 1;
    }

    // Stop projecting 10 years after money runs out
    if (ageMoneyRunsOut !== null && age > ageMoneyRunsOut + 10) break;
    // Also stop if way past life expectancy and still has money
    if (age > lifeExpectancy + 10 && balance > 0) {
      yearsMoneyLasts = year;
      break;
    }
  }

  // Calculate shortfall or surplus at life expectancy
  const atLifeExpectancy = timeline.find((p) => p.age === lifeExpectancy);
  const shortfallOrSurplus = atLifeExpectancy ? atLifeExpectancy.balance : 0;

  const isSufficient =
    ageMoneyRunsOut === null || ageMoneyRunsOut > lifeExpectancy;

  // Monthly withdrawal is the inflation-adjusted amount at retirement
  const retirementInflationFactor = Math.pow(
    1 + inflationRate / 100,
    yearsToRetirement
  );
  const monthlyWithdrawal = round2(
    desiredMonthlyIncome * retirementInflationFactor
  );

  return {
    balanceAtRetirement,
    monthlyWithdrawal,
    yearsMoneyLasts,
    ageMoneyRunsOut,
    isSufficient,
    shortfallOrSurplus,
    timeline,
  };
}
