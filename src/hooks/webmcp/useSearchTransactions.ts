/**
 * WebMCP Tool: search_transactions
 * Read-only fuzzy search over decrypted transactions.
 */

import { useCallback, useMemo } from "react";
import { useWebMCP } from "@mcp-b/react-webmcp";
import type { Transaction, Category, Account } from "@/types/budget";
import { sanitizeTransaction } from "./sanitize";
import { SearchTransactionsInput } from "./schemas";
import { searchTransactions, initializeSearchIndex } from "@/lib/search/transaction-search";

export function useSearchTransactions(
  transactions: Transaction[],
  categories: Category[],
  accounts: Account[],
  privacyMode: boolean
) {
  // Keep search index current
  useMemo(() => {
    if (transactions.length === 0) return;
    initializeSearchIndex(
      transactions,
      categories,
      accounts.map((a) => ({ id: a.id, name: a.name }))
    );
  }, [transactions, categories, accounts]);

  const handler = useCallback(
    async (input: Record<string, unknown>) => {
      if (privacyMode) {
        return { error: "Privacy mode is active. Financial data is hidden." };
      }

      const args = SearchTransactionsInput.parse(input);

      // Build filter set by applying non-text filters manually
      let filtered = [...transactions];

      if (args.accountId) {
        filtered = filtered.filter((tx) => tx.accountId === args.accountId);
      }
      if (args.category) {
        const catLower = args.category.toLowerCase();
        filtered = filtered.filter((tx) => tx.category?.toLowerCase() === catLower);
      }
      if (args.startDate) {
        const start = new Date(args.startDate);
        filtered = filtered.filter((tx) => new Date(tx.date) >= start);
      }
      if (args.endDate) {
        const end = new Date(args.endDate);
        end.setHours(23, 59, 59, 999);
        filtered = filtered.filter((tx) => new Date(tx.date) <= end);
      }
      if (args.minAmount !== undefined) {
        filtered = filtered.filter((tx) => Math.abs(tx.amount) >= args.minAmount!);
      }
      if (args.maxAmount !== undefined) {
        filtered = filtered.filter((tx) => Math.abs(tx.amount) <= args.maxAmount!);
      }
      if (args.type === "expense") {
        filtered = filtered.filter((tx) => tx.amount < 0);
      } else if (args.type === "income") {
        filtered = filtered.filter((tx) => tx.amount > 0);
      }
      if (args.merchant) {
        const mLower = args.merchant.toLowerCase();
        filtered = filtered.filter((tx) => tx.merchant?.toLowerCase().includes(mLower));
      }
      if (args.tags && args.tags.length > 0) {
        filtered = filtered.filter((tx) =>
          args.tags!.some((tag) => tx.tags?.some((t) => t.toLowerCase() === tag.toLowerCase()))
        );
      }

      // If there's a text query, use fuzzy search
      if (args.query?.trim()) {
        const results = searchTransactions(args.query, {
          limit: args.limit,
          sortBy: args.sortBy,
          sortDirection: args.sortDirection,
        });
        // Intersect with our filtered set
        const filteredIds = new Set(filtered.map((tx) => tx.id));
        const matched = results.filter((r) => filteredIds.has(r.item.id)).slice(0, args.limit);
        return {
          transactions: matched.map((r) => sanitizeTransaction(r.item)),
          count: matched.length,
        };
      }

      // No text query — sort and return
      const sorted = filtered.sort((a, b) => {
        const dir = args.sortDirection === "asc" ? 1 : -1;
        if (args.sortBy === "amount") {
          return (Math.abs(a.amount) - Math.abs(b.amount)) * dir;
        }
        return (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir;
      });

      const result = sorted.slice(0, args.limit);
      return {
        transactions: result.map(sanitizeTransaction),
        count: result.length,
        totalMatched: sorted.length,
      };
    },
    [transactions, privacyMode]
  );

  useWebMCP({
    name: "search_transactions",
    description:
      "Search and filter budget transactions by text query, category, date range, amount range, merchant, tags, and more. Returns sanitized transaction data.",
    inputSchema: {
      query: SearchTransactionsInput.shape.query,
      category: SearchTransactionsInput.shape.category,
      startDate: SearchTransactionsInput.shape.startDate,
      endDate: SearchTransactionsInput.shape.endDate,
      minAmount: SearchTransactionsInput.shape.minAmount,
      maxAmount: SearchTransactionsInput.shape.maxAmount,
      type: SearchTransactionsInput.shape.type,
      accountId: SearchTransactionsInput.shape.accountId,
      merchant: SearchTransactionsInput.shape.merchant,
      tags: SearchTransactionsInput.shape.tags,
      limit: SearchTransactionsInput.shape.limit,
      sortBy: SearchTransactionsInput.shape.sortBy,
      sortDirection: SearchTransactionsInput.shape.sortDirection,
    },
    handler,
    annotations: { readOnlyHint: true },
  });
}
