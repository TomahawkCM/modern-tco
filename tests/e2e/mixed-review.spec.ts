import { test, expect } from '@playwright/test';

test('Mixed Review CTA starts multi-domain practice session', async ({ page }) => {
  // Seed local progress with multiple domains needing review
  await page.addInitScript(() => {
    try {
      // Add needs-review items for Asking Questions domain
      const askingQuestionsKey = 'tco-study-progress:tco-asking-questions';
      const askingQuestionsValue = {
        lastViewed: 'core-concepts',
        sections: [
          { id: 'natural-language-query-construction', title: 'Natural Language Query Construction', completed: false, needsReview: true },
          { id: 'query-operators', title: 'Query Operators', completed: false, needsReview: true },
        ],
      };
      localStorage.setItem(askingQuestionsKey, JSON.stringify(askingQuestionsValue));

      // Add needs-review items for Tanium Platform Foundation domain
      const foundationKey = 'tco-study-progress:tco-tanium-platform-foundation';
      const foundationValue = {
        lastViewed: 'introduction',
        sections: [
          { id: 'key-concepts', title: 'Key Concepts', completed: false, needsReview: true },
          { id: 'architecture-overview', title: 'Architecture Overview', completed: false, needsReview: true },
        ],
      };
      localStorage.setItem(foundationKey, JSON.stringify(foundationValue));

      // Add needs-review items for Navigation domain
      const navigationKey = 'tco-study-progress:tco-navigation-basic-modules';
      const navigationValue = {
        lastViewed: 'overview',
        sections: [
          { id: 'dashboard-navigation', title: 'Dashboard Navigation', completed: false, needsReview: true },
        ],
      };
      localStorage.setItem(navigationKey, JSON.stringify(navigationValue));
    } catch {}
  });

  // Navigate to Review Center
  await page.goto('/study/review');

  // Verify Review Center is visible
  await expect(page.getByRole('heading', { name: /Review Center/i })).toBeVisible();

  // Verify multiple domains are listed
  await expect(page.getByText(/Asking Questions/i)).toBeVisible();
  await expect(page.getByText(/Tanium Platform Foundation/i)).toBeVisible();
  await expect(page.getByText(/Navigation & Basic Modules/i)).toBeVisible();

  // Find and click the Mixed Review CTA
  const mixedReviewButton = page.getByRole('link', { name: /Start Mixed Review/i });
  await expect(mixedReviewButton).toBeVisible();
  await mixedReviewButton.click();

  // Verify navigation to practice page with mixed domains
  await expect(page).toHaveURL(/\/practice/);

  // Check for mixed domain parameters in URL
  const url = page.url();
  expect(url).toContain('domain=');

  // Verify practice mode is active
  await expect(page.getByRole('heading', { name: /Practice Session/i })).toBeVisible({ timeout: 10000 });

  // Verify that a question is displayed (from any of the needs-review domains)
  await expect(page.locator('.question-content, [data-testid="question-text"]').first()).toBeVisible({ timeout: 10000 });
});

test('Mixed Review only shows when multiple domains have needs-review items', async ({ page }) => {
  // Seed with only one domain having needs-review items
  await page.addInitScript(() => {
    try {
      const askingQuestionsKey = 'tco-study-progress:tco-asking-questions';
      const askingQuestionsValue = {
        lastViewed: 'core-concepts',
        sections: [
          { id: 'natural-language-query-construction', title: 'Natural Language Query Construction', completed: false, needsReview: true },
        ],
      };
      localStorage.setItem(askingQuestionsKey, JSON.stringify(askingQuestionsValue));
    } catch {}
  });

  // Navigate to Review Center
  await page.goto('/study/review');

  // Verify Review Center is visible
  await expect(page.getByRole('heading', { name: /Review Center/i })).toBeVisible();

  // Verify only one domain is listed
  await expect(page.getByText(/Asking Questions/i)).toBeVisible();

  // Mixed Review CTA should not be visible (or disabled) with only one domain
  const mixedReviewButton = page.getByRole('link', { name: /Start Mixed Review/i });

  // The button might be hidden or disabled - check both conditions
  const isVisible = await mixedReviewButton.isVisible().catch(() => false);
  if (isVisible) {
    // If visible, it should be disabled or have some indication it's not available
    const href = await mixedReviewButton.getAttribute('href');
    expect(href).toBeNull(); // Disabled links often have no href
  } else {
    // Button should not be visible with only one domain
    expect(isVisible).toBe(false);
  }
});

test('Mixed Review filters questions by needs-review domains only', async ({ page }) => {
  // Seed with specific domains needing review
  await page.addInitScript(() => {
    try {
      // Domain 1: Asking Questions (needs review)
      const askingQuestionsKey = 'tco-study-progress:tco-asking-questions';
      const askingQuestionsValue = {
        lastViewed: 'core-concepts',
        sections: [
          { id: 'natural-language-query-construction', title: 'Natural Language Query Construction', completed: false, needsReview: true },
        ],
      };
      localStorage.setItem(askingQuestionsKey, JSON.stringify(askingQuestionsValue));

      // Domain 2: Platform Foundation (needs review)
      const foundationKey = 'tco-study-progress:tco-tanium-platform-foundation';
      const foundationValue = {
        lastViewed: 'introduction',
        sections: [
          { id: 'key-concepts', title: 'Key Concepts', completed: false, needsReview: true },
        ],
      };
      localStorage.setItem(foundationKey, JSON.stringify(foundationValue));

      // Domain 3: Reporting (no review needed - completed)
      const reportingKey = 'tco-study-progress:tco-reporting-data-export';
      const reportingValue = {
        lastViewed: 'overview',
        sections: [
          { id: 'report-basics', title: 'Report Basics', completed: true, needsReview: false },
        ],
      };
      localStorage.setItem(reportingKey, JSON.stringify(reportingValue));
    } catch {}
  });

  // Navigate to Review Center and start Mixed Review
  await page.goto('/study/review');
  const mixedReviewButton = page.getByRole('link', { name: /Start Mixed Review/i });
  await mixedReviewButton.click();

  // Wait for practice session to start
  await expect(page).toHaveURL(/\/practice/);

  // Check URL parameters to verify correct domains are selected
  const url = page.url();

  // Should include domains that need review
  expect(url.toLowerCase()).toMatch(/asking[_-]questions|domain[_-]1/);
  expect(url.toLowerCase()).toMatch(/platform[_-]foundation|domain[_-]0/);

  // Should NOT include domains that don't need review
  expect(url.toLowerCase()).not.toMatch(/reporting|domain[_-]4/);
});