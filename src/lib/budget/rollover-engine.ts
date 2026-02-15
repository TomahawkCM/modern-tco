"use client";

/**
 * Budget Rollover Engine
 *
 * Implements envelope budgeting: unused budget from the previous month
 * carries forward (positive or negative) into the current month.
 * Stored in the budgetRollovers table for audit trail.
 */

import { db } from "@/lib/budget-db";
import type { Budget, BudgetRollover } from "@/types/budget";
import { sumAmounts, subtractAmounts } from "@/lib/money";

/**
 * Format a Date into "YYYY-MM" month string
 */
export function formatMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Get the previous month string from a given month string
 */
export function getPreviousMonth(month: string): string {
  const [year, m] = month.split("-").map(Number);
  const date = new Date(year, m - 2, 1); // m-1 is current, m-2 is previous
  return formatMonth(date);
}

/**
 * Calculate rollover amount for a specific budget and month.
 *
 * Rollover = budgetAmount - spent for the given month.
 * Negative rollovers are capped at -budgetAmount (can't owe more than the budget).
 */
export async function calculateRollover(budgetId: string, month: string): Promise<BudgetRollover> {
  const budget = await db.budgets.get(budgetId);
  if (!budget) {
    throw new Error(`Budget ${budgetId} not found`);
  }

  // Get category name for transaction matching
  const category = await db.categories.get(budget.categoryId);
  if (!category) {
    throw new Error(`Category ${budget.categoryId} not found`);
  }

  // Parse month into date range
  const [year, m] = month.split("-").map(Number);
  const monthStart = new Date(year, m - 1, 1);
  const monthEnd = new Date(year, m, 0, 23, 59, 59, 999);

  // Get transactions for this category in the given month
  const allTxs = await db.transactions
    .where("date")
    .between(monthStart, monthEnd, true, true)
    .toArray();

  const categoryTxs = allTxs.filter(
    (tx) => !tx.isSplit && tx.category === category.name && tx.amount < 0
  );

  const spent = Math.abs(sumAmounts(categoryTxs.map((tx) => tx.amount)));
  let rolloverAmount = subtractAmounts(budget.amount, spent);

  // Cap negative rollover at -budgetAmount
  if (rolloverAmount < -budget.amount) {
    rolloverAmount = -budget.amount;
  }

  const rollover: BudgetRollover = {
    id: `rollover_${budgetId}_${month}`,
    budgetId,
    month,
    amount: rolloverAmount,
    calculatedAt: new Date(),
  };

  return rollover;
}

/**
 * Process month-end rollovers for all budgets that have rollover enabled.
 *
 * @param month The month to calculate rollovers FOR (the month that just ended).
 *              Defaults to the previous month.
 */
export async function processMonthEndRollovers(month?: string): Promise<BudgetRollover[]> {
  const targetMonth = month ?? getPreviousMonth(formatMonth(new Date()));

  const budgets = await db.budgets.toArray();
  const rolloverBudgets = budgets.filter((b) => b.rollover === true);

  const rollovers: BudgetRollover[] = [];

  for (const budget of rolloverBudgets) {
    const rollover = await calculateRollover(budget.id, targetMonth);

    // Upsert: replace existing rollover for same budget+month
    const existing = await db.budgetRollovers
      .where("[budgetId+month]")
      .equals([budget.id, targetMonth])
      .first();

    if (existing) {
      await db.budgetRollovers.update(existing.id, {
        amount: rollover.amount,
        calculatedAt: rollover.calculatedAt,
      });
      rollover.id = existing.id;
    } else {
      await db.budgetRollovers.add(rollover);
    }

    rollovers.push(rollover);
  }

  return rollovers;
}

/**
 * Get the effective budget for a category in a specific month.
 * Effective = base budget amount + accumulated rollovers from previous months.
 *
 * @param budgetId Budget ID
 * @param month Current month string "YYYY-MM"
 * @returns Object with base, rollover, and effective amounts
 */
export async function getEffectiveBudget(
  budgetId: string,
  month: string
): Promise<{ base: number; rollover: number; effective: number }> {
  const budget = await db.budgets.get(budgetId);
  if (!budget) {
    return { base: 0, rollover: 0, effective: 0 };
  }

  if (!budget.rollover) {
    return { base: budget.amount, rollover: 0, effective: budget.amount };
  }

  // Get rollover from the previous month
  const prevMonth = getPreviousMonth(month);
  const rolloverRecord = await db.budgetRollovers
    .where("[budgetId+month]")
    .equals([budgetId, prevMonth])
    .first();

  const rolloverAmount = rolloverRecord?.amount ?? 0;
  const effective = sumAmounts([budget.amount, rolloverAmount]);

  return {
    base: budget.amount,
    rollover: rolloverAmount,
    effective,
  };
}

/**
 * Get all rollover amounts for the current month's budgets.
 * Returns a Map of budgetId -> rollover amount for use with safe-to-spend.
 */
export async function getCurrentRolloverAmounts(): Promise<Map<string, number>> {
  const currentMonth = formatMonth(new Date());
  const prevMonth = getPreviousMonth(currentMonth);

  const rollovers = await db.budgetRollovers.where("month").equals(prevMonth).toArray();

  const map = new Map<string, number>();
  for (const r of rollovers) {
    map.set(r.budgetId, r.amount);
  }

  return map;
}
