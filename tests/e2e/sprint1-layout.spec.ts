/**
 * Sprint 1 UI Foundation — Visual & Functional Tests
 * Tests the responsive layout, bottom tabs, sidebar, FAB, safe areas, and PWA setup.
 */
import { test, expect } from "@playwright/test";

// Use Playwright's baseURL from config (relative URLs resolve automatically)

// ─── Mobile viewport (iPhone SE: 375×812) ─────────────────────────────
test.describe("Mobile layout (375×812)", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("bottom tab bar is visible with 5 tabs", async ({ page }) => {
    await page.goto(`/budget-app`);
    const nav = page.locator('nav[aria-label="Mobile navigation"]');
    await expect(nav).toBeVisible();

    // Should have 5 tab links/buttons
    const items = nav.locator("a, button");
    await expect(items).toHaveCount(5);
  });

  test("bottom tab bar shows correct labels", async ({ page }) => {
    await page.goto(`/budget-app`);
    const nav = page.locator('nav[aria-label="Mobile navigation"]');

    // Check that the tab labels render (fallback to checking text content)
    const navText = await nav.textContent();
    expect(navText).toContain("Home");
    expect(navText).toContain("Budget");
    expect(navText).toContain("Accounts");
    expect(navText).toContain("Activity");
    expect(navText).toContain("More");
  });

  test("Home tab is active on dashboard", async ({ page }) => {
    await page.goto(`/budget-app`);
    const homeTab = page.locator('nav[aria-label="Mobile navigation"] a[href="/budget-app"]');
    // Active tab should have teal text color class
    await expect(homeTab).toHaveClass(/text-teal-400/);
  });

  test("FAB is visible on mobile", async ({ page }) => {
    await page.goto(`/budget-app`);
    const fab = page.locator('button[aria-label="Add transaction"]');
    await expect(fab).toBeVisible();
  });

  test("sidebar is NOT visible on mobile", async ({ page }) => {
    await page.goto(`/budget-app`);
    const sidebar = page.locator('aside[aria-label="Main sidebar"]');
    await expect(sidebar).not.toBeVisible();
  });

  test("mobile header is visible", async ({ page }) => {
    await page.goto(`/budget-app`);
    const header = page.locator("header").first();
    await expect(header).toBeVisible();
    await expect(header).toContainText("Budget App");
  });

  test("content area has bottom padding for tab bar clearance", async ({ page }) => {
    await page.goto(`/budget-app`);
    const main = page.locator("#main-content");
    // pb-16 = 4rem = 64px padding-bottom
    const paddingBottom = await main.evaluate((el) => getComputedStyle(el).paddingBottom);
    expect(parseFloat(paddingBottom)).toBeGreaterThanOrEqual(56);
  });

  test("screenshot: mobile dashboard", async ({ page }) => {
    await page.goto(`/budget-app`);
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: "tests/results/sprint1-mobile-375.png",
      fullPage: false,
    });
  });
});

// ─── Tablet viewport (iPad: 768×1024) ─────────────────────────────────
test.describe("Tablet layout (768×1024)", () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  test("sidebar is visible as icon-only (72px)", async ({ page }) => {
    await page.goto(`/budget-app`);
    const sidebar = page.locator('aside[aria-label="Main sidebar"]');
    await expect(sidebar).toBeVisible();

    // Sidebar should be narrow (icon-only = 72px = w-18)
    const width = await sidebar.evaluate((el) => el.getBoundingClientRect().width);
    expect(width).toBeLessThanOrEqual(80); // Allow small tolerance
    expect(width).toBeGreaterThanOrEqual(64);
  });

  test("bottom tab bar is NOT visible on tablet", async ({ page }) => {
    await page.goto(`/budget-app`);
    const nav = page.locator('nav[aria-label="Mobile navigation"]');
    await expect(nav).not.toBeVisible();
  });

  test("FAB is NOT visible on tablet", async ({ page }) => {
    await page.goto(`/budget-app`);
    const fab = page.locator('button[aria-label="Add transaction"]');
    await expect(fab).not.toBeVisible();
  });

  test("sidebar nav labels are hidden (icon-only mode)", async ({ page }) => {
    await page.goto(`/budget-app`);
    // Nav item text labels should have hidden class on md
    const navLabels = page.locator("#sidebar-nav a span");
    const firstLabel = navLabels.first();
    // The span should not be visible (hidden lg:inline)
    await expect(firstLabel).not.toBeVisible();
  });

  test("collapse toggle is NOT visible on tablet (only lg+)", async ({ page }) => {
    await page.goto(`/budget-app`);
    // The collapse button has class "hidden lg:flex"
    const collapseBtn = page.locator('aside[aria-label="Main sidebar"] > button').first();
    await expect(collapseBtn).not.toBeVisible();
  });

  test("screenshot: tablet dashboard", async ({ page }) => {
    await page.goto(`/budget-app`);
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: "tests/results/sprint1-tablet-768.png",
      fullPage: false,
    });
  });
});

