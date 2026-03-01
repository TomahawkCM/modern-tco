/**
 * Financial Calculators — Barrel Export
 *
 * 14 calculator engines for financial projections and planning.
 * All calculators use regular numbers (major units / floats) for
 * inputs and internal math. Use formatMoney() from ../money for display.
 */

// Types
export type {
  CompoundingFrequency,
  TimelinePoint,
  CompoundInterestInput,
  CompoundInterestResult,
  InflationInput,
  InflationResult,
  RetirementInput,
  RetirementResult,
  RetirementTimelinePoint,
  AmortizationInput,
  AmortizationEntry,
  AmortizationResult,
  AffordabilityInput,
  AffordabilityResult,
  FIREInput,
  FIRETimelinePoint,
  FIREResult,
  MonteCarloInput,
  MonteCarloPercentile,
  MonteCarloResult,
  FilingStatus,
  TaxBracket,
  TaxEstimatorInput,
  TaxBracketBreakdown,
  TaxEstimatorResult,
  Asset,
  Liability,
  NetWorthForecastInput,
  NetWorthTimelinePoint,
  NetWorthForecastResult,
  EmergencyFundInput,
  EmergencyFundResult,
  SavingsGoalMode,
  SavingsGoalInput,
  SavingsGoalResult,
  DebtAccount,
  DebtStrategy,
  DebtPayoffInput,
  DebtPaymentMonth,
  StrategyResult,
  DebtPayoffResult,
  OneTimePayment,
  SubscriptionFrequency,
  SubscriptionEntry,
  SubscriptionCostInput,
  CategoryBreakdown,
  SubscriptionCostResult,
  BudgetBucket,
  CategoryMapping,
  BudgetAnalyzerInput,
  BucketAnalysis,
  BudgetAnalyzerResult,
} from "./types";

export { COMPOUNDING_PERIODS, DEFAULT_BUCKET_MAPPINGS } from "./types";

// Compounding
export {
  futureValue,
  presentValue,
  pmt,
  nper,
  compoundInterest,
} from "./compounding";

// Amortization
export {
  calculateMonthlyPayment,
  generateAmortizationSchedule,
  calculateAffordability,
} from "./amortization";

// Retirement
export { calculateRetirement, DEFAULT_ASSUMPTIONS } from "./retirement";

// FIRE
export { calculateFIRE } from "./fire";

// Inflation
export {
  adjustForInflation,
  purchasingPowerOverTime,
  realReturnRate,
} from "./inflation";

// Monte Carlo
export { runMonteCarlo } from "./monte-carlo";

// Tax Model
export {
  calculateTaxEstimate,
  getStandardDeduction,
  getTaxBrackets,
} from "./tax-model";

// Net Worth Forecast
export { forecastNetWorth } from "./net-worth-forecast";

// Emergency Fund
export { calculateEmergencyFund, getRecommendedMonths } from "./emergency-fund";

// Savings Goal
export { calculateSavingsGoal } from "./savings-goal";

// Debt Payoff
export {
  calculateDebtPayoff,
  calculateSingleStrategy,
  loansToDebtAccounts,
  generateDebtId,
} from "./debt-payoff";

// Subscription Cost
export {
  calculateSubscriptionCost,
  toMonthlyCost,
  toYearlyCost,
  generateSubscriptionId,
  SUBSCRIPTION_CATEGORIES,
} from "./subscription-cost";

// Budget Analyzer
export {
  calculateBudgetAnalysis,
  inferBucket,
  generateRecommendations,
  getDefaultMappings,
} from "./budget-analyzer";
