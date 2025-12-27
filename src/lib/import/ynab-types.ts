/**
 * YNAB Import Types (Y-010)
 * TypeScript interfaces for YNAB data structures
 *
 * Supports both nYNAB (current web version) and YNAB4 (legacy desktop)
 */

// ============================================================================
// nYNAB API Types (Current Web Version)
// ============================================================================

/**
 * YNAB uses "milliunits" for currency - 1000 milliunits = $1.00
 */
export type Milliunits = number;

/**
 * YNAB account types
 */
export type YNABAccountType =
  | 'checking'
  | 'savings'
  | 'creditCard'
  | 'cash'
  | 'lineOfCredit'
  | 'otherAsset'
  | 'otherLiability'
  | 'mortgage'
  | 'autoLoan'
  | 'studentLoan'
  | 'personalLoan'
  | 'medicalDebt'
  | 'otherDebt';

/**
 * YNAB transaction cleared status
 */
export type YNABClearedStatus = 'cleared' | 'uncleared' | 'reconciled';

/**
 * YNAB flag colors
 */
export type YNABFlagColor =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | null;

/**
 * YNAB goal types
 * - TB: Target Balance
 * - TBD: Target Balance by Date
 * - MF: Monthly Funding
 * - NEED: Needed for Spending
 * - DEBT: Debt Payment
 */
export type YNABGoalType = 'TB' | 'TBD' | 'MF' | 'NEED' | 'DEBT' | null;

/**
 * YNAB debt transaction types
 */
export type YNABDebtTransactionType =
  | 'payment'
  | 'refund'
  | 'fee'
  | 'interest'
  | 'escrow'
  | 'balanceAdjustment'
  | 'credit'
  | 'charge'
  | null;

/**
 * YNAB Currency Format
 */
export interface YNABCurrencyFormat {
  iso_code: string;
  example_format: string;
  decimal_digits: number;
  decimal_separator: string;
  symbol_first: boolean;
  group_separator: string;
  currency_symbol: string;
  display_symbol: boolean;
}

/**
 * YNAB Budget Summary
 */
export interface YNABBudgetSummary {
  id: string;
  name: string;
  last_modified_on: string;
  first_month: string;
  last_month: string;
  date_format?: {
    format: string;
  };
  currency_format?: YNABCurrencyFormat;
}

/**
 * Full YNAB Budget (from /budgets/{id} endpoint)
 */
export interface YNABBudget extends YNABBudgetSummary {
  accounts: YNABAccount[];
  payees: YNABPayee[];
  payee_locations?: YNABPayeeLocation[];
  category_groups: YNABCategoryGroup[];
  categories: YNABCategory[];
  months: YNABMonth[];
  transactions: YNABTransaction[];
  subtransactions: YNABSubTransaction[];
  scheduled_transactions: YNABScheduledTransaction[];
  scheduled_subtransactions?: YNABScheduledSubTransaction[];
}

/**
 * YNAB Account
 */
export interface YNABAccount {
  id: string;
  name: string;
  type: YNABAccountType;
  on_budget: boolean;
  closed: boolean;
  note: string | null;
  balance: Milliunits;
  cleared_balance: Milliunits;
  uncleared_balance: Milliunits;
  transfer_payee_id: string;
  direct_import_linked: boolean;
  direct_import_in_error: boolean;
  deleted: boolean;
  last_reconciled_at?: string | null;
}

/**
 * YNAB Payee
 */
export interface YNABPayee {
  id: string;
  name: string;
  transfer_account_id: string | null;
  deleted: boolean;
}

/**
 * YNAB Payee Location
 */
export interface YNABPayeeLocation {
  id: string;
  payee_id: string;
  latitude: string;
  longitude: string;
  deleted: boolean;
}

/**
 * YNAB Category Group
 */
export interface YNABCategoryGroup {
  id: string;
  name: string;
  hidden: boolean;
  deleted: boolean;
}

/**
 * YNAB Category
 */
