'use client';

/**
 * Transactions Page
 * View, search, filter, and manage all transactions
 *
 * Phase 3 Mobile Enhancements:
 * - Swipe-to-delete gesture (Framer Motion)
 * - Sticky table headers with scroll shadow
 * - Pull-to-refresh on transaction list
 */

import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Filter, Download, Edit, Trash2, Tag, FileImage, Split, Check, X as XIcon, RefreshCw, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Receipt, Upload } from 'lucide-react';
import { motion, PanInfo } from 'framer-motion';
import { db, splitTransaction, unsplitTransaction, getSplitChildren, type SplitData } from '@/lib/budget-db';
import type { Transaction, Category, Account } from '@/types/budget';
import { TransactionModal } from '@/components/budget/TransactionModal';
import { ReceiptThumbnail } from '@/components/budget/ReceiptThumbnail';
import { SplitTransactionModal } from '@/components/budget/SplitTransactionModal';
import { ConfirmDialog } from '@/components/budget/ConfirmDialog';
import { recordCorrection, categorizeTransaction } from '@/lib/categorization/rules';
import { useToast } from '@/components/budget/Toast';
import { HelpTooltip } from '@/components/budget/HelpTooltip';
import { EmptyState } from '@/components/budget/EmptyState';
import Link from 'next/link';

