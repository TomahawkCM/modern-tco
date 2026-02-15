"use client";

/**
 * Transactions Page Client Component
 * View, search, filter, and manage all transactions
 *
 * Phase 3 Mobile Enhancements:
 * - Swipe-to-delete gesture (Framer Motion)
 * - Sticky table headers with scroll shadow
 * - Pull-to-refresh on transaction list
 */

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Tag,
  FileImage,
  Split,
  Check,
  X as XIcon,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
  Receipt,
  Upload,
  ChevronDown,
  ChevronUp,
  Landmark,
  CreditCard,
} from "lucide-react";
import { motion, type PanInfo } from "framer-motion";
import {
  db,
  splitTransaction,
  unsplitTransaction,
  getSplitChildren,
  type SplitData,
} from "@/lib/budget-db";
import type { Transaction, Category, Account } from "@/types/budget";
import { sumAmounts, subtractAmounts } from "@/lib/money";
import { calculateRunningBalancesMap } from "@/lib/utils/balanceCalculations";
import { TransactionModal } from "@/components/budget/TransactionModal";
import { ReceiptThumbnail } from "@/components/budget/ReceiptThumbnail";
import { SplitTransactionModal } from "@/components/budget/SplitTransactionModal";
import { ConfirmDialog } from "@/components/budget/ConfirmDialog";
import { recordCorrection, categorizeTransaction } from "@/lib/categorization/rules";
import { useToast } from "@/components/budget/Toast";
import { HelpTooltip } from "@/components/budget/HelpTooltip";
import { EmptyState } from "@/components/budget/EmptyState";
import { StickyBulkActionsBar } from "@/components/budget/StickyBulkActionsBar";
import { QuickFiltersRow } from "@/components/budget/QuickFiltersRow";
import { QuickCategorizeDialog } from "@/components/budget/QuickCategorizeDialog";
import { BulkCategorizeConfirmation } from "@/components/budget/BulkCategorizeConfirmation";
import { TransactionReviewModal } from "@/components/budget/TransactionReviewModal";
import { extractVendorName } from "@/lib/vendor-matcher";
import { aiFindMatchingVendorTransactions } from "@/lib/ai-vendor-matcher";
import Link from "next/link";
import { TransactionSearchBar } from "@/components/budget/search";
import {
  initializeSearchIndex,
  searchTransactions,
  initializeAutocompleteCache,
} from "@/lib/search";
import { LinkToLoanButton } from "@/components/budget/loans/LinkToLoanPopover";
import { LinkedLoanBadgeInline } from "@/components/budget/loans/LinkedLoanBadge";
import { getPaymentByTransactionId, getAllLoans } from "@/lib/loans/loan-db";
import type { LoanPayment, Loan } from "@/types/budget";

