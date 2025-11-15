/**
 * Vendor Matching Utility
 * Intelligently extracts vendor names from transaction descriptions
 * and finds matching transactions for bulk categorization
 */

import type { Transaction } from '@/types/budget';

/**
 * Extract normalized vendor name from transaction description
 * Removes common noise: transaction IDs, dates, locations, prefixes
 */
export function extractVendorName(description: string): string {
  if (!description) return '';

  let vendor = description.toUpperCase().trim();

  // Remove bank statement prefixes / bracketed tags
  vendor = vendor.replace(/^\[[A-Z]+\]\s*/i, ''); // e.g. [PR], [DS]
  vendor = vendor.replace(/^\[ONLINE PURCHASE\]\s*/i, '');
  // Legacy specific prefixes (kept for backward compatibility)
  vendor = vendor.replace(/^\[PR\]/i, '');
  vendor = vendor.replace(/^PURCHASE\s+/i, '');
  vendor = vendor.replace(/^PAYMENT\s+/i, '');
  vendor = vendor.replace(/^DEBIT\s+/i, '');
  vendor = vendor.replace(/^POS\s+/i, '');

  // Remove transaction IDs (e.g., #260, #123)
  vendor = vendor.replace(/#\d+/g, '');

  // Remove dates in various formats
  vendor = vendor.replace(/\d{1,2}[A-Z]{3}\d{2,4}/gi, ''); // 4NOV20, 11NOV2025
  vendor = vendor.replace(/\d{1,2}\/\d{1,2}\/\d{2,4}/g, ''); // 11/7/2025
  vendor = vendor.replace(/\d{4}-\d{2}-\d{2}/g, ''); // 2025-11-07

  // Remove common location indicators
  vendor = vendor.replace(/\s+(AB|BC|ON|QC|SK|MB|NB|NS|PE|NL|YT|NT|NU)\s*$/i, ''); // Canadian provinces
  vendor = vendor.replace(/\s+CANADA\s*$/i, '');
  vendor = vendor.replace(/\s+CA\s*$/i, '');
  vendor = vendor.replace(/\s+(EDMONTON|CALGARY|TORONTO|VANCOUVER|MONTREAL|OTTAWA)\s*$/i, ''); // Cities

  // Remove trailing reference numbers/codes
  vendor = vendor.replace(/\s+[A-Z0-9]{6,}\s*$/, ''); // Long alphanumeric codes

  // Clean up extra whitespace
  vendor = vendor.replace(/\s+/g, ' ').trim();

  return vendor;
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 * Returns a percentage (0-100)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 100;

  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 100;

  // Levenshtein distance
  const costs: number[] = [];
  for (let i = 0; i <= longer.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= shorter.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[shorter.length] = lastValue;
  }

  const distance = costs[shorter.length];
  return ((longer.length - distance) / longer.length) * 100;
}

/**
 * Check if two vendor names match (fuzzy matching)
 * Returns true if similarity >= 85%
 * Optimized with word-based matching to avoid expensive Levenshtein calculations (10-50x faster)
 */
export function vendorsMatch(vendor1: string, vendor2: string, threshold = 85): boolean {
  if (!vendor1 || !vendor2) return false;

  const v1 = vendor1.toUpperCase();
  const v2 = vendor2.toUpperCase();

  // Fast path 1: Exact match
  if (v1 === v2) return true;

  // Fast path 2: Substring check (one contains the other)
  if (v1.includes(v2) || v2.includes(v1)) return true;

  // Fast path 3: Word-based matching (MUCH faster than Levenshtein)
  // Split into words and check for common words
  const words1 = v1.split(/\s+/).filter(w => w.length > 0);
  const words2 = v2.split(/\s+/).filter(w => w.length > 0);

  if (words1.length > 0 && words2.length > 0) {
    // Count how many words match (even partially)
    const commonWords = words1.filter(w1 =>
      words2.some(w2 => w2.includes(w1) || w1.includes(w2) || w2 === w1)
    );

    // If 75%+ words match, it's the same vendor
    const matchRatio = commonWords.length / Math.max(words1.length, words2.length);
    if (matchRatio >= 0.75) return true;
  }

  // Early termination: Length difference check (before expensive Levenshtein)
  const lengthDiff = Math.abs(v1.length - v2.length);
  const maxLength = Math.max(v1.length, v2.length);
  if (maxLength > 0 && lengthDiff / maxLength > 0.3) {
    return false;
  }

  // Expensive path: Fuzzy match with Levenshtein distance (fallback for edge cases)
  // Most matches are caught by word-based matching above, so this rarely executes
  const similarity = calculateSimilarity(vendor1, vendor2);
  return similarity >= threshold;
}

/**
 * Find all transactions that match the same vendor
 * Excludes the current transaction
 * Accepts optional vendorCache to avoid repeated extractVendorName() calls
 * Performance: Only searches recent transactions for speed (configurable with maxTransactions)
 */
export function findMatchingVendorTransactions(
  currentTransaction: Transaction,
  allTransactions: Transaction[],
  threshold = 85,
  vendorCache?: Map<string, string>,
  maxTransactions = 500  // Limit search to recent 500 transactions for performance
): Transaction[] {
  // Use cache if provided, otherwise extract on-demand
  const currentVendor = vendorCache
    ? vendorCache.get(currentTransaction.id) || extractVendorName(currentTransaction.description)
    : extractVendorName(currentTransaction.description);

  if (!currentVendor) return [];

  // PERFORMANCE OPTIMIZATION: Sort by date descending and limit to most recent transactions
  // Most users care about recent transactions (last 6-12 months)
  // Searching 500 recent instead of 5000 total = 10x faster
  const transactionsToSearch = allTransactions
    .filter(tx => tx.id !== currentTransaction.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, maxTransactions);

  return transactionsToSearch.filter((tx) => {
    // Skip already categorized transactions (optional - user might want to recategorize)
    // if (tx.category && tx.category !== 'Uncategorized') return false;

    // Use cache if provided, otherwise extract on-demand
    const txVendor = vendorCache
      ? vendorCache.get(tx.id) || extractVendorName(tx.description)
      : extractVendorName(tx.description);

    return vendorsMatch(currentVendor, txVendor, threshold);
  });
}

/**
 * Get vendor statistics for display
 */
export function getVendorStats(
  vendorName: string,
  transactions: Transaction[]
): {
  totalTransactions: number;
  totalAmount: number;
  uncategorizedCount: number;
  categorizedCount: number;
} {
  const vendorTransactions = transactions.filter((tx) => {
    const txVendor = extractVendorName(tx.description);
    return vendorsMatch(vendorName, txVendor);
  });

  const uncategorized = vendorTransactions.filter(
    (tx) => !tx.category || tx.category === 'Uncategorized'
  );
  const categorized = vendorTransactions.filter(
    (tx) => tx.category && tx.category !== 'Uncategorized'
  );

  const totalAmount = vendorTransactions.reduce(
    (sum, tx) => sum + Math.abs(tx.amount),
    0
  );

  return {
    totalTransactions: vendorTransactions.length,
    totalAmount,
    uncategorizedCount: uncategorized.length,
    categorizedCount: categorized.length,
  };
}
