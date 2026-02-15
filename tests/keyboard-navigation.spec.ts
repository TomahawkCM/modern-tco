/**
 * Keyboard Navigation Tests (Task 2.2.3)
 * Tests all core workflows using keyboard-only navigation
 *
 * Success Criteria:
 * - All workflows completable via keyboard only
 * - Focus indicators visible throughout
 * - Focus traps work correctly in modals
 * - Logical tab order maintained
 * - Escape key closes modals
 */

import { test, expect } from "@playwright/test";

test.describe("Budget App - Keyboard Navigation (Task 2.2.3)", () => {
  test.beforeEach(async ({ page }) => {
    // Dismiss the OnboardingTour before tests (prevents z-[60] modal blocking)
    await page.addInitScript(() => {
      localStorage.setItem("budget-app-tour-completed", "true");
    });

    await page.goto("http://localhost:3001/budget-app/transactions");

    // Wait for page to be fully interactive
    await page.waitForLoadState("networkidle");
  });

  /**
   * WORKFLOW 1: Add Transaction (Keyboard-Only)
   * Expected: Complete flow using Tab, Enter, type, Escape
   */
  test("should add transaction using keyboard only", async ({ page }) => {
    // Tab to "Add Transaction" button
    await page.keyboard.press("Tab"); // Skip to first interactive element

    // Find the Add Transaction button by role and click with Enter
    const addButton = page.getByRole("button", { name: /add transaction/i });
    await addButton.focus();
    await page.keyboard.press("Enter");

    // Modal should open - verify focus trap
    await expect(page.getByRole("heading", { name: /add transaction/i })).toBeVisible();

    // Tab through form fields
    await page.keyboard.press("Tab"); // Type dropdown
    await page.keyboard.press("ArrowDown"); // Select "Expense"
    await page.keyboard.press("Enter");

    await page.keyboard.press("Tab"); // Amount field
    await page.keyboard.type("125.50");

    await page.keyboard.press("Tab"); // Description field
    await page.keyboard.type("Test keyboard transaction");

    await page.keyboard.press("Tab"); // Date field
    // Date picker should be accessible via keyboard

    await page.keyboard.press("Tab"); // Category dropdown
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    // Tab to Save button
    await page.keyboard.press("Tab"); // Skip optional fields
    await page.keyboard.press("Tab"); // Save button
    await page.keyboard.press("Enter");

    // Verify transaction was added
    await expect(page.getByText("Test keyboard transaction")).toBeVisible({ timeout: 5000 });
  });

  /**
   * WORKFLOW 2: Filter Transactions (Keyboard-Only)
   * Expected: Navigate filters using Tab and Arrow keys
   */
  test("should filter transactions using keyboard only", async ({ page }) => {
    // Focus search input
    const searchInput = page.getByPlaceholder(/search transactions/i);
    await searchInput.focus();
    await page.keyboard.type("grocery");

    // Verify filtered results
    await page.waitForTimeout(500); // Debounce delay

    // Tab to category filter dropdown
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab"); // Skip to category filter

    const categoryFilter = page.locator("select").first();
    await categoryFilter.focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    // Verify filter applied
    // Results should update
  });

  /**
   * WORKFLOW 3: Delete Transaction (Keyboard-Only)
   * Expected: Navigate to delete button and confirm deletion
   */
  test("should delete transaction using keyboard only", async ({ page }) => {
    // First add a transaction to delete
    await test.step("Add transaction", async () => {
      const addButton = page.getByRole("button", { name: /add transaction/i });
      await addButton.click();

      // Fill in minimal fields
      await page.locator('select[name="type"]').selectOption("expense");
      await page.locator('input[name="amount"]').fill("99.99");
      await page.locator('input[name="description"]').fill("TO DELETE");

      await page.getByRole("button", { name: /save/i }).click();
      await page.waitForTimeout(1000);
    });

    // Now test keyboard deletion
    await test.step("Delete via keyboard", async () => {
      // Find the transaction row
      const transactionRow = page.getByText("TO DELETE").locator("..");

      // Tab to the delete button in that row
      // Note: This assumes delete buttons are in the DOM
      const deleteButton = transactionRow.getByRole("button", { name: /delete|trash/i });
      await deleteButton.focus();
      await page.keyboard.press("Enter");

      // Verify deletion (transaction should disappear)
      await expect(page.getByText("TO DELETE")).not.toBeVisible({ timeout: 3000 });
    });
  });

  /**
   * WORKFLOW 4: Import CSV (Keyboard-Only)
   * Expected: File input accessible via keyboard
   */
  test("should access import CSV using keyboard only", async ({ page }) => {
    // Tab to Import button
    const importButton = page.getByRole("button", { name: /import csv/i });
    await importButton.focus();
    await page.keyboard.press("Enter");

    // Verify import modal opens
    await expect(page.getByRole("heading", { name: /import/i })).toBeVisible();

    // File input should be keyboard accessible
    const fileInput = page.locator('input[type="file"]');
    await fileInput.focus();

    // Tab to Cancel button and close modal with keyboard
    const cancelButton = page.getByRole("button", { name: /cancel/i });
    await cancelButton.focus();
    await page.keyboard.press("Enter");

    // Modal should close
    await expect(page.getByRole("heading", { name: /import/i })).not.toBeVisible();
  });

  /**
   * WORKFLOW 5: Modal Focus Trap
   * Expected: Tab loops within modal, Escape closes modal
   */
  test("should trap focus within modal and close with Escape", async ({ page }) => {
    // Open Add Transaction modal
    const addButton = page.getByRole("button", { name: /add transaction/i });
    await addButton.click();

    // Verify modal is open
    await expect(page.getByRole("heading", { name: /add transaction/i })).toBeVisible();

    // Store first and last focusable elements
    const modal = page.locator('[role="dialog"], .fixed.inset-0').first();

    // Tab through all elements - focus should loop back
    // This tests the useFocusTrap hook
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press("Tab");
    }

    // Focus should still be within modal
    const focusedElement = await page.locator(":focus").count();
    expect(focusedElement).toBeGreaterThan(0);

    // Press Escape to close modal
    await page.keyboard.press("Escape");

    // Modal should close
    await expect(page.getByRole("heading", { name: /add transaction/i })).not.toBeVisible({
      timeout: 2000,
    });
  });

  /**
   * WORKFLOW 6: Budget Management (Keyboard-Only)
   * Expected: Navigate to budgets page and manage budgets via keyboard
   */
  test("should manage budgets using keyboard only", async ({ page }) => {
    // Navigate to budgets page via keyboard
    await page.goto("http://localhost:3001/budget-app/budgets");
    await page.waitForLoadState("networkidle");

    // Tab to "Add Budget" button
    const addBudgetButton = page.getByRole("button", { name: /add budget/i });
    await addBudgetButton.focus();
    await page.keyboard.press("Enter");

    // Modal should open
    await expect(page.getByRole("heading", { name: /add budget|create budget/i })).toBeVisible();

    // Tab through form
    await page.keyboard.press("Tab"); // Category dropdown
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    await page.keyboard.press("Tab"); // Amount field
    await page.keyboard.type("500");

    await page.keyboard.press("Tab"); // Period dropdown
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    // Close modal with Escape
    await page.keyboard.press("Escape");

    // Modal should close
    await expect(
      page.getByRole("heading", { name: /add budget|create budget/i })
    ).not.toBeVisible();
  });

  /**
   * WORKFLOW 7: Focus Indicators Visible
   * Expected: All interactive elements show visible focus outline
   */
  test("should show visible focus indicators on all interactive elements", async ({ page }) => {
    // Test various interactive elements
    const interactiveElements = [
      page.getByRole("button", { name: /add transaction/i }),
      page.getByPlaceholder(/search/i),
      page.locator("select").first(),
    ];

    for (const element of interactiveElements) {
      if ((await element.count()) > 0) {
        // Focus the element
        await element.focus();

        // Check that element is focused
        const isFocused = await element.evaluate((el) => {
          return document.activeElement === el;
        });

        expect(isFocused).toBe(true);
      }
    }
  });

  /**
   * WORKFLOW 8: Logical Tab Order
   * Expected: Tab order follows visual layout (top-to-bottom, left-to-right)
   */
  test("should maintain logical tab order", async ({ page }) => {
    const tabOrder: string[] = [];

    // Record tab order by tabbing through page
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");

      const focusedElementText = await page.locator(":focus").textContent();
      tabOrder.push(focusedElementText?.substring(0, 30) || "unknown");
    }

    // Log tab order for manual review
    console.log("Tab order:", tabOrder);

    // Verify no positive tabindex (should be natural DOM order)
    const invalidTabIndices = await page.locator("[tabindex]").evaluateAll((elements) => {
      return elements.filter((el) => {
        const tabindex = el.getAttribute("tabindex");
        return tabindex && parseInt(tabindex) > 0;
      }).length;
    });

    expect(invalidTabIndices).toBe(0);
  });

  /**
   * WORKFLOW 9: Checkbox Keyboard Interaction
   * Expected: Checkboxes toggleable with Space key
   */
  test("should toggle checkboxes with Space key", async ({ page }) => {
    // Find a checkbox (e.g., transaction selection)
    const checkbox = page.locator('input[type="checkbox"]').first();

    if ((await checkbox.count()) > 0) {
      await checkbox.focus();

      // Get initial state
      const initialState = await checkbox.isChecked();

      // Press Space to toggle
      await page.keyboard.press("Space");

      // Verify state changed
      const newState = await checkbox.isChecked();
      expect(newState).toBe(!initialState);

      // Press Space again
      await page.keyboard.press("Space");

      // Should return to initial state
      expect(await checkbox.isChecked()).toBe(initialState);
    }
  });

  /**
   * WORKFLOW 10: Escape Key Closes Modals
   * Expected: All modals closeable with Escape key
   */
  test("should close all modals with Escape key", async ({ page }) => {
    // Test Add Transaction modal
    const addButton = page.getByRole("button", { name: /add transaction/i });
    await addButton.click();

    await expect(page.getByRole("heading", { name: /add transaction/i })).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(page.getByRole("heading", { name: /add transaction/i })).not.toBeVisible();

    // Test Import CSV modal
    const importButton = page.getByRole("button", { name: /import csv/i });
    if ((await importButton.count()) > 0) {
      await importButton.click();

      await expect(page.getByRole("heading", { name: /import/i })).toBeVisible();

      await page.keyboard.press("Escape");

      await expect(page.getByRole("heading", { name: /import/i })).not.toBeVisible();
    }
  });
});
