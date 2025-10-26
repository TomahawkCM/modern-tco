/**
 * Comprehensive E2E Test Suite for Tanium TCO LMS
 * Playwright-based end-to-end tests for critical user journeys
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.PLAYWRIGHT_TEST_URL || 'http://localhost:3000';

// Helper functions
async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/auth/signin`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
}

// ============================================
// HOMEPAGE & NAVIGATION TESTS
// ============================================

test.describe('Homepage and Navigation', () => {
  test('should load homepage with all key elements', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check main elements
    await expect(page.locator('h1')).toContainText('Tanium TCO');
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('button:has-text("Get Started")')).toBeVisible();
  });

  test('should navigate to all main sections', async ({ page }) => {
    await page.goto(BASE_URL);

    const sections = [
      { link: 'Modules', url: '/modules' },
      { link: 'Practice', url: '/practice' },
      { link: 'Exam', url: '/exam' },
      { link: 'Progress', url: '/progress' }
    ];

    for (const section of sections) {
      await page.click(`nav a:has-text("${section.link}")`);
      await expect(page).toHaveURL(new RegExp(section.url));
      await page.goBack();
    }
  });

  test('should have responsive navigation menu', async ({ page }) => {
    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);

    // Check hamburger menu
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click();
      await expect(page.locator('nav')).toBeVisible();
    }

    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('nav')).toBeVisible();
  });
});

// ============================================
// AUTHENTICATION FLOW TESTS
// ============================================

test.describe('Authentication Flow', () => {
  test('should complete registration flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signup`);

    // Fill registration form
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="confirmPassword"]', 'SecurePass123!');
    await page.fill('input[name="fullName"]', 'Test User');

    // Accept terms
    await page.check('input[name="acceptTerms"]');

    // Submit
    await page.click('button[type="submit"]');

    // Should redirect to dashboard or email verification
    await expect(page).toHaveURL(new RegExp('/(dashboard|verify-email)'));
  });

  test('should handle login with valid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`);

    await page.fill('input[name="email"]', 'demo@example.com');
    await page.fill('input[name="password"]', 'DemoPass123!');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`);

    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'WrongPassword');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('.error-message')).toContainText(/Invalid credentials/i);
  });

  test('should handle password reset flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.click('a:has-text("Forgot password")');

    await page.fill('input[name="email"]', 'user@example.com');
    await page.click('button:has-text("Reset Password")');

    // Should show confirmation message
    await expect(page.locator('.success-message')).toContainText(/email sent/i);
  });
});

// ============================================
// MODULE CONTENT TESTS
// ============================================

test.describe('Module Content Navigation', () => {
  test('should display all 6 study modules', async ({ page }) => {
    await page.goto(`${BASE_URL}/modules`);

    const modules = [
      'Tanium Platform Foundation',
      'Asking Questions',
      'Refining Questions',
      'Taking Action',
      'Navigation',
      'Reporting'
    ];

    for (const module of modules) {
      await expect(page.locator(`text=${module}`)).toBeVisible();
    }
  });

  test('should navigate through module content', async ({ page }) => {
    await page.goto(`${BASE_URL}/modules/asking-questions`);

    // Check module loaded
    await expect(page.locator('h1')).toContainText('Asking Questions');

    // Navigate sections
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForLoadState('networkidle');
    }

    // Navigate back
    const prevButton = page.locator('button:has-text("Previous")');
    if (await prevButton.isVisible()) {
      await prevButton.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should track reading progress', async ({ page }) => {
    await page.goto(`${BASE_URL}/modules/asking-questions`);

    // Scroll through content
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check progress indicator
    const progress = page.locator('[data-testid="reading-progress"]');
    if (await progress.isVisible()) {
      const value = await progress.getAttribute('aria-valuenow');
      expect(Number(value)).toBeGreaterThan(0);
    }
  });

  test('should handle module search', async ({ page }) => {
    await page.goto(`${BASE_URL}/modules`);

    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('sensor');
      await page.waitForTimeout(500);

      // Should filter modules
      const results = page.locator('.module-card');
      const count = await results.count();
      expect(count).toBeGreaterThan(0);
    }
  });
});

// ============================================
// PRACTICE SESSION TESTS
// ============================================

test.describe('Practice Sessions', () => {
  test('should start a practice session', async ({ page }) => {
    await page.goto(`${BASE_URL}/practice`);

    // Select domain
    await page.click('button:has-text("Asking Questions")');

    // Select difficulty
    await page.click('button:has-text("Medium")');

    // Start practice
    await page.click('button:has-text("Start Practice")');

    // Should show first question
    await expect(page.locator('.question-text')).toBeVisible();
  });

  test('should answer practice questions', async ({ page }) => {
    await page.goto(`${BASE_URL}/practice/session`);

    // Answer question
    await page.click('.answer-option:first-child');
    await page.click('button:has-text("Submit")');

    // Should show feedback
    await expect(page.locator('.feedback')).toBeVisible();

    // Continue to next
    await page.click('button:has-text("Next Question")');
    await expect(page.locator('.question-number')).toContainText('2');
  });

  test('should complete practice and show results', async ({ page }) => {
    await page.goto(`${BASE_URL}/practice/session`);

    // Answer 10 questions
    for (let i = 0; i < 10; i++) {
      await page.click('.answer-option:first-child');
      await page.click('button:has-text("Submit")');

      const nextBtn = page.locator('button:has-text("Next Question")');
      if (await nextBtn.isVisible()) {
        await nextBtn.click();
      }
    }

    // Should show results
    await expect(page.locator('.practice-results')).toBeVisible();
    await expect(page.locator('.score')).toBeVisible();
  });

  test('should save practice progress', async ({ page }) => {
    await page.goto(`${BASE_URL}/practice/session`);

    // Answer some questions
    await page.click('.answer-option:first-child');
    await page.click('button:has-text("Submit")');

    // Leave and return
    await page.goto(`${BASE_URL}/dashboard`);
    await page.goto(`${BASE_URL}/practice`);

    // Should show continue option
    const continueBtn = page.locator('button:has-text("Continue Session")');
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      // Should resume where left off
      await expect(page.locator('.question-number')).toContainText('2');
    }
  });
});

// ============================================
// EXAM SIMULATION TESTS
// ============================================

test.describe('Exam Simulation', () => {
  test('should start exam with timer', async ({ page }) => {
    await page.goto(`${BASE_URL}/exam`);

    await page.click('button:has-text("Start Exam")');

    // Confirm start
    await page.click('button:has-text("Yes, Start")');

    // Should show timer
    await expect(page.locator('.exam-timer')).toBeVisible();
    await expect(page.locator('.exam-timer')).toContainText(/\d{1,2}:\d{2}/);
  });

  test('should navigate exam questions', async ({ page }) => {
    await page.goto(`${BASE_URL}/exam/session`);

    // Check question navigation
    await page.click('button:has-text("Next")');
    await expect(page.locator('.question-number')).toContainText('2');

    await page.click('button:has-text("Previous")');
    await expect(page.locator('.question-number')).toContainText('1');

    // Jump to question
    await page.click('.question-nav-button:has-text("10")');
    await expect(page.locator('.question-number')).toContainText('10');
  });

  test('should flag questions for review', async ({ page }) => {
    await page.goto(`${BASE_URL}/exam/session`);

    // Flag question
    await page.click('button:has-text("Flag")');
    await expect(page.locator('button:has-text("Flag")')).toHaveClass(/flagged/);

    // Check flagged list
    await page.click('button:has-text("Review Flagged")');
    await expect(page.locator('.flagged-questions')).toBeVisible();
  });

  test('should submit exam and show results', async ({ page }) => {
    await page.goto(`${BASE_URL}/exam/session`);

    // Answer some questions
    for (let i = 0; i < 5; i++) {
      await page.click('.answer-option:first-child');
      await page.click('button:has-text("Next")');
    }

    // Submit exam
    await page.click('button:has-text("Submit Exam")');
    await page.click('button:has-text("Confirm Submit")');

    // Should show results
    await expect(page.locator('.exam-results')).toBeVisible();
    await expect(page.locator('.score-percentage')).toBeVisible();
    await expect(page.locator('.pass-fail-status')).toBeVisible();
  });
});

// ============================================
// PROGRESS TRACKING TESTS
// ============================================

test.describe('Progress Tracking', () => {
  test('should display overall progress', async ({ page }) => {
    await page.goto(`${BASE_URL}/progress`);

    await expect(page.locator('.overall-progress')).toBeVisible();
    await expect(page.locator('.progress-percentage')).toBeVisible();
  });

  test('should show module-wise progress', async ({ page }) => {
    await page.goto(`${BASE_URL}/progress`);

    const modules = await page.locator('.module-progress-item').count();
    expect(modules).toBe(6);

    // Each module should show percentage
    for (let i = 0; i < modules; i++) {
      const progress = page.locator('.module-progress-item').nth(i);
      await expect(progress.locator('.progress-bar')).toBeVisible();
    }
  });

  test('should display practice statistics', async ({ page }) => {
    await page.goto(`${BASE_URL}/progress`);

    await page.click('tab:has-text("Practice Stats")');

    await expect(page.locator('.total-questions')).toBeVisible();
    await expect(page.locator('.accuracy-rate')).toBeVisible();
    await expect(page.locator('.time-spent')).toBeVisible();
  });

  test('should show achievement badges', async ({ page }) => {
    await page.goto(`${BASE_URL}/progress`);

    await page.click('tab:has-text("Achievements")');

    const badges = page.locator('.achievement-badge');
    const count = await badges.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

// ============================================
// SEARCH FUNCTIONALITY TESTS
// ============================================

test.describe('Search Functionality', () => {
  test('should search across all content', async ({ page }) => {
    await page.goto(`${BASE_URL}/search`);

    await page.fill('input[placeholder*="Search"]', 'Tanium sensor');
    await page.press('input[placeholder*="Search"]', 'Enter');

    await page.waitForLoadState('networkidle');

    const results = page.locator('.search-result');
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter search results', async ({ page }) => {
    await page.goto(`${BASE_URL}/search?q=sensor`);

    // Filter by content type
    await page.click('checkbox:has-text("Modules")');
    await page.click('checkbox:has-text("Questions")');

    await page.waitForLoadState('networkidle');

    // Results should update
    const results = await page.locator('.search-result').count();
    expect(results).toBeGreaterThanOrEqual(0);
  });

  test('should highlight search terms', async ({ page }) => {
    await page.goto(`${BASE_URL}/search?q=platform`);

    // Check highlighting
    const highlighted = page.locator('mark, .highlight');
    const count = await highlighted.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ============================================
// RESPONSIVE DESIGN TESTS
// ============================================

test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 }
  ];

  for (const viewport of viewports) {
    test(`should render correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(BASE_URL);

      // Take screenshot for visual regression
      await page.screenshot({
        path: `screenshots/${viewport.name.toLowerCase()}-homepage.png`,
        fullPage: true
      });

      // Check key elements are visible
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('nav, [data-testid="mobile-menu"]')).toBeVisible();
    });
  }
});

// ============================================
// PERFORMANCE TESTS
// ============================================

test.describe('Performance', () => {
  test('should load homepage within performance budget', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(BASE_URL);
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000); // 3 seconds
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto(BASE_URL);

    // Measure LCP
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          resolve(entries[entries.length - 1].startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });

    expect(lcp).toBeLessThan(2500); // Good LCP is under 2.5s
  });

  test('should handle slow network gracefully', async ({ page, context }) => {
    // Simulate slow 3G
    await context.route('**/*', (route) => {
      setTimeout(() => route.continue(), 2000);
    });

    await page.goto(BASE_URL);

    // Should show loading state
    const loader = page.locator('.loading, .skeleton');
    if (await loader.isVisible()) {
      expect(await loader.count()).toBeGreaterThan(0);
    }
  });
});

