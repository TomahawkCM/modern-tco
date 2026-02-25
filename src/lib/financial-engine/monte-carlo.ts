/**
 * Monte Carlo Simulation Engine
 *
 * Probabilistic financial modeling via randomized return simulations.
 * Runs N simulations with normally-distributed returns and outputs
 * percentile bands for confidence analysis.
 *
 * Uses a seeded PRNG for deterministic, reproducible results.
 * All functions are pure, accept/return numbers.
 */

import Decimal from "decimal.js";
import { roundToCents } from "@/lib/money";

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

// ============================================================================
// Types
// ============================================================================

export interface MonteCarloInput {
  /** Initial portfolio balance */
  initialBalance: number;
  /** Monthly contribution (0 for withdrawal-only scenarios) */
  monthlyContribution: number;
  /** Monthly withdrawal (0 for accumulation-only scenarios) */
  monthlyWithdrawal: number;
  /** Expected annual return (percent, e.g. 7.0) */
  expectedAnnualReturn: number;
  /** Annual return standard deviation (percent, e.g. 15.0) */
  annualVolatility: number;
  /** Annual inflation rate (percent, applied to withdrawals) */
  inflationRate?: number;
  /** Number of years to simulate */
  years: number;
  /** Number of simulations to run (default: 1000) */
  simulations?: number;
  /** Random seed for reproducibility */
  seed?: number;
}

export interface MonteCarloPercentile {
  /** Year index */
  year: number;
  /** 10th percentile balance (worst-case) */
  p10: number;
  /** 25th percentile */
  p25: number;
  /** 50th percentile (median) */
  p50: number;
  /** 75th percentile */
  p75: number;
  /** 90th percentile (best-case) */
  p90: number;
}

export interface MonteCarloResult {
  /** Percentile bands by year */
  percentiles: MonteCarloPercentile[];
  /** Probability of success (balance > 0 at end) */
  successRate: number;
  /** Number of simulations that ran out of money */
  failureCount: number;
  /** Median final balance */
  medianFinalBalance: number;
  /** Total simulations run */
  totalSimulations: number;
}

// ============================================================================
// Seeded PRNG (Mulberry32)
// ============================================================================

/**
 * Mulberry32: fast 32-bit seeded PRNG.
 * Returns a function that produces uniform random numbers in [0, 1).
 */
function mulberry32(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate normally-distributed random number using Box-Muller transform.
 */
function normalRandom(rng: () => number, mean: number, stdDev: number): number {
  const u1 = rng();
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1 || 1e-10)) * Math.cos(2 * Math.PI * u2);
  return mean + stdDev * z;
}

// ============================================================================
// Simulation
// ============================================================================

/**
 * Run a single simulation and return year-end balances.
 */
function runSingleSimulation(input: MonteCarloInput, rng: () => number): number[] {
  const monthlyReturn = input.expectedAnnualReturn / 100 / 12;
  const monthlyVol = input.annualVolatility / 100 / Math.sqrt(12);
  const monthlyInflation = (input.inflationRate ?? 0) / 100 / 12;

  const yearEndBalances: number[] = [input.initialBalance];
  let balance = new Decimal(input.initialBalance);

  for (let year = 1; year <= input.years; year++) {
    for (let month = 0; month < 12; month++) {
      // Random monthly return
      const returnRate = normalRandom(rng, monthlyReturn, monthlyVol);

      // Apply return
      const growth = balance.times(returnRate);
      balance = balance.plus(growth);

      // Add contributions
      balance = balance.plus(input.monthlyContribution);

      // Subtract inflation-adjusted withdrawal
      const monthIndex = (year - 1) * 12 + month;
      const inflationFactor = Math.pow(1 + monthlyInflation, monthIndex);
      const adjustedWithdrawal = new Decimal(input.monthlyWithdrawal).times(inflationFactor);
      balance = Decimal.max(new Decimal(0), balance.minus(adjustedWithdrawal));
    }

    yearEndBalances.push(roundToCents(balance.toNumber()));
  }

  return yearEndBalances;
}

/**
 * Get the value at a given percentile from a sorted array.
 */
function percentile(sorted: number[], p: number): number {
  const index = Math.floor((p / 100) * (sorted.length - 1));
  return sorted[index];
}

// ============================================================================
// Main Function
// ============================================================================

/**
 * Run Monte Carlo simulation for financial projections.
 *
 * Runs N simulations with randomized returns drawn from a normal distribution,
 * then computes percentile bands at each year boundary.
 */
export function runMonteCarlo(input: MonteCarloInput): MonteCarloResult {
  const numSims = input.simulations ?? 1000;
  const seed = input.seed ?? 42;
  const rng = mulberry32(seed);

  // Run all simulations
  const allSimulations: number[][] = [];
  for (let i = 0; i < numSims; i++) {
    allSimulations.push(runSingleSimulation(input, rng));
  }

  // Compute percentiles at each year
  const percentiles: MonteCarloPercentile[] = [];

  for (let year = 0; year <= input.years; year++) {
    const balancesAtYear = allSimulations.map((sim) => sim[year]).sort((a, b) => a - b);

    percentiles.push({
      year,
      p10: roundToCents(percentile(balancesAtYear, 10)),
      p25: roundToCents(percentile(balancesAtYear, 25)),
      p50: roundToCents(percentile(balancesAtYear, 50)),
      p75: roundToCents(percentile(balancesAtYear, 75)),
      p90: roundToCents(percentile(balancesAtYear, 90)),
    });
  }

  // Success rate (balance > 0 at final year)
  const finalBalances = allSimulations.map((sim) => sim[input.years]).sort((a, b) => a - b);
  const failureCount = finalBalances.filter((b) => b <= 0).length;
  const successRate = ((numSims - failureCount) / numSims) * 100;

  return {
    percentiles,
    successRate: Math.round(successRate * 100) / 100,
    failureCount,
    medianFinalBalance: roundToCents(percentile(finalBalances, 50)),
    totalSimulations: numSims,
  };
}
