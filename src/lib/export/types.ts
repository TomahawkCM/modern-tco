/**
 * Budget Export Types
 * TypeScript interfaces for the .budget file format.
 * See docs/BUDGET_FILE_FORMAT.md for full specification.
 */

// Re-export core types for convenience
export type {
  Account,
  Transaction,
  Category,
  Budget,
  FuturePurchase,
  RetirementPlan,
  Loan,
  LoanPayment,
  Subscription,
  ExcludedSubscription,
  Investment,
  Portfolio,
  PortfolioAllocation,
  InvestmentHolding,
  InvestmentTransaction,
  InvestmentAccount,
  Holding,
  Receipt,
  ImportMapping,
  ImportMetadata,
} from '@/types/budget';

/**
 * Export file metadata
 */
export interface BudgetFileMetadata {
  /** Schema version (semver format) */
  version: string;
  /** ISO 8601 timestamp of export */
  exportedAt: string;
  /** App version that created export */
  appVersion: string;
  /** SHA-256 hash of data section */
  checksum: string;
  /** Whether data is encrypted */
  encrypted: boolean;
  /** Encryption algorithm (if encrypted) */
  encryptionMethod: 'AES-256-GCM' | null;
  /** Hash of original data (pre-encryption) */
  dataHash: string;
  /** User identifier (anonymized) */
  exportedBy?: string;
  /** Device identifier (for sync) */
  deviceId?: string;
  /** User's locale (e.g., "en-CA") */
  locale: string;
  /** Primary currency code (ISO 4217) */
  currency: string;
  /** User's timezone (IANA) */
  timezone: string;
}

/**
 * Encrypted data payload
 */
export interface EncryptedDataPayload {
  encrypted: true;
  algorithm: 'AES-256-GCM';
  /** Base64-encoded initialization vector */
  iv: string;
  /** Base64-encoded salt for key derivation */
  salt: string;
  /** Base64-encoded encrypted data */
  ciphertext: string;
  /** Base64-encoded authentication tag */
  authTag: string;
}

/**
 * Receipt with base64-encoded binary data
 */
export interface ReceiptExport {
  id: string;
  transactionId: string;
  filename: string;
  mimeType: string;
  /** Base64 encoded binary data */
  data: string;
  /** Base64 encoded thumbnail */
  thumbnailData?: string;
  fileSize: number;
  uploadedAt: string;
  metadata?: {
    width?: number;
    height?: number;
    pageCount?: number;
    ocrText?: string;
    extractedAmount?: number;
    extractedDate?: string;
    extractedMerchant?: string;
  };
}

/**
 * User settings export
 */
export interface SettingsExport {
  // Display preferences
  theme: 'light' | 'dark' | 'system';
  seniorsMode: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';

  // Regional settings
  locale: string;
  currency: string;
  dateFormat: string;
  timezone: string;

  // Privacy settings
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;

  // Notification settings
  reminderNotifications: boolean;
  budgetAlerts: boolean;
  weeklyReviewReminder: boolean;

  // Feature flags
  enabledFeatures: string[];
}

/**
 * User preferences export
 */
export interface PreferencesExport {
  // Dashboard layout
  dashboardWidgets: string[];
  defaultView: string;

  // Import preferences
  defaultDateFormat: string;
  autoCategorizationEnabled: boolean;
  duplicateDetectionSensitivity: 'low' | 'medium' | 'high';

  // Chart preferences
  chartColorScheme: string;
  defaultChartPeriod: string;
}

/**
 * Serialized data types (Dates converted to ISO strings)
 */
