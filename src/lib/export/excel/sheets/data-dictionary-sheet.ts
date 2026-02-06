/**
 * Data Dictionary Sheet Generator
 * Explains all fields for power users
 */

import type { Workbook, Worksheet } from 'exceljs';
import type { SheetName, DataDictionaryEntry } from '../types';
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
} from '../styles';

/**
 * Complete data dictionary for all sheets
 */
const DATA_DICTIONARY: DataDictionaryEntry[] = [
  // Dashboard
  { sheet: 'Dashboard', column: 'Net Worth', description: 'Total assets minus total liabilities', dataType: 'Currency', example: '$125,430.00', notes: 'Updates with each export' },
  { sheet: 'Dashboard', column: 'Monthly Income', description: 'Sum of all income transactions for current month', dataType: 'Currency', example: '$8,500.00' },
  { sheet: 'Dashboard', column: 'Savings Rate', description: '(Income - Expenses) / Income', dataType: 'Percentage', example: '22%', notes: 'Target: 20%+' },

  // Transactions
  { sheet: 'Transactions', column: 'Date', description: 'Date the transaction occurred', dataType: 'Date', example: '2026-01-15' },
  { sheet: 'Transactions', column: 'Account', description: 'Account the transaction belongs to', dataType: 'Text', example: 'BMO Checking' },
  { sheet: 'Transactions', column: 'Description', description: 'Cleaned merchant/transaction name', dataType: 'Text', example: 'Starbucks' },
  { sheet: 'Transactions', column: 'Original Description', description: 'Raw description from bank statement', dataType: 'Text', example: 'SQ *STARBUCKS #12345' },
  { sheet: 'Transactions', column: 'Category', description: 'Spending/income category', dataType: 'Text', example: 'Food & Dining' },
  { sheet: 'Transactions', column: 'Subcategory', description: 'More specific category', dataType: 'Text', example: 'Coffee Shops' },
  { sheet: 'Transactions', column: 'Amount', description: 'Transaction amount (negative = expense)', dataType: 'Currency', example: '-$5.75', notes: 'Red for expenses, green for income' },
  { sheet: 'Transactions', column: 'Running Balance', description: 'Cumulative balance after transaction', dataType: 'Currency', example: '$2,340.25', notes: 'Calculated chronologically' },
  { sheet: 'Transactions', column: 'Month', description: 'Year-month for pivot table grouping', dataType: 'Text', example: '2026-01' },
  { sheet: 'Transactions', column: 'Day of Week', description: 'Day name for spending pattern analysis', dataType: 'Text', example: 'Monday' },
  { sheet: 'Transactions', column: 'Recurring', description: 'Whether transaction repeats regularly', dataType: 'Boolean', example: 'Yes/No' },
  { sheet: 'Transactions', column: 'Notes', description: 'User-added notes', dataType: 'Text', example: 'Work meeting' },
  { sheet: 'Transactions', column: 'Tags', description: 'User-defined labels', dataType: 'Text', example: 'tax-deductible' },

  // Monthly Summary
  { sheet: 'Monthly Summary', column: 'Month', description: 'Month being summarized', dataType: 'Text', example: 'Jan 2026' },
  { sheet: 'Monthly Summary', column: 'Income', description: 'Total income for the month', dataType: 'Currency', example: '$8,500.00' },
  { sheet: 'Monthly Summary', column: 'Expenses', description: 'Total expenses for the month', dataType: 'Currency', example: '$6,200.00' },
  { sheet: 'Monthly Summary', column: 'Net', description: 'Income minus Expenses', dataType: 'Currency', example: '$2,300.00' },
  { sheet: 'Monthly Summary', column: 'Savings Rate', description: 'Net / Income', dataType: 'Percentage', example: '27%' },
  { sheet: 'Monthly Summary', column: 'vs Prev Month', description: 'Change in Net from previous month', dataType: 'Currency', example: '+$400.00' },
  { sheet: 'Monthly Summary', column: 'Transactions', description: 'Number of transactions', dataType: 'Number', example: '145' },
  { sheet: 'Monthly Summary', column: 'Trend', description: 'Visual trend indicator', dataType: 'Symbol', example: '▲ ▼ ─' },

  // Category Analysis
  { sheet: 'Category Analysis', column: 'Category', description: 'Spending category name', dataType: 'Text', example: 'Food & Dining' },
  { sheet: 'Category Analysis', column: 'Budget', description: 'Allocated monthly budget', dataType: 'Currency', example: '$600.00' },
  { sheet: 'Category Analysis', column: 'Actual', description: 'Actual spending', dataType: 'Currency', example: '$720.00' },
  { sheet: 'Category Analysis', column: 'Remaining', description: 'Budget minus Actual', dataType: 'Currency', example: '-$120.00', notes: 'Negative = over budget' },
  { sheet: 'Category Analysis', column: '% Used', description: 'Actual / Budget', dataType: 'Percentage', example: '120%', notes: 'Red when over 100%' },
  { sheet: 'Category Analysis', column: 'Progress', description: 'Visual progress bar', dataType: 'Text', example: '████████░░', notes: 'Unicode progress bar' },
  { sheet: 'Category Analysis', column: 'Transactions', description: 'Number of transactions in category', dataType: 'Number', example: '45' },
  { sheet: 'Category Analysis', column: 'Avg Transaction', description: 'Average transaction amount', dataType: 'Currency', example: '$16.00' },

  // Accounts
  { sheet: 'Accounts', column: 'Account Name', description: 'User-defined account name', dataType: 'Text', example: 'Main Checking' },
  { sheet: 'Accounts', column: 'Type', description: 'Account type', dataType: 'Text', example: 'Checking/Savings/Credit' },
  { sheet: 'Accounts', column: 'Institution', description: 'Bank or financial institution', dataType: 'Text', example: 'BMO' },
  { sheet: 'Accounts', column: 'Balance', description: 'Current account balance', dataType: 'Currency', example: '$5,230.00' },
  { sheet: 'Accounts', column: 'Currency', description: 'Account currency code', dataType: 'Text', example: 'CAD' },
  { sheet: 'Accounts', column: 'Last Reconciled', description: 'Date balance was last verified', dataType: 'Date', example: '2026-01-10' },

  // Budgets
  { sheet: 'Budgets', column: 'Category', description: 'Budget category', dataType: 'Text', example: 'Housing' },
  { sheet: 'Budgets', column: 'Monthly Budget', description: 'Allocated monthly amount', dataType: 'Currency', example: '$2,000.00' },
  { sheet: 'Budgets', column: '[Month] Actual', description: 'Actual spending for month', dataType: 'Currency', example: '$1,800.00' },
  { sheet: 'Budgets', column: '[Month] Var', description: 'Budget minus Actual (positive = under)', dataType: 'Currency', example: '+$200.00' },
  { sheet: 'Budgets', column: 'YTD Budget', description: 'Year-to-date budget total', dataType: 'Currency', example: '$12,000.00' },
  { sheet: 'Budgets', column: 'YTD Actual', description: 'Year-to-date actual spending', dataType: 'Currency', example: '$10,800.00' },
  { sheet: 'Budgets', column: 'YTD Var', description: 'YTD Budget minus YTD Actual', dataType: 'Currency', example: '+$1,200.00' },
  { sheet: 'Budgets', column: 'Progress', description: 'Visual YTD progress', dataType: 'Text', example: '████████░░' },

  // Subscriptions
  { sheet: 'Subscriptions', column: 'Name', description: 'Subscription service name', dataType: 'Text', example: 'Netflix' },
  { sheet: 'Subscriptions', column: 'Amount', description: 'Billing amount per cycle', dataType: 'Currency', example: '$15.99' },
  { sheet: 'Subscriptions', column: 'Frequency', description: 'Billing cycle', dataType: 'Text', example: 'Monthly/Annual' },
  { sheet: 'Subscriptions', column: 'Monthly Cost', description: 'Normalized monthly cost', dataType: 'Currency', example: '$15.99' },
  { sheet: 'Subscriptions', column: 'Annual Cost', description: 'Projected annual cost', dataType: 'Currency', example: '$191.88' },
  { sheet: 'Subscriptions', column: 'Next Billing', description: 'Next billing date', dataType: 'Date', example: '2026-01-22' },
  { sheet: 'Subscriptions', column: 'Status', description: 'Subscription status', dataType: 'Text', example: 'Active/Paused/Cancelled' },
  { sheet: 'Subscriptions', column: 'Category', description: 'Spending category', dataType: 'Text', example: 'Entertainment' },

  // Loans
  { sheet: 'Loans', column: 'Loan Name', description: 'User-defined loan name', dataType: 'Text', example: 'Car Loan' },
  { sheet: 'Loans', column: 'Type', description: 'Loan type', dataType: 'Text', example: 'Mortgage/Auto/Personal/Student' },
  { sheet: 'Loans', column: 'Original', description: 'Original loan amount', dataType: 'Currency', example: '$25,000.00' },
  { sheet: 'Loans', column: 'Balance', description: 'Current remaining balance', dataType: 'Currency', example: '$18,500.00' },
  { sheet: 'Loans', column: 'Rate', description: 'Annual interest rate', dataType: 'Percentage', example: '5.9%' },
  { sheet: 'Loans', column: 'Monthly Payment', description: 'Regular monthly payment', dataType: 'Currency', example: '$450.00' },
  { sheet: 'Loans', column: 'Remaining Mo.', description: 'Months until payoff', dataType: 'Number', example: '41' },
  { sheet: 'Loans', column: 'Total Interest', description: 'Remaining interest to be paid', dataType: 'Currency', example: '$3,200.00' },
  { sheet: 'Loans', column: 'Status', description: 'Loan status', dataType: 'Text', example: 'Active/Paid-off' },

  // Investments
  { sheet: 'Investments', column: 'Account', description: 'Investment account name', dataType: 'Text', example: 'My RRSP' },
  { sheet: 'Investments', column: 'Type', description: 'Account type', dataType: 'Text', example: 'RRSP/TFSA/Non-registered' },
  { sheet: 'Investments', column: 'Symbol', description: 'Stock/ETF ticker symbol', dataType: 'Text', example: 'VFV' },
  { sheet: 'Investments', column: 'Shares', description: 'Number of shares held', dataType: 'Number', example: '50' },
  { sheet: 'Investments', column: 'Cost Basis', description: 'Total amount invested', dataType: 'Currency', example: '$4,500.00' },
  { sheet: 'Investments', column: 'Current Price', description: 'Current price per share', dataType: 'Currency', example: '$98.50' },
  { sheet: 'Investments', column: 'Market Value', description: 'Shares × Current Price', dataType: 'Currency', example: '$4,925.00' },
  { sheet: 'Investments', column: 'Gain/Loss', description: 'Market Value minus Cost Basis', dataType: 'Currency', example: '+$425.00' },
  { sheet: 'Investments', column: 'Gain %', description: 'Gain/Loss as percentage', dataType: 'Percentage', example: '+9.4%' },

  // Net Worth
  { sheet: 'Net Worth', column: 'Assets', description: 'Total value of all assets', dataType: 'Currency', example: '$72,570.00' },
  { sheet: 'Net Worth', column: 'Liabilities', description: 'Total debt obligations', dataType: 'Currency', example: '$49,950.00' },
  { sheet: 'Net Worth', column: 'Net Worth', description: 'Assets minus Liabilities', dataType: 'Currency', example: '$22,620.00' },
  { sheet: 'Net Worth', column: 'Change', description: 'Month-over-month change', dataType: 'Currency', example: '+$2,790.00' },

  // Goals
  { sheet: 'Goals', column: 'Goal', description: 'Goal name', dataType: 'Text', example: 'Emergency Fund' },
  { sheet: 'Goals', column: 'Target', description: 'Target amount to save', dataType: 'Currency', example: '$20,000.00' },
  { sheet: 'Goals', column: 'Current', description: 'Amount saved so far', dataType: 'Currency', example: '$15,000.00' },
  { sheet: 'Goals', column: 'Remaining', description: 'Amount still needed', dataType: 'Currency', example: '$5,000.00' },
  { sheet: 'Goals', column: 'Progress', description: 'Visual progress bar with percentage', dataType: 'Text', example: '████████████░░░ 75%' },
  { sheet: 'Goals', column: 'Monthly', description: 'Monthly contribution amount', dataType: 'Currency', example: '$500.00' },
  { sheet: 'Goals', column: 'Target Date', description: 'Goal completion target date', dataType: 'Date', example: '2026-06-01' },
  { sheet: 'Goals', column: 'On Track?', description: 'Whether current pace meets target', dataType: 'Text', example: '✓ Yes / ⚠ Behind' },
  { sheet: 'Goals', column: 'Priority', description: 'Goal priority level', dataType: 'Text', example: 'High/Medium/Low' },
];

