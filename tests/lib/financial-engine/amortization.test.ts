/**
 * Amortization Engine Tests
 *
 * Known-answer tests for mortgage/loan amortization:
 * calculateMonthlyPayment, generateAmortizationSchedule, calculateAffordability
 */

import { describe, it, expect } from "vitest";
import {
  calculateMonthlyPayment,
  generateAmortizationSchedule,
  calculateAffordability,
} from "@/lib/financial-engine/amortization";

// ============================================================================
// calculateMonthlyPayment
// ============================================================================

describe("calculateMonthlyPayment", () => {
  it("should return 0 for zero principal", () => {
    expect(calculateMonthlyPayment(0, 5, 360)).toBe(0);
  });

  it("should return 0 for zero term", () => {
    expect(calculateMonthlyPayment(100000, 5, 0)).toBe(0);
  });

  it("should calculate payment at 0% rate", () => {
    // $120,000 / 360 months = $333.33
    const payment = calculateMonthlyPayment(120000, 0, 360);
    expect(payment).toBeCloseTo(333.33, 1);
  });

  it("should calculate standard 30-year mortgage payment", () => {
    // $300,000 at 6.5% for 30 years
    // Known answer: $1,896.20
    const payment = calculateMonthlyPayment(300000, 6.5, 360);
    expect(payment).toBeCloseTo(1896.2, 0);
  });

  it("should calculate 15-year mortgage payment", () => {
    // $250,000 at 5.5% for 15 years
    // Known answer: $2,042.71
    const payment = calculateMonthlyPayment(250000, 5.5, 180);
    expect(payment).toBeCloseTo(2042.71, 0);
  });

  it("should calculate auto loan payment", () => {
    // $25,000 at 4.5% for 5 years (60 months)
    // Known answer: $466.08
    const payment = calculateMonthlyPayment(25000, 4.5, 60);
    expect(payment).toBeCloseTo(466.08, 0);
  });

  it("should handle negative principal", () => {
    expect(calculateMonthlyPayment(-100, 5, 12)).toBe(0);
  });
});

// ============================================================================
// generateAmortizationSchedule
// ============================================================================

describe("generateAmortizationSchedule", () => {
  it("should return empty schedule for zero principal", () => {
    const result = generateAmortizationSchedule({
      principal: 0,
      annualRate: 5,
      termMonths: 360,
    });

    expect(result.monthlyPayment).toBe(0);
    expect(result.schedule).toHaveLength(0);
    expect(result.totalPaid).toBe(0);
    expect(result.totalInterest).toBe(0);
    expect(result.payoffMonths).toBe(0);
  });

  it("should generate full 30-year schedule", () => {
    const result = generateAmortizationSchedule({
      principal: 300000,
      annualRate: 6.5,
      termMonths: 360,
    });

    expect(result.monthlyPayment).toBeCloseTo(1896.2, 0);
    expect(result.schedule).toHaveLength(360);
    expect(result.payoffMonths).toBe(360);

    // First month: mostly interest
    expect(result.schedule[0].interest).toBeGreaterThan(result.schedule[0].principal);

    // Last month: mostly principal
    const last = result.schedule[result.schedule.length - 1];
    expect(last.principal).toBeGreaterThan(last.interest);
    expect(last.balance).toBeLessThan(10); // Essentially paid off
  });

  it("should have total interest > 0", () => {
    const result = generateAmortizationSchedule({
      principal: 200000,
      annualRate: 5,
      termMonths: 360,
    });

    expect(result.totalInterest).toBeGreaterThan(0);
    expect(result.totalPaid).toBeGreaterThan(200000);
    // totalPaid may differ slightly from sum due to rounding each month
    expect(Math.abs(result.totalPaid - (result.totalInterest + 200000))).toBeLessThan(10);
  });

  it("should shorten payoff with extra payments", () => {
    const noExtra = generateAmortizationSchedule({
      principal: 200000,
      annualRate: 5,
      termMonths: 360,
    });

    const withExtra = generateAmortizationSchedule({
      principal: 200000,
      annualRate: 5,
      termMonths: 360,
      extraPayment: 200,
    });

    expect(withExtra.payoffMonths).toBeLessThan(noExtra.payoffMonths);
    expect(withExtra.totalInterest).toBeLessThan(noExtra.totalInterest);
    expect(withExtra.totalPaid).toBeLessThan(noExtra.totalPaid);
  });

  it("should handle 0% interest rate", () => {
    const result = generateAmortizationSchedule({
      principal: 12000,
      annualRate: 0,
      termMonths: 12,
    });

    expect(result.monthlyPayment).toBe(1000);
    expect(result.totalInterest).toBe(0);
    expect(result.totalPaid).toBeCloseTo(12000, 0);
  });

  it("should have increasing cumulative interest", () => {
    const result = generateAmortizationSchedule({
      principal: 100000,
      annualRate: 6,
      termMonths: 360,
    });

    for (let i = 1; i < result.schedule.length; i++) {
      expect(result.schedule[i].cumulativeInterest).toBeGreaterThanOrEqual(
        result.schedule[i - 1].cumulativeInterest
      );
    }
  });

  it("should have decreasing balance", () => {
    const result = generateAmortizationSchedule({
      principal: 100000,
      annualRate: 5,
      termMonths: 360,
    });

    for (let i = 1; i < result.schedule.length; i++) {
      expect(result.schedule[i].balance).toBeLessThanOrEqual(result.schedule[i - 1].balance);
    }
  });

  it("should not overpay (balance never goes negative)", () => {
    const result = generateAmortizationSchedule({
      principal: 10000,
      annualRate: 5,
      termMonths: 12,
      extraPayment: 5000,
    });

    for (const entry of result.schedule) {
      expect(entry.balance).toBeGreaterThanOrEqual(0);
    }
  });
});

