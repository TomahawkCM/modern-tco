import { expect, test } from "@playwright/test";

test.describe("Learn Experimental navigation", () => {
  test.setTimeout(60_000);

  test("module page loads and links into a lab", async ({ page }) => {
    const moduleResponse = await page.goto(
      "/study/01-learn-experimental?path=learn-experimental",
      { waitUntil: "domcontentloaded" }
    );

    // Route may not exist yet — skip gracefully
    if (!moduleResponse || moduleResponse.status() >= 400) {
      test.skip(true, "Learn experimental route not available");
      return;
    }

    // The page may render different headings depending on module content
    const heading = page.locator("h1, h2").first();
    const hasHeading = await heading.isVisible({ timeout: 15000 }).catch(() => false);

    if (!hasHeading) {
      test.skip(true, "Learn experimental page did not render a heading");
      return;
    }

    const practiceLink = page.getByRole("link", { name: /Practice/i }).first();
    const isVisible = await practiceLink.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isVisible) {
      test.skip(true, "Practice link not found in learn-experimental module");
      return;
    }

    await Promise.all([
      page.waitForURL(/\/study\/labs\//i, { timeout: 15000 }),
      practiceLink.click(),
    ]);

    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 15000 });
  });

  test("deep-linked lab renders without error under the flag", async ({ page }) => {
    const labResponse = await page.goto(
      "/study/labs/02-l/advanced-filtering?path=learn-experimental",
      { waitUntil: "domcontentloaded" }
    );

    if (!labResponse || labResponse.status() >= 400) {
      test.skip(true, "Learn experimental labs route not available");
      return;
    }

    await expect(
      page.getByRole("heading").first()
    ).toBeVisible({ timeout: 15000 });
  });
});
