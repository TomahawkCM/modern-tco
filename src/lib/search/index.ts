/**
 * Search Module - World-Class Search for Budget App
 *
 * Features:
 * - Fuzzy search with Fuse.js (typo-tolerant)
 * - Multi-field search (description, merchant, notes, category)
 * - Structured query syntax (amount:>100 category:food)
 * - Natural language parsing ("coffee last week")
 * - Autocomplete with recent searches and saved filters
 * - Offline-first with IndexedDB indexing
 */

// Main search service
export {
  initializeSearchIndex,
  searchTransactions,
  filterByAmountRange,
  getSearchSuggestions,
  clearSearchIndex,
  type SearchResult,
  type SearchableTransaction,
} from './transaction-search';

// Query parser for structured search
export {
  parseSearchQuery,
  formatParsedQuery,
  getFilterSuggestions,
  type ParsedQuery,
  type ParsedFilters,
} from './query-parser';

// Autocomplete engine
export {
  initializeAutocompleteCache,
  getAutocompleteSuggestions,
  addRecentSearch,
  getRecentSearches,
  clearRecentSearches,
  getSavedFilters,
  saveFilter,
  deleteSavedFilter,
  useSavedFilter,
  getAmountRangeSuggestions,
  getTopMerchants,
  getTopCategories,
  clearAutocompleteCache,
  type AutocompleteSuggestion,
  type SavedFilter,
} from './autocomplete';

// Natural language parser
export {
  parseNaturalLanguage,
  getSearchExamples,
  type NaturalLanguageResult,
} from './natural-language-parser';

// Offline search index (IndexedDB)
export {
  rebuildSearchIndex as rebuildOfflineIndex,
  updateTransactionIndex,
  removeTransactionIndex,
  bulkUpdateIndex,
  searchIndex as searchOfflineIndex,
  indexNeedsRebuild,
  getIndexStats,
  clearSearchIndex as clearOfflineIndex,
  initializeSearchIndex as initializeOfflineIndex,
} from './offline-search-index';
