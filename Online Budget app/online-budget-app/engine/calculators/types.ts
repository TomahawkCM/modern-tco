/**
 * Financial Calculator Types
 *
 * Core type definitions for all financial calculators.
 * Ported from offline app's financial-engine/types.ts and calculators/types.ts.
 *
 * Calculator engines use regular numbers (major units / floats) for inputs
 * and internal math — these are projections, not real transactions.
 * Use formatMoney() from ../money for display only.
 */

// ==========================================
// Compound Interest
// ==========================================

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
// Amortization
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

// ==========================================
// FIRE (Financial Independence, Retire Early)
// ==========================================

export interface FIREInput {
  /** Current age */
  currentAge: number;
  /** Annual gross income */
  annualIncome: number;
  /** Annual expenses (current spending) */
  annualExpenses: number;
  /** Current investment/savings balance */
  currentSavings: number;
  /** Expected annual return on investments (percent, e.g. 7.0) */
  expectedReturn: number;
  /** Safe withdrawal rate (percent, default 4.0) */
  safeWithdrawalRate?: number;
  /** Annual inflation rate (percent, default 3.0) */
  inflationRate?: number;
}

export interface FIRETimelinePoint {
  /** Age at this point */
  age: number;
  /** Year index (0 = now) */
  year: number;
  /** Portfolio balance */
  balance: number;
  /** Annual savings that year */
  annualSavings: number;
  /** FIRE number target at this year (inflation-adjusted) */
  fireTarget: number;
  /** Whether FIRE has been reached */
  fireReached: boolean;
}

export interface FIREResult {
  /** The FIRE number (portfolio needed to sustain expenses at SWR) */
  fireNumber: number;
  /** Years until FIRE is achieved */
  yearsToFIRE: number;
  /** Age at which FIRE is achieved */
  fireAge: number;
  /** Current savings rate (percent) */
  savingsRate: number;
  /** Annual savings amount */
  annualSavings: number;
  /** Monthly savings amount */
  monthlySavings: number;
  /** Whether FIRE is already achieved */
  alreadyFIRE: boolean;
  /** Projected annual income from portfolio at FIRE (in today's dollars) */
  annualPassiveIncome: number;
  /** Coast FIRE number (amount needed now to reach FIRE by 65 with no more savings) */
  coastFIRENumber: number;
  /** Whether Coast FIRE is achieved */
  coastFIREReached: boolean;
  /** Lean FIRE number (50% of regular FIRE, minimal expenses) */
  leanFIRENumber: number;
  /** Fat FIRE number (200% of regular FIRE, comfortable expenses) */
  fatFIRENumber: number;
  /** Year-by-year timeline */
  timeline: FIRETimelinePoint[];
}

// ==========================================
// Monte Carlo Simulation
// ==========================================

export interface MonteCarloInput {
  /** Initial portfolio balance */
  initialBalance: number;
  /** Monthly contribution (0 for withdrawal-only scenarios) */
  monthlyContribution: number;
  /** Monthly withdrawal (0 for accumulation-only scenarios) */
  monthlyWithdrawal: number;
  /** Expected annual return (percent, e.g. 7.0) */
  expectedAnnualReturn: number;
  /** Annual return standard deviation (percent, e.g. 15.0) */
  annualVolatility: number;
  /** Annual inflation rate (percent, applied to withdrawals) */
  inflationRate?: number;
  /** Number of years to simulate */
  years: number;
  /** Number of simulations to run (default: 1000) */
  simulations?: number;
  /** Random seed for reproducibility */
  seed?: number;
}

export interface MonteCarloPercentile {
  /** Year index */
  year: number;
  /** 10th percentile balance (worst-case) */
  p10: number;
  /** 25th percentile */
  p25: number;
  /** 50th percentile (median) */
  p50: number;
  /** 75th percentile */
  p75: number;
  /** 90th percentile (best-case) */
  p90: number;
}

export interface MonteCarloResult {
  /** Percentile bands by year */
  percentiles: MonteCarloPercentile[];
  /** Probability of success (balance > 0 at end) */
  successRate: number;
  /** Number of simulations that ran out of money */
  failureCount: number;
  /** Median final balance */
  medianFinalBalance: number;
  /** Total simulations run */
  totalSimulations: number;
}

// ==========================================
// Tax Estimator
// ==========================================

export type FilingStatus =
  | "single"
  | "married_jointly"
  | "married_separately"
  | "head_of_household";

export interface TaxBracket {
  /** Minimum taxable income for this bracket */
  min: number;
  /** Maximum taxable income for this bracket (Infinity for top bracket) */
  max: number;
  /** Marginal tax rate (percent, e.g. 22) */
  rate: number;
}

