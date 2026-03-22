import { describe, it, expect } from "vitest";
import { exportOFX } from "../ofx-exporter";
import type { ParsedTransaction } from "../../types";

const sampleTxns: ParsedTransaction[] = [
  {
    date: new Date("2025-01-15"),
    description: "GROCERY STORE",
    amount: -45.99,
    isDuplicate: false,
    confidence: 1,
    currency: "USD",
    fitid: "202501150001",
    transactionType: "DEBIT",
    sourceFormat: "csv",
  },
];

describe("ofx-exporter", () => {
  it("produces valid XML with OFX header", () => {
    const result = exportOFX(sampleTxns);
    expect(result).toContain("<?xml");
    expect(result).toContain("<OFX>");
    expect(result).toContain("</OFX>");
  });

  it("wraps transactions in STMTRS", () => {
    const result = exportOFX(sampleTxns);
    expect(result).toContain("<STMTRS>");
    expect(result).toContain("<BANKTRANLIST>");
  });

  it("formats dates as YYYYMMDD", () => {
    const result = exportOFX(sampleTxns);
    expect(result).toContain("<DTPOSTED>20250115");
  });

  it("includes TRNAMT", () => {
    const result = exportOFX(sampleTxns);
    expect(result).toContain("<TRNAMT>-45.99");
  });

  it("includes FITID", () => {
    const result = exportOFX(sampleTxns);
    expect(result).toContain("<FITID>202501150001");
  });

  it("generates FITID when not present", () => {
    const txns: ParsedTransaction[] = [{ ...sampleTxns[0], fitid: undefined }];
    const result = exportOFX(txns);
    expect(result).toMatch(/<FITID>[^<]+/);
  });

  it("uses custom currency", () => {
    const result = exportOFX(sampleTxns, { currency: "CAD" });
    expect(result).toContain("<CURDEF>CAD");
  });

  it("handles empty transactions", () => {
    const result = exportOFX([]);
    expect(result).toContain("<BANKTRANLIST>");
    expect(result).toContain("</BANKTRANLIST>");
  });

  it("escapes XML special characters in descriptions", () => {
    const txns: ParsedTransaction[] = [{ ...sampleTxns[0], description: 'STORE & "CAFE" <TEST>' }];
    const result = exportOFX(txns);
    expect(result).toContain("&amp;");
    expect(result).toContain("&lt;");
    expect(result).toContain("&gt;");
  });
});
