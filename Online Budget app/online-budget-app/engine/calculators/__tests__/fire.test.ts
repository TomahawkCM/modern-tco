import { describe, it, expect } from "vitest";
import { calculateFIRE } from "../fire";

describe("calculateFIRE", () => {
  it("calculates FIRE number correctly", () => {
    const result = calculateFIRE({
      currentAge: 30,
      annualIncome: 100000,
      annualExpenses: 40000,
      currentSavings: 100000,
      expectedReturn: 7,
    });

    // FIRE number = expenses / SWR = 40000 / 0.04 = 1,000,000
    expect(result.fireNumber).toBe(1000000);
    expect(result.leanFIRENumber).toBe(500000);
    expect(result.fatFIRENumber).toBe(2000000);
  });

  it("calculates savings rate correctly", () => {
    const result = calculateFIRE({
      currentAge: 30,
      annualIncome: 100000,
      annualExpenses: 40000,
      currentSavings: 0,
      expectedReturn: 7,
    });

    expect(result.savingsRate).toBe(60);
    expect(result.annualSavings).toBe(60000);
    expect(result.monthlySavings).toBe(5000);
  });

  it("detects when already FIRE", () => {
    const result = calculateFIRE({
      currentAge: 50,
      annualIncome: 80000,
      annualExpenses: 30000,
      currentSavings: 1000000,
      expectedReturn: 7,
    });

    // FIRE number = 30000 / 0.04 = 750,000
    expect(result.alreadyFIRE).toBe(true);
    expect(result.yearsToFIRE).toBe(0);
  });

  it("generates a timeline", () => {
    const result = calculateFIRE({
      currentAge: 30,
      annualIncome: 100000,
      annualExpenses: 40000,
      currentSavings: 100000,
      expectedReturn: 7,
    });

    expect(result.timeline.length).toBeGreaterThan(0);
    expect(result.timeline[0]!.year).toBe(0);
    expect(result.timeline[0]!.age).toBe(30);
  });

  it("calculates Coast FIRE number", () => {
    const result = calculateFIRE({
      currentAge: 30,
      annualIncome: 100000,
      annualExpenses: 40000,
      currentSavings: 100000,
      expectedReturn: 7,
    });

    // Coast FIRE should be less than regular FIRE
    expect(result.coastFIRENumber).toBeLessThan(result.fireNumber);
    expect(result.coastFIRENumber).toBeGreaterThan(0);
  });
});
