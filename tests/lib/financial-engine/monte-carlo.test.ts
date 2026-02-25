/**
 * Monte Carlo Engine Tests
 *
 * Tests for probabilistic financial simulation.
 */

import { describe, it, expect } from "vitest";
import { runMonteCarlo } from "@/lib/financial-engine/monte-carlo";
import type { MonteCarloInput } from "@/lib/financial-engine/monte-carlo";

const defaultInput: MonteCarloInput = {
  initialBalance: 500000,
  monthlyContribution: 0,
  monthlyWithdrawal: 2000,
  expectedAnnualReturn: 7,
  annualVolatility: 15,
  inflationRate: 3,
  years: 30,
  simulations: 500,
  seed: 42,
};

describe("runMonteCarlo", () => {
  it("should return percentile bands for each year", () => {
    const result = runMonteCarlo(defaultInput);

    // Year 0 through year 30 = 31 points
    expect(result.percentiles).toHaveLength(31);
    expect(result.percentiles[0].year).toBe(0);
    expect(result.percentiles[30].year).toBe(30);
  });

  it("should start with initial balance at year 0", () => {
    const result = runMonteCarlo(defaultInput);

    const p0 = result.percentiles[0];
    expect(p0.p10).toBe(500000);
    expect(p0.p50).toBe(500000);
    expect(p0.p90).toBe(500000);
  });

  it("should have p10 <= p25 <= p50 <= p75 <= p90", () => {
    const result = runMonteCarlo(defaultInput);

    for (const p of result.percentiles) {
      expect(p.p10).toBeLessThanOrEqual(p.p25);
      expect(p.p25).toBeLessThanOrEqual(p.p50);
      expect(p.p50).toBeLessThanOrEqual(p.p75);
      expect(p.p75).toBeLessThanOrEqual(p.p90);
    }
  });

  it("should report success rate between 0 and 100", () => {
    const result = runMonteCarlo(defaultInput);

    expect(result.successRate).toBeGreaterThanOrEqual(0);
    expect(result.successRate).toBeLessThanOrEqual(100);
  });

  it("should report total simulations", () => {
    const result = runMonteCarlo(defaultInput);
    expect(result.totalSimulations).toBe(500);
  });

  it("should be deterministic with same seed", () => {
    const result1 = runMonteCarlo(defaultInput);
    const result2 = runMonteCarlo(defaultInput);

    expect(result1.medianFinalBalance).toBe(result2.medianFinalBalance);
    expect(result1.successRate).toBe(result2.successRate);
  });

  it("should produce different results with different seeds", () => {
    const result1 = runMonteCarlo({ ...defaultInput, seed: 42 });
    const result2 = runMonteCarlo({ ...defaultInput, seed: 123 });

    // Very unlikely to be exactly equal with different seeds
    expect(result1.medianFinalBalance).not.toBe(result2.medianFinalBalance);
  });

  it("should show growth with accumulation (no withdrawal)", () => {
    const result = runMonteCarlo({
      initialBalance: 100000,
      monthlyContribution: 1000,
      monthlyWithdrawal: 0,
      expectedAnnualReturn: 7,
      annualVolatility: 10,
      years: 20,
      simulations: 200,
      seed: 42,
    });

    // Median should grow significantly
    expect(result.percentiles[20].p50).toBeGreaterThan(100000);
    expect(result.successRate).toBe(100);
  });

  it("should show depletion with high withdrawal rate", () => {
    const result = runMonteCarlo({
      initialBalance: 100000,
      monthlyContribution: 0,
      monthlyWithdrawal: 5000,
      expectedAnnualReturn: 5,
      annualVolatility: 15,
      years: 10,
      simulations: 200,
      seed: 42,
    });

    // High withdrawal should cause many failures
    expect(result.failureCount).toBeGreaterThan(0);
    expect(result.successRate).toBeLessThan(100);
  });

  it("should handle zero volatility (deterministic)", () => {
    const result = runMonteCarlo({
      initialBalance: 100000,
      monthlyContribution: 0,
      monthlyWithdrawal: 0,
      expectedAnnualReturn: 5,
      annualVolatility: 0,
      years: 5,
      simulations: 50,
      seed: 42,
    });

    // With zero volatility, all percentiles should be equal
    const lastYear = result.percentiles[5];
    expect(lastYear.p10).toBe(lastYear.p90);
  });

  it("should default to 1000 simulations", () => {
    const result = runMonteCarlo({
      ...defaultInput,
      simulations: undefined,
      years: 1,
    });

    expect(result.totalSimulations).toBe(1000);
  });

  it("should handle inflation on withdrawals", () => {
    const noInflation = runMonteCarlo({
      ...defaultInput,
      inflationRate: 0,
      years: 10,
      simulations: 200,
    });

    const withInflation = runMonteCarlo({
      ...defaultInput,
      inflationRate: 5,
      years: 10,
      simulations: 200,
    });

    // Higher inflation = more withdrawals = lower balance
    expect(withInflation.medianFinalBalance).toBeLessThan(noInflation.medianFinalBalance);
  });
});
