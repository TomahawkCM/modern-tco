import { describe, it, expect } from "vitest";
import { computeSafeToSpend } from "./safe-to-spend";

describe("computeSafeToSpend", () => {
  it("computes basic safe-to-spend with remaining days", () => {
    const result = computeSafeToSpend({
      incomeMinor: 500000, // $5,000
      totalBudgetedMinor: 400000,
      totalSpentMinor: 200000, // $2,000 spent
      currentDay: 15,
      daysInMonth: 30,
      currency: "USD",
    });

    expect(result.monthlyMinor).toBe(300000); // $3,000 remaining
    expect(result.remainingDays).toBe(16); // 30 - 15 + 1
    expect(result.dailyMinor).toBe(Math.round(300000 / 16));
    expect(result.isOverspent).toBe(false);
    expect(result.currency).toBe("USD");
  });

  it("detects overspending", () => {
    const result = computeSafeToSpend({
      incomeMinor: 300000,
      totalBudgetedMinor: 300000,
      totalSpentMinor: 350000, // spent more than income
      currentDay: 20,
      daysInMonth: 30,
      currency: "EUR",
    });

    expect(result.monthlyMinor).toBe(-50000);
    expect(result.isOverspent).toBe(true);
    expect(result.dailyMinor).toBe(Math.round(-50000 / 11));
  });

  it("handles last day of month", () => {
    const result = computeSafeToSpend({
      incomeMinor: 400000,
      totalBudgetedMinor: 300000,
      totalSpentMinor: 380000,
      currentDay: 31,
      daysInMonth: 31,
      currency: "USD",
    });

    expect(result.remainingDays).toBe(1);
    expect(result.dailyMinor).toBe(20000); // all remaining = daily
    expect(result.monthlyMinor).toBe(20000);
  });

  it("handles first day of month with no spending", () => {
    const result = computeSafeToSpend({
      incomeMinor: 600000,
      totalBudgetedMinor: 500000,
      totalSpentMinor: 0,
      currentDay: 1,
      daysInMonth: 30,
      currency: "GBP",
    });

    expect(result.monthlyMinor).toBe(600000);
    expect(result.remainingDays).toBe(30);
    expect(result.dailyMinor).toBe(20000);
    expect(result.isOverspent).toBe(false);
  });

  it("handles zero income", () => {
    const result = computeSafeToSpend({
      incomeMinor: 0,
      totalBudgetedMinor: 0,
      totalSpentMinor: 10000,
      currentDay: 10,
      daysInMonth: 30,
      currency: "USD",
    });

    expect(result.monthlyMinor).toBe(-10000);
    expect(result.isOverspent).toBe(true);
  });
});
