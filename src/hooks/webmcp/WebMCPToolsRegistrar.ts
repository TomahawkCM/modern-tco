/**
 * WebMCPToolsRegistrar — loaded via dynamic import only when WebMCP is enabled.
 * Fetches decrypted data from IndexedDB and registers all 9 tools.
 * Refreshes data every 30 seconds to keep agent queries current.
 */

"use client";

import { type ReactNode, useCallback, useEffect, useState, createElement } from "react";
import type { Transaction, Account, Category, Budget, Subscription } from "@/types/budget";
import { getAllEncryptedTransactions, getAllEncryptedAccounts, db } from "@/lib/budget-db";
import { usePrivacy } from "@/contexts/PrivacyContext";

// Read-only tools
import { useSearchTransactions } from "./useSearchTransactions";
import { useGetBudgetSummary } from "./useGetBudgetSummary";
import { useGetSpendingByCategory } from "./useGetSpendingByCategory";
import { useGetAccountBalances } from "./useGetAccountBalances";
import { useListCategories } from "./useListCategories";
import { useGetSubscriptions } from "./useGetSubscriptions";

// Write tools
import { useAddTransaction } from "./useAddTransaction";
import { useCategorizeTransaction } from "./useCategorizeTransaction";
import { useSetBudgetLimit } from "./useSetBudgetLimit";

const REFRESH_INTERVAL = 30_000; // 30 seconds

export function WebMCPToolsRegistrar({ children }: { children: ReactNode }) {
  const { isPrivacyMode } = usePrivacy();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [txs, accts, cats, bdgs, subs] = await Promise.all([
        getAllEncryptedTransactions(),
        getAllEncryptedAccounts(),
        db.categories.toArray(),
        db.budgets.toArray(),
        db.subscriptions.toArray(),
      ]);
      setTransactions(txs);
      setAccounts(accts);
      setCategories(cats);
      setBudgets(bdgs);
      setSubscriptions(subs);
    } catch (err) {
      console.error("[WebMCP] Error loading data:", err);
    }
  }, []);

  // Initial load + periodic refresh
  useEffect(() => {
    void loadData();
    const id = setInterval(() => void loadData(), REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [loadData]);

  // Callback for write tools to trigger a refresh
  const refresh = useCallback(() => {
    void loadData();
  }, [loadData]);

  // Register all 9 tools and capture handlers for bridge
  const searchTransactions = useSearchTransactions(
    transactions,
    categories,
    accounts,
    isPrivacyMode
  );
  const getBudgetSummary = useGetBudgetSummary(transactions, budgets, categories, isPrivacyMode);
  const getSpendingByCategory = useGetSpendingByCategory(
    transactions,
    categories,
    budgets,
    isPrivacyMode
  );
  const getAccountBalances = useGetAccountBalances(accounts, transactions, isPrivacyMode);
  const listCategories = useListCategories(categories, isPrivacyMode);
  const getSubscriptions = useGetSubscriptions(subscriptions, isPrivacyMode);
  const addTransaction = useAddTransaction(accounts, categories, isPrivacyMode, refresh);
  const categorizeTransaction = useCategorizeTransaction(
    transactions,
    categories,
    isPrivacyMode,
    refresh
  );
  const setBudgetLimit = useSetBudgetLimit(categories, budgets, isPrivacyMode, refresh);

  // Dev-only window bridge for Playwright
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    window.__budgetTools = {
      search_transactions: searchTransactions,
      get_budget_summary: getBudgetSummary,
      get_spending_by_category: getSpendingByCategory,
      get_account_balances: getAccountBalances,
      list_categories: listCategories,
      get_subscriptions: getSubscriptions,
      add_transaction: addTransaction,
      categorize_transaction: categorizeTransaction,
      set_budget_limit: setBudgetLimit,
      _meta: {
        ready: true,
        toolCount: 9,
        privacyMode: isPrivacyMode,
        dataLoaded: transactions.length > 0 || accounts.length > 0,
        lastRefresh: new Date().toISOString(),
      },
      refresh: loadData,
    };

    return () => {
      delete window.__budgetTools;
    };
  }, [
    searchTransactions,
    getBudgetSummary,
    getSpendingByCategory,
    getAccountBalances,
    listCategories,
    getSubscriptions,
    addTransaction,
    categorizeTransaction,
    setBudgetLimit,
    isPrivacyMode,
    transactions,
    accounts,
    loadData,
  ]);

  return createElement("div", { "data-webmcp": "active" }, children);
}
