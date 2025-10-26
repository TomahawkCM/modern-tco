import { test, expect } from '@playwright/test';

test('practice flow can auto-finish for e2e', async ({ page }) => {
  await page.goto('/practice?domain=aq&count=25&quick=1&reveal=1&autofinish=1');
  await expect(page.getByText(/Practice Complete/i)).toBeVisible();
  await expect(page.getByText(/Your Results/i)).toBeVisible();
});

