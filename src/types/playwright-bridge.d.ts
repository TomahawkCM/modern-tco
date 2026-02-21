/**
 * TypeScript declarations for the dev-mode Playwright + WebMCP bridge.
 * Exposes budget tool handlers on `window.__budgetTools` so Claude Code
 * can call them via `browser_evaluate` in Playwright.
 *
 * Only populated in development when `localStorage.budget-playwright-bridge === "true"`.
 */

declare global {
  type BudgetToolHandler = (input: Record<string, unknown>) => Promise<unknown>;

  interface BudgetToolsMeta {
    ready: boolean;
    toolCount: number;
    privacyMode: boolean;
    dataLoaded: boolean;
    lastRefresh: string;
  }

  interface Window {
    __budgetTools?: {
      search_transactions: BudgetToolHandler;
      get_budget_summary: BudgetToolHandler;
      get_spending_by_category: BudgetToolHandler;
      get_account_balances: BudgetToolHandler;
      list_categories: BudgetToolHandler;
      get_subscriptions: BudgetToolHandler;
      add_transaction: BudgetToolHandler;
      categorize_transaction: BudgetToolHandler;
      set_budget_limit: BudgetToolHandler;
      _meta: BudgetToolsMeta;
      refresh: () => Promise<void>;
    };
  }
}

export {};
