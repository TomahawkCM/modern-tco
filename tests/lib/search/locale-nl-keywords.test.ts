/**
 * Tests for locale-nl-keywords.ts
 * Covers: buildKeywordPatterns, getKeywordPatterns, cache clearing.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  buildKeywordPatterns,
  getKeywordPatterns,
  clearKeywordPatternsCache,
} from "@/lib/search/i18n/locale-nl-keywords";

// ---------------------------------------------------------------------------
// Fixtures: mock translation messages
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
    lastYear: "去年",
    thisYear: "今年",
    recently: "最近",
    expensive: "高い",
    cheap: "安い",
    large: "大きい",
    small: "小さい",
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
// buildKeywordPatterns
// ---------------------------------------------------------------------------
describe("buildKeywordPatterns", () => {
  it("returns null for undefined messages", () => {
    expect(buildKeywordPatterns(undefined)).toBeNull();
  });

  it("returns null when namespace is missing", () => {
    expect(buildKeywordPatterns({ other: "stuff" })).toBeNull();
  });

  it("builds patterns for German", () => {
    const patterns = buildKeywordPatterns(germanMessages);
    expect(patterns).not.toBeNull();
    expect(patterns!.amountPatterns.length).toBeGreaterThan(0);
    expect(patterns!.datePatterns.length).toBeGreaterThan(0);
    expect(patterns!.typePatterns.length).toBeGreaterThan(0);
  });

  it("builds patterns for Japanese", () => {
    const patterns = buildKeywordPatterns(japaneseMessages);
    expect(patterns).not.toBeNull();
    expect(patterns!.amountPatterns.length).toBeGreaterThan(0);
    expect(patterns!.datePatterns.length).toBeGreaterThan(0);
    expect(patterns!.typePatterns.length).toBeGreaterThan(0);
  });

  describe("amount patterns", () => {
    it("German 'teuer' matches and returns amountMin", () => {
      const patterns = buildKeywordPatterns(germanMessages)!;
      const expensivePattern = patterns.amountPatterns.find(([p]) => p.test("teuer"));
      expect(expensivePattern).toBeDefined();
      const result = expensivePattern![1]();
      expect(result.amountMin).toBe(100);
    });

    it("German 'günstig' matches and returns amountMax", () => {
      const patterns = buildKeywordPatterns(germanMessages)!;
      const cheapPattern = patterns.amountPatterns.find(([p]) => p.test("günstig"));
      expect(cheapPattern).toBeDefined();
      const result = cheapPattern![1]();
      expect(result.amountMax).toBe(25);
    });

    it("Japanese '高い' matches expensive", () => {
      const patterns = buildKeywordPatterns(japaneseMessages)!;
      const expensivePattern = patterns.amountPatterns.find(([p]) => p.test("高い"));
      expect(expensivePattern).toBeDefined();
      const result = expensivePattern![1]();
      expect(result.amountMin).toBe(100);
    });

    it("Japanese '安い' matches cheap", () => {
      const patterns = buildKeywordPatterns(japaneseMessages)!;
      const cheapPattern = patterns.amountPatterns.find(([p]) => p.test("安い"));
      expect(cheapPattern).toBeDefined();
      const result = cheapPattern![1]();
      expect(result.amountMax).toBe(25);
    });
  });

  describe("date patterns", () => {
    it("German 'heute' matches today", () => {
      const patterns = buildKeywordPatterns(germanMessages)!;
      const todayPattern = patterns.datePatterns.find(([p]) => p.test("heute"));
      expect(todayPattern).toBeDefined();
      const result = todayPattern![1]();
      const now = new Date();
      expect(result.dateStart.getDate()).toBe(now.getDate());
      expect(result.dateStart.getHours()).toBe(0);
    });

    it("German 'gestern' matches yesterday", () => {
      const patterns = buildKeywordPatterns(germanMessages)!;
      const yesterdayPattern = patterns.datePatterns.find(([p]) => p.test("gestern"));
      expect(yesterdayPattern).toBeDefined();
      const result = yesterdayPattern![1]();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(result.dateStart.getDate()).toBe(yesterday.getDate());
    });

    it("Japanese '今日' matches today", () => {
      const patterns = buildKeywordPatterns(japaneseMessages)!;
      const todayPattern = patterns.datePatterns.find(([p]) => p.test("今日"));
      expect(todayPattern).toBeDefined();
      const result = todayPattern![1]();
      const now = new Date();
      expect(result.dateStart.getDate()).toBe(now.getDate());
    });

    it("Japanese '先月' matches last month", () => {
      const patterns = buildKeywordPatterns(japaneseMessages)!;
      const lastMonthPattern = patterns.datePatterns.find(([p]) => p.test("先月"));
      expect(lastMonthPattern).toBeDefined();
      const result = lastMonthPattern![1]();
      const now = new Date();
      expect(result.dateStart.getMonth()).toBe(now.getMonth() - 1 < 0 ? 11 : now.getMonth() - 1);
    });

    it("German 'letzte Woche' matches last week", () => {
      const patterns = buildKeywordPatterns(germanMessages)!;
      const lastWeekPattern = patterns.datePatterns.find(([p]) => p.test("letzte Woche"));
      expect(lastWeekPattern).toBeDefined();
      const result = lastWeekPattern![1]();
      const now = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      expect(result.dateStart.getDate()).toBe(weekAgo.getDate());
    });
  });

  describe("type patterns", () => {
    it("German 'Einkommen' matches income", () => {
      const patterns = buildKeywordPatterns(germanMessages)!;
      const incomePattern = patterns.typePatterns.find(([p]) => p.test("Einkommen"));
      expect(incomePattern).toBeDefined();
      expect(incomePattern![1]).toBe("income");
    });

    it("German 'Gehalt' matches income", () => {
      const patterns = buildKeywordPatterns(germanMessages)!;
      const salaryPattern = patterns.typePatterns.find(([p]) => p.test("Gehalt"));
      expect(salaryPattern).toBeDefined();
      expect(salaryPattern![1]).toBe("income");
    });

    it("German 'Ausgabe' matches expense", () => {
      const patterns = buildKeywordPatterns(germanMessages)!;
      const expensePattern = patterns.typePatterns.find(([p]) => p.test("Ausgabe"));
      expect(expensePattern).toBeDefined();
      expect(expensePattern![1]).toBe("expense");
    });

    it("German 'Rechnung' matches expense", () => {
      const patterns = buildKeywordPatterns(germanMessages)!;
      const billPattern = patterns.typePatterns.find(([p]) => p.test("Rechnung"));
      expect(billPattern).toBeDefined();
      expect(billPattern![1]).toBe("expense");
    });

    it("Japanese '収入' matches income", () => {
      const patterns = buildKeywordPatterns(japaneseMessages)!;
      const incomePattern = patterns.typePatterns.find(([p]) => p.test("収入"));
      expect(incomePattern).toBeDefined();
      expect(incomePattern![1]).toBe("income");
    });

    it("Japanese '支出' matches expense", () => {
      const patterns = buildKeywordPatterns(japaneseMessages)!;
      const expensePattern = patterns.typePatterns.find(([p]) => p.test("支出"));
      expect(expensePattern).toBeDefined();
      expect(expensePattern![1]).toBe("expense");
    });
  });
});

// ---------------------------------------------------------------------------
// getKeywordPatterns + cache
// ---------------------------------------------------------------------------
describe("getKeywordPatterns", () => {
  beforeEach(() => {
    clearKeywordPatternsCache();
  });

  it("returns null for undefined messages", () => {
    expect(getKeywordPatterns("de-DE", undefined)).toBeNull();
  });

  it("builds and caches patterns", () => {
    const result1 = getKeywordPatterns("de-DE", germanMessages);
    expect(result1).not.toBeNull();

    // Second call should return cached
    const result2 = getKeywordPatterns("de-DE", germanMessages);
    expect(result2).toBe(result1);
  });

  it("rebuilds patterns when locale changes", () => {
    const german = getKeywordPatterns("de-DE", germanMessages);
    const japanese = getKeywordPatterns("ja-JP", japaneseMessages);
    expect(german).not.toBe(japanese);
  });

  it("clearKeywordPatternsCache forces rebuild", () => {
    const result1 = getKeywordPatterns("de-DE", germanMessages);
    clearKeywordPatternsCache();
    const result2 = getKeywordPatterns("de-DE", germanMessages);
    expect(result1).not.toBe(result2);
  });
});
