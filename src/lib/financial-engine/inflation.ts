/**
 * Inflation Engine
 *
 * Functions for inflation-adjusted calculations using Decimal.js precision.
 * All functions accept/return number, use Decimal.js internally.
 */

import Decimal from "decimal.js";
import { roundToCents } from "@/lib/money";
import type { InflationInput, InflationResult } from "./types";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

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

  const rate = new Decimal(annualInflationRate).dividedBy(100);
  const factor = new Decimal(1).plus(rate).pow(years);
  return roundToCents(new Decimal(nominalValue).dividedBy(factor).toNumber());
}

/**
 * Calculate purchasing power over time.
 * Shows how a fixed amount loses value due to inflation year by year.
 */
export function purchasingPowerOverTime(input: InflationInput): InflationResult {
  const { currentAmount, annualInflationRate, years } = input;

  const rate = new Decimal(annualInflationRate).dividedBy(100);
  const timeline: { year: number; nominalValue: number; realValue: number }[] = [];

  // Year 0 = today
  timeline.push({
    year: 0,
    nominalValue: roundToCents(currentAmount),
    realValue: roundToCents(currentAmount),
  });

  for (let year = 1; year <= years; year++) {
    const factor = new Decimal(1).plus(rate).pow(year);
    const realValue = new Decimal(currentAmount).dividedBy(factor);

    timeline.push({
      year,
      nominalValue: roundToCents(currentAmount),
      realValue: roundToCents(realValue.toNumber()),
    });
  }

  const finalRealValue = timeline[timeline.length - 1].realValue;
  const purchasingPowerLost = roundToCents(currentAmount - finalRealValue);
  const purchasingPowerPercent =
    currentAmount > 0
      ? new Decimal(finalRealValue)
          .dividedBy(currentAmount)
          .times(100)
          .toDecimalPlaces(2)
          .toNumber()
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
export function realReturnRate(nominalAnnualRate: number, annualInflationRate: number): number {
  const nominal = new Decimal(nominalAnnualRate).dividedBy(100);
  const inflation = new Decimal(annualInflationRate).dividedBy(100);

  const real = new Decimal(1)
    .plus(nominal)
    .dividedBy(new Decimal(1).plus(inflation))
    .minus(1)
    .times(100);

  return real.toDecimalPlaces(4).toNumber();
}
