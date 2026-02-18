#!/usr/bin/env node

/**
 * sync-translations.js
 *
 * Synchronises all locale files with the master en.json.
 * - Adds missing keys using the English value as a placeholder.
 * - Never overwrites existing translations.
 * - Sorts every locale file so its key order matches en.json exactly.
 *
 * Usage:
 *   node scripts/sync-translations.js
 */

const fs = require('fs');
const path = require('path');

const MESSAGES_DIR = path.resolve(__dirname, '..', 'src', 'i18n', 'messages');
const MASTER_FILE = path.join(MESSAGES_DIR, 'en.json');

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

/**
 * Get a nested value by dot-separated key path.
 */
function getNestedValue(obj, keyPath) {
  const parts = keyPath.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return undefined;
    }
    current = current[part];
  }
  return current;
}

/**
 * Set a nested value by dot-separated key path, creating intermediate objects
 * as needed.
 */
function setNestedValue(obj, keyPath, value) {
  const parts = keyPath.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== 'object' || current[part] === null) {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

/**
 * Deeply merge missing keys from the master into target.
 * Returns the count of keys that were added.
 */
function deepMergeMissing(master, target) {
  const masterPaths = collectKeyPaths(master);
  let addedCount = 0;

  for (const keyPath of masterPaths) {
    const existingValue = getNestedValue(target, keyPath);
    if (existingValue === undefined) {
      const masterValue = getNestedValue(master, keyPath);
      setNestedValue(target, keyPath, masterValue);
      addedCount++;
    }
  }

  return addedCount;
}

/**
 * Rebuild an object so its keys (at every level) follow the same order as the
 * master object.  Keys present in target but absent from master are appended
 * at the end (sorted alphabetically among themselves).
 */
function sortToMatchMaster(master, target) {
  if (typeof master !== 'object' || master === null || Array.isArray(master)) {
    return target;
  }
  if (typeof target !== 'object' || target === null || Array.isArray(target)) {
    return target;
  }

  const result = {};

  // First, iterate master keys in order — this gives us the canonical ordering.
  for (const key of Object.keys(master)) {
    if (key in target) {
      result[key] = sortToMatchMaster(master[key], target[key]);
    }
  }

  // Then, append any extra keys that exist only in the target (alphabetical).
  const extraKeys = Object.keys(target)
    .filter((k) => !(k in master))
    .sort();
  for (const key of extraKeys) {
    result[key] = target[key];
  }

  return result;
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
  const masterKeyCount = collectKeyPaths(master).length;

  console.log(`Master (en.json): ${masterKeyCount} keys\n`);

  // 2. List all locale files
  const localeFiles = fs
    .readdirSync(MESSAGES_DIR)
    .filter((f) => f.endsWith('.json') && f !== 'en.json')
    .sort();

  if (localeFiles.length === 0) {
    console.log('No locale files found to sync.');
    return;
  }

  // 3. Process each locale
  const summary = [];

  for (const file of localeFiles) {
    const filePath = path.join(MESSAGES_DIR, file);
    const locale = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Merge missing keys
    const addedCount = deepMergeMissing(master, locale);

    // Sort keys to match master order
    const sorted = sortToMatchMaster(master, locale);

    // Write back
    fs.writeFileSync(filePath, JSON.stringify(sorted, null, 2) + '\n', 'utf-8');

    summary.push({ file, addedCount });
  }

  // 4. Output summary
  console.log('Sync complete!\n');
  console.log('Locale'.padEnd(20) + 'Keys Added');
  console.log('-'.repeat(35));

  let totalAdded = 0;
  for (const { file, addedCount } of summary) {
    const label = addedCount > 0 ? String(addedCount) : '0 (up to date)';
    console.log(file.padEnd(20) + label);
    totalAdded += addedCount;
  }

  console.log('-'.repeat(35));
  console.log(
    `Total: ${totalAdded} keys added across ${summary.length} locale files`
  );
}

main();
