import { describe, it, expect } from "vitest";
import { computeFinancialHealthScore } from "./health-score";

describe("computeFinancialHealthScore", () => {
  it("computes high score for healthy finances", () => {
    const result = computeFinancialHealthScore({
      savingsRatePercent: 25,
      budgetAdherencePercent: 90,
      hasEmergencyFund: true,
      debtToIncomePercent: 10,
    });

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.grade).toBe("A");
  });

  it("computes medium score for average finances", () => {
    const result = computeFinancialHealthScore({
      savingsRatePercent: 10,
      budgetAdherencePercent: 70,
      hasEmergencyFund: false,
      debtToIncomePercent: 30,
    });

    expect(result.score).toBeGreaterThanOrEqual(40);
    expect(result.score).toBeLessThan(80);
    expect(["B", "C"]).toContain(result.grade);
  });

  it("computes low score for poor finances", () => {
    const result = computeFinancialHealthScore({
      savingsRatePercent: 0,
      budgetAdherencePercent: 30,
      hasEmergencyFund: false,
      debtToIncomePercent: 60,
    });

    expect(result.score).toBeLessThan(40);
    expect(["D", "F"]).toContain(result.grade);
  });

  it("clamps score between 0 and 100", () => {
    const perfect = computeFinancialHealthScore({
      savingsRatePercent: 50,
      budgetAdherencePercent: 100,
      hasEmergencyFund: true,
      debtToIncomePercent: 0,
    });
    expect(perfect.score).toBeLessThanOrEqual(100);
    expect(perfect.score).toBeGreaterThanOrEqual(0);

    const worst = computeFinancialHealthScore({
      savingsRatePercent: -10,
      budgetAdherencePercent: 0,
      hasEmergencyFund: false,
      debtToIncomePercent: 100,
    });
    expect(worst.score).toBeGreaterThanOrEqual(0);
    expect(worst.score).toBeLessThanOrEqual(100);
  });

  it("returns component scores for transparency", () => {
    const result = computeFinancialHealthScore({
      savingsRatePercent: 20,
      budgetAdherencePercent: 80,
      hasEmergencyFund: true,
      debtToIncomePercent: 20,
    });

    expect(result.components).toBeDefined();
    expect(result.components.savingsScore).toBeGreaterThanOrEqual(0);
    expect(result.components.budgetScore).toBeGreaterThanOrEqual(0);
    expect(result.components.emergencyFundScore).toBeGreaterThanOrEqual(0);
    expect(result.components.debtScore).toBeGreaterThanOrEqual(0);
  });

  it("grades correctly at boundaries", () => {
    // Score 80+ → A
    const a = computeFinancialHealthScore({
      savingsRatePercent: 25,
      budgetAdherencePercent: 95,
      hasEmergencyFund: true,
      debtToIncomePercent: 5,
    });
    expect(a.grade).toBe("A");

    // Score 0 savings, 0 adherence → F
    const f = computeFinancialHealthScore({
      savingsRatePercent: -20,
      budgetAdherencePercent: 0,
      hasEmergencyFund: false,
      debtToIncomePercent: 80,
    });
    expect(f.grade).toBe("F");
  });

  it("handles zero income scenario", () => {
    const result = computeFinancialHealthScore({
      savingsRatePercent: 0,
      budgetAdherencePercent: 0,
      hasEmergencyFund: false,
      debtToIncomePercent: 0,
    });

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});
