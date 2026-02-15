#!/usr/bin/env node

/**
 * Sync Calculator Translations
 *
 * Adds the calculators namespace from en-US.json to all other locale files
 */

const fs = require("fs");
const path = require("path");

const messagesDir = path.join(__dirname, "../src/i18n/messages");

// Read the en-US.json as the source
const enUSPath = path.join(messagesDir, "en-US.json");
const enUS = JSON.parse(fs.readFileSync(enUSPath, "utf-8"));

// Get the calculators namespace
const calculatorsNamespace = enUS.calculators;

if (!calculatorsNamespace) {
  console.error("Error: calculators namespace not found in en-US.json");
  process.exit(1);
}

// Get all locale files
const localeFiles = fs
  .readdirSync(messagesDir)
  .filter((file) => file.endsWith(".json") && file !== "en-US.json");

console.log(`Found ${localeFiles.length} locale files to update`);

let updated = 0;
let errors = 0;

for (const file of localeFiles) {
  const filePath = path.join(messagesDir, file);

  try {
    const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    // Add or update the calculators namespace
    content.calculators = calculatorsNamespace;

    // Also ensure sidebar.navigation.calculators exists
    if (content.sidebar && content.sidebar.navigation) {
      content.sidebar.navigation.accounts = content.sidebar.navigation.accounts || "Accounts";
      content.sidebar.navigation.calculators =
        content.sidebar.navigation.calculators || "Calculators";
    }

    // Write back with proper formatting
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + "\n", "utf-8");
    updated++;
    console.log(`✓ Updated ${file}`);
  } catch (err) {
    console.error(`✗ Error updating ${file}: ${err.message}`);
    errors++;
  }
}

console.log(`\nDone! Updated ${updated} files, ${errors} errors`);
