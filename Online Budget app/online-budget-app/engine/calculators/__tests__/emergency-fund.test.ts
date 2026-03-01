import { describe, it, expect } from "vitest";
import {
  calculateEmergencyFund,
  getRecommendedMonths,
} from "../emergency-fund";

describe("calculateEmergencyFund", () => {
  it("calculates target amount correctly", () => {
    const result = calculateEmergencyFund({
      monthlyExpenses: 3000,
      targetMonths: 6,
      currentSavings: 5000,
      monthlyContribution: 500,
    });

    expect(result.targetAmount).toBe(18000);
    expect(result.amountNeeded).toBe(13000);
    expect(result.monthsToGoal).toBe(26);
    expect(result.isGoalMet).toBe(false);
    expect(result.progressPercent).toBeCloseTo(27.78, 1);
  });

  it("detects when goal is already met", () => {
    const result = calculateEmergencyFund({
      monthlyExpenses: 3000,
      targetMonths: 3,
      currentSavings: 10000,
      monthlyContribution: 500,
    });

    expect(result.isGoalMet).toBe(true);
    expect(result.amountNeeded).toBe(0);
    expect(result.monthsToGoal).toBe(0);
    expect(result.progressPercent).toBe(100);
  });

  it("handles zero contribution", () => {
    const result = calculateEmergencyFund({
      monthlyExpenses: 3000,
      targetMonths: 6,
      currentSavings: 5000,
      monthlyContribution: 0,
    });

    expect(result.monthsToGoal).toBe(0);
  });
});

describe("getRecommendedMonths", () => {
  it("returns 3 months baseline for stable single earner", () => {
    expect(getRecommendedMonths(true, false, false)).toBe(3);
  });

  it("increases for unstable employment", () => {
    expect(getRecommendedMonths(false, false, false)).toBe(6);
  });

  it("increases for dependents", () => {
    expect(getRecommendedMonths(true, true, false)).toBe(4);
  });

  it("increases for sole income earner", () => {
    expect(getRecommendedMonths(true, false, true)).toBe(5);
  });

  it("caps at 12 months", () => {
    // Unstable + dependents + sole earner = 3+3+1+2 = 9
    expect(getRecommendedMonths(false, true, true)).toBe(9);
  });
});
