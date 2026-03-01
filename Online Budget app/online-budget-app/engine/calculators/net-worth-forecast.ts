/**
 * Net Worth Forecaster Engine
 *
 * Projects net worth over time with configurable assumptions for
 * asset growth, debt paydown, and income/expense changes.
 * Ported from offline app — Decimal.js replaced with native Math.
 * All functions are pure, accept/return regular numbers.
 */

import type {
  NetWorthForecastInput,
  NetWorthTimelinePoint,
  NetWorthForecastResult,
} from "./types";

/** Round to 2 decimal places (cents) */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Project net worth over time with asset growth and debt paydown.
 */
export function forecastNetWorth(
  input: NetWorthForecastInput
): NetWorthForecastResult {
  const { assets, liabilities, years, inflationRate = 3.0 } = input;

  const timeline: NetWorthTimelinePoint[] = [];

  // Track each asset and liability separately for accurate compound growth
  let assetValues = assets.map((a) => a.currentValue);
  let liabilityBalances = liabilities.map((l) => l.currentBalance);

  let millionaireYear: number | null = null;
  let debtFreeYear: number | null = null;

  for (let year = 0; year <= years; year++) {
    const totalAssets = assetValues.reduce((sum, v) => sum + v, 0);
    const totalLiabilities = liabilityBalances.reduce((sum, v) => sum + v, 0);
    const netWorth = totalAssets - totalLiabilities;

    // Inflation-adjusted
    const inflationFactor = Math.pow(1 + inflationRate / 100, year);
    const realNetWorth = netWorth / inflationFactor;

    const netWorthNum = round2(netWorth);

    timeline.push({
      year,
      totalAssets: round2(totalAssets),
      totalLiabilities: round2(totalLiabilities),
      netWorth: netWorthNum,
      realNetWorth: round2(realNetWorth),
    });

    // Track milestones
    if (millionaireYear === null && netWorthNum >= 1000000) {
      millionaireYear = year;
    }
    if (
      debtFreeYear === null &&
      liabilities.length > 0 &&
      totalLiabilities <= 0
    ) {
      debtFreeYear = year;
    }

    // Skip growth calculation on last year
    if (year === years) break;

    // Grow assets for next year (12 months of growth + contributions)
    assetValues = assetValues.map((value, i) => {
      const asset = assets[i]!;
      const monthlyRate = asset.annualGrowthRate / 100 / 12;
      const monthlyContrib = asset.monthlyContribution ?? 0;

      let v = value;
      for (let m = 0; m < 12; m++) {
        const growth = v * monthlyRate;
        v = v + growth + monthlyContrib;
      }
      return v;
    });

    // Pay down liabilities for next year
    liabilityBalances = liabilityBalances.map((balance, i) => {
      if (balance <= 0) return 0;

      const liability = liabilities[i]!;
      const monthlyRate = liability.annualRate / 100 / 12;
      const payment = liability.monthlyPayment;

      let b = balance;
      for (let m = 0; m < 12; m++) {
        const interest = b * monthlyRate;
        b = Math.max(0, b + interest - payment);
      }
      return b;
    });
  }

  const currentNetWorth = timeline[0]!.netWorth;
  const projectedNetWorth = timeline[timeline.length - 1]!.netWorth;
  const totalGrowth = round2(projectedNetWorth - currentNetWorth);
  const growthRate =
    currentNetWorth !== 0
      ? Math.round((totalGrowth / Math.abs(currentNetWorth)) * 100 * 10) / 10
      : 0;

  return {
    timeline,
    currentNetWorth,
    projectedNetWorth,
    totalGrowth,
    growthRate,
    millionaireYear,
    debtFreeYear,
  };
}
