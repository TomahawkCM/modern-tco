"use client";

/**
 * Transaction Modal Component
 * Add or edit transactions
 */

import { useState, useEffect } from "react";
import type { Transaction, Category, Account } from "@/types/budget";
import { format } from "date-fns";
import { recordCorrection, categorizeTransaction } from "@/lib/categorization/rules";
import {
  db,
  storeReceipt,
  getTransactionReceipts,
  getThumbnailBlobUrl,
  deleteReceipt,
} from "@/lib/budget-db";
import { CategoryCombobox } from "./CategoryCombobox";
import { ReceiptUpload } from "./ReceiptUpload";
import { ConfidenceMeter } from "./ConfidenceMeter";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Paperclip, FileImage, Trash2, Brain, Loader2 } from "lucide-react";
import type { Receipt, Loan } from "@/types/budget";
import type { ExtractedReceiptData } from "@/lib/receipt-ocr";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { trackBudgetEvent } from "@/lib/budget-analytics";
import { useMerchantCategorization } from "@/hooks/useMerchantCategorization";
import { useTranslations } from "next-intl";
import { LoanPaymentSelector } from "./loans/LoanPaymentSelector";
import { LinkedLoanBadge } from "./loans/LinkedLoanBadge";
import {
  getActiveLoans,
  createPaymentFromTransaction,
  getPaymentByTransactionId,
} from "@/lib/loans/loan-db";
import { isTransactionLinked } from "@/lib/loans/transaction-link-operations";

interface TransactionModalProps {
  transaction: Transaction | null;
  categories: Category[];
  accounts: Account[];
  onSave: (transaction: Transaction) => void;
  onClose: () => void;
  isSaving?: boolean;
  onCategoryCreated?: (category: Category) => void;
}

