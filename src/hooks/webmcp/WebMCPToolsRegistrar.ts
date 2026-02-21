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

  // Register all 9 tools
  useSearchTransactions(transactions, categories, accounts, isPrivacyMode);
  useGetBudgetSummary(transactions, budgets, categories, isPrivacyMode);
  useGetSpendingByCategory(transactions, categories, budgets, isPrivacyMode);
  useGetAccountBalances(accounts, transactions, isPrivacyMode);
  useListCategories(categories, isPrivacyMode);
  useGetSubscriptions(subscriptions, isPrivacyMode);
  useAddTransaction(accounts, categories, isPrivacyMode, refresh);
  useCategorizeTransaction(transactions, categories, isPrivacyMode, refresh);
  useSetBudgetLimit(categories, budgets, isPrivacyMode, refresh);

  return createElement("div", { "data-webmcp": "active" }, children);
}
