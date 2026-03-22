import { describe, it, expect, beforeEach } from "vitest";
import {
  InMemoryStorageAdapter,
  InMemoryFITIDStore,
  InMemoryMerchantCorrectionStore,
  type StoredFITID,
  type StoredMerchantCorrection,
} from "../storage";

// ===========================================================================
// InMemoryStorageAdapter
// ===========================================================================

describe("InMemoryStorageAdapter", () => {
  let store: InMemoryStorageAdapter<string>;

  beforeEach(() => {
    store = new InMemoryStorageAdapter<string>();
  });

  // --- get / put -----------------------------------------------------------

  it("returns null for a missing key", async () => {
    expect(await store.get("missing")).toBeNull();
  });

  it("stores and retrieves a value", async () => {
    await store.put("a", "alpha");
    expect(await store.get("a")).toBe("alpha");
  });

  it("overwrites an existing value", async () => {
    await store.put("a", "alpha");
    await store.put("a", "updated");
    expect(await store.get("a")).toBe("updated");
  });

  // --- delete --------------------------------------------------------------

  it("deletes an existing key and returns true", async () => {
    await store.put("a", "alpha");
    expect(await store.delete("a")).toBe(true);
    expect(await store.get("a")).toBeNull();
  });

  it("returns false when deleting a non-existent key", async () => {
    expect(await store.delete("nope")).toBe(false);
  });

  // --- bulkGet -------------------------------------------------------------

  it("bulk-gets multiple keys (including missing ones)", async () => {
    await store.put("a", "alpha");
    await store.put("c", "charlie");
    const results = await store.bulkGet(["a", "b", "c"]);
    expect(results).toEqual(["alpha", null, "charlie"]);
  });

  it("returns all nulls for an empty store", async () => {
    const results = await store.bulkGet(["x", "y"]);
    expect(results).toEqual([null, null]);
  });

  // --- bulkPut -------------------------------------------------------------

  it("bulk-puts multiple entries", async () => {
    await store.bulkPut([
      { key: "a", value: "alpha" },
      { key: "b", value: "bravo" },
    ]);
    expect(await store.get("a")).toBe("alpha");
    expect(await store.get("b")).toBe("bravo");
  });

  // --- bulkDelete ----------------------------------------------------------

  it("bulk-deletes multiple keys", async () => {
    await store.bulkPut([
      { key: "a", value: "alpha" },
      { key: "b", value: "bravo" },
      { key: "c", value: "charlie" },
    ]);
    await store.bulkDelete(["a", "c"]);
    expect(await store.get("a")).toBeNull();
    expect(await store.get("b")).toBe("bravo");
    expect(await store.get("c")).toBeNull();
  });

  it("silently ignores non-existent keys in bulkDelete", async () => {
    await store.put("a", "alpha");
    await store.bulkDelete(["a", "nonexistent"]);
    expect(await store.get("a")).toBeNull();
    expect(await store.count()).toBe(0);
  });

  // --- getAll --------------------------------------------------------------

  it("returns all entries", async () => {
    await store.bulkPut([
      { key: "a", value: "alpha" },
      { key: "b", value: "bravo" },
    ]);
    const all = await store.getAll();
    expect(all).toHaveLength(2);
    expect(all).toEqual(
      expect.arrayContaining([
        { key: "a", value: "alpha" },
        { key: "b", value: "bravo" },
      ])
    );
  });

  it("returns empty array for empty store", async () => {
    expect(await store.getAll()).toEqual([]);
  });

  // --- count ---------------------------------------------------------------

  it("returns 0 for empty store", async () => {
    expect(await store.count()).toBe(0);
  });

  it("returns correct count after puts and deletes", async () => {
    await store.bulkPut([
      { key: "a", value: "alpha" },
      { key: "b", value: "bravo" },
      { key: "c", value: "charlie" },
    ]);
    expect(await store.count()).toBe(3);
    await store.delete("b");
    expect(await store.count()).toBe(2);
  });

  // --- clear ---------------------------------------------------------------

  it("clears all entries", async () => {
    await store.bulkPut([
      { key: "a", value: "alpha" },
      { key: "b", value: "bravo" },
    ]);
    await store.clear();
    expect(await store.count()).toBe(0);
    expect(await store.get("a")).toBeNull();
  });

  // --- works with complex objects ------------------------------------------

  it("stores and retrieves complex objects", async () => {
    const objStore = new InMemoryStorageAdapter<{ n: number; tags: string[] }>();
    const val = { n: 42, tags: ["foo", "bar"] };
    await objStore.put("obj", val);
    expect(await objStore.get("obj")).toEqual(val);
  });
});

