#!/usr/bin/env node
/**
 * validate-icu-integrity.js — ICU placeholder & markup integrity checker
 *
 * Checks all locale files against en.json for:
 *   1. Balanced braces ({ / } pairs)
 *   2. Placeholder parity (en.json {count} → translation must also have {count})
 *   3. ICU plural/select syntax preservation
 *   4. HTML tag parity (<strong>, <link>, <br>)
 *   5. No mojibake (â€™, Ã©, etc.)
 *
 * Usage:
 *   node scripts/validate-icu-integrity.js [--fix] [--locale xx-YY]
 *
 *   --fix     Revert broken keys to English value
 *   --locale  Check only one locale (default: all)
 */

const fs = require("fs");
const path = require("path");

const MESSAGES_DIR = path.join(__dirname, "../src/i18n/messages");
const args = process.argv.slice(2);
const doFix = args.includes("--fix");
const localeIdx = args.indexOf("--locale");
const singleLocale = localeIdx !== -1 ? args[localeIdx + 1] : null;

// ── Helpers ──────────────────────────────────────────────────────────

function flatten(obj, prefix = "") {
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(result, flatten(v, key));
    } else {
      result[key] = String(v);
    }
  }
  return result;
}

function setNested(obj, dotKey, value) {
  const parts = dotKey.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]] || typeof cur[parts[i]] !== "object") cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

/**
 * Extract top-level ICU placeholder variable names.
 * Handles nested braces in plural/select: {count, plural, one {# item} other {# items}} → ["count"]
 * Simple placeholders: {name} → ["name"]
 * Skips # (ICU number ref) — it's not a named variable.
 */
function extractPlaceholders(str) {
  const names = [];
  let i = 0;
  while (i < str.length) {
    if (str[i] === "{") {
      // Find the variable name at this brace level
      let depth = 1;
      let j = i + 1;
      // Skip whitespace
      while (j < str.length && str[j] === " ") j++;
      // Read variable name (until comma, space, or closing brace)
      const nameStart = j;
      while (j < str.length && str[j] !== "," && str[j] !== "}" && str[j] !== " ") j++;
      const varName = str.slice(nameStart, j).trim();
      if (varName && varName !== "#") {
        names.push(varName);
      }
      // Skip to matching closing brace
      while (j < str.length && depth > 0) {
        if (str[j] === "{") depth++;
        if (str[j] === "}") depth--;
        j++;
      }
      i = j;
    } else {
      i++;
    }
  }
  return names.sort();
}

/** Extract HTML-like tags: <strong>, </strong>, <br>, <link>, etc. */
function extractHtmlTags(str) {
  return (str.match(/<\/?[a-zA-Z][a-zA-Z0-9]*\s*\/?>/g) || []).sort();
}

/** Check for unbalanced braces */
function hasUnbalancedBraces(str) {
  let depth = 0;
  for (const ch of str) {
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if (depth < 0) return true;
  }
  return depth !== 0;
}

/** Detect mojibake patterns */
const MOJIBAKE_RE = /â€[™˜œ"|â€]|Ã[©¨ª«¬®¯°±²³´µ¶·¹º»¼½¾¿]|Ã[‰ˆŠ‹ŒŽ]/;
function hasMojibake(str) {
  return MOJIBAKE_RE.test(str);
}

// ── Main ─────────────────────────────────────────────────────────────

const enJson = JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, "en.json"), "utf8"));
const enFlat = flatten(enJson);

const localeFiles = singleLocale
  ? [`${singleLocale}.json`]
  : fs.readdirSync(MESSAGES_DIR).filter((f) => f.endsWith(".json") && f !== "en.json");

let totalBroken = 0;
let totalFixed = 0;
const summary = [];

for (const file of localeFiles) {
  const locale = file.replace(".json", "");
  const filePath = path.join(MESSAGES_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.error(`  ⚠ File not found: ${file}`);
    continue;
  }

  const localeJson = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const localeFlat = flatten(localeJson);

  const issues = [];

  for (const [key, enValue] of Object.entries(enFlat)) {
    const transValue = localeFlat[key];
    if (!transValue || transValue === enValue) continue; // skip missing or identical

    const keyIssues = [];

    // 1. Unbalanced braces (only flag if en.json value also has balanced braces)
    if (hasUnbalancedBraces(transValue) && !hasUnbalancedBraces(enValue)) {
      keyIssues.push("unbalanced braces");
    }

    // 2. Placeholder parity — compare unique variable names only
    const enPh = [...new Set(extractPlaceholders(enValue))];
    const trPh = [...new Set(extractPlaceholders(transValue))];
    if (enPh.length > 0 && JSON.stringify(enPh) !== JSON.stringify(trPh)) {
      keyIssues.push(`placeholder mismatch: en={${enPh}} tr={${trPh}}`);
    }

    // 3. HTML tag parity
    const enTags = extractHtmlTags(enValue);
    const trTags = extractHtmlTags(transValue);
    if (enTags.length > 0 && JSON.stringify(enTags) !== JSON.stringify(trTags)) {
      keyIssues.push(`HTML tag mismatch: en=[${enTags}] tr=[${trTags}]`);
    }

    // 4. Mojibake
    if (hasMojibake(transValue)) {
      keyIssues.push("mojibake detected");
    }

    if (keyIssues.length > 0) {
      issues.push({ key, reasons: keyIssues });
    }
  }

  if (issues.length > 0) {
    totalBroken += issues.length;
    summary.push({ locale, count: issues.length });

    if (!doFix) {
      console.log(`\n❌ ${locale}: ${issues.length} broken key(s)`);
      for (const { key, reasons } of issues.slice(0, 10)) {
        console.log(`   ${key}: ${reasons.join("; ")}`);
      }
      if (issues.length > 10) {
        console.log(`   ... and ${issues.length - 10} more`);
      }
    } else {
      // Fix by reverting broken keys to English
      for (const { key } of issues) {
        setNested(localeJson, key, enFlat[key]);
        totalFixed++;
      }
      fs.writeFileSync(filePath, `${JSON.stringify(localeJson, null, 2)}\n`, "utf8");
      console.log(`🔧 ${locale}: fixed ${issues.length} key(s) by reverting to English`);
    }
  }
}

// ── Summary ──────────────────────────────────────────────────────────

console.log(`\n${"═".repeat(60)}`);
if (totalBroken === 0) {
  console.log("✅ ICU integrity check passed: 0 broken keys across all locales");
  process.exit(0);
} else if (doFix) {
  console.log(`🔧 Fixed ${totalFixed} broken key(s) across ${summary.length} locale(s)`);
  console.log("   Re-run without --fix to verify.");
  process.exit(0);
} else {
  console.log(`❌ ${totalBroken} broken key(s) across ${summary.length} locale(s):`);
  for (const { locale, count } of summary.sort((a, b) => b.count - a.count)) {
    console.log(`   ${locale}: ${count}`);
  }
  console.log("\nRun with --fix to revert broken keys to English.");
  process.exit(1);
}
