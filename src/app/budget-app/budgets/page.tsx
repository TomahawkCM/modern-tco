"use client";

/**
 * Budgets Page
 * Create and manage monthly/annual budgets by category
 */

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { db } from "@/lib/budget-db";
import type { Budget, Category, Transaction } from "@/types/budget";
import { sumAmounts, subtractAmounts } from "@/lib/money";
import { detectOverspending } from "@/lib/analytics/overspending-detector";
import { OverspendingAlerts } from "@/components/budget/OverspendingAlerts";
import { ConfirmDialog } from "@/components/budget/ConfirmDialog";
import { useToast } from "@/components/budget/Toast";
import { HelpTooltip } from "@/components/budget/HelpTooltip";
import { PullToRefresh } from "@/components/budget/layout/PullToRefresh";

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

  // Confirmation dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingBudget, setDeletingBudget] = useState<{
    budget: Budget;
    data: CategoryBudgetData;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [cats, buds, allTxs] = await Promise.all([
        db.categories.toArray(),
        db.budgets.toArray(),
        db.transactions.toArray(),
      ]);

      // Filter out parent transactions that have been split
      // Only count child transactions (which have splitFromId) and non-split transactions
      // This prevents double-counting when a transaction is split
      const txs = allTxs.filter((tx) => !tx.isSplit);

      setCategories(cats);
      setBudgets(buds);
      setTransactions(txs);

      // Calculate spending per category (current month)
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthTxs = txs.filter((tx) => new Date(tx.date) >= firstOfMonth);

      const data: CategoryBudgetData[] = cats
        .filter((cat) => cat.type === "expense")
        .map((category) => {
          const budget = buds.find((b) => b.categoryId === category.id);
          const categoryTxs = currentMonthTxs.filter((tx) => tx.category === category.name);
          const spent = Math.abs(
            sumAmounts(categoryTxs.filter((tx) => tx.amount < 0).map((tx) => tx.amount))
          );
          const budgetAmount = budget?.amount || 0;
          const remaining = subtractAmounts(budgetAmount, spent);
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
      console.error("Error loading budgets:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveBudget(
    categoryId: string,
    amount: number,
    period: "monthly" | "annual",
    rollover: boolean
  ) {
    try {
      const existingBudget = budgets.find((b) => b.categoryId === categoryId);

      if (existingBudget) {
        await db.budgets.update(existingBudget.id, {
          amount,
          period,
          rollover,
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
          rollover,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await db.budgets.add(newBudget);
      }

      await loadData();
      setShowAddModal(false);
      setEditingBudget(null);
    } catch (error) {
      console.error("Error saving budget:", error);
      alert("Failed to save budget");
    }
  }

  function initiateDeleteBudget(budget: Budget, data: CategoryBudgetData) {
    setDeletingBudget({ budget, data });
    setDeleteConfirmOpen(true);
  }

  async function confirmDeleteBudget() {
    if (!deletingBudget) return;

    try {
      await db.budgets.delete(deletingBudget.budget.id);
      await loadData();
      toast.success("Budget deleted successfully");
      setDeleteConfirmOpen(false);
      setDeletingBudget(null);
    } catch (error) {
      console.error("Error deleting budget:", error);
      toast.error("Failed to delete budget");
      // Keep dialog open on error
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading budgets...</p>
        </div>
      </div>
    );
  }

  const totalBudgeted = sumAmounts(budgetData.map((d) => d.budget?.amount || 0));
  const totalSpent = sumAmounts(budgetData.map((d) => d.spent));
  const totalRemaining = subtractAmounts(totalBudgeted, totalSpent);
  const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  return (
    <PullToRefresh onRefresh={loadData}>
    <div className="space-y-6">
      {/* Header - Enhanced */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-white">Budgets</h1>
            <HelpTooltip
              content="Set spending limits for each category. Track your progress with color-coded alerts: Green = On Track, Yellow = Warning (80%), Red = Over Budget (100%)."
              learnMoreUrl="/docs/user-guide#budgets"
              ariaLabel="More information about budgets"
              iconSize="h-5 w-5"
            />
          </div>
          <p className="mt-2 text-lg font-medium text-slate-400">
            {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-teal-500 px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-teal-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          <Plus className="h-5 w-5" />
          Add Budget
        </button>
      </div>

      {/* Overall Summary - Enhanced */}
      <div className="rounded-lg border-l-4 border-teal-500 bg-white p-8 shadow-md">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div>
            <p className="mb-2 text-base font-medium text-gray-700">Total Budgeted</p>
            <p className="text-3xl font-bold text-gray-900">${totalBudgeted.toFixed(2)}</p>
          </div>
          <div>
            <p className="mb-2 text-base font-medium text-gray-700">Total Spent</p>
            <p className="flex items-center gap-2 text-3xl font-bold text-red-600">
              <TrendingDown className="h-6 w-6" aria-hidden="true" />
              <span className="sr-only">Total expenses: </span>${totalSpent.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="mb-2 text-base font-medium text-gray-700">Remaining</p>
            <p
              className={`flex items-center gap-2 text-3xl font-bold ${totalRemaining >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {totalRemaining >= 0 ? (
                <TrendingUp className="h-6 w-6" aria-hidden="true" />
              ) : (
                <AlertCircle className="h-6 w-6" aria-hidden="true" />
              )}
              ${Math.abs(totalRemaining).toFixed(2)}
            </p>
          </div>
          <div>
            <div className="mb-2 flex items-center gap-2">
              <p className="text-base font-medium text-gray-700">Overall Progress</p>
              <HelpTooltip
                content={
                  <>
                    <strong>Budget Progress:</strong> Green (✓ On Track) = 0-79% spent. Yellow (⚠
                    Warning) = 80-99% spent. Red (✖ Over) = 100%+ spent. Colors update
                    automatically as you spend.
                  </>
                }
                learnMoreUrl="/docs/user-guide#budget-progress"
                ariaLabel="More information about budget progress and alert thresholds"
              />
            </div>
            <div className="space-y-2">
              <div className="h-6 overflow-hidden rounded-full bg-gray-200 shadow-inner">
                <div
                  className={`h-full transition-all ${
                    overallPercentage < 80
                      ? "bg-green-500"
                      : overallPercentage < 100
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min(overallPercentage, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-xl font-bold ${
                    overallPercentage < 80
                      ? "text-green-600"
                      : overallPercentage < 100
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {overallPercentage.toFixed(0)}%
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    overallPercentage < 80
                      ? "bg-green-100 text-green-700"
                      : overallPercentage < 100
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {overallPercentage < 80
                    ? "✓ On Track"
                    : overallPercentage < 100
                      ? "⚠ Warning"
                      : "✖ Over"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overspending Alerts */}
      {overspendingAlerts.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">⚠️ Budget Alerts</h2>
          <OverspendingAlerts alerts={overspendingAlerts} />
        </div>
      )}

      {/* Budget Categories - Modern responsive design */}
      <div className="space-y-4">
        {budgetData.map((data) => (
          <div
            key={data.category.id}
            className="rounded-lg border-l-4 bg-white p-6 shadow transition-shadow hover:shadow-md"
            style={{ borderLeftColor: data.category.color }}
          >
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full shadow-sm"
                  style={{ backgroundColor: `${data.category.color}20` }}
                >
                  <div className="text-3xl">{getCategoryIcon(data.category.icon)}</div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{data.category.name}</h3>
                  <p className="text-base font-medium text-gray-600">
                    {data.transactionCount} transactions
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {data.budget && (
                  <>
                    <button
                      onClick={() => setEditingBudget(data.budget)}
                      className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-lg p-3 text-teal-600 transition-colors hover:bg-teal-50 hover:text-teal-700"
                      title="Edit budget"
                      aria-label="Edit budget"
                    >
                      <Edit className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => initiateDeleteBudget(data.budget!, data)}
                      className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-lg p-3 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                      title="Delete budget"
                      aria-label="Delete budget"
                    >
                      <Trash2 className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {data.budget ? (
              <div className="space-y-5">
                {/* Progress Bar - Enhanced */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-base font-semibold text-gray-700">
                      ${data.spent.toFixed(2)} <span className="font-normal text-gray-500">of</span>{" "}
                      ${data.budget.amount.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xl font-bold ${
                          data.percentage < 80
                            ? "text-green-600"
                            : data.percentage < 100
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {data.percentage.toFixed(0)}%
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${
                          data.percentage < 80
                            ? "bg-green-100 text-green-700"
                            : data.percentage < 100
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {data.percentage < 80
                          ? "✓ On Track"
                          : data.percentage < 100
                            ? "⚠ Warning"
                            : "✖ Over"}
                      </span>
                    </div>
                  </div>
                  <div className="h-6 overflow-hidden rounded-full bg-gray-200 shadow-inner">
                    <div
                      className={`h-full transition-all ${
                        data.percentage < 80
                          ? "bg-green-500"
                          : data.percentage < 100
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(data.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Status Message - Enhanced */}
                <div className="flex items-center gap-3 border-t-2 border-gray-100 pt-2">
                  {data.remaining >= 0 ? (
                    <>
                      <TrendingUp className="h-6 w-6 flex-shrink-0 text-green-600" />
                      <p className="text-base font-semibold text-green-700">
                        ${data.remaining.toFixed(2)} remaining this month
                      </p>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-600" />
                      <p className="text-base font-semibold text-red-700">
                        ${Math.abs(data.remaining).toFixed(2)} over budget this month
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
                    period: "monthly",
                    startDate: new Date(),
                    endDate: null,
                    rollover: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  });
                }}
                className="min-h-[48px] w-full rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-base font-semibold text-gray-600 transition-all hover:border-teal-500 hover:bg-teal-50 hover:text-teal-600 hover:shadow-md"
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
          categories={categories.filter((c) => c.type === "expense")}
          budget={editingBudget}
          onSave={saveBudget}
          onClose={() => {
            setShowAddModal(false);
            setEditingBudget(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDeleteBudget}
        title="Delete Budget"
        description="This will remove the budget limit for this category. Transactions will not be deleted."
        impact={
          deletingBudget
            ? {
                title: "You will lose:",
                items: [
                  `${deletingBudget.data.category.name}: $${deletingBudget.budget.amount.toFixed(2)}/${deletingBudget.budget.period}`,
                  `Current progress: ${deletingBudget.data.percentage.toFixed(0)}% spent ($${deletingBudget.data.spent.toFixed(2)})`,
                  `${deletingBudget.data.transactionCount} transaction${deletingBudget.data.transactionCount === 1 ? "" : "s"} will become unbudgeted`,
                  deletingBudget.data.remaining < 0
                    ? `Currently ${Math.abs(deletingBudget.data.remaining).toFixed(2)} over budget`
                    : `$${deletingBudget.data.remaining.toFixed(2)} remaining budget`,
                ],
              }
            : undefined
        }
        confirmLabel="Delete Budget"
        variant="destructive"
        icon={<Trash2 className="h-5 w-5" />}
      />
    </div>
    </PullToRefresh>
  );
}

// Helper function to get category icon
function getCategoryIcon(iconName: string): string {
  const icons: Record<string, string> = {
    utensils: "🍴",
    car: "🚗",
    "file-text": "📄",
    "shopping-bag": "🛍️",
    tv: "📺",
    heart: "❤️",
    home: "🏠",
    "dollar-sign": "💰",
    "trending-up": "📈",
    book: "📚",
    paw: "🐾",
    plane: "✈️",
    "more-horizontal": "⋯",
  };
  return icons[iconName] || "📊";
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
  onSave: (
    categoryId: string,
    amount: number,
    period: "monthly" | "annual",
    rollover: boolean
  ) => void;
  onClose: () => void;
}) {
  const toast = useToast();
  const [selectedCategory, setSelectedCategory] = useState(
    budget?.categoryId || categories[0]?.id || ""
  );
  const [amount, setAmount] = useState(budget?.amount.toString() || "");
  const [period, setPeriod] = useState<"monthly" | "annual">(budget?.period || "monthly");
  const [rollover, setRollover] = useState(budget?.rollover || false);

  // Handle Escape key to close modal (Task 2.2.3)
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.warning("Please enter a valid amount");
      return;
    }
    onSave(selectedCategory, amountNum, period, rollover);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {budget ? "Edit Budget" : "Add Budget"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              disabled={!!budget}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full rounded-lg border border-gray-300 py-2 pl-8 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                required
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <label className="block text-sm font-medium text-gray-700">Period</label>
              <HelpTooltip
                content="Monthly budgets reset each month. Annual budgets divide the total across 12 months. Example: $1,200 annual = $100 per month."
                learnMoreUrl="/docs/user-guide#budget-period"
                ariaLabel="More information about budget periods"
              />
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as "monthly" | "annual")}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </div>

          {/* Rollover Setting */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="rollover"
                checked={rollover}
                onChange={(e) => setRollover(e.target.checked)}
                className="h-5 w-5 cursor-pointer rounded border-gray-300 text-teal-600 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              />
              <label
                htmlFor="rollover"
                className="cursor-pointer text-sm font-medium text-gray-700"
              >
                Carry over unused budget to next month
              </label>
              <HelpTooltip
                content={
                  <>
                    <strong>What is budget rollover?</strong>
                    <br />
                    When enabled, any unspent money from this budget carries over to the next month.
                    <br />
                    <br />
                    <strong>Example:</strong>
                    <br />
                    • Budget: $500/month
                    <br />
                    • Spent: $400
                    <br />
                    • Leftover: $100
                    <br />• Next month starts with: $600 ($500 + $100 leftover)
                  </>
                }
                learnMoreUrl="/docs/user-guide#budget-rollover"
                ariaLabel="More information about budget rollover"
              />
            </div>
            <p className="ml-8 text-xs text-gray-500">
              {rollover
                ? "Leftover funds will be added to next month's budget"
                : "Budget resets each month regardless of spending"}
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-teal-600 px-4 py-2 text-white transition-colors hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              Save Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
