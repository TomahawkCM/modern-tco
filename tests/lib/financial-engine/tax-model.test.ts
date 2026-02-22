/**
 * Tax Model Engine Tests
 *
 * Known-answer tests for US federal income tax calculations.
 */

import { describe, it, expect } from "vitest";
import {
  calculateTaxEstimate,
  getStandardDeduction,
  getTaxBrackets,
} from "@/lib/financial-engine/tax-model";

describe("calculateTaxEstimate", () => {
  it("should calculate tax for single filer at $50,000", () => {
    const result = calculateTaxEstimate({
      grossIncome: 50000,
      filingStatus: "single",
    });

    expect(result.adjustedGrossIncome).toBe(50000);
    expect(result.deductionType).toBe("standard");
    expect(result.deductionAmount).toBe(14600);
    expect(result.taxableIncome).toBe(35400);
    expect(result.totalTax).toBeGreaterThan(0);
    expect(result.effectiveTaxRate).toBeGreaterThan(0);
    expect(result.effectiveTaxRate).toBeLessThan(22);
    expect(result.marginalTaxRate).toBe(12);
    expect(result.takeHomePay).toBe(50000 - result.totalTax);
  });

  it("should calculate tax for single filer at $100,000", () => {
    const result = calculateTaxEstimate({
      grossIncome: 100000,
      filingStatus: "single",
    });

    // $100k - $14.6k standard deduction = $85,400 taxable
    expect(result.taxableIncome).toBe(85400);
    expect(result.marginalTaxRate).toBe(22);
    expect(result.totalTax).toBeGreaterThan(10000);
    expect(result.effectiveTaxRate).toBeLessThan(22);
  });

  it("should calculate tax for married filing jointly", () => {
    const result = calculateTaxEstimate({
      grossIncome: 150000,
      filingStatus: "married_jointly",
    });

    expect(result.deductionAmount).toBe(29200);
    expect(result.taxableIncome).toBe(120800);
    expect(result.marginalTaxRate).toBe(22);
  });

  it("should handle zero income", () => {
    const result = calculateTaxEstimate({
      grossIncome: 0,
      filingStatus: "single",
    });

    expect(result.totalTax).toBe(0);
    expect(result.effectiveTaxRate).toBe(0);
    expect(result.taxableIncome).toBe(0);
    expect(result.takeHomePay).toBe(0);
  });

  it("should handle income below standard deduction", () => {
    const result = calculateTaxEstimate({
      grossIncome: 10000,
      filingStatus: "single",
    });

    expect(result.taxableIncome).toBe(0);
    expect(result.totalTax).toBe(0);
  });

  it("should apply retirement contribution deductions", () => {
    const withoutRetirement = calculateTaxEstimate({
      grossIncome: 100000,
      filingStatus: "single",
    });

    const withRetirement = calculateTaxEstimate({
      grossIncome: 100000,
      filingStatus: "single",
      retirementContributions: 20000,
    });

    expect(withRetirement.adjustedGrossIncome).toBe(80000);
    expect(withRetirement.totalTax).toBeLessThan(withoutRetirement.totalTax);
  });

  it("should use itemized deductions when larger than standard", () => {
    const result = calculateTaxEstimate({
      grossIncome: 200000,
      filingStatus: "single",
      useItemized: true,
      itemizedDeductions: 30000,
    });

    expect(result.deductionType).toBe("itemized");
    expect(result.deductionAmount).toBe(30000);
  });

  it("should fall back to standard deduction when itemized is smaller", () => {
    const result = calculateTaxEstimate({
      grossIncome: 100000,
      filingStatus: "single",
      useItemized: true,
      itemizedDeductions: 5000,
    });

    expect(result.deductionType).toBe("standard");
    expect(result.deductionAmount).toBe(14600);
  });

  it("should generate bracket-by-bracket breakdown", () => {
    const result = calculateTaxEstimate({
      grossIncome: 100000,
      filingStatus: "single",
    });

    expect(result.bracketBreakdown.length).toBeGreaterThan(0);

    // Sum of bracket taxes should equal total
    const sumOfBrackets = result.bracketBreakdown.reduce((sum, b) => sum + b.taxInBracket, 0);
    expect(sumOfBrackets).toBeCloseTo(result.totalTax, 0);
  });

  it("should calculate monthly take-home", () => {
    const result = calculateTaxEstimate({
      grossIncome: 120000,
      filingStatus: "single",
    });

    expect(result.monthlyTakeHome).toBeCloseTo(result.takeHomePay / 12, 0);
  });

  it("should handle head of household", () => {
    const result = calculateTaxEstimate({
      grossIncome: 80000,
      filingStatus: "head_of_household",
    });

    expect(result.deductionAmount).toBe(21900);
    expect(result.taxableIncome).toBe(58100);
  });

  it("should handle high income earner", () => {
    const result = calculateTaxEstimate({
      grossIncome: 1000000,
      filingStatus: "single",
    });

    expect(result.marginalTaxRate).toBe(37);
    expect(result.effectiveTaxRate).toBeGreaterThan(25);
    expect(result.effectiveTaxRate).toBeLessThan(37);
  });
});

describe("getStandardDeduction", () => {
  it("should return correct values for each filing status", () => {
    expect(getStandardDeduction("single")).toBe(14600);
    expect(getStandardDeduction("married_jointly")).toBe(29200);
    expect(getStandardDeduction("married_separately")).toBe(14600);
    expect(getStandardDeduction("head_of_household")).toBe(21900);
  });
});

describe("getTaxBrackets", () => {
  it("should return 7 brackets for each filing status", () => {
    expect(getTaxBrackets("single")).toHaveLength(7);
    expect(getTaxBrackets("married_jointly")).toHaveLength(7);
    expect(getTaxBrackets("married_separately")).toHaveLength(7);
    expect(getTaxBrackets("head_of_household")).toHaveLength(7);
  });

  it("should have increasing rates", () => {
    const brackets = getTaxBrackets("single");
    for (let i = 1; i < brackets.length; i++) {
      expect(brackets[i].rate).toBeGreaterThan(brackets[i - 1].rate);
    }
  });
});
