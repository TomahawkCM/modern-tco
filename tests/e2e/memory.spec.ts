import { test } from "@playwright/test";

const routes = [
  "/modules/asking-questions",
  "/modules/refining-questions-targeting",
  "/modules/taking-action-packages-actions",
  "/modules/navigation-basic-modules",
  "/modules/reporting-data-export",
];

test("memory usage across module pages (best-effort)", async ({ page }) => {
  test.setTimeout(120_000);

  // Navigate to a page first so page.evaluate has a context
  await page.goto(routes[0], { waitUntil: "domcontentloaded" });

  // performance.memory is Chrome-only and may not be available in headless
  const hasMemoryAPI = await page.evaluate(() => {
    const m = (performance as Record<string, unknown>).memory;
    return m && typeof (m as Record<string, unknown>).usedJSHeapSize === "number";
  });

  if (!hasMemoryAPI) {
    test.skip(true, "performance.memory API not available in this browser");
    return;
  }

  const results: Array<{ route: string; usedJSHeapSize?: number | null }> = [];
  for (const route of routes) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(250);
    const used = await page.evaluate(() => {
      const m = (performance as Record<string, unknown>).memory as
        | { usedJSHeapSize: number }
        | undefined;
      return m ? m.usedJSHeapSize : null;
    });
    results.push({ route, usedJSHeapSize: used });
  }
  console.log("[memory-check]", JSON.stringify(results));
});