export interface AccountExport {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit';
  institution: string;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionExport {
  id: string;
  accountId: string;
  date: string;
  description: string;
  originalDescription?: string;
  amount: number;
  category: string | null;
  subcategory: string | null;
  notes: string;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';
  tags: string[];
  merchant?: string;
  receiptIds?: string[];
  splitFromId?: string | null;
  isSplit?: boolean;
  encryptedDescription?: string;
  encryptedAmount?: string;
  encryptionIv?: string;
  amountHash?: string;
  fitid?: string;
  checkNum?: string;
  transactionType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryExport {
  id: string;
  name: string;
  type: 'expense' | 'income';
  subcategories: string[];
  color: string;
  icon: string;
  isDefault: boolean;
  order: number;
  archived?: boolean;
  archivedAt?: string;
  createdAt: string;
}

export interface BudgetExportItem {
  id: string;
  categoryId: string;
  amount: number;
  period: 'monthly' | 'annual';
  startDate: string;
  endDate: string | null;
  rollover: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GoalExport {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentSavings: number;
  monthlyContribution: number;
  targetDate: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  notes: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoanExport {
  id: string;
  name: string;
  type: 'mortgage' | 'auto' | 'personal' | 'student';
  lender: string;
  originalPrincipal: number;
  interestRate: number;
  termMonths: number;
  startDate: string;
  currentBalance: number;
  monthlyPayment: number;
  paymentFrequency: 'weekly' | 'bi-weekly' | 'monthly';
  nextPaymentDate: string;
  status: 'active' | 'paid-off' | 'refinanced' | 'defaulted';
  totalPaid: number;
  totalInterestPaid: number;
  extraPayments: number;
  accountId?: string;
  notes?: string;
  propertyTax?: number;
  homeInsurance?: number;
  pmi?: number;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  defermentEndDate?: string;
  subsidized?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoanPaymentExport {
  id: string;
  loanId: string;
  date: string;
  amount: number;
  principalAmount: number;
  interestAmount: number;
  extraPrincipal: number;
  balanceAfter: number;
  transactionId?: string;
  notes?: string;
  isScheduled: boolean;
  createdAt: string;
}

export interface SubscriptionExport {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  billingCycle: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'annual';
  startDate: string;
  nextBillingDate: string;
  trialEndDate?: string;
  cancelledDate?: string;
  status: 'active' | 'paused' | 'cancelled' | 'trial';
  autoRenew: boolean;
  category?: string;
  linkedTransactionIds: string[];
  merchantToken?: string;
  reminderDaysBefore: number;
  reminderEnabled: boolean;
  paymentMethod?: string;
  websiteUrl?: string;
  notes?: string;
  source: 'manual' | 'auto-detected' | 'merged';
  createdAt: string;
  updatedAt: string;
}

export interface ExcludedSubscriptionExport {
  id: string;
  merchantToken: string;
  merchantName: string;
  reason?: string;
  excludedAt: string;
}

export interface InvestmentExport {
  id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'etf' | 'crypto' | 'mutual-fund' | 'bond' | 'other';
  exchange?: string;
  currency: string;
  sector?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioExport {
  id: string;
  name: string;
  description?: string;
  accountId?: string;
  targetAllocation?: {
    assetClass: string;
    targetPercentage: number;
    currentPercentage?: number;
  }[];
  rebalanceFrequency?: 'monthly' | 'quarterly' | 'annually' | 'never';
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentHoldingExport {
  id: string;
  portfolioId: string;
  investmentId: string;
  quantity: number;
  averageCost: number;
  totalCost: number;
  currentPrice?: number;
  currentValue?: number;
  gainLoss?: number;
  gainLossPercentage?: number;
  lastUpdated?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentTransactionExport {
  id: string;
  portfolioId: string;
  investmentId: string;
  type: 'buy' | 'sell' | 'dividend' | 'split' | 'transfer-in' | 'transfer-out';
  date: string;
  quantity: number;
  pricePerShare: number;
  totalAmount: number;
  fees?: number;
  notes?: string;
  accountId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentAccountExport {
  id: string;
  name: string;
  type: 'RRSP' | 'TFSA' | 'Non-registered' | 'Company shares';
  institution?: string;
  accountNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HoldingExport {
  id: string;
  accountId: string;
  symbol: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RetirementPlanExport {
  id: string;
  name: string;
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  expectedReturn: number;
  inflationRate: number;
  desiredMonthlyIncome: number;
  lifespanAssumption: number;
  includeCPP?: boolean;
  estimatedCPPMonthly?: number;
  includeOAS?: boolean;
  estimatedOASMonthly?: number;
  rrspBalance?: number;
  tfsaBalance?: number;
  nonRegisteredBalance?: number;
  companyShares?: number;
  companySharesGrowthRate?: number;
  stockOptions?: number;
  pensionPlan?: boolean;
  employerPensionMonthly?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ImportMappingExport {
  id: string;
  institution: string;
  accountId: string;
  dateColumn: string;
  descriptionColumn: string;
  amountColumn: string;
  dateFormat: string;
  amountMultiplier: number;
  hasHeader: boolean;
  createdAt: string;
}

export interface ImportHistoryExport {
  id: string;
  fileName: string;
  fileFormat: 'csv' | 'ofx' | 'qfx';
  bank?: string;
  importDate: string;
  transactionCount: number;
  duplicateCount: number;
  dateRangeStart: string | null;
  dateRangeEnd: string | null;
}

/**
 * Complete export data structure
 */
export interface BudgetExportData {
  accounts: AccountExport[];
  transactions: TransactionExport[];
  categories: CategoryExport[];
  budgets: BudgetExportItem[];
  goals: GoalExport[];
  loans: LoanExport[];
  loanPayments: LoanPaymentExport[];
  subscriptions: SubscriptionExport[];
  excludedSubscriptions: ExcludedSubscriptionExport[];
  investments: InvestmentExport[];
  portfolios: PortfolioExport[];
  investmentHoldings: InvestmentHoldingExport[];
  investmentTransactions: InvestmentTransactionExport[];
  investmentAccounts: InvestmentAccountExport[];
  holdings: HoldingExport[];
  retirementPlans: RetirementPlanExport[];
  importMappings: ImportMappingExport[];
  importHistory: ImportHistoryExport[];
  receipts: ReceiptExport[];
  settings: SettingsExport;
  preferences: PreferencesExport;
}

/**
 * Complete .budget file structure
 */
export interface BudgetFile {
  metadata: BudgetFileMetadata;
  data: BudgetExportData | EncryptedDataPayload;
}

/**
 * Type guard to check if data is encrypted
 */
export function isEncryptedData(
  data: BudgetExportData | EncryptedDataPayload
): data is EncryptedDataPayload {
  return 'encrypted' in data && data.encrypted === true;
}

/**
 * Export options
 */
export interface ExportOptions {
  /** Include receipts (can be large) */
  includeReceipts?: boolean;
  /** Include investment data */
  includeInvestments?: boolean;
  /** Include import history */
  includeImportHistory?: boolean;
  /** Encrypt the export */
  encrypt?: boolean;
  /** Password for encryption (required if encrypt=true) */
  password?: string;
  /** Custom filename */
  filename?: string;
}

/**
 * Import options
 */
export interface ImportOptions {
  /** How to handle ID conflicts */
  conflictResolution: 'skip' | 'overwrite' | 'rename';
  /** Validate data before import */
  validateBeforeImport?: boolean;
  /** Password for decryption (required if encrypted) */
  password?: string;
  /** Import specific tables only */
  includeTables?: (keyof BudgetExportData)[];
}

/**
 * Import result
 */
export interface ImportResult {
  success: boolean;
  message: string;
  stats: {
    accounts: { imported: number; skipped: number; errors: number };
    transactions: { imported: number; skipped: number; errors: number };
    categories: { imported: number; skipped: number; errors: number };
    budgets: { imported: number; skipped: number; errors: number };
    goals: { imported: number; skipped: number; errors: number };
    loans: { imported: number; skipped: number; errors: number };
    subscriptions: { imported: number; skipped: number; errors: number };
    investments: { imported: number; skipped: number; errors: number };
    receipts: { imported: number; skipped: number; errors: number };
  };
  errors: Array<{
    table: string;
    id: string;
    message: string;
  }>;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    path: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
  warnings: string[];
  metadata?: BudgetFileMetadata;
}

/**
 * Current schema version
 */
export const BUDGET_FILE_VERSION = '1.0.0';

/**
 * Current app version (should match package.json)
 */
export const APP_VERSION = '2.0.0';

/**
 * Default export settings
 */
export const DEFAULT_SETTINGS: SettingsExport = {
  theme: 'dark',
  seniorsMode: false,
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',
  locale: 'en-CA',
  currency: 'CAD',
  dateFormat: 'YYYY-MM-DD',
  timezone: 'America/Toronto',
  analyticsEnabled: true,
  crashReportingEnabled: true,
  reminderNotifications: true,
  budgetAlerts: true,
  weeklyReviewReminder: true,
  enabledFeatures: [],
};

/**
 * Default export preferences
 */
export const DEFAULT_PREFERENCES: PreferencesExport = {
  dashboardWidgets: ['spending', 'budgets', 'goals'],
  defaultView: 'dashboard',
  defaultDateFormat: 'YYYY-MM-DD',
  autoCategorizationEnabled: true,
  duplicateDetectionSensitivity: 'medium',
  chartColorScheme: 'teal',
  defaultChartPeriod: 'month',
};
