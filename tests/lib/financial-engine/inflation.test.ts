/**
 * Inflation Engine Tests
 *
 * Known-answer tests for inflation calculations:
 * adjustForInflation, purchasingPowerOverTime, realReturnRate
 */

import { describe, it, expect } from "vitest";
import {
  adjustForInflation,
  purchasingPowerOverTime,
  realReturnRate,
} from "@/lib/financial-engine/inflation";

// ============================================================================
// adjustForInflation
// ============================================================================

describe("adjustForInflation", () => {
  it("should return nominal value for 0 years", () => {
    expect(adjustForInflation(1000, 3, 0)).toBe(1000);
  });

  it("should return nominal value for 0% inflation", () => {
    expect(adjustForInflation(1000, 0, 10)).toBe(1000);
  });

  it("should reduce purchasing power over time", () => {
    // $1000 at 3% inflation for 10 years
    // realValue = 1000 / (1.03)^10 = $744.09
    const real = adjustForInflation(1000, 3, 10);
    expect(real).toBeCloseTo(744.09, 0);
  });

  it("should roughly halve purchasing power at ~24 years with 3% inflation", () => {
    // Rule of 72: 72/3 = 24 years → approximately halved
    const real = adjustForInflation(1000, 3, 24);
    expect(real).toBeGreaterThan(450);
    expect(real).toBeLessThan(550);
  });

  it("should handle high inflation", () => {
    // $1000 at 10% for 5 years
    // realValue = 1000 / (1.10)^5 = $620.92
    const real = adjustForInflation(1000, 10, 5);
    expect(real).toBeCloseTo(620.92, 0);
  });

  it("should handle very small amounts", () => {
    const real = adjustForInflation(0.01, 3, 1);
    expect(real).toBeCloseTo(0.01, 2);
  });
});

// ============================================================================
// purchasingPowerOverTime
// ============================================================================

describe("purchasingPowerOverTime", () => {
  it("should start with full purchasing power at year 0", () => {
    const result = purchasingPowerOverTime({
      currentAmount: 1000,
      annualInflationRate: 3,
      years: 10,
    });

    expect(result.timeline[0].year).toBe(0);
    expect(result.timeline[0].nominalValue).toBe(1000);
    expect(result.timeline[0].realValue).toBe(1000);
  });

  it("should show declining real value", () => {
    const result = purchasingPowerOverTime({
      currentAmount: 1000,
      annualInflationRate: 3,
      years: 5,
    });

    for (let i = 1; i < result.timeline.length; i++) {
      expect(result.timeline[i].realValue).toBeLessThan(result.timeline[i - 1].realValue);
    }
  });

  it("should keep nominal value constant", () => {
    const result = purchasingPowerOverTime({
      currentAmount: 5000,
      annualInflationRate: 3,
      years: 10,
    });

    for (const point of result.timeline) {
      expect(point.nominalValue).toBe(5000);
    }
  });

  it("should have correct number of timeline points", () => {
    const result = purchasingPowerOverTime({
      currentAmount: 1000,
      annualInflationRate: 3,
      years: 20,
    });

    // year 0 through year 20 = 21 points
    expect(result.timeline).toHaveLength(21);
  });

  it("should calculate total purchasing power lost", () => {
    const result = purchasingPowerOverTime({
      currentAmount: 1000,
      annualInflationRate: 3,
      years: 10,
    });

    expect(result.purchasingPowerLost).toBeCloseTo(1000 - 744.09, 0);
    expect(result.futureValue).toBeCloseTo(744.09, 0);
  });

  it("should calculate purchasing power percentage", () => {
    const result = purchasingPowerOverTime({
      currentAmount: 1000,
      annualInflationRate: 3,
      years: 10,
    });

    expect(result.purchasingPowerPercent).toBeCloseTo(74.41, 0);
  });

  it("should handle zero amount", () => {
    const result = purchasingPowerOverTime({
      currentAmount: 0,
      annualInflationRate: 3,
      years: 5,
    });

    expect(result.futureValue).toBe(0);
    expect(result.purchasingPowerLost).toBe(0);
    expect(result.purchasingPowerPercent).toBe(0);
  });
});

// ============================================================================
// realReturnRate
// ============================================================================

describe("realReturnRate", () => {
  it("should calculate real return with Fisher equation", () => {
    // Nominal 7%, Inflation 3%
    // Real = ((1.07)/(1.03)) - 1 = 3.8835%
    const real = realReturnRate(7, 3);
    expect(real).toBeCloseTo(3.8835, 2);
  });

  it("should return 0 when nominal equals inflation", () => {
    const real = realReturnRate(5, 5);
    expect(real).toBeCloseTo(0, 4);
  });

  it("should return negative when inflation exceeds nominal", () => {
    const real = realReturnRate(3, 5);
    expect(real).toBeLessThan(0);
  });

  it("should return nominal rate when inflation is 0", () => {
    expect(realReturnRate(7, 0)).toBeCloseTo(7, 2);
  });

  it("should return negative inflation rate when nominal is 0", () => {
    // Real = (1/(1.03)) - 1 = -2.9126%
    const real = realReturnRate(0, 3);
    expect(real).toBeCloseTo(-2.9126, 2);
  });

  it("should handle high rates", () => {
    // Nominal 15%, Inflation 10%
    // Real = (1.15/1.10) - 1 = 4.5455%
    const real = realReturnRate(15, 10);
    expect(real).toBeCloseTo(4.5455, 2);
  });
});
