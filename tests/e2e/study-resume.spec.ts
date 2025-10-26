import { test, expect } from '@playwright/test';

test('modules grid continue link deep-links to last viewed section', async ({ page }) => {
  // Seed local progress for Asking Questions with lastViewed core-concepts
  await page.addInitScript(() => {
    try {
      const key = 'tco-study-progress:tco-asking-questions';
      const value = {
        lastViewed: 'core-concepts',
        sections: [
          { id: 'core-concepts', title: 'Core Concepts', completed: false, needsReview: false },
        ],
      };
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  });

  await page.goto('/modules');

  // Expect Continue link for the module
  const cont = page.getByRole('link', { name: /Continue where you left off/i });
  await expect(cont).toBeVisible();

  // Click continue and verify deep-link hash present
  await cont.first().click();
  await expect(page).toHaveURL(/#core-concepts/);

  // Verify visible heading text contains "Core Concepts"
  await expect(page.getByText(/Core Concepts/i).first()).toBeVisible();
});