export interface YNABCategory {
  id: string;
  category_group_id: string;
  category_group_name?: string;
  name: string;
  hidden: boolean;
  original_category_group_id: string | null;
  note: string | null;
  budgeted: Milliunits;
  activity: Milliunits;
  balance: Milliunits;
  goal_type: YNABGoalType;
  goal_needs_whole_amount: boolean | null;
  goal_day: number | null;
  goal_cadence: number | null;
  goal_cadence_frequency: number | null;
  goal_creation_month: string | null;
  goal_target: Milliunits | null;
  goal_target_month: string | null;
  goal_percentage_complete: number | null;
  goal_months_to_budget: number | null;
  goal_under_funded: Milliunits | null;
  goal_overall_funded: Milliunits | null;
  goal_overall_left: Milliunits | null;
  deleted: boolean;
}

/**
 * YNAB Month
 */
export interface YNABMonth {
  month: string;
  note: string | null;
  income: Milliunits;
  budgeted: Milliunits;
  activity: Milliunits;
  to_be_budgeted: Milliunits;
  age_of_money: number | null;
  deleted: boolean;
  categories: YNABCategory[];
}

/**
 * YNAB Transaction
 */
export interface YNABTransaction {
  id: string;
  date: string;
  amount: Milliunits;
  memo: string | null;
  cleared: YNABClearedStatus;
  approved: boolean;
  flag_color: YNABFlagColor;
  flag_name: string | null;
  account_id: string;
  account_name?: string;
  payee_id: string | null;
  payee_name: string | null;
  category_id: string | null;
  category_name: string | null;
  transfer_account_id: string | null;
  transfer_transaction_id: string | null;
  matched_transaction_id: string | null;
  import_id: string | null;
  import_payee_name: string | null;
  import_payee_name_original: string | null;
  debt_transaction_type: YNABDebtTransactionType;
  deleted: boolean;
  subtransactions: YNABSubTransaction[];
}

/**
 * YNAB Sub-Transaction (for split transactions)
 */
export interface YNABSubTransaction {
  id: string;
  transaction_id: string;
  amount: Milliunits;
  memo: string | null;
  payee_id: string | null;
  payee_name: string | null;
  category_id: string | null;
  category_name: string | null;
  transfer_account_id: string | null;
  transfer_transaction_id: string | null;
  deleted: boolean;
}

/**
 * YNAB Scheduled Transaction
 */
export interface YNABScheduledTransaction {
  id: string;
  date_first: string;
  date_next: string;
  frequency:
    | 'never'
    | 'daily'
    | 'weekly'
    | 'everyOtherWeek'
    | 'twiceAMonth'
    | 'every4Weeks'
    | 'monthly'
    | 'everyOtherMonth'
    | 'every3Months'
    | 'every4Months'
    | 'twiceAYear'
    | 'yearly'
    | 'everyOtherYear';
  amount: Milliunits;
  memo: string | null;
  flag_color: YNABFlagColor;
  flag_name: string | null;
  account_id: string;
  account_name?: string;
  payee_id: string | null;
  payee_name: string | null;
  category_id: string | null;
  category_name: string | null;
  transfer_account_id: string | null;
  deleted: boolean;
  subtransactions: YNABScheduledSubTransaction[];
}

/**
 * YNAB Scheduled Sub-Transaction
 */
export interface YNABScheduledSubTransaction {
  id: string;
  scheduled_transaction_id: string;
  amount: Milliunits;
  memo: string | null;
  payee_id: string | null;
  payee_name: string | null;
  category_id: string | null;
  category_name: string | null;
  transfer_account_id: string | null;
  deleted: boolean;
}

// ============================================================================
// YNAB4 Legacy Types (Desktop Version)
// ============================================================================

/**
 * YNAB4 Account Types
 */
export type YNAB4AccountType =
  | 'Checking'
  | 'Savings'
  | 'CreditCard'
  | 'Cash'
  | 'LineOfCredit'
  | 'Merchant'
  | 'InvestmentAccount'
  | 'Mortgage'
  | 'OtherAsset'
  | 'OtherLiability';

