#!/usr/bin/env node

/**
 * translate-targeted.js
 *
 * Translates specific keys across all locale files using OpenAI API.
 * Used when new keys are added or existing keys have English placeholders.
 *
 * Usage:
 *   node scripts/translate-targeted.js
 *   node scripts/translate-targeted.js --dry-run
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env.local") });

const fs = require("fs");
const path = require("path");
const OpenAI = require("openai").default;

const MESSAGES_DIR = path.resolve(__dirname, "..", "src", "i18n", "messages");
const EN_FILE = path.join(MESSAGES_DIR, "en.json");

// Keys to translate — flat dot-notation paths
const TARGET_KEYS = [
  // Part A: New landing preview keys
  "landing.preview.overview",
  "landing.preview.welcomeBack",
  "landing.preview.live",
  "landing.preview.totalBalance",
  "landing.preview.expenses",
  "landing.preview.savingsGoal",
  "landing.preview.vsLastMonth",
  "landing.preview.recentTransactions",
  "landing.preview.tx0Name",
  "landing.preview.tx0Date",
  "landing.preview.tx0Amount",
  "landing.preview.tx1Name",
  "landing.preview.tx1Date",
  "landing.preview.tx1Amount",
  "landing.preview.tx2Name",
  "landing.preview.tx2Date",
  "landing.preview.tx2Amount",
  "landing.preview.balanceAmount",
  "landing.preview.balanceChange",
  "landing.preview.expensesAmount",
  "landing.preview.expensesChange",
  "landing.preview.savingsPercent",
  "landing.preview.currencySymbol",
  // Part A: New landing footer keys
  "landing.footer.product",
  "landing.footer.resources",
  "landing.footer.legal",
  "landing.footer.features",
  "landing.footer.pricing",
  "landing.footer.download",
  "landing.footer.changelog",
  "landing.footer.documentation",
  "landing.footer.api",
  "landing.footer.community",
  "landing.footer.helpCenter",
  "landing.footer.privacyPolicy",
  "landing.footer.termsOfService",
  "landing.footer.cookiePolicy",
  "landing.footer.allRightsReserved",
  // Part B: Sidebar navigation (English placeholders in most locales)
  "sidebar.navigation.accounts",
  "sidebar.navigation.budgets",
  "sidebar.navigation.calculators",
  "sidebar.navigation.dashboard",
  "sidebar.navigation.events",
  "sidebar.navigation.import",
  "sidebar.navigation.netWorth",
  "sidebar.navigation.properties",
  "sidebar.navigation.reminders",
  "sidebar.navigation.scenarios",
  "sidebar.navigation.settings",
  // Part B: Sidebar actions
  "sidebar.actions.backToHome",
  "sidebar.actions.collapseSidebar",
  "sidebar.actions.expandSidebar",
  // Part B: Mobile navigation
  "mobileNav.home",
  "mobileNav.budget",
  "mobileNav.accounts",
  "mobileNav.activity",
  "mobileNav.more",
  // Part B: Aria labels
  "aria.mainSidebar",
  "aria.mobileNavigation",
  "aria.primaryNavigation",
  "aria.showAllMenuItems",
  "aria.showSimplifiedMenu",
];

// Locale metadata for currency context
const LOCALE_CURRENCIES = {
  "de-DE": "EUR",
  "de-AT": "EUR",
  "de-CH": "CHF",
  "fr-FR": "EUR",
  "fr-BE": "EUR",
  "fr-CA": "CAD",
  "fr-CH": "CHF",
  "es-ES": "EUR",
  "es-MX": "MXN",
  "es-AR": "ARS",
  "es-CL": "CLP",
  "es-CO": "COP",
  "es-PE": "PEN",
  "es-VE": "VES",
  "es-EC": "USD",
  "es-BO": "BOB",
  "es-CR": "CRC",
  "es-DO": "DOP",
  "es-GT": "GTQ",
  "es-HN": "HNL",
  "es-NI": "NIO",
  "es-PA": "PAB",
  "es-PR": "USD",
  "es-PY": "PYG",
  "es-SV": "USD",
  "es-US": "USD",
  "es-UY": "UYU",
  "pt-BR": "BRL",
  "pt-PT": "EUR",
  "it-IT": "EUR",
  "it-CH": "CHF",
  "nl-NL": "EUR",
  "nl-BE": "EUR",
  "ja-JP": "JPY",
  "ko-KR": "KRW",
  "zh-CN": "CNY",
  "zh-TW": "TWD",
  "zh-HK": "HKD",
  "ru-RU": "RUB",
  "uk-UA": "UAH",
  "pl-PL": "PLN",
  "cs-CZ": "CZK",
  "ro-RO": "RON",
  "hu-HU": "HUF",
  "bg-BG": "BGN",
  "hr-HR": "EUR",
  "sk-SK": "EUR",
  "sl-SI": "EUR",
  "sr-RS": "RSD",
  "tr-TR": "TRY",
  "ar-SA": "SAR",
  "ar-AE": "AED",
  "hi-IN": "INR",
  "bn-BD": "BDT",
  "bn-IN": "INR",
  "th-TH": "THB",
  "vi-VN": "VND",
  "id-ID": "IDR",
  "ms-MY": "MYR",
  "sv-SE": "SEK",
  "da-DK": "DKK",
  "nb-NO": "NOK",
  "fi-FI": "EUR",
  "el-GR": "EUR",
  "he-IL": "ILS",
  "fa-IR": "IRR",
  "sw-TZ": "TZS",
  "af-ZA": "ZAR",
  "zu-ZA": "ZAR",
  "ca-ES": "EUR",
  "eu-ES": "EUR",
  "gl-ES": "EUR",
  "et-EE": "EUR",
  "lt-LT": "EUR",
  "lv-LV": "EUR",
  "sq-AL": "ALL",
  "bs-BA": "BAM",
  "mk-MK": "MKD",
  "ka-GE": "GEL",
  "hy-AM": "AMD",
  "az-AZ": "AZN",
  "kk-KZ": "KZT",
  "ky-KG": "KGS",
  "uz-UZ": "UZS",
  "mn-MN": "MNT",
  "is-IS": "ISK",
  "cy-GB": "GBP",
  "be-BY": "BYN",
  "ta-IN": "INR",
  "te-IN": "INR",
  "kn-IN": "INR",
  "ml-IN": "INR",
  "mr-IN": "INR",
  "gu-IN": "INR",
  "pa-IN": "INR",
  "si-LK": "LKR",
  "ne-NP": "NPR",
  "my-MM": "MMK",
  "km-KH": "KHR",
  "lo-LA": "LAK",
  "fil-PH": "PHP",
  "am-ET": "ETB",
  "en-AU": "AUD",
  "en-CA": "CAD",
  "en-GB": "GBP",
  "en-IE": "EUR",
  "en-IN": "INR",
  "en-NZ": "NZD",
  "en-SG": "SGD",
  "en-ZA": "ZAR",
  "en-US": "USD",
  "en-XA": "USD",
  "ur-PK": "PKR",
};

// Language names for prompts
const LOCALE_NAMES = {
  "af-ZA": "Afrikaans",
  "am-ET": "Amharic",
  "ar-AE": "Arabic (UAE)",
  "ar-SA": "Arabic (Saudi Arabia)",
  "az-AZ": "Azerbaijani",
  "be-BY": "Belarusian",
  "bg-BG": "Bulgarian",
  "bn-BD": "Bengali (Bangladesh)",
  "bn-IN": "Bengali (India)",
  "bs-BA": "Bosnian",
  "ca-ES": "Catalan",
  "cs-CZ": "Czech",
  "cy-GB": "Welsh",
  "da-DK": "Danish",
  "de-AT": "German (Austria)",
  "de-CH": "German (Switzerland)",
  "de-DE": "German",
  "el-GR": "Greek",
  "es-AR": "Spanish (Argentina)",
  "es-BO": "Spanish (Bolivia)",
  "es-CL": "Spanish (Chile)",
  "es-CO": "Spanish (Colombia)",
  "es-CR": "Spanish (Costa Rica)",
  "es-DO": "Spanish (Dominican Republic)",
  "es-EC": "Spanish (Ecuador)",
  "es-ES": "Spanish (Spain)",
  "es-GT": "Spanish (Guatemala)",
  "es-HN": "Spanish (Honduras)",
  "es-MX": "Spanish (Mexico)",
  "es-NI": "Spanish (Nicaragua)",
  "es-PA": "Spanish (Panama)",
  "es-PE": "Spanish (Peru)",
  "es-PR": "Spanish (Puerto Rico)",
  "es-PY": "Spanish (Paraguay)",
  "es-SV": "Spanish (El Salvador)",
  "es-US": "Spanish (US)",
  "es-UY": "Spanish (Uruguay)",
  "es-VE": "Spanish (Venezuela)",
  "et-EE": "Estonian",
  "eu-ES": "Basque",
  "fa-IR": "Persian",
  "fi-FI": "Finnish",
  "fil-PH": "Filipino",
  "fr-BE": "French (Belgium)",
  "fr-CA": "French (Canada)",
  "fr-CH": "French (Switzerland)",
  "fr-FR": "French",
  "gl-ES": "Galician",
  "gu-IN": "Gujarati",
  "he-IL": "Hebrew",
  "hi-IN": "Hindi",
  "hr-HR": "Croatian",
  "hu-HU": "Hungarian",
  "hy-AM": "Armenian",
  "id-ID": "Indonesian",
  "is-IS": "Icelandic",
  "it-CH": "Italian (Switzerland)",
  "it-IT": "Italian",
  "ja-JP": "Japanese",
  "ka-GE": "Georgian",
  "kk-KZ": "Kazakh",
  "km-KH": "Khmer",
  "kn-IN": "Kannada",
  "ko-KR": "Korean",
  "ky-KG": "Kyrgyz",
  "lo-LA": "Lao",
  "lt-LT": "Lithuanian",
  "lv-LV": "Latvian",
  "mk-MK": "Macedonian",
  "ml-IN": "Malayalam",
  "mn-MN": "Mongolian",
  "mr-IN": "Marathi",
  "ms-MY": "Malay",
  "my-MM": "Burmese",
  "nb-NO": "Norwegian Bokmål",
  "ne-NP": "Nepali",
  "nl-BE": "Dutch (Belgium)",
  "nl-NL": "Dutch",
  "pa-IN": "Punjabi",
  "pl-PL": "Polish",
  "pt-BR": "Portuguese (Brazil)",
  "pt-PT": "Portuguese (Portugal)",
  "ro-RO": "Romanian",
  "ru-RU": "Russian",
  "si-LK": "Sinhala",
  "sk-SK": "Slovak",
  "sl-SI": "Slovenian",
  "sq-AL": "Albanian",
  "sr-RS": "Serbian",
  "sv-SE": "Swedish",
  "sw-TZ": "Swahili",
  "ta-IN": "Tamil",
  "te-IN": "Telugu",
  "th-TH": "Thai",
  "tr-TR": "Turkish",
  "uk-UA": "Ukrainian",
  "ur-PK": "Urdu",
  "uz-UZ": "Uzbek",
  "vi-VN": "Vietnamese",
  "zh-CN": "Chinese (Simplified)",
  "zh-HK": "Chinese (Hong Kong)",
  "zh-TW": "Chinese (Traditional)",
  "zu-ZA": "Zulu",
};

function getNestedValue(obj, keyPath) {
  return keyPath.split(".").reduce((o, k) => (o && typeof o === "object" ? o[k] : undefined), obj);
}

function setNestedValue(obj, keyPath, value) {
  const parts = keyPath.split(".");
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!(parts[i] in current) || typeof current[parts[i]] !== "object") {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

function extractKeys(obj, keys) {
  const result = {};
  for (const key of keys) {
    const val = getNestedValue(obj, key);
    if (val !== undefined) result[key] = val;
  }
  return result;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function translateBatch(client, locale, sourceKV, currency) {
  const langName = LOCALE_NAMES[locale] || locale;

  const prompt = `You are a professional UI translator for a personal finance/budgeting web application.

Translate these English UI strings to ${langName} (${locale}).

Context:
- This is a budget management app with dashboard preview, footer links, sidebar navigation, and accessibility labels
- Currency for this locale: ${currency}
- For monetary amounts (keys containing "Amount", "Change", "Percent", "currencySymbol"): format using local conventions
  - Use the locale's currency symbol/format (e.g., "24.500,00 €" for German, "¥2,450,000" for Japanese)
  - Percentage format should match locale conventions
- For UI labels: use natural, idiomatic translations suitable for app interfaces
- Keep translations concise (these are UI labels, not paragraphs)
- "API" should remain "API" in all languages

Source (flat key → English value):
${JSON.stringify(sourceKV, null, 2)}

Return ONLY a valid JSON object with the same flat keys mapped to translated values. No markdown, no explanation.`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error(`Empty response for ${locale}`);

  return JSON.parse(content);
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error("OPENAI_API_KEY not set in .env.local");
    process.exit(1);
  }

  const client = new OpenAI({ apiKey });
  const en = JSON.parse(fs.readFileSync(EN_FILE, "utf-8"));

  // Extract English values for target keys
  const sourceKV = extractKeys(en, TARGET_KEYS);
  console.log(`Target: ${Object.keys(sourceKV).length} keys to translate\n`);

  if (dryRun) {
    console.log("DRY RUN — keys to translate:");
    for (const [k, v] of Object.entries(sourceKV)) {
      console.log(`  ${k}: "${v}"`);
    }
    return;
  }

  // Get all locale files (skip en.json and en-* variants)
  const localeFiles = fs
    .readdirSync(MESSAGES_DIR)
    .filter((f) => f.endsWith(".json") && f !== "en.json" && !f.startsWith("en-"))
    .sort();

  console.log(`Translating for ${localeFiles.length} locales...\n`);

  const MAX_CONCURRENT = 8;
  let completed = 0;
  let errors = 0;

  // Process in batches
  for (let i = 0; i < localeFiles.length; i += MAX_CONCURRENT) {
    const batch = localeFiles.slice(i, i + MAX_CONCURRENT);
    const promises = batch.map(async (file) => {
      const locale = file.replace(".json", "");
      const currency = LOCALE_CURRENCIES[locale] || "USD";
      const filePath = path.join(MESSAGES_DIR, file);

      try {
        const translated = await translateBatch(client, locale, sourceKV, currency);

        // Merge translations into locale file
        const localeData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        for (const [key, value] of Object.entries(translated)) {
          if (TARGET_KEYS.includes(key) && typeof value === "string" && value.trim()) {
            setNestedValue(localeData, key, value);
          }
        }
        fs.writeFileSync(filePath, `${JSON.stringify(localeData, null, 2)}\n`, "utf-8");

        completed++;
        console.log(`  ✓ ${locale} (${completed}/${localeFiles.length})`);
      } catch (err) {
        errors++;
        console.error(`  ✗ ${locale}: ${err.message}`);
      }
    });

    await Promise.all(promises);

    // Small delay between batches to respect rate limits
    if (i + MAX_CONCURRENT < localeFiles.length) {
      await sleep(500);
    }
  }

  console.log(`\nDone! ${completed} locales translated, ${errors} errors.`);
}

main().catch(console.error);
