/**
 * Compound Interest Engine Tests
 *
 * Known-answer tests for TVM functions:
 * futureValue, presentValue, pmt, nper, compoundInterest
 */

import { describe, it, expect } from "vitest";
import {
  futureValue,
  presentValue,
  pmt,
  nper,
  compoundInterest,
} from "@/lib/financial-engine/compounding";

// ============================================================================
// futureValue
// ============================================================================

describe("futureValue", () => {
  it("should return principal for 0 years", () => {
    expect(futureValue(10000, 7, 0)).toBe(10000);
  });

  it("should return principal for 0% rate", () => {
    expect(futureValue(10000, 0, 10)).toBe(10000);
  });

  it("should calculate FV with monthly compounding", () => {
    // $10,000 at 7% for 10 years, monthly compounding
    // FV = 10000 * (1 + 0.07/12)^(12*10) = $20,096.61
    const fv = futureValue(10000, 7, 10, "monthly");
    expect(fv).toBeCloseTo(20096.61, 0);
  });

  it("should calculate FV with annual compounding", () => {
    // $10,000 at 7% for 10 years, annual compounding
    // FV = 10000 * (1.07)^10 = $19,671.51
    const fv = futureValue(10000, 7, 10, "annually");
    expect(fv).toBeCloseTo(19671.51, 0);
  });

  it("should calculate FV with daily compounding", () => {
    // $10,000 at 5% for 5 years, daily compounding
    // FV = 10000 * (1 + 0.05/365)^(365*5) ≈ $12,840.25
    const fv = futureValue(10000, 5, 5, "daily");
    expect(fv).toBeCloseTo(12840.25, 0);
  });

  it("should calculate FV with quarterly compounding", () => {
    // $5,000 at 6% for 3 years, quarterly
    // FV = 5000 * (1 + 0.06/4)^(4*3) = $5,978.09
    const fv = futureValue(5000, 6, 3, "quarterly");
    expect(fv).toBeCloseTo(5978.09, 0);
  });

  it("should calculate FV with semiannual compounding", () => {
    // $10,000 at 8% for 5 years, semiannually
    // FV = 10000 * (1 + 0.08/2)^(2*5) = $14,802.44
    const fv = futureValue(10000, 8, 5, "semiannually");
    expect(fv).toBeCloseTo(14802.44, 0);
  });

  it("should handle very small amounts", () => {
    const fv = futureValue(0.01, 5, 1, "annually");
    expect(fv).toBeCloseTo(0.01, 2);
  });
});

// ============================================================================
// presentValue
// ============================================================================

describe("presentValue", () => {
  it("should return future value for 0 years", () => {
    expect(presentValue(20000, 7, 0)).toBe(20000);
  });

  it("should return future value for 0% rate", () => {
    expect(presentValue(20000, 0, 10)).toBe(20000);
  });

  it("should be inverse of futureValue", () => {
    // PV of $20,096.61 at 7% for 10 years monthly should be ~$10,000
    const pv = presentValue(20096.61, 7, 10, "monthly");
    expect(pv).toBeCloseTo(10000, 0);
  });

  it("should calculate PV with annual compounding", () => {
    // PV of $19,671.51 at 7% for 10 years annual = $10,000
    const pv = presentValue(19671.51, 7, 10, "annually");
    expect(pv).toBeCloseTo(10000, 0);
  });

  it("should round-trip with futureValue", () => {
    const fv = futureValue(5000, 6, 3, "quarterly");
    const pv = presentValue(fv, 6, 3, "quarterly");
    expect(pv).toBeCloseTo(5000, 1);
  });
});

// ============================================================================
// pmt (periodic payment)
// ============================================================================

describe("pmt", () => {
  it("should return 0 for 0 years", () => {
    expect(pmt(10000, 0, 5, 0)).toBe(0);
  });

  it("should calculate payment at 0% rate", () => {
    // Need $10,000 from $0 in 10 years, monthly (120 periods)
    const payment = pmt(10000, 0, 0, 10, "monthly");
    expect(payment).toBeCloseTo(83.33, 0);
  });

  it("should return 0 when present value already exceeds target", () => {
    expect(pmt(10000, 20000, 5, 10, "monthly")).toBe(0);
  });

  it("should calculate monthly savings needed for retirement", () => {
    // Save $1M from $50k over 30 years at 7% monthly
    const payment = pmt(1000000, 50000, 7, 30, "monthly");
    expect(payment).toBeGreaterThan(0);
    expect(payment).toBeLessThan(1500); // Reasonable monthly savings
  });

  it("should calculate annual payment", () => {
    // Save $100,000 from $0 over 10 years at 5% annually
    const payment = pmt(100000, 0, 5, 10, "annually");
    // Annuity formula check
    expect(payment).toBeCloseTo(7950.46, 0);
  });
});

// ============================================================================
// nper (number of periods)
// ============================================================================

