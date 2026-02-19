/**
 * Persistent FITID Store
 * Stores imported OFX FITIDs in IndexedDB for cross-session duplicate detection.
 * Automatically cleans entries older than 1 year.
 */

import type { ImportedFITID } from "@/types/budget";

let dbPromise: Promise<typeof import("@/lib/budget-db")> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = import("@/lib/budget-db");
  }
  return dbPromise;
}

/**
 * Check if a FITID has been previously imported for a given account
 */
export async function isFITIDImported(
  fitid: string,
  accountId: string
): Promise<boolean> {
  try {
    const { db } = await getDb();
    const id = `${accountId}_${fitid}`;
    const existing = await db.importedFITIDs.get(id);
    return !!existing;
  } catch {
    return false;
  }
}

/**
 * Check multiple FITIDs at once for efficiency
 * Returns set of FITIDs that have already been imported
 */
export async function getImportedFITIDs(
  fitids: string[],
  accountId: string
): Promise<Set<string>> {
  const imported = new Set<string>();
  try {
    const { db } = await getDb();
    const ids = fitids.map((f) => `${accountId}_${f}`);
    const results = await db.importedFITIDs.bulkGet(ids);
    results.forEach((result) => {
      if (result) {
        imported.add(result.fitid);
      }
    });
  } catch {
    // Silently fail — duplicate detection still works via in-memory check
  }
  return imported;
}

/**
 * Store FITIDs after successful import
 */
export async function storeFITIDs(
  entries: Array<{ fitid: string; accountId: string; transactionDate: Date }>
): Promise<void> {
  try {
    const { db } = await getDb();
    const now = new Date().toISOString();

    const records: ImportedFITID[] = entries.map((entry) => ({
      id: `${entry.accountId}_${entry.fitid}`,
      fitid: entry.fitid,
      accountId: entry.accountId,
      importDate: now,
      transactionDate: entry.transactionDate.toISOString(),
    }));

    await db.importedFITIDs.bulkPut(records);
  } catch (error) {
    console.warn("[FITIDStore] Failed to persist FITIDs:", error);
  }
}

/**
 * Clean FITID entries older than maxAge (default: 1 year)
 */
export async function cleanExpiredFITIDs(
  maxAgeDays: number = 365
): Promise<number> {
  try {
    const { db } = await getDb();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - maxAgeDays);
    const cutoffStr = cutoff.toISOString();

    const expired = await db.importedFITIDs
      .where("importDate")
      .below(cutoffStr)
      .toArray();

    if (expired.length > 0) {
      await db.importedFITIDs.bulkDelete(expired.map((e) => e.id));
    }

    return expired.length;
  } catch {
    return 0;
  }
}