// ===========================================================================
// InMemoryFITIDStore
// ===========================================================================

describe("InMemoryFITIDStore", () => {
  let fitidStore: InMemoryFITIDStore;

  const makeFITID = (
    fitid: string,
    accountId: string = "acct1",
    importDate?: string,
    transactionDate?: string
  ): StoredFITID => ({
    fitid,
    accountId,
    importDate: importDate ?? new Date().toISOString(),
    transactionDate: transactionDate ?? new Date().toISOString(),
  });

  beforeEach(() => {
    fitidStore = new InMemoryFITIDStore();
  });

  // --- has -----------------------------------------------------------------

  it("returns false for a FITID not yet stored", async () => {
    expect(await fitidStore.has("acct1", "TXN001")).toBe(false);
  });

  it("returns true after storing a FITID", async () => {
    await fitidStore.store("acct1", [makeFITID("TXN001")]);
    expect(await fitidStore.has("acct1", "TXN001")).toBe(true);
  });

  it("isolates FITIDs across different accounts", async () => {
    await fitidStore.store("acct1", [makeFITID("TXN001", "acct1")]);
    expect(await fitidStore.has("acct1", "TXN001")).toBe(true);
    expect(await fitidStore.has("acct2", "TXN001")).toBe(false);
  });

  // --- hasBulk -------------------------------------------------------------

  it("returns the subset of FITIDs that exist", async () => {
    await fitidStore.store("acct1", [makeFITID("TXN001"), makeFITID("TXN003")]);
    const found = await fitidStore.hasBulk("acct1", ["TXN001", "TXN002", "TXN003"]);
    expect(found).toEqual(new Set(["TXN001", "TXN003"]));
  });

  it("returns empty set when none exist", async () => {
    const found = await fitidStore.hasBulk("acct1", ["TXN001", "TXN002"]);
    expect(found.size).toBe(0);
  });

  // --- store ---------------------------------------------------------------

  it("stores multiple FITIDs in a single call", async () => {
    await fitidStore.store("acct1", [makeFITID("A"), makeFITID("B"), makeFITID("C")]);
    expect(await fitidStore.has("acct1", "A")).toBe(true);
    expect(await fitidStore.has("acct1", "B")).toBe(true);
    expect(await fitidStore.has("acct1", "C")).toBe(true);
  });

  // --- cleanup -------------------------------------------------------------

  it("removes entries older than maxAgeDays", async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 400); // 400 days ago

    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 10); // 10 days ago

    await fitidStore.store("acct1", [
      makeFITID("OLD1", "acct1", oldDate.toISOString(), oldDate.toISOString()),
      makeFITID("OLD2", "acct1", oldDate.toISOString(), oldDate.toISOString()),
      makeFITID("RECENT", "acct1", recentDate.toISOString(), recentDate.toISOString()),
    ]);

    const removed = await fitidStore.cleanup(365);
    expect(removed).toBe(2);
    expect(await fitidStore.has("acct1", "OLD1")).toBe(false);
    expect(await fitidStore.has("acct1", "OLD2")).toBe(false);
    expect(await fitidStore.has("acct1", "RECENT")).toBe(true);
  });

  it("removes nothing when all entries are recent", async () => {
    await fitidStore.store("acct1", [makeFITID("NEW1"), makeFITID("NEW2")]);
    const removed = await fitidStore.cleanup(365);
    expect(removed).toBe(0);
  });

  it("uses default maxAgeDays of 365", async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 366);

    await fitidStore.store("acct1", [
      makeFITID("OLD", "acct1", oldDate.toISOString(), oldDate.toISOString()),
    ]);

    const removed = await fitidStore.cleanup();
    expect(removed).toBe(1);
  });

  it("supports custom maxAgeDays", async () => {
    const date30DaysAgo = new Date();
    date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);

    await fitidStore.store("acct1", [
      makeFITID("X", "acct1", date30DaysAgo.toISOString(), date30DaysAgo.toISOString()),
    ]);

    // 60-day window: should keep it
    expect(await fitidStore.cleanup(60)).toBe(0);
    // 7-day window: should remove it
    expect(await fitidStore.cleanup(7)).toBe(1);
  });
});

