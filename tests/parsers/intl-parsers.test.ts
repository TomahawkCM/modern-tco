/**
 * International Date & Amount Parser Tests
 * Tests for locale-aware date and amount parsing across formats and languages
 */

import { describe, it, expect } from "vitest";
import { parseDate } from "@/lib/parsers/intl-date-parser";
import { parseAmount, detectCurrencySymbol } from "@/lib/parsers/intl-amount-parser";

// ============================================================================
// International Date Parser
// ============================================================================

describe("International Date Parser", () => {
  describe("ISO format (YYYY-MM-DD)", () => {
    it("should parse ISO date", () => {
      const date = parseDate("2025-01-15");
      expect(date).not.toBeNull();
      expect(date!.getFullYear()).toBe(2025);
      expect(date!.getMonth()).toBe(0); // January
      expect(date!.getDate()).toBe(15);
    });

    it("should parse ISO date with slashes", () => {
      const date = parseDate("2025/01/15");
      expect(date).not.toBeNull();
      expect(date!.getFullYear()).toBe(2025);
      expect(date!.getDate()).toBe(15);
    });
  });

  describe("US format (MM/DD/YYYY)", () => {
    it("should parse US date with locale hint", () => {
      const date = parseDate("01/15/2025", "en-US");
      expect(date).not.toBeNull();
      expect(date!.getMonth()).toBe(0); // January
      expect(date!.getDate()).toBe(15);
    });
  });

  describe("European format (DD/MM/YYYY)", () => {
    it("should parse European date (DD/MM/YYYY)", () => {
      const date = parseDate("15/01/2025");
      expect(date).not.toBeNull();
      expect(date!.getDate()).toBe(15);
      expect(date!.getMonth()).toBe(0); // January
    });

    it("should parse German date (DD.MM.YYYY)", () => {
      const date = parseDate("15.01.2025");
      expect(date).not.toBeNull();
      expect(date!.getDate()).toBe(15);
      expect(date!.getMonth()).toBe(0);
    });
  });

  describe("English month names", () => {
    it('should parse "Jan 15, 2025"', () => {
      const date = parseDate("Jan 15, 2025");
      expect(date).not.toBeNull();
      expect(date!.getMonth()).toBe(0);
      expect(date!.getDate()).toBe(15);
    });

    it('should parse "15 January 2025"', () => {
      const date = parseDate("15 January 2025");
      expect(date).not.toBeNull();
      expect(date!.getMonth()).toBe(0);
      expect(date!.getDate()).toBe(15);
    });

    it('should parse "February 28, 2025"', () => {
      const date = parseDate("February 28, 2025");
      expect(date).not.toBeNull();
      expect(date!.getMonth()).toBe(1);
      expect(date!.getDate()).toBe(28);
    });
  });

  describe("German dates", () => {
    it('should parse "15. Januar 2025"', () => {
      const date = parseDate("15. Januar 2025");
      expect(date).not.toBeNull();
      expect(date!.getDate()).toBe(15);
      expect(date!.getMonth()).toBe(0);
    });

    it('should parse "15. Mär. 2025"', () => {
      const date = parseDate("15. Mär. 2025");
      expect(date).not.toBeNull();
      expect(date!.getMonth()).toBe(2); // March
    });
  });

  describe("French dates", () => {
    it('should parse "15 février 2025"', () => {
      const date = parseDate("15 février 2025");
      expect(date).not.toBeNull();
      expect(date!.getMonth()).toBe(1);
    });
  });

  describe("Spanish dates", () => {
    it('should parse "15 de enero de 2025"', () => {
      const date = parseDate("15 de enero de 2025");
      expect(date).not.toBeNull();
      expect(date!.getMonth()).toBe(0);
      expect(date!.getDate()).toBe(15);
    });
  });

  describe("CJK dates", () => {
    it('should parse Japanese date "2025年1月15日"', () => {
      const date = parseDate("2025年1月15日");
      expect(date).not.toBeNull();
      expect(date!.getFullYear()).toBe(2025);
      expect(date!.getMonth()).toBe(0);
      expect(date!.getDate()).toBe(15);
    });

    it('should parse Korean date "2025년 1월 15일"', () => {
      const date = parseDate("2025년 1월 15일");
      expect(date).not.toBeNull();
      expect(date!.getFullYear()).toBe(2025);
      expect(date!.getMonth()).toBe(0);
      expect(date!.getDate()).toBe(15);
    });
  });

  describe("Two-digit year", () => {
    it("should parse DD/MM/YY with year < 50 as 20XX", () => {
      const date = parseDate("15/01/25");
      expect(date).not.toBeNull();
      expect(date!.getFullYear()).toBe(2025);
    });
  });

  describe("Edge cases", () => {
    it("should return null for empty string", () => {
      expect(parseDate("")).toBeNull();
    });

    it("should return null for null input", () => {
      expect(parseDate(null as any)).toBeNull();
    });

    it("should return null for garbage input", () => {
      expect(parseDate("not a date at all")).toBeNull();
    });

    it("should return null for non-string input", () => {
      expect(parseDate(12345 as any)).toBeNull();
    });
  });
});

