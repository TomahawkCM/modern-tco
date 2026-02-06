/**
 * Excel Styles and Formatters
 * Reusable styling utilities for consistent workbook appearance
 */

import type { Worksheet, Row, Cell, Style, Fill, Border, Font, Alignment, Column } from 'exceljs';
import { EXCEL_COLORS, NUMBER_FORMATS } from './types';

// Re-export for convenience
export { EXCEL_COLORS, NUMBER_FORMATS } from './types';

// ============================================
// FILL STYLES
// ============================================

export const FILLS = {
  header: {
    type: 'pattern' as const,
    pattern: 'solid' as const,
    fgColor: { argb: `FF${EXCEL_COLORS.headerBg}` },
  },
  subheader: {
    type: 'pattern' as const,
    pattern: 'solid' as const,
    fgColor: { argb: `FF${EXCEL_COLORS.subheaderBg}` },
  },
  rowEven: {
    type: 'pattern' as const,
    pattern: 'solid' as const,
    fgColor: { argb: `FF${EXCEL_COLORS.rowEven}` },
  },
  rowOdd: {
    type: 'pattern' as const,
    pattern: 'solid' as const,
    fgColor: { argb: `FF${EXCEL_COLORS.rowOdd}` },
  },
  income: {
    type: 'pattern' as const,
    pattern: 'solid' as const,
    fgColor: { argb: `FF${EXCEL_COLORS.incomeLight}` },
  },
  expense: {
    type: 'pattern' as const,
    pattern: 'solid' as const,
    fgColor: { argb: `FF${EXCEL_COLORS.expenseLight}` },
  },
  warning: {
    type: 'pattern' as const,
    pattern: 'solid' as const,
    fgColor: { argb: `FF${EXCEL_COLORS.warningLight}` },
  },
  primaryLight: {
    type: 'pattern' as const,
    pattern: 'solid' as const,
    fgColor: { argb: `FF${EXCEL_COLORS.primaryLight}` },
  },
} as const;

// ============================================
// BORDER STYLES
// ============================================

const thinBorder = { style: 'thin' as const, color: { argb: `FF${EXCEL_COLORS.border}` } };
const mediumBorder = { style: 'medium' as const, color: { argb: `FF${EXCEL_COLORS.primary}` } };

export const BORDERS = {
  all: {
    top: thinBorder,
    left: thinBorder,
    bottom: thinBorder,
    right: thinBorder,
  },
  header: {
    top: mediumBorder,
    left: mediumBorder,
    bottom: mediumBorder,
    right: mediumBorder,
  },
  bottom: {
    bottom: thinBorder,
  },
  bottomMedium: {
    bottom: mediumBorder,
  },
  right: {
    right: thinBorder,
  },
  outline: {
    top: thinBorder,
    left: thinBorder,
    bottom: thinBorder,
    right: thinBorder,
  },
} as const;

// ============================================
// FONT STYLES
// ============================================

export const FONTS = {
  header: {
    name: 'Calibri',
    size: 12,
    bold: true,
    color: { argb: `FF${EXCEL_COLORS.headerText}` },
  },
  subheader: {
    name: 'Calibri',
    size: 11,
    bold: true,
    color: { argb: `FF${EXCEL_COLORS.subheaderText}` },
  },
  title: {
    name: 'Calibri',
    size: 18,
    bold: true,
    color: { argb: `FF${EXCEL_COLORS.text}` },
  },
  subtitle: {
    name: 'Calibri',
    size: 14,
    bold: true,
    color: { argb: `FF${EXCEL_COLORS.textMuted}` },
  },
  body: {
    name: 'Calibri',
    size: 11,
    color: { argb: `FF${EXCEL_COLORS.text}` },
  },
  bodyMuted: {
    name: 'Calibri',
    size: 11,
    color: { argb: `FF${EXCEL_COLORS.textMuted}` },
  },
  metric: {
    name: 'Calibri',
    size: 24,
    bold: true,
    color: { argb: `FF${EXCEL_COLORS.text}` },
  },
  metricLabel: {
    name: 'Calibri',
    size: 10,
    color: { argb: `FF${EXCEL_COLORS.textMuted}` },
  },
  income: {
    name: 'Calibri',
    size: 11,
    color: { argb: `FF${EXCEL_COLORS.income}` },
  },
  expense: {
    name: 'Calibri',
    size: 11,
    color: { argb: `FF${EXCEL_COLORS.expense}` },
  },
  link: {
    name: 'Calibri',
    size: 11,
    color: { argb: `FF${EXCEL_COLORS.primary}` },
    underline: true,
  },
} as const;

