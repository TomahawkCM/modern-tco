import type { ParsedTransaction } from "../types";

export interface QIFExportOptions {
  accountType?: "Bank" | "CCard" | "Cash" | "Invst";
}

export function exportQIF(
  transactions: ParsedTransaction[],
  options: QIFExportOptions = {}
): string {
  const { accountType = "Bank" } = options;
  const lines: string[] = [`!Type:${accountType}`];

  for (const tx of transactions) {
    const m = String(tx.date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(tx.date.getUTCDate()).padStart(2, "0");
    const y = tx.date.getUTCFullYear();

    lines.push(`D${m}/${d}/${y}`);
    lines.push(`T${tx.amount}`);
    lines.push(`P${tx.description}`);
    if (tx.checkNum) lines.push(`N${tx.checkNum}`);
    lines.push("^");
  }

  return lines.join("\n");
}
