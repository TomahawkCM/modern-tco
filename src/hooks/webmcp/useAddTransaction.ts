/**
 * WebMCP Tool: add_transaction
 * Write tool that adds a new transaction via the encrypted DB layer.
 */

import { useCallback } from "react";
import { useWebMCP } from "@mcp-b/react-webmcp";
import type { Transaction, Account, Category } from "@/types/budget";
import { sanitizeTransaction } from "./sanitize";
import { AddTransactionInput } from "./schemas";
import { addEncryptedTransaction } from "@/lib/budget-db";
import { roundToCents } from "@/lib/money";

export function useAddTransaction(
  accounts: Account[],
  categories: Category[],
  privacyMode: boolean,
  onTransactionAdded?: () => void
) {
  const handler = useCallback(
    async (input: Record<string, unknown>) => {
      if (privacyMode) {
        return { error: "Privacy mode is active. Financial data is hidden." };
      }

      const args = AddTransactionInput.parse(input);

      // Validate account exists
      const account = accounts.find((a) => a.id === args.accountId);
      if (!account) {
        return { error: `Account '${args.accountId}' not found.` };
      }

      // Validate category exists if provided
      if (args.category) {
        const catExists = categories.some(
          (c) => c.name.toLowerCase() === args.category!.toLowerCase() || c.id === args.category
        );
        if (!catExists) {
          return {
            error: `Category '${args.category}' not found. Use list_categories to see available options.`,
          };
        }
      }

      const now = new Date();
      const txId = `tx_webmcp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const transaction: Transaction = {
        id: txId,
        accountId: args.accountId,
        date: new Date(args.date),
        description: args.description,
        amount: roundToCents(args.amount),
        category: args.category || null,
        subcategory: args.subcategory || null,
        merchant: args.merchant,
        notes: args.notes || "",
        tags: args.tags || [],
        isRecurring: false,
        createdAt: now,
        updatedAt: now,
      };

      await addEncryptedTransaction(transaction);
      onTransactionAdded?.();

      return {
        success: true,
        transaction: sanitizeTransaction(transaction),
      };
    },
    [accounts, categories, privacyMode, onTransactionAdded]
  );

  useWebMCP({
    name: "add_transaction",
    description:
      "Add a new transaction to an account. Validates account and category existence. Use negative amounts for expenses, positive for income.",
    inputSchema: {
      accountId: AddTransactionInput.shape.accountId,
      date: AddTransactionInput.shape.date,
      description: AddTransactionInput.shape.description,
      amount: AddTransactionInput.shape.amount,
      category: AddTransactionInput.shape.category,
      subcategory: AddTransactionInput.shape.subcategory,
      merchant: AddTransactionInput.shape.merchant,
      notes: AddTransactionInput.shape.notes,
      tags: AddTransactionInput.shape.tags,
    },
    handler,
    annotations: { readOnlyHint: false },
  });
}