// ===========================================================================
// InMemoryMerchantCorrectionStore
// ===========================================================================

describe("InMemoryMerchantCorrectionStore", () => {
  let corrStore: InMemoryMerchantCorrectionStore;

  const makeCorrection = (
    raw: string,
    merchant: string,
    opts: Partial<StoredMerchantCorrection> = {}
  ): StoredMerchantCorrection => ({
    rawDescription: raw,
    normalizedMerchant: merchant,
    correctionCount: opts.correctionCount ?? 1,
    lastUsed: opts.lastUsed ?? new Date().toISOString(),
    createdAt: opts.createdAt ?? new Date().toISOString(),
    ...(opts.category && { category: opts.category }),
    ...(opts.subcategory && { subcategory: opts.subcategory }),
  });

  beforeEach(() => {
    corrStore = new InMemoryMerchantCorrectionStore();
  });

  // --- lookup / record (new entry) -----------------------------------------

  it("returns null for unknown description", async () => {
    expect(await corrStore.lookup("UNKNOWN MERCHANT")).toBeNull();
  });

  it("records and looks up a correction", async () => {
    const corr = makeCorrection("AMZN MKTP US*1234", "Amazon");
    await corrStore.record(corr);
    const result = await corrStore.lookup("AMZN MKTP US*1234");
    expect(result).not.toBeNull();
    expect(result!.normalizedMerchant).toBe("Amazon");
  });

  it("normalizes key case-insensitively", async () => {
    await corrStore.record(makeCorrection("STARBUCKS #1234", "Starbucks"));
    expect(await corrStore.lookup("starbucks #1234")).not.toBeNull();
    expect(await corrStore.lookup("STARBUCKS #1234")).not.toBeNull();
    expect(await corrStore.lookup("  Starbucks #1234  ")).not.toBeNull();
  });

  // --- record (increment existing) -----------------------------------------

  it("increments correctionCount on re-record", async () => {
    await corrStore.record(makeCorrection("SQ *COFFEE SHOP", "Coffee Shop"));
    await corrStore.record(makeCorrection("SQ *COFFEE SHOP", "Coffee Shop"));
    await corrStore.record(makeCorrection("SQ *COFFEE SHOP", "Coffee Shop"));

    const result = await corrStore.lookup("SQ *COFFEE SHOP");
    expect(result!.correctionCount).toBe(3);
  });

  it("updates lastUsed on re-record", async () => {
    const earlyDate = "2025-01-01T00:00:00.000Z";
    await corrStore.record(makeCorrection("SQ *SHOP", "Shop", { lastUsed: earlyDate }));

    const before = await corrStore.lookup("SQ *SHOP");
    expect(before!.lastUsed).toBe(earlyDate);

    await corrStore.record(makeCorrection("SQ *SHOP", "Shop"));
    const after = await corrStore.lookup("SQ *SHOP");
    // lastUsed should be newer than the original early date
    expect(after!.lastUsed > earlyDate).toBe(true);
  });

  // --- getFirmRules --------------------------------------------------------

  it("returns only corrections meeting minCount threshold", async () => {
    await corrStore.record(makeCorrection("A", "MerchA"));
    // Record B three times to get correctionCount = 3
    await corrStore.record(makeCorrection("B", "MerchB"));
    await corrStore.record(makeCorrection("B", "MerchB"));
    await corrStore.record(makeCorrection("B", "MerchB"));

    const firmRules = await corrStore.getFirmRules(2);
    expect(firmRules).toHaveLength(1);
    expect(firmRules[0].normalizedMerchant).toBe("MerchB");
  });

  it("uses default minCount of 2", async () => {
    await corrStore.record(makeCorrection("X", "MerchX"));
    await corrStore.record(makeCorrection("X", "MerchX"));

    const firmRules = await corrStore.getFirmRules();
    expect(firmRules).toHaveLength(1);
  });

  it("returns empty array when no corrections meet threshold", async () => {
    await corrStore.record(makeCorrection("A", "MerchA"));
    expect(await corrStore.getFirmRules(5)).toEqual([]);
  });

  // --- getAll --------------------------------------------------------------

  it("returns all stored corrections", async () => {
    await corrStore.record(makeCorrection("A", "MerchA"));
    await corrStore.record(makeCorrection("B", "MerchB"));
    await corrStore.record(makeCorrection("C", "MerchC"));

    const all = await corrStore.getAll();
    expect(all).toHaveLength(3);
    const merchants = all.map((c) => c.normalizedMerchant).sort();
    expect(merchants).toEqual(["MerchA", "MerchB", "MerchC"]);
  });

  // --- remove --------------------------------------------------------------

  it("removes a correction and returns true", async () => {
    await corrStore.record(makeCorrection("X", "MerchX"));
    expect(await corrStore.remove("X")).toBe(true);
    expect(await corrStore.lookup("X")).toBeNull();
  });

  it("returns false when removing non-existent correction", async () => {
    expect(await corrStore.remove("NOPE")).toBe(false);
  });

  // --- count ---------------------------------------------------------------

  it("returns 0 for empty store", async () => {
    expect(await corrStore.count()).toBe(0);
  });

  it("tracks count correctly", async () => {
    await corrStore.record(makeCorrection("A", "MA"));
    await corrStore.record(makeCorrection("B", "MB"));
    expect(await corrStore.count()).toBe(2);

    // Re-recording same key should not increase count
    await corrStore.record(makeCorrection("A", "MA"));
    expect(await corrStore.count()).toBe(2);

    await corrStore.remove("A");
    expect(await corrStore.count()).toBe(1);
  });

  // --- LRU eviction --------------------------------------------------------

  it("evicts oldest entries when exceeding maxEntries", async () => {
    // The store has maxEntries = 5000. We need to exceed that.
    // We'll use a subclass approach to test with a smaller limit.
    // Instead, we access the private field via casting for test purposes.
    const smallStore = new InMemoryMerchantCorrectionStore();
    // Override maxEntries for testing via Object property assignment

    (smallStore as any).maxEntries = 10;

    // Insert 11 entries with staggered lastUsed dates
    for (let i = 0; i < 11; i++) {
      const date = new Date(2025, 0, 1 + i).toISOString();
      await smallStore.record(
        makeCorrection(`MERCHANT_${i}`, `Merchant ${i}`, {
          lastUsed: date,
          createdAt: date,
        })
      );
    }

    // After the 11th insert, LRU eviction should have removed ~10% = 2 oldest
    // (ceil(11 * 0.1) = 2)
    const count = await smallStore.count();
    expect(count).toBe(9);

    // The two oldest (MERCHANT_0, MERCHANT_1) should be gone
    expect(await smallStore.lookup("MERCHANT_0")).toBeNull();
    expect(await smallStore.lookup("MERCHANT_1")).toBeNull();

    // A newer one should still exist
    expect(await smallStore.lookup("MERCHANT_10")).not.toBeNull();
  });

  // --- category/subcategory ------------------------------------------------

  it("stores and retrieves category and subcategory", async () => {
    await corrStore.record(
      makeCorrection("UBER EATS", "Uber Eats", {
        category: "Food & Dining",
        subcategory: "Delivery",
      })
    );

    const result = await corrStore.lookup("UBER EATS");
    expect(result!.category).toBe("Food & Dining");
    expect(result!.subcategory).toBe("Delivery");
  });
});
