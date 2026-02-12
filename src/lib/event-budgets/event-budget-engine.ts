/**
 * Event/Project Budget Engine
 *
 * Manages time-limited budgets for events, projects, or seasonal activities.
 * Separate from monthly budgets — operates on custom date ranges with
 * transaction tagging via eventBudgetId.
 */

import { db } from '@/lib/budget-db';
import { roundToCents, sumAmounts } from '@/lib/money';
import type { EventBudget, EventBudgetCategory } from '@/types/budget';

/**
 * Create a new event budget with categories.
 */
export async function createEventBudget(
  data: Omit<EventBudget, 'id' | 'createdAt' | 'updatedAt'>,
  categories?: Array<{ categoryName: string; budgeted: number }>
): Promise<EventBudget> {
  const now = new Date();
  const eventBudget: EventBudget = {
    ...data,
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };

  await db.eventBudgets.add(eventBudget);

  if (categories && categories.length > 0) {
    const categoryRecords: EventBudgetCategory[] = categories.map((cat) => ({
      id: `ebc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eventBudgetId: eventBudget.id,
      categoryName: cat.categoryName,
      budgeted: cat.budgeted,
      spent: 0,
    }));

    await db.eventBudgetCategories.bulkAdd(categoryRecords);
  }

  return eventBudget;
}

/**
 * Calculate progress for an event budget.
 * Sums spent amounts from tagged transactions per category.
 */
export async function calculateProgress(
  eventBudgetId: string
): Promise<{
  total: number;
  spent: number;
  remaining: number;
  byCategory: EventBudgetCategory[];
}> {
  const eventBudget = await db.eventBudgets.get(eventBudgetId);
  if (!eventBudget) {
    return { total: 0, spent: 0, remaining: 0, byCategory: [] };
  }

  // Get all tagged transactions
  const taggedTxs = await db.transactions
    .where('eventBudgetId')
    .equals(eventBudgetId)
    .toArray();

  const nonSplitTxs = taggedTxs.filter((tx) => !tx.isSplit);

  // Get categories for this event
  const categories = await db.eventBudgetCategories
    .where('eventBudgetId')
    .equals(eventBudgetId)
    .toArray();

  // Calculate spent per category
  const updatedCategories = categories.map((cat) => {
    const catTxs = nonSplitTxs.filter(
      (tx) => tx.category === cat.categoryName && tx.amount < 0
    );
    const spent = sumAmounts(catTxs.map(tx => Math.abs(tx.amount)));
    return { ...cat, spent: roundToCents(spent) };
  });

  // Update spent amounts in DB
  for (const cat of updatedCategories) {
    await db.eventBudgetCategories.update(cat.id, { spent: cat.spent });
  }

  const totalBudgeted = eventBudget.totalBudget;
  const totalSpent = sumAmounts(
    nonSplitTxs.filter((tx) => tx.amount < 0).map(tx => Math.abs(tx.amount))
  );

  return {
    total: totalBudgeted,
    spent: roundToCents(totalSpent),
    remaining: roundToCents(totalBudgeted - totalSpent),
    byCategory: updatedCategories,
  };
}

/**
 * Get all active event budgets (status = 'active' or 'planning', within date range).
 */
export async function getActiveEvents(): Promise<EventBudget[]> {
  const all = await db.eventBudgets
    .where('status')
    .anyOf(['active', 'planning'])
    .toArray();

  return all;
}

/**
 * Tag a transaction with an event budget.
 */
export async function tagTransaction(
  transactionId: string,
  eventBudgetId: string
): Promise<void> {
  await db.transactions.update(transactionId, {
    eventBudgetId,
    updatedAt: new Date(),
  });
}

/**
 * Remove event budget tag from a transaction.
 */
export async function untagTransaction(transactionId: string): Promise<void> {
  await db.transactions.update(transactionId, {
    eventBudgetId: undefined,
    updatedAt: new Date(),
  });
}

/**
 * Update an event budget.
 */
export async function updateEventBudget(
  id: string,
  updates: Partial<Omit<EventBudget, 'id' | 'createdAt'>>
): Promise<void> {
  await db.eventBudgets.update(id, {
    ...updates,
    updatedAt: new Date(),
  });
}

/**
 * Delete an event budget and its categories.
 * Does not delete tagged transactions — just removes the tag.
 */
export async function deleteEventBudget(id: string): Promise<void> {
  // Untag all transactions
  const tagged = await db.transactions
    .where('eventBudgetId')
    .equals(id)
    .toArray();

  for (const tx of tagged) {
    await db.transactions.update(tx.id, {
      eventBudgetId: undefined,
      updatedAt: new Date(),
    });
  }

  // Delete categories
  await db.eventBudgetCategories
    .where('eventBudgetId')
    .equals(id)
    .delete();

  // Delete event budget
  await db.eventBudgets.delete(id);
}
