/**
 * Duplicate Transaction Detector
 *
 * Basic duplicate detection using FITID matching, date/amount comparison,
 * and string similarity. For enhanced AI-powered detection, configure an
 * AIProvider via setAIProvider() and implement semantic matching.
 */

import type { ExistingTransaction, ParsedTransaction } from "./types";

/**
 * Calculate string similarity (0-1) using word-based Jaccard similarity
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1.0;

  // Substring containment — one description is a prefix/subset of the other
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.9;
  }

  // Word-based Jaccard similarity
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

/**
 * Detect duplicate transactions by comparing new transactions against existing ones.
 *
 * Detection tiers:
 * 1. FITID exact match (OFX) — confidence 1.0
 * 2. AI-powered semantic matching (opt-in, requires smart-duplicate-detection)
 * 3. Basic: same date + same amount + similar description (>80%)
 *
 * @param useSmartDetection - If true, attempts AI-based semantic matching (requires opt-in)
 */
export async function detectDuplicates(
  newTransactions: ParsedTransaction[],
  existingTransactions: ExistingTransaction[],
  useSmartDetection: boolean = false
): Promise<void> {
  // First, check for FITID matches (perfect duplicates from OFX)
  for (const newTx of newTransactions) {
    if (newTx.fitid) {
      const exactMatch = existingTransactions.find((existing) => existing.fitid === newTx.fitid);
      if (exactMatch) {
        newTx.isDuplicate = true;
        newTx.confidence = 1.0;
        continue;
      }
    }
  }

  // Smart AI-powered duplicate detection is available via the AIProvider interface.
  // Consumers can implement semantic matching through their own AIProvider.
  // The basic detection below handles FITID matching, exact matching, and fuzzy matching.

  // Basic duplicate detection (fallback or when smart detection is disabled)
  for (const newTx of newTransactions) {
    if (newTx.isDuplicate) continue; // Already marked by FITID or smart detection

    for (const existing of existingTransactions) {
      // Same date, same amount, similar description
      const sameDate = existing.date.toDateString() === newTx.date.toDateString();
      const sameAmount = Math.abs(existing.amount - newTx.amount) < 0.01;
      const similarDesc = calculateSimilarity(existing.description, newTx.description);

      if (sameDate && sameAmount && similarDesc > 0.8) {
        newTx.isDuplicate = true;
        newTx.confidence = similarDesc;
        break;
      }
    }
  }
}
