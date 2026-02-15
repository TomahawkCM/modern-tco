/**
 * Budgets Sheet Generator
 * Budget vs Actual comparison with monthly breakdown
 */

import type { Workbook, Worksheet } from "exceljs";
import type { ExcelExportOptions } from "../types";
import type { Transaction, Category, Budget } from "@/types/budget";
import {
  FONTS,
  FILLS,
  BORDERS,
  ALIGNMENTS,
  NUMBER_FORMATS,
  styleHeaderRow,
  styleDataRow,
  styleCurrencyCell,
  stylePercentCell,
  setColumnWidths,
  freezePanes,
  createTitleSection,
  createSummaryRow,
  EXCEL_COLORS,
  getArgbColor,
} from "../styles";

interface BudgetsSheetData {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  dateRange: { start: Date | null; end: Date | null };
}

/**
 * Get category name by ID
 */
function getCategoryName(categoryId: string, categories: Category[]): string {
  const cat = categories.find((c) => c.id === categoryId);
  return cat?.name || "Unknown";
}

/**
 * Get category color by ID
 */
function getCategoryColor(categoryId: string, categories: Category[]): string {
  const cat = categories.find((c) => c.id === categoryId);
  return cat?.color || "#6B7280";
}

/**
 * Calculate spending for a category in a month
 */
function getCategorySpending(
  categoryName: string,
  transactions: Transaction[],
  year: number,
  month: number
): number {
  return transactions
    .filter((tx) => {
      if (tx.amount >= 0) return false; // Only expenses
      if (tx.category !== categoryName) return false;
      const txDate = new Date(tx.date);
      return txDate.getFullYear() === year && txDate.getMonth() === month;
    })
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
}

/**
 * Create visual progress bar using Unicode characters
 */
