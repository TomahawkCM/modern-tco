/**
 * Romanization Module
 * Converts CJK text to romanized form for type-ahead matching.
 *
 * Scoped conversions (under 50KB budget):
 * - Japanese: Hiragana/Katakana → Romaji (Hepburn-based)
 * - Korean: Hangul → Revised Romanization (algorithmic)
 *
 * Other scripts (Chinese, Arabic, Hindi) rely on glossary expansion only.
 */

// ---------------------------------------------------------------------------
// Japanese Kana → Romaji
// ---------------------------------------------------------------------------

/**
 * Hiragana → Romaji mapping (Hepburn romanization).
 * Covers all basic kana + common digraphs.
 */
const HIRAGANA_TO_ROMAJI: Record<string, string> = {
  // Vowels
  あ: "a",
  い: "i",
  う: "u",
  え: "e",
  お: "o",
  // K-row
  か: "ka",
  き: "ki",
  く: "ku",
  け: "ke",
  こ: "ko",
  // S-row
  さ: "sa",
  し: "shi",
  す: "su",
  せ: "se",
  そ: "so",
  // T-row
  た: "ta",
  ち: "chi",
  つ: "tsu",
  て: "te",
  と: "to",
  // N-row
  な: "na",
  に: "ni",
  ぬ: "nu",
  ね: "ne",
  の: "no",
  // H-row
  は: "ha",
  ひ: "hi",
  ふ: "fu",
  へ: "he",
  ほ: "ho",
  // M-row
  ま: "ma",
  み: "mi",
  む: "mu",
  め: "me",
  も: "mo",
  // Y-row
  や: "ya",
  ゆ: "yu",
  よ: "yo",
  // R-row
  ら: "ra",
  り: "ri",
  る: "ru",
  れ: "re",
  ろ: "ro",
  // W-row
  わ: "wa",
  ゐ: "wi",
  ゑ: "we",
  を: "wo",
  // N
  ん: "n",
  // Dakuten (voiced)
  が: "ga",
  ぎ: "gi",
  ぐ: "gu",
  げ: "ge",
  ご: "go",
  ざ: "za",
  じ: "ji",
  ず: "zu",
  ぜ: "ze",
  ぞ: "zo",
  だ: "da",
  ぢ: "di",
  づ: "du",
  で: "de",
  ど: "do",
  ば: "ba",
  び: "bi",
  ぶ: "bu",
  べ: "be",
  ぼ: "bo",
  // Handakuten (semi-voiced)
  ぱ: "pa",
  ぴ: "pi",
  ぷ: "pu",
  ぺ: "pe",
  ぽ: "po",
  // Small kana (digraph components)
  ゃ: "ya",
  ゅ: "yu",
  ょ: "yo",
  ぁ: "a",
  ぃ: "i",
  ぅ: "u",
  ぇ: "e",
  ぉ: "o",
  // Sokuon (double consonant)
  っ: "",
};

/**
 * Digraph combinations (2-kana → single romaji).
 * Must be checked before individual kana.
 */
const HIRAGANA_DIGRAPHS: Record<string, string> = {
  きゃ: "kya",
  きゅ: "kyu",
  きょ: "kyo",
  しゃ: "sha",
  しゅ: "shu",
  しょ: "sho",
  ちゃ: "cha",
  ちゅ: "chu",
  ちょ: "cho",
  にゃ: "nya",
  にゅ: "nyu",
  にょ: "nyo",
  ひゃ: "hya",
  ひゅ: "hyu",
  ひょ: "hyo",
  みゃ: "mya",
  みゅ: "myu",
  みょ: "myo",
  りゃ: "rya",
  りゅ: "ryu",
  りょ: "ryo",
  ぎゃ: "gya",
  ぎゅ: "gyu",
  ぎょ: "gyo",
  じゃ: "ja",
  じゅ: "ju",
  じょ: "jo",
  びゃ: "bya",
  びゅ: "byu",
  びょ: "byo",
  ぴゃ: "pya",
  ぴゅ: "pyu",
  ぴょ: "pyo",
};

/**
 * Build katakana maps from hiragana by offsetting Unicode code points.
 * Katakana block starts at U+30A0, hiragana at U+3040 (offset = 0x60).
 */
const KATAKANA_OFFSET = 0x60;

function hiraganaToKatakana(char: string): string {
  return String.fromCharCode(char.charCodeAt(0) + KATAKANA_OFFSET);
}

const KATAKANA_TO_ROMAJI: Record<string, string> = {};
for (const [kana, romaji] of Object.entries(HIRAGANA_TO_ROMAJI)) {
  KATAKANA_TO_ROMAJI[hiraganaToKatakana(kana)] = romaji;
}
// Special katakana characters
KATAKANA_TO_ROMAJI["ー"] = ""; // Long vowel mark

const KATAKANA_DIGRAPHS: Record<string, string> = {};
for (const [kana, romaji] of Object.entries(HIRAGANA_DIGRAPHS)) {
  const kata = kana
    .split("")
    .map((c) => hiraganaToKatakana(c))
    .join("");
  KATAKANA_DIGRAPHS[kata] = romaji;
}

/**
 * Convert Japanese text (hiragana/katakana) to romaji.
 * Kanji is passed through unchanged (relies on glossary for kanji matching).
 */