export default function TransactionsPageClient() {
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Start ready - show UI immediately
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Read account filter from URL
  useEffect(() => {
    const accountParam = searchParams?.get("account");
    if (accountParam) {
      setSelectedAccount(accountParam);
    }
  }, [searchParams]);

  // Read search query from URL (from CommandPalette navigation)
  useEffect(() => {
    const searchParam = searchParams?.get("search");
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParams]);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [quickCategorizingId, setQuickCategorizingId] = useState<string | null>(null);

  // Split transaction modal state
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splittingTransaction, setSplittingTransaction] = useState<Transaction | null>(null);

  // Bulk selection state
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<Set<string>>(new Set());
  const [bulkCategory, setBulkCategory] = useState<string>("");
  const [bulkSubcategory, setBulkSubcategory] = useState<string>("");
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Phase 3: Mobile Enhancement State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  // Confirmation dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [unsplitConfirmOpen, setUnsplitConfirmOpen] = useState(false);
  const [unsplittingTransaction, setUnsplittingTransaction] = useState<Transaction | null>(null);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);

  // Vendor matching bulk categorization state
  const [showVendorBulkConfirm, setShowVendorBulkConfirm] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [matchingTransactions, setMatchingTransactions] = useState<Transaction[]>([]);
  const [isMatchingVendors, setIsMatchingVendors] = useState(false);
  const [isSavingTransaction, setIsSavingTransaction] = useState(false);
  const [pendingCategorization, setPendingCategorization] = useState<{
    transaction: Transaction;
    category: string;
    subcategory: string | null;
  } | null>(null);

  // Click-to-expand transaction descriptions state
  const [expandedTransactionIds, setExpandedTransactionIds] = useState<Set<string>>(new Set());

  // Loan-linked transactions cache
  const [linkedPayments, setLinkedPayments] = useState<
    Map<string, { payment: LoanPayment; loanName: string; loanId: string }>
  >(new Map());

  // Date range state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const mobileListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Pre-compute vendor names for all transactions (MEMOIZED for performance)
  // Avoids repeated regex operations during vendor matching
  const vendorCache = useMemo(() => {
    const cache = new Map<string, string>();
    transactions.forEach((tx) => {
      cache.set(tx.id, extractVendorName(tx.description));
    });
    return cache;
  }, [transactions]);

  // Filter and sort transactions (MEMOIZED for performance)
  // Enhanced with fuzzy search support via Fuse.js
  // NOTE: Must be defined here, before functions that depend on it
  const filteredTransactions = useMemo(() => {
    // Pre-compute start/end dates once if they exist
    const startDateTime = startDate ? new Date(startDate).getTime() : null;
    const endDateTime = endDate ? new Date(endDate).getTime() : null;

    // Start with all transactions or fuzzy search results
    let baseTransactions = transactions;

    // Use fuzzy search if search term is provided (3+ chars)
    if (searchTerm && searchTerm.length >= 2) {
      const searchResults = searchTransactions(searchTerm, { limit: 1000 });
      const matchedIds = new Set(searchResults.map((r) => r.item.id));
      baseTransactions = transactions.filter((tx) => matchedIds.has(tx.id));
    }

    return baseTransactions
      .filter((tx) => {
        // Account filter
        if (selectedAccount !== "all" && tx.accountId !== selectedAccount) {
          return false;
        }
        // Category filter
        if (selectedCategory !== "all" && tx.category !== selectedCategory) {
          return false;
        }
        // Date range filter
        if (startDateTime && new Date(tx.date).getTime() < startDateTime) {
          return false;
        }
        if (endDateTime && new Date(tx.date).getTime() > endDateTime) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const multiplier = sortDirection === "asc" ? 1 : -1;
        if (sortBy === "date") {
          return (new Date(a.date).getTime() - new Date(b.date).getTime()) * multiplier;
        } else {
          return (a.amount - b.amount) * multiplier;
        }
      });
  }, [
    transactions,
    searchTerm,
    selectedCategory,
    selectedAccount,
    sortBy,
    sortDirection,
    startDate,
    endDate,
  ]);

  // Get the selected account name for display
  const selectedAccountName = useMemo(() => {
    if (selectedAccount === "all") return null;
    const account = accounts.find((a) => a.id === selectedAccount);
    return account?.name || null;
  }, [selectedAccount, accounts]);

  // Function to clear account filter
  function clearAccountFilter() {
    setSelectedAccount("all");
    // Update URL to remove account param
    router.push("/budget-app/transactions");
  }

  // Memoize total calculations using precise decimal arithmetic
  const totalIncome = useMemo(() => {
    return sumAmounts(filteredTransactions.filter((tx) => tx.amount > 0).map((tx) => tx.amount));
  }, [filteredTransactions]);

  const totalExpenses = useMemo(() => {
    return Math.abs(
      sumAmounts(filteredTransactions.filter((tx) => tx.amount < 0).map((tx) => tx.amount))
    );
  }, [filteredTransactions]);

  // Calculate starting balance from all accounts
  // This represents the balance before the first imported transaction
  const startingBalance = useMemo(() => {
    return sumAmounts(accounts.map((acc) => acc.balance || 0));
  }, [accounts]);

  // Current balance = starting balance + net from transactions
  const currentBalance = useMemo(() => {
    return subtractAmounts(startingBalance + totalIncome, totalExpenses);
  }, [startingBalance, totalIncome, totalExpenses]);

  // Calculate running balances for all filtered transactions
  // Running balances show the account balance after each transaction
  // Note: We need transactions sorted by date ascending to calculate running balances correctly
  const runningBalances = useMemo(() => {
    if (filteredTransactions.length === 0) return new Map<string, number>();

    // Get account-specific opening balance based on filter
    let openingBalance = startingBalance;
    if (selectedAccount !== "all") {
      const account = accounts.find((a) => a.id === selectedAccount);
      openingBalance = account?.balance || 0;
    }

    // Sort by date ascending for running balance calculation
    const sortedByDate = [...filteredTransactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return calculateRunningBalancesMap(openingBalance, sortedByDate);
  }, [filteredTransactions, startingBalance, selectedAccount, accounts]);

  // Phase 3.3.3: Pull-to-refresh handler
  async function handlePullToRefresh() {
    if (isRefreshing) return;

    setIsRefreshing(true);
    await loadData();

    // Add small delay for better UX feedback
    setTimeout(() => {
      setIsRefreshing(false);
      setPullDistance(0);
    }, 500);
  }

  async function loadData() {
    try {
      const [allTxs, cats, accts, loans] = await Promise.all([
        db.transactions.toArray(),
        db.categories.toArray(),
        db.accounts.toArray(),
        getAllLoans(),
      ]);

      // Filter out parent transactions that have been split
      // Only show child transactions (which have splitFromId) and non-split transactions
      const visibleTxs = allTxs.filter((tx) => !tx.isSplit);

      setTransactions(visibleTxs);
      setCategories(cats);
      setAccounts(accts);

      // Initialize search index for fuzzy search
      initializeSearchIndex(visibleTxs, cats, accts);
      initializeAutocompleteCache(visibleTxs, cats);

      // Load linked payments for expense transactions
      const loanMap = new Map(loans.map((l) => [l.id, l]));
      const linkedPaymentsMap = new Map<
        string,
        { payment: LoanPayment; loanName: string; loanId: string }
      >();

      // Check transactions that look like loan payments (category starts with "Loan Payment")
      const potentialLoanPayments = visibleTxs.filter(
        (tx) => tx.amount < 0 && tx.category?.startsWith("Loan Payment")
      );

      // Batch check for linked payments
      await Promise.all(
        potentialLoanPayments.map(async (tx) => {
          const payment = await getPaymentByTransactionId(tx.id);
          if (payment) {
            const loan = loanMap.get(payment.loanId);
            if (loan) {
              linkedPaymentsMap.set(tx.id, {
                payment,
                loanName: loan.name,
                loanId: loan.id,
              });
            }
          }
        })
      );

      setLinkedPayments(linkedPaymentsMap);
    } catch (error) {
      console.error("Error loading transactions:", error);
      // On timeout or error, show empty state - user can add transactions or refresh
    } finally {
      setIsLoading(false);
    }
  }

  // Handle new category created in TransactionModal
  function handleCategoryCreated(newCategory: Category) {
    setCategories((prev) => [...prev, newCategory]);
  }

  async function runVendorMatching(transaction: Transaction) {
    if (!transaction.category) {
      console.log("[Vendor Matching] Skipping: no category on transaction", transaction.id);
      return;
    }

    try {
      const currentVendor = extractVendorName(transaction.description);

      if (!currentVendor) {
        console.log(
          "[Vendor Matching] Skipping: could not extract vendor name for",
          transaction.id
        );
        return;
      }

      // Build deterministic candidate set: exact normalized vendor match only
      const deterministicMatches = transactions.filter((tx) => {
        if (tx.id === transaction.id) return false;
        const txVendor = vendorCache.get(tx.id) || extractVendorName(tx.description);
        return txVendor === currentVendor;
      });

      setIsMatchingVendors(true);
      toast.info(`🔍 Searching for other "${currentVendor}" transactions...`, 3000);

      const perfStart = performance.now();

      // Start with strict deterministic matches
      let matches = deterministicMatches;

      // Optional: only if no deterministic matches, fall back to AI as a helper
      if (matches.length === 0) {
        matches = await aiFindMatchingVendorTransactions(transaction, transactions, vendorCache);
      }

      const perfEnd = performance.now();
      const searchTime = ((perfEnd - perfStart) / 1000).toFixed(1);

      if (matches.length >= 1) {
        console.log("[Vendor Matching] Matches found, opening bulk dialog for", transaction.id);
        toast.success(
          `✓ Found ${matches.length} matching "${currentVendor}" transactions (${searchTime}s)`
        );

        setPendingCategorization({
          transaction,
          category: transaction.category,
          subcategory: transaction.subcategory || null,
        });
        setMatchingTransactions(matches);
        setShowVendorBulkConfirm(true);
      } else {
        toast.info(`No other "${currentVendor}" transactions found (${searchTime}s)`);
      }
    } catch (error) {
      console.error("[Vendor Matching] Error during AI vendor matching:", error);
      toast.error(
        "Vendor matching failed. Transaction was saved, but matches could not be loaded."
      );
    } finally {
      setIsMatchingVendors(false);
    }
  }

  async function saveTransaction(transaction: Transaction) {
    setIsSavingTransaction(true);
    try {
      // 🔥 VISUAL PROOF: New code is loaded (remove after testing)
      if (process.env.NODE_ENV === "development" && editingTransaction) {
        console.log(
          "🟢 NEW CODE v2.2 - saveTransaction with vendor matching (non-blocking DB save)"
        );
      }

      const isEdit = !!editingTransaction;
      const shouldRunVendorMatching = isEdit && !!transaction.category;

      // 🔥 CRITICAL FIX: Optimistic update BEFORE database save (like quickCategorize)
      // This ensures vendor matching sees the UPDATED transaction in the array
      if (isEdit) {
        setTransactions((prev) => prev.map((tx) => (tx.id === transaction.id ? transaction : tx)));
      }

      // Save to database
      if (isEdit) {
        const { id, ...updates } = transaction;
        // Fire-and-forget DB update to avoid blocking UI on IndexedDB issues
        void db.transactions.update(id, updates).catch((error) => {
          console.error("[Transactions] Dexie update error:", error);
        });
      } else {
        void db.transactions.add(transaction).catch((error) => {
          console.error("[Transactions] Dexie add error:", error);
        });
      }

      // Close modal immediately after save
      console.log("[Transactions] Save triggered, closing modal for", transaction.id);
      setShowModal(false);
      setEditingTransaction(null);
      if (!shouldRunVendorMatching) {
        // Refresh transactions list asynchronously
        void loadData();
      } else {
        // Run vendor matching asynchronously without blocking modal close
        void runVendorMatching(transaction);
      }
    } catch (error) {
      console.error("❌ Error saving transaction:", error);
      toast.error("Failed to save transaction");
      void loadData(); // Reload on error to ensure consistency
    } finally {
      setIsSavingTransaction(false);
    }
  }

  function initiateDeleteTransaction(transaction: Transaction) {
    setDeletingTransaction(transaction);
    setDeleteConfirmOpen(true);
  }

  async function confirmDeleteTransaction() {
    if (!deletingTransaction) return;

    try {
      // If this is a split child, check if we should unsplit
      if (deletingTransaction.splitFromId) {
        const siblings = await getSplitChildren(deletingTransaction.splitFromId);
        if (siblings.length === 1) {
          // Last child - ask if they want to restore original transaction
          const shouldRestore = await toast.confirm(
            "This is the last split item. Restore the original transaction?"
          );
          if (shouldRestore) {
            await unsplitTransaction(deletingTransaction.splitFromId);
          } else {
            // Just delete this transaction
            await db.transactions.delete(deletingTransaction.id);
          }
        } else {
          await db.transactions.delete(deletingTransaction.id);
        }
      } else {
        await db.transactions.delete(deletingTransaction.id);
      }

      await loadData();
      toast.success("Transaction deleted successfully");
      setDeleteConfirmOpen(false);
      setDeletingTransaction(null);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
      // Keep dialog open on error
    }
  }

  function openSplitModal(transaction: Transaction) {
    setSplittingTransaction(transaction);
    setShowSplitModal(true);
  }

  async function handleSaveSplit(splits: SplitData[]) {
    if (!splittingTransaction) return;

    try {
      await splitTransaction(splittingTransaction, splits);
      await loadData();
      setShowSplitModal(false);
      setSplittingTransaction(null);
    } catch (error) {
      console.error("Error saving split:", error);
      throw error;
    }
  }

  function initiateUnsplit(transaction: Transaction) {
    if (!transaction.splitFromId) return;
    setUnsplittingTransaction(transaction);
    setUnsplitConfirmOpen(true);
  }

  async function confirmUnsplit() {
    if (!unsplittingTransaction?.splitFromId) return;

    try {
      await unsplitTransaction(unsplittingTransaction.splitFromId);
      await loadData();
      toast.success("Transaction unsplit successfully");
      setUnsplitConfirmOpen(false);
      setUnsplittingTransaction(null);
    } catch (error) {
      console.error("Error unsplitting:", error);
      toast.error("Failed to unsplit transaction");
      // Keep dialog open on error
    }
  }

  // Bulk selection functions (MEMOIZED for performance)
  const toggleSelectTransaction = useCallback(
    (id: string) => {
      const newSelected = new Set(selectedTransactionIds);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      setSelectedTransactionIds(newSelected);
      setShowBulkActions(newSelected.size > 0);
    },
    [selectedTransactionIds]
  );

  const selectAllVisible = useCallback(() => {
    const visibleIds = new Set(filteredTransactions.map((tx) => tx.id));
    setSelectedTransactionIds(visibleIds);
    setShowBulkActions(visibleIds.size > 0);
  }, [filteredTransactions]);

  const clearSelection = useCallback(() => {
    setSelectedTransactionIds(new Set());
    setShowBulkActions(false);
    setBulkCategory("");
    setBulkSubcategory("");
  }, []);

  function initiateBulkCategorization() {
    if (!bulkCategory) {
      toast.warning("Please select a category");
      return;
    }

    if (selectedTransactionIds.size === 0) {
      toast.warning("Please select transactions to categorize");
      return;
    }

    setBulkConfirmOpen(true);
  }

  async function confirmBulkCategorization() {
    try {
      for (const id of selectedTransactionIds) {
        await db.transactions.update(id, {
          category: bulkCategory,
          subcategory: bulkSubcategory || null,
          updatedAt: new Date(),
        });
      }

      await loadData();
      clearSelection();
      toast.success(`Successfully categorized ${selectedTransactionIds.size} transaction(s)`);
      setBulkConfirmOpen(false);
    } catch (error) {
      console.error("Error bulk categorizing:", error);
      toast.error("Failed to categorize transactions");
      // Keep dialog open on error
    }
  }

  // Handle bulk categorization from sticky bar
  async function handleBulkCategoryApply(category: string, subcategory: string) {
    try {
      for (const id of selectedTransactionIds) {
        await db.transactions.update(id, {
          category,
          subcategory: subcategory || null,
          updatedAt: new Date(),
        });
      }

      await loadData();
      clearSelection();
      toast.success(`Successfully categorized ${selectedTransactionIds.size} transaction(s)`);
    } catch (error) {
      console.error("Error bulk categorizing:", error);
      toast.error("Failed to categorize transactions");
    }
  }

  // Handle date range filtering from quick filters
  function handleDateRangeChange(preset: string) {
    const now = new Date();
    let start: Date;
    const end: Date = now;

    switch (preset) {
      case "this-month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "last-30":
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "last-90":
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "this-year":
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return;
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  }

  async function quickCategorize(
    transaction: Transaction,
    categoryName: string,
    subcategoryName: string | null
  ) {
    const perfStart = performance.now();
    try {
      const updated = {
        ...transaction,
        category: categoryName,
        subcategory: subcategoryName,
        updatedAt: new Date(),
      };

      // Optimistic update - update UI immediately
      setTransactions((prev) => prev.map((tx) => (tx.id === transaction.id ? updated : tx)));

      const dbStart = performance.now();
      await db.transactions.update(transaction.id, updated);
      const dbEnd = performance.now();
      console.log(`[Performance] DB update: ${(dbEnd - dbStart).toFixed(2)}ms`);

      // Learn from this correction (non-blocking)
      const autoCategorization = categorizeTransaction(transaction.description);
      recordCorrection({
        originalDescription: transaction.description,
        suggestedCategory: autoCategorization?.category || "Uncategorized",
        suggestedSubcategory: autoCategorization?.subcategory,
        correctedCategory: categoryName,
        correctedSubcategory: subcategoryName || undefined,
        timestamp: new Date(),
      });

      const perfEnd = performance.now();
      console.log(
        `[Performance] Total quickCategorize (optimized): ${(perfEnd - perfStart).toFixed(2)}ms`
      );

      toast.success(
        `Categorized as ${categoryName}${subcategoryName ? ` - ${subcategoryName}` : ""}`
      );
    } catch (error) {
      console.error("Error quick categorizing:", error);
      toast.error("Failed to categorize transaction");
      // Reload on error to ensure consistency
      await loadData();
    }
  }

  // Bulk categorize matching vendor transactions
  function bulkCategorizeVendorTransactions(
    transactionIds: string[],
    category: string,
    subcategory: string | null
  ) {
    const updatedAt = new Date();

    // 1) Optimistic UI update – instant
    setTransactions((prev) =>
      prev.map((tx) =>
        transactionIds.includes(tx.id) ? { ...tx, category, subcategory, updatedAt } : tx
      )
    );

    // 2) Fire-and-forget Dexie updates in the background
    void (async () => {
      try {
        const perfStart = performance.now();

        await Promise.all(
          transactionIds.map((id) =>
            db.transactions.update(id, { category, subcategory, updatedAt })
          )
        );

        const perfEnd = performance.now();
        console.log(
          `[Performance] Bulk categorize ${transactionIds.length} transactions: ${(
            perfEnd - perfStart
          ).toFixed(2)}ms`
        );

        toast.success(
          `Categorized ${transactionIds.length} transactions as ${category}${
            subcategory ? ` - ${subcategory}` : ""
          }`
        );
      } catch (error) {
        console.error("Error bulk categorizing:", error);
        toast.error("Failed to bulk categorize transactions");
        // Reload on error to ensure consistency
        await loadData();
      }
    })();
  }

  // Handle "Apply to All" button in bulk confirmation
  async function handleApplyToAll() {
    if (!pendingCategorization) return;

    bulkCategorizeVendorTransactions(
      matchingTransactions.map((tx) => tx.id),
      pendingCategorization.category,
      pendingCategorization.subcategory
    );

    // Close dialogs and clear state
    setShowVendorBulkConfirm(false);
    setPendingCategorization(null);
    setMatchingTransactions([]);
  }

  // Handle "Review First" button in bulk confirmation
  function handleReviewFirst() {
    setShowVendorBulkConfirm(false);
    setShowReviewModal(true);
  }

  // Handle applying to selected transactions from review modal
  async function handleApplySelected(selectedIds: string[]) {
    if (!pendingCategorization || selectedIds.length === 0) return;

    bulkCategorizeVendorTransactions(
      selectedIds,
      pendingCategorization.category,
      pendingCategorization.subcategory
    );

    // Close modal and clear state
    setShowReviewModal(false);
    setPendingCategorization(null);
    setMatchingTransactions([]);
  }

  // Toggle transaction description expansion (MEMOIZED for performance)
  const toggleExpanded = useCallback((id: string) => {
    setExpandedTransactionIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // No blocking loading state - UI renders immediately, data loads in background

  return (
    <div className="space-y-6">
      {/* Sticky Bulk Actions Bar */}
      <StickyBulkActionsBar
        selectedCount={selectedTransactionIds.size}
        categories={categories}
        onApplyCategory={handleBulkCategoryApply}
        onClearSelection={clearSelection}
      />

      {/* Quick Filters Row */}
      <QuickFiltersRow
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onDateRangeChange={handleDateRangeChange}
        onClearFilters={() => {
          setSearchTerm("");
          setSelectedCategory("all");
          setSelectedAccount("all");
          setStartDate("");
          setEndDate("");
          router.push("/budget-app/transactions");
        }}
        hasActiveFilters={
          searchTerm !== "" ||
          selectedCategory !== "all" ||
          selectedAccount !== "all" ||
          startDate !== "" ||
          endDate !== ""
        }
      />

      {/* Header - Enhanced Typography */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-white">Transactions</h1>
            <HelpTooltip
              content={
                <>
                  <strong>Split Transactions:</strong> Divide a single purchase across multiple
                  categories. Example: Grocery store visit ($100) → Groceries ($80) + Household
                  ($20). Click the Split button on any transaction to divide it.
                </>
              }
              learnMoreUrl="/docs/user-guide#split-transactions"
              ariaLabel="More information about transaction features"
              iconSize="h-5 w-5"
            />
          </div>
          <p className="mt-2 text-lg font-medium text-slate-400">
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTransaction(null);
            setShowModal(true);
          }}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-teal-500 px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-teal-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          <Plus className="h-5 w-5" />
          Add Transaction
        </button>
      </div>

      {/* Filters and Search - Enhanced with Date Range */}
      <div className="rounded-lg bg-card p-4 shadow">
        <div className="space-y-4">
          {/* Top Row: Search and Category */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Search */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <label
                  htmlFor="search-transactions"
                  className="text-sm font-medium text-foreground"
                >
                  Search Transactions
                </label>
                <HelpTooltip
                  content="Fuzzy search by description, merchant, category, notes, or amount. Try 'coffee last week' or '$50-100'."
                  learnMoreUrl="/docs/user-guide#search-transactions"
                  ariaLabel="More information about searching transactions"
                />
              </div>
              <TransactionSearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                transactions={transactions}
                categories={categories}
                resultCount={searchTerm ? filteredTransactions.length : undefined}
                placeholder="Try 'coffee last week' or 'amount:>50'..."
              />
            </div>

            {/* Account Filter */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <label htmlFor="account-filter" className="text-sm font-medium text-foreground">
                  Filter by Account
                </label>
              </div>
              <select
                id="account-filter"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-base text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <option value="all">All Accounts</option>
                {accounts.map((acct) => (
                  <option key={acct.id} value={acct.id}>
                    {acct.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <label htmlFor="category-filter" className="text-sm font-medium text-foreground">
                  Filter by Category
                </label>
                <HelpTooltip
                  content="Show only transactions from specific categories. You can select multiple categories at once using bulk actions."
                  learnMoreUrl="/docs/user-guide#filter-transactions"
                  ariaLabel="More information about filtering by category"
                />
              </div>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-base text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bottom Row: Date Range and Sort */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Start Date */}
            <div>
              <label htmlFor="start-date" className="mb-1 block text-sm font-medium text-gray-700">
                From Date
              </label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              />
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="end-date" className="mb-1 block text-sm font-medium text-gray-700">
                To Date
              </label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              />
            </div>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "amount")}
              className="rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
            </select>

            {/* Sort Direction */}
            <select
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value as "asc" | "desc")}
              className="rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm ||
            selectedCategory !== "all" ||
            selectedAccount !== "all" ||
            startDate ||
            endDate) && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedAccount("all");
                  setStartDate("");
                  setEndDate("");
                  // Clear URL params
                  router.push("/budget-app/transactions");
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                <XIcon className="h-4 w-4" />
                Clear Filters
              </button>
            </div>
          )}

          {/* Account Filter Banner */}
          {selectedAccountName && (
            <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800">
                  Showing transactions for <strong>{selectedAccountName}</strong>
                </span>
              </div>
              <button
                onClick={clearAccountFilter}
                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                <XIcon className="h-4 w-4" />
                Show All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards - Enhanced Typography */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border-l-4 border-green-500 bg-white p-6 shadow-md">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" aria-hidden="true" />
            <p className="text-base font-medium text-gray-700">Total Income</p>
          </div>
          <p className="flex items-center gap-2 text-3xl font-bold text-green-600">
            <ArrowUp className="h-6 w-6" aria-hidden="true" />
            <span className="sr-only">Income: </span>${totalIncome.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg border-l-4 border-red-500 bg-white p-6 shadow-md">
          <div className="mb-3 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-600" aria-hidden="true" />
            <p className="text-base font-medium text-gray-700">Total Expenses</p>
          </div>
          <p className="flex items-center gap-2 text-3xl font-bold text-red-600">
            <ArrowDown className="h-6 w-6" aria-hidden="true" />
            <span className="sr-only">Expense: </span>${totalExpenses.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg border-l-4 border-blue-500 bg-white p-6 shadow-md">
          <div className="mb-3 flex items-center gap-2">
            <p className="text-base font-medium text-gray-700">Current Balance</p>
            {startingBalance !== 0 && (
              <HelpTooltip
                content={`Starting balance: $${startingBalance.toFixed(2)} + Net change: $${(totalIncome - totalExpenses).toFixed(2)}`}
              />
            )}
          </div>
          <p
            className={`flex items-center gap-2 text-3xl font-bold ${
              currentBalance >= 0 ? "text-blue-600" : "text-red-600"
            }`}
          >
            {currentBalance >= 0 ? (
              <>
                <ArrowUp className="h-6 w-6" aria-hidden="true" />
                <span className="sr-only">Positive: </span>
              </>
            ) : (
              <>
                <ArrowDown className="h-6 w-6" aria-hidden="true" />
                <span className="sr-only">Negative: </span>
              </>
            )}
            ${Math.abs(currentBalance).toFixed(2)}
          </p>
          {startingBalance === 0 && (
            <p className="mt-2 text-xs text-gray-500">
              <Link href="/budget-app/accounts" className="text-blue-600 hover:underline">
                Set account starting balance →
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Transactions Table - Modern responsive design with natural scrolling */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        {filteredTransactions.length > 0 ? (
          <>
            {/* Desktop Table View (≥768px) - Natural page scrolling */}
            <div className="hidden md:block">
              <table className="w-full table-fixed">
                <thead className="sticky top-0 z-20 border-b border-gray-200 bg-gray-50 shadow-sm">
                  <tr>
                    <th className="w-12 bg-gray-50 px-4 py-3 text-left md:px-6">
                      <input
                        type="checkbox"
                        checked={
                          filteredTransactions.length > 0 &&
                          filteredTransactions.every((tx) => selectedTransactionIds.has(tx.id))
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            selectAllVisible();
                          } else {
                            clearSelection();
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                        title="Select all visible transactions"
                      />
                    </th>
                    <th className="w-28 bg-gray-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 md:px-6">
                      Date
                    </th>
                    <th className="bg-gray-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 md:px-6">
                      Description
                    </th>
                    <th className="hidden w-36 bg-gray-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 sm:table-cell md:px-6">
                      Category
                    </th>
                    <th className="hidden w-24 bg-gray-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700 md:px-6 lg:table-cell">
                      Receipt
                    </th>
                    <th className="w-28 bg-gray-50 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700 md:px-6">
                      Amount
                    </th>
                    <th className="hidden w-28 bg-gray-50 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700 md:px-6 xl:table-cell">
                      Balance
                    </th>
                    <th className="w-28 bg-gray-50 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700 md:px-6">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className={`transition-colors hover:bg-gray-50/50 ${selectedTransactionIds.has(tx.id) ? "bg-teal-50/50" : ""}`}
                    >
                      <td className="whitespace-nowrap px-4 py-4 md:px-6">
                        <input
                          type="checkbox"
                          checked={selectedTransactionIds.has(tx.id)}
                          onChange={() => toggleSelectTransaction(tx.id)}
                          className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900 md:px-6">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className="max-w-xs px-4 py-4 text-sm text-gray-900 md:px-6">
                        <div>
                          <div
                            className="group flex cursor-pointer items-center gap-2 transition-colors hover:text-teal-600"
                            onClick={() => toggleExpanded(tx.id)}
                          >
                            <span
                              className={`font-semibold ${expandedTransactionIds.has(tx.id) ? "whitespace-normal break-words" : "truncate"}`}
                            >
                              {tx.description}
                            </span>
                            {expandedTransactionIds.has(tx.id) ? (
                              <ChevronUp className="h-4 w-4 flex-shrink-0 text-teal-600" />
                            ) : (
                              <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-teal-600" />
                            )}
                            {tx.splitFromId && (
                              <span className="inline-flex flex-shrink-0 items-center rounded bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700">
                                Split
                              </span>
                            )}
                          </div>
                          {tx.notes && (
                            <div
                              className={`mt-1 text-xs text-gray-600 ${expandedTransactionIds.has(tx.id) ? "whitespace-normal break-words" : "truncate"}`}
                            >
                              {tx.notes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="hidden whitespace-nowrap px-4 py-4 sm:table-cell md:px-6">
                        {tx.category ? (
                          <span className="inline-flex items-center rounded-full bg-teal-100 px-2.5 py-1 text-xs font-medium text-teal-800">
                            {tx.category}
                            {tx.subcategory && ` • ${tx.subcategory}`}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-800">
                            Uncategorized
                          </span>
                        )}
                      </td>
                      <td className="hidden whitespace-nowrap px-4 py-4 md:px-6 lg:table-cell">
                        <ReceiptThumbnail transactionId={tx.id} onReceiptDeleted={loadData} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right md:px-6">
                        <div className="flex items-center justify-end gap-1.5">
                          {tx.amount > 0 ? (
                            <>
                              <ArrowUp className="h-4 w-4 text-green-600" aria-hidden="true" />
                              <span className="text-sm font-semibold text-green-600">
                                <span className="sr-only">Income: </span>
                                +${Math.abs(tx.amount).toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <>
                              <ArrowDown className="h-4 w-4 text-red-600" aria-hidden="true" />
                              <span className="text-sm font-semibold text-red-600">
                                <span className="sr-only">Expense: </span>
                                -${Math.abs(tx.amount).toFixed(2)}
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="hidden whitespace-nowrap px-4 py-4 text-right md:px-6 xl:table-cell">
                        {(() => {
                          const balance = runningBalances.get(tx.id);
                          if (balance === undefined) return null;
                          const isNegative = balance < 0;
                          return (
                            <span
                              className={`text-sm font-medium ${isNegative ? "text-red-600" : "text-gray-700"}`}
                            >
                              $
                              {Math.abs(balance).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right md:px-6">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Categorize for uncategorized transactions */}
                          {!tx.category && (
                            <button
                              onClick={() => setQuickCategorizingId(tx.id)}
                              className="rounded-md p-1.5 text-green-600 transition-colors hover:bg-green-50 hover:text-green-700"
                              title="Quick Categorize"
                            >
                              <Tag className="h-4 w-4" />
                            </button>
                          )}

                          {/* Link to Loan / Linked Loan Badge */}
                          {linkedPayments.has(tx.id) ? (
                            <LinkedLoanBadgeInline
                              loanName={linkedPayments.get(tx.id)!.loanName}
                              loanId={linkedPayments.get(tx.id)!.loanId}
                              paymentId={linkedPayments.get(tx.id)!.payment.id}
                              onUnlink={loadData}
                            />
                          ) : tx.amount < 0 && !tx.category?.startsWith("Loan Payment") ? (
                            <LinkToLoanButton transaction={tx} onLinked={loadData} />
                          ) : null}

                          {/* Split/Unsplit Button */}
                          {tx.splitFromId ? (
                            <button
                              onClick={() => initiateUnsplit(tx)}
                              className="rounded-md p-1.5 text-teal-600 transition-colors hover:bg-teal-50 hover:text-teal-700"
                              title="Unsplit transaction"
                            >
                              <Split className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => openSplitModal(tx)}
                              className="rounded-md p-1.5 text-teal-600 transition-colors hover:bg-teal-50 hover:text-teal-700"
                              title="Split transaction"
                            >
                              <Split className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setEditingTransaction(tx);
                              setShowModal(true);
                            }}
                            className="rounded-md p-1.5 text-teal-600 transition-colors hover:bg-teal-50 hover:text-teal-700"
                            title="Edit"
                            aria-label="Edit transaction"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => initiateDeleteTransaction(tx)}
                            className="rounded-md p-1.5 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                            title="Delete"
                            aria-label="Delete transaction"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (<768px) - Phase 3.3.3: Pull-to-refresh + Phase 3.3.1: Swipe-to-delete */}
            <div
              ref={mobileListRef}
              className="relative md:hidden"
              onTouchStart={(e) => {
                const list = mobileListRef.current;
                if (list && list.scrollTop === 0) {
                  const startY = e.touches[0].clientY;
                  setPullDistance(0);

                  const handleTouchMove = (moveEvent: TouchEvent) => {
                    const currentY = moveEvent.touches[0].clientY;
                    const distance = Math.max(0, currentY - startY);
                    if (distance > 0 && distance < 120) {
                      moveEvent.preventDefault();
                      setPullDistance(distance);
                    }
                  };

                  const handleTouchEnd = () => {
                    if (pullDistance > 80) {
                      handlePullToRefresh();
                    } else {
                      setPullDistance(0);
                    }
                    document.removeEventListener("touchmove", handleTouchMove);
                    document.removeEventListener("touchend", handleTouchEnd);
                  };

                  document.addEventListener("touchmove", handleTouchMove, { passive: false });
                  document.addEventListener("touchend", handleTouchEnd);
                }
              }}
            >
              {/* Pull-to-refresh indicator */}
              {(pullDistance > 0 || isRefreshing) && (
                <div
                  className="absolute left-0 right-0 top-0 z-10 flex items-center justify-center py-4 transition-opacity"
                  style={{
                    transform: `translateY(-${isRefreshing ? 0 : Math.max(0, 50 - pullDistance)}px)`,
                    opacity: Math.min(1, pullDistance / 80),
                  }}
                >
                  <RefreshCw
                    className={`h-6 w-6 text-teal-600 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  {!isRefreshing && pullDistance > 80 && (
                    <span className="ml-2 text-sm font-medium text-teal-600">
                      Release to refresh
                    </span>
                  )}
                  {!isRefreshing && pullDistance > 0 && pullDistance <= 80 && (
                    <span className="ml-2 text-sm text-gray-600">Pull to refresh</span>
                  )}
                </div>
              )}

              <div
                className="space-y-6 p-4"
                style={{ marginTop: pullDistance > 0 ? `${Math.min(pullDistance, 100)}px` : 0 }}
              >
                {filteredTransactions.map((tx) => (
                  <motion.div
                    key={tx.id}
                    drag="x"
                    dragConstraints={{ left: -100, right: 0 }}
                    dragElastic={0.1}
                    onDragEnd={(event, info: PanInfo) => {
                      // Phase 3.3.1: Swipe-to-delete gesture
                      if (info.offset.x < -80) {
                        initiateDeleteTransaction(tx);
                      }
                    }}
                    className={`relative rounded-lg border-2 bg-white p-5 shadow-md transition-colors ${
                      selectedTransactionIds.has(tx.id)
                        ? "border-teal-500 bg-teal-50"
                        : "border-gray-300"
                    }`}
                  >
                    {/* Delete indicator on swipe */}
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex w-20 items-center justify-center rounded-r-lg bg-red-500">
                      <Trash2 className="h-6 w-6 text-white" />
                    </div>

                    {/* Card Header: Checkbox + Description + Amount */}
                    <div className="mb-5 flex items-start gap-4">
                      {/* Selection Checkbox */}
                      <div className="flex-shrink-0 pt-2">
                        <input
                          type="checkbox"
                          checked={selectedTransactionIds.has(tx.id)}
                          onChange={() => toggleSelectTransaction(tx.id)}
                          className="h-6 w-6 rounded border-gray-300 text-teal-600 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      {/* Description + Split Badge */}
                      <div className="min-w-0 flex-1">
                        <div
                          className="group mb-2 flex cursor-pointer items-center gap-2 transition-colors hover:text-teal-600"
                          onClick={() => toggleExpanded(tx.id)}
                        >
                          <h3
                            className={`text-lg font-bold text-gray-900 ${expandedTransactionIds.has(tx.id) ? "whitespace-normal break-words" : "truncate"}`}
                          >
                            {tx.description}
                          </h3>
                          {expandedTransactionIds.has(tx.id) ? (
                            <ChevronUp className="h-5 w-5 flex-shrink-0 text-teal-600" />
                          ) : (
                            <ChevronDown className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-teal-600" />
                          )}
                          {tx.splitFromId && (
                            <span className="inline-flex flex-shrink-0 items-center rounded bg-teal-100 px-2.5 py-1 text-sm font-medium text-teal-700">
                              Split
                            </span>
                          )}
                        </div>

                        {/* Notes */}
                        {tx.notes && (
                          <p
                            className={`mt-2 text-base text-gray-600 ${expandedTransactionIds.has(tx.id) ? "whitespace-normal break-words" : "truncate"}`}
                          >
                            {tx.notes}
                          </p>
                        )}
                      </div>

                      {/* Amount */}
                      <div className="flex-shrink-0 text-right">
                        <div className="flex flex-col items-end gap-1">
                          {tx.amount > 0 ? (
                            <>
                              <div className="flex items-center gap-1.5">
                                <ArrowUp className="h-5 w-5 text-green-600" aria-hidden="true" />
                                <span className="text-sm font-semibold text-green-600">Income</span>
                              </div>
                              <p className="text-2xl font-bold text-green-600">
                                <span className="sr-only">Income: </span>
                                +${Math.abs(tx.amount).toFixed(2)}
                              </p>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-1.5">
                                <ArrowDown className="h-5 w-5 text-red-600" aria-hidden="true" />
                                <span className="text-sm font-semibold text-red-600">Expense</span>
                              </div>
                              <p className="text-2xl font-bold text-red-600">
                                <span className="sr-only">Expense: </span>
                                -${Math.abs(tx.amount).toFixed(2)}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Body: Category + Date */}
                    <div className="mb-5 flex items-center gap-4">
                      {/* Category Badge */}
                      <div className="flex-1">
                        {tx.category ? (
                          <span className="inline-flex items-center rounded-full bg-teal-100 px-3 py-1.5 text-sm font-medium text-teal-800">
                            {tx.category}
                            {tx.subcategory && ` • ${tx.subcategory}`}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-800">
                            Uncategorized
                          </span>
                        )}
                      </div>

                      {/* Date */}
                      <div className="whitespace-nowrap text-base font-medium text-gray-600">
                        {new Date(tx.date).toLocaleDateString()}
                      </div>

                      {/* Running Balance */}
                      {runningBalances.get(tx.id) !== undefined && (
                        <div className="text-right">
                          <span className="text-xs uppercase text-gray-500">Balance</span>
                          <p
                            className={`text-sm font-semibold ${(runningBalances.get(tx.id) || 0) < 0 ? "text-red-600" : "text-gray-700"}`}
                          >
                            $
                            {Math.abs(runningBalances.get(tx.id) || 0).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Receipt Thumbnail */}
                    <div className="mb-4">
                      <ReceiptThumbnail transactionId={tx.id} onReceiptDeleted={loadData} />
                    </div>

                    {/* Card Footer: Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Quick Categorize for uncategorized transactions */}
                      {!tx.category && (
                        <button
                          onClick={() => setQuickCategorizingId(tx.id)}
                          className="inline-flex min-h-[44px] items-center gap-2.5 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
                        >
                          <Tag className="h-4 w-4" />
                          Categorize
                        </button>
                      )}

                      {/* Link to Loan / Linked Loan Badge (Mobile) */}
                      {linkedPayments.has(tx.id) ? (
                        <div className="inline-flex min-h-[44px] items-center gap-2.5 rounded-lg bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
                          <CreditCard className="h-4 w-4" />
                          <LinkedLoanBadgeInline
                            loanName={linkedPayments.get(tx.id)!.loanName}
                            loanId={linkedPayments.get(tx.id)!.loanId}
                            paymentId={linkedPayments.get(tx.id)!.payment.id}
                            onUnlink={loadData}
                          />
                        </div>
                      ) : tx.amount < 0 && !tx.category?.startsWith("Loan Payment") ? (
                        <div className="relative">
                          <LinkToLoanButton transaction={tx} onLinked={loadData} />
                        </div>
                      ) : null}

                      {/* Split/Unsplit Button */}
                      {tx.splitFromId ? (
                        <button
                          onClick={() => initiateUnsplit(tx)}
                          className="inline-flex min-h-[44px] items-center gap-2.5 rounded-lg bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-100"
                          title="Unsplit transaction"
                        >
                          <Split className="h-4 w-4" />
                          Unsplit
                        </button>
                      ) : (
                        <button
                          onClick={() => openSplitModal(tx)}
                          className="inline-flex min-h-[44px] items-center gap-2.5 rounded-lg bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-100"
                          title="Split transaction"
                        >
                          <Split className="h-4 w-4" />
                          Split
                        </button>
                      )}

                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          setEditingTransaction(tx);
                          setShowModal(true);
                        }}
                        className="inline-flex min-h-[44px] items-center gap-2.5 rounded-lg bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-100"
                        title="Edit"
                        aria-label="Edit transaction"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => initiateDeleteTransaction(tx)}
                        className="inline-flex min-h-[44px] items-center gap-2.5 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                        title="Delete"
                        aria-label="Delete transaction"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            icon={Receipt}
            heading="No Transactions Yet"
            description="Start tracking your spending by adding your first transaction. You can add manually or import from a CSV file."
            primaryCTA={{
              label: "Add Transaction",
              href: "/budget-app/transactions",
              icon: Plus,
            }}
            secondaryCTA={{
              label: "Import CSV",
              href: "/budget-app/import",
              icon: Upload,
            }}
          />
        )}
      </div>

      {/* Split Transaction Modal */}
      {showSplitModal && splittingTransaction && (
        <SplitTransactionModal
          transaction={splittingTransaction}
          categories={categories}
          onSave={handleSaveSplit}
          onClose={() => {
            setShowSplitModal(false);
            setSplittingTransaction(null);
          }}
        />
      )}

      {/* Transaction Modal */}
      {showModal && (
        <TransactionModal
          transaction={editingTransaction}
          categories={categories}
          accounts={accounts}
          onSave={saveTransaction}
          onClose={() => {
            setShowModal(false);
            setEditingTransaction(null);
          }}
          isSaving={isSavingTransaction}
          onCategoryCreated={handleCategoryCreated}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDeleteTransaction}
        title="Delete Transaction"
        description="This action cannot be undone."
        impact={
          deletingTransaction
            ? {
                title: "You will lose:",
                items: [
                  `$${Math.abs(deletingTransaction.amount).toFixed(2)} ${deletingTransaction.amount > 0 ? "income" : "expense"} from ${new Date(deletingTransaction.date).toLocaleDateString()}`,
                  `Description: "${deletingTransaction.description}"`,
                  deletingTransaction.category
                    ? `Category: ${deletingTransaction.category}${deletingTransaction.subcategory ? ` - ${deletingTransaction.subcategory}` : ""}`
                    : null,
                  deletingTransaction.notes ? `Notes: "${deletingTransaction.notes}"` : null,
                  deletingTransaction.splitFromId ? "(This is a split transaction)" : null,
                ].filter(Boolean),
              }
            : undefined
        }
        confirmLabel="Delete Transaction"
        variant="destructive"
        icon={<Trash2 className="h-5 w-5" />}
      />

      {/* Unsplit Confirmation Dialog */}
      <ConfirmDialog
        open={unsplitConfirmOpen}
        onOpenChange={setUnsplitConfirmOpen}
        onConfirm={confirmUnsplit}
        title="Restore Original Transaction"
        description="This will restore the original unsplit transaction and remove all split items."
        impact={
          unsplittingTransaction
            ? {
                title: "What will happen:",
                items: [
                  "All split items will be removed",
                  "The original transaction will be restored",
                  "Categories and notes from splits will be lost",
                ],
              }
            : undefined
        }
        confirmLabel="Restore Original"
        variant="default"
        icon={<Split className="h-5 w-5" />}
      />

      {/* Bulk Categorization Confirmation Dialog */}
      <ConfirmDialog
        open={bulkConfirmOpen}
        onOpenChange={setBulkConfirmOpen}
        onConfirm={confirmBulkCategorization}
        title="Bulk Categorize Transactions"
        description={`Apply "${bulkCategory}${bulkSubcategory ? ` - ${bulkSubcategory}` : ""}" to ${selectedTransactionIds.size} transaction(s)?`}
        impact={{
          title: "This will update:",
          items: [
            `${selectedTransactionIds.size} transaction${selectedTransactionIds.size === 1 ? "" : "s"}`,
            `Category: ${bulkCategory}${bulkSubcategory ? ` - ${bulkSubcategory}` : ""}`,
            "Any existing categories will be replaced",
          ],
        }}
        confirmLabel="Apply to Selected"
        variant="default"
        icon={<Tag className="h-5 w-5" />}
      />

      {/* Quick Categorize Dialog - Command Palette */}
      <QuickCategorizeDialog
        open={quickCategorizingId !== null}
        onOpenChange={(open) => {
          if (!open) setQuickCategorizingId(null);
        }}
        categories={categories}
        onSelect={async (category, subcategory) => {
          const transaction = transactions.find((tx) => tx.id === quickCategorizingId);
          if (transaction) {
            // Close quick categorize dialog
            setQuickCategorizingId(null);

            // Categorize the current transaction first
            await quickCategorize(transaction, category, subcategory);

            // Check for matching vendor transactions (optimized for performance)
            const vendorName = extractVendorName(transaction.description);
            setIsMatchingVendors(true);

            // Show immediate feedback with vendor name (auto-dismiss after 3s)
            toast.info(`🔍 Searching for ${vendorName} transactions...`, 3000);

            const perfStart = performance.now();

            try {
              // 🤖 AI-POWERED MATCHING: Uses GPT-4 to understand business context
              // Avoids false positives like HARVEYS matching CCOKIO or DOLLARAMA
              const matches = await aiFindMatchingVendorTransactions(
                transaction,
                transactions,
                vendorCache
              );

              const perfEnd = performance.now();
              const searchTime = ((perfEnd - perfStart) / 1000).toFixed(1);

              setIsMatchingVendors(false);

              if (matches.length >= 2) {
                // Show success toast with match count
                toast.success(
                  `✓ Found ${matches.length} matching ${vendorName} transactions (${searchTime}s)`
                );

                // Found matches - show confirmation dialog
                setPendingCategorization({ transaction, category, subcategory });
                setMatchingTransactions(matches);
                setShowVendorBulkConfirm(true);
              } else {
                // Show info toast - no matches
                toast.info(`No other ${vendorName} transactions found (${searchTime}s)`);
              }
            } catch (error) {
              // Ensure loading state is cleared even on error
              setIsMatchingVendors(false);

              // Log error but don't break the UI - function should handle errors internally
              console.error("[Transaction Page] Error during vendor matching:", error);

              // The function should have already fallen back to string matching,
              // but if it still throws, we'll just continue without bulk categorization
              toast.info(`Using basic matching for ${vendorName} transactions`);
            }
          }
        }}
        transaction={transactions.find((tx) => tx.id === quickCategorizingId) || null}
      />

      {/* Bulk Categorize Confirmation Dialog */}
      {pendingCategorization && (
        <BulkCategorizeConfirmation
          open={showVendorBulkConfirm}
          onOpenChange={setShowVendorBulkConfirm}
          sourceTransaction={pendingCategorization.transaction}
          matchingTransactions={matchingTransactions}
          category={pendingCategorization.category}
          subcategory={pendingCategorization.subcategory}
          onApplyAll={handleApplyToAll}
          onReview={handleReviewFirst}
        />
      )}

      {/* Transaction Review Modal */}
      {pendingCategorization && (
        <TransactionReviewModal
          open={showReviewModal}
          onOpenChange={setShowReviewModal}
          transactions={matchingTransactions}
          category={pendingCategorization.category}
          subcategory={pendingCategorization.subcategory}
          onApplySelected={handleApplySelected}
        />
      )}
    </div>
  );
}
