import { test, expect } from "@playwright/test";

test("onboarding modal appears on first run and can be dismissed", async ({ page }) => {
  await page.goto("/");
  // Wait for onboarding modal
  const modal = page.locator("text=Welcome — Your money, your control");
  await expect(modal).toBeVisible();
  // Dismiss
  await page.click('button:has-text("Set up my accounts")');
  await expect(modal).not.toBeVisible();
});
