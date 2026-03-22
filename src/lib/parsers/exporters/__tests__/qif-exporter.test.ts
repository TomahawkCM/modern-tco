import { describe, it, expect } from "vitest";
import { exportQIF } from "../qif-exporter";
import type { ParsedTransaction } from "../../types";

const sampleTxns: ParsedTransaction[] = [
  {
    date: new Date("2025-01-15"),
    description: "GROCERY STORE",
    amount: -45.99,
    isDuplicate: false,
    confidence: 1,
    checkNum: "1001",
    sourceFormat: "csv",
  },
];

describe("qif-exporter", () => {
  it("starts with account type header", () => {
    const result = exportQIF(sampleTxns);
    expect(result.startsWith("!Type:Bank")).toBe(true);
  });

  it("exports D (date) in MM/DD/YYYY format", () => {
    const result = exportQIF(sampleTxns);
    expect(result).toContain("D01/15/2025");
  });

  it("exports T (amount)", () => {
    const result = exportQIF(sampleTxns);
    expect(result).toContain("T-45.99");
  });

  it("exports P (payee)", () => {
    const result = exportQIF(sampleTxns);
    expect(result).toContain("PGROCERY STORE");
  });

  it("exports N (check number) when present", () => {
    const result = exportQIF(sampleTxns);
    expect(result).toContain("N1001");
  });

  it("ends each record with ^", () => {
    const result = exportQIF(sampleTxns);
    expect(result.trim().endsWith("^")).toBe(true);
  });

  it("supports credit card account type", () => {
    const result = exportQIF(sampleTxns, { accountType: "CCard" });
    expect(result.startsWith("!Type:CCard")).toBe(true);
  });

  it("returns header only for empty transactions", () => {
    const result = exportQIF([]);
    expect(result.trim()).toBe("!Type:Bank");
  });
});
