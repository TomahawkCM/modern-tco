import { test, expect } from "@playwright/test";

test("back/forward works between modules", async ({ page }) => {
  test.setTimeout(60_000);

  // Navigate to asking-questions module
  await page.goto("/modules/asking-questions", { waitUntil: "domcontentloaded" });
  await expect(page.locator("h1")).toContainText(/Asking Questions/i, { timeout: 30000 });

  // Navigate to refining module via direct URL
  await page.goto("/modules/refining-questions-targeting", { waitUntil: "domcontentloaded" });
  await expect(page.locator("h1")).toContainText(/Refining Questions/i, { timeout: 30000 });

  // Test browser back navigation
  await page.goBack();
  await expect(page.locator("h1")).toContainText(/Asking Questions/i, { timeout: 30000 });

  // Test browser forward navigation
  await page.goForward();
  await expect(page.locator("h1")).toContainText(/Refining Questions/i, { timeout: 30000 });
});
