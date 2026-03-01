import { describe, it, expect } from "vitest";
import {
  calculateTaxEstimate,
  getStandardDeduction,
  getTaxBrackets,
} from "../tax-model";

describe("calculateTaxEstimate", () => {
  it("calculates tax for single filer", () => {
    const result = calculateTaxEstimate({
      grossIncome: 75000,
      filingStatus: "single",
    });

    expect(result.adjustedGrossIncome).toBe(75000);
    expect(result.deductionType).toBe("standard");
    expect(result.deductionAmount).toBe(14600);
    expect(result.taxableIncome).toBe(60400);
    expect(result.totalTax).toBeGreaterThan(0);
    expect(result.effectiveTaxRate).toBeGreaterThan(0);
    expect(result.takeHomePay).toBeLessThan(75000);
    expect(result.monthlyTakeHome).toBeCloseTo(result.takeHomePay / 12, 1);
    expect(result.bracketBreakdown.length).toBeGreaterThan(0);
  });

  it("uses itemized deductions when they are higher", () => {
    const result = calculateTaxEstimate({
      grossIncome: 150000,
      filingStatus: "single",
      useItemized: true,
      itemizedDeductions: 25000,
    });

    expect(result.deductionType).toBe("itemized");
    expect(result.deductionAmount).toBe(25000);
  });

  it("uses standard deduction when itemized is lower", () => {
    const result = calculateTaxEstimate({
      grossIncome: 150000,
      filingStatus: "single",
      useItemized: true,
      itemizedDeductions: 5000,
    });

    expect(result.deductionType).toBe("standard");
  });

  it("handles retirement contributions", () => {
    const withContrib = calculateTaxEstimate({
      grossIncome: 100000,
      filingStatus: "single",
      retirementContributions: 20000,
    });

    const without = calculateTaxEstimate({
      grossIncome: 100000,
      filingStatus: "single",
    });

    expect(withContrib.adjustedGrossIncome).toBeLessThan(
      without.adjustedGrossIncome
    );
    expect(withContrib.totalTax).toBeLessThan(without.totalTax);
  });

  it("returns zero tax for zero income", () => {
    const result = calculateTaxEstimate({
      grossIncome: 0,
      filingStatus: "single",
    });

    expect(result.totalTax).toBe(0);
    expect(result.effectiveTaxRate).toBe(0);
  });
});

describe("getStandardDeduction", () => {
  it("returns correct values for each filing status", () => {
    expect(getStandardDeduction("single")).toBe(14600);
    expect(getStandardDeduction("married_jointly")).toBe(29200);
    expect(getStandardDeduction("married_separately")).toBe(14600);
    expect(getStandardDeduction("head_of_household")).toBe(21900);
  });
});

describe("getTaxBrackets", () => {
  it("returns brackets array for each status", () => {
    const brackets = getTaxBrackets("single");
    expect(brackets).toHaveLength(7);
    expect(brackets[0]!.rate).toBe(10);
    expect(brackets[6]!.rate).toBe(37);
    expect(brackets[6]!.max).toBe(Infinity);
  });
});
