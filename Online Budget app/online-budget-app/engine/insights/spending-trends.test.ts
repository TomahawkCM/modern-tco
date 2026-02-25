import { describe, it, expect } from "vitest";
import {
  computeSpendingTrends,
  computeSpendingTrendsFromTransactions,
} from "./spending-trends";

describe("computeSpendingTrends", () => {
  it("computes percentage change per category vs baseline", () => {
    const result = computeSpendingTrends({
      currentMonth: [
        { categoryKey: "groceries", spentMinor: 50000 },
        { categoryKey: "dining", spentMinor: 30000 },
      ],
      baselineMonths: [
        [
          { categoryKey: "groceries", spentMinor: 40000 },
          { categoryKey: "dining", spentMinor: 20000 },
        ],
        [
          { categoryKey: "groceries", spentMinor: 60000 },
          { categoryKey: "dining", spentMinor: 20000 },
        ],
      ],
    });

    // Baseline avg: groceries=50000, dining=20000
    // Current: groceries=50000 (0%), dining=30000 (+50%)
    expect(result).toHaveLength(2);
    const groceries = result.find((t) => t.categoryKey === "groceries")!;
    expect(groceries.currentMinor).toBe(50000);
    expect(groceries.baselineAvgMinor).toBe(50000);
    expect(groceries.percentChange).toBeCloseTo(0);

    const dining = result.find((t) => t.categoryKey === "dining")!;
    expect(dining.currentMinor).toBe(30000);
    expect(dining.baselineAvgMinor).toBe(20000);
    expect(dining.percentChange).toBeCloseTo(50);
  });

  it("handles category present in current but not baseline", () => {
    const result = computeSpendingTrends({
      currentMonth: [{ categoryKey: "travel", spentMinor: 100000 }],
      baselineMonths: [
        [{ categoryKey: "groceries", spentMinor: 40000 }],
      ],
    });

    const travel = result.find((t) => t.categoryKey === "travel")!;
    expect(travel.currentMinor).toBe(100000);
    expect(travel.baselineAvgMinor).toBe(0);
    expect(travel.percentChange).toBeNull(); // Cannot compute % from zero baseline
  });

  it("handles category present in baseline but not current", () => {
    const result = computeSpendingTrends({
      currentMonth: [],
      baselineMonths: [
        [{ categoryKey: "groceries", spentMinor: 40000 }],
        [{ categoryKey: "groceries", spentMinor: 60000 }],
      ],
    });

    const groceries = result.find((t) => t.categoryKey === "groceries")!;
    expect(groceries.currentMinor).toBe(0);
    expect(groceries.baselineAvgMinor).toBe(50000);
    expect(groceries.percentChange).toBeCloseTo(-100);
  });

  it("handles empty baseline months", () => {
    const result = computeSpendingTrends({
      currentMonth: [{ categoryKey: "groceries", spentMinor: 50000 }],
      baselineMonths: [],
    });

    const groceries = result.find((t) => t.categoryKey === "groceries")!;
    expect(groceries.baselineAvgMinor).toBe(0);
    expect(groceries.percentChange).toBeNull();
  });

  it("handles empty current and empty baseline", () => {
    const result = computeSpendingTrends({
      currentMonth: [],
      baselineMonths: [],
    });

    expect(result).toHaveLength(0);
  });

  it("handles negative percentage change (spending decrease)", () => {
    const result = computeSpendingTrends({
      currentMonth: [{ categoryKey: "dining", spentMinor: 10000 }],
      baselineMonths: [
        [{ categoryKey: "dining", spentMinor: 40000 }],
      ],
    });

    const dining = result.find((t) => t.categoryKey === "dining")!;
    expect(dining.percentChange).toBeCloseTo(-75);
  });

  it("sorts results by absolute percent change descending", () => {
    const result = computeSpendingTrends({
      currentMonth: [
        { categoryKey: "groceries", spentMinor: 50000 },
        { categoryKey: "dining", spentMinor: 30000 },
        { categoryKey: "transport", spentMinor: 15000 },
      ],
      baselineMonths: [
        [
          { categoryKey: "groceries", spentMinor: 50000 },
          { categoryKey: "dining", spentMinor: 20000 },
          { categoryKey: "transport", spentMinor: 20000 },
        ],
      ],
    });

    // groceries: 0%, dining: +50%, transport: -25%
    // Sorted by |change|: dining(50), transport(25), groceries(0)
    const withChange = result.filter((t) => t.percentChange !== null);
    expect(withChange[0]!.categoryKey).toBe("dining");
    expect(withChange[1]!.categoryKey).toBe("transport");
    expect(withChange[2]!.categoryKey).toBe("groceries");
  });
});

describe("computeSpendingTrendsFromTransactions", () => {
  it("filters expenses and delegates to computeSpendingTrends", () => {
    const current = [
      { amountMinor: -5000, currency: "USD", categoryKey: "groceries" as string | null },
      { amountMinor: -3000, currency: "USD", categoryKey: "dining" as string | null },
      { amountMinor: 100000, currency: "USD", categoryKey: "salary" as string | null },
    ];
    const baseline = [
      [
        { amountMinor: -4000, currency: "USD", categoryKey: "groceries" as string | null },
        { amountMinor: -2000, currency: "USD", categoryKey: "dining" as string | null },
      ],
    ];

    const result = computeSpendingTrendsFromTransactions(current, baseline, "USD");

    // Income excluded, expenses converted to positive
    const groceries = result.find((t) => t.categoryKey === "groceries")!;
    expect(groceries.currentMinor).toBe(5000);
    expect(groceries.baselineAvgMinor).toBe(4000);
    expect(groceries.percentChange).toBeCloseTo(25);

    const dining = result.find((t) => t.categoryKey === "dining")!;
    expect(dining.currentMinor).toBe(3000);
    expect(dining.baselineAvgMinor).toBe(2000);
    expect(dining.percentChange).toBeCloseTo(50);

    // Salary should NOT appear
    expect(result.find((t) => t.categoryKey === "salary")).toBeUndefined();
  });

  it("excludes uncategorized transactions", () => {
    const current = [
      { amountMinor: -5000, currency: "USD", categoryKey: null as string | null },
      { amountMinor: -3000, currency: "USD", categoryKey: "dining" as string | null },
    ];

    const result = computeSpendingTrendsFromTransactions(current, [], "USD");

    expect(result).toHaveLength(1);
    expect(result[0]!.categoryKey).toBe("dining");
  });

  it("handles empty transactions", () => {
    const result = computeSpendingTrendsFromTransactions([], [], "USD");
    expect(result).toHaveLength(0);
  });

  it("handles multiple baseline months", () => {
    const current = [
      { amountMinor: -6000, currency: "USD", categoryKey: "groceries" as string | null },
    ];
    const baseline = [
      [{ amountMinor: -4000, currency: "USD", categoryKey: "groceries" as string | null }],
      [{ amountMinor: -6000, currency: "USD", categoryKey: "groceries" as string | null }],
      [{ amountMinor: -5000, currency: "USD", categoryKey: "groceries" as string | null }],
    ];

    const result = computeSpendingTrendsFromTransactions(current, baseline, "USD");

    const groceries = result.find((t) => t.categoryKey === "groceries")!;
    expect(groceries.currentMinor).toBe(6000);
    // Baseline avg: (4000+6000+5000)/3 = 5000
    expect(groceries.baselineAvgMinor).toBe(5000);
    expect(groceries.percentChange).toBeCloseTo(20);
  });
});
