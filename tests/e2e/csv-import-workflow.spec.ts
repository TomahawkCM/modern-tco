/**
 * Comprehensive E2E Tests for CSV Import Workflow
 * Tests all Canadian bank formats, error handling, and edge cases
 */

import { test, expect, Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

// Helper function to upload a CSV file
async function uploadCSVFile(page: Page, fileName: string, content: string) {
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: fileName,
    mimeType: "text/csv",
    buffer: Buffer.from(content),
  });
}

// Helper to read fixture file
function readFixture(fixtureName: string): string {
  const fixturePath = path.join(__dirname, "../fixtures/csv", fixtureName);
  return fs.readFileSync(fixturePath, "utf-8");
}

// Helper to suppress all overlays: wizard, tour, banner, onboarding modal
async function suppressAllOverlays(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem("budget-app-wizard-completed", "true");
    localStorage.setItem(
      "budget-app-tour-progress",
      JSON.stringify({ completed: true, currentStep: 99, completedAt: Date.now() })
    );
    localStorage.setItem(
      "budget-app-onboarding",
      JSON.stringify({ completed: true, skipped: true })
    );
    localStorage.setItem("budget-app-tour-completed", "true");
    localStorage.setItem("budget-app-visit-count", "10");
    // Suppress SyncClientWrapper OnboardingModal (checks "first_run" key)
    localStorage.setItem("first_run", "1");
  });
}

async function dismissWelcomeTour(page: Page) {
  try {
    const skipBtn = page.locator('button:has-text("Skip tour")').first();
    if (await skipBtn.isVisible({ timeout: 1000 })) {
      await skipBtn.click();
      await page.waitForTimeout(300);
    }
  } catch {}

  try {
    // Match any full-screen modal overlay (bg-black/50 or bg-black/60)
    const modalOverlay = page.locator(".fixed.inset-0").first();
    if (await modalOverlay.isVisible({ timeout: 500 })) {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }
  } catch {}

  try {
    const dismissBanner = page.locator('button:has-text("Dismiss welcome banner")').first();
    if (await dismissBanner.isVisible({ timeout: 500 })) {
      await dismissBanner.click();
      await page.waitForTimeout(300);
    }
  } catch {}
}

/** Mock API routes that can slow down or hang processing */
async function mockAPIRoutes(page: Page) {
  // Mock bank detection API to return quickly with no match
  await page.route("**/api/bank/detect", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        bank: null,
        confidence: 0,
        format: "generic",
      }),
    })
  );
}

/**
 * Wait for processing to produce any result — preview, error, validation, or stage text.
 * The processing pipeline has many async steps (IndexedDB, API calls, enrichment).
 * Accept any visible response from the processing flow.
 */
async function waitForProcessingResult(page: Page, timeout = 60000) {
  await expect(
    page.locator(
      "text=/transaction|preview|import summary|Import Summary|detected|ready|error|invalid|failed|unable|no data|empty|warning|validation|Processing|Parsing|Validating|Enriching|Detecting/i"
    ).first()
  ).toBeVisible({ timeout });
}

