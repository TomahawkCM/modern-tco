/**
 * Category Mapping Step - Onboarding Wizard
 * Bulk categorization with auto-suggestions and vendor learning
 */

"use client";

import { cn } from "@/lib/utils";
import { ArrowRight, Check, ChevronDown, Lightbulb, RefreshCw, Sparkles } from "lucide-react";
import { useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatCurrency } from "@/i18n/utils/formatCurrency";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";
import type { SupportedLocale } from "@/i18n/config";
import type { StepProps } from "./OnboardingWizard";

// Sample categories matching DEFAULT_CATEGORIES from budget-db.ts
// Names are resolved via i18n in the component
const CATEGORIES = [
  { id: "food", nameKey: "foodDining", icon: "🍽️", color: "#10b981" },
  { id: "transport", nameKey: "transportation", icon: "🚗", color: "#3b82f6" },
  { id: "bills", nameKey: "billsUtilities", icon: "📄", color: "#ef4444" },
  { id: "shopping", nameKey: "shopping", icon: "🛍️", color: "#8b5cf6" },
  { id: "entertainment", nameKey: "entertainment", icon: "🎬", color: "#f59e0b" },
  { id: "health", nameKey: "healthFitness", icon: "💪", color: "#06b6d4" },
  { id: "personal", nameKey: "personalCare", icon: "✨", color: "#ec4899" },
  { id: "income", nameKey: "income", icon: "💰", color: "#22c55e" },
  { id: "transfer", nameKey: "transfers", icon: "🔄", color: "#6b7280" },
];

// Simulated uncategorized transactions for demo
const DEMO_TRANSACTIONS = [
  { id: "1", vendor: "WALMART", amount: -125.43, suggestedCategory: "shopping", confidence: 0.95 },
  {
    id: "2",
    vendor: "SHELL GAS STATION",
    amount: -45.0,
    suggestedCategory: "transport",
    confidence: 0.92,
  },
  {
    id: "3",
    vendor: "NETFLIX.COM",
    amount: -15.99,
    suggestedCategory: "entertainment",
    confidence: 0.98,
  },
  { id: "4", vendor: "TRADER JOE'S", amount: -87.23, suggestedCategory: "food", confidence: 0.96 },
  {
    id: "5",
    vendor: "ELECTRIC COMPANY",
    amount: -142.5,
    suggestedCategory: "bills",
    confidence: 0.94,
  },
  {
    id: "6",
    vendor: "AMAZON.COM",
    amount: -34.99,
    suggestedCategory: "shopping",
    confidence: 0.88,
  },
  {
    id: "7",
    vendor: "PAYCHECK - ACME CORP",
    amount: 3500.0,
    suggestedCategory: "income",
    confidence: 0.99,
  },
  {
    id: "8",
    vendor: "PLANET FITNESS",
    amount: -29.99,
    suggestedCategory: "health",
    confidence: 0.91,
  },
];

interface CategorizedTransaction {
  id: string;
  vendor: string;
  amount: number;
  category: string | null;
  autoSuggested: boolean;
}