function createProgressBar(percent: number, width = 10): string {
  const filled = Math.min(Math.round(percent * width), width);
  const empty = width - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

/**
 * Generate the Budgets sheet
 */
export async function generateBudgetsSheet(
  workbook: Workbook,
  data: BudgetsSheetData,
  options: ExcelExportOptions
): Promise<Worksheet> {
  const worksheet = workbook.addWorksheet("Budgets", {
    properties: { tabColor: { argb: "FFF59E0B" } }, // Amber tab
  });

  // Get the months we're covering (last 6 months for YTD view)
  const now = new Date();
  const months: { year: number; month: number; display: string }[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: date.getFullYear(),
      month: date.getMonth(),
      display: date.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    });
  }

  // Build column definitions dynamically
  const staticColumns = [
    { header: "Category", key: "category", width: 20 },
    { header: "Monthly Budget", key: "budget", width: 14 },
  ];

  const monthColumns = months.flatMap((m) => [
    { header: m.display, key: `actual_${m.year}_${m.month}`, width: 12 },
    { header: "Var", key: `var_${m.year}_${m.month}`, width: 10 },
  ]);

  const summaryColumns = [
    { header: "YTD Budget", key: "ytdBudget", width: 12 },
    { header: "YTD Actual", key: "ytdActual", width: 12 },
    { header: "YTD Var", key: "ytdVar", width: 10 },
    { header: "Progress", key: "progress", width: 12 },
  ];

  const columns = [...staticColumns, ...monthColumns, ...summaryColumns];

  // Create title section
  let currentRow = createTitleSection(
    worksheet,
    "Budget vs Actual",
    `Monthly budget tracking (${months[0].display} - ${months[months.length - 1].display})`,
    new Date()
  );

  // Header row
  const headerRowNum = currentRow;
  const headerRow = worksheet.getRow(headerRowNum);

  // Static headers
  headerRow.getCell(1).value = "Category";
  headerRow.getCell(2).value = "Monthly Budget";

  // Month headers (merged for Actual/Var pairs)
  let colIndex = 3;
  months.forEach((m) => {
    headerRow.getCell(colIndex).value = m.display;
    worksheet.mergeCells(headerRowNum, colIndex, headerRowNum, colIndex + 1);
    colIndex += 2;
  });

  // Summary headers
  headerRow.getCell(colIndex).value = "YTD Budget";
  headerRow.getCell(colIndex + 1).value = "YTD Actual";
  headerRow.getCell(colIndex + 2).value = "YTD Var";
  headerRow.getCell(colIndex + 3).value = "Progress";

  styleHeaderRow(headerRow, columns.length);
  currentRow++;

  // Sub-header row for Actual/Var
  const subHeaderRow = worksheet.getRow(currentRow);
  subHeaderRow.getCell(1).value = "";
  subHeaderRow.getCell(2).value = "";

  colIndex = 3;
  months.forEach(() => {
    subHeaderRow.getCell(colIndex).value = "Actual";
    subHeaderRow.getCell(colIndex + 1).value = "Var";
    colIndex += 2;
  });

  // Style sub-header
  for (let i = 1; i <= columns.length; i++) {
    subHeaderRow.getCell(i).font = FONTS.bodyMuted;
    subHeaderRow.getCell(i).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF3F4F6" },
    };
    subHeaderRow.getCell(i).border = BORDERS.all;
    subHeaderRow.getCell(i).alignment = ALIGNMENTS.center;
  }
  currentRow++;

  // Set column widths
  const widths = [20, 14, ...months.flatMap(() => [12, 10]), 12, 12, 10, 12];
  setColumnWidths(worksheet, widths);

  // Process each budget
  const budgetData = data.budgets
    .map((budget) => {
      const categoryName = getCategoryName(budget.categoryId, data.categories);
      const categoryColor = getCategoryColor(budget.categoryId, data.categories);
      const monthlyBudget = budget.period === "annual" ? budget.amount / 12 : budget.amount;

      // Calculate spending for each month
      const monthlySpending = months.map((m) => {
        const actual = getCategorySpending(categoryName, data.transactions, m.year, m.month);
        const variance = monthlyBudget - actual;
        return { actual, variance };
      });

      // Calculate YTD
      const ytdBudget = monthlyBudget * months.length;
      const ytdActual = monthlySpending.reduce((sum, m) => sum + m.actual, 0);
      const ytdVar = ytdBudget - ytdActual;
      const progress = ytdBudget > 0 ? ytdActual / ytdBudget : 0;

      return {
        categoryName,
        categoryColor,
        monthlyBudget,
        monthlySpending,
        ytdBudget,
        ytdActual,
        ytdVar,
        progress,
      };
    })
    .filter((b) => b.monthlyBudget > 0)
    .sort((a, b) => b.ytdActual - a.ytdActual);

  // Add data rows
  budgetData.forEach((budgetItem, index) => {
    const row = worksheet.getRow(currentRow);

    // Category with color indicator
    row.getCell(1).value = budgetItem.categoryName;
    row.getCell(1).font = { ...FONTS.body, bold: true };
    row.getCell(1).border = {
      ...BORDERS.all,
      left: { style: "thick", color: getArgbColor(budgetItem.categoryColor) },
    };

    // Monthly budget
    row.getCell(2).value = budgetItem.monthlyBudget;
    row.getCell(2).numFmt = NUMBER_FORMATS.currency;
    row.getCell(2).alignment = ALIGNMENTS.right;

    // Monthly actual and variance
    colIndex = 3;
    budgetItem.monthlySpending.forEach((m) => {
      // Actual
      row.getCell(colIndex).value = m.actual;
      row.getCell(colIndex).numFmt = NUMBER_FORMATS.currency;
      row.getCell(colIndex).alignment = ALIGNMENTS.right;

      // Variance
      row.getCell(colIndex + 1).value = m.variance;
      styleCurrencyCell(row.getCell(colIndex + 1), m.variance);

      colIndex += 2;
    });

    // YTD Budget
    row.getCell(colIndex).value = budgetItem.ytdBudget;
    row.getCell(colIndex).numFmt = NUMBER_FORMATS.currency;
    row.getCell(colIndex).alignment = ALIGNMENTS.right;

    // YTD Actual
    row.getCell(colIndex + 1).value = budgetItem.ytdActual;
    row.getCell(colIndex + 1).numFmt = NUMBER_FORMATS.currency;
    row.getCell(colIndex + 1).alignment = ALIGNMENTS.right;

    // YTD Variance
    row.getCell(colIndex + 2).value = budgetItem.ytdVar;
    styleCurrencyCell(row.getCell(colIndex + 2), budgetItem.ytdVar);

    // Progress bar
    row.getCell(colIndex + 3).value = createProgressBar(budgetItem.progress);
    row.getCell(colIndex + 3).font = {
      name: "Consolas",
      size: 10,
      color: {
        argb:
          budgetItem.progress > 1
            ? "FFEF4444"
            : budgetItem.progress > 0.8
              ? "FFF59E0B"
              : "FF10B981",
      },
    };
    row.getCell(colIndex + 3).alignment = ALIGNMENTS.center;

    // Style the row
    styleDataRow(row, index, columns.length);

    // Highlight over-budget rows
    if (budgetItem.progress > 1) {
      for (let i = 1; i <= columns.length; i++) {
        row.getCell(i).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFEE2E2" },
        };
      }
    }

    currentRow++;
  });

  // Add totals row
  if (budgetData.length > 0) {
    currentRow++;
    const totals = {
      monthlyBudget: budgetData.reduce((sum, b) => sum + b.monthlyBudget, 0),
      ytdBudget: budgetData.reduce((sum, b) => sum + b.ytdBudget, 0),
      ytdActual: budgetData.reduce((sum, b) => sum + b.ytdActual, 0),
    };

    const totalRow = worksheet.getRow(currentRow);
    totalRow.getCell(1).value = "TOTAL";
    totalRow.getCell(1).font = { ...FONTS.body, bold: true };

    totalRow.getCell(2).value = totals.monthlyBudget;
    totalRow.getCell(2).numFmt = NUMBER_FORMATS.currency;
    totalRow.getCell(2).font = { ...FONTS.body, bold: true };

    colIndex = 3 + months.length * 2;
    totalRow.getCell(colIndex).value = totals.ytdBudget;
    totalRow.getCell(colIndex).numFmt = NUMBER_FORMATS.currency;
    totalRow.getCell(colIndex).font = { ...FONTS.body, bold: true };

    totalRow.getCell(colIndex + 1).value = totals.ytdActual;
    totalRow.getCell(colIndex + 1).numFmt = NUMBER_FORMATS.currency;
    totalRow.getCell(colIndex + 1).font = { ...FONTS.body, bold: true };

    totalRow.getCell(colIndex + 2).value = totals.ytdBudget - totals.ytdActual;
    styleCurrencyCell(totalRow.getCell(colIndex + 2), totals.ytdBudget - totals.ytdActual);
    totalRow.getCell(colIndex + 2).font = { ...totalRow.getCell(colIndex + 2).font, bold: true };

    // Style total row
    for (let i = 1; i <= columns.length; i++) {
      totalRow.getCell(i).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE5E7EB" },
      };
      totalRow.getCell(i).border = BORDERS.all;
    }
  }

  // Freeze header
  freezePanes(worksheet, headerRowNum + 1, 2);

  return worksheet;
}
