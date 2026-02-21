/**
 * Compound Interest Engine Tests
 *
 * Known-answer tests verified against Excel TVM functions.
 */

import { describe, it, expect } from "vitest";
import {
  futureValue,
  presentValue,
  pmt,
  nper,
  compoundInterest,
} from "@/lib/financial-engine/compounding";

describe("futureValue", () => {
  it("calculates FV with monthly compounding", () => {
    // Excel: =FV(0.05/12, 10*12, 0, -1000) = 1647.01
    const result = futureValue(1000, 5, 10, "monthly");
    expect(result).toBeCloseTo(1647.01, 0);
  });

  it("calculates FV with annual compounding", () => {
    // Excel: =FV(0.05, 10, 0, -1000) = 1628.89
    const result = futureValue(1000, 5, 10, "annually");
    expect(result).toBeCloseTo(1628.89, 0);
  });

  it("calculates FV with quarterly compounding", () => {
    // Excel: =FV(0.05/4, 10*4, 0, -1000) = 1643.62
    const result = futureValue(1000, 5, 10, "quarterly");
    expect(result).toBeCloseTo(1643.62, 0);
  });

  it("returns principal when rate is 0", () => {
    expect(futureValue(1000, 0, 10)).toBe(1000);
  });

  it("returns principal when years is 0", () => {
    expect(futureValue(1000, 5, 0)).toBe(1000);
  });
});

describe("presentValue", () => {
  it("calculates PV with monthly compounding", () => {
    // PV of $1647.01 at 5% over 10 years should be ~$1000
    const result = presentValue(1647.01, 5, 10, "monthly");
    expect(result).toBeCloseTo(1000, 0);
  });

  it("returns futureValue when rate is 0", () => {
    expect(presentValue(1500, 0, 10)).toBe(1500);
  });

  it("returns futureValue when years is 0", () => {
    expect(presentValue(1500, 5, 0)).toBe(1500);
  });
});

describe("pmt", () => {
  it("calculates monthly payment to reach a goal", () => {
    // Save $100,000 in 20 years at 7% starting from $0
    // PMT = FV * r / ((1+r)^n - 1) = 100000 * 0.005833 / (4.0387 - 1) ≈ $191.97
    const result = pmt(100000, 0, 7, 20, "monthly");
    expect(result).toBeCloseTo(191.97, 0);
  });

  it("calculates payment with existing savings", () => {
    // Save $100,000 in 20 years at 7% starting from $10,000
    // FV of PV = 10000 * (1.005833)^240 ≈ 40,387
    // PMT = (100000 - 40387) * 0.005833 / (4.0387 - 1) ≈ $114.44
    const result = pmt(100000, 10000, 7, 20, "monthly");
    expect(result).toBeCloseTo(114.44, 0);
  });

  it("returns 0 when goal already met", () => {
    expect(pmt(50000, 60000, 7, 20)).toBe(0);
  });

  it("returns 0 when years is 0", () => {
    expect(pmt(50000, 0, 7, 0)).toBe(0);
  });

  it("works with zero interest rate", () => {
    // $100,000 over 20 years (240 months) = $416.67/month
    const result = pmt(100000, 0, 0, 20, "monthly");
    expect(result).toBeCloseTo(416.67, 0);
  });
});

describe("nper", () => {
  it("calculates periods to reach a goal", () => {
    // How many months to save $10,000 saving $200/month at 5% starting from $0?
    const result = nper(10000, 0, 200, 5, "monthly");
    expect(result).toBeGreaterThan(40);
    expect(result).toBeLessThan(50);
  });

  it("returns 0 when already met", () => {
    expect(nper(10000, 15000, 200, 5)).toBe(0);
  });

  it("returns Infinity when no payment and no rate", () => {
    expect(nper(10000, 0, 0, 0)).toBe(Infinity);
  });
});

describe("compoundInterest", () => {
  it("calculates compound interest with monthly contributions", () => {
    // $10,000 initial + $500/month at 7% for 30 years, monthly compounding
    const result = compoundInterest({
      principal: 10000,
      periodicContribution: 500,
      annualRate: 7,
      years: 30,
      compoundingFrequency: "monthly",
    });

    // Expected FV ≈ $681,564 (Bankrate calculator reference)
    expect(result.futureValue).toBeGreaterThan(600000);
    expect(result.futureValue).toBeLessThan(700000);

    // Total contributions = 10,000 + (500 * 12 * 30) = 190,000
    expect(result.totalContributions).toBe(190000);

    // Interest = FV - contributions
    expect(result.totalInterest).toBeCloseTo(result.futureValue - 190000, 0);

    // Should have 31 timeline points (0 through 30 years)
    expect(result.timeline).toHaveLength(31);
    expect(result.timeline[0].period).toBe(0);
    expect(result.timeline[30].period).toBe(30);
  });

  it("calculates with annual compounding", () => {
    const result = compoundInterest({
      principal: 1000,
      periodicContribution: 0,
      annualRate: 10,
      years: 10,
      compoundingFrequency: "annually",
    });

    // $1000 at 10% for 10 years = $2,593.74
    expect(result.futureValue).toBeCloseTo(2593.74, 0);
    expect(result.totalContributions).toBe(1000);
  });

  it("handles zero interest rate", () => {
    const result = compoundInterest({
      principal: 1000,
      periodicContribution: 100,
      annualRate: 0,
      years: 5,
      compoundingFrequency: "monthly",
    });

    // 1000 + (100 * 12 * 5) = 7000
    expect(result.futureValue).toBe(7000);
    expect(result.totalInterest).toBe(0);
    expect(result.effectiveAnnualRate).toBe(0);
  });

  it("calculates effective annual rate", () => {
    const result = compoundInterest({
      principal: 1000,
      periodicContribution: 0,
      annualRate: 12,
      years: 1,
      compoundingFrequency: "monthly",
    });

    // EAR = (1 + 0.12/12)^12 - 1 = 12.6825%
    expect(result.effectiveAnnualRate).toBeCloseTo(12.6825, 2);
  });

  it("handles beginning-of-period contributions", () => {
    const resultEnd = compoundInterest({
      principal: 0,
      periodicContribution: 100,
      annualRate: 12,
      years: 1,
      compoundingFrequency: "monthly",
    });

    const resultBeginning = compoundInterest({
      principal: 0,
      periodicContribution: 100,
      annualRate: 12,
      years: 1,
      compoundingFrequency: "monthly",
      contributionTiming: "beginning",
    });

    // Beginning-of-period should yield more (each contribution earns one extra period of interest)
    expect(resultBeginning.futureValue).toBeGreaterThan(resultEnd.futureValue);
  });
});
