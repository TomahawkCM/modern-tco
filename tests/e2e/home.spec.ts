import { test, expect } from '@playwright/test';

test('homepage loads and shows header', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Tanium Certified Operator|TCO/i);
  await expect(page.getByText(/TCO Exam/i)).toBeVisible();
});

