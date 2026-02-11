/**
 * Budget App Type Definitions
 * Local household budget management system
 */

export interface Account {
  id: string;
  name: string; // "BMO Checking", "Home Trust Savings"
  type: "checking" | "savings" | "credit";
  institution: string; // "BMO", "Home Trust"
  balance: number; // Opening/starting balance (set during reconciliation)
  currency: string; // "CAD"

  // Balance reconciliation tracking
  openingBalanceDate?: Date; // Date of first transaction or when balance was set
  lastReconciledAt?: Date; // When balance was last verified by user
  lastReconciledBalance?: number; // What user said the balance was at reconciliation

  // Auto-matching fields for imports
  bankSlug?: string; // Bank config key (e.g., 'bmo', 'homeTrust', 'td')
  lastFourDigits?: string; // Last 4 digits of account number for OFX matching
  bankId?: string; // Bank routing number from OFX BANKID (unique bank identifier)
  importPatterns?: string[]; // Custom patterns to match during import

  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  accountId: string;
  date: Date;
  description: string;
  originalDescription?: string; // Original from bank statement
  amount: number; // Negative for expenses, positive for income
  category: string | null;
  subcategory: string | null;
  notes: string;
  isRecurring: boolean;
  recurringPattern?: "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "annually";
  tags: string[];
  merchant?: string;
  receiptIds?: string[]; // Array of associated receipt IDs

  // Split Transaction Fields (Phase 6)
  splitFromId?: string | null; // ID of parent transaction if this is a split
  isSplit?: boolean; // True if this transaction was split into children

  // Encryption Fields (Phase 4: Privacy & Security)
  encryptedDescription?: string; // Encrypted description (if encryption enabled)
  encryptedAmount?: string; // Encrypted amount (if encryption enabled)
  encryptionIv?: string; // Initialization vector for decryption
  amountHash?: string; // Hash of amount for searching (one-way)

  // Import/OFX Fields
  fitid?: string; // OFX: Financial Institution Transaction ID (for perfect duplicate detection)
  checkNum?: string; // OFX: Check number if applicable
  transactionType?: string; // OFX: TRNTYPE (DEBIT, CREDIT, CHECK, etc.)

  // Refund Tracking Fields
  refundStatus?: 'expecting' | 'received' | 'partial' | null;
  refundLinkedTransactionId?: string;
  refundExpectedAmount?: number;
  refundReceivedAmount?: number;
  refundExpectedDate?: Date;
  refundNotes?: string;

  // Event/Project Budget Tagging
  eventBudgetId?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface Receipt {
  id: string;
  transactionId: string; // Reference to associated transaction
  filename: string; // Original filename
  mimeType: string; // 'image/jpeg', 'image/png', 'application/pdf'
  blob: Blob; // Binary data stored in IndexedDB
  thumbnail?: Blob; // Optional smaller preview image
  fileSize: number; // File size in bytes
  uploadedAt: Date;
  metadata?: {
    width?: number; // For images
    height?: number;
    pageCount?: number; // For PDFs
    ocrText?: string; // Future: extracted text from OCR
    extractedAmount?: number; // Future: parsed amount from receipt
    extractedDate?: Date; // Future: parsed date from receipt
    extractedMerchant?: string; // Future: parsed merchant name
  };
}

export interface Category {
  id: string;
  name: string;
  type: "expense" | "income";
  subcategories: string[];
  color: string; // Hex color
  icon: string; // Icon name
  isDefault: boolean; // Whether it's a system default or user-created
  order: number; // Display order
  archived?: boolean; // Whether category is archived (hidden but preserved)
  archivedAt?: Date; // When category was archived
  createdAt: Date;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: "monthly" | "annual";
  startDate: Date;
  endDate: Date | null;
  rollover: boolean; // Carry unused budget to next period

  // Multi-Profile Support
  /** Profile ID that owns this budget (null = shared with all profiles) */
  ownerId?: string | null;
  /** Visibility: 'shared' (visible to all) or 'private' (owner-only) */
  visibility?: "shared" | "private";

