#!/usr/bin/env tsx

/* eslint-disable no-console */

/**
 * check-untranslated.ts
 *
 * Reports translation status per locale by comparing values against en.json.
 * A key is "untranslated" if its value exactly matches the English value.
 *
 * Usage:
 *   npx tsx scripts/check-untranslated.ts              # All locales summary (exits 1 if failures)
 *   npx tsx scripts/check-untranslated.ts --no-fail    # Informational only (always exits 0)
 *   npx tsx scripts/check-untranslated.ts es-ES fr-FR   # Specific locales
 *   npx tsx scripts/check-untranslated.ts --verbose     # Include key lists
 *   npx tsx scripts/check-untranslated.ts --keys es-ES  # Keys for one locale
 */

import * as fs from "fs";
import * as path from "path";

import type { SupportedLocale } from "../src/i18n/config";
import { isSharedEnglishLocale } from "../src/i18n/locale-message-plan";
import { readEffectiveLocaleMessages } from "./lib/effective-locale-messages";

const MESSAGES_DIR = path.resolve(__dirname, "..", "src", "i18n", "messages");
const MASTER_FILE = path.join(MESSAGES_DIR, "en.json");

// ---------------------------------------------------------------------------
// Keys that are legitimately identical to English in all locales
// (brand names, URLs, formulas, number placeholders, internal notes)
// ---------------------------------------------------------------------------

const EXCLUDED_KEY_PATTERNS: RegExp[] = [
  /\.href$/, // URL paths — always identical
  /\._note$/, // Internal documentation notes
  /calculators\.\w+\.formulaText$/, // Mathematical formulas
  /calculators\.\w+\.formulaExplanation$/, // Formula variable explanations
];

const EXCLUDED_KEY_VALUES = new Set([
  // Brand names / proper nouns
  "Netflix",
  "Spotify",
  "Venmo",
  "PayPal",
  "BudgetPro",
  "OCR",
  "API",
  "FAQ",
  "Emoji",
  "Google Calendar",
  "Outlook Calendar",
  "SimpleFIN",
  // Number / format placeholders
  "0.00",
  "100",
  "50.00",
  "192.168.1.100",
  "+12.5%",
  "-5.2%",
  "85%",
  "you@example.com",
  "$",
  "Cmd+Shift+P",
  // Format-only strings (only interpolation variables, no translatable words)
  "© {year} {brandName}",
  "{date}",
  "{size} KB",
  "SimpleFIN: {status}",
  "{title}. {body}",
  // Mathematical formulas (also caught by pattern, but kept for safety)
  "FV = PV(1+r/n)^(nt) + PMT[((1+r/n)^(nt)-1)/(r/n)]",
  "M = P[i(1+i)^n] / [(1+i)^n - 1]",
  "Real Value = Nominal Value / (1 + inflation)^years",
  "Accumulation: FV = PV(1+r)^n + PMT[((1+r)^n-1)/r] | Withdrawal: Balance_n = Balance_(n-1)(1+r) - W",
  "Monthly return = Normal(μ/12, σ/√12); Balance_t = Balance_(t-1) × (1 + r_t) + C - W",
  // File format names / demo data
  "Budget.yfull / Budget.ynab4",
  "N/A",
  "Tech Solutions Inc.",
  // Financial abbreviations / currency codes
  "APR (%)",
  "APR %",
  "EUR - Euro",
  // Payment service brand names
  "E-Transfer",
  // International cognates — identical in French, Spanish, Portuguese, Italian, German, etc.
  // For non-cognate languages (CJK, Arabic, etc.) these are already translated to different values
  // so the exclusion has no effect.
  "Transactions",
  "transactions",
  "Transaction",
  "transaction",
  "Budget",
  "Budgets",
  "budgets",
  "Total",
  "total",
  "Total:",
  "Description",
  "Date",
  "Date *",
  "Actions",
  "Action",
  "Notes",
  "Type",
  "Score",
  "Version",
  "Options",
  "Option 1",
  "Option 2",
  "Format",
  "Notifications",
  "notifications",
  "Net",
  "Min",
  "Max",
  "Institution",
  "Port",
  "Points",
  "points",
  "Badges",
  "badges",
  "Focus",
  "Solution",
  "Normal",
  "Important",
  "Suggestions",
  "Occurrences",
  "PRODUCTION",
  "Shopping",
  "Avalanche",
  "Hindi",
  // Common short labels
  "Auto",
  "Status",
  "Filter",
  "Filter:",
  "via",
  "admin",
  "Trend",
  "Debit",
  "Credit",
  "Offline",
  "Online",
  "Hover",
  "Extra",
  "LAN Sync",
  // Longer cognates common across European languages
  "Documentation",
  "System",
  "Import",
  "Export",
  "SimpleFIN Bridge Dashboard",
  "SimpleFIN Protocol Documentation",
  // More cognates found across multiple locales
  "Symbol",
  "Symbol: {symbol}",
  "Email",
  "Data",
  "Database",
  "Cost",
  "Period",
  "Live",
  "Mild",
  "Zero Knowledge",
  "Send",
  "Hint: {hint}",
  // Demo currency amounts (locale-specific formatting not required in demo)
  "-$124.50",
  "+$4,250.00",
  "-$15.99",
  "$24,500.00",
  "$1,250.00",
  // Short duration format
  "{years}y {months}m",
  "Password",
  "Home",
  "Host",
  "Privacy:",
  // Additional cognates identical in Romance languages
  "Manual",
  "Irregular",
  "Experimental",
  "Principal",
  "Principal:",
  "Legal",
  // Brand names with modifiers
  "BudgetPro Local",
  "BudgetPro Sync (Pro)",
  // Format strings with cognates/interpolation only
  "Total: {value}.",
  "Original: {amount}",
  "Plan: {name}",
  // Cognates identical in Spanish, Portuguese, Italian, and many other languages
  "Error",
  "No",
  "General",
  "Color",
  "Manual",
  "Irregular",
  "Experimental",
  "Actor",
  "Formula",
  "Principal",
  "Principal:",
  "Budget App",
  // ICU plurals using only cognate words (transaction/page are identical in French, etc.)
  "{count} {count, plural, =1 {transaction} other {transactions}}",
  "{count, plural, one {# transaction} other {# transactions}}",
  "{count, plural, one {1 transaction} other {# transactions}}",
  "({count} transactions)",
  "{count} pages",
  "Transactions (CSV)",
]);

