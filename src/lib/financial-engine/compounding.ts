/**
 * Compound Interest Engine
 *
 * Core TVM (Time Value of Money) functions using Decimal.js for precision.
 * All functions accept/return number, use Decimal.js internally.
 */

import Decimal from "decimal.js";
import { roundToCents } from "@/lib/money";
import type {
  CompoundingFrequency,
  CompoundInterestInput,
  CompoundInterestResult,
  TimelinePoint,
} from "./types";
import { COMPOUNDING_PERIODS } from "./types";

// Configure Decimal.js for financial precision
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/**
 * Calculate future value of a lump sum with compound interest.
 * FV = PV * (1 + r/n)^(n*t)
 */
export function futureValue(
  presentValue: number,
  annualRate: number,
  years: number,
  frequency: CompoundingFrequency = "monthly"
): number {
  if (years <= 0) return presentValue;
  if (annualRate === 0) return presentValue;

  const n = COMPOUNDING_PERIODS[frequency];
  const r = new Decimal(annualRate).dividedBy(100);
  const ratePerPeriod = r.dividedBy(n);
  const totalPeriods = new Decimal(n).times(years);

  const fv = new Decimal(presentValue).times(new Decimal(1).plus(ratePerPeriod).pow(totalPeriods));

  return roundToCents(fv.toNumber());
}

/**
 * Calculate present value given a future value.
 * PV = FV / (1 + r/n)^(n*t)
 */
export function presentValue(
  futureVal: number,
  annualRate: number,
  years: number,
  frequency: CompoundingFrequency = "monthly"
): number {
  if (years <= 0) return futureVal;
  if (annualRate === 0) return futureVal;

  const n = COMPOUNDING_PERIODS[frequency];
  const r = new Decimal(annualRate).dividedBy(100);
  const ratePerPeriod = r.dividedBy(n);
  const totalPeriods = new Decimal(n).times(years);

  const pv = new Decimal(futureVal).dividedBy(new Decimal(1).plus(ratePerPeriod).pow(totalPeriods));

  return roundToCents(pv.toNumber());
}

/**
 * Calculate periodic payment (PMT) needed to reach a future value.
 * PMT = (FV - PV * (1+r)^n) * r / ((1+r)^n - 1)
 * Where r = rate per period, n = total periods
 */
export function pmt(
  futureVal: number,
  presentVal: number,
  annualRate: number,
  years: number,
  frequency: CompoundingFrequency = "monthly"
): number {
  if (years <= 0) return 0;

  const n = COMPOUNDING_PERIODS[frequency];
  const totalPeriods = n * years;

  if (annualRate === 0) {
    const needed = new Decimal(futureVal).minus(presentVal);
    if (needed.lessThanOrEqualTo(0)) return 0;
    return roundToCents(needed.dividedBy(totalPeriods).toNumber());
  }

  const r = new Decimal(annualRate).dividedBy(100).dividedBy(n);
  const onePlusR = new Decimal(1).plus(r);
  const compoundFactor = onePlusR.pow(totalPeriods);

  const fvOfPV = new Decimal(presentVal).times(compoundFactor);
  const amountNeeded = new Decimal(futureVal).minus(fvOfPV);

  if (amountNeeded.lessThanOrEqualTo(0)) return 0;

  const annuityFactor = compoundFactor.minus(1).dividedBy(r);
  return roundToCents(amountNeeded.dividedBy(annuityFactor).toNumber());
}

/**
 * Calculate number of periods (NPER) to reach a future value.
 * Returns periods in the given compounding frequency.
 */