export function CategoryMappingStep({ onComplete, onSkip }: StepProps) {
  const locale = useLocale();
  const currency = useDefaultCurrency();
  const t = useTranslations("onboardingPage");
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
        t.id === transactionId ? { ...t, category: categoryId, autoSuggested: false } : t
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
              ? t("categoryMapping.needsCategories", { count: uncategorizedCount })
              : t("categoryMapping.allCategorized")}
          </p>
        </div>

        {/* Apply AI Suggestions button */}
        {!hasAppliedSuggestions && uncategorizedCount > 0 && (
          <button
            type="button"
            onClick={handleApplySuggestions}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2",
              "bg-gradient-to-r from-teal-500 to-blue-500",
              "text-sm font-medium text-white",
              "transition-opacity hover:opacity-90"
            )}
          >
            <Sparkles className="h-4 w-4" />
            {t("categoryMapping.applySmartSuggestions")}
          </button>
        )}
      </div>

      {/* Transaction List */}
      <div className="max-h-[280px] space-y-2 overflow-y-auto pe-2">
        {transactions.map((transaction) => {
          const category = transaction.category ? getCategoryById(transaction.category) : null;
          const suggestion = DEMO_TRANSACTIONS.find((d) => d.id === transaction.id);

          return (
            <div
              key={transaction.id}
              className={cn(
                "flex items-center gap-4 rounded-xl p-3",
                "border border-white/5 bg-slate-800/50",
                transaction.category && "border-teal-500/30"
              )}
            >
              {/* Category indicator */}
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg",
                  category ? "bg-opacity-20" : "bg-slate-700"
                )}
                style={category ? { backgroundColor: `${category.color}20` } : undefined}
              >
                {category ? category.icon : "?"}
              </div>

              {/* Transaction details */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{transaction.vendor}</p>
                <p
                  className={cn(
                    "text-sm",
                    transaction.amount > 0 ? "text-green-400" : "text-slate-400"
                  )}
                >
                  {transaction.amount > 0 ? "+" : ""}
                  {formatCurrency(
                    Math.abs(transaction.amount),
                    currency,
                    locale as SupportedLocale
                  )}
                </p>
              </div>

              {/* Category selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setShowCategoryDropdown(
                      showCategoryDropdown === transaction.id ? null : transaction.id
                    )
                  }
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm",
                    "transition-colors",
                    category
                      ? "bg-slate-700/50 text-white hover:bg-slate-700"
                      : "bg-teal-500/20 text-teal-400 hover:bg-teal-500/30"
                  )}
                >
                  {category ? (
                    <>
                      <span>{category.icon}</span>
                      <span className="max-w-[100px] truncate">
                        {t(`categoryMapping.categories.${category.nameKey}`)}
                      </span>
                      {transaction.autoSuggested && (
                        <Lightbulb className="h-3 w-3 text-amber-400" />
                      )}
                    </>
                  ) : (
                    <>
                      <span>{t("categoryMapping.categorize")}</span>
                      {suggestion && suggestion.confidence > 0.85 && (
                        <span className="text-xs text-slate-500">
                          (
                          {t("categoryMapping.percentMatch", {
                            percent: Math.round(suggestion.confidence * 100),
                          })}
                          )
                        </span>
                      )}
                    </>
                  )}
                  <ChevronDown className="h-3 w-3" />
                </button>

                {/* Category Dropdown */}
                {showCategoryDropdown === transaction.id && (
                  <div className="absolute end-0 top-full z-10 mt-1 w-48 rounded-lg border border-white/10 bg-slate-800 py-1 shadow-xl">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategoryChange(transaction.id, cat.id)}
                        className={cn(
                          "flex w-full items-center gap-2 px-3 py-2 text-start text-sm",
                          "transition-colors hover:bg-white/5",
                          transaction.category === cat.id && "bg-teal-500/10"
                        )}
                      >
                        <span>{cat.icon}</span>
                        <span className="text-white">
                          {t(`categoryMapping.categories.${cat.nameKey}`)}
                        </span>
                        {transaction.category === cat.id && (
                          <Check className="ms-auto h-3 w-3 text-teal-400" />
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
      <div className="flex items-center gap-3 rounded-lg bg-slate-800/30 p-3">
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
          <p className="text-sm text-white">{t("categoryMapping.rememberChoices")}</p>
          <p className="text-xs text-slate-400">
            {t("categoryMapping.rememberChoicesDescription")}
          </p>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <div className="flex items-center gap-1">
            <Check className="h-4 w-4 text-teal-400" />
            <span>{t("categoryMapping.categorized", { count: categorizedCount })}</span>
          </div>
          {uncategorizedCount > 0 && <span className="text-slate-600">•</span>}
          {uncategorizedCount > 0 && (
            <span>{t("categoryMapping.remaining", { count: uncategorizedCount })}</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleComplete}
          className={cn(
            "flex items-center gap-2 rounded-lg px-6 py-2 font-medium",
            "transition-all",
            categorizedCount === transactions.length
              ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          )}
        >
          {categorizedCount === transactions.length
            ? t("categoryMapping.continue")
            : t("categoryMapping.continueAnyway")}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default CategoryMappingStep;
