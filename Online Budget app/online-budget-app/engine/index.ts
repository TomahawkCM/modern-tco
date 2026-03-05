/**
 * Unified Shared Financial Engine — Entry Point
 *
 * This is the single source of financial truth.
 * All financial calculations must live in /engine.
 *
 * Modules:
 * - money/           ISO 4217 currency, minor units, rounding
 * - aggregation/     Income vs expense, category totals, time windows
 * - categorization/  Rule-based transaction classification, merchant matching
 * - budgeting/       Monthly category budgets, rollover, progress
 * - goals/           Goal progress, time-to-target estimation
 * - insights/        Spending trends, anomalies, subscriptions, affordability, health score
 * - projections/     Forecasting, scenario modeling, FX display conversion
 * - calculators/     14 financial calculator engines (compound interest, retirement, FIRE, etc.)
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
  convertMinor,
} from "./money";

// Aggregation module
export type {
  TransactionForAggregation,
  IncomeExpenseSummary,
  TransactionForCategoryAggregation,
  CategorySpending,
  CategorySpendingResult,
} from "./aggregation";
export { aggregateIncomeExpense, aggregateByCategory } from "./aggregation";

// Categorization module
export type { CategorizationResult, MerchantRule, PatternRule } from "./categorization";
export { categorize, extractMerchantToken, PATTERN_RULES } from "./categorization";

// Budgeting module
export type {
  BudgetLimit,
  CategoryActualSpending,
  BudgetProgressItem,
  SafeToSpendInput,
  SafeToSpendResult,
  BudgetMethodology,
  MethodologyAllocation,
  MethodologyGuide,
} from "./budgeting";
export {
  computeBudgetProgress,
  computeBudgetProgressFromTransactions,
  computeSafeToSpend,
  METHODOLOGIES,
  computeFiftyThirtyTwenty,
  computePayYourselfFirst,
  computeZeroBasedStatus,
} from "./budgeting";

// Goals module
export type { GoalInput, GoalProgressResult } from "./goals";
export { computeGoalProgress } from "./goals";

// Insights module
export type {
  CategorySpend,
  SpendingTrendsInput,
  SpendingTrend,
  AnomalyDetectionInput,
  SpendingAnomaly,
  TransactionForSubscription,
  SubscriptionDetectionInput,
  DetectedSubscription,
  AffordabilityInput,
  AffordabilityResult,
  HealthScoreInput,
  HealthScoreComponents,
  HealthScoreResult,
} from "./insights";
export {
  computeSpendingTrends,
  computeSpendingTrendsFromTransactions,
  detectAnomalies,
  detectAnomaliesFromTransactions,
  detectSubscriptions,
  computeAffordability,
  computeAffordabilityFromSummary,
  computeFinancialHealthScore,
} from "./insights";

// Calculators module — financial projection engines
// Re-exported as namespace to avoid name conflicts with insights module
// (both have AffordabilityInput/Result, but for different purposes)
export * as calculators from "./calculators";
