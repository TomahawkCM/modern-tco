import type { MinorAmount } from "../money/types";

/**
 * Transaction shape needed for category-level aggregation.
 * Extends the base aggregation input with a category key.
 */
export interface TransactionForCategoryAggregation {
  readonly amountMinor: number;
  readonly currency: string;
  readonly categoryKey: string | null;
}

/**
 * Spending breakdown for a single category.
 */
export interface CategorySpending {
  readonly categoryKey: string | null;
  readonly total: MinorAmount;
  readonly transactionCount: number;
  /** Percentage of total spending (expenses only). 0 if no expenses. */
  readonly percentageOfTotal: number;
}

/**
 * Result of category-level spending aggregation.
 */
export interface CategorySpendingResult {
  readonly categories: CategorySpending[];
  /** Sum of all negative amounts (expenses only). */
  readonly totalSpending: MinorAmount;
}

/**
 * Aggregate transactions by category key.
 *
 * Groups transactions, sums per category, computes percentage of total
 * spending. Sorted by absolute amount descending.
 *
 * Pure function — no DB, no side effects.
 */
export function aggregateByCategory(
  transactions: TransactionForCategoryAggregation[],
  currency: string
): CategorySpendingResult {
  const groups = new Map<
    string | null,
    { total: number; count: number }
  >();

  let totalExpense = 0;

  for (const txn of transactions) {
    if (txn.currency !== currency) {
      throw new Error(
        `Currency mismatch: expected ${currency}, got ${txn.currency}`
      );
    }

    const existing = groups.get(txn.categoryKey);
    if (existing) {
      existing.total += txn.amountMinor;
      existing.count += 1;
    } else {
      groups.set(txn.categoryKey, {
        total: txn.amountMinor,
        count: 1,
      });
    }

    if (txn.amountMinor < 0) {
      totalExpense += txn.amountMinor;
    }
  }

  const absTotalExpense = Math.abs(totalExpense);

  const categories: CategorySpending[] = Array.from(groups.entries())
    .map(([key, { total, count }]) => ({
      categoryKey: key,
      total: { amountMinor: total, currency } as MinorAmount,
      transactionCount: count,
      percentageOfTotal:
        absTotalExpense > 0 && total < 0
          ? (Math.abs(total) / absTotalExpense) * 100
          : 0,
    }))
    .sort((a, b) => Math.abs(b.total.amountMinor) - Math.abs(a.total.amountMinor));

  return {
    categories,
    totalSpending: { amountMinor: totalExpense, currency } as MinorAmount,
  };
}
