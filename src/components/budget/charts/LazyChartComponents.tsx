/**
 * Lazy-Loaded Chart Components
 *
 * PERFORMANCE OPTIMIZATION:
 * Wraps Recharts components (2.6MB) with React.lazy() to enable code splitting.
 * Charts are loaded only when needed, reducing initial bundle size.
 *
 * ISSUE FIX:
 * Resolves Chromium E2E test timeout issues (>30s page loads) by deferring
 * chart library loading until components are rendered.
 *
 * Target improvement: 30s+ → <5s page load times
 */

"use client";

import { lazy, Suspense } from "react";
import type { Transaction, Holding, InvestmentAccount } from "@/types/budget";
import type { Loan } from "@/types/budget";

// Lazy-load all chart components
const InvestmentCharts = lazy(() =>
  import("@/components/budget/InvestmentCharts").then((mod) => ({ default: mod.InvestmentCharts }))
);

const SpendingTrendChart = lazy(() =>
  import("@/components/budget/SpendingTrendChart").then((mod) => ({
    default: mod.SpendingTrendChart,
  }))
);

const AmortizationChart = lazy(() =>
  import("@/components/budget/loans/AmortizationChart").then((mod) => ({
    default: mod.AmortizationChart,
  }))
);

/**
 * Loading Skeleton - Chart Placeholder
 * Displays while chart component is being loaded
 */
function ChartLoadingSkeleton({ height = 400 }: { height?: number }) {
  return (
    <div
      className="flex w-full animate-pulse items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800"
      style={{ height: `${height}px` }}
      role="status"
      aria-label="Loading chart..."
    >
      <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
        <svg
          className="h-12 w-12 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="text-sm font-medium">Loading chart...</span>
      </div>
    </div>
  );
}

/**
 * Lazy Investment Charts
 * Wraps InvestmentCharts with Suspense boundary
 */
interface LazyInvestmentChartsProps {
  holdings: Holding[];
  accounts: InvestmentAccount[];
  currentPrices: Record<string, number>;
}

export function LazyInvestmentCharts(props: LazyInvestmentChartsProps) {
  return (
    <Suspense fallback={<ChartLoadingSkeleton height={400} />}>
      <InvestmentCharts {...props} />
    </Suspense>
  );
}

/**
 * Lazy Spending Trend Chart
 * Wraps SpendingTrendChart with Suspense boundary
 */
interface LazySpendingTrendChartProps {
  transactions: { date: Date; amount: number }[];
  monthsBack?: number;
  forecastDays?: number;
}

export function LazySpendingTrendChart(props: LazySpendingTrendChartProps) {
  return (
    <Suspense fallback={<ChartLoadingSkeleton height={300} />}>
      <SpendingTrendChart {...props} />
    </Suspense>
  );
}

/**
 * Lazy Amortization Chart
 * Wraps AmortizationChart with Suspense boundary
 */
interface LazyAmortizationChartProps {
  loan: Loan;
}

export function LazyAmortizationChart(props: LazyAmortizationChartProps) {
  return (
    <Suspense fallback={<ChartLoadingSkeleton height={400} />}>
      <AmortizationChart {...props} />
    </Suspense>
  );
}

/**
 * Dashboard Category Spending Pie Chart
 * Lazy-loaded wrapper for dashboard category breakdown
 */
interface CategorySpendingData {
  name: string;
  value: number;
  color: string;
}

interface LazyDashboardPieChartProps {
  data: CategorySpendingData[];
  CustomTooltip: React.ComponentType<any>;
}

const DashboardPieChartComponent = lazy(() =>
  import("recharts").then((mod) => {
    const DashboardPieChart = ({ data, CustomTooltip }: LazyDashboardPieChartProps) => {
      const { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } = mod;
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
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      );
    };
    return { default: DashboardPieChart };
  })
);

export function LazyDashboardPieChart(props: LazyDashboardPieChartProps) {
  return (
    <Suspense fallback={<ChartLoadingSkeleton height={300} />}>
      <DashboardPieChartComponent {...props} />
    </Suspense>
  );
}

