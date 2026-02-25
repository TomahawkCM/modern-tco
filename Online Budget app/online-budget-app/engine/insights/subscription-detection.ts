/**
 * Subscription detection — identifies recurring transactions
 * from the same merchant with consistent amounts.
 *
 * Pure function — no DB, no AI, no side effects.
 */

export interface TransactionForSubscription {
  readonly merchantToken: string;
  readonly amountMinor: number;
  readonly transactionDate: string;
}

export interface SubscriptionDetectionInput {
  readonly transactions: readonly TransactionForSubscription[];
  /** Minimum number of recurring charges to count as subscription. Default: 2. */
  readonly minOccurrences?: number;
  /** Max % variation in amount to still consider recurring. Default: 10. */
  readonly amountTolerancePercent?: number;
  /** ISO date string for "today" — used to determine isActive. Default: latest transaction date. */
  readonly today?: string;
}

export interface DetectedSubscription {
  readonly merchantToken: string;
  readonly averageAmountMinor: number;
  readonly occurrences: number;
  readonly latestDate: string;
  /** True if latest charge is within ~60 days of today. */
  readonly isActive: boolean;
}

const DEFAULT_MIN_OCCURRENCES = 2;
const DEFAULT_TOLERANCE = 10;
const ACTIVE_THRESHOLD_DAYS = 60;

export function detectSubscriptions(
  input: SubscriptionDetectionInput
): DetectedSubscription[] {
  const minOcc = input.minOccurrences ?? DEFAULT_MIN_OCCURRENCES;
  const tolerance = input.amountTolerancePercent ?? DEFAULT_TOLERANCE;

  // Group transactions by merchant
  const byMerchant = new Map<string, TransactionForSubscription[]>();
  for (const tx of input.transactions) {
    const group = byMerchant.get(tx.merchantToken);
    if (group) {
      group.push(tx);
    } else {
      byMerchant.set(tx.merchantToken, [tx]);
    }
  }

  // Determine "today" for isActive calculation
  let todayStr = input.today;
  if (!todayStr && input.transactions.length > 0) {
    todayStr = input.transactions.reduce((latest, tx) =>
      tx.transactionDate > latest ? tx.transactionDate : latest,
      input.transactions[0]!.transactionDate
    );
  }

  const results: DetectedSubscription[] = [];

  for (const [merchant, txns] of byMerchant) {
    if (txns.length < minOcc) continue;

    // Check amount consistency
    const amounts = txns.map((t) => Math.abs(t.amountMinor));
    const avgAmount = Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length);

    if (avgAmount === 0) continue;

    const allWithinTolerance = amounts.every((amt) => {
      const deviation = (Math.abs(amt - avgAmount) / avgAmount) * 100;
      return deviation <= tolerance;
    });

    if (!allWithinTolerance) continue;

    // Find latest date
    const latestDate = txns.reduce((latest, tx) =>
      tx.transactionDate > latest ? tx.transactionDate : latest,
      txns[0]!.transactionDate
    );

    // Determine if active
    let isActive = true;
    if (todayStr) {
      const daysDiff = daysBetween(latestDate, todayStr);
      isActive = daysDiff <= ACTIVE_THRESHOLD_DAYS;
    }

    // Use the original sign for average amount
    const signedAmounts = txns.map((t) => t.amountMinor);
    const signedAvg = Math.round(
      signedAmounts.reduce((a, b) => a + b, 0) / signedAmounts.length
    );

    results.push({
      merchantToken: merchant,
      averageAmountMinor: signedAvg,
      occurrences: txns.length,
      latestDate,
      isActive,
    });
  }

  // Sort by absolute amount descending (biggest subscriptions first)
  results.sort(
    (a, b) => Math.abs(b.averageAmountMinor) - Math.abs(a.averageAmountMinor)
  );

  return results;
}

function daysBetween(dateA: string, dateB: string): number {
  const a = Date.UTC(
    parseInt(dateA.slice(0, 4)),
    parseInt(dateA.slice(5, 7)) - 1,
    parseInt(dateA.slice(8, 10))
  );
  const b = Date.UTC(
    parseInt(dateB.slice(0, 4)),
    parseInt(dateB.slice(5, 7)) - 1,
    parseInt(dateB.slice(8, 10))
  );
  return Math.abs(b - a) / (1000 * 60 * 60 * 24);
}
