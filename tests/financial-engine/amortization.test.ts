/**
 * Amortization Engine Tests
 *
 * Known-answer tests verified against Excel PMT/amortization.
 */

import { describe, it, expect } from "vitest";
import {
  calculateMonthlyPayment,
  generateAmortizationSchedule,
  calculateAffordability,
} from "@/lib/financial-engine/amortization";

describe("calculateMonthlyPayment", () => {
  it("calculates 30-year mortgage payment", () => {
    // $300,000 at 6.5% for 30 years
    // Excel: =PMT(0.065/12, 360, -300000) = $1,896.20
    const result = calculateMonthlyPayment(300000, 6.5, 360);
    expect(result).toBeCloseTo(1896.2, 0);
  });

  it("calculates 15-year mortgage payment", () => {
    // $300,000 at 6% for 15 years
    // Excel: =PMT(0.06/12, 180, -300000) = $2,531.57
    const result = calculateMonthlyPayment(300000, 6, 180);
    expect(result).toBeCloseTo(2531.57, 0);
  });

  it("calculates auto loan payment", () => {
    // $25,000 at 4.5% for 5 years (60 months)
    // Excel: =PMT(0.045/12, 60, -25000) = $466.08
    const result = calculateMonthlyPayment(25000, 4.5, 60);
    expect(result).toBeCloseTo(466.08, 0);
  });

  it("returns 0 for zero principal", () => {
    expect(calculateMonthlyPayment(0, 6.5, 360)).toBe(0);
  });

  it("returns 0 for zero term", () => {
    expect(calculateMonthlyPayment(300000, 6.5, 0)).toBe(0);
  });

  it("handles zero interest rate", () => {
    // $12,000 / 12 months = $1,000/month
    expect(calculateMonthlyPayment(12000, 0, 12)).toBe(1000);
  });
});

describe("generateAmortizationSchedule", () => {
  it("generates correct schedule length", () => {
    const result = generateAmortizationSchedule({
      principal: 300000,
      annualRate: 6.5,
      termMonths: 360,
    });

    expect(result.schedule).toHaveLength(360);
    expect(result.payoffMonths).toBe(360);
  });

  it("final balance is 0", () => {
    const result = generateAmortizationSchedule({
      principal: 100000,
      annualRate: 5,
      termMonths: 120,
    });

    const lastEntry = result.schedule[result.schedule.length - 1];
    expect(lastEntry.balance).toBe(0);
  });

  it("total interest matches payment formula", () => {
    const result = generateAmortizationSchedule({
      principal: 200000,
      annualRate: 6,
      termMonths: 360,
    });

    // Total paid = monthly payment * months
    const expectedTotalPaid = result.monthlyPayment * 360;
    expect(result.totalPaid).toBeCloseTo(expectedTotalPaid, -1);

    // Total interest = total paid - principal
    expect(result.totalInterest).toBeCloseTo(expectedTotalPaid - 200000, -1);
  });

  it("early payments have more interest, later have more principal", () => {
    const result = generateAmortizationSchedule({
      principal: 200000,
      annualRate: 6,
      termMonths: 360,
    });

    const firstEntry = result.schedule[0];
    const lastEntry = result.schedule[result.schedule.length - 1];

    expect(firstEntry.interest).toBeGreaterThan(firstEntry.principal);
    expect(lastEntry.principal).toBeGreaterThan(lastEntry.interest);
  });

  it("extra payments reduce term", () => {
    const withoutExtra = generateAmortizationSchedule({
      principal: 200000,
      annualRate: 6,
      termMonths: 360,
    });

    const withExtra = generateAmortizationSchedule({
      principal: 200000,
      annualRate: 6,
      termMonths: 360,
      extraPayment: 500,
    });

    expect(withExtra.payoffMonths).toBeLessThan(withoutExtra.payoffMonths);
    expect(withExtra.totalInterest).toBeLessThan(withoutExtra.totalInterest);
  });

  it("handles zero interest rate", () => {
    const result = generateAmortizationSchedule({
      principal: 12000,
      annualRate: 0,
      termMonths: 12,
    });

    expect(result.monthlyPayment).toBe(1000);
    expect(result.totalInterest).toBe(0);
    expect(result.schedule).toHaveLength(12);
  });

  it("cumulative fields are correct", () => {
    const result = generateAmortizationSchedule({
      principal: 100000,
      annualRate: 5,
      termMonths: 60,
    });

    // Cumulative interest should increase monotonically
    for (let i = 1; i < result.schedule.length; i++) {
      expect(result.schedule[i].cumulativeInterest).toBeGreaterThan(
        result.schedule[i - 1].cumulativeInterest
      );
    }

    // Final cumulative interest should equal total interest
    expect(result.schedule[result.schedule.length - 1].cumulativeInterest).toBeCloseTo(
      result.totalInterest,
      0
    );
  });
});

describe("calculateAffordability", () => {
  it("calculates max home price", () => {
    const result = calculateAffordability({
      annualIncome: 100000,
      monthlyDebts: 500,
      downPaymentPercent: 20,
      annualRate: 6.5,
      termMonths: 360,
    });

    // At $100K income, 36% DTI, $500 existing debts:
    // Max total debt payment = $3,000/mo
    // Max mortgage = $2,500/mo
    // Max loan ≈ $395K, home price ≈ $494K with 20% down
    expect(result.maxHomePrice).toBeGreaterThan(400000);
    expect(result.maxHomePrice).toBeLessThan(600000);
    expect(result.dtiRatio).toBeLessThanOrEqual(36);
    expect(result.downPayment).toBeCloseTo(result.maxHomePrice * 0.2, -2);
  });

  it("higher income means higher affordability", () => {
    const lower = calculateAffordability({
      annualIncome: 80000,
      monthlyDebts: 500,
      downPaymentPercent: 20,
      annualRate: 6.5,
      termMonths: 360,
    });

    const higher = calculateAffordability({
      annualIncome: 120000,
      monthlyDebts: 500,
      downPaymentPercent: 20,
      annualRate: 6.5,
      termMonths: 360,
    });

    expect(higher.maxHomePrice).toBeGreaterThan(lower.maxHomePrice);
  });

  it("more debt reduces affordability", () => {
    const lessDebt = calculateAffordability({
      annualIncome: 100000,
      monthlyDebts: 200,
      downPaymentPercent: 20,
      annualRate: 6.5,
      termMonths: 360,
    });

    const moreDebt = calculateAffordability({
      annualIncome: 100000,
      monthlyDebts: 1000,
      downPaymentPercent: 20,
      annualRate: 6.5,
      termMonths: 360,
    });

    expect(moreDebt.maxHomePrice).toBeLessThan(lessDebt.maxHomePrice);
  });

  it("handles zero interest rate", () => {
    const result = calculateAffordability({
      annualIncome: 100000,
      monthlyDebts: 0,
      downPaymentPercent: 20,
      annualRate: 0,
      termMonths: 360,
    });

    expect(result.maxHomePrice).toBeGreaterThan(0);
    expect(result.monthlyPayment).toBeGreaterThan(0);
  });
});