/**
 * Dashboard Income vs Expenses Area Chart
 * Lazy-loaded wrapper for dashboard trend visualization
 */
interface MonthlyTrendData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

interface LazyDashboardAreaChartProps {
  data: MonthlyTrendData[];
  CustomTooltip: React.ComponentType<any>;
}

const DashboardAreaChartComponent = lazy(() =>
  import("recharts").then((mod) => {
    const DashboardAreaChart = ({ data, CustomTooltip }: LazyDashboardAreaChartProps) => {
      const { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } =
        mod;
      return (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#999" />
            <YAxis tick={{ fontSize: 12 }} stroke="#999" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#22c55e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorIncome)"
              name="Income"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#ef4444"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorExpenses)"
              name="Expenses"
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    };
    return { default: DashboardAreaChart };
  })
);

export function LazyDashboardAreaChart(props: LazyDashboardAreaChartProps) {
  return (
    <Suspense fallback={<ChartLoadingSkeleton height={300} />}>
      <DashboardAreaChartComponent {...props} />
    </Suspense>
  );
}

/**
 * Reports Page Charts
 * Lazy-loaded wrappers for reports page visualizations
 */

// Generic data type for report charts
interface ChartDataPoint {
  [key: string]: string | number;
}

interface ChartPalette {
  grid: string;
  data: Array<{ hex: string }>;
}

/**
 * Lazy Reports Pie Chart
 */
interface LazyReportsPieChartProps {
  data: ChartDataPoint[];
  palette: ChartPalette;
}

const ReportsPieChartComponent = lazy(() =>
  import("recharts").then((mod) => {
    const ReportsPieChart = ({ data, palette }: LazyReportsPieChartProps) => {
      const { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } = mod;
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
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={String(
                    entry.color || palette.data[index % palette.data.length]?.hex || "#94a3b8"
                  )}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
          </PieChart>
        </ResponsiveContainer>
      );
    };
    return { default: ReportsPieChart };
  })
);

export function LazyReportsPieChart(props: LazyReportsPieChartProps) {
  return (
    <Suspense fallback={<ChartLoadingSkeleton height={300} />}>
      <ReportsPieChartComponent {...props} />
    </Suspense>
  );
}

/**
 * Lazy Reports Bar Chart
 */
interface LazyReportsBarChartProps {
  data: ChartDataPoint[];
  palette: ChartPalette;
  xKey: string;
  yKey: string;
}

const ReportsBarChartComponent = lazy(() =>
  import("recharts").then((mod) => {
    const ReportsBarChart = ({ data, palette, xKey, yKey }: LazyReportsBarChartProps) => {
      const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = mod;
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
    };
    return { default: ReportsBarChart };
  })
);

export function LazyReportsBarChart(props: LazyReportsBarChartProps) {
  return (
    <Suspense fallback={<ChartLoadingSkeleton height={300} />}>
      <ReportsBarChartComponent {...props} />
    </Suspense>
  );
}

/**
 * Lazy Reports Line Chart
 */
interface LazyReportsLineChartProps {
  data: ChartDataPoint[];
  palette: ChartPalette;
  xKey: string;
  lines: Array<{ key: string; name: string; color: string }>;
}

const ReportsLineChartComponent = lazy(() =>
  import("recharts").then((mod) => {
    const ReportsLineChart = ({ data, palette, xKey, lines }: LazyReportsLineChartProps) => {
      const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } =
        mod;
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
            <XAxis dataKey={xKey} stroke={palette.grid} />
            <YAxis stroke={palette.grid} />
            <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            <Legend />
            {lines.map((line) => (
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
    };
    return { default: ReportsLineChart };
  })
);

export function LazyReportsLineChart(props: LazyReportsLineChartProps) {
  return (
    <Suspense fallback={<ChartLoadingSkeleton height={300} />}>
      <ReportsLineChartComponent {...props} />
    </Suspense>
  );
}
