/**
 * Net Worth Sheet Generator
 * Assets vs liabilities breakdown and history
 */

import type { Workbook, Worksheet } from "exceljs";
import type { ExcelExportOptions, NetWorthSnapshot } from "../types";
import type { Account, Loan, Transaction } from "@/types/budget";
import type { InvestmentAccount, Holding } from "@/lib/budget-db";
import {
  FONTS,
  FILLS,
  BORDERS,
  ALIGNMENTS,
  NUMBER_FORMATS,
  styleHeaderRow,
  styleDataRow,
  styleCurrencyCell,
  setColumnWidths,
  freezePanes,
  createTitleSection,
  EXCEL_COLORS,
} from "../styles";

interface NetWorthSheetData {
  accounts: Account[];
  loans: Loan[];
  investmentAccounts: InvestmentAccount[];
  holdings: Holding[];
  transactions: Transaction[];
  dateRange: { start: Date | null; end: Date | null };
}

/**
 * Calculate current net worth
 */
function calculateCurrentNetWorth(data: NetWorthSheetData): NetWorthSnapshot {
  // Cash & Checking
  const cashChecking = data.accounts
    .filter((a) => a.type === "checking")
    .reduce((sum, a) => sum + a.balance, 0);

  // Savings
  const savings = data.accounts
    .filter((a) => a.type === "savings")
    .reduce((sum, a) => sum + a.balance, 0);

  // Investments (using purchase price as proxy for current value)
  const investments = data.holdings.reduce((sum, h) => sum + h.quantity * h.purchasePrice, 0);

  // Credit Cards
  const creditCards = data.accounts
    .filter((a) => a.type === "credit")
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);

  // Loans
  const loans = data.loans
    .filter((l) => l.status === "active")
    .reduce((sum, l) => sum + l.currentBalance, 0);

  const totalAssets = cashChecking + savings + investments;
  const totalLiabilities = creditCards + loans;

  return {
    date: new Date(),
    assets: {
      cashChecking,
      savings,
      investments,
      other: 0,
      total: totalAssets,
    },
    liabilities: {
      creditCards,
      loans,
      other: 0,
      total: totalLiabilities,
    },
    netWorth: totalAssets - totalLiabilities,
  };
}

/**
 * Estimate historical net worth based on transactions
 * This is a simplified approximation
 */
function estimateHistoricalNetWorth(
  data: NetWorthSheetData,
  currentSnapshot: NetWorthSnapshot,
  months: number
): NetWorthSnapshot[] {
  const history: NetWorthSnapshot[] = [];
  const now = new Date();

  // Start with current snapshot
  let runningNetWorth = currentSnapshot.netWorth;
  let runningAssets = currentSnapshot.assets.total;
  let runningLiabilities = currentSnapshot.liabilities.total;

  for (let i = 0; i < months; i++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    // Get transactions for this month
    const monthTransactions = data.transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      return txDate >= monthDate && txDate <= monthEnd;
    });

    // Calculate net change for the month
    const monthIncome = monthTransactions
      .filter((tx) => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
    const monthExpenses = Math.abs(
      monthTransactions.filter((tx) => tx.amount < 0).reduce((sum, tx) => sum + tx.amount, 0)
    );
    const monthNet = monthIncome - monthExpenses;

    // Reverse the change to estimate previous month
    if (i > 0) {
      runningNetWorth -= monthNet;
      runningAssets -= monthNet * 0.8; // Assume 80% goes to assets
      runningLiabilities += monthNet * 0.2; // And 20% from liabilities
    }

    history.push({
      date: monthDate,
      assets: {
        cashChecking: runningAssets * 0.3,
        savings: runningAssets * 0.3,
        investments: runningAssets * 0.4,
        other: 0,
        total: runningAssets,
      },
      liabilities: {
        creditCards: runningLiabilities * 0.2,
        loans: runningLiabilities * 0.8,
        other: 0,
        total: runningLiabilities,
      },
      netWorth: runningNetWorth,
    });
  }

  return history.reverse(); // Oldest first
}

