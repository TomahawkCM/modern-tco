import { describe, it, expect } from "vitest";
import { aggregateByCategory } from "./category-spending";

describe("aggregateByCategory", () => {
  const currency = "USD";

  it("groups transactions by category key and sums amounts", () => {
    const transactions = [
      { amountMinor: -2500, currency, categoryKey: "groceries" },
      { amountMinor: -1500, currency, categoryKey: "groceries" },
      { amountMinor: -3000, currency, categoryKey: "gas" },
    ];

    const result = aggregateByCategory(transactions, currency);

    expect(result.categories).toHaveLength(2);
    const groceries = result.categories.find(
      (c) => c.categoryKey === "groceries"
    );
    const gas = result.categories.find((c) => c.categoryKey === "gas");
    expect(groceries?.total.amountMinor).toBe(-4000);
    expect(groceries?.transactionCount).toBe(2);
    expect(gas?.total.amountMinor).toBe(-3000);
    expect(gas?.transactionCount).toBe(1);
  });

  it("sorts categories by absolute amount descending", () => {
    const transactions = [
      { amountMinor: -1000, currency, categoryKey: "coffee" },
      { amountMinor: -5000, currency, categoryKey: "rent" },
      { amountMinor: -3000, currency, categoryKey: "groceries" },
    ];

    const result = aggregateByCategory(transactions, currency);

    expect(result.categories[0]!.categoryKey).toBe("rent");
    expect(result.categories[1]!.categoryKey).toBe("groceries");
    expect(result.categories[2]!.categoryKey).toBe("coffee");
  });

  it("handles empty transaction list", () => {
    const result = aggregateByCategory([], currency);

    expect(result.categories).toHaveLength(0);
    expect(result.totalSpending.amountMinor).toBe(0);
  });

  it("includes uncategorized transactions under null key", () => {
    const transactions = [
      { amountMinor: -2000, currency, categoryKey: null },
      { amountMinor: -1000, currency, categoryKey: "groceries" },
    ];

    const result = aggregateByCategory(transactions, currency);

    expect(result.categories).toHaveLength(2);
    const uncategorized = result.categories.find(
      (c) => c.categoryKey === null
    );
    expect(uncategorized?.total.amountMinor).toBe(-2000);
  });

  it("computes totalSpending as sum of all negative amounts", () => {
    const transactions = [
      { amountMinor: -2000, currency, categoryKey: "groceries" },
      { amountMinor: 5000, currency, categoryKey: "salary" },
      { amountMinor: -3000, currency, categoryKey: "rent" },
    ];

    const result = aggregateByCategory(transactions, currency);

    // totalSpending only includes expenses (negative amounts)
    expect(result.totalSpending.amountMinor).toBe(-5000);
  });

  it("computes percentage of total for each category", () => {
    const transactions = [
      { amountMinor: -6000, currency, categoryKey: "rent" },
      { amountMinor: -4000, currency, categoryKey: "groceries" },
    ];

    const result = aggregateByCategory(transactions, currency);

    const rent = result.categories.find((c) => c.categoryKey === "rent");
    const groceries = result.categories.find(
      (c) => c.categoryKey === "groceries"
    );
    expect(rent?.percentageOfTotal).toBeCloseTo(60);
    expect(groceries?.percentageOfTotal).toBeCloseTo(40);
  });

  it("sets percentage to 0 when no spending exists", () => {
    const transactions = [
      { amountMinor: 5000, currency, categoryKey: "salary" },
    ];

    const result = aggregateByCategory(transactions, currency);

    const salary = result.categories.find((c) => c.categoryKey === "salary");
    expect(salary?.percentageOfTotal).toBe(0);
  });

  it("throws on currency mismatch", () => {
    const transactions = [
      { amountMinor: -1000, currency: "USD", categoryKey: "groceries" },
      { amountMinor: -2000, currency: "EUR", categoryKey: "groceries" },
    ];

    expect(() => aggregateByCategory(transactions, "USD")).toThrow(
      "Currency mismatch"
    );
  });

  it("handles income-only categories correctly", () => {
    const transactions = [
      { amountMinor: 10000, currency, categoryKey: "salary" },
      { amountMinor: 2000, currency, categoryKey: "freelance" },
    ];

    const result = aggregateByCategory(transactions, currency);

    expect(result.categories).toHaveLength(2);
    expect(result.totalSpending.amountMinor).toBe(0);
    const salary = result.categories.find((c) => c.categoryKey === "salary");
    expect(salary?.total.amountMinor).toBe(10000);
  });
});
