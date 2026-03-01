/**
 * Export Engine Tests
 *
 * Tests for CSV and JSON export utilities.
 */

import { describe, it, expect } from "vitest";
import {
  toCSV,
  toJSON,
  COMPOUND_INTEREST_COLUMNS,
  AMORTIZATION_COLUMNS,
  RETIREMENT_COLUMNS,
  INFLATION_COLUMNS,
} from "@/lib/financial-engine/export";
import type { ExportColumn } from "@/lib/financial-engine/export";

const columns: ExportColumn[] = [
  { key: "year", label: "Year" },
  { key: "balance", label: "Balance" },
  { key: "interest", label: "Interest" },
];

const rows = [
  { year: 0, balance: 10000, interest: 0 },
  { year: 1, balance: 10700, interest: 700 },
  { year: 2, balance: 11449, interest: 1449 },
];

// ============================================================================
// CSV Export
// ============================================================================

describe("toCSV", () => {
  it("should create CSV header from column labels", () => {
    const csv = toCSV(columns, []);
    expect(csv).toBe("Year,Balance,Interest");
  });

  it("should create CSV rows from data", () => {
    const csv = toCSV(columns, rows);
    const lines = csv.split("\n");

    expect(lines).toHaveLength(4); // header + 3 rows
    expect(lines[0]).toBe("Year,Balance,Interest");
    expect(lines[1]).toBe("0,10000,0");
    expect(lines[2]).toBe("1,10700,700");
  });

  it("should escape values with commas", () => {
    const cols: ExportColumn[] = [{ key: "name", label: "Name" }];
    const data = [{ name: "Smith, John" }];

    const csv = toCSV(cols, data);
    expect(csv).toContain('"Smith, John"');
  });

  it("should escape values with quotes", () => {
    const cols: ExportColumn[] = [{ key: "name", label: "Name" }];
    const data = [{ name: 'He said "hello"' }];

    const csv = toCSV(cols, data);
    expect(csv).toContain('"He said ""hello"""');
  });

  it("should handle null and undefined values", () => {
    const cols: ExportColumn[] = [
      { key: "a", label: "A" },
      { key: "b", label: "B" },
    ];
    const data = [{ a: null, b: undefined }];

    const csv = toCSV(cols, data);
    expect(csv).toBe("A,B\n,");
  });

  it("should handle Date values", () => {
    const cols: ExportColumn[] = [{ key: "date", label: "Date" }];
    const data = [{ date: new Date("2024-06-15T00:00:00Z") }];

    const csv = toCSV(cols, data);
    expect(csv).toContain("2024-06-15");
  });
});

// ============================================================================
// JSON Export
// ============================================================================

describe("toJSON", () => {
  it("should create formatted JSON with column labels as keys", () => {
    const json = toJSON(columns, rows);
    const parsed = JSON.parse(json);

    expect(parsed).toHaveLength(3);
    expect(parsed[0]).toEqual({ Year: 0, Balance: 10000, Interest: 0 });
    expect(parsed[1]).toEqual({ Year: 1, Balance: 10700, Interest: 700 });
  });

  it("should handle empty rows", () => {
    const json = toJSON(columns, []);
    const parsed = JSON.parse(json);
    expect(parsed).toEqual([]);
  });

  it("should produce valid JSON", () => {
    const json = toJSON(columns, rows);
    expect(() => JSON.parse(json)).not.toThrow();
  });
});

// ============================================================================
// Pre-built Column Definitions
// ============================================================================

describe("Pre-built columns", () => {
  it("should have compound interest columns", () => {
    expect(COMPOUND_INTEREST_COLUMNS.length).toBe(4);
    expect(COMPOUND_INTEREST_COLUMNS.map((c) => c.key)).toEqual([
      "period",
      "balance",
      "contributions",
      "interest",
    ]);
  });

  it("should have amortization columns", () => {
    expect(AMORTIZATION_COLUMNS.length).toBe(8);
    expect(AMORTIZATION_COLUMNS.map((c) => c.key)).toContain("month");
    expect(AMORTIZATION_COLUMNS.map((c) => c.key)).toContain("balance");
  });

  it("should have retirement columns", () => {
    expect(RETIREMENT_COLUMNS.length).toBe(8);
    expect(RETIREMENT_COLUMNS.map((c) => c.key)).toContain("age");
    expect(RETIREMENT_COLUMNS.map((c) => c.key)).toContain("phase");
  });

  it("should have inflation columns", () => {
    expect(INFLATION_COLUMNS.length).toBe(3);
    expect(INFLATION_COLUMNS.map((c) => c.key)).toContain("realValue");
  });
});
