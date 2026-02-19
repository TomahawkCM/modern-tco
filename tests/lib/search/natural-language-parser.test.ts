/**
 * Tests for natural-language-parser.ts
 * Covers: English NL parsing, locale-aware keyword matching, search examples.
 */

import { describe, it, expect } from "vitest";
import {
  parseNaturalLanguage,
  getSearchExamples,
} from "@/lib/search/natural-language-parser";
import { buildKeywordPatterns } from "@/lib/search/i18n/locale-nl-keywords";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const germanMessages = {
  searchNaturalLanguage: {
    today: "heute",
    yesterday: "gestern",
    lastWeek: "letzte Woche",
    thisWeek: "diese Woche",
    lastMonth: "letzter Monat",
    thisMonth: "dieser Monat",
    lastYear: "letztes Jahr",
    thisYear: "dieses Jahr",
    recently: "kürzlich",
    expensive: "teuer",
    cheap: "günstig",
    large: "groß",
    small: "klein",
    income: "Einkommen",
    expense: "Ausgabe",
    salary: "Gehalt",
    deposit: "Einzahlung",
    refund: "Rückerstattung",
    spent: "ausgegeben",
    purchase: "Einkauf",
    bought: "gekauft",
    paid: "bezahlt",
    bill: "Rechnung",
  },
};

const japaneseMessages = {
  searchNaturalLanguage: {
    today: "今日",
    yesterday: "昨日",
    lastWeek: "先週",
    thisWeek: "今週",
    lastMonth: "先月",
    thisMonth: "今月",
    expensive: "高い",
    cheap: "安い",
    income: "収入",
    expense: "支出",
    salary: "給料",
    deposit: "入金",
    refund: "返金",
    spent: "使った",
    purchase: "購入",
    bought: "買った",
    paid: "支払い",
    bill: "請求",
  },
};

