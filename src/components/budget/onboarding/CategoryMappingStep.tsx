/**
 * Category Mapping Step - Onboarding Wizard
 * Bulk categorization with auto-suggestions and vendor learning
 */

"use client";

import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Lightbulb,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useCallback, useState } from "react";
import type { StepProps } from "./OnboardingWizard";

// Sample categories matching DEFAULT_CATEGORIES from budget-db.ts
const CATEGORIES = [
  { id: "food", name: "Food & Dining", icon: "🍽️", color: "#10b981" },
  { id: "transport", name: "Transportation", icon: "🚗", color: "#3b82f6" },
  { id: "bills", name: "Bills & Utilities", icon: "📄", color: "#ef4444" },
  { id: "shopping", name: "Shopping", icon: "🛍️", color: "#8b5cf6" },
  { id: "entertainment", name: "Entertainment", icon: "🎬", color: "#f59e0b" },
  { id: "health", name: "Health & Fitness", icon: "💪", color: "#06b6d4" },
  { id: "personal", name: "Personal Care", icon: "✨", color: "#ec4899" },
  { id: "income", name: "Income", icon: "💰", color: "#22c55e" },
  { id: "transfer", name: "Transfers", icon: "🔄", color: "#6b7280" },
];

// Simulated uncategorized transactions for demo
const DEMO_TRANSACTIONS = [
  { id: "1", vendor: "WALMART", amount: -125.43, suggestedCategory: "shopping", confidence: 0.95 },
  { id: "2", vendor: "SHELL GAS STATION", amount: -45.00, suggestedCategory: "transport", confidence: 0.92 },
  { id: "3", vendor: "NETFLIX.COM", amount: -15.99, suggestedCategory: "entertainment", confidence: 0.98 },
  { id: "4", vendor: "TRADER JOE'S", amount: -87.23, suggestedCategory: "food", confidence: 0.96 },
  { id: "5", vendor: "ELECTRIC COMPANY", amount: -142.50, suggestedCategory: "bills", confidence: 0.94 },
  { id: "6", vendor: "AMAZON.COM", amount: -34.99, suggestedCategory: "shopping", confidence: 0.88 },
  { id: "7", vendor: "PAYCHECK - ACME CORP", amount: 3500.00, suggestedCategory: "income", confidence: 0.99 },
  { id: "8", vendor: "PLANET FITNESS", amount: -29.99, suggestedCategory: "health", confidence: 0.91 },
];

interface CategorizedTransaction {
  id: string;
  vendor: string;
  amount: number;
  category: string | null;
  autoSuggested: boolean;
}

