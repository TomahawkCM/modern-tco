/**
 * Category Analysis Sheet Generator
 * Deep dive into spending patterns with budget vs actual, progress indicators, and breakdowns
 */

import type { Workbook, Worksheet } from "exceljs";
import type { ExcelExportOptions, CategoryAnalysisRow } from "../types";
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
  getArgbColor,
  EXCEL_COLORS,
} from "../styles";

interface CategoryAnalysisSheetData {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  dateRange: { start: Date | null; end: Date | null };
}

/**
 * Get budget amount for a category (monthly)
 */
function getBudgetForCategory(categoryId: string, budgets: Budget[]): number {
  const budget = budgets.find((b) => b.categoryId === categoryId);
  if (!budget) return 0;

  // Convert annual budgets to monthly
  if (budget.period === "annual") {
    return budget.amount / 12;
  }
  return budget.amount;
}

/**
 * Aggregate spending by category
 */
function aggregateByCategory(
  transactions: Transaction[],
  categories: Category[],
  budgets: Budget[]
): CategoryAnalysisRow[] {
  const categoryMap = new Map<string, CategoryAnalysisRow>();

  // Initialize all expense categories
  categories
    .filter((c) => c.type === "expense" && !c.archived)
    .forEach((cat) => {
      categoryMap.set(cat.name, {
        category: cat.name,
        color: cat.color || "#6B7280",
        icon: cat.icon,
        budget: getBudgetForCategory(cat.id, budgets),
        actual: 0,
        remaining: 0,
        percentUsed: 0,
        transactionCount: 0,
        avgTransaction: 0,
        subcategories: [],
      });
    });

  // Add uncategorized bucket
  categoryMap.set("Uncategorized", {
    category: "Uncategorized",
    color: "#9CA3AF",
    budget: 0,
    actual: 0,
    remaining: 0,
    percentUsed: 0,
    transactionCount: 0,
    avgTransaction: 0,
    subcategories: [],
  });

  // Aggregate transactions
  transactions
    .filter((tx) => tx.amount < 0) // Only expenses
    .forEach((tx) => {
      const catName = tx.category || "Uncategorized";
      let catData = categoryMap.get(catName);

      // Handle unknown categories
      if (!catData) {
        catData = {
          category: catName,
          color: "#6B7280",
          budget: 0,
          actual: 0,
          remaining: 0,
          percentUsed: 0,
          transactionCount: 0,
          avgTransaction: 0,
          subcategories: [],
        };
        categoryMap.set(catName, catData);
      }

      const amount = Math.abs(tx.amount);
      catData.actual += amount;
      catData.transactionCount++;

      // Track subcategory breakdown
      if (tx.subcategory) {
        let subcat = catData.subcategories?.find((s) => s.name === tx.subcategory);
        if (!subcat) {
          subcat = { name: tx.subcategory, amount: 0, count: 0 };
          catData.subcategories?.push(subcat);
        }
        subcat.amount += amount;
        subcat.count++;
      }
    });

  // Calculate derived values and convert to array
  const result: CategoryAnalysisRow[] = [];

  categoryMap.forEach((catData) => {
    if (catData.actual > 0 || catData.budget > 0) {
      catData.remaining = catData.budget - catData.actual;
      catData.percentUsed = catData.budget > 0 ? catData.actual / catData.budget : 0;
      catData.avgTransaction =
        catData.transactionCount > 0 ? catData.actual / catData.transactionCount : 0;

      // Sort subcategories by amount
      catData.subcategories?.sort((a, b) => b.amount - a.amount);

      result.push(catData);
    }
  });

  // Sort by actual spending (highest first)
  result.sort((a, b) => b.actual - a.actual);

  return result;
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
 * Generate the Category Analysis sheet
 */
export async function generateCategoryAnalysisSheet(
  workbook: Workbook,
  data: CategoryAnalysisSheetData,
  options: ExcelExportOptions
): Promise<Worksheet> {
  const worksheet = workbook.addWorksheet("Category Analysis", {
    properties: { tabColor: { argb: "FF8B5CF6" } }, // Purple tab
  });

  // Aggregate data
  const categoryData = aggregateByCategory(data.transactions, data.categories, data.budgets);

  // Column definitions
  const columns = [
    { header: "Category", key: "category", width: 22 },
    { header: "Budget", key: "budget", width: 14 },
    { header: "Actual", key: "actual", width: 14 },
    { header: "Remaining", key: "remaining", width: 14 },
    { header: "% Used", key: "percentUsed", width: 10 },
    { header: "Progress", key: "progress", width: 14 },
    { header: "Transactions", key: "transactionCount", width: 13 },
    { header: "Avg Transaction", key: "avgTransaction", width: 14 },
  ];

  // Create title section
  let currentRow = createTitleSection(
    worksheet,
    "Category Analysis",
    "Spending by Category with Budget Comparison",
    new Date()
  );

  // Calculate totals for summary
  const totalBudget = categoryData.reduce((sum, c) => sum + c.budget, 0);
  const totalActual = categoryData.reduce((sum, c) => sum + c.actual, 0);
  const totalRemaining = totalBudget - totalActual;
  const overallPercent = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;

  // Summary stats
  const locale = options.locale ?? "en-US";
  const summaryRow = worksheet.getRow(currentRow);
  summaryRow.getCell(1).value =
    `Total Budget: ${totalBudget.toLocaleString(locale, { style: "currency", currency: "USD" })}`;
  summaryRow.getCell(1).font = FONTS.body;
  summaryRow.getCell(3).value =
    `Total Spent: ${totalActual.toLocaleString(locale, { style: "currency", currency: "USD" })}`;
  summaryRow.getCell(3).font = { ...FONTS.body, color: { argb: "FFEF4444" } };
  summaryRow.getCell(5).value =
    `Remaining: ${totalRemaining.toLocaleString(locale, { style: "currency", currency: "USD" })}`;
  summaryRow.getCell(5).font = {
    ...FONTS.body,
    color: { argb: totalRemaining >= 0 ? "FF10B981" : "FFEF4444" },
  };
  summaryRow.getCell(7).value = `Overall: ${overallPercent.toFixed(1)}%`;
  summaryRow.getCell(7).font = {
    ...FONTS.body,
    bold: true,
    color: {
      argb: overallPercent > 100 ? "FFEF4444" : overallPercent > 80 ? "FFF59E0B" : "FF10B981",
    },
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

  // Add data rows
  categoryData.forEach((catData, index) => {
    const row = worksheet.getRow(currentRow);

    // Category name with color indicator
    row.getCell(1).value = catData.category;
    row.getCell(1).font = { ...FONTS.body, bold: true };
    // Add category color as left border
    if (catData.color) {
      row.getCell(1).border = {
        ...BORDERS.all,
        left: { style: "thick", color: getArgbColor(catData.color) },
      };
    }

    // Budget
    row.getCell(2).value = catData.budget;
    row.getCell(2).numFmt = NUMBER_FORMATS.currency;
    row.getCell(2).alignment = ALIGNMENTS.right;

    // Actual
    row.getCell(3).value = catData.actual;
    row.getCell(3).numFmt = NUMBER_FORMATS.currency;
    row.getCell(3).alignment = ALIGNMENTS.right;
    row.getCell(3).font = { ...FONTS.body, color: { argb: "FFEF4444" } };

    // Remaining
    row.getCell(4).value = catData.remaining;
    styleCurrencyCell(row.getCell(4), catData.remaining);

    // % Used
    row.getCell(5).value = catData.percentUsed;
    stylePercentCell(row.getCell(5), catData.percentUsed * 100, { warning: 80, danger: 100 });

    // Progress bar
    const progressBar = createProgressBar(catData.percentUsed);
    row.getCell(6).value = progressBar;
    row.getCell(6).alignment = ALIGNMENTS.center;
    row.getCell(6).font = {
      name: "Consolas",
      size: 10,
      color: {
        argb:
          catData.percentUsed > 1
            ? "FFEF4444"
            : catData.percentUsed > 0.8
              ? "FFF59E0B"
              : "FF10B981",
      },
    };

    // Transaction count
    row.getCell(7).value = catData.transactionCount;
    row.getCell(7).alignment = ALIGNMENTS.center;

    // Average transaction
    row.getCell(8).value = catData.avgTransaction;
    row.getCell(8).numFmt = NUMBER_FORMATS.currency;
    row.getCell(8).alignment = ALIGNMENTS.right;

    // Style the row
    styleDataRow(row, index, columns.length);

    // Highlight over-budget categories
    if (catData.percentUsed > 1) {
      for (let i = 1; i <= columns.length; i++) {
        row.getCell(i).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFEE2E2" }, // Light red
        };
      }
    }

    currentRow++;
  });

  // Add totals row
  currentRow++;
  createSummaryRow(
    worksheet,
    currentRow,
    "TOTAL",
    [
      totalBudget,
      totalActual,
      totalRemaining,
      totalBudget > 0 ? totalActual / totalBudget : 0,
      createProgressBar(totalActual / totalBudget),
      categoryData.reduce((sum, c) => sum + c.transactionCount, 0),
      totalActual / categoryData.reduce((sum, c) => sum + c.transactionCount, 0) || 0,
    ],
    columns.length
  );
  currentRow += 3;

  // Add subcategory breakdown section
  const categoriesWithSubcats = categoryData.filter(
    (c) => c.subcategories && c.subcategories.length > 1
  );

  if (categoriesWithSubcats.length > 0) {
    // Section header
    const sectionHeaderRow = worksheet.getRow(currentRow);
    sectionHeaderRow.getCell(1).value = "Subcategory Breakdown";
    sectionHeaderRow.getCell(1).font = FONTS.subtitle;
    currentRow += 2;

    // Subcategory columns
    const subColumns = [
      { header: "Category", width: 18 },
      { header: "Subcategory", width: 18 },
      { header: "Amount", width: 14 },
      { header: "% of Category", width: 13 },
      { header: "Transactions", width: 12 },
    ];

    const subHeaderRow = worksheet.getRow(currentRow);
    subColumns.forEach((col, index) => {
      subHeaderRow.getCell(index + 1).value = col.header;
    });
    styleHeaderRow(subHeaderRow, subColumns.length);
    currentRow++;

    // Add subcategory data
    categoriesWithSubcats.forEach((catData) => {
      catData.subcategories?.forEach((subcat, subIndex) => {
        const row = worksheet.getRow(currentRow);

        // Only show category name for first subcategory
        if (subIndex === 0) {
          row.getCell(1).value = catData.category;
          row.getCell(1).font = { ...FONTS.body, bold: true };
        } else {
          row.getCell(1).value = "";
        }

        row.getCell(2).value = subcat.name;
        row.getCell(3).value = subcat.amount;
        row.getCell(3).numFmt = NUMBER_FORMATS.currency;
        row.getCell(4).value = catData.actual > 0 ? subcat.amount / catData.actual : 0;
        row.getCell(4).numFmt = NUMBER_FORMATS.percent;
        row.getCell(5).value = subcat.count;
        row.getCell(5).alignment = ALIGNMENTS.center;

        styleDataRow(row, currentRow, subColumns.length);
        currentRow++;
      });

      // Add spacing between categories
      currentRow++;
    });
  }

  // Freeze header
  freezePanes(worksheet, headerRowNum, 1);

  return worksheet;
}
