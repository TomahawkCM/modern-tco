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
export { aggregateIncomeExpense } from "./income-expense";
