import { test, expect } from '@playwright/test'

test('back/forward works between modules', async ({ page }) => {
  await page.goto('/modules/asking-questions', { waitUntil: 'networkidle' })
  await expect(page.locator('h1')).toContainText(/Asking Questions/i)
  const nextLink = page.getByRole('link', { name: /Refining Questions & Targeting/i }).first()
  await expect(nextLink).toBeVisible()
  await nextLink.click()
  await expect(page.locator('h1')).toContainText(/Refining Questions/i)
  await page.goBack()
  await expect(page.locator('h1')).toContainText(/Asking Questions/i)
  await page.goForward()
  await expect(page.locator('h1')).toContainText(/Refining Questions/i)
})
