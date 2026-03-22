import type { ParsedTransaction } from "../types";

export interface CSVExportOptions {
  delimiter?: string;
  dateFormat?: "iso" | "us" | "eu";
}

function escapeCSV(value: string, delimiter: string): string {
  if (value.includes(delimiter) || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatDate(date: Date, fmt: string): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  switch (fmt) {
    case "us":
      return `${m}/${d}/${y}`;
    case "eu":
      return `${d}/${m}/${y}`;
    default:
      return `${y}-${m}-${d}`;
  }
}

export function exportCSV(
  transactions: ParsedTransaction[],
  options: CSVExportOptions = {}
): string {
  const { delimiter = ",", dateFormat = "iso" } = options;

  const hasType = transactions.some((tx) => tx.transactionType);
  const hasCheckNum = transactions.some((tx) => tx.checkNum);
  const hasBalance = transactions.some((tx) => tx.balance !== undefined);

  const headers = ["Date", "Description", "Amount", "Currency"];
  if (hasType) headers.push("Type");
  if (hasCheckNum) headers.push("CheckNum");
  if (hasBalance) headers.push("Balance");

  const lines = [headers.join(delimiter)];

  for (const tx of transactions) {
    const row = [
      formatDate(tx.date, dateFormat),
      escapeCSV(tx.description, delimiter),
      tx.amount.toString(),
      tx.currency ?? "",
    ];
    if (hasType) row.push(tx.transactionType ?? "");
    if (hasCheckNum) row.push(tx.checkNum ?? "");
    if (hasBalance) row.push(tx.balance !== undefined ? tx.balance.toString() : "");
    lines.push(row.join(delimiter));
  }

  return lines.join("\n");
}
