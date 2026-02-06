/**
 * Goals Sheet Generator
 * Savings goals progress and projections
 */

import type { Workbook, Worksheet } from 'exceljs';
import type { ExcelExportOptions, GoalProgressData } from '../types';
import type { FuturePurchase } from '@/types/budget';
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
} from '../styles';

interface GoalsSheetData {
  goals: FuturePurchase[];
}

/**
 * Calculate if goal is on track
 */
function isGoalOnTrack(goal: FuturePurchase): boolean {
  const now = new Date();
  const targetDate = new Date(goal.targetDate);
  const monthsRemaining = Math.max(0,
    (targetDate.getFullYear() - now.getFullYear()) * 12 +
    (targetDate.getMonth() - now.getMonth())
  );

  const amountRemaining = goal.targetAmount - goal.currentSavings;
  const monthlyNeeded = monthsRemaining > 0 ? amountRemaining / monthsRemaining : amountRemaining;

  return goal.monthlyContribution >= monthlyNeeded;
}

/**
 * Calculate projected completion date
 */
function calculateProjectedDate(goal: FuturePurchase): Date | null {
  if (goal.currentSavings >= goal.targetAmount) {
    return new Date(); // Already completed
  }

  if (goal.monthlyContribution <= 0) {
    return null; // Will never complete
  }

  const amountRemaining = goal.targetAmount - goal.currentSavings;
  const monthsNeeded = Math.ceil(amountRemaining / goal.monthlyContribution);

  const projectedDate = new Date();
  projectedDate.setMonth(projectedDate.getMonth() + monthsNeeded);

  return projectedDate;
}

/**
 * Create visual progress bar using Unicode characters
 */
