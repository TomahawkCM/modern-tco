/**
 * useTransactionSearch Hook
 * React hook for instant fuzzy transaction search with autocomplete
 *
 * Features:
 * - Debounced search (50ms) for instant feel
 * - Autocomplete suggestions
 * - Recent search history
 * - Saved filters
 * - Amount range filtering
 */

"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type { Transaction, Category } from "@/types/budget";
import {
  initializeSearchIndex,
  searchTransactions,
  clearSearchIndex,
  type SearchResult,
} from "@/lib/search/transaction-search";
import {
  initializeAutocompleteCache,
  getAutocompleteSuggestions,
  addRecentSearch,
  getRecentSearches,
  getSavedFilters,
  saveFilter,
  deleteSavedFilter,
  type AutocompleteSuggestion,
  type SavedFilter,
} from "@/lib/search/autocomplete";
import { parseSearchQuery, type ParsedQuery } from "@/lib/search/query-parser";

export interface UseTransactionSearchOptions {
  /** Initial transactions to index */
  transactions: Transaction[];
  /** Categories for search enrichment */
  categories?: Category[];
  /** Accounts for search enrichment */
  accounts?: { id: string; name: string }[];
  /** Debounce delay in ms (default: 50) */
  debounceMs?: number;
  /** Max results to return (default: 50) */
  limit?: number;
  /** Enable autocomplete suggestions (default: true) */
  enableAutocomplete?: boolean;
}

export interface UseTransactionSearchReturn {
  /** Current search query */
  query: string;
  /** Set the search query */
  setQuery: (query: string) => void;
  /** Search results */
  results: SearchResult[];
  /** Whether search is loading */
  isSearching: boolean;
  /** Parsed query with filters */
  parsedQuery: ParsedQuery | null;
  /** Autocomplete suggestions */
  suggestions: AutocompleteSuggestion[];
  /** Whether suggestions are visible */
  showSuggestions: boolean;
  /** Set suggestions visibility */
  setShowSuggestions: (show: boolean) => void;
  /** Select an autocomplete suggestion */
  selectSuggestion: (suggestion: AutocompleteSuggestion) => void;
  /** Recent searches */
  recentSearches: string[];
  /** Clear recent searches */
  clearRecentSearches: () => void;
  /** Saved filters */
  savedFilters: SavedFilter[];
  /** Save current query as filter */
  saveCurrentFilter: (name: string) => void;
  /** Delete a saved filter */
  deleteSavedFilter: (id: string) => void;
  /** Apply a saved filter */
  applySavedFilter: (filter: SavedFilter) => void;
  /** Clear search */
  clearSearch: () => void;
  /** Amount filter state */
  amountRange: { min?: number; max?: number };
  /** Set amount range filter */
  setAmountRange: (min?: number, max?: number) => void;
  /** Total transaction count (unfiltered) */
  totalCount: number;
  /** Filtered count */
  filteredCount: number;
}