// ============================================================================
// International Amount Parser
// ============================================================================

describe("International Amount Parser", () => {
  describe("US format (1,234.56)", () => {
    it("should parse simple amount", () => {
      expect(parseAmount("1234.56")).toBe(1234.56);
    });

    it("should parse with thousands separator", () => {
      expect(parseAmount("1,234.56")).toBe(1234.56);
    });

    it("should parse large amounts", () => {
      expect(parseAmount("1,234,567.89")).toBe(1234567.89);
    });

    it("should parse with dollar sign", () => {
      expect(parseAmount("$1,234.56")).toBe(1234.56);
    });
  });

  describe("European format (1.234,56)", () => {
    it("should parse with comma decimal", () => {
      expect(parseAmount("1234,56")).toBe(1234.56);
    });

    it("should parse EU thousands separator", () => {
      expect(parseAmount("1.234,56")).toBe(1234.56);
    });

    it("should parse with euro symbol", () => {
      expect(parseAmount("€1.234,56")).toBe(1234.56);
    });

    it("should parse large EU amount", () => {
      expect(parseAmount("1.234.567,89")).toBe(1234567.89);
    });
  });

  describe("French format (1 234,56)", () => {
    it("should parse with space thousands separator", () => {
      expect(parseAmount("1 234,56")).toBe(1234.56);
    });
  });

  describe("Swiss format (1'234.56)", () => {
    it("should parse with apostrophe thousands separator", () => {
      expect(parseAmount("1'234.56")).toBe(1234.56);
    });
  });

  describe("Negative amounts", () => {
    it("should parse leading minus", () => {
      expect(parseAmount("-1234.56")).toBe(-1234.56);
    });

    it("should parse parentheses notation", () => {
      expect(parseAmount("(1234.56)")).toBe(-1234.56);
    });

    it("should parse trailing minus", () => {
      expect(parseAmount("1234.56-")).toBe(-1234.56);
    });

    it("should parse with minus and currency", () => {
      expect(parseAmount("-$1,234.56")).toBe(-1234.56);
    });

    it("should handle DR suffix (bank debit)", () => {
      expect(parseAmount("1234.56 DR")).toBe(-1234.56);
    });

    it("should handle CR suffix (bank credit)", () => {
      expect(parseAmount("1234.56 CR")).toBe(1234.56);
    });
  });

  describe("Locale-aware parsing", () => {
    it("should parse with en-US locale", () => {
      expect(parseAmount("1,234.56", "en-US")).toBe(1234.56);
    });

    it("should parse with de-DE locale", () => {
      expect(parseAmount("1.234,56", "de-DE")).toBe(1234.56);
    });
  });

  describe("Edge cases", () => {
    it("should return null for empty string", () => {
      expect(parseAmount("")).toBeNull();
    });

    it("should return null for null input", () => {
      expect(parseAmount(null as any)).toBeNull();
    });

    it("should parse integer amounts", () => {
      expect(parseAmount("1234")).toBe(1234);
    });

    it("should parse zero", () => {
      expect(parseAmount("0")).toBe(0);
      expect(parseAmount("0.00")).toBe(0);
    });

    it("should handle currency symbol only", () => {
      expect(parseAmount("$")).toBeNull();
    });
  });

  describe("detectCurrencySymbol", () => {
    it("should detect dollar sign", () => {
      expect(detectCurrencySymbol("$1,234.56")).toBe("USD");
    });

    it("should detect euro sign", () => {
      expect(detectCurrencySymbol("€1.234,56")).toBe("EUR");
    });

    it("should detect pound sign", () => {
      expect(detectCurrencySymbol("£500.00")).toBe("GBP");
    });

    it("should detect yen sign", () => {
      expect(detectCurrencySymbol("¥10000")).toBe("JPY");
    });

    it("should detect ISO currency code", () => {
      expect(detectCurrencySymbol("CHF 1234.56")).toBe("CHF");
    });

    it("should detect CAD prefix", () => {
      expect(detectCurrencySymbol("CA$1,234.56")).toBe("CAD");
    });

    it("should detect Brazilian Real", () => {
      expect(detectCurrencySymbol("R$1.234,56")).toBe("BRL");
    });

    it("should return null for no currency", () => {
      expect(detectCurrencySymbol("1234.56")).toBeNull();
    });

    it("should return null for empty string", () => {
      expect(detectCurrencySymbol("")).toBeNull();
    });
  });
});
