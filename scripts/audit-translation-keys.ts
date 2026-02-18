#!/usr/bin/env tsx
/**
 * Translation Keys Audit Tool
 *
 * Scans budget components to identify:
 * 1. Hardcoded strings (English text not using translations)
 * 2. Missing translation keys (keys used but not in en-US.json)
 * 3. Unused translation keys (keys in en-US.json but never used)
 * 4. Coverage percentage per component
 *
 * Usage:
 *   npm run audit:translations
 *   npm run audit:translations -- --verbose
 *   npm run audit:translations -- --component BudgetNav.tsx
 */

import * as fs from "fs";
import * as path from "path";

// Paths
const BUDGET_COMPONENTS_DIR = path.join(__dirname, "../src/components/budget");
const SOURCE_FILE = path.join(__dirname, "../src/i18n/messages/en-US.json");

// CLI Options
interface CLIOptions {
  verbose: boolean;
  component?: string;
  showUnused: boolean;
}

// Audit results
interface ComponentAudit {
  file: string;
  usesTranslations: boolean;
  hardcodedStrings: HardcodedString[];
  missingKeys: string[];
  usedKeys: string[];
  coverage: number;
}

interface HardcodedString {
  line: number;
  match: string;
  context: string;
}

interface AuditReport {
  totalComponents: number;
  usingTranslations: number;
  totalHardcodedStrings: number;
  totalMissingKeys: number;
  totalUsedKeys: number;
  unusedKeys: string[];
  components: ComponentAudit[];
  summary: {
    averageCoverage: number;
    componentsNeedingMigration: number;
  };
}

/**
 * Main entry point
 */
async function main() {
  console.log("🔍 Translation Keys Audit Tool\n");

  // Parse CLI arguments
  const options = parseArgs(process.argv.slice(2));

  // Load source translation keys
  console.log("📖 Loading translation keys...");
  const sourceKeys = loadTranslationKeys(SOURCE_FILE);
  console.log(`   Found: ${sourceKeys.size} translation keys\n`);

  // Scan components
  console.log("🔎 Scanning components...");
  const components = scanComponents(BUDGET_COMPONENTS_DIR, options.component);
  console.log(`   Scanned: ${components.length} components\n`);

  // Audit each component
  console.log("📊 Auditing...");
  const audits: ComponentAudit[] = [];
  const allUsedKeys = new Set<string>();

  for (const component of components) {
    const audit = auditComponent(component, sourceKeys);
    audits.push(audit);

    // Track all used keys
    audit.usedKeys.forEach((key) => allUsedKeys.add(key));
  }

  // Find unused keys
  const unusedKeys = Array.from(sourceKeys).filter((key) => !allUsedKeys.has(key));

  // Generate report
  const report = generateReport(audits, unusedKeys);

  // Print report
  printReport(report, options);
}

/**
 * Parse command-line arguments
 */
function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {
    verbose: false,
    showUnused: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--verbose":
      case "-v":
        options.verbose = true;
        break;
      case "--show-unused":
        options.showUnused = true;
        break;
      case "--component":
      case "-c":
        if (i + 1 < args.length) {
          options.component = args[++i];
        }
        break;
    }
  }

  return options;
}

/**
 * Load translation keys from source file
 */
function loadTranslationKeys(filePath: string): Set<string> {
  const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const keys = new Set<string>();

  function traverse(obj: any, prefix: string = "") {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === "object" && !Array.isArray(value)) {
        traverse(value, fullKey);
      } else {
        keys.add(fullKey);
      }
    }
  }

  traverse(content);
  return keys;
}

/**
 * Scan components directory
 */
function scanComponents(dir: string, specificComponent?: string): string[] {
  const components: string[] = [];

  function scanDir(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
        // Skip test files, types, and non-component files
        if (
          entry.name.endsWith(".test.tsx") ||
          entry.name.endsWith(".d.ts") ||
          entry.name.endsWith(".types.ts")
        ) {
          continue;
        }

        // Filter by specific component if requested
        if (specificComponent && !entry.name.includes(specificComponent)) {
          continue;
        }

        components.push(fullPath);
      }
    }
  }

  scanDir(dir);
  return components;
}

/**
 * Audit a single component
 */
