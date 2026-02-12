/**
 * Sprint 1 Foundation — Unit Tests
 * Tests design tokens, Tailwind config, i18n keys, and manifest.
 */
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import config from "../tailwind.config";

// ─── Tailwind Config ──────────────────────────────────────────────────
describe("Tailwind config", () => {

  it("has xs breakpoint at 320px", () => {
    expect(config.theme.screens.xs).toBe("320px");
  });

  it("has sm breakpoint at 576px", () => {
    expect(config.theme.screens.sm).toBe("576px");
  });

  it("has md breakpoint at 768px", () => {
    expect(config.theme.screens.md).toBe("768px");
  });

  it("has lg breakpoint at 992px", () => {
    expect(config.theme.screens.lg).toBe("992px");
  });

  it("has xl breakpoint at 1200px", () => {
    expect(config.theme.screens.xl).toBe("1200px");
  });

  it("has 2xl breakpoint at 1440px", () => {
    expect(config.theme.screens["2xl"]).toBe("1440px");
  });

  it("has spacing 18 for icon sidebar (72px)", () => {
    expect(config.theme.extend.spacing["18"]).toBe("4.5rem");
  });

  it("has minHeight touch targets", () => {
    expect(config.theme.extend.minHeight.touch).toBe("44px");
    expect(config.theme.extend.minHeight["touch-comfortable"]).toBe("48px");
    expect(config.theme.extend.minHeight["touch-seniors"]).toBe("56px");
  });

  it("has minWidth touch target", () => {
    expect(config.theme.extend.minWidth.touch).toBe("44px");
  });

  it("has shake keyframe animation", () => {
    expect(config.theme.extend.keyframes.shake).toBeDefined();
    expect(config.theme.extend.animation.shake).toContain("shake");
  });

  it("has container max-width 1440px", () => {
    expect(config.theme.container.screens["2xl"]).toBe("1440px");
  });
});

// ─── i18n Keys ────────────────────────────────────────────────────────
describe("i18n English locale keys", () => {
  const en = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "../src/i18n/messages/en.json"),
      "utf-8"
    )
  );

  describe("mobileNav namespace", () => {
    it("has mobileNav namespace", () => {
      expect(en.mobileNav).toBeDefined();
    });

    it("has home key", () => {
      expect(en.mobileNav.home).toBe("Home");
    });

    it("has budget key", () => {
      expect(en.mobileNav.budget).toBe("Budget");
    });

    it("has accounts key", () => {
      expect(en.mobileNav.accounts).toBe("Accounts");
    });

    it("has activity key", () => {
      expect(en.mobileNav.activity).toBe("Activity");
    });

    it("has more key", () => {
      expect(en.mobileNav.more).toBe("More");
    });
  });

  describe("sidebar actions", () => {
    it("has expandSidebar key", () => {
      expect(en.sidebar.actions.expandSidebar).toBeDefined();
    });

    it("has collapseSidebar key", () => {
      expect(en.sidebar.actions.collapseSidebar).toBeDefined();
    });
  });

  describe("pwaInstall iOS keys", () => {
    it("has iosTitle key", () => {
      expect(en.pwaInstall.iosTitle).toBeDefined();
    });

    it("has iosTap key", () => {
      expect(en.pwaInstall.iosTap).toBeDefined();
    });

    it("has iosThen key", () => {
      expect(en.pwaInstall.iosThen).toBeDefined();
    });

    it("has iosAddToHome key", () => {
      expect(en.pwaInstall.iosAddToHome).toBeDefined();
    });

    it("has iosForFullExperience key", () => {
      expect(en.pwaInstall.iosForFullExperience).toBeDefined();
    });

    it("has close key", () => {
      expect(en.pwaInstall.close).toBeDefined();
    });
  });
});

