/**
 * Budgeting Module
 *
 * Responsibilities:
 * - Budget progress calculations
 * - Over-budget detection
 * - Safe-to-spend computation
 */

export type { BudgetLimit, CategoryActualSpending, BudgetProgressItem } from "./budget-progress";
export { computeBudgetProgress, computeBudgetProgressFromTransactions } from "./budget-progress";

export type { SafeToSpendInput, SafeToSpendResult } from "./safe-to-spend";
export { computeSafeToSpend } from "./safe-to-spend";

export type { BudgetMethodology, MethodologyAllocation, MethodologyGuide } from "./methodology";
export {
  METHODOLOGIES,
  computeFiftyThirtyTwenty,
  computePayYourselfFirst,
  computeZeroBasedStatus,
} from "./methodology";
