/**
 * Search Module - World-Class Multilingual Search for Budget App
 *
 * Features:
 * - Fuzzy search with Fuse.js (typo-tolerant)
 * - Multi-field search (description, merchant, notes, category)
 * - Structured query syntax (amount:>100 category:food)
 * - Natural language parsing ("coffee last week")
 * - Autocomplete with recent searches and saved filters
 * - Offline-first with IndexedDB indexing
 * - CJK tokenization via Intl.Segmenter (Japanese, Chinese, Korean, Thai)
 * - Glossary-based cross-language synonym matching
 * - Japanese kana→romaji and Korean hangul→romanization
 * - Localized search operators (betrag:>50, カテゴリー:食品)
 * - Locale-aware natural language keywords
 * - Intl.Collator-based locale-aware sorting
 */

// Main search service
export {
  initializeSearchIndex,
  searchTransactions,
  searchTransactionsWithFilters,
  filterByAmountRange,
  getSearchSuggestions,
  clearSearchIndex,
  normalizeText,
  type SearchResult,
  type SearchableTransaction,
} from "./transaction-search";

// Text utilities (CJK tokenization, glossary expansion)
export {
  containsCJK,
  needsSegmenter,
  segmentWords,
  tokenizeForIndex,
  expandWithGlossary,
  loadGlossary,
  getCachedGlossary,
  clearGlossaryCache,
  type Glossary,
} from "./text-utils";

// Query parser for structured search
export {
  parseSearchQuery,
  formatParsedQuery,
  getFilterSuggestions,
  type ParsedQuery,
  type ParsedFilters,
} from "./query-parser";

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
} from "./autocomplete";

// Natural language parser
export {
  parseNaturalLanguage,
  getSearchExamples,
  type NaturalLanguageResult,
} from "./natural-language-parser";

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
} from "./offline-search-index";

// i18n: Romanization, localized operators, locale NL keywords
export {
  kanaToRomaji,
  hangulToRomanized,
  romanize,
  hasRomanizableContent,
  buildOperatorMap,
  canonicalizeQuery,
  getOperatorMap,
  clearOperatorMapCache,
  buildKeywordPatterns,
  getKeywordPatterns,
  clearKeywordPatternsCache,
  type LocalizedOperators,
  type OperatorMap,
  type ValueMap,
  type LocaleKeywordPatterns,
} from "./i18n";
