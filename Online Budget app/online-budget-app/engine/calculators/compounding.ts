/**
 * Compound Interest Engine
 *
 * Core TVM (Time Value of Money) functions using plain arithmetic.
 * Ported from offline app — Decimal.js replaced with native Math.
 * All functions accept/return regular numbers (major units).
 */

import type {
  CompoundingFrequency,
  CompoundInterestInput,
  CompoundInterestResult,
  TimelinePoint,
} from "./types";
import { COMPOUNDING_PERIODS } from "./types";

/** Round to 2 decimal places (cents) */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

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
  const r = annualRate / 100;
  const ratePerPeriod = r / n;
  const totalPeriods = n * years;

  const fv = presentValue * Math.pow(1 + ratePerPeriod, totalPeriods);
  return round2(fv);
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
  const r = annualRate / 100;
  const ratePerPeriod = r / n;
  const totalPeriods = n * years;

  const pv = futureVal / Math.pow(1 + ratePerPeriod, totalPeriods);
  return round2(pv);
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
    const needed = futureVal - presentVal;
    if (needed <= 0) return 0;
    return round2(needed / totalPeriods);
  }

  const r = annualRate / 100 / n;
  const compoundFactor = Math.pow(1 + r, totalPeriods);

  const fvOfPV = presentVal * compoundFactor;
  const amountNeeded = futureVal - fvOfPV;

  if (amountNeeded <= 0) return 0;

  const annuityFactor = (compoundFactor - 1) / r;
  return round2(amountNeeded / annuityFactor);
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
    const needed = futureVal - presentVal;
    return Math.ceil(needed / periodicPayment);
  }

  const r = annualRate / 100 / n;

  // n = ln((PMT + FV*r) / (PMT + PV*r)) / ln(1+r)
  const numerator = periodicPayment + futureVal * r;
  const denominator = periodicPayment + presentVal * r;

  if (denominator <= 0 || numerator <= 0) {
    return Infinity;
  }

  const periods = Math.log(numerator / denominator) / Math.log(1 + r);

  const result = Math.ceil(periods);
  return result > 0 ? result : Infinity;
}

/**
 * Full compound interest calculation with timeline projection.
 * FV = PV(1+r/n)^(nt) + PMT[((1+r/n)^(nt)-1)/(r/n)]
 */
export function compoundInterest(
  input: CompoundInterestInput
): CompoundInterestResult {
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
  const ratePerPeriod = annualRate === 0 ? 0 : annualRate / 100 / n;

  // Build year-by-year timeline
  const timeline: TimelinePoint[] = [];
  let balance = principal;
  let totalContributions = principal;
  let totalInterestAccum = 0;

  // Add initial point
  timeline.push({
    period: 0,
    balance: round2(balance),
    contributions: round2(totalContributions),
    interest: 0,
  });

  // Simulate period by period, recording at year boundaries
  for (let period = 1; period <= totalPeriods; period++) {
    if (contributionTiming === "beginning") {
      balance += periodicContribution;
      totalContributions += periodicContribution;
    }

    // Apply interest
    const interestThisPeriod = balance * ratePerPeriod;
    balance += interestThisPeriod;
    totalInterestAccum += interestThisPeriod;

    if (contributionTiming === "end") {
      balance += periodicContribution;
      totalContributions += periodicContribution;
    }

    // Record at year boundaries
    if (period % n === 0) {
      timeline.push({
        period: period / n,
        balance: round2(balance),
        contributions: round2(totalContributions),
        interest: round2(totalInterestAccum),
      });
    }
  }

  // If the last period wasn't on a year boundary, add final point
  if (totalPeriods % n !== 0) {
    timeline.push({
      period: years,
      balance: round2(balance),
      contributions: round2(totalContributions),
      interest: round2(totalInterestAccum),
    });
  }

  // Effective annual rate: (1 + r/n)^n - 1
  let effectiveAnnualRate = 0;
  if (annualRate > 0) {
    effectiveAnnualRate =
      Math.round((Math.pow(1 + ratePerPeriod, n) - 1) * 100 * 10000) / 10000;
  }

  return {
    futureValue: round2(balance),
    totalContributions: round2(totalContributions),
    totalInterest: round2(totalInterestAccum),
    effectiveAnnualRate,
    timeline,
  };
}
