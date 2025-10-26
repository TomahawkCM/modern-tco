/**
 * Tanium Query Engine - Cache Layer
 * High-performance LRU cache with TTL support
 */

import { createHash } from 'crypto';
import type { QueryResult, QueryNode, CacheEntry } from './types';

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  maxSize: number;
}

export class QueryCache {
  protected cache: Map<string, CacheEntry<any>>;
  private accessOrder: string[] = [];
  private stats: CacheStats;
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize: number = 1000, defaultTTL: number = 300000) { // 5 minutes default
    this.cache = new Map();
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
      maxSize
    };
  }

  /**
   * Generate cache key from query
   */
  private generateKey(query: string | QueryNode, options?: Record<string, any>): string {
    const data = typeof query === 'string' ? query : JSON.stringify(query);
    const optionsStr = options ? JSON.stringify(options) : '';
    return createHash('sha256')
      .update(data + optionsStr)
      .digest('hex')
      .substring(0, 16); // Use first 16 chars for shorter keys
  }

  /**
   * Get item from cache
   */
  public get<T>(query: string | QueryNode, options?: Record<string, any>): T | null {
    const key = this.generateKey(query, options);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now > entry.timestamp + entry.ttl) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access order (LRU)
    this.updateAccessOrder(key);
    entry.hits++;
    this.stats.hits++;

    return entry.value;
  }

  /**
   * Set item in cache
   */
  public set<T>(
    query: string | QueryNode,
    value: T,
    options?: {
      ttl?: number;
      size?: number;
      metadata?: Record<string, any>;
    }
  ): void {
    const key = this.generateKey(query);
    const ttl = options?.ttl || this.defaultTTL;
    const size = options?.size || this.estimateSize(value);

    // Check if we need to evict items
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl,
      hits: 0,
      size
    };

    this.cache.set(key, entry);
    this.updateAccessOrder(key);
    this.stats.size = this.cache.size;
  }

  /**
   * Delete item from cache
   */
  public delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      const index = this.accessOrder.indexOf(key);
      if (index > -1) {
        this.accessOrder.splice(index, 1);
      }
      this.stats.size = this.cache.size;
    }
    return deleted;
  }

  /**
   * Clear entire cache
   */
  public clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.stats.size = 0;
    this.stats.evictions = 0;
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get cache hit rate
   */
  public getHitRate(): number {
    const total = this.stats.hits + this.stats.misses;
    return total === 0 ? 0 : this.stats.hits / total;
  }

  /**
   * Evict least recently used item
   */
  private evictLRU(): void {
    if (this.accessOrder.length === 0) return;

    const lruKey = this.accessOrder[0];
    this.cache.delete(lruKey);
    this.accessOrder.shift();
    this.stats.evictions++;
    this.stats.size = this.cache.size;
  }

  /**
   * Update access order for LRU
   */
  private updateAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  /**
   * Estimate size of cached value
   */
  private estimateSize(value: any): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'string') return value.length;
    if (typeof value === 'number') return 8;
    if (typeof value === 'boolean') return 1;
    if (value instanceof Date) return 8;
    if (Array.isArray(value)) {
      return value.reduce((sum, item) => sum + this.estimateSize(item), 0);
    }
    if (typeof value === 'object') {
      return Object.entries(value).reduce(
        (sum, [key, val]) => sum + key.length + this.estimateSize(val),
        0
      );
    }
    return 0;
  }

  /**
   * Prune expired entries
   */
  public pruneExpired(): number {
    const now = Date.now();
    let pruned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        this.delete(key);
        pruned++;
      }
    }

    return pruned;
  }

  /**
   * Get cache size in bytes (estimated)
   */
  public getSizeInBytes(): number {
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      totalSize += entry.size;
    }
    return totalSize;
  }

  /**
   * Export cache for persistence
   */
  public export(): string {
    const data = {
      entries: Array.from(this.cache.entries()),
      stats: this.stats,
      accessOrder: this.accessOrder
    };
    return JSON.stringify(data);
  }

  /**
   * Import cache from persistence
   */
  public import(data: string): void {
    try {
      const parsed = JSON.parse(data);
      this.cache = new Map(parsed.entries);
      this.stats = parsed.stats;
      this.accessOrder = parsed.accessOrder || [];

      // Prune expired entries after import
      this.pruneExpired();
    } catch (error) {
      console.error('Failed to import cache:', error);
    }
  }
}

/**
 * Specialized cache for parsed queries (AST)
 */
