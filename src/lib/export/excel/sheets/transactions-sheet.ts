/**
 * Transactions Sheet Generator
 * Complete transaction history with running balance, conditional formatting, and filters
 */

import type { Workbook, Worksheet } from "exceljs";
import type { ExcelExportOptions } from "../types";
import type { Transaction, Account, Category } from "@/types/budget";
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
  addAutoFilter,
  createTitleSection,
  getTrendArrow,
} from "../styles";

interface TransactionsSheetData {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  dateRange: { start: Date | null; end: Date | null };
}

/**
 * Get account name by ID
 */
function getAccountName(accountId: string, accounts: Account[]): string {
  const account = accounts.find((a) => a.id === accountId);
  return account ? `${account.name}` : "Unknown";
}

/**
 * Get category color
 */
function getCategoryColor(categoryName: string | null, categories: Category[]): string {
  if (!categoryName) return "";
  const category = categories.find((c) => c.name === categoryName);
  return category?.color || "";
}

/**
 * Format day of week
 */
function getDayOfWeek(date: Date): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[date.getDay()];
}

/**
 * Format month key (YYYY-MM)
 */
function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Generate the Transactions sheet
 */
export async function generateTransactionsSheet(
  workbook: Workbook,
  data: TransactionsSheetData,
  options: ExcelExportOptions
): Promise<Worksheet> {
  const worksheet = workbook.addWorksheet("Transactions", {
    properties: { tabColor: { argb: "FF14B8A6" } },
  });

  // Column definitions
  const columns = [
    { header: "Date", key: "date", width: 12 },
    { header: "Account", key: "account", width: 18 },
    { header: "Description", key: "description", width: 35 },
    { header: "Original Description", key: "originalDescription", width: 30 },
    { header: "Category", key: "category", width: 18 },
    { header: "Subcategory", key: "subcategory", width: 15 },
    { header: "Amount", key: "amount", width: 14 },
    { header: "Running Balance", key: "runningBalance", width: 16 },
    { header: "Month", key: "month", width: 10 },
    { header: "Day of Week", key: "dayOfWeek", width: 12 },
    { header: "Recurring", key: "recurring", width: 10 },
    { header: "Notes", key: "notes", width: 25 },
    { header: "Tags", key: "tags", width: 20 },
  ];

  // Create title section
  let currentRow = createTitleSection(
    worksheet,
    "Transaction History",
    data.dateRange.start && data.dateRange.end
      ? `${data.dateRange.start.toLocaleDateString()} - ${data.dateRange.end.toLocaleDateString()}`
      : "All Transactions",
    new Date()
  );

  // Add summary stats
  const totalIncome = data.transactions
    .filter((tx) => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpenses = data.transactions
    .filter((tx) => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const netAmount = totalIncome - totalExpenses;

  const summaryRow = worksheet.getRow(currentRow);
  summaryRow.getCell(1).value = `Total Transactions: ${data.transactions.length}`;
  summaryRow.getCell(1).font = FONTS.bodyMuted;
  summaryRow.getCell(3).value =
    `Income: $${totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  summaryRow.getCell(3).font = { ...FONTS.body, color: { argb: "FF10B981" } };
  summaryRow.getCell(5).value =
    `Expenses: $${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  summaryRow.getCell(5).font = { ...FONTS.body, color: { argb: "FFEF4444" } };
  summaryRow.getCell(7).value =
    `Net: $${netAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  summaryRow.getCell(7).font = {
    ...FONTS.body,
    color: { argb: netAmount >= 0 ? "FF10B981" : "FFEF4444" },
    bold: true,
  };
  currentRow += 2;

  // Header row
  const headerRowNum = currentRow;
  const headerRow = worksheet.getRow(headerRowNum);
  columns.forEach((col, index) => {
    headerRow.getCell(index + 1).value = col.header;
  });
  styleHeaderRow(headerRow, columns.length);
  currentRow++;

  // Set column widths
  setColumnWidths(
    worksheet,
    columns.map((c) => c.width)
  );

  // Calculate running balance (transactions are sorted newest first, so we reverse for running balance)
  const transactionsSorted = [...data.transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate running balances
  let runningBalance = 0;
  const runningBalances = new Map<string, number>();
  transactionsSorted.forEach((tx) => {
    runningBalance += tx.amount;
    runningBalances.set(tx.id, runningBalance);
  });

  // Add data rows (sorted newest first for display)
  data.transactions.forEach((tx, index) => {
    const row = worksheet.getRow(currentRow);
    const txDate = new Date(tx.date);

    // Date
    row.getCell(1).value = txDate;
    row.getCell(1).numFmt = NUMBER_FORMATS.date;
    row.getCell(1).alignment = ALIGNMENTS.center;

    // Account
    row.getCell(2).value = getAccountName(tx.accountId, data.accounts);

    // Description
    row.getCell(3).value = tx.description || tx.originalDescription || "";

    // Original Description
    row.getCell(4).value = tx.originalDescription || "";
    row.getCell(4).font = FONTS.bodyMuted;

    // Category
    row.getCell(5).value = tx.category || "Uncategorized";
    if (!tx.category) {
      row.getCell(5).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFEF3C7" }, // Warning yellow
      };
    } else {
      const catColor = getCategoryColor(tx.category, data.categories);
      if (catColor) {
        // Light version of category color for background
        row.getCell(5).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: `FF${catColor}20` },
        };
      }
    }

    // Subcategory
    row.getCell(6).value = tx.subcategory || "";

    // Amount
    row.getCell(7).value = tx.amount;
    styleCurrencyCell(row.getCell(7), tx.amount);

    // Running Balance
    row.getCell(8).value = runningBalances.get(tx.id) || 0;
    row.getCell(8).numFmt = NUMBER_FORMATS.currencyAccounting;
    row.getCell(8).alignment = ALIGNMENTS.right;

    // Month
    row.getCell(9).value = getMonthKey(txDate);

    // Day of Week
    row.getCell(10).value = getDayOfWeek(txDate);

    // Recurring
    row.getCell(11).value = tx.isRecurring ? "Yes" : "No";
    row.getCell(11).alignment = ALIGNMENTS.center;

    // Notes
    row.getCell(12).value = tx.notes || "";

    // Tags
    row.getCell(13).value = tx.tags?.join(", ") || "";

    // Style the row
    styleDataRow(row, index, columns.length);

    // Highlight large expenses
    if (tx.amount < -500) {
      row.getCell(7).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFEE2E2" }, // Light red
      };
    }

    currentRow++;
  });

  // Freeze panes (header row)
  freezePanes(worksheet, headerRowNum, 0);

  // Add auto-filter
  addAutoFilter(worksheet, "A", "M", headerRowNum);

  // Add conditional formatting for amounts
  worksheet.addConditionalFormatting({
    ref: `G${headerRowNum + 1}:G${currentRow}`,
    rules: [
      {
        type: "cellIs",
        operator: "greaterThan",
        priority: 1,
        formulae: [0],
        style: {
          font: { color: { argb: "FF10B981" } },
        },
      },
      {
        type: "cellIs",
        operator: "lessThan",
        priority: 2,
        formulae: [0],
        style: {
          font: { color: { argb: "FFEF4444" } },
        },
      },
    ],
  });

  return worksheet;
}
