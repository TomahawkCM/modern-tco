import { describe, it, expect } from "vitest";
import { categorize } from "./categorize";
import type { MerchantRule } from "./types";

describe("categorize", () => {
  const merchantRules: MerchantRule[] = [
    {
      merchantToken: "COSTCO WHOLESALE",
      displayName: "Costco",
      categoryKey: "groceries",
      parentKey: "food_dining",
    },
  ];

  it("matches merchant rule with highest confidence", () => {
    const result = categorize("COSTCO WHOLESALE #1234", merchantRules);
    expect(result).not.toBeNull();
    expect(result!.categoryKey).toBe("groceries");
    expect(result!.method).toBe("merchant_rule");
    expect(result!.confidence).toBe(0.99);
  });

  it("falls back to pattern rules when no merchant match", () => {
    const result = categorize("NETFLIX.COM", []);
    expect(result).not.toBeNull();
    expect(result!.categoryKey).toBe("streaming");
    expect(result!.parentKey).toBe("entertainment");
    expect(result!.method).toBe("pattern_rule");
  });

  it("returns null for unrecognized description", () => {
    const result = categorize("XYZZY CORP MYSTERIOUS PAYMENT", []);
    expect(result).toBeNull();
  });

  it("prefers merchant rules over pattern rules", () => {
    const customRules: MerchantRule[] = [
      {
        merchantToken: "NETFLIX.COM",
        displayName: "Netflix",
        categoryKey: "bills_utilities",
        parentKey: "bills_utilities",
      },
    ];
    const result = categorize("NETFLIX.COM", customRules);
    expect(result!.categoryKey).toBe("bills_utilities");
    expect(result!.method).toBe("merchant_rule");
  });

  it("handles empty description gracefully", () => {
    const result = categorize("", []);
    expect(result).toBeNull();
  });

  it("matches case-insensitively via pattern rules", () => {
    const result = categorize("starbucks coffee", []);
    expect(result).not.toBeNull();
    expect(result!.parentKey).toBe("food_dining");
  });

  it("categorizes salary/payroll as income", () => {
    const result = categorize("PAYROLL DEPOSIT ACME INC", []);
    expect(result).not.toBeNull();
    expect(result!.categoryKey).toBe("salary");
    expect(result!.parentKey).toBe("income");
  });

  it("categorizes transfers correctly", () => {
    const result = categorize("TRANSFER TO SAVINGS", []);
    expect(result).not.toBeNull();
    expect(result!.parentKey).toBe("transfers");
  });

  it("handles whitespace-only description", () => {
    const result = categorize("   ", []);
    expect(result).toBeNull();
  });

  it("merchant rules use empty array by default if not provided", () => {
    const result = categorize("STARBUCKS", []);
    expect(result).not.toBeNull();
    expect(result!.categoryKey).toBe("coffee_shops");
    expect(result!.method).toBe("pattern_rule");
  });
});