export interface TaxEstimatorInput {
  /** Gross annual income */
  grossIncome: number;
  /** Filing status */
  filingStatus: FilingStatus;
  /** Use itemized deductions instead of standard */
  useItemized?: boolean;
  /** Total itemized deductions (only used if useItemized is true) */
  itemizedDeductions?: number;
  /** Pre-tax retirement contributions (401k, IRA) */
  retirementContributions?: number;
  /** Other above-the-line deductions (HSA, student loan interest) */
  otherDeductions?: number;
}

export interface TaxBracketBreakdown {
  /** Tax bracket rate (percent) */
  rate: number;
  /** Taxable income in this bracket */
  taxableInBracket: number;
  /** Tax owed in this bracket */
  taxInBracket: number;
}

export interface TaxEstimatorResult {
  /** Gross income */
  grossIncome: number;
  /** Adjusted Gross Income (after above-the-line deductions) */
  adjustedGrossIncome: number;
  /** Deduction applied (standard or itemized) */
  deductionAmount: number;
  /** Whether standard or itemized was used */
  deductionType: "standard" | "itemized";
  /** Taxable income after deductions */
  taxableIncome: number;
  /** Total federal income tax */
  totalTax: number;
  /** Effective tax rate (percent) */
  effectiveTaxRate: number;
  /** Marginal tax rate (percent, the bracket you're in) */
  marginalTaxRate: number;
  /** Take-home pay (after federal income tax only) */
  takeHomePay: number;
  /** Monthly take-home */
  monthlyTakeHome: number;
  /** Bracket-by-bracket breakdown */
  bracketBreakdown: TaxBracketBreakdown[];
}

// ==========================================
// Net Worth Forecast
// ==========================================

export interface Asset {
  /** Display name */
  name: string;
  /** Current value */
  currentValue: number;
  /** Expected annual growth rate (percent, e.g. 7.0 for stocks, 3.0 for home) */
  annualGrowthRate: number;
  /** Monthly contribution to this asset (e.g. 401k contribution) */
  monthlyContribution?: number;
}

export interface Liability {
  /** Display name */
  name: string;
  /** Current balance (positive number) */
  currentBalance: number;
  /** Annual interest rate (percent) */
  annualRate: number;
  /** Monthly payment */
  monthlyPayment: number;
}

export interface NetWorthForecastInput {
  /** List of assets */
  assets: Asset[];
  /** List of liabilities */
  liabilities: Liability[];
  /** Number of years to project */
  years: number;
  /** Annual inflation rate (percent, for real value calculation) */
  inflationRate?: number;
}

export interface NetWorthTimelinePoint {
  /** Year index (0 = now) */
  year: number;
  /** Total assets value */
  totalAssets: number;
  /** Total liabilities balance */
  totalLiabilities: number;
  /** Net worth (assets - liabilities) */
  netWorth: number;
  /** Inflation-adjusted net worth */
  realNetWorth: number;
}

export interface NetWorthForecastResult {
  /** Year-by-year timeline */
  timeline: NetWorthTimelinePoint[];
  /** Current net worth */
  currentNetWorth: number;
  /** Projected net worth at end of period */
  projectedNetWorth: number;
  /** Net worth growth (absolute) */
  totalGrowth: number;
  /** Net worth growth rate (percent) */
  growthRate: number;
  /** Year when net worth first hits $1M (null if never) */
  millionaireYear: number | null;
  /** Year when all debt is paid off (null if never or no debt) */
  debtFreeYear: number | null;
}

// ==========================================
// Emergency Fund Calculator
// ==========================================

export interface EmergencyFundInput {
  monthlyExpenses: number;
  targetMonths: number; // 1-12
  currentSavings: number;
  monthlyContribution: number;
}

export interface EmergencyFundResult {
  targetAmount: number;
  amountNeeded: number;
  monthsToGoal: number;
  completionDate: Date;
  progressPercent: number;
  isGoalMet: boolean;
}

// ==========================================
// Savings Goal Calculator
// ==========================================

export type SavingsGoalMode = "when" | "howMuch";

export interface SavingsGoalInput {
  mode: SavingsGoalMode;
  goalAmount: number;
  currentSavings: number;
  /** For 'when' mode */
  monthlyContribution?: number;
  /** For 'howMuch' mode */
  targetDate?: Date;
  /** Optional expected annual return (percentage) */
  expectedAnnualReturn?: number;
}

export interface SavingsGoalResult {
  /** For 'when' mode */
  monthsToGoal?: number;
  completionDate?: Date;
  /** For 'howMuch' mode */
  requiredMonthlyContribution?: number;
  /** Common fields */
  projectedAmount: number;
  totalContributions: number;
  totalInterestEarned: number;
  progressPercent: number;
  projections: {
    month: number;
    date: Date;
    balance: number;
    contributions: number;
    interest: number;
  }[];
}