// ---------------------------------------------------------------------------
// English NL parsing (no locale options)
// ---------------------------------------------------------------------------
describe("parseNaturalLanguage — English", () => {
  it("parses 'coffee last week'", () => {
    const result = parseNaturalLanguage("coffee last week");
    expect(result.query.filters.dateStart).toBeInstanceOf(Date);
    expect(result.query.filters.dateEnd).toBeInstanceOf(Date);
    expect(result.confidence).toBeLessThan(1);
  });

  it("parses 'Amazon over $50'", () => {
    const result = parseNaturalLanguage("Amazon over $50");
    expect(result.query.filters.amountMin).toBeCloseTo(50.01, 1);
  });

  it("parses 'under $25'", () => {
    const result = parseNaturalLanguage("under $25");
    expect(result.query.filters.amountMax).toBeCloseTo(24.99, 1);
  });

  it("parses 'expensive'", () => {
    const result = parseNaturalLanguage("expensive");
    expect(result.query.filters.amountMin).toBe(100);
  });

  it("parses 'cheap'", () => {
    const result = parseNaturalLanguage("cheap");
    expect(result.query.filters.amountMax).toBe(25);
  });

  it("parses 'today'", () => {
    const result = parseNaturalLanguage("today");
    expect(result.query.filters.dateStart).toBeInstanceOf(Date);
    const now = new Date();
    expect(result.query.filters.dateStart!.getDate()).toBe(now.getDate());
  });

  it("parses 'yesterday'", () => {
    const result = parseNaturalLanguage("yesterday");
    expect(result.query.filters.dateStart).toBeInstanceOf(Date);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(result.query.filters.dateStart!.getDate()).toBe(yesterday.getDate());
  });

  it("parses 'this month'", () => {
    const result = parseNaturalLanguage("this month");
    expect(result.query.filters.dateStart).toBeInstanceOf(Date);
    expect(result.query.filters.dateStart!.getDate()).toBe(1);
  });

  it("parses 'income'", () => {
    const result = parseNaturalLanguage("income");
    expect(result.query.filters.type).toBe("income");
  });

  it("parses 'expense'", () => {
    const result = parseNaturalLanguage("expense");
    expect(result.query.filters.type).toBe("expense");
  });

  it("recognizes category alias: 'groceries'", () => {
    const result = parseNaturalLanguage("groceries");
    expect(result.query.filters.category).toBe("Groceries");
  });

  it("recognizes category alias: 'restaurant'", () => {
    const result = parseNaturalLanguage("restaurant");
    expect(result.query.filters.category).toBe("Food & Dining");
  });

  it("handles structured query passthrough", () => {
    const result = parseNaturalLanguage("amount:>100 category:food");
    expect(result.confidence).toBe(0.95); // High confidence for explicit filters
    expect(result.query.hasStructuredFilters).toBe(true);
  });

  it("parses 'past 14 days'", () => {
    const result = parseNaturalLanguage("past 14 days");
    expect(result.query.filters.dateStart).toBeInstanceOf(Date);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    expect(result.query.filters.dateStart!.getDate()).toBe(twoWeeksAgo.getDate());
  });

  it("parses '$50-100'", () => {
    const result = parseNaturalLanguage("$50-100");
    expect(result.query.filters.amountMin).toBe(50);
    expect(result.query.filters.amountMax).toBe(100);
  });

  it("parses 'around $50'", () => {
    const result = parseNaturalLanguage("around $50");
    // The structured query parser catches "$50" first as an approximate match (±0.5)
    // before the NL "around" pattern. Both produce an amount range.
    expect(result.query.filters.amountMin).toBeDefined();
    expect(result.query.filters.amountMax).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Locale-aware NL parsing
// ---------------------------------------------------------------------------
describe("parseNaturalLanguage — German locale keywords", () => {
  const localeKeywords = buildKeywordPatterns(germanMessages)!;

  it("parses 'teuer' as expensive", () => {
    const result = parseNaturalLanguage("teuer", { localeKeywords });
    expect(result.query.filters.amountMin).toBe(100);
  });

  it("parses 'günstig' as cheap", () => {
    const result = parseNaturalLanguage("günstig", { localeKeywords });
    expect(result.query.filters.amountMax).toBe(25);
  });

  it("parses 'heute' as today", () => {
    const result = parseNaturalLanguage("heute", { localeKeywords });
    expect(result.query.filters.dateStart).toBeInstanceOf(Date);
    const now = new Date();
    expect(result.query.filters.dateStart!.getDate()).toBe(now.getDate());
  });

  it("parses 'gestern' as yesterday", () => {
    const result = parseNaturalLanguage("gestern", { localeKeywords });
    expect(result.query.filters.dateStart).toBeInstanceOf(Date);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(result.query.filters.dateStart!.getDate()).toBe(yesterday.getDate());
  });

  it("parses 'Gehalt' as income type", () => {
    const result = parseNaturalLanguage("Gehalt", { localeKeywords });
    expect(result.query.filters.type).toBe("income");
  });

  it("parses 'Rechnung' as expense type", () => {
    const result = parseNaturalLanguage("Rechnung", { localeKeywords });
    expect(result.query.filters.type).toBe("expense");
  });

  it("English keywords still work with locale keywords", () => {
    const result = parseNaturalLanguage("expensive", { localeKeywords });
    expect(result.query.filters.amountMin).toBe(100);
  });
});

describe("parseNaturalLanguage — Japanese locale keywords", () => {
  const localeKeywords = buildKeywordPatterns(japaneseMessages)!;

  it("parses '高い' as expensive", () => {
    const result = parseNaturalLanguage("高い", { localeKeywords });
    expect(result.query.filters.amountMin).toBe(100);
  });

  it("parses '安い' as cheap", () => {
    const result = parseNaturalLanguage("安い", { localeKeywords });
    expect(result.query.filters.amountMax).toBe(25);
  });

  it("parses '今日' as today", () => {
    const result = parseNaturalLanguage("今日", { localeKeywords });
    expect(result.query.filters.dateStart).toBeInstanceOf(Date);
  });

  it("parses '収入' as income type", () => {
    const result = parseNaturalLanguage("収入", { localeKeywords });
    expect(result.query.filters.type).toBe("income");
  });

  it("parses '支出' as expense type", () => {
    const result = parseNaturalLanguage("支出", { localeKeywords });
    expect(result.query.filters.type).toBe("expense");
  });
});

// ---------------------------------------------------------------------------
// getSearchExamples
// ---------------------------------------------------------------------------
describe("getSearchExamples", () => {
  it("returns English examples by default", () => {
    const examples = getSearchExamples();
    expect(examples.length).toBeGreaterThan(0);
    expect(examples[0].query).toBeTruthy();
    expect(examples[0].description).toBeTruthy();
  });

  it("includes structured syntax example", () => {
    const examples = getSearchExamples();
    const structuredExample = examples.find((e) => e.query.includes("amount:"));
    expect(structuredExample).toBeDefined();
  });

  it("returns English examples when translation function fails", () => {
    const mockT = () => {
      throw new Error("translation not found");
    };
    const examples = getSearchExamples(mockT);
    expect(examples.length).toBeGreaterThan(0);
  });

  it("uses translation function when provided", () => {
    const mockT = (key: string): string => {
      const translations: Record<string, string> = {
        lastWeek: "letzte Woche",
        over: "über",
        expensive: "teuer",
        exampleCoffeeLastWeek: "Kaffee-Käufe letzte Woche",
        exampleAmazonOver50: "Amazon-Bestellungen über $50",
        exampleExpensive: "Teure Transaktionen",
        exampleStructured: "Shopping über $200 (strukturiert)",
      };
      return translations[key] || key;
    };

    const examples = getSearchExamples(mockT);
    expect(examples.length).toBeGreaterThan(0);
    // Should include localized examples
    expect(examples.some((e) => e.query.includes("letzte Woche"))).toBe(true);
  });
});
