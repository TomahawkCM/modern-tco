/**
 * Subscriptions Sheet Generator
 * All recurring costs with monthly/annual totals
 */

import type { Workbook, Worksheet } from 'exceljs';
import type { ExcelExportOptions } from '../types';
import type { Subscription } from '@/types/budget';
import {
  FONTS,
  FILLS,
  BORDERS,
  ALIGNMENTS,
  NUMBER_FORMATS,
  styleHeaderRow,
  styleDataRow,
  setColumnWidths,
  freezePanes,
  createTitleSection,
  createSummaryRow,
  EXCEL_COLORS,
} from '../styles';

interface SubscriptionsSheetData {
  subscriptions: Subscription[];
}

/**
 * Convert any billing cycle to monthly cost
 */
function toMonthlyCost(amount: number, cycle: Subscription['billingCycle']): number {
  switch (cycle) {
    case 'weekly': return amount * 4.33;
    case 'bi-weekly': return amount * 2.17;
    case 'monthly': return amount;
    case 'quarterly': return amount / 3;
    case 'annual': return amount / 12;
    default: return amount;
  }
}

/**
 * Get billing cycle display name
 */
function getBillingCycleDisplay(cycle: Subscription['billingCycle']): string {
  switch (cycle) {
    case 'weekly': return 'Weekly';
    case 'bi-weekly': return 'Bi-weekly';
    case 'monthly': return 'Monthly';
    case 'quarterly': return 'Quarterly';
    case 'annual': return 'Annual';
    default: return cycle;
  }
}

/**
 * Get status display with styling info
 */
function getStatusInfo(status: Subscription['status']): { display: string; color: string } {
  switch (status) {
    case 'active': return { display: 'Active', color: '10B981' };
    case 'trial': return { display: 'Trial', color: '3B82F6' };
    case 'paused': return { display: 'Paused', color: 'F59E0B' };
    case 'cancelled': return { display: 'Cancelled', color: 'EF4444' };
    default: return { display: status, color: '6B7280' };
  }
}

/**
 * Generate the Subscriptions sheet
 */
