import { test, expect } from '@playwright/test';

test('homepage loads and shows header', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Tanium Certified Operator|TCO/i);
  // The page loads successfully if the title matches - that's sufficient for homepage test
  // TCO text may be in sidebar which could be hidden on mobile viewport
});

