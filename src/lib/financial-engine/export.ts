/**
 * Calculator Export Engine
 *
 * CSV and JSON export for calculator results.
 * All functions are pure and work client-side only.
 */

// ============================================================================
// Types
// ============================================================================

export interface ExportColumn {
  key: string;
  label: string;
}

export interface ExportOptions {
  filename: string;
  columns: ExportColumn[];
  rows: Record<string, unknown>[];
}

// ============================================================================
// CSV Export
// ============================================================================

/**
 * Convert rows to CSV string.
 * Handles quoting for values containing commas, quotes, or newlines.
 */
export function toCSV(columns: ExportColumn[], rows: Record<string, unknown>[]): string {
  const header = columns.map((c) => escapeCSV(c.label)).join(",");

  const dataRows = rows.map((row) =>
    columns.map((col) => escapeCSV(formatValue(row[col.key]))).join(",")
  );

  return [header, ...dataRows].join("\n");
}

/**
 * Escape a value for CSV (RFC 4180 compliant).
 */
function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Format a value for CSV output.
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return value.toString();
  if (value instanceof Date) return value.toISOString().split("T")[0];
  return String(value);
}

// ============================================================================
// JSON Export
// ============================================================================

/**
 * Convert rows to formatted JSON string.
 */
export function toJSON(columns: ExportColumn[], rows: Record<string, unknown>[]): string {
  const mapped = rows.map((row) => {
    const obj: Record<string, unknown> = {};
    for (const col of columns) {
      obj[col.label] = row[col.key];
    }
    return obj;
  });
  return JSON.stringify(mapped, null, 2);
}

// ============================================================================
// Download Helpers
// ============================================================================

/**
 * Trigger a file download in the browser.
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  if (typeof window === "undefined") return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data as CSV and trigger download.
 */
export function exportCSV(options: ExportOptions): void {
  const csv = toCSV(options.columns, options.rows);
  downloadFile(csv, `${options.filename}.csv`, "text/csv;charset=utf-8;");
}

/**
 * Export data as JSON and trigger download.
 */
export function exportJSON(options: ExportOptions): void {
  const json = toJSON(options.columns, options.rows);
  downloadFile(json, `${options.filename}.json`, "application/json;charset=utf-8;");
}

// ============================================================================
// Pre-built Column Definitions
// ============================================================================

export const COMPOUND_INTEREST_COLUMNS: ExportColumn[] = [
  { key: "period", label: "Year" },
  { key: "balance", label: "Balance" },
  { key: "contributions", label: "Total Contributions" },
  { key: "interest", label: "Total Interest" },
];

export const AMORTIZATION_COLUMNS: ExportColumn[] = [
  { key: "month", label: "Month" },
  { key: "payment", label: "Payment" },
  { key: "principal", label: "Principal" },
  { key: "interest", label: "Interest" },
  { key: "extraPayment", label: "Extra Payment" },
  { key: "balance", label: "Balance" },
  { key: "cumulativeInterest", label: "Cumulative Interest" },
  { key: "cumulativePrincipal", label: "Cumulative Principal" },
];

export const RETIREMENT_COLUMNS: ExportColumn[] = [
  { key: "age", label: "Age" },
  { key: "year", label: "Year" },
  { key: "balance", label: "Balance" },
  { key: "phase", label: "Phase" },
  { key: "contributions", label: "Contributions" },
  { key: "growth", label: "Growth" },
  { key: "withdrawals", label: "Withdrawals" },
  { key: "socialSecurity", label: "Social Security" },
];

export const INFLATION_COLUMNS: ExportColumn[] = [
  { key: "year", label: "Year" },
  { key: "nominalValue", label: "Nominal Value" },
  { key: "realValue", label: "Real Value (Purchasing Power)" },
];
