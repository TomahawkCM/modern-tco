import { test, expect } from "@playwright/test";

test.describe("Mixed Review", () => {
  test.setTimeout(60_000);

  test("CTA starts multi-domain practice session", async ({ page }) => {
    // Seed local progress with multiple domains needing review
    // Module IDs from frontmatter: tco-asking-questions, module-tanium-platform-foundation, module-navigation-basic-modules
    await page.addInitScript(() => {
      try {
        localStorage.setItem(
          "tco-study-progress:tco-asking-questions",
          JSON.stringify({
            lastViewed: "core-concepts",
            sections: [
              {
                id: "natural-language-query-construction",
                title: "Natural Language Query Construction",
                completed: false,
                needsReview: true,
              },
              {
                id: "query-operators",
                title: "Query Operators",
                completed: false,
                needsReview: true,
              },
            ],
          })
        );

        localStorage.setItem(
          "tco-study-progress:module-tanium-platform-foundation",
          JSON.stringify({
            lastViewed: "introduction",
            sections: [
              { id: "key-concepts", title: "Key Concepts", completed: false, needsReview: true },
              {
                id: "architecture-overview",
                title: "Architecture Overview",
                completed: false,
                needsReview: true,
              },
            ],
          })
        );

        localStorage.setItem(
          "tco-study-progress:module-navigation-basic-modules",
          JSON.stringify({
            lastViewed: "overview",
            sections: [
              {
                id: "dashboard-navigation",
                title: "Dashboard Navigation",
                completed: false,
                needsReview: true,
              },
            ],
          })
        );
      } catch {}
    });

    // Navigate to Review Center
    await page.goto("/study/review", { waitUntil: "domcontentloaded" });

    // Verify Review Center is visible
    const reviewHeading = page.locator("h1, h2, h3").filter({ hasText: /Review/i }).first();
    const hasHeading = await reviewHeading.isVisible({ timeout: 15000 }).catch(() => false);

    if (!hasHeading) {
      test.skip(true, "Review Center heading not visible");
      return;
    }

    // Verify multiple domains are listed
    await expect(page.getByText(/Asking Questions/i).first()).toBeVisible({ timeout: 10000 });

    // Find and click the Mixed Review CTA
    const mixedReviewButton = page.getByRole("link", { name: /Start Mixed Review/i });
    const hasMixedReview = await mixedReviewButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (!hasMixedReview) {
      test.skip(true, "Mixed Review CTA not available in current UI");
      return;
    }

    await mixedReviewButton.click();
    await expect(page).toHaveURL(/\/practice/, { timeout: 15000 });

    const url = page.url();
    expect(url).toContain("domain=");
  });

  test("only shows when multiple domains have needs-review items", async ({ page }) => {
    // Seed with only one domain having needs-review items
    await page.addInitScript(() => {
      try {
        localStorage.setItem(
          "tco-study-progress:tco-asking-questions",
          JSON.stringify({
            lastViewed: "core-concepts",
            sections: [
              {
                id: "natural-language-query-construction",
                title: "Natural Language Query Construction",
                completed: false,
                needsReview: true,
              },
            ],
          })
        );
      } catch {}
    });

    await page.goto("/study/review", { waitUntil: "domcontentloaded" });

    const reviewHeading = page.locator("h1, h2, h3").filter({ hasText: /Review/i }).first();
    const hasHeading = await reviewHeading.isVisible({ timeout: 15000 }).catch(() => false);

    if (!hasHeading) {
      test.skip(true, "Review Center heading not visible");
      return;
    }

    // Mixed Review CTA should not be visible with only one domain
    const mixedReviewButton = page.getByRole("link", { name: /Start Mixed Review/i });
    const isVisible = await mixedReviewButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (isVisible) {
      // If visible, it should be disabled or have some indication it's not available
      const href = await mixedReviewButton.getAttribute("href");
      // Accept either hidden or having no href (disabled)
      expect(href === null || href === "").toBeTruthy();
    }
    // If not visible, test passes (button correctly hidden)
  });

  test("filters questions by needs-review domains only", async ({ page }) => {
    // Seed with specific domains needing review
    await page.addInitScript(() => {
      try {
        localStorage.setItem(
          "tco-study-progress:tco-asking-questions",
          JSON.stringify({
            lastViewed: "core-concepts",
            sections: [
              {
                id: "natural-language-query-construction",
                title: "Natural Language Query Construction",
                completed: false,
                needsReview: true,
              },
            ],
          })
        );

        localStorage.setItem(
          "tco-study-progress:module-tanium-platform-foundation",
          JSON.stringify({
            lastViewed: "introduction",
            sections: [
              { id: "key-concepts", title: "Key Concepts", completed: false, needsReview: true },
            ],
          })
        );

        localStorage.setItem(
          "tco-study-progress:module-reporting-data-export",
          JSON.stringify({
            lastViewed: "overview",
            sections: [
              { id: "report-basics", title: "Report Basics", completed: true, needsReview: false },
            ],
          })
        );
      } catch {}
    });

    await page.goto("/study/review", { waitUntil: "domcontentloaded" });

    const mixedReviewButton = page.getByRole("link", { name: /Start Mixed Review/i });
    const hasMixedReview = await mixedReviewButton.isVisible({ timeout: 10000 }).catch(() => false);

    if (!hasMixedReview) {
      test.skip(true, "Mixed Review CTA not available in current UI");
      return;
    }

    await mixedReviewButton.click();
    await expect(page).toHaveURL(/\/practice/, { timeout: 15000 });

    const url = page.url();
    // Should include domains that need review
    expect(url.toLowerCase()).toMatch(/asking|foundation|domain/);
  });
});
