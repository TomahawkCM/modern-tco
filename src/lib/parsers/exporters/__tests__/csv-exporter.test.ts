import { describe, it, expect } from "vitest";
import { exportCSV } from "../csv-exporter";
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
  {
    date: new Date("2025-01-16"),
    description: 'CAFE "CENTRAL"',
    amount: -12.5,
    isDuplicate: false,
    confidence: 1,
    sourceFormat: "csv",
  },
];

describe("csv-exporter", () => {
  it("exports with header row", () => {
    const result = exportCSV(sampleTxns);
    const lines = result.split("\n");
    expect(lines[0]).toBe("Date,Description,Amount,Currency");
  });

  it("formats dates as YYYY-MM-DD", () => {
    const result = exportCSV(sampleTxns);
    expect(result).toContain("2025-01-15");
  });

  it("escapes descriptions containing quotes", () => {
    const result = exportCSV(sampleTxns);
    expect(result).toContain('"CAFE ""CENTRAL"""');
  });

  it("uses custom delimiter", () => {
    const result = exportCSV(sampleTxns, { delimiter: ";" });
    const lines = result.split("\n");
    expect(lines[0]).toBe("Date;Description;Amount;Currency");
  });

  it("includes optional columns when present", () => {
    const txns: ParsedTransaction[] = [
      {
        date: new Date("2025-01-15"),
        description: "CHECK",
        amount: -100,
        isDuplicate: false,
        confidence: 1,
        checkNum: "1234",
        transactionType: "CHECK",
        sourceFormat: "ofx",
      },
    ];
    const result = exportCSV(txns);
    expect(result).toContain("Type");
    expect(result).toContain("CheckNum");
  });

  it("returns header only for empty transactions", () => {
    const result = exportCSV([]);
    const lines = result.split("\n").filter((l) => l.length > 0);
    expect(lines).toHaveLength(1);
  });

  it("formats US dates when requested", () => {
    const result = exportCSV(sampleTxns, { dateFormat: "us" });
    expect(result).toContain("01/15/2025");
  });

  it("formats EU dates when requested", () => {
    const result = exportCSV(sampleTxns, { dateFormat: "eu" });
    expect(result).toContain("15/01/2025");
  });
});
