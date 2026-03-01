import { describe, it, expect } from "vitest";
import {
  futureValue,
  presentValue,
  pmt,
  nper,
  compoundInterest,
} from "../compounding";

describe("futureValue", () => {
  it("returns same value if years is 0", () => {
    expect(futureValue(1000, 7, 0)).toBe(1000);
  });

  it("returns same value if rate is 0", () => {
    expect(futureValue(1000, 0, 10)).toBe(1000);
  });

  it("calculates correctly for monthly compounding", () => {
    // $10,000 at 7% for 10 years, monthly compounding
    const result = futureValue(10000, 7, 10, "monthly");
    expect(result).toBeCloseTo(20096.61, 0);
  });

  it("calculates correctly for annual compounding", () => {
    // $10,000 at 7% for 10 years, annual compounding
    const result = futureValue(10000, 7, 10, "annually");
    expect(result).toBeCloseTo(19671.51, 0);
  });
});

describe("presentValue", () => {
  it("returns same value if years is 0", () => {
    expect(presentValue(20000, 7, 0)).toBe(20000);
  });

  it("is the inverse of futureValue", () => {
    const fv = futureValue(10000, 5, 10, "monthly");
    const pv = presentValue(fv, 5, 10, "monthly");
    expect(pv).toBeCloseTo(10000, 0);
  });
});

describe("pmt", () => {
  it("returns 0 if years is 0", () => {
    expect(pmt(10000, 0, 5, 0)).toBe(0);
  });

  it("calculates payment without interest", () => {
    // Need $12,000 from $0 over 10 years, monthly, 0% rate
    const result = pmt(12000, 0, 0, 10, "monthly");
    expect(result).toBe(100); // 12000 / 120 periods
  });

  it("calculates payment with interest", () => {
    // Need $100,000 from $10,000 over 20 years at 7% monthly
    const result = pmt(100000, 10000, 7, 20, "monthly");
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(200);
  });

  it("returns 0 if present value already exceeds future value", () => {
    expect(pmt(10000, 20000, 5, 10)).toBe(0);
  });
});

describe("nper", () => {
  it("returns 0 if already at goal", () => {
    expect(nper(10000, 10000, 100, 5)).toBe(0);
  });

  it("returns Infinity if no payment and no rate", () => {
    expect(nper(10000, 1000, 0, 0)).toBe(Infinity);
  });

  it("calculates periods correctly without interest", () => {
    // Need to go from $0 to $1200, $100/period, no interest
    const result = nper(1200, 0, 100, 0, "monthly");
    expect(result).toBe(12);
  });

  it("calculates periods with interest", () => {
    const result = nper(100000, 10000, 500, 7, "monthly");
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(600);
  });
});

describe("compoundInterest", () => {
  it("calculates compound interest with monthly contributions", () => {
    const result = compoundInterest({
      principal: 10000,
      periodicContribution: 200,
      annualRate: 7,
      years: 10,
      compoundingFrequency: "monthly",
    });

    expect(result.futureValue).toBeGreaterThan(10000);
    expect(result.totalContributions).toBeCloseTo(10000 + 200 * 120, 0);
    expect(result.totalInterest).toBeGreaterThan(0);
    expect(result.effectiveAnnualRate).toBeGreaterThan(7);
    expect(result.timeline).toHaveLength(11); // year 0 through year 10
  });

  it("handles zero rate correctly", () => {
    const result = compoundInterest({
      principal: 1000,
      periodicContribution: 100,
      annualRate: 0,
      years: 2,
      compoundingFrequency: "monthly",
    });

    expect(result.futureValue).toBeCloseTo(1000 + 100 * 24, 0);
    expect(result.totalInterest).toBe(0);
    expect(result.effectiveAnnualRate).toBe(0);
  });

  it("supports beginning-of-period contributions", () => {
    const endResult = compoundInterest({
      principal: 0,
      periodicContribution: 100,
      annualRate: 12,
      years: 1,
      compoundingFrequency: "monthly",
      contributionTiming: "end",
    });

    const beginResult = compoundInterest({
      principal: 0,
      periodicContribution: 100,
      annualRate: 12,
      years: 1,
      compoundingFrequency: "monthly",
      contributionTiming: "beginning",
    });

    // Beginning-of-period earns more because money is invested earlier
    expect(beginResult.futureValue).toBeGreaterThan(endResult.futureValue);
  });
});
