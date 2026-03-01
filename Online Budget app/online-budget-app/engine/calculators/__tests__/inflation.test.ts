import { describe, it, expect } from "vitest";
import {
  adjustForInflation,
  purchasingPowerOverTime,
  realReturnRate,
} from "../inflation";

describe("adjustForInflation", () => {
  it("returns same value if years is 0", () => {
    expect(adjustForInflation(1000, 3, 0)).toBe(1000);
  });

  it("returns same value if inflation rate is 0", () => {
    expect(adjustForInflation(1000, 0, 10)).toBe(1000);
  });

  it("calculates inflation adjustment correctly", () => {
    // $1000 in today's dollars, 3% inflation over 10 years
    const result = adjustForInflation(1000, 3, 10);
    expect(result).toBeCloseTo(744.09, 0);
  });
});

describe("purchasingPowerOverTime", () => {
  it("shows declining purchasing power", () => {
    const result = purchasingPowerOverTime({
      currentAmount: 1000,
      annualInflationRate: 3,
      years: 20,
    });

    expect(result.futureValue).toBeLessThan(1000);
    expect(result.purchasingPowerLost).toBeGreaterThan(0);
    expect(result.purchasingPowerPercent).toBeLessThan(100);
    expect(result.timeline).toHaveLength(21); // year 0 through 20
  });

  it("year 0 has full purchasing power", () => {
    const result = purchasingPowerOverTime({
      currentAmount: 1000,
      annualInflationRate: 3,
      years: 5,
    });

    expect(result.timeline[0]!.realValue).toBe(1000);
    expect(result.timeline[0]!.nominalValue).toBe(1000);
  });
});

describe("realReturnRate", () => {
  it("calculates real return correctly", () => {
    // 7% nominal, 3% inflation => ~3.88% real
    const result = realReturnRate(7, 3);
    expect(result).toBeCloseTo(3.8835, 2);
  });

  it("returns negative when inflation exceeds return", () => {
    const result = realReturnRate(2, 5);
    expect(result).toBeLessThan(0);
  });
});
