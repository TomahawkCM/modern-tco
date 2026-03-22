import { describe, it, expect } from "vitest";
import { exportJSON } from "../json-exporter";
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
    description: "PAYROLL",
    amount: 2500.0,
    isDuplicate: false,
    confidence: 1,
    currency: "USD",
    sourceFormat: "csv",
  },
];

describe("json-exporter", () => {
  it("exports transactions as JSON array", () => {
    const result = exportJSON(sampleTxns);
    const parsed = JSON.parse(result);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].description).toBe("GROCERY STORE");
    expect(parsed[0].amount).toBe(-45.99);
  });

  it("formats dates as ISO strings", () => {
    const result = exportJSON(sampleTxns);
    const parsed = JSON.parse(result);
    expect(parsed[0].date).toMatch(/^2025-01-15/);
  });

  it("includes only financial fields by default", () => {
    const result = exportJSON(sampleTxns);
    const parsed = JSON.parse(result);
    expect(parsed[0]).not.toHaveProperty("isDuplicate");
    expect(parsed[0]).not.toHaveProperty("confidence");
  });

  it("includes all fields with includeMetadata option", () => {
    const result = exportJSON(sampleTxns, { includeMetadata: true });
    const parsed = JSON.parse(result);
    expect(parsed[0]).toHaveProperty("isDuplicate");
    expect(parsed[0]).toHaveProperty("confidence");
  });

  it("pretty prints by default", () => {
    const result = exportJSON(sampleTxns);
    expect(result).toContain("\n");
  });

  it("supports compact mode", () => {
    const result = exportJSON(sampleTxns, { compact: true });
    expect(result).not.toContain("\n");
  });

  it("returns empty array for no transactions", () => {
    const result = exportJSON([]);
    expect(JSON.parse(result)).toEqual([]);
  });
});
