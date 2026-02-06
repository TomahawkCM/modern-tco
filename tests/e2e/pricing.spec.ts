import { test, expect } from '@playwright/test';

test('pricing page shows plans', async ({ page }) => {
  await page.goto('/pricing');
  await expect(page.getByRole('heading', { name: /Choose Your Plan/i })).toBeVisible();
  // Use first() since there are multiple instances of these plan names
  await expect(page.getByText(/Free/i).first()).toBeVisible();
  await expect(page.getByText('Pro', { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/Team/i).first()).toBeVisible();
});