function isExcludedKey(key: string, enValue: string): boolean {
  if (EXCLUDED_KEY_PATTERNS.some((p) => p.test(key))) return true;
  if (EXCLUDED_KEY_VALUES.has(enValue)) return true;
  return false;
}

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
  localeData: Record<string, unknown>,
  localeName: string
): LocaleStatus {
  const localeFlat = flattenKeys(localeData);

  const total = Object.keys(enFlat).length;
  const untranslatedKeys: string[] = [];

  for (const [key, enValue] of Object.entries(enFlat)) {
    const hasLocaleValue = Object.prototype.hasOwnProperty.call(localeFlat, key);
    const localeValue = localeFlat[key];
    // Untranslated if: missing, or value exactly matches English
    // (but skip keys that are legitimately identical across all locales)
    if (!hasLocaleValue || localeValue === enValue) {
      if (!isExcludedKey(key, enValue)) {
        untranslatedKeys.push(key);
      }
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
  noFail: boolean;
} {
  const args = process.argv.slice(2);
  let verbose = false;
  let noFail = false;
  let keysFor: string | null = null;
  const locales: string[] = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--verbose") {
      verbose = true;
    } else if (args[i] === "--no-fail") {
      noFail = true;
    } else if (args[i] === "--keys") {
      keysFor = args[i + 1] || null;
      i++;
    } else if (!args[i].startsWith("--")) {
      locales.push(args[i]);
    }
  }

  return { locales, verbose, keysFor, noFail };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const { locales: requestedLocales, verbose, keysFor, noFail } = parseArgs();

  // Read master file
  if (!fs.existsSync(MASTER_FILE)) {
    console.error(`Master file not found: ${MASTER_FILE}`);
    process.exit(1);
  }

  const enData = JSON.parse(fs.readFileSync(MASTER_FILE, "utf-8")) as Record<string, unknown>;
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
    const status = analyzeLocale(
      enFlat,
      readEffectiveLocaleMessages(keysFor as SupportedLocale),
      keysFor
    );
    console.log(`Untranslated keys for ${keysFor} (${status.untranslated}/${status.total}):\n`);
    for (const key of status.untranslatedKeys) {
      console.log(`  ${key}`);
    }
    return;
  }

  // Analyze all target locales
  const results: LocaleStatus[] = [];
  for (const file of targetFiles) {
    const localeName = file.replace(".json", "") as SupportedLocale;

    // shared-en locales (en-AU, en-CA, etc.) intentionally use en.json —
    // report them as 100% translated rather than counting every key as untranslated
    if (isSharedEnglishLocale(localeName)) {
      results.push({
        locale: localeName,
        total: totalKeys,
        translated: totalKeys,
        untranslated: 0,
        coverage: 100,
        untranslatedKeys: [],
      });
      continue;
    }

    results.push(analyzeLocale(enFlat, readEffectiveLocaleMessages(localeName), localeName));
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

  // Exit gate: fail if any non-en-* locale has >500 untranslated values
  const UNTRANSLATED_THRESHOLD = 500;
  const FRAGILE_THRESHOLD = 430;

  const failingLocales = results.filter(
    (r) => !r.locale.startsWith("en-") && r.untranslated > UNTRANSLATED_THRESHOLD
  );

  const fragileLocales = results.filter(
    (r) =>
      !r.locale.startsWith("en-") &&
      r.untranslated > FRAGILE_THRESHOLD &&
      r.untranslated <= UNTRANSLATED_THRESHOLD
  );

  // Print gate result
  if (failingLocales.length > 0) {
    console.log(
      `\n❌ QUALITY GATE FAILED: ${failingLocales.length} locale(s) have >${UNTRANSLATED_THRESHOLD} untranslated values:`
    );
    for (const r of failingLocales) {
      console.log(
        `   ${r.locale}: ${r.untranslated} untranslated (${r.coverage.toFixed(1)}% coverage)`
      );
    }
  } else {
    console.log(
      `\n✅ Quality gate passed: all non-en-* locales have ≤${UNTRANSLATED_THRESHOLD} untranslated values`
    );
  }

  // Print fragile passes (always, regardless of gate result)
  if (fragileLocales.length > 0) {
    console.log(
      `\n⚠️  FRAGILE PASSES: ${fragileLocales.length} locale(s) pass but are near the threshold (>${FRAGILE_THRESHOLD} untranslated):`
    );
    for (const r of fragileLocales) {
      const headroom = UNTRANSLATED_THRESHOLD - r.untranslated;
      console.log(
        `   ${r.locale}: ${r.untranslated} untranslated (${r.coverage.toFixed(1)}% coverage, ${headroom} keys of headroom)`
      );
    }
    console.log(
      `   These locales may fail if en.json grows. Consider translating more keys for stability.`
    );
  }

  // Exit with correct code (after all reporting is printed)
  if (failingLocales.length > 0) {
    if (noFail) {
      console.log(`\n⚠️  --no-fail flag set, exiting 0 (informational only)`);
    } else {
      console.log(`\nUse --no-fail for informational mode (exit 0 regardless)`);
      process.exit(1);
    }
  }
}

main();
