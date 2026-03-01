import { describe, it, expect } from "vitest";
import {
  calculateBudgetAnalysis,
  inferBucket,
  getDefaultMappings,
} from "../budget-analyzer";

describe("calculateBudgetAnalysis", () => {
  it("returns empty result for zero income", () => {
    const result = calculateBudgetAnalysis({
      monthlyNetIncome: 0,
      categoryMappings: [],
      transactionTotals: [],
    });
    expect(result.isBalanced).toBe(true);
    expect(result.needs.actualAmount).toBe(0);
  });

  it("analyzes perfect 50/30/20 budget as balanced", () => {
    const result = calculateBudgetAnalysis({
      monthlyNetIncome: 5000,
      categoryMappings: [
        { categoryId: "rent", categoryName: "Rent", bucket: "needs" },
        { categoryId: "food", categoryName: "Food", bucket: "needs" },
        {
          categoryId: "entertainment",
          categoryName: "Entertainment",
          bucket: "wants",
        },
        {
          categoryId: "savings",
          categoryName: "Savings",
          bucket: "savings",
        },
      ],
      transactionTotals: [
        { categoryId: "rent", categoryName: "Rent", total: -2000 },
        { categoryId: "food", categoryName: "Food", total: -500 },
        {
          categoryId: "entertainment",
          categoryName: "Entertainment",
          total: -1500,
        },
        { categoryId: "savings", categoryName: "Savings", total: -1000 },
      ],
    });

    expect(result.isBalanced).toBe(true);
    expect(result.needs.actualPercent).toBeCloseTo(50, 0);
    expect(result.wants.actualPercent).toBeCloseTo(30, 0);
    expect(result.savings.actualPercent).toBeCloseTo(20, 0);
  });

  it("detects overspending in wants", () => {
    const result = calculateBudgetAnalysis({
      monthlyNetIncome: 5000,
      categoryMappings: [
        { categoryId: "rent", categoryName: "Rent", bucket: "needs" },
        {
          categoryId: "shopping",
          categoryName: "Shopping",
          bucket: "wants",
        },
        {
          categoryId: "savings",
          categoryName: "Savings",
          bucket: "savings",
        },
      ],
      transactionTotals: [
        { categoryId: "rent", categoryName: "Rent", total: -2000 },
        { categoryId: "shopping", categoryName: "Shopping", total: -2500 },
        { categoryId: "savings", categoryName: "Savings", total: -500 },
      ],
    });

    expect(result.wants.isOverBudget).toBe(true);
    expect(result.savings.isOverBudget).toBe(false);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it("generates positive recommendation for good savings", () => {
    const result = calculateBudgetAnalysis({
      monthlyNetIncome: 5000,
      categoryMappings: [
        { categoryId: "rent", categoryName: "Rent", bucket: "needs" },
        {
          categoryId: "savings",
          categoryName: "Savings",
          bucket: "savings",
        },
      ],
      transactionTotals: [
        { categoryId: "rent", categoryName: "Rent", total: -2000 },
        { categoryId: "savings", categoryName: "Savings", total: -2000 },
      ],
    });

    const positiveRec = result.recommendations.find((r) =>
      r.includes("Great job")
    );
    expect(positiveRec).toBeDefined();
  });
});

describe("inferBucket", () => {
  it("classifies rent as needs", () => {
    expect(inferBucket("Rent")).toBe("needs");
  });

  it("classifies groceries as needs", () => {
    expect(inferBucket("Grocery Store")).toBe("needs");
  });

  it("classifies savings as savings", () => {
    expect(inferBucket("Savings Account")).toBe("savings");
  });

  it("classifies retirement as savings", () => {
    expect(inferBucket("401k Contribution")).toBe("savings");
  });

  it("defaults unknown categories to wants", () => {
    expect(inferBucket("Random Category")).toBe("wants");
  });
});

describe("getDefaultMappings", () => {
  it("returns mappings array", () => {
    const mappings = getDefaultMappings();
    expect(mappings.length).toBeGreaterThan(0);
    expect(mappings[0]).toHaveProperty("categoryId");
    expect(mappings[0]).toHaveProperty("categoryName");
    expect(mappings[0]).toHaveProperty("bucket");
  });

  it("includes common categories", () => {
    const mappings = getDefaultMappings();
    const names = mappings.map((m) => m.categoryName);
    expect(names).toContain("rent");
    expect(names).toContain("groceries");
    expect(names).toContain("savings");
  });
});