/**
 * Generate the Net Worth sheet
 */
export async function generateNetWorthSheet(
  workbook: Workbook,
  data: NetWorthSheetData,
  options: ExcelExportOptions
): Promise<Worksheet> {
  const worksheet = workbook.addWorksheet("Net Worth", {
    properties: { tabColor: { argb: "FF059669" } }, // Emerald tab
  });

  // Calculate current net worth
  const currentNetWorth = calculateCurrentNetWorth(data);

  // Create title section
  let currentRow = createTitleSection(
    worksheet,
    "Net Worth Statement",
    new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    new Date()
  );

  // Set column widths
  setColumnWidths(worksheet, [25, 18, 5, 25, 18]);

  // ==================== CURRENT NET WORTH ====================
  const headerRow = worksheet.getRow(currentRow);
  headerRow.getCell(1).value = "ASSETS";
  headerRow.getCell(1).font = { ...FONTS.header, size: 14 };
  headerRow.getCell(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF10B981" },
  };
  worksheet.mergeCells(`A${currentRow}:B${currentRow}`);

  headerRow.getCell(4).value = "LIABILITIES";
  headerRow.getCell(4).font = { ...FONTS.header, size: 14 };
  headerRow.getCell(4).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFEF4444" },
  };
  worksheet.mergeCells(`D${currentRow}:E${currentRow}`);
  currentRow++;

  // Assets breakdown
  const assetItems = [
    ["Cash & Checking", currentNetWorth.assets.cashChecking],
    ["Savings", currentNetWorth.assets.savings],
    ["Investments", currentNetWorth.assets.investments],
  ];

  // Liabilities breakdown
  const liabilityItems = [
    ["Credit Cards", currentNetWorth.liabilities.creditCards],
    ["Loans", currentNetWorth.liabilities.loans],
  ];

  const maxItems = Math.max(assetItems.length, liabilityItems.length);

  for (let i = 0; i < maxItems; i++) {
    const row = worksheet.getRow(currentRow);

    // Asset item
    if (i < assetItems.length) {
      row.getCell(1).value = assetItems[i][0];
      row.getCell(1).font = FONTS.body;
      row.getCell(2).value = assetItems[i][1];
      row.getCell(2).numFmt = NUMBER_FORMATS.currency;
      row.getCell(2).alignment = ALIGNMENTS.right;
      row.getCell(2).font = { ...FONTS.body, color: { argb: "FF10B981" } };
    }

    // Liability item
    if (i < liabilityItems.length) {
      row.getCell(4).value = liabilityItems[i][0];
      row.getCell(4).font = FONTS.body;
      row.getCell(5).value = liabilityItems[i][1];
      row.getCell(5).numFmt = NUMBER_FORMATS.currency;
      row.getCell(5).alignment = ALIGNMENTS.right;
      row.getCell(5).font = { ...FONTS.body, color: { argb: "FFEF4444" } };
    }

    currentRow++;
  }

  // Totals row
  currentRow++;
  const totalAssetsRow = worksheet.getRow(currentRow);
  totalAssetsRow.getCell(1).value = "Total Assets";
  totalAssetsRow.getCell(1).font = { ...FONTS.body, bold: true };
  totalAssetsRow.getCell(1).border = { top: { style: "medium", color: { argb: "FF10B981" } } };
  totalAssetsRow.getCell(2).value = currentNetWorth.assets.total;
  totalAssetsRow.getCell(2).numFmt = NUMBER_FORMATS.currency;
  totalAssetsRow.getCell(2).font = { ...FONTS.body, bold: true, color: { argb: "FF10B981" } };
  totalAssetsRow.getCell(2).border = { top: { style: "medium", color: { argb: "FF10B981" } } };

  totalAssetsRow.getCell(4).value = "Total Liabilities";
  totalAssetsRow.getCell(4).font = { ...FONTS.body, bold: true };
  totalAssetsRow.getCell(4).border = { top: { style: "medium", color: { argb: "FFEF4444" } } };
  totalAssetsRow.getCell(5).value = currentNetWorth.liabilities.total;
  totalAssetsRow.getCell(5).numFmt = NUMBER_FORMATS.currency;
  totalAssetsRow.getCell(5).font = { ...FONTS.body, bold: true, color: { argb: "FFEF4444" } };
  totalAssetsRow.getCell(5).border = { top: { style: "medium", color: { argb: "FFEF4444" } } };
  currentRow += 2;

  // Net Worth display
  const netWorthHeaderRow = worksheet.getRow(currentRow);
  worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
  netWorthHeaderRow.getCell(1).value = "NET WORTH";
  netWorthHeaderRow.getCell(1).font = { ...FONTS.subheader, size: 16 };
  netWorthHeaderRow.getCell(1).alignment = ALIGNMENTS.center;
  netWorthHeaderRow.getCell(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF3F4F6" },
  };
  netWorthHeaderRow.height = 30;
  currentRow++;

  const netWorthValueRow = worksheet.getRow(currentRow);
  worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
  netWorthValueRow.getCell(1).value = currentNetWorth.netWorth;
  netWorthValueRow.getCell(1).numFmt = NUMBER_FORMATS.currency;
  netWorthValueRow.getCell(1).font = {
    name: "Calibri",
    size: 28,
    bold: true,
    color: { argb: currentNetWorth.netWorth >= 0 ? "FF10B981" : "FFEF4444" },
  };
  netWorthValueRow.getCell(1).alignment = ALIGNMENTS.center;
  netWorthValueRow.height = 45;
  currentRow += 3;

  // ==================== NET WORTH HISTORY ====================
  const historyHeaderRow = worksheet.getRow(currentRow);
  worksheet.mergeCells(`A${currentRow}:E${currentRow}`);
  historyHeaderRow.getCell(1).value = "NET WORTH HISTORY (Last 6 Months)";
  historyHeaderRow.getCell(1).font = { ...FONTS.subheader, size: 12 };
  historyHeaderRow.getCell(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF3F4F6" },
  };
  currentRow++;

  // History table header
  const historyColumns = ["Date", "Assets", "Liabilities", "Net Worth", "Change"];
  const historyTableHeader = worksheet.getRow(currentRow);
  historyColumns.forEach((col, index) => {
    historyTableHeader.getCell(index + 1).value = col;
  });
  styleHeaderRow(historyTableHeader, historyColumns.length);
  currentRow++;

  // Generate and display history
  const history = estimateHistoricalNetWorth(data, currentNetWorth, 6);

  history.forEach((snapshot, index) => {
    const row = worksheet.getRow(currentRow);
    const prevNetWorth = index > 0 ? history[index - 1].netWorth : snapshot.netWorth;
    const change = snapshot.netWorth - prevNetWorth;

    row.getCell(1).value = snapshot.date;
    row.getCell(1).numFmt = "MMM YYYY";
    row.getCell(1).alignment = ALIGNMENTS.center;

    row.getCell(2).value = snapshot.assets.total;
    row.getCell(2).numFmt = NUMBER_FORMATS.currency;
    row.getCell(2).font = { ...FONTS.body, color: { argb: "FF10B981" } };

    row.getCell(3).value = snapshot.liabilities.total;
    row.getCell(3).numFmt = NUMBER_FORMATS.currency;
    row.getCell(3).font = { ...FONTS.body, color: { argb: "FFEF4444" } };

    row.getCell(4).value = snapshot.netWorth;
    row.getCell(4).numFmt = NUMBER_FORMATS.currency;
    row.getCell(4).font = { ...FONTS.body, bold: true };

    row.getCell(5).value = change;
    styleCurrencyCell(row.getCell(5), change);

    styleDataRow(row, index, historyColumns.length);
    currentRow++;
  });

  return worksheet;
}
