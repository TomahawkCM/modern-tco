#!/usr/bin/env node
/**
 * i18n Validation Script
 * 3-Tier Testing Strategy for 113+ locales
 *
 * Tier 1: Full testing for 10 core locales
 * Tier 2: Spot checks for 25 regional locales
 * Tier 3: Automated validation for remaining locales
 */

const fs = require("fs");
const path = require("path");

// ============================================================================
// Configuration
// ============================================================================

const MESSAGES_DIR = path.join(__dirname, "../src/i18n/messages");

// Tier 1: Core locales - Full testing (100% key coverage verification)
const TIER_1_LOCALES = [
  "en-US", // English (Base)
  "es-MX", // Spanish (Americas)
  "fr-FR", // French
  "de-DE", // German
  "ja-JP", // Japanese
  "zh-CN", // Chinese Simplified
  "ar-SA", // Arabic (RTL)
  "he-IL", // Hebrew (RTL)
  "ru-RU", // Russian (Cyrillic)
  "hi-IN", // Hindi (Devanagari)
];

// Tier 2: Regional locales - Spot checks (key existence + sample content)
const TIER_2_LOCALES = [
  "en-GB",
  "en-AU",
  "en-CA",
  "en-IN", // English variants
  "es-ES",
  "es-AR",
  "es-CO", // Spanish variants
  "fr-CA",
  "fr-BE", // French variants
  "de-AT",
  "de-CH", // German variants
  "pt-BR",
  "pt-PT", // Portuguese
  "it-IT",
  "nl-NL",
  "pl-PL", // European
  "ko-KR",
  "zh-TW",
  "zh-HK", // East Asian
  "th-TH",
  "vi-VN",
  "id-ID", // Southeast Asian
  "tr-TR",
  "uk-UA",
  "cs-CZ", // Others
];

// RTL languages for directional testing
const RTL_LOCALES = ["ar-SA", "ar-AE", "he-IL", "fa-IR", "ur-PK"];

// ============================================================================
// Utility Functions
// ============================================================================

function getAllKeys(obj, prefix = "") {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function getValueByPath(obj, path) {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}

function loadLocale(locale) {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (e) {
    return { error: e.message };
  }
}

function getAllLocaleFiles() {
  return fs
    .readdirSync(MESSAGES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));
}

// ============================================================================
// Validation Functions
// ============================================================================

function validateKeyCompleteness(baseKeys, localeData, locale) {
  const localeKeys = getAllKeys(localeData);
  const missing = baseKeys.filter((k) => !localeKeys.includes(k));
  const extra = localeKeys.filter((k) => !baseKeys.includes(k));

  return {
    locale,
    totalExpected: baseKeys.length,
    totalFound: localeKeys.length,
    missing,
    extra,
    completeness: (((baseKeys.length - missing.length) / baseKeys.length) * 100).toFixed(2),
  };
}

function validatePlaceholders(baseData, localeData, locale) {
  const issues = [];
  const baseKeys = getAllKeys(baseData);

  for (const key of baseKeys) {
    const baseValue = getValueByPath(baseData, key);
    const localeValue = getValueByPath(localeData, key);

    if (typeof baseValue !== "string" || typeof localeValue !== "string") continue;

    // Check for ICU placeholders {variable}
    const basePlaceholders = baseValue.match(/\{[^}]+\}/g) || [];
    const localePlaceholders = localeValue.match(/\{[^}]+\}/g) || [];

    const basePlaceholderNames = basePlaceholders.map((p) => p.replace(/\{([^,}]+).*\}/, "$1"));
    const localePlaceholderNames = localePlaceholders.map((p) => p.replace(/\{([^,}]+).*\}/, "$1"));

    const missingPlaceholders = basePlaceholderNames.filter(
      (p) => !localePlaceholderNames.includes(p)
    );
    const extraPlaceholders = localePlaceholderNames.filter(
      (p) => !basePlaceholderNames.includes(p)
    );

    if (missingPlaceholders.length > 0 || extraPlaceholders.length > 0) {
      issues.push({
        key,
        basePlaceholders: basePlaceholderNames,
        localePlaceholders: localePlaceholderNames,
        missing: missingPlaceholders,
        extra: extraPlaceholders,
      });
    }
  }

  return { locale, issues };
}

function validateNoUntranslated(baseData, localeData, locale) {
  if (locale === "en-US" || locale === "en") return { locale, untranslated: [] };

  const untranslated = [];
  const baseKeys = getAllKeys(baseData);

  for (const key of baseKeys) {
    const baseValue = getValueByPath(baseData, key);
    const localeValue = getValueByPath(localeData, key);

    if (typeof baseValue === "string" && baseValue === localeValue) {
      // Check if it's likely meant to be the same (brand names, abbreviations, etc.)
      const isLikelyIntentional =
        /^[A-Z]{2,}$/.test(baseValue) || // Acronyms
        /^\$/.test(baseValue) || // Currency symbols
        /^\d+$/.test(baseValue) || // Numbers
        baseValue.length <= 2; // Very short strings

      if (!isLikelyIntentional) {
        untranslated.push({ key, value: baseValue });
      }
    }
  }

  return { locale, untranslated };
}