// ============================================
// ALIGNMENT STYLES
// ============================================

export const ALIGNMENTS = {
  left: { horizontal: 'left' as const, vertical: 'middle' as const },
  center: { horizontal: 'center' as const, vertical: 'middle' as const },
  right: { horizontal: 'right' as const, vertical: 'middle' as const },
  leftTop: { horizontal: 'left' as const, vertical: 'top' as const },
  centerTop: { horizontal: 'center' as const, vertical: 'top' as const },
  rightTop: { horizontal: 'right' as const, vertical: 'top' as const },
  wrap: { horizontal: 'left' as const, vertical: 'middle' as const, wrapText: true },
} as const;

// ============================================
// CELL STYLE PRESETS
// ============================================

export const CELL_STYLES = {
  header: {
    font: FONTS.header,
    fill: FILLS.header,
    border: BORDERS.header,
    alignment: ALIGNMENTS.center,
  },
  subheader: {
    font: FONTS.subheader,
    fill: FILLS.subheader,
    border: BORDERS.all,
    alignment: ALIGNMENTS.center,
  },
  title: {
    font: FONTS.title,
    alignment: ALIGNMENTS.left,
  },
  subtitle: {
    font: FONTS.subtitle,
    alignment: ALIGNMENTS.left,
  },
  body: {
    font: FONTS.body,
    border: BORDERS.all,
    alignment: ALIGNMENTS.left,
  },
  bodyCenter: {
    font: FONTS.body,
    border: BORDERS.all,
    alignment: ALIGNMENTS.center,
  },
  bodyRight: {
    font: FONTS.body,
    border: BORDERS.all,
    alignment: ALIGNMENTS.right,
  },
  currency: {
    font: FONTS.body,
    border: BORDERS.all,
    alignment: ALIGNMENTS.right,
    numFmt: NUMBER_FORMATS.currency,
  },
  currencyAccounting: {
    font: FONTS.body,
    border: BORDERS.all,
    alignment: ALIGNMENTS.right,
    numFmt: NUMBER_FORMATS.currencyAccounting,
  },
  percent: {
    font: FONTS.body,
    border: BORDERS.all,
    alignment: ALIGNMENTS.right,
    numFmt: NUMBER_FORMATS.percent,
  },
  date: {
    font: FONTS.body,
    border: BORDERS.all,
    alignment: ALIGNMENTS.center,
    numFmt: NUMBER_FORMATS.date,
  },
  number: {
    font: FONTS.body,
    border: BORDERS.all,
    alignment: ALIGNMENTS.right,
    numFmt: NUMBER_FORMATS.number,
  },
  metric: {
    font: FONTS.metric,
    alignment: ALIGNMENTS.center,
  },
  metricLabel: {
    font: FONTS.metricLabel,
    alignment: ALIGNMENTS.center,
  },
} as const;

// ============================================
// WORKSHEET HELPERS
// ============================================

/**
 * Apply header styling to a row
 */
export function styleHeaderRow(row: Row, columnCount: number): void {
  row.height = 28;
  for (let i = 1; i <= columnCount; i++) {
    const cell = row.getCell(i);
    cell.font = FONTS.header;
    cell.fill = FILLS.header as Fill;
    cell.border = BORDERS.all;
    cell.alignment = ALIGNMENTS.center;
  }
}

/**
 * Apply alternating row styling
 */
export function styleDataRow(row: Row, rowIndex: number, columnCount: number): void {
  row.height = 22;
  const isEven = rowIndex % 2 === 0;

  for (let i = 1; i <= columnCount; i++) {
    const cell = row.getCell(i);
    cell.font = FONTS.body;
    cell.fill = isEven ? FILLS.rowEven as Fill : FILLS.rowOdd as Fill;
    cell.border = BORDERS.all;
  }
}

/**
 * Apply currency formatting with color coding
 */
