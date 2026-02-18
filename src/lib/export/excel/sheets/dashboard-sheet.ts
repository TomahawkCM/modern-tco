/**
 * Dashboard Sheet Generator
 * Executive summary with key metrics, charts, and quick navigation
 */

import type { Workbook, Worksheet } from "exceljs";
import type { ExcelExportOptions, DashboardMetric } from "../types";
import type {
  Transaction,
  Account,
  Category,
  Budget,
  FuturePurchase,
  Loan,
  Subscription,
} from "@/types/budget";
import type { InvestmentAccount, Holding } from "@/lib/budget-db";
import {
  FONTS,
  FILLS,
  BORDERS,
  ALIGNMENTS,
  NUMBER_FORMATS,
  setColumnWidths,
  addSheetLink,
  getArgbColor,
  EXCEL_COLORS,
} from "../styles";

interface DashboardSheetData {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  budgets: Budget[];
  goals: FuturePurchase[];
  loans: Loan[];
  subscriptions: Subscription[];
  investmentAccounts: InvestmentAccount[];
  holdings: Holding[];
  dateRange: { start: Date | null; end: Date | null };
}

/**
 * Calculate key financial metrics
 */
function calculateMetrics(data: DashboardSheetData) {
  // Get current month transactions
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const currentMonthTx = data.transactions.filter((tx) => new Date(tx.date) >= currentMonthStart);
  const lastMonthTx = data.transactions.filter((tx) => {
    const date = new Date(tx.date);
    return date >= lastMonthStart && date <= lastMonthEnd;
  });

  // Calculate income and expenses
  const currentIncome = currentMonthTx
    .filter((tx) => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const currentExpenses = Math.abs(
    currentMonthTx.filter((tx) => tx.amount < 0).reduce((sum, tx) => sum + tx.amount, 0)
  );
  const lastIncome = lastMonthTx
    .filter((tx) => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const lastExpenses = Math.abs(
    lastMonthTx.filter((tx) => tx.amount < 0).reduce((sum, tx) => sum + tx.amount, 0)
  );

  // Net worth calculation
  const cashBalance = data.accounts
    .filter((a) => a.type === "checking" || a.type === "savings")
    .reduce((sum, a) => sum + a.balance, 0);

  const creditBalance = data.accounts
    .filter((a) => a.type === "credit")
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);

  const investmentValue = data.holdings.reduce((sum, h) => sum + h.quantity * h.purchasePrice, 0);

  const totalDebt = data.loans.reduce((sum, l) => sum + l.currentBalance, 0) + creditBalance;

  const netWorth = cashBalance + investmentValue - totalDebt;

  // Savings rate
  const savingsRate = currentIncome > 0 ? (currentIncome - currentExpenses) / currentIncome : 0;

  // Monthly subscription cost
  const monthlySubscriptions = data.subscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => {
      switch (s.billingCycle) {
        case "weekly":
          return sum + s.amount * 4.33;
        case "bi-weekly":
          return sum + s.amount * 2.17;
        case "monthly":
          return sum + s.amount;
        case "quarterly":
          return sum + s.amount / 3;
        case "annual":
          return sum + s.amount / 12;
        default:
          return sum + s.amount;
      }
    }, 0);

  // Budget status
  const totalBudget = data.budgets.reduce(
    (sum, b) => sum + (b.period === "annual" ? b.amount / 12 : b.amount),
    0
  );
  const budgetUsed = totalBudget > 0 ? currentExpenses / totalBudget : 0;

  // Goals progress
  const totalGoalTarget = data.goals
    .filter((g) => !g.isCompleted)
    .reduce((sum, g) => sum + g.targetAmount, 0);
  const totalGoalCurrent = data.goals
    .filter((g) => !g.isCompleted)
    .reduce((sum, g) => sum + g.currentSavings, 0);
  const goalsProgress = totalGoalTarget > 0 ? totalGoalCurrent / totalGoalTarget : 0;

  return {
    netWorth,
    netWorthChange: currentIncome - currentExpenses,
    monthlyIncome: currentIncome,
    monthlyExpenses: currentExpenses,
    savingsRate,
    totalDebt,
    monthlySubscriptions,
    totalBudget,
    budgetUsed,
    goalsProgress,
    accountCount: data.accounts.length,
    transactionCount: currentMonthTx.length,
    incomeVsLastMonth: lastIncome > 0 ? (currentIncome - lastIncome) / lastIncome : 0,
    expensesVsLastMonth: lastExpenses > 0 ? (currentExpenses - lastExpenses) / lastExpenses : 0,
  };
}