function createProgressBar(percent: number, width = 20): string {
  const normalizedPercent = Math.min(1, Math.max(0, percent));
  const filled = Math.round(normalizedPercent * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * Get priority display with color
 */
function getPriorityInfo(priority: FuturePurchase['priority']): { display: string; color: string } {
  switch (priority) {
    case 'high': return { display: 'High', color: 'EF4444' };
    case 'medium': return { display: 'Medium', color: 'F59E0B' };
    case 'low': return { display: 'Low', color: '10B981' };
    default: return { display: priority, color: '6B7280' };
  }
}

/**
 * Generate the Goals sheet
 */
export async function generateGoalsSheet(
  workbook: Workbook,
  data: GoalsSheetData,
  options: ExcelExportOptions
): Promise<Worksheet> {
  const worksheet = workbook.addWorksheet('Goals', {
    properties: { tabColor: { argb: 'FF0EA5E9' } }, // Sky blue tab
  });

  // Column definitions
  const columns = [
    { header: 'Goal', key: 'name', width: 24 },
    { header: 'Target', key: 'target', width: 14 },
    { header: 'Current', key: 'current', width: 14 },
    { header: 'Remaining', key: 'remaining', width: 14 },
    { header: 'Progress', key: 'progress', width: 24 },
    { header: 'Monthly', key: 'monthly', width: 12 },
    { header: 'Target Date', key: 'targetDate', width: 12 },
    { header: 'On Track?', key: 'onTrack', width: 10 },
    { header: 'Priority', key: 'priority', width: 10 },
  ];

  // Create title section
  let currentRow = createTitleSection(
    worksheet,
    'Savings Goals',
    'Track progress toward your financial goals',
    new Date()
  );

  // Separate active and completed goals
  const activeGoals = data.goals.filter(g => !g.isCompleted);
  const completedGoals = data.goals.filter(g => g.isCompleted);

  // Calculate summary stats
  const totalTargetAmount = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCurrentAmount = activeGoals.reduce((sum, g) => sum + g.currentSavings, 0);
  const totalMonthlyContribution = activeGoals.reduce((sum, g) => sum + g.monthlyContribution, 0);
  const overallProgress = totalTargetAmount > 0 ? totalCurrentAmount / totalTargetAmount : 0;

  // Summary section
  const summaryRow = worksheet.getRow(currentRow);
  summaryRow.getCell(1).value = 'GOALS SUMMARY';
  summaryRow.getCell(1).font = { ...FONTS.subheader, size: 12 };
  summaryRow.getCell(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF3F4F6' },
  };
  worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
  currentRow++;

  // Summary stats
  const summaryData = [
    ['Total Target:', totalTargetAmount, NUMBER_FORMATS.currency],
    ['Total Saved:', totalCurrentAmount, NUMBER_FORMATS.currency],
    ['Total Remaining:', totalTargetAmount - totalCurrentAmount, NUMBER_FORMATS.currency],
    ['Monthly Contributions:', totalMonthlyContribution, NUMBER_FORMATS.currency],
    ['Active Goals:', activeGoals.length, null],
    ['Completed Goals:', completedGoals.length, null],
  ];

  summaryData.forEach(item => {
    const row = worksheet.getRow(currentRow);
    row.getCell(1).value = item[0];
    row.getCell(1).font = FONTS.body;
    row.getCell(2).value = item[1];
    if (item[2]) {
      row.getCell(2).numFmt = item[2] as string;
    }
    row.getCell(2).font = { ...FONTS.body, bold: true };
    currentRow++;
  });

  // Overall progress bar
  const progressRow = worksheet.getRow(currentRow);
  progressRow.getCell(1).value = 'Overall Progress:';
  progressRow.getCell(1).font = FONTS.body;
  progressRow.getCell(2).value = `${createProgressBar(overallProgress)} ${(overallProgress * 100).toFixed(0)}%`;
  progressRow.getCell(2).font = {
    name: 'Consolas',
    size: 10,
    color: { argb: overallProgress >= 0.75 ? 'FF10B981' : overallProgress >= 0.5 ? 'FFF59E0B' : 'FF6B7280' },
  };
  currentRow += 2;

  // Active Goals section
  if (activeGoals.length > 0) {
    const activeHeaderRow = worksheet.getRow(currentRow);
    worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
    activeHeaderRow.getCell(1).value = 'ACTIVE GOALS';
    activeHeaderRow.getCell(1).font = { ...FONTS.subheader, size: 11 };
    activeHeaderRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFCCFBF1' }, // Light teal
    };
    currentRow++;

    // Header row
    const headerRowNum = currentRow;
    const headerRow = worksheet.getRow(headerRowNum);
    columns.forEach((col, index) => {
      headerRow.getCell(index + 1).value = col.header;
    });
    styleHeaderRow(headerRow, columns.length);
    currentRow++;

    // Set column widths
    setColumnWidths(worksheet, columns.map(c => c.width));

    // Sort by priority (high first) then by progress (closest to completion first)
    const sortedGoals = [...activeGoals].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
      if (priorityDiff !== 0) return priorityDiff;

      const progressA = a.currentSavings / a.targetAmount;
      const progressB = b.currentSavings / b.targetAmount;
      return progressB - progressA;
    });

    // Add goal rows
    sortedGoals.forEach((goal, index) => {
      const row = worksheet.getRow(currentRow);
      const progress = goal.targetAmount > 0 ? goal.currentSavings / goal.targetAmount : 0;
      const remaining = goal.targetAmount - goal.currentSavings;
      const onTrack = isGoalOnTrack(goal);
      const priorityInfo = getPriorityInfo(goal.priority);

      // Goal name
      row.getCell(1).value = goal.name;
      row.getCell(1).font = { ...FONTS.body, bold: true };

      // Target amount
      row.getCell(2).value = goal.targetAmount;
      row.getCell(2).numFmt = NUMBER_FORMATS.currency;
      row.getCell(2).alignment = ALIGNMENTS.right;

      // Current amount
      row.getCell(3).value = goal.currentSavings;
      row.getCell(3).numFmt = NUMBER_FORMATS.currency;
      row.getCell(3).alignment = ALIGNMENTS.right;
      row.getCell(3).font = { ...FONTS.body, color: { argb: 'FF10B981' } };

      // Remaining
      row.getCell(4).value = remaining;
      row.getCell(4).numFmt = NUMBER_FORMATS.currency;
      row.getCell(4).alignment = ALIGNMENTS.right;

      // Progress bar
      row.getCell(5).value = `${createProgressBar(progress, 15)} ${(progress * 100).toFixed(0)}%`;
      row.getCell(5).font = {
        name: 'Consolas',
        size: 10,
        color: { argb: progress >= 0.75 ? 'FF10B981' : progress >= 0.5 ? 'FFF59E0B' : 'FF6B7280' },
      };

      // Monthly contribution
      row.getCell(6).value = goal.monthlyContribution;
      row.getCell(6).numFmt = NUMBER_FORMATS.currency;
      row.getCell(6).alignment = ALIGNMENTS.right;

      // Target date
      row.getCell(7).value = new Date(goal.targetDate);
      row.getCell(7).numFmt = NUMBER_FORMATS.dateShort;
      row.getCell(7).alignment = ALIGNMENTS.center;

      // On track indicator
      row.getCell(8).value = onTrack ? '✓ Yes' : '⚠ Behind';
      row.getCell(8).font = { ...FONTS.body, color: { argb: onTrack ? 'FF10B981' : 'FFF59E0B' } };
      row.getCell(8).alignment = ALIGNMENTS.center;

      // Priority
      row.getCell(9).value = priorityInfo.display;
      row.getCell(9).font = { ...FONTS.body, color: { argb: `FF${priorityInfo.color}` } };
      row.getCell(9).alignment = ALIGNMENTS.center;

      styleDataRow(row, index, columns.length);

      // Highlight goals that are behind
      if (!onTrack) {
        for (let i = 1; i <= columns.length; i++) {
          row.getCell(i).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEF3C7' }, // Light amber
          };
        }
      }

      currentRow++;
    });

    // Totals row
    currentRow++;
    const totalRow = worksheet.getRow(currentRow);
    totalRow.getCell(1).value = 'TOTAL';
    totalRow.getCell(1).font = { ...FONTS.body, bold: true };

    totalRow.getCell(2).value = totalTargetAmount;
    totalRow.getCell(2).numFmt = NUMBER_FORMATS.currency;
    totalRow.getCell(2).font = { ...FONTS.body, bold: true };

    totalRow.getCell(3).value = totalCurrentAmount;
    totalRow.getCell(3).numFmt = NUMBER_FORMATS.currency;
    totalRow.getCell(3).font = { ...FONTS.body, bold: true, color: { argb: 'FF10B981' } };

    totalRow.getCell(4).value = totalTargetAmount - totalCurrentAmount;
    totalRow.getCell(4).numFmt = NUMBER_FORMATS.currency;
    totalRow.getCell(4).font = { ...FONTS.body, bold: true };

    totalRow.getCell(6).value = totalMonthlyContribution;
    totalRow.getCell(6).numFmt = NUMBER_FORMATS.currency;
    totalRow.getCell(6).font = { ...FONTS.body, bold: true };

    for (let i = 1; i <= columns.length; i++) {
      totalRow.getCell(i).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE5E7EB' },
      };
      totalRow.getCell(i).border = BORDERS.all;
    }
  }

  // Completed Goals section
  if (completedGoals.length > 0) {
    currentRow += 2;

    const completedHeaderRow = worksheet.getRow(currentRow);
    worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
    completedHeaderRow.getCell(1).value = 'COMPLETED GOALS';
    completedHeaderRow.getCell(1).font = { ...FONTS.subheader, size: 11 };
    completedHeaderRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD1FAE5' }, // Light green
    };
    currentRow++;

    completedGoals.forEach((goal, index) => {
      const row = worksheet.getRow(currentRow);

      row.getCell(1).value = goal.name;
      row.getCell(1).font = FONTS.body;

      row.getCell(2).value = goal.targetAmount;
      row.getCell(2).numFmt = NUMBER_FORMATS.currency;

      row.getCell(5).value = `${createProgressBar(1, 15)} 100%`;
      row.getCell(5).font = { name: 'Consolas', size: 10, color: { argb: 'FF10B981' } };

      row.getCell(8).value = '✓ Complete';
      row.getCell(8).font = { ...FONTS.body, color: { argb: 'FF10B981' } };
      row.getCell(8).alignment = ALIGNMENTS.center;

      styleDataRow(row, index, columns.length);
      currentRow++;
    });
  }

  return worksheet;
}