export function TransactionModal({
  transaction,
  categories,
  accounts,
  onSave,
  onClose,
  isSaving = false,
  onCategoryCreated,
}: TransactionModalProps) {
  const t = useTranslations("transactionModal");

  // Smart default: Load last used category from localStorage
  const getLastUsedCategory = () => {
    if (typeof window !== "undefined") {
      const lastCat = localStorage.getItem("lastUsedCategory");
      const lastSub = localStorage.getItem("lastUsedSubcategory");
      return { category: lastCat || "", subcategory: lastSub || "" };
    }
    return { category: "", subcategory: "" };
  };

  const lastUsed = transaction ? { category: "", subcategory: "" } : getLastUsedCategory();

  const [date, setDate] = useState(
    transaction?.date
      ? format(new Date(transaction.date), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd")
  );
  const [description, setDescription] = useState(transaction?.description || "");
  const [amount, setAmount] = useState(transaction?.amount ? Math.abs(transaction.amount) : 0);
  const [type, setType] = useState<"income" | "expense">(
    transaction?.amount && transaction.amount > 0 ? "income" : "expense"
  );
  const [category, setCategory] = useState(transaction?.category || lastUsed.category);
  const [subcategory, setSubcategory] = useState(transaction?.subcategory || lastUsed.subcategory);
  const [accountId, setAccountId] = useState(transaction?.accountId || accounts[0]?.id || "");
  const [notes, setNotes] = useState(transaction?.notes || "");
  const [tags, setTags] = useState(transaction?.tags?.join(", ") || "");
  const [showLearnMessage, setShowLearnMessage] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategorySubcats, setNewCategorySubcats] = useState("");
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [attachedReceipt, setAttachedReceipt] = useState<File | null>(null);
  const [existingReceipts, setExistingReceipts] = useState<Receipt[]>([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Loan payment linking state
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [existingLoanLink, setExistingLoanLink] = useState(false);

  // Track original category for learning
  const originalCategory = transaction?.category || null;
  const originalSubcategory = transaction?.subcategory || null;

  // Auto-categorization confidence
  const [autoCategorizationConfidence, setAutoCategorizationConfidence] = useState<number | null>(
    null
  );
  const [showConfidenceMeter, setShowConfidenceMeter] = useState(false);

  // AI-powered merchant categorization (Phase 4: Merchant Intelligence Integration)
  const {
    categorization: aiCategorization,
    isLoading: isAILoading,
    submitFeedback,
  } = useMerchantCategorization(description, "bmo", !transaction); // Only for new transactions

  // Track AI suggestion for feedback submission
  const [aiSuggestedCategory, setAiSuggestedCategory] = useState<string | null>(null);
  const [aiSuggestedSubcategory, setAiSuggestedSubcategory] = useState<string | null>(null);

  const filteredCategories = categories; // Show all categories regardless of transaction type
  const selectedCategory = filteredCategories.find((c) => c.name === category);

  // Focus trap for modal accessibility
  const modalRef = useFocusTrap(true);

  // Auto-categorize on description change (for new transactions)
  // Phase 4: AI-powered categorization with confidence-based auto-apply
  useEffect(() => {
    if (!transaction && description.trim()) {
      // Prefer AI categorization over rule-based
      if (aiCategorization && !category) {
        const AUTO_APPLY_THRESHOLD = 0.9; // Auto-apply if AI is 90%+ confident

        // Track AI suggestion for feedback
        setAiSuggestedCategory(aiCategorization.category);
        setAiSuggestedSubcategory(aiCategorization.subcategory);

        // Auto-apply if high confidence
        if (aiCategorization.confidence >= AUTO_APPLY_THRESHOLD) {
          setCategory(aiCategorization.category);
          setSubcategory(aiCategorization.subcategory || "");
          setAutoCategorizationConfidence(aiCategorization.confidence);
          setShowConfidenceMeter(true);
        } else {
          // Low confidence - present as suggestion (don't auto-apply)
          // User can manually accept via CategoryCombobox
          setAutoCategorizationConfidence(aiCategorization.confidence);
          setShowConfidenceMeter(true);
        }
      } else if (!aiCategorization && !isAILoading) {
        // Fallback to rule-based categorization if AI unavailable or failed
        const result = categorizeTransaction(description);
        if (result && !category) {
          setCategory(result.category);
          setSubcategory(result.subcategory || "");
          setAutoCategorizationConfidence(result.confidence);
          setShowConfidenceMeter(true);
        }
      }
    }
  }, [description, transaction, category, aiCategorization, isAILoading]);

  // Load existing receipts when editing a transaction
  useEffect(() => {
    if (transaction?.id) {
      getTransactionReceipts(transaction.id).then((receipts) => {
        setExistingReceipts(receipts);
      });
    }
  }, [transaction?.id]);

  // Load active loans and check for existing link
  useEffect(() => {
    async function loadLoanData() {
      try {
        const loans = await getActiveLoans();
        setActiveLoans(loans);

        // Check if editing a transaction that's already linked
        if (transaction?.id) {
          const isLinked = await isTransactionLinked(transaction.id);
          setExistingLoanLink(isLinked);
        }
      } catch (error) {
        console.error("Error loading loan data:", error);
      }
    }

    loadLoanData();
  }, [transaction?.id]);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (amount <= 0) {
      alert(t("amount.validationError"));
      return;
    }

    const newTransaction: Transaction = {
      id: transaction?.id || `tx_${Date.now()}`,
      accountId,
      date: new Date(date),
      description,
      amount: type === "income" ? amount : -amount,
      category: category || null,
      subcategory: subcategory || null,
      notes,
      isRecurring: false,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      createdAt: transaction?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    // Learn from category corrections
    if (
      transaction &&
      category &&
      (category !== originalCategory || subcategory !== originalSubcategory)
    ) {
      // Get original auto-categorization for this description
      const autoCategorization = categorizeTransaction(description);

      recordCorrection({
        originalDescription: description,
        suggestedCategory: autoCategorization?.category || originalCategory || "Uncategorized",
        suggestedSubcategory: autoCategorization?.subcategory || originalSubcategory || undefined,
        correctedCategory: category,
        correctedSubcategory: subcategory || undefined,
        timestamp: new Date(),
      });

      // Vendor-level learning so future transactions from the same merchant are auto-categorized

      const { learnVendorCategory } = await import("@/lib/vendor-learning");
      learnVendorCategory(description, category, subcategory || null);

      // Show brief confirmation message
      setShowLearnMessage(true);
      setTimeout(() => setShowLearnMessage(false), 3000);
    }

    // Phase 4: Submit feedback to merchant intelligence service
    if (aiCategorization && category) {
      const acceptedSuggestion =
        category === aiSuggestedCategory &&
        (subcategory || null) === (aiSuggestedSubcategory || null);

      await submitFeedback({
        merchant_token: aiCategorization.merchant_token,
        chosen_category: category,
        chosen_subcategory: subcategory || null,
        previous_category: aiSuggestedCategory,
        previous_subcategory: aiSuggestedSubcategory,
        accepted_suggestion: acceptedSuggestion,
        country: "CA", // Could be dynamic based on account settings
      });

      // Show learning message if user corrected AI suggestion
      if (!acceptedSuggestion) {
        setShowLearnMessage(true);
        setTimeout(() => setShowLearnMessage(false), 3000);
      }
    }

    // Remember last used category for smart defaults
    if (category && typeof window !== "undefined") {
      localStorage.setItem("lastUsedCategory", category);
      localStorage.setItem("lastUsedSubcategory", subcategory || "");
    }

    // Save the transaction first
    onSave(newTransaction);

    // Track analytics event
    trackBudgetEvent(transaction ? "transaction_edited" : "transaction_added", {
      section: "transactions",
      method: attachedReceipt ? "receipt" : "manual",
      success: true,
    });

    // Store the receipt if one was attached
    if (attachedReceipt) {
      try {
        await storeReceipt(newTransaction.id, attachedReceipt);
      } catch (error) {
        console.error("Failed to store receipt:", error);
        // Transaction is saved, but receipt storage failed
        // We could show an error message here if needed
      }
    }

    // Create loan payment if a loan was selected (only for expenses)
    if (selectedLoanId && type === "expense" && !existingLoanLink) {
      const selectedLoan = activeLoans.find((l) => l.id === selectedLoanId);
      if (selectedLoan) {
        try {
          await createPaymentFromTransaction(selectedLoan, {
            id: newTransaction.id,
            amount: newTransaction.amount,
            date: newTransaction.date,
            description: newTransaction.description,
          });
        } catch (error) {
          console.error("Failed to create loan payment:", error);
          // Transaction is saved, but loan payment creation failed
        }
      }
    }
  }

  async function handleDeleteReceipt(receiptId: string) {
    if (!transaction?.id) return;

    if (confirm(t("receipts.deleteConfirm"))) {
      try {
        await deleteReceipt(receiptId, transaction.id);
        setExistingReceipts(existingReceipts.filter((r) => r.id !== receiptId));
      } catch (error) {
        console.error("Failed to delete receipt:", error);
        alert(t("receipts.deleteFailed"));
      }
    }
  }

  // Phase 7.3.1: Handle OCR data extraction
  function handleOCRDataExtracted(data: ExtractedReceiptData) {
    // Pre-fill form fields with extracted data
    if (data.merchant && !description) {
      setDescription(data.merchant);
    }

    if (data.amount && amount === 0) {
      setAmount(data.amount);
      // Assume expenses by default (receipts are usually for purchases)
      setType("expense");
    }

    if (data.date && !transaction) {
      // Only set date for new transactions
      setDate(format(data.date, "yyyy-MM-dd"));
    }

    // Try to auto-categorize based on merchant name
    if (data.merchant && !category) {
      const result = categorizeTransaction(data.merchant);
      if (result) {
        setCategory(result.category);
        setSubcategory(result.subcategory || "");
        setAutoCategorizationConfidence(result.confidence);
        setShowConfidenceMeter(true);
      }
    }
  }

  function createNewCategory() {
    if (!newCategoryName.trim()) {
      return;
    }

    const subcatsArray = newCategorySubcats
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const newCat: Category = {
      id: `cat_${Date.now()}`,
      name: newCategoryName.trim(),
      type,
      subcategories: subcatsArray,
      color: "#3b82f6",
      icon: "tag",
      isDefault: false,
      order: categories.length + 1,
      createdAt: new Date(),
    };

    // Update UI immediately (optimistic update)
    setCategory(newCat.name);
    setShowCreateCategory(false);
    setNewCategoryName("");
    setNewCategorySubcats("");

    // Notify parent to update categories state immediately
    if (onCategoryCreated) {
      onCategoryCreated(newCat);
    }

    // Fire-and-forget DB save (non-blocking)
    db.categories.add(newCat).catch((error) => {
      console.error("Error saving category to DB:", error);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      {/* Modal - Phase 3.1.5: Mobile-optimized with bottom sheet on mobile, centered on desktop */}
      <div
        ref={modalRef}
        className="flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-2xl bg-card shadow-xl sm:mx-4 sm:max-h-[90vh] sm:max-w-2xl sm:rounded-lg"
      >
        <div className="flex-shrink-0 border-b border-border bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              {transaction ? t("title.edit") : t("title.add")}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={t("closeModal")}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6">
            {/* Learning Message */}
            {showLearnMessage && (
              <div className="flex items-start gap-2 rounded-lg border border-success bg-success/10 p-4">
                <div className="flex-shrink-0 text-success-foreground">✓</div>
                <div className="text-sm text-foreground">
                  <div className="font-medium">{t("learned.title")}</div>
                  <div className="mt-0.5">{t("learned.description")}</div>
                </div>
              </div>
            )}

            {/* Type Toggle - Enhanced */}
            <div>
              <label className="mb-3 block text-base font-semibold text-foreground">
                {t("type.label")} *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setType("expense");
                    setCategory("");
                    setSubcategory("");
                  }}
                  className={`min-h-[48px] rounded-lg px-6 py-3 text-base font-semibold transition-colors ${
                    type === "expense"
                      ? "bg-red-500 text-white shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {t("type.expense")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType("income");
                    setCategory("");
                    setSubcategory("");
                  }}
                  className={`min-h-[48px] rounded-lg px-6 py-3 text-base font-semibold transition-colors ${
                    type === "income"
                      ? "bg-green-500 text-white shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {t("type.income")}
                </button>
              </div>
            </div>

            {/* Description - Enhanced */}
            <div>
              <label
                htmlFor="transaction-description"
                className="mb-3 block text-base font-semibold text-foreground"
              >
                {t("description.label")} *
              </label>
              <input
                id="transaction-description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("description.placeholder")}
                className="min-h-[48px] w-full rounded-lg border border-input bg-background px-4 text-base text-foreground focus:border-transparent focus:ring-2 focus:ring-teal-500"
                aria-required="true"
                required
              />
            </div>

            {/* Amount and Date - Enhanced */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CurrencyInput
                id="transaction-amount"
                value={amount}
                onChange={setAmount}
                label={`${t("amount.label")} *`}
                placeholder={t("amount.placeholder")}
                min={0}
                required
                inputClassName="min-h-[48px]"
              />

              <div>
                <label
                  htmlFor="transaction-date"
                  className="mb-3 block text-base font-semibold text-foreground"
                >
                  {t("date.label")} *
                </label>
                <input
                  id="transaction-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="min-h-[48px] w-full rounded-lg border border-input bg-background px-4 text-base text-foreground focus:border-transparent focus:ring-2 focus:ring-teal-500"
                  aria-required="true"
                  required
                />
              </div>
            </div>

            {/* Category and Subcategory - Enhanced */}
            <div className="space-y-4">
              <div>
                <label className="mb-3 block text-base font-semibold text-foreground">
                  {t("category.label")}{" "}
                  {lastUsed.category && !transaction && (
                    <span className="text-sm font-normal text-muted-foreground">
                      ({t("category.lastUsed", { category: lastUsed.category })})
                    </span>
                  )}
                  {isAILoading && (
                    <span className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
                      <Brain className="h-3.5 w-3.5 animate-pulse" />
                      {t("category.aiCategorizing")}
                    </span>
                  )}
                </label>
                {!showCreateCategory ? (
                  <div className="space-y-2">
                    <CategoryCombobox
                      options={[
                        ...filteredCategories.map((cat) => ({
                          value: cat.name,
                          label: cat.name,
                        })),
                        { value: "__create__", label: t("category.createNew") },
                      ]}
                      value={category}
                      onChange={(value) => {
                        if (value === "__create__") {
                          setShowCreateCategory(true);
                          setCategory("");
                        } else {
                          setCategory(value);
                          setSubcategory("");
                        }
                      }}
                      placeholder={t("category.selectPlaceholder")}
                    />
                  </div>
                ) : (
                  <div className="space-y-2 rounded-lg border-2 border-teal-500 bg-teal-50 p-4">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder={t("category.namePlaceholder")}
                      className="w-full rounded border border-input bg-background px-4 py-2 text-sm text-foreground focus:border-transparent focus:ring-2 focus:ring-teal-500"
                    />
                    <input
                      type="text"
                      value={newCategorySubcats}
                      onChange={(e) => setNewCategorySubcats(e.target.value)}
                      placeholder={t("category.subcategoriesPlaceholder")}
                      className="w-full rounded border border-input bg-background px-4 py-2 text-sm text-foreground focus:border-transparent focus:ring-2 focus:ring-teal-500"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={createNewCategory}
                        className="flex-1 rounded bg-teal-600 px-4 py-2 text-sm text-white hover:bg-teal-700"
                      >
                        {t("category.create")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateCategory(false);
                          setNewCategoryName("");
                          setNewCategorySubcats("");
                        }}
                        className="flex-1 rounded border border-input px-4 py-2 text-sm text-foreground hover:bg-muted"
                      >
                        {t("buttons.cancel")}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-3 block text-base font-semibold text-foreground">
                  {t("subcategory.label")}
                </label>
                <CategoryCombobox
                  options={[
                    { value: "", label: t("subcategory.none") },
                    ...(selectedCategory?.subcategories.map((sub) => ({
                      value: sub,
                      label: sub,
                    })) || []),
                  ]}
                  value={subcategory}
                  onChange={setSubcategory}
                  placeholder={t("subcategory.selectPlaceholder")}
                  disabled={!selectedCategory || selectedCategory.subcategories.length === 0}
                />
              </div>

              {/* Confidence Meter for Auto-Categorization */}
              {showConfidenceMeter && autoCategorizationConfidence !== null && category && (
                <div className="pt-2">
                  <ConfidenceMeter
                    confidence={autoCategorizationConfidence}
                    category={category}
                    subcategory={subcategory}
                    showLearnButton={true}
                    onLearnFromThis={() => {
                      // Explicit learning - confirm the auto-categorization is correct
                      recordCorrection({
                        originalDescription: description,
                        suggestedCategory: category,
                        suggestedSubcategory: subcategory || undefined,
                        correctedCategory: category,
                        correctedSubcategory: subcategory || undefined,
                        timestamp: new Date(),
                      });
                      setShowLearnMessage(true);
                      setTimeout(() => setShowLearnMessage(false), 3000);
                      setShowConfidenceMeter(false);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Advanced Options - Collapsible */}
            <div className="border-t-2 border-border pt-4">
              <button
                type="button"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="mb-4 flex items-center gap-2 text-base font-semibold text-teal-600 hover:text-teal-700"
              >
                <svg
                  className={`h-5 w-5 transition-transform ${showAdvancedOptions ? "rotate-90" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <span>{t("advancedOptions.label")}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  (
                  {t("advancedOptions.available", {
                    count: [notes, tags, accounts.length > 1 ? "account" : ""].filter(Boolean)
                      .length,
                  })}
                  )
                </span>
              </button>

              {showAdvancedOptions && (
                <div className="space-y-4 border-s-2 border-teal-200 ps-4">
                  {/* Account */}
                  {accounts.length > 0 && (
                    <div>
                      <label
                        htmlFor="transaction-account"
                        className="mb-3 block text-base font-medium text-foreground"
                      >
                        {t("account.label")}
                      </label>
                      <select
                        id="transaction-account"
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        className="min-h-[48px] w-full rounded-lg border border-input bg-background px-4 text-base text-foreground focus:border-transparent focus:ring-2 focus:ring-teal-500"
                      >
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name} ({acc.institution})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label
                      htmlFor="transaction-notes"
                      className="mb-3 block text-base font-medium text-foreground"
                    >
                      {t("notes.label")}
                    </label>
                    <textarea
                      id="transaction-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t("notes.placeholder")}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-base text-foreground focus:border-transparent focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label
                      htmlFor="transaction-tags"
                      className="mb-3 block text-base font-medium text-foreground"
                    >
                      {t("tags.label")}
                    </label>
                    <input
                      id="transaction-tags"
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder={t("tags.placeholder")}
                      className="min-h-[48px] w-full rounded-lg border border-input bg-background px-4 text-base text-foreground focus:border-transparent focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Loan Payment Section - Only for expenses */}
            {type === "expense" && activeLoans.length > 0 && !existingLoanLink && (
              <div className="border-t-2 border-border pt-4">
                <LoanPaymentSelector
                  loans={activeLoans}
                  selectedLoanId={selectedLoanId}
                  onLoanSelect={setSelectedLoanId}
                  amount={amount}
                  date={new Date(date)}
                />
              </div>
            )}

            {/* Show existing loan link when editing */}
            {existingLoanLink && transaction?.id && (
              <div className="border-t-2 border-border pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-foreground">Linked to Loan:</span>
                  <LinkedLoanBadge
                    transactionId={transaction.id}
                    showUnlinkButton={false}
                    size="md"
                  />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  To change the loan link, unlink from the Loans page first.
                </p>
              </div>
            )}

            {/* Receipt Upload - Phase 7.1.1 & 7.2.2: Receipt storage and thumbnails */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-foreground">
                {t("receipts.label")}
              </label>

              {/* Existing Receipts - Phase 7.2.2: Display thumbnails */}
              {existingReceipts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {t("receipts.existing", { count: existingReceipts.length })}
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {existingReceipts.map((receipt) => {
                      const thumbnailUrl = receipt.thumbnail ? getThumbnailBlobUrl(receipt) : null;
                      const isPdf = receipt.mimeType === "application/pdf";

                      return (
                        <div key={receipt.id} className="group relative">
                          <div className="aspect-square overflow-hidden rounded-lg border border-border bg-muted transition-colors hover:border-teal-400">
                            {thumbnailUrl && !isPdf ? (
                              <img
                                src={thumbnailUrl}
                                alt={receipt.filename}
                                className="h-full w-full object-cover"
                                onLoad={() => URL.revokeObjectURL(thumbnailUrl)}
                              />
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center p-2">
                                <FileImage className="mb-2 h-8 w-8 text-muted-foreground" />
                                <span className="w-full truncate text-center text-xs text-muted-foreground">
                                  {isPdf ? "PDF" : receipt.filename.split(".").pop()?.toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Hover overlay with actions */}
                          <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => {
                                // View full receipt (could open in modal or new tab)
                                const fullUrl = URL.createObjectURL(receipt.blob);
                                window.open(fullUrl, "_blank");
                                setTimeout(() => URL.revokeObjectURL(fullUrl), 1000);
                              }}
                              className="rounded bg-card p-2.5 text-foreground hover:bg-muted"
                              title={t("receipts.viewFull")}
                            >
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReceipt(receipt.id)}
                              className="rounded bg-red-500 p-2.5 text-white hover:bg-red-600"
                              title={t("receipts.deleteReceipt")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Filename tooltip */}
                          <div className="mt-2">
                            <p
                              className="truncate text-xs text-muted-foreground"
                              title={receipt.filename}
                            >
                              {receipt.filename}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* New Receipt Upload */}
              {!showReceiptUpload && !attachedReceipt && (
                <button
                  type="button"
                  onClick={() => setShowReceiptUpload(true)}
                  className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Paperclip className="h-4 w-4" />
                  <span>{t("receipts.addNew")}</span>
                </button>
              )}

              {attachedReceipt && (
                <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      {t("receipts.newFile", { filename: attachedReceipt.name })}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedReceipt(null)}
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    {t("receipts.remove")}
                  </button>
                </div>
              )}

              {showReceiptUpload && !attachedReceipt && (
                <ReceiptUpload
                  onFileAccepted={(file) => {
                    setAttachedReceipt(file);
                    setShowReceiptUpload(false);
                  }}
                  onClose={() => setShowReceiptUpload(false)}
                  onDataExtracted={handleOCRDataExtracted}
                />
              )}
            </div>

            {/* Actions - Enhanced */}
            <div className="flex gap-4 border-t-2 border-gray-200 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[48px] flex-1 rounded-lg border-2 border-gray-300 px-6 py-3 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                {t("buttons.cancel")}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-lg bg-teal-500 px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-teal-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving && <Loader2 className="h-5 w-5 animate-spin" />}
                {isSaving
                  ? transaction
                    ? t("buttons.updating")
                    : t("buttons.adding")
                  : transaction
                    ? t("buttons.update")
                    : t("buttons.add")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
