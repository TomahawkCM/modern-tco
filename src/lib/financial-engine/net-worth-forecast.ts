/**
 * Net Worth Forecaster Engine
 *
 * Projects net worth over time with configurable assumptions for
 * asset growth, debt paydown, and income/expense changes.
 * All functions are pure, accept/return numbers with Decimal.js precision.
 */

import Decimal from "decimal.js";
import { roundToCents } from "@/lib/money";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

// ============================================================================
// Types
// ============================================================================

export interface Asset {
  /** Display name */
  name: string;
  /** Current value */
  currentValue: number;
  /** Expected annual growth rate (percent, e.g. 7.0 for stocks, 3.0 for home) */
  annualGrowthRate: number;
  /** Monthly contribution to this asset (e.g. 401k contribution) */
  monthlyContribution?: number;
}

export interface Liability {
  /** Display name */
  name: string;
  /** Current balance (positive number) */
  currentBalance: number;
  /** Annual interest rate (percent) */
  annualRate: number;
  /** Monthly payment */
  monthlyPayment: number;
}

export interface NetWorthForecastInput {
  /** List of assets */
  assets: Asset[];
  /** List of liabilities */
  liabilities: Liability[];
  /** Number of years to project */
  years: number;
  /** Annual inflation rate (percent, for real value calculation) */
  inflationRate?: number;
}

export interface NetWorthTimelinePoint {
  /** Year index (0 = now) */
  year: number;
  /** Total assets value */
  totalAssets: number;
  /** Total liabilities balance */
  totalLiabilities: number;
  /** Net worth (assets - liabilities) */
  netWorth: number;
  /** Inflation-adjusted net worth */
  realNetWorth: number;
}

export interface NetWorthForecastResult {
  /** Year-by-year timeline */
  timeline: NetWorthTimelinePoint[];
  /** Current net worth */
  currentNetWorth: number;
  /** Projected net worth at end of period */
  projectedNetWorth: number;
  /** Net worth growth (absolute) */
  totalGrowth: number;
  /** Net worth growth rate (percent) */
  growthRate: number;
  /** Year when net worth first hits $1M (null if never) */
  millionaireYear: number | null;
  /** Year when all debt is paid off (null if never or no debt) */
  debtFreeYear: number | null;
}

// ============================================================================
// Calculation
// ============================================================================

/**
 * Project net worth over time with asset growth and debt paydown.
 */
export function forecastNetWorth(input: NetWorthForecastInput): NetWorthForecastResult {
  const { assets, liabilities, years, inflationRate = 3.0 } = input;

  const timeline: NetWorthTimelinePoint[] = [];

  // Track each asset and liability separately for accurate compound growth
  let assetValues = assets.map((a) => new Decimal(a.currentValue));
  let liabilityBalances = liabilities.map((l) => new Decimal(l.currentBalance));

  let millionaireYear: number | null = null;
  let debtFreeYear: number | null = null;

  for (let year = 0; year <= years; year++) {
    const totalAssets = assetValues.reduce((sum, v) => sum.plus(v), new Decimal(0));
    const totalLiabilities = liabilityBalances.reduce((sum, v) => sum.plus(v), new Decimal(0));
    const netWorth = totalAssets.minus(totalLiabilities);

    // Inflation-adjusted
    const inflationFactor = new Decimal(1)
      .plus(new Decimal(inflationRate).dividedBy(100))
      .pow(year);
    const realNetWorth = netWorth.dividedBy(inflationFactor);

    const netWorthNum = roundToCents(netWorth.toNumber());

    timeline.push({
      year,
      totalAssets: roundToCents(totalAssets.toNumber()),
      totalLiabilities: roundToCents(totalLiabilities.toNumber()),
      netWorth: netWorthNum,
      realNetWorth: roundToCents(realNetWorth.toNumber()),
    });

    // Track milestones
    if (millionaireYear === null && netWorthNum >= 1000000) {
      millionaireYear = year;
    }
    if (debtFreeYear === null && liabilities.length > 0 && totalLiabilities.lessThanOrEqualTo(0)) {
      debtFreeYear = year;
    }

    // Skip growth calculation on last year
    if (year === years) break;

    // Grow assets for next year (12 months of growth + contributions)
    assetValues = assetValues.map((value, i) => {
      const asset = assets[i];
      const monthlyRate = new Decimal(asset.annualGrowthRate).dividedBy(100).dividedBy(12);
      const monthlyContrib = new Decimal(asset.monthlyContribution ?? 0);

      let v = value;
      for (let m = 0; m < 12; m++) {
        const growth = v.times(monthlyRate);
        v = v.plus(growth).plus(monthlyContrib);
      }
      return v;
    });

    // Pay down liabilities for next year
    liabilityBalances = liabilityBalances.map((balance, i) => {
      if (balance.lessThanOrEqualTo(0)) return new Decimal(0);

      const liability = liabilities[i];
      const monthlyRate = new Decimal(liability.annualRate).dividedBy(100).dividedBy(12);
      const payment = new Decimal(liability.monthlyPayment);

      let b = balance;
      for (let m = 0; m < 12; m++) {
        const interest = b.times(monthlyRate);
        b = Decimal.max(new Decimal(0), b.plus(interest).minus(payment));
      }
      return b;
    });
  }

  const currentNetWorth = timeline[0].netWorth;
  const projectedNetWorth = timeline[timeline.length - 1].netWorth;
  const totalGrowth = roundToCents(projectedNetWorth - currentNetWorth);
  const growthRate =
    currentNetWorth !== 0
      ? new Decimal(totalGrowth)
          .dividedBy(Math.abs(currentNetWorth))
          .times(100)
          .toDecimalPlaces(1)
          .toNumber()
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