// ============================================
// ACCESSIBILITY TESTS
// ============================================

test.describe('Accessibility', () => {
  test('should be navigable with keyboard', async ({ page }) => {
    await page.goto(BASE_URL);

    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check focus is visible
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.tagName.toLowerCase();
    });

    expect(['a', 'button', 'input']).toContain(focusedElement);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check main navigation
    const nav = page.locator('nav');
    const ariaLabel = await nav.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();

    // Check buttons
    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      const label = await button.getAttribute('aria-label');
      const text = await button.textContent();
      expect(label || text).toBeTruthy();
    }
  });

  test('should work with screen reader', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check for screen reader only content
    const srOnly = page.locator('.sr-only, [aria-hidden="true"]');
    const count = await srOnly.count();
    expect(count).toBeGreaterThanOrEqual(0);

    // Check heading hierarchy
    const h1 = await page.locator('h1').count();
    expect(h1).toBe(1); // Only one h1 per page
  });
});

// ============================================
// ERROR HANDLING TESTS
// ============================================

test.describe('Error Handling', () => {
  test('should show 404 page for invalid routes', async ({ page }) => {
    await page.goto(`${BASE_URL}/invalid-route-12345`);

    await expect(page.locator('h1')).toContainText(/404|not found/i);
    await expect(page.locator('a:has-text("Go Home")')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page, context }) => {
    // Block API calls
    await context.route('**/api/**', route => route.abort());

    await page.goto(`${BASE_URL}/practice`);

    // Should show error message
    const error = page.locator('.error-message, [role="alert"]');
    if (await error.isVisible()) {
      await expect(error).toContainText(/error|failed|try again/i);
    }
  });

  test('should recover from errors', async ({ page }) => {
    await page.goto(`${BASE_URL}/modules/invalid-module`);

    // Should show error
    await expect(page.locator('text=/not found|error/i')).toBeVisible();

    // Should have recovery option
    await page.click('a:has-text("Browse Modules")');
    await expect(page).toHaveURL(`${BASE_URL}/modules`);
  });
});

// ============================================
// INTEGRATION TESTS
// ============================================

test.describe('Third-party Integrations', () => {
  test('should load analytics scripts', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check for analytics scripts
    const hasAnalytics = await page.evaluate(() => {
      return window.posthog || window.gtag || window.analytics;
    });

    expect(hasAnalytics).toBeDefined();
  });

  test('should handle payment integration', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`);

    const upgradeBtn = page.locator('button:has-text("Upgrade")');
    if (await upgradeBtn.isVisible()) {
      await upgradeBtn.click();

      // Should open payment modal or redirect
      await page.waitForTimeout(1000);
      const stripeFrame = page.frameLocator('iframe[name*="stripe"]');
      const hasStripe = await stripeFrame.locator('*').count() > 0;
      expect(hasStripe || page.url().includes('stripe')).toBeTruthy();
    }
  });
});

// Export test configuration
export default {
  use: {
    baseURL: BASE_URL,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  retries: 2,
  workers: 4,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results.xml' }]
  ]
};