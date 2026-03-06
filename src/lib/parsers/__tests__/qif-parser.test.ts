import { describe, it, expect } from "vitest";
import { parseQIFFile, isQIFContent, getQIFAccountType } from "../qif-parser";

const SAMPLE_QIF = `!Type:Bank
D01/15/2025
T-45.99
PGrocery Store
MMilk and bread
C*
^
D01/20/2025
T100.00
PPayroll
MSalary deposit
^
`;

describe("qif-parser", () => {
  describe("parseQIFFile", () => {
    it("parses multiple transactions", () => {
      const result = parseQIFFile(SAMPLE_QIF);
      expect(result).toHaveLength(2);
    });

    it("parses date correctly", () => {
      const result = parseQIFFile(SAMPLE_QIF);
      expect(result[0].date.getFullYear()).toBe(2025);
      expect(result[0].date.getMonth()).toBe(0); // January
      expect(result[0].date.getDate()).toBe(15);
    });

    it("parses negative amount (expense)", () => {
      const result = parseQIFFile(SAMPLE_QIF);
      expect(result[0].amount).toBe(-45.99);
    });

    it("parses positive amount (income)", () => {
      const result = parseQIFFile(SAMPLE_QIF);
      expect(result[1].amount).toBe(100);
    });

    it("combines payee and memo in description", () => {
      const result = parseQIFFile(SAMPLE_QIF);
      expect(result[0].description).toBe("Grocery Store - Milk and bread");
    });

    it("sets sourceFormat to qif", () => {
      const result = parseQIFFile(SAMPLE_QIF);
      expect(result[0].sourceFormat).toBe("qif");
    });

    it("sets high confidence for complete records", () => {
      const result = parseQIFFile(SAMPLE_QIF);
      expect(result[0].confidence).toBe(0.9);
    });

    it("handles file without trailing ^", () => {
      const content = `!Type:Bank\nD01/15/2025\nT-10.00\nPStore`;
      const result = parseQIFFile(content);
      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(-10);
    });

    it("handles payee-only description (no memo)", () => {
      const content = `!Type:Bank\nD01/15/2025\nT-5.00\nPCoffee Shop\n^`;
      const result = parseQIFFile(content);
      expect(result[0].description).toBe("Coffee Shop");
    });

    it("returns empty array for empty content", () => {
      const result = parseQIFFile("");
      expect(result).toHaveLength(0);
    });
  });

  describe("isQIFContent", () => {
    it("detects QIF content", () => {
      expect(isQIFContent("!Type:Bank\nD01/15/2025")).toBe(true);
    });

    it("rejects non-QIF content", () => {
      expect(isQIFContent("Date,Amount,Description")).toBe(false);
    });
  });

  describe("getQIFAccountType", () => {
    it("extracts Bank type", () => {
      expect(getQIFAccountType("!Type:Bank\n")).toBe("Bank");
    });

    it("extracts CCard type", () => {
      expect(getQIFAccountType("!Type:CCard\n")).toBe("CCard");
    });

    it("returns null for non-QIF", () => {
      expect(getQIFAccountType("no type here")).toBeNull();
    });
  });
});
