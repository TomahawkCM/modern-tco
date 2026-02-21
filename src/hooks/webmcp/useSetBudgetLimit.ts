/**
 * WebMCP Tool: set_budget_limit
 * Write tool that creates or updates a budget limit for a category.
 */

import { useCallback } from "react";
import { useWebMCP } from "@mcp-b/react-webmcp";
import type { Category, Budget } from "@/types/budget";
import { SetBudgetLimitInput } from "./schemas";
import { db } from "@/lib/budget-db";
import { roundToCents } from "@/lib/money";

export function useSetBudgetLimit(
  categories: Category[],
  budgets: Budget[],
  privacyMode: boolean,
  onBudgetUpdated?: () => void
): BudgetToolHandler {
  const handler = useCallback(
    async (input: Record<string, unknown>) => {
      if (privacyMode) {
        return { error: "Privacy mode is active. Financial data is hidden." };
      }

      const args = SetBudgetLimitInput.parse(input);

      // Validate category exists
      const cat = categories.find((c) => c.id === args.categoryId);
      if (!cat) {
        return {
          error: `Category '${args.categoryId}' not found. Use list_categories to see available options.`,
        };
      }

      const amount = roundToCents(args.amount);
      const now = new Date();

      // Check for existing budget for this category
      const existing = budgets.find((b) => b.categoryId === args.categoryId);

      if (existing) {
        // Update existing budget
        await db.budgets.update(existing.id, {
          amount,
          period: args.period,
          rollover: args.rollover,
          updatedAt: now,
        });
        onBudgetUpdated?.();

        return {
          success: true,
          action: "updated",
          budgetId: existing.id,
          categoryId: args.categoryId,
          categoryName: cat.name,
          amount,
          period: args.period,
          rollover: args.rollover,
        };
      }

      // Create new budget
      const budgetId = `budget_webmcp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const budget: Budget = {
        id: budgetId,
        categoryId: args.categoryId,
        amount,
        period: args.period,
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: null,
        rollover: args.rollover,
        createdAt: now,
        updatedAt: now,
      };

      await db.budgets.add(budget);
      onBudgetUpdated?.();

      return {
        success: true,
        action: "created",
        budgetId,
        categoryId: args.categoryId,
        categoryName: cat.name,
        amount,
        period: args.period,
        rollover: args.rollover,
      };
    },
    [categories, budgets, privacyMode, onBudgetUpdated]
  );

  useWebMCP({
    name: "set_budget_limit",
    description:
      "Set or update a budget limit for a category. Creates a new budget if none exists, or updates the existing one.",
    inputSchema: {
      categoryId: SetBudgetLimitInput.shape.categoryId,
      amount: SetBudgetLimitInput.shape.amount,
      period: SetBudgetLimitInput.shape.period,
      rollover: SetBudgetLimitInput.shape.rollover,
    },
    handler,
    annotations: { readOnlyHint: false },
  });

  return handler;
}
