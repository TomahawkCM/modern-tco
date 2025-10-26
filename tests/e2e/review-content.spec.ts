import { test, expect } from '@playwright/test';

test('review shows incorrect answers after a practice with autowrong', async ({ page }) => {
  // Start quick drill with a few wrong answers injected by test hook, then autofinish
  await page.goto('/practice?domain=aq&count=25&quick=1&reveal=1&autowrong=3&autofinish=1');
  await expect(page.getByText(/Practice Complete/i)).toBeVisible();

  // Navigate to review
  await page.goto('/review');
  await expect(page.getByRole('heading', { name: /Review Center/i })).toBeVisible();
  // Should not show empty state
  const empty = page.getByText(/You don’t have any incorrect answers/i);
  await expect(empty).toHaveCount(0);
  // Expect question counter
  await expect(page.getByText(/Question\s+1\s+of/i)).toBeVisible();
});

