/**
 * Budget Export Module
 * Main export function that gathers all data, adds metadata, and returns JSON structure.
 * See docs/BUDGET_FILE_FORMAT.md for specification.
 */

import { db } from '@/lib/budget-db';
import {
  type BudgetFile,
  type BudgetFileMetadata,
  type BudgetExportData,
  type ExportOptions,
  type AccountExport,
  type TransactionExport,
  type CategoryExport,
  type BudgetExportItem,
  type GoalExport,
  type LoanExport,
  type LoanPaymentExport,
  type SubscriptionExport,
  type ExcludedSubscriptionExport,
  type InvestmentAccountExport,
  type HoldingExport,
  type RetirementPlanExport,
  type ImportMappingExport,
  type ImportHistoryExport,
  type ReceiptExport,
  type SettingsExport,
  type PreferencesExport,
  type ProfileExport,
  type ActivityLogExport,
  BUDGET_FILE_VERSION,
  APP_VERSION,
  DEFAULT_SETTINGS,
  DEFAULT_PREFERENCES,
} from './types';

/**
 * Calculate SHA-256 checksum of data
 */
async function calculateChecksum(data: object): Promise<string> {
  const dataString = JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(dataString);

  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return `sha256:${hashHex}`;
}

/**
 * Convert Date to ISO string safely
 */
function toISOString(date: Date | null | undefined): string | null {
  if (!date) return null;
  try {
    return new Date(date).toISOString();
  } catch {
    return null;
  }
}

/**
 * Convert Blob to base64 string
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64.split(',')[1] || base64;
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Export accounts to serializable format
 */
async function exportAccounts(): Promise<AccountExport[]> {
  const accounts = await db.accounts.toArray();
  return accounts.map(account => ({
    id: account.id,
    name: account.name,
    type: account.type,
    institution: account.institution,
    balance: account.balance,
    currency: account.currency,
    createdAt: toISOString(account.createdAt) || new Date().toISOString(),
    updatedAt: toISOString(account.updatedAt) || new Date().toISOString(),
  }));
}

/**
 * Export transactions to serializable format
 */
async function exportTransactions(): Promise<TransactionExport[]> {
  const transactions = await db.transactions.toArray();
  return transactions.map(tx => ({
    id: tx.id,
    accountId: tx.accountId,
    date: toISOString(tx.date) || new Date().toISOString(),
    description: tx.description,
    originalDescription: tx.originalDescription,
    amount: tx.amount,
    category: tx.category,
    subcategory: tx.subcategory,
    notes: tx.notes,
    isRecurring: tx.isRecurring,
    recurringPattern: tx.recurringPattern,
    tags: tx.tags || [],
    merchant: tx.merchant,
    receiptIds: tx.receiptIds,
    splitFromId: tx.splitFromId,
    isSplit: tx.isSplit,
    encryptedDescription: tx.encryptedDescription,
    encryptedAmount: tx.encryptedAmount,
    encryptionIv: tx.encryptionIv,
    amountHash: tx.amountHash,
    fitid: tx.fitid,
    checkNum: tx.checkNum,
    transactionType: tx.transactionType,
    createdAt: toISOString(tx.createdAt) || new Date().toISOString(),
    updatedAt: toISOString(tx.updatedAt) || new Date().toISOString(),
  }));
}

/**
 * Export categories to serializable format
 */
async function exportCategories(): Promise<CategoryExport[]> {
  const categories = await db.categories.toArray();
  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    type: cat.type,
    subcategories: cat.subcategories || [],
    color: cat.color,
    icon: cat.icon,
    isDefault: cat.isDefault,
    order: cat.order,
    archived: cat.archived,
    archivedAt: toISOString(cat.archivedAt) || undefined,
    createdAt: toISOString(cat.createdAt) || new Date().toISOString(),
  }));
}

/**
 * Export budgets to serializable format
 */
async function exportBudgets(): Promise<BudgetExportItem[]> {
  const budgets = await db.budgets.toArray();
  return budgets.map(budget => ({
    id: budget.id,
    categoryId: budget.categoryId,
    amount: budget.amount,
    period: budget.period,
    startDate: toISOString(budget.startDate) || new Date().toISOString(),
    endDate: toISOString(budget.endDate),
    rollover: budget.rollover,
    // Multi-Profile Support
    ownerId: budget.ownerId ?? null,
    visibility: budget.visibility ?? 'shared',
    createdAt: toISOString(budget.createdAt) || new Date().toISOString(),
    updatedAt: toISOString(budget.updatedAt) || new Date().toISOString(),
  }));
}

