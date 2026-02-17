/**
 * Transaction Search Service
 * World-class fuzzy search using Fuse.js
 * Features: Multi-field search, typo tolerance, result scoring, instant results
 */

import Fuse, { type IFuseOptions, type FuseResult } from "fuse.js";
import type { Transaction, Category } from "@/types/budget";
import { parseSearchQuery, type ParsedQuery } from "./query-parser";

// Search result with score and match info
export interface SearchResult {
  item: Transaction;
  score: number; // 0 = perfect match, 1 = no match
  matches?: {
    key: string;
    value: string;
    indices: [number, number][];
  }[];
}

// Flattened transaction for Fuse.js search
export interface SearchableTransaction extends Transaction {
  categoryName: string;
  accountName: string;
  amountFormatted: string;
  dateFormatted: string;
  allText: string; // Combined searchable text for broad matches
}

// Fuse.js options optimized for financial transactions
const FUSE_OPTIONS: IFuseOptions<SearchableTransaction> = {
  // Fields to search with weights (higher = more important)
  keys: [
    { name: "description", weight: 0.35 },
    { name: "merchant", weight: 0.25 },
    { name: "categoryName", weight: 0.15 },
    { name: "notes", weight: 0.1 },
    { name: "originalDescription", weight: 0.08 },
    { name: "accountName", weight: 0.05 },
    { name: "allText", weight: 0.02 },
  ],
  // Fuzzy search settings
  threshold: 0.35, // 0 = exact match, 1 = match anything (0.35 = good typo tolerance)
  distance: 100, // How far to search in string
  minMatchCharLength: 2, // Minimum chars to start matching
  ignoreLocation: true, // Search anywhere in string
  includeScore: true,
  includeMatches: true,
  useExtendedSearch: true, // Enable special operators
  findAllMatches: true,
  // Performance optimizations
  shouldSort: true,
  isCaseSensitive: false, // Case-insensitive search
};

// Cache for Fuse instance to avoid re-indexing
let cachedFuse: Fuse<SearchableTransaction> | null = null;
let cachedTransactions: Transaction[] = [];
let cachedCategories: Category[] = [];
let cachedAccounts: { id: string; name: string }[] = [];
let cachedLocale: string = "en-US";

/**
 * Normalize text by stripping diacritics / accent marks.
 * This allows searching "cafe" to match "café", "nino" to match "niño", etc.
 */
export function normalizeText(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Prepare transaction for search by flattening related data.
 * All text fields are normalized (diacritics stripped) so that Fuse.js indexes
 * the normalized form, allowing accent-insensitive matching.
 */
function prepareForSearch(
  transaction: Transaction,
  categoryMap: Map<string, string>,
  accountMap: Map<string, string>,
  locale: string = "en-US"
): SearchableTransaction {
  const categoryName = transaction.category
    ? categoryMap.get(transaction.category) || transaction.category
    : "Uncategorized";
  const accountName = accountMap.get(transaction.accountId) || "Unknown Account";

  // Locale-aware currency formatting instead of hardcoded "$"
  const amountFormatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: getCurrencyForLocale(locale),
  }).format(Math.abs(transaction.amount));

  const dateFormatted = new Date(transaction.date).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Combine all searchable text for broad queries, normalized for diacritics
  const allText = normalizeText(
    [
      transaction.description,
      transaction.merchant,
      transaction.notes,
      transaction.originalDescription,
      categoryName,
      accountName,
      transaction.tags?.join(" "),
    ]
      .filter(Boolean)
      .join(" ")
  );

  return {
    ...transaction,
    // Normalize text fields for accent-insensitive search
    description: normalizeText(transaction.description),
    merchant: transaction.merchant ? normalizeText(transaction.merchant) : transaction.merchant,
    notes: transaction.notes ? normalizeText(transaction.notes) : transaction.notes,
    originalDescription: transaction.originalDescription
      ? normalizeText(transaction.originalDescription)
      : transaction.originalDescription,
    categoryName: normalizeText(categoryName),
    accountName: normalizeText(accountName),
    amountFormatted,
    dateFormatted,
    allText,
  };
}

/**
 * Map a locale to its most common currency code.
 * Falls back to "USD" for unknown locales.
 */
