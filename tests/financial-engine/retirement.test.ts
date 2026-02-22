/**
 * Retirement Planner Engine Tests
 */

import { describe, it, expect } from "vitest";
import { calculateRetirement } from "@/lib/financial-engine/retirement";

const baseInput = {
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

describe("calculateRetirement", () => {
  it("generates accumulation + withdrawal timeline", () => {
    const result = calculateRetirement(baseInput);

    // Should have accumulation points from age 30-65 and withdrawal points after
    const accumPhase = result.timeline.filter((p) => p.phase === "accumulation");
    const withdrawPhase = result.timeline.filter((p) => p.phase === "withdrawal");

    expect(accumPhase.length).toBe(36); // age 30 through 65
    expect(withdrawPhase.length).toBeGreaterThan(0);

    // First point should be current age
    expect(result.timeline[0].age).toBe(30);
    expect(result.timeline[0].balance).toBe(50000);
  });

  it("calculates reasonable balance at retirement", () => {
    const result = calculateRetirement(baseInput);

    // $50K + $1K/month at 7% for 35 years should be well over $1M
    expect(result.balanceAtRetirement).toBeGreaterThan(1000000);
    expect(result.balanceAtRetirement).toBeLessThan(3000000);
  });

  it("indicates sufficient funds for typical scenario", () => {
    const result = calculateRetirement(baseInput);

    // With good savings + SS, should last through life expectancy
    expect(result.isSufficient).toBe(true);
    // Money may eventually run out past life expectancy — that's still "sufficient"
    if (result.ageMoneyRunsOut !== null) {
      expect(result.ageMoneyRunsOut).toBeGreaterThan(baseInput.lifeExpectancy);
    }
  });

  it("detects insufficient savings", () => {
    const result = calculateRetirement({
      ...baseInput,
      currentSavings: 0,
      monthlyContribution: 100,
      desiredMonthlyIncome: 10000,
      socialSecurityMonthly: 0,
    });

    expect(result.isSufficient).toBe(false);
    expect(result.ageMoneyRunsOut).not.toBeNull();
    if (result.ageMoneyRunsOut !== null) {
      expect(result.ageMoneyRunsOut).toBeLessThan(85);
    }
  });

  it("handles already-retired scenario (age = retirement age)", () => {
    const result = calculateRetirement({
      ...baseInput,
      currentAge: 65,
      retirementAge: 65,
      currentSavings: 1000000,
    });

    // Should have no accumulation phase (just the initial point)
    const accumPhase = result.timeline.filter((p) => p.phase === "accumulation");
    expect(accumPhase.length).toBe(1); // Just the initial point

    expect(result.balanceAtRetirement).toBe(1000000);
  });

  it("includes Social Security in withdrawal calculations", () => {
    const withSS = calculateRetirement(baseInput);
    const withoutSS = calculateRetirement({
      ...baseInput,
      socialSecurityMonthly: 0,
    });

    // With Social Security, money should last longer
    expect(withSS.yearsMoneyLasts).toBeGreaterThanOrEqual(withoutSS.yearsMoneyLasts);
  });

  it("Social Security appears in timeline at correct age", () => {
    const result = calculateRetirement(baseInput);

    // Before SS age, socialSecurity should be 0
    const beforeSS = result.timeline.find((p) => p.phase === "withdrawal" && p.age === 66);
    if (beforeSS) {
      expect(beforeSS.socialSecurity).toBe(0);
    }

    // At/after SS age, socialSecurity should be > 0
    const afterSS = result.timeline.find((p) => p.phase === "withdrawal" && p.age === 68);
    if (afterSS) {
      expect(afterSS.socialSecurity).toBeGreaterThan(0);
    }
  });

  it("monthly withdrawal is inflation-adjusted", () => {
    const result = calculateRetirement(baseInput);

    // At 3% inflation for 35 years, $5000 becomes ~$14,106
    expect(result.monthlyWithdrawal).toBeGreaterThan(10000);
    expect(result.monthlyWithdrawal).toBeLessThan(20000);
  });
});
