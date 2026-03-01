import { describe, it, expect } from "vitest";
import {
  calculateMonthlyPayment,
  generateAmortizationSchedule,
  calculateAffordability,
} from "../amortization";

describe("calculateMonthlyPayment", () => {
  it("returns 0 for zero principal", () => {
    expect(calculateMonthlyPayment(0, 5, 360)).toBe(0);
  });

  it("returns 0 for zero term", () => {
    expect(calculateMonthlyPayment(200000, 5, 0)).toBe(0);
  });

  it("handles zero interest rate", () => {
    const payment = calculateMonthlyPayment(120000, 0, 360);
    expect(payment).toBeCloseTo(333.33, 1);
  });

  it("calculates standard 30-year mortgage correctly", () => {
    // $200,000 at 6% for 30 years
    const payment = calculateMonthlyPayment(200000, 6, 360);
    expect(payment).toBeCloseTo(1199.10, 0);
  });
});

describe("generateAmortizationSchedule", () => {
  it("returns empty schedule for invalid input", () => {
    const result = generateAmortizationSchedule({
      principal: 0,
      annualRate: 5,
      termMonths: 360,
    });
    expect(result.schedule).toHaveLength(0);
    expect(result.monthlyPayment).toBe(0);
  });

  it("generates correct number of payments", () => {
    const result = generateAmortizationSchedule({
      principal: 100000,
      annualRate: 5,
      termMonths: 360,
    });
    expect(result.payoffMonths).toBe(360);
    expect(result.schedule).toHaveLength(360);
  });

  it("reduces payoff time with extra payments", () => {
    const without = generateAmortizationSchedule({
      principal: 100000,
      annualRate: 5,
      termMonths: 360,
    });
    const withExtra = generateAmortizationSchedule({
      principal: 100000,
      annualRate: 5,
      termMonths: 360,
      extraPayment: 200,
    });
    expect(withExtra.payoffMonths).toBeLessThan(without.payoffMonths);
    expect(withExtra.totalInterest).toBeLessThan(without.totalInterest);
  });

  it("has zero balance at end of schedule", () => {
    const result = generateAmortizationSchedule({
      principal: 100000,
      annualRate: 5,
      termMonths: 360,
    });
    const lastEntry = result.schedule[result.schedule.length - 1]!;
    // Float arithmetic can leave a small residual (< $2) over 360 months
    expect(lastEntry.balance).toBeLessThan(2);
  });
});

describe("calculateAffordability", () => {
  it("calculates home affordability correctly", () => {
    const result = calculateAffordability({
      annualIncome: 100000,
      monthlyDebts: 300,
      downPaymentPercent: 20,
      annualRate: 6,
      termMonths: 360,
    });

    expect(result.maxHomePrice).toBeGreaterThan(0);
    expect(result.maxLoanAmount).toBeLessThan(result.maxHomePrice);
    expect(result.downPayment).toBeGreaterThan(0);
    expect(result.monthlyPayment).toBeGreaterThan(0);
    expect(result.dtiRatio).toBeLessThanOrEqual(36);
  });

  it("reduces affordability with existing debts", () => {
    const noDebts = calculateAffordability({
      annualIncome: 100000,
      monthlyDebts: 0,
      downPaymentPercent: 20,
      annualRate: 6,
      termMonths: 360,
    });
    const withDebts = calculateAffordability({
      annualIncome: 100000,
      monthlyDebts: 1000,
      downPaymentPercent: 20,
      annualRate: 6,
      termMonths: 360,
    });
    expect(withDebts.maxHomePrice).toBeLessThan(noDebts.maxHomePrice);
  });
});