function auditComponent(filePath: string, sourceKeys: Set<string>): ComponentAudit {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  // Check if component uses translations
  const usesTranslations = content.includes("useTranslations(");

  // Find hardcoded strings using simple heuristics
  const hardcodedStrings: HardcodedString[] = findHardcodedStrings(lines);

  // Find used translation keys
  const usedKeys: string[] = findUsedKeys(content);

  // Find missing keys (used but not in source)
  const missingKeys = usedKeys.filter((key) => !sourceKeys.has(key));

  // Calculate coverage
  const totalStrings = hardcodedStrings.length + usedKeys.length;
  const coverage = totalStrings > 0 ? (usedKeys.length / totalStrings) * 100 : 100;

  return {
    file: path.relative(path.join(__dirname, ".."), filePath),
    usesTranslations,
    hardcodedStrings,
    missingKeys,
    usedKeys,
    coverage,
  };
}

/**
 * Find hardcoded English strings in code
 */
function findHardcodedStrings(lines: string[]): HardcodedString[] {
  const results: HardcodedString[] = [];

  lines.forEach((line, index) => {
    // Skip imports, comments, exports
    const trimmed = line.trim();
    if (
      trimmed.startsWith("import ") ||
      trimmed.startsWith("//") ||
      trimmed.startsWith("*") ||
      trimmed.startsWith("/*") ||
      trimmed.startsWith("export ")
    ) {
      return;
    }

    // Pattern 1: JSX text content between tags
    const jsxTextMatches = line.matchAll(/>\s*([A-Z][a-z]{2,}[^<]*?)\s*</g);
    for (const match of jsxTextMatches) {
      const text = match[1].trim();
      if (text.length >= 3 && !isCodeKeyword(text)) {
        results.push({
          line: index + 1,
          match: text,
          context: line.trim().substring(0, 80),
        });
      }
    }

    // Pattern 2: Common attributes with English text
    const attrPattern = /(title|placeholder|aria-label|alt)=["']([A-Z][^"']{2,})["']/g;
    const attrMatches = line.matchAll(attrPattern);
    for (const match of attrMatches) {
      const text = match[2];
      if (text.length >= 3 && !isCodeKeyword(text)) {
        results.push({
          line: index + 1,
          match: text,
          context: line.trim().substring(0, 80),
        });
      }
    }
  });

  return results;
}

/**
 * Find used translation keys in code
 */
function findUsedKeys(content: string): string[] {
  const keys: string[] = [];

  // Pattern: t('key') or t("key")
  const singleQuoteMatches = content.matchAll(/t\('([^']+)'\)/g);
  for (const match of singleQuoteMatches) {
    keys.push(match[1]);
  }

  const doubleQuoteMatches = content.matchAll(/t\("([^"]+)"\)/g);
  for (const match of doubleQuoteMatches) {
    keys.push(match[1]);
  }

  return keys;
}

/**
 * Check if text is a code keyword
 */
function isCodeKeyword(text: string): boolean {
  const keywords = [
    "className",
    "onClick",
    "onChange",
    "onSubmit",
    "useState",
    "useEffect",
    "return",
    "true",
    "false",
    "null",
    "undefined",
    "const",
    "let",
    "var",
  ];
  return keywords.includes(text);
}

/**
 * Generate audit report
 */
function generateReport(audits: ComponentAudit[], unusedKeys: string[]): AuditReport {
  const usingTranslations = audits.filter((a) => a.usesTranslations).length;
  const totalHardcodedStrings = audits.reduce((sum, a) => sum + a.hardcodedStrings.length, 0);
  const totalMissingKeys = audits.reduce((sum, a) => sum + a.missingKeys.length, 0);
  const totalUsedKeys = audits.reduce((sum, a) => sum + a.usedKeys.length, 0);

  const averageCoverage =
    audits.length > 0 ? audits.reduce((sum, a) => sum + a.coverage, 0) / audits.length : 0;

  const componentsNeedingMigration = audits.filter(
    (a) => !a.usesTranslations || a.hardcodedStrings.length > 0
  ).length;

  return {
    totalComponents: audits.length,
    usingTranslations,
    totalHardcodedStrings,
    totalMissingKeys,
    totalUsedKeys,
    unusedKeys,
    components: audits,
    summary: {
      averageCoverage,
      componentsNeedingMigration,
    },
  };
}

/**
 * Print audit report
 */
