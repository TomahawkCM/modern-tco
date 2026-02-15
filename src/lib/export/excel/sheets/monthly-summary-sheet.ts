/**
 * Monthly Summary Sheet Generator
 * Month-over-month trends with income, expenses, net savings, and trends
 */

import type { Workbook, Worksheet } from "exceljs";
import type { ExcelExportOptions, MonthlySummaryRow } from "../types";
import type { Transaction } from "@/types/budget";
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
  getTrendArrow,
  EXCEL_COLORS,
} from "../styles";

interface MonthlySummarySheetData {
  transactions: Transaction[];
  dateRange: { start: Date | null; end: Date | null };
}

/**
 * Get month display name
 */
function getMonthDisplay(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/**
 * Aggregate transactions by month
 */
function aggregateByMonth(transactions: Transaction[]): Map<string, MonthlySummaryRow> {
  const monthMap = new Map<string, MonthlySummaryRow>();

  transactions.forEach((tx) => {
    const date = new Date(tx.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        month: monthKey,
        monthDisplay: getMonthDisplay(monthKey),
        income: 0,
        expenses: 0,
        net: 0,
        savingsRate: 0,
        vsPrevMonth: 0,
        transactionCount: 0,
      });
    }

    const monthData = monthMap.get(monthKey)!;
    monthData.transactionCount++;

    if (tx.amount > 0) {
      monthData.income += tx.amount;
    } else {
      monthData.expenses += Math.abs(tx.amount);
    }
  });

  // Calculate derived values
  monthMap.forEach((monthData) => {
    monthData.net = monthData.income - monthData.expenses;
    monthData.savingsRate = monthData.income > 0 ? monthData.net / monthData.income : 0;
  });

  // Sort by month (newest first) and calculate vs prev month
  const sortedEntries = Array.from(monthMap.entries()).sort((a, b) => b[0].localeCompare(a[0]));

  for (let i = 0; i < sortedEntries.length - 1; i++) {
    const [, current] = sortedEntries[i];
    const [, prev] = sortedEntries[i + 1];
    current.vsPrevMonth = current.net - prev.net;
  }

  return new Map(sortedEntries);
}

/**
 * Generate the Monthly Summary sheet
 */
