'use client';

/**
 * Investment Charts Component (Phase 8)
 * Task 8.3.2: Add investment chart visualization
 * 
 * Charts:
 * - Pie Chart: Portfolio allocation by holding
 * - Bar Chart: Gain/Loss by holding
 */

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTranslations } from 'next-intl';
import type { Holding, InvestmentAccount } from '@/types/budget';
import { useThemeMode } from '@/hooks/useThemeMode';
import { getChartPalette } from '@/lib/budget-chart-colors';

interface InvestmentChartsProps {
  holdings: Holding[];
  accounts: InvestmentAccount[];
  currentPrices: Record<string, number>;
}

export function InvestmentCharts({ holdings, accounts, currentPrices }: InvestmentChartsProps) {
  const t = useTranslations('investmentCharts');
  // Get theme-aware chart colors
  const theme = useThemeMode();
  const palette = getChartPalette(theme);
  // Calculate allocation data for pie chart
  const allocationData = holdings.map((holding) => {
    const currentPrice = currentPrices[holding.symbol.toUpperCase()] || holding.purchasePrice;
    const value = holding.quantity * currentPrice;
    
    return {
      name: holding.symbol,
      value,
      percentage: 0, // Will be calculated after
    };
  });

  // Calculate total portfolio value and percentages
  const totalValue = allocationData.reduce((sum, item) => sum + item.value, 0);
  allocationData.forEach(item => {
    item.percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
  });

  // Sort by value descending
  allocationData.sort((a, b) => b.value - a.value);

  // Calculate performance data for bar chart
  const performanceData = holdings.map((holding) => {
    const currentPrice = currentPrices[holding.symbol.toUpperCase()] || holding.purchasePrice;
    const currentValue = holding.quantity * currentPrice;
    const costBasis = holding.quantity * holding.purchasePrice;
    const gainLoss = currentValue - costBasis;
    const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

    return {
      symbol: holding.symbol,
      gainLoss,
      gainLossPercent,
      costBasis,
      currentValue,
    };
  });

  // Sort by absolute gain/loss descending
  performanceData.sort((a, b) => Math.abs(b.gainLoss) - Math.abs(a.gainLoss));

  // Calculate allocation by account type
  const accountTypeData = accounts.map((account) => {
    const accountHoldings = holdings.filter(h => h.accountId === account.id);
    const accountValue = accountHoldings.reduce((sum, holding) => {
      const currentPrice = currentPrices[holding.symbol.toUpperCase()] || holding.purchasePrice;
      return sum + (holding.quantity * currentPrice);
    }, 0);

    return {
      name: account.type,
      value: accountValue,
      percentage: 0,
      accountName: account.name,
    };
  });

  // Calculate percentages for account types
  const totalAccountValue = accountTypeData.reduce((sum, item) => sum + item.value, 0);
  accountTypeData.forEach(item => {
    item.percentage = totalAccountValue > 0 ? (item.value / totalAccountValue) * 100 : 0;
  });

  // Filter out zero-value accounts
  const nonZeroAccountData = accountTypeData.filter(item => item.value > 0);

  // Custom tooltip for pie chart
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            ${data.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm font-medium text-teal-600">
            {t('tooltip.percentOfPortfolio', { percent: data.payload.percentage.toFixed(1) })}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for bar chart
  const BarTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{data.symbol}</p>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">
              {t('tooltip.costBasis')}: ${data.costBasis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-gray-600">
              {t('tooltip.currentValue')}: ${data.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className={`font-medium ${data.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.gainLoss >= 0 ? '+' : ''}${data.gainLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              {' '}({data.gainLossPercent >= 0 ? '+' : ''}{data.gainLossPercent.toFixed(2)}%)
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for account allocation pie chart
  const AccountTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-4 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.payload.accountName}</p>
          <p className="text-sm text-gray-600">{data.name}</p>
          <p className="text-sm text-gray-600 mt-2">
            ${data.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm font-medium text-teal-600">
            {t('tooltip.percentOfPortfolio', { percent: data.payload.percentage.toFixed(1) })}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label for pie chart
  const renderCustomLabel = (entry: any) => {
    if (entry.percentage < 5) return ''; // Hide labels for small slices
    return `${entry.percentage.toFixed(0)}%`;
  };

  if (holdings.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">{t('emptyState')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Allocation by Holding (Pie Chart) */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('titles.portfolioAllocation')}</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {allocationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={palette.data[index % palette.data.length].hex} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry: any) => {
                  const data = allocationData.find(d => d.name === value);
                  return `${value} (${data?.percentage.toFixed(1)}%)`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Account Type Allocation (Pie Chart) */}
      {nonZeroAccountData.length > 1 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{t('titles.accountTypeAllocation')}</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={nonZeroAccountData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {nonZeroAccountData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={palette.data[index % palette.data.length].hex} />
                  ))}
                </Pie>
                <Tooltip content={<AccountTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry: any) => {
                    const data = nonZeroAccountData.find(d => d.name === value);
                    return `${value} (${data?.percentage.toFixed(1)}%)`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Gain/Loss by Holding (Bar Chart) */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('titles.gainLoss')}</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={performanceData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
              <XAxis
                dataKey="symbol"
                tick={{ fill: palette.text, fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tick={{ fill: palette.text, fontSize: 12 }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip content={<BarTooltip />} />
              <Bar
                dataKey="gainLoss"
                fill={palette.data[0].hex}
                radius={[8, 8, 0, 0]}
              >
                {performanceData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.gainLoss >= 0 ? palette.positive.hex : palette.negative.hex}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span className="text-gray-600">{t('legend.gain')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span className="text-gray-600">{t('legend.loss')}</span>
          </div>
        </div>
      </div>

      {/* Performance Summary Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">{t('titles.performanceSummary')}</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">{t('tableHeaders.symbol')}</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase">{t('tableHeaders.costBasis')}</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase">{t('tableHeaders.currentValue')}</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase">{t('tableHeaders.gainLoss')}</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase">{t('tableHeaders.percentReturn')}</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-700 uppercase">{t('tableHeaders.allocation')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {performanceData.map((item, index) => {
                const allocation = allocationData.find(a => a.name === item.symbol);
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900">{item.symbol}</td>
                    <td className="px-4 py-2 text-right text-gray-900">
                      ${item.costBasis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-900">
                      ${item.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`px-4 py-2 text-right font-medium ${item.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.gainLoss >= 0 ? '+' : ''}${item.gainLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`px-4 py-2 text-right font-medium ${item.gainLossPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.gainLossPercent >= 0 ? '+' : ''}{item.gainLossPercent.toFixed(2)}%
                    </td>
                    <td className="px-4 py-2 text-right text-gray-600">
                      {allocation?.percentage.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-300">
              <tr>
                <td className="px-4 py-2 font-bold text-gray-900">{t('tableHeaders.total')}</td>
                <td className="px-4 py-2 text-right font-bold text-gray-900">
                  ${performanceData.reduce((sum, item) => sum + item.costBasis, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-2 text-right font-bold text-gray-900">
                  ${performanceData.reduce((sum, item) => sum + item.currentValue, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className={`px-4 py-2 text-right font-bold ${
                  performanceData.reduce((sum, item) => sum + item.gainLoss, 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {performanceData.reduce((sum, item) => sum + item.gainLoss, 0) >= 0 ? '+' : ''}$
                  {performanceData.reduce((sum, item) => sum + item.gainLoss, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className={`px-4 py-2 text-right font-bold ${
                  performanceData.reduce((sum, item) => sum + item.gainLoss, 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(() => {
                    const totalCost = performanceData.reduce((sum, item) => sum + item.costBasis, 0);
                    const totalGainLoss = performanceData.reduce((sum, item) => sum + item.gainLoss, 0);
                    const totalReturn = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
                    return `${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(2)}%`;
                  })()}
                </td>
                <td className="px-4 py-2 text-right font-bold text-gray-900">100.0%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

