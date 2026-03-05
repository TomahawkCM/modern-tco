import { describe, it, expect } from "vitest";
import { createMerchantMappingSchema, listMerchantMappingsSchema } from "./merchant-mapping";

describe("createMerchantMappingSchema", () => {
  const validInput = {
    merchant_token: "COSTCO WHOLESALE",
    display_name: "Costco",
    category_id: "550e8400-e29b-41d4-a716-446655440000",
  };

  it("accepts valid input", () => {
    const result = createMerchantMappingSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects missing merchant_token", () => {
    const { merchant_token: _merchant_token, ...rest } = validInput;
    const result = createMerchantMappingSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects empty merchant_token", () => {
    const result = createMerchantMappingSchema.safeParse({
      ...validInput,
      merchant_token: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid category_id format", () => {
    const result = createMerchantMappingSchema.safeParse({
      ...validInput,
      category_id: "not-a-uuid",
    });
    expect(result.success).toBe(false);
  });

  it("uppercases and trims merchant_token", () => {
    const result = createMerchantMappingSchema.safeParse({
      ...validInput,
      merchant_token: "  costco wholesale  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.merchant_token).toBe("COSTCO WHOLESALE");
    }
  });
});

describe("listMerchantMappingsSchema", () => {
  it("accepts empty query (uses defaults)", () => {
    const result = listMerchantMappingsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(100);
      expect(result.data.offset).toBe(0);
    }
  });

  it("rejects limit above 500", () => {
    const result = listMerchantMappingsSchema.safeParse({ limit: "600" });
    expect(result.success).toBe(false);
  });
});
