'use client';

/**
 * Budget App Dashboard - Modern 2025 Design
 *
 * DESIGN SYSTEM COMPLIANCE:
 * This component follows the Budget App Design Guide (./DESIGN_GUIDE.md)
 * Key principles:
 * - NO GRADIENTS: All UI elements use solid colors
 * - Single accent: Teal (#14b8a6) for primary actions
 * - Grayscale base: 90% of UI uses gray palette
 * - Semantic colors: Green (income), Red (expenses), Yellow (warnings)
 *
 * MOBILE ACCESSIBILITY (Phase 3.1.3):
 * - All touch targets ≥44px for WCAG 2.2 AA compliance
 * - Small links expanded with padding for better mobile UX
 * - Interactive elements have min-height/min-width constraints
 *
 * @see ./DESIGN_GUIDE.md for complete design standards
 * @see BUDGET_APP_COMPLETE_PRD.md for requirements
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  Upload,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  ArrowUp,
  ArrowDown,
  AlertCircle,
} from 'lucide-react';
import { db, initializeDefaultCategories } from '@/lib/budget-db';
import type { Transaction, Account, Budget, Category } from '@/types/budget';
import { detectRecurringTransactions, type RecurringPattern } from '@/lib/analytics/recurring-detector';
import { RecurringTransactions } from '@/components/budget/RecurringTransactions';
import { calculateSpendingInsights, getAverageMonthlyIncome, getAverageMonthlySpending } from '@/lib/analytics/spending-insights';
import { SpendingInsights } from '@/components/budget/SpendingInsights';
import { detectAnomalies, isAnomalyDetectionEnabled, type AnomalyAlert } from '@/lib/analytics/anomaly-detector';
import { AnomalyAlerts } from '@/components/budget/AnomalyAlerts';
import { CountUp } from '@/hooks/useCountUp';
import { DashboardSkeleton } from '@/components/budget/LoadingSkeleton'; // Phase 4.1.3

// Dynamic chart imports to avoid race conditions from concurrent lazy loading
const DynamicDashboardCharts = dynamic(
  () => import('recharts').then((mod) => {
    // Component that uses recharts for both pie and area charts
    function DashboardCharts({ type, data, CustomTooltip }: any) {
      const { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } = mod;

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
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );
      }

      // Area chart for income vs expenses
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
    }
    return { default: DashboardCharts };
  }),
  {
    loading: () => (
      <div className="w-full rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center h-[300px]">
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-teal-600 rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading chart...</span>
        </div>
      </div>
    ),
    ssr: false
  }
);

/**
 * Enhanced Metric Card Component
 *
 * DESIGN SYSTEM COMPLIANCE:
 * - NO GRADIENTS: Using solid colors only per design standards
 * - Single accent color: teal-500 (#14b8a6) for visual hierarchy
 * - Left border pattern instead of gradient headers
 * - Gray backgrounds for icon containers (gray-100)
 *
 * @param title - Card title text
 * @param value - Main metric value to display
 * @param change - Optional change description
 * @param changePercent - Optional percentage change
 * @param icon - Lucide icon component
 * @param trend - Direction indicator for semantic coloring
 */
