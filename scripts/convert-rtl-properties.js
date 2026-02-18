#!/usr/bin/env node

/**
 * convert-rtl-properties.js
 *
 * Converts physical CSS properties to logical equivalents in Tailwind classes
 * across all budget component files (src/components/budget/).
 *
 * Physical → Logical mapping:
 *   ml-    → ms-     (margin-left → margin-inline-start)
 *   mr-    → me-     (margin-right → margin-inline-end)
 *   pl-    → ps-     (padding-left → padding-inline-start)
 *   pr-    → pe-     (padding-right → padding-inline-end)
 *   left-  → start-  (positioning: left-0, left-4, etc.)
 *   right- → end-    (positioning: right-0, right-4, etc.)
 *   text-left  → text-start
 *   text-right → text-end
 *   border-l-  → border-s-  (border-left)
 *   border-r-  → border-e-  (border-right)
 *   rounded-l- → rounded-s- (border-radius left)
 *   rounded-r- → rounded-e- (border-radius right)
 */

const fs = require("fs");
const path = require("path");

const BUDGET_DIR = path.resolve(
  __dirname,
  "../src/components/budget"
);

// Collect all .ts and .tsx files recursively
function findFiles(dir, extensions) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(fullPath, extensions));
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Replacement rules.
 * Each rule is [RegExp, replacement].
 *
 * The regexes use a lookbehind to ensure we match at class-name boundaries:
 *   - start of string
 *   - after whitespace
 *   - after quote characters: " ' `
 *   - after { (template literal expressions)
 *   - after ( (function call arguments like cn())
 *
 * For utilities like ml-, mr-, pl-, pr-, we match:
 *   <boundary>(ml|mr|pl|pr)-(<value>)
 * where <value> starts with a digit, "auto", "px", "full", or "[" (arbitrary value).
 *
 * For positioning left-/right-, we are MORE restrictive:
 *   <boundary>(left|right)-(<value>)
 * where <value> is a digit, auto, px, full, 1/2, or [.
 * This avoids matching words like "delete", "select", etc.
 *
 * For text alignment: text-left / text-right as whole class names.
 * For border: border-l- / border-r- followed by valid value chars.
 * For rounded: rounded-l- / rounded-r- followed by valid value chars.
 */

// Lookbehind for class boundary: start of string, whitespace, quotes, {, (, or after a colon (modifiers like sm:, hover:, etc.)
// We use a non-capturing lookbehind with alternation.
const BOUNDARY = "(?<=^|[\\s\"'`{(,:])";

// Also handle negative prefix: -ml-4, -mr-4, etc.
const NEG_OR_MODIFIER = "(?:-|!)?";

const replacements = [
  // margin-left → margin-inline-start: ml- → ms-
  {
    pattern: new RegExp(
      `${BOUNDARY}${NEG_OR_MODIFIER}ml-(\\d|auto|px|full|\\[)`,
      "g"
    ),
    replace: (match) => match.replace(/ml-/, "ms-"),
    label: "ml- → ms-",
  },
  // margin-right → margin-inline-end: mr- → me-
  {
    pattern: new RegExp(
      `${BOUNDARY}${NEG_OR_MODIFIER}mr-(\\d|auto|px|full|\\[)`,
      "g"
    ),
    replace: (match) => match.replace(/mr-/, "me-"),
    label: "mr- → me-",
  },
  // padding-left → padding-inline-start: pl- → ps-
  {
    pattern: new RegExp(
      `${BOUNDARY}${NEG_OR_MODIFIER}pl-(\\d|auto|px|full|\\[)`,
      "g"
    ),
    replace: (match) => match.replace(/pl-/, "ps-"),
    label: "pl- → ps-",
  },
  // padding-right → padding-inline-end: pr- → pe-
  {
    pattern: new RegExp(
      `${BOUNDARY}${NEG_OR_MODIFIER}pr-(\\d|auto|px|full|\\[)`,
      "g"
    ),
    replace: (match) => match.replace(/pr-/, "pe-"),
    label: "pr- → pe-",
  },
  // Positioning: left- → start-  (only Tailwind position utilities)
  {
    pattern: new RegExp(
      `${BOUNDARY}${NEG_OR_MODIFIER}left-(\\d|auto|px|full|1\\/|\\[)`,
      "g"
    ),
    replace: (match) => match.replace(/left-/, "start-"),
    label: "left- → start-",
  },
  // Positioning: right- → end-  (only Tailwind position utilities)
  {
    pattern: new RegExp(
      `${BOUNDARY}${NEG_OR_MODIFIER}right-(\\d|auto|px|full|1\\/|\\[)`,
      "g"
    ),
    replace: (match) => match.replace(/right-/, "end-"),
    label: "right- → end-",
  },
  // Text alignment: text-left → text-start
  {
    pattern: new RegExp(`${BOUNDARY}text-left(?=\\s|$|"|'|\`|\\)|})`, "g"),
    replace: () => "text-start",
    label: "text-left → text-start",
  },
  // Text alignment: text-right → text-end
  {
    pattern: new RegExp(`${BOUNDARY}text-right(?=\\s|$|"|'|\`|\\)|})`, "g"),
    replace: () => "text-end",
    label: "text-right → text-end",
  },
  // Border: border-l- → border-s-
  {
    pattern: new RegExp(
      `${BOUNDARY}${NEG_OR_MODIFIER}border-l-(\\d|\\[|\\w)`,
      "g"
    ),
    replace: (match) => match.replace(/border-l-/, "border-s-"),
    label: "border-l- → border-s-",
  },
  // Border: border-r- → border-e-
  {
    pattern: new RegExp(
      `${BOUNDARY}${NEG_OR_MODIFIER}border-r-(\\d|\\[|\\w)`,
      "g"
    ),
    replace: (match) => match.replace(/border-r-/, "border-e-"),
    label: "border-r- → border-e-",
  },
  // Rounded: rounded-l- → rounded-s-
  {
    pattern: new RegExp(
      `${BOUNDARY}${NEG_OR_MODIFIER}rounded-l-(\\d|\\[|\\w)`,
      "g"
    ),
    replace: (match) => match.replace(/rounded-l-/, "rounded-s-"),
    label: "rounded-l- → rounded-s-",
  },
  // Rounded: rounded-r- → rounded-e-
  {
    pattern: new RegExp(
      `${BOUNDARY}${NEG_OR_MODIFIER}rounded-r-(\\d|\\[|\\w)`,
      "g"
    ),
    replace: (match) => match.replace(/rounded-r-/, "rounded-e-"),
    label: "rounded-r- → rounded-e-",
  },
];

// --- Main ---

function processFile(filePath) {
  const original = fs.readFileSync(filePath, "utf8");
  let content = original;
  const fileChanges = {};

  for (const rule of replacements) {
    const matches = content.match(rule.pattern);
    if (matches && matches.length > 0) {
      fileChanges[rule.label] = (fileChanges[rule.label] || 0) + matches.length;
      content = content.replace(rule.pattern, rule.replace);
    }
  }

  const changed = content !== original;
  if (changed) {
    fs.writeFileSync(filePath, content, "utf8");
  }

  return { changed, fileChanges };
}

function main() {
  console.log("=== RTL Logical Property Conversion ===\n");
  console.log(`Scanning: ${BUDGET_DIR}\n`);

  const files = findFiles(BUDGET_DIR, [".ts", ".tsx"]);
  console.log(`Found ${files.length} files to process.\n`);

  let totalChanges = 0;
  let filesChanged = 0;
  const summaryByRule = {};

  for (const file of files) {
    const { changed, fileChanges } = processFile(file);
    if (changed) {
      filesChanged++;
      const relPath = path.relative(
        path.resolve(__dirname, ".."),
        file
      );
      const changeCount = Object.values(fileChanges).reduce(
        (a, b) => a + b,
        0
      );
      totalChanges += changeCount;

      console.log(`  ${relPath} (${changeCount} changes)`);
      for (const [label, count] of Object.entries(fileChanges)) {
        console.log(`    - ${label}: ${count}`);
        summaryByRule[label] = (summaryByRule[label] || 0) + count;
      }
    }
  }

  console.log("\n--- Summary ---");
  console.log(`Files scanned:  ${files.length}`);
  console.log(`Files changed:  ${filesChanged}`);
  console.log(`Total replacements: ${totalChanges}`);

  if (Object.keys(summaryByRule).length > 0) {
    console.log("\nBreakdown by rule:");
    for (const [label, count] of Object.entries(summaryByRule)) {
      console.log(`  ${label}: ${count}`);
    }
  }

  console.log("\nDone.");
}

main();
