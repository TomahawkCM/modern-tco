/**
 * Autocomplete Engine
 * Provides smart suggestions based on transaction history
 * Features: Merchant suggestions, category suggestions, amount presets, recent searches
 */

import type { Transaction, Category } from "@/types/budget";
import { getFilterSuggestions } from "./query-parser";

// Recent searches storage key
const RECENT_SEARCHES_KEY = "budget-app-recent-searches";
const SAVED_FILTERS_KEY = "budget-app-saved-filters";
const MAX_RECENT_SEARCHES = 10;
const MAX_SAVED_FILTERS = 20;

export interface AutocompleteSuggestion {
  type: "merchant" | "category" | "amount" | "filter" | "recent" | "saved";
  value: string;
  label: string;
  description?: string;
  icon?: string;
  count?: number; // Usage frequency
}

export interface SavedFilter {
  id: string;
  name: string;
  query: string;
  createdAt: Date;
  usageCount: number;
}

// Cache for computed suggestions
let merchantCache: Map<string, number> = new Map();
let categoryCache: Map<string, number> = new Map();
let amountBuckets: { label: string; min?: number; max?: number; count: number }[] = [];
let cacheInitialized = false;

/**
 * Initialize autocomplete cache from transaction data
 */
export function initializeAutocompleteCache(
  transactions: Transaction[],
  categories: Category[]
): void {
  // Reset caches
  merchantCache = new Map();
  categoryCache = new Map();

  // Build merchant frequency map
  for (const tx of transactions) {
    const merchant = tx.merchant || extractMerchantFromDescription(tx.description);
    if (merchant) {
      merchantCache.set(merchant, (merchantCache.get(merchant) || 0) + 1);
    }
  }

  // Build category frequency map
  for (const tx of transactions) {
    if (tx.category) {
      categoryCache.set(tx.category, (categoryCache.get(tx.category) || 0) + 1);
    }
  }

  // Add categories that have no transactions yet
  for (const cat of categories) {
    if (!categoryCache.has(cat.name)) {
      categoryCache.set(cat.name, 0);
    }
  }

  // Calculate amount distribution buckets
  const amounts = transactions.map((tx) => Math.abs(tx.amount));
  const maxAmount = Math.max(...amounts, 1000);

  // Dynamic buckets based on data distribution
  amountBuckets = [
    { label: "Under $25", max: 25, count: amounts.filter((a) => a < 25).length },
    {
      label: "$25-100",
      min: 25,
      max: 100,
      count: amounts.filter((a) => a >= 25 && a < 100).length,
    },
    {
      label: "$100-500",
      min: 100,
      max: 500,
      count: amounts.filter((a) => a >= 100 && a < 500).length,
    },
    {
      label: "$500-1000",
      min: 500,
      max: 1000,
      count: amounts.filter((a) => a >= 500 && a < 1000).length,
    },
  ];

  if (maxAmount > 1000) {
    amountBuckets.push({
      label: `$1000+`,
      min: 1000,
      count: amounts.filter((a) => a >= 1000).length,
    });
  }

  cacheInitialized = true;
}

/**
 * Extract merchant name from transaction description
 */
