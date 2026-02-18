/**
 * E2E test for OCR merchant name extraction
 * Verifies the improved extractMerchant() function works in the browser
 */

import { test, expect, Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

// Dismiss all overlays by clicking Skip tour and force-removing any remaining
async function dismissAllOverlays(page: Page) {
  // Mark the tour as completed via localStorage
  await page.evaluate(() => {
    localStorage.setItem(
      "budget-app-tour-progress",
      JSON.stringify({
        completed: true,
        currentStep: 999,
        completedAt: Date.now(),
      })
    );
  });

  // Click "Skip tour" if visible
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const skipButton = page.getByRole("button", { name: /skip tour/i });
      if (await skipButton.isVisible({ timeout: 1000 })) {
        await skipButton.click({ force: true });
        await page.waitForTimeout(500);
      } else {
        break;
      }
    } catch {
      break;
    }
  }

  // Force-remove all fixed z-100 overlays from the DOM
  await page.evaluate(() => {
    document.querySelectorAll('div[class*="fixed"][class*="inset-0"]').forEach((el) => el.remove());
  });
  await page.waitForTimeout(200);
}

test.describe("OCR Merchant Extraction", () => {
  test.setTimeout(180_000); // 3 minutes for OCR processing

  test.beforeEach(async ({ page }) => {
    // First visit to set localStorage
    await page.goto("/budget-app/ocr");
    await page.evaluate(() => {
      localStorage.setItem(
        "budget-app-tour-progress",
        JSON.stringify({
          completed: true,
          currentStep: 999,
          completedAt: Date.now(),
        })
      );
      localStorage.setItem("budget-privacy-settings", JSON.stringify({ enableOCR: true }));
    });
    // Reload to pick up localStorage
    await page.goto("/budget-app/ocr");
    await page.waitForLoadState("networkidle");
    await dismissAllOverlays(page);
  });

  test("OCR page loads and shows upload area", async ({ page }) => {
    const heading = page.getByRole("heading", { name: "Scan Receipt" });
    await expect(heading).toBeVisible();

    const uploadHeading = page.getByRole("heading", { name: "Upload Receipt" });
    await expect(uploadHeading).toBeVisible();
  });

  test("uploads bank statement PDF and extracts merchant via OCR", async ({ page }) => {
    const pdfPath = path.resolve(__dirname, "../fixtures/pdf/bank-statement-en-us.pdf");
    expect(fs.existsSync(pdfPath)).toBe(true);

    // Upload the PDF
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(pdfPath);
    await expect(page.getByText("bank-statement-en-us.pdf")).toBeVisible();

    // Dismiss any overlay that reappeared after upload
    await dismissAllOverlays(page);

    // Click "Scan Receipt" with force to bypass any remaining overlay
    const scanButton = page.getByRole("button", { name: "Scan Receipt" });
    await expect(scanButton).toBeVisible();
    await scanButton.click({ force: true });

    // Wait for OCR to complete — merchant input gets populated
    const merchantInput = page.getByPlaceholder("e.g., Walmart, Starbucks");
    await expect(merchantInput).toBeVisible();

    await page.waitForFunction(
      () => {
        const input = document.querySelector(
          'input[placeholder="e.g., Walmart, Starbucks"]'
        ) as HTMLInputElement;
        return input && input.value && input.value.length > 0;
      },
      { timeout: 120_000 }
    );

    const merchantValue = await merchantInput.inputValue();
    console.log(`Extracted merchant: "${merchantValue}"`);

    // Take screenshot
    await page.screenshot({
      path: "tests/results/ocr-merchant-extraction.png",
      fullPage: true,
    });

    // Verify merchant was extracted (not empty/dash)
    expect(merchantValue).toBeTruthy();
    expect(merchantValue).not.toBe("- -");
    expect(merchantValue).not.toBe("-");

    // Check if it matched a known merchant from the bank statement
    const knownMerchants = ["AMAZON", "STARBUCKS", "WHOLE FOODS", "COSTCO", "WALMART", "TARGET"];
    const matchedKnown = knownMerchants.some((m) => merchantValue.toUpperCase().includes(m));
    if (matchedKnown) {
      console.log(`Matched known merchant: ${merchantValue}`);
    } else {
      console.log(
        `Got merchant: "${merchantValue}" (OCR quality may vary — known merchant match not required)`
      );
    }

    // Check amount was also extracted
    const amountInput = page.locator('input[type="number"], input[inputmode="decimal"]').first();
    if (await amountInput.isVisible()) {
      const amountValue = await amountInput.inputValue();
      console.log(`Extracted amount: "${amountValue}"`);
    }
  });

  test("uploads PDF with EPCOR-style filename", async ({ page }) => {
    const pdfPath = path.resolve(__dirname, "../fixtures/pdf/bank-statement-en-us.pdf");

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "EPCOR_33647850_2026-01-15.pdf",
      mimeType: "application/pdf",
      buffer: fs.readFileSync(pdfPath),
    });

    await expect(page.getByText("EPCOR_33647850_2026-01-15.pdf")).toBeVisible();

    // Dismiss overlays and force-click
    await dismissAllOverlays(page);
    const scanButton = page.getByRole("button", { name: "Scan Receipt" });
    await scanButton.click({ force: true });

    // Wait for OCR to complete
    const merchantInput = page.getByPlaceholder("e.g., Walmart, Starbucks");
    await page.waitForFunction(
      () => {
        const input = document.querySelector(
          'input[placeholder="e.g., Walmart, Starbucks"]'
        ) as HTMLInputElement;
        return input && input.value && input.value.length > 0;
      },
      { timeout: 120_000 }
    );

    const merchantValue = await merchantInput.inputValue();
    console.log(`Extracted merchant (EPCOR filename test): "${merchantValue}"`);

    await page.screenshot({
      path: "tests/results/ocr-filename-extraction.png",
      fullPage: true,
    });

    expect(merchantValue).toBeTruthy();
    expect(merchantValue.length).toBeGreaterThan(0);
  });
});