  createdAt: Date;
  updatedAt: Date;
}

export interface FuturePurchase {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentSavings: number;
  monthlyContribution: number;
  targetDate: Date;
  priority: "low" | "medium" | "high";
  category?: string;
  notes: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RetirementPlan {
  id: string;
  name: string; // "Main Retirement Plan"
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  expectedReturn: number; // Annual return % (e.g., 7.0)
  inflationRate: number; // Annual inflation % (e.g., 2.5)
  desiredMonthlyIncome: number; // In today's dollars
  lifespanAssumption: number; // Expected years in retirement (e.g., 90)

  // Canadian Government Pensions
  includeCPP?: boolean;
  estimatedCPPMonthly?: number; // Estimated CPP monthly benefit
  includeOAS?: boolean;
  estimatedOASMonthly?: number; // Estimated OAS monthly benefit

  // Investment Accounts
  rrspBalance?: number; // RRSP (Registered Retirement Savings Plan)
  tfsaBalance?: number; // TFSA (Tax-Free Savings Account)
  nonRegisteredBalance?: number; // Non-registered investment accounts

  // Company Benefits
  companyShares?: number; // Current value of company shares
  companySharesGrowthRate?: number; // Expected annual growth %
  stockOptions?: number; // Current value of vested stock options
  pensionPlan?: boolean; // Does employer have defined benefit pension?
  employerPensionMonthly?: number; // Expected monthly pension from employer

  createdAt: Date;
  updatedAt: Date;
}

export interface ImportMapping {
  id: string;
  institution: string;
  accountId: string;
  dateColumn: string;
  descriptionColumn: string;
  amountColumn: string;
  dateFormat: string; // e.g., "MM/DD/YYYY"
  amountMultiplier: number; // -1 if expenses are positive in CSV
  hasHeader: boolean;
  createdAt: Date;
}

export interface ImportMetadata {
  id: string; // Unique ID (e.g., "import_1699564823000")
  fileName: string; // Original file name
  fileFormat: "csv" | "ofx" | "qfx" | "qbo" | "pdf" | "qif" | "mt940" | "camt053"; // File type
  bank?: string; // Detected bank (e.g., "BMO", "TD")
  importDate: Date; // When import occurred
  transactionCount: number; // Number of transactions imported
  duplicateCount: number; // Number of duplicates skipped
  dateRangeStart: Date | null; // Earliest transaction date
  dateRangeEnd: Date | null; // Latest transaction date
}

export interface BudgetSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  budgetedExpenses: number;
  actualExpenses: number;
  remainingBudget: number;
  savingsRate: number; // %
  topCategories: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentage: number; // % of budget used
  transactionCount: number;
  color: string;
  trend?: "up" | "down" | "stable"; // Compared to previous period
}

export interface MonthlyTrend {
  month: string; // "2025-01"
  income: number;
  expenses: number;
  savings: number;
  netWorth: number;
}

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  frequency: "weekly" | "biweekly" | "monthly" | "quarterly" | "annually";
  nextDueDate: Date;
  category: string;
  isAutoDetected: boolean;
  reminderDays: number; // Days before to remind
}

// CSV Import Types
export interface CSVRow {
  [key: string]: string;
}

export interface ParsedTransaction {
  date: Date;
  description: string;
  amount: number;
  isDuplicate: boolean;
  confidence: number; // 0-1 for duplicate detection
  currency?: string; // ISO 4217 currency code (e.g., 'USD', 'EUR', 'JPY')
  fitid?: string; // OFX: Financial Institution Transaction ID (for perfect duplicate detection)
  checkNum?: string; // OFX: Check number if applicable
  transactionType?: string; // OFX: TRNTYPE (DEBIT, CREDIT, CHECK, etc.)
  // Smart duplicate detection details
  duplicateReason?: string; // Explanation from Claude API
  matchedTransactionId?: string; // ID of matched existing transaction
  requiresReview?: boolean; // True if confidence is below threshold and needs manual review
  // Source format tracking
  sourceFormat?: 'csv' | 'ofx' | 'qfx' | 'qbo' | 'pdf' | 'qif' | 'mt940' | 'camt053';
  balance?: number; // Running balance if available from statement
}

export interface BankConfig {
  name: string;
  dateColumn: string;
  descriptionColumn: string;
  amountColumn: string;
  dateFormat: string;
  amountMultiplier?: number;
  hasHeader?: boolean;
  skipRows?: number; // Number of header rows to skip before actual data
  // Asian bank support - encoding and decimal separator
  encoding?: "UTF-8" | "Shift-JIS" | "GB2312" | "EUC-KR" | "Big5"; // Character encoding
  decimalSeparator?: "." | ","; // Period (most) or Comma (Indonesia, Germany)
  thousandSeparator?: "," | "." | " " | ""; // Thousand separator
  region?: "NA" | "EU" | "UK" | "AU" | "ASIA"; // Region for date/number parsing hints
}

