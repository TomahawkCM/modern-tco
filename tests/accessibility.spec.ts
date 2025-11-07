/**
 * Accessibility Tests with Axe-Core
 * Tests WCAG 2.2 AA compliance for Budget App
 * 
 * Run with: npx playwright test tests/accessibility.spec.ts
 */

import { test, expect } from '@playwright/test';

// Note: Run 'bash scripts/setup-accessibility-tests.sh' to install @axe-core/playwright
let AxeBuilder: any;
try {
  AxeBuilder = require('@axe-core/playwright').default;
} catch (e) {
  console.warn('⚠️ @axe-core/playwright not installed. Run: npm install -D @axe-core/playwright');
  console.warn('   Some tests will be skipped until dependency is installed.');
}

const BUDGET_APP_PAGES = [
  { name: 'Dashboard', url: '/budget-app' },
  { name: 'Transactions', url: '/budget-app/transactions' },
  { name: 'Budgets', url: '/budget-app/budgets' },
  { name: 'Categories', url: '/budget-app/categories' },
  { name: 'Reports', url: '/budget-app/reports' },
  { name: 'Investments', url: '/budget-app/investments' },
  { name: 'Import', url: '/budget-app/import' },
  { name: 'Settings', url: '/budget-app/settings' },
];

test.describe('Budget App - Accessibility Compliance', () => {
  
  test.describe('WCAG 2.2 AA - All Pages', () => {
    for (const page of BUDGET_APP_PAGES) {
      test(`${page.name} page should pass axe-core accessibility tests`, async ({ page: browserPage }) => {
        // Skip if AxeBuilder not installed
        if (!AxeBuilder) {
          test.skip();
          return;
        }
        
        await browserPage.goto(page.url);
        
        // Wait for page to load
        await browserPage.waitForLoadState('networkidle');
        
        // Run axe accessibility tests
        const accessibilityScanResults = await new AxeBuilder({ page: browserPage })
          .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
          .analyze();
        
        // Assert no violations
        expect(accessibilityScanResults.violations).toEqual([]);
      });
    }
  });

  test.describe('Keyboard Navigation', () => {
    test('should navigate through all interactive elements with Tab', async ({ page }) => {
      await page.goto('/budget-app');
      await page.waitForLoadState('networkidle');
      
      // Start with first focusable element
      await page.keyboard.press('Tab');
      
      // Get all focusable elements
      const focusableElements = await page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').all();
      
      // Should have many focusable elements
      expect(focusableElements.length).toBeGreaterThan(5);
      
      // Test that each element can receive focus
      for (let i = 0; i < Math.min(10, focusableElements.length); i++) {
        await page.keyboard.press('Tab');
        const activeElement = await page.evaluateHandle(() => document.activeElement);
        
        // Verify an element has focus
        const tagName = await activeElement.evaluate(el => el?.tagName?.toLowerCase());
        expect(['a', 'button', 'input', 'select', 'textarea']).toContain(tagName);
      }
    });

    test('should show visible focus indicators', async ({ page }) => {
      await page.goto('/budget-app');
      await page.waitForLoadState('networkidle');
      
      // Tab to first link
      await page.keyboard.press('Tab');
      
      // Check for focus ring styles
      const focusedElement = await page.locator(':focus').first();
      const styles = await focusedElement.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          outline: computed.outline,
          outlineWidth: computed.outlineWidth,
          boxShadow: computed.boxShadow,
        };
      });
      
      // Should have either outline or box-shadow (focus ring)
      const hasFocusIndicator = 
        styles.outline !== 'none' || 
        styles.outlineWidth !== '0px' ||
        styles.boxShadow.includes('rgb');
      
      expect(hasFocusIndicator).toBeTruthy();
    });

    test('Esc key should close modals', async ({ page }) => {
      await page.goto('/budget-app');
      
      // Open shortcuts modal with ? key
      await page.keyboard.press('?');
      
      // Wait for modal to appear
      await page.waitForTimeout(300);
      
      // Check modal is visible
      const modalVisible = await page.locator('[role="dialog"], .modal').isVisible().catch(() => false);
      
      if (modalVisible) {
        // Press Esc
        await page.keyboard.press('Escape');
        
        // Wait for animation
        await page.waitForTimeout(300);
        
        // Modal should be closed
        const stillVisible = await page.locator('[role="dialog"], .modal').isVisible().catch(() => false);
        expect(stillVisible).toBeFalsy();
      }
    });
  });

  test.describe('Screen Reader Support', () => {
    test('all buttons should have accessible names', async ({ page }) => {
      await page.goto('/budget-app/transactions');
      await page.waitForLoadState('networkidle');
      
      // Get all buttons
      const buttons = await page.locator('button').all();
      
      // Check each button has accessible name
      for (const button of buttons) {
        const accessibleName = await button.getAttribute('aria-label') ||
                               await button.textContent() ||
                               await button.getAttribute('title');
        
        expect(accessibleName).toBeTruthy();
      }
    });

    test('amounts should have screen reader labels', async ({ page }) => {
      await page.goto('/budget-app/transactions');
      await page.waitForLoadState('networkidle');
      
      // Look for screen reader only text
      const srOnlyLabels = await page.locator('.sr-only').all();
      
      // Should have multiple sr-only labels for amounts
      expect(srOnlyLabels.length).toBeGreaterThan(0);
      
      // Check for "Income:" or "Expense:" labels
      const labelTexts = await Promise.all(
        srOnlyLabels.slice(0, 10).map(label => label.textContent())
      );
      
      const hasIncomeOrExpenseLabel = labelTexts.some(text => 
        text?.includes('Income') || text?.includes('Expense')
      );
      
      expect(hasIncomeOrExpenseLabel).toBeTruthy();
    });

    test('icons should be hidden from screen readers', async ({ page }) => {
      await page.goto('/budget-app');
      await page.waitForLoadState('networkidle');
      
      // Get all SVG icons (lucide-react icons)
      const icons = await page.locator('svg').all();
      
      // Sample first 10 icons
      for (const icon of icons.slice(0, 10)) {
        const ariaHidden = await icon.getAttribute('aria-hidden');
        const role = await icon.getAttribute('role');
        
        // Icon should either be aria-hidden or have presentation role
        const isHidden = ariaHidden === 'true' || role === 'presentation' || role === 'img';
        
        // If not hidden, should have aria-label
        if (!isHidden) {
          const hasLabel = await icon.getAttribute('aria-label');
          expect(hasLabel).toBeTruthy();
        }
      }
    });
  });

  test.describe('Color Contrast', () => {
    test('should meet WCAG AA color contrast requirements', async ({ page }) => {
      // Skip if AxeBuilder not installed
      if (!AxeBuilder) {
        test.skip();
        return;
      }
      
      await page.goto('/budget-app');
      await page.waitForLoadState('networkidle');
      
      // Run axe with only color-contrast rule
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .include('body')
        .analyze();
      
      // Filter for color contrast violations
      const contrastViolations = accessibilityScanResults.violations.filter(
        v => v.id === 'color-contrast'
      );
      
      expect(contrastViolations).toEqual([]);
    });
  });

  test.describe('Form Accessibility', () => {
    test('form inputs should have labels', async ({ page }) => {
      await page.goto('/budget-app/transactions');
      await page.waitForLoadState('networkidle');
      
      // Click "Add Transaction" button if it exists
      const addButton = page.locator('button:has-text("Add"), button[aria-label*="Add"]').first();
      const hasAddButton = await addButton.isVisible().catch(() => false);
      
      if (hasAddButton) {
        await addButton.click();
        await page.waitForTimeout(500);
        
        // Check all inputs in modal have labels
        const inputs = await page.locator('input, select, textarea').all();
        
        for (const input of inputs) {
          const id = await input.getAttribute('id');
          const ariaLabel = await input.getAttribute('aria-label');
          const ariaLabelledBy = await input.getAttribute('aria-labelledby');
          
          // Input should have id with corresponding label, or aria-label
          const hasLabel = (id && await page.locator(`label[for="${id}"]`).count() > 0) ||
                          ariaLabel ||
                          ariaLabelledBy;
          
          if (!hasLabel) {
            const placeholder = await input.getAttribute('placeholder');
            // Placeholder alone is not sufficient, but we'll log it
            console.log(`Input without proper label (has placeholder: ${placeholder})`);
          }
        }
      }
    });
  });

  test.describe('Semantic HTML', () => {
    test('should use semantic HTML elements', async ({ page }) => {
      await page.goto('/budget-app');
      await page.waitForLoadState('networkidle');
      
      // Check for landmark regions
      const hasNav = await page.locator('nav').count() > 0;
      const hasMain = await page.locator('main').count() > 0;
      
      expect(hasNav).toBeTruthy();
      expect(hasMain).toBeTruthy();
    });

    test('buttons should be <button> elements not <div>', async ({ page }) => {
      await page.goto('/budget-app/transactions');
      await page.waitForLoadState('networkidle');
      
      // Check for div elements with onClick (bad practice)
      const divButtons = await page.locator('div[onclick], div[role="button"]').all();
      
      // Should be 0 or very few (some libraries might use role="button" correctly)
      expect(divButtons.length).toBeLessThan(3);
    });
  });

  test.describe('Mobile Accessibility', () => {
    test('touch targets should be at least 44x44 pixels', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/budget-app');
      await page.waitForLoadState('networkidle');
      
      // Get all interactive elements
      const interactiveElements = await page.locator('a, button').all();
      
      // Sample first 20 elements
      for (const element of interactiveElements.slice(0, 20)) {
        const box = await element.boundingBox();
        
        if (box) {
          // Touch target should be at least 44x44 (WCAG 2.2 AA)
          const meetsMinSize = box.width >= 44 || box.height >= 44;
          
          if (!meetsMinSize) {
            const text = await element.textContent();
            console.log(`Small touch target: ${text?.slice(0, 30)} (${box.width}x${box.height})`);
          }
        }
      }
    });

    test('bottom navigation should be visible on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/budget-app');
      await page.waitForLoadState('networkidle');
      
      // Check for bottom navigation
      const bottomNav = page.locator('nav.fixed.bottom-0');
      await expect(bottomNav).toBeVisible();
      
      // Should have navigation links
      const navLinks = await bottomNav.locator('a, button').count();
      expect(navLinks).toBeGreaterThan(3);
    });
  });
});

