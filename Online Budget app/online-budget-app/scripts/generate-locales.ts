/**
 * Generate locale message files for all 113 supported locales.
 * Copies en.json as a fallback for each locale.
 * Real translations can be added later via a translation service.
 *
 * Usage: npx tsx scripts/generate-locales.ts
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const LOCALES = [
  "af-ZA", "am-ET", "ar-AE", "ar-SA", "az-AZ",
  "be-BY", "bg-BG", "bn-BD", "bn-IN", "bs-BA",
  "ca-ES", "cs-CZ", "cy-GB", "da-DK",
  "de-AT", "de-CH", "de-DE",
  "el-GR",
  "en-AU", "en-CA", "en-GB", "en-IE", "en-IN", "en-NZ", "en-SG", "en-US", "en-ZA",
  "es-AR", "es-BO", "es-CL", "es-CO", "es-CR", "es-DO", "es-EC", "es-ES",
  "es-GT", "es-HN", "es-MX", "es-NI", "es-PA", "es-PE", "es-PR", "es-PY",
  "es-SV", "es-US", "es-UY", "es-VE",
  "et-EE", "eu-ES", "fa-IR", "fi-FI", "fil-PH",
  "fr-BE", "fr-CA", "fr-CH", "fr-FR",
  "gl-ES", "gu-IN", "he-IL", "hi-IN", "hr-HR", "hu-HU", "hy-AM",
  "id-ID", "is-IS", "it-CH", "it-IT",
  "ja-JP", "ka-GE", "kk-KZ", "km-KH", "kn-IN", "ko-KR", "ky-KG",
  "lo-LA", "lt-LT", "lv-LV",
  "mk-MK", "ml-IN", "mn-MN", "mr-IN", "ms-MY", "my-MM",
  "nb-NO", "ne-NP", "nl-BE", "nl-NL",
  "pa-IN", "pl-PL", "pt-BR", "pt-PT",
  "ro-RO", "ru-RU",
  "si-LK", "sk-SK", "sl-SI", "sq-AL", "sr-RS", "sv-SE", "sw-TZ",
  "ta-IN", "te-IN", "th-TH", "tr-TR",
  "uk-UA", "ur-PK", "uz-UZ", "vi-VN",
  "zh-CN", "zh-HK", "zh-TW", "zu-ZA",
];

const messagesDir = join(__dirname, "..", "i18n", "messages");
const enPath = join(messagesDir, "en.json");

if (!existsSync(enPath)) {
  console.error("en.json not found at", enPath);
  process.exit(1);
}

const enContent = readFileSync(enPath, "utf-8");
const enData = JSON.parse(enContent);
let created = 0;
let updated = 0;
let skipped = 0;

/**
 * Deep merge: add missing keys from source into target.
 * Existing keys in target are preserved (translations are kept).
 */
function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): boolean {
  let changed = false;
  for (const key of Object.keys(source)) {
    if (!(key in target)) {
      target[key] = source[key];
      changed = true;
    } else if (
      typeof source[key] === "object" && source[key] !== null && !Array.isArray(source[key]) &&
      typeof target[key] === "object" && target[key] !== null && !Array.isArray(target[key])
    ) {
      if (deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>)) {
        changed = true;
      }
    }
  }
  return changed;
}

for (const locale of LOCALES) {
  // en.json is the base file, en-US uses it directly via the provider
  if (locale === "en-US") {
    skipped++;
    continue;
  }

  const filePath = join(messagesDir, `${locale}.json`);

  if (existsSync(filePath)) {
    // Update existing file with any new keys from en.json
    const localeData = JSON.parse(readFileSync(filePath, "utf-8"));
    if (deepMerge(localeData, enData)) {
      writeFileSync(filePath, JSON.stringify(localeData, null, 2) + "\n", "utf-8");
      updated++;
    } else {
      skipped++;
    }
    continue;
  }

  writeFileSync(filePath, enContent, "utf-8");
  created++;
}

console.log(`Done. Created: ${created}, Updated: ${updated}, Skipped (up to date): ${skipped}`);
console.log(`Total locale files: ${LOCALES.length}`);
