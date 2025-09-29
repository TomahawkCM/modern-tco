import { test, expect } from '@playwright/test'

const sizes = [
  { name: 'mobile', w: 375, h: 812 },
  { name: 'tablet', w: 768, h: 1024 },
  { name: 'desktop', w: 1280, h: 800 },
]

for (const s of sizes) {
  test(`module renders at ${s.name} viewport`, async ({ page }) => {
    await page.setViewportSize({ width: s.w, height: s.h })
    await page.goto('/modules/asking-questions', { waitUntil: 'networkidle' })
    await expect(page.locator('h1')).toContainText(/Asking Questions/i)
  })
}

