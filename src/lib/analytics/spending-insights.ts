/**
 * Spending Insights (Phase 4)
 * Task 4.2.1: Calculate average spending insights
 *
 * Provides "You usually spend $X on Y" insights based on historical data
 */

import type { Transaction, Category } from "@/types/budget";

export interface SpendingInsight {
  category: string;
  subcategory: string | null;
  averageMonthly: number;
  currentMonth: number;
  variance: number; // Difference from average
  variancePercent: number;
  trend: "up" | "down" | "stable";
  monthsAnalyzed: number;
}

/**
 * Calculate 3-month rolling average spending by category
 * Returns top 5 categories by spending
 */
export function calculateSpendingInsights(
  transactions: Transaction[],
  categories: Category[]
): SpendingInsight[] {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Get transactions from last 3 months (including current)
  const threeMonthsAgo = new Date(currentYear, currentMonth - 2, 1);
  const recentTxs = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return txDate >= threeMonthsAgo && tx.amount < 0; // Only expenses
  });

  // Not enough data if less than 90 days of transactions
  const oldestTx = transactions
    .filter((tx) => tx.amount < 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  if (!oldestTx) return [];

  const daysOfData = Math.floor(
    (now.getTime() - new Date(oldestTx.date).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysOfData < 90) return []; // Need at least 90 days

  // Group by category
  const categorySpending = new Map<
    string,
    {
      monthlyTotals: number[];
      currentMonthTotal: number;
      transactions: Transaction[];
    }
  >();

  // Process last 3 months
  for (let i = 0; i < 3; i++) {
    const monthDate = new Date(currentYear, currentMonth - i, 1);
    const month = monthDate.getMonth();
    const year = monthDate.getFullYear();

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    const monthTxs = recentTxs.filter((tx) => {
      const txDate = new Date(tx.date);
      return txDate >= monthStart && txDate <= monthEnd;
    });

    // Group by category
    monthTxs.forEach((tx) => {
      if (!tx.category) return;

      const key = tx.subcategory ? `${tx.category}|${tx.subcategory}` : tx.category;

      if (!categorySpending.has(key)) {
        categorySpending.set(key, {
          monthlyTotals: [0, 0, 0], // 3 months
          currentMonthTotal: 0,
          transactions: [],
        });
      }

      const data = categorySpending.get(key)!;
      const amount = Math.abs(tx.amount);

      // Store in appropriate month slot
      data.monthlyTotals[i] += amount;

      if (i === 0) {
        data.currentMonthTotal += amount;
      }

      data.transactions.push(tx);
    });
  }

  // Calculate insights
  const insights: SpendingInsight[] = [];

  for (const [key, data] of categorySpending) {
    const [category, subcategory] = key.split("|");

    // Calculate 3-month average
    const monthsWithSpending = data.monthlyTotals.filter((m) => m > 0).length;
    if (monthsWithSpending < 2) continue; // Need at least 2 months of data

    const averageMonthly = data.monthlyTotals.reduce((sum, m) => sum + m, 0) / 3;
    const variance = data.currentMonthTotal - averageMonthly;
    const variancePercent = averageMonthly > 0 ? (variance / averageMonthly) * 100 : 0;

    // Determine trend
    let trend: "up" | "down" | "stable" = "stable";
    if (variancePercent > 15) trend = "up";
    else if (variancePercent < -15) trend = "down";

    insights.push({
      category,
      subcategory: subcategory || null,
      averageMonthly,
      currentMonth: data.currentMonthTotal,
      variance,
      variancePercent,
      trend,
      monthsAnalyzed: 3,
    });
  }

  // Sort by average spending (descending) and return top 5
  return insights.sort((a, b) => b.averageMonthly - a.averageMonthly).slice(0, 5);
}

/**
 * Get total average monthly spending
 */
export function getAverageMonthlySpending(transactions: Transaction[]): number {
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

  const recentExpenses = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return txDate >= threeMonthsAgo && tx.amount < 0;
  });

  const total = Math.abs(recentExpenses.reduce((sum, tx) => sum + tx.amount, 0));

  return total / 3; // 3 months
}

/**
 * Get total average monthly income
 */
export function getAverageMonthlyIncome(transactions: Transaction[]): number {
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

  const recentIncome = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return txDate >= threeMonthsAgo && tx.amount > 0;
  });

  const total = recentIncome.reduce((sum, tx) => sum + tx.amount, 0);

  return total / 3; // 3 months
}
