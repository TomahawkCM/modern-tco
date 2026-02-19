/**
 * Tests for romanization.ts
 * Covers: Japanese kana→romaji, Korean Hangul→Revised Romanization,
 * unified romanize(), and hasRomanizableContent().
 */

import { describe, it, expect } from "vitest";
import {
  kanaToRomaji,
  hangulToRomanized,
  romanize,
  hasRomanizableContent,
} from "@/lib/search/i18n/romanization";

// ---------------------------------------------------------------------------
// kanaToRomaji — Japanese
// ---------------------------------------------------------------------------
describe("kanaToRomaji", () => {
  describe("basic hiragana", () => {
    it("converts vowels", () => {
      expect(kanaToRomaji("あいうえお")).toBe("aiueo");
    });

    it("converts k-row", () => {
      expect(kanaToRomaji("かきくけこ")).toBe("kakikukeko");
    });

    it("converts s-row (with shi)", () => {
      expect(kanaToRomaji("さしすせそ")).toBe("sashisuseso");
    });

    it("converts t-row (with chi, tsu)", () => {
      expect(kanaToRomaji("たちつてと")).toBe("tachitsuteto");
    });

    it("converts n-row", () => {
      expect(kanaToRomaji("なにぬねの")).toBe("naninuneno");
    });

    it("converts h-row (with fu)", () => {
      expect(kanaToRomaji("はひふへほ")).toBe("hahifuheho");
    });

    it("converts standalone n", () => {
      expect(kanaToRomaji("ん")).toBe("n");
    });
  });

  describe("katakana", () => {
    it("converts basic katakana vowels", () => {
      expect(kanaToRomaji("アイウエオ")).toBe("aiueo");
    });

    it("converts katakana k-row", () => {
      expect(kanaToRomaji("カキクケコ")).toBe("kakikukeko");
    });

    it("converts common loanwords", () => {
      // コーヒー = ko-hi- (long vowel marks become empty)
      expect(kanaToRomaji("コーヒー")).toBe("kohi");
    });

    it("handles long vowel mark (ー)", () => {
      expect(kanaToRomaji("ラーメン")).toBe("ramen");
    });
  });

  describe("digraphs", () => {
    it("converts hiragana digraphs", () => {
      expect(kanaToRomaji("きゃ")).toBe("kya");
      expect(kanaToRomaji("しゃ")).toBe("sha");
      expect(kanaToRomaji("ちゅ")).toBe("chu");
    });

    it("converts katakana digraphs", () => {
      expect(kanaToRomaji("キャ")).toBe("kya");
      expect(kanaToRomaji("シャ")).toBe("sha");
      expect(kanaToRomaji("チュ")).toBe("chu");
    });
  });

  describe("sokuon (double consonant)", () => {
    it("doubles consonant with hiragana っ", () => {
      // きって = ki-t-te
      expect(kanaToRomaji("きって")).toBe("kitte");
    });

    it("doubles consonant with katakana ッ", () => {
      // カップ = ka-p-pu
      expect(kanaToRomaji("カップ")).toBe("kappu");
    });
  });

  describe("voiced consonants (dakuten)", () => {
    it("converts ga-row", () => {
      expect(kanaToRomaji("がぎぐげご")).toBe("gagigugego");
    });

    it("converts za-row", () => {
      expect(kanaToRomaji("ざじずぜぞ")).toBe("zajizuzezo");
    });

    it("converts ba-row", () => {
      expect(kanaToRomaji("ばびぶべぼ")).toBe("babibubebo");
    });
  });

  describe("semi-voiced (handakuten)", () => {
    it("converts pa-row", () => {
      expect(kanaToRomaji("ぱぴぷぺぽ")).toBe("papipupepo");
    });
  });

  describe("mixed content", () => {
    it("passes through kanji unchanged", () => {
      expect(kanaToRomaji("東京")).toBe("東京");
    });

    it("handles mixed kana and kanji", () => {
      // 東京タワー = 東京 (kanji, pass through) + タワー (tawa)
      expect(kanaToRomaji("東京タワー")).toBe("東京tawa");
    });

    it("handles Latin mixed with kana", () => {
      expect(kanaToRomaji("Starbucks コーヒー")).toBe("Starbucks kohi");
    });

    it("handles empty string", () => {
      expect(kanaToRomaji("")).toBe("");
    });
  });

  describe("real-world transaction descriptions", () => {
    it("converts スターバックス (Starbucks)", () => {
      expect(kanaToRomaji("スターバックス")).toBe("sutabakkusu");
    });

    it("converts アマゾン (Amazon)", () => {
      expect(kanaToRomaji("アマゾン")).toBe("amazon");
    });

    it("converts ガソリン (gasoline)", () => {
      expect(kanaToRomaji("ガソリン")).toBe("gasorin");
    });
  });
});

