/**
 * Inflation Engine Tests
 */

import { describe, it, expect } from "vitest";
import {
  adjustForInflation,
  purchasingPowerOverTime,
  realReturnRate,
} from "@/lib/financial-engine/inflation";

describe("adjustForInflation", () => {
  it("adjusts $100 for 3% inflation over 10 years", () => {
    // $100 / (1.03)^10 = $74.41
    const result = adjustForInflation(100, 3, 10);
    expect(result).toBeCloseTo(74.41, 0);
  });

  it("adjusts for 0% inflation (no change)", () => {
    expect(adjustForInflation(100, 0, 10)).toBe(100);
  });

  it("adjusts for 0 years (no change)", () => {
    expect(adjustForInflation(100, 3, 0)).toBe(100);
  });

  it("handles high inflation", () => {
    // $1000 at 10% inflation over 20 years
    // $1000 / (1.10)^20 = $148.64
    const result = adjustForInflation(1000, 10, 20);
    expect(result).toBeCloseTo(148.64, 0);
  });
});

describe("purchasingPowerOverTime", () => {
  it("generates correct timeline at 3% inflation", () => {
    const result = purchasingPowerOverTime({
      currentAmount: 100000,
      annualInflationRate: 3,
      years: 30,
    });

    expect(result.timeline).toHaveLength(31); // 0 through 30
    expect(result.timeline[0].realValue).toBe(100000);
    expect(result.timeline[0].nominalValue).toBe(100000);

    // After 30 years at 3%, purchasing power ≈ $41,199
    expect(result.futureValue).toBeCloseTo(41199, -2);
    expect(result.purchasingPowerLost).toBeGreaterThan(50000);
    expect(result.purchasingPowerPercent).toBeCloseTo(41.2, 0);
  });

  it("handles zero inflation", () => {
    const result = purchasingPowerOverTime({
      currentAmount: 50000,
      annualInflationRate: 0,
      years: 10,
    });

    expect(result.futureValue).toBe(50000);
    expect(result.purchasingPowerLost).toBe(0);
    expect(result.purchasingPowerPercent).toBe(100);
  });

  it("nominal value stays constant", () => {
    const result = purchasingPowerOverTime({
      currentAmount: 75000,
      annualInflationRate: 5,
      years: 20,
    });

    // Every point should have the same nominal value
    result.timeline.forEach((point) => {
      expect(point.nominalValue).toBe(75000);
    });

    // Real value should decrease monotonically
    for (let i = 1; i < result.timeline.length; i++) {
      expect(result.timeline[i].realValue).toBeLessThan(result.timeline[i - 1].realValue);
    }
  });
});

describe("realReturnRate", () => {
  it("calculates real return correctly", () => {
    // 7% nominal, 3% inflation → real ≈ 3.883%
    const result = realReturnRate(7, 3);
    expect(result).toBeCloseTo(3.883, 1);
  });

  it("returns ~0 when nominal equals inflation", () => {
    const result = realReturnRate(3, 3);
    expect(result).toBeCloseTo(0, 2);
  });

  it("returns negative when inflation exceeds return", () => {
    const result = realReturnRate(2, 5);
    expect(result).toBeLessThan(0);
  });

  it("handles zero inflation", () => {
    const result = realReturnRate(7, 0);
    expect(result).toBeCloseTo(7, 2);
  });
});