/**
 * Export goals (future purchases) to serializable format
 */
async function exportGoals(): Promise<GoalExport[]> {
  const goals = await db.futurePurchases.toArray();
  return goals.map(goal => ({
    id: goal.id,
    name: goal.name,
    description: goal.description,
    targetAmount: goal.targetAmount,
    currentSavings: goal.currentSavings,
    monthlyContribution: goal.monthlyContribution,
    targetDate: toISOString(goal.targetDate) || new Date().toISOString(),
    priority: goal.priority,
    category: goal.category,
    notes: goal.notes,
    isCompleted: goal.isCompleted,
    createdAt: toISOString(goal.createdAt) || new Date().toISOString(),
    updatedAt: toISOString(goal.updatedAt) || new Date().toISOString(),
  }));
}

/**
 * Export loans to serializable format
 */
async function exportLoans(): Promise<LoanExport[]> {
  const loans = await db.loans.toArray();
  return loans.map(loan => ({
    id: loan.id,
    name: loan.name,
    type: loan.type,
    lender: loan.lender,
    originalPrincipal: loan.originalPrincipal,
    interestRate: loan.interestRate,
    termMonths: loan.termMonths,
    startDate: toISOString(loan.startDate) || new Date().toISOString(),
    currentBalance: loan.currentBalance,
    monthlyPayment: loan.monthlyPayment,
    paymentFrequency: loan.paymentFrequency,
    nextPaymentDate: toISOString(loan.nextPaymentDate) || new Date().toISOString(),
    status: loan.status,
    totalPaid: loan.totalPaid,
    totalInterestPaid: loan.totalInterestPaid,
    extraPayments: loan.extraPayments,
    accountId: loan.accountId,
    notes: loan.notes,
    propertyTax: loan.propertyTax,
    homeInsurance: loan.homeInsurance,
    pmi: loan.pmi,
    vehicleMake: loan.vehicleMake,
    vehicleModel: loan.vehicleModel,
    vehicleYear: loan.vehicleYear,
    defermentEndDate: toISOString(loan.defermentEndDate) || undefined,
    subsidized: loan.subsidized,
    createdAt: toISOString(loan.createdAt) || new Date().toISOString(),
    updatedAt: toISOString(loan.updatedAt) || new Date().toISOString(),
  }));
}

/**
 * Export loan payments to serializable format
 */
async function exportLoanPayments(): Promise<LoanPaymentExport[]> {
  const payments = await db.loanPayments.toArray();
  return payments.map(payment => ({
    id: payment.id,
    loanId: payment.loanId,
    date: toISOString(payment.date) || new Date().toISOString(),
    amount: payment.amount,
    principalAmount: payment.principalAmount,
    interestAmount: payment.interestAmount,
    extraPrincipal: payment.extraPrincipal,
    balanceAfter: payment.balanceAfter,
    transactionId: payment.transactionId,
    notes: payment.notes,
    isScheduled: payment.isScheduled,
    createdAt: toISOString(payment.createdAt) || new Date().toISOString(),
  }));
}

/**
 * Export subscriptions to serializable format
 */
async function exportSubscriptions(): Promise<SubscriptionExport[]> {
  const subscriptions = await db.subscriptions.toArray();
  return subscriptions.map(sub => ({
    id: sub.id,
    name: sub.name,
    description: sub.description,
    amount: sub.amount,
    currency: sub.currency,
    billingCycle: sub.billingCycle,
    startDate: toISOString(sub.startDate) || new Date().toISOString(),
    nextBillingDate: toISOString(sub.nextBillingDate) || new Date().toISOString(),
    trialEndDate: toISOString(sub.trialEndDate) || undefined,
    cancelledDate: toISOString(sub.cancelledDate) || undefined,
    status: sub.status,
    autoRenew: sub.autoRenew,
    category: sub.category,
    linkedTransactionIds: sub.linkedTransactionIds || [],
    merchantToken: sub.merchantToken,
    reminderDaysBefore: sub.reminderDaysBefore,
    reminderEnabled: sub.reminderEnabled,
    paymentMethod: sub.paymentMethod,
    websiteUrl: sub.websiteUrl,
    notes: sub.notes,
    source: sub.source,
    createdAt: toISOString(sub.createdAt) || new Date().toISOString(),
    updatedAt: toISOString(sub.updatedAt) || new Date().toISOString(),
  }));
}