/**
 * YNAB4 Cleared Status
 */
export type YNAB4ClearedStatus = 'Cleared' | 'Uncleared' | 'Reconciled';

/**
 * YNAB4 Category Type
 */
export type YNAB4CategoryType = 'OUTFLOW' | 'INFLOW';

/**
 * YNAB4 Budget Metadata
 */
export interface YNAB4BudgetMetaData {
  budgetType: string;
  currencyISOSymbol: string;
  dateLocale: string;
  currencyLocale?: string;
}

/**
 * YNAB4 Full Budget (Budget.yfull)
 */
export interface YNAB4Budget {
  budgetMetaData: YNAB4BudgetMetaData;
  fileMetaData?: {
    budgetDataVersion?: string;
    entityType?: string;
  };
  accounts: YNAB4Account[];
  payees: YNAB4Payee[];
  masterCategories: YNAB4MasterCategory[];
  transactions: YNAB4Transaction[];
  scheduledTransactions: YNAB4ScheduledTransaction[];
  monthlyBudgets: YNAB4MonthlyBudget[];
}

/**
 * YNAB4 Account
 */
export interface YNAB4Account {
  entityId: string;
  entityVersion?: string;
  accountName: string;
  accountType: YNAB4AccountType;
  onBudget: boolean;
  lastReconciledDate: string | null;
  lastReconciledBalance: number;
  lastEnteredCheckNumber?: number;
  hidden: boolean;
  sortableIndex: number;
  note?: string;
}

/**
 * YNAB4 Payee
 */
export interface YNAB4Payee {
  entityId: string;
  entityVersion?: string;
  name: string;
  enabled?: boolean;
  autoFillAmount?: number;
  autoFillCategoryId?: string;
  autoFillMemo?: string;
  renameConditions?: Array<{
    operand: string;
    operator: string;
  }>;
  targetAccountId?: string;
}

/**
 * YNAB4 Master Category (Category Group)
 */
export interface YNAB4MasterCategory {
  entityId: string;
  entityVersion?: string;
  name: string;
  type?: string;
  deleteable?: boolean;
  expanded?: boolean;
  sortableIndex: number;
  subCategories: YNAB4SubCategory[];
  note?: string;
}

/**
 * YNAB4 Sub-Category
 */
export interface YNAB4SubCategory {
  entityId: string;
  entityVersion?: string;
  masterCategoryId: string;
  name: string;
  type: YNAB4CategoryType;
  note: string | null;
  sortableIndex: number;
  isTombstone?: boolean;
  cachedBalance?: number;
  goalType?: string;
  goalCreationMonth?: string;
  targetBalance?: number;
  targetBalanceMonth?: string;
  monthlyFunding?: number;
}

/**
 * YNAB4 Transaction
 */
export interface YNAB4Transaction {
  entityId: string;
  entityVersion?: string;
  accountId: string;
  payeeId: string;
  categoryId: string;
  date: string;
  amount: number; // Regular decimal, NOT milliunits
  memo: string | null;
  cleared: YNAB4ClearedStatus;
  accepted?: boolean;
  flag?: string;
  checkNumber?: string;
  targetAccountId?: string;
  transferTransactionId?: string;
  matchedTransactionId?: string;
  isTombstone?: boolean;
  subTransactions: YNAB4SubTransaction[];
}

/**
 * YNAB4 Sub-Transaction
 */
export interface YNAB4SubTransaction {
  entityId: string;
  entityVersion?: string;
  parentTransactionId: string;
  categoryId: string;
  amount: number;
  memo: string | null;
  targetAccountId?: string;
  transferTransactionId?: string;
}

/**
 * YNAB4 Scheduled Transaction
 */
