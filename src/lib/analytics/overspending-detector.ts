/**
 * Overspending Detection (Phase 4)
 * Task 4.2.2: Add overspending alerts
 *
 * Predicts if user will exceed budget based on current spending rate
 */

import type { Transaction, Budget } from "@/types/budget";

export interface OverspendingAlert {
  categoryId: string;
  categoryName: string;
  budgetAmount: number;
  currentSpent: number;
  projectedSpending: number;
  projectedOverage: number;
  daysElapsed: number;
  daysRemaining: number;
  severity: "warning" | "danger";
}

/**
 * Detect potential overspending for current month
 */
export function detectOverspending(
  transactions: Transaction[],
  budgets: Budget[],
  categories: { id: string; name: string }[]
): OverspendingAlert[] {
  const alerts: OverspendingAlert[] = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Get first and last day of current month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const daysElapsed = now.getDate();
  const daysRemaining = daysInMonth - daysElapsed;

  // Filter transactions for current month
  const currentMonthTxs = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return txDate >= firstDayOfMonth && txDate <= lastDayOfMonth;
  });

  // Check each budget
  for (const budget of budgets) {
    // Only check monthly budgets for current period
    if (budget.period !== "monthly") continue;

    const category = categories.find((c) => c.id === budget.categoryId);
    if (!category) continue;

    // Calculate current spending for this category
    const categoryTxs = currentMonthTxs.filter(
      (tx) => tx.category === category.name && tx.amount < 0
    );

    const currentSpent = Math.abs(categoryTxs.reduce((sum, tx) => sum + tx.amount, 0));

    // Project spending for entire month
    // Formula: (spent / daysElapsed) * daysInMonth
    const dailyRate = daysElapsed > 0 ? currentSpent / daysElapsed : 0;
    const projectedSpending = dailyRate * daysInMonth;

    // Check if projected to exceed budget
    if (projectedSpending > budget.amount) {
      const projectedOverage = projectedSpending - budget.amount;
      const percentOver = (projectedOverage / budget.amount) * 100;

      // Determine severity
      const severity: "warning" | "danger" = percentOver >= 20 ? "danger" : "warning";

      alerts.push({
        categoryId: budget.categoryId,
        categoryName: category.name,
        budgetAmount: budget.amount,
        currentSpent,
        projectedSpending,
        projectedOverage,
        daysElapsed,
        daysRemaining,
        severity,
      });
    }
  }

  // Sort by severity (danger first) then by overage amount
  return alerts.sort((a, b) => {
    if (a.severity !== b.severity) {
      return a.severity === "danger" ? -1 : 1;
    }
    return b.projectedOverage - a.projectedOverage;
  });
}

/**
 * Check if already overspent (exceeded budget)
 */
export function detectCurrentOverspending(
  transactions: Transaction[],
  budgets: Budget[],
  categories: { id: string; name: string }[]
): OverspendingAlert[] {
  const alerts: OverspendingAlert[] = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const daysElapsed = now.getDate();
  const daysRemaining = daysInMonth - daysElapsed;

  const currentMonthTxs = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return txDate >= firstDayOfMonth && txDate <= lastDayOfMonth;
  });

  for (const budget of budgets) {
    if (budget.period !== "monthly") continue;

    const category = categories.find((c) => c.id === budget.categoryId);
    if (!category) continue;

    const categoryTxs = currentMonthTxs.filter(
      (tx) => tx.category === category.name && tx.amount < 0
    );

    const currentSpent = Math.abs(categoryTxs.reduce((sum, tx) => sum + tx.amount, 0));

    // Already exceeded budget
    if (currentSpent > budget.amount) {
      const actualOverage = currentSpent - budget.amount;

      alerts.push({
        categoryId: budget.categoryId,
        categoryName: category.name,
        budgetAmount: budget.amount,
        currentSpent,
        projectedSpending: currentSpent, // Already spent
        projectedOverage: actualOverage,
        daysElapsed,
        daysRemaining,
        severity: "danger",
      });
    }
  }

  return alerts.sort((a, b) => b.projectedOverage - a.projectedOverage);
}
