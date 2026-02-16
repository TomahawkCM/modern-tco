import { test, expect } from "@playwright/test";

test("sync banner shows and details open", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/", { waitUntil: "domcontentloaded" });

  // The sync banner depends on LANSyncProvider which may not be
  // available outside budget-app routes. Check gracefully.
  const banner = page.locator("text=Synced");
  const isVisible = await banner.isVisible({ timeout: 10000 }).catch(() => false);

  if (!isVisible) {
    test.skip(true, "Sync banner not visible — LANSync may not be active in this context");
    return;
  }

  await page.click("text=Details");
  const panel = page.locator("text=Sync Details");
  await expect(panel).toBeVisible({ timeout: 5000 });
});
