/**
 * StorageAdapter — Abstract persistence layer for StatementKit.
 *
 * The SDK ships with an InMemoryStorageAdapter (default).
 * Consumers can provide their own adapter (IndexedDB, SQLite, Redis, etc.)
 * by implementing this interface.
 */

// ---------------------------------------------------------------------------
// Storage Adapter Interface
// ---------------------------------------------------------------------------

/**
 * Generic key-value storage adapter.
 * All SDK persistence goes through this interface.
 */
export interface StorageAdapter<T = unknown> {
  get(key: string): Promise<T | null>;
  put(key: string, value: T): Promise<void>;
  delete(key: string): Promise<boolean>;
  bulkGet(keys: string[]): Promise<(T | null)[]>;
  bulkPut(entries: Array<{ key: string; value: T }>): Promise<void>;
  bulkDelete(keys: string[]): Promise<void>;
  getAll(): Promise<Array<{ key: string; value: T }>>;
  count(): Promise<number>;
  clear(): Promise<void>;
}

// ---------------------------------------------------------------------------
// FITID Store Types
// ---------------------------------------------------------------------------

export interface StoredFITID {
  fitid: string;
  accountId: string;
  importDate: string; // ISO string
  transactionDate: string; // ISO string
}

/**
 * FITID (Financial Institution Transaction ID) store interface.
 * Used for cross-session duplicate detection in OFX/QFX imports.
 */
export interface FITIDStore {
  has(accountId: string, fitid: string): Promise<boolean>;
  hasBulk(accountId: string, fitids: string[]): Promise<Set<string>>;
  store(accountId: string, fitids: StoredFITID[]): Promise<void>;
  cleanup(maxAgeDays?: number): Promise<number>;
}

// ---------------------------------------------------------------------------
// Merchant Correction Store Types
// ---------------------------------------------------------------------------

export interface StoredMerchantCorrection {
  rawDescription: string;
  normalizedMerchant: string;
  category?: string;
  subcategory?: string;
  correctionCount: number;
  lastUsed: string; // ISO string
  createdAt: string; // ISO string
}

/**
 * Merchant correction store interface.
 * Tracks user corrections to merchant names for auto-application.
 */
export interface MerchantCorrectionStore {
  lookup(rawDescription: string): Promise<StoredMerchantCorrection | null>;
  record(correction: StoredMerchantCorrection): Promise<void>;
  getFirmRules(minCount?: number): Promise<StoredMerchantCorrection[]>;
  getAll(): Promise<StoredMerchantCorrection[]>;
  remove(rawDescription: string): Promise<boolean>;
  count(): Promise<number>;
}

// ---------------------------------------------------------------------------
// In-Memory Storage Adapter (Default)
// ---------------------------------------------------------------------------

/**
 * Simple in-memory storage adapter.
 * Suitable for single-session use, testing, and CLI tool.
 * Data is lost when the process exits.
 */
export class InMemoryStorageAdapter<T = unknown> implements StorageAdapter<T> {
  private store = new Map<string, T>();

  async get(key: string): Promise<T | null> {
    return this.store.get(key) ?? null;
  }

  async put(key: string, value: T): Promise<void> {
    this.store.set(key, value);
  }

  async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  async bulkGet(keys: string[]): Promise<(T | null)[]> {
    return keys.map((k) => this.store.get(k) ?? null);
  }

  async bulkPut(entries: Array<{ key: string; value: T }>): Promise<void> {
    for (const { key, value } of entries) {
      this.store.set(key, value);
    }
  }

  async bulkDelete(keys: string[]): Promise<void> {
    for (const key of keys) {
      this.store.delete(key);
    }
  }

  async getAll(): Promise<Array<{ key: string; value: T }>> {
    return Array.from(this.store.entries()).map(([key, value]) => ({ key, value }));
  }

  async count(): Promise<number> {
    return this.store.size;
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

// ---------------------------------------------------------------------------
// In-Memory FITID Store
// ---------------------------------------------------------------------------

export class InMemoryFITIDStore implements FITIDStore {
  private storage = new InMemoryStorageAdapter<StoredFITID>();

  private makeKey(accountId: string, fitid: string): string {
    return `${accountId}_${fitid}`;
  }

  async has(accountId: string, fitid: string): Promise<boolean> {
    return (await this.storage.get(this.makeKey(accountId, fitid))) !== null;
  }

  async hasBulk(accountId: string, fitids: string[]): Promise<Set<string>> {
    const keys = fitids.map((f) => this.makeKey(accountId, f));
    const results = await this.storage.bulkGet(keys);
    const found = new Set<string>();
    for (let i = 0; i < fitids.length; i++) {
      if (results[i] !== null) found.add(fitids[i]);
    }
    return found;
  }

  async store(accountId: string, fitids: StoredFITID[]): Promise<void> {
    await this.storage.bulkPut(
      fitids.map((f) => ({
        key: this.makeKey(accountId, f.fitid),
        value: f,
      }))
    );
  }

  async cleanup(maxAgeDays: number = 365): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - maxAgeDays);
    const cutoffStr = cutoff.toISOString();

    const all = await this.storage.getAll();
    const expired = all.filter((e) => e.value.importDate < cutoffStr);
    await this.storage.bulkDelete(expired.map((e) => e.key));
    return expired.length;
  }
}

// ---------------------------------------------------------------------------
// In-Memory Merchant Correction Store
// ---------------------------------------------------------------------------

export class InMemoryMerchantCorrectionStore implements MerchantCorrectionStore {
  private storage = new InMemoryStorageAdapter<StoredMerchantCorrection>();
  private maxEntries = 5000;

  private normalizeKey(rawDescription: string): string {
    return rawDescription.toLowerCase().trim().slice(0, 100);
  }

  async lookup(rawDescription: string): Promise<StoredMerchantCorrection | null> {
    return this.storage.get(this.normalizeKey(rawDescription));
  }

  async record(correction: StoredMerchantCorrection): Promise<void> {
    const key = this.normalizeKey(correction.rawDescription);
    const existing = await this.storage.get(key);

    if (existing) {
      await this.storage.put(key, {
        ...existing,
        correctionCount: existing.correctionCount + 1,
        lastUsed: new Date().toISOString(),
      });
    } else {
      await this.storage.put(key, {
        ...correction,
        correctionCount: correction.correctionCount || 1,
        lastUsed: correction.lastUsed || new Date().toISOString(),
        createdAt: correction.createdAt || new Date().toISOString(),
      });
    }

    // LRU eviction
    const count = await this.storage.count();
    if (count > this.maxEntries) {
      const all = await this.storage.getAll();
      all.sort((a, b) => a.value.lastUsed.localeCompare(b.value.lastUsed));
      const removeCount = Math.ceil(count * 0.1);
      await this.storage.bulkDelete(all.slice(0, removeCount).map((e) => e.key));
    }
  }

  async getFirmRules(minCount: number = 2): Promise<StoredMerchantCorrection[]> {
    const all = await this.storage.getAll();
    return all.filter((e) => e.value.correctionCount >= minCount).map((e) => e.value);
  }

  async getAll(): Promise<StoredMerchantCorrection[]> {
    const all = await this.storage.getAll();
    return all.map((e) => e.value);
  }

  async remove(rawDescription: string): Promise<boolean> {
    return this.storage.delete(this.normalizeKey(rawDescription));
  }

  async count(): Promise<number> {
    return this.storage.count();
  }
}