export default function TransactionsPage() {
  const toast = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [quickCategorizingId, setQuickCategorizingId] = useState<string | null>(null);
  
  // Split transaction modal state
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splittingTransaction, setSplittingTransaction] = useState<Transaction | null>(null);
  
  // Bulk selection state
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<Set<string>>(new Set());
  const [bulkCategory, setBulkCategory] = useState<string>('');
  const [bulkSubcategory, setBulkSubcategory] = useState<string>('');
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
  const [showScrollShadow, setShowScrollShadow] = useState(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const mobileListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Phase 3.3.2: Scroll shadow detection for sticky headers
  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    if (!tableContainer) return;

    const handleScroll = () => {
      setShowScrollShadow(tableContainer.scrollTop > 0);
    };

    tableContainer.addEventListener('scroll', handleScroll);
    return () => tableContainer.removeEventListener('scroll', handleScroll);
  }, []);

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
      const [allTxs, cats, accts] = await Promise.all([
        db.transactions.toArray(),
        db.categories.toArray(),
        db.accounts.toArray(),
      ]);
      
      // Filter out parent transactions that have been split
      // Only show child transactions (which have splitFromId) and non-split transactions
      const visibleTxs = allTxs.filter(tx => !tx.isSplit);
      
      setTransactions(visibleTxs);
      setCategories(cats);
      setAccounts(accts);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveTransaction(transaction: Transaction) {
    try {
      if (editingTransaction) {
        const { id, ...updates } = transaction;
        await db.transactions.update(id, updates);
      } else {
        await db.transactions.add(transaction);
      }
      await loadData();
      setShowModal(false);
      setEditingTransaction(null);
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('Failed to save transaction');
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
          const shouldRestore = await toast.confirm('This is the last split item. Restore the original transaction?');
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
      toast.success('Transaction deleted successfully');
      setDeleteConfirmOpen(false);
      setDeletingTransaction(null);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
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
      console.error('Error saving split:', error);
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
      toast.success('Transaction unsplit successfully');
      setUnsplitConfirmOpen(false);
      setUnsplittingTransaction(null);
    } catch (error) {
      console.error('Error unsplitting:', error);
      toast.error('Failed to unsplit transaction');
      // Keep dialog open on error
    }
  }

  // Bulk selection functions
  function toggleSelectTransaction(id: string) {
    const newSelected = new Set(selectedTransactionIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTransactionIds(newSelected);
    setShowBulkActions(newSelected.size > 0);
  }

  function selectAllVisible() {
    const visibleIds = new Set(filteredTransactions.map(tx => tx.id));
    setSelectedTransactionIds(visibleIds);
    setShowBulkActions(visibleIds.size > 0);
  }

  function clearSelection() {
    setSelectedTransactionIds(new Set());
    setShowBulkActions(false);
    setBulkCategory('');
    setBulkSubcategory('');
  }

  function initiateBulkCategorization() {
    if (!bulkCategory) {
      toast.warning('Please select a category');
      return;
    }

    if (selectedTransactionIds.size === 0) {
      toast.warning('Please select transactions to categorize');
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
      console.error('Error bulk categorizing:', error);
      toast.error('Failed to categorize transactions');
      // Keep dialog open on error
    }
  }

  async function quickCategorize(transaction: Transaction, categoryName: string, subcategoryName: string | null) {
    try {
      const updated = {
        ...transaction,
        category: categoryName,
        subcategory: subcategoryName,
        updatedAt: new Date(),
      };

      await db.transactions.update(transaction.id, updated);

      // Learn from this correction
      const autoCategorization = categorizeTransaction(transaction.description);
      recordCorrection({
        originalDescription: transaction.description,
        suggestedCategory: autoCategorization?.category || 'Uncategorized',
        suggestedSubcategory: autoCategorization?.subcategory,
        correctedCategory: categoryName,
        correctedSubcategory: subcategoryName || undefined,
        timestamp: new Date(),
      });

      await loadData();
      setQuickCategorizingId(null);
    } catch (error) {
      console.error('Error quick categorizing:', error);
      toast.error('Failed to categorize transaction');
    }
  }

  // Date range state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter((tx) => {
      // Search filter
      if (searchTerm && !tx.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && tx.category !== selectedCategory) {
        return false;
      }
      // Date range filter
      if (startDate && new Date(tx.date) < new Date(startDate)) {
        return false;
      }
      if (endDate && new Date(tx.date) > new Date(endDate)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const multiplier = sortDirection === 'asc' ? 1 : -1;
      if (sortBy === 'date') {
        return (new Date(a.date).getTime() - new Date(b.date).getTime()) * multiplier;
      } else {
        return (a.amount - b.amount) * multiplier;
      }
    });

  const totalIncome = filteredTransactions
    .filter((tx) => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = Math.abs(
    filteredTransactions
      .filter((tx) => tx.amount < 0)
      .reduce((sum, tx) => sum + tx.amount, 0)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Enhanced Typography */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-gray-900">Transactions</h1>
            <HelpTooltip
              content={
                <>
                  <strong>Split Transactions:</strong> Divide a single purchase across multiple categories.
                  Example: Grocery store visit ($100) → Groceries ($80) + Household ($20).
                  Click the Split button on any transaction to divide it.
                </>
              }
              learnMoreUrl="/docs/user-guide#split-transactions"
              ariaLabel="More information about transaction features"
              iconSize="h-5 w-5"
            />
          </div>
          <p className="text-lg text-gray-600 mt-2 font-medium">
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTransaction(null);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-6 py-3 min-h-[48px] text-base font-semibold bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors shadow-md hover:shadow-lg focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:outline-none"
        >
          <Plus className="w-5 h-5" />
          Add Transaction
        </button>
      </div>

      {/* Filters and Search - Enhanced with Date Range */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="space-y-4">
          {/* Top Row: Search and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="search-transactions" className="text-sm font-medium text-gray-700">
                  Search Transactions
                </label>
                <HelpTooltip
                  content='Search by description, amount, or merchant name. Use quotes for exact matches: "Starbucks".'
                  learnMoreUrl="/docs/user-guide#search-transactions"
                  ariaLabel="More information about searching transactions"
                />
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="search-transactions"
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:border-transparent focus:outline-none"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="category-filter" className="text-sm font-medium text-gray-700">
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
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:border-transparent focus:outline-none"
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Start Date */}
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:border-transparent focus:outline-none"
              />
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:border-transparent focus:outline-none"
              />
            </div>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
              className="px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:border-transparent focus:outline-none"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
            </select>

            {/* Sort Direction */}
            <select
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
              className="px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:border-transparent focus:outline-none"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || selectedCategory !== 'all' || startDate || endDate) && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setStartDate('');
                  setEndDate('');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <XIcon className="w-4 h-4" />
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-teal-600" />
              <span className="font-semibold text-teal-900">
                {selectedTransactionIds.size} transaction(s) selected
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <select
                value={bulkCategory}
                onChange={(e) => {
                  setBulkCategory(e.target.value);
                  setBulkSubcategory('');
                }}
                className="px-4 py-2 border border-teal-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:border-transparent focus:outline-none text-sm"
              >
                <option value="">Select category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              {bulkCategory && categories.find(c => c.name === bulkCategory)?.subcategories && (
                <select
                  value={bulkSubcategory}
                  onChange={(e) => setBulkSubcategory(e.target.value)}
                  className="px-4 py-2 border border-teal-300 rounded-lg bg-white focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:border-transparent focus:outline-none text-sm"
                >
                  <option value="">No subcategory</option>
                  {categories
                    .find(c => c.name === bulkCategory)
                    ?.subcategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                </select>
              )}

              <button
                onClick={initiateBulkCategorization}
                disabled={!bulkCategory}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:outline-none"
              >
                Apply to Selected
              </button>
            </div>

            <button
              onClick={clearSelection}
              className="p-2 text-teal-600 hover:text-teal-700 hover:bg-teal-100 rounded-lg transition-colors"
              title="Clear selection"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards - Enhanced Typography */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-600" aria-hidden="true" />
            <p className="text-base font-medium text-gray-700">Total Income</p>
          </div>
          <p className="text-3xl font-bold text-green-600 flex items-center gap-2">
            <ArrowUp className="w-6 h-6" aria-hidden="true" />
            <span className="sr-only">Income: </span>
            ${totalIncome.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-5 h-5 text-red-600" aria-hidden="true" />
            <p className="text-base font-medium text-gray-700">Total Expenses</p>
          </div>
          <p className="text-3xl font-bold text-red-600 flex items-center gap-2">
            <ArrowDown className="w-6 h-6" aria-hidden="true" />
            <span className="sr-only">Expense: </span>
            ${totalExpenses.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-400">
          <p className="text-base font-medium text-gray-700 mb-3">Net Balance</p>
          <p className={`text-3xl font-bold flex items-center gap-2 ${
            totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {totalIncome - totalExpenses >= 0 ? (
              <>
                <ArrowUp className="w-6 h-6" aria-hidden="true" />
                <span className="sr-only">Positive: </span>
              </>
            ) : (
              <>
                <ArrowDown className="w-6 h-6" aria-hidden="true" />
                <span className="sr-only">Negative: </span>
              </>
            )}
            ${Math.abs(totalIncome - totalExpenses).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Transactions Table - Phase 3.1.4 + Phase 3.3.2: Desktop table + Sticky headers + Mobile card view */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <>
            {/* Desktop Table View (≥768px) - Phase 3.3.2: Sticky headers with scroll shadow */}
            <div
              ref={tableContainerRef}
              className="hidden md:block overflow-x-auto overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            >
              <table className="w-full relative">
              <thead className={`bg-gray-50 border-b border-gray-200 sticky top-0 z-20 transition-shadow ${
                showScrollShadow ? 'shadow-md' : ''
              }`}>
                <tr>
                  <th className="sticky left-0 z-10 bg-gray-50 px-4 md:px-6 py-2 text-left">
                    <input
                      type="checkbox"
                      checked={filteredTransactions.length > 0 && filteredTransactions.every(tx => selectedTransactionIds.has(tx.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          selectAllVisible();
                        } else {
                          clearSelection();
                        }
                      }}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                      title="Select all visible transactions"
                    />
                  </th>
                  <th className="sticky left-0 z-10 bg-gray-50 px-4 md:px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 md:px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 md:px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Category
                  </th>
                  <th className="px-4 md:px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Receipt
                  </th>
                  <th className="px-4 md:px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 md:px-6 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-300">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className={`hover:bg-gray-50 ${selectedTransactionIds.has(tx.id) ? 'bg-teal-50' : ''}`}>
                    <td className="sticky left-0 z-10 bg-white px-4 md:px-6 py-5 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedTransactionIds.has(tx.id)}
                        onChange={() => toggleSelectTransaction(tx.id)}
                        className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="sticky left-0 z-10 bg-white px-4 md:px-6 py-5 whitespace-nowrap text-base font-medium text-gray-900">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 md:px-6 py-5 text-base text-gray-900 min-w-[200px]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">{tx.description}</span>
                          {tx.splitFromId && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded text-sm font-medium bg-teal-100 text-teal-700">
                              Split
                            </span>
                          )}
                        </div>
                        {tx.notes && (
                          <div className="text-gray-600 text-base mt-2">
                            {tx.notes}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-5 whitespace-nowrap hidden sm:table-cell">
                      {tx.category ? (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
                          {tx.category}
                          {tx.subcategory && ` • ${tx.subcategory}`}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          Uncategorized
                        </span>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-5 whitespace-nowrap hidden lg:table-cell">
                      <ReceiptThumbnail
                        transactionId={tx.id}
                        onReceiptDeleted={loadData}
                      />
                    </td>
                    <td className="px-4 md:px-6 py-5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {tx.amount > 0 ? (
                          <>
                            <ArrowUp className="w-5 h-5 text-green-600" aria-hidden="true" />
                            <span className="font-bold text-lg text-green-600">
                              <span className="sr-only">Income: </span>
                              +${Math.abs(tx.amount).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <>
                            <ArrowDown className="w-5 h-5 text-red-600" aria-hidden="true" />
                            <span className="font-bold text-lg text-red-600">
                              <span className="sr-only">Expense: </span>
                              -${Math.abs(tx.amount).toFixed(2)}
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Quick Categorize for uncategorized transactions */}
                        {!tx.category && (
                          <div className="relative">
                            <button
                              onClick={() => setQuickCategorizingId(tx.id)}
                              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                              title="Quick Categorize"
                            >
                              <Tag className="w-5 h-5" />
                            </button>

                            {/* Quick Category Dropdown */}
                            {quickCategorizingId === tx.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setQuickCategorizingId(null)} />
                                <div className="absolute right-0 top-8 z-20 bg-white rounded-lg shadow-lg border border-gray-200 w-64 max-h-96 overflow-y-auto">
                                  <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
                                    <p className="text-sm font-semibold text-gray-700">Quick Categorize</p>
                                  </div>
                                  <div className="p-2">
                                    {categories
                                      .map(cat => (
                                        <div key={cat.id}>
                                          <button
                                            onClick={() => quickCategorize(tx, cat.name, null)}
                                            className="w-full text-left px-4 py-3 text-base hover:bg-gray-100 rounded font-medium"
                                          >
                                            {cat.name}
                                          </button>
                                          {cat.subcategories.length > 0 && (
                                            <div className="ml-4 border-l-2 border-gray-200">
                                              {cat.subcategories.map(sub => (
                                                <button
                                                  key={sub}
                                                  onClick={() => quickCategorize(tx, cat.name, sub)}
                                                  className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-100 rounded"
                                                >
                                                  {sub}
                                                </button>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        {/* Split/Unsplit Button */}
                        {tx.splitFromId ? (
                          <button
                            onClick={() => initiateUnsplit(tx)}
                            className="p-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Unsplit transaction"
                          >
                            <Split className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => openSplitModal(tx)}
                            className="p-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Split transaction"
                          >
                            <Split className="w-5 h-5" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setEditingTransaction(tx);
                            setShowModal(true);
                          }}
                          className="p-2 text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                          title="Edit" aria-label="Edit transaction"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => initiateDeleteTransaction(tx)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete" aria-label="Delete transaction"
                        >
                          <Trash2 className="w-5 h-5" />
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
              className="md:hidden relative"
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
                    document.removeEventListener('touchmove', handleTouchMove);
                    document.removeEventListener('touchend', handleTouchEnd);
                  };

                  document.addEventListener('touchmove', handleTouchMove, { passive: false });
                  document.addEventListener('touchend', handleTouchEnd);
                }
              }}
            >
              {/* Pull-to-refresh indicator */}
              {(pullDistance > 0 || isRefreshing) && (
                <div
                  className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 z-10 transition-opacity"
                  style={{
                    transform: `translateY(-${isRefreshing ? 0 : Math.max(0, 50 - pullDistance)}px)`,
                    opacity: Math.min(1, pullDistance / 80)
                  }}
                >
                  <RefreshCw
                    className={`w-6 h-6 text-teal-600 ${
                      isRefreshing ? 'animate-spin' : ''
                    }`}
                  />
                  {!isRefreshing && pullDistance > 80 && (
                    <span className="ml-2 text-sm text-teal-600 font-medium">Release to refresh</span>
                  )}
                  {!isRefreshing && pullDistance > 0 && pullDistance <= 80 && (
                    <span className="ml-2 text-sm text-gray-600">Pull to refresh</span>
                  )}
                </div>
              )}

              <div className="space-y-6 p-4" style={{ marginTop: pullDistance > 0 ? `${Math.min(pullDistance, 100)}px` : 0 }}>
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
                  className={`bg-white border-2 rounded-lg p-5 shadow-md transition-colors relative ${
                    selectedTransactionIds.has(tx.id) ? 'border-teal-500 bg-teal-50' : 'border-gray-300'
                  }`}
                >
                  {/* Delete indicator on swipe */}
                  <div className="absolute inset-y-0 right-0 flex items-center justify-center w-20 bg-red-500 rounded-r-lg pointer-events-none">
                    <Trash2 className="w-6 h-6 text-white" />
                  </div>

                  {/* Card Header: Checkbox + Description + Amount */}
                  <div className="flex items-start gap-4 mb-5">
                    {/* Selection Checkbox */}
                    <div className="flex-shrink-0 pt-2">
                      <input
                        type="checkbox"
                        checked={selectedTransactionIds.has(tx.id)}
                        onChange={() => toggleSelectTransaction(tx.id)}
                        className="w-6 h-6 text-teal-600 border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {/* Description + Split Badge */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-gray-900 text-lg truncate">
                          {tx.description}
                        </h3>
                        {tx.splitFromId && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded text-sm font-medium bg-teal-100 text-teal-700 flex-shrink-0">
                            Split
                          </span>
                        )}
                      </div>

                      {/* Notes */}
                      {tx.notes && (
                        <p className="text-base text-gray-600 mt-2">{tx.notes}</p>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="flex-shrink-0 text-right">
                      <div className="flex flex-col items-end gap-1">
                        {tx.amount > 0 ? (
                          <>
                            <div className="flex items-center gap-1.5">
                              <ArrowUp className="w-5 h-5 text-green-600" aria-hidden="true" />
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
                              <ArrowDown className="w-5 h-5 text-red-600" aria-hidden="true" />
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
                  <div className="flex items-center gap-4 mb-5">
                    {/* Category Badge */}
                    <div className="flex-1">
                      {tx.category ? (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
                          {tx.category}
                          {tx.subcategory && ` • ${tx.subcategory}`}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          Uncategorized
                        </span>
                      )}
                    </div>

                    {/* Date */}
                    <div className="text-gray-600 text-base font-medium whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Receipt Thumbnail */}
                  <div className="mb-4">
                    <ReceiptThumbnail
                      transactionId={tx.id}
                      onReceiptDeleted={loadData}
                    />
                  </div>

                  {/* Card Footer: Action Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Quick Categorize for uncategorized transactions */}
                    {!tx.category && (
                      <div className="relative">
                        <button
                          onClick={() => setQuickCategorizingId(tx.id)}
                          className="inline-flex items-center gap-2.5 px-4 py-2 min-h-[44px] text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <Tag className="w-4 h-4" />
                          Categorize
                        </button>

                        {/* Quick Category Dropdown */}
                        {quickCategorizingId === tx.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setQuickCategorizingId(null)} />
                            <div className="absolute left-0 bottom-full mb-2 z-20 bg-white rounded-lg shadow-lg border border-gray-200 w-64 max-h-80 overflow-y-auto">
                              <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
                                <p className="text-xs font-medium text-gray-700">Quick Categorize</p>
                              </div>
                              <div className="p-2">
                                {categories.map(cat => (
                                  <div key={cat.id}>
                                    <button
                                      onClick={() => quickCategorize(tx, cat.name, null)}
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded min-h-[44px]"
                                    >
                                      {cat.name}
                                    </button>
                                    {cat.subcategories.length > 0 && (
                                      <div className="ml-4 border-l-2 border-gray-200">
                                        {cat.subcategories.map(sub => (
                                          <button
                                            key={sub}
                                            onClick={() => quickCategorize(tx, cat.name, sub)}
                                            className="w-full text-left px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded min-h-[44px]"
                                          >
                                            {sub}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Split/Unsplit Button */}
                    {tx.splitFromId ? (
                      <button
                        onClick={() => initiateUnsplit(tx)}
                        className="inline-flex items-center gap-2.5 px-4 py-2 min-h-[44px] text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                        title="Unsplit transaction"
                      >
                        <Split className="w-4 h-4" />
                        Unsplit
                      </button>
                    ) : (
                      <button
                        onClick={() => openSplitModal(tx)}
                        className="inline-flex items-center gap-2.5 px-4 py-2 min-h-[44px] text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                        title="Split transaction"
                      >
                        <Split className="w-4 h-4" />
                        Split
                      </button>
                    )}

                    {/* Edit Button */}
                    <button
                      onClick={() => {
                        setEditingTransaction(tx);
                        setShowModal(true);
                      }}
                      className="inline-flex items-center gap-2.5 px-4 py-2 min-h-[44px] text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                      title="Edit" aria-label="Edit transaction"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => initiateDeleteTransaction(tx)}
                      className="inline-flex items-center gap-2.5 px-4 py-2 min-h-[44px] text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      title="Delete" aria-label="Delete transaction"
                    >
                      <Trash2 className="w-4 h-4" />
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
              label: 'Add Transaction',
              href: '/budget-app/transactions',
              icon: Plus,
            }}
            secondaryCTA={{
              label: 'Import CSV',
              href: '/budget-app/import',
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
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={confirmDeleteTransaction}
        title="Delete Transaction"
        description="This action cannot be undone."
        impact={deletingTransaction ? {
          title: "You will lose:",
          items: [
            `$${Math.abs(deletingTransaction.amount).toFixed(2)} ${deletingTransaction.amount > 0 ? 'income' : 'expense'} from ${new Date(deletingTransaction.date).toLocaleDateString()}`,
            `Description: "${deletingTransaction.description}"`,
            deletingTransaction.category ? `Category: ${deletingTransaction.category}${deletingTransaction.subcategory ? ` - ${deletingTransaction.subcategory}` : ''}` : null,
            deletingTransaction.notes ? `Notes: "${deletingTransaction.notes}"` : null,
            deletingTransaction.splitFromId ? '(This is a split transaction)' : null,
          ].filter(Boolean)
        } : undefined}
        confirmLabel="Delete Transaction"
        variant="destructive"
        icon={<Trash2 className="w-5 h-5" />}
      />

      {/* Unsplit Confirmation Dialog */}
      <ConfirmDialog
        open={unsplitConfirmOpen}
        onOpenChange={setUnsplitConfirmOpen}
        onConfirm={confirmUnsplit}
        title="Restore Original Transaction"
        description="This will restore the original unsplit transaction and remove all split items."
        impact={unsplittingTransaction ? {
          title: "What will happen:",
          items: [
            'All split items will be removed',
            'The original transaction will be restored',
            'Categories and notes from splits will be lost',
          ]
        } : undefined}
        confirmLabel="Restore Original"
        variant="default"
        icon={<Split className="w-5 h-5" />}
      />

      {/* Bulk Categorization Confirmation Dialog */}
      <ConfirmDialog
        open={bulkConfirmOpen}
        onOpenChange={setBulkConfirmOpen}
        onConfirm={confirmBulkCategorization}
        title="Bulk Categorize Transactions"
        description={`Apply "${bulkCategory}${bulkSubcategory ? ` - ${bulkSubcategory}` : ''}" to ${selectedTransactionIds.size} transaction(s)?`}
        impact={{
          title: "This will update:",
          items: [
            `${selectedTransactionIds.size} transaction${selectedTransactionIds.size === 1 ? '' : 's'}`,
            `Category: ${bulkCategory}${bulkSubcategory ? ` - ${bulkSubcategory}` : ''}`,
            'Any existing categories will be replaced',
          ]
        }}
        confirmLabel="Apply to Selected"
        variant="default"
        icon={<Tag className="w-5 h-5" />}
      />
    </div>
  );
}
