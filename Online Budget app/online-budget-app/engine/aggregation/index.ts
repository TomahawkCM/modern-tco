/**
 * Transaction Aggregation Module
 *
 * Responsibilities:
 * - Income vs expense computation
 * - Category totals
 * - Time-window filtering
 */

export type {
  TransactionForAggregation,
  IncomeExpenseSummary,
} from "./types";
export type {
  TransactionForCategoryAggregation,
  CategorySpending,
  CategorySpendingResult,
} from "./category-spending";
export { aggregateIncomeExpense } from "./income-expense";
export { aggregateByCategory } from "./category-spending";
