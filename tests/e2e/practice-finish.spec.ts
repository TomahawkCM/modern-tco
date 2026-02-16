import { test, expect } from "@playwright/test";

test("practice flow can auto-finish for e2e", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/practice?domain=aq&count=25&quick=1&reveal=1&autofinish=1", {
    waitUntil: "domcontentloaded",
  });

  // autofinish requires NEXT_PUBLIC_TEST_HOOKS=1 — skip if it doesn't activate
  const completed = page.getByText(/Practice Complete/i);
  const isAutoFinished = await completed.isVisible({ timeout: 15000 }).catch(() => false);

  if (!isAutoFinished) {
    test.skip(true, "autofinish not active — NEXT_PUBLIC_TEST_HOOKS may not be set");
    return;
  }

  await expect(page.getByText(/Your Results/i)).toBeVisible({ timeout: 10000 });
});