// ─── Desktop viewport (1440×900) ──────────────────────────────────────
test.describe("Desktop layout (1440×900)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("sidebar is visible with full width (~240px)", async ({ page }) => {
    await page.goto(`/budget-app`);
    const sidebar = page.locator('aside[aria-label="Main sidebar"]');
    await expect(sidebar).toBeVisible();

    const width = await sidebar.evaluate((el) => el.getBoundingClientRect().width);
    // w-60 = 15rem = 240px
    expect(width).toBeGreaterThanOrEqual(230);
    expect(width).toBeLessThanOrEqual(250);
  });

  test("sidebar nav labels are visible on desktop", async ({ page }) => {
    await page.goto(`/budget-app`);
    const firstNavLabel = page.locator("#sidebar-nav a span").first();
    await expect(firstNavLabel).toBeVisible();
  });

  test("collapse toggle is visible on desktop", async ({ page }) => {
    await page.goto(`/budget-app`);
    const collapseBtn = page.locator('aside[aria-label="Main sidebar"] > button').first();
    await expect(collapseBtn).toBeVisible();
  });

  test("clicking collapse toggle shrinks sidebar to icon-only", async ({ page }) => {
    await page.goto(`/budget-app`);
    const sidebar = page.locator('aside[aria-label="Main sidebar"]');
    const collapseBtn = page.locator('aside[aria-label="Main sidebar"] > button').first();

    await collapseBtn.click();
    // Wait for CSS transition
    await page.waitForTimeout(300);

    const width = await sidebar.evaluate((el) => el.getBoundingClientRect().width);
    // Should collapse to ~72px (w-18)
    expect(width).toBeLessThanOrEqual(80);
    expect(width).toBeGreaterThanOrEqual(64);
  });

  test("content max-width is 1440px", async ({ page }) => {
    // Use wider viewport to test max-width constraint
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`/budget-app`);

    const contentContainer = page.locator(".max-w-\\[1440px\\]");
    await expect(contentContainer).toBeVisible();
    const width = await contentContainer.evaluate((el) => el.getBoundingClientRect().width);
    expect(width).toBeLessThanOrEqual(1440);
  });

  test("bottom tab bar and FAB are NOT visible on desktop", async ({ page }) => {
    await page.goto(`/budget-app`);
    const nav = page.locator('nav[aria-label="Mobile navigation"]');
    await expect(nav).not.toBeVisible();
    const fab = page.locator('button[aria-label="Add transaction"]');
    await expect(fab).not.toBeVisible();
  });

  test("screenshot: desktop dashboard", async ({ page }) => {
    await page.goto(`/budget-app`);
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: "tests/results/sprint1-desktop-1440.png",
      fullPage: false,
    });
  });
});

