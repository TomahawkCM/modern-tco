/**
 * Loans Sheet Generator
 * Debt tracking with amortization schedules and payoff analysis
 */

import type { Workbook, Worksheet } from 'exceljs';
import type { ExcelExportOptions, AmortizationEntry } from '../types';
import type { Loan, LoanPayment } from '@/types/budget';
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

interface LoansSheetData {
  loans: Loan[];
  loanPayments: LoanPayment[];
}

/**
 * Get loan type display name
 */
function getLoanTypeDisplay(type: Loan['type']): string {
  switch (type) {
    case 'mortgage': return 'Mortgage';
    case 'auto': return 'Auto Loan';
    case 'personal': return 'Personal Loan';
    case 'student': return 'Student Loan';
    default: return type;
  }
}

/**
 * Get status display with color
 */
function getStatusInfo(status: Loan['status']): { display: string; color: string } {
  switch (status) {
    case 'active': return { display: 'Active', color: '10B981' };
    case 'paid-off': return { display: 'Paid Off', color: '3B82F6' };
    case 'refinanced': return { display: 'Refinanced', color: 'F59E0B' };
    case 'defaulted': return { display: 'Defaulted', color: 'EF4444' };
    default: return { display: status, color: '6B7280' };
  }
}

/**
 * Calculate remaining months
 */
function calculateRemainingMonths(loan: Loan): number {
  if (loan.currentBalance <= 0) return 0;

  const monthlyRate = loan.interestRate / 100 / 12;
  if (monthlyRate === 0) {
    return Math.ceil(loan.currentBalance / loan.monthlyPayment);
  }

  // Using loan amortization formula
  const remainingPayments = Math.ceil(
    Math.log(loan.monthlyPayment / (loan.monthlyPayment - loan.currentBalance * monthlyRate)) /
    Math.log(1 + monthlyRate)
  );

  return Math.max(0, remainingPayments);
}

/**
 * Calculate total interest remaining
 */
function calculateTotalInterestRemaining(loan: Loan): number {
  const remainingMonths = calculateRemainingMonths(loan);
  const totalPayments = remainingMonths * loan.monthlyPayment;
  return Math.max(0, totalPayments - loan.currentBalance);
}

/**
 * Generate simple amortization schedule
 */
function generateAmortizationSchedule(loan: Loan, maxMonths = 12): AmortizationEntry[] {
  const schedule: AmortizationEntry[] = [];
  const monthlyRate = loan.interestRate / 100 / 12;
  let balance = loan.currentBalance;
  let cumulativeInterest = loan.totalInterestPaid;
  const startDate = new Date(loan.nextPaymentDate);

  for (let i = 0; i < maxMonths && balance > 0; i++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = Math.min(loan.monthlyPayment - interestPayment, balance);
    balance -= principalPayment;
    cumulativeInterest += interestPayment;

    const paymentDate = new Date(startDate);
    paymentDate.setMonth(paymentDate.getMonth() + i);

    schedule.push({
      paymentNumber: i + 1,
      date: paymentDate,
      payment: loan.monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, balance),
      cumulativeInterest,
    });
  }

  return schedule;
}

/**
 * Calculate extra payment scenarios
 */
function calculateExtraPaymentSavings(
  loan: Loan,
  extraAmount: number
): { interestSaved: number; monthsSaved: number; newPayoffDate: Date } {
  const monthlyRate = loan.interestRate / 100 / 12;
  const balance = loan.currentBalance;
  const newMonthlyPayment = loan.monthlyPayment + extraAmount;

  // Calculate with extra payment
  let monthsWithExtra = 0;
  let interestWithExtra = 0;
  let tempBalance = balance;

  while (tempBalance > 0 && monthsWithExtra < 360) {
    const interest = tempBalance * monthlyRate;
    interestWithExtra += interest;
    const principal = Math.min(newMonthlyPayment - interest, tempBalance);
    tempBalance -= principal;
    monthsWithExtra++;
  }

  // Calculate without extra payment
  let monthsWithout = 0;
  let interestWithout = 0;
  tempBalance = balance;

  while (tempBalance > 0 && monthsWithout < 360) {
    const interest = tempBalance * monthlyRate;
    interestWithout += interest;
    const principal = Math.min(loan.monthlyPayment - interest, tempBalance);
    tempBalance -= principal;
    monthsWithout++;
  }

  const newPayoffDate = new Date(loan.nextPaymentDate);
  newPayoffDate.setMonth(newPayoffDate.getMonth() + monthsWithExtra);

  return {
    interestSaved: interestWithout - interestWithExtra,
    monthsSaved: monthsWithout - monthsWithExtra,
    newPayoffDate,
  };
}

