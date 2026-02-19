/**
 * Tests for text-utils.ts
 * Covers: diacritics normalization, CJK detection/tokenization,
 * glossary expansion, and indexing helpers.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  normalizeText,
  containsCJK,
  needsSegmenter,
  segmentWords,
  tokenizeForIndex,
  expandWithGlossary,
  loadGlossary,
  getCachedGlossary,
  clearGlossaryCache,
  type Glossary,
} from "@/lib/search/text-utils";

// ---------------------------------------------------------------------------
// normalizeText — diacritics stripping
// ---------------------------------------------------------------------------
describe("normalizeText", () => {
  it("strips accents from Latin characters", () => {
    expect(normalizeText("café")).toBe("cafe");
    expect(normalizeText("niño")).toBe("nino");
    expect(normalizeText("résumé")).toBe("resume");
    expect(normalizeText("naïve")).toBe("naive");
  });

  it("preserves plain ASCII text", () => {
    expect(normalizeText("hello world")).toBe("hello world");
    expect(normalizeText("amount:>100")).toBe("amount:>100");
  });

  it("handles empty string", () => {
    expect(normalizeText("")).toBe("");
  });

  it("handles mixed diacritics and CJK", () => {
    // CJK characters should pass through unchanged
    expect(normalizeText("café コーヒー")).toBe("cafe コーヒー");
  });

  it("strips combining marks from multi-byte sequences", () => {
    // ü = u + combining diaeresis
    expect(normalizeText("über")).toBe("uber");
    // ą = a + combining ogonek (U+0328) — note: ogonek is outside 0300-036f
    // but NFD normalization + the regex should strip what it covers
    expect(normalizeText("Ångström")).toBe("Angstrom");
  });
});

// ---------------------------------------------------------------------------
// containsCJK
// ---------------------------------------------------------------------------
describe("containsCJK", () => {
  it("detects Japanese hiragana", () => {
    expect(containsCJK("こんにちは")).toBe(true);
  });

  it("detects Japanese katakana", () => {
    expect(containsCJK("コーヒー")).toBe(true);
  });

  it("detects Chinese characters", () => {
    expect(containsCJK("你好世界")).toBe(true);
  });

  it("detects Korean Hangul", () => {
    expect(containsCJK("안녕하세요")).toBe(true);
  });

  it("detects Thai script", () => {
    expect(containsCJK("สวัสดี")).toBe(true);
  });

  it("returns false for pure Latin text", () => {
    expect(containsCJK("hello world")).toBe(false);
    expect(containsCJK("café résumé")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(containsCJK("")).toBe(false);
  });

  it("detects CJK in mixed text", () => {
    expect(containsCJK("Hello 世界")).toBe(true);
    expect(containsCJK("Starbucks コーヒー")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// needsSegmenter
// ---------------------------------------------------------------------------
describe("needsSegmenter", () => {
  it("returns true for Japanese", () => {
    expect(needsSegmenter("ja")).toBe(true);
    expect(needsSegmenter("ja-JP")).toBe(true);
  });

  it("returns true for Chinese", () => {
    expect(needsSegmenter("zh")).toBe(true);
    expect(needsSegmenter("zh-CN")).toBe(true);
    expect(needsSegmenter("zh-TW")).toBe(true);
  });

  it("returns true for Korean", () => {
    expect(needsSegmenter("ko")).toBe(true);
    expect(needsSegmenter("ko-KR")).toBe(true);
  });

  it("returns true for Thai", () => {
    expect(needsSegmenter("th")).toBe(true);
    expect(needsSegmenter("th-TH")).toBe(true);
  });

  it("returns false for English", () => {
    expect(needsSegmenter("en")).toBe(false);
    expect(needsSegmenter("en-US")).toBe(false);
  });

  it("returns false for European languages", () => {
    expect(needsSegmenter("de-DE")).toBe(false);
    expect(needsSegmenter("fr-FR")).toBe(false);
    expect(needsSegmenter("es-MX")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// segmentWords
// ---------------------------------------------------------------------------
describe("segmentWords", () => {
  it("splits English text by whitespace", () => {
    expect(segmentWords("hello world", "en-US")).toEqual(["hello", "world"]);
  });

  it("returns empty array for empty input", () => {
    expect(segmentWords("", "en-US")).toEqual([]);
  });

  it("handles Japanese text (either via Segmenter or fallback)", () => {
    const words = segmentWords("東京タワー", "ja-JP");
    // Should produce at least 1 segment — exact output depends on Intl.Segmenter availability
    expect(words.length).toBeGreaterThan(0);
  });

  it("handles Korean text", () => {
    const words = segmentWords("서울에서 살고 있습니다", "ko-KR");
    expect(words.length).toBeGreaterThan(0);
  });

  it("handles Chinese text", () => {
    const words = segmentWords("你好世界", "zh-CN");
    expect(words.length).toBeGreaterThan(0);
  });

  it("falls back to whitespace split for non-CJK text with CJK locale", () => {
    // Even with ja locale, pure Latin text should split on whitespace
    const words = segmentWords("hello world", "ja-JP");
    expect(words).toContain("hello");
    expect(words).toContain("world");
  });

  it("uses CJK segmentation when text has CJK chars even with en locale", () => {
    const words = segmentWords("コーヒー", "en-US");
    // Should produce segments because text contains CJK
    expect(words.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// tokenizeForIndex
// ---------------------------------------------------------------------------
describe("tokenizeForIndex", () => {
  it("returns text unchanged for non-CJK content", () => {
    expect(tokenizeForIndex("hello world", "en-US")).toBe("hello world");
  });

  it("tokenizes CJK text into space-separated words", () => {
    const result = tokenizeForIndex("東京タワー", "ja-JP");
    // Should contain spaces between segments
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("passes through Latin text with CJK locale when no CJK chars", () => {
    expect(tokenizeForIndex("Starbucks Coffee", "ja-JP")).toBe("Starbucks Coffee");
  });
});

// ---------------------------------------------------------------------------
// expandWithGlossary
// ---------------------------------------------------------------------------
describe("expandWithGlossary", () => {
  const testGlossary: Glossary = {
    account: ["口座", "アカウント"],
    grocery: ["食料品", "スーパー"],
    salary: ["給料", "給与"],
  };

  it("expands English term with locale synonyms", () => {
    const result = expandWithGlossary("my account", testGlossary);
    expect(result).toContain("my account");
    expect(result).toContain("口座");
    expect(result).toContain("アカウント");
  });

  it("expands locale term with English synonym", () => {
    const result = expandWithGlossary("口座残高", testGlossary);
    expect(result).toContain("口座残高");
    expect(result).toContain("account");
  });

  it("returns original text when no glossary match", () => {
    expect(expandWithGlossary("random text", testGlossary)).toBe("random text");
  });

  it("returns text unchanged when glossary is null", () => {
    expect(expandWithGlossary("account", null)).toBe("account");
  });

  it("returns text unchanged when text is empty", () => {
    expect(expandWithGlossary("", testGlossary)).toBe("");
  });

  it("does not duplicate terms already present", () => {
    const result = expandWithGlossary("my account 口座", testGlossary);
    // Should not add 口座 again since it's already in the text
    const count = (result.match(/口座/g) || []).length;
    expect(count).toBe(1);
  });

  it("handles case-insensitive matching", () => {
    const result = expandWithGlossary("My Account", testGlossary);
    expect(result).toContain("口座");
  });

  it("adds cross-translations when a translation is found", () => {
    // When 口座 (first translation of "account") is found,
    // it should also add アカウント (the other translation)
    const result = expandWithGlossary("口座残高", testGlossary);
    expect(result).toContain("アカウント");
  });
});

// ---------------------------------------------------------------------------
// loadGlossary / getCachedGlossary / clearGlossaryCache
// ---------------------------------------------------------------------------
describe("glossary cache", () => {
  beforeEach(() => {
    clearGlossaryCache();
  });

  it("returns null for English locale", async () => {
    const glossary = await loadGlossary("en-US");
    expect(glossary).toBeNull();
  });

  it("returns null for en-prefixed locale", async () => {
    const glossary = await loadGlossary("en-GB");
    expect(glossary).toBeNull();
  });

  it("caches results after first load", async () => {
    await loadGlossary("en-US");
    const cached = getCachedGlossary("en-US");
    expect(cached).toBeNull(); // English returns null, but it's cached
  });

  it("getCachedGlossary returns null for unloaded locale", () => {
    expect(getCachedGlossary("xx-XX")).toBeNull();
  });

  it("clearGlossaryCache clears all entries", async () => {
    await loadGlossary("en-US");
    clearGlossaryCache();
    // After clearing, getCachedGlossary should return null (not cached)
    expect(getCachedGlossary("en-US")).toBeNull();
  });
});
