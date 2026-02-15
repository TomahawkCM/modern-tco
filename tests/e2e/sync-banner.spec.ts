import { test, expect } from '@playwright/test';

test('sync banner shows and details open', async ({ page }) => {
  await page.goto('/');
  const banner = page.locator('text=Synced');
  await expect(banner).toBeVisible({ timeout: 5000 });
  await page.click('text=Details');
  const panel = page.locator('text=Sync Details');
  await expect(panel).toBeVisible();
});
