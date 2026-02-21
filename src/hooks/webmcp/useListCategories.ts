/**
 * WebMCP Tool: list_categories
 * Returns available budget categories.
 */

import { useCallback } from "react";
import { useWebMCP } from "@mcp-b/react-webmcp";
import type { Category } from "@/types/budget";
import { ListCategoriesInput } from "./schemas";

export function useListCategories(categories: Category[], privacyMode: boolean): BudgetToolHandler {
  const handler = useCallback(
    async (input: Record<string, unknown>) => {
      if (privacyMode) {
        return { error: "Privacy mode is active. Financial data is hidden." };
      }

      const args = ListCategoriesInput.parse(input);

      let filtered = [...categories];

      if (args.type !== "all") {
        filtered = filtered.filter((c) => c.type === args.type);
      }

      if (!args.includeArchived) {
        filtered = filtered.filter((c) => !c.archived);
      }

      const result = filtered
        .sort((a, b) => a.order - b.order)
        .map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          subcategories: c.subcategories,
          color: c.color,
          icon: c.icon,
          archived: c.archived || false,
        }));

      return {
        categories: result.slice(0, 100),
        count: result.length,
      };
    },
    [categories, privacyMode]
  );

  useWebMCP({
    name: "list_categories",
    description:
      "List all available budget categories with their subcategories, colors, and icons.",
    inputSchema: {
      type: ListCategoriesInput.shape.type,
      includeArchived: ListCategoriesInput.shape.includeArchived,
    },
    handler,
    annotations: { readOnlyHint: true },
  });

  return handler;
}
