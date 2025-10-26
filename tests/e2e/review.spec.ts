import { test, expect } from '@playwright/test';

test('review page renders when no data', async ({ page }) => {
  await page.goto('/review');
  await expect(page.getByText(/Review/i)).toBeVisible();
  // Should show the empty-state message if no incorrect answers yet
  await expect(page.getByText(/You don’t have any incorrect answers|You don’t have any incorrect answers to review/i)).toBeVisible({ timeout: 5000 });
});

