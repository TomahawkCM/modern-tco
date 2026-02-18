"use client";

/**
 * Split Transaction Modal Component (Phase 6)
 * Task 6.1.1 & 6.1.2: Design and implement split transaction modal
 *
 * Allows splitting a transaction across multiple categories
 */

import { useState, useEffect } from "react";
import { X, Plus, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Transaction, Category } from "@/types/budget";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface Split {
  id: string;
  category: string;
  subcategory: string;
  amount: number;
  notes: string;
}

interface SplitTransactionModalProps {
  transaction: Transaction;
  categories: Category[];
  onSave: (splits: Split[]) => Promise<void>;
  onClose: () => void;
}

export function SplitTransactionModal({
  transaction,
  categories,
  onSave,
  onClose,
}: SplitTransactionModalProps) {
  const t = useTranslations("splitTransaction");
  const originalAmount = Math.abs(transaction.amount);

  // Initialize with 2 splits (50/50)
  const [splits, setSplits] = useState<Split[]>([
    {
      id: `split_${Date.now()}_1`,
      category: "",
      subcategory: "",
      amount: originalAmount / 2,
      notes: "",
    },
    {
      id: `split_${Date.now()}_2`,
      category: "",
      subcategory: "",
      amount: originalAmount / 2,
      notes: "",
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Focus trap for modal accessibility
  const modalRef = useFocusTrap(true);

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

  // Calculate total and validation
  const total = splits.reduce((sum, split) => sum + (split.amount || 0), 0);
  const isValid = Math.abs(total - originalAmount) < 0.01; // Allow 1 cent rounding error
  const difference = total - originalAmount;

  function addSplit() {
    if (splits.length >= 5) {
      alert(t("maxSplitsReached"));
      return;
    }

    const remaining = originalAmount - total;
    const newSplit: Split = {
      id: `split_${Date.now()}_${splits.length + 1}`,
      category: "",
      subcategory: "",
      amount: remaining > 0 ? remaining : 0,
      notes: "",
    };
    setSplits([...splits, newSplit]);
  }

  function removeSplit(id: string) {
    if (splits.length <= 2) {
      alert(t("minSplitsRequired"));
      return;
    }
    setSplits(splits.filter((split) => split.id !== id));
  }

  function updateSplit(id: string, field: keyof Split, value: string | number) {
    setSplits(splits.map((split) => (split.id === id ? { ...split, [field]: value } : split)));
  }

  function handleCategoryChange(id: string, categoryName: string) {
    const category = categories.find((c) => c.name === categoryName);
    setSplits(
      splits.map((split) =>
        split.id === id
          ? {
              ...split,
              category: categoryName,
              subcategory: "", // Reset subcategory when category changes
            }
          : split
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validation
    if (!isValid) {
      alert(t("validation.amountsMustMatch"));
      return;
    }

    // Check all splits have categories
    const missingCategory = splits.some((split) => !split.category);
    if (missingCategory) {
      alert(t("validation.categoryRequired"));
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(splits);
      onClose();
    } catch (error) {
      console.error("Error saving split transaction:", error);
      alert(t("errors.saveFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  function distributeEvenly() {
    const amountPerSplit = originalAmount / splits.length;
    setSplits(
      splits.map((split) => ({
        ...split,
        amount: amountPerSplit,
      }))
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 p-4 sm:items-center sm:p-4">
      {/* Phase 3.1.5: Mobile-optimized with bottom sheet on mobile, centered on desktop */}
      <div
        ref={modalRef}
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:max-w-3xl sm:rounded-lg"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
            <p className="mt-2 text-sm text-gray-600">
              {transaction.description} • ${originalAmount.toFixed(2)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
            aria-label={t("closeModal")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Original Transaction Info */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">{t("originalAmount")}</span>
                <span className="ms-2 font-semibold text-gray-900">
                  ${originalAmount.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">{t("date")}</span>
                <span className="ms-2 font-semibold text-gray-900">
                  {new Date(transaction.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Splits */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                {t("splitsCount", { current: splits.length, max: 5 })}
              </h3>
              <button
                type="button"
                onClick={distributeEvenly}
                className="text-xs text-teal-600 underline hover:text-teal-700"
              >
                {t("distributeEvenly")}
              </button>
            </div>

            {splits.map((split, index) => {
              const selectedCategory = categories.find((c) => c.name === split.category);

              return (
                <div key={split.id} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-700">
                      {index + 1}
                    </div>

                    <div className="flex-1 space-y-4">
                      {/* Category and Amount Row */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Category */}
                        <div>
                          <label
                            htmlFor={`split-category-${split.id}`}
                            className="mb-2 block text-xs font-medium text-gray-700"
                          >
                            {t("category")} <span className="text-red-600">*</span>
                          </label>
                          <select
                            id={`split-category-${split.id}`}
                            value={split.category}
                            onChange={(e) => handleCategoryChange(split.id, e.target.value)}
                            className="h-12 w-full rounded-lg border border-gray-300 px-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
                            aria-required="true"
                            required
                          >
                            <option value="">{t("selectCategory")}</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.name}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Amount */}
                        <div>
                          <label
                            htmlFor={`split-amount-${split.id}`}
                            className="mb-2 block text-xs font-medium text-gray-700"
                          >
                            {t("amount")} <span className="text-red-600">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute start-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                              $
                            </span>
                            <input
                              id={`split-amount-${split.id}`}
                              type="number"
                              step="0.01"
                              min="0"
                              max={originalAmount}
                              value={split.amount || ""}
                              onChange={(e) =>
                                updateSplit(split.id, "amount", parseFloat(e.target.value) || 0)
                              }
                              inputMode="decimal"
                              className="h-12 w-full rounded-lg border border-gray-300 ps-8 pe-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
                              aria-required="true"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Subcategory */}
                      {selectedCategory && selectedCategory.subcategories.length > 0 && (
                        <div>
                          <label
                            htmlFor={`split-subcategory-${split.id}`}
                            className="mb-2 block text-xs font-medium text-gray-700"
                          >
                            {t("subcategory")}
                          </label>
                          <select
                            id={`split-subcategory-${split.id}`}
                            value={split.subcategory}
                            onChange={(e) => updateSplit(split.id, "subcategory", e.target.value)}
                            className="h-12 w-full rounded-lg border border-gray-300 px-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="">{t("none")}</option>
                            {selectedCategory.subcategories.map((subcat) => (
                              <option key={subcat} value={subcat}>
                                {subcat}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Notes */}
                      <div>
                        <label
                          htmlFor={`split-notes-${split.id}`}
                          className="mb-2 block text-xs font-medium text-gray-700"
                        >
                          {t("notes")}
                        </label>
                        <input
                          id={`split-notes-${split.id}`}
                          type="text"
                          value={split.notes}
                          onChange={(e) => updateSplit(split.id, "notes", e.target.value)}
                          placeholder={t("notesPlaceholder")}
                          className="h-12 w-full rounded-lg border border-gray-300 px-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    </div>

                    {/* Remove Button */}
                    {splits.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeSplit(split.id)}
                        className="flex-shrink-0 rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                        title={t("removeThisSplit")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Add Split Button */}
            {splits.length < 5 && (
              <button
                type="button"
                onClick={addSplit}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-2 text-gray-600 transition-colors hover:border-teal-500 hover:text-teal-600"
              >
                <Plus className="h-4 w-4" />
                {t("addSplit", { current: splits.length, max: 5 })}
              </button>
            )}
          </div>

          {/* Validation Summary */}
          <div
            className={`rounded-lg border-2 p-4 ${
              isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
            }`}
          >
            <div className="flex items-start gap-4">
              {isValid ? (
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
              ) : (
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
              )}
              <div className="flex-1">
                <div className="mb-2 flex items-center justify-between">
                  <span className={`font-semibold ${isValid ? "text-green-900" : "text-red-900"}`}>
                    {t("validation.total")} ${total.toFixed(2)}
                  </span>
                  <span className={`text-sm ${isValid ? "text-green-700" : "text-red-700"}`}>
                    {isValid
                      ? t("validation.matchesOriginal")
                      : difference > 0
                        ? t("validation.overBy", { amount: Math.abs(difference).toFixed(2) })
                        : t("validation.underBy", { amount: Math.abs(difference).toFixed(2) })}
                  </span>
                </div>
                <p className={`text-sm ${isValid ? "text-green-700" : "text-red-700"}`}>
                  {isValid ? t("validation.readyToSave") : t("validation.adjustAmounts")}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
              disabled={isSubmitting}
            >
              {t("buttons.cancel")}
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-teal-500 px-4 py-2 text-white transition-colors hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? t("buttons.saving") : t("buttons.save")}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="px-6 pb-6">
          <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800">
            <p className="mb-2 font-medium">{t("help.title")}</p>
            <ul className="list-inside list-disc space-y-2 text-xs">
              <li>{t("help.step1", { amount: originalAmount.toFixed(2) })}</li>
              <li>{t("help.step2")}</li>
              <li>{t("help.step3")}</li>
              <li>{t("help.step4")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
