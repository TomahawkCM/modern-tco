/**
 * Persistent Merchant Correction Store
 * Remembers user corrections to merchant names across sessions.
 * After 2+ corrections of the same mapping, creates a "firm rule"
 * that bypasses AI enrichment entirely.
 *
 * Stored in IndexedDB via budget-db.
 * Max 5,000 entries with LRU eviction.
 */

import type { MerchantCorrection } from "@/types/budget";

const MAX_CORRECTIONS = 5000;
const FIRM_RULE_THRESHOLD = 2; // After this many corrections, rule is "firm"

let dbPromise: Promise<typeof import("@/lib/budget-db")> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = import("@/lib/budget-db");
  }
  return dbPromise;
}

/**
 * Generate a stable ID from a raw description
 */
function correctionId(rawDescription: string): string {
  return `mc_${rawDescription.trim().toLowerCase().replace(/\s+/g, "_").slice(0, 100)}`;
}

/**
 * Look up a correction for a raw bank description.
 * Returns the user's preferred merchant name and category if found.
 */
export async function lookupCorrection(
  rawDescription: string
): Promise<MerchantCorrection | null> {
  try {
    const { db } = await getDb();
    const id = correctionId(rawDescription);
    const correction = await db.merchantCorrections.get(id);
    return correction ?? null;
  } catch {
    return null;
  }
}

/**
 * Check if a correction is a "firm rule" (2+ corrections).
 * Firm rules bypass AI enrichment and are applied deterministically.
 */
export async function isFirmRule(rawDescription: string): Promise<boolean> {
  const correction = await lookupCorrection(rawDescription);
  return correction !== null && correction.correctionCount >= FIRM_RULE_THRESHOLD;
}

/**
 * Record a user correction (create or update).
 * Increments correctionCount if the same mapping already exists.
 */
export async function recordCorrection(
  rawDescription: string,
  normalizedMerchant: string,
  category?: string,
  subcategory?: string
): Promise<void> {
  try {
    const { db } = await getDb();
    const id = correctionId(rawDescription);
    const now = new Date().toISOString();

    const existing = await db.merchantCorrections.get(id);

    if (existing) {
      // Update existing correction
      await db.merchantCorrections.update(id, {
        normalizedMerchant,
        category: category ?? existing.category,
        subcategory: subcategory ?? existing.subcategory,
        correctionCount: existing.correctionCount + 1,
        lastUsed: now,
      });
    } else {
      // Create new correction
      await evictIfNeeded();
      await db.merchantCorrections.put({
        id,
        rawDescription: rawDescription.trim(),
        normalizedMerchant,
        category,
        subcategory,
        correctionCount: 1,
        lastUsed: now,
        createdAt: now,
      });
    }
  } catch (error) {
    console.warn("[MerchantCorrections] Failed to record correction:", error);
  }
}

/**
 * Get all firm rules (corrections with count >= threshold).
 */
export async function getFirmRules(): Promise<MerchantCorrection[]> {
  try {
    const { db } = await getDb();
    const all = await db.merchantCorrections.toArray();
    return all.filter((c) => c.correctionCount >= FIRM_RULE_THRESHOLD);
  } catch {
    return [];
  }
}

/**
 * Get all corrections (for settings UI).
 */
export async function getAllCorrections(): Promise<MerchantCorrection[]> {
  try {
    const { db } = await getDb();
    return await db.merchantCorrections.orderBy("lastUsed").reverse().toArray();
  } catch {
    return [];
  }
}

/**
 * Delete a specific correction.
 */
export async function deleteCorrection(rawDescription: string): Promise<void> {
  try {
    const { db } = await getDb();
    const id = correctionId(rawDescription);
    await db.merchantCorrections.delete(id);
  } catch {
    // Silently fail
  }
}

/**
 * Evict oldest corrections if we're over the max.
 * Removes 10% of oldest entries.
 */
async function evictIfNeeded(): Promise<void> {
  try {
    const { db } = await getDb();
    const count = await db.merchantCorrections.count();
    if (count < MAX_CORRECTIONS) return;

    const removeCount = Math.floor(MAX_CORRECTIONS * 0.1);
    const oldest = await db.merchantCorrections
      .orderBy("lastUsed")
      .limit(removeCount)
      .toArray();

    await db.merchantCorrections.bulkDelete(oldest.map((c) => c.id));
  } catch {
    // Silently fail
  }
}
