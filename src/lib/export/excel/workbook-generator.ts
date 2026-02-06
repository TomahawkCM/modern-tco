/**
 * Excel Workbook Generator
 * Main orchestrator for creating the Financial Summary Workbook
 */

import ExcelJS from 'exceljs';
import { db } from '@/lib/budget-db';
import type {
  ExcelExportOptions,
  ExportProgress,
  ExportProgressCallback,
  ExcelExportResult,
  SheetName,
  DEFAULT_EXCEL_OPTIONS,
} from './types';
import { generateDashboardSheet } from './sheets/dashboard-sheet';
import { generateTransactionsSheet } from './sheets/transactions-sheet';
import { generateMonthlySummarySheet } from './sheets/monthly-summary-sheet';
import { generateCategoryAnalysisSheet } from './sheets/category-analysis-sheet';
import { generateAccountsSheet } from './sheets/accounts-sheet';
import { generateBudgetsSheet } from './sheets/budgets-sheet';
import { generateSubscriptionsSheet } from './sheets/subscriptions-sheet';
import { generateLoansSheet } from './sheets/loans-sheet';
import { generateInvestmentsSheet } from './sheets/investments-sheet';
import { generateNetWorthSheet } from './sheets/net-worth-sheet';
import { generateGoalsSheet } from './sheets/goals-sheet';
import { generateDataDictionarySheet } from './sheets/data-dictionary-sheet';

/**
 * Get date range based on options
 */
function getDateRange(options: ExcelExportOptions): { start: Date | null; end: Date | null } {
  const now = new Date();
  const end = options.endDate || now;
  let start: Date | null = options.startDate || null;

  switch (options.dateRange) {
    case 'ytd':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case 'last12months':
      start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      break;
    case 'last6months':
      start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      break;
    case 'last3months':
      start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      break;
    case 'all':
      start = null;
      break;
    case 'custom':
      // Use provided dates
      break;
  }

  return { start, end };
}

/**
 * Gather all data needed for export
 */
async function gatherExportData(options: ExcelExportOptions) {
  const dateRange = getDateRange(options);

  // Fetch all data in parallel
  const [
    accounts,
    allTransactions,
    categories,
    budgets,
    goals,
    loans,
    loanPayments,
    subscriptions,
    investmentAccounts,
    holdings,
  ] = await Promise.all([
    db.accounts.toArray(),
    db.transactions.toArray(),
    db.categories.toArray(),
    db.budgets.toArray(),
    db.futurePurchases.toArray(),
    db.loans.toArray(),
    db.loanPayments.toArray(),
    db.subscriptions.toArray(),
    db.investmentAccounts.toArray(),
    db.holdings.toArray(),
  ]);

  // Filter transactions by date range and exclude split parents
  let transactions = allTransactions.filter(tx => !tx.isSplit);

  if (dateRange.start) {
    transactions = transactions.filter(tx => new Date(tx.date) >= dateRange.start!);
  }
  if (dateRange.end) {
    transactions = transactions.filter(tx => new Date(tx.date) <= dateRange.end!);
  }

  // Sort transactions by date descending
  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    accounts,
    transactions,
    categories,
    budgets,
    goals,
    loans,
    loanPayments,
    subscriptions,
    investmentAccounts,
    holdings,
    dateRange,
  };
}

/**
 * Generate the complete Financial Summary Workbook
 */
