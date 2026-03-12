const fs = require("fs");
const path = require("path");
const d = path.join(__dirname, "../src/i18n/messages");
const en = require(path.join(d, "en.json"));

function flatten(obj, prefix) {
  prefix = prefix || "";
  const result = {};
  for (const [key, v] of Object.entries(obj)) {
    const fp = prefix ? `${prefix}.${key}` : key;
    if (typeof v === "object" && v !== null) Object.assign(result, flatten(v, fp));
    else result[fp] = v;
  }
  return result;
}

const enFlat = flatten(en);
const enKeys = Object.keys(enFlat);
const totalKeys = enKeys.length;

const below = [];
const qualityIssues = [];

for (const f of fs.readdirSync(d).filter((f) => f.endsWith(".json") && f !== "en.json")) {
  const locale = f.replace(".json", "");
  const data = JSON.parse(fs.readFileSync(path.join(d, f), "utf8"));
  const flat = flatten(data);
  const localeKeys = new Set(Object.keys(flat));

  // Key presence check
  const missing = enKeys.filter((k) => !localeKeys.has(k));

  // Translation quality check: count values identical to English
  let sameAsEn = 0;
  for (const k of enKeys) {
    if (flat[k] !== undefined && flat[k] === enFlat[k]) sameAsEn++;
  }

  const isEnVariant = locale.startsWith("en-");
  const pctUntranslated = ((sameAsEn / totalKeys) * 100).toFixed(1);

  if (missing.length > 0) {
    below.push({
      l: locale,
      n: missing.length,
      p: ((localeKeys.size / totalKeys) * 100).toFixed(1),
    });
  }

  if (!isEnVariant && sameAsEn > totalKeys * 0.05) {
    qualityIssues.push({
      l: locale,
      same: sameAsEn,
      pct: pctUntranslated,
    });
  }
}

below.sort((a, b) => b.n - a.n);
qualityIssues.sort((a, b) => b.same - a.same);

console.log(`Total en.json keys: ${totalKeys}`);
console.log("");

// Key presence report
console.log("=== KEY PRESENCE ===");
console.log(`Locales below 100% key coverage (${below.length}):`);
below.forEach((l) => console.log(`  ${l.l}: ${l.p}% (missing ${l.n})`));
if (below.length === 0) console.log("  ALL LOCALES AT 100% KEY COVERAGE!");
console.log("");

// Translation quality report
console.log("=== TRANSLATION QUALITY ===");
console.log(`Locales with >5% values identical to English (${qualityIssues.length}):`);
qualityIssues.forEach((l) => console.log(`  ${l.l}: ${l.same} keys same as English (${l.pct}%)`));
if (qualityIssues.length === 0) console.log("  ALL NON-ENGLISH LOCALES PROPERLY TRANSLATED!");

// Exit with error code if quality issues exist
if (qualityIssues.length > 0) {
  console.log("");
  console.log(
    `ERROR: ${
      qualityIssues.length
    } locale(s) have untranslated values. Fix before claiming complete.`
  );
  process.exit(1);
}
