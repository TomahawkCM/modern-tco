import { test, expect } from '@playwright/test';

test('Review Center lists needs-review items and links to sections', async ({ page }) => {
  // Seed local needs-review for Asking Questions
  await page.addInitScript(() => {
    try {
      const key = 'tco-study-progress:tco-asking-questions';
      const value = {
        lastViewed: 'domain-overview',
        sections: [
          { id: 'natural-language-query-construction', title: 'Natural Language Query Construction', completed: false, needsReview: true },
        ],
      };
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  });

  await page.goto('/study/review');

  // The module group should appear with a link to the section
  await expect(page.getByRole('heading', { name: /Review Center/i })).toBeVisible();
  const link = page.getByRole('link', { name: /Natural Language Query Construction/i });
  await expect(link).toBeVisible();

  // Click and verify deep-link navigation
  await link.click();
  await expect(page).toHaveURL(/modules\/asking-questions#/);
  await expect(page.getByText(/Natural Language Query Construction/i).first()).toBeVisible();
});

