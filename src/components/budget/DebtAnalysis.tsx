/**
 * Debt Analysis Component
 * Comprehensive debt analytics for the reports page
 */

'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { TrendingDown, DollarSign, Calendar, Percent, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { Loan } from '@/types/budget';
import {
  getAllLoans,
  calculateTotalDebt,
  calculateMonthlyObligations,
  getDebtBreakdown,
  getWeightedAverageRate,
  estimateDebtFreeDate,
} from '@/lib/loans/loan-db';
import { generateAmortizationSchedule } from '@/lib/loans/calculations';
import { format, addMonths } from 'date-fns';

export function DebtAnalysis() {
  const t = useTranslations('debtAnalysis');
  const [loans, setLoans] = useState<Loan[]>([]);
  const [totalDebt, setTotalDebt] = useState(0);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [avgRate, setAvgRate] = useState(0);
  const [debtFreeDate, setDebtFreeDate] = useState<Date | null>(null);
  const [breakdown, setBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDebtData();
  }, []);

  async function loadDebtData() {
    try {
      setLoading(true);
      const allLoans = await getAllLoans();
      const debt = await calculateTotalDebt();
      const payment = await calculateMonthlyObligations();
      const rate = await getWeightedAverageRate();
      const freeDate = await estimateDebtFreeDate();
      const debtBreakdown = await getDebtBreakdown();

      setLoans(allLoans);
      setTotalDebt(debt);
      setMonthlyPayment(payment);
      setAvgRate(rate);
      setDebtFreeDate(freeDate);
      setBreakdown(debtBreakdown);
    } catch (error) {
      console.error('Error loading debt data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Don't show if no loans
  if (loans.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <DollarSign className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('empty.title')}</h3>
          <p className="text-gray-500 text-center max-w-md mb-6">
            {t('empty.description')}
          </p>
          <Link href="/budget-app/loans/new">
            <Button className="bg-teal-600 hover:bg-teal-700">{t('empty.addFirstLoan')}</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for charts
  const pieData = breakdown.map(item => ({
    name: item.type,
    value: item.totalBalance,
    count: item.count,
  }));

  const COLORS = {
    mortgage: '#3b82f6',
    auto: '#10b981',
    personal: '#8b5cf6',
    student: '#f59e0b',
  };

  // Generate payoff projection (next 12 months)
  const payoffProjection = [];
  const activeLoans = loans.filter(l => l.status === 'active');

  for (let month = 0; month <= 12; month++) {
    const projectionDate = addMonths(new Date(), month);
    let totalBalance = 0;

    activeLoans.forEach(loan => {
      const schedule = generateAmortizationSchedule(
        loan.currentBalance,
        loan.interestRate,
        loan.termMonths,
        loan.startDate,
        loan.monthlyPayment
      );

      // Find balance at projection date
      const entry = schedule.find(e => e.date >= projectionDate) || schedule[schedule.length - 1];
      totalBalance += entry?.balance || 0;
    });

    payoffProjection.push({
      month: format(projectionDate, 'MMM yy'),
      balance: Math.round(totalBalance),
    });
  }

  // Loan comparison data
  const loanComparison = activeLoans.map(loan => ({
    name: loan.name,
    balance: loan.currentBalance,
    payment: loan.monthlyPayment,
    rate: loan.interestRate,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        {payload.map((entry: any, index: number) => (
          <div key={index}>
            <p className="font-semibold text-gray-900 mb-1">{entry.name}</p>
            <p className="text-sm" style={{ color: entry.color }}>
              ${entry.value?.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
          <p className="text-gray-500 mt-1">{t('subtitle')}</p>
        </div>
        <Link href="/budget-app/loans">
          <Button variant="outline">{t('viewAllLoans')}</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('cards.totalDebt.title')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalDebt.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('cards.totalDebt.subtitle', { count: loans.filter(l => l.status === 'active').length })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('cards.monthlyPayment.title')}</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyPayment.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('cards.monthlyPayment.subtitle')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('cards.avgRate.title')}</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('cards.avgRate.subtitle')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('cards.debtFreeDate.title')}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {debtFreeDate ? format(debtFreeDate, 'MMM yyyy') : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('cards.debtFreeDate.subtitle')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Debt Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('charts.byType.title')}</CardTitle>
            <CardDescription>{t('charts.byType.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {breakdown.map(item => (
                <div key={item.type} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[item.type as keyof typeof COLORS] }}
                  />
                  <span className="text-sm text-gray-600 capitalize">{item.type}</span>
                  <span className="text-sm font-semibold text-gray-900 ml-auto">
                    ${item.totalBalance.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payoff Projection */}
        <Card>
          <CardHeader>
            <CardTitle>{t('charts.projection.title')}</CardTitle>
            <CardDescription>{t('charts.projection.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={payoffProjection}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#999" />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="#999"
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    dot={{ fill: '#14b8a6', r: 4 }}
                    name="Total Debt"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="text-sm text-gray-600 text-center mt-4">
              {t('charts.projection.expectedReduction', { amount: `$${(payoffProjection[0]?.balance - payoffProjection[12]?.balance).toLocaleString()}` })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loan Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('comparison.title')}</CardTitle>
          <CardDescription>{t('comparison.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-700">{t('comparison.headers.loan')}</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">{t('comparison.headers.balance')}</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">{t('comparison.headers.monthlyPayment')}</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">{t('comparison.headers.interestRate')}</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-700">{t('comparison.headers.percentOfTotal')}</th>
                </tr>
              </thead>
              <tbody>
                {loanComparison.map((loan, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{loan.name}</td>
                    <td className="px-4 py-3 text-right text-gray-900">${loan.balance.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-gray-900">${loan.payment.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-gray-900">{loan.rate.toFixed(2)}%</td>
                    <td className="px-4 py-3 text-right font-semibold text-teal-600">
                      {((loan.balance / totalDebt) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-4 py-3 text-gray-900">{t('comparison.total')}</td>
                  <td className="px-4 py-3 text-right text-gray-900">${totalDebt.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-gray-900">${monthlyPayment.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-gray-900">{avgRate.toFixed(2)}%</td>
                  <td className="px-4 py-3 text-right text-gray-900">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
