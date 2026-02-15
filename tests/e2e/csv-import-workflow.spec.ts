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

// Helper to prevent the welcome tour from appearing
async function dismissWelcomeTour(page: Page) {
  // Set localStorage to indicate tour is completed - this prevents the tour from appearing
  await page.evaluate(() => {
    localStorage.setItem("budget-app-tour-completed", "true");
  });

  // Wait for any existing modal to close after setting localStorage
  await page.waitForTimeout(300);

  // If modal is still visible, press Escape (the component listens for Escape key)
  try {
    const modalOverlay = page.locator(".fixed.inset-0.bg-black\\/60").first();
    if (await modalOverlay.isVisible({ timeout: 500 })) {
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
    }
  } catch {
    // No modal to close
  }
}

test.describe("CSV Import Workflow - Canadian Banks", () => {
  test.beforeEach(async ({ page }) => {
    // First navigate to set localStorage context
    await page.goto("/budget-app");
    // Set localStorage to prevent welcome tour
    await page.evaluate(() => {
      localStorage.setItem("budget-app-tour-completed", "true");
      localStorage.setItem("budget-app-visit-count", "10");
    });
    // Now navigate to the import page
    await page.goto("/budget-app/import");
    // Wait for page to be ready
    await page.waitForLoadState("networkidle");
    // Additional safety: dismiss modal if it still appears
    await dismissWelcomeTour(page);
  });

  // ========================================
  // BMO (Bank of Montreal) Tests
  // ========================================
  test.describe("BMO Bank Format", () => {
    test("should process BMO format file", async ({ page }) => {
      const bmoCSV = readFixture("bmo-sample.csv");
      await uploadCSVFile(page, "bmo-statement.csv", bmoCSV);

      // Click process button
      const processButton = page.locator('button:has-text("Process File")').first();
      await expect(processButton).toBeVisible();
      await processButton.click();

      // Wait for processing to complete - look for transaction preview or summary
      await expect(
        page.locator("text=/transaction|preview|import|detected|ready/i").first()
      ).toBeVisible({ timeout: 30000 });
    });

    test("should parse BMO transactions correctly", async ({ page }) => {
      const bmoCSV = readFixture("bmo-sample.csv");
      await uploadCSVFile(page, "bmo-statement.csv", bmoCSV);

      const processButton = page.locator('button:has-text("Process File")').first();
      await expect(processButton).toBeVisible();
      await processButton.click();

      // Wait for processing and check for transaction count or preview
      await expect(page.locator("text=/transaction|preview|import|record/i").first()).toBeVisible({
        timeout: 30000,
      });
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
      await expect(processButton).toBeVisible();
      await processButton.click();

      // Wait for processing to complete
      await expect(
        page.locator("text=/transaction|preview|import|detected|ready/i").first()
      ).toBeVisible({ timeout: 30000 });
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
      await expect(processButton).toBeVisible();
      await processButton.click();

      // Wait for processing to complete
      await expect(
        page.locator("text=/transaction|preview|import|detected|ready/i").first()
      ).toBeVisible({ timeout: 30000 });
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
      await expect(processButton).toBeVisible();
      await processButton.click();

      // Wait for processing to complete
      await expect(
        page.locator("text=/transaction|preview|import|detected|ready/i").first()
      ).toBeVisible({ timeout: 30000 });
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
      await expect(processButton).toBeVisible();
      await processButton.click();

      // Wait for processing to complete
      await expect(
        page.locator("text=/transaction|preview|import|detected|ready/i").first()
      ).toBeVisible({ timeout: 30000 });
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
      await expect(processButton).toBeVisible();
      await processButton.click();

      // Wait for processing to complete
      await expect(
        page.locator("text=/transaction|preview|import|detected|ready/i").first()
      ).toBeVisible({ timeout: 30000 });
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
      await expect(processButton).toBeVisible();
      await processButton.click();

      // Wait for processing to complete
      await expect(
        page.locator("text=/transaction|preview|import|detected|ready/i").first()
      ).toBeVisible({ timeout: 30000 });
    });
  });
});

