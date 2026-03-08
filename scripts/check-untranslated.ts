#!/usr/bin/env tsx

/**
 * check-untranslated.ts
 *
 * Reports translation status per locale by comparing values against en.json.
 * A key is "untranslated" if its value exactly matches the English value.
 *
 * Usage:
 *   npx tsx scripts/check-untranslated.ts              # All locales summary
 *   npx tsx scripts/check-untranslated.ts es-ES fr-FR   # Specific locales
 *   npx tsx scripts/check-untranslated.ts --verbose     # Include key lists
 *   npx tsx scripts/check-untranslated.ts --keys es-ES  # Keys for one locale
 */

import * as fs from "fs";
import * as path from "path";

const MESSAGES_DIR = path.resolve(__dirname, "..", "src", "i18n", "messages");
const MASTER_FILE = path.join(MESSAGES_DIR, "en.json");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Flatten nested object into dot-notation keys with their values.
 * Example: { nav: { dashboard: "Dashboard" } } => { "nav.dashboard": "Dashboard" }
 */
function flattenKeys(obj: Record<string, unknown>, prefix: string = ""): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenKeys(value as Record<string, unknown>, fullKey));
    } else {
      result[fullKey] = String(value);
    }
  }

  return result;
}

interface LocaleStatus {
  locale: string;
  total: number;
  translated: number;
  untranslated: number;
  coverage: number;
  untranslatedKeys: string[];
}

function analyzeLocale(
  enFlat: Record<string, string>,
  localeFilePath: string,
  localeName: string
): LocaleStatus {
  const localeData = JSON.parse(fs.readFileSync(localeFilePath, "utf-8"));
  const localeFlat = flattenKeys(localeData);

  const total = Object.keys(enFlat).length;
  const untranslatedKeys: string[] = [];

  for (const [key, enValue] of Object.entries(enFlat)) {
    const localeValue = localeFlat[key];
    // Untranslated if: missing, or value exactly matches English
    if (localeValue === undefined || localeValue === enValue) {
      untranslatedKeys.push(key);
    }
  }

  const untranslated = untranslatedKeys.length;
  const translated = total - untranslated;
  const coverage = total > 0 ? (translated / total) * 100 : 100;

  return {
    locale: localeName,
    total,
    translated,
    untranslated,
    coverage,
    untranslatedKeys,
  };
}

// ---------------------------------------------------------------------------
// CLI Argument Parsing
// ---------------------------------------------------------------------------

function parseArgs(): {
  locales: string[];
  verbose: boolean;
  keysFor: string | null;
} {
  const args = process.argv.slice(2);
  let verbose = false;
  let keysFor: string | null = null;
  const locales: string[] = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--verbose") {
      verbose = true;
    } else if (args[i] === "--keys") {
      keysFor = args[i + 1] || null;
      i++;
    } else if (!args[i].startsWith("--")) {
      locales.push(args[i]);
    }
  }

  return { locales, verbose, keysFor };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const { locales: requestedLocales, verbose, keysFor } = parseArgs();

  // Read master file
  if (!fs.existsSync(MASTER_FILE)) {
    console.error(`Master file not found: ${MASTER_FILE}`);
    process.exit(1);
  }

  const enData = JSON.parse(fs.readFileSync(MASTER_FILE, "utf-8"));
  const enFlat = flattenKeys(enData);
  const totalKeys = Object.keys(enFlat).length;

  // Discover locale files
  const allLocaleFiles = fs
    .readdirSync(MESSAGES_DIR)
    .filter((f) => f.endsWith(".json") && f !== "en.json")
    .sort();

  // Filter to requested locales if specified
  const targetFiles =
    requestedLocales.length > 0
      ? allLocaleFiles.filter((f) => requestedLocales.includes(f.replace(".json", "")))
      : allLocaleFiles;

  if (targetFiles.length === 0) {
    console.error("No matching locale files found.");
    process.exit(1);
  }

  // --keys mode: show untranslated keys for a single locale
  if (keysFor) {
    const file = `${keysFor}.json`;
    const filePath = path.join(MESSAGES_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.error(`Locale file not found: ${file}`);
      process.exit(1);
    }
    const status = analyzeLocale(enFlat, filePath, keysFor);
    console.log(`Untranslated keys for ${keysFor} (${status.untranslated}/${status.total}):\n`);
    for (const key of status.untranslatedKeys) {
      console.log(`  ${key}`);
    }
    return;
  }

  // Analyze all target locales
  const results: LocaleStatus[] = [];
  for (const file of targetFiles) {
    const localeName = file.replace(".json", "");
    const filePath = path.join(MESSAGES_DIR, file);
    results.push(analyzeLocale(enFlat, filePath, localeName));
  }

  // Sort by coverage ascending (worst first)
  results.sort((a, b) => a.coverage - b.coverage);

  // Print report
  console.log("Translation Status Report");
  console.log("========================");
  console.log(`Source: en.json (${totalKeys} keys)\n`);

  const COL = { locale: 14, total: 8, translated: 12, untranslated: 14, coverage: 10 };
  const header =
    "Locale".padEnd(COL.locale) +
    "Total".padStart(COL.total) +
    "Translated".padStart(COL.translated) +
    "Untranslated".padStart(COL.untranslated) +
    "Coverage".padStart(COL.coverage);

  console.log(header);
  console.log("-".repeat(header.length));

  for (const r of results) {
    const line =
      r.locale.padEnd(COL.locale) +
      String(r.total).padStart(COL.total) +
      String(r.translated).padStart(COL.translated) +
      String(r.untranslated).padStart(COL.untranslated) +
      `${r.coverage.toFixed(1)}%`.padStart(COL.coverage);
    console.log(line);

    if (verbose && r.untranslatedKeys.length > 0) {
      const preview = r.untranslatedKeys.slice(0, 10);
      for (const key of preview) {
        console.log(`    - ${key}`);
      }
      if (r.untranslatedKeys.length > 10) {
        console.log(`    ... and ${r.untranslatedKeys.length - 10} more`);
      }
    }
  }

  console.log("-".repeat(header.length));

  // Summary
  const totalTranslated = results.reduce((sum, r) => sum + r.translated, 0);
  const totalUntranslated = results.reduce((sum, r) => sum + r.untranslated, 0);
  const avgCoverage = results.reduce((sum, r) => sum + r.coverage, 0) / results.length;
  const fullyTranslated = results.filter((r) => r.coverage === 100).length;

  console.log(`\nSummary:`);
  console.log(`  Locales checked:      ${results.length}`);
  console.log(`  Fully translated:     ${fullyTranslated}`);
  console.log(`  Total translated:     ${totalTranslated}`);
  console.log(`  Total untranslated:   ${totalUntranslated}`);
  console.log(`  Average coverage:     ${avgCoverage.toFixed(1)}%`);
  console.log(`\nRun with --verbose to see untranslated key paths`);
  console.log(`Run with --keys <locale> to list untranslated keys for a specific locale`);
}

main();
