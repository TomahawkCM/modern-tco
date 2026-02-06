/**
 * Excel Export Types
 * TypeScript interfaces for world-class Excel export functionality
 */

import type { Worksheet, Style, Fill, Border, Font, Alignment } from 'exceljs';

/**
 * Sheet names for the workbook
 */
export type SheetName =
  | 'Dashboard'
  | 'Transactions'
  | 'Monthly Summary'
  | 'Category Analysis'
  | 'Accounts'
  | 'Budgets'
  | 'Subscriptions'
  | 'Loans'
  | 'Investments'
  | 'Net Worth'
  | 'Goals'
  | 'Data Dictionary';

/**
 * Excel export options
 */
export interface ExcelExportOptions {
  // Date filtering
  dateRange: 'all' | 'ytd' | 'last12months' | 'last6months' | 'last3months' | 'custom';
  startDate?: Date;
  endDate?: Date;

  // Content selection
  includeTransactions: boolean;
  includeAccounts: boolean;
  includeBudgets: boolean;
  includeSubscriptions: boolean;
  includeLoans: boolean;
  includeInvestments: boolean;
  includeGoals: boolean;

  // Presentation options
  includeDashboard: boolean;
  includeCharts: boolean;
  includeFormulas: boolean;
  includeMonthlySummary: boolean;
  includeCategoryAnalysis: boolean;
  includeNetWorth: boolean;
  includeDataDictionary: boolean;

  // Output
  filename?: string;
}

/**
 * Default export options
 */
export const DEFAULT_EXCEL_OPTIONS: ExcelExportOptions = {
  dateRange: 'last12months',
  includeTransactions: true,
  includeAccounts: true,
  includeBudgets: true,
  includeSubscriptions: true,
  includeLoans: true,
  includeInvestments: true,
  includeGoals: true,
  includeDashboard: true,
  includeCharts: true,
  includeFormulas: true,
  includeMonthlySummary: true,
  includeCategoryAnalysis: true,
  includeNetWorth: true,
  includeDataDictionary: true,
};

/**
 * Color palette for the workbook
 * Uses the Budget App's teal brand color as primary
 */
export const EXCEL_COLORS = {
  // Brand colors
  primary: '14B8A6', // Teal-500 (brand color)
  primaryLight: 'CCFBF1', // Teal-100
  primaryDark: '0D9488', // Teal-600

  // Semantic colors
  income: '10B981', // Emerald-500 (green for income)
  incomeLight: 'D1FAE5', // Emerald-100
  expense: 'EF4444', // Red-500
  expenseLight: 'FEE2E2', // Red-100
  warning: 'F59E0B', // Amber-500
  warningLight: 'FEF3C7', // Amber-100

  // Status colors
  onTrack: '10B981', // Green
  overBudget: 'EF4444', // Red
  underBudget: '3B82F6', // Blue

  // Neutral colors
  headerBg: '14B8A6', // Teal header
  headerText: 'FFFFFF', // White text
  subheaderBg: 'F3F4F6', // Gray-100
  subheaderText: '374151', // Gray-700
  rowEven: 'F9FAFB', // Gray-50
  rowOdd: 'FFFFFF', // White
  border: 'E5E7EB', // Gray-200
  text: '111827', // Gray-900
  textMuted: '6B7280', // Gray-500
} as const;

/**
 * Number format patterns
 */
export const NUMBER_FORMATS = {
  currency: '"$"#,##0.00',
  currencyAccounting: '"$"#,##0.00_);[Red]("$"#,##0.00)',
  currencyPositiveGreen: '[Green]"$"#,##0.00;[Red]-"$"#,##0.00',
  percent: '0.0%',
  percentWhole: '0%',
  number: '#,##0',
  numberDecimal: '#,##0.00',
  date: 'YYYY-MM-DD',
  dateShort: 'MMM D',
  dateLong: 'MMMM D, YYYY',
  month: 'YYYY-MM',
  monthName: 'MMMM YYYY',
} as const;

/**
 * Cell style presets
 */
export interface CellStylePreset {
  font?: Partial<Font>;
  fill?: Fill;
  border?: Partial<Border>;
  alignment?: Partial<Alignment>;
  numFmt?: string;
}

/**
 * Chart configuration
 */
export interface ChartConfig {
  type: 'pie' | 'bar' | 'line' | 'column' | 'doughnut';
  title: string;
  position: {
    topLeftCell: string;
    bottomRightCell: string;
  };
  dataRange: string;
  labelsRange?: string;
  seriesNames?: string[];
  showLegend?: boolean;
  showDataLabels?: boolean;
}

/**
 * Dashboard metric configuration
 */
export interface DashboardMetric {
  label: string;
  value: number | string;
  format?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number | string;
  color?: string;
}

/**
 * Monthly summary row data
 */
export interface MonthlySummaryRow {
  month: string;
  monthDisplay: string;
  income: number;
  expenses: number;
  net: number;
  savingsRate: number;
  vsPrevMonth: number;
  transactionCount: number;
}

/**
 * Category analysis row data
 */
export interface CategoryAnalysisRow {
  category: string;
  color: string;
  icon?: string;
  budget: number;
  actual: number;
  remaining: number;
  percentUsed: number;
  transactionCount: number;
  avgTransaction: number;
  subcategories?: {
    name: string;
    amount: number;
    count: number;
  }[];
}

/**
 * Net worth snapshot
 */
export interface NetWorthSnapshot {
  date: Date;
  assets: {
    cashChecking: number;
    savings: number;
    investments: number;
    other: number;
    total: number;
  };
  liabilities: {
    creditCards: number;
    loans: number;
    other: number;
    total: number;
  };
  netWorth: number;
}

/**
 * Loan with amortization data
 */
export interface LoanAmortizationData {
  loanId: string;
  loanName: string;
  type: string;
  originalAmount: number;
  currentBalance: number;
  interestRate: number;
  monthlyPayment: number;
  remainingMonths: number;
  totalInterest: number;
  schedule: AmortizationEntry[];
  extraPaymentScenarios?: ExtraPaymentScenario[];
}

/**
 * Amortization entry
 */
export interface AmortizationEntry {
  paymentNumber: number;
  date: Date;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  cumulativeInterest: number;
}

/**
 * Extra payment scenario analysis
 */
export interface ExtraPaymentScenario {
  extraAmount: number;
  interestSaved: number;
  monthsSaved: number;
  newPayoffDate: Date;
}

/**
 * Investment holding with market data
 */
export interface InvestmentHoldingData {
  accountName: string;
  accountType: string;
  symbol: string;
  name?: string;
  shares: number;
  costBasis: number;
  currentPrice: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

/**
 * Goals/savings progress data
 */
export interface GoalProgressData {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  remaining: number;
  progress: number; // 0-100
  monthlyContribution: number;
  targetDate: Date;
  onTrack: boolean;
  projectedDate?: Date;
}

/**
 * Data dictionary entry
 */
export interface DataDictionaryEntry {
  sheet: string;
  column: string;
  description: string;
  dataType: string;
  example: string;
  notes?: string;
}

/**
 * Export progress callback
 */
export interface ExportProgress {
  stage: 'preparing' | 'transactions' | 'summaries' | 'charts' | 'finalizing';
  currentSheet?: string;
  sheetsCompleted: number;
  totalSheets: number;
  percent: number;
  message: string;
}

export type ExportProgressCallback = (progress: ExportProgress) => void;

/**
 * Export result
 */
export interface ExcelExportResult {
  success: boolean;
  filename: string;
  fileSize: number;
  sheetsIncluded: SheetName[];
  transactionCount: number;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  generatedAt: Date;
  error?: string;
}
