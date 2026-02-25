/**
 * Financial Engine
 *
 * Core financial calculation library for the Budget App.
 * All functions use Decimal.js internally for precision,
 * accept/return plain numbers for ease of use.
 */

// Types
export type {
  CompoundingFrequency,
  TimelinePoint,
  AssumptionSet,
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
} from "./types";

export { COMPOUNDING_PERIODS } from "./types";

// Compounding
export { futureValue, presentValue, pmt, nper, compoundInterest } from "./compounding";

// Inflation
export { adjustForInflation, purchasingPowerOverTime, realReturnRate } from "./inflation";

// Retirement
export { calculateRetirement } from "./retirement";

// Amortization
export {
  calculateMonthlyPayment,
  generateAmortizationSchedule,
  calculateAffordability,
} from "./amortization";

// Assumptions
export {
  DEFAULT_ASSUMPTIONS,
  CONSERVATIVE_ASSUMPTIONS,
  AGGRESSIVE_ASSUMPTIONS,
  loadAssumptions,
  saveAssumptions,
  resetAssumptions,
  getPresetAssumptions,
} from "./assumptions";

// Cash Flow
export type {
  CashFlowFrequency,
  CashFlowStream,
  CashFlowProjectionInput,
  CashFlowMonth,
  CashFlowProjectionResult,
} from "./cashflow";
export { projectCashFlow } from "./cashflow";

// Monte Carlo
export type { MonteCarloInput, MonteCarloPercentile, MonteCarloResult } from "./monte-carlo";
export { runMonteCarlo } from "./monte-carlo";

// Tax Model
export type {
  FilingStatus,
  TaxBracket,
  TaxEstimatorInput,
  TaxBracketBreakdown,
  TaxEstimatorResult,
} from "./tax-model";
export { calculateTaxEstimate, getStandardDeduction, getTaxBrackets } from "./tax-model";

// FIRE Calculator
export type { FIREInput, FIRETimelinePoint, FIREResult } from "./fire";
export { calculateFIRE } from "./fire";

// Net Worth Forecaster
export type {
  Asset,
  Liability,
  NetWorthForecastInput,
  NetWorthTimelinePoint,
  NetWorthForecastResult,
} from "./net-worth-forecast";
export { forecastNetWorth } from "./net-worth-forecast";

// Export
export type { ExportColumn, ExportOptions } from "./export";
export {
  toCSV,
  toJSON,
  exportCSV,
  exportJSON,
  downloadFile,
  COMPOUND_INTEREST_COLUMNS,
  AMORTIZATION_COLUMNS,
  RETIREMENT_COLUMNS,
  INFLATION_COLUMNS,
} from "./export";
