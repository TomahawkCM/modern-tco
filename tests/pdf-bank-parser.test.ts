/**
 * PDF Bank Parser Tests
 * Tests for intelligent table structure detection
 */

import {
  detectColumnPositions,
  parseAmountColumns,
  groupMultiLineTransactions,
} from "@/lib/parsers/pdf-bank-parser";

describe("pdf-bank-parser", () => {
  describe("detectColumnPositions", () => {
    it("should detect Home Trust format (Debit/Credit columns)", () => {
      const headers = [
        "ACCOUNT STATEMENT",
        "Date  Description  Debit  Credit  Balance",
        "01/15/2025  STARBUCKS  12.45  0.00  1500.00",
      ];

      const result = detectColumnPositions(headers);

      expect(result.mapping.dateColumn).not.toBeNull();
      expect(result.mapping.descriptionColumn).not.toBeNull();
      expect(result.mapping.debitColumn).not.toBeNull();
      expect(result.mapping.creditColumn).not.toBeNull();
      expect(result.mapping.bankFormat).toBe("home-trust");
      expect(result.mapping.confidence).toBeGreaterThan(0.7);
    });

    it("should detect BMO format (single Amount column)", () => {
      const headers = [
        "Date  Description  Amount  Balance",
        "2025-01-15  NETFLIX  -25.00  1475.00",
      ];

      const result = detectColumnPositions(headers);

      expect(result.mapping.dateColumn).not.toBeNull();
      expect(result.mapping.descriptionColumn).not.toBeNull();
      expect(result.mapping.amountColumn).not.toBeNull();
      expect(result.mapping.bankFormat).toBe("bmo");
      expect(result.mapping.confidence).toBeGreaterThan(0.7);
    });

    it("should detect TD format (Withdrawals/Deposits)", () => {
      const headers = [
        "Transaction Date  Details  Withdrawals  Deposits",
        "Jan 15  ATM WITHDRAWAL  100.00  0.00",
      ];

      const result = detectColumnPositions(headers);

      expect(result.mapping.dateColumn).not.toBeNull();
      expect(result.mapping.descriptionColumn).not.toBeNull();
      expect(result.mapping.debitColumn).not.toBeNull(); // Withdrawals → debit
      expect(result.mapping.creditColumn).not.toBeNull(); // Deposits → credit
    });

    it("should handle fuzzy OCR errors in headers", () => {
      const headers = [
        "Oate  Oescription  Arnount", // OCR errors: Date→Oate, Description→Oescription, Amount→Arnount
        "01/15/2025  GROCERY  50.00",
      ];

      const result = detectColumnPositions(headers);

      // Should still detect columns with fuzzy matching
      expect(result.mapping.dateColumn).not.toBeNull();
      expect(result.mapping.descriptionColumn).not.toBeNull();
      expect(result.mapping.amountColumn).not.toBeNull();
      // Note: Confidence may be low with heavy OCR corruption, but detection still works
      expect(result.mapping.confidence).toBeGreaterThan(0.2);
    });

    it("should provide fallback mapping when no headers detected", () => {
      const headers = ["01/15/2025  TRANSACTION  50.00", "01/16/2025  ANOTHER  25.00"];

      const result = detectColumnPositions(headers);

      expect(result.mapping.detectionMethod).toBe("fallback");
      expect(result.mapping.confidence).toBeLessThan(0.5);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it("should handle tab-separated columns", () => {
      const headers = ["Date\tDescription\tAmount", "01/15/2025\tSTARBUCKS\t-12.45"];

      const result = detectColumnPositions(headers);

      expect(result.mapping.dateColumn).toBe(0);
      expect(result.mapping.descriptionColumn).toBe(1);
      expect(result.mapping.amountColumn).toBe(2);
    });
  });

  describe("parseAmountColumns", () => {
    it("should parse amount from Debit/Credit columns", () => {
      const mapping = {
        dateColumn: 0,
        descriptionColumn: 1,
        amountColumn: null,
        debitColumn: 2,
        creditColumn: 3,
        balanceColumn: 4,
        confidence: 0.9,
        detectionMethod: "keyword" as const,
        bankFormat: "home-trust" as const,
      };

      // Debit transaction
      const debitRow = "01/15/2025  STARBUCKS  12.45  0.00  1500.00";
      const debitAmount = parseAmountColumns(debitRow, mapping);
      expect(debitAmount).toBe(-12.45); // Debits are negative

      // Credit transaction
      const creditRow = "01/16/2025  PAYCHECK  0.00  2000.00  3500.00";
      const creditAmount = parseAmountColumns(creditRow, mapping);
      expect(creditAmount).toBe(2000.0); // Credits are positive
    });

    it("should parse amount from single Amount column", () => {
      const mapping = {
        dateColumn: 0,
        descriptionColumn: 1,
        amountColumn: 2,
        debitColumn: null,
        creditColumn: null,
        balanceColumn: 3,
        confidence: 0.9,
        detectionMethod: "keyword" as const,
        bankFormat: "bmo" as const,
      };

      const row = "2025-01-15  NETFLIX  -25.00  1475.00";
      const amount = parseAmountColumns(row, mapping);
      expect(amount).toBe(-25.0);
    });

    it("should handle amounts with commas", () => {
      const mapping = {
        dateColumn: 0,
        descriptionColumn: 1,
        amountColumn: 2,
        debitColumn: null,
        creditColumn: null,
        balanceColumn: null,
        confidence: 0.9,
        detectionMethod: "keyword" as const,
      };

      const row = "01/15/2025  LARGE PURCHASE  -1,234.56";
      const amount = parseAmountColumns(row, mapping);
      expect(amount).toBe(-1234.56);
    });
  });

  describe("groupMultiLineTransactions", () => {
    it("should group multi-line descriptions into single transactions", () => {
      const rows = [
        "01/15/2025  STARBUCKS COFFEE",
        "            123 MAIN ST",
        "            NEW YORK NY",
        "01/16/2025  NETFLIX SUBSCRIPTION",
        "01/17/2025  GROCERY STORE",
        "            ORGANIC FOODS",
      ];

      const grouped = groupMultiLineTransactions(rows);

      expect(grouped.length).toBe(3);
      expect(grouped[0].length).toBe(3); // STARBUCKS + 2 address lines
      expect(grouped[1].length).toBe(1); // NETFLIX (single line)
      expect(grouped[2].length).toBe(2); // GROCERY STORE + ORGANIC FOODS
    });

    it("should handle transactions with only single lines", () => {
      const rows = [
        "01/15/2025  STARBUCKS  -12.45",
        "01/16/2025  NETFLIX  -25.00",
        "01/17/2025  PAYCHECK  2000.00",
      ];

      const grouped = groupMultiLineTransactions(rows);

      expect(grouped.length).toBe(3);
      expect(grouped[0].length).toBe(1);
      expect(grouped[1].length).toBe(1);
      expect(grouped[2].length).toBe(1);
    });

    it("should handle different date formats", () => {
      const rows = [
        "2025-01-15  TRANSACTION 1",
        "            EXTRA LINE",
        "Jan 16  TRANSACTION 2",
        "01/17/2025  TRANSACTION 3",
      ];

      const grouped = groupMultiLineTransactions(rows);

      expect(grouped.length).toBe(3);
      expect(grouped[0].length).toBe(2);
      expect(grouped[1].length).toBe(1);
      expect(grouped[2].length).toBe(1);
    });
  });
});
