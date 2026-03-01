import { describe, it, expect } from "vitest";
import {
  calculateSubscriptionCost,
  toMonthlyCost,
  toYearlyCost,
  generateSubscriptionId,
  SUBSCRIPTION_CATEGORIES,
} from "../subscription-cost";
import type { SubscriptionEntry } from "../types";

describe("toMonthlyCost", () => {
  it("converts weekly to monthly", () => {
    expect(toMonthlyCost(10, "weekly")).toBeCloseTo(43.33, 1);
  });

  it("converts biweekly to monthly", () => {
    expect(toMonthlyCost(50, "biweekly")).toBeCloseTo(108.33, 1);
  });

  it("returns same amount for monthly", () => {
    expect(toMonthlyCost(15, "monthly")).toBe(15);
  });

  it("converts quarterly to monthly", () => {
    expect(toMonthlyCost(30, "quarterly")).toBeCloseTo(10, 0);
  });

  it("converts annual to monthly", () => {
    expect(toMonthlyCost(120, "annual")).toBeCloseTo(10, 0);
  });
});

describe("toYearlyCost", () => {
  it("converts monthly to yearly", () => {
    expect(toYearlyCost(10, "monthly")).toBe(120);
  });

  it("converts annual to yearly", () => {
    expect(toYearlyCost(100, "annual")).toBeCloseTo(100, 0);
  });
});

describe("calculateSubscriptionCost", () => {
  const subs: SubscriptionEntry[] = [
    {
      id: "1",
      name: "Netflix",
      amount: 15.99,
      frequency: "monthly",
      category: "Streaming",
      isEssential: false,
    },
    {
      id: "2",
      name: "Spotify",
      amount: 9.99,
      frequency: "monthly",
      category: "Music",
      isEssential: false,
    },
    {
      id: "3",
      name: "Cloud Storage",
      amount: 99.99,
      frequency: "annual",
      category: "Software",
      isEssential: true,
    },
  ];

  it("returns empty result for no subscriptions", () => {
    const result = calculateSubscriptionCost({ subscriptions: [] });
    expect(result.totalMonthly).toBe(0);
  });

  it("calculates correct totals", () => {
    const result = calculateSubscriptionCost({ subscriptions: subs });
    // Netflix (15.99) + Spotify (9.99) + Cloud (~8.33) = ~34.31
    expect(result.totalMonthly).toBeCloseTo(34.31, 0);
    expect(result.totalYearly).toBeCloseTo(result.totalMonthly * 12, 0);
    expect(result.totalDaily).toBeGreaterThan(0);
    expect(result.totalWeekly).toBeGreaterThan(0);
  });

  it("separates essential vs non-essential", () => {
    const result = calculateSubscriptionCost({ subscriptions: subs });
    expect(result.essentialMonthly).toBeCloseTo(8.33, 0);
    expect(result.nonEssentialMonthly).toBeCloseTo(25.98, 0);
  });

  it("groups by category", () => {
    const result = calculateSubscriptionCost({ subscriptions: subs });
    expect(result.byCategory.length).toBe(3);
    // Sorted by monthly cost descending
    expect(result.byCategory[0]!.monthly).toBeGreaterThanOrEqual(
      result.byCategory[1]!.monthly
    );
  });

  it("calculates percentage of income", () => {
    const result = calculateSubscriptionCost({
      subscriptions: subs,
      monthlyIncome: 5000,
    });
    expect(result.percentOfIncome).toBeGreaterThan(0);
    expect(result.percentOfIncome!).toBeLessThan(100);
  });

  it("calculates potential savings", () => {
    const result = calculateSubscriptionCost({ subscriptions: subs });
    expect(result.potentialYearlySavings).toBeCloseTo(
      result.nonEssentialMonthly * 12,
      0
    );
  });
});

describe("generateSubscriptionId", () => {
  it("generates unique IDs starting with sub_", () => {
    const id = generateSubscriptionId();
    expect(id.startsWith("sub_")).toBe(true);
  });
});

describe("SUBSCRIPTION_CATEGORIES", () => {
  it("includes common categories", () => {
    expect(SUBSCRIPTION_CATEGORIES).toContain("Streaming");
    expect(SUBSCRIPTION_CATEGORIES).toContain("Software");
    expect(SUBSCRIPTION_CATEGORIES).toContain("Music");
  });
});