function extractMerchantFromDescription(description: string): string {
  // Remove common suffixes and clean up
  const cleaned = description
    .replace(/\s*(#\d+|Card \d+|\*{4}\d+|Transaction|Payment|Purchase|Debit|Credit).*$/i, "")
    .replace(/^\d{2}\/\d{2}\s*/, "") // Remove leading dates
    .replace(/\s{2,}/g, " ")
    .trim();

  // Take first meaningful part (before location info)
  const parts = cleaned.split(/\s+[-,]/);
  return parts[0].trim();
}

/**
 * Get autocomplete suggestions for a partial query
 */
export function getAutocompleteSuggestions(
  query: string,
  limit: number = 8
): AutocompleteSuggestion[] {
  const suggestions: AutocompleteSuggestion[] = [];
  const lowerQuery = query.toLowerCase().trim();

  if (!lowerQuery) {
    // Show recent searches and popular merchants when query is empty
    const recentSearches = getRecentSearches();
    for (const search of recentSearches.slice(0, 3)) {
      suggestions.push({
        type: "recent",
        value: search,
        label: search,
        description: "Recent search",
        icon: "history",
      });
    }

    // Show saved filters
    const savedFilters = getSavedFilters();
    for (const filter of savedFilters.slice(0, 2)) {
      suggestions.push({
        type: "saved",
        value: filter.query,
        label: filter.name,
        description: `Used ${filter.usageCount} times`,
        icon: "bookmark",
      });
    }

    // Fill remaining with top merchants
    if (cacheInitialized && suggestions.length < limit) {
      const topMerchants = Array.from(merchantCache.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit - suggestions.length);

      for (const [merchant, count] of topMerchants) {
        suggestions.push({
          type: "merchant",
          value: merchant,
          label: merchant,
          description: `${count} transactions`,
          icon: "store",
          count,
        });
      }
    }

    return suggestions.slice(0, limit);
  }

  // Check for filter prefix suggestions
  if (
    lowerQuery.includes(":") ||
    lowerQuery.startsWith("$") ||
    ["amount", "category", "date", "type", "tag", "account", "merchant"].some((p) =>
      lowerQuery.startsWith(p)
    )
  ) {
    const filterSuggestions = getFilterSuggestions(lowerQuery);
    for (const filter of filterSuggestions.slice(0, 4)) {
      suggestions.push({
        type: "filter",
        value: filter,
        label: filter,
        description: "Search filter",
        icon: "filter",
      });
    }
  }

  // Match merchants
  if (cacheInitialized) {
    const matchingMerchants = Array.from(merchantCache.entries())
      .filter(([merchant]) => merchant.toLowerCase().includes(lowerQuery))
      .sort((a, b) => {
        // Prioritize starts-with matches
        const aStarts = a[0].toLowerCase().startsWith(lowerQuery) ? 1 : 0;
        const bStarts = b[0].toLowerCase().startsWith(lowerQuery) ? 1 : 0;
        if (aStarts !== bStarts) return bStarts - aStarts;
        // Then by frequency
        return b[1] - a[1];
      })
      .slice(0, 4);

    for (const [merchant, count] of matchingMerchants) {
      suggestions.push({
        type: "merchant",
        value: merchant,
        label: merchant,
        description: `${count} transactions`,
        icon: "store",
        count,
      });
    }
  }

  // Match categories
  if (cacheInitialized) {
    const matchingCategories = Array.from(categoryCache.entries())
      .filter(([category]) => category.toLowerCase().includes(lowerQuery))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    for (const [category, count] of matchingCategories) {
      suggestions.push({
        type: "category",
        value: `category:${category}`,
        label: category,
        description: count > 0 ? `${count} transactions` : "No transactions yet",
        icon: "tag",
        count,
      });
    }
  }

  // Match amount ranges based on query patterns
  const amountMatch = lowerQuery.match(/^\$?(\d+)/);
  if (amountMatch) {
    const amount = parseInt(amountMatch[1], 10);
    suggestions.push({
      type: "amount",
      value: `$${amount}-${amount + 50}`,
      label: `$${amount} - $${amount + 50}`,
      description: "Amount range",
      icon: "dollar-sign",
    });
  }

  // Add amount bucket suggestions if query looks amount-related
  if (lowerQuery.startsWith("$") || lowerQuery.includes("amount") || /^\d/.test(lowerQuery)) {
    for (const bucket of amountBuckets.filter((b) => b.count > 0).slice(0, 2)) {
      const value =
        bucket.min !== undefined && bucket.max !== undefined
          ? `$${bucket.min}-${bucket.max}`
          : bucket.max !== undefined
            ? `amount:<${bucket.max}`
            : `amount:>=${bucket.min}`;
      suggestions.push({
        type: "amount",
        value,
        label: bucket.label,
        description: `${bucket.count} transactions`,
        icon: "dollar-sign",
        count: bucket.count,
      });
    }
  }

  // Match recent searches
  const recentSearches = getRecentSearches();
  const matchingRecent = recentSearches
    .filter((s) => s.toLowerCase().includes(lowerQuery))
    .slice(0, 2);

  for (const search of matchingRecent) {
    // Avoid duplicates
    if (!suggestions.some((s) => s.value === search)) {
      suggestions.push({
        type: "recent",
        value: search,
        label: search,
        description: "Recent search",
        icon: "history",
      });
    }
  }

  // Deduplicate by value
  const seen = new Set<string>();
  const deduplicated = suggestions.filter((s) => {
    if (seen.has(s.value.toLowerCase())) return false;
    seen.add(s.value.toLowerCase());
    return true;
  });

  return deduplicated.slice(0, limit);
}

/**
 * Get recent searches from localStorage
 */
export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Add a search to recent searches
 */
export function addRecentSearch(query: string): void {
  if (typeof window === "undefined" || !query.trim()) return;

  try {
    const recent = getRecentSearches();
    const filtered = recent.filter((s) => s.toLowerCase() !== query.toLowerCase());
    const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Clear recent searches
 */
export function clearRecentSearches(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get saved filters from localStorage
 */
export function getSavedFilters(): SavedFilter[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(SAVED_FILTERS_KEY);
    const filters = stored ? JSON.parse(stored) : [];
    return filters.sort((a: SavedFilter, b: SavedFilter) => b.usageCount - a.usageCount);
  } catch {
    return [];
  }
}

/**
 * Save a filter for quick access
 */
export function saveFilter(name: string, query: string): SavedFilter {
  const filter: SavedFilter = {
    id: `filter_${Date.now()}`,
    name,
    query,
    createdAt: new Date(),
    usageCount: 0,
  };

  if (typeof window === "undefined") return filter;

  try {
    const filters = getSavedFilters();
    // Check for duplicate name
    const existing = filters.findIndex((f) => f.name.toLowerCase() === name.toLowerCase());
    if (existing >= 0) {
      filters[existing] = {
        ...filters[existing],
        query,
        usageCount: filters[existing].usageCount + 1,
      };
    } else {
      filters.push(filter);
    }

    const updated = filters.slice(0, MAX_SAVED_FILTERS);
    localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
    return filter;
  } catch {
    return filter;
  }
}

/**
 * Delete a saved filter
 */
export function deleteSavedFilter(id: string): void {
  if (typeof window === "undefined") return;

  try {
    const filters = getSavedFilters();
    const updated = filters.filter((f) => f.id !== id);
    localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Increment usage count for a saved filter
 */
export function useSavedFilter(id: string): void {
  if (typeof window === "undefined") return;

  try {
    const filters = getSavedFilters();
    const filter = filters.find((f) => f.id === id);
    if (filter) {
      filter.usageCount++;
      localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(filters));
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get suggested amount ranges based on transaction distribution
 */
export function getAmountRangeSuggestions(): {
  label: string;
  min?: number;
  max?: number;
  count: number;
}[] {
  return amountBuckets.filter((b) => b.count > 0);
}

/**
 * Get top merchants by transaction count
 */
export function getTopMerchants(limit: number = 10): { merchant: string; count: number }[] {
  if (!cacheInitialized) return [];

  return Array.from(merchantCache.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([merchant, count]) => ({ merchant, count }));
}

/**
 * Get top categories by transaction count
 */
export function getTopCategories(limit: number = 10): { category: string; count: number }[] {
  if (!cacheInitialized) return [];

  return Array.from(categoryCache.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([category, count]) => ({ category, count }));
}

/**
 * Clear autocomplete cache
 */
export function clearAutocompleteCache(): void {
  merchantCache = new Map();
  categoryCache = new Map();
  amountBuckets = [];
  cacheInitialized = false;
}