export async function generateFinancialWorkbook(
  options: ExcelExportOptions = {
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
  },
  onProgress?: ExportProgressCallback
): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();

  // Set workbook properties
  workbook.creator = 'Budget App';
  workbook.lastModifiedBy = 'Budget App';
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.properties.date1904 = false;

  // Set company
  workbook.company = 'Budget App';
  workbook.manager = '';

  // Gather all data
  onProgress?.({
    stage: 'preparing',
    sheetsCompleted: 0,
    totalSheets: 12,
    percent: 5,
    message: 'Gathering data...',
  });

  const data = await gatherExportData(options);
  const sheetsIncluded: SheetName[] = [];
  let sheetsCompleted = 0;

  // Calculate total sheets to generate
  const totalSheets = [
    options.includeDashboard,
    options.includeTransactions,
    options.includeMonthlySummary,
    options.includeCategoryAnalysis,
    options.includeAccounts,
    options.includeBudgets,
    options.includeSubscriptions,
    options.includeLoans,
    options.includeInvestments,
    options.includeNetWorth,
    options.includeGoals,
    options.includeDataDictionary,
  ].filter(Boolean).length;

  const updateProgress = (sheet: SheetName) => {
    sheetsCompleted++;
    onProgress?.({
      stage: 'transactions',
      currentSheet: sheet,
      sheetsCompleted,
      totalSheets,
      percent: Math.round((sheetsCompleted / totalSheets) * 90) + 5,
      message: `Generating ${sheet}...`,
    });
  };

  // Generate sheets in order (Dashboard first as it's the summary view)
  if (options.includeDashboard) {
    await generateDashboardSheet(workbook, data, options);
    sheetsIncluded.push('Dashboard');
    updateProgress('Dashboard');
  }

  if (options.includeTransactions) {
    await generateTransactionsSheet(workbook, data, options);
    sheetsIncluded.push('Transactions');
    updateProgress('Transactions');
  }

  if (options.includeMonthlySummary) {
    await generateMonthlySummarySheet(workbook, data, options);
    sheetsIncluded.push('Monthly Summary');
    updateProgress('Monthly Summary');
  }

  if (options.includeCategoryAnalysis) {
    await generateCategoryAnalysisSheet(workbook, data, options);
    sheetsIncluded.push('Category Analysis');
    updateProgress('Category Analysis');
  }

  if (options.includeAccounts) {
    await generateAccountsSheet(workbook, data, options);
    sheetsIncluded.push('Accounts');
    updateProgress('Accounts');
  }

  if (options.includeBudgets) {
    await generateBudgetsSheet(workbook, data, options);
    sheetsIncluded.push('Budgets');
    updateProgress('Budgets');
  }

  if (options.includeSubscriptions && data.subscriptions.length > 0) {
    await generateSubscriptionsSheet(workbook, data, options);
    sheetsIncluded.push('Subscriptions');
    updateProgress('Subscriptions');
  }

  if (options.includeLoans && data.loans.length > 0) {
    await generateLoansSheet(workbook, data, options);
    sheetsIncluded.push('Loans');
    updateProgress('Loans');
  }

  if (options.includeInvestments && (data.investmentAccounts.length > 0 || data.holdings.length > 0)) {
    await generateInvestmentsSheet(workbook, data, options);
    sheetsIncluded.push('Investments');
    updateProgress('Investments');
  }

  if (options.includeNetWorth) {
    await generateNetWorthSheet(workbook, data, options);
    sheetsIncluded.push('Net Worth');
    updateProgress('Net Worth');
  }

  if (options.includeGoals && data.goals.length > 0) {
    await generateGoalsSheet(workbook, data, options);
    sheetsIncluded.push('Goals');
    updateProgress('Goals');
  }

  if (options.includeDataDictionary) {
    await generateDataDictionarySheet(workbook, sheetsIncluded);
    sheetsIncluded.push('Data Dictionary');
    updateProgress('Data Dictionary');
  }

  onProgress?.({
    stage: 'finalizing',
    sheetsCompleted: totalSheets,
    totalSheets,
    percent: 100,
    message: 'Finalizing workbook...',
  });

  return workbook;
}

/**
 * Generate and download the Excel workbook
 */
export async function downloadExcelExport(
  options: ExcelExportOptions = {
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
  },
  onProgress?: ExportProgressCallback
): Promise<ExcelExportResult> {
  try {
    const workbook = await generateFinancialWorkbook(options, onProgress);

    // Generate filename
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = options.filename || `Financial-Summary-${dateStr}.xlsx`;

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Create blob and download
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Get transaction count and date range
    const data = await gatherExportData(options);

    return {
      success: true,
      filename,
      fileSize: buffer.byteLength,
      sheetsIncluded: workbook.worksheets.map(ws => ws.name as SheetName),
      transactionCount: data.transactions.length,
      dateRange: data.dateRange,
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error('Excel export error:', error);
    return {
      success: false,
      filename: '',
      fileSize: 0,
      sheetsIncluded: [],
      transactionCount: 0,
      dateRange: { start: null, end: null },
      generatedAt: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get export statistics without doing full export
 */
export async function getExcelExportStats(options: ExcelExportOptions): Promise<{
  transactionCount: number;
  accountCount: number;
  categoryCount: number;
  budgetCount: number;
  loanCount: number;
  subscriptionCount: number;
  investmentAccountCount: number;
  goalCount: number;
  estimatedSheets: number;
  dateRange: { start: Date | null; end: Date | null };
}> {
  const data = await gatherExportData(options);

  const estimatedSheets = [
    options.includeDashboard,
    options.includeTransactions,
    options.includeMonthlySummary,
    options.includeCategoryAnalysis,
    options.includeAccounts,
    options.includeBudgets,
    options.includeSubscriptions && data.subscriptions.length > 0,
    options.includeLoans && data.loans.length > 0,
    options.includeInvestments && data.investmentAccounts.length > 0,
    options.includeNetWorth,
    options.includeGoals && data.goals.length > 0,
    options.includeDataDictionary,
  ].filter(Boolean).length;

  return {
    transactionCount: data.transactions.length,
    accountCount: data.accounts.length,
    categoryCount: data.categories.length,
    budgetCount: data.budgets.length,
    loanCount: data.loans.length,
    subscriptionCount: data.subscriptions.length,
    investmentAccountCount: data.investmentAccounts.length,
    goalCount: data.goals.length,
    estimatedSheets,
    dateRange: data.dateRange,
  };
}

// Re-export types
export * from './types';
