/**
 * Financial Engine Types
 *
 * Core type definitions for the financial calculation engine.
 * Used across compounding, inflation, retirement, and amortization modules.
 */

/** How frequently interest compounds */
export type CompoundingFrequency =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "semiannually"
  | "annually";

/** Map compounding frequency to periods per year */
export const COMPOUNDING_PERIODS: Record<CompoundingFrequency, number> = {
  daily: 365,
  weekly: 52,
  monthly: 12,
  quarterly: 4,
  semiannually: 2,
  annually: 1,
};

/** A point on a financial timeline projection */
export interface TimelinePoint {
  /** Period index (month or year depending on context) */
  period: number;
  /** Balance at this point */
  balance: number;
  /** Cumulative contributions (including initial) */
  contributions: number;
  /** Cumulative interest/growth earned */
  interest: number;
}

/** A set of economic/financial assumptions */
export interface AssumptionSet {
  /** Identifier for this assumption set */
  id: string;
  /** Display name */
  name: string;
  /** Annual inflation rate (percent, e.g. 3.0) */
  inflationRate: number;
  /** Pre-retirement annual return rate (percent) */
  preRetirementReturn: number;
  /** Post-retirement annual return rate (percent) */
  postRetirementReturn: number;
  /** Safe withdrawal rate (percent, e.g. 4.0) */
  safeWithdrawalRate: number;
  /** Social Security / government pension assumptions */
  socialSecurityAge: number;
  socialSecurityMonthly: number;
  /** Life expectancy for planning */
  lifeExpectancy: number;
  /** Tax rate (percent, for rough after-tax calculations) */
  taxRate: number;
  /** Timestamp when saved */
  updatedAt: number;
}

// ==========================================
// Compound Interest
// ==========================================

export interface CompoundInterestInput {
  /** Initial deposit / present value */
  principal: number;
  /** Regular contribution per period */
  periodicContribution: number;
  /** Annual interest rate (percent, e.g. 7.0) */
  annualRate: number;
  /** Number of years */
  years: number;
  /** How frequently interest compounds */
  compoundingFrequency: CompoundingFrequency;
  /** Whether contributions are made at start or end of period */
  contributionTiming?: "beginning" | "end";
}

export interface CompoundInterestResult {
  /** Final balance */
  futureValue: number;
  /** Total amount contributed (principal + contributions) */
  totalContributions: number;
  /** Total interest earned */
  totalInterest: number;
  /** Effective annual rate accounting for compounding */
  effectiveAnnualRate: number;
  /** Year-by-year projection */
  timeline: TimelinePoint[];
}

// ==========================================
// Inflation
// ==========================================

export interface InflationInput {
  /** Current amount in today's dollars */
  currentAmount: number;
  /** Annual inflation rate (percent) */
  annualInflationRate: number;
  /** Number of years to project */
  years: number;
}

export interface InflationResult {
  /** Purchasing power after inflation */
  futureValue: number;
  /** Total purchasing power lost */
  purchasingPowerLost: number;
  /** Percentage of purchasing power remaining */
  purchasingPowerPercent: number;
  /** Year-by-year purchasing power data */
  timeline: { year: number; nominalValue: number; realValue: number }[];
}

// ==========================================
// Retirement
// ==========================================

export interface RetirementInput {
  /** Current age */
  currentAge: number;
  /** Desired retirement age */
  retirementAge: number;
  /** Current retirement savings */
  currentSavings: number;
  /** Monthly contribution */
  monthlyContribution: number;
  /** Desired monthly income in retirement (today's dollars) */
  desiredMonthlyIncome: number;
  /** Annual return rate during accumulation (percent) */
  preRetirementReturn: number;
  /** Annual return rate during withdrawal (percent) */
  postRetirementReturn: number;
  /** Annual inflation rate (percent) */
  inflationRate: number;
  /** Expected life expectancy */
  lifeExpectancy: number;
  /** Social Security monthly amount (0 if none) */
  socialSecurityMonthly: number;
  /** Age when Social Security begins */
  socialSecurityStartAge: number;
}

export interface RetirementResult {
  /** Balance at retirement */
  balanceAtRetirement: number;
  /** Monthly withdrawal amount (inflation-adjusted) */
  monthlyWithdrawal: number;
  /** Number of years savings will last */
  yearsMoneyLasts: number;
  /** Age when money runs out (null if never) */
  ageMoneyRunsOut: number | null;
  /** Whether savings last through life expectancy */
  isSufficient: boolean;
  /** Shortfall or surplus at life expectancy */
  shortfallOrSurplus: number;
  /** Year-by-year timeline */
  timeline: RetirementTimelinePoint[];
}

export interface RetirementTimelinePoint {
  /** Age at this point */
  age: number;
  /** Year (period index) */
  year: number;
  /** Balance at start of year */
  balance: number;
  /** Phase: accumulation or withdrawal */
  phase: "accumulation" | "withdrawal";
  /** Contributions this year (accumulation only) */
  contributions: number;
  /** Growth this year */
  growth: number;
  /** Withdrawals this year (withdrawal only) */
  withdrawals: number;
  /** Social Security income this year */
  socialSecurity: number;
}

// ==========================================
// Amortization (Decimal.js precision)
// ==========================================

export interface AmortizationInput {
  /** Loan principal */
  principal: number;
  /** Annual interest rate (percent) */
  annualRate: number;
  /** Loan term in months */
  termMonths: number;
  /** Extra monthly payment */
  extraPayment?: number;
}

export interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  extraPayment: number;
  balance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

export interface AmortizationResult {
  /** Monthly payment (principal + interest, excluding extra) */
  monthlyPayment: number;
  /** Total amount paid over life of loan */
  totalPaid: number;
  /** Total interest paid */
  totalInterest: number;
  /** Actual payoff months (may be less than term with extra payments) */
  payoffMonths: number;
  /** Full amortization schedule */
  schedule: AmortizationEntry[];
}

export interface AffordabilityInput {
  /** Annual gross income */
  annualIncome: number;
  /** Monthly debt payments (existing) */
  monthlyDebts: number;
  /** Down payment percentage (0-100) */
  downPaymentPercent: number;
  /** Annual interest rate (percent) */
  annualRate: number;
  /** Loan term in months */
  termMonths: number;
  /** Maximum DTI ratio (percent, default 36) */
  maxDTI?: number;
}

export interface AffordabilityResult {
  /** Maximum home price you can afford */
  maxHomePrice: number;
  /** Maximum loan amount */
  maxLoanAmount: number;
  /** Down payment amount */
  downPayment: number;
  /** Monthly mortgage payment */
  monthlyPayment: number;
  /** Debt-to-income ratio (percent) */
  dtiRatio: number;
}