export class ParsedQueryCache extends QueryCache {
  constructor(maxSize: number = 500) {
    super(maxSize, 3600000); // 1 hour TTL for parsed queries
  }

  /**
   * Get parsed query AST
   */
  public getAST(query: string): QueryNode | null {
    return this.get<QueryNode>(query);
  }

  /**
   * Set parsed query AST
   */
  public setAST(query: string, ast: QueryNode): void {
    this.set(query, ast, {
      size: JSON.stringify(ast).length
    });
  }
}

/**
 * Specialized cache for query results
 */
export class ResultCache extends QueryCache {
  constructor(maxSize: number = 100, defaultTTL: number = 60000) { // 1 minute default
    super(maxSize, defaultTTL);
  }

  /**
   * Get query result
   */
  public getResult(query: string, userId?: string): QueryResult | null {
    const options = userId ? { userId } : undefined;
    return this.get<QueryResult>(query, options);
  }

  /**
   * Set query result
   */
  public setResult(query: string, result: QueryResult, userId?: string): void {
    const options = userId ? { userId } : undefined;
    const size = this.estimateResultSize(result);

    this.set(query, result, {
      size,
      metadata: options
    });
  }

  /**
   * Estimate size of query result
   */
  private estimateResultSize(result: QueryResult): number {
    let size = 100; // Base overhead

    if (result.headers) {
      size += result.headers.join('').length;
    }

    if (result.rows) {
      size += result.rows.length * 50; // Estimate 50 bytes per row
    }

    if (result.csv) {
      size += result.csv.length;
    }

    return size;
  }

  /**
   * Invalidate all results for a user
   */
  public invalidateUser(userId: string): void {
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.value?.metadata?.userId === userId) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
  }
}

/**
 * Cache manager combining all cache types
 */
export class CacheManager {
  private parsedCache: ParsedQueryCache;
  private resultCache: ResultCache;
  private globalEnabled: boolean = true;

  constructor(config?: {
    maxParsedQueries?: number;
    maxResults?: number;
    resultTTL?: number;
    enabled?: boolean;
  }) {
    this.parsedCache = new ParsedQueryCache(config?.maxParsedQueries || 500);
    this.resultCache = new ResultCache(config?.maxResults || 100, config?.resultTTL || 60000);
    this.globalEnabled = config?.enabled ?? true;
  }

  /**
   * Get parsed query from cache
   */
  public getParsedQuery(query: string): QueryNode | null {
    if (!this.globalEnabled) return null;
    return this.parsedCache.getAST(query);
  }

  /**
   * Cache parsed query
   */
  public setParsedQuery(query: string, ast: QueryNode): void {
    if (!this.globalEnabled) return;
    this.parsedCache.setAST(query, ast);
  }

  /**
   * Get query result from cache
   */
  public getQueryResult(query: string, userId?: string): QueryResult | null {
    if (!this.globalEnabled) return null;
    return this.resultCache.getResult(query, userId);
  }

  /**
   * Cache query result
   */
  public setQueryResult(query: string, result: QueryResult, userId?: string): void {
    if (!this.globalEnabled) return;

    // Mark result as cached
    result.cached = true;
    this.resultCache.setResult(query, result, userId);
  }

  /**
   * Clear all caches
   */
  public clearAll(): void {
    this.parsedCache.clear();
    this.resultCache.clear();
  }

  /**
   * Get combined statistics
   */
  public getStatistics(): {
    parsed: CacheStats;
    results: CacheStats;
    totalHitRate: number;
  } {
    const parsedStats = this.parsedCache.getStats();
    const resultStats = this.resultCache.getStats();

    const totalHits = parsedStats.hits + resultStats.hits;
    const totalMisses = parsedStats.misses + resultStats.misses;
    const totalHitRate = totalHits + totalMisses === 0 ? 0 : totalHits / (totalHits + totalMisses);

    return {
      parsed: parsedStats,
      results: resultStats,
      totalHitRate
    };
  }

  /**
   * Prune expired entries from all caches
   */
  public pruneExpired(): {
    parsed: number;
    results: number;
  } {
    return {
      parsed: this.parsedCache.pruneExpired(),
      results: this.resultCache.pruneExpired()
    };
  }

  /**
   * Enable/disable caching
   */
  public setEnabled(enabled: boolean): void {
    this.globalEnabled = enabled;
    if (!enabled) {
      this.clearAll();
    }
  }

  /**
   * Check if caching is enabled
   */
  public isEnabled(): boolean {
    return this.globalEnabled;
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();