export async function generateMonthlySummarySheet(
  workbook: Workbook,
  data: MonthlySummarySheetData,
  options: ExcelExportOptions
): Promise<Worksheet> {
  const worksheet = workbook.addWorksheet("Monthly Summary", {
    properties: { tabColor: { argb: "FF3B82F6" } }, // Blue tab
  });

  // Aggregate data
  const monthlyData = aggregateByMonth(data.transactions);
  const monthRows = Array.from(monthlyData.values());

  // Column definitions
  const columns = [
    { header: "Month", key: "month", width: 14 },
    { header: "Income", key: "income", width: 14 },
    { header: "Expenses", key: "expenses", width: 14 },
    { header: "Net", key: "net", width: 14 },
    { header: "Savings Rate", key: "savingsRate", width: 13 },
    { header: "vs Prev Month", key: "vsPrevMonth", width: 14 },
    { header: "Transactions", key: "transactionCount", width: 13 },
    { header: "Trend", key: "trend", width: 8 },
  ];

  // Create title section
  let currentRow = createTitleSection(
    worksheet,
    "Monthly Summary",
    `${monthRows.length} months of financial data`,
    new Date()
  );

  // Calculate averages for summary
  const avgIncome = monthRows.reduce((sum, r) => sum + r.income, 0) / monthRows.length || 0;
  const avgExpenses = monthRows.reduce((sum, r) => sum + r.expenses, 0) / monthRows.length || 0;
  const avgNet = monthRows.reduce((sum, r) => sum + r.net, 0) / monthRows.length || 0;
  const avgSavingsRate =
    monthRows.reduce((sum, r) => sum + r.savingsRate, 0) / monthRows.length || 0;

  // Summary stats row
  const statsRow = worksheet.getRow(currentRow);
  statsRow.getCell(1).value = "Monthly Averages:";
  statsRow.getCell(1).font = { ...FONTS.body, bold: true };
  statsRow.getCell(2).value = avgIncome;
  statsRow.getCell(2).numFmt = NUMBER_FORMATS.currency;
  statsRow.getCell(2).font = { ...FONTS.body, color: { argb: "FF10B981" } };
  statsRow.getCell(3).value = avgExpenses;
  statsRow.getCell(3).numFmt = NUMBER_FORMATS.currency;
  statsRow.getCell(3).font = { ...FONTS.body, color: { argb: "FFEF4444" } };
  statsRow.getCell(4).value = avgNet;
  statsRow.getCell(4).numFmt = NUMBER_FORMATS.currency;
  statsRow.getCell(4).font = {
    ...FONTS.body,
    bold: true,
    color: { argb: avgNet >= 0 ? "FF10B981" : "FFEF4444" },
  };
  statsRow.getCell(5).value = avgSavingsRate;
  statsRow.getCell(5).numFmt = NUMBER_FORMATS.percent;
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
  monthRows.forEach((monthData, index) => {
    const row = worksheet.getRow(currentRow);

    // Month
    row.getCell(1).value = monthData.monthDisplay;
    row.getCell(1).font = { ...FONTS.body, bold: true };

    // Income
    row.getCell(2).value = monthData.income;
    row.getCell(2).numFmt = NUMBER_FORMATS.currency;
    row.getCell(2).font = { ...FONTS.body, color: { argb: "FF10B981" } };

    // Expenses
    row.getCell(3).value = monthData.expenses;
    row.getCell(3).numFmt = NUMBER_FORMATS.currency;
    row.getCell(3).font = { ...FONTS.body, color: { argb: "FFEF4444" } };

    // Net
    row.getCell(4).value = monthData.net;
    styleCurrencyCell(row.getCell(4), monthData.net);
    row.getCell(4).font = { ...row.getCell(4).font, bold: true };

    // Savings Rate
    row.getCell(5).value = monthData.savingsRate;
    stylePercentCell(row.getCell(5), monthData.savingsRate * 100, { warning: 10, danger: 0 });

    // vs Prev Month
    row.getCell(6).value = monthData.vsPrevMonth;
    styleCurrencyCell(row.getCell(6), monthData.vsPrevMonth);

    // Transaction Count
    row.getCell(7).value = monthData.transactionCount;
    row.getCell(7).alignment = ALIGNMENTS.center;

    // Trend arrow
    const trend = monthData.vsPrevMonth > 0 ? "▲" : monthData.vsPrevMonth < 0 ? "▼" : "─";
    row.getCell(8).value = trend;
    row.getCell(8).alignment = ALIGNMENTS.center;
    row.getCell(8).font = {
      ...FONTS.body,
      color: {
        argb:
          monthData.vsPrevMonth > 0
            ? "FF10B981"
            : monthData.vsPrevMonth < 0
              ? "FFEF4444"
              : "FF6B7280",
      },
    };

    // Style the row
    styleDataRow(row, index, columns.length);

    // Highlight negative net months
    if (monthData.net < 0) {
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
  const totals = {
    income: monthRows.reduce((sum, r) => sum + r.income, 0),
    expenses: monthRows.reduce((sum, r) => sum + r.expenses, 0),
    net: monthRows.reduce((sum, r) => sum + r.net, 0),
    transactions: monthRows.reduce((sum, r) => sum + r.transactionCount, 0),
  };

  currentRow++;
  createSummaryRow(
    worksheet,
    currentRow,
    "TOTAL",
    [
      totals.income,
      totals.expenses,
      totals.net,
      totals.net / totals.income,
      null,
      totals.transactions,
      "",
    ],
    columns.length
  );

  // Freeze header
  freezePanes(worksheet, headerRowNum, 1);

  // Add chart if enabled
  if (options.includeCharts && monthRows.length > 1) {
    // Add some spacing before chart section
    currentRow += 3;

    // Create a simple data table for the chart
    const chartRow = worksheet.getRow(currentRow);
    chartRow.getCell(1).value = "Income vs Expenses Chart Data";
    chartRow.getCell(1).font = FONTS.subheader;
    currentRow++;

    // Note: ExcelJS chart support is limited. For full chart support,
    // we add the data in a format that's easy to chart manually in Excel
    const chartHeaderRow = worksheet.getRow(currentRow);
    chartHeaderRow.getCell(1).value = "Month";
    chartHeaderRow.getCell(2).value = "Income";
    chartHeaderRow.getCell(3).value = "Expenses";
    chartHeaderRow.getCell(4).value = "Net";
    styleHeaderRow(chartHeaderRow, 4);
    currentRow++;

    // Reverse to show oldest first for charts
    const chartData = [...monthRows].reverse();
    chartData.forEach((monthData, index) => {
      const row = worksheet.getRow(currentRow);
      row.getCell(1).value = monthData.monthDisplay;
      row.getCell(2).value = monthData.income;
      row.getCell(3).value = monthData.expenses;
      row.getCell(4).value = monthData.net;
      styleDataRow(row, index, 4);
      currentRow++;
    });
  }

  return worksheet;
}