// ─── manifest.json ────────────────────────────────────────────────────
describe("PWA manifest.json", () => {
  const manifest = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "../public/manifest.json"),
      "utf-8"
    )
  );

  it("has dark background_color", () => {
    expect(manifest.background_color).toBe("#1A1B1E");
  });

  it("has orientation any", () => {
    expect(manifest.orientation).toBe("any");
  });

  it("has teal theme_color", () => {
    expect(manifest.theme_color).toBe("#14b8a6");
  });

  it("has standalone display mode", () => {
    expect(manifest.display).toBe("standalone");
  });

  it("has budget-app scope", () => {
    expect(manifest.scope).toBe("/budget-app");
  });

  it("has categories including finance", () => {
    expect(manifest.categories).toContain("finance");
  });

  it("has maskable icons", () => {
    const hasMatchable = manifest.icons.some((icon: { purpose?: string }) =>
      icon.purpose?.includes("maskable")
    );
    expect(hasMatchable).toBe(true);
  });

  it("has share_target for CSV import", () => {
    expect(manifest.share_target).toBeDefined();
    expect(manifest.share_target.action).toBe("/budget-app/import");
  });

  it("has at least 3 shortcuts", () => {
    expect(manifest.shortcuts.length).toBeGreaterThanOrEqual(3);
  });
});

// ─── Design Token CSS ─────────────────────────────────────────────────
describe("Design tokens in globals.css", () => {
  const css = fs.readFileSync(
    path.resolve(__dirname, "../src/app/globals.css"),
    "utf-8"
  );

  it("has 8px spacing grid variables", () => {
    expect(css).toContain("--space-1: 4px");
    expect(css).toContain("--space-2: 8px");
    expect(css).toContain("--space-4: 16px");
    expect(css).toContain("--space-8: 32px");
    expect(css).toContain("--space-16: 64px");
  });

  it("has touch target variables", () => {
    expect(css).toContain("--touch-min: 44px");
    expect(css).toContain("--touch-comfortable: 48px");
    expect(css).toContain("--touch-seniors: 56px");
    expect(css).toContain("--touch-fab: 56px");
  });

  it("has financial semantic color variables (light mode)", () => {
    expect(css).toContain("--color-income:");
    expect(css).toContain("--color-expense:");
    expect(css).toContain("--color-savings:");
    expect(css).toContain("--color-financial-warning:");
    expect(css).toContain("--color-financial-danger:");
    expect(css).toContain("--color-financial-accent:");
  });

  it("has financial semantic colors in dark mode too", () => {
    // Check that dark mode block also defines financial colors
    const darkBlock = css.slice(css.indexOf(".dark {"));
    expect(darkBlock).toContain("--color-income:");
    expect(darkBlock).toContain("--color-expense:");
    expect(darkBlock).toContain("--color-savings:");
  });

  it("has animation tokens", () => {
    expect(css).toContain("--duration-instant: 0ms");
    expect(css).toContain("--duration-fast: 100ms");
    expect(css).toContain("--duration-normal: 200ms");
    expect(css).toContain("--duration-emphasized: 300ms");
    expect(css).toContain("--duration-dramatic: 500ms");
  });

  it("has easing curves", () => {
    expect(css).toContain("--ease-out:");
    expect(css).toContain("--ease-in:");
    expect(css).toContain("--ease-standard:");
  });

  it("has safe area CSS variables", () => {
    expect(css).toContain("--safe-top: env(safe-area-inset-top");
    expect(css).toContain("--safe-bottom: env(safe-area-inset-bottom");
    expect(css).toContain("--safe-left: env(safe-area-inset-left");
    expect(css).toContain("--safe-right: env(safe-area-inset-right");
  });

  it("has font stacks", () => {
    expect(css).toContain("--font-body:");
    expect(css).toContain("--font-mono:");
  });

  it("has financial-value class with tabular-nums", () => {
    expect(css).toContain(".financial-value");
    expect(css).toContain("tabular-nums");
  });

  it("has dark mode card glow and glass surface", () => {
    expect(css).toContain(".dark .card-interactive:hover");
    expect(css).toContain(".dark .glass-surface");
  });
});

// ─── New Files Exist ──────────────────────────────────────────────────
describe("New files created in Sprint 1", () => {
  it("FloatingActionButton component exists", () => {
    expect(
      fs.existsSync(
        path.resolve(
          __dirname,
          "../src/components/budget/layout/FloatingActionButton.tsx"
        )
      )
    ).toBe(true);
  });

  it("IOSInstallBanner component exists", () => {
    expect(
      fs.existsSync(
        path.resolve(
          __dirname,
          "../src/components/budget/IOSInstallBanner.tsx"
        )
      )
    ).toBe(true);
  });

  it("useIOSStatePreservation hook exists", () => {
    expect(
      fs.existsSync(
        path.resolve(
          __dirname,
          "../src/hooks/useIOSStatePreservation.ts"
        )
      )
    ).toBe(true);
  });
});