describe("nper", () => {
  it("should return 0 when present value >= future value", () => {
    expect(nper(10000, 20000, 500, 5)).toBe(0);
  });

  it("should return Infinity with zero payment and zero rate", () => {
    expect(nper(10000, 0, 0, 0)).toBe(Infinity);
  });

  it("should calculate periods at 0% rate", () => {
    // $8,000 remaining, $500/month = 16 months
    const periods = nper(10000, 2000, 500, 0, "monthly");
    expect(periods).toBe(16);
  });

  it("should calculate periods with interest", () => {
    // $0 to $10,000 at $100/month at 6% monthly
    const periods = nper(10000, 0, 100, 6, "monthly");
    expect(periods).toBeGreaterThan(0);
    expect(periods).toBeLessThan(120); // Less than 10 years
  });

  it("should return Infinity when payment is insufficient", () => {
    // Very small payment, high target
    const periods = nper(1000000, 0, 0, 0, "monthly");
    expect(periods).toBe(Infinity);
  });
});

// ============================================================================
// compoundInterest (full calculation with timeline)
// ============================================================================

describe("compoundInterest", () => {
  it("should calculate principal-only growth (no contributions)", () => {
    const result = compoundInterest({
      principal: 10000,
      periodicContribution: 0,
      annualRate: 7,
      years: 10,
      compoundingFrequency: "monthly",
    });

    expect(result.futureValue).toBeCloseTo(20096.61, 0);
    expect(result.totalContributions).toBe(10000);
    expect(result.totalInterest).toBeCloseTo(10096.61, 0);
  });

  it("should calculate with monthly contributions (end-of-period)", () => {
    const result = compoundInterest({
      principal: 5000,
      periodicContribution: 200,
      annualRate: 6,
      years: 20,
      compoundingFrequency: "monthly",
      contributionTiming: "end",
    });

    expect(result.futureValue).toBeGreaterThan(5000 + 200 * 240);
    expect(result.totalContributions).toBe(5000 + 200 * 240);
    expect(result.totalInterest).toBeGreaterThan(0);
  });

  it("should calculate with beginning-of-period contributions", () => {
    const endResult = compoundInterest({
      principal: 1000,
      periodicContribution: 100,
      annualRate: 8,
      years: 10,
      compoundingFrequency: "monthly",
      contributionTiming: "end",
    });

    const beginResult = compoundInterest({
      principal: 1000,
      periodicContribution: 100,
      annualRate: 8,
      years: 10,
      compoundingFrequency: "monthly",
      contributionTiming: "beginning",
    });

    // Beginning-of-period contributions earn slightly more interest
    expect(beginResult.futureValue).toBeGreaterThan(endResult.futureValue);
    expect(beginResult.totalContributions).toBe(endResult.totalContributions);
  });

  it("should handle 0% rate (just accumulate contributions)", () => {
    const result = compoundInterest({
      principal: 1000,
      periodicContribution: 100,
      annualRate: 0,
      years: 5,
      compoundingFrequency: "monthly",
    });

    expect(result.futureValue).toBe(1000 + 100 * 60);
    expect(result.totalInterest).toBe(0);
    expect(result.effectiveAnnualRate).toBe(0);
  });

  it("should build correct timeline with year-by-year points", () => {
    const result = compoundInterest({
      principal: 10000,
      periodicContribution: 0,
      annualRate: 5,
      years: 3,
      compoundingFrequency: "monthly",
    });

    // Timeline: year 0, 1, 2, 3
    expect(result.timeline).toHaveLength(4);
    expect(result.timeline[0].period).toBe(0);
    expect(result.timeline[0].balance).toBe(10000);
    expect(result.timeline[0].interest).toBe(0);
    expect(result.timeline[3].period).toBe(3);
    expect(result.timeline[3].balance).toBe(result.futureValue);
  });

  it("should calculate correct effective annual rate", () => {
    const result = compoundInterest({
      principal: 10000,
      periodicContribution: 0,
      annualRate: 12,
      years: 1,
      compoundingFrequency: "monthly",
    });

    // EAR = (1 + 0.12/12)^12 - 1 = 12.6825%
    expect(result.effectiveAnnualRate).toBeCloseTo(12.6825, 2);
  });

  it("should have increasing balance in timeline", () => {
    const result = compoundInterest({
      principal: 5000,
      periodicContribution: 100,
      annualRate: 7,
      years: 5,
      compoundingFrequency: "monthly",
    });

    for (let i = 1; i < result.timeline.length; i++) {
      expect(result.timeline[i].balance).toBeGreaterThan(result.timeline[i - 1].balance);
    }
  });

  it("should have consistent final values", () => {
    const result = compoundInterest({
      principal: 10000,
      periodicContribution: 500,
      annualRate: 7,
      years: 10,
      compoundingFrequency: "monthly",
    });

    // futureValue = totalContributions + totalInterest
    expect(result.futureValue).toBeCloseTo(result.totalContributions + result.totalInterest, 0);
  });

  it("should handle all compounding frequencies", () => {
    const frequencies = [
      "daily",
      "weekly",
      "monthly",
      "quarterly",
      "semiannually",
      "annually",
    ] as const;

    const results = frequencies.map((freq) =>
      compoundInterest({
        principal: 10000,
        periodicContribution: 0,
        annualRate: 10,
        years: 1,
        compoundingFrequency: freq,
      })
    );

    // More frequent compounding = higher future value
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].futureValue).toBeGreaterThanOrEqual(results[i + 1].futureValue);
    }
  });
});
