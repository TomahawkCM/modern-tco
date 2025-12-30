/**
 * Cache Manager for Translation Automation
 *
 * Provides:
 * 1. Progress persistence (resume interrupted runs)
 * 2. Source change detection (MD5 hash)
 * 3. Error tracking (failed translations)
 * 4. Translation caching (avoid re-translating)
 */

import * as fs from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';
import type { SupportedLocale } from '../../src/i18n/config';
import { isValid } from './translation-validator';

const CACHE_FILE = path.join(__dirname, '../.translation-cache.json');

export interface TranslationCacheEntry {
  content: object;
  translatedAt: string;
  sourceHash: string;
  baseLocale?: SupportedLocale;
  verified: boolean;
}

export interface ErrorEntry {
  error: string;
  attempts: number;
  lastAttempt: string;
}

export interface TranslationCache {
  version: string;
  sourceHash: string;
  lastUpdated: string;
  translations: Record<string, TranslationCacheEntry>;
  errors: Record<string, ErrorEntry>;
}

/**
 * Cache Manager Class
 */
export class CacheManager {
  private cache: TranslationCache;
  private cacheFile: string;

  constructor(cacheFile: string = CACHE_FILE) {
    this.cacheFile = cacheFile;
    this.cache = this.load();
  }

  /**
   * Load cache from disk
   */
  private load(): TranslationCache {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const data = fs.readFileSync(this.cacheFile, 'utf-8');
        return JSON.parse(data) as TranslationCache;
      }
    } catch (error) {
      console.warn(`Warning: Could not load cache: ${error}`);
    }

    // Return empty cache
    return {
      version: '1.0',
      sourceHash: '',
      lastUpdated: new Date().toISOString(),
      translations: {},
      errors: {},
    };
  }

  /**
   * Save cache to disk
   */
  save(): void {
    try {
      this.cache.lastUpdated = new Date().toISOString();

      // Ensure directory exists
      const dir = path.dirname(this.cacheFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(this.cacheFile, JSON.stringify(this.cache, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Error saving cache: ${error}`);
    }
  }

  /**
   * Update source hash
   */
  updateSourceHash(sourceContent: object): void {
    const hash = computeHash(sourceContent);
    this.cache.sourceHash = hash;
  }

  /**
   * Get cached translation if valid
   */
  getCachedTranslation(
    locale: SupportedLocale,
    sourceHash: string
  ): object | null {
    const entry = this.cache.translations[locale];

    if (!entry) {
      return null;
    }

    // Check if source has changed
    if (entry.sourceHash !== sourceHash) {
      return null;
    }

    return entry.content;
  }

  /**
   * Save translated locale
   */
  saveTranslation(
    locale: SupportedLocale,
    content: object,
    sourceHash: string,
    baseLocale?: SupportedLocale
  ): void {
    this.cache.translations[locale] = {
      content,
      translatedAt: new Date().toISOString(),
      sourceHash,
      baseLocale,
      verified: true,
    };

    // Clear any previous errors for this locale
    if (this.cache.errors[locale]) {
      delete this.cache.errors[locale];
    }

    this.save();
  }

  /**
   * Save translation error
   */
  saveError(locale: SupportedLocale, error: string): void {
    const existing = this.cache.errors[locale];

    this.cache.errors[locale] = {
      error,
      attempts: existing ? existing.attempts + 1 : 1,
      lastAttempt: new Date().toISOString(),
    };

    this.save();
  }

  /**
   * Get list of failed locales
   */
  getFailedLocales(): SupportedLocale[] {
    return Object.keys(this.cache.errors) as SupportedLocale[];
  }

  /**
   * Get list of successfully translated locales
   */
  getTranslatedLocales(): SupportedLocale[] {
    return Object.keys(this.cache.translations) as SupportedLocale[];
  }

  /**
   * Check if locale is cached and valid
   */
  isCached(locale: SupportedLocale, sourceHash: string): boolean {
    const entry = this.cache.translations[locale];
    return entry !== undefined && entry.sourceHash === sourceHash;
  }

  /**
   * Get locales to process (excludes cached & valid translations)
   */
  getLocalesToProcess(
    allLocales: SupportedLocale[],
    sourceHash: string,
    retryFailed: boolean = false
  ): SupportedLocale[] {
    return allLocales.filter(locale => {
      // Include if retry-failed mode and locale has errors
      if (retryFailed && this.cache.errors[locale]) {
        return true;
      }

      // Exclude if cached and source unchanged
      if (this.isCached(locale, sourceHash)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Clear cache for specific locale
   */
  clearLocale(locale: SupportedLocale): void {
    delete this.cache.translations[locale];
    delete this.cache.errors[locale];
    this.save();
  }

  /**
   * Clear entire cache
   */
  clearAll(): void {
    this.cache = {
      version: '1.0',
      sourceHash: '',
      lastUpdated: new Date().toISOString(),
      translations: {},
      errors: {},
    };
    this.save();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    total: number;
    cached: number;
    failed: number;
    sourceHash: string;
  } {
    return {
      total: Object.keys(this.cache.translations).length + Object.keys(this.cache.errors).length,
      cached: Object.keys(this.cache.translations).length,
      failed: Object.keys(this.cache.errors).length,
      sourceHash: this.cache.sourceHash,
    };
  }

  /**
   * Validate all cached translations against source
   */
  validateCache(source: object): {
    valid: number;
    invalid: number;
    invalidLocales: SupportedLocale[];
  } {
    let valid = 0;
    let invalid = 0;
    const invalidLocales: SupportedLocale[] = [];

    for (const [locale, entry] of Object.entries(this.cache.translations)) {
      try {
        const isValidTranslation = isValid(entry.content, source, locale as SupportedLocale);

        if (isValidTranslation) {
          valid++;
        } else {
          invalid++;
          invalidLocales.push(locale as SupportedLocale);
        }
      } catch (error) {
        invalid++;
        invalidLocales.push(locale as SupportedLocale);
      }
    }

    return { valid, invalid, invalidLocales };
  }

  /**
   * Export cache statistics for display
   */
  exportStats(): string {
    const stats = this.getStats();
    const errors = this.cache.errors;

    const parts: string[] = [
      '📊 Cache Statistics:',
      `   Cached translations: ${stats.cached}`,
      `   Failed translations: ${stats.failed}`,
      `   Source hash: ${stats.sourceHash.substring(0, 8)}...`,
      `   Last updated: ${this.cache.lastUpdated}`,
    ];

    if (stats.failed > 0) {
      parts.push('\n❌ Failed locales:');
      Object.entries(errors).slice(0, 5).forEach(([locale, entry]) => {
        parts.push(`   - ${locale}: ${entry.error} (${entry.attempts} attempts)`);
      });
      if (stats.failed > 5) {
        parts.push(`   ... and ${stats.failed - 5} more`);
      }
    }

    return parts.join('\n');
  }
}

/**
 * Compute MD5 hash of object (for change detection)
 */
function computeHash(content: object): string {
  const json = JSON.stringify(content, Object.keys(content).sort());
  return crypto.createHash('md5').update(json).digest('hex');
}

/**
 * Load source file and compute hash
 */
export function loadSourceWithHash(sourceFile: string): { content: object; hash: string } {
  const content = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));
  const hash = computeHash(content);
  return { content, hash };
}