// ==========================================
// Debt Payoff Calculator
// ==========================================

export interface DebtAccount {
  id: string;
  name: string;
  balance: number;
  apr: number; // Annual percentage rate
  minimumPayment: number;
}

export type DebtStrategy = "snowball" | "avalanche" | "custom" | "minimum_only";

export interface DebtPayoffInput {
  debts: DebtAccount[];
  extraMonthlyPayment: number;
  strategy?: DebtStrategy;
  customOrder?: string[];
  oneTimePayments?: OneTimePayment[];
}

export interface DebtPaymentMonth {
  month: number;
  date: Date;
  payments: {
    debtId: string;
    debtName: string;
    payment: number;
    principal: number;
    interest: number;
    remainingBalance: number;
  }[];
  totalPayment: number;
  totalRemaining: number;
}

export interface StrategyResult {
  strategy: DebtStrategy;
  totalMonths: number;
  totalInterest: number;
  payoffDate: Date;
  schedule: DebtPaymentMonth[];
  debtPayoffOrder: string[]; // IDs in order they get paid off
}

export interface DebtPayoffResult {
  snowball: StrategyResult;
  avalanche: StrategyResult;
  custom?: StrategyResult;
  minimumOnly?: StrategyResult;
  interestSaved: number; // Avalanche saves this much
  monthsSaved: number; // Difference in payoff time
  recommendedStrategy: DebtStrategy;
}

export interface OneTimePayment {
  targetDebtId: string;
  amount: number;
  month: number; // Which month to apply the payment
  label?: string; // Optional descriptive label
}

// ==========================================
// Subscription Cost Calculator
// ==========================================

export type SubscriptionFrequency =
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "annual";

export interface SubscriptionEntry {
  id: string;
  name: string;
  amount: number;
  frequency: SubscriptionFrequency;
  category?: string;
  isEssential: boolean;
  startDate?: Date;
}

export interface SubscriptionCostInput {
  subscriptions: SubscriptionEntry[];
  monthlyIncome?: number; // Optional - to show percentage
}

export interface CategoryBreakdown {
  category: string;
  monthly: number;
  yearly: number;
  count: number;
  subscriptions: SubscriptionEntry[];
}

export interface SubscriptionCostResult {
  totalDaily: number;
  totalWeekly: number;
  totalMonthly: number;
  totalYearly: number;
  essentialMonthly: number;
  nonEssentialMonthly: number;
  percentOfIncome?: number;
  byCategory: CategoryBreakdown[];
  potentialYearlySavings: number; // If all non-essential cut
}

// ==========================================
// 50/30/20 Budget Analyzer
// ==========================================

export type BudgetBucket = "needs" | "wants" | "savings";

export interface CategoryMapping {
  categoryId: string;
  categoryName: string;
  bucket: BudgetBucket;
}

export interface BudgetAnalyzerInput {
  monthlyNetIncome: number;
  categoryMappings: CategoryMapping[];
  transactionTotals: {
    categoryId: string;
    categoryName: string;
    total: number; // Negative for expenses
  }[];
}

export interface BucketAnalysis {
  bucket: BudgetBucket;
  targetPercent: number;
  targetAmount: number;
  actualAmount: number;
  actualPercent: number;
  variance: number;
  variancePercent: number;
  isOverBudget: boolean;
  categories: {
    categoryId: string;
    categoryName: string;
    amount: number;
    percentOfBucket: number;
  }[];
}

export interface BudgetAnalyzerResult {
  needs: BucketAnalysis;
  wants: BucketAnalysis;
  savings: BucketAnalysis;
  totalSpending: number;
  totalSavings: number;
  isBalanced: boolean;
  recommendations: string[];
}

// ==========================================
// Default category-to-bucket mappings
// ==========================================

export const DEFAULT_BUCKET_MAPPINGS: Record<string, BudgetBucket> = {
  // Needs (50%)
  rent: "needs",
  mortgage: "needs",
  utilities: "needs",
  groceries: "needs",
  insurance: "needs",
  healthcare: "needs",
  health: "needs",
  medical: "needs",
  transportation: "needs",
  gas: "needs",
  childcare: "needs",
  "minimum debt payments": "needs",

  // Wants (30%)
  dining: "wants",
  "dining out": "wants",
  restaurants: "wants",
  entertainment: "wants",
  shopping: "wants",
  subscriptions: "wants",
  streaming: "wants",
  hobbies: "wants",
  travel: "wants",
  vacation: "wants",
  clothing: "wants",
  "personal care": "wants",
  gifts: "wants",

  // Savings (20%)
  savings: "savings",
  investments: "savings",
  "emergency fund": "savings",
  retirement: "savings",
  "401k": "savings",
  rrsp: "savings",
  tfsa: "savings",
  "debt repayment": "savings",
};
