'use client';

/**
 * Reports Page
 * Financial reports and visualizations
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { BarChart3, PieChart as PieChartIcon, TrendingUp, Calendar, ArrowRightLeft, Download, Image, FileImage } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { db } from '@/lib/budget-db';
import type { Transaction, Category } from '@/types/budget';
import { SpendingHeatMap } from '@/components/budget/SpendingHeatMap';
import { LazySpendingTrendChart } from '@/components/budget/charts/LazyChartComponents';
import { useThemeMode } from '@/hooks/useThemeMode';
import { getChartPalette, getCategoryColor } from '@/lib/budget-chart-colors';
import { SankeyWithAccessibility } from '@/components/charts/SankeyWithAccessibility';
import { transformToSankeyData, type DateRange } from '@/lib/charts/sankey-utils';

// Dynamic chart imports for reports page
const DynamicReportsCharts = dynamic(
  () => import('recharts').then((mod) => {
    function ReportsCharts({ type, data, palette, xKey, yKey, lines }: any) {
      const { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Legend } = mod;

      if (type === 'pie') {
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={String(entry.color || palette.data[index % palette.data.length]?.hex || '#94a3b8')}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        );
      }

      if (type === 'bar') {
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} stroke={palette.grid} />
              <YAxis stroke={palette.grid} />
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Bar dataKey={yKey} fill={palette.data[1].hex} />
            </BarChart>
          </ResponsiveContainer>
        );
      }

      // Line chart
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
            <XAxis dataKey={xKey} stroke={palette.grid} />
            <YAxis stroke={palette.grid} />
            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            <Legend />
            {lines.map((line: any) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={line.color}
                strokeWidth={2}
                name={line.name}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }
    return { default: ReportsCharts };
  }),
  {
    loading: () => (
      <div className="w-full rounded-lg bg-gray-100 animate-pulse flex items-center justify-center h-[300px]">
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-teal-600 rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading chart...</span>
        </div>
      </div>
    ),
    ssr: false
  }
);

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year' | 'all'>('month');
  const [isExporting, setIsExporting] = useState(false);

  // Ref for Sankey diagram export
  const sankeyContainerRef = useRef<HTMLDivElement>(null);

  // Get theme-aware chart colors
  const theme = useThemeMode();
  const palette = getChartPalette(theme);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [txs, cats] = await Promise.all([
        db.transactions.toArray(),
        db.categories.toArray(),
      ]);
      setTransactions(txs);
      setCategories(cats);
    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS (Rules of Hooks)

  // Compute Sankey date range for money flow visualization
  const sankeyDateRange: DateRange | undefined = useMemo(() => {
    if (timeRange === 'all') return undefined;

    const now = new Date();
    const start = new Date();

    switch (timeRange) {
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
    }

    return { start, end: now };
  }, [timeRange]);

  const sankeyData = useMemo(() => {
    return transformToSankeyData(transactions, categories, sankeyDateRange);
  }, [transactions, categories, sankeyDateRange]);

  // Export Sankey diagram as PNG
  const exportAsPNG = useCallback(async () => {
    if (!sankeyContainerRef.current || isExporting) return;

    setIsExporting(true);
    try {
      const dataUrl = await htmlToImage.toPng(sankeyContainerRef.current, {
        backgroundColor: '#0f172a', // slate-900
        quality: 1.0,
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `money-flow-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting PNG:', error);
    } finally {
      setIsExporting(false);
    }
  }, [isExporting]);

  // Export Sankey diagram as SVG
  const exportAsSVG = useCallback(async () => {
    if (!sankeyContainerRef.current || isExporting) return;

    setIsExporting(true);
    try {
      const dataUrl = await htmlToImage.toSvg(sankeyContainerRef.current, {
        backgroundColor: '#0f172a', // slate-900
      });

      const link = document.createElement('a');
      link.download = `money-flow-${new Date().toISOString().split('T')[0]}.svg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting SVG:', error);
    } finally {
      setIsExporting(false);
    }
  }, [isExporting]);

  // Early return for loading state (AFTER all hooks)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  // Filter transactions by time range
  const filteredTransactions = filterByTimeRange(transactions, timeRange);

  // Calculate spending by category
  const categorySpending = calculateCategorySpending(filteredTransactions, categories);

  // Calculate monthly trends
  const monthlyTrends = calculateMonthlyTrends(transactions);

  // Calculate income vs expenses
  const incomeExpenses = calculateIncomeExpenses(filteredTransactions);

  // Top spending categories
  const topCategories = categorySpending
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports & Insights</h1>
          <p className="text-slate-400 mt-2">Visualize your financial data</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(['month', 'quarter', 'year', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-teal-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <TrendingUp className="w-5 h-5" />
            <p className="text-sm">Total Income</p>
          </div>
          <p className="text-3xl font-bold text-green-600">
            ${incomeExpenses.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <TrendingUp className="w-5 h-5 rotate-180" />
            <p className="text-sm">Total Expenses</p>
          </div>
          <p className="text-3xl font-bold text-red-600">
            ${incomeExpenses.expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <PieChartIcon className="w-5 h-5" />
            <p className="text-sm">Net Savings</p>
          </div>
          <p className={`text-3xl font-bold ${incomeExpenses.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${incomeExpenses.net.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <BarChart3 className="w-5 h-5" />
            <p className="text-sm">Savings Rate</p>
          </div>
          <p className="text-3xl font-bold text-teal-600">
            {incomeExpenses.savingsRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category - Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h2>
          {categorySpending.length > 0 ? (
            <DynamicReportsCharts
              type="pie"
              data={categorySpending.map(entry => ({
                ...entry,
                color: getCategoryColor(entry.color, theme)
              }))}
              palette={palette}
            />
          ) : (
            <p className="text-gray-500 text-center py-12">No spending data available</p>
          )}
        </div>

        {/* Top Spending Categories - Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Categories</h2>
          {topCategories.length > 0 ? (
            <DynamicReportsCharts
              type="bar"
              data={topCategories}
              palette={palette}
              xKey="name"
              yKey="value"
            />
          ) : (
            <p className="text-gray-500 text-center py-12">No data available</p>
          )}
        </div>

        {/* Monthly Trends - Line Chart */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Income vs Expenses (Last 6 Months)</h2>
          {monthlyTrends.length > 0 ? (
            <DynamicReportsCharts
              type="line"
              data={monthlyTrends}
              palette={palette}
              xKey="month"
              lines={[
                { key: 'income', name: 'Income', color: palette.positive.hex },
                { key: 'expenses', name: 'Expenses', color: palette.negative.hex },
                { key: 'net', name: 'Net', color: palette.neutral.hex },
              ]}
            />
          ) : (
            <p className="text-gray-500 text-center py-12">No trend data available</p>
          )}
        </div>
      </div>

      {/* Money Flow - Sankey Diagram */}
      <div ref={sankeyContainerRef} className="bg-slate-900 rounded-xl shadow-lg p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-500/20">
              <ArrowRightLeft className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Money Flow</h2>
              <p className="text-sm text-slate-400">
                Visualize how income flows to categories and savings
              </p>
            </div>
          </div>

          {/* Export Buttons */}
          {sankeyData.nodes.length > 0 && sankeyData.links.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={exportAsPNG}
                disabled={isExporting}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download as PNG"
              >
                <Image className="h-4 w-4" />
                <span className="hidden sm:inline">PNG</span>
              </button>
              <button
                onClick={exportAsSVG}
                disabled={isExporting}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download as SVG"
              >
                <FileImage className="h-4 w-4" />
                <span className="hidden sm:inline">SVG</span>
              </button>
            </div>
          )}
        </div>

        {sankeyData.nodes.length > 0 && sankeyData.links.length > 0 ? (
          <SankeyWithAccessibility
            data={sankeyData}
            width={800}
            height={500}
            className="mx-auto"
          />
        ) : (
          <div className="flex items-center justify-center h-64 rounded-xl bg-slate-800/50 border border-white/5">
            <div className="text-center">
              <ArrowRightLeft className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">
                Add income and expense transactions to see your money flow
              </p>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-white/5 p-4 text-center">
            <p className="text-2xl font-bold text-green-400">
              ${sankeyData.totalIncome.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-slate-500 mt-1">Total Income</p>
          </div>
          <div className="rounded-lg bg-white/5 p-4 text-center">
            <p className="text-2xl font-bold text-red-400">
              ${sankeyData.totalExpenses.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-slate-500 mt-1">Total Expenses</p>
          </div>
          <div className="rounded-lg bg-white/5 p-4 text-center">
            <p className={`text-2xl font-bold ${sankeyData.netSavings >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
              ${sankeyData.netSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-slate-500 mt-1">Net Savings</p>
          </div>
        </div>
      </div>

      {/* Spending Trend & Forecast */}
      <LazySpendingTrendChart transactions={filteredTransactions} monthsBack={6} forecastDays={30} />

      {/* Spending Heat Map */}
      <SpendingHeatMap transactions={filteredTransactions} />

      {/* Category Breakdown Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Category Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % of Total
                </th>
                <th className="px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transactions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categorySpending.map((cat) => (
                <tr key={cat.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-medium text-gray-900">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">
                    ${cat.value.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">
                    {cat.percentage.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-gray-600">
                    {cat.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Helper functions

function filterByTimeRange(transactions: Transaction[], range: 'month' | 'quarter' | 'year' | 'all'): Transaction[] {
  if (range === 'all') return transactions;

  const now = new Date();
  const cutoffDate = new Date();

  switch (range) {
    case 'month':
      cutoffDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      cutoffDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  return transactions.filter(tx => new Date(tx.date) >= cutoffDate);
}

function calculateCategorySpending(transactions: Transaction[], categories: Category[]) {
  const spending = new Map<string, { value: number; count: number; color: string }>();

  transactions
    .filter(tx => tx.amount < 0) // Only expenses
    .forEach(tx => {
      const category = tx.category || 'Uncategorized';
      const existing = spending.get(category) || { value: 0, count: 0, color: '#64748b' };
      const cat = categories.find(c => c.name === category);

      spending.set(category, {
        value: existing.value + Math.abs(tx.amount),
        count: existing.count + 1,
        color: cat?.color || '#64748b',
      });
    });

  const total = Array.from(spending.values()).reduce((sum, cat) => sum + cat.value, 0);

  return Array.from(spending.entries()).map(([name, data]) => ({
    name,
    value: data.value,
    count: data.count,
    color: data.color,
    percentage: total > 0 ? (data.value / total) * 100 : 0,
  }));
}

function calculateMonthlyTrends(transactions: Transaction[]) {
  const monthlyData = new Map<string, { income: number; expenses: number }>();

  // Get last 6 months
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    months.push(key);
    monthlyData.set(key, { income: 0, expenses: 0 });
  }

  transactions.forEach(tx => {
    const date = new Date(tx.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (monthlyData.has(key)) {
      const data = monthlyData.get(key)!;
      if (tx.amount > 0) {
        data.income += tx.amount;
      } else {
        data.expenses += Math.abs(tx.amount);
      }
    }
  });

  return months.map(key => {
    const data = monthlyData.get(key)!;
    const [year, month] = key.split('-');
    const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit',
    });

    return {
      month: monthName,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses,
    };
  });
}

function calculateIncomeExpenses(transactions: Transaction[]) {
  const income = transactions
    .filter(tx => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const expenses = Math.abs(
    transactions
      .filter(tx => tx.amount < 0)
      .reduce((sum, tx) => sum + tx.amount, 0)
  );

  const net = income - expenses;
  const savingsRate = income > 0 ? (net / income) * 100 : 0;

  return { income, expenses, net, savingsRate };
}
