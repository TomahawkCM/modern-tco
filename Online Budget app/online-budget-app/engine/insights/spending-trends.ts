/**
 * Spending trends — compares current month to baseline average.
 *
 * Pure function — no DB, no AI, no side effects.
 */

import type { TransactionForCategoryAggregation } from "../aggregation/category-spending";
import { toExpenseCategorySpends } from "./expense-spends";

export interface CategorySpend {
  readonly categoryKey: string;
  readonly spentMinor: number;
}

export interface SpendingTrendsInput {
  readonly currentMonth: readonly CategorySpend[];
  readonly baselineMonths: readonly (readonly CategorySpend[])[];
}

export interface SpendingTrend {
  readonly categoryKey: string;
  readonly currentMinor: number;
  readonly baselineAvgMinor: number;
  /** Null when baseline is zero (cannot compute % change from zero). */
  readonly percentChange: number | null;
}

export function computeSpendingTrends(
  input: SpendingTrendsInput
): SpendingTrend[] {
  const allKeys = new Set<string>();

  // Collect all category keys from current + baseline
  for (const s of input.currentMonth) allKeys.add(s.categoryKey);
  for (const month of input.baselineMonths) {
    for (const s of month) allKeys.add(s.categoryKey);
  }

  // Build current lookup
  const currentMap = new Map<string, number>();
  for (const s of input.currentMonth) {
    currentMap.set(s.categoryKey, s.spentMinor);
  }

  // Compute baseline averages
  const baselineTotals = new Map<string, number>();
  for (const month of input.baselineMonths) {
    for (const s of month) {
      baselineTotals.set(
        s.categoryKey,
        (baselineTotals.get(s.categoryKey) ?? 0) + s.spentMinor
      );
    }
  }

  const monthCount = input.baselineMonths.length;

  const trends: SpendingTrend[] = [];

  for (const key of allKeys) {
    const current = currentMap.get(key) ?? 0;
    const baselineTotal = baselineTotals.get(key) ?? 0;
    const baselineAvg = monthCount > 0 ? Math.round(baselineTotal / monthCount) : 0;

    let percentChange: number | null;
    if (baselineAvg === 0) {
      percentChange = null;
    } else {
      percentChange = ((current - baselineAvg) / baselineAvg) * 100;
    }

    trends.push({
      categoryKey: key,
      currentMinor: current,
      baselineAvgMinor: baselineAvg,
      percentChange,
    });
  }

  // Sort by absolute percent change descending (null at end)
  trends.sort((a, b) => {
    if (a.percentChange === null && b.percentChange === null) return 0;
    if (a.percentChange === null) return 1;
    if (b.percentChange === null) return -1;
    return Math.abs(b.percentChange) - Math.abs(a.percentChange);
  });

  return trends;
}

/**
 * Compute spending trends directly from raw transactions.
 *
 * Thin adapter: toExpenseCategorySpends per month → computeSpendingTrends.
 * Handles all financial interpretation (expense filtering, sign conversion)
 * so the server layer does not need to.
 *
 * @param currentMonth    Current month transactions (engine input shape)
 * @param baselineMonths  Prior months transactions (engine input shape)
 * @param currency        Expected currency — all transactions must match
 */
export function computeSpendingTrendsFromTransactions(
  currentMonth: readonly TransactionForCategoryAggregation[],
  baselineMonths: readonly (readonly TransactionForCategoryAggregation[])[],
  currency: string
): SpendingTrend[] {
  return computeSpendingTrends({
    currentMonth: toExpenseCategorySpends(currentMonth, currency),
    baselineMonths: baselineMonths.map((month) =>
      toExpenseCategorySpends(month, currency)
    ),
  });
}
