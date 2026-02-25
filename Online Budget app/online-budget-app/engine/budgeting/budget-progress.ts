/**
 * Budget progress computation.
 *
 * Given budget limits and actual spending by category,
 * computes remaining amount, percentage used, and over-budget status.
 *
 * Pure function — no DB, no side effects.
 */

import type { TransactionForCategoryAggregation } from "../aggregation/category-spending";
import { toExpenseCategorySpends } from "../insights/expense-spends";

/**
 * A budget limit for a single category.
 */
export interface BudgetLimit {
  readonly categoryKey: string;
  readonly limitMinor: number;
  readonly currency: string;
}

/**
 * Actual spending for a category (absolute value, always positive).
 */
export interface CategoryActualSpending {
  readonly categoryKey: string;
  readonly spentMinor: number;
}

/**
 * Computed progress for a single budget.
 */
export interface BudgetProgressItem {
  readonly categoryKey: string;
  readonly limitMinor: number;
  readonly spentMinor: number;
  readonly remainingMinor: number;
  readonly percentUsed: number;
  readonly isOverBudget: boolean;
}

/**
 * Compute budget progress for each budgeted category.
 *
 * @param budgets  Budget limits per category
 * @param spending Actual spending per category (positive values)
 * @param currency Expected currency — all budgets must match
 * @returns Progress for each budget
 */
export function computeBudgetProgress(
  budgets: BudgetLimit[],
  spending: CategoryActualSpending[],
  currency: string
): BudgetProgressItem[] {
  const spendingMap = new Map<string, number>();
  for (const s of spending) {
    spendingMap.set(s.categoryKey, s.spentMinor);
  }

  return budgets.map((budget) => {
    if (budget.currency !== currency) {
      throw new Error(
        `Currency mismatch: expected ${currency}, got ${budget.currency}`
      );
    }

    const spent = spendingMap.get(budget.categoryKey) ?? 0;
    const remaining = budget.limitMinor - spent;
    const percentUsed =
      budget.limitMinor > 0 ? (spent / budget.limitMinor) * 100 : 0;

    return {
      categoryKey: budget.categoryKey,
      limitMinor: budget.limitMinor,
      spentMinor: spent,
      remainingMinor: remaining,
      percentUsed,
      isOverBudget: remaining < 0,
    };
  });
}

/**
 * Compute budget progress directly from raw transactions.
 *
 * Thin adapter: toExpenseCategorySpends → map to CategoryActualSpending[] →
 * computeBudgetProgress.
 * Handles all financial interpretation (expense filtering, sign conversion)
 * so the server layer does not need to.
 *
 * @param transactions  Current month transactions (engine input shape)
 * @param budgetLimits  Budget limits per category
 * @param currency      Expected currency — all transactions and budgets must match
 */
export function computeBudgetProgressFromTransactions(
  transactions: readonly TransactionForCategoryAggregation[],
  budgetLimits: BudgetLimit[],
  currency: string
): BudgetProgressItem[] {
  const spends = toExpenseCategorySpends(transactions, currency);

  const actualSpending: CategoryActualSpending[] = spends.map((s) => ({
    categoryKey: s.categoryKey,
    spentMinor: s.spentMinor,
  }));

  return computeBudgetProgress(budgetLimits, actualSpending, currency);
}