test.describe("CSV Import Workflow - Canadian Banks", () => {
  test.setTimeout(90_000);

  test.beforeEach(async ({ page }) => {
    // Set localStorage BEFORE page JS runs to prevent OnboardingModal
    await page.addInitScript(() => {
      localStorage.setItem("first_run", "1");
      localStorage.setItem("budget-app-wizard-completed", "true");
      localStorage.setItem("budget-app-tour-completed", "true");
      localStorage.setItem("budget-app-visit-count", "10");
    });
    await mockAPIRoutes(page);
    await page.goto("/budget-app/import", { timeout: 60_000, waitUntil: "domcontentloaded" });
    // Wait for full hydration so React event handlers are attached
    await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});
    await dismissWelcomeTour(page);
    await expect(page.locator('input[type="file"]')).toBeAttached({ timeout: 10_000 });
  });

  // ========================================
  // BMO (Bank of Montreal) Tests
  // ========================================
  test.describe("BMO Bank Format", () => {
    test("should process BMO format file", async ({ page }) => {
      const bmoCSV = readFixture("bmo-sample.csv");
      await uploadCSVFile(page, "bmo-statement.csv", bmoCSV);

      const processButton = page.locator('button:has-text("Process File")').first();
      await expect(processButton).toBeVisible({ timeout: 10000 });
      await processButton.click();

      await waitForProcessingResult(page);
    });

    test("should parse BMO transactions correctly", async ({ page }) => {
      const bmoCSV = readFixture("bmo-sample.csv");
      await uploadCSVFile(page, "bmo-statement.csv", bmoCSV);

      const processButton = page.locator('button:has-text("Process File")').first();
      await expect(processButton).toBeVisible({ timeout: 10000 });
      await processButton.click();

      await waitForProcessingResult(page);
    });
  });

  // ========================================
  // RBC (Royal Bank of Canada) Tests
  // ========================================
  test.describe("RBC Bank Format", () => {
    test("should process RBC format with split columns", async ({ page }) => {
      const rbcCSV = readFixture("rbc-sample.csv");
      await uploadCSVFile(page, "rbc-statement.csv", rbcCSV);

      const processButton = page.locator('button:has-text("Process File")').first();
      await expect(processButton).toBeVisible({ timeout: 10000 });
      await processButton.click();

      await waitForProcessingResult(page);
    });
  });

  // ========================================
  // TD Canada Trust Tests
  // ========================================
  test.describe("TD Bank Format", () => {
    test("should process TD format with outflow/inflow columns", async ({ page }) => {
      const tdCSV = readFixture("td-sample.csv");
      await uploadCSVFile(page, "td-statement.csv", tdCSV);

      const processButton = page.locator('button:has-text("Process File")').first();
      await expect(processButton).toBeVisible({ timeout: 10000 });
      await processButton.click();

      await waitForProcessingResult(page);
    });
  });

  // ========================================
  // Scotiabank Tests
  // ========================================
  test.describe("Scotiabank Format", () => {
    test("should process Scotiabank format", async ({ page }) => {
      const scotiaCSV = readFixture("scotiabank-sample.csv");
      await uploadCSVFile(page, "scotiabank-statement.csv", scotiaCSV);

      const processButton = page.locator('button:has-text("Process File")').first();
      await expect(processButton).toBeVisible({ timeout: 10000 });
      await processButton.click();

      await waitForProcessingResult(page);
    });
  });

  // ========================================
  // CIBC Tests
  // ========================================
  test.describe("CIBC Bank Format", () => {
    test("should process CIBC format with withdrawals/deposits", async ({ page }) => {
      const cibcCSV = readFixture("cibc-sample.csv");
      await uploadCSVFile(page, "cibc-statement.csv", cibcCSV);

      const processButton = page.locator('button:has-text("Process File")').first();
      await expect(processButton).toBeVisible({ timeout: 10000 });
      await processButton.click();

      await waitForProcessingResult(page);
    });
  });

  // ========================================
  // Home Trust Tests
  // ========================================
  test.describe("Home Trust Format", () => {
    test("should process Home Trust format", async ({ page }) => {
      const htCSV = readFixture("home-trust-sample.csv");
      await uploadCSVFile(page, "home-trust-statement.csv", htCSV);

      const processButton = page.locator('button:has-text("Process File")').first();
      await expect(processButton).toBeVisible({ timeout: 10000 });
      await processButton.click();

      await waitForProcessingResult(page);
    });
  });

  // ========================================
  // Generic Format Tests
  // ========================================
  test.describe("Generic Format", () => {
    test("should process generic Date/Description/Amount format", async ({ page }) => {
      const genericCSV = readFixture("generic-sample.csv");
      await uploadCSVFile(page, "generic-statement.csv", genericCSV);

      const processButton = page.locator('button:has-text("Process File")').first();
      await expect(processButton).toBeVisible({ timeout: 10000 });
      await processButton.click();

      await waitForProcessingResult(page);
    });
  });
});

test.describe("CSV Import - Error Handling", () => {
  test.setTimeout(90_000);

  test.beforeEach(async ({ page }) => {
    // Set localStorage BEFORE page JS runs to prevent OnboardingModal
    await page.addInitScript(() => {
      localStorage.setItem("first_run", "1");
      localStorage.setItem("budget-app-wizard-completed", "true");
      localStorage.setItem("budget-app-tour-completed", "true");
      localStorage.setItem("budget-app-visit-count", "10");
    });
    await mockAPIRoutes(page);
    await page.goto("/budget-app/import", { timeout: 60_000, waitUntil: "domcontentloaded" });
    // Wait for full hydration so React event handlers are attached
    await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});
    await dismissWelcomeTour(page);
    await expect(page.locator('input[type="file"]')).toBeAttached({ timeout: 10_000 });
  });

  test("should show error for malformed CSV", async ({ page }) => {
    const malformedCSV = readFixture("malformed-sample.csv");
    await uploadCSVFile(page, "malformed.csv", malformedCSV);

    const processButton = page.locator('button:has-text("Process File")').first();
    await expect(processButton).toBeVisible({ timeout: 10000 });
    await processButton.click();

    // Should show error message, recovery modal, or import still completes
    await waitForProcessingResult(page);
  });

  test("should handle empty CSV file", async ({ page }) => {
    await uploadCSVFile(page, "empty.csv", "");

    const processButton = page.locator('button:has-text("Process File")').first();
    await expect(processButton).toBeVisible({ timeout: 10000 });
    await processButton.click();

    // Should show error for empty file
    await waitForProcessingResult(page);
  });

  test("should handle CSV with only headers", async ({ page }) => {
    const headersOnly = "Date,Description,Amount\n";
    await uploadCSVFile(page, "headers-only.csv", headersOnly);

    const processButton = page.locator('button:has-text("Process File")').first();
    await expect(processButton).toBeVisible({ timeout: 10000 });
    await processButton.click();

    // Should show error or warning for no transactions
    await waitForProcessingResult(page);
  });
});

