/**
 * WebMCP Tool: categorize_transaction
 * Write tool that updates a transaction's category.
 */

import { useCallback } from "react";
import { useWebMCP } from "@mcp-b/react-webmcp";
import type { Transaction, Category } from "@/types/budget";
import { CategorizeTransactionInput } from "./schemas";
import { updateEncryptedTransaction } from "@/lib/budget-db";

export function useCategorizeTransaction(
  transactions: Transaction[],
  categories: Category[],
  privacyMode: boolean,
  onTransactionUpdated?: () => void
) {
  const handler = useCallback(
    async (input: Record<string, unknown>) => {
      if (privacyMode) {
        return { error: "Privacy mode is active. Financial data is hidden." };
      }

      const args = CategorizeTransactionInput.parse(input);

      // Validate transaction exists
      const tx = transactions.find((t) => t.id === args.transactionId);
      if (!tx) {
        return { error: `Transaction '${args.transactionId}' not found.` };
      }

      // Validate category exists
      const cat = categories.find(
        (c) => c.name.toLowerCase() === args.category.toLowerCase() || c.id === args.category
      );
      if (!cat) {
        return {
          error: `Category '${args.category}' not found. Use list_categories to see available options.`,
        };
      }

      // Validate subcategory if provided
      if (args.subcategory) {
        const subExists = cat.subcategories.some(
          (s) => s.toLowerCase() === args.subcategory!.toLowerCase()
        );
        if (!subExists) {
          return {
            error: `Subcategory '${args.subcategory}' not found in category '${cat.name}'. Available: ${cat.subcategories.join(", ")}`,
          };
        }
      }

      await updateEncryptedTransaction(args.transactionId, {
        category: cat.name,
        subcategory: args.subcategory || null,
        updatedAt: new Date(),
      });
      onTransactionUpdated?.();

      return {
        success: true,
        transactionId: args.transactionId,
        category: cat.name,
        subcategory: args.subcategory || null,
      };
    },
    [transactions, categories, privacyMode, onTransactionUpdated]
  );

  useWebMCP({
    name: "categorize_transaction",
    description:
      "Update the category (and optionally subcategory) of an existing transaction. Validates that category and subcategory exist.",
    inputSchema: {
      transactionId: CategorizeTransactionInput.shape.transactionId,
      category: CategorizeTransactionInput.shape.category,
      subcategory: CategorizeTransactionInput.shape.subcategory,
    },
    handler,
    annotations: { readOnlyHint: false },
  });
}
