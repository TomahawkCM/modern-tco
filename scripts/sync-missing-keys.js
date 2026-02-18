#!/usr/bin/env node
/**
 * Sync Missing Translation Keys
 *
 * Copies missing keys from en.json to all locale files using English as fallback.
 * This ensures the app doesn't break while maintaining structure for future translation.
 */

const fs = require("fs");
const path = require("path");

const MESSAGES_DIR = path.join(__dirname, "../src/i18n/messages");

function getAllKeys(obj, prefix = "") {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? prefix + "." + key : key;
    if (typeof obj[key] === "object" && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function getValueByPath(obj, pathStr) {
  return pathStr.split(".").reduce((acc, part) => acc && acc[part], obj);
}

function setValueByPath(obj, pathStr, value) {
  const parts = pathStr.split(".");
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!(parts[i] in current)) {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

function sortObjectKeys(obj) {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sortObjectKeys);

  const sorted = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = sortObjectKeys(obj[key]);
    });
  return sorted;
}

function main() {
  console.log("=".repeat(60));
  console.log("Syncing Missing Translation Keys");
  console.log("=".repeat(60));

  // Load base locale
  const enPath = path.join(MESSAGES_DIR, "en.json");
  const enData = JSON.parse(fs.readFileSync(enPath, "utf8"));
  const enKeys = getAllKeys(enData);

  console.log(`\nBase locale (en.json): ${enKeys.length} keys`);

  // Get all locale files
  const localeFiles = fs
    .readdirSync(MESSAGES_DIR)
    .filter((f) => f.endsWith(".json") && f !== "en.json")
    .sort();

  console.log(`Locale files to update: ${localeFiles.length}\n`);

  let totalKeysAdded = 0;
  let filesUpdated = 0;

  for (const file of localeFiles) {
    const locale = file.replace(".json", "");
    const filePath = path.join(MESSAGES_DIR, file);

    let localeData;
    try {
      localeData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (e) {
      console.log(`❌ ${locale}: Invalid JSON - ${e.message}`);
      continue;
    }

    const localeKeys = getAllKeys(localeData);
    const missingKeys = enKeys.filter((k) => !localeKeys.includes(k));

    if (missingKeys.length === 0) {
      console.log(`✓ ${locale}: Already complete`);
      continue;
    }

    // Add missing keys with English values
    let keysAdded = 0;
    for (const key of missingKeys) {
      const enValue = getValueByPath(enData, key);
      setValueByPath(localeData, key, enValue);
      keysAdded++;
    }

    // Sort keys and save
    const sortedData = sortObjectKeys(localeData);
    fs.writeFileSync(filePath, JSON.stringify(sortedData, null, 2) + "\n");

    console.log(`✓ ${locale}: Added ${keysAdded} keys`);
    totalKeysAdded += keysAdded;
    filesUpdated++;
  }

  console.log("\n" + "=".repeat(60));
  console.log("Summary");
  console.log("=".repeat(60));
  console.log(`Files updated: ${filesUpdated}`);
  console.log(`Total keys added: ${totalKeysAdded}`);
  console.log(`Average keys per file: ${(totalKeysAdded / filesUpdated).toFixed(0)}`);
}

main();
