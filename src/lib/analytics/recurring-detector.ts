/**
 * Recurring Transaction Detection (Phase 4)
 * Task 4.2.3: Detect recurring transactions
 *
 * Detects subscriptions and recurring bills based on patterns
 */

import type { Transaction } from "@/types/budget";

export interface RecurringPattern {
  merchant: string;
  category: string;
  subcategory: string | null;
  averageAmount: number;
  frequency: "weekly" | "biweekly" | "monthly" | "quarterly";
  nextExpectedDate: Date;
  confidence: number; // 0-1
  transactionIds: string[];
  occurrences: number;
}

/**
 * Detect recurring transactions
 * Finds patterns: same merchant, similar amount (±5%), regular intervals
 */
export function detectRecurringTransactions(transactions: Transaction[]): RecurringPattern[] {
  const patterns: RecurringPattern[] = [];

  // Group transactions by merchant/description
  const grouped = groupByMerchant(transactions);

  for (const [merchant, txs] of grouped) {
    // Need at least 3 occurrences to confirm pattern
    if (txs.length < 3) continue;

    // Sort by date
    const sorted = txs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Check if amounts are similar (±5%)
    const avgAmount = sorted.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) / sorted.length;
    const amountVariance = sorted.every((tx) => {
      const variance = Math.abs(Math.abs(tx.amount) - avgAmount) / avgAmount;
      return variance <= 0.05; // 5% tolerance
    });

    if (!amountVariance) continue;

    // Calculate intervals between transactions
    const intervals: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const daysBetween = Math.round(
        (new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      intervals.push(daysBetween);
    }

    const avgInterval = intervals.reduce((sum, i) => sum + i, 0) / intervals.length;

    // Detect frequency
    let frequency: RecurringPattern["frequency"] | null = null;
    let confidence = 0;

    if (avgInterval >= 6 && avgInterval <= 8) {
      frequency = "weekly";
      confidence = calculateConfidence(intervals, 7, 1);
    } else if (avgInterval >= 13 && avgInterval <= 15) {
      frequency = "biweekly";
      confidence = calculateConfidence(intervals, 14, 1);
    } else if (avgInterval >= 28 && avgInterval <= 32) {
      frequency = "monthly";
      confidence = calculateConfidence(intervals, 30, 2);
    } else if (avgInterval >= 88 && avgInterval <= 95) {
      frequency = "quarterly";
      confidence = calculateConfidence(intervals, 91, 3);
    }

    // Only add if we detected a frequency with good confidence
    if (frequency && confidence >= 0.7) {
      // Calculate next expected date
      const lastTx = sorted[sorted.length - 1];
      const lastDate = new Date(lastTx.date);
      const daysToAdd =
        frequency === "weekly"
          ? 7
          : frequency === "biweekly"
            ? 14
            : frequency === "monthly"
              ? 30
              : 91;

      const nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + daysToAdd);

      patterns.push({
        merchant,
        category: sorted[0].category || "Uncategorized",
        subcategory: sorted[0].subcategory || null,
        averageAmount: avgAmount,
        frequency,
        nextExpectedDate: nextDate,
        confidence,
        transactionIds: sorted.map((tx) => tx.id),
        occurrences: sorted.length,
      });
    }
  }

  // Sort by confidence and next date
  return patterns.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Group transactions by merchant/description
 */
function groupByMerchant(transactions: Transaction[]): Map<string, Transaction[]> {
  const grouped = new Map<string, Transaction[]>();

  transactions.forEach((tx) => {
    // Only expenses
    if (tx.amount >= 0) return;

    // Normalize description
    const key = normalizeMerchant(tx.description);

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(tx);
  });

  return grouped;
}

/**
 * Normalize merchant name for grouping
 */
function normalizeMerchant(description: string): string {
  let normalized = description
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, "") // Remove special chars
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();

  // Remove common transaction prefixes
  normalized = normalized
    .replace(/^(ONLINE PURCHASE|PURCHASE|PAYMENT|WITHDRAWAL)\s+/, "")
    .replace(/\d{1,2}(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\d{4}/, "") // Remove dates
    .replace(/\s+(AB|BC|ON|QC|MB|SK|NS|NB|PE|NL|YT|NT|NU|CAN)\s*$/, "") // Remove provinces
    .trim();

  // Take first 3-4 words as merchant identifier
  const words = normalized.split(" ").slice(0, 4).join(" ");

  return words;
}

/**
 * Calculate confidence based on interval consistency
 */
function calculateConfidence(
  intervals: number[],
  expectedInterval: number,
  tolerance: number
): number {
  if (intervals.length === 0) return 0;

  const deviations = intervals.map((interval) => Math.abs(interval - expectedInterval));

  const avgDeviation = deviations.reduce((sum, d) => sum + d, 0) / deviations.length;

  // Confidence decreases with deviation
  // Perfect match (0 deviation) = 1.0 confidence
  // Within tolerance = >0.7 confidence
  // Beyond tolerance = <0.7 confidence
  const confidence = Math.max(0, 1 - avgDeviation / (expectedInterval * 0.5));

  return confidence;
}

/**
 * Check if a transaction is part of a recurring pattern
 */
export function isRecurringTransaction(
  transaction: Transaction,
  patterns: RecurringPattern[]
): RecurringPattern | null {
  return patterns.find((p) => p.transactionIds.includes(transaction.id)) || null;
}

/**
 * Get upcoming recurring transactions (next 30 days)
 */
export function getUpcomingRecurring(patterns: RecurringPattern[]): RecurringPattern[] {
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  return patterns
    .filter((p) => p.nextExpectedDate >= now && p.nextExpectedDate <= thirtyDaysFromNow)
    .sort((a, b) => a.nextExpectedDate.getTime() - b.nextExpectedDate.getTime());
}