// OFX/QFX Types (Phase 2)
export interface OFXTransaction {
  TRNTYPE: string; // Transaction type: DEBIT, CREDIT, CHECK, DEP, ATM, POS, etc.
  DTPOSTED: string; // Posted date (YYYYMMDDHHmmss format)
  TRNAMT: string; // Transaction amount (negative for debits)
  FITID: string; // Financial Institution Transaction ID (unique)
  NAME?: string; // Payee/merchant name
  MEMO?: string; // Transaction memo/description
  CHECKNUM?: string; // Check number (optional)
}

export interface OFXAccountInfo {
  BANKID?: string; // Bank routing number
  ACCTID: string; // Account number
  ACCTTYPE: string; // CHECKING, SAVINGS, CREDITCARD, etc.
}

export interface OFXBalances {
  ledgerBalance: number;
  ledgerDate: Date;
  availableBalance?: number;
  availableDate?: Date;
}

export interface OFXData {
  version: string; // OFX version (1.x or 2.x)
  currency: string; // Currency code (USD, CAD, etc.)
  accountInfo: OFXAccountInfo;
  transactions: OFXTransaction[];
  balances: OFXBalances;
  dateStart?: Date; // Transaction list start date
  dateEnd?: Date; // Transaction list end date
}

// Categorization
export interface CategoryRule {
  pattern: RegExp;
  category: string;
  subcategory?: string;
  confidence: number;
}

export interface CategorizationResult {
  category: string;
  subcategory?: string;
  confidence: number; // 0-1
  method: "rule" | "ml" | "manual";
}

// Chart data types
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  income: number;
  expenses: number;
  savings: number;
  netWorth?: number;
}

// Investment Types - Phase 8
export interface Investment {
  id: string;
  symbol: string; // Stock ticker or crypto symbol
  name: string; // Company/fund name
  type: "stock" | "etf" | "crypto" | "mutual-fund" | "bond" | "other";
  exchange?: string; // NYSE, NASDAQ, etc.
  currency: string; // USD, CAD, etc.
  sector?: string; // Technology, Healthcare, etc.
  createdAt: Date;
  updatedAt: Date;
}

