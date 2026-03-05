import { describe, it, expect } from "vitest";
import { parseAmount, detectCurrencySymbol } from "../intl-amount-parser";

describe("intl-amount-parser", () => {
  describe("parseAmount", () => {
    it("parses US format ($1,234.56)", () => {
      expect(parseAmount("$1,234.56")).toBe(1234.56);
    });

    it("parses EU format (1.234,56)", () => {
      expect(parseAmount("1.234,56", "de-DE")).toBe(1234.56);
    });

    it("parses EU format with euro sign (1.234,56 €)", () => {
      const result = parseAmount("1.234,56 €", "de-DE");
      expect(result).toBe(1234.56);
    });

    it("parses French format with spaces (1 234,56)", () => {
      expect(parseAmount("1 234,56", "fr-FR")).toBe(1234.56);
    });

    it("parses Indian format (1,23,456.78)", () => {
      expect(parseAmount("₹1,23,456.78", "en-IN")).toBe(123456.78);
    });

    it("parses Japanese yen without decimals (¥1,234)", () => {
      expect(parseAmount("¥1,234", "ja-JP")).toBe(1234);
    });

    it("parses Brazilian real (R$ 1.234,56)", () => {
      expect(parseAmount("R$ 1.234,56", "pt-BR")).toBe(1234.56);
    });

    it("parses negative with parentheses ((1,234.56))", () => {
      expect(parseAmount("(1,234.56)")).toBe(-1234.56);
    });

    it("parses negative with minus (-1,234.56)", () => {
      expect(parseAmount("-1,234.56")).toBe(-1234.56);
    });

    it("parses simple integer", () => {
      expect(parseAmount("42")).toBe(42);
    });

    it("returns null for non-numeric strings", () => {
      expect(parseAmount("hello")).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(parseAmount("")).toBeNull();
    });
  });

  describe("detectCurrencySymbol", () => {
    it("detects dollar sign as USD", () => {
      expect(detectCurrencySymbol("$100.00")).toBe("USD");
    });

    it("detects euro sign as EUR", () => {
      expect(detectCurrencySymbol("100,00 €")).toBe("EUR");
    });

    it("detects pound sign as GBP", () => {
      expect(detectCurrencySymbol("£50.00")).toBe("GBP");
    });

    it("detects rupee sign as INR", () => {
      expect(detectCurrencySymbol("₹1,000")).toBe("INR");
    });

    it("returns null when no symbol", () => {
      expect(detectCurrencySymbol("1234.56")).toBeNull();
    });
  });
});
