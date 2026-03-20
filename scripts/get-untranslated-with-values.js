#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * get-untranslated-with-values.js
 *
 * Outputs untranslated keys for a locale with their English values as JSON.
 * Used by translation agents to know what to translate.
 *
 * Usage: node scripts/get-untranslated-with-values.js <locale>
 */

const fs = require("fs");
const path = require("path");

const MESSAGES_DIR = path.resolve(__dirname, "..", "src", "i18n", "messages");

// Same exclusion list as check-untranslated.ts
const EXCLUDED_KEY_PATTERNS = [
  /\.href$/,
  /\._note$/,
  /calculators\.\w+\.formulaText$/,
  /calculators\.\w+\.formulaExplanation$/,
];
const EXCLUDED_KEY_VALUES = new Set([
  "Netflix", "Spotify", "Venmo", "PayPal", "BudgetPro", "OCR", "API", "FAQ", "Emoji",
  "Google Calendar", "Outlook Calendar", "SimpleFIN",
  "0.00", "100", "50.00", "192.168.1.100", "+12.5%", "-5.2%", "85%",
  "you@example.com", "$", "Cmd+Shift+P",
  "© {year} {brandName}", "{date}", "{size} KB",
  "SimpleFIN: {status}", "{title}. {body}",
  "FV = PV(1+r/n)^(nt) + PMT[((1+r/n)^(nt)-1)/(r/n)]",
  "M = P[i(1+i)^n] / [(1+i)^n - 1]",
  "Real Value = Nominal Value / (1 + inflation)^years",
  "Accumulation: FV = PV(1+r)^n + PMT[((1+r)^n-1)/r] | Withdrawal: Balance_n = Balance_(n-1)(1+r) - W",
  "Monthly return = Normal(μ/12, σ/√12); Balance_t = Balance_(t-1) × (1 + r_t) + C - W",
  "Budget.yfull / Budget.ynab4",
  "N/A",
  "Tech Solutions Inc.",
  "APR (%)",
  "APR %",
  "EUR - Euro",
  "E-Transfer",
  "Transactions", "transactions", "Transaction", "transaction",
  "Budget", "Budgets", "budgets",
  "Total", "total", "Total:",
  "Description", "Date", "Date *",
  "Actions", "Action",
  "Notes", "Type", "Score",
  "Version", "Options", "Option 1", "Option 2",
  "Format", "Notifications", "notifications",
  "Net", "Min", "Max",
  "Institution", "Port",
  "Points", "points", "Badges", "badges",
  "Focus", "Solution", "Normal", "Important",
  "Suggestions", "Occurrences", "PRODUCTION",
  "Shopping", "Avalanche",
  "Hindi",
  "Auto", "Status", "Filter", "Filter:",
  "via", "admin",
  "Trend", "Debit", "Credit",
  "Offline", "Online",
  "Hover", "Extra",
  "LAN Sync",
  "Documentation", "System",
  "Import", "Export",
  "SimpleFIN Bridge Dashboard",
  "SimpleFIN Protocol Documentation",
  "Symbol", "Symbol: {symbol}",
  "Email", "Data", "Database",
  "Cost", "Period", "Live", "Mild",
  "Zero Knowledge",
  "Send",
  "Hint: {hint}",
  "-$124.50", "+$4,250.00", "-$15.99", "$24,500.00", "$1,250.00",
  "{years}y {months}m",
  "Password", "Home", "Host", "Privacy:",
  "Total: {value}.", "Original: {amount}", "Plan: {name}",
  "Error", "No", "General", "Color",
  "Manual", "Irregular", "Experimental", "Actor",
  "Formula", "Principal", "Principal:",
  "Budget App",
  "BudgetPro Local", "BudgetPro Sync (Pro)",
  "Legal",
  "{count} {count, plural, =1 {transaction} other {transactions}}",
  "{count, plural, one {# transaction} other {# transactions}}",
  "{count, plural, one {1 transaction} other {# transactions}}",
  "({count} transactions)",
  "{count} pages",
  "Transactions (CSV)",
]);

function isExcluded(key, value) {
  if (EXCLUDED_KEY_PATTERNS.some(p => p.test(key))) return true;
  if (EXCLUDED_KEY_VALUES.has(value)) return true;
  return false;
}

function flattenKeys(obj, prefix = "") {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenKeys(value, fullKey));
    } else {
      result[fullKey] = String(value);
    }
  }
  return result;
}

const locale = process.argv[2];
if (!locale) {
  console.error("Usage: node scripts/get-untranslated-with-values.js <locale>");
  process.exit(1);
}

const enData = JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, "en.json"), "utf-8"));
const localeFile = path.join(MESSAGES_DIR, `${locale}.json`);
if (!fs.existsSync(localeFile)) {
  console.error(`Locale file not found: ${locale}.json`);
  process.exit(1);
}
const localeData = JSON.parse(fs.readFileSync(localeFile, "utf-8"));

const enFlat = flattenKeys(enData);
const localeFlat = flattenKeys(localeData);

const untranslated = {};
for (const [key, enValue] of Object.entries(enFlat)) {
  const localeValue = localeFlat[key];
  if ((!localeValue || localeValue === enValue) && !isExcluded(key, enValue)) {
    untranslated[key] = enValue;
  }
}

console.log(JSON.stringify(untranslated, null, 2));