export interface Portfolio {
  id: string;
  name: string; // "Main Portfolio", "Retirement", "Crypto"
  description?: string;
  accountId?: string; // Link to account if applicable
  targetAllocation?: PortfolioAllocation[]; // Target asset allocation
  rebalanceFrequency?: "monthly" | "quarterly" | "annually" | "never";
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioAllocation {
  assetClass: string; // "US Stocks", "International", "Bonds", "Crypto"
  targetPercentage: number; // 0-100
  currentPercentage?: number; // Calculated based on holdings
}

export interface InvestmentHolding {
  id: string;
  portfolioId: string;
  investmentId: string;
  quantity: number; // Number of shares/units
  averageCost: number; // Average purchase price per share
  totalCost: number; // Total amount invested
  currentPrice?: number; // Latest market price
  currentValue?: number; // quantity * currentPrice
  gainLoss?: number; // currentValue - totalCost
  gainLossPercentage?: number; // (gainLoss / totalCost) * 100
  lastUpdated?: Date; // When price was last updated
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvestmentTransaction {
  id: string;
  portfolioId: string;
  investmentId: string;
  type: "buy" | "sell" | "dividend" | "split" | "transfer-in" | "transfer-out";
  date: Date;
  quantity: number; // Number of shares
  pricePerShare: number; // Price per share at transaction
  totalAmount: number; // Total transaction amount
  fees?: number; // Transaction fees
  notes?: string;
  accountId?: string; // Link to bank account if applicable
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketData {
  id: string;
  investmentId: string;
  date: Date;
  open?: number;
  high?: number;
  low?: number;
  close: number;
  volume?: number;
  dividendAmount?: number;
  splitCoefficient?: number;
  createdAt: Date;
}

export interface WatchlistItem {
  id: string;
  investmentId: string;
  targetBuyPrice?: number; // Alert when price drops to this
  targetSellPrice?: number; // Alert when price rises to this
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortfolioSnapshot {
  id: string;
  portfolioId: string;
  date: Date;
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  holdings: {
    investmentId: string;
    symbol: string;
    quantity: number;
    value: number;
    percentage: number; // % of portfolio
  }[];
  createdAt: Date;
}

// Investment Account Types (Phase 8 - Simplified)
export interface AnomalyFeedback {
  id: string;
  transactionId: string;
  merchant: string;
  category: string;
  amount: number;
  wasExpected: boolean; // true = expected, false = unexpected
  createdAt: Date;
}

export interface PredictionAccuracy {
  id: string;
  category: string;
  month: Date;
  predicted: number;
  actual: number;
  error: number;
  errorPercent: number;
  recordedAt: Date;
}

export interface InvestmentAccount {
  id: string;
  name: string; // "My RRSP", "TFSA Account"
  type: "RRSP" | "TFSA" | "Non-registered" | "Company shares";
  institution?: string; // "Questrade", "Wealthsimple", etc.
  accountNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Holding {
  id: string;
  accountId: string; // Reference to InvestmentAccount
  symbol: string; // Stock ticker (e.g., "AAPL", "MSFT", "VGRO.TO")
  quantity: number; // Number of shares/units
  purchasePrice: number; // Average purchase price per share
  currentPrice?: number; // Current market price per share (if available)
  purchaseDate: Date; // Date of purchase (or average date for multiple buys)
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Export/Import
export interface BudgetExport {
  version: string;
  exportDate: Date;
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  futurePurchases: FuturePurchase[];
  retirementPlans: RetirementPlan[];
  investments?: Investment[];
  portfolios?: Portfolio[];
  investmentHoldings?: InvestmentHolding[];
  investmentTransactions?: InvestmentTransaction[];
  investmentAccounts?: InvestmentAccount[]; // Phase 8 simplified
  holdings?: Holding[]; // Phase 8 simplified
  loans?: Loan[]; // Loan tracking
  loanPayments?: LoanPayment[]; // Loan payment history
  subscriptions?: Subscription[]; // Subscription management
}

// Filter and sort options
export interface TransactionFilters {
  accountId?: string;
  category?: string;
  subcategory?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
  tags?: string[];
  isRecurring?: boolean;
}

export interface SortOption {
  field: keyof Transaction;
  direction: "asc" | "desc";
}

// Loan Types
export type LoanType = "mortgage" | "auto" | "personal" | "student";
export type LoanStatus = "active" | "paid-off" | "refinanced" | "defaulted";
export type PaymentFrequency = "weekly" | "bi-weekly" | "monthly";

export interface Loan {
  id: string;
  name: string; // "Primary Mortgage", "Honda Civic Loan"
  type: LoanType;
  lender: string; // "Wells Fargo", "TD Bank"

  // Loan Terms
  originalPrincipal: number; // Original loan amount
  interestRate: number; // Annual interest rate (e.g., 3.5 for 3.5%)
  termMonths: number; // Loan term in months (e.g., 360 for 30 years)
  startDate: Date; // Loan origination date

  // Current Status
  currentBalance: number; // Remaining principal balance
  monthlyPayment: number; // Regular monthly payment (P&I)
  paymentFrequency: PaymentFrequency; // How often payments are made
  nextPaymentDate: Date; // Next scheduled payment
  status: LoanStatus;

  // Payment Tracking
  totalPaid: number; // Total amount paid so far
  totalInterestPaid: number; // Total interest paid so far
  extraPayments: number; // Total extra principal payments

  // Optional Fields
  accountId?: string; // Link to checking/savings account for auto-pay
  notes?: string;

  // Mortgage-specific
  propertyTax?: number; // Monthly property tax (for escrow)
  homeInsurance?: number; // Monthly insurance (for escrow)
  pmi?: number; // Private Mortgage Insurance

  // Auto-specific
  vehicleMake?: string; // "Honda"
  vehicleModel?: string; // "Civic"
  vehicleYear?: number; // 2020

  // Student Loan-specific
  defermentEndDate?: Date; // When payments start
  subsidized?: boolean; // Subsidized loan (gov't pays interest during deferment)

  createdAt: Date;
  updatedAt: Date;
}

export interface LoanPayment {
  id: string;
  loanId: string; // Reference to Loan
  date: Date;
  amount: number; // Total payment amount
  principalAmount: number; // Amount applied to principal
  interestAmount: number; // Amount applied to interest
  extraPrincipal: number; // Extra principal payment beyond regular
  balanceAfter: number; // Remaining balance after payment

  // Optional
  transactionId?: string; // Link to Transaction if auto-matched
  notes?: string;
  isScheduled: boolean; // True if from amortization schedule, false if actual payment

  createdAt: Date;
}

export interface AmortizationEntry {
  month: number; // Payment number (1-360)
  date: Date; // Payment date
  payment: number; // Total payment amount
  principal: number; // Principal portion
  interest: number; // Interest portion
  balance: number; // Remaining balance
  cumulativeInterest: number; // Total interest paid up to this point
}

// Subscription Management Types
export type SubscriptionStatus = "active" | "paused" | "cancelled" | "trial";
export type BillingCycle = "weekly" | "bi-weekly" | "monthly" | "quarterly" | "annual";
export type SubscriptionSource = "manual" | "auto-detected" | "merged";

export interface Subscription {
  id: string;
  name: string; // "Netflix", "Spotify"
  description?: string;

  // Financial
  amount: number;
  currency: string;
  billingCycle: BillingCycle;

  // Dates
  startDate: Date;
  nextBillingDate: Date;
  trialEndDate?: Date; // Track free trials
  cancelledDate?: Date;

  // Status
  status: SubscriptionStatus;
  autoRenew: boolean;

  // Linking
  category?: string;
  linkedTransactionIds: string[]; // Auto-detected transactions
  merchantToken?: string; // For auto-detection matching

  // Reminders
  reminderDaysBefore: number; // Days before billing to remind
  reminderEnabled: boolean;

  // Metadata
  paymentMethod?: string; // "Visa ending 1234"
  websiteUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;

  // Source tracking
  source: SubscriptionSource;
}

// Excluded/Dismissed auto-detected subscriptions
export interface ExcludedSubscription {
  id: string;
  merchantToken: string; // The merchant token that was incorrectly detected
  merchantName: string; // Display name for reference
  reason?: string; // Optional reason for exclusion
  excludedAt: Date;
}

// Budget Rollover Tracking
export interface BudgetRollover {
  id: string;
  budgetId: string;
  month: string; // "2026-01"
  amount: number;
  calculatedAt: Date;
}

// Merchant Auto-Categorization Rules
export interface MerchantRule {
  id: string;
  merchantToken: string;
  merchantDisplayName: string;
  category: string;
  subcategory?: string;
  confidence: number;
  source: 'user' | 'auto-learned';
  applyCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Gamification Events
export interface GamificationEvent {
  id: string;
  eventType: 'login' | 'transaction_added' | 'budget_under' | 'review_completed' | 'receipt_scanned' | 'no_spend_day';
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Budget Streak Tracking
export interface BudgetStreak {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
}

// Budget Achievement Definitions
export interface BudgetAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'budgeting' | 'saving' | 'debt' | 'receipt' | 'streak' | 'import';
  requirement: { type: string; value: number };
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

// Net Worth Snapshot Storage
export interface StoredNetWorthSnapshot {
  id: string;
  date: Date;
  assets: {
    cashChecking: number;
    savings: number;
    investments: number;
    property: number;
    other: number;
    total: number;
  };
  liabilities: {
    creditCards: number;
    loans: number;
    mortgage: number;
    other: number;
    total: number;
  };
  netWorth: number;
  calculatedAt: Date;
}

// Real Estate / Property Tracking
export interface Property {
  id: string;
  name: string;
  address?: string;
  type: 'primary_residence' | 'rental' | 'vacation' | 'land' | 'commercial';
  purchasePrice: number;
  purchaseDate: Date;
  currentValue: number;
  lastValuationDate: Date;
  currency: string;
  loanId?: string;
  hasManualMortgage?: boolean;
  manualMortgageBalance?: number;
  paymentFrequency?: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
  annualPropertyTax?: number;
  annualInsurance?: number;
  monthlyHOA?: number;
  annualMaintenance?: number;
  propertyTaxDueMonth?: number;
  propertyTaxReminder?: boolean;
  monthlyRentalIncome?: number;
  occupancyRate?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Event/Project Budget
export interface EventBudget {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  totalBudget: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  icon?: string;
  color?: string;
  templateId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Event Budget Category Breakdown
export interface EventBudgetCategory {
  id: string;
  eventBudgetId: string;
  categoryName: string;
  budgeted: number;
  spent: number;
}
