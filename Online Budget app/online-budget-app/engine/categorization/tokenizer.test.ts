import { describe, it, expect } from "vitest";
import { extractMerchantToken } from "./tokenizer";

describe("extractMerchantToken", () => {
  it("extracts and uppercases simple merchant name", () => {
    expect(extractMerchantToken("Whole Foods Market")).toBe(
      "WHOLE FOODS MARKET"
    );
  });

  it("strips trailing reference numbers", () => {
    expect(extractMerchantToken("NETFLIX.COM  #123456")).toBe("NETFLIX.COM");
  });

  it("strips trailing location codes", () => {
    expect(extractMerchantToken("STARBUCKS  TORONTO ON")).toBe("STARBUCKS");
  });

  it("strips date patterns", () => {
    expect(extractMerchantToken("UBER EATS 15FEB2026")).toBe("UBER EATS");
  });

  it("returns null for generic descriptions", () => {
    expect(extractMerchantToken("PAYMENT RECEIVED")).toBeNull();
    expect(extractMerchantToken("TRANSFER")).toBeNull();
    expect(extractMerchantToken("DEPOSIT")).toBeNull();
  });

  it("returns null for empty or too-short input", () => {
    expect(extractMerchantToken("")).toBeNull();
    expect(extractMerchantToken("AB")).toBeNull();
  });

  it("returns null for all-numeric tokens", () => {
    expect(extractMerchantToken("123456789")).toBeNull();
  });

  it("trims whitespace", () => {
    expect(extractMerchantToken("  COSTCO  ")).toBe("COSTCO");
  });
});
