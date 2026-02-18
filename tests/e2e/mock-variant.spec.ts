import { test, expect } from "@playwright/test";

test("mock variant C is reachable", async ({ page }) => {
  await page.goto("/mock?variant=C");
  await expect(page.getByRole("heading", { name: /Mock Exam/i })).toBeVisible({ timeout: 15000 });
  // There should be a Start button
  await expect(page.getByRole("button", { name: /Start Mock Exam/i })).toBeVisible();
});