/**
 * Export excluded subscriptions to serializable format
 */
async function exportExcludedSubscriptions(): Promise<ExcludedSubscriptionExport[]> {
  const excluded = await db.excludedSubscriptions.toArray();
  return excluded.map(ex => ({
    id: ex.id,
    merchantToken: ex.merchantToken,
    merchantName: ex.merchantName,
    reason: ex.reason,
    excludedAt: toISOString(ex.excludedAt) || new Date().toISOString(),
  }));
}

/**
 * Export investment accounts to serializable format
 */
async function exportInvestmentAccounts(): Promise<InvestmentAccountExport[]> {
  const accounts = await db.investmentAccounts.toArray();
  return accounts.map(acc => ({
    id: acc.id,
    name: acc.name,
    type: acc.type,
    institution: acc.institution,
    accountNumber: acc.accountNumber,
    createdAt: toISOString(acc.createdAt) || new Date().toISOString(),
    updatedAt: toISOString(acc.updatedAt) || new Date().toISOString(),
  }));
}

/**
 * Export holdings to serializable format
 */
async function exportHoldings(): Promise<HoldingExport[]> {
  const holdings = await db.holdings.toArray();
  return holdings.map(holding => ({
    id: holding.id,
    accountId: holding.accountId,
    symbol: holding.symbol,
    quantity: holding.quantity,
    purchasePrice: holding.purchasePrice,
    purchaseDate: toISOString(holding.purchaseDate) || new Date().toISOString(),
    notes: holding.notes,
    createdAt: toISOString(holding.createdAt) || new Date().toISOString(),
    updatedAt: toISOString(holding.updatedAt) || new Date().toISOString(),
  }));
}

/**
 * Export retirement plans to serializable format
 */
async function exportRetirementPlans(): Promise<RetirementPlanExport[]> {
  const plans = await db.retirementPlans.toArray();
  return plans.map(plan => ({
    id: plan.id,
    name: plan.name,
    currentAge: plan.currentAge,
    retirementAge: plan.retirementAge,
    currentSavings: plan.currentSavings,
    monthlyContribution: plan.monthlyContribution,
    expectedReturn: plan.expectedReturn,
    inflationRate: plan.inflationRate,
    desiredMonthlyIncome: plan.desiredMonthlyIncome,
    lifespanAssumption: plan.lifespanAssumption,
    includeCPP: plan.includeCPP,
    estimatedCPPMonthly: plan.estimatedCPPMonthly,
    includeOAS: plan.includeOAS,
    estimatedOASMonthly: plan.estimatedOASMonthly,
    rrspBalance: plan.rrspBalance,
    tfsaBalance: plan.tfsaBalance,
    nonRegisteredBalance: plan.nonRegisteredBalance,
    companyShares: plan.companyShares,
    companySharesGrowthRate: plan.companySharesGrowthRate,
    stockOptions: plan.stockOptions,
    pensionPlan: plan.pensionPlan,
    employerPensionMonthly: plan.employerPensionMonthly,
    createdAt: toISOString(plan.createdAt) || new Date().toISOString(),
    updatedAt: toISOString(plan.updatedAt) || new Date().toISOString(),
  }));
}

/**
 * Export import mappings to serializable format
 */
async function exportImportMappings(): Promise<ImportMappingExport[]> {
  const mappings = await db.importMappings.toArray();
  return mappings.map(mapping => ({
    id: mapping.id,
    institution: mapping.institution,
    accountId: mapping.accountId,
    dateColumn: mapping.dateColumn,
    descriptionColumn: mapping.descriptionColumn,
    amountColumn: mapping.amountColumn,
    dateFormat: mapping.dateFormat,
    amountMultiplier: mapping.amountMultiplier,
    hasHeader: mapping.hasHeader,
    createdAt: toISOString(mapping.createdAt) || new Date().toISOString(),
  }));
}