function validateJsonStructure(locale) {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);

  if (!fs.existsSync(filePath)) {
    return { locale, valid: false, error: "File not found" };
  }

  try {
    const content = fs.readFileSync(filePath, "utf8");
    JSON.parse(content);
    return { locale, valid: true, size: content.length };
  } catch (e) {
    return { locale, valid: false, error: e.message };
  }
}

// ============================================================================
// Test Runners
// ============================================================================

function runTier1Tests(baseData) {
  console.log("\n" + "=".repeat(70));
  console.log("TIER 1: Full Testing - Core Locales");
  console.log("=".repeat(70));

  const baseKeys = getAllKeys(baseData);
  console.log(`Base locale (en.json) has ${baseKeys.length} translation keys\n`);

  const results = {
    tier: 1,
    locales: [],
    summary: { passed: 0, failed: 0, warnings: 0 },
  };

  for (const locale of TIER_1_LOCALES) {
    console.log(`\n--- Testing ${locale} ---`);

    const localeData = loadLocale(locale);
    if (!localeData) {
      console.log(`  ❌ FAIL: Locale file not found`);
      results.locales.push({ locale, status: "FAIL", reason: "File not found" });
      results.summary.failed++;
      continue;
    }

    if (localeData.error) {
      console.log(`  ❌ FAIL: Invalid JSON - ${localeData.error}`);
      results.locales.push({ locale, status: "FAIL", reason: localeData.error });
      results.summary.failed++;
      continue;
    }

    // Test 1: Key completeness
    const completeness = validateKeyCompleteness(baseKeys, localeData, locale);
    console.log(`  Key Completeness: ${completeness.completeness}%`);
    if (completeness.missing.length > 0) {
      console.log(`    Missing keys: ${completeness.missing.length}`);
      if (completeness.missing.length <= 5) {
        completeness.missing.forEach((k) => console.log(`      - ${k}`));
      }
    }

    // Test 2: Placeholder consistency
    const placeholders = validatePlaceholders(baseData, localeData, locale);
    console.log(`  Placeholder Issues: ${placeholders.issues.length}`);
    if (placeholders.issues.length > 0 && placeholders.issues.length <= 3) {
      placeholders.issues.forEach((i) =>
        console.log(`    - ${i.key}: missing {${i.missing.join(", ")}}`)
      );
    }

    // Test 3: Untranslated strings
    const untranslated = validateNoUntranslated(baseData, localeData, locale);
    console.log(`  Potentially Untranslated: ${untranslated.untranslated.length}`);

    // Determine status
    let status = "PASS";
    if (completeness.missing.length > 0 || placeholders.issues.length > 5) {
      status = "FAIL";
      results.summary.failed++;
    } else if (placeholders.issues.length > 0 || untranslated.untranslated.length > 10) {
      status = "WARN";
      results.summary.warnings++;
    } else {
      results.summary.passed++;
    }

    console.log(
      `  Status: ${status === "PASS" ? "✅" : status === "WARN" ? "⚠️" : "❌"} ${status}`
    );

    results.locales.push({
      locale,
      status,
      completeness: completeness.completeness,
      missingKeys: completeness.missing.length,
      placeholderIssues: placeholders.issues.length,
      untranslatedCount: untranslated.untranslated.length,
    });
  }

  return results;
}

function runTier2Tests(baseData) {
  console.log("\n" + "=".repeat(70));
  console.log("TIER 2: Spot Checks - Regional Locales");
  console.log("=".repeat(70));

  const baseKeys = getAllKeys(baseData);
  const results = {
    tier: 2,
    locales: [],
    summary: { passed: 0, failed: 0, warnings: 0 },
  };

  for (const locale of TIER_2_LOCALES) {
    const localeData = loadLocale(locale);

    if (!localeData) {
      results.locales.push({ locale, status: "FAIL", reason: "File not found" });
      results.summary.failed++;
      continue;
    }

    if (localeData.error) {
      results.locales.push({ locale, status: "FAIL", reason: localeData.error });
      results.summary.failed++;
      continue;
    }

    const completeness = validateKeyCompleteness(baseKeys, localeData, locale);
    const placeholders = validatePlaceholders(baseData, localeData, locale);

    let status = "PASS";
    if (parseFloat(completeness.completeness) < 95) {
      status = "FAIL";
      results.summary.failed++;
    } else if (placeholders.issues.length > 3) {
      status = "WARN";
      results.summary.warnings++;
    } else {
      results.summary.passed++;
    }

    results.locales.push({
      locale,
      status,
      completeness: completeness.completeness,
      missingKeys: completeness.missing.length,
    });
  }

  console.log("\nResults:");
  for (const result of results.locales) {
    const icon = result.status === "PASS" ? "✅" : result.status === "WARN" ? "⚠️" : "❌";
    console.log(`  ${icon} ${result.locale}: ${result.completeness}% complete`);
  }

  return results;
}