/**
 * Get top spending categories
 */
function getTopCategories(transactions: Transaction[], categories: Category[], limit = 5) {
  const categorySpending = new Map<string, number>();

  transactions
    .filter((tx) => tx.amount < 0)
    .forEach((tx) => {
      const catName = tx.category || "Uncategorized";
      categorySpending.set(catName, (categorySpending.get(catName) || 0) + Math.abs(tx.amount));
    });

  const totalSpending = Array.from(categorySpending.values()).reduce((sum, v) => sum + v, 0);

  return Array.from(categorySpending.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, amount]) => {
      const cat = categories.find((c) => c.name === name);
      return {
        name,
        amount,
        percentage: totalSpending > 0 ? amount / totalSpending : 0,
        color: cat?.color || "#6B7280",
        icon: cat?.icon || "circle",
      };
    });
}

/**
 * Create visual progress bar using Unicode characters
 */
function createProgressBar(percent: number, width = 20): string {
  const filled = Math.min(Math.round(percent * width), width);
  const empty = width - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

/**
 * Generate the Dashboard sheet
 */
export async function generateDashboardSheet(
  workbook: Workbook,
  data: DashboardSheetData,
  options: ExcelExportOptions
): Promise<Worksheet> {
  const worksheet = workbook.addWorksheet("Dashboard", {
    properties: { tabColor: { argb: "FF14B8A6" } }, // Teal tab
  });

  // Set column widths for dashboard layout
  setColumnWidths(worksheet, [2, 18, 18, 4, 18, 18, 4, 18, 18, 2]);

  const metrics = calculateMetrics(data);
  const topCategories = getTopCategories(data.transactions, data.categories);
  let currentRow = 2;

  // ==================== HEADER ====================
  const titleRow = worksheet.getRow(currentRow);
  worksheet.mergeCells(`B${currentRow}:I${currentRow}`);
  titleRow.getCell(2).value = "💰 FINANCIAL SUMMARY";
  titleRow.getCell(2).font = { ...FONTS.title, size: 24 };
  titleRow.getCell(2).alignment = ALIGNMENTS.left;
  titleRow.height = 40;
  currentRow++;

  // Export date
  const dateRow = worksheet.getRow(currentRow);
  worksheet.mergeCells(`B${currentRow}:I${currentRow}`);
  const locale = options.locale ?? "en-US";
  dateRow.getCell(2).value =
    `Export Date: ${new Date().toLocaleDateString(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`;
  dateRow.getCell(2).font = FONTS.bodyMuted;
  currentRow += 2;

  // ==================== KEY METRICS ====================
  const metricsHeaderRow = worksheet.getRow(currentRow);
  worksheet.mergeCells(`B${currentRow}:I${currentRow}`);
  metricsHeaderRow.getCell(2).value = "KEY METRICS";
  metricsHeaderRow.getCell(2).font = { ...FONTS.subheader, size: 14 };
  metricsHeaderRow.getCell(2).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF3F4F6" },
  };
  metricsHeaderRow.height = 28;
  currentRow++;

  // Metric boxes row 1
  currentRow++;
  const metricRow1 = worksheet.getRow(currentRow);

  // Net Worth
  metricRow1.getCell(2).value = "Net Worth";
  metricRow1.getCell(2).font = FONTS.metricLabel;
  metricRow1.getCell(2).alignment = ALIGNMENTS.center;

  // Monthly Income
  metricRow1.getCell(5).value = "Monthly Income";
  metricRow1.getCell(5).font = FONTS.metricLabel;
  metricRow1.getCell(5).alignment = ALIGNMENTS.center;

  // Savings Rate
  metricRow1.getCell(8).value = "Savings Rate";
  metricRow1.getCell(8).font = FONTS.metricLabel;
  metricRow1.getCell(8).alignment = ALIGNMENTS.center;
  currentRow++;

  // Metric values row 1
  const valueRow1 = worksheet.getRow(currentRow);
  valueRow1.height = 35;

  // Net Worth value
  valueRow1.getCell(2).value = metrics.netWorth;
  valueRow1.getCell(2).numFmt = NUMBER_FORMATS.currency;
  valueRow1.getCell(2).font = {
    ...FONTS.metric,
    color: { argb: metrics.netWorth >= 0 ? "FF10B981" : "FFEF4444" },
  };
  valueRow1.getCell(2).alignment = ALIGNMENTS.center;

  // Monthly Income value
  valueRow1.getCell(5).value = metrics.monthlyIncome;
  valueRow1.getCell(5).numFmt = NUMBER_FORMATS.currency;
  valueRow1.getCell(5).font = { ...FONTS.metric, color: { argb: "FF10B981" } };
  valueRow1.getCell(5).alignment = ALIGNMENTS.center;

  // Savings Rate value
  valueRow1.getCell(8).value = metrics.savingsRate;
  valueRow1.getCell(8).numFmt = NUMBER_FORMATS.percent;
  valueRow1.getCell(8).font = {
    ...FONTS.metric,
    color: {
      argb:
        metrics.savingsRate >= 0.2
          ? "FF10B981"
          : metrics.savingsRate >= 0.1
            ? "FFF59E0B"
            : "FFEF4444",
    },
  };
  valueRow1.getCell(8).alignment = ALIGNMENTS.center;
  currentRow++;

  // Trend indicators row 1
  const trendRow1 = worksheet.getRow(currentRow);
  trendRow1.getCell(2).value =
    metrics.netWorthChange >= 0
      ? `▲ +${metrics.netWorthChange.toLocaleString(locale, { style: "currency", currency: "USD" })}`
      : `▼ -${Math.abs(metrics.netWorthChange).toLocaleString(locale, { style: "currency", currency: "USD" })}`;
  trendRow1.getCell(2).font = {
    ...FONTS.bodyMuted,
    color: { argb: metrics.netWorthChange >= 0 ? "FF10B981" : "FFEF4444" },
  };
  trendRow1.getCell(2).alignment = ALIGNMENTS.center;

  trendRow1.getCell(5).value =
    `${metrics.incomeVsLastMonth >= 0 ? "▲" : "▼"} ${(metrics.incomeVsLastMonth * 100).toFixed(1)}% vs last month`;
  trendRow1.getCell(5).font = {
    ...FONTS.bodyMuted,
    color: { argb: metrics.incomeVsLastMonth >= 0 ? "FF10B981" : "FFEF4444" },
  };
  trendRow1.getCell(5).alignment = ALIGNMENTS.center;

  trendRow1.getCell(8).value = `Target: 20%+`;
  trendRow1.getCell(8).font = FONTS.bodyMuted;
  trendRow1.getCell(8).alignment = ALIGNMENTS.center;
  currentRow += 2;

  // Metric boxes row 2
  const metricRow2 = worksheet.getRow(currentRow);

  // Monthly Expenses
  metricRow2.getCell(2).value = "Monthly Expenses";
  metricRow2.getCell(2).font = FONTS.metricLabel;
  metricRow2.getCell(2).alignment = ALIGNMENTS.center;

  // Total Debt
  metricRow2.getCell(5).value = "Total Debt";
  metricRow2.getCell(5).font = FONTS.metricLabel;
  metricRow2.getCell(5).alignment = ALIGNMENTS.center;

  // Subscriptions/mo
  metricRow2.getCell(8).value = "Subscriptions/mo";
  metricRow2.getCell(8).font = FONTS.metricLabel;
  metricRow2.getCell(8).alignment = ALIGNMENTS.center;
  currentRow++;

  // Metric values row 2
  const valueRow2 = worksheet.getRow(currentRow);
  valueRow2.height = 35;

  // Monthly Expenses value
  valueRow2.getCell(2).value = metrics.monthlyExpenses;
  valueRow2.getCell(2).numFmt = NUMBER_FORMATS.currency;
  valueRow2.getCell(2).font = { ...FONTS.metric, color: { argb: "FFEF4444" } };
  valueRow2.getCell(2).alignment = ALIGNMENTS.center;

  // Total Debt value
  valueRow2.getCell(5).value = metrics.totalDebt;
  valueRow2.getCell(5).numFmt = NUMBER_FORMATS.currency;
  valueRow2.getCell(5).font = { ...FONTS.metric, color: { argb: "FFEF4444" } };
  valueRow2.getCell(5).alignment = ALIGNMENTS.center;

  // Subscriptions value
  valueRow2.getCell(8).value = metrics.monthlySubscriptions;
  valueRow2.getCell(8).numFmt = NUMBER_FORMATS.currency;
  valueRow2.getCell(8).font = { ...FONTS.metric, color: { argb: "FF6B7280" } };
  valueRow2.getCell(8).alignment = ALIGNMENTS.center;
  currentRow++;

  // Trend indicators row 2
  const trendRow2 = worksheet.getRow(currentRow);
  trendRow2.getCell(2).value =
    `${metrics.expensesVsLastMonth >= 0 ? "▲" : "▼"} ${(Math.abs(metrics.expensesVsLastMonth) * 100).toFixed(1)}% vs last month`;
  trendRow2.getCell(2).font = {
    ...FONTS.bodyMuted,
    color: { argb: metrics.expensesVsLastMonth <= 0 ? "FF10B981" : "FFEF4444" },
  };
  trendRow2.getCell(2).alignment = ALIGNMENTS.center;

  trendRow2.getCell(5).value =
    data.loans.length > 0 ? `${data.loans.length} active loans` : "No loans";
  trendRow2.getCell(5).font = FONTS.bodyMuted;
  trendRow2.getCell(5).alignment = ALIGNMENTS.center;

  trendRow2.getCell(8).value =
    `${data.subscriptions.filter((s) => s.status === "active").length} active`;
  trendRow2.getCell(8).font = FONTS.bodyMuted;
  trendRow2.getCell(8).alignment = ALIGNMENTS.center;
  currentRow += 3;

  // ==================== TOP SPENDING CATEGORIES ====================
  const catHeaderRow = worksheet.getRow(currentRow);
  worksheet.mergeCells(`B${currentRow}:E${currentRow}`);
  catHeaderRow.getCell(2).value = "TOP SPENDING CATEGORIES";
  catHeaderRow.getCell(2).font = { ...FONTS.subheader, size: 14 };
  catHeaderRow.getCell(2).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF3F4F6" },
  };

  // Budget Status header
  worksheet.mergeCells(`F${currentRow}:I${currentRow}`);
  catHeaderRow.getCell(6).value = "BUDGET STATUS";
  catHeaderRow.getCell(6).font = { ...FONTS.subheader, size: 14 };
  catHeaderRow.getCell(6).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF3F4F6" },
  };
  catHeaderRow.height = 28;
  currentRow++;

  // Categories and Budget side by side
  topCategories.forEach((cat, index) => {
    const catRow = worksheet.getRow(currentRow + index);

    // Category icon placeholder and name
    catRow.getCell(2).value = cat.name;
    catRow.getCell(2).font = FONTS.body;
    catRow.getCell(2).border = {
      left: { style: "thick", color: getArgbColor(cat.color) },
    };

    // Amount
    catRow.getCell(3).value = cat.amount;
    catRow.getCell(3).numFmt = NUMBER_FORMATS.currency;
    catRow.getCell(3).alignment = ALIGNMENTS.right;

    // Percentage
    catRow.getCell(4).value = `(${(cat.percentage * 100).toFixed(0)}%)`;
    catRow.getCell(4).font = FONTS.bodyMuted;
    catRow.getCell(4).alignment = ALIGNMENTS.left;
  });

  // Budget status indicators
  const budgetStatuses = [
    {
      label: "On Track",
      percent: metrics.budgetUsed < 0.8 ? 1 - metrics.budgetUsed : 0,
      color: "10B981",
    },
    {
      label: "Near Limit",
      percent: metrics.budgetUsed >= 0.8 && metrics.budgetUsed < 1 ? 0.5 : 0,
      color: "F59E0B",
    },
    {
      label: "Over Budget",
      percent: metrics.budgetUsed >= 1 ? metrics.budgetUsed - 1 : 0,
      color: "EF4444",
    },
  ];

  budgetStatuses.forEach((status, index) => {
    const statusRow = worksheet.getRow(currentRow + index);

    statusRow.getCell(6).value = status.label;
    statusRow.getCell(6).font = FONTS.body;

    const barWidth = Math.max(1, Math.round(status.percent * 10));
    statusRow.getCell(7).value = "█".repeat(barWidth);
    statusRow.getCell(7).font = {
      name: "Consolas",
      size: 11,
      color: { argb: `FF${status.color}` },
    };
  });

  // Overall budget progress
  const budgetProgressRow = worksheet.getRow(currentRow + 4);
  budgetProgressRow.getCell(6).value =
    `Overall: ${(metrics.budgetUsed * 100).toFixed(0)}% of budget used`;
  budgetProgressRow.getCell(6).font = {
    ...FONTS.body,
    bold: true,
    color: {
      argb:
        metrics.budgetUsed > 1 ? "FFEF4444" : metrics.budgetUsed > 0.8 ? "FFF59E0B" : "FF10B981",
    },
  };

  currentRow += 7;

  // ==================== QUICK LINKS ====================
  const linksHeaderRow = worksheet.getRow(currentRow);
  worksheet.mergeCells(`B${currentRow}:I${currentRow}`);
  linksHeaderRow.getCell(2).value = "QUICK LINKS";
  linksHeaderRow.getCell(2).font = { ...FONTS.subheader, size: 14 };
  linksHeaderRow.getCell(2).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF3F4F6" },
  };
  linksHeaderRow.height = 28;
  currentRow++;

  // Links row
  const linksRow = worksheet.getRow(currentRow);
  const sheets = [
    "Transactions",
    "Monthly Summary",
    "Category Analysis",
    "Budgets",
    "Investments",
    "Loans",
  ];
  sheets.forEach((sheet, index) => {
    const col = 2 + index;
    if (col <= 9) {
      addSheetLink(linksRow.getCell(col), sheet, `[${sheet}]`);
    }
  });
  currentRow += 3;

  // ==================== DATA SUMMARY ====================
  const summaryHeaderRow = worksheet.getRow(currentRow);
  worksheet.mergeCells(`B${currentRow}:I${currentRow}`);
  summaryHeaderRow.getCell(2).value = "DATA SUMMARY";
  summaryHeaderRow.getCell(2).font = { ...FONTS.subheader, size: 14 };
  summaryHeaderRow.getCell(2).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF3F4F6" },
  };
  summaryHeaderRow.height = 28;
  currentRow++;

  const summaryItems = [
    ["Accounts", data.accounts.length],
    ["Transactions", data.transactions.length],
    ["Budgets", data.budgets.length],
    ["Goals", data.goals.filter((g) => !g.isCompleted).length],
    ["Loans", data.loans.length],
    ["Subscriptions", data.subscriptions.filter((s) => s.status === "active").length],
  ];

  summaryItems.forEach((item, index) => {
    const itemRow = worksheet.getRow(currentRow + Math.floor(index / 3));
    const col = 2 + (index % 3) * 2;
    itemRow.getCell(col).value = `${item[0]}: ${item[1]}`;
    itemRow.getCell(col).font = FONTS.body;
  });

  // Hide gridlines for cleaner dashboard look
  worksheet.views = [{ showGridLines: false }];

  return worksheet;
}
