/**
 * Chat context builder — serializes engine output into token-budgeted JSON for chat LLM.
 *
 * Pure function. No DB, no AI calls, no side effects.
 * No financial math. All values passed through from engine unchanged.
 *
 * DATA EXPOSURE BOUNDARY:
 * - Only aggregated summaries (never raw transactions)
 * - No account numbers, transaction IDs, merchant names
 * - No PII (no user_id, no email)
 * - Categories capped at MAX_CATEGORIES for token budget
 * - Expenses shown as positive (Math.abs applied for LLM clarity)
 *
 * Token budget: ~400 tokens (top 5 categories + active budgets).
 */
import type { IncomeExpenseSummary } from "../engine/aggregation/types";
import type { CategorySpendingResult } from "../engine/aggregation/category-spending";
import type { BudgetProgressItem } from "../engine/budgeting/budget-progress";

const MAX_CATEGORIES = 5;
const MAX_MESSAGE_LENGTH = 500;

export function buildChatContext(
  summary: IncomeExpenseSummary,
  categorySpending: CategorySpendingResult,
  budgetProgress: readonly BudgetProgressItem[],
  currency: string,
  period: string
): string {
  return JSON.stringify({
    type: "financial_context",
    currency,
    unit: "minor",
    period,
    incomeExpense: {
      totalIncomeMinor: summary.totalIncome.amountMinor,
      totalExpenseMinor: Math.abs(summary.totalExpense.amountMinor),
      netMinor: summary.net.amountMinor,
      transactionCount: summary.transactionCount,
    },
    topCategories: categorySpending.categories
      .slice(0, MAX_CATEGORIES)
      .map((c) => ({
        category: c.categoryKey,
        totalMinor: Math.abs(c.total.amountMinor),
        percent: c.percentageOfTotal,
      })),
    budgetStatus: budgetProgress.map((b) => ({
      category: b.categoryKey,
      limitMinor: b.limitMinor,
      spentMinor: b.spentMinor,
      percentUsed: b.percentUsed,
    })),
  });
}

/**
 * Sanitize user message before sending to LLM.
 *
 * - Strips control characters (except \n, \t)
 * - Trims whitespace
 * - Truncates to MAX_MESSAGE_LENGTH characters
 */
export function sanitizeUserMessage(message: string): string {
  // Strip control chars except newline (\x0A) and tab (\x09)
  const cleaned = message.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  return cleaned.trim().slice(0, MAX_MESSAGE_LENGTH);
}
