/**
 * Unified Shared Financial Engine — Entry Point
 *
 * This is the single source of financial truth.
 * All financial calculations must live in /engine.
 *
 * Modules:
 * - money/        ISO 4217 currency, minor units, rounding
 * - budgeting/    Monthly category budgets, rollover, progress
 * - aggregation/  Income vs expense, category totals, time windows
 * - goals/        Goal progress, time-to-target estimation
 * - projections/  Forecasting, scenario modeling, FX display conversion
 */
export { ENGINE_VERSION } from "./version";

// Money module
export type { MinorAmount } from "./money";
export {
  minorAmount,
  addMinor,
  subtractMinor,
  sumMinor,
  absMinor,
  toMajorUnits,
  formatMoney,
} from "./money";

// Aggregation module
export type {
  TransactionForAggregation,
  IncomeExpenseSummary,
} from "./aggregation";
export { aggregateIncomeExpense } from "./aggregation";
