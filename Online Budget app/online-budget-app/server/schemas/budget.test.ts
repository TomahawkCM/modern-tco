import { describe, it, expect } from "vitest";
import { createBudgetSchema, updateBudgetSchema, listBudgetsSchema } from "./budget";

describe("createBudgetSchema", () => {
  const validInput = {
    category_id: "550e8400-e29b-41d4-a716-446655440000",
    amount_minor: 50000,
    currency: "USD",
  };

  it("accepts valid input", () => {
    const result = createBudgetSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects missing category_id", () => {
    const { category_id: _category_id, ...rest } = validInput;
    const result = createBudgetSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects invalid category_id format", () => {
    const result = createBudgetSchema.safeParse({
      ...validInput,
      category_id: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero amount", () => {
    const result = createBudgetSchema.safeParse({
      ...validInput,
      amount_minor: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative amount", () => {
    const result = createBudgetSchema.safeParse({
      ...validInput,
      amount_minor: -1000,
    });
    expect(result.success).toBe(false);
  });

  it("accepts missing currency (API layer supplies user default)", () => {
    const { currency: _currency, ...rest } = validInput;
    const result = createBudgetSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBeUndefined();
    }
  });

  it("rejects invalid currency code length", () => {
    const result = createBudgetSchema.safeParse({
      ...validInput,
      currency: "US",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateBudgetSchema", () => {
  it("accepts amount_minor update", () => {
    const result = updateBudgetSchema.safeParse({ amount_minor: 60000 });
    expect(result.success).toBe(true);
  });

  it("rejects empty update", () => {
    const result = updateBudgetSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects zero amount", () => {
    const result = updateBudgetSchema.safeParse({ amount_minor: 0 });
    expect(result.success).toBe(false);
  });
});

describe("listBudgetsSchema", () => {
  it("accepts empty query (uses defaults)", () => {
    const result = listBudgetsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.period).toBe("monthly");
    }
  });

  it("accepts explicit period", () => {
    const result = listBudgetsSchema.safeParse({ period: "monthly" });
    expect(result.success).toBe(true);
  });
});
