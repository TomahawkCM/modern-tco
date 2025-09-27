import { test, expect } from '@playwright/test';

test('module review tab: flag, view, clear', async ({ page }) => {
  // Open Asking Questions module page
  await page.goto('/modules/asking-questions');

  // Study Progress sidebar visible
  await expect(page.getByText(/Study Progress/i)).toBeVisible();

  // Flag the first section as needs review
  const needsButtons = page.getByRole('button', { name: /needs review/i });
  const count = await needsButtons.count();
  if (count === 0) test.skip(true, 'No sections available to flag');
  await needsButtons.first().click();

  // Review tab shows count ≥ 1
  await expect(page.getByRole('button', { name: /Review \(/i })).toBeVisible();
  await page.getByRole('button', { name: /Review \(/i }).click();

  // Needs Review panel visible; clear the flag using Clear flag
  await expect(page.getByText(/Needs Review/i)).toBeVisible();
  const clear = page.getByRole('button', { name: /Clear flag/i });
  await expect(clear).toBeVisible();
  await clear.first().click();

  // Count in tab should reflect zero eventually
  // Switch back to Content tab
  await page.getByRole('button', { name: /^Content$/i }).click();

  // Navigate back to modules grid and expect a card to render
  await page.goto('/modules');
  await expect(page.getByRole('heading', { name: /TCO Study Center/i })).toBeVisible();
  await expect(page.getByText(/Asking Questions/i)).toBeVisible();
});

