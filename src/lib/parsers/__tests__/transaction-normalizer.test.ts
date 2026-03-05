import { describe, it, expect } from "vitest";
import {
  normalizeTransaction,
  normalizeTransactions,
  parseRawTransaction,
} from "../transaction-normalizer";
import type { ParsedTransaction } from "@/types/budget";

function makeTx(overrides: Partial<ParsedTransaction> = {}): ParsedTransaction {
  return {
    date: new Date("2025-06-15"),
    description: "GROCERY STORE",
    amount: -45.99,
    isDuplicate: false,
    confidence: 0.9,
    ...overrides,
  };
}

describe("transaction-normalizer", () => {
  describe("normalizeTransaction", () => {
    it("passes through valid transactions", () => {
      const tx = makeTx();
      const result = normalizeTransaction(tx);
      expect(result.description).toBe("GROCERY STORE");
      expect(result.amount).toBe(-45.99);
    });

    it("trims and collapses whitespace in descriptions", () => {
      const tx = makeTx({ description: "  GROCERY   STORE  " });
      const result = normalizeTransaction(tx);
      expect(result.description).toBe("GROCERY STORE");
    });

    it("removes control characters from descriptions", () => {
      const tx = makeTx({ description: "STORE\x00\x01NAME" });
      const result = normalizeTransaction(tx);
      expect(result.description).toBe("STORE NAME");
    });

    it("replaces empty description with default", () => {
      const tx = makeTx({ description: "" });
      const result = normalizeTransaction(tx);
      expect(result.description).toBe("Unknown Transaction");
    });

    it("replaces very short description with default", () => {
      const tx = makeTx({ description: "X" });
      const result = normalizeTransaction(tx);
      expect(result.description).toBe("Unknown Transaction");
    });

    it("sets defaultCurrency when transaction has no currency", () => {
      const tx = makeTx({ currency: undefined });
      const result = normalizeTransaction(tx, { defaultCurrency: "EUR" });
      expect(result.currency).toBe("EUR");
    });

    it("preserves existing currency over default", () => {
      const tx = makeTx({ currency: "CAD" });
      const result = normalizeTransaction(tx, { defaultCurrency: "USD" });
      expect(result.currency).toBe("CAD");
    });

    it("marks requiresReview when amount is 0", () => {
      const tx = makeTx({ amount: 0 });
      const result = normalizeTransaction(tx);
      expect(result.requiresReview).toBe(true);
    });

    it("marks requiresReview when date is invalid", () => {
      const tx = makeTx({ date: new Date("invalid") });
      const result = normalizeTransaction(tx);
      expect(result.requiresReview).toBe(true);
    });

    it("strips leading/trailing punctuation from description", () => {
      const tx = makeTx({ description: "...GROCERY STORE---" });
      const result = normalizeTransaction(tx);
      expect(result.description).toBe("GROCERY STORE");
    });
  });

  describe("normalizeTransactions", () => {
    it("sorts transactions by date", () => {
      const txs = [
        makeTx({ date: new Date("2025-06-15"), description: "Store B" }),
        makeTx({ date: new Date("2025-06-10"), description: "Store A" }),
        makeTx({ date: new Date("2025-06-20"), description: "Store C" }),
      ];
      const result = normalizeTransactions(txs);
      expect(result[0].description).toBe("Store A");
      expect(result[1].description).toBe("Store B");
      expect(result[2].description).toBe("Store C");
    });

    it("detects most common currency across transactions", () => {
      const txs = [
        makeTx({ currency: "EUR" }),
        makeTx({ currency: "EUR" }),
        makeTx({ currency: undefined }),
      ];
      const result = normalizeTransactions(txs);
      expect(result[2].currency).toBe("EUR");
    });

    it("uses defaultCurrency option over detection", () => {
      const txs = [makeTx({ currency: undefined }), makeTx({ currency: undefined })];
      const result = normalizeTransactions(txs, { defaultCurrency: "GBP" });
      expect(result[0].currency).toBe("GBP");
    });
  });

  describe("parseRawTransaction", () => {
    it("parses raw strings into a transaction", () => {
      const result = parseRawTransaction("2025-06-15", "GROCERY STORE", "$45.99");
      expect(result).not.toBeNull();
      expect(result!.amount).toBe(45.99);
      expect(result!.description).toBe("GROCERY STORE");
    });

    it("parses EU amount format", () => {
      const result = parseRawTransaction("15.06.2025", "SUPERMARKT", "45,99", { locale: "de-DE" });
      expect(result).not.toBeNull();
      expect(result!.amount).toBe(45.99);
    });

    it("returns null when both date and amount fail", () => {
      const result = parseRawTransaction("not-a-date", "DESC", "not-an-amount");
      expect(result).toBeNull();
    });

    it("marks requiresReview when date fails but amount succeeds", () => {
      const result = parseRawTransaction("not-a-date", "DESC", "$10.00");
      expect(result).not.toBeNull();
      expect(result!.requiresReview).toBe(true);
    });

    it("detects currency from amount string", () => {
      const result = parseRawTransaction("2025-01-15", "STORE", "€25.00");
      expect(result).not.toBeNull();
      expect(result!.currency).toBe("EUR");
    });
  });
});