function printReport(report: AuditReport, options: CLIOptions) {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 Translation Audit Report");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Summary
  console.log("📈 Summary:");
  console.log(`   Total Components: ${report.totalComponents}`);
  console.log(
    `   Using Translations: ${report.usingTranslations} (${((report.usingTranslations / report.totalComponents) * 100).toFixed(1)}%)`
  );
  console.log(`   Average Coverage: ${report.summary.averageCoverage.toFixed(1)}%`);
  console.log(`   Components Needing Migration: ${report.summary.componentsNeedingMigration}`);
  console.log(`   Total Hardcoded Strings: ${report.totalHardcodedStrings}`);
  console.log(`   Total Used Keys: ${report.totalUsedKeys}`);
  console.log(`   Missing Keys: ${report.totalMissingKeys}`);
  console.log(`   Unused Keys: ${report.unusedKeys.length}\n`);

  // Components with most hardcoded strings
  const mostHardcoded = [...report.components]
    .filter((c) => c.hardcodedStrings.length > 0)
    .sort((a, b) => b.hardcodedStrings.length - a.hardcodedStrings.length)
    .slice(0, 10);

  if (mostHardcoded.length > 0) {
    console.log("🚨 Top Components with Hardcoded Strings:");
    mostHardcoded.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.file}`);
      console.log(
        `      Hardcoded: ${c.hardcodedStrings.length}, Coverage: ${c.coverage.toFixed(1)}%`
      );

      if (options.verbose && c.hardcodedStrings.length > 0) {
        console.log(`      Examples:`);
        c.hardcodedStrings.slice(0, 3).forEach((s) => {
          console.log(`         Line ${s.line}: "${s.match}"`);
        });
        if (c.hardcodedStrings.length > 3) {
          console.log(`         ... and ${c.hardcodedStrings.length - 3} more`);
        }
      }
      console.log();
    });
  }

  // Components not using translations
  const notUsingTranslations = report.components.filter((c) => !c.usesTranslations);

  if (notUsingTranslations.length > 0 && options.verbose) {
    console.log(`📋 Components Not Using Translations (${notUsingTranslations.length}):`);
    notUsingTranslations.slice(0, 10).forEach((c) => {
      console.log(`   - ${c.file} (${c.hardcodedStrings.length} hardcoded strings)`);
    });
    if (notUsingTranslations.length > 10) {
      console.log(`   ... and ${notUsingTranslations.length - 10} more`);
    }
    console.log();
  }

  // Missing keys
  if (report.totalMissingKeys > 0) {
    console.log(`⚠️  Missing Translation Keys (${report.totalMissingKeys}):`);
    const allMissingKeys = new Set<string>();
    report.components.forEach((c) => c.missingKeys.forEach((k) => allMissingKeys.add(k)));

    Array.from(allMissingKeys)
      .slice(0, 10)
      .forEach((key) => {
        console.log(`   - ${key}`);
      });

    if (allMissingKeys.size > 10) {
      console.log(`   ... and ${allMissingKeys.size - 10} more`);
    }
    console.log();
  }

  // Unused keys
  if (options.showUnused && report.unusedKeys.length > 0) {
    console.log(`🗑️  Unused Translation Keys (${report.unusedKeys.length}):`);
    report.unusedKeys.slice(0, 20).forEach((key) => {
      console.log(`   - ${key}`);
    });
    if (report.unusedKeys.length > 20) {
      console.log(`   ... and ${report.unusedKeys.length - 20} more`);
    }
    console.log();
  }

  // Recommendations
  console.log("💡 Recommendations:");
  if (report.summary.componentsNeedingMigration > 0) {
    console.log(
      `   1. Migrate ${report.summary.componentsNeedingMigration} components to use useTranslations()`
    );
  }
  if (report.totalMissingKeys > 0) {
    console.log(`   2. Add ${report.totalMissingKeys} missing keys to en-US.json`);
  }
  if (report.unusedKeys.length > 10) {
    console.log(`   3. Consider removing ${report.unusedKeys.length} unused keys`);
  }
  if (report.summary.averageCoverage < 90) {
    console.log(
      `   4. Target 90%+ coverage (currently ${report.summary.averageCoverage.toFixed(1)}%)`
    );
  }
  console.log();
}

// Run main function
main().catch((error) => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});
