import { describe, it, expect } from "vitest";
import { calculateRetirement } from "../retirement";

describe("calculateRetirement", () => {
  const baseInput = {
    currentAge: 30,
    retirementAge: 65,
    currentSavings: 50000,
    monthlyContribution: 1000,
    desiredMonthlyIncome: 4000,
    preRetirementReturn: 7,
    postRetirementReturn: 5,
    inflationRate: 3,
    lifeExpectancy: 90,
    socialSecurityMonthly: 1800,
    socialSecurityStartAge: 67,
  };

  it("calculates balance at retirement", () => {
    const result = calculateRetirement(baseInput);
    expect(result.balanceAtRetirement).toBeGreaterThan(baseInput.currentSavings);
  });

  it("produces a timeline spanning both phases", () => {
    const result = calculateRetirement(baseInput);
    const accumPhase = result.timeline.filter(
      (p) => p.phase === "accumulation"
    );
    const withdrawPhase = result.timeline.filter(
      (p) => p.phase === "withdrawal"
    );
    expect(accumPhase.length).toBeGreaterThan(0);
    expect(withdrawPhase.length).toBeGreaterThan(0);
  });

  it("indicates sufficiency for generous savings", () => {
    const result = calculateRetirement({
      ...baseInput,
      monthlyContribution: 3000,
      desiredMonthlyIncome: 2000,
    });
    expect(result.isSufficient).toBe(true);
  });

  it("calculates monthly withdrawal inflation-adjusted", () => {
    const result = calculateRetirement(baseInput);
    // Withdrawal should be higher than desired income due to inflation
    expect(result.monthlyWithdrawal).toBeGreaterThan(
      baseInput.desiredMonthlyIncome
    );
  });

  it("handles already-retired (retirementAge <= currentAge)", () => {
    const result = calculateRetirement({
      ...baseInput,
      currentAge: 65,
      retirementAge: 65,
    });
    expect(result.balanceAtRetirement).toBe(baseInput.currentSavings);
  });
});