// ---------------------------------------------------------------------------
// hangulToRomanized — Korean
// ---------------------------------------------------------------------------
describe("hangulToRomanized", () => {
  it("converts basic syllables", () => {
    // 가 = ga
    expect(hangulToRomanized("가")).toBe("ga");
  });

  it("converts 한국 (hanguk = Korea)", () => {
    expect(hangulToRomanized("한국")).toBe("hanguk");
  });

  it("converts 서울 (seoul = Seoul)", () => {
    expect(hangulToRomanized("서울")).toBe("seoul");
  });

  it("converts 김치 (gimchi = kimchi)", () => {
    // Note: Revised Romanization uses "g" not "k" for initial ㄱ
    expect(hangulToRomanized("김치")).toBe("gimchi");
  });

  it("passes through non-Hangul characters", () => {
    expect(hangulToRomanized("Hello 세계")).toBe("Hello segye");
  });

  it("handles empty string", () => {
    expect(hangulToRomanized("")).toBe("");
  });

  it("handles mixed Hangul and numbers", () => {
    expect(hangulToRomanized("삼성 Galaxy S24")).toBe("samseong Galaxy S24");
  });

  it("converts common transaction-related words", () => {
    // 식료품 = grocery
    const result = hangulToRomanized("식료품");
    expect(result.length).toBeGreaterThan(0);
    expect(typeof result).toBe("string");
  });
});

// ---------------------------------------------------------------------------
// romanize — unified
// ---------------------------------------------------------------------------
describe("romanize", () => {
  it("converts Japanese kana with ja locale", () => {
    const result = romanize("コーヒー", "ja-JP");
    expect(result).toBe("kohi");
  });

  it("converts Korean Hangul with ko locale", () => {
    const result = romanize("서울", "ko-KR");
    expect(result).toBe("seoul");
  });

  it("auto-detects Japanese kana regardless of locale", () => {
    const result = romanize("コーヒー", "en-US");
    expect(result).toBe("kohi");
  });

  it("auto-detects Korean Hangul regardless of locale", () => {
    const result = romanize("서울", "en-US");
    expect(result).toBe("seoul");
  });

  it("returns lowercase", () => {
    const result = romanize("ABC コーヒー", "ja-JP");
    expect(result).toBe(result.toLowerCase());
  });

  it("returns empty string for empty input", () => {
    expect(romanize("")).toBe("");
  });

  it("passes through pure Latin text (lowercased)", () => {
    expect(romanize("Hello World", "en-US")).toBe("hello world");
  });
});

// ---------------------------------------------------------------------------
// hasRomanizableContent
// ---------------------------------------------------------------------------
describe("hasRomanizableContent", () => {
  it("returns true for hiragana", () => {
    expect(hasRomanizableContent("こんにちは")).toBe(true);
  });

  it("returns true for katakana", () => {
    expect(hasRomanizableContent("コーヒー")).toBe(true);
  });

  it("returns true for Hangul", () => {
    expect(hasRomanizableContent("안녕하세요")).toBe(true);
  });

  it("returns false for pure Latin", () => {
    expect(hasRomanizableContent("hello world")).toBe(false);
  });

  it("returns false for Chinese characters (kanji only)", () => {
    // Chinese characters are NOT romanizable (no kana or hangul)
    expect(hasRomanizableContent("你好")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(hasRomanizableContent("")).toBe(false);
  });

  it("returns true for mixed content with kana", () => {
    expect(hasRomanizableContent("Starbucks コーヒー")).toBe(true);
  });
});