export function kanaToRomaji(text: string): string {
  let result = "";
  let i = 0;

  while (i < text.length) {
    // Check 2-character digraphs first
    if (i + 1 < text.length) {
      const pair = text[i] + text[i + 1];
      if (HIRAGANA_DIGRAPHS[pair]) {
        result += HIRAGANA_DIGRAPHS[pair];
        i += 2;
        continue;
      }
      if (KATAKANA_DIGRAPHS[pair]) {
        result += KATAKANA_DIGRAPHS[pair];
        i += 2;
        continue;
      }
    }

    const char = text[i];

    // Handle sokuon (っ/ッ) — doubles the next consonant
    if (char === "っ" || char === "ッ") {
      if (i + 1 < text.length) {
        const nextRomaji =
          HIRAGANA_TO_ROMAJI[text[i + 1]] ||
          KATAKANA_TO_ROMAJI[text[i + 1]] ||
          "";
        if (nextRomaji.length > 0) {
          result += nextRomaji[0]; // Double the first consonant
        }
      }
      i++;
      continue;
    }

    // Single kana lookup
    if (HIRAGANA_TO_ROMAJI[char] !== undefined) {
      result += HIRAGANA_TO_ROMAJI[char];
      i++;
      continue;
    }
    if (KATAKANA_TO_ROMAJI[char] !== undefined) {
      result += KATAKANA_TO_ROMAJI[char];
      i++;
      continue;
    }

    // Non-kana character: pass through
    result += char;
    i++;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Korean Hangul → Revised Romanization
// ---------------------------------------------------------------------------

/**
 * Korean Hangul is algorithmically decomposable:
 * Syllable = (initial × 21 + medial) × 28 + final + 0xAC00
 *
 * Revised Romanization of Korean (RR) is the official romanization system.
 */

const KOREAN_INITIALS = [
  "g",
  "kk",
  "n",
  "d",
  "tt",
  "r",
  "m",
  "b",
  "pp",
  "s",
  "ss",
  "",
  "j",
  "jj",
  "ch",
  "k",
  "t",
  "p",
  "h",
];

const KOREAN_MEDIALS = [
  "a",
  "ae",
  "ya",
  "yae",
  "eo",
  "e",
  "yeo",
  "ye",
  "o",
  "wa",
  "wae",
  "oe",
  "yo",
  "u",
  "wo",
  "we",
  "wi",
  "yu",
  "eu",
  "ui",
  "i",
];

const KOREAN_FINALS = [
  "",
  "k",
  "k",
  "k",
  "n",
  "n",
  "n",
  "t",
  "l",
  "l",
  "l",
  "l",
  "l",
  "l",
  "l",
  "l",
  "m",
  "p",
  "p",
  "t",
  "t",
  "ng",
  "t",
  "t",
  "k",
  "t",
  "p",
  "t",
];

// Hangul syllable block range
const HANGUL_START = 0xac00;
const HANGUL_END = 0xd7a3;

/**
 * Convert a single Hangul syllable to Revised Romanization.
 */
function hangulToRR(char: string): string {
  const code = char.charCodeAt(0);
  if (code < HANGUL_START || code > HANGUL_END) return char;

  const syllableIndex = code - HANGUL_START;
  const initialIndex = Math.floor(syllableIndex / (21 * 28));
  const medialIndex = Math.floor((syllableIndex % (21 * 28)) / 28);
  const finalIndex = syllableIndex % 28;

  return (
    KOREAN_INITIALS[initialIndex] +
    KOREAN_MEDIALS[medialIndex] +
    KOREAN_FINALS[finalIndex]
  );
}

/**
 * Convert Korean Hangul text to Revised Romanization.
 * Non-Hangul characters are passed through unchanged.
 */
export function hangulToRomanized(text: string): string {
  let result = "";
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (code >= HANGUL_START && code <= HANGUL_END) {
      result += hangulToRR(char);
    } else {
      result += char;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Unified romanization
// ---------------------------------------------------------------------------

/** Hiragana range */
const HIRAGANA_REGEX = /[\u3040-\u309F]/;
/** Katakana range */
const KATAKANA_REGEX = /[\u30A0-\u30FF]/;
/** Hangul range */
const HANGUL_REGEX = /[\uAC00-\uD7AF]/;

/**
 * Romanize text based on detected script.
 * Returns the romanized form, or the original text if no conversion applies.
 *
 * @param text - Input text potentially containing CJK characters
 * @param locale - BCP 47 locale tag (helps disambiguate when text is mixed)
 * @returns Romanized text (lowercase)
 */
export function romanize(text: string, locale: string = "en-US"): string {
  if (!text) return "";

  const lang = locale.split("-")[0];
  let result = text;

  // Japanese: convert kana to romaji
  if (lang === "ja" || HIRAGANA_REGEX.test(text) || KATAKANA_REGEX.test(text)) {
    result = kanaToRomaji(result);
  }

  // Korean: convert Hangul to Revised Romanization
  if (lang === "ko" || HANGUL_REGEX.test(text)) {
    result = hangulToRomanized(result);
  }

  return result.toLowerCase();
}

/**
 * Check if text contains characters that can be romanized.
 */
export function hasRomanizableContent(text: string): boolean {
  return (
    HIRAGANA_REGEX.test(text) || KATAKANA_REGEX.test(text) || HANGUL_REGEX.test(text)
  );
}