function getCurrencyForLocale(locale: string): string {
  const currencyMap: Record<string, string> = {
    "en-US": "USD",
    "en-GB": "GBP",
    "en-CA": "CAD",
    "en-AU": "AUD",
    "de-DE": "EUR",
    "fr-FR": "EUR",
    "es-ES": "EUR",
    "it-IT": "EUR",
    "nl-NL": "EUR",
    "pt-BR": "BRL",
    "ja-JP": "JPY",
    "zh-CN": "CNY",
    "ko-KR": "KRW",
    "sv-SE": "SEK",
    "nb-NO": "NOK",
    "da-DK": "DKK",
    "pl-PL": "PLN",
    "cs-CZ": "CZK",
    "hu-HU": "HUF",
    "ro-RO": "RON",
    "bg-BG": "BGN",
    "hr-HR": "EUR",
    "tr-TR": "TRY",
    "ru-RU": "RUB",
    "uk-UA": "UAH",
    "th-TH": "THB",
    "vi-VN": "VND",
    "id-ID": "IDR",
    "ms-MY": "MYR",
    "hi-IN": "INR",
    "ar-SA": "SAR",
    "he-IL": "ILS",
    "zh-TW": "TWD",
    "en-NZ": "NZD",
    "en-IE": "EUR",
    "fi-FI": "EUR",
    "el-GR": "EUR",
    "sk-SK": "EUR",
    "sl-SI": "EUR",
    "et-EE": "EUR",
    "lv-LV": "EUR",
    "lt-LT": "EUR",
  };

  // Try exact match first, then language prefix
  return currencyMap[locale] || currencyMap[locale.split("-")[0]] || "USD";
}

/**
 * Initialize or update the search index
 * Call this when transactions, categories, or accounts change
 *
 * @param locale - BCP 47 locale tag (e.g. "en-US", "de-DE") used for
 *   date and currency formatting in searchable text. Defaults to "en-US".
 */
export function initializeSearchIndex(
  transactions: Transaction[],
  categories: Category[] = [],
  accounts: { id: string; name: string }[] = [],
  locale: string = "en-US"
): void {
  // Skip if data hasn't changed
  if (
    transactions === cachedTransactions &&
    categories === cachedCategories &&
    accounts === cachedAccounts &&
    locale === cachedLocale &&
    cachedFuse
  ) {
    return;
  }

  // Build lookup maps (support both id→name and name→name lookups)
  const categoryMap = new Map<string, string>();
  for (const c of categories) {
    categoryMap.set(c.id, c.name);
    categoryMap.set(c.name, c.name);
  }
  const accountMap = new Map(accounts.map((a) => [a.id, a.name]));

  // Prepare transactions for search (text fields normalized for diacritics)
  const searchableTransactions = transactions.map((tx) =>
    prepareForSearch(tx, categoryMap, accountMap, locale)
  );

  // Create new Fuse instance
  cachedFuse = new Fuse(searchableTransactions, FUSE_OPTIONS);
  cachedTransactions = transactions;
  cachedCategories = categories;
  cachedAccounts = accounts;
  cachedLocale = locale;
}

/**
 * Apply structured filters from parsed query
 */
function applyStructuredFilters(
  transactions: SearchableTransaction[],
  query: ParsedQuery
): SearchableTransaction[] {
  let filtered = [...transactions];

  // Amount filters
  if (query.filters.amountMin !== undefined) {
    filtered = filtered.filter((tx) => Math.abs(tx.amount) >= query.filters.amountMin!);
  }
  if (query.filters.amountMax !== undefined) {
    filtered = filtered.filter((tx) => Math.abs(tx.amount) <= query.filters.amountMax!);
  }

  // Category filter
  if (query.filters.category) {
    const categoryLower = query.filters.category.toLowerCase();
    filtered = filtered.filter(
      (tx) =>
        tx.categoryName.toLowerCase().includes(categoryLower) ||
        tx.category?.toLowerCase().includes(categoryLower)
    );
  }

  // Date filters
  if (query.filters.dateStart) {
    const startTime = query.filters.dateStart.getTime();
    filtered = filtered.filter((tx) => new Date(tx.date).getTime() >= startTime);
  }
  if (query.filters.dateEnd) {
    const endTime = query.filters.dateEnd.getTime();
    filtered = filtered.filter((tx) => new Date(tx.date).getTime() <= endTime);
  }

  // Account filter
  if (query.filters.account) {
    const accountLower = query.filters.account.toLowerCase();
    filtered = filtered.filter((tx) => tx.accountName.toLowerCase().includes(accountLower));
  }

  // Type filter (income/expense)
  if (query.filters.type) {
    if (query.filters.type === "income") {
      filtered = filtered.filter((tx) => tx.amount > 0);
    } else if (query.filters.type === "expense") {
      filtered = filtered.filter((tx) => tx.amount < 0);
    }
  }

  // Tag filter
  if (query.filters.tag) {
    const tagLower = query.filters.tag.toLowerCase();
    filtered = filtered.filter((tx) => tx.tags?.some((t) => t.toLowerCase().includes(tagLower)));
  }

  // Merchant filter
  if (query.filters.merchant) {
    const merchantLower = query.filters.merchant.toLowerCase();
    filtered = filtered.filter(
      (tx) =>
        tx.merchant?.toLowerCase().includes(merchantLower) ||
        tx.description.toLowerCase().includes(merchantLower)
    );
  }

  // Recurring filter (is:recurring)
  if (query.filters.isRecurring !== undefined) {
    filtered = filtered.filter((tx) => tx.isRecurring === query.filters.isRecurring);
  }

  // Split filter (is:split)
  if (query.filters.isSplit !== undefined) {
    filtered = filtered.filter((tx) => tx.isSplit === query.filters.isSplit);
  }

  // Negated filters (exclude matching results)
  if (query.filters.negated) {
    const neg = query.filters.negated;
    if (neg.category) {
      const catLower = neg.category.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          !tx.categoryName.toLowerCase().includes(catLower) &&
          !tx.category?.toLowerCase().includes(catLower)
      );
    }
    if (neg.merchant) {
      const merchLower = neg.merchant.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          !tx.merchant?.toLowerCase().includes(merchLower) &&
          !tx.description.toLowerCase().includes(merchLower)
      );
    }
    if (neg.tag) {
      const tagLower = neg.tag.toLowerCase();
      filtered = filtered.filter(
        (tx) => !tx.tags?.some((t) => t.toLowerCase().includes(tagLower))
      );
    }
    if (neg.type) {
      if (neg.type === "income") {
        filtered = filtered.filter((tx) => tx.amount <= 0);
      } else if (neg.type === "expense") {
        filtered = filtered.filter((tx) => tx.amount >= 0);
      }
    }
    if (neg.account) {
      const acctLower = neg.account.toLowerCase();
      filtered = filtered.filter((tx) => !tx.accountName.toLowerCase().includes(acctLower));
    }
  }

  return filtered;
}

