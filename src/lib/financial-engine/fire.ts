/**
 * FIRE (Financial Independence, Retire Early) Calculator Engine
 *
 * Calculates the FIRE number, years to FIRE, and savings rate needed.
 * Integrates with the existing retirement and compounding engines.
 * All functions are pure, accept/return numbers with Decimal.js precision.
 */

import Decimal from "decimal.js";
import { roundToCents } from "@/lib/money";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

// ============================================================================
// Types
// ============================================================================

export interface FIREInput {
  /** Current age */
  currentAge: number;
  /** Annual gross income */
  annualIncome: number;
  /** Annual expenses (current spending) */
  annualExpenses: number;
  /** Current investment/savings balance */
  currentSavings: number;
  /** Expected annual return on investments (percent, e.g. 7.0) */
  expectedReturn: number;
  /** Safe withdrawal rate (percent, default 4.0) */
  safeWithdrawalRate?: number;
  /** Annual inflation rate (percent, default 3.0) */
  inflationRate?: number;
}

export interface FIRETimelinePoint {
  /** Age at this point */
  age: number;
  /** Year index (0 = now) */
  year: number;
  /** Portfolio balance */
  balance: number;
  /** Annual savings that year */
  annualSavings: number;
  /** FIRE number target at this year (inflation-adjusted) */
  fireTarget: number;
  /** Whether FIRE has been reached */
  fireReached: boolean;
}

export interface FIREResult {
  /** The FIRE number (portfolio needed to sustain expenses at SWR) */
  fireNumber: number;
  /** Years until FIRE is achieved */
  yearsToFIRE: number;
  /** Age at which FIRE is achieved */
  fireAge: number;
  /** Current savings rate (percent) */
  savingsRate: number;
  /** Annual savings amount */
  annualSavings: number;
  /** Monthly savings amount */
  monthlySavings: number;
  /** Whether FIRE is already achieved */
  alreadyFIRE: boolean;
  /** Projected annual income from portfolio at FIRE (in today's dollars) */
  annualPassiveIncome: number;
  /** Coast FIRE number (amount needed now to reach FIRE by 65 with no more savings) */
  coastFIRENumber: number;
  /** Whether Coast FIRE is achieved */
  coastFIREReached: boolean;
  /** Lean FIRE number (50% of regular FIRE, minimal expenses) */
  leanFIRENumber: number;
  /** Fat FIRE number (200% of regular FIRE, comfortable expenses) */
  fatFIRENumber: number;
  /** Year-by-year timeline */
  timeline: FIRETimelinePoint[];
}

// ============================================================================
// Calculation
// ============================================================================

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
  const fireNumber = roundToCents(
    new Decimal(annualExpenses).dividedBy(new Decimal(safeWithdrawalRate).dividedBy(100)).toNumber()
  );

  // Lean FIRE (50% expenses) and Fat FIRE (200% expenses)
  const leanFIRENumber = roundToCents(fireNumber * 0.5);
  const fatFIRENumber = roundToCents(fireNumber * 2);

  // Annual savings
  const annualSavings = roundToCents(
    Decimal.max(new Decimal(0), new Decimal(annualIncome).minus(annualExpenses)).toNumber()
  );
  const monthlySavings = roundToCents(annualSavings / 12);

  // Savings rate
  const savingsRate =
    annualIncome > 0
      ? new Decimal(annualSavings).dividedBy(annualIncome).times(100).toDecimalPlaces(1).toNumber()
      : 0;

  // Check if already FIRE
  const alreadyFIRE = currentSavings >= fireNumber;

  // Real return rate (adjusted for inflation)
  const realReturn = new Decimal(1)
    .plus(new Decimal(expectedReturn).dividedBy(100))
    .dividedBy(new Decimal(1).plus(new Decimal(inflationRate).dividedBy(100)))
    .minus(1);

  // Project year-by-year to find FIRE date
  const maxYears = 80;
  const timeline: FIRETimelinePoint[] = [];
  let balance = new Decimal(currentSavings);
  let yearsToFIRE = 0;
  let fireReached = alreadyFIRE;

  for (let year = 0; year <= maxYears; year++) {
    const age = currentAge + year;

    // Inflation-adjusted FIRE target at this year
    const inflationFactor = new Decimal(1)
      .plus(new Decimal(inflationRate).dividedBy(100))
      .pow(year);
    const fireTarget = roundToCents(new Decimal(fireNumber).times(inflationFactor).toNumber());

    const reachedThisYear = balance.greaterThanOrEqualTo(fireTarget);

    if (!fireReached && reachedThisYear) {
      fireReached = true;
      yearsToFIRE = year;
    }

    timeline.push({
      age,
      year,
      balance: roundToCents(balance.toNumber()),
      annualSavings: year === 0 ? 0 : annualSavings,
      fireTarget,
      fireReached: reachedThisYear,
    });

    if (fireReached && year > yearsToFIRE + 5) break;

    // Grow balance: returns + savings (inflation-adjusted savings)
    const yearSavings = new Decimal(annualSavings).times(inflationFactor);
    const growth = balance.times(new Decimal(expectedReturn).dividedBy(100));
    balance = balance.plus(growth).plus(yearSavings);
  }

  // If never reached FIRE
  if (!fireReached) {
    yearsToFIRE = maxYears;
  }

  const fireAge = currentAge + yearsToFIRE;

  // Annual passive income at FIRE
  const annualPassiveIncome = roundToCents(
    new Decimal(fireNumber).times(new Decimal(safeWithdrawalRate).dividedBy(100)).toNumber()
  );

  // Coast FIRE: how much you need NOW so that compound growth alone reaches FIRE by 65
  const yearsTo65 = Math.max(0, 65 - currentAge);
  let coastFIRENumber = 0;
  if (yearsTo65 > 0 && expectedReturn > 0) {
    // coastFIRE = fireNumber / (1 + realReturn)^yearsTo65
    const realReturnAnnual = realReturn;
    const coastFactor = new Decimal(1).plus(realReturnAnnual).pow(yearsTo65);
    coastFIRENumber = roundToCents(new Decimal(fireNumber).dividedBy(coastFactor).toNumber());
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
