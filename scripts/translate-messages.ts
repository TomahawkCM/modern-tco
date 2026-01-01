#!/usr/bin/env tsx
/**
 * Translation Automation Script
 *
 * Automatically translates 114 locale files using OpenAI GPT-4o-mini API.
 *
 * Usage:
 *   npm run translate:messages                         # Full run (resume from cache)
 *   npm run translate:messages -- --dry-run             # Preview without executing
 *   npm run translate:messages -- --locales es-MX,fr-FR # Specific locales
 *   npm run translate:messages -- --force               # Ignore cache, retranslate all
 *   npm run translate:messages -- --retry-failed        # Retry only failed translations
 */

import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });
import { SUPPORTED_LOCALES, type SupportedLocale } from '../src/i18n/config';
import { OpenAIAPIClient, estimateCost } from './lib/openai-api-client';
import { CacheManager, loadSourceWithHash } from './lib/cache-manager';
import { shouldUseBaseTranslation, getBaseLocale } from './lib/prompt-builder';
import { validate, formatValidationResult } from './lib/translation-validator';

// Paths
const SOURCE_FILE = path.join(__dirname, '../src/i18n/messages/en.json');
const MESSAGES_DIR = path.join(__dirname, '../src/i18n/messages');

// CLI Options
interface CLIOptions {
  dryRun: boolean;
  force: boolean;
  retryFailed: boolean;
  locales: SupportedLocale[] | null;
  concurrency: number;
  verbose: boolean;
}

/**
 * Main entry point
 */
async function main() {
  console.log('🌍 Translation Automation Script\n');

  // Parse CLI arguments
  const options = parseArgs(process.argv.slice(2));

  // Load source file
  console.log('📖 Loading source file...');
  const { content: sourceContent, hash: sourceHash } = loadSourceWithHash(SOURCE_FILE);
  console.log(`   Source: ${SOURCE_FILE}`);
  console.log(`   Hash: ${sourceHash.substring(0, 12)}...`);
  console.log(`   Keys: ${Object.keys(sourceContent).length} top-level objects\n`);

  // Initialize cache
  const cache = new CacheManager();
  cache.updateSourceHash(sourceHash);

  // Determine locales to process
  const localesToProcess = determineLocales(options, cache, sourceHash);

  if (localesToProcess.length === 0) {
    console.log('✅ All translations up to date!');
    console.log('\n' + cache.exportStats());
    return;
  }

  // Categorize locales
  const { baseLocales, adaptedLocales, englishLocales } = categorizeLocales(localesToProcess);

  // Display plan
  console.log('📋 Translation Plan:');
  console.log(`   Base translations: ${baseLocales.length}`);
  console.log(`   Regional adaptations: ${adaptedLocales.length}`);
  console.log(`   English copies: ${englishLocales.length}`);
  console.log(`   Total to process: ${localesToProcess.length}\n`);

  // Cost estimate
  const costEst = estimateCost(baseLocales.length, adaptedLocales.length);
  console.log('💰 Cost Estimate:');
  console.log(`   ${costEst.breakdown}`);
  console.log(`   Total: $${costEst.estimatedCost.toFixed(3)}\n`);

  // Dry run check
  if (options.dryRun) {
    console.log('🏃 Dry run mode - no translations will be performed\n');
    console.log('Locales to translate:');
    localesToProcess.slice(0, 20).forEach(locale => console.log(`   - ${locale}`));
    if (localesToProcess.length > 20) {
      console.log(`   ... and ${localesToProcess.length - 20} more`);
    }
    return;
  }

  // Confirm with user
  if (!options.force && localesToProcess.length > 10) {
    console.log(`⚠️  About to translate ${localesToProcess.length} locales`);
    console.log(`   Estimated cost: $${costEst.estimatedCost.toFixed(2)}`);
    console.log(`   Estimated time: ${Math.ceil(localesToProcess.length / options.concurrency * 5 / 60)} minutes\n`);
  }

  // Initialize API client
  const client = new OpenAIAPIClient(options.concurrency);

  // Process translations
  console.log('🚀 Starting translations...\n');
  const startTime = Date.now();

  // Copy English variants first (instant)
  await processEnglishLocales(englishLocales, sourceContent, cache);

  // Translate base locales
  await processBaseLocales(baseLocales, sourceContent, sourceHash, client, cache, options);

  // Translate adapted locales
  await processAdaptedLocales(adaptedLocales, sourceHash, client, cache, options);

  // Summary
  const elapsed = Date.now() - startTime;
  const costActual = client.getCostEstimate();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Translation Complete!\n');
  console.log('📊 Results:');
  console.log(`   Time: ${(elapsed / 1000 / 60).toFixed(1)} minutes`);
  console.log(`   Cost: $${costActual.totalCost.toFixed(3)}`);
  console.log(`   Input tokens: ${costActual.inputTokens.toLocaleString()}`);
  console.log(`   Output tokens: ${costActual.outputTokens.toLocaleString()}\n`);
  console.log(cache.exportStats());

  // Validation summary
  const failedCount = cache.getFailedLocales().length;
  if (failedCount > 0) {
    console.log(`\n⚠️  ${failedCount} translations failed - use --retry-failed to retry`);
  }
}

