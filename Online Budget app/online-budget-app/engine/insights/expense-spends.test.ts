import { describe, it, expect } from "vitest";
import { toExpenseCategorySpends } from "./expense-spends";

describe("toExpenseCategorySpends", () => {
  it("returns expense categories with positive spentMinor", () => {
    const txns = [
      { amountMinor: -5000, currency: "USD", categoryKey: "groceries" },
      { amountMinor: -3000, currency: "USD", categoryKey: "dining" },
    ];
    const result = toExpenseCategorySpends(txns, "USD");
    expect(result).toEqual([
      { categoryKey: "groceries", spentMinor: 5000 },
      { categoryKey: "dining", spentMinor: 3000 },
    ]);
  });

  it("excludes income transactions (positive amounts)", () => {
    const txns = [
      { amountMinor: 100000, currency: "USD", categoryKey: "salary" },
      { amountMinor: -2000, currency: "USD", categoryKey: "groceries" },
    ];
    const result = toExpenseCategorySpends(txns, "USD");
    expect(result).toEqual([
      { categoryKey: "groceries", spentMinor: 2000 },
    ]);
  });

  it("excludes uncategorized transactions (null categoryKey)", () => {
    const txns = [
      { amountMinor: -5000, currency: "USD", categoryKey: null },
      { amountMinor: -3000, currency: "USD", categoryKey: "groceries" },
    ];
    const result = toExpenseCategorySpends(txns, "USD");
    expect(result).toEqual([
      { categoryKey: "groceries", spentMinor: 3000 },
    ]);
  });

  it("returns empty array when no expenses", () => {
    const txns = [
      { amountMinor: 100000, currency: "USD", categoryKey: "salary" },
    ];
    const result = toExpenseCategorySpends(txns, "USD");
    expect(result).toEqual([]);
  });

  it("returns empty array for empty input", () => {
    const result = toExpenseCategorySpends([], "USD");
    expect(result).toEqual([]);
  });

  it("aggregates multiple transactions in same category", () => {
    const txns = [
      { amountMinor: -2000, currency: "USD", categoryKey: "groceries" },
      { amountMinor: -3000, currency: "USD", categoryKey: "groceries" },
    ];
    const result = toExpenseCategorySpends(txns, "USD");
    expect(result).toEqual([
      { categoryKey: "groceries", spentMinor: 5000 },
    ]);
  });

  it("sorts by spentMinor descending", () => {
    const txns = [
      { amountMinor: -1000, currency: "USD", categoryKey: "coffee" },
      { amountMinor: -5000, currency: "USD", categoryKey: "groceries" },
      { amountMinor: -3000, currency: "USD", categoryKey: "dining" },
    ];
    const result = toExpenseCategorySpends(txns, "USD");
    expect(result[0]!.categoryKey).toBe("groceries");
    expect(result[1]!.categoryKey).toBe("dining");
    expect(result[2]!.categoryKey).toBe("coffee");
  });

  it("handles mixed income, expenses, and uncategorized", () => {
    const txns = [
      { amountMinor: 100000, currency: "USD", categoryKey: "salary" },
      { amountMinor: -5000, currency: "USD", categoryKey: "groceries" },
      { amountMinor: -2000, currency: "USD", categoryKey: null },
      { amountMinor: -3000, currency: "USD", categoryKey: "dining" },
      { amountMinor: 500, currency: "USD", categoryKey: "refund" },
    ];
    const result = toExpenseCategorySpends(txns, "USD");
    expect(result).toHaveLength(2);
    expect(result[0]!.categoryKey).toBe("groceries");
    expect(result[0]!.spentMinor).toBe(5000);
    expect(result[1]!.categoryKey).toBe("dining");
    expect(result[1]!.spentMinor).toBe(3000);
  });
});
