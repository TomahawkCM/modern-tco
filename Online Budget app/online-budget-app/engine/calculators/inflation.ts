/**
 * Inflation Engine
 *
 * Functions for inflation-adjusted calculations.
 * Ported from offline app — Decimal.js replaced with native Math.
 * All functions accept/return regular numbers (major units).
 */

import type { InflationInput, InflationResult } from "./types";

/** Round to 2 decimal places (cents) */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Adjust a future amount for inflation to get today's purchasing power.
 * realValue = nominalValue / (1 + inflationRate)^years
 */
export function adjustForInflation(
  nominalValue: number,
  annualInflationRate: number,
  years: number
): number {
  if (years <= 0 || annualInflationRate === 0) return nominalValue;

  const rate = annualInflationRate / 100;
  const factor = Math.pow(1 + rate, years);
  return round2(nominalValue / factor);
}

/**
 * Calculate purchasing power over time.
 * Shows how a fixed amount loses value due to inflation year by year.
 */
export function purchasingPowerOverTime(input: InflationInput): InflationResult {
  const { currentAmount, annualInflationRate, years } = input;

  const rate = annualInflationRate / 100;
  const timeline: { year: number; nominalValue: number; realValue: number }[] =
    [];

  // Year 0 = today
  timeline.push({
    year: 0,
    nominalValue: round2(currentAmount),
    realValue: round2(currentAmount),
  });

  for (let year = 1; year <= years; year++) {
    const factor = Math.pow(1 + rate, year);
    const realValue = currentAmount / factor;

    timeline.push({
      year,
      nominalValue: round2(currentAmount),
      realValue: round2(realValue),
    });
  }

  const finalRealValue = timeline[timeline.length - 1]!.realValue;
  const purchasingPowerLost = round2(currentAmount - finalRealValue);
  const purchasingPowerPercent =
    currentAmount > 0
      ? Math.round((finalRealValue / currentAmount) * 100 * 100) / 100
      : 0;

  return {
    futureValue: finalRealValue,
    purchasingPowerLost,
    purchasingPowerPercent,
    timeline,
  };
}

/**
 * Calculate the real (inflation-adjusted) return rate.
 * realRate = ((1 + nominalRate) / (1 + inflationRate)) - 1
 */
export function realReturnRate(
  nominalAnnualRate: number,
  annualInflationRate: number
): number {
  const nominal = nominalAnnualRate / 100;
  const inflation = annualInflationRate / 100;

  const real = (1 + nominal) / (1 + inflation) - 1;
  return Math.round(real * 100 * 10000) / 10000;
}
