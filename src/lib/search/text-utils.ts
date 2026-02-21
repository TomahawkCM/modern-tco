/**
 * Text utilities for the search module.
 * Separated into its own file to avoid circular imports between
 * transaction-search.ts and query-parser.ts.
 *
 * Provides:
 * - Diacritics normalization (accent-insensitive matching)
 * - CJK tokenization via Intl.Segmenter (Japanese, Chinese, Korean, Thai, etc.)
 * - Glossary expansion (English↔locale synonym matching)
 */

// ---------------------------------------------------------------------------
// Diacritics normalization
// ---------------------------------------------------------------------------

/**
 * Normalize text by stripping diacritics / accent marks.
 * This allows searching "cafe" to match "café", "nino" to match "niño", etc.
 *
 * Uses Unicode NFD (Canonical Decomposition) to split combined characters
 * into base characters + combining marks, then removes the combining marks.
 */
export function normalizeText(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// ---------------------------------------------------------------------------
// CJK tokenization
// ---------------------------------------------------------------------------

/**
 * CJK Unicode ranges:
 * - CJK Unified Ideographs (Chinese/Japanese kanji/Korean hanja)
 * - Hiragana, Katakana (Japanese)
 * - Hangul Syllables + Jamo (Korean)
 * - CJK Compatibility Ideographs
 * - Thai, Khmer, Lao, Myanmar script ranges
 */
const CJK_REGEX =
  /[\u2E80-\u2FFF\u3040-\u309F\u30A0-\u30FF\u3100-\u312F\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF\u0E00-\u0E7F\u1780-\u17FF\u0E80-\u0EFF\u1000-\u109F]/;

/**
 * Check if text contains CJK characters (Chinese, Japanese, Korean, Thai, etc.)
 */
export function containsCJK(text: string): boolean {
  return CJK_REGEX.test(text);
}

/**
 * Locales that need Intl.Segmenter for word boundary detection
 * because they don't use whitespace between words.
 */
const SEGMENTER_LOCALES = new Set(["ja", "zh", "ko", "th", "km", "lo", "my"]);

/**
 * Check if a locale requires Intl.Segmenter for proper tokenization.
 */
export function needsSegmenter(locale: string): boolean {
  const lang = locale.split("-")[0];
  return SEGMENTER_LOCALES.has(lang);
}

// Cache segmenter instances per locale to avoid repeated construction
const segmenterCache = new Map<string, Intl.Segmenter>();

/**
 * Segment text into words using Intl.Segmenter for CJK locales,
 * or simple whitespace split for others.
 *
 * For CJK locales, this produces proper word boundaries so that
 * Fuse.js substring matching works correctly.
 */
export function segmentWords(text: string, locale: string = "en-US"): string[] {
  if (!text) return [];

  const lang = locale.split("-")[0];

  // For non-CJK locales or if text has no CJK characters, use simple split
  if (!SEGMENTER_LOCALES.has(lang) && !containsCJK(text)) {
    return text.split(/\s+/).filter(Boolean);
  }

  // Use Intl.Segmenter for word-level tokenization
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    let segmenter = segmenterCache.get(lang);
    if (!segmenter) {
      segmenter = new Intl.Segmenter(lang, { granularity: "word" });
      segmenterCache.set(lang, segmenter);
    }

    const segments: string[] = [];
    for (const { segment, isWordLike } of segmenter.segment(text)) {
      if (isWordLike) {
        segments.push(segment);
      }
    }
    return segments;
  }

  // Fallback: split on whitespace + CJK character boundaries
  return text
    .replace(CJK_REGEX, (char) => ` ${char} `)
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Tokenize text for search indexing.
 * For CJK text, segments into words and joins with spaces so Fuse.js
 * can match individual words as substrings.
 */
export function tokenizeForIndex(text: string, locale: string = "en-US"): string {
  if (!containsCJK(text) && !needsSegmenter(locale)) {
    return text;
  }

  const words = segmentWords(text, locale);
  return words.join(" ");
}

// ---------------------------------------------------------------------------
// Glossary expansion
// ---------------------------------------------------------------------------

/** Glossary format: English term → array of locale translations */
export type Glossary = Record<string, string[]>;

/**
 * Expand text with glossary synonyms for cross-language matching.
 *
 * For each word/phrase in the glossary that appears in the text,
 * appends the corresponding synonyms. This allows searching
 * "account" to match "口座" and vice versa.
 *
 * @param text - The text to expand
 * @param glossary - English→locale synonym map
 * @returns Original text with appended synonyms
 */
export function expandWithGlossary(text: string, glossary: Glossary | null): string {
  if (!glossary || !text) return text;

  const lowerText = text.toLowerCase();
  const expansions: string[] = [];

  for (const [englishTerm, translations] of Object.entries(glossary)) {
    const termLower = englishTerm.toLowerCase();

    // Check if the English term appears in the text
    if (lowerText.includes(termLower)) {
      for (const translation of translations) {
        if (!lowerText.includes(translation.toLowerCase())) {
          expansions.push(translation);
        }
      }
    }

    // Check if any translation appears in the text (reverse lookup)
    for (const translation of translations) {
      if (lowerText.includes(translation.toLowerCase())) {
        if (!lowerText.includes(termLower)) {
          expansions.push(englishTerm);
        }
        // Also add other translations for this term
        for (const otherTranslation of translations) {
          if (
            otherTranslation !== translation &&
            !lowerText.includes(otherTranslation.toLowerCase())
          ) {
            expansions.push(otherTranslation);
          }
        }
        break;
      }
    }
  }

  if (expansions.length === 0) return text;
  return `${text} ${expansions.join(" ")}`;
}

// Glossary cache: locale → glossary (or null if not available)
const glossaryCache = new Map<string, Glossary | null>();

/**
 * Load a glossary for a given locale. Caches the result.
 * Returns null if no glossary file exists for the locale.
 */
export async function loadGlossary(locale: string): Promise<Glossary | null> {
  if (glossaryCache.has(locale)) {
    return glossaryCache.get(locale)!;
  }

  // English doesn't need a glossary (it IS the source)
  if (locale === "en-US" || locale.startsWith("en")) {
    glossaryCache.set(locale, null);
    return null;
  }

  try {
    const mod = await import(`@/i18n/glossaries/${locale}.json`);
    const glossary: Glossary = mod.default || mod;
    glossaryCache.set(locale, glossary);
    return glossary;
  } catch {
    // No glossary for this locale
    glossaryCache.set(locale, null);
    return null;
  }
}

/**
 * Get the cached glossary for a locale (synchronous).
 * Returns null if not yet loaded or unavailable.
 * Call loadGlossary() first to ensure it's cached.
 */
export function getCachedGlossary(locale: string): Glossary | null {
  return glossaryCache.get(locale) ?? null;
}

/**
 * Clear the glossary cache (useful for testing).
 */
export function clearGlossaryCache(): void {
  glossaryCache.clear();
}
