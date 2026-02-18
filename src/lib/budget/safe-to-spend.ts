"use client";

/**
 * Safe-to-Spend Per-Category Partials
 *
 * Calculates how much is safe to spend per budget category for the current month,
 * including daily budget breakdown and status thresholds.
 */

import { db } from "@/lib/budget-db";
import type { Budget, Category, Transaction } from "@/types/budget";
import { sumAmounts, subtractAmounts } from "@/lib/money";

export interface CategoryPartial {
  categoryId: string;
  categoryName: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  status: "safe" | "caution" | "danger";
}

export interface SafeToSpendData {
  totalSafeToSpend: number;
  partials: CategoryPartial[];
  daysRemainingInMonth: number;
  dailyBudget: number;
}

/**
 * Determine status based on percentage used
 */
export function getSpendingStatus(percentUsed: number): "safe" | "caution" | "danger" {
  if (percentUsed >= 80) return "danger";
  if (percentUsed >= 50) return "caution";
  return "safe";
}

/**
 * Get days remaining in the current month (including today)
 */
export function getDaysRemainingInMonth(date: Date = new Date()): number {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const currentDay = date.getDate();
  return Math.max(1, lastDay - currentDay + 1);
}

/**
 * Calculate safe-to-spend data for the current month
 *
 * @param rolloverAmounts Optional map of budgetId -> rollover amount to include
 */
export async function calculateSafeToSpend(
  rolloverAmounts?: Map<string, number>
): Promise<SafeToSpendData> {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [categories, budgets, allTransactions] = await Promise.all([
    db.categories.toArray(),
    db.budgets.toArray(),
    db.transactions.toArray(),
  ]);

  // Filter to non-split current month transactions
  const currentMonthTxs = allTransactions.filter(
    (tx) => !tx.isSplit && new Date(tx.date) >= firstOfMonth
  );

  const expenseCategories = categories.filter((cat) => cat.type === "expense");

  const partials: CategoryPartial[] = expenseCategories
    .map((category) => {
      const budget = budgets.find((b) => b.categoryId === category.id);
      if (!budget) return null;

      const categoryTxs = currentMonthTxs.filter((tx) => tx.category === category.name);
      const spent = Math.abs(
        sumAmounts(categoryTxs.filter((tx) => tx.amount < 0).map((tx) => tx.amount))
      );

      let budgetAmount = budget.amount;

      // Include rollover if available
      if (rolloverAmounts?.has(budget.id)) {
        const rollover = rolloverAmounts.get(budget.id) ?? 0;
        budgetAmount = sumAmounts([budgetAmount, rollover]);
      }

      const remaining = subtractAmounts(budgetAmount, spent);
      const percentUsed = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

      return {
        categoryId: category.id,
        categoryName: category.name,
        budgeted: budgetAmount,
        spent,
        remaining,
        percentUsed: Math.round(percentUsed * 10) / 10,
        status: getSpendingStatus(percentUsed),
      };
    })
    .filter((p): p is CategoryPartial => p !== null);

  const totalSafeToSpend = sumAmounts(
    partials.filter((p) => p.remaining > 0).map((p) => p.remaining)
  );

  const daysRemainingInMonth = getDaysRemainingInMonth(now);
  const dailyBudget =
    totalSafeToSpend > 0 ? Math.round((totalSafeToSpend / daysRemainingInMonth) * 100) / 100 : 0;

  return {
    totalSafeToSpend,
    partials,
    daysRemainingInMonth,
    dailyBudget,
  };
}
