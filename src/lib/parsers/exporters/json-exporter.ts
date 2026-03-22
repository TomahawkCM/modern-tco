import type { ParsedTransaction } from "../types";

export interface JSONExportOptions {
  includeMetadata?: boolean;
  compact?: boolean;
}

export function exportJSON(
  transactions: ParsedTransaction[],
  options: JSONExportOptions = {}
): string {
  const { includeMetadata = false, compact = false } = options;

  const data = transactions.map((tx) => {
    const base: Record<string, unknown> = {
      date: tx.date.toISOString(),
      description: tx.description,
      amount: tx.amount,
    };
    if (tx.currency) base.currency = tx.currency;
    if (tx.sourceFormat) base.sourceFormat = tx.sourceFormat;
    if (tx.fitid) base.fitid = tx.fitid;
    if (tx.checkNum) base.checkNum = tx.checkNum;
    if (tx.transactionType) base.transactionType = tx.transactionType;
    if (tx.balance !== undefined) base.balance = tx.balance;

    if (includeMetadata) {
      base.isDuplicate = tx.isDuplicate;
      base.confidence = tx.confidence;
      if (tx.duplicateReason) base.duplicateReason = tx.duplicateReason;
      if (tx.matchedTransactionId) base.matchedTransactionId = tx.matchedTransactionId;
      if (tx.requiresReview) base.requiresReview = tx.requiresReview;
    }

    return base;
  });

  return JSON.stringify(data, null, compact ? undefined : 2);
}
