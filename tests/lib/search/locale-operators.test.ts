/**
 * Tests for locale-operators.ts
 * Covers: buildOperatorMap, canonicalizeQuery, getOperatorMap, cache clearing.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  buildOperatorMap,
  canonicalizeQuery,
  getOperatorMap,
  clearOperatorMapCache,
  type LocalizedOperators,
} from "@/lib/search/i18n/locale-operators";

// ---------------------------------------------------------------------------
// Fixtures: mock translation messages
// ---------------------------------------------------------------------------

const germanMessages = {
  searchOperators: {
    amount: "Betrag",
    category: "Kategorie",
    date: "Datum",
    account: "Konto",
    type: "Typ",
    tag: "Tag", // Same as English, should not be added
    merchant: "Händler",
    is: "ist",
    typeIncome: "Einnahmen",
    typeExpense: "Ausgaben",
    dateToday: "heute",
    dateYesterday: "gestern",
    dateLast7: "letzte7",
    dateLastWeek: "letzteWoche",
    dateLast30: "letzte30",
    dateLastMonth: "letzterMonat",
    dateThisMonth: "dieserMonat",
    dateThisYear: "diesesJahr",
    dateLastYear: "letztesJahr",
    isRecurring: "wiederkehrend",
    isSplit: "geteilt",
    isIncome: "Einnahmen",
    isExpense: "Ausgaben",
  },
};

const japaneseMessages = {
  searchOperators: {
    amount: "金額",
    category: "カテゴリー",
    date: "日付",
    account: "口座",
    type: "種類",
    tag: "タグ",
    merchant: "取引先",
    is: "状態",
    typeIncome: "収入",
    typeExpense: "支出",
    dateToday: "今日",
    dateYesterday: "昨日",
    dateLast7: "過去7日",
    dateLastWeek: "先週",
    dateLast30: "過去30日",
    dateLastMonth: "先月",
    dateThisMonth: "今月",
    dateThisYear: "今年",
    dateLastYear: "去年",
    isRecurring: "定期",
    isSplit: "分割",
    isIncome: "収入",
    isExpense: "支出",
  },
};

// English messages — should produce null (all operators match canonical)
const englishMessages = {
  searchOperators: {
    amount: "amount",
    category: "category",
    date: "date",
    account: "account",
    type: "type",
    tag: "tag",
    merchant: "merchant",
    is: "is",
    typeIncome: "income",
    typeExpense: "expense",
    dateToday: "today",
    dateYesterday: "yesterday",
    isRecurring: "recurring",
    isSplit: "split",
  },
};

// ---------------------------------------------------------------------------
// buildOperatorMap
// ---------------------------------------------------------------------------
describe("buildOperatorMap", () => {
  it("returns null for undefined messages", () => {
    expect(buildOperatorMap(undefined)).toBeNull();
  });

  it("returns null when searchOperators namespace is missing", () => {
    expect(buildOperatorMap({ other: "stuff" })).toBeNull();
  });

  it("returns null for English messages (all canonical)", () => {
    expect(buildOperatorMap(englishMessages)).toBeNull();
  });

  it("builds operator map for German", () => {
    const result = buildOperatorMap(germanMessages);
    expect(result).not.toBeNull();
    expect(result!.operators["betrag"]).toBe("amount");
    expect(result!.operators["kategorie"]).toBe("category");
    expect(result!.operators["datum"]).toBe("date");
    expect(result!.operators["konto"]).toBe("account");
    expect(result!.operators["händler"]).toBe("merchant");
    expect(result!.operators["ist"]).toBe("is");
  });

  it("does not include operators that match canonical (tag)", () => {
    const result = buildOperatorMap(germanMessages);
    expect(result).not.toBeNull();
    // "Tag" in German = "tag" in English (canonical), should NOT be in map
    expect(result!.operators["tag"]).toBeUndefined();
  });

  it("builds type value map for German", () => {
    const result = buildOperatorMap(germanMessages);
    expect(result).not.toBeNull();
    expect(result!.typeValues["einnahmen"]).toBe("income");
    expect(result!.typeValues["ausgaben"]).toBe("expense");
  });

  it("builds date value map for German", () => {
    const result = buildOperatorMap(germanMessages);
    expect(result).not.toBeNull();
    expect(result!.dateValues["heute"]).toBe("today");
    expect(result!.dateValues["gestern"]).toBe("yesterday");
    expect(result!.dateValues["letzte7"]).toBe("last7");
  });

  it("builds is: value map for German", () => {
    const result = buildOperatorMap(germanMessages);
    expect(result).not.toBeNull();
    expect(result!.isValues["wiederkehrend"]).toBe("recurring");
    expect(result!.isValues["geteilt"]).toBe("split");
  });

  it("builds operator map for Japanese", () => {
    const result = buildOperatorMap(japaneseMessages);
    expect(result).not.toBeNull();
    expect(result!.operators["金額"]).toBe("amount");
    expect(result!.operators["カテゴリー"]).toBe("category");
    expect(result!.operators["口座"]).toBe("account");
  });
});

// ---------------------------------------------------------------------------
// canonicalizeQuery
// ---------------------------------------------------------------------------
describe("canonicalizeQuery", () => {
  let germanOps: LocalizedOperators;

  beforeEach(() => {
    germanOps = buildOperatorMap(germanMessages)!;
  });

  it("returns query unchanged when localizedOps is null", () => {
    expect(canonicalizeQuery("betrag:>50", null)).toBe("betrag:>50");
  });

  it("returns empty string unchanged", () => {
    expect(canonicalizeQuery("", germanOps)).toBe("");
  });

  it("canonicalizes German operator prefixes", () => {
    expect(canonicalizeQuery("betrag:>50", germanOps)).toBe("amount:>50");
  });

  it("canonicalizes multiple operators in one query", () => {
    const result = canonicalizeQuery("betrag:>50 kategorie:Lebensmittel", germanOps);
    expect(result).toContain("amount:>50");
    expect(result).toContain("category:Lebensmittel");
  });

  it("canonicalizes type values", () => {
    // First canonicalize the operator prefix, then the value
    const result = canonicalizeQuery("typ:ausgaben", germanOps);
    expect(result).toContain("type:");
    expect(result).toContain("expense");
  });

  it("canonicalizes date values", () => {
    const result = canonicalizeQuery("datum:heute", germanOps);
    expect(result).toContain("date:");
    expect(result).toContain("today");
  });

  it("canonicalizes is: values", () => {
    const result = canonicalizeQuery("ist:wiederkehrend", germanOps);
    expect(result).toContain("is:");
    expect(result).toContain("recurring");
  });

  it("preserves English operators unchanged", () => {
    expect(canonicalizeQuery("amount:>50 category:food", germanOps)).toBe(
      "amount:>50 category:food"
    );
  });

  it("handles negated localized operators", () => {
    const result = canonicalizeQuery("-kategorie:food", germanOps);
    expect(result).toBe("-category:food");
  });

  it("is case-insensitive", () => {
    expect(canonicalizeQuery("Betrag:>50", germanOps)).toBe("amount:>50");
    expect(canonicalizeQuery("BETRAG:>50", germanOps)).toBe("amount:>50");
  });

  it("handles mixed localized and English operators", () => {
    const result = canonicalizeQuery("betrag:>50 type:income", germanOps);
    expect(result).toContain("amount:>50");
    expect(result).toContain("type:income");
  });

  it("canonicalizes Japanese operators", () => {
    const japaneseOps = buildOperatorMap(japaneseMessages)!;
    const result = canonicalizeQuery("金額:>5000", japaneseOps);
    expect(result).toContain("amount:>5000");
  });
});

// ---------------------------------------------------------------------------
// getOperatorMap + cache
// ---------------------------------------------------------------------------
describe("getOperatorMap", () => {
  beforeEach(() => {
    clearOperatorMapCache();
  });

  it("returns null for undefined messages", () => {
    expect(getOperatorMap("de-DE", undefined)).toBeNull();
  });

  it("builds and caches operator map", () => {
    const result1 = getOperatorMap("de-DE", germanMessages);
    expect(result1).not.toBeNull();

    // Second call with same locale should return cached
    const result2 = getOperatorMap("de-DE", germanMessages);
    expect(result2).toBe(result1); // Same reference
  });

  it("rebuilds map when locale changes", () => {
    const german = getOperatorMap("de-DE", germanMessages);
    const japanese = getOperatorMap("ja-JP", japaneseMessages);
    expect(german).not.toBe(japanese);
    expect(japanese!.operators["金額"]).toBe("amount");
  });

  it("clearOperatorMapCache forces rebuild", () => {
    const result1 = getOperatorMap("de-DE", germanMessages);
    clearOperatorMapCache();
    const result2 = getOperatorMap("de-DE", germanMessages);
    // Not the same reference after cache clear
    expect(result1).not.toBe(result2);
    // But same content
    expect(result2!.operators["betrag"]).toBe("amount");
  });
});