// ============================================================================
// calculateAffordability
// ============================================================================

describe("calculateAffordability", () => {
  it("should calculate basic affordability", () => {
    const result = calculateAffordability({
      annualIncome: 100000,
      monthlyDebts: 500,
      downPaymentPercent: 20,
      annualRate: 6.5,
      termMonths: 360,
    });

    expect(result.maxHomePrice).toBeGreaterThan(0);
    expect(result.maxLoanAmount).toBeGreaterThan(0);
    expect(result.downPayment).toBeGreaterThan(0);
    expect(result.monthlyPayment).toBeGreaterThan(0);
    expect(result.dtiRatio).toBeLessThanOrEqual(36);
  });

  it("should respect DTI ratio limit", () => {
    const result = calculateAffordability({
      annualIncome: 100000,
      monthlyDebts: 0,
      downPaymentPercent: 20,
      annualRate: 6.5,
      termMonths: 360,
      maxDTI: 36,
    });

    // Monthly payment should not exceed 36% of monthly income
    const monthlyIncome = 100000 / 12;
    expect(result.monthlyPayment).toBeLessThanOrEqual(monthlyIncome * 0.36 + 1); // +1 for rounding
  });

  it("should reduce affordability with existing debts", () => {
    const noDebts = calculateAffordability({
      annualIncome: 100000,
      monthlyDebts: 0,
      downPaymentPercent: 20,
      annualRate: 6.5,
      termMonths: 360,
    });

    const withDebts = calculateAffordability({
      annualIncome: 100000,
      monthlyDebts: 1000,
      downPaymentPercent: 20,
      annualRate: 6.5,
      termMonths: 360,
    });

    expect(withDebts.maxHomePrice).toBeLessThan(noDebts.maxHomePrice);
  });

  it("should increase affordability with larger down payment", () => {
    const small = calculateAffordability({
      annualIncome: 80000,
      monthlyDebts: 0,
      downPaymentPercent: 10,
      annualRate: 6,
      termMonths: 360,
    });

    const large = calculateAffordability({
      annualIncome: 80000,
      monthlyDebts: 0,
      downPaymentPercent: 30,
      annualRate: 6,
      termMonths: 360,
    });

    expect(large.maxHomePrice).toBeGreaterThan(small.maxHomePrice);
  });

  it("should handle 0% interest rate", () => {
    const result = calculateAffordability({
      annualIncome: 60000,
      monthlyDebts: 0,
      downPaymentPercent: 20,
      annualRate: 0,
      termMonths: 360,
    });

    expect(result.maxHomePrice).toBeGreaterThan(0);
    expect(result.maxLoanAmount).toBeGreaterThan(0);
  });

  it("should have downPayment = maxHomePrice * downPaymentPercent", () => {
    const result = calculateAffordability({
      annualIncome: 100000,
      monthlyDebts: 200,
      downPaymentPercent: 20,
      annualRate: 6.5,
      termMonths: 360,
    });

    expect(result.downPayment).toBeCloseTo(result.maxHomePrice * 0.2, 0);
  });

  it("should have maxLoanAmount = maxHomePrice - downPayment", () => {
    const result = calculateAffordability({
      annualIncome: 100000,
      monthlyDebts: 200,
      downPaymentPercent: 15,
      annualRate: 6.5,
      termMonths: 360,
    });

    expect(result.maxLoanAmount).toBeCloseTo(result.maxHomePrice - result.downPayment, 0);
  });
});