export function nper(
  futureVal: number,
  presentVal: number,
  periodicPayment: number,
  annualRate: number,
  frequency: CompoundingFrequency = "monthly"
): number {
  if (presentVal >= futureVal) return 0;
  if (periodicPayment <= 0 && annualRate <= 0) return Infinity;

  const n = COMPOUNDING_PERIODS[frequency];

  if (annualRate === 0) {
    if (periodicPayment <= 0) return Infinity;
    const needed = new Decimal(futureVal).minus(presentVal);
    return Math.ceil(needed.dividedBy(periodicPayment).toNumber());
  }

  const r = new Decimal(annualRate).dividedBy(100).dividedBy(n);
  const pmtD = new Decimal(periodicPayment);

  // n = ln((PMT + FV*r) / (PMT + PV*r)) / ln(1+r)
  // Using the formula for annuity-due / ordinary annuity
  const numerator = pmtD.plus(new Decimal(futureVal).times(r));
  const denominator = pmtD.plus(new Decimal(presentVal).times(r));

  if (denominator.lessThanOrEqualTo(0) || numerator.lessThanOrEqualTo(0)) {
    return Infinity;
  }

  const periods = Decimal.ln(numerator.dividedBy(denominator)).dividedBy(
    Decimal.ln(new Decimal(1).plus(r))
  );

  const result = Math.ceil(periods.toNumber());
  return result > 0 ? result : Infinity;
}

/**
 * Full compound interest calculation with timeline projection.
 * FV = PV(1+r/n)^(nt) + PMT[((1+r/n)^(nt)-1)/(r/n)]
 */
export function compoundInterest(input: CompoundInterestInput): CompoundInterestResult {
  const {
    principal,
    periodicContribution,
    annualRate,
    years,
    compoundingFrequency,
    contributionTiming = "end",
  } = input;

  const n = COMPOUNDING_PERIODS[compoundingFrequency];
  const totalPeriods = n * years;
  const r = new Decimal(annualRate).dividedBy(100);
  const ratePerPeriod = annualRate === 0 ? new Decimal(0) : r.dividedBy(n);

  // Build year-by-year timeline
  const timeline: TimelinePoint[] = [];
  let balance = new Decimal(principal);
  let totalContributions = new Decimal(principal);
  let totalInterestAccum = new Decimal(0);

  // Add initial point
  timeline.push({
    period: 0,
    balance: roundToCents(balance.toNumber()),
    contributions: roundToCents(totalContributions.toNumber()),
    interest: 0,
  });

  // Simulate period by period, recording at year boundaries
  for (let period = 1; period <= totalPeriods; period++) {
    if (contributionTiming === "beginning") {
      balance = balance.plus(periodicContribution);
      totalContributions = totalContributions.plus(periodicContribution);
    }

    // Apply interest
    const interestThisPeriod = balance.times(ratePerPeriod);
    balance = balance.plus(interestThisPeriod);
    totalInterestAccum = totalInterestAccum.plus(interestThisPeriod);

    if (contributionTiming === "end") {
      balance = balance.plus(periodicContribution);
      totalContributions = totalContributions.plus(periodicContribution);
    }

    // Record at year boundaries
    if (period % n === 0) {
      timeline.push({
        period: period / n,
        balance: roundToCents(balance.toNumber()),
        contributions: roundToCents(totalContributions.toNumber()),
        interest: roundToCents(totalInterestAccum.toNumber()),
      });
    }
  }

  // If the last period wasn't on a year boundary, add final point
  if (totalPeriods % n !== 0) {
    timeline.push({
      period: years,
      balance: roundToCents(balance.toNumber()),
      contributions: roundToCents(totalContributions.toNumber()),
      interest: roundToCents(totalInterestAccum.toNumber()),
    });
  }

  // Effective annual rate: (1 + r/n)^n - 1
  let effectiveAnnualRate = 0;
  if (annualRate > 0) {
    effectiveAnnualRate = new Decimal(1)
      .plus(ratePerPeriod)
      .pow(n)
      .minus(1)
      .times(100)
      .toDecimalPlaces(4)
      .toNumber();
  }

  return {
    futureValue: roundToCents(balance.toNumber()),
    totalContributions: roundToCents(totalContributions.toNumber()),
    totalInterest: roundToCents(totalInterestAccum.toNumber()),
    effectiveAnnualRate,
    timeline,
  };
}
