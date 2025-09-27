import { test, expect } from '@playwright/test';

test('mock flow: start and finish early', async ({ page }) => {
  await page.goto('/mock?variant=A');

  // Start screen
  await expect(page.getByRole('heading', { name: /Mock Exam/i })).toBeVisible();
  await page.getByRole('button', { name: /Start Mock Exam/i }).click();

  // Question view: Finish Early should be visible
  await expect(page.getByRole('button', { name: /Finish Early/i })).toBeVisible();
  await page.getByRole('button', { name: /Finish Early/i }).click();

  // Results screen
  await expect(page.getByText(/Mock Exam Complete/i)).toBeVisible();
});

