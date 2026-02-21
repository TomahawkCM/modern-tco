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