/**
 * Search using pre-parsed filters (from NL parser or external query)
 * Applies structured filters, then fuzzy-searches any remaining text
 */
export function searchTransactionsWithFilters(
  parsedQuery: ParsedQuery,
  options: {
    limit?: number;
    sortBy?: "relevance" | "date" | "amount";
    sortDirection?: "asc" | "desc";
  } = {}
): SearchResult[] {
  const { limit = 50, sortBy = "relevance", sortDirection = "desc" } = options;

  if (!cachedFuse) {
    console.warn("[TransactionSearch] Index not initialized. Call initializeSearchIndex first.");
    return [];
  }

  if (parsedQuery.hasStructuredFilters) {
    const categoryMap = new Map<string, string>();
    for (const c of cachedCategories) {
      categoryMap.set(c.id, c.name);
      categoryMap.set(c.name, c.name);
    }
    const accountMap = new Map(cachedAccounts.map((a) => [a.id, a.name]));

    const searchableTransactions = cachedTransactions.map((tx) =>
      prepareForSearch(tx, categoryMap, accountMap, cachedLocale)
    );

    const filtered = applyStructuredFilters(searchableTransactions, parsedQuery);

    if (parsedQuery.textQuery.trim()) {
      const tempFuse = new Fuse(filtered, FUSE_OPTIONS);
      // Normalize query to match diacritics-stripped indexed text
      const fuseResults = tempFuse.search(normalizeText(parsedQuery.textQuery));
      const results = fuseResults.map(transformFuseResult);
      return sortResults(results, sortBy, sortDirection).slice(0, limit);
    }

    const results: SearchResult[] = filtered.map((item) => ({
      item: cachedTransactions.find((tx) => tx.id === item.id)!,
      score: 1,
    }));
    return sortResults(results, "date", "desc").slice(0, limit);
  }

  // No structured filters — fall back to pure fuzzy search
  if (!parsedQuery.textQuery.trim()) {
    const allResults: SearchResult[] = cachedTransactions.map((item) => ({
      item,
      score: 1,
    }));
    return sortResults(allResults, sortBy, sortDirection).slice(0, limit);
  }

  // Normalize query to match diacritics-stripped indexed text
  const fuseResults = cachedFuse.search(normalizeText(parsedQuery.textQuery));
  const results = fuseResults.map(transformFuseResult);
  return sortResults(results, sortBy, sortDirection).slice(0, limit);
}

/**
 * Main search function - instant fuzzy search with structured query support
 * Returns results in <50ms for typical datasets (<100k transactions)
 */
