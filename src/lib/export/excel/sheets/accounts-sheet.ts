/**
 * Accounts Sheet Generator
 * All accounts with current balances and summary
 */

import type { Workbook, Worksheet } from 'exceljs';
import type { ExcelExportOptions } from '../types';
import type { Account } from '@/types/budget';
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
  createSummaryRow,
  EXCEL_COLORS,
} from '../styles';

interface AccountsSheetData {
  accounts: Account[];
}

/**
 * Get account type display name
 */
function getAccountTypeDisplay(type: string): string {
  switch (type) {
    case 'checking': return 'Checking';
    case 'savings': return 'Savings';
    case 'credit': return 'Credit Card';
    default: return type;
  }
}

/**
 * Generate the Accounts sheet
 */
export async function generateAccountsSheet(
  workbook: Workbook,
  data: AccountsSheetData,
  options: ExcelExportOptions
): Promise<Worksheet> {
  const worksheet = workbook.addWorksheet('Accounts', {
    properties: { tabColor: { argb: 'FF10B981' } }, // Green tab
  });

  // Column definitions
  const columns = [
    { header: 'Account Name', key: 'name', width: 25 },
    { header: 'Type', key: 'type', width: 14 },
    { header: 'Institution', key: 'institution', width: 18 },
    { header: 'Balance', key: 'balance', width: 16 },
    { header: 'Currency', key: 'currency', width: 10 },
    { header: 'Last Reconciled', key: 'lastReconciled', width: 14 },
  ];

  // Create title section
  let currentRow = createTitleSection(
    worksheet,
    'Account Summary',
    `${data.accounts.length} accounts`,
    new Date()
  );

  // Calculate summary
  const totalAssets = data.accounts
    .filter(a => a.type === 'checking' || a.type === 'savings')
    .reduce((sum, a) => sum + a.balance, 0);

  const totalLiabilities = data.accounts
    .filter(a => a.type === 'credit')
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);

  const netLiquid = totalAssets - totalLiabilities;

  // Summary box
  const summaryStartRow = currentRow;
  worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
  const summaryHeaderRow = worksheet.getRow(currentRow);
  summaryHeaderRow.getCell(1).value = 'ACCOUNT SUMMARY';
  summaryHeaderRow.getCell(1).font = { ...FONTS.subheader, size: 12 };
  summaryHeaderRow.getCell(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF3F4F6' },
  };
  summaryHeaderRow.getCell(1).border = BORDERS.all;
  summaryHeaderRow.height = 24;
  currentRow++;

  // Total Assets
  const assetsRow = worksheet.getRow(currentRow);
  assetsRow.getCell(1).value = 'Total Assets (Checking + Savings):';
  assetsRow.getCell(1).font = FONTS.body;
  assetsRow.getCell(4).value = totalAssets;
  assetsRow.getCell(4).numFmt = NUMBER_FORMATS.currency;
  assetsRow.getCell(4).font = { ...FONTS.body, color: { argb: 'FF10B981' } };
  assetsRow.getCell(4).alignment = ALIGNMENTS.right;
  currentRow++;

  // Total Liabilities
  const liabRow = worksheet.getRow(currentRow);
  liabRow.getCell(1).value = 'Total Liabilities (Credit Cards):';
  liabRow.getCell(1).font = FONTS.body;
  liabRow.getCell(4).value = -totalLiabilities;
  liabRow.getCell(4).numFmt = NUMBER_FORMATS.currency;
  liabRow.getCell(4).font = { ...FONTS.body, color: { argb: 'FFEF4444' } };
  liabRow.getCell(4).alignment = ALIGNMENTS.right;
  currentRow++;

  // Divider
  const dividerRow = worksheet.getRow(currentRow);
  worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
  dividerRow.getCell(1).border = { bottom: { style: 'medium', color: { argb: 'FF14B8A6' } } };
  currentRow++;

  // Net Liquid Assets
  const netRow = worksheet.getRow(currentRow);
  netRow.getCell(1).value = 'Net Liquid Assets:';
  netRow.getCell(1).font = { ...FONTS.body, bold: true };
  netRow.getCell(4).value = netLiquid;
  netRow.getCell(4).numFmt = NUMBER_FORMATS.currency;
  netRow.getCell(4).font = { ...FONTS.body, bold: true, color: { argb: netLiquid >= 0 ? 'FF10B981' : 'FFEF4444' } };
  netRow.getCell(4).alignment = ALIGNMENTS.right;
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
  setColumnWidths(worksheet, columns.map(c => c.width));

  // Sort accounts: Checking first, then Savings, then Credit
  const sortOrder = { checking: 1, savings: 2, credit: 3 };
  const sortedAccounts = [...data.accounts].sort((a, b) => {
    return (sortOrder[a.type] || 4) - (sortOrder[b.type] || 4);
  });

  // Add data rows
  let currentType = '';
  sortedAccounts.forEach((account, index) => {
    // Add type separator
    if (account.type !== currentType) {
      if (currentType !== '') {
        currentRow++; // Add spacing between types
      }
      currentType = account.type;

      // Type header
      const typeRow = worksheet.getRow(currentRow);
      worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
      typeRow.getCell(1).value = getAccountTypeDisplay(account.type).toUpperCase();
      typeRow.getCell(1).font = { ...FONTS.bodyMuted, bold: true };
      typeRow.getCell(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF9FAFB' },
      };
      currentRow++;
    }

    const row = worksheet.getRow(currentRow);

    // Account name
    row.getCell(1).value = account.name;
    row.getCell(1).font = { ...FONTS.body, bold: true };

    // Type
    row.getCell(2).value = getAccountTypeDisplay(account.type);

    // Institution
    row.getCell(3).value = account.institution || '';

    // Balance
    row.getCell(4).value = account.balance;
    styleCurrencyCell(row.getCell(4), account.type === 'credit' ? -Math.abs(account.balance) : account.balance);

    // Currency
    row.getCell(5).value = account.currency || 'CAD';
    row.getCell(5).alignment = ALIGNMENTS.center;

    // Last Reconciled
    row.getCell(6).value = account.lastReconciledAt ? new Date(account.lastReconciledAt) : null;
    row.getCell(6).numFmt = NUMBER_FORMATS.date;
    row.getCell(6).alignment = ALIGNMENTS.center;

    // Style the row
    styleDataRow(row, index, columns.length);

    currentRow++;
  });

  // Freeze header
  freezePanes(worksheet, headerRowNum, 0);

  return worksheet;
}
