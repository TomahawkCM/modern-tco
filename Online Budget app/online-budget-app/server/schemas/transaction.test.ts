import { describe, it, expect } from "vitest";
import {
  createTransactionSchema,
  updateTransactionSchema,
  listTransactionsSchema,
} from "./transaction";

describe("createTransactionSchema", () => {
  const validInput = {
    account_id: "550e8400-e29b-41d4-a716-446655440000",
    amount_minor: -1500,
    currency: "USD",
    transaction_date: "2026-02-20",
  };

  it("accepts valid minimal input", () => {
    const result = createTransactionSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("accepts valid full input", () => {
    const result = createTransactionSchema.safeParse({
      ...validInput,
      description: "Grocery shopping",
      merchant_name: "Whole Foods",
      category_id: "550e8400-e29b-41d4-a716-446655440001",
      is_pending: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-integer amount_minor", () => {
    const result = createTransactionSchema.safeParse({
      ...validInput,
      amount_minor: 15.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid currency length", () => {
    const result = createTransactionSchema.safeParse({
      ...validInput,
      currency: "US",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date format", () => {
    const result = createTransactionSchema.safeParse({
      ...validInput,
      transaction_date: "02/20/2026",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = createTransactionSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects invalid account_id format", () => {
    const result = createTransactionSchema.safeParse({
      ...validInput,
      account_id: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("accepts zero amount (valid for adjustments)", () => {
    const result = createTransactionSchema.safeParse({
      ...validInput,
      amount_minor: 0,
    });
    expect(result.success).toBe(true);
  });
});

describe("updateTransactionSchema", () => {
  it("accepts partial update (category only)", () => {
    const result = updateTransactionSchema.safeParse({
      category_id: "550e8400-e29b-41d4-a716-446655440001",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null category_id (uncategorize)", () => {
    const result = updateTransactionSchema.safeParse({
      category_id: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty object", () => {
    const result = updateTransactionSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-integer amount_minor", () => {
    const result = updateTransactionSchema.safeParse({
      amount_minor: 15.5,
    });
    expect(result.success).toBe(false);
  });
});

describe("listTransactionsSchema", () => {
  it("accepts empty query (uses defaults)", () => {
    const result = listTransactionsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(50);
      expect(result.data.offset).toBe(0);
    }
  });

  it("accepts all filters", () => {
    const result = listTransactionsSchema.safeParse({
      account_id: "550e8400-e29b-41d4-a716-446655440000",
      category_id: "550e8400-e29b-41d4-a716-446655440001",
      from_date: "2026-01-01",
      to_date: "2026-02-28",
      is_pending: "true",
      limit: "25",
      offset: "10",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(25);
      expect(result.data.offset).toBe(10);
    }
  });

  it("rejects limit above 100", () => {
    const result = listTransactionsSchema.safeParse({ limit: "200" });
    expect(result.success).toBe(false);
  });

  it("coerces string numbers to integers", () => {
    const result = listTransactionsSchema.safeParse({
      limit: "10",
      offset: "5",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(10);
      expect(result.data.offset).toBe(5);
    }
  });
});