export function useTransactionSearch(
  options: UseTransactionSearchOptions
): UseTransactionSearchReturn {
  const {
    transactions,
    categories = [],
    accounts = [],
    debounceMs = 50,
    limit = 50,
    enableAutocomplete = true,
  } = options;

  // State
  const [query, setQueryInternal] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [parsedQuery, setParsedQuery] = useState<ParsedQuery | null>(null);
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [amountRange, setAmountRangeState] = useState<{ min?: number; max?: number }>({});

  // Refs for debouncing
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize search index when transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      initializeSearchIndex(transactions, categories, accounts);
      initializeAutocompleteCache(transactions, categories);
    }

    // Cleanup on unmount
    return () => {
      clearSearchIndex();
    };
  }, [transactions, categories, accounts]);

  // Load recent searches and saved filters on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
    setSavedFilters(getSavedFilters());
  }, []);

  // Perform search with debouncing
  const performSearch = useCallback(
    (searchQuery: string) => {
      const startTime = performance.now();

      // Parse query for structured filters
      const parsed = parseSearchQuery(searchQuery);
      setParsedQuery(parsed);

      // Perform search
      const searchResults = searchTransactions(searchQuery, {
        limit,
        sortBy: "relevance",
      });

      const endTime = performance.now();
      console.log(
        `[Search] "${searchQuery}" returned ${searchResults.length} results in ${(endTime - startTime).toFixed(2)}ms`
      );

      setResults(searchResults);
      setIsSearching(false);

      // Add to recent searches if meaningful
      if (searchQuery.trim().length >= 3) {
        addRecentSearch(searchQuery.trim());
        setRecentSearches(getRecentSearches());
      }
    },
    [limit]
  );

  // Set query with debounced search
  const setQuery = useCallback(
    (newQuery: string) => {
      setQueryInternal(newQuery);
      setIsSearching(true);

      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Debounce search
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(newQuery);
      }, debounceMs);

      // Update suggestions immediately (no debounce)
      if (enableAutocomplete) {
        if (suggestionTimeoutRef.current) {
          clearTimeout(suggestionTimeoutRef.current);
        }
        suggestionTimeoutRef.current = setTimeout(() => {
          const newSuggestions = getAutocompleteSuggestions(newQuery, 8);
          setSuggestions(newSuggestions);
          setShowSuggestions(newQuery.length > 0 && newSuggestions.length > 0);
        }, 10);
      }
    },
    [debounceMs, enableAutocomplete, performSearch]
  );

  // Set amount range filter
  const setAmountRange = useCallback(
    (min?: number, max?: number) => {
      setAmountRangeState({ min, max });

      // Update query with amount filter
      let newQuery = query;

      // Remove existing amount filters
      newQuery = newQuery
        .replace(/\$\d+(?:-\d+)?/g, "")
        .replace(/amount:[<>]=?\d+/g, "")
        .trim();

      // Add new amount filter
      if (min !== undefined && max !== undefined) {
        newQuery = `$${min}-${max} ${newQuery}`.trim();
      } else if (min !== undefined) {
        newQuery = `amount:>=${min} ${newQuery}`.trim();
      } else if (max !== undefined) {
        newQuery = `amount:<=${max} ${newQuery}`.trim();
      }

      setQuery(newQuery);
    },
    [query, setQuery]
  );

  // Select an autocomplete suggestion
  const selectSuggestion = useCallback(
    (suggestion: AutocompleteSuggestion) => {
      setShowSuggestions(false);

      switch (suggestion.type) {
        case "merchant":
        case "recent":
          setQuery(suggestion.value);
          break;
        case "category":
        case "filter":
        case "amount":
          // Append filter to existing query
          const currentText = parsedQuery?.textQuery || "";
          setQuery(`${suggestion.value} ${currentText}`.trim());
          break;
        case "saved":
          setQuery(suggestion.value);
          break;
      }
    },
    [parsedQuery, setQuery]
  );

  // Save current filter
  const saveCurrentFilterFn = useCallback(
    (name: string) => {
      if (query.trim()) {
        saveFilter(name, query.trim());
        setSavedFilters(getSavedFilters());
      }
    },
    [query]
  );

  // Delete a saved filter
  const deleteSavedFilterFn = useCallback((id: string) => {
    deleteSavedFilter(id);
    setSavedFilters(getSavedFilters());
  }, []);

  // Apply a saved filter
  const applySavedFilter = useCallback(
    (filter: SavedFilter) => {
      setQuery(filter.query);
      setShowSuggestions(false);
    },
    [setQuery]
  );

  // Clear search
  const clearSearch = useCallback(() => {
    setQueryInternal("");
    setResults([]);
    setParsedQuery(null);
    setSuggestions([]);
    setShowSuggestions(false);
    setAmountRangeState({});
    setIsSearching(false);
  }, []);

  // Clear recent searches
  const clearRecentSearchesFn = useCallback(() => {
    import("@/lib/search/autocomplete").then((mod) => {
      mod.clearRecentSearches();
      setRecentSearches([]);
    });
  }, []);

  // Memoized counts
  const totalCount = transactions.length;
  const filteredCount = results.length;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
    };
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    parsedQuery,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    selectSuggestion,
    recentSearches,
    clearRecentSearches: clearRecentSearchesFn,
    savedFilters,
    saveCurrentFilter: saveCurrentFilterFn,
    deleteSavedFilter: deleteSavedFilterFn,
    applySavedFilter,
    clearSearch,
    amountRange,
    setAmountRange,
    totalCount,
    filteredCount,
  };
}

// Export types
export type { AutocompleteSuggestion, SavedFilter };