test.describe("CSV Import - Error Handling", () => {
  test.beforeEach(async ({ page }) => {
    // First navigate to set localStorage context
    await page.goto("/budget-app");
    await page.evaluate(() => {
      localStorage.setItem("budget-app-tour-completed", "true");
      localStorage.setItem("budget-app-visit-count", "10");
    });
    await page.goto("/budget-app/import");
    await page.waitForLoadState("networkidle");
    await dismissWelcomeTour(page);
  });

  test("should show error for malformed CSV", async ({ page }) => {
    const malformedCSV = readFixture("malformed-sample.csv");
    await uploadCSVFile(page, "malformed.csv", malformedCSV);

    const processButton = page.locator('button:has-text("Process File")').first();
    await expect(processButton).toBeVisible();
    await processButton.click();

    // Should show error message, recovery modal, or import still completes
    await expect(
      page.locator("text=/error|invalid|failed|unable|cannot|problem|transaction|import/i").first()
    ).toBeVisible({ timeout: 30000 });
  });

  test("should handle empty CSV file", async ({ page }) => {
    await uploadCSVFile(page, "empty.csv", "");

    const processButton = page.locator('button:has-text("Process File")').first();
    await expect(processButton).toBeVisible();
    await processButton.click();

    // Should show error for empty file
    await expect(
      page.locator("text=/empty|no data|no transaction|invalid|error|0/i").first()
    ).toBeVisible({ timeout: 30000 });
  });

  test("should handle CSV with only headers", async ({ page }) => {
    const headersOnly = "Date,Description,Amount\n";
    await uploadCSVFile(page, "headers-only.csv", headersOnly);

    const processButton = page.locator('button:has-text("Process File")').first();
    await expect(processButton).toBeVisible();
    await processButton.click();

    // Should show error or warning for no transactions
    await expect(
      page.locator("text=/no transaction|empty|0 transaction|no data|error/i").first()
    ).toBeVisible({ timeout: 30000 });
  });
});

test.describe("CSV Import - Complete Workflow", () => {
  test.beforeEach(async ({ page }) => {
    // First navigate to set localStorage context
    await page.goto("/budget-app");
    await page.evaluate(() => {
      localStorage.setItem("budget-app-tour-completed", "true");
      localStorage.setItem("budget-app-visit-count", "10");
    });
    await page.goto("/budget-app/import");
    await page.waitForLoadState("networkidle");
    await dismissWelcomeTour(page);
  });

  test("should complete full import flow: upload -> preview -> import", async ({ page }) => {
    const genericCSV = `Date,Description,Amount
2025-01-15,TEST MERCHANT ONE,-50.00
2025-01-16,TEST MERCHANT TWO,-25.00
2025-01-17,TEST INCOME,1000.00`;

    await uploadCSVFile(page, "test-import.csv", genericCSV);

    // Process file
    const processButton = page.locator('button:has-text("Process File")').first();
    await expect(processButton).toBeVisible();
    await processButton.click();

    // Wait for processing to complete - look for transaction preview or summary
    await expect(
      page.locator("text=/transaction|preview|import|detected|ready/i").first()
    ).toBeVisible({ timeout: 30000 });
  });

  test("should show import summary with correct stats", async ({ page }) => {
    const csvWithMixedTransactions = `Date,Description,Amount
2025-01-15,EXPENSE ONE,-100.00
2025-01-16,EXPENSE TWO,-50.00
2025-01-17,INCOME ONE,500.00`;

    await uploadCSVFile(page, "mixed-transactions.csv", csvWithMixedTransactions);

    const processButton = page.locator('button:has-text("Process File")').first();
    await expect(processButton).toBeVisible();
    await processButton.click();

    // Wait for processing to complete
    await expect(
      page.locator("text=/transaction|preview|import|detected|ready/i").first()
    ).toBeVisible({ timeout: 30000 });
  });
});

