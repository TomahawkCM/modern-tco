#!/usr/bin/env node
/**
 * Visual Testing Script using agent-browser
 *
 * Purpose: AI-assisted UI verification
 * - Open localhost dev server
 * - Capture snapshots of key pages
 * - Verify expected elements exist
 * - Generate visual diff reports
 *
 * Usage:
 *   npm run browser:visual-test
 *   npm run browser:visual-test -- --base-url http://localhost:3001
 *   npm run browser:visual-test -- --pages /welcome,/practice,/mock
 */

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (flag) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
};

const baseUrl = getArg("--base-url") || "http://localhost:3000";
const customPages = getArg("--pages");
const outputDir = getArg("--output") || "./tests/visual-reports";
const screenshotDir = getArg("--screenshots") || "./tests/screenshots";
const verbose = args.includes("--verbose");

// Default pages to test (Budget App critical paths)
const DEFAULT_PAGES = [
  { path: "/budget-app", name: "budget-dashboard", expectedElements: ["button", "link"] },
  {
    path: "/budget-app/transactions",
    name: "budget-transactions",
    expectedElements: ["button", "link"],
  },
  { path: "/budget-app/accounts", name: "budget-accounts", expectedElements: ["button", "link"] },
  { path: "/budget-app/budgets", name: "budget-budgets", expectedElements: ["button", "link"] },
  { path: "/budget-app/reports", name: "budget-reports", expectedElements: ["button", "link"] },
  { path: "/budget-app/settings", name: "budget-settings", expectedElements: ["button", "link"] },
];

/**
 * Execute agent-browser command using execFileSync (safe from injection)
 */
function execBrowser(commandArgs, options = {}) {
  try {
    const result = execFileSync("npx", ["agent-browser", ...commandArgs], {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      timeout: options.timeout || 30000,
    });
    return result.trim();
  } catch (error) {
    if (verbose) {
      console.error(`Browser command failed: ${commandArgs.join(" ")}`);
      console.error(error.message);
    }
    return null;
  }
}

/**
 * Parse snapshot output to extract elements
 */
function parseSnapshot(snapshotOutput) {
  if (!snapshotOutput) return { elements: [], raw: "" };

  const lines = snapshotOutput.split("\n");
  const elements = [];

  for (const line of lines) {
    // Parse element refs like "@e1 [button] Submit"
    const match = line.match(/@e(\d+)\s+\[([^\]]+)\]\s*(.*)/);
    if (match) {
      elements.push({
        ref: `@e${match[1]}`,
        type: match[2],
        text: match[3].trim(),
        line: line.trim(),
      });
    }
  }

  return { elements, raw: snapshotOutput };
}

/**
 * Check if page contains expected element types
 */
function verifyElements(snapshot, expectedDescriptions) {
  const results = [];
  const elementTypes = snapshot.elements.map((e) => e.type.toLowerCase());
  const elementTexts = snapshot.elements.map((e) => e.text.toLowerCase());

  for (const desc of expectedDescriptions) {
    const descLower = desc.toLowerCase();

    // Check if any element matches the description
    const found =
      elementTypes.some((t) => descLower.includes(t)) ||
      elementTexts.some((t) => t.includes(descLower)) ||
      snapshot.raw.toLowerCase().includes(descLower);

    results.push({
      description: desc,
      found,
    });
  }

  return results;
}

/**
 * Test a single page
 */
async function testPage(pageConfig) {
  const fullUrl = `${baseUrl}${pageConfig.path}`;
  console.log(`\nTesting: ${pageConfig.name} (${fullUrl})`);

  const result = {
    name: pageConfig.name,
    path: pageConfig.path,
    url: fullUrl,
    timestamp: new Date().toISOString(),
    status: "pending",
    snapshot: null,
    elementChecks: [],
    screenshot: null,
    errors: [],
  };

  try {
    // Navigate to page
    execBrowser(["open", fullUrl]);

    // Wait for page load
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Get snapshot
    const snapshotOutput = execBrowser(["snapshot", "-i"]);
    result.snapshot = parseSnapshot(snapshotOutput);

    if (verbose) {
      console.log(`  Elements found: ${result.snapshot.elements.length}`);
    }

    // Verify expected elements
    if (pageConfig.expectedElements) {
      result.elementChecks = verifyElements(result.snapshot, pageConfig.expectedElements);

      const passed = result.elementChecks.filter((c) => c.found).length;
      const total = result.elementChecks.length;
      console.log(`  Element checks: ${passed}/${total} passed`);

      for (const check of result.elementChecks) {
        const icon = check.found ? "\x1b[32m\u2713\x1b[0m" : "\x1b[31m\u2717\x1b[0m";
        console.log(`    ${icon} ${check.description}`);
      }
    }

    // Take screenshot
    const screenshotPath = path.join(screenshotDir, `${pageConfig.name}.png`);
    execBrowser(["screenshot", screenshotPath]);
    result.screenshot = screenshotPath;
    console.log(`  Screenshot: ${screenshotPath}`);

    // Determine status
    const allPassed = result.elementChecks.every((c) => c.found);
    result.status = allPassed ? "passed" : "failed";
  } catch (error) {
    result.status = "error";
    result.errors.push(error.message);
    console.error(`  Error: ${error.message}`);
  }

  return result;
}

/**
 * Generate HTML report
 */
