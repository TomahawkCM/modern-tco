import { test, expect } from '@playwright/test';

test('notes page renders and allows basic interactions', async ({ page }) => {
  await page.goto('/notes');
  await expect(page.getByRole('heading', { name: /Notes & Spaced Repetition/i })).toBeVisible();

  const textarea = page.locator('textarea');
  await textarea.fill('E2E test note');
  await page.getByRole('button', { name: /Add|Save/i }).click();

  // Note appears in list
  await expect(page.getByText('E2E test note')).toBeVisible();
});

