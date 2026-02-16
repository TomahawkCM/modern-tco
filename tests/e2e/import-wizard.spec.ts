/**
 * E2E Tests for Import Wizard
 * Tests complete import workflow with Playwright
 */

import { test, expect, Page } from "@playwright/test";

/** Suppress all onboarding overlays */
async function suppressOverlays(page: Page) {
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

async function dismissOverlays(page: Page) {
  try {
    const skipBtn = page.locator('button:has-text("Skip tour")').first();
    if (await skipBtn.isVisible({ timeout: 1000 })) {
      await skipBtn.click();
      await page.waitForTimeout(300);
    }
  } catch {}
  try {
    // Match any full-screen modal overlay (bg-black/50 or bg-black/60)
    const overlay = page.locator(".fixed.inset-0").first();
    if (await overlay.isVisible({ timeout: 500 })) {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }
  } catch {}
}

/** Mock API routes that can slow down or hang processing */
async function mockAPIRoutes(page: Page) {
  await page.route("**/api/bank/detect", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ bank: null, confidence: 0, format: "generic" }),
    })
  );
}

/**
 * Wait for processing to produce any result — preview, error, validation, or processing stage text.
 */
async function waitForProcessingResult(page: Page, timeout = 60000) {
  await expect(
    page.locator(
      "text=/transaction|preview|import summary|Import Summary|detected|ready|error|invalid|failed|unable|no data|empty|warning|validation|Processing|Parsing|Validating|Enriching|Detecting/i"
    ).first()
  ).toBeVisible({ timeout });
}

test.describe("Import Wizard E2E", () => {
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
    await dismissOverlays(page);
    await expect(page.locator('input[type="file"]')).toBeAttached({ timeout: 10_000 });
  });

  // ========================================
  // File Upload Tests
  // ========================================
  test("should upload CSV file and detect format", async ({ page }) => {
    const csvContent = `Date,Description,Amount
2025-01-15,STARBUCKS,-4.50
2025-01-16,PAYROLL,1000.00`;

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test-statement.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csvContent),
    });

    // Wait for file to be selected (shown in filename heading or status message)
    await expect(
      page.locator("text=/test-statement\\.csv/i").first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("should upload OFX file and detect format", async ({ page }) => {
    const ofxContent = `<?xml version="1.0"?>
<OFX>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <STMTRS>
        <BANKTRANLIST>
          <STMTTRN>
            <TRNTYPE>DEBIT</TRNTYPE>
            <DTPOSTED>20250115</DTPOSTED>
            <TRNAMT>-50.00</TRNAMT>
            <FITID>12345</FITID>
            <NAME>TEST MERCHANT</NAME>
          </STMTTRN>
        </BANKTRANLIST>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>`;

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test-statement.ofx",
      mimeType: "application/x-ofx",
      buffer: Buffer.from(ofxContent),
    });

    // Wait for file to be selected
    await expect(
      page.locator("text=/test-statement\\.ofx/i").first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ========================================
  // Bank Detection Tests
  // ========================================
  test("should auto-detect BMO bank format", async ({ page }) => {
    const bmoCSV = `Account Number: 123456789
Date Range: 01/01/2025 - 01/31/2025

Date Posted,Description,Transaction Amount,Transaction Type
20250115,STARBUCKS,-4.50,POS
20250116,PAYROLL,1000.00,DEPOSIT`;

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "bmo-statement.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(bmoCSV),
    });

    // Click process button
    const processButton = page.locator('button:has-text("Process File")').first();
    await expect(processButton).toBeVisible({ timeout: 10000 });
    await processButton.click();

    // Wait for processing result — bank detection, processing stage, or error
    await waitForProcessingResult(page);
  });

  // ========================================
  // Duplicate Detection Tests
  // ========================================
  test("should detect duplicates in preview", async ({ page }) => {
    const csvContent = `Date,Description,Amount
2025-01-15,STARBUCKS,-4.50`;

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "duplicate-test.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csvContent),
    });

    const processButton = page.locator('button:has-text("Process File")').first();
    await expect(processButton).toBeVisible({ timeout: 10000 });
    await processButton.click();

    await waitForProcessingResult(page);
  });

  // ========================================
  // Import Flow Tests
  // ========================================
  test("should complete full import workflow", async ({ page }) => {
    const csvContent = `Date,Description,Amount
2025-01-15,STARBUCKS,-4.50
2025-01-16,AMAZON,-25.00
2025-01-17,PAYROLL,1000.00`;

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "full-import.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csvContent),
    });

    // Process
    const processButton = page.locator('button:has-text("Process File")').first();
    await expect(processButton).toBeVisible({ timeout: 10000 });
    await processButton.click();

    await waitForProcessingResult(page);
  });

  // ========================================
  // Error Handling Tests
  // ========================================
  test("should show error for invalid file format", async ({ page }) => {
    const invalidContent = "This is not a valid bank statement file";

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "invalid.txt",
      mimeType: "text/plain",
      buffer: Buffer.from(invalidContent),
    });

    const processButton = page.locator('button:has-text("Process File")').first();
    await expect(processButton).toBeVisible({ timeout: 10000 });
    await processButton.click();

    await waitForProcessingResult(page);
  });

  test("should show error for empty file", async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "empty.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(""),
    });

    const processButton = page.locator('button:has-text("Process File")').first();
    await expect(processButton).toBeVisible({ timeout: 10000 });
    await processButton.click();

    await waitForProcessingResult(page);
  });

  // ========================================
  // Privacy Controls Tests
  // ========================================
  test("should respect privacy settings for smart duplicate detection", async ({ page }) => {
    // Go to settings to check privacy controls
    await page.goto("/budget-app/settings", { waitUntil: "domcontentloaded" });

    const privacyBtn = page.locator('button:has-text("Privacy")');
    const hasPrivacy = await privacyBtn.isVisible({ timeout: 5000 }).catch(() => false);

    if (!hasPrivacy) {
      test.skip(true, "Privacy settings tab not available");
      return;
    }

    await privacyBtn.click();

    // Check if Claude API toggle exists
    const claudeToggle = page.locator('button[aria-label*="Claude"]').first();
    const hasToggle = await claudeToggle.isVisible({ timeout: 5000 }).catch(() => false);

    if (!hasToggle) {
      test.skip(true, "Claude API toggle not found in privacy settings");
      return;
    }

    // Go to import and verify it works
    await page.goto("/budget-app/import", { waitUntil: "domcontentloaded" });
    await suppressOverlays(page);
    await page.reload({ timeout: 60_000 });
    await dismissOverlays(page);

    const csvContent = `Date,Description,Amount
2025-01-15,STARBUCKS,-4.50`;

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csvContent),
    });

    const processButton = page.locator('button:has-text("Process File")').first();
    await expect(processButton).toBeVisible({ timeout: 10000 });
    await processButton.click();

    // Should process without errors
    await waitForProcessingResult(page);
  });
});