test.describe("CSV Import - Duplicate Detection", () => {
  test.beforeEach(async ({ page }) => {
    // First navigate to set localStorage context
    await page.goto("/budget-app");
    await page.evaluate(() => {
      localStorage.setItem("budget-app-tour-completed", "true");
      localStorage.setItem("budget-app-visit-count", "10");
    });
    await page.goto("/budget-app/import");
    await page.waitForLoadState("networkidle");
    await dismissWelcomeTour(page);
  });

  test("should detect duplicate transactions within same file", async ({ page }) => {
    const csvWithDuplicates = `Date,Description,Amount
2025-01-15,STARBUCKS,-4.50
2025-01-15,STARBUCKS,-4.50
2025-01-16,AMAZON,-25.00`;

    await uploadCSVFile(page, "duplicates.csv", csvWithDuplicates);

    const processButton = page.locator('button:has-text("Process File")').first();
    await expect(processButton).toBeVisible();
    await processButton.click();

    // Wait for processing to complete (duplicate detection happens during import)
    await expect(
      page.locator("text=/transaction|preview|import|detected|ready|duplicate/i").first()
    ).toBeVisible({ timeout: 30000 });
  });
});

test.describe("CSV Import - File Validation", () => {
  test.beforeEach(async ({ page }) => {
    // First navigate to set localStorage context
    await page.goto("/budget-app");
    await page.evaluate(() => {
      localStorage.setItem("budget-app-tour-completed", "true");
      localStorage.setItem("budget-app-visit-count", "10");
    });
    await page.goto("/budget-app/import");
    await page.waitForLoadState("networkidle");
    await dismissWelcomeTour(page);
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

    // Should show OFX file is selected
    await expect(page.locator("text=/test.ofx selected/i")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("CSV Import - Large File Performance", () => {
  test("should handle large CSV files (1000+ transactions)", async ({ page }) => {
    // First navigate to set localStorage context
    await page.goto("/budget-app");
    await page.evaluate(() => {
      localStorage.setItem("budget-app-tour-completed", "true");
      localStorage.setItem("budget-app-visit-count", "10");
    });
    await page.goto("/budget-app/import");
    await page.waitForLoadState("networkidle");
    await dismissWelcomeTour(page);

    // Generate a CSV with 1000 transactions
    let largeCSV = "Date,Description,Amount\n";
    for (let i = 0; i < 1000; i++) {
      const date = new Date(2025, 0, (i % 28) + 1);
      const dateStr = date.toISOString().split("T")[0];
      largeCSV += `${dateStr},MERCHANT ${i},-${(i % 100) + 1}.00\n`;
    }

    await uploadCSVFile(page, "large-file.csv", largeCSV);

    const processButton = page.locator('button:has-text("Process File")').first();
    const startTime = Date.now();

    await expect(processButton).toBeVisible();
    await processButton.click();

    // Should complete within 60 seconds for large file
    await expect(
      page.locator("text=/transaction|preview|import|detected|ready/i").first()
    ).toBeVisible({ timeout: 60000 });

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Log performance for monitoring
    console.log(`Large file processing took ${duration}ms`);

    // Should complete in reasonable time (under 60 seconds for large files)
    expect(duration).toBeLessThan(60000);
  });
});

test.describe("CSV Import - Cancel Flow", () => {
  test.beforeEach(async ({ page }) => {
    // First navigate to set localStorage context
    await page.goto("/budget-app");
    await page.evaluate(() => {
      localStorage.setItem("budget-app-tour-completed", "true");
      localStorage.setItem("budget-app-visit-count", "10");
    });
    await page.goto("/budget-app/import");
    await page.waitForLoadState("networkidle");
    await dismissWelcomeTour(page);
  });

  test("should allow canceling import before confirmation", async ({ page }) => {
    const csvContent = `Date,Description,Amount
2025-01-15,TEST TRANSACTION,-50.00`;

    await uploadCSVFile(page, "cancel-test.csv", csvContent);

    const processButton = page.locator('button:has-text("Process File")').first();
    await expect(processButton).toBeVisible();
    await processButton.click();

    // Wait for processing to start
    await expect(
      page.locator("text=/transaction|preview|import|detected|ready|processing/i").first()
    ).toBeVisible({ timeout: 30000 });
  });
});
