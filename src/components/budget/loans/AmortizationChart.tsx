/**
 * Amortization Chart Component
 * Visual chart showing principal vs interest breakdown over time
 */

'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Loan } from '@/types/budget';
import { generateAmortizationSchedule } from '@/lib/loans/calculations';
import { format } from 'date-fns';
import { useThemeMode } from '@/hooks/useThemeMode';
import { getChartPalette } from '@/lib/budget-chart-colors';

interface AmortizationChartProps {
  loan: Loan;
  maxMonths?: number; // Show only first N months for performance
}

export function AmortizationChart({ loan, maxMonths = 360 }: AmortizationChartProps) {
  // Get theme-aware chart colors
  const theme = useThemeMode();
  const palette = getChartPalette(theme);

  const schedule = useMemo(() => {
    return generateAmortizationSchedule(
      loan.currentBalance,
      loan.interestRate,
      loan.termMonths,
      loan.startDate,
      loan.monthlyPayment
    ).slice(0, maxMonths);
  }, [loan, maxMonths]);

  // Transform data for charts
  const chartData = useMemo(() => {
    return schedule.map((entry, index) => ({
      month: index + 1,
      date: format(entry.date, 'MMM yy'),
      balance: Math.round(entry.balance),
      principal: Math.round(entry.principal),
      interest: Math.round(entry.interest),
      cumulativeInterest: Math.round(entry.cumulativeInterest),
      cumulativePrincipal: Math.round(loan.currentBalance - entry.balance),
    }));
  }, [schedule, loan.currentBalance]);

  // Sample every N months for better performance on long loans
  const samplingRate = schedule.length > 120 ? Math.ceil(schedule.length / 120) : 1;
  const sampledData = chartData.filter((_, index) => index % samplingRate === 0 || index === chartData.length - 1);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900 mb-2">Month {label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="font-medium">${entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Amortization Visualization</CardTitle>
        <CardDescription>
          Visual breakdown of your loan over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="balance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="balance">Balance Over Time</TabsTrigger>
            <TabsTrigger value="breakdown">Payment Breakdown</TabsTrigger>
            <TabsTrigger value="cumulative">Cumulative</TabsTrigger>
          </TabsList>

          {/* Balance Over Time */}
          <TabsContent value="balance" className="space-y-4">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sampledData}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={palette.data[0].hex} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={palette.data[0].hex} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: palette.text }}
                    stroke={palette.grid}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: palette.text }}
                    stroke={palette.grid}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke={palette.data[0].hex}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorBalance)"
                    name="Remaining Balance"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="text-sm text-gray-600 text-center">
              Your balance decreases over time as you make payments
            </div>
          </TabsContent>

          {/* Payment Breakdown */}
          <TabsContent value="breakdown" className="space-y-4">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sampledData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: palette.text }}
                    stroke={palette.grid}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: palette.text }}
                    stroke={palette.grid}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="principal"
                    stackId="payment"
                    fill={palette.positive.hex}
                    name="Principal"
                  />
                  <Bar
                    dataKey="interest"
                    stackId="payment"
                    fill={palette.negative.hex}
                    name="Interest"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-sm text-gray-600 text-center">
              Early payments are mostly interest; later payments are mostly principal
            </div>
          </TabsContent>

          {/* Cumulative */}
          <TabsContent value="cumulative" className="space-y-4">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sampledData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: palette.text }}
                    stroke={palette.grid}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: palette.text }}
                    stroke={palette.grid}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cumulativePrincipal"
                    stroke={palette.positive.hex}
                    strokeWidth={2}
                    dot={false}
                    name="Cumulative Principal"
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulativeInterest"
                    stroke={palette.negative.hex}
                    strokeWidth={2}
                    dot={false}
                    name="Cumulative Interest"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-sm text-gray-600 text-center">
              Total principal paid vs total interest paid over the life of the loan
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-teal-600">
              {schedule.length}
            </p>
            <p className="text-sm text-gray-500">Total Payments</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              ${Math.round(loan.currentBalance).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Principal</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              ${Math.round(chartData[chartData.length - 1]?.cumulativeInterest || 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Total Interest</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