// ─── PWA & Meta Tags ──────────────────────────────────────────────────
test.describe("PWA and meta tags", () => {
  test("manifest link exists", async ({ page }) => {
    await page.goto(`/budget-app`);
    const manifest = page.locator('link[rel="manifest"]');
    await expect(manifest).toHaveAttribute("href", "/manifest.json");
  });

  test("apple-mobile-web-app-capable meta exists", async ({ page }) => {
    await page.goto(`/budget-app`);
    const meta = page.locator('meta[name="apple-mobile-web-app-capable"]');
    await expect(meta).toHaveAttribute("content", "yes");
  });

  test("apple-mobile-web-app-status-bar-style is black-translucent", async ({ page }) => {
    await page.goto(`/budget-app`);
    const meta = page.locator('meta[name="apple-mobile-web-app-status-bar-style"]');
    await expect(meta).toHaveAttribute("content", "black-translucent");
  });

  test("viewport has viewport-fit=cover", async ({ page }) => {
    await page.goto(`/budget-app`);
    const viewport = page.locator('meta[name="viewport"]');
    const content = await viewport.getAttribute("content");
    expect(content).toContain("viewport-fit=cover");
  });

  test("theme-color meta tags exist for both color schemes", async ({ page }) => {
    await page.goto(`/budget-app`);
    const darkTheme = page.locator(
      'meta[name="theme-color"][media="(prefers-color-scheme: dark)"]'
    );
    const lightTheme = page.locator(
      'meta[name="theme-color"][media="(prefers-color-scheme: light)"]'
    );
    await expect(darkTheme).toHaveAttribute("content", "#14B8A6");
    await expect(lightTheme).toHaveAttribute("content", "#0D9488");
  });

  test("manifest.json has correct values", async ({ page }) => {
    const response = await page.goto(`/manifest.json`);
    expect(response?.status()).toBe(200);
    const manifest = await response?.json();
    expect(manifest.background_color).toBe("#1A1B1E");
    expect(manifest.orientation).toBe("any");
    expect(manifest.display).toBe("standalone");
    expect(manifest.theme_color).toBe("#14b8a6");
    expect(manifest.scope).toBe("/budget-app");
  });
});

// ─── Design Tokens (CSS variables) ────────────────────────────────────
test.describe("Design tokens", () => {
  test("financial semantic color tokens are set", async ({ page }) => {
    await page.goto(`/budget-app`);

    const tokens = await page.evaluate(() => {
      const root = document.documentElement;
      const style = getComputedStyle(root);
      return {
        income: style.getPropertyValue("--color-income").trim(),
        expense: style.getPropertyValue("--color-expense").trim(),
        savings: style.getPropertyValue("--color-savings").trim(),
      };
    });

    // In dark mode (default), these should be the dark values
    expect(tokens.income).toBeTruthy();
    expect(tokens.expense).toBeTruthy();
    expect(tokens.savings).toBeTruthy();
  });

  test("spacing grid tokens are set", async ({ page }) => {
    await page.goto(`/budget-app`);

    const tokens = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return {
        space4: style.getPropertyValue("--space-4").trim(),
        space8: style.getPropertyValue("--space-8").trim(),
        touchMin: style.getPropertyValue("--touch-min").trim(),
      };
    });

    expect(tokens.space4).toBe("16px");
    expect(tokens.space8).toBe("32px");
    expect(tokens.touchMin).toBe("44px");
  });

  test("animation tokens are set", async ({ page }) => {
    await page.goto(`/budget-app`);

    const tokens = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return {
        fast: style.getPropertyValue("--duration-fast").trim(),
        normal: style.getPropertyValue("--duration-normal").trim(),
        easeOut: style.getPropertyValue("--ease-out").trim(),
      };
    });

    expect(tokens.fast).toBe("100ms");
    expect(tokens.normal).toBe("200ms");
    expect(tokens.easeOut).toContain("cubic-bezier");
  });

  test("safe area CSS variables are defined", async ({ page }) => {
    await page.goto(`/budget-app`);

    // These will resolve to 0px in a non-notched browser, but should exist
    const safeVars = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return {
        safeTop: style.getPropertyValue("--safe-top").trim(),
        safeBottom: style.getPropertyValue("--safe-bottom").trim(),
      };
    });

    // env() fallback to 0px
    expect(safeVars.safeTop).toBe("0px");
    expect(safeVars.safeBottom).toBe("0px");
  });
});

// ─── Accessibility ────────────────────────────────────────────────────
test.describe("Accessibility basics", () => {
  test("skip link exists and targets main-content", async ({ page }) => {
    await page.goto(`/budget-app`);
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toHaveCount(1);
  });

  test("main content has correct ARIA attributes", async ({ page }) => {
    await page.goto(`/budget-app`);
    const main = page.locator("#main-content");
    await expect(main).toHaveAttribute("role", "main");
    await expect(main).toHaveAttribute("aria-label", "Main content");
  });

  test("sidebar has aria-label", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/budget-app`);
    const sidebar = page.locator('aside[aria-label="Main sidebar"]');
    await expect(sidebar).toBeVisible();
  });

  test("FAB has aria-label", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`/budget-app`);
    const fab = page.locator('button[aria-label="Add transaction"]');
    await expect(fab).toBeVisible();
  });
});
