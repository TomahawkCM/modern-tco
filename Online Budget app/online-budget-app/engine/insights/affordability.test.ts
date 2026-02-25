import { describe, it, expect } from "vitest";
import {
  computeAffordability,
  computeAffordabilityFromSummary,
} from "./affordability";

describe("computeAffordability", () => {
  it("approves one-time purchase within surplus", () => {
    const result = computeAffordability({
      monthlyIncomeMinor: 500000,
      monthlyExpensesMinor: 350000,
      requestedAmountMinor: 100000,
      isRecurring: false,
    });

    // Surplus: 500000 - 350000 = 150000, requested 100000 → affordable
    expect(result.canAfford).toBe(true);
    expect(result.monthlySuplusMinor).toBe(150000);
    expect(result.remainingAfterMinor).toBe(50000);
  });

  it("rejects one-time purchase exceeding surplus", () => {
    const result = computeAffordability({
      monthlyIncomeMinor: 500000,
      monthlyExpensesMinor: 350000,
      requestedAmountMinor: 200000,
      isRecurring: false,
    });

    expect(result.canAfford).toBe(false);
    expect(result.monthlySuplusMinor).toBe(150000);
    expect(result.shortfallMinor).toBe(50000);
  });

  it("approves recurring expense within surplus", () => {
    const result = computeAffordability({
      monthlyIncomeMinor: 500000,
      monthlyExpensesMinor: 350000,
      requestedAmountMinor: 5000,
      isRecurring: true,
    });

    // Recurring 5000/mo fits within 150000 surplus
    expect(result.canAfford).toBe(true);
    expect(result.remainingAfterMinor).toBe(145000);
  });

  it("rejects recurring expense exceeding surplus", () => {
    const result = computeAffordability({
      monthlyIncomeMinor: 500000,
      monthlyExpensesMinor: 490000,
      requestedAmountMinor: 15000,
      isRecurring: true,
    });

    // Surplus: 10000, recurring 15000 → not affordable
    expect(result.canAfford).toBe(false);
    expect(result.shortfallMinor).toBe(5000);
  });

  it("handles zero income (always unaffordable)", () => {
    const result = computeAffordability({
      monthlyIncomeMinor: 0,
      monthlyExpensesMinor: 0,
      requestedAmountMinor: 1000,
      isRecurring: false,
    });

    expect(result.canAfford).toBe(false);
    expect(result.monthlySuplusMinor).toBe(0);
  });

  it("handles negative surplus (expenses exceed income)", () => {
    const result = computeAffordability({
      monthlyIncomeMinor: 300000,
      monthlyExpensesMinor: 400000,
      requestedAmountMinor: 5000,
      isRecurring: false,
    });

    expect(result.canAfford).toBe(false);
    expect(result.monthlySuplusMinor).toBe(0);
    expect(result.shortfallMinor).toBe(5000);
  });

  it("handles zero requested amount", () => {
    const result = computeAffordability({
      monthlyIncomeMinor: 500000,
      monthlyExpensesMinor: 350000,
      requestedAmountMinor: 0,
      isRecurring: false,
    });

    expect(result.canAfford).toBe(true);
    expect(result.remainingAfterMinor).toBe(150000);
  });

  it("provides comfort level indicator", () => {
    // Comfortable: remaining > 20% of income
    const comfortable = computeAffordability({
      monthlyIncomeMinor: 500000,
      monthlyExpensesMinor: 200000,
      requestedAmountMinor: 50000,
      isRecurring: false,
    });
    expect(comfortable.comfortLevel).toBe("comfortable");

    // Tight: remaining 5-20% of income
    const tight = computeAffordability({
      monthlyIncomeMinor: 500000,
      monthlyExpensesMinor: 350000,
      requestedAmountMinor: 100000,
      isRecurring: false,
    });
    expect(tight.comfortLevel).toBe("tight");

    // Unaffordable
    const unaffordable = computeAffordability({
      monthlyIncomeMinor: 500000,
      monthlyExpensesMinor: 480000,
      requestedAmountMinor: 30000,
      isRecurring: false,
    });
    expect(unaffordable.comfortLevel).toBe("unaffordable");
  });
});

describe("computeAffordabilityFromSummary", () => {
  it("converts negative expense to positive and delegates", () => {
    const summary = {
      totalIncome: { amountMinor: 500000, currency: "USD" },
      totalExpense: { amountMinor: -350000, currency: "USD" },
      net: { amountMinor: 150000, currency: "USD" },
      transactionCount: 20,
    };

    const result = computeAffordabilityFromSummary(summary, 100000, false);

    // Surplus: 500000 - 350000 = 150000, requested 100000 → affordable
    expect(result.canAfford).toBe(true);
    expect(result.monthlySuplusMinor).toBe(150000);
    expect(result.remainingAfterMinor).toBe(50000);
  });

  it("handles zero expenses (all income is surplus)", () => {
    const summary = {
      totalIncome: { amountMinor: 500000, currency: "USD" },
      totalExpense: { amountMinor: 0, currency: "USD" },
      net: { amountMinor: 500000, currency: "USD" },
      transactionCount: 1,
    };

    const result = computeAffordabilityFromSummary(summary, 100000, true);

    expect(result.canAfford).toBe(true);
    expect(result.monthlySuplusMinor).toBe(500000);
  });

  it("handles expenses exceeding income", () => {
    const summary = {
      totalIncome: { amountMinor: 300000, currency: "USD" },
      totalExpense: { amountMinor: -400000, currency: "USD" },
      net: { amountMinor: -100000, currency: "USD" },
      transactionCount: 15,
    };

    const result = computeAffordabilityFromSummary(summary, 5000, false);

    expect(result.canAfford).toBe(false);
    expect(result.monthlySuplusMinor).toBe(0);
    expect(result.comfortLevel).toBe("unaffordable");
  });

  it("passes isRecurring through to computeAffordability", () => {
    const summary = {
      totalIncome: { amountMinor: 500000, currency: "USD" },
      totalExpense: { amountMinor: -350000, currency: "USD" },
      net: { amountMinor: 150000, currency: "USD" },
      transactionCount: 20,
    };

    const oneTime = computeAffordabilityFromSummary(summary, 100000, false);
    const recurring = computeAffordabilityFromSummary(summary, 100000, true);

    // Both should produce same result (computeAffordability treats them identically)
    expect(oneTime.canAfford).toBe(true);
    expect(recurring.canAfford).toBe(true);
    expect(oneTime.remainingAfterMinor).toBe(recurring.remainingAfterMinor);
  });
});
