import { describe, it, expect } from "vitest";
import { PATTERN_RULES } from "./rules";

describe("PATTERN_RULES", () => {
  it("has rules for all major expense categories", () => {
    const parentKeys = new Set(PATTERN_RULES.map((r) => r.parentKey));
    expect(parentKeys.has("food_dining")).toBe(true);
    expect(parentKeys.has("transportation")).toBe(true);
    expect(parentKeys.has("bills_utilities")).toBe(true);
    expect(parentKeys.has("shopping")).toBe(true);
    expect(parentKeys.has("entertainment")).toBe(true);
    expect(parentKeys.has("health_fitness")).toBe(true);
    expect(parentKeys.has("housing")).toBe(true);
  });

  it("has rules for income categories", () => {
    const parentKeys = new Set(PATTERN_RULES.map((r) => r.parentKey));
    expect(parentKeys.has("income")).toBe(true);
  });

  it("has rules for transfer categories", () => {
    const parentKeys = new Set(PATTERN_RULES.map((r) => r.parentKey));
    expect(parentKeys.has("transfers")).toBe(true);
  });

  it("all rules have confidence between 0.8 and 1.0", () => {
    for (const rule of PATTERN_RULES) {
      expect(rule.confidence).toBeGreaterThanOrEqual(0.8);
      expect(rule.confidence).toBeLessThanOrEqual(1.0);
    }
  });

  it("all patterns are case-insensitive", () => {
    for (const rule of PATTERN_RULES) {
      expect(rule.pattern.flags).toContain("i");
    }
  });

  it("matches known grocery merchants", () => {
    const match = PATTERN_RULES.find(
      (r) =>
        r.categoryKey === "groceries" &&
        (r.pattern.test("WHOLE FOODS") || r.pattern.test("WALMART"))
    );
    expect(match).toBeDefined();
  });

  it("matches known coffee merchants", () => {
    const match = PATTERN_RULES.find(
      (r) => r.categoryKey === "coffee_shops" && r.pattern.test("STARBUCKS")
    );
    expect(match).toBeDefined();
  });

  it("matches known streaming services", () => {
    const match = PATTERN_RULES.find(
      (r) => r.categoryKey === "streaming" && r.pattern.test("NETFLIX")
    );
    expect(match).toBeDefined();
  });

  it("matches payroll/salary patterns", () => {
    const match = PATTERN_RULES.find(
      (r) => r.categoryKey === "salary" && r.pattern.test("PAYROLL DEPOSIT")
    );
    expect(match).toBeDefined();
  });

  it("matches transfer patterns", () => {
    const match = PATTERN_RULES.find(
      (r) =>
        r.parentKey === "transfers" &&
        r.pattern.test("TRANSFER TO SAVINGS")
    );
    expect(match).toBeDefined();
  });
});
