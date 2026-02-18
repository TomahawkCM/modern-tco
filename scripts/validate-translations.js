#!/usr/bin/env node

/**
 * validate-translations.js
 *
 * Validates all locale files against the master en.json.
 * Reports missing keys, extra keys, and completion percentage per locale.
 * Exits with code 1 if any locale is below the completion threshold (90%).
 *
 * Usage:
 *   node scripts/validate-translations.js
 *   node scripts/validate-translations.js --threshold 80   # custom threshold
 */

const fs = require('fs');
const path = require('path');

const MESSAGES_DIR = path.resolve(__dirname, '..', 'src', 'i18n', 'messages');
const MASTER_FILE = path.join(MESSAGES_DIR, 'en.json');

// Parse optional --threshold flag (default 90)
const DEFAULT_THRESHOLD = 90;
const thresholdArgIndex = process.argv.indexOf('--threshold');
const THRESHOLD =
  thresholdArgIndex !== -1 && process.argv[thresholdArgIndex + 1]
    ? Number(process.argv[thresholdArgIndex + 1])
    : DEFAULT_THRESHOLD;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Collect every leaf-key path from a nested object.
 * Example: { a: { b: "x" } } => ["a.b"]
 */
function collectKeyPaths(obj, prefix = '') {
  const paths = [];
  for (const key of Object.keys(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      paths.push(...collectKeyPaths(obj[key], fullPath));
    } else {
      paths.push(fullPath);
    }
  }
  return paths;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  // 1. Read master file
  if (!fs.existsSync(MASTER_FILE)) {
    console.error(`Master file not found: ${MASTER_FILE}`);
    process.exit(1);
  }

  const master = JSON.parse(fs.readFileSync(MASTER_FILE, 'utf-8'));
  const masterKeys = new Set(collectKeyPaths(master));
  const masterKeyCount = masterKeys.size;

  // 2. List locale files
  const localeFiles = fs
    .readdirSync(MESSAGES_DIR)
    .filter((f) => f.endsWith('.json') && f !== 'en.json')
    .sort();

  if (localeFiles.length === 0) {
    console.log('No locale files found to validate.');
    return;
  }

  // 3. Validate each locale
  const rows = [];
  let hasFailure = false;

  for (const file of localeFiles) {
    const filePath = path.join(MESSAGES_DIR, file);
    const locale = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const localeKeys = new Set(collectKeyPaths(locale));

    const missing = [...masterKeys].filter((k) => !localeKeys.has(k));
    const extra = [...localeKeys].filter((k) => !masterKeys.has(k));
    const presentCount = masterKeyCount - missing.length;
    const completion = masterKeyCount > 0 ? (presentCount / masterKeyCount) * 100 : 100;

    if (completion < THRESHOLD) {
      hasFailure = true;
    }

    rows.push({
      locale: file.replace('.json', ''),
      totalKeys: localeKeys.size,
      missing: missing.length,
      extra: extra.length,
      completion: completion.toFixed(1),
      belowThreshold: completion < THRESHOLD,
    });
  }

  // 4. Output table
  const COL = {
    locale: 12,
    total: 12,
    missing: 10,
    extra: 10,
    completion: 14,
  };

  console.log(`Master (en.json): ${masterKeyCount} keys`);
  console.log(`Completion threshold: ${THRESHOLD}%\n`);

  const header =
    'Locale'.padEnd(COL.locale) +
    'Total Keys'.padStart(COL.total) +
    'Missing'.padStart(COL.missing) +
    'Extra'.padStart(COL.extra) +
    'Completion %'.padStart(COL.completion);

  console.log(header);
  console.log('-'.repeat(header.length));

  for (const row of rows) {
    const flag = row.belowThreshold ? ' !' : '';
    const line =
      row.locale.padEnd(COL.locale) +
      String(row.totalKeys).padStart(COL.total) +
      String(row.missing).padStart(COL.missing) +
      String(row.extra).padStart(COL.extra) +
      (row.completion + '%').padStart(COL.completion) +
      flag;

    console.log(line);
  }

  console.log('-'.repeat(header.length));

  // Summary stats
  const totalMissing = rows.reduce((sum, r) => sum + r.missing, 0);
  const totalExtra = rows.reduce((sum, r) => sum + r.extra, 0);
  const avgCompletion =
    rows.reduce((sum, r) => sum + parseFloat(r.completion), 0) / rows.length;
  const failingLocales = rows.filter((r) => r.belowThreshold);

  console.log(`\nSummary:`);
  console.log(`  Locales checked:    ${rows.length}`);
  console.log(`  Total missing keys: ${totalMissing}`);
  console.log(`  Total extra keys:   ${totalExtra}`);
  console.log(`  Average completion: ${avgCompletion.toFixed(1)}%`);

  if (failingLocales.length > 0) {
    console.log(
      `\n${failingLocales.length} locale(s) below ${THRESHOLD}% threshold:`
    );
    for (const r of failingLocales) {
      console.log(`  - ${r.locale} (${r.completion}%)`);
    }
    console.log('');
    process.exit(1);
  } else {
    console.log(`\nAll locales meet the ${THRESHOLD}% completion threshold.`);
  }
}

main();
