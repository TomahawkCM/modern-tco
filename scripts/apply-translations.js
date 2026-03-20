#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * apply-translations.js
 *
 * Reads a JSON file of flat dot-notation key→value translations from stdin,
 * applies them to a locale file, and writes back.
 *
 * Usage: echo '{"nav.dashboard":"Tableau de bord"}' | node scripts/apply-translations.js fr-FR
 *    or: node scripts/apply-translations.js fr-FR < translations.json
 */

const fs = require("fs");
const path = require("path");

const MESSAGES_DIR = path.resolve(__dirname, "..", "src", "i18n", "messages");

function setNestedValue(obj, dotPath, value) {
  const keys = dotPath.split(".");
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]] || typeof current[keys[i]] !== "object") {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

const locale = process.argv[2];
if (!locale) {
  console.error("Usage: echo '{...}' | node scripts/apply-translations.js <locale>");
  process.exit(1);
}

const localeFile = path.join(MESSAGES_DIR, `${locale}.json`);
if (!fs.existsSync(localeFile)) {
  console.error(`Locale file not found: ${locale}.json`);
  process.exit(1);
}

// Read translations from stdin
let input = "";
process.stdin.setEncoding("utf-8");
process.stdin.on("data", (chunk) => { input += chunk; });
process.stdin.on("end", () => {
  try {
    const translations = JSON.parse(input);
    const localeData = JSON.parse(fs.readFileSync(localeFile, "utf-8"));

    let applied = 0;
    for (const [key, value] of Object.entries(translations)) {
      setNestedValue(localeData, key, value);
      applied++;
    }

    fs.writeFileSync(localeFile, JSON.stringify(localeData, null, 2) + "\n", "utf-8");
    console.log(`Applied ${applied} translations to ${locale}.json`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
});
