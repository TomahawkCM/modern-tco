import { test, expect } from "@playwright/test";

test("back/forward works between modules", async ({ page }) => {
  // Navigate to asking-questions module
  await page.goto("/modules/asking-questions", { waitUntil: "networkidle" });
  await expect(page.locator("h1")).toContainText(/Asking Questions/i);

  // Navigate to refining module via direct URL (sidebar navigation doesn't expose module links directly)
  await page.goto("/modules/refining-questions-targeting", { waitUntil: "networkidle" });
  await expect(page.locator("h1")).toContainText(/Refining Questions/i);

  // Test browser back navigation
  await page.goBack();
  await expect(page.locator("h1")).toContainText(/Asking Questions/i);

  // Test browser forward navigation
  await page.goForward();
  await expect(page.locator("h1")).toContainText(/Refining Questions/i);
});
