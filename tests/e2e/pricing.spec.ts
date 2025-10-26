import { test, expect } from '@playwright/test';

test('pricing page shows plans', async ({ page }) => {
  await page.goto('/pricing');
  await expect(page.getByRole('heading', { name: /Choose Your Plan/i })).toBeVisible();
  await expect(page.getByText(/Free/i)).toBeVisible();
  await expect(page.getByText(/Pro/i)).toBeVisible();
  await expect(page.getByText(/Team/i)).toBeVisible();
});