export function styleCurrencyCell(cell: Cell, amount: number): void {
  cell.numFmt = NUMBER_FORMATS.currencyAccounting;
  cell.alignment = ALIGNMENTS.right;

  if (amount > 0) {
    cell.font = { ...FONTS.body, color: { argb: `FF${EXCEL_COLORS.income}` } };
  } else if (amount < 0) {
    cell.font = { ...FONTS.body, color: { argb: `FF${EXCEL_COLORS.expense}` } };
  } else {
    cell.font = FONTS.body;
  }
}

/**
 * Apply percent formatting with conditional coloring
 */
export function stylePercentCell(cell: Cell, percent: number, thresholds?: { warning: number; danger: number }): void {
  cell.numFmt = NUMBER_FORMATS.percent;
  cell.alignment = ALIGNMENTS.right;

  if (thresholds) {
    if (percent >= thresholds.danger) {
      cell.font = { ...FONTS.body, color: { argb: `FF${EXCEL_COLORS.expense}` } };
      cell.fill = FILLS.expense as Fill;
    } else if (percent >= thresholds.warning) {
      cell.font = { ...FONTS.body, color: { argb: `FF${EXCEL_COLORS.warning}` } };
      cell.fill = FILLS.warning as Fill;
    } else {
      cell.font = { ...FONTS.body, color: { argb: `FF${EXCEL_COLORS.income}` } };
    }
  }
}

/**
 * Set column widths
 */
export function setColumnWidths(worksheet: Worksheet, widths: number[]): void {
  widths.forEach((width, index) => {
    const col = worksheet.getColumn(index + 1);
    col.width = width;
  });
}

/**
 * Auto-fit column widths based on content
 * Note: This is an approximation since ExcelJS doesn't have built-in auto-fit
 */
export function autoFitColumns(worksheet: Worksheet, minWidth = 10, maxWidth = 50): void {
  worksheet.columns.forEach((column) => {
    let maxLength = minWidth;

    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const cellValue = cell.value;
      let cellLength = minWidth;

      if (cellValue !== null && cellValue !== undefined) {
        const stringValue = String(cellValue);
        cellLength = stringValue.length + 2; // Add padding
      }

      if (cellLength > maxLength) {
        maxLength = Math.min(cellLength, maxWidth);
      }
    });

    column.width = maxLength;
  });
}

/**
 * Freeze header row and optionally left columns
 */
export function freezePanes(worksheet: Worksheet, rows = 1, columns = 0): void {
  worksheet.views = [
    {
      state: 'frozen',
      xSplit: columns,
      ySplit: rows,
      topLeftCell: `${String.fromCharCode(65 + columns)}${rows + 1}`,
      activeCell: `${String.fromCharCode(65 + columns)}${rows + 1}`,
    },
  ];
}

/**
 * Add auto-filter to a range
 */
export function addAutoFilter(worksheet: Worksheet, startCol: string, endCol: string, headerRow: number): void {
  const lastRow = worksheet.rowCount;
  worksheet.autoFilter = `${startCol}${headerRow}:${endCol}${lastRow}`;
}

/**
 * Create a title section at the top of a sheet
 */
export function createTitleSection(
  worksheet: Worksheet,
  title: string,
  subtitle?: string,
  exportDate?: Date
): number {
  let currentRow = 1;

  // Title
  const titleRow = worksheet.getRow(currentRow);
  const titleCell = titleRow.getCell(1);
  titleCell.value = title;
  titleCell.font = FONTS.title;
  titleCell.alignment = ALIGNMENTS.left;
  titleRow.height = 30;
  currentRow++;

  // Subtitle
  if (subtitle) {
    const subtitleRow = worksheet.getRow(currentRow);
    const subtitleCell = subtitleRow.getCell(1);
    subtitleCell.value = subtitle;
    subtitleCell.font = FONTS.subtitle;
    subtitleCell.alignment = ALIGNMENTS.left;
    subtitleRow.height = 22;
    currentRow++;
  }

  // Export date
  if (exportDate) {
    const dateRow = worksheet.getRow(currentRow);
    const dateCell = dateRow.getCell(1);
    dateCell.value = `Generated: ${exportDate.toLocaleDateString()} at ${exportDate.toLocaleTimeString()}`;
    dateCell.font = FONTS.bodyMuted;
    dateCell.alignment = ALIGNMENTS.left;
    currentRow++;
  }

  // Empty row for spacing
  currentRow++;

  return currentRow;
}