/**
 * Generate the Loans sheet
 */
export async function generateLoansSheet(
  workbook: Workbook,
  data: LoansSheetData,
  options: ExcelExportOptions
): Promise<Worksheet> {
  const worksheet = workbook.addWorksheet('Loans', {
    properties: { tabColor: { argb: 'FFEF4444' } }, // Red tab
  });

  // Column definitions for loan summary
  const columns = [
    { header: 'Loan Name', key: 'name', width: 22 },
    { header: 'Type', key: 'type', width: 14 },
    { header: 'Original', key: 'original', width: 14 },
    { header: 'Balance', key: 'balance', width: 14 },
    { header: 'Rate', key: 'rate', width: 8 },
    { header: 'Monthly Payment', key: 'payment', width: 16 },
    { header: 'Remaining Mo.', key: 'remaining', width: 13 },
    { header: 'Total Interest', key: 'totalInterest', width: 14 },
    { header: 'Status', key: 'status', width: 10 },
  ];

  // Create title section
  let currentRow = createTitleSection(
    worksheet,
    'Loan Summary',
    'Debt tracking and amortization',
    new Date()
  );

  // Calculate totals
  const activeLoans = data.loans.filter(l => l.status === 'active');
  const totalDebt = activeLoans.reduce((sum, l) => sum + l.currentBalance, 0);
  const totalMonthlyPayment = activeLoans.reduce((sum, l) => sum + l.monthlyPayment, 0);
  const totalInterestRemaining = activeLoans.reduce((sum, l) => sum + calculateTotalInterestRemaining(l), 0);

  // Summary section
  const summaryRow = worksheet.getRow(currentRow);
  summaryRow.getCell(1).value = 'LOAN SUMMARY';
  summaryRow.getCell(1).font = { ...FONTS.subheader, size: 12 };
  summaryRow.getCell(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF3F4F6' },
  };
  worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
  currentRow++;

  const summaryData = [
    ['Total Debt:', totalDebt, true],
    ['Monthly Payments:', totalMonthlyPayment, true],
    ['Est. Interest Remaining:', totalInterestRemaining, true],
    ['Active Loans:', activeLoans.length, false],
  ];

  summaryData.forEach(item => {
    const row = worksheet.getRow(currentRow);
    row.getCell(1).value = item[0];
    row.getCell(1).font = FONTS.body;
    row.getCell(2).value = item[1];
    if (item[2]) {
      row.getCell(2).numFmt = NUMBER_FORMATS.currency;
    }
    row.getCell(2).font = { ...FONTS.body, bold: true, color: { argb: 'FFEF4444' } };
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

  // Add loan rows
  data.loans.forEach((loan, index) => {
    const row = worksheet.getRow(currentRow);
    const statusInfo = getStatusInfo(loan.status);

    // Name
    row.getCell(1).value = loan.name;
    row.getCell(1).font = { ...FONTS.body, bold: true };

    // Type
    row.getCell(2).value = getLoanTypeDisplay(loan.type);

    // Original amount
    row.getCell(3).value = loan.originalPrincipal;
    row.getCell(3).numFmt = NUMBER_FORMATS.currency;
    row.getCell(3).alignment = ALIGNMENTS.right;

    // Current balance
    row.getCell(4).value = loan.currentBalance;
    row.getCell(4).numFmt = NUMBER_FORMATS.currency;
    row.getCell(4).alignment = ALIGNMENTS.right;
    row.getCell(4).font = { ...FONTS.body, color: { argb: 'FFEF4444' } };

    // Interest rate
    row.getCell(5).value = loan.interestRate / 100;
    row.getCell(5).numFmt = NUMBER_FORMATS.percent;
    row.getCell(5).alignment = ALIGNMENTS.center;

    // Monthly payment
    row.getCell(6).value = loan.monthlyPayment;
    row.getCell(6).numFmt = NUMBER_FORMATS.currency;
    row.getCell(6).alignment = ALIGNMENTS.right;

    // Remaining months
    row.getCell(7).value = calculateRemainingMonths(loan);
    row.getCell(7).alignment = ALIGNMENTS.center;

    // Total interest remaining
    row.getCell(8).value = calculateTotalInterestRemaining(loan);
    row.getCell(8).numFmt = NUMBER_FORMATS.currency;
    row.getCell(8).alignment = ALIGNMENTS.right;

    // Status
    row.getCell(9).value = statusInfo.display;
    row.getCell(9).font = { ...FONTS.body, color: { argb: `FF${statusInfo.color}` } };
    row.getCell(9).alignment = ALIGNMENTS.center;

    styleDataRow(row, index, columns.length);
    currentRow++;
  });

  // Add amortization schedules for each active loan
  activeLoans.forEach(loan => {
    currentRow += 2;

    // Loan amortization header
    const amortHeaderRow = worksheet.getRow(currentRow);
    amortHeaderRow.getCell(1).value = `${loan.name} - Next 12 Payments`;
    amortHeaderRow.getCell(1).font = { ...FONTS.subheader, size: 11 };
    amortHeaderRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' },
    };
    worksheet.mergeCells(`A${currentRow}:G${currentRow}`);
    currentRow++;

    // Amortization table header
    const amortColumns = ['#', 'Date', 'Payment', 'Principal', 'Interest', 'Balance', 'Cum. Interest'];
    const amortWidths = [6, 12, 12, 12, 12, 14, 14];

    const amortTableHeader = worksheet.getRow(currentRow);
    amortColumns.forEach((col, index) => {
      amortTableHeader.getCell(index + 1).value = col;
      amortTableHeader.getCell(index + 1).font = FONTS.header;
      amortTableHeader.getCell(index + 1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF374151' },
      };
      amortTableHeader.getCell(index + 1).border = BORDERS.all;
      amortTableHeader.getCell(index + 1).alignment = ALIGNMENTS.center;
    });
    currentRow++;

    // Amortization data
    const schedule = generateAmortizationSchedule(loan, 12);
    schedule.forEach((entry, index) => {
      const row = worksheet.getRow(currentRow);

      row.getCell(1).value = entry.paymentNumber;
      row.getCell(1).alignment = ALIGNMENTS.center;

      row.getCell(2).value = entry.date;
      row.getCell(2).numFmt = NUMBER_FORMATS.dateShort;
      row.getCell(2).alignment = ALIGNMENTS.center;

      row.getCell(3).value = entry.payment;
      row.getCell(3).numFmt = NUMBER_FORMATS.currency;
      row.getCell(3).alignment = ALIGNMENTS.right;

      row.getCell(4).value = entry.principal;
      row.getCell(4).numFmt = NUMBER_FORMATS.currency;
      row.getCell(4).alignment = ALIGNMENTS.right;
      row.getCell(4).font = { ...FONTS.body, color: { argb: 'FF10B981' } };

      row.getCell(5).value = entry.interest;
      row.getCell(5).numFmt = NUMBER_FORMATS.currency;
      row.getCell(5).alignment = ALIGNMENTS.right;
      row.getCell(5).font = { ...FONTS.body, color: { argb: 'FFEF4444' } };

      row.getCell(6).value = entry.balance;
      row.getCell(6).numFmt = NUMBER_FORMATS.currency;
      row.getCell(6).alignment = ALIGNMENTS.right;

      row.getCell(7).value = entry.cumulativeInterest;
      row.getCell(7).numFmt = NUMBER_FORMATS.currency;
      row.getCell(7).alignment = ALIGNMENTS.right;

      styleDataRow(row, index, amortColumns.length);
      currentRow++;
    });

    // Early payoff analysis
    currentRow += 1;
    const payoffHeader = worksheet.getRow(currentRow);
    payoffHeader.getCell(1).value = 'EARLY PAYOFF ANALYSIS';
    payoffHeader.getCell(1).font = { ...FONTS.bodyMuted, bold: true };
    currentRow++;

    const scenarios = [
      { extra: 100, label: 'Extra $100/month' },
      { extra: 200, label: 'Extra $200/month' },
      { extra: 500, label: 'Extra $500/month' },
    ];

    scenarios.forEach(scenario => {
      const savings = calculateExtraPaymentSavings(loan, scenario.extra);
      const row = worksheet.getRow(currentRow);
      row.getCell(1).value = `${scenario.label} saves: $${savings.interestSaved.toFixed(2)} interest, pays off ${savings.monthsSaved} months early`;
      row.getCell(1).font = FONTS.body;
      currentRow++;
    });
  });

  // Freeze header
  freezePanes(worksheet, headerRowNum, 0);

  return worksheet;
}
