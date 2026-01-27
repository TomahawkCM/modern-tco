/**
 * Offline Search Indexing
 * Maintains a persistent search index in IndexedDB for instant offline search
 *
 * Features:
 * - Full-text indexing with Dexie
 * - Automatic index updates on data changes
 * - Index persistence across sessions
 * - Background index rebuilding
 */

import Dexie, { type Table } from 'dexie';
import type { Transaction } from '@/types/budget';

// Search index entry
export interface SearchIndexEntry {
  id: string;
  transactionId: string;
  field: 'description' | 'merchant' | 'category' | 'notes' | 'tags';
  value: string;
  tokens: string[]; // Tokenized words for fast lookup
  updatedAt: Date;
}

// Search index metadata
export interface SearchIndexMeta {
  id: string;
  lastRebuildAt: Date;
  transactionCount: number;
  entryCount: number;
  version: number;
}

// Dexie database for search index
class SearchIndexDB extends Dexie {
  searchIndex!: Table<SearchIndexEntry>;
  metadata!: Table<SearchIndexMeta>;

  constructor() {
    super('BudgetSearchIndex');

    this.version(1).stores({
      searchIndex: 'id, transactionId, field, *tokens',
      metadata: 'id',
    });
  }
}

// Singleton database instance
let searchDb: SearchIndexDB | null = null;

function getSearchDb(): SearchIndexDB {
  if (!searchDb) {
    searchDb = new SearchIndexDB();
  }
  return searchDb;
}

// Current index version (bump when schema changes)
const INDEX_VERSION = 1;

/**
 * Tokenize text for indexing
 * Splits on whitespace and punctuation, lowercases, removes short tokens
 */
function tokenize(text: string): string[] {
  if (!text) return [];

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with space
    .split(/\s+/)
    .filter(token => token.length >= 2) // Remove very short tokens
    .filter((token, index, arr) => arr.indexOf(token) === index); // Deduplicate
}

/**
 * Create search index entries for a transaction
 */
function createIndexEntries(transaction: Transaction): SearchIndexEntry[] {
  const entries: SearchIndexEntry[] = [];
  const now = new Date();

  // Index description
  if (transaction.description) {
    entries.push({
      id: `${transaction.id}-description`,
      transactionId: transaction.id,
      field: 'description',
      value: transaction.description,
      tokens: tokenize(transaction.description),
      updatedAt: now,
    });
  }

  // Index merchant
  if (transaction.merchant) {
    entries.push({
      id: `${transaction.id}-merchant`,
      transactionId: transaction.id,
      field: 'merchant',
      value: transaction.merchant,
      tokens: tokenize(transaction.merchant),
      updatedAt: now,
    });
  }

  // Index category
  if (transaction.category) {
    entries.push({
      id: `${transaction.id}-category`,
      transactionId: transaction.id,
      field: 'category',
      value: transaction.category,
      tokens: tokenize(transaction.category),
      updatedAt: now,
    });
  }

  // Index notes
  if (transaction.notes) {
    entries.push({
      id: `${transaction.id}-notes`,
      transactionId: transaction.id,
      field: 'notes',
      value: transaction.notes,
      tokens: tokenize(transaction.notes),
      updatedAt: now,
    });
  }

  // Index tags
  if (transaction.tags && transaction.tags.length > 0) {
    entries.push({
      id: `${transaction.id}-tags`,
      transactionId: transaction.id,
      field: 'tags',
      value: transaction.tags.join(' '),
      tokens: transaction.tags.map(t => t.toLowerCase()),
      updatedAt: now,
    });
  }

  return entries;
}

/**
 * Rebuild the entire search index from scratch
 */
export async function rebuildSearchIndex(transactions: Transaction[]): Promise<void> {
  const db = getSearchDb();

  console.log(`[SearchIndex] Rebuilding index for ${transactions.length} transactions...`);
  const startTime = performance.now();

  try {
    // Clear existing index
    await db.searchIndex.clear();

    // Create all entries
    const entries: SearchIndexEntry[] = [];
    for (const tx of transactions) {
      if (!tx.isSplit) { // Skip split parent transactions
        entries.push(...createIndexEntries(tx));
      }
    }

    // Bulk insert
    await db.searchIndex.bulkAdd(entries);

    // Update metadata
    await db.metadata.put({
      id: 'main',
      lastRebuildAt: new Date(),
      transactionCount: transactions.length,
      entryCount: entries.length,
      version: INDEX_VERSION,
    });

    const duration = performance.now() - startTime;
    console.log(`[SearchIndex] Index built: ${entries.length} entries in ${duration.toFixed(2)}ms`);
  } catch (error) {
    console.error('[SearchIndex] Error rebuilding index:', error);
    throw error;
  }
}

