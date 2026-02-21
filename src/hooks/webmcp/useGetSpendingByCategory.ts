/**
 * WebMCP Tool: get_spending_by_category
 * Returns spending (or income) grouped by category for a month.
 */

import { useCallback } from "react";
import { useWebMCP } from "@mcp-b/react-webmcp";
import type { Transaction, Category, Budget } from "@/types/budget";
import { GetSpendingByCategoryInput } from "./schemas";
import { sumAmounts, roundToCents } from "@/lib/money";

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function useGetSpendingByCategory(
  transactions: Transaction[],
  categories: Category[],
  budgets: Budget[],
  privacyMode: boolean
): BudgetToolHandler {
  const handler = useCallback(
    async (input: Record<string, unknown>) => {
      if (privacyMode) {
        return { error: "Privacy mode is active. Financial data is hidden." };
      }

      const args = GetSpendingByCategoryInput.parse(input);
      const month = args.month || getCurrentMonth();
      const [yearStr, monthStr] = month.split("-");
      const year = parseInt(yearStr, 10);
      const monthNum = parseInt(monthStr, 10);

      // Filter transactions for the target month and type
      const monthTxs = transactions.filter((tx) => {
        const d = new Date(tx.date);
        if (d.getFullYear() !== year || d.getMonth() + 1 !== monthNum) return false;
        if (args.type === "expense") return tx.amount < 0;
        if (args.type === "income") return tx.amount > 0;
        return true;
      });

      // Group by category
      const categoryMap = new Map(categories.map((c) => [c.id, c]));
      const categoryNameMap = new Map(categories.map((c) => [c.name, c]));
      const spending = new Map<string, { amounts: number[]; count: number }>();

      for (const tx of monthTxs) {
        const cat = tx.category || "Uncategorized";
        const entry = spending.get(cat) || { amounts: [], count: 0 };
        entry.amounts.push(Math.abs(tx.amount));
        entry.count++;
        spending.set(cat, entry);
      }

      const totalAmount = sumAmounts(monthTxs.map((tx) => Math.abs(tx.amount)));

      // Build budget map for this month
      const budgetByCategoryId = new Map<string, number>();
      for (const b of budgets) {
        const start = new Date(b.startDate);
        const end = b.endDate ? new Date(b.endDate) : null;
        const targetStart = new Date(year, monthNum - 1, 1);
        const targetEnd = new Date(year, monthNum, 0);
        if (start <= targetEnd && (!end || end >= targetStart)) {
          const monthlyAmt = b.period === "annual" ? b.amount / 12 : b.amount;
          budgetByCategoryId.set(b.categoryId, monthlyAmt);
        }
      }

      const result = Array.from(spending.entries())
        .map(([cat, data]) => {
          const spent = roundToCents(sumAmounts(data.amounts));
          const catObj = categoryMap.get(cat) || categoryNameMap.get(cat);
          const catName = catObj?.name || cat;
          const budgeted = budgetByCategoryId.get(catObj?.id || cat) || 0;

          return {
            category: catName,
            spent,
            budgeted: roundToCents(budgeted),
            remaining: budgeted > 0 ? roundToCents(budgeted - spent) : 0,
            percentage: totalAmount > 0 ? roundToCents((spent / totalAmount) * 100) : 0,
            transactionCount: data.count,
            color: catObj?.color || "#64748b",
          };
        })
        .sort((a, b) => b.spent - a.spent);

      return {
        month,
        type: args.type,
        categories: result.slice(0, 100),
        totalAmount: roundToCents(totalAmount),
      };
    },
    [transactions, categories, budgets, privacyMode]
  );

  useWebMCP({
    name: "get_spending_by_category",
    description:
      "Get spending or income grouped by category for a given month, including budget utilization per category.",
    inputSchema: {
      month: GetSpendingByCategoryInput.shape.month,
      type: GetSpendingByCategoryInput.shape.type,
    },
    handler,
    annotations: { readOnlyHint: true },
  });

  return handler;
}
