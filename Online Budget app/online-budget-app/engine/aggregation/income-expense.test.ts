import { describe, it, expect } from "vitest";
import { aggregateIncomeExpense } from "./income-expense";
import type { TransactionForAggregation } from "./types";

describe("aggregateIncomeExpense", () => {
  it("separates income and expense", () => {
    const txns: TransactionForAggregation[] = [
      { amountMinor: 500000, currency: "USD" },
      { amountMinor: -15000, currency: "USD" },
      { amountMinor: -8000, currency: "USD" },
      { amountMinor: 200000, currency: "USD" },
    ];

    const result = aggregateIncomeExpense(txns, "USD");

    expect(result.totalIncome.amountMinor).toBe(700000);
    expect(result.totalExpense.amountMinor).toBe(-23000);
    expect(result.net.amountMinor).toBe(677000);
    expect(result.transactionCount).toBe(4);
  });

  it("handles empty transactions", () => {
    const result = aggregateIncomeExpense([], "USD");

    expect(result.totalIncome.amountMinor).toBe(0);
    expect(result.totalExpense.amountMinor).toBe(0);
    expect(result.net.amountMinor).toBe(0);
    expect(result.transactionCount).toBe(0);
  });

  it("handles income only", () => {
    const txns: TransactionForAggregation[] = [
      { amountMinor: 100000, currency: "USD" },
      { amountMinor: 200000, currency: "USD" },
    ];

    const result = aggregateIncomeExpense(txns, "USD");

    expect(result.totalIncome.amountMinor).toBe(300000);
    expect(result.totalExpense.amountMinor).toBe(0);
    expect(result.net.amountMinor).toBe(300000);
  });

  it("handles expenses only", () => {
    const txns: TransactionForAggregation[] = [
      { amountMinor: -5000, currency: "USD" },
      { amountMinor: -3000, currency: "USD" },
    ];

    const result = aggregateIncomeExpense(txns, "USD");

    expect(result.totalIncome.amountMinor).toBe(0);
    expect(result.totalExpense.amountMinor).toBe(-8000);
    expect(result.net.amountMinor).toBe(-8000);
  });

  it("throws on currency mismatch", () => {
    const txns: TransactionForAggregation[] = [
      { amountMinor: 1000, currency: "USD" },
      { amountMinor: -500, currency: "EUR" },
    ];

    expect(() => aggregateIncomeExpense(txns, "USD")).toThrow("Currency mismatch");
  });

  it("treats zero as income (non-negative)", () => {
    const txns: TransactionForAggregation[] = [
      { amountMinor: 0, currency: "USD" },
    ];

    const result = aggregateIncomeExpense(txns, "USD");
    expect(result.totalIncome.amountMinor).toBe(0);
    expect(result.totalExpense.amountMinor).toBe(0);
    expect(result.transactionCount).toBe(1);
  });

  it("preserves currency in result", () => {
    const txns: TransactionForAggregation[] = [
      { amountMinor: 1000, currency: "EUR" },
    ];

    const result = aggregateIncomeExpense(txns, "EUR");
    expect(result.totalIncome.currency).toBe("EUR");
    expect(result.totalExpense.currency).toBe("EUR");
    expect(result.net.currency).toBe("EUR");
  });
});
