'use client';

/**
 * Budgets Page
 * Create and manage monthly/annual budgets by category
 */

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { db } from '@/lib/budget-db';
import type { Budget, Category, Transaction } from '@/types/budget';
import { detectOverspending } from '@/lib/analytics/overspending-detector';
import { OverspendingAlerts } from '@/components/budget/OverspendingAlerts';
import { useToast } from '@/components/budget/Toast';

interface CategoryBudgetData {
  category: Category;
  budget: Budget | null;
  spent: number;
  remaining: number;
  percentage: number;
  transactionCount: number;
}

export default function BudgetsPage() {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetData, setBudgetData] = useState<CategoryBudgetData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [overspendingAlerts, setOverspendingAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [cats, buds, txs] = await Promise.all([
        db.categories.toArray(),
        db.budgets.toArray(),
        db.transactions.toArray(),
      ]);

      setCategories(cats);
      setBudgets(buds);
      setTransactions(txs);

      // Calculate spending per category (current month)
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthTxs = txs.filter(tx => new Date(tx.date) >= firstOfMonth);

      const data: CategoryBudgetData[] = cats
        .filter(cat => cat.type === 'expense')
        .map(category => {
          const budget = buds.find(b => b.categoryId === category.id);
          const categoryTxs = currentMonthTxs.filter(tx => tx.category === category.name);
          const spent = Math.abs(categoryTxs.reduce((sum, tx) => sum + (tx.amount < 0 ? tx.amount : 0), 0));
          const budgetAmount = budget?.amount || 0;
          const remaining = budgetAmount - spent;
          const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

          return {
            category,
            budget: budget ?? null,
            spent,
            remaining,
            percentage,
            transactionCount: categoryTxs.length,
          };
        })
        .sort((a, b) => b.spent - a.spent);

      setBudgetData(data);

      // Detect overspending
      const alerts = detectOverspending(txs, buds, cats);
      setOverspendingAlerts(alerts);
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveBudget(categoryId: string, amount: number, period: 'monthly' | 'annual') {
    try {
      const existingBudget = budgets.find(b => b.categoryId === categoryId);

      if (existingBudget) {
        await db.budgets.update(existingBudget.id, {
          amount,
          period,
          updatedAt: new Date(),
        });
      } else {
        const newBudget: Budget = {
          id: `budget_${Date.now()}`,
          categoryId,
          amount,
          period,
          startDate: new Date(),
          endDate: null,
          rollover: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await db.budgets.add(newBudget);
      }

      await loadData();
      setShowAddModal(false);
      setEditingBudget(null);
    } catch (error) {
      console.error('Error saving budget:', error);
      alert('Failed to save budget');
    }
  }

  async function deleteBudget(budgetId: string) {
    const confirmed = await toast.confirm('Are you sure you want to delete this budget?');
    if (!confirmed) return;

    try {
      await db.budgets.delete(budgetId);
      await loadData();
      toast.success('Budget deleted successfully');
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget');
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading budgets...</p>
        </div>
      </div>
    );
  }

  const totalBudgeted = budgetData.reduce((sum, d) => sum + (d.budget?.amount || 0), 0);
  const totalSpent = budgetData.reduce((sum, d) => sum + d.spent, 0);
  const totalRemaining = totalBudgeted - totalSpent;
  const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
          <p className="text-gray-600 mt-2">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Budget
        </button>
      </div>

      {/* Overall Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600">Total Budgeted</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              ${totalBudgeted.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Spent</p>
            <p className="text-2xl font-bold text-red-600 mt-2">
              ${totalSpent.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Remaining</p>
            <p className={`text-2xl font-bold mt-2 ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${totalRemaining.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Overall Progress</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    overallPercentage < 80 ? 'bg-green-500' :
                    overallPercentage < 100 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(overallPercentage, 100)}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900 min-w-[3rem]">
                {overallPercentage.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overspending Alerts */}
      {overspendingAlerts.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">⚠️ Budget Alerts</h2>
          <OverspendingAlerts alerts={overspendingAlerts} />
        </div>
      )}

      {/* Budget Categories */}
      <div className="space-y-4">
        {budgetData.map((data) => (
          <div key={data.category.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${data.category.color}20` }}
                >
                  <div className="text-2xl">{getCategoryIcon(data.category.icon)}</div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{data.category.name}</h3>
                  <p className="text-sm text-gray-500">{data.transactionCount} transactions</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {data.budget && (
                  <>
                    <button
                      onClick={() => setEditingBudget(data.budget!)}
                      className="text-teal-600 hover:text-teal-700"
                      title="Edit budget"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteBudget(data.budget!.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete budget"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {data.budget ? (
              <div className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      ${data.spent.toFixed(2)} of ${data.budget.amount.toFixed(2)}
                    </span>
                    <span className={`text-sm font-semibold ${
                      data.percentage < 80 ? 'text-green-600' :
                      data.percentage < 100 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {data.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        data.percentage < 80 ? 'bg-green-500' :
                        data.percentage < 100 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(data.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Status Message */}
                <div className="flex items-center gap-2">
                  {data.remaining >= 0 ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <p className="text-sm text-green-600 font-medium">
                        ${data.remaining.toFixed(2)} remaining
                      </p>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <p className="text-sm text-red-600 font-medium">
                        ${Math.abs(data.remaining).toFixed(2)} over budget
                      </p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setEditingBudget({
                    id: `budget_${Date.now()}`,
                    categoryId: data.category.id,
                    amount: 0,
                    period: 'monthly',
                    startDate: new Date(),
                    endDate: null,
                    rollover: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  });
                }}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-teal-500 hover:text-teal-600 transition-colors"
              >
                + Set Budget
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Budget Modal */}
      {(showAddModal || editingBudget) && (
        <BudgetModal
          categories={categories.filter(c => c.type === 'expense')}
          budget={editingBudget}
          onSave={saveBudget}
          onClose={() => {
            setShowAddModal(false);
            setEditingBudget(null);
          }}
        />
      )}
    </div>
  );
}

// Helper function to get category icon
function getCategoryIcon(iconName: string): string {
  const icons: Record<string, string> = {
    'utensils': '🍴',
    'car': '🚗',
    'file-text': '📄',
    'shopping-bag': '🛍️',
    'tv': '📺',
    'heart': '❤️',
    'home': '🏠',
    'dollar-sign': '💰',
    'trending-up': '📈',
    'book': '📚',
    'paw': '🐾',
    'plane': '✈️',
    'more-horizontal': '⋯',
  };
  return icons[iconName] || '📊';
}

// Budget Modal Component
function BudgetModal({
  categories,
  budget,
  onSave,
  onClose,
}: {
  categories: Category[];
  budget: Budget | null;
  onSave: (categoryId: string, amount: number, period: 'monthly' | 'annual') => void;
  onClose: () => void;
}) {
  const toast = useToast();
  const [selectedCategory, setSelectedCategory] = useState(budget?.categoryId || categories[0]?.id || '');
  const [amount, setAmount] = useState(budget?.amount.toString() || '');
  const [period, setPeriod] = useState<'monthly' | 'annual'>(budget?.period || 'monthly');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.warning('Please enter a valid amount');
      return;
    }
    onSave(selectedCategory, amountNum, period);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {budget ? 'Edit Budget' : 'Add Budget'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              disabled={!!budget}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as 'monthly' | 'annual')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Save Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
