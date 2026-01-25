/**
 * Financial Calculator Types
 *
 * Type definitions for all financial calculators
 */

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
// Debt Payoff Calculator
// ==========================================

export interface DebtAccount {
  id: string;
  name: string;
  balance: number;
  apr: number; // Annual percentage rate
  minimumPayment: number;
}

export type DebtStrategy = 'snowball' | 'avalanche';

export interface DebtPayoffInput {
  debts: DebtAccount[];
  extraMonthlyPayment: number;
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
  interestSaved: number; // Avalanche saves this much
  monthsSaved: number; // Difference in payoff time
  recommendedStrategy: DebtStrategy;
}

// ==========================================
// Savings Goal Calculator
// ==========================================

export type SavingsGoalMode = 'when' | 'howMuch';

export interface SavingsGoalInput {
  mode: SavingsGoalMode;
  goalAmount: number;
  currentSavings: number;
  // For 'when' mode
  monthlyContribution?: number;
  // For 'howMuch' mode
  targetDate?: Date;
  // Optional
  expectedAnnualReturn?: number; // Percentage
}

export interface SavingsGoalResult {
  // For 'when' mode
  monthsToGoal?: number;
  completionDate?: Date;
  // For 'howMuch' mode
  requiredMonthlyContribution?: number;
  // Common
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
// Subscription Cost Calculator
// ==========================================

export type SubscriptionFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual';

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

export type BudgetBucket = 'needs' | 'wants' | 'savings';

export interface CategoryMapping {
  categoryId: string;
  categoryName: string;
  bucket: BudgetBucket;
}

export interface BudgetAnalyzerInput {
  monthlyNetIncome: number;
  categoryMappings: CategoryMapping[];
  // Transaction data from the app
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
// Shared Utilities
// ==========================================

export interface CalculatorState<I, R> {
  input: I;
  result: R | null;
  isCalculating: boolean;
  error: string | null;
}

// Default category to bucket mappings
export const DEFAULT_BUCKET_MAPPINGS: Record<string, BudgetBucket> = {
  // Needs (50%)
  'rent': 'needs',
  'mortgage': 'needs',
  'utilities': 'needs',
  'groceries': 'needs',
  'insurance': 'needs',
  'healthcare': 'needs',
  'health': 'needs',
  'medical': 'needs',
  'transportation': 'needs',
  'gas': 'needs',
  'childcare': 'needs',
  'minimum debt payments': 'needs',

  // Wants (30%)
  'dining': 'wants',
  'dining out': 'wants',
  'restaurants': 'wants',
  'entertainment': 'wants',
  'shopping': 'wants',
  'subscriptions': 'wants',
  'streaming': 'wants',
  'hobbies': 'wants',
  'travel': 'wants',
  'vacation': 'wants',
  'clothing': 'wants',
  'personal care': 'wants',
  'gifts': 'wants',

  // Savings (20%)
  'savings': 'savings',
  'investments': 'savings',
  'emergency fund': 'savings',
  'retirement': 'savings',
  '401k': 'savings',
  'rrsp': 'savings',
  'tfsa': 'savings',
  'debt repayment': 'savings', // Extra debt payments beyond minimum
};