/**
 * Update index for a single transaction (add/update)
 */
export async function updateTransactionIndex(transaction: Transaction): Promise<void> {
  const db = getSearchDb();

  // Remove existing entries for this transaction
  await db.searchIndex
    .where('transactionId')
    .equals(transaction.id)
    .delete();

  // Add new entries
  const entries = createIndexEntries(transaction);
  if (entries.length > 0) {
    await db.searchIndex.bulkAdd(entries);
  }
}

/**
 * Remove index entries for a transaction
 */
export async function removeTransactionIndex(transactionId: string): Promise<void> {
  const db = getSearchDb();

  await db.searchIndex
    .where('transactionId')
    .equals(transactionId)
    .delete();
}

/**
 * Bulk update index for multiple transactions
 */
export async function bulkUpdateIndex(transactions: Transaction[]): Promise<void> {
  const db = getSearchDb();

  const transactionIds = transactions.map(tx => tx.id);

  // Remove existing entries
  await db.searchIndex
    .where('transactionId')
    .anyOf(transactionIds)
    .delete();

  // Add new entries
  const entries: SearchIndexEntry[] = [];
  for (const tx of transactions) {
    if (!tx.isSplit) {
      entries.push(...createIndexEntries(tx));
    }
  }

  if (entries.length > 0) {
    await db.searchIndex.bulkAdd(entries);
  }
}

/**
 * Search the index for matching transaction IDs
 * Returns transaction IDs sorted by relevance (number of matching tokens)
 */
export async function searchIndex(query: string): Promise<string[]> {
  const db = getSearchDb();
  const tokens = tokenize(query);

  if (tokens.length === 0) {
    return [];
  }

  // Find entries matching any token
  const matchingEntries = await db.searchIndex
    .where('tokens')
    .anyOf(tokens)
    .toArray();

  // Group by transaction ID and count matches
  const scoreMap = new Map<string, number>();

  for (const entry of matchingEntries) {
    const matchCount = tokens.filter(t =>
      entry.tokens.includes(t) || entry.value.toLowerCase().includes(t)
    ).length;

    const currentScore = scoreMap.get(entry.transactionId) || 0;
    scoreMap.set(entry.transactionId, currentScore + matchCount);
  }

  // Sort by score (descending)
  return Array.from(scoreMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);
}

/**
 * Check if index needs rebuilding
 */
export async function indexNeedsRebuild(transactionCount: number): Promise<boolean> {
  const db = getSearchDb();

  try {
    const meta = await db.metadata.get('main');

    if (!meta) return true;
    if (meta.version !== INDEX_VERSION) return true;

    // Rebuild if transaction count differs significantly
    const countDiff = Math.abs(meta.transactionCount - transactionCount);
    if (countDiff > 10) return true;

    // Rebuild if index is older than 7 days
    const ageInDays = (Date.now() - meta.lastRebuildAt.getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays > 7) return true;

    return false;
  } catch {
    return true;
  }
}

/**
 * Get index statistics
 */
export async function getIndexStats(): Promise<{
  entryCount: number;
  transactionCount: number;
  lastRebuildAt: Date | null;
  version: number;
}> {
  const db = getSearchDb();

  try {
    const meta = await db.metadata.get('main');
    const entryCount = await db.searchIndex.count();

    return {
      entryCount,
      transactionCount: meta?.transactionCount || 0,
      lastRebuildAt: meta?.lastRebuildAt || null,
      version: meta?.version || 0,
    };
  } catch {
    return {
      entryCount: 0,
      transactionCount: 0,
      lastRebuildAt: null,
      version: 0,
    };
  }
}

/**
 * Clear the entire search index
 */
export async function clearSearchIndex(): Promise<void> {
  const db = getSearchDb();

  await db.searchIndex.clear();
  await db.metadata.clear();
}

/**
 * Initialize search index (rebuild if needed)
 */
export async function initializeSearchIndex(transactions: Transaction[]): Promise<void> {
  const needsRebuild = await indexNeedsRebuild(transactions.length);

  if (needsRebuild) {
    await rebuildSearchIndex(transactions);
  }
}
