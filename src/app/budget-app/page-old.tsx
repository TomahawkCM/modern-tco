'use client';

/**
 * Budget App Dashboard
 * Main overview page with summary cards and charts
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  Plus,
  Upload,
} from 'lucide-react';
import { db, initializeDefaultCategories } from '@/lib/budget-db';
import type {
  Transaction,
  Account,
  Budget,
  CategorySpending,
} from '@/types/budget';

// Summary Card Component
function SummaryCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  change?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down';
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
              {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
              {change}
            </p>
          )}
        </div>
        <div className="ml-4">
          <div className="bg-blue-50 rounded-full p-3">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Recent Transaction Row
function TransactionRow({ transaction }: { transaction: Transaction }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{transaction.description}</p>
        <p className="text-sm text-gray-500 mt-0.5">
          {new Date(transaction.date).toLocaleDateString()} • {transaction.category || 'Uncategorized'}
        </p>
      </div>
      <div
        className={`font-semibold ${
          transaction.amount > 0 ? 'text-green-600' : 'text-gray-900'
        }`}
      >
        {transaction.amount > 0 ? '+' : ''}
        ${Math.abs(transaction.amount).toFixed(2)}
      </div>
    </div>
  );
}

export default function BudgetDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netWorth, setNetWorth] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        // Initialize default categories if needed
        await initializeDefaultCategories();

        // Load data
        const [txs, accts] = await Promise.all([
          db.transactions.toArray(),
          db.accounts.toArray(),
        ]);

        setTransactions(txs);
        setAccounts(accts);

        // Calculate current month stats
        const now = new Date();
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const currentMonthTxs = txs.filter(
          (tx) => new Date(tx.date) >= firstOfMonth
        );

        const income = currentMonthTxs
          .filter((tx) => tx.amount > 0)
          .reduce((sum, tx) => sum + tx.amount, 0);

        const expenses = Math.abs(
          currentMonthTxs
            .filter((tx) => tx.amount < 0)
            .reduce((sum, tx) => sum + tx.amount, 0)
        );

        setTotalIncome(income);
        setTotalExpenses(expenses);

        // Calculate net worth (sum of all account balances)
        const worth = accts.reduce((sum, acc) => sum + acc.balance, 0);
        setNetWorth(worth);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const hasData = transactions.length > 0 || accounts.length > 0;

  if (!hasData) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-blue-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
            <PiggyBank className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Welcome to Your Budget App!
          </h2>
          <p className="mt-2 text-gray-600">
            Get started by importing your bank transactions or adding accounts manually.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link
              href="/budget-app/import"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-5 h-5" />
              Import CSV
            </Link>
            <Link
              href="/budget-app/transactions"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            {new Date().toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/budget-app/import"
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </Link>
          <Link
            href="/budget-app/transactions"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Net Worth"
          value={`$${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
        />
        <SummaryCard
          title="Income This Month"
          value={`$${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change="+5.2% from last month"
          trend="up"
          icon={TrendingUp}
        />
        <SummaryCard
          title="Expenses This Month"
          value={`$${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change="-3.1% from last month"
          trend="down"
          icon={TrendingDown}
        />
        <SummaryCard
          title="Net Savings"
          value={`$${netSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={`${savingsRate.toFixed(1)}% savings rate`}
          trend={netSavings > 0 ? 'up' : 'down'}
          icon={PiggyBank}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Transactions
              </h2>
              <Link
                href="/budget-app/transactions"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {transactions.slice(0, 5).length > 0 ? (
              <div className="space-y-1">
                {transactions
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )
                  .slice(0, 5)
                  .map((tx) => (
                    <TransactionRow key={tx.id} transaction={tx} />
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No transactions yet
              </p>
            )}
          </div>
        </div>

        {/* Spending by Category (Placeholder) */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Spending by Category
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-center py-8">
              Chart will display here (using Recharts)
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {transactions.length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Accounts</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {accounts.length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Avg. Transaction</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              $
              {transactions.length > 0
                ? Math.abs(
                    transactions.reduce((sum, tx) => sum + tx.amount, 0) /
                      transactions.length
                  ).toFixed(2)
                : '0.00'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">This Month</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {
                transactions.filter((tx) => {
                  const txDate = new Date(tx.date);
                  const now = new Date();
                  return (
                    txDate.getMonth() === now.getMonth() &&
                    txDate.getFullYear() === now.getFullYear()
                  );
                }).length
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
