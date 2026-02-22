/**
 * FIRE Calculator Engine Tests
 *
 * Tests for Financial Independence, Retire Early calculations.
 */

import { describe, it, expect } from "vitest";
import { calculateFIRE } from "@/lib/financial-engine/fire";
import type { FIREInput } from "@/lib/financial-engine/fire";

const defaultInput: FIREInput = {
  currentAge: 30,
  annualIncome: 100000,
  annualExpenses: 40000,
  currentSavings: 100000,
  expectedReturn: 7,
  safeWithdrawalRate: 4,
  inflationRate: 3,
};

describe("calculateFIRE", () => {
  it("should calculate FIRE number based on expenses and SWR", () => {
    const result = calculateFIRE(defaultInput);

    // FIRE number = 40000 / 0.04 = 1,000,000
    expect(result.fireNumber).toBe(1000000);
  });

  it("should calculate lean and fat FIRE numbers", () => {
    const result = calculateFIRE(defaultInput);

    expect(result.leanFIRENumber).toBe(500000); // 50% of FIRE
    expect(result.fatFIRENumber).toBe(2000000); // 200% of FIRE
  });

  it("should calculate savings rate", () => {
    const result = calculateFIRE(defaultInput);

    // Savings = 100k - 40k = 60k, rate = 60%
    expect(result.annualSavings).toBe(60000);
    expect(result.monthlySavings).toBe(5000);
    expect(result.savingsRate).toBe(60);
  });

  it("should calculate years to FIRE", () => {
    const result = calculateFIRE(defaultInput);

    expect(result.yearsToFIRE).toBeGreaterThan(0);
    expect(result.yearsToFIRE).toBeLessThan(30);
    expect(result.fireAge).toBe(defaultInput.currentAge + result.yearsToFIRE);
  });

  it("should handle already FIRE scenario", () => {
    const result = calculateFIRE({
      ...defaultInput,
      currentSavings: 2000000,
    });

    expect(result.alreadyFIRE).toBe(true);
    expect(result.yearsToFIRE).toBe(0);
  });

  it("should generate timeline", () => {
    const result = calculateFIRE(defaultInput);

    expect(result.timeline.length).toBeGreaterThan(0);
    expect(result.timeline[0].age).toBe(30);
    expect(result.timeline[0].balance).toBe(100000);
    expect(result.timeline[0].year).toBe(0);
  });

  it("should show growing balance in timeline", () => {
    const result = calculateFIRE(defaultInput);

    for (let i = 1; i < result.timeline.length; i++) {
      expect(result.timeline[i].balance).toBeGreaterThan(result.timeline[i - 1].balance);
    }
  });

  it("should calculate Coast FIRE number", () => {
    const result = calculateFIRE(defaultInput);

    // Coast FIRE should be less than full FIRE
    expect(result.coastFIRENumber).toBeGreaterThan(0);
    expect(result.coastFIRENumber).toBeLessThan(result.fireNumber);
  });

  it("should detect Coast FIRE reached", () => {
    const result = calculateFIRE({
      ...defaultInput,
      currentSavings: 500000,
    });

    expect(result.coastFIREReached).toBe(true);
  });

  it("should handle zero income (no savings possible)", () => {
    const result = calculateFIRE({
      ...defaultInput,
      annualIncome: 0,
    });

    expect(result.savingsRate).toBe(0);
    expect(result.annualSavings).toBe(0);
  });

  it("should handle expenses exceeding income", () => {
    const result = calculateFIRE({
      ...defaultInput,
      annualIncome: 30000,
      annualExpenses: 40000,
    });

    expect(result.annualSavings).toBe(0);
    expect(result.savingsRate).toBe(0);
  });

  it("should calculate annual passive income", () => {
    const result = calculateFIRE(defaultInput);

    // Passive income = FIRE number * SWR = 1M * 4% = $40k
    expect(result.annualPassiveIncome).toBe(40000);
  });

  it("should mark FIRE reached in timeline", () => {
    const result = calculateFIRE(defaultInput);

    const firePoint = result.timeline.find((p) => p.fireReached);
    expect(firePoint).toBeTruthy();
  });

  it("higher savings rate should reach FIRE faster", () => {
    const lowSaver = calculateFIRE({
      ...defaultInput,
      annualExpenses: 70000,
    });

    const highSaver = calculateFIRE({
      ...defaultInput,
      annualExpenses: 30000,
    });

    expect(highSaver.yearsToFIRE).toBeLessThan(lowSaver.yearsToFIRE);
  });

  it("should use custom SWR", () => {
    const swr4 = calculateFIRE({ ...defaultInput, safeWithdrawalRate: 4 });
    const swr3 = calculateFIRE({ ...defaultInput, safeWithdrawalRate: 3 });

    // Lower SWR = higher FIRE number = more years to FIRE
    expect(swr3.fireNumber).toBeGreaterThan(swr4.fireNumber);
    expect(swr3.yearsToFIRE).toBeGreaterThanOrEqual(swr4.yearsToFIRE);
  });
});