function runTier3Tests(baseData) {
  console.log("\n" + "=".repeat(70));
  console.log("TIER 3: Automated Validation - All Remaining Locales");
  console.log("=".repeat(70));

  const allLocales = getAllLocaleFiles();
  const tier1And2 = [...TIER_1_LOCALES, ...TIER_2_LOCALES];
  const tier3Locales = allLocales.filter((l) => !tier1And2.includes(l) && l !== "en");

  console.log(`Testing ${tier3Locales.length} remaining locales...\n`);

  const baseKeys = getAllKeys(baseData);
  const results = {
    tier: 3,
    locales: [],
    summary: { passed: 0, failed: 0, warnings: 0 },
  };

  for (const locale of tier3Locales) {
    const structureResult = validateJsonStructure(locale);

    if (!structureResult.valid) {
      results.locales.push({ locale, status: "FAIL", reason: structureResult.error });
      results.summary.failed++;
      continue;
    }

    const localeData = loadLocale(locale);
    const completeness = validateKeyCompleteness(baseKeys, localeData, locale);

    let status = "PASS";
    if (parseFloat(completeness.completeness) < 90) {
      status = "FAIL";
      results.summary.failed++;
    } else if (parseFloat(completeness.completeness) < 100) {
      status = "WARN";
      results.summary.warnings++;
    } else {
      results.summary.passed++;
    }

    results.locales.push({
      locale,
      status,
      completeness: completeness.completeness,
    });
  }

  // Print summary
  const failedLocales = results.locales.filter((l) => l.status === "FAIL");
  const warnLocales = results.locales.filter((l) => l.status === "WARN");

  if (failedLocales.length > 0) {
    console.log("Failed locales:");
    failedLocales.forEach((l) => console.log(`  ❌ ${l.locale}: ${l.completeness || l.reason}`));
  }

  if (warnLocales.length > 0) {
    console.log("\nWarning locales (< 100% complete):");
    warnLocales.slice(0, 10).forEach((l) => console.log(`  ⚠️ ${l.locale}: ${l.completeness}%`));
    if (warnLocales.length > 10) {
      console.log(`  ... and ${warnLocales.length - 10} more`);
    }
  }

  console.log(`\n✅ Passed: ${results.summary.passed}`);
  console.log(`⚠️ Warnings: ${results.summary.warnings}`);
  console.log(`❌ Failed: ${results.summary.failed}`);

  return results;
}

// ============================================================================
// Main
// ============================================================================

function main() {
  console.log("╔══════════════════════════════════════════════════════════════════════╗");
  console.log("║          i18n Validation - 3-Tier Testing Strategy                   ║");
  console.log("╚══════════════════════════════════════════════════════════════════════╝");

  // Load base locale (en.json as source of truth)
  const baseData = loadLocale("en");
  if (!baseData) {
    console.error("ERROR: Could not load base locale (en.json)");
    process.exit(1);
  }

  const baseKeys = getAllKeys(baseData);
  console.log(`\nBase locale: en.json`);
  console.log(`Total translation keys: ${baseKeys.length}`);
  console.log(`Total locale files: ${getAllLocaleFiles().length}`);

  // Run all tiers
  const tier1Results = runTier1Tests(baseData);
  const tier2Results = runTier2Tests(baseData);
  const tier3Results = runTier3Tests(baseData);

  // Final Summary
  console.log("\n" + "=".repeat(70));
  console.log("FINAL SUMMARY");
  console.log("=".repeat(70));

  const totalPassed =
    tier1Results.summary.passed + tier2Results.summary.passed + tier3Results.summary.passed;
  const totalWarnings =
    tier1Results.summary.warnings + tier2Results.summary.warnings + tier3Results.summary.warnings;
  const totalFailed =
    tier1Results.summary.failed + tier2Results.summary.failed + tier3Results.summary.failed;

  console.log(`\nTier 1 (Core): ${tier1Results.summary.passed}/${TIER_1_LOCALES.length} passed`);
  console.log(`Tier 2 (Regional): ${tier2Results.summary.passed}/${TIER_2_LOCALES.length} passed`);
  console.log(
    `Tier 3 (Automated): ${tier3Results.summary.passed}/${tier3Results.locales.length} passed`
  );

  console.log(
    `\nOverall: ✅ ${totalPassed} passed, ⚠️ ${totalWarnings} warnings, ❌ ${totalFailed} failed`
  );

  // Write results to JSON file
  const report = {
    timestamp: new Date().toISOString(),
    baseKeyCount: baseKeys.length,
    totalLocales: getAllLocaleFiles().length,
    tier1: tier1Results,
    tier2: tier2Results,
    tier3: tier3Results,
    summary: { passed: totalPassed, warnings: totalWarnings, failed: totalFailed },
  };

  const reportPath = path.join(__dirname, "../i18n-validation-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport saved to: ${reportPath}`);

  // Exit with error code if any tier 1 tests failed
  if (tier1Results.summary.failed > 0) {
    process.exit(1);
  }
}

main();