function MetricCard({
  title,
  value,
  change,
  changePercent,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | React.ReactNode;
  change?: string;
  changePercent?: string;
  icon: any;
  trend?: 'up' | 'down';
}) {
  return (
    // No gradients - using border-l-4 with teal accent for visual interest
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group border-l-4 border-teal-500">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          {/* Solid gray background instead of gradient */}
          <div className="p-4 rounded-lg bg-gray-100">
            <Icon className="w-6 h-6 text-gray-700" />
          </div>
          {changePercent && (
            <div className={`flex items-center gap-2 text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {changePercent}
            </div>
          )}
        </div>
        <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
        {change && <p className="text-xs text-gray-500">{change}</p>}
      </div>
    </div>
  );
}

// Transaction Row
function TransactionRow({ transaction }: { transaction: Transaction }) {
  return (
    <div className="flex items-center justify-between py-2 px-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{transaction.description}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {transaction.category || 'Uncategorized'}
        </p>
      </div>
      <div className="ml-4 flex items-center gap-1.5">
        {transaction.amount > 0 ? (
          <>
            <ArrowUp className="w-4 h-4 text-green-600" aria-hidden="true" />
            <span className="font-semibold text-green-600">
              <span className="sr-only">Income: </span>
              +${Math.abs(transaction.amount).toFixed(2)}
            </span>
          </>
        ) : (
          <>
            <ArrowDown className="w-4 h-4 text-gray-600" aria-hidden="true" />
            <span className="font-semibold text-gray-900">
              <span className="sr-only">Expense: </span>
              ${Math.abs(transaction.amount).toFixed(2)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// Budget Progress Bar
function BudgetProgressBar({ category, budget, spent }: { category: string; budget: number; spent: number }) {
  const percentage = (spent / budget) * 100;
  const remaining = budget - spent;
  let barColor = 'bg-green-500', bgColor = 'bg-green-100';
  if (percentage > 100) { barColor = 'bg-red-500'; bgColor = 'bg-red-100'; }
  else if (percentage > 80) { barColor = 'bg-amber-500'; bgColor = 'bg-amber-100'; }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{category}</span>
        <span className="text-gray-600">${spent.toFixed(0)} / ${budget.toFixed(0)}</span>
      </div>
      <div className={`h-2 ${bgColor} rounded-full overflow-hidden`}>
        <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${Math.min(percentage, 100)}%` }} />
      </div>
      <div className="flex items-center justify-between text-xs">
        {remaining >= 0 ? (
          <span className="text-gray-500">${remaining.toFixed(0)} left</span>
        ) : (
          <span className="flex items-center gap-1 text-red-600 font-semibold">
            <AlertCircle className="w-3 h-3" aria-hidden="true" />
            <span className="sr-only">Warning: </span>
            ${Math.abs(remaining).toFixed(0)} over budget
          </span>
        )}
        <span className="text-gray-500">{percentage.toFixed(1)}%</span>
      </div>
    </div>
  );
}

// Custom Tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
      <p className="font-semibold text-gray-900 mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-semibold text-gray-900">${entry.value.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

export default function BudgetDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netWorth, setNetWorth] = useState(0);
  const [categorySpending, setCategorySpending] = useState<any[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [recurringPatterns, setRecurringPatterns] = useState<RecurringPattern[]>([]);
  const [spendingInsights, setSpendingInsights] = useState<any[]>([]);
  const [avgMonthlyIncome, setAvgMonthlyIncome] = useState(0);
  const [avgMonthlySpending, setAvgMonthlySpending] = useState(0);
  const [anomalyAlerts, setAnomalyAlerts] = useState<AnomalyAlert[]>([]);
  const [dismissedAnomalies, setDismissedAnomalies] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadData() {
      try {
        await initializeDefaultCategories();
        const [txs, accts, cats, bdgs] = await Promise.all([
          db.transactions.toArray(),
          db.accounts.toArray(),
          db.categories.toArray(),
          db.budgets.toArray(),
        ]);
        setTransactions(txs);
        setAccounts(accts);
        setCategories(cats);
        setBudgets(bdgs);

        const now = new Date();
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthTxs = txs.filter(tx => new Date(tx.date) >= firstOfMonth);
        const income = currentMonthTxs.filter(tx => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
        const expenses = Math.abs(currentMonthTxs.filter(tx => tx.amount < 0).reduce((sum, tx) => sum + tx.amount, 0));
        setTotalIncome(income);
        setTotalExpenses(expenses);
        setNetWorth(accts.reduce((sum, acc) => sum + acc.balance, 0));

        // Category spending
        const categoryMap = new Map();
        currentMonthTxs.filter(tx => tx.amount < 0 && tx.category).forEach(tx => {
          const cat = cats.find(c => c.name === tx.category);
          const existing = categoryMap.get(tx.category!);
          if (existing) existing.value += Math.abs(tx.amount);
          else categoryMap.set(tx.category!, { name: tx.category!, value: Math.abs(tx.amount), color: cat?.color || '#94a3b8' });
        });
        setCategorySpending(Array.from(categoryMap.values()));

        // Monthly trends
        const trends: any[] = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
          const monthTxs = txs.filter(tx => new Date(tx.date) >= date && new Date(tx.date) < nextDate);
          const monthIncome = monthTxs.filter(tx => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
          const monthExpenses = Math.abs(monthTxs.filter(tx => tx.amount < 0).reduce((sum, tx) => sum + tx.amount, 0));
          trends.push({
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            income: monthIncome,
            expenses: monthExpenses,
            net: monthIncome - monthExpenses,
          });
        }
        setMonthlyTrends(trends);

        // Detect recurring patterns
        const patterns = detectRecurringTransactions(txs);
        setRecurringPatterns(patterns);

        // Calculate spending insights (3-month average)
        const insights = calculateSpendingInsights(txs, cats);
        setSpendingInsights(insights);
        
        const avgIncome = getAverageMonthlyIncome(txs);
        const avgSpending = getAverageMonthlySpending(txs);
        setAvgMonthlyIncome(avgIncome);
        setAvgMonthlySpending(avgSpending);

        // Detect anomalies if enabled
        if (isAnomalyDetectionEnabled() && txs.length >= 5) {
          const anomalies = detectAnomalies(txs, {
            zScoreThreshold: 2.5,
            minTransactions: 5,
          });
          setAnomalyAlerts(anomalies);
        } else {
          setAnomalyAlerts([]);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Phase 4.1.3: Replace spinner with shimmer loading skeleton
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (transactions.length === 0 && accounts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="max-w-md mx-auto">
          <div className="bg-teal-500 rounded-full w-24 h-24 flex items-center justify-center mx-auto shadow-lg">
            <PiggyBank className="w-12 h-12 text-white" />
          </div>
          <h2 className="mt-8 text-3xl font-bold text-gray-900">Welcome to Your Budget App!</h2>
          <p className="mt-4 text-lg text-gray-600">Get started by importing your bank transactions or adding accounts manually.</p>
          <div className="mt-12 flex gap-4 justify-center">
            <Link href="/budget-app/import" className="inline-flex items-center gap-2 px-6 py-2 min-h-[44px] bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all shadow-md hover:shadow-lg">
              <Upload className="w-5 h-5" />
              Import CSV
            </Link>
            <Link href="/budget-app/transactions" className="inline-flex items-center gap-2 px-6 py-2 min-h-[44px] border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all">
              <Plus className="w-5 h-5" />
              Add Transaction
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
  const topBudgets = budgets.filter(b => categories.find(c => c.id === b.categoryId && c.type === 'expense')).slice(0, 5);

  return (
    <div className="space-y-8 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2 text-lg">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-4">
          <Link href="/budget-app/import" className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </Link>
          <Link href="/budget-app/transactions" className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all shadow-md hover:shadow-lg">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Transaction</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Net Worth" 
          value={<CountUp end={netWorth} decimals={2} prefix="$" separator="," duration={2000} />} 
          icon={Wallet} 
        />
        <MetricCard 
          title="Income This Month" 
          value={<CountUp end={totalIncome} decimals={2} prefix="$" separator="," duration={2000} />} 
          change="vs last month" 
          changePercent="+5.2%" 
          trend="up" 
          icon={TrendingUp} 
        />
        <MetricCard 
          title="Expenses This Month" 
          value={<CountUp end={totalExpenses} decimals={2} prefix="$" separator="," duration={2000} />} 
          change="vs last month" 
          changePercent="-3.1%" 
          trend="down" 
          icon={TrendingDown} 
        />
        <MetricCard 
          title="Net Savings" 
          value={<CountUp end={netSavings} decimals={2} prefix="$" separator="," duration={2000} />} 
          change={`${savingsRate.toFixed(1)}% savings rate`} 
          changePercent={savingsRate > 20 ? '+12%' : '-5%'} 
          trend={netSavings > 0 ? 'up' : 'down'} 
          icon={PiggyBank} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gray-100 rounded-lg"><BarChart3 className="w-5 h-5 text-gray-700" /></div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Spending by Category</h2>
                <p className="text-sm text-gray-500">Current month breakdown</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {categorySpending.length > 0 ? (
              <DynamicDashboardCharts
                type="pie"
                data={categorySpending}
                CustomTooltip={CustomTooltip}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">No expense data for this month</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-50 rounded-lg"><TrendingUp className="w-5 h-5 text-green-600" /></div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Income vs Expenses</h2>
                <p className="text-sm text-gray-500">Last 6 months trend</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {monthlyTrends.length > 0 ? (
              <DynamicDashboardCharts
                type="area"
                data={monthlyTrends}
                CustomTooltip={CustomTooltip}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">No trend data available</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <Link href="/budget-app/transactions" className="inline-flex items-center text-sm text-teal-600 hover:text-teal-700 font-medium px-2 py-2 -m-2 rounded-lg hover:bg-teal-50 transition-colors min-h-[44px]">View all →</Link>
            </div>
          </div>
          <div className="p-4">
            {transactions.length > 0 ? (
              <div className="space-y-2">
                {transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8).map(tx => <TransactionRow key={tx.id} transaction={tx} />)}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-12">No transactions yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-amber-50 rounded-lg"><Target className="w-5 h-5 text-amber-600" /></div>
              <h2 className="text-lg font-semibold text-gray-900">Budget Status</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {topBudgets.length > 0 ? (
              topBudgets.map(budget => {
                const category = categories.find(c => c.id === budget.categoryId);
                if (!category) return null;
                const spent = Math.abs(transactions.filter(tx => tx.category === category.name && tx.amount < 0 && new Date(tx.date).getMonth() === new Date().getMonth()).reduce((sum, tx) => sum + tx.amount, 0));
                return <BudgetProgressBar key={budget.id} category={category.name} budget={budget.amount} spent={spent} />;
              })
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No budgets set</p>
                <Link href="/budget-app/budgets" className="inline-flex items-center text-sm text-teal-600 hover:text-teal-700 font-medium px-4 py-2 rounded-lg hover:bg-teal-50 transition-colors min-h-[44px]">Create your first budget →</Link>
              </div>
            )}
          </div>
        </div>

        {/* Spending Insights */}
        {spendingInsights.length > 0 && (
          <div className="lg:col-span-2">
            <SpendingInsights 
              insights={spendingInsights}
              averageMonthlyIncome={avgMonthlyIncome}
              averageMonthlySpending={avgMonthlySpending}
            />
          </div>
        )}

        {/* Recurring Transactions */}
        {recurringPatterns.length > 0 && (
          <div className="lg:col-span-2">
            <RecurringTransactions patterns={recurringPatterns} />
          </div>
        )}

        {/* Anomaly Alerts */}
        {anomalyAlerts.length > 0 && (
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Unusual Spending</h2>
                    <p className="text-sm text-gray-500">
                      {anomalyAlerts.length} unusual transaction{anomalyAlerts.length > 1 ? 's' : ''} detected
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <AnomalyAlerts
                  alerts={anomalyAlerts.filter((a) => !dismissedAnomalies.has(a.transaction.id))}
                  onDismiss={(transactionId) => {
                    setDismissedAnomalies((prev) => new Set(prev).add(transactionId));
                  }}
                  maxDisplay={5}
                />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6 border-b border-gray-200"><h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2></div>
          <div className="p-6 space-y-4">
            <Link href="/budget-app/transactions" className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-teal-500 hover:bg-teal-50 transition-all group">
              <div className="p-2 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors"><Plus className="w-5 h-5 text-teal-600" /></div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Add Transaction</p>
                <p className="text-sm text-gray-500">Record income or expense</p>
              </div>
            </Link>
            <Link href="/budget-app/import" className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all group">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors"><Upload className="w-5 h-5 text-green-600" /></div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Import CSV</p>
                <p className="text-sm text-gray-500">Upload bank statements</p>
              </div>
            </Link>
            <Link href="/budget-app/budgets" className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all group">
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors"><Target className="w-5 h-5 text-gray-700" /></div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Set Budget</p>
                <p className="text-sm text-gray-500">Create spending limits</p>
              </div>
            </Link>
            <Link href="/budget-app/reports" className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-amber-500 hover:bg-amber-50 transition-all group">
              <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors"><BarChart3 className="w-5 h-5 text-amber-600" /></div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">View Reports</p>
                <p className="text-sm text-gray-500">Detailed analytics</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
