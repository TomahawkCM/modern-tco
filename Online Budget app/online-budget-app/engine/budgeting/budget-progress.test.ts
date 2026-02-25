import { describe, it, expect } from "vitest";
import {
  computeBudgetProgress,
  computeBudgetProgressFromTransactions,
} from "./budget-progress";

describe("computeBudgetProgress", () => {
  const currency = "USD";

  it("computes remaining and percentage for a single budget", () => {
    const budgets = [
      { categoryKey: "groceries", limitMinor: 50000, currency },
    ];
    const spending = [
      { categoryKey: "groceries", spentMinor: 30000 },
    ];

    const result = computeBudgetProgress(budgets, spending, currency);

    expect(result).toHaveLength(1);
    expect(result[0]!.categoryKey).toBe("groceries");
    expect(result[0]!.limitMinor).toBe(50000);
    expect(result[0]!.spentMinor).toBe(30000);
    expect(result[0]!.remainingMinor).toBe(20000);
    expect(result[0]!.percentUsed).toBeCloseTo(60);
    expect(result[0]!.isOverBudget).toBe(false);
  });

  it("detects over-budget spending", () => {
    const budgets = [
      { categoryKey: "dining", limitMinor: 20000, currency },
    ];
    const spending = [
      { categoryKey: "dining", spentMinor: 25000 },
    ];

    const result = computeBudgetProgress(budgets, spending, currency);

    expect(result[0]!.remainingMinor).toBe(-5000);
    expect(result[0]!.percentUsed).toBeCloseTo(125);
    expect(result[0]!.isOverBudget).toBe(true);
  });

  it("shows zero spent when no spending for a budgeted category", () => {
    const budgets = [
      { categoryKey: "entertainment", limitMinor: 10000, currency },
    ];
    const spending: { categoryKey: string; spentMinor: number }[] = [];

    const result = computeBudgetProgress(budgets, spending, currency);

    expect(result[0]!.spentMinor).toBe(0);
    expect(result[0]!.remainingMinor).toBe(10000);
    expect(result[0]!.percentUsed).toBe(0);
    expect(result[0]!.isOverBudget).toBe(false);
  });

  it("handles multiple budgets with mixed spending", () => {
    const budgets = [
      { categoryKey: "groceries", limitMinor: 50000, currency },
      { categoryKey: "dining", limitMinor: 20000, currency },
      { categoryKey: "gas", limitMinor: 15000, currency },
    ];
    const spending = [
      { categoryKey: "groceries", spentMinor: 48000 },
      { categoryKey: "gas", spentMinor: 15000 },
    ];

    const result = computeBudgetProgress(budgets, spending, currency);

    expect(result).toHaveLength(3);
    const groceries = result.find((b) => b.categoryKey === "groceries");
    const dining = result.find((b) => b.categoryKey === "dining");
    const gas = result.find((b) => b.categoryKey === "gas");
    expect(groceries?.remainingMinor).toBe(2000);
    expect(dining?.spentMinor).toBe(0);
    expect(gas?.percentUsed).toBeCloseTo(100);
    expect(gas?.isOverBudget).toBe(false);
  });

  it("throws on currency mismatch in budgets", () => {
    const budgets = [
      { categoryKey: "groceries", limitMinor: 50000, currency: "EUR" },
    ];
    const spending: { categoryKey: string; spentMinor: number }[] = [];

    expect(() =>
      computeBudgetProgress(budgets, spending, "USD")
    ).toThrow("Currency mismatch");
  });

  it("handles exact budget usage (100%)", () => {
    const budgets = [
      { categoryKey: "rent", limitMinor: 150000, currency },
    ];
    const spending = [
      { categoryKey: "rent", spentMinor: 150000 },
    ];

    const result = computeBudgetProgress(budgets, spending, currency);

    expect(result[0]!.percentUsed).toBeCloseTo(100);
    expect(result[0]!.remainingMinor).toBe(0);
    expect(result[0]!.isOverBudget).toBe(false);
  });

  it("returns empty array when no budgets defined", () => {
    const result = computeBudgetProgress([], [], currency);
    expect(result).toHaveLength(0);
  });
});

describe("computeBudgetProgressFromTransactions", () => {
  const currency = "USD";

  it("filters expenses and delegates to computeBudgetProgress", () => {
    const transactions = [
      { amountMinor: -30000, currency, categoryKey: "groceries" as string | null },
      { amountMinor: -25000, currency, categoryKey: "dining" as string | null },
      { amountMinor: 100000, currency, categoryKey: "salary" as string | null },
    ];
    const budgets = [
      { categoryKey: "groceries", limitMinor: 50000, currency },
      { categoryKey: "dining", limitMinor: 20000, currency },
    ];

    const result = computeBudgetProgressFromTransactions(transactions, budgets, currency);

    expect(result).toHaveLength(2);
    const groceries = result.find((b) => b.categoryKey === "groceries")!;
    expect(groceries.spentMinor).toBe(30000);
    expect(groceries.remainingMinor).toBe(20000);
    expect(groceries.isOverBudget).toBe(false);

    const dining = result.find((b) => b.categoryKey === "dining")!;
    expect(dining.spentMinor).toBe(25000);
    expect(dining.remainingMinor).toBe(-5000);
    expect(dining.isOverBudget).toBe(true);
  });

  it("excludes income and uncategorized from spending", () => {
    const transactions = [
      { amountMinor: 100000, currency, categoryKey: "salary" as string | null },
      { amountMinor: -10000, currency, categoryKey: null as string | null },
      { amountMinor: -8000, currency, categoryKey: "groceries" as string | null },
    ];
    const budgets = [
      { categoryKey: "groceries", limitMinor: 50000, currency },
    ];

    const result = computeBudgetProgressFromTransactions(transactions, budgets, currency);

    expect(result).toHaveLength(1);
    expect(result[0]!.spentMinor).toBe(8000);
    expect(result[0]!.remainingMinor).toBe(42000);
  });

  it("returns progress with zero spent when no matching expenses", () => {
    const transactions = [
      { amountMinor: 100000, currency, categoryKey: "salary" as string | null },
    ];
    const budgets = [
      { categoryKey: "groceries", limitMinor: 50000, currency },
    ];

    const result = computeBudgetProgressFromTransactions(transactions, budgets, currency);

    expect(result[0]!.spentMinor).toBe(0);
    expect(result[0]!.remainingMinor).toBe(50000);
  });

  it("handles empty transactions", () => {
    const budgets = [
      { categoryKey: "groceries", limitMinor: 50000, currency },
    ];

    const result = computeBudgetProgressFromTransactions([], budgets, currency);

    expect(result).toHaveLength(1);
    expect(result[0]!.spentMinor).toBe(0);
  });
});
