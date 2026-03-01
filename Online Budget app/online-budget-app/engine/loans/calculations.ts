/**
 * Loan Calculations — thin re-exports from calculator engine
 *
 * The amortization engine in engine/calculators/amortization.ts already
 * implements everything needed. We re-export here for cleaner imports
 * from loan-related components.
 */

export {
  calculateMonthlyPayment,
  generateAmortizationSchedule,
  calculateAffordability,
} from "@/engine/calculators/amortization";

export type {
  AmortizationInput,
  AmortizationResult,
  AmortizationEntry,
} from "@/engine/calculators/types";