export async function generateSubscriptionsSheet(
  workbook: Workbook,
  data: SubscriptionsSheetData,
  options: ExcelExportOptions
): Promise<Worksheet> {
  const worksheet = workbook.addWorksheet('Subscriptions', {
    properties: { tabColor: { argb: 'FFEC4899' } }, // Pink tab
  });

  // Column definitions
  const columns = [
    { header: 'Name', key: 'name', width: 22 },
    { header: 'Amount', key: 'amount', width: 12 },
    { header: 'Frequency', key: 'frequency', width: 12 },
    { header: 'Monthly Cost', key: 'monthlyCost', width: 14 },
    { header: 'Annual Cost', key: 'annualCost', width: 14 },
    { header: 'Next Billing', key: 'nextBilling', width: 14 },
    { header: 'Status', key: 'status', width: 10 },
    { header: 'Category', key: 'category', width: 16 },
  ];

  // Create title section
  let currentRow = createTitleSection(
    worksheet,
    'Subscriptions',
    'Recurring costs and billing schedule',
    new Date()
  );

  // Calculate totals
  const activeSubscriptions = data.subscriptions.filter(s => s.status === 'active' || s.status === 'trial');
  const totalMonthly = activeSubscriptions.reduce((sum, s) => sum + toMonthlyCost(s.amount, s.billingCycle), 0);
  const totalAnnual = totalMonthly * 12;

  // Upcoming in 7 days
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingCount = activeSubscriptions.filter(s => {
    const nextBilling = new Date(s.nextBillingDate);
    return nextBilling >= now && nextBilling <= sevenDaysFromNow;
  }).length;

  // Summary section
  const summaryRow = worksheet.getRow(currentRow);
  summaryRow.getCell(1).value = 'SUBSCRIPTION SUMMARY';
  summaryRow.getCell(1).font = { ...FONTS.subheader, size: 12 };
  summaryRow.getCell(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF3F4F6' },
  };
  worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
  currentRow++;

  // Summary stats
  const statsData = [
    ['Total Monthly Cost:', totalMonthly, NUMBER_FORMATS.currency],
    ['Total Annual Cost:', totalAnnual, NUMBER_FORMATS.currency],
    ['Active Subscriptions:', activeSubscriptions.length, null],
    ['Upcoming (7 days):', upcomingCount, null],
  ];

  statsData.forEach((stat, index) => {
    const row = worksheet.getRow(currentRow);
    row.getCell(1).value = stat[0];
    row.getCell(1).font = FONTS.body;
    row.getCell(2).value = stat[1];
    if (stat[2]) {
      row.getCell(2).numFmt = stat[2] as string;
    }
    row.getCell(2).font = { ...FONTS.body, bold: true, color: { argb: index === 0 ? 'FFEF4444' : 'FF111827' } };
    currentRow++;
  });
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

  // Sort subscriptions: active first, then by monthly cost descending
  const sortedSubscriptions = [...data.subscriptions].sort((a, b) => {
    // Active/trial first
    const aActive = a.status === 'active' || a.status === 'trial' ? 0 : 1;
    const bActive = b.status === 'active' || b.status === 'trial' ? 0 : 1;
    if (aActive !== bActive) return aActive - bActive;

    // Then by monthly cost
    return toMonthlyCost(b.amount, b.billingCycle) - toMonthlyCost(a.amount, a.billingCycle);
  });

  // Add data rows
  sortedSubscriptions.forEach((sub, index) => {
    const row = worksheet.getRow(currentRow);
    const monthlyCost = toMonthlyCost(sub.amount, sub.billingCycle);
    const annualCost = monthlyCost * 12;
    const statusInfo = getStatusInfo(sub.status);

    // Name
    row.getCell(1).value = sub.name;
    row.getCell(1).font = { ...FONTS.body, bold: true };

    // Amount
    row.getCell(2).value = sub.amount;
    row.getCell(2).numFmt = NUMBER_FORMATS.currency;
    row.getCell(2).alignment = ALIGNMENTS.right;

    // Frequency
    row.getCell(3).value = getBillingCycleDisplay(sub.billingCycle);
    row.getCell(3).alignment = ALIGNMENTS.center;

    // Monthly Cost
    row.getCell(4).value = monthlyCost;
    row.getCell(4).numFmt = NUMBER_FORMATS.currency;
    row.getCell(4).alignment = ALIGNMENTS.right;

    // Annual Cost
    row.getCell(5).value = annualCost;
    row.getCell(5).numFmt = NUMBER_FORMATS.currency;
    row.getCell(5).alignment = ALIGNMENTS.right;

    // Next Billing
    row.getCell(6).value = new Date(sub.nextBillingDate);
    row.getCell(6).numFmt = NUMBER_FORMATS.date;
    row.getCell(6).alignment = ALIGNMENTS.center;

    // Highlight upcoming billings
    const nextBilling = new Date(sub.nextBillingDate);
    if (nextBilling >= now && nextBilling <= sevenDaysFromNow) {
      row.getCell(6).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFEF3C7' }, // Warning yellow
      };
      row.getCell(6).font = { ...FONTS.body, bold: true };
    }

    // Status
    row.getCell(7).value = statusInfo.display;
    row.getCell(7).font = { ...FONTS.body, color: { argb: `FF${statusInfo.color}` } };
    row.getCell(7).alignment = ALIGNMENTS.center;

    // Category
    row.getCell(8).value = sub.category || '';

    // Style the row
    styleDataRow(row, index, columns.length);

    // Dim cancelled subscriptions
    if (sub.status === 'cancelled') {
      for (let i = 1; i <= columns.length; i++) {
        row.getCell(i).font = { ...row.getCell(i).font, color: { argb: 'FF9CA3AF' } };
      }
    }

    currentRow++;
  });

  // Add totals row
  if (activeSubscriptions.length > 0) {
    currentRow++;
    const totalRow = worksheet.getRow(currentRow);
    totalRow.getCell(1).value = 'TOTAL (Active)';
    totalRow.getCell(1).font = { ...FONTS.body, bold: true };

    totalRow.getCell(4).value = totalMonthly;
    totalRow.getCell(4).numFmt = NUMBER_FORMATS.currency;
    totalRow.getCell(4).font = { ...FONTS.body, bold: true };

    totalRow.getCell(5).value = totalAnnual;
    totalRow.getCell(5).numFmt = NUMBER_FORMATS.currency;
    totalRow.getCell(5).font = { ...FONTS.body, bold: true };

    for (let i = 1; i <= columns.length; i++) {
      totalRow.getCell(i).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE5E7EB' },
      };
      totalRow.getCell(i).border = BORDERS.all;
    }
  }

  // Freeze header
  freezePanes(worksheet, headerRowNum, 0);

  return worksheet;
}
