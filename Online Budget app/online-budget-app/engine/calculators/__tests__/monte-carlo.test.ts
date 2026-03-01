import { describe, it, expect } from "vitest";
import { runMonteCarlo } from "../monte-carlo";

describe("runMonteCarlo", () => {
  it("produces deterministic results with same seed", () => {
    const input = {
      initialBalance: 100000,
      monthlyContribution: 1000,
      monthlyWithdrawal: 0,
      expectedAnnualReturn: 7,
      annualVolatility: 15,
      years: 10,
      simulations: 100,
      seed: 42,
    };

    const result1 = runMonteCarlo(input);
    const result2 = runMonteCarlo(input);

    expect(result1.medianFinalBalance).toBe(result2.medianFinalBalance);
    expect(result1.successRate).toBe(result2.successRate);
  });

  it("produces correct number of percentile entries", () => {
    const result = runMonteCarlo({
      initialBalance: 100000,
      monthlyContribution: 500,
      monthlyWithdrawal: 0,
      expectedAnnualReturn: 7,
      annualVolatility: 15,
      years: 20,
      simulations: 50,
      seed: 123,
    });

    expect(result.percentiles).toHaveLength(21); // year 0 through 20
    expect(result.totalSimulations).toBe(50);
  });

  it("has 100% success rate for accumulation scenario", () => {
    const result = runMonteCarlo({
      initialBalance: 100000,
      monthlyContribution: 1000,
      monthlyWithdrawal: 0,
      expectedAnnualReturn: 7,
      annualVolatility: 5,
      years: 10,
      simulations: 100,
      seed: 42,
    });

    expect(result.successRate).toBe(100);
    expect(result.failureCount).toBe(0);
  });

  it("handles withdrawal scenarios", () => {
    const result = runMonteCarlo({
      initialBalance: 1000000,
      monthlyContribution: 0,
      monthlyWithdrawal: 5000,
      expectedAnnualReturn: 5,
      annualVolatility: 10,
      inflationRate: 3,
      years: 30,
      simulations: 100,
      seed: 42,
    });

    expect(result.successRate).toBeGreaterThanOrEqual(0);
    expect(result.successRate).toBeLessThanOrEqual(100);
  });

  it("year 0 percentiles all equal initial balance", () => {
    const result = runMonteCarlo({
      initialBalance: 50000,
      monthlyContribution: 0,
      monthlyWithdrawal: 0,
      expectedAnnualReturn: 7,
      annualVolatility: 15,
      years: 5,
      simulations: 50,
      seed: 1,
    });

    expect(result.percentiles[0]!.p10).toBe(50000);
    expect(result.percentiles[0]!.p50).toBe(50000);
    expect(result.percentiles[0]!.p90).toBe(50000);
  });
});
