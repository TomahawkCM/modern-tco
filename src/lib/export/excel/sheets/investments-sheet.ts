/**
 * Investments Sheet Generator
 * Portfolio overview with holdings and performance
 */

import type { Workbook, Worksheet } from 'exceljs';
import type { ExcelExportOptions, InvestmentHoldingData } from '../types';
import type { InvestmentAccount, Holding } from '@/lib/budget-db';
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
  EXCEL_COLORS,
} from '../styles';

interface InvestmentsSheetData {
  investmentAccounts: InvestmentAccount[];
  holdings: Holding[];
}

/**
 * Get account type display
 */
function getAccountTypeDisplay(type: InvestmentAccount['type']): string {
  switch (type) {
    case 'RRSP': return 'RRSP';
    case 'TFSA': return 'TFSA';
    case 'Non-registered': return 'Non-registered';
    case 'Company shares': return 'Company Shares';
    default: return type;
  }
}

/**
 * Generate the Investments sheet
 */
export async function generateInvestmentsSheet(
  workbook: Workbook,
  data: InvestmentsSheetData,
  options: ExcelExportOptions
): Promise<Worksheet> {
  const worksheet = workbook.addWorksheet('Investments', {
    properties: { tabColor: { argb: 'FF6366F1' } }, // Indigo tab
  });

  // Column definitions for holdings
  const holdingColumns = [
    { header: 'Account', key: 'account', width: 20 },
    { header: 'Type', key: 'type', width: 14 },
    { header: 'Symbol', key: 'symbol', width: 12 },
    { header: 'Shares', key: 'shares', width: 10 },
    { header: 'Cost Basis', key: 'costBasis', width: 14 },
    { header: 'Current Price', key: 'currentPrice', width: 14 },
    { header: 'Market Value', key: 'marketValue', width: 14 },
    { header: 'Gain/Loss', key: 'gainLoss', width: 14 },
    { header: 'Gain %', key: 'gainPercent', width: 10 },
  ];

  // Create title section
  let currentRow = createTitleSection(
    worksheet,
    'Investment Portfolio',
    'Holdings and performance summary',
    new Date()
  );

  // Build holdings data with account info
  const holdingsData: InvestmentHoldingData[] = data.holdings.map(holding => {
    const account = data.investmentAccounts.find(a => a.id === holding.accountId);
    const marketValue = holding.quantity * holding.purchasePrice; // Using purchase price as proxy for current
    const costBasis = holding.quantity * holding.purchasePrice;
    const gainLoss = 0; // Would need real market data
    const gainLossPercent = 0;

    return {
      accountName: account?.name || 'Unknown',
      accountType: account?.type || 'Non-registered',
      symbol: holding.symbol,
      name: undefined,
      shares: holding.quantity,
      costBasis,
      currentPrice: holding.purchasePrice,
      marketValue,
      gainLoss,
      gainLossPercent,
    };
  });

  // Calculate portfolio totals
  const totalCostBasis = holdingsData.reduce((sum, h) => sum + h.costBasis, 0);
  const totalMarketValue = holdingsData.reduce((sum, h) => sum + h.marketValue, 0);
  const totalGainLoss = totalMarketValue - totalCostBasis;
  const totalGainPercent = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;

  // Portfolio summary section
  const summaryRow = worksheet.getRow(currentRow);
  summaryRow.getCell(1).value = 'PORTFOLIO SUMMARY';
  summaryRow.getCell(1).font = { ...FONTS.subheader, size: 12 };
  summaryRow.getCell(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF3F4F6' },
  };
  worksheet.mergeCells(`A${currentRow}:I${currentRow}`);
  currentRow++;

  const summaryData = [
    ['Total Cost Basis:', totalCostBasis, NUMBER_FORMATS.currency, '111827'],
    ['Total Market Value:', totalMarketValue, NUMBER_FORMATS.currency, '111827'],
    ['Total Gain/Loss:', totalGainLoss, NUMBER_FORMATS.currency, totalGainLoss >= 0 ? '10B981' : 'EF4444'],
    ['Total Return:', totalGainPercent / 100, NUMBER_FORMATS.percent, totalGainPercent >= 0 ? '10B981' : 'EF4444'],
  ];

  summaryData.forEach(item => {
    const row = worksheet.getRow(currentRow);
    row.getCell(1).value = item[0];
    row.getCell(1).font = FONTS.body;
    row.getCell(2).value = item[1];
    row.getCell(2).numFmt = item[2] as string;
    row.getCell(2).font = { ...FONTS.body, bold: true, color: { argb: `FF${item[3]}` } };
    currentRow++;
  });
  currentRow++;

  // Account allocation breakdown
  const accountTotals = new Map<string, { type: string; total: number }>();
  holdingsData.forEach(h => {
    const existing = accountTotals.get(h.accountName);
    if (existing) {
      existing.total += h.marketValue;
    } else {
      accountTotals.set(h.accountName, { type: h.accountType, total: h.marketValue });
    }
  });

  if (accountTotals.size > 1) {
    const allocRow = worksheet.getRow(currentRow);
    allocRow.getCell(1).value = 'ALLOCATION BY ACCOUNT';
    allocRow.getCell(1).font = { ...FONTS.bodyMuted, bold: true };
    currentRow++;

    accountTotals.forEach((account, name) => {
      const row = worksheet.getRow(currentRow);
      const percent = totalMarketValue > 0 ? (account.total / totalMarketValue) * 100 : 0;
      row.getCell(1).value = `${name} (${account.type}):`;
      row.getCell(1).font = FONTS.body;
      row.getCell(2).value = account.total;
      row.getCell(2).numFmt = NUMBER_FORMATS.currency;
      row.getCell(3).value = `${percent.toFixed(1)}%`;
      row.getCell(3).font = FONTS.bodyMuted;
      currentRow++;
    });
    currentRow++;
  }

  // Holdings header
  const headerRowNum = currentRow;
  const headerRow = worksheet.getRow(headerRowNum);
  holdingColumns.forEach((col, index) => {
    headerRow.getCell(index + 1).value = col.header;
  });
  styleHeaderRow(headerRow, holdingColumns.length);
  currentRow++;

  // Set column widths
  setColumnWidths(worksheet, holdingColumns.map(c => c.width));

  // Sort holdings by market value descending
  const sortedHoldings = [...holdingsData].sort((a, b) => b.marketValue - a.marketValue);

  // Add holdings rows
  sortedHoldings.forEach((holding, index) => {
    const row = worksheet.getRow(currentRow);

    // Account
    row.getCell(1).value = holding.accountName;
    row.getCell(1).font = FONTS.body;

    // Type
    row.getCell(2).value = getAccountTypeDisplay(holding.accountType as InvestmentAccount['type']);

    // Symbol
    row.getCell(3).value = holding.symbol;
    row.getCell(3).font = { ...FONTS.body, bold: true };

    // Shares
    row.getCell(4).value = holding.shares;
    row.getCell(4).numFmt = NUMBER_FORMATS.numberDecimal;
    row.getCell(4).alignment = ALIGNMENTS.right;

    // Cost Basis
    row.getCell(5).value = holding.costBasis;
    row.getCell(5).numFmt = NUMBER_FORMATS.currency;
    row.getCell(5).alignment = ALIGNMENTS.right;

    // Current Price
    row.getCell(6).value = holding.currentPrice;
    row.getCell(6).numFmt = NUMBER_FORMATS.currency;
    row.getCell(6).alignment = ALIGNMENTS.right;

    // Market Value
    row.getCell(7).value = holding.marketValue;
    row.getCell(7).numFmt = NUMBER_FORMATS.currency;
    row.getCell(7).alignment = ALIGNMENTS.right;
    row.getCell(7).font = { ...FONTS.body, bold: true };

    // Gain/Loss
    row.getCell(8).value = holding.gainLoss;
    styleCurrencyCell(row.getCell(8), holding.gainLoss);

    // Gain %
    row.getCell(9).value = holding.gainLossPercent / 100;
    stylePercentCell(row.getCell(9), holding.gainLossPercent, { warning: -5, danger: -10 });

    styleDataRow(row, index, holdingColumns.length);
    currentRow++;
  });

  // Add totals row
  if (holdingsData.length > 0) {
    currentRow++;
    const totalRow = worksheet.getRow(currentRow);

    totalRow.getCell(1).value = 'TOTAL';
    totalRow.getCell(1).font = { ...FONTS.body, bold: true };

    totalRow.getCell(5).value = totalCostBasis;
    totalRow.getCell(5).numFmt = NUMBER_FORMATS.currency;
    totalRow.getCell(5).font = { ...FONTS.body, bold: true };

    totalRow.getCell(7).value = totalMarketValue;
    totalRow.getCell(7).numFmt = NUMBER_FORMATS.currency;
    totalRow.getCell(7).font = { ...FONTS.body, bold: true };

    totalRow.getCell(8).value = totalGainLoss;
    styleCurrencyCell(totalRow.getCell(8), totalGainLoss);
    totalRow.getCell(8).font = { ...totalRow.getCell(8).font, bold: true };

    totalRow.getCell(9).value = totalGainPercent / 100;
    stylePercentCell(totalRow.getCell(9), totalGainPercent, { warning: -5, danger: -10 });
    totalRow.getCell(9).font = { ...totalRow.getCell(9).font, bold: true };

    for (let i = 1; i <= holdingColumns.length; i++) {
      totalRow.getCell(i).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE5E7EB' },
      };
      totalRow.getCell(i).border = BORDERS.all;
    }
  }

  // Note about market data
  currentRow += 2;
  const noteRow = worksheet.getRow(currentRow);
  noteRow.getCell(1).value = 'Note: Current prices shown are purchase prices. For real-time market values, connect a market data provider.';
  noteRow.getCell(1).font = { ...FONTS.bodyMuted, italic: true };

  // Freeze header
  freezePanes(worksheet, headerRowNum, 0);

  return worksheet;
}
