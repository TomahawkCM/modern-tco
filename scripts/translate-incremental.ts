#!/usr/bin/env tsx
/**
 * Incremental Translation Script
 *
 * Translates only changed keys (10-20x faster than full translation).
 * Detects changes via git diff and merges translations into existing locale files.
 *
 * Usage:
 *   npm run translate:incremental                    # Translate changed keys since last commit
 *   npm run translate:incremental -- --staged        # Translate staged changes (for git hooks)
 *   npm run translate:incremental -- --commit HEAD~1 # Compare with specific commit
 *   npm run translate:incremental -- --dry-run       # Preview without translating
 */

import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { SUPPORTED_LOCALES, type SupportedLocale } from '../src/i18n/config';
import { ClaudeAPIClient } from './lib/claude-api-client';
import { CacheManager } from './lib/cache-manager';
import { shouldUseBaseTranslation, getBaseLocale } from './lib/prompt-builder';
import { validate, formatValidationResult } from './lib/translation-validator';
import {
  detectChangedKeys,
  detectStagedChanges,
  extractKeyValues,
  unflattenKeys,
  type KeyChanges,
} from './lib/key-differ';

// Paths
const SOURCE_FILE = path.join(__dirname, '../src/i18n/messages/en-US.json');
const MESSAGES_DIR = path.join(__dirname, '../src/i18n/messages');

// CLI Options
interface CLIOptions {
  dryRun: boolean;
  staged: boolean;
  commit: string;
  concurrency: number;
  verbose: boolean;
}

/**
 * Main entry point
 */
async function main() {
  console.log('⚡ Incremental Translation Script\n');

  // Parse CLI arguments
  const options = parseArgs(process.argv.slice(2));

  // Detect changed keys
  console.log('🔍 Detecting changed keys...');
  const changes = options.staged
    ? await detectStagedChanges(SOURCE_FILE)
    : await detectChangedKeys(SOURCE_FILE, options.commit);

  console.log(`   Added: ${changes.added.length} keys`);
  console.log(`   Modified: ${changes.modified.length} keys`);
  console.log(`   Removed: ${changes.removed.length} keys`);
  console.log(`   Unchanged: ${changes.unchanged.length} keys\n`);

  // Check if there are changes
  const totalChanges = changes.added.length + changes.modified.length + changes.removed.length;

  if (totalChanges === 0) {
    console.log('✅ No translation changes needed!');
    return;
  }

  // Extract values for changed keys
  const changedKeys = [...changes.added, ...changes.modified];
  const changedKeyValues = changedKeys.length > 0
    ? extractKeyValues(SOURCE_FILE, changedKeys)
    : {};

  console.log(`📋 Translation Plan:`);
  console.log(`   Keys to translate: ${changedKeys.length}`);
  console.log(`   Keys to remove: ${changes.removed.length}`);
  console.log(`   Locales to update: ${SUPPORTED_LOCALES.length - 1}\n`);

  // Dry run check
  if (options.dryRun) {
    console.log('🏃 Dry run mode - showing changes only\n');

    if (changes.added.length > 0) {
      console.log('Added keys (first 10):');
      changes.added.slice(0, 10).forEach(key => {
        console.log(`   + ${key}: "${changedKeyValues[key]}"`);
      });
      if (changes.added.length > 10) {
        console.log(`   ... and ${changes.added.length - 10} more`);
      }
      console.log();
    }

    if (changes.modified.length > 0) {
      console.log('Modified keys (first 10):');
      changes.modified.slice(0, 10).forEach(key => {
        console.log(`   ~ ${key}: "${changedKeyValues[key]}"`);
      });
      if (changes.modified.length > 10) {
        console.log(`   ... and ${changes.modified.length - 10} more`);
      }
      console.log();
    }

    if (changes.removed.length > 0) {
      console.log('Removed keys (first 10):');
      changes.removed.slice(0, 10).forEach(key => {
        console.log(`   - ${key}`);
      });
      if (changes.removed.length > 10) {
        console.log(`   ... and ${changes.removed.length - 10} more`);
      }
      console.log();
    }

    return;
  }

  // Initialize cache and API client
  const cache = new CacheManager();
  const client = new ClaudeAPIClient(options.concurrency);

  // Get locales to process (exclude en and en-* variants)
  const localesToProcess = SUPPORTED_LOCALES.filter(
    locale => locale !== 'en' && !locale.startsWith('en-')
  );

  // Categorize locales
  const { baseLocales, adaptedLocales } = categorizeLocales(localesToProcess);

  console.log('🚀 Starting incremental translation...\n');
  const startTime = Date.now();

  // Process base locales first
  if (changedKeys.length > 0) {
    await processBaseLocalesIncremental(
      baseLocales,
      changedKeyValues,
      client,
      options
    );

    await processAdaptedLocalesIncremental(
      adaptedLocales,
      changedKeyValues,
      client,
      options
    );
  }

  // Remove deleted keys from all locales
  if (changes.removed.length > 0) {
    console.log(`\n🗑️  Removing ${changes.removed.length} deleted keys from all locales...`);
    for (const locale of localesToProcess) {
      removeKeysFromLocale(locale, changes.removed);
    }
    console.log('   ✅ Deleted keys removed\n');
  }

  // Summary
  const elapsed = Date.now() - startTime;
  const costActual = client.getCostEstimate();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Incremental Translation Complete!\n');
  console.log('📊 Results:');
  console.log(`   Time: ${(elapsed / 1000).toFixed(1)}s (${(elapsed / 1000 / 60).toFixed(1)} minutes)`);
  console.log(`   Keys translated: ${changedKeys.length}`);
  console.log(`   Keys removed: ${changes.removed.length}`);
  console.log(`   Locales updated: ${localesToProcess.length}`);
  console.log(`   Cost: $${costActual.totalCost.toFixed(3)}`);
  console.log(`   Input tokens: ${costActual.inputTokens.toLocaleString()}`);
  console.log(`   Output tokens: ${costActual.outputTokens.toLocaleString()}`);
}

