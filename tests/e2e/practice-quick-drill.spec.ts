import { test, expect } from '@playwright/test';

test('quick drill link autostarts practice', async ({ page }) => {
  await page.goto('/practice?domain=aq&count=25&quick=1&reveal=1');
  // Expect practice mode heading or progress indicator
  await expect(page.getByText(/Practice Mode/i)).toBeVisible();
  await expect(page.getByText(/Question 1 of|Question\s+1\s+of/i)).toBeVisible();
});

