/**
 * StatementKit Format Exporters
 *
 * Unified API for converting ParsedTransaction[] to any supported format.
 * Each exporter is a pure function: transactions in, formatted string out.
 */

import type { ParsedTransaction } from "../types";
import { exportJSON, type JSONExportOptions } from "./json-exporter";
import { exportCSV, type CSVExportOptions } from "./csv-exporter";
import { exportQIF, type QIFExportOptions } from "./qif-exporter";
import { exportOFX, type OFXExportOptions } from "./ofx-exporter";

export type ExportFormat = "json" | "csv" | "qif" | "ofx";

/**
 * Export transactions to any supported format.
 *
 * @param transactions - Parsed transactions to export
 * @param format - Target format: "json", "csv", "qif", or "ofx"
 * @param options - Format-specific options (see individual exporter types)
 * @returns Formatted string ready to write to file
 *
 * @example
 * const csv = exportTransactions(txns, "csv", { delimiter: ";" });
 * const ofx = exportTransactions(txns, "ofx", { currency: "CAD" });
 */
export function exportTransactions(
  transactions: ParsedTransaction[],
  format: ExportFormat,
  options?: Record<string, unknown>
): string {
  switch (format) {
    case "json":
      return exportJSON(transactions, options as JSONExportOptions);
    case "csv":
      return exportCSV(transactions, options as CSVExportOptions);
    case "qif":
      return exportQIF(transactions, options as QIFExportOptions);
    case "ofx":
      return exportOFX(transactions, options as OFXExportOptions);
    default:
      throw new Error(
        `Unsupported export format: ${format}. Supported: ${getSupportedExportFormats().join(", ")}`
      );
  }
}

/**
 * Get list of supported export formats.
 */
export function getSupportedExportFormats(): ExportFormat[] {
  return ["json", "csv", "qif", "ofx"];
}

export { exportJSON, exportCSV, exportQIF, exportOFX };
export type { JSONExportOptions, CSVExportOptions, QIFExportOptions, OFXExportOptions };
