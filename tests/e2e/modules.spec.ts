import { test, expect } from '@playwright/test'

const routes = [
  '/modules/asking-questions',
  '/modules/refining-questions-targeting',
  '/modules/taking-action-packages-actions',
  '/modules/navigation-basic-modules',
  '/modules/reporting-data-export',
]

test.describe('Module routes', () => {
  for (const route of routes) {
    test(`renders ${route}`, async ({ page }) => {
      const res = await page.goto(route, { waitUntil: 'networkidle' })
      expect(res?.ok()).toBeTruthy()
      // Expect an h1 or first heading rendered
      const h1 = page.locator('h1')
      await expect(h1.first()).toBeVisible()
    })
  }
})