/**
 * Parse command-line arguments
 */
function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {
    dryRun: false,
    staged: false,
    commit: 'HEAD',
    concurrency: 5,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--staged':
        options.staged = true;
        break;
      case '--commit':
        if (i + 1 < args.length) {
          options.commit = args[++i];
        }
        break;
      case '--concurrency':
        if (i + 1 < args.length) {
          options.concurrency = parseInt(args[++i], 10);
        }
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }

  return options;
}

/**
 * Categorize locales into base and adapted
 */
function categorizeLocales(locales: SupportedLocale[]): {
  baseLocales: SupportedLocale[];
  adaptedLocales: SupportedLocale[];
} {
  const baseLocales: SupportedLocale[] = [];
  const adaptedLocales: SupportedLocale[] = [];

  for (const locale of locales) {
    if (shouldUseBaseTranslation(locale)) {
      baseLocales.push(locale);
    } else {
      adaptedLocales.push(locale);
    }
  }

  return { baseLocales, adaptedLocales };
}

/**
 * Process base locale translations incrementally
 */
async function processBaseLocalesIncremental(
  locales: SupportedLocale[],
  changedKeyValues: Record<string, any>,
  client: ClaudeAPIClient,
  options: CLIOptions
): Promise<void> {
  if (locales.length === 0) return;

  console.log(`🔤 Translating ${Object.keys(changedKeyValues).length} keys for ${locales.length} base locales...`);

  let completed = 0;
  let failed = 0;

  // Create partial source object with only changed keys
  const partialSource = unflattenKeys(changedKeyValues);

  for (const locale of locales) {
    try {
      process.stdout.write(`   ⏳ ${locale}...`);

      // Translate only changed keys
      const partialTranslation = await client.translateBase(locale, partialSource);

      // Read existing translation file
      const existingFile = path.join(MESSAGES_DIR, `${locale}.json`);
      let existing = {};
      if (fs.existsSync(existingFile)) {
        existing = JSON.parse(fs.readFileSync(existingFile, 'utf-8'));
      }

      // Merge partial translation into existing
      const merged = deepMerge(existing, partialTranslation);

      // Validate merged result
      const sourceContent = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf-8'));
      const validation = validate(merged, sourceContent, locale);

      if (!validation.valid) {
        console.log(` ❌ Validation failed`);
        if (options.verbose) {
          console.log(formatValidationResult(validation, locale));
        }
        failed++;
        continue;
      }

      // Save merged file
      fs.writeFileSync(existingFile, JSON.stringify(merged, null, 2), 'utf-8');

      process.stdout.write(`\r   ✅ ${locale} (${++completed}/${locales.length})\n`);

      if (validation.warnings.length > 0 && options.verbose) {
        console.log(`      ⚠️  ${validation.warnings.length} warnings`);
      }
    } catch (error: any) {
      process.stdout.write(`\r   ❌ ${locale}: ${error.message}\n`);
      failed++;
    }
  }

  console.log(`   Completed: ${completed}, Failed: ${failed}\n`);
}

