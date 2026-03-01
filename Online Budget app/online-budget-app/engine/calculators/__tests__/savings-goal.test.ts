import { describe, it, expect } from "vitest";
import { calculateSavingsGoal } from "../savings-goal";

describe("calculateSavingsGoal", () => {
  describe("when mode", () => {
    it("calculates months to goal without interest", () => {
      const result = calculateSavingsGoal({
        mode: "when",
        goalAmount: 10000,
        currentSavings: 2000,
        monthlyContribution: 500,
        expectedAnnualReturn: 0,
      });

      expect(result.monthsToGoal).toBe(16); // 8000 / 500 = 16
      expect(result.totalInterestEarned).toBe(0);
      expect(result.progressPercent).toBeCloseTo(20, 0);
    });

    it("calculates months to goal with interest", () => {
      const result = calculateSavingsGoal({
        mode: "when",
        goalAmount: 10000,
        currentSavings: 2000,
        monthlyContribution: 500,
        expectedAnnualReturn: 5,
      });

      // With interest, should reach goal in same or fewer months
      expect(result.monthsToGoal).toBeLessThanOrEqual(16);
      expect(result.totalInterestEarned).toBeGreaterThan(0);
      // The final balance should exceed the goal (interest grows the balance)
      expect(result.projectedAmount).toBeGreaterThanOrEqual(10000);
    });

    it("returns immediately if goal already met", () => {
      const result = calculateSavingsGoal({
        mode: "when",
        goalAmount: 5000,
        currentSavings: 10000,
        monthlyContribution: 100,
      });

      expect(result.monthsToGoal).toBe(0);
    });
  });

  describe("howMuch mode", () => {
    it("calculates required monthly contribution", () => {
      const targetDate = new Date();
      targetDate.setFullYear(targetDate.getFullYear() + 2);

      const result = calculateSavingsGoal({
        mode: "howMuch",
        goalAmount: 24000,
        currentSavings: 0,
        targetDate,
        expectedAnnualReturn: 0,
      });

      expect(result.requiredMonthlyContribution).toBeCloseTo(1000, 0);
    });

    it("requires less with interest", () => {
      const targetDate = new Date();
      targetDate.setFullYear(targetDate.getFullYear() + 5);

      const withoutInterest = calculateSavingsGoal({
        mode: "howMuch",
        goalAmount: 50000,
        currentSavings: 10000,
        targetDate,
        expectedAnnualReturn: 0,
      });

      const withInterest = calculateSavingsGoal({
        mode: "howMuch",
        goalAmount: 50000,
        currentSavings: 10000,
        targetDate,
        expectedAnnualReturn: 7,
      });

      expect(withInterest.requiredMonthlyContribution!).toBeLessThan(
        withoutInterest.requiredMonthlyContribution!
      );
    });
  });
});