/**
 * Parse command-line arguments
 */
function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {
    dryRun: false,
    force: false,
    retryFailed: false,
    locales: null,
    concurrency: 5,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--force':
        options.force = true;
        break;
      case '--retry-failed':
        options.retryFailed = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--locales':
        if (i + 1 < args.length) {
          options.locales = args[++i].split(',') as SupportedLocale[];
        }
        break;
      case '--concurrency':
        if (i + 1 < args.length) {
          options.concurrency = parseInt(args[++i], 10);
        }
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
 * Determine which locales to process
 */
function determineLocales(
  options: CLIOptions,
  cache: CacheManager,
  sourceHash: string
): SupportedLocale[] {
  // If specific locales requested
  if (options.locales) {
    return options.locales;
  }

  // If retry-failed mode
  if (options.retryFailed) {
    return cache.getFailedLocales();
  }

  // Get all non-English locales
  const allLocales = SUPPORTED_LOCALES.filter(locale => locale !== 'en');

  // If force mode, return all
  if (options.force) {
    return allLocales;
  }

  // Otherwise, filter out cached locales
  return cache.getLocalesToProcess(allLocales, sourceHash, false);
}

/**
 * Categorize locales into base, adapted, and English
 */
function categorizeLocales(locales: SupportedLocale[]): {
  baseLocales: SupportedLocale[];
  adaptedLocales: SupportedLocale[];
  englishLocales: SupportedLocale[];
} {
  const baseLocales: SupportedLocale[] = [];
  const adaptedLocales: SupportedLocale[] = [];
  const englishLocales: SupportedLocale[] = [];

  for (const locale of locales) {
    if (locale.startsWith('en-')) {
      englishLocales.push(locale);
    } else if (shouldUseBaseTranslation(locale)) {
      baseLocales.push(locale);
    } else {
      adaptedLocales.push(locale);
    }
  }

  return { baseLocales, adaptedLocales, englishLocales };
}

/**
 * Process English locale variants (just copy en.json)
 */
async function processEnglishLocales(
  locales: SupportedLocale[],
  sourceContent: object,
  cache: CacheManager
): Promise<void> {
  if (locales.length === 0) return;

  console.log(`📋 Copying English variants (${locales.length})...`);

  for (const locale of locales) {
    const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
    fs.writeFileSync(filePath, JSON.stringify(sourceContent, null, 2), 'utf-8');
    cache.saveTranslation(locale, sourceContent, cache.getStats().sourceHash);
    console.log(`   ✅ ${locale}`);
  }

  console.log();
}

/**
 * Process base language translations
 */
async function processBaseLocales(
  locales: SupportedLocale[],
  sourceContent: object,
  sourceHash: string,
  client: OpenAIAPIClient,
  cache: CacheManager,
  options: CLIOptions
): Promise<void> {
  if (locales.length === 0) return;

  console.log(`🔤 Translating base languages (${locales.length})...`);

  let completed = 0;
  let failed = 0;

  for (const locale of locales) {
    try {
      process.stdout.write(`   ⏳ ${locale}...`);

      const translation = await client.translateBase(locale, sourceContent);

      // Validate
      const validation = validate(translation, sourceContent, locale);

      if (!validation.valid) {
        console.log(` ❌ Validation failed`);
        if (options.verbose) {
          console.log(formatValidationResult(validation, locale));
        }
        cache.saveError(locale, `Validation failed: ${validation.errors.join(', ')}`);
        failed++;
        continue;
      }

      // Save to file
      const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
      fs.writeFileSync(filePath, JSON.stringify(translation, null, 2), 'utf-8');

      // Update cache
      cache.saveTranslation(locale, translation, sourceHash);

      process.stdout.write(`\r   ✅ ${locale} (${++completed}/${locales.length})\n`);

      if (validation.warnings.length > 0 && options.verbose) {
        console.log(`      ⚠️  ${validation.warnings.length} warnings`);
      }
    } catch (error: any) {
      process.stdout.write(`\r   ❌ ${locale}: ${error.message}\n`);
      cache.saveError(locale, error.message);
      failed++;
    }
  }

  console.log(`   Completed: ${completed}, Failed: ${failed}\n`);
}

/**
 * Process regional adaptations
 */
async function processAdaptedLocales(
  locales: SupportedLocale[],
  sourceHash: string,
  client: OpenAIAPIClient,
  cache: CacheManager,
  options: CLIOptions
): Promise<void> {
  if (locales.length === 0) return;

  console.log(`🌎 Adapting regional variants (${locales.length})...`);

  let completed = 0;
  let failed = 0;

  for (const locale of locales) {
    try {
      const baseLocale = getBaseLocale(locale);

      if (!baseLocale) {
        throw new Error(`No base locale found for ${locale}`);
      }

      // Get base translation from cache or file
      let baseTranslation = cache.getCachedTranslation(baseLocale, sourceHash);

      if (!baseTranslation) {
        // Load from file if not cached
        const baseFilePath = path.join(MESSAGES_DIR, `${baseLocale}.json`);
        if (!fs.existsSync(baseFilePath)) {
          throw new Error(`Base translation ${baseLocale} not found - translate base locales first`);
        }
        baseTranslation = JSON.parse(fs.readFileSync(baseFilePath, 'utf-8'));
      }

      process.stdout.write(`   ⏳ ${locale} (from ${baseLocale})...`);

      const translation = await client.translateAdapted(locale, baseLocale, baseTranslation);

      // Validate (load source for validation)
      const sourceContent = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf-8'));
      const validation = validate(translation, sourceContent, locale);

      if (!validation.valid) {
        console.log(` ❌ Validation failed`);
        cache.saveError(locale, `Validation failed: ${validation.errors.join(', ')}`);
        failed++;
        continue;
      }

      // Save to file
      const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
      fs.writeFileSync(filePath, JSON.stringify(translation, null, 2), 'utf-8');

      // Update cache
      cache.saveTranslation(locale, translation, sourceHash, baseLocale);

      process.stdout.write(`\r   ✅ ${locale} (${++completed}/${locales.length})\n`);
    } catch (error: any) {
      process.stdout.write(`\r   ❌ ${locale}: ${error.message}\n`);
      cache.saveError(locale, error.message);
      failed++;
    }
  }

  console.log(`   Completed: ${completed}, Failed: ${failed}\n`);
}

/**
 * Print help message
 */
function printHelp(): void {
  console.log(`
Translation Automation Script

Usage:
  npm run translate:messages [options]

Options:
  --dry-run          Preview translations without executing
  --force            Ignore cache and retranslate all locales
  --retry-failed     Retry only previously failed translations
  --locales <list>   Translate specific locales (comma-separated)
  --concurrency <n>  Number of concurrent API calls (default: 5)
  --verbose, -v      Show detailed validation output
  --help, -h         Show this help message

Examples:
  npm run translate:messages
  npm run translate:messages -- --dry-run
  npm run translate:messages -- --locales es-MX,fr-FR,zh-CN
  npm run translate:messages -- --force --concurrency 10
  npm run translate:messages -- --retry-failed
  `);
}

// Run main function
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
