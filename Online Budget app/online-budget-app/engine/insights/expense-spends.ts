/**
 * Expense category spend extraction.
 *
 * Converts raw transaction aggregation into expense-only CategorySpend[].
 *
 * Financial interpretation (belongs in engine, not server):
 * - Filters to expense categories (amountMinor < 0)
 * - Excludes uncategorized transactions (categoryKey === null)
 * - Converts to positive values via absMinor
 *
 * Pure function — no DB, no AI, no side effects.
 */

import type { TransactionForCategoryAggregation } from "../aggregation/category-spending";
import type { CategorySpend } from "./spending-trends";
import { aggregateByCategory } from "../aggregation/category-spending";
import { absMinor } from "../money";

/**
 * Aggregate transactions and extract expense-only category spends.
 *
 * @param transactions  Raw categorized transactions (engine input shape)
 * @param currency      Expected currency — all transactions must match
 * @returns Expense categories with positive spentMinor values, sorted by amount descending
 */
export function toExpenseCategorySpends(
  transactions: readonly TransactionForCategoryAggregation[],
  currency: string
): CategorySpend[] {
  const result = aggregateByCategory(
    [...transactions],
    currency
  );

  return result.categories
    .filter(
      (c): c is typeof c & { categoryKey: string } =>
        c.categoryKey !== null && c.total.amountMinor < 0
    )
    .map((c) => ({
      categoryKey: c.categoryKey,
      spentMinor: absMinor(c.total).amountMinor,
    }));
}
