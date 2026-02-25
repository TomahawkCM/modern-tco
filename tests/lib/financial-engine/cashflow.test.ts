/**
 * Cash Flow Engine Tests
 *
 * Tests for time-based cash flow modeling.
 */

import { describe, it, expect } from "vitest";
import { projectCashFlow } from "@/lib/financial-engine/cashflow";
import type { CashFlowStream } from "@/lib/financial-engine/cashflow";

describe("projectCashFlow", () => {
  it("should handle empty streams", () => {
    const result = projectCashFlow({ streams: [], months: 12 });

    expect(result.timeline).toHaveLength(12);
    expect(result.totalIncome).toBe(0);
    expect(result.totalExpenses).toBe(0);
    expect(result.totalNetCashFlow).toBe(0);
  });

  it("should project monthly income", () => {
    const streams: CashFlowStream[] = [
      { id: "salary", name: "Salary", amount: 5000, frequency: "monthly" },
    ];

    const result = projectCashFlow({ streams, months: 12 });

    expect(result.totalIncome).toBe(60000);
    expect(result.totalExpenses).toBe(0);
    expect(result.totalNetCashFlow).toBe(60000);
    expect(result.averageMonthlyIncome).toBe(5000);
  });

  it("should project monthly expenses", () => {
    const streams: CashFlowStream[] = [
      { id: "rent", name: "Rent", amount: -2000, frequency: "monthly" },
    ];

    const result = projectCashFlow({ streams, months: 6 });

    expect(result.totalExpenses).toBe(12000);
    expect(result.totalIncome).toBe(0);
    expect(result.totalNetCashFlow).toBe(-12000);
  });

  it("should calculate net cash flow", () => {
    const streams: CashFlowStream[] = [
      { id: "salary", name: "Salary", amount: 5000, frequency: "monthly" },
      { id: "rent", name: "Rent", amount: -1500, frequency: "monthly" },
      { id: "food", name: "Food", amount: -600, frequency: "monthly" },
    ];

    const result = projectCashFlow({ streams, months: 12 });

    expect(result.averageMonthlyNet).toBe(2900);
    expect(result.totalNetCashFlow).toBe(34800);
  });

  it("should handle quarterly cash flows", () => {
    const streams: CashFlowStream[] = [
      { id: "bonus", name: "Quarterly Bonus", amount: 3000, frequency: "quarterly" },
    ];

    const result = projectCashFlow({ streams, months: 12 });

    // Quarterly = months 0, 3, 6, 9 = 4 occurrences
    expect(result.totalIncome).toBe(12000);
  });

  it("should handle annual cash flows", () => {
    const streams: CashFlowStream[] = [
      { id: "bonus", name: "Annual Bonus", amount: 10000, frequency: "annually" },
    ];

    const result = projectCashFlow({ streams, months: 24 });

    // Annually = months 0 and 12 = 2 occurrences
    expect(result.totalIncome).toBe(20000);
  });

  it("should handle one-time cash flows", () => {
    const streams: CashFlowStream[] = [
      { id: "gift", name: "Inheritance", amount: 50000, frequency: "one-time", startMonth: 6 },
    ];

    const result = projectCashFlow({ streams, months: 12 });

    expect(result.totalIncome).toBe(50000);
    expect(result.timeline[6].income).toBe(50000);
    expect(result.timeline[5].income).toBe(0);
    expect(result.timeline[7].income).toBe(0);
  });

  it("should respect start/end month bounds", () => {
    const streams: CashFlowStream[] = [
      {
        id: "contract",
        name: "Contract Work",
        amount: 3000,
        frequency: "monthly",
        startMonth: 3,
        endMonth: 8,
      },
    ];

    const result = projectCashFlow({ streams, months: 12 });

    // Only months 3-8 (6 months)
    expect(result.totalIncome).toBe(18000);
    expect(result.timeline[2].income).toBe(0);
    expect(result.timeline[3].income).toBe(3000);
    expect(result.timeline[8].income).toBe(3000);
    expect(result.timeline[9].income).toBe(0);
  });

  it("should apply growth rate to cash flows", () => {
    const streams: CashFlowStream[] = [
      {
        id: "salary",
        name: "Salary",
        amount: 5000,
        frequency: "monthly",
        annualGrowthRate: 3,
      },
    ];

    const result = projectCashFlow({ streams, months: 24 });

    // First month
    expect(result.timeline[0].income).toBe(5000);

    // After 1 year, salary should be ~3% higher
    expect(result.timeline[12].income).toBeCloseTo(5150, -1);
  });

  it("should track cumulative cash flow", () => {
    const streams: CashFlowStream[] = [
      { id: "income", name: "Income", amount: 1000, frequency: "monthly" },
      { id: "expense", name: "Expense", amount: -800, frequency: "monthly" },
    ];

    const result = projectCashFlow({ streams, months: 5 });

    expect(result.timeline[0].cumulativeCashFlow).toBe(200);
    expect(result.timeline[1].cumulativeCashFlow).toBe(400);
    expect(result.timeline[4].cumulativeCashFlow).toBe(1000);
  });

  it("should detect first negative cumulative month", () => {
    const streams: CashFlowStream[] = [
      { id: "income", name: "Income", amount: 500, frequency: "monthly" },
      { id: "expense", name: "Expense", amount: -500, frequency: "monthly" },
      {
        id: "big-expense",
        name: "Big Expense",
        amount: -5000,
        frequency: "one-time",
        startMonth: 3,
      },
    ];

    const result = projectCashFlow({ streams, months: 12 });

    expect(result.firstNegativeMonth).toBe(3);
  });

  it("should return null for firstNegativeMonth when always positive", () => {
    const streams: CashFlowStream[] = [
      { id: "income", name: "Income", amount: 5000, frequency: "monthly" },
    ];

    const result = projectCashFlow({ streams, months: 12 });

    expect(result.firstNegativeMonth).toBeNull();
  });

  it("should handle zero months", () => {
    const streams: CashFlowStream[] = [
      { id: "income", name: "Income", amount: 5000, frequency: "monthly" },
    ];

    const result = projectCashFlow({ streams, months: 0 });

    expect(result.timeline).toHaveLength(0);
    expect(result.totalIncome).toBe(0);
  });
});