function generateReport(results, outputPath) {
  const passed = results.filter((r) => r.status === "passed").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const errors = results.filter((r) => r.status === "error").length;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual Test Report - ${new Date().toLocaleDateString()}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; line-height: 1.6; padding: 2rem; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { margin-bottom: 1rem; }
    .summary { display: flex; gap: 1rem; margin-bottom: 2rem; }
    .stat { padding: 1rem; border-radius: 8px; color: white; min-width: 100px; text-align: center; }
    .stat.passed { background: #22c55e; }
    .stat.failed { background: #ef4444; }
    .stat.error { background: #f59e0b; }
    .stat-value { font-size: 2rem; font-weight: bold; }
    .stat-label { font-size: 0.875rem; opacity: 0.9; }
    .page-result { background: white; border-radius: 8px; margin-bottom: 1rem; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .page-header { padding: 1rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
    .page-name { font-weight: 600; }
    .page-status { padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.875rem; }
    .page-status.passed { background: #dcfce7; color: #166534; }
    .page-status.failed { background: #fee2e2; color: #991b1b; }
    .page-status.error { background: #fef3c7; color: #92400e; }
    .page-details { padding: 1rem; }
    .check { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0; }
    .check-icon { width: 1rem; height: 1rem; }
    .check-icon.found { color: #22c55e; }
    .check-icon.missing { color: #ef4444; }
    .screenshot { margin-top: 1rem; }
    .screenshot img { max-width: 100%; border-radius: 4px; border: 1px solid #eee; }
    .timestamp { color: #666; font-size: 0.875rem; margin-top: 2rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Visual Test Report</h1>

    <div class="summary">
      <div class="stat passed">
        <div class="stat-value">${passed}</div>
        <div class="stat-label">Passed</div>
      </div>
      <div class="stat failed">
        <div class="stat-value">${failed}</div>
        <div class="stat-label">Failed</div>
      </div>
      <div class="stat error">
        <div class="stat-value">${errors}</div>
        <div class="stat-label">Errors</div>
      </div>
    </div>

    ${results
      .map(
        (r) => `
    <div class="page-result">
      <div class="page-header">
        <span class="page-name">${r.name} <small>(${r.path})</small></span>
        <span class="page-status ${r.status}">${r.status}</span>
      </div>
      <div class="page-details">
        <p><strong>URL:</strong> <a href="${r.url}">${r.url}</a></p>
        <p><strong>Elements found:</strong> ${r.snapshot?.elements?.length || 0}</p>

        ${
          r.elementChecks.length > 0
            ? `
        <h4 style="margin-top: 1rem;">Element Checks</h4>
        ${r.elementChecks
          .map(
            (c) => `
        <div class="check">
          <span class="check-icon ${c.found ? "found" : "missing"}">${c.found ? "\u2713" : "\u2717"}</span>
          <span>${c.description}</span>
        </div>
        `
          )
          .join("")}
        `
            : ""
        }

        ${
          r.screenshot
            ? `
        <div class="screenshot">
          <h4>Screenshot</h4>
          <img src="${path.relative(path.dirname(outputPath), r.screenshot)}" alt="${r.name} screenshot" />
        </div>
        `
            : ""
        }

        ${
          r.errors.length > 0
            ? `
        <div style="margin-top: 1rem; color: #991b1b;">
          <strong>Errors:</strong>
          <ul>${r.errors.map((e) => `<li>${e}</li>`).join("")}</ul>
        </div>
        `
            : ""
        }
      </div>
    </div>
    `
      )
      .join("")}

    <p class="timestamp">Generated: ${new Date().toISOString()}</p>
  </div>
</body>
</html>`;

  fs.writeFileSync(outputPath, html);
  return outputPath;
}

/**
 * Main visual testing workflow
 */
async function main() {
  console.log("Agent-Browser Visual Testing");
  console.log("============================");
  console.log(`Base URL: ${baseUrl}\n`);

  // Ensure output directories exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  // Determine pages to test
  let pages = DEFAULT_PAGES;
  if (customPages) {
    pages = customPages.split(",").map((p) => ({
      path: p.trim(),
      name: p.trim().replace(/\//g, "-").replace(/^-/, "") || "home",
      expectedElements: [],
    }));
  }

  console.log(`Testing ${pages.length} page(s)...`);

  const results = [];

  // Test each page
  for (const page of pages) {
    const result = await testPage(page);
    results.push(result);
  }

  // Close browser
  execBrowser(["close"]);

  // Generate reports
  const jsonReportPath = path.join(outputDir, "visual-test-results.json");
  fs.writeFileSync(jsonReportPath, JSON.stringify(results, null, 2));

  const htmlReportPath = path.join(outputDir, "visual-test-report.html");
  generateReport(results, htmlReportPath);

  // Summary
  const passed = results.filter((r) => r.status === "passed").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const errors = results.filter((r) => r.status === "error").length;

  console.log("\n============================");
  console.log("Summary");
  console.log("============================");
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Errors: ${errors}`);
  console.log(`\nReports saved to:`);
  console.log(`  JSON: ${jsonReportPath}`);
  console.log(`  HTML: ${htmlReportPath}`);

  // Exit with error code if any tests failed
  if (failed > 0 || errors > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Visual testing failed:", error);
  process.exit(1);
});
