/**
 * Insights Module
 *
 * Deterministic insight computation functions.
 * All functions are pure — no DB, no AI, no side effects.
 * AI narrative layer consumes these outputs.
 *
 * Submodules:
 * - spending-trends    Category spending vs baseline comparison
 * - anomaly-detection  Flags unusual spending deviations
 * - subscription-detection  Identifies recurring charges
 * - affordability      "Can I afford X?" calculator
 * - health-score       Composite financial health score
 */
export type {
  CategorySpend,
  SpendingTrendsInput,
  SpendingTrend,
} from "./spending-trends";
export {
  computeSpendingTrends,
  computeSpendingTrendsFromTransactions,
} from "./spending-trends";

export type {
  AnomalyDetectionInput,
  SpendingAnomaly,
} from "./anomaly-detection";
export {
  detectAnomalies,
  detectAnomaliesFromTransactions,
} from "./anomaly-detection";

export type {
  TransactionForSubscription,
  SubscriptionDetectionInput,
  DetectedSubscription,
} from "./subscription-detection";
export { detectSubscriptions } from "./subscription-detection";

export type {
  AffordabilityInput,
  AffordabilityResult,
} from "./affordability";
export {
  computeAffordability,
  computeAffordabilityFromSummary,
} from "./affordability";

export type {
  HealthScoreInput,
  HealthScoreComponents,
  HealthScoreResult,
} from "./health-score";
export { computeFinancialHealthScore } from "./health-score";