export interface YNAB4ScheduledTransaction {
  entityId: string;
  entityVersion?: string;
  accountId: string;
  payeeId: string;
  categoryId: string;
  date: string;
  frequency: string;
  amount: number;
  memo: string | null;
  flag?: string;
  upcomingInstances?: string[];
  subTransactions?: YNAB4SubTransaction[];
}

/**
 * YNAB4 Monthly Budget
 */
export interface YNAB4MonthlyBudget {
  entityId: string;
  entityVersion?: string;
  month: string;
  monthlySubCategoryBudgets: YNAB4MonthlySubCategoryBudget[];
}

/**
 * YNAB4 Monthly Sub-Category Budget
 */
export interface YNAB4MonthlySubCategoryBudget {
  entityId: string;
  entityVersion?: string;
  categoryId: string;
  budgeted: number;
  overspendingHandling?: 'AffectsBuffer' | 'Confined';
  note?: string;
}

// ============================================================================
// CSV Export Types
// ============================================================================

/**
 * YNAB CSV Transaction Row
 */
export interface YNABCSVTransaction {
  Account: string;
  Flag: string;
  Date: string;
  Payee: string;
  'Category Group/Category': string;
  Memo: string;
  Outflow: string;
  Inflow: string;
  Cleared: string;
}

/**
 * YNAB CSV Budget Row
 */
export interface YNABCSVBudget {
  Month: string;
  'Category Group': string;
  Category: string;
  Budgeted: string;
  Activity: string;
  Available: string;
}

// ============================================================================
// Conversion Utilities
// ============================================================================

/**
 * Convert milliunits to regular currency amount
 */
export function fromMilliunits(milliunits: Milliunits): number {
  return milliunits / 1000;
}

/**
 * Convert regular currency amount to milliunits
 */
export function toMilliunits(amount: number): Milliunits {
  return Math.round(amount * 1000);
}

/**
 * Parse YNAB date string (YYYY-MM-DD) to Date object
 */
export function parseYNABDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format Date to YNAB date string (YYYY-MM-DD)
 */
export function formatYNABDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Detect if a YNAB transaction is a transfer
 */
export function isTransfer(transaction: YNABTransaction | YNAB4Transaction): boolean {
  if ('transfer_account_id' in transaction) {
    return transaction.transfer_account_id !== null;
  }
  return 'targetAccountId' in transaction && transaction.targetAccountId !== undefined;
}

/**
 * Detect if a YNAB transaction is a split transaction
 */
export function isSplitTransaction(
  transaction: YNABTransaction | YNAB4Transaction
): boolean {
  // nYNAB uses 'subtransactions', YNAB4 uses 'subTransactions'
  if ('subtransactions' in transaction) {
    return transaction.subtransactions.length > 0;
  }
  return transaction.subTransactions.length > 0;
}

/**
 * Get transaction type (income/expense) from amount
 */
export function getTransactionType(
  amount: number,
  isMilliunits = true
): 'income' | 'expense' {
  const value = isMilliunits ? fromMilliunits(amount) : amount;
  return value >= 0 ? 'income' : 'expense';
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if budget is nYNAB format
 */
export function isNYNABBudget(budget: unknown): budget is YNABBudget {
  return (
    typeof budget === 'object' &&
    budget !== null &&
    'id' in budget &&
    'accounts' in budget &&
    'category_groups' in budget
  );
}

/**
 * Check if budget is YNAB4 format
 */
export function isYNAB4Budget(budget: unknown): budget is YNAB4Budget {
  return (
    typeof budget === 'object' &&
    budget !== null &&
    'budgetMetaData' in budget &&
    'masterCategories' in budget
  );
}

/**
 * Detect YNAB version from file/data structure
 */
export function detectYNABVersion(
  data: unknown
): 'nynab' | 'ynab4' | 'csv' | 'unknown' {
  if (isNYNABBudget(data)) return 'nynab';
  if (isYNAB4Budget(data)) return 'ynab4';
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0];
    if ('Account' in first && 'Outflow' in first && 'Inflow' in first) {
      return 'csv';
    }
  }
  return 'unknown';
}
