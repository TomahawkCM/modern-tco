import { describe, it, expect } from "vitest";
import { exportTransactions, getSupportedExportFormats } from "../index";
import type { ParsedTransaction } from "../../types";

const sampleTxns: ParsedTransaction[] = [
  {
    date: new Date("2025-01-15"),
    description: "GROCERY STORE",
    amount: -45.99,
    isDuplicate: false,
    confidence: 1,
    currency: "USD",
    sourceFormat: "csv",
  },
];

describe("exportTransactions", () => {
  it("exports to JSON", () => {
    const result = exportTransactions(sampleTxns, "json");
    const parsed = JSON.parse(result);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].amount).toBe(-45.99);
  });

  it("exports to CSV", () => {
    const result = exportTransactions(sampleTxns, "csv");
    expect(result).toContain("Date,Description,Amount");
    expect(result).toContain("GROCERY STORE");
  });

  it("exports to QIF", () => {
    const result = exportTransactions(sampleTxns, "qif");
    expect(result).toContain("!Type:Bank");
    expect(result).toContain("T-45.99");
  });

  it("exports to OFX", () => {
    const result = exportTransactions(sampleTxns, "ofx");
    expect(result).toContain("<OFX>");
    expect(result).toContain("<TRNAMT>-45.99");
  });

  it("throws on unsupported format", () => {
    expect(() => exportTransactions(sampleTxns, "xlsx" as any)).toThrow(
      "Unsupported export format"
    );
  });

  it("passes options through to format-specific exporter", () => {
    const result = exportTransactions(sampleTxns, "json", { compact: true });
    expect(result).not.toContain("\n");
  });
});

describe("getSupportedExportFormats", () => {
  it("returns all supported formats", () => {
    const formats = getSupportedExportFormats();
    expect(formats).toContain("json");
    expect(formats).toContain("csv");
    expect(formats).toContain("qif");
    expect(formats).toContain("ofx");
    expect(formats).toHaveLength(4);
  });
});
