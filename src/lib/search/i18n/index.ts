/**
 * Search i18n Module
 * Internationalization support for the search engine.
 */

// Romanization (Japanese kana → romaji, Korean hangul → romanized)
export {
  kanaToRomaji,
  hangulToRomanized,
  romanize,
  hasRomanizableContent,
} from "./romanization";

// Localized search operators (betrag: → amount:, kategorie: → category:, etc.)
export {
  buildOperatorMap,
  canonicalizeQuery,
  getOperatorMap,
  clearOperatorMapCache,
  type LocalizedOperators,
  type OperatorMap,
  type ValueMap,
} from "./locale-operators";

// Locale-aware natural language keywords (teuer → expensive, gestern → yesterday, etc.)
export {
  buildKeywordPatterns,
  getKeywordPatterns,
  clearKeywordPatternsCache,
  type LocaleKeywordPatterns,
} from "./locale-nl-keywords";