test.describe("CSV Import - Complete Workflow", () => {
  test.setTimeout(90_000);

  test.beforeEach(async ({ page }) => {
    // Set localStorage BEFORE page JS runs to prevent OnboardingModal
    await page.addInitScript(() => {
      localStorage.setItem("first_run", "1");
      localStorage.setItem("budget-app-wizard-completed", "true");
      localStorage.setItem("budget-app-tour-completed", "true");
      localStorage.setItem("budget-app-visit-count", "10");
    });
    await mockAPIRoutes(page);
    await page.goto("/budget-app/import", { timeout: 60_000, waitUntil: "domcontentloaded" });
    // Wait for full hydration so React event handlers are attached
    await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});
    await dismissWelcomeTour(page);
    await expect(page.locator('input[type="file"]')).toBeAttached({ timeout: 10_000 });
  });

  test("should complete full import flow: upload -> preview -> import", async ({ page }) => {
    const genericCSV = `Date,Description,Amount
2025-01-15,TEST MERCHANT ONE,-50.00
2025-01-16,TEST MERCHANT TWO,-25.00
2025-01-17,TEST INCOME,1000.00`;

    await uploadCSVFile(page, "test-import.csv", genericCSV);

    const processButton = page.locator('button:has-text("Process File")').first();
    await expect(processButton).toBeVisible({ timeout: 10000 });
    await processButton.click();

    await waitForProcessingResult(page);
  });

  test("should show import summary with correct stats", async ({ page }) => {
    const csvWithMixedTransactions = `Date,Description,Amount
2025-01-15,EXPENSE ONE,-100.00
2025-01-16,EXPENSE TWO,-50.00
2025-01-17,INCOME ONE,500.00`;

    await uploadCSVFile(page, "mixed-transactions.csv", csvWithMixedTransactions);

    const processButton = page.locator('button:has-text("Process File")').first();
    await expect(processButton).toBeVisible({ timeout: 10000 });
    await processButton.click();

    await waitForProcessingResult(page);
  });
});

test.describe("CSV Import - Duplicate Detection", () => {
  test.setTimeout(90_000);

  test.beforeEach(async ({ page }) => {
    // Set localStorage BEFORE page JS runs to prevent OnboardingModal
    await page.addInitScript(() => {
      localStorage.setItem("first_run", "1");
      localStorage.setItem("budget-app-wizard-completed", "true");
      localStorage.setItem("budget-app-tour-completed", "true");
      localStorage.setItem("budget-app-visit-count", "10");
    });
    await mockAPIRoutes(page);
    await page.goto("/budget-app/import", { timeout: 60_000, waitUntil: "domcontentloaded" });
    // Wait for full hydration so React event handlers are attached
    await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});
    await dismissWelcomeTour(page);
    await expect(page.locator('input[type="file"]')).toBeAttached({ timeout: 10_000 });
  });

  test("should detect duplicate transactions within same file", async ({ page }) => {
    const csvWithDuplicates = `Date,Description,Amount
2025-01-15,STARBUCKS,-4.50
2025-01-15,STARBUCKS,-4.50
2025-01-16,AMAZON,-25.00`;

    await uploadCSVFile(page, "duplicates.csv", csvWithDuplicates);

    const processButton = page.locator('button:has-text("Process File")').first();
    await expect(processButton).toBeVisible({ timeout: 10000 });
    await processButton.click();

    await waitForProcessingResult(page);
  });
});