/**
 * Generate the Data Dictionary sheet
 */
export async function generateDataDictionarySheet(
  workbook: Workbook,
  includedSheets: SheetName[]
): Promise<Worksheet> {
  const worksheet = workbook.addWorksheet('Data Dictionary', {
    properties: { tabColor: { argb: 'FF6B7280' } }, // Gray tab
  });

  // Column definitions
  const columns = [
    { header: 'Sheet', key: 'sheet', width: 18 },
    { header: 'Column', key: 'column', width: 18 },
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Data Type', key: 'dataType', width: 12 },
    { header: 'Example', key: 'example', width: 20 },
    { header: 'Notes', key: 'notes', width: 30 },
  ];

  // Create title section
  let currentRow = createTitleSection(
    worksheet,
    'Data Dictionary',
    'Field definitions and data types for all sheets',
    new Date()
  );

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

  // Filter dictionary to only include sheets that were exported
  const filteredDictionary = DATA_DICTIONARY.filter(entry =>
    includedSheets.includes(entry.sheet as SheetName)
  );

  // Group by sheet
  let currentSheet = '';
  filteredDictionary.forEach((entry, index) => {
    const row = worksheet.getRow(currentRow);

    // Add sheet separator
    if (entry.sheet !== currentSheet) {
      if (currentSheet !== '') {
        currentRow++; // Add spacing between sheets
      }
      currentSheet = entry.sheet;

      // Sheet header
      const sheetHeaderRow = worksheet.getRow(currentRow);
      worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
      sheetHeaderRow.getCell(1).value = entry.sheet.toUpperCase();
      sheetHeaderRow.getCell(1).font = { ...FONTS.subheader, color: { argb: 'FF14B8A6' } };
      sheetHeaderRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFCCFBF1' },
      };
      currentRow++;
    }

    const dataRow = worksheet.getRow(currentRow);

    // Sheet (empty for subsequent rows in same sheet)
    dataRow.getCell(1).value = '';

    // Column
    dataRow.getCell(2).value = entry.column;
    dataRow.getCell(2).font = { ...FONTS.body, bold: true };

    // Description
    dataRow.getCell(3).value = entry.description;
    dataRow.getCell(3).alignment = { ...ALIGNMENTS.left, wrapText: true };

    // Data Type
    dataRow.getCell(4).value = entry.dataType;
    dataRow.getCell(4).alignment = ALIGNMENTS.center;

    // Example
    dataRow.getCell(5).value = entry.example;
    dataRow.getCell(5).font = { name: 'Consolas', size: 10 };

    // Notes
    dataRow.getCell(6).value = entry.notes || '';
    dataRow.getCell(6).font = FONTS.bodyMuted;

    styleDataRow(dataRow, index, columns.length);
    currentRow++;
  });

  // Add legend section
  currentRow += 2;
  const legendHeader = worksheet.getRow(currentRow);
  legendHeader.getCell(1).value = 'DATA TYPE LEGEND';
  legendHeader.getCell(1).font = { ...FONTS.subheader, size: 11 };
  currentRow++;

  const legendItems = [
    ['Currency', 'Monetary values, formatted with $ symbol and 2 decimal places'],
    ['Percentage', 'Decimal values formatted as percentages (0.5 = 50%)'],
    ['Date', 'Date values, typically formatted as YYYY-MM-DD'],
    ['Text', 'Free-form text strings'],
    ['Number', 'Numeric values without currency formatting'],
    ['Boolean', 'Yes/No or True/False values'],
    ['Symbol', 'Special characters like trend arrows (▲▼─)'],
  ];

  legendItems.forEach(item => {
    const row = worksheet.getRow(currentRow);
    row.getCell(1).value = item[0];
    row.getCell(1).font = { ...FONTS.body, bold: true };
    row.getCell(2).value = item[1];
    row.getCell(2).font = FONTS.body;
    worksheet.mergeCells(`B${currentRow}:F${currentRow}`);
    currentRow++;
  });

  // Freeze header
  freezePanes(worksheet, headerRowNum, 0);

  return worksheet;
}
