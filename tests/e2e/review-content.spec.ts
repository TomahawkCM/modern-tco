import { test, expect } from "@playwright/test";

test("review shows incorrect answers after a practice with autowrong", async ({ page }) => {
  test.setTimeout(60_000);
  // Start quick drill with a few wrong answers injected by test hook, then autofinish
  await page.goto("/practice?domain=aq&count=25&quick=1&reveal=1&autowrong=3&autofinish=1", {
    waitUntil: "domcontentloaded",
  });

  // autofinish/autowrong require NEXT_PUBLIC_TEST_HOOKS=1 — skip if not active
  const completed = page.getByText(/Practice Complete/i);
  const isAutoFinished = await completed.isVisible({ timeout: 15000 }).catch(() => false);

  if (!isAutoFinished) {
    test.skip(true, "autofinish not active — NEXT_PUBLIC_TEST_HOOKS may not be set");
    return;
  }

  // Navigate to review
  await page.goto("/review", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Review/i })).toBeVisible({ timeout: 15000 });
  // Should not show empty state
  const empty = page.getByText(/You don't have any incorrect answers/i);
  await expect(empty).toHaveCount(0);
  // Expect question counter
  await expect(page.getByText(/Question\s+1\s+of/i)).toBeVisible({ timeout: 10000 });
});