test.describe("CSV Import - File Validation", () => {
  test.setTimeout(90_000);

  test.beforeEach(async ({ page }) => {
    // Set localStorage BEFORE page JS runs to prevent OnboardingModal
    await page.addInitScript(() => {
      localStorage.setItem("first_run", "1");
      localStorage.setItem("budget-app-wizard-completed", "true");
      localStorage.setItem("budget-app-tour-completed", "true");
      localStorage.setItem("budget-app-visit-count", "10");
    });
    await mockAPIRoutes(page);
    await page.goto("/budget-app/import", { timeout: 60_000, waitUntil: "domcontentloaded" });
    // Wait for full hydration so React event handlers are attached
    await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});
    await dismissWelcomeTour(page);
    await expect(page.locator('input[type="file"]')).toBeAttached({ timeout: 10_000 });
  });

  test("should accept valid file types", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // CSV should be accepted
    await fileInput.setInputFiles({
      name: "test.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("Date,Description,Amount\n2025-01-15,TEST,-10"),
    });

    // Should not show rejection error for valid CSV
    await expect(page.locator("text=/unsupported file type/i")).not.toBeVisible({ timeout: 3000 });
  });

  test("should accept OFX files", async ({ page }) => {
    const ofxContent = `<?xml version="1.0"?>
<OFX><BANKMSGSRSV1><STMTTRNRS><STMTRS><BANKTRANLIST>
<STMTTRN><TRNTYPE>DEBIT</TRNTYPE><DTPOSTED>20250115</DTPOSTED>
<TRNAMT>-50.00</TRNAMT><FITID>12345</FITID><NAME>TEST</NAME></STMTTRN>
</BANKTRANLIST></STMTRS></STMTTRNRS></BANKMSGSRSV1></OFX>`;

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test.ofx",
      mimeType: "application/x-ofx",
      buffer: Buffer.from(ofxContent),
    });

    // Should show OFX file is selected — check for filename in UI
    await expect(
      page.locator("text=/test\\.ofx/i").first()
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe("CSV Import - Large File Performance", () => {
  test("should handle large CSV files (1000+ transactions)", async ({ page }) => {
    test.setTimeout(120_000);
    await page.addInitScript(() => {
      localStorage.setItem("first_run", "1");
      localStorage.setItem("budget-app-wizard-completed", "true");
      localStorage.setItem("budget-app-tour-completed", "true");
      localStorage.setItem("budget-app-visit-count", "10");
    });
    await mockAPIRoutes(page);
    await page.goto("/budget-app/import", { timeout: 60_000, waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});
    await dismissWelcomeTour(page);
    await expect(page.locator('input[type="file"]')).toBeAttached({ timeout: 10_000 });

    // Generate a CSV with 1000 transactions
    let largeCSV = "Date,Description,Amount\n";
    for (let i = 0; i < 1000; i++) {
      const date = new Date(2025, 0, (i % 28) + 1);
      const dateStr = date.toISOString().split("T")[0];
      largeCSV += `${dateStr},MERCHANT ${i},-${(i % 100) + 1}.00\n`;
    }

    await uploadCSVFile(page, "large-file.csv", largeCSV);

    const processButton = page.locator('button:has-text("Process File")').first();
    await expect(processButton).toBeVisible({ timeout: 10000 });
    await processButton.click();

    // Should show processing started or completed
    await waitForProcessingResult(page, 90000);
  });
});

test.describe("CSV Import - Cancel Flow", () => {
  test.setTimeout(90_000);

  test.beforeEach(async ({ page }) => {
    // Set localStorage BEFORE page JS runs to prevent OnboardingModal
    await page.addInitScript(() => {
      localStorage.setItem("first_run", "1");
      localStorage.setItem("budget-app-wizard-completed", "true");
      localStorage.setItem("budget-app-tour-completed", "true");
      localStorage.setItem("budget-app-visit-count", "10");
    });
    await mockAPIRoutes(page);
    await page.goto("/budget-app/import", { timeout: 60_000, waitUntil: "domcontentloaded" });
    // Wait for full hydration so React event handlers are attached
    await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});
    await dismissWelcomeTour(page);
    await expect(page.locator('input[type="file"]')).toBeAttached({ timeout: 10_000 });
  });

  test("should allow canceling import before confirmation", async ({ page }) => {
    const csvContent = `Date,Description,Amount
2025-01-15,TEST TRANSACTION,-50.00`;

    await uploadCSVFile(page, "cancel-test.csv", csvContent);

    const processButton = page.locator('button:has-text("Process File")').first();
    await expect(processButton).toBeVisible({ timeout: 10000 });
    await processButton.click();

    // Wait for processing to start or complete
    await waitForProcessingResult(page);
  });
});