/**
 * Process adapted locale translations incrementally
 */
async function processAdaptedLocalesIncremental(
  locales: SupportedLocale[],
  changedKeyValues: Record<string, any>,
  client: ClaudeAPIClient,
  options: CLIOptions
): Promise<void> {
  if (locales.length === 0) return;

  console.log(`🌎 Adapting ${Object.keys(changedKeyValues).length} keys for ${locales.length} regional variants...`);

  let completed = 0;
  let failed = 0;

  // Create partial source object
  const partialSource = unflattenKeys(changedKeyValues);

  for (const locale of locales) {
    try {
      const baseLocale = getBaseLocale(locale);

      if (!baseLocale) {
        throw new Error(`No base locale found for ${locale}`);
      }

      // Read base translation file
      const baseFile = path.join(MESSAGES_DIR, `${baseLocale}.json`);
      if (!fs.existsSync(baseFile)) {
        throw new Error(`Base translation ${baseLocale} not found`);
      }
      const baseTranslation = JSON.parse(fs.readFileSync(baseFile, 'utf-8'));

      // Extract only changed keys from base translation
      const flatBase = flattenKeysObj(baseTranslation);
      const changedBaseKeys: Record<string, any> = {};
      for (const key of Object.keys(changedKeyValues)) {
        if (key in flatBase) {
          changedBaseKeys[key] = flatBase[key];
        }
      }
      const partialBase = unflattenKeys(changedBaseKeys);

      process.stdout.write(`   ⏳ ${locale} (from ${baseLocale})...`);

      // Translate only changed keys
      const partialTranslation = await client.translateAdapted(locale, baseLocale, partialBase);

      // Read existing translation
      const existingFile = path.join(MESSAGES_DIR, `${locale}.json`);
      let existing = {};
      if (fs.existsSync(existingFile)) {
        existing = JSON.parse(fs.readFileSync(existingFile, 'utf-8'));
      }

      // Merge
      const merged = deepMerge(existing, partialTranslation);

      // Validate
      const sourceContent = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf-8'));
      const validation = validate(merged, sourceContent, locale);

      if (!validation.valid) {
        console.log(` ❌ Validation failed`);
        failed++;
        continue;
      }

      // Save
      fs.writeFileSync(existingFile, JSON.stringify(merged, null, 2), 'utf-8');

      process.stdout.write(`\r   ✅ ${locale} (${++completed}/${locales.length})\n`);
    } catch (error: any) {
      process.stdout.write(`\r   ❌ ${locale}: ${error.message}\n`);
      failed++;
    }
  }

  console.log(`   Completed: ${completed}, Failed: ${failed}\n`);
}

/**
 * Remove keys from a locale file
 */
function removeKeysFromLocale(locale: SupportedLocale, keysToRemove: string[]): void {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);

  if (!fs.existsSync(filePath)) {
    return; // File doesn't exist, nothing to remove
  }

  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const flatKeys = flattenKeysObj(content);

  // Remove keys
  for (const key of keysToRemove) {
    delete flatKeys[key];
  }

  // Reconstruct and save
  const updated = unflattenKeys(flatKeys);
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
}

/**
 * Deep merge two objects (b into a)
 */
function deepMerge(a: any, b: any): any {
  const result = { ...a };

  for (const [key, value] of Object.entries(b)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = deepMerge(result[key] || {}, value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Flatten object to dot notation (helper for this file)
 */
function flattenKeysObj(obj: any, prefix: string = ''): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenKeysObj(value, fullKey));
    } else {
      result[fullKey] = value;
    }
  }

  return result;
}

/**
 * Print help message
 */
function printHelp(): void {
  console.log(`
Incremental Translation Script

Usage:
  npm run translate:incremental [options]

Options:
  --dry-run          Preview changes without translating
  --staged           Translate staged changes (for pre-commit hook)
  --commit <ref>     Compare with specific git commit (default: HEAD)
  --concurrency <n>  Number of concurrent API calls (default: 5)
  --verbose, -v      Show detailed validation output
  --help, -h         Show this help message

Examples:
  npm run translate:incremental
  npm run translate:incremental -- --dry-run
  npm run translate:incremental -- --staged
  npm run translate:incremental -- --commit HEAD~1
  `);
}

// Run main function
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
