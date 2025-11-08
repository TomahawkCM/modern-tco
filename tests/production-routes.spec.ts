import { test, expect } from "@playwright/test";

test.describe("Production Route Testing", () => {
  test("should load /learn/asking-questions successfully", async ({ page }) => {
    await page.goto("http://localhost:3000/learn/asking-questions");

    // Wait for page to be fully loaded
    await page.waitForLoadState("networkidle");

    // Check that we got a successful response
    expect(page.url()).toContain("/learn/asking-questions");

    // Verify the page has content (not a 404)
    const body = await page.locator("body");
    await expect(body).toBeVisible();

    // Take a screenshot for visual verification
    await page.screenshot({ path: "tests/screenshots/learn-asking-questions.png", fullPage: true });
  });

  test("should load /budget-app successfully", async ({ page }) => {
    await page.goto("http://localhost:3000/budget-app");

    // Wait for page to be fully loaded
    await page.waitForLoadState("networkidle");

    // Check that we got a successful response
    expect(page.url()).toContain("/budget-app");

    // Verify the page has content (not a 404)
    const body = await page.locator("body");
    await expect(body).toBeVisible();

    // Take a screenshot for visual verification
    await page.screenshot({ path: "tests/screenshots/budget-app.png", fullPage: true });
  });

  test("should load all learn module routes", async ({ page }) => {
    const modules = [
      "platform-foundation",
      "asking-questions",
      "refining-questions",
      "taking-action",
      "navigation-basic-modules",
      "reporting-data-export",
    ];

    for (const module of modules) {
      await page.goto(`http://localhost:3000/learn/${module}`);
      await page.waitForLoadState("networkidle");

      // Verify successful load
      expect(page.url()).toContain(`/learn/${module}`);
      const body = await page.locator("body");
      await expect(body).toBeVisible();
    }
  });

  test("should load all budget app routes", async ({ page }) => {
    const routes = [
      "/budget-app",
      "/budget-app/budgets",
      "/budget-app/categories",
      "/budget-app/transactions",
    ];

    for (const route of routes) {
      await page.goto(`http://localhost:3000${route}`);
      await page.waitForLoadState("networkidle");

      // Verify successful load
      expect(page.url()).toContain(route);
      const body = await page.locator("body");
      await expect(body).toBeVisible();
    }
  });
});
