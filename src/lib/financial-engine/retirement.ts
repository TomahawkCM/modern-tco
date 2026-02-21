/**
 * Retirement Planner Engine
 *
 * Two-phase simulation: accumulation (saving) + withdrawal (spending).
 * Uses Decimal.js for precision. All functions accept/return number.
 */

import Decimal from "decimal.js";
import { roundToCents } from "@/lib/money";
import type { RetirementInput, RetirementResult, RetirementTimelinePoint } from "./types";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

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
  const preReturnMonthly = new Decimal(preRetirementReturn).dividedBy(100).dividedBy(12);

  let balance = new Decimal(currentSavings);

  for (let year = 0; year <= yearsToRetirement; year++) {
    const age = currentAge + year;
    if (year === 0) {
      // Record initial state
      timeline.push({
        age,
        year: 0,
        balance: roundToCents(balance.toNumber()),
        phase: "accumulation",
        contributions: 0,
        growth: 0,
        withdrawals: 0,
        socialSecurity: 0,
      });
      continue;
    }

    // Simulate 12 months of contributions + growth
    let yearContributions = new Decimal(0);
    let yearGrowth = new Decimal(0);

    for (let month = 0; month < 12; month++) {
      const growth = balance.times(preReturnMonthly);
      yearGrowth = yearGrowth.plus(growth);
      balance = balance.plus(growth).plus(monthlyContribution);
      yearContributions = yearContributions.plus(monthlyContribution);
    }

    timeline.push({
      age,
      year,
      balance: roundToCents(balance.toNumber()),
      phase: "accumulation",
      contributions: roundToCents(yearContributions.toNumber()),
      growth: roundToCents(yearGrowth.toNumber()),
      withdrawals: 0,
      socialSecurity: 0,
    });
  }

  const balanceAtRetirement = roundToCents(balance.toNumber());

  // ==========================================
  // Phase 2: Withdrawal
  // ==========================================
  const postReturnMonthly = new Decimal(postRetirementReturn).dividedBy(100).dividedBy(12);
  const maxYears = Math.max(lifeExpectancy - retirementAge + 10, 50); // Project past life expectancy

  let yearsMoneyLasts = 0;
  let ageMoneyRunsOut: number | null = null;

  for (let year = 1; year <= maxYears; year++) {
    const age = retirementAge + year;
    const yearsFromNow = yearsToRetirement + year;

    // Calculate inflation-adjusted withdrawal for this year
    const inflationFactor = new Decimal(1)
      .plus(new Decimal(inflationRate).dividedBy(100))
      .pow(yearsFromNow);
    const adjustedMonthlyIncome = new Decimal(desiredMonthlyIncome).times(inflationFactor);

    // Social Security (also inflation-adjusted from the start)
    const ssInflationFactor = new Decimal(1)
      .plus(new Decimal(inflationRate).dividedBy(100))
      .pow(yearsFromNow);
    const adjustedSS =
      age >= socialSecurityStartAge
        ? new Decimal(socialSecurityMonthly).times(ssInflationFactor)
        : new Decimal(0);

    let yearWithdrawals = new Decimal(0);
    let yearGrowth = new Decimal(0);
    let yearSS = new Decimal(0);

    for (let month = 0; month < 12; month++) {
      // Growth on remaining balance
      const growth = balance.greaterThan(0) ? balance.times(postReturnMonthly) : new Decimal(0);
      yearGrowth = yearGrowth.plus(growth);
      balance = balance.plus(growth);

      // Add Social Security
      yearSS = yearSS.plus(adjustedSS);

      // Withdraw needed amount (reduced by Social Security)
      const neededFromSavings = Decimal.max(
        new Decimal(0),
        adjustedMonthlyIncome.minus(adjustedSS)
      );

      if (balance.greaterThan(0)) {
        const withdrawal = Decimal.min(balance, neededFromSavings);
        balance = balance.minus(withdrawal);
        yearWithdrawals = yearWithdrawals.plus(withdrawal);
      }
    }

    const balanceVal = roundToCents(Decimal.max(0, balance).toNumber());

    timeline.push({
      age,
      year: yearsToRetirement + year,
      balance: balanceVal,
      phase: "withdrawal",
      contributions: 0,
      growth: roundToCents(yearGrowth.toNumber()),
      withdrawals: roundToCents(yearWithdrawals.toNumber()),
      socialSecurity: roundToCents(yearSS.toNumber()),
    });

    if (balance.greaterThan(0)) {
      yearsMoneyLasts = year;
    } else if (ageMoneyRunsOut === null) {
      ageMoneyRunsOut = age;
      yearsMoneyLasts = year - 1;
    }

    // Stop projecting 10 years after money runs out
    if (ageMoneyRunsOut !== null && age > ageMoneyRunsOut + 10) break;
    // Also stop if way past life expectancy and still has money
    if (age > lifeExpectancy + 10 && balance.greaterThan(0)) {
      yearsMoneyLasts = year;
      break;
    }
  }

  // Calculate shortfall or surplus at life expectancy
  const atLifeExpectancy = timeline.find((p) => p.age === lifeExpectancy);
  const shortfallOrSurplus = atLifeExpectancy ? atLifeExpectancy.balance : 0;

  const isSufficient = ageMoneyRunsOut === null || ageMoneyRunsOut > lifeExpectancy;

  // Monthly withdrawal is the inflation-adjusted amount at retirement
  const retirementInflationFactor = new Decimal(1)
    .plus(new Decimal(inflationRate).dividedBy(100))
    .pow(yearsToRetirement);
  const monthlyWithdrawal = roundToCents(
    new Decimal(desiredMonthlyIncome).times(retirementInflationFactor).toNumber()
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
