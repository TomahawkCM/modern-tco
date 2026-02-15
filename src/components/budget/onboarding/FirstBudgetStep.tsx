/**
 * First Budget Step - Onboarding Wizard
 * Create first budget with spending-based suggestions
 */

"use client";

import { cn } from "@/lib/utils";
import { ArrowRight, Check, DollarSign, Minus, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { useCallback, useState } from "react";
import type { StepProps } from "./OnboardingWizard";

// Demo spending averages (would come from imported transactions in real app)
const SUGGESTED_BUDGETS = [
  { id: "food", name: "Food & Dining", icon: "🍽️", average: 450, suggested: 400, color: "#10b981" },
  {
    id: "transport",
    name: "Transportation",
    icon: "🚗",
    average: 280,
    suggested: 250,
    color: "#3b82f6",
  },
  {
    id: "bills",
    name: "Bills & Utilities",
    icon: "📄",
    average: 350,
    suggested: 350,
    color: "#ef4444",
  },
  { id: "shopping", name: "Shopping", icon: "🛍️", average: 200, suggested: 150, color: "#8b5cf6" },
  {
    id: "entertainment",
    name: "Entertainment",
    icon: "🎬",
    average: 120,
    suggested: 100,
    color: "#f59e0b",
  },
  {
    id: "health",
    name: "Health & Fitness",
    icon: "💪",
    average: 80,
    suggested: 80,
    color: "#06b6d4",
  },
];

interface BudgetItem {
  id: string;
  name: string;
  icon: string;
  amount: number;
  average: number;
  color: string;
  included: boolean;
}

export function FirstBudgetStep({ onComplete, onSkip }: StepProps) {
  const [budgets, setBudgets] = useState<BudgetItem[]>(
    SUGGESTED_BUDGETS.map((b) => ({
      id: b.id,
      name: b.name,
      icon: b.icon,
      amount: b.suggested,
      average: b.average,
      color: b.color,
      included: true,
    }))
  );
  const [monthlyIncome, setMonthlyIncome] = useState(5000);

  const totalBudget = budgets.filter((b) => b.included).reduce((sum, b) => sum + b.amount, 0);

  const remainingAfterBudget = monthlyIncome - totalBudget;
  const savingsRate = monthlyIncome > 0 ? (remainingAfterBudget / monthlyIncome) * 100 : 0;

  const handleAmountChange = useCallback((id: string, delta: number) => {
    setBudgets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, amount: Math.max(0, b.amount + delta) } : b))
    );
  }, []);

  const handleToggleIncluded = useCallback((id: string) => {
    setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, included: !b.included } : b)));
  }, []);

  const handleComplete = useCallback(() => {
    const includedBudgets = budgets.filter((b) => b.included);
    onComplete({ budgetsCreated: includedBudgets.length });
  }, [budgets, onComplete]);

  return (
    <div className="space-y-6">
      {/* Monthly Income Input */}
      <div className="rounded-xl border border-green-500/20 bg-gradient-to-r from-green-500/10 to-teal-500/10 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Monthly Income</p>
            <p className="text-xs text-slate-500">Used to calculate savings rate</p>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-400" />
            <input
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(Math.max(0, parseInt(e.target.value) || 0))}
              className={cn(
                "w-28 px-3 py-2 text-right text-lg font-semibold",
                "rounded-lg border border-white/10 bg-slate-800/50",
                "text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              )}
            />
          </div>
        </div>
      </div>

      {/* Budget Categories */}
      <div className="max-h-[220px] space-y-2 overflow-y-auto pr-2">
        {budgets.map((budget) => {
          const isOverAverage = budget.amount > budget.average;
          const isUnderAverage = budget.amount < budget.average * 0.8;

          return (
            <div
              key={budget.id}
              className={cn(
                "flex items-center gap-4 rounded-xl p-3",
                "border bg-slate-800/50 transition-all",
                budget.included ? "border-white/10" : "border-transparent opacity-50"
              )}
            >
              {/* Toggle Checkbox */}
              <button
                type="button"
                onClick={() => handleToggleIncluded(budget.id)}
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2",
                  "transition-colors",
                  budget.included
                    ? "border-teal-500 bg-teal-500"
                    : "border-slate-600 hover:border-slate-500"
                )}
              >
                {budget.included && <Check className="h-3 w-3 text-white" />}
              </button>

              {/* Category Icon */}
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg"
                style={{ backgroundColor: `${budget.color}20` }}
              >
                {budget.icon}
              </div>

              {/* Category Name & Average */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">{budget.name}</p>
                <p className="text-xs text-slate-500">
                  Avg: ${budget.average}/mo
                  {isOverAverage && (
                    <span className="ml-2 text-amber-400">
                      <TrendingUp className="inline h-3 w-3" /> Above avg
                    </span>
                  )}
                  {isUnderAverage && (
                    <span className="ml-2 text-green-400">
                      <TrendingDown className="inline h-3 w-3" /> Saving!
                    </span>
                  )}
                </p>
              </div>

              {/* Amount Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAmountChange(budget.id, -25)}
                  disabled={!budget.included || budget.amount <= 0}
                  className={cn(
                    "rounded-lg p-1.5 transition-colors",
                    budget.included && budget.amount > 0
                      ? "text-slate-400 hover:bg-white/10 hover:text-white"
                      : "cursor-not-allowed text-slate-600"
                  )}
                >
                  <Minus className="h-4 w-4" />
                </button>

                <div className="w-20 text-center">
                  <span className="font-medium text-white">${budget.amount}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAmountChange(budget.id, 25)}
                  disabled={!budget.included}
                  className={cn(
                    "rounded-lg p-1.5 transition-colors",
                    budget.included
                      ? "text-slate-400 hover:bg-white/10 hover:text-white"
                      : "cursor-not-allowed text-slate-600"
                  )}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 rounded-xl bg-slate-800/30 p-4">
        <div className="text-center">
          <p className="mb-1 text-xs text-slate-400">Total Budget</p>
          <p className="text-lg font-semibold text-white">${totalBudget}</p>
        </div>
        <div className="border-x border-white/10 text-center">
          <p className="mb-1 text-xs text-slate-400">Remaining</p>
          <p
            className={cn(
              "text-lg font-semibold",
              remainingAfterBudget >= 0 ? "text-green-400" : "text-red-400"
            )}
          >
            ${remainingAfterBudget}
          </p>
        </div>
        <div className="text-center">
          <p className="mb-1 text-xs text-slate-400">Savings Rate</p>
          <p
            className={cn(
              "text-lg font-semibold",
              savingsRate >= 20
                ? "text-green-400"
                : savingsRate >= 10
                  ? "text-amber-400"
                  : "text-red-400"
            )}
          >
            {savingsRate.toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Savings Recommendation */}
      {savingsRate < 20 && remainingAfterBudget >= 0 && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
          <p className="text-sm text-amber-300">
            💡 Tip: Aim for 20% savings rate. Consider reducing shopping or entertainment budgets.
          </p>
        </div>
      )}

      {savingsRate >= 20 && (
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3">
          <p className="text-sm text-green-300">
            🎉 Great job! You&apos;re saving {savingsRate.toFixed(0)}% of your income.
          </p>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleComplete}
          className={cn(
            "flex items-center gap-2 rounded-lg px-6 py-2 font-medium",
            "bg-gradient-to-r from-teal-500 to-blue-500 text-white",
            "transition-opacity hover:opacity-90"
          )}
        >
          Create Budget
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default FirstBudgetStep;
