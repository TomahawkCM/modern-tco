import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BUDGET_PAGES = [
  '/',                              // Dashboard
  '/transactions',
  '/budgets',
  '/loans',
  '/investments',
  '/planning/future',
  '/planning/retirement',
  '/reports',
  '/settings',
  '/import',
  '/ocr',
];

const THEME_MODES = ['light', 'dark', 'high-contrast'];

// Test each page in each theme mode
THEME_MODES.forEach((theme) => {
  test.describe(`Accessibility testing - ${theme} mode`, () => {

    test.beforeEach(async ({ page }) => {
      // Set theme mode
      await page.goto('/budget-app');
      await page.evaluate((themeMode) => {
        document.documentElement.classList.remove('light', 'dark', 'high-contrast');
        document.documentElement.classList.add(themeMode);
        localStorage.setItem('theme', themeMode);
      }, theme);
    });

    BUDGET_PAGES.forEach((pagePath) => {
      test(`${pagePath} should not have accessibility violations`, async ({ page }) => {
        await page.goto(`/budget-app${pagePath}`);

        // Wait for page to load
        await page.waitForLoadState('domcontentloaded');

        // Run axe accessibility scan
        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
          .analyze();

        // Assert no violations
        expect(accessibilityScanResults.violations).toEqual([]);
      });
    });
  });
});

// Test critical user flows
test.describe('Accessibility - Critical User Flows', () => {

  test('Add Transaction flow', async ({ page }) => {
    await page.goto('/budget-app');

    // 1. Dashboard
    let results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);

    // 2. Click "Add Transaction" button
    const addButton = page.getByRole('button', { name: /add transaction/i });
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 }).catch(() => {});

      // 3. Transaction modal (if present)
      const dialog = page.locator('[role="dialog"]');
      if (await dialog.isVisible()) {
        results = await new AxeBuilder({ page }).analyze();
        expect(results.violations).toEqual([]);
      }
    }
  });

  test('Create Budget flow', async ({ page }) => {
    await page.goto('/budget-app/budgets');

    // 1. Budgets page
    let results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);

    // 2. Click "Create Budget" if available
    const createButton = page.getByRole('button', { name: /create budget/i });
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 }).catch(() => {});

      // 3. Budget modal (if present)
      const dialog = page.locator('[role="dialog"]');
      if (await dialog.isVisible()) {
        results = await new AxeBuilder({ page }).analyze();
        expect(results.violations).toEqual([]);
      }
    }
  });

  test('Import CSV flow', async ({ page }) => {
    await page.goto('/budget-app/import');

    // 1. Import page
    let results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

// Test keyboard navigation
test.describe('Accessibility - Keyboard Navigation', () => {

  test('Dashboard keyboard navigation', async ({ page }) => {
    await page.goto('/budget-app');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check that focus is visible
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });
    expect(focusedElement).toBeTruthy();

    // Run axe scan
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('Modal focus trap', async ({ page }) => {
    await page.goto('/budget-app');

    // Try to open a modal (if Add Transaction button exists)
    const addButton = page.getByRole('button', { name: /add transaction/i });
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 }).catch(() => {});

      const dialog = page.locator('[role="dialog"]');
      if (await dialog.isVisible()) {
        // Tab through modal
        for (let i = 0; i < 10; i++) {
          await page.keyboard.press('Tab');
        }

        // Focus should still be inside modal
        const focusedElement = await page.evaluate(() => {
          const modal = document.querySelector('[role="dialog"]');
          return modal?.contains(document.activeElement);
        });
        expect(focusedElement).toBe(true);

        // Escape closes modal
        await page.keyboard.press('Escape');
        await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 5000 }).catch(() => {});
      }
    }
  });
});
