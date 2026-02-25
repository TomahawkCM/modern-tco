/**
 * Budgeting Module
 *
 * Responsibilities:
 * - Budget progress calculations
 * - Over-budget detection
 */

export type {
  BudgetLimit,
  CategoryActualSpending,
  BudgetProgressItem,
} from "./budget-progress";
export {
  computeBudgetProgress,
  computeBudgetProgressFromTransactions,
} from "./budget-progress";
