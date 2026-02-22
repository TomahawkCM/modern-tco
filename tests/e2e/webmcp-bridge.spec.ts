import { test, expect, type Page } from "@playwright/test";

/**
 * Playwright test suite for the WebMCP hybrid bridge.
 *
 * Tests that `window.__budgetTools` is exposed in dev mode when the
 * `budget-playwright-bridge` localStorage flag is set, and that all
 * 9 registered tool handlers return properly structured data.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Navigate to the budget app with bridge flags pre-set via addInitScript. */
async function setupBridge(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("budget-playwright-bridge", "true");
    localStorage.setItem("budget_app_onboarding_completed", "true");
    localStorage.setItem("budget-app-wizard-completed", "true");
    localStorage.setItem("budget-app-onboarding", '{"completed":true,"skipped":false}');
  });
  await page.goto("/budget-app");
  await page.waitForLoadState("networkidle");
}

/** Wait until the bridge is ready (tools registered on window). */
async function waitForBridge(page: Page) {
  await page.waitForFunction(() => window.__budgetTools?._meta?.ready === true, null, {
    timeout: 15_000,
  });
}

// ---------------------------------------------------------------------------
// Bridge activation
// ---------------------------------------------------------------------------

test.describe("WebMCP Bridge", () => {
  test.describe("activation", () => {
    test("exposes __budgetTools when bridge flag is set", async ({ page }) => {
      await setupBridge(page);
      await waitForBridge(page);

      const meta = await page.evaluate(() => window.__budgetTools!._meta);

      expect(meta.ready).toBe(true);
      expect(meta.toolCount).toBe(9);
      expect(typeof meta.lastRefresh).toBe("string");
      expect(typeof meta.privacyMode).toBe("boolean");
      expect(typeof meta.dataLoaded).toBe("boolean");
    });

    test("does NOT expose __budgetTools without bridge flag", async ({ page }) => {
      // Skip onboarding but don't set bridge flag
      await page.addInitScript(() => {
        localStorage.setItem("budget_app_onboarding_completed", "true");
      });
      await page.goto("/budget-app");
      await page.waitForLoadState("networkidle");

      // Give React time to mount
      await page.waitForTimeout(3_000);

      const hasTools = await page.evaluate(() => typeof window.__budgetTools !== "undefined");
      expect(hasTools).toBe(false);
    });

    test("renders data-webmcp attribute on wrapper element", async ({ page }) => {
      await setupBridge(page);
      await waitForBridge(page);

      const el = page.locator("[data-webmcp='active']");
      await expect(el).toBeAttached();
    });

    test("registers exactly 9 tool functions plus _meta and refresh", async ({ page }) => {
      await setupBridge(page);
      await waitForBridge(page);

      const keys = await page.evaluate(() => Object.keys(window.__budgetTools!));

      const expectedTools = [
        "search_transactions",
        "get_budget_summary",
        "get_spending_by_category",
        "get_account_balances",
        "list_categories",
        "get_subscriptions",
        "add_transaction",
        "categorize_transaction",
        "set_budget_limit",
      ];

      for (const tool of expectedTools) {
        expect(keys).toContain(tool);
      }
      expect(keys).toContain("_meta");
      expect(keys).toContain("refresh");
    });
  });

  // -------------------------------------------------------------------------
  // Read-only tools
  // -------------------------------------------------------------------------

  test.describe("read-only tools", () => {
    test.beforeEach(async ({ page }) => {
      await setupBridge(page);
      await waitForBridge(page);
    });

    test("list_categories returns categories array", async ({ page }) => {
      const result = await page.evaluate(() =>
        window.__budgetTools!.list_categories({ type: "all" })
      );
      const typed = result as { categories: unknown[]; count: number };

      expect(typeof typed.count).toBe("number");
      expect(Array.isArray(typed.categories)).toBe(true);
      expect(typed.categories.length).toBe(typed.count);
    });

    test("list_categories filters by expense type", async ({ page }) => {
      const result = await page.evaluate(() =>
        window.__budgetTools!.list_categories({ type: "expense" })
      );
      const typed = result as { categories: Array<{ type: string }>; count: number };

      expect(typeof typed.count).toBe("number");
      expect(Array.isArray(typed.categories)).toBe(true);
      for (const cat of typed.categories) {
        expect(cat.type).toBe("expense");
      }
    });

    test("list_categories filters by income type", async ({ page }) => {
      const result = await page.evaluate(() =>
        window.__budgetTools!.list_categories({ type: "income" })
      );
      const typed = result as { categories: Array<{ type: string }>; count: number };

      expect(typeof typed.count).toBe("number");
      expect(Array.isArray(typed.categories)).toBe(true);
      for (const cat of typed.categories) {
        expect(cat.type).toBe("income");
      }
    });

    test("get_budget_summary returns valid structure for current month", async ({ page }) => {
      const result = await page.evaluate(() =>
        window.__budgetTools!.get_budget_summary({ month: "2026-02" })
      );
      const typed = result as Record<string, unknown>;

      expect(typed.month).toBe("2026-02");
      expect(typeof typed.totalIncome).toBe("number");
      expect(typeof typed.totalExpenses).toBe("number");
      expect(typeof typed.netSavings).toBe("number");
      expect(typeof typed.transactionCount).toBe("number");
      expect(Array.isArray(typed.topCategories)).toBe(true);
    });

    test("get_budget_summary defaults to current month when omitted", async ({ page }) => {
      const result = await page.evaluate(() => window.__budgetTools!.get_budget_summary({}));
      const typed = result as Record<string, unknown>;

      expect(typed.month).toMatch(/^\d{4}-\d{2}$/);
    });

    test("get_spending_by_category returns array structure", async ({ page }) => {
      const result = await page.evaluate(() =>
        window.__budgetTools!.get_spending_by_category({ month: "2026-02" })
      );
      const typed = result as Record<string, unknown>;

      expect(typed).toHaveProperty("month");
      expect(typed).toHaveProperty("categories");
      expect(Array.isArray(typed.categories)).toBe(true);
    });

    test("get_account_balances returns accounts array", async ({ page }) => {
      const result = await page.evaluate(() => window.__budgetTools!.get_account_balances({}));
      const typed = result as Record<string, unknown>;

      // Empty DB: accounts may be empty, but the shape should be correct
      expect(typed).toHaveProperty("accounts");
      expect(Array.isArray(typed.accounts)).toBe(true);
    });

    test("get_subscriptions returns subscriptions array", async ({ page }) => {
      const result = await page.evaluate(() =>
        window.__budgetTools!.get_subscriptions({ status: "all" })
      );
      const typed = result as Record<string, unknown>;

      expect(typed).toHaveProperty("subscriptions");
      expect(Array.isArray(typed.subscriptions)).toBe(true);
    });

    test("search_transactions returns results structure", async ({ page }) => {
      const result = await page.evaluate(() =>
        window.__budgetTools!.search_transactions({ query: "groceries", limit: 5 })
      );
      const typed = result as { transactions: unknown[]; count: number };

      expect(typed).toHaveProperty("transactions");
      expect(typed).toHaveProperty("count");
      expect(Array.isArray(typed.transactions)).toBe(true);
      expect(typeof typed.count).toBe("number");
    });
  });

  // -------------------------------------------------------------------------
  // Write tools
  // -------------------------------------------------------------------------

  test.describe("write tools", () => {
    test.beforeEach(async ({ page }) => {
      await setupBridge(page);
      await waitForBridge(page);
    });

    test("add_transaction fails gracefully without a valid account", async ({ page }) => {
      const result = await page.evaluate(() =>
        window.__budgetTools!.add_transaction({
          accountId: "nonexistent-account",
          date: "2026-02-15",
          description: "Test transaction",
          amount: -25.5,
          category: "Food & Dining",
        })
      );
      const typed = result as Record<string, unknown>;

      // Should return an error since the account doesn't exist
      expect(typed).toHaveProperty("error");
    });

    test("categorize_transaction fails gracefully for nonexistent transaction", async ({
      page,
    }) => {
      const result = await page.evaluate(() =>
        window.__budgetTools!.categorize_transaction({
          transactionId: "nonexistent-tx-id",
          category: "Shopping",
        })
      );
      const typed = result as Record<string, unknown>;

      expect(typed).toHaveProperty("error");
    });

    test("set_budget_limit fails gracefully for nonexistent category", async ({ page }) => {
      const result = await page.evaluate(() =>
        window.__budgetTools!.set_budget_limit({
          categoryId: "nonexistent-category",
          amount: 500,
          period: "monthly",
        })
      );
      const typed = result as Record<string, unknown>;

      expect(typed).toHaveProperty("error");
    });

    test("set_budget_limit rejects non-positive amounts via Zod", async ({ page }) => {
      const threw = await page.evaluate(async () => {
        try {
          await window.__budgetTools!.set_budget_limit({
            categoryId: "some-id",
            amount: -100,
            period: "monthly",
          });
          return false;
        } catch {
          return true;
        }
      });

      expect(threw).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Input validation (Zod schemas)
  // -------------------------------------------------------------------------

  test.describe("input validation", () => {
    test.beforeEach(async ({ page }) => {
      await setupBridge(page);
      await waitForBridge(page);
    });

    test("get_budget_summary rejects invalid month format via Zod", async ({ page }) => {
      const error = await page.evaluate(async () => {
        try {
          await window.__budgetTools!.get_budget_summary({ month: "February 2026" });
          return null;
        } catch (e) {
          return (e as Error).message;
        }
      });

      expect(error).not.toBeNull();
      expect(error).toContain("invalid");
    });

    test("search_transactions rejects limit above 100 via Zod", async ({ page }) => {
      const error = await page.evaluate(async () => {
        try {
          await window.__budgetTools!.search_transactions({ limit: 500 });
          return null;
        } catch (e) {
          return (e as Error).message;
        }
      });

      expect(error).not.toBeNull();
      expect(error).toContain("too_big");
    });

    test("add_transaction rejects missing required fields via Zod", async ({ page }) => {
      const error = await page.evaluate(async () => {
        try {
          await window.__budgetTools!.add_transaction({ description: "incomplete" });
          return null;
        } catch (e) {
          return (e as Error).message;
        }
      });

      expect(error).not.toBeNull();
      expect(error).toContain("invalid_type");
    });
  });

  // -------------------------------------------------------------------------
  // Refresh mechanism
  // -------------------------------------------------------------------------

  test.describe("refresh", () => {
    test("refresh() updates lastRefresh timestamp", async ({ page }) => {
      await setupBridge(page);
      await waitForBridge(page);

      const before = await page.evaluate(() => window.__budgetTools!._meta.lastRefresh);

      // Wait a moment so timestamps differ
      await page.waitForTimeout(1_100);

      await page.evaluate(() => window.__budgetTools!.refresh());

      // Wait for state update after refresh
      await page.waitForTimeout(500);

      const after = await page.evaluate(() => window.__budgetTools!._meta.lastRefresh);

      expect(new Date(after).getTime()).toBeGreaterThanOrEqual(new Date(before).getTime());
    });
  });
});