export function CategoryMappingStep({ onComplete, onSkip }: StepProps) {
  const [transactions, setTransactions] = useState<CategorizedTransaction[]>(
    DEMO_TRANSACTIONS.map((t) => ({
      id: t.id,
      vendor: t.vendor,
      amount: t.amount,
      category: null,
      autoSuggested: false,
    }))
  );
  const [rememberChoices, setRememberChoices] = useState(true);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState<string | null>(null);
  const [hasAppliedSuggestions, setHasAppliedSuggestions] = useState(false);

  const categorizedCount = transactions.filter((t) => t.category !== null).length;
  const uncategorizedCount = transactions.length - categorizedCount;

  const handleApplySuggestions = useCallback(() => {
    setTransactions((prev) =>
      prev.map((t) => {
        const demo = DEMO_TRANSACTIONS.find((d) => d.id === t.id);
        if (demo && demo.confidence > 0.85) {
          return { ...t, category: demo.suggestedCategory, autoSuggested: true };
        }
        return t;
      })
    );
    setHasAppliedSuggestions(true);
  }, []);

  const handleCategoryChange = useCallback((transactionId: string, categoryId: string) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === transactionId
          ? { ...t, category: categoryId, autoSuggested: false }
          : t
      )
    );
    setShowCategoryDropdown(null);
  }, []);

  const handleComplete = useCallback(() => {
    onComplete({ categorizedTransactions: categorizedCount });
  }, [onComplete, categorizedCount]);

  const getCategoryById = (id: string) => CATEGORIES.find((c) => c.id === id);

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400">
            {uncategorizedCount > 0
              ? `${uncategorizedCount} transactions need categories`
              : "All transactions are categorized!"}
          </p>
        </div>

        {/* Apply AI Suggestions button */}
        {!hasAppliedSuggestions && uncategorizedCount > 0 && (
          <button
            type="button"
            onClick={handleApplySuggestions}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg",
              "bg-gradient-to-r from-teal-500 to-blue-500",
              "text-white text-sm font-medium",
              "hover:opacity-90 transition-opacity"
            )}
          >
            <Sparkles className="h-4 w-4" />
            Apply Smart Suggestions
          </button>
        )}
      </div>

      {/* Transaction List */}
      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
        {transactions.map((transaction) => {
          const category = transaction.category ? getCategoryById(transaction.category) : null;
          const suggestion = DEMO_TRANSACTIONS.find((d) => d.id === transaction.id);

          return (
            <div
              key={transaction.id}
              className={cn(
                "flex items-center gap-4 p-3 rounded-xl",
                "bg-slate-800/50 border border-white/5",
                transaction.category && "border-teal-500/30"
              )}
            >
              {/* Category indicator */}
              <div
                className={cn(
                  "shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg",
                  category ? "bg-opacity-20" : "bg-slate-700"
                )}
                style={category ? { backgroundColor: `${category.color}20` } : undefined}
              >
                {category ? category.icon : "?"}
              </div>

              {/* Transaction details */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  {transaction.vendor}
                </p>
                <p className={cn(
                  "text-sm",
                  transaction.amount > 0 ? "text-green-400" : "text-slate-400"
                )}>
                  {transaction.amount > 0 ? "+" : ""}
                  ${Math.abs(transaction.amount).toFixed(2)}
                </p>
              </div>

              {/* Category selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCategoryDropdown(
                    showCategoryDropdown === transaction.id ? null : transaction.id
                  )}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm",
                    "transition-colors",
                    category
                      ? "bg-slate-700/50 text-white hover:bg-slate-700"
                      : "bg-teal-500/20 text-teal-400 hover:bg-teal-500/30"
                  )}
                >
                  {category ? (
                    <>
                      <span>{category.icon}</span>
                      <span className="max-w-[100px] truncate">{category.name}</span>
                      {transaction.autoSuggested && (
                        <Lightbulb className="h-3 w-3 text-amber-400" />
                      )}
                    </>
                  ) : (
                    <>
                      <span>Categorize</span>
                      {suggestion && suggestion.confidence > 0.85 && (
                        <span className="text-xs text-slate-500">
                          ({Math.round(suggestion.confidence * 100)}% match)
                        </span>
                      )}
                    </>
                  )}
                  <ChevronDown className="h-3 w-3" />
                </button>

                {/* Category Dropdown */}
                {showCategoryDropdown === transaction.id && (
                  <div className="absolute right-0 top-full mt-1 z-10 w-48 py-1 rounded-lg bg-slate-800 border border-white/10 shadow-xl">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategoryChange(transaction.id, cat.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-2 text-left text-sm",
                          "hover:bg-white/5 transition-colors",
                          transaction.category === cat.id && "bg-teal-500/10"
                        )}
                      >
                        <span>{cat.icon}</span>
                        <span className="text-white">{cat.name}</span>
                        {transaction.category === cat.id && (
                          <Check className="h-3 w-3 text-teal-400 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Remember choices toggle */}
      <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
        <button
          type="button"
          role="switch"
          aria-checked={rememberChoices}
          onClick={() => setRememberChoices(!rememberChoices)}
          className={cn(
            "relative h-5 w-9 rounded-full transition-colors",
            rememberChoices ? "bg-teal-500" : "bg-slate-600"
          )}
        >
          <span
            className={cn(
              "block h-4 w-4 rounded-full bg-white shadow transition-transform",
              rememberChoices ? "translate-x-4" : "translate-x-0.5"
            )}
          />
        </button>
        <div>
          <p className="text-sm text-white">Remember my category choices</p>
          <p className="text-xs text-slate-400">
            Auto-categorize similar transactions in the future
          </p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <div className="flex items-center gap-1">
            <Check className="h-4 w-4 text-teal-400" />
            <span>{categorizedCount} categorized</span>
          </div>
          {uncategorizedCount > 0 && (
            <span className="text-slate-600">•</span>
          )}
          {uncategorizedCount > 0 && (
            <span>{uncategorizedCount} remaining</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleComplete}
          className={cn(
            "flex items-center gap-2 px-6 py-2 rounded-lg font-medium",
            "transition-all",
            categorizedCount === transactions.length
              ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          )}
        >
          {categorizedCount === transactions.length ? "Continue" : "Continue Anyway"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default CategoryMappingStep;