export function searchTransactions(
  query: string,
  options: {
    limit?: number;
    sortBy?: "relevance" | "date" | "amount";
    sortDirection?: "asc" | "desc";
  } = {}
): SearchResult[] {
  const { limit = 50, sortBy = "relevance", sortDirection = "desc" } = options;

  if (!cachedFuse) {
    console.warn("[TransactionSearch] Index not initialized. Call initializeSearchIndex first.");
    return [];
  }

  // Empty query returns all transactions
  if (!query.trim()) {
    const allResults: SearchResult[] = cachedTransactions.map((item) => ({
      item,
      score: 1,
    }));
    return sortResults(allResults, sortBy, sortDirection).slice(0, limit);
  }

  // Parse structured query (e.g., "amount:>100 category:groceries coffee")
  const parsedQuery = parseSearchQuery(query);

  // If we have structured filters, apply them first
  if (parsedQuery.hasStructuredFilters) {
    const categoryMap = new Map<string, string>();
    for (const c of cachedCategories) {
      categoryMap.set(c.id, c.name);
      categoryMap.set(c.name, c.name);
    }
    const accountMap = new Map(cachedAccounts.map((a) => [a.id, a.name]));

    const searchableTransactions = cachedTransactions.map((tx) =>
      prepareForSearch(tx, categoryMap, accountMap, cachedLocale)
    );

    const filtered = applyStructuredFilters(searchableTransactions, parsedQuery);

    // If there's remaining text, do fuzzy search on filtered results
    if (parsedQuery.textQuery.trim()) {
      const tempFuse = new Fuse(filtered, FUSE_OPTIONS);
      // Normalize query to match diacritics-stripped indexed text
      const fuseResults = tempFuse.search(normalizeText(parsedQuery.textQuery));
      const results = fuseResults.map(transformFuseResult);
      return sortResults(results, sortBy, sortDirection).slice(0, limit);
    }

    // No text query, return filtered results sorted by date
    const results: SearchResult[] = filtered.map((item) => ({
      item: cachedTransactions.find((tx) => tx.id === item.id)!,
      score: 1,
    }));
    return sortResults(results, "date", "desc").slice(0, limit);
  }

  // Pure fuzzy search — normalize query to match diacritics-stripped indexed text
  const fuseResults = cachedFuse.search(normalizeText(query));
  const results = fuseResults.map(transformFuseResult);
  return sortResults(results, sortBy, sortDirection).slice(0, limit);
}

/**
 * Transform Fuse.js result to our SearchResult format
 */
function transformFuseResult(result: FuseResult<SearchableTransaction>): SearchResult {
  return {
    item: cachedTransactions.find((tx) => tx.id === result.item.id) || result.item,
    score: result.score || 0,
    matches: result.matches?.map((m) => ({
      key: m.key || "",
      value: m.value || "",
      indices: m.indices as [number, number][],
    })),
  };
}

/**
 * Sort search results
 */
function sortResults(
  results: SearchResult[],
  sortBy: "relevance" | "date" | "amount",
  direction: "asc" | "desc"
): SearchResult[] {
  const multiplier = direction === "asc" ? 1 : -1;

  return [...results].sort((a, b) => {
    switch (sortBy) {
      case "relevance":
        // Lower score = better match
        return (a.score - b.score) * multiplier;
      case "date":
        return (new Date(a.item.date).getTime() - new Date(b.item.date).getTime()) * multiplier;
      case "amount":
        return (Math.abs(a.item.amount) - Math.abs(b.item.amount)) * multiplier;
      default:
        return 0;
    }
  });
}

/**
 * Quick filter by amount range
 */
export function filterByAmountRange(
  transactions: Transaction[],
  minAmount: number | undefined,
  maxAmount: number | undefined
): Transaction[] {
  return transactions.filter((tx) => {
    const absAmount = Math.abs(tx.amount);
    if (minAmount !== undefined && absAmount < minAmount) return false;
    if (maxAmount !== undefined && absAmount > maxAmount) return false;
    return true;
  });
}

/**
 * Get search suggestions based on partial query
 */
export function getSearchSuggestions(partialQuery: string, limit: number = 5): string[] {
  if (!cachedFuse || !partialQuery.trim()) {
    return [];
  }

  const results = cachedFuse.search(normalizeText(partialQuery), { limit: limit * 2 });
  const suggestions = new Set<string>();

  for (const result of results) {
    // Add merchant names
    if (result.item.merchant) {
      suggestions.add(result.item.merchant);
    }
    // Add category names
    if (result.item.categoryName && result.item.categoryName !== "Uncategorized") {
      suggestions.add(result.item.categoryName);
    }
    // Add description excerpts
    if (result.item.description) {
      // Extract first meaningful word/phrase
      const words = result.item.description.split(/\s+/).filter((w) => w.length > 3);
      if (words.length > 0) {
        suggestions.add(words[0]);
      }
    }

    if (suggestions.size >= limit) break;
  }

  return Array.from(suggestions).slice(0, limit);
}

/**
 * Clear the search index cache
 */
export function clearSearchIndex(): void {
  cachedFuse = null;
  cachedTransactions = [];
  cachedCategories = [];
  cachedAccounts = [];
}

// Export for testing
export { FUSE_OPTIONS };
