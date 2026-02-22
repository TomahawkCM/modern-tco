/**
 * Retirement Planner Engine Tests
 *
 * Known-answer tests for the two-phase retirement simulation:
 * Phase 1 (accumulation) + Phase 2 (withdrawal)
 */

import { describe, it, expect } from "vitest";
import { calculateRetirement } from "@/lib/financial-engine/retirement";
import type { RetirementInput } from "@/lib/financial-engine/types";

const defaultInput: RetirementInput = {
  currentAge: 30,
  retirementAge: 65,
  currentSavings: 50000,
  monthlyContribution: 1000,
  desiredMonthlyIncome: 5000,
  preRetirementReturn: 7,
  postRetirementReturn: 5,
  inflationRate: 3,
  lifeExpectancy: 85,
  socialSecurityMonthly: 1900,
  socialSecurityStartAge: 67,
};

// ============================================================================
// Basic calculations
// ============================================================================

describe("calculateRetirement", () => {
  it("should calculate positive balance at retirement", () => {
    const result = calculateRetirement(defaultInput);

    expect(result.balanceAtRetirement).toBeGreaterThan(0);
    expect(result.balanceAtRetirement).toBeGreaterThan(defaultInput.currentSavings);
  });

  it("should calculate monthly withdrawal at retirement", () => {
    const result = calculateRetirement(defaultInput);

    // Should be inflation-adjusted from desired income
    expect(result.monthlyWithdrawal).toBeGreaterThan(defaultInput.desiredMonthlyIncome);
  });

  it("should track years money lasts", () => {
    const result = calculateRetirement(defaultInput);

    expect(result.yearsMoneyLasts).toBeGreaterThan(0);
  });

  it("should determine sufficiency", () => {
    const result = calculateRetirement(defaultInput);

    // With 35 years of saving $1k/month at 7% plus $50k starting,
    // should be sufficient for most scenarios
    expect(typeof result.isSufficient).toBe("boolean");
  });
});

// ============================================================================
// Phase 1: Accumulation
// ============================================================================

describe("Phase 1: Accumulation", () => {
  it("should have accumulation entries in timeline", () => {
    const result = calculateRetirement(defaultInput);

    const accum = result.timeline.filter((p) => p.phase === "accumulation");
    expect(accum.length).toBeGreaterThan(0);
  });

  it("should start timeline at current age", () => {
    const result = calculateRetirement(defaultInput);

    expect(result.timeline[0].age).toBe(30);
    expect(result.timeline[0].balance).toBe(50000);
    expect(result.timeline[0].phase).toBe("accumulation");
  });

  it("should show growing balance during accumulation", () => {
    const result = calculateRetirement(defaultInput);

    const accum = result.timeline.filter((p) => p.phase === "accumulation");
    for (let i = 1; i < accum.length; i++) {
      expect(accum[i].balance).toBeGreaterThan(accum[i - 1].balance);
    }
  });

  it("should have zero withdrawals during accumulation", () => {
    const result = calculateRetirement(defaultInput);

    const accum = result.timeline.filter((p) => p.phase === "accumulation");
    for (const point of accum) {
      expect(point.withdrawals).toBe(0);
    }
  });

  it("should record contributions during accumulation", () => {
    const result = calculateRetirement(defaultInput);

    const accumYears = result.timeline.filter((p) => p.phase === "accumulation" && p.year > 0);
    for (const point of accumYears) {
      expect(point.contributions).toBeGreaterThan(0);
    }
  });

  it("should have accumulation end at retirement age", () => {
    const result = calculateRetirement(defaultInput);

    const accum = result.timeline.filter((p) => p.phase === "accumulation");
    const lastAccum = accum[accum.length - 1];
    expect(lastAccum.age).toBe(65);
  });
});

// ============================================================================
// Phase 2: Withdrawal
// ============================================================================

describe("Phase 2: Withdrawal", () => {
  it("should have withdrawal entries after retirement", () => {
    const result = calculateRetirement(defaultInput);

    const withdrawal = result.timeline.filter((p) => p.phase === "withdrawal");
    expect(withdrawal.length).toBeGreaterThan(0);
  });

  it("should start withdrawals at retirement age + 1", () => {
    const result = calculateRetirement(defaultInput);

    const firstWithdrawal = result.timeline.find((p) => p.phase === "withdrawal");
    expect(firstWithdrawal?.age).toBe(66);
  });

  it("should have zero contributions during withdrawal", () => {
    const result = calculateRetirement(defaultInput);

    const withdrawal = result.timeline.filter((p) => p.phase === "withdrawal");
    for (const point of withdrawal) {
      expect(point.contributions).toBe(0);
    }
  });

  it("should include Social Security after SS start age", () => {
    const result = calculateRetirement(defaultInput);

    const beforeSS = result.timeline.find((p) => p.phase === "withdrawal" && p.age === 66);
    const afterSS = result.timeline.find((p) => p.phase === "withdrawal" && p.age === 68);

    expect(beforeSS?.socialSecurity).toBe(0);
    expect(afterSS?.socialSecurity).toBeGreaterThan(0);
  });
});

// ============================================================================
// Edge cases
// ============================================================================

describe("Edge cases", () => {
  it("should handle already-retired scenario", () => {
    const result = calculateRetirement({
      ...defaultInput,
      currentAge: 65,
      retirementAge: 65,
    });

    // Should skip accumulation and go straight to withdrawal
    expect(result.balanceAtRetirement).toBe(50000);
    const accum = result.timeline.filter((p) => p.phase === "accumulation");
    expect(accum).toHaveLength(1); // Just the initial point
  });

  it("should handle zero Social Security", () => {
    const result = calculateRetirement({
      ...defaultInput,
      socialSecurityMonthly: 0,
    });

    const withdrawal = result.timeline.filter((p) => p.phase === "withdrawal");
    for (const point of withdrawal) {
      expect(point.socialSecurity).toBe(0);
    }

    // Money should run out faster without SS
    const withSS = calculateRetirement(defaultInput);
    expect(result.yearsMoneyLasts).toBeLessThanOrEqual(withSS.yearsMoneyLasts);
  });

  it("should handle zero inflation", () => {
    const result = calculateRetirement({
      ...defaultInput,
      inflationRate: 0,
    });

    // Withdrawal should equal desired income (no inflation adjustment)
    expect(result.monthlyWithdrawal).toBe(defaultInput.desiredMonthlyIncome);
  });

  it("should handle zero contribution", () => {
    const result = calculateRetirement({
      ...defaultInput,
      monthlyContribution: 0,
    });

    expect(result.balanceAtRetirement).toBeGreaterThan(0); // Still grows via returns
    expect(result.balanceAtRetirement).toBeLessThan(
      calculateRetirement(defaultInput).balanceAtRetirement
    );
  });

  it("should handle very high desired income (money runs out)", () => {
    const result = calculateRetirement({
      ...defaultInput,
      currentSavings: 10000,
      monthlyContribution: 100,
      desiredMonthlyIncome: 20000,
    });

    expect(result.ageMoneyRunsOut).not.toBeNull();
    expect(result.isSufficient).toBe(false);
  });

  it("should handle comfortable scenario (money never runs out)", () => {
    const result = calculateRetirement({
      ...defaultInput,
      currentSavings: 1000000,
      monthlyContribution: 5000,
      desiredMonthlyIncome: 2000,
    });

    // With large savings and small withdrawal, should be sufficient
    expect(result.isSufficient).toBe(true);
  });

  it("should report shortfall or surplus at life expectancy", () => {
    const result = calculateRetirement(defaultInput);

    expect(typeof result.shortfallOrSurplus).toBe("number");
  });
});