/**
 * Create a section header
 */
export function createSectionHeader(
  worksheet: Worksheet,
  row: number,
  title: string,
  columnSpan = 1
): void {
  const headerRow = worksheet.getRow(row);
  const cell = headerRow.getCell(1);
  cell.value = title;
  cell.font = FONTS.subheader;
  cell.fill = FILLS.subheader as Fill;
  cell.alignment = ALIGNMENTS.left;

  if (columnSpan > 1) {
    worksheet.mergeCells(row, 1, row, columnSpan);
  }

  headerRow.height = 24;
}

/**
 * Add a hyperlink to another sheet
 */
export function addSheetLink(cell: Cell, targetSheet: string, displayText: string): void {
  cell.value = {
    text: displayText,
    hyperlink: `#'${targetSheet}'!A1`,
  };
  cell.font = FONTS.link;
}

/**
 * Create conditional formatting for a column
 * Returns the rule that can be added to worksheet.addConditionalFormatting
 */
export function createConditionalRule(
  type: 'greaterThan' | 'lessThan' | 'between' | 'containsText',
  value: number | string | [number, number],
  style: Partial<Style>
): object {
  const baseRule: Record<string, unknown> = {
    type: 'cellIs',
    operator: type === 'greaterThan' ? 'greaterThan' :
              type === 'lessThan' ? 'lessThan' :
              type === 'between' ? 'between' :
              'containsText',
    style,
  };

  if (Array.isArray(value)) {
    baseRule.formulae = value;
  } else {
    baseRule.formulae = [value];
  }

  return baseRule;
}

/**
 * Format a cell as a progress bar using data bar conditional formatting
 * Note: This returns config for conditional formatting
 */
export function getProgressBarConfig(min = 0, max = 100): object {
  return {
    type: 'dataBar',
    minLength: 0,
    maxLength: 100,
    showValue: true,
    gradient: true,
    color: { argb: `FF${EXCEL_COLORS.primary}` },
    cfvo: [
      { type: 'num', value: min },
      { type: 'num', value: max },
    ],
  };
}

/**
 * Add a trend arrow indicator
 */
export function getTrendArrow(current: number, previous: number): string {
  if (current > previous) return '▲';
  if (current < previous) return '▼';
  return '─';
}

/**
 * Format number as compact string (1K, 1M, etc.)
 */
export function formatCompactNumber(num: number): string {
  if (Math.abs(num) >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(num) >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toFixed(0);
}

/**
 * Get color from hex string for ExcelJS
 */
export function getArgbColor(hex: string): { argb: string } {
  // Remove # if present and ensure 6 characters
  const cleanHex = hex.replace('#', '').padStart(6, '0');
  return { argb: `FF${cleanHex.toUpperCase()}` };
}

/**
 * Create visual progress bar using Unicode characters
 */
export function createProgressBar(percent: number, width = 20): string {
  const normalizedPercent = Math.min(1, Math.max(0, percent));
  const filled = Math.round(normalizedPercent * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * Create a summary row with totals
 */
export function createSummaryRow(
  worksheet: Worksheet,
  row: number,
  label: string,
  values: (number | string | null)[],
  columnCount: number
): void {
  const summaryRow = worksheet.getRow(row);
  summaryRow.height = 26;

  // Label cell
  const labelCell = summaryRow.getCell(1);
  labelCell.value = label;
  labelCell.font = { ...FONTS.body, bold: true };
  labelCell.fill = FILLS.subheader as Fill;
  labelCell.border = BORDERS.all;

  // Value cells
  values.forEach((value, index) => {
    const cell = summaryRow.getCell(index + 2);
    cell.value = value;
    cell.font = { ...FONTS.body, bold: true };
    cell.fill = FILLS.subheader as Fill;
    cell.border = BORDERS.all;

    if (typeof value === 'number') {
      cell.numFmt = NUMBER_FORMATS.currency;
      cell.alignment = ALIGNMENTS.right;
    }
  });

  // Fill remaining cells with styling
  for (let i = values.length + 2; i <= columnCount; i++) {
    const cell = summaryRow.getCell(i);
    cell.fill = FILLS.subheader as Fill;
    cell.border = BORDERS.all;
  }
}