/**
 * Export import history to serializable format
 */
async function exportImportHistory(): Promise<ImportHistoryExport[]> {
  const history = await db.importHistory.toArray();
  return history.map(record => ({
    id: record.id,
    fileName: record.fileName,
    fileFormat: record.fileFormat,
    bank: record.bank,
    importDate: toISOString(record.importDate) || new Date().toISOString(),
    transactionCount: record.transactionCount,
    duplicateCount: record.duplicateCount,
    dateRangeStart: toISOString(record.dateRangeStart),
    dateRangeEnd: toISOString(record.dateRangeEnd),
  }));
}

/**
 * Export receipts with base64-encoded data
 */
async function exportReceipts(): Promise<ReceiptExport[]> {
  const receipts = await db.receipts.toArray();

  return Promise.all(
    receipts.map(async receipt => ({
      id: receipt.id,
      transactionId: receipt.transactionId,
      filename: receipt.filename,
      mimeType: receipt.mimeType,
      data: await blobToBase64(receipt.blob),
      thumbnailData: receipt.thumbnail ? await blobToBase64(receipt.thumbnail) : undefined,
      fileSize: receipt.fileSize,
      uploadedAt: toISOString(receipt.uploadedAt) || new Date().toISOString(),
      metadata: receipt.metadata ? {
        width: receipt.metadata.width,
        height: receipt.metadata.height,
        pageCount: receipt.metadata.pageCount,
        ocrText: receipt.metadata.ocrText,
        extractedAmount: receipt.metadata.extractedAmount,
        extractedDate: toISOString(receipt.metadata.extractedDate) || undefined,
        extractedMerchant: receipt.metadata.extractedMerchant,
      } : undefined,
    }))
  );
}

/**
 * Get user settings from localStorage
 */
function getSettings(): SettingsExport {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const storedSettings = localStorage.getItem('budget-settings');
    if (storedSettings) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
    }
  } catch {
    // Ignore parse errors
  }

  return DEFAULT_SETTINGS;
}

/**
 * Get user preferences from localStorage
 */
function getPreferences(): PreferencesExport {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;

  try {
    const storedPrefs = localStorage.getItem('budget-preferences');
    if (storedPrefs) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(storedPrefs) };
    }
  } catch {
    // Ignore parse errors
  }

  return DEFAULT_PREFERENCES;
}

/**
 * Export profiles to serializable format
 * Note: PIN hash/salt are intentionally excluded for security
 */
async function exportProfiles(): Promise<ProfileExport[]> {
  const profiles = await db.profiles.toArray();
  return profiles.map(profile => ({
    id: profile.id,
    name: profile.name,
    isDefault: profile.isDefault,
    avatarColor: profile.avatarColor,
    avatarImage: profile.avatarImage,
    order: profile.order,
    createdAt: toISOString(profile.createdAt) || new Date().toISOString(),
    updatedAt: toISOString(profile.updatedAt) || new Date().toISOString(),
    // Note: pinHash and pinSalt are intentionally excluded for security
  }));
}

/**
 * Export activity log to serializable format
 */
async function exportActivityLog(): Promise<ActivityLogExport[]> {
  const entries = await db.activityLog.toArray();
  return entries.map(entry => ({
    id: entry.id,
    profileId: entry.profileId,
    profileName: entry.profileName,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    entityName: entry.entityName,
    details: entry.details,
    timestamp: toISOString(entry.timestamp) || new Date().toISOString(),
  }));
}

/**
 * Main export function - gathers all data and creates .budget file structure
 */
