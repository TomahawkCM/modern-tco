/**
 * WebMCP Tool: get_budget_summary
 * Returns income, expenses, net savings, and budget utilization for a month.
 */

import { useCallback } from "react";
import { useWebMCP } from "@mcp-b/react-webmcp";
import type { Transaction, Budget, Category } from "@/types/budget";
import { GetBudgetSummaryInput } from "./schemas";
import { calculateTransactionTotals } from "@/lib/utils/balanceCalculations";
import { sumAmounts, roundToCents } from "@/lib/money";

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function useGetBudgetSummary(
  transactions: Transaction[],
  budgets: Budget[],
  categories: Category[],
  privacyMode: boolean
) {
  const handler = useCallback(
    async (input: Record<string, unknown>) => {
      if (privacyMode) {
        return { error: "Privacy mode is active. Financial data is hidden." };
      }

      const args = GetBudgetSummaryInput.parse(input);
      const month = args.month || getCurrentMonth();
      const [yearStr, monthStr] = month.split("-");
      const year = parseInt(yearStr, 10);
      const monthNum = parseInt(monthStr, 10);

      // Filter transactions for the target month
      const monthTxs = transactions.filter((tx) => {
        const d = new Date(tx.date);
        return d.getFullYear() === year && d.getMonth() + 1 === monthNum;
      });

      const { totalIncome, totalExpenses, netChange } = calculateTransactionTotals(monthTxs);

      // Calculate budgeted totals
      const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
      const monthlyBudgets = budgets.filter((b) => {
        const start = new Date(b.startDate);
        const end = b.endDate ? new Date(b.endDate) : null;
        const targetStart = new Date(year, monthNum - 1, 1);
        const targetEnd = new Date(year, monthNum, 0);
        return start <= targetEnd && (!end || end >= targetStart);
      });

      const budgetedExpenses = sumAmounts(
        monthlyBudgets.map((b) => (b.period === "annual" ? b.amount / 12 : b.amount))
      );

      // Top spending categories
      const spendingByCategory = new Map<string, number>();
      for (const tx of monthTxs) {
        if (tx.amount < 0 && tx.category) {
          const cat = tx.category;
          spendingByCategory.set(cat, (spendingByCategory.get(cat) || 0) + Math.abs(tx.amount));
        }
      }

      const topCategories = Array.from(spendingByCategory.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([cat, amount]) => ({
          category: categoryMap.get(cat) || cat,
          amount: roundToCents(amount),
          percentage: totalExpenses > 0 ? roundToCents((amount / totalExpenses) * 100) : 0,
        }));

      return {
        month,
        totalIncome,
        totalExpenses,
        netSavings: netChange,
        budgetedExpenses: roundToCents(budgetedExpenses),
        remainingBudget: roundToCents(budgetedExpenses - totalExpenses),
        savingsRate: totalIncome > 0 ? roundToCents((netChange / totalIncome) * 100) : 0,
        transactionCount: monthTxs.length,
        topCategories,
      };
    },
    [transactions, budgets, categories, privacyMode]
  );

  useWebMCP({
    name: "get_budget_summary",
    description:
      "Get a budget summary for a given month including total income, expenses, net savings, budget utilization, and top spending categories.",
    inputSchema: {
      month: GetBudgetSummaryInput.shape.month,
    },
    handler,
    annotations: { readOnlyHint: true },
  });
}
