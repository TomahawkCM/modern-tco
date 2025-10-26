import { test } from '@playwright/test'

const routes = [
  '/modules/asking-questions',
  '/modules/refining-questions-targeting',
  '/modules/taking-action-packages-actions',
  '/modules/navigation-basic-modules',
  '/modules/reporting-data-export',
]

test('memory usage across module pages (best-effort)', async ({ page }) => {
  const results: Array<{ route: string; usedJSHeapSize?: number | null }> = []
  for (const route of routes) {
    await page.goto(route, { waitUntil: 'networkidle' })
    // Give the page a moment to settle
    await page.waitForTimeout(250)
    const used = await page.evaluate(() => {
      const m: any = (performance as any).memory
      return m && typeof m.usedJSHeapSize === 'number' ? m.usedJSHeapSize : null
    })
    results.push({ route, usedJSHeapSize: used })
  }
  // Log a compact summary (bytes)
  console.log('[memory-check]', JSON.stringify(results))
})