export async function exportBudgetData(
  options: ExportOptions = {}
): Promise<BudgetFile> {
  const {
    includeReceipts = false,
    includeInvestments = true,
    includeImportHistory = true,
  } = options;

  // Gather all data in parallel for performance
  const [
    accounts,
    transactions,
    categories,
    budgets,
    goals,
    loans,
    loanPayments,
    subscriptions,
    excludedSubscriptions,
    investmentAccounts,
    holdings,
    retirementPlans,
    importMappings,
    importHistory,
    receipts,
    profiles,
    activityLog,
  ] = await Promise.all([
    exportAccounts(),
    exportTransactions(),
    exportCategories(),
    exportBudgets(),
    exportGoals(),
    exportLoans(),
    exportLoanPayments(),
    exportSubscriptions(),
    exportExcludedSubscriptions(),
    includeInvestments ? exportInvestmentAccounts() : Promise.resolve([]),
    includeInvestments ? exportHoldings() : Promise.resolve([]),
    exportRetirementPlans(),
    exportImportMappings(),
    includeImportHistory ? exportImportHistory() : Promise.resolve([]),
    includeReceipts ? exportReceipts() : Promise.resolve([]),
    exportProfiles(),
    exportActivityLog(),
  ]);

  // Build data object
  const data: BudgetExportData = {
    accounts,
    transactions,
    categories,
    budgets,
    goals,
    loans,
    loanPayments,
    subscriptions,
    excludedSubscriptions,
    investments: [], // Not implemented yet
    portfolios: [], // Not implemented yet
    investmentHoldings: [], // Not implemented yet
    investmentTransactions: [], // Not implemented yet
    investmentAccounts,
    holdings,
    retirementPlans,
    importMappings,
    importHistory,
    receipts,
    settings: getSettings(),
    preferences: getPreferences(),
    // Multi-Profile Support
    profiles,
    activityLog,
  };

  // Calculate checksum
  const checksum = await calculateChecksum(data);
  const dataHash = checksum; // Same for unencrypted data

  // Get locale info
  const settings = getSettings();

  // Build metadata
  const metadata: BudgetFileMetadata = {
    version: BUDGET_FILE_VERSION,
    exportedAt: new Date().toISOString(),
    appVersion: APP_VERSION,
    checksum,
    encrypted: false,
    encryptionMethod: null,
    dataHash,
    locale: settings.locale,
    currency: settings.currency,
    timezone: settings.timezone,
  };

  return {
    metadata,
    data,
  };
}

/**
 * Export to downloadable file
 */
export async function downloadBudgetExport(
  options: ExportOptions = {}
): Promise<void> {
  const budgetFile = await exportBudgetData(options);

  // Generate filename
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = options.filename || `budget-export-${dateStr}.budget`;

  // Convert to JSON
  const jsonString = JSON.stringify(budgetFile, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get export statistics without doing full export
 */
export async function getExportStats(): Promise<{
  accounts: number;
  transactions: number;
  categories: number;
  budgets: number;
  goals: number;
  loans: number;
  subscriptions: number;
  receipts: number;
  profiles: number;
  activityLogEntries: number;
  estimatedSize: string;
}> {
  const [
    accountCount,
    transactionCount,
    categoryCount,
    budgetCount,
    goalCount,
    loanCount,
    subscriptionCount,
    receiptCount,
    profileCount,
    activityLogCount,
  ] = await Promise.all([
    db.accounts.count(),
    db.transactions.count(),
    db.categories.count(),
    db.budgets.count(),
    db.futurePurchases.count(),
    db.loans.count(),
    db.subscriptions.count(),
    db.receipts.count(),
    db.profiles.count(),
    db.activityLog.count(),
  ]);

  // Estimate file size (rough calculation)
  const estimatedBytes =
    accountCount * 200 +
    transactionCount * 500 +
    categoryCount * 150 +
    budgetCount * 100 +
    goalCount * 200 +
    loanCount * 500 +
    subscriptionCount * 300 +
    receiptCount * 50000 + // Receipts are the largest
    profileCount * 150 +
    activityLogCount * 250;

  const estimatedSize =
    estimatedBytes < 1024
      ? `${estimatedBytes} B`
      : estimatedBytes < 1024 * 1024
        ? `${(estimatedBytes / 1024).toFixed(1)} KB`
        : `${(estimatedBytes / 1024 / 1024).toFixed(1)} MB`;

  return {
    accounts: accountCount,
    transactions: transactionCount,
    categories: categoryCount,
    budgets: budgetCount,
    goals: goalCount,
    loans: loanCount,
    subscriptions: subscriptionCount,
    receipts: receiptCount,
    profiles: profileCount,
    activityLogEntries: activityLogCount,
    estimatedSize,
  };
}
