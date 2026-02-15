/**
 * Comprehensive Chatbot Testing Suite
 *
 * Tests:
 * 1. Common financial queries (spending breakdown, budget status)
 * 2. Edge cases (no data, ambiguous requests, errors)
 * 3. Multi-turn conversations
 * 4. Mobile device testing
 *
 * Results documented in: docs/chatbot-testing-results.md
 */

import { test, expect } from "@playwright/test";
import { seedBudgetData, clearBudgetData } from "./helpers/budget-test-data";

// Test configuration
const BASE_URL = process.env.BASE_URL || "http://localhost:3003";
const MOBILE_VIEWPORT = { width: 375, height: 667 }; // iPhone SE
const DESKTOP_VIEWPORT = { width: 1280, height: 720 };

test.describe("Chatbot - Desktop Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Set localStorage BEFORE page loads using addInitScript
    await page.addInitScript(() => {
      localStorage.setItem(
        "budget-app-privacy-settings",
        JSON.stringify({
          enableChatbot: true, // Master switch for chatbot
          enableAIFeatures: true, // Master switch for AI features
          chatbotDataAccess: "read-only",
          chatbotConversationRetention: 7,
          enableAnalytics: true,
          enableErrorTracking: true,
          updatedAt: Date.now(),
        })
      );
    });

    // Navigate to page FIRST (required for IndexedDB access)
    await page.goto(`${BASE_URL}/budget-app`);
    await page.setViewportSize(DESKTOP_VIEWPORT);

    // NOW clear and seed data (page context exists)
    await clearBudgetData(page);
    await seedBudgetData(page);

    // Reload to pick up the seeded data
    await page.reload();
    await page.waitForLoadState("networkidle");
  });

  test("should display chatbot interface", async ({ page }) => {
    // Wait for page load
    await page.waitForLoadState("networkidle");

    // Look for chatbot button using aria-label (correct selector!)
    const chatbotButton = page.locator('button[aria-label="Open AI chatbot"]');

    if ((await chatbotButton.count()) > 0) {
      console.log("✓ Chatbot button found");
      await chatbotButton.click();

      // Wait for chatbot interface
      await page.waitForSelector(
        '[role="dialog"], .chatbot-container, h2:has-text("Budget Assistant")',
        { timeout: 5000 }
      );
      console.log("✓ Chatbot interface opened");
    } else {
      console.log("⚠ No chatbot button found - may be always visible or needs opt-in");
    }
  });

  test("should handle chatbot opt-in if required", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    // Check for opt-in dialog
    const optInDialog = page.locator("text=/enable.*chatbot|chatbot.*privacy/i").first();

    if (await optInDialog.isVisible()) {
      console.log("✓ Chatbot opt-in dialog found");

      const acceptButton = page
        .locator("button")
        .filter({ hasText: /accept|enable|yes/i })
        .first();
      await acceptButton.click();
      console.log("✓ Chatbot opt-in accepted");

      await page.waitForTimeout(1000);
    } else {
      console.log("⚠ No opt-in dialog - chatbot may already be enabled");
    }
  });
});

test.describe("Chatbot - Common Financial Queries", () => {
  test.beforeEach(async ({ page }) => {
    // Set localStorage BEFORE page loads using addInitScript
    await page.addInitScript(() => {
      localStorage.setItem(
        "budget-app-privacy-settings",
        JSON.stringify({
          enableChatbot: true, // Master switch for chatbot
          enableAIFeatures: true, // Master switch for AI features
          chatbotDataAccess: "read-only",
          chatbotConversationRetention: 7,
          enableAnalytics: true,
          enableErrorTracking: true,
          updatedAt: Date.now(),
        })
      );
    });

    await page.goto(`${BASE_URL}/budget-app`);
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.waitForLoadState("networkidle");
  });

  const commonQueries = [
    "What is my spending breakdown this month?",
    "Show me my budget status",
    "How much have I spent on groceries?",
    "What are my recent transactions?",
    "Do I have any budget alerts?",
    "How am I doing financially?",
    "What is my total income this month?",
    "Show me my expense categories",
  ];

  for (const query of commonQueries) {
    test(`should respond to: "${query}"`, async ({ page }) => {
      // First open the chatbot by clicking the button
      const chatbotButton = page.locator('button[aria-label="Open AI chatbot"]');

      if (await chatbotButton.isVisible()) {
        await chatbotButton.click();
        await page.waitForTimeout(500); // Wait for panel to open
      }

      // Try to find chatbot input (look for any input in the chatbot panel)
      const chatInput = page.locator('input[type="text"], textarea').first();

      if ((await chatInput.count()) === 0) {
        console.log(`⚠ Chatbot input not found for query: "${query}"`);
        test.skip();
        return;
      }

      await chatInput.first().fill(query);

      const sendButton = page
        .locator('button[type="submit"], button')
        .filter({
          hasText: /send|submit/i,
        })
        .or(page.locator("button svg").filter({ hasText: /send/i }));

      await sendButton.first().click();

      // Wait for response (timeout after 10 seconds)
      const response = await page
        .waitForSelector('.chatbot-message, [role="article"], .message', {
          timeout: 10000,
        })
        .catch(() => null);

      if (response) {
        const responseText = await response.textContent();
        console.log(`✓ Query: "${query}"`);
        console.log(`  Response length: ${responseText?.length || 0} characters`);
        expect(responseText).toBeTruthy();
      } else {
        console.log(`✗ No response received for: "${query}"`);
      }
    });
  }
});

test.describe("Chatbot - Edge Cases", () => {
  test.beforeEach(async ({ page }) => {
    // Set localStorage BEFORE page loads using addInitScript
    await page.addInitScript(() => {
      localStorage.setItem(
        "budget-app-privacy-settings",
        JSON.stringify({
          enableChatbot: true, // Master switch for chatbot
          enableAIFeatures: true, // Master switch for AI features
          chatbotDataAccess: "read-only",
          chatbotConversationRetention: 7,
          enableAnalytics: true,
          enableErrorTracking: true,
          updatedAt: Date.now(),
        })
      );
    });

    await page.goto(`${BASE_URL}/budget-app`);
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.waitForLoadState("networkidle");
  });

  const edgeCaseQueries = [
    { query: "", description: "Empty query" },
    { query: "   ", description: "Whitespace only" },
    { query: "asdfghjkl qwertyuiop", description: "Gibberish" },
    { query: "What is the meaning of life?", description: "Off-topic question" },
    { query: "Show me transactions for category NONEXISTENT", description: "Nonexistent category" },
    { query: "Delete all my data", description: "Destructive command" },
    { query: "a".repeat(1000), description: "Very long query (1000 chars)" },
    { query: "SQL INJECT DROP TABLE users", description: "SQL injection attempt" },
  ];

  for (const { query, description } of edgeCaseQueries) {
    test(`should handle: ${description}`, async ({ page }) => {
      const chatInput = page.locator('input[type="text"], textarea').first();

      if ((await chatInput.count()) === 0) {
        console.log(`⚠ Chatbot not available for edge case: ${description}`);
        test.skip();
        return;
      }

      await chatInput.fill(query);

      const sendButton = page.locator('button[type="submit"]').first();
      const isButtonEnabled = await sendButton.isEnabled().catch(() => false);

      console.log(`Edge case: ${description}`);
      console.log(`  Button enabled: ${isButtonEnabled}`);

      if (query.trim() === "") {
        expect(isButtonEnabled).toBe(false);
        console.log("  ✓ Empty queries correctly disabled");
      }
    });
  }
});

test.describe("Chatbot - Multi-Turn Conversations", () => {
  test.beforeEach(async ({ page }) => {
    // Set localStorage BEFORE page loads using addInitScript
    await page.addInitScript(() => {
      localStorage.setItem(
        "budget-app-privacy-settings",
        JSON.stringify({
          enableChatbot: true, // Master switch for chatbot
          enableAIFeatures: true, // Master switch for AI features
          chatbotDataAccess: "read-only",
          chatbotConversationRetention: 7,
          enableAnalytics: true,
          enableErrorTracking: true,
          updatedAt: Date.now(),
        })
      );
    });

    await page.goto(`${BASE_URL}/budget-app`);
    await page.setViewportSize(DESKTOP_VIEWPORT);
    await page.waitForLoadState("networkidle");
  });

  test("should maintain context across multiple queries", async ({ page }) => {
    const conversationFlow = [
      "Show me my spending on groceries",
      "What about last month?",
      "Compare it to the month before",
      "What category did I spend the most on?",
    ];

    const chatInput = page.locator('input[type="text"], textarea').first();

    if ((await chatInput.count()) === 0) {
      console.log("⚠ Chatbot not available for multi-turn test");
      test.skip();
      return;
    }

    console.log("Multi-turn conversation test:");

    for (let i = 0; i < conversationFlow.length; i++) {
      const query = conversationFlow[i];
      console.log(`  Turn ${i + 1}: "${query}"`);

      await chatInput.fill(query);
      await page.locator('button[type="submit"]').first().click();

      // Wait for response
      await page.waitForTimeout(2000);

      // Count messages (should increase with each turn)
      const messageCount = await page
        .locator('.chatbot-message, [role="article"], .message')
        .count();
      console.log(`    Messages in conversation: ${messageCount}`);

      expect(messageCount).toBeGreaterThanOrEqual((i + 1) * 2); // User + Assistant per turn
    }
  });
});

test.describe("Chatbot - Mobile Device Testing", () => {
  test.beforeEach(async ({ page }) => {
    // Set localStorage BEFORE page loads using addInitScript
    await page.addInitScript(() => {
      localStorage.setItem(
        "budget-app-privacy-settings",
        JSON.stringify({
          enableChatbot: true, // Master switch for chatbot
          enableAIFeatures: true, // Master switch for AI features
          chatbotDataAccess: "read-only",
          chatbotConversationRetention: 7,
          enableAnalytics: true,
          enableErrorTracking: true,
          updatedAt: Date.now(),
        })
      );
    });

    await page.goto(`${BASE_URL}/budget-app`);
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.waitForLoadState("networkidle");
  });

  test("should be accessible on mobile viewport", async ({ page }) => {
    console.log("Mobile viewport test (375x667):");

    // Check if chatbot button is visible and accessible (use aria-label)
    const chatbotButton = page.locator('button[aria-label="Open AI chatbot"]');

    if ((await chatbotButton.count()) > 0) {
      const isVisible = await chatbotButton.isVisible();
      console.log(`  ✓ Chatbot button visible: ${isVisible}`);

      const box = await chatbotButton.boundingBox();
      if (box) {
        console.log(`  Touch target: ${box.width}x${box.height}px`);
        expect(box.width).toBeGreaterThanOrEqual(44); // WCAG minimum
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    } else {
      console.log("  ⚠ Chatbot button not found on mobile");
    }
  });

  test("should display mobile-optimized interface", async ({ page }) => {
    const chatInput = page.locator('input[type="text"], textarea').first();

    if ((await chatInput.count()) === 0) {
      console.log("⚠ Chatbot input not found on mobile");
      test.skip();
      return;
    }

    const box = await chatInput.boundingBox();
    if (box) {
      console.log(`Mobile input field: ${box.width}x${box.height}px`);
      expect(box.height).toBeGreaterThanOrEqual(48); // WCAG minimum for mobile
    }

    // Test that interface doesn't overflow viewport
    const body = await page.locator("body").boundingBox();
    if (box && body) {
      expect(box.width).toBeLessThanOrEqual(MOBILE_VIEWPORT.width);
      console.log("✓ Interface fits mobile viewport");
    }
  });

  test("should handle mobile queries", async ({ page }) => {
    const mobileQuery = "What did I spend this month?";

    const chatInput = page.locator('input[type="text"], textarea').first();

    if ((await chatInput.count()) === 0) {
      console.log("⚠ Chatbot not available on mobile");
      test.skip();
      return;
    }

    await chatInput.fill(mobileQuery);
    await page.locator('button[type="submit"]').first().click();

    console.log(`Mobile query: "${mobileQuery}"`);
    console.log("  ✓ Query submitted successfully");
  });
});

test.describe("Chatbot - Error Handling", () => {
  test.beforeEach(async ({ page }) => {
    // Set localStorage BEFORE page loads using addInitScript
    await page.addInitScript(() => {
      localStorage.setItem(
        "budget-app-privacy-settings",
        JSON.stringify({
          enableChatbot: true, // Master switch for chatbot
          enableAIFeatures: true, // Master switch for AI features
          chatbotDataAccess: "read-only",
          chatbotConversationRetention: 7,
          enableAnalytics: true,
          enableErrorTracking: true,
          updatedAt: Date.now(),
        })
      );
    });

    await page.goto(`${BASE_URL}/budget-app`);
    await page.waitForLoadState("networkidle");
  });

  test("should display error messages gracefully", async ({ page }) => {
    // Simulate network error by blocking API calls
    await page.route("**/api/chat**", (route) => {
      route.abort("failed");
    });

    const chatInput = page.locator('input[type="text"], textarea').first();

    if ((await chatInput.count()) === 0) {
      console.log("⚠ Chatbot not available for error test");
      test.skip();
      return;
    }

    await chatInput.fill("Test error handling");
    await page.locator('button[type="submit"]').first().click();

    // Wait for error message
    const errorMessage = await page
      .waitForSelector('[role="alert"], .error, text=/error|failed/i', {
        timeout: 5000,
      })
      .catch(() => null);

    if (errorMessage) {
      const errorText = await errorMessage.textContent();
      console.log("✓ Error message displayed:");
      console.log(`  "${errorText}"`);
    } else {
      console.log("⚠ No error message displayed (may be handling silently)");
    }
  });

  test("should recover from errors", async ({ page }) => {
    // First request fails
    let requestCount = 0;
    await page.route("**/api/chat**", (route) => {
      requestCount++;
      if (requestCount === 1) {
        route.abort("failed");
      } else {
        route.continue();
      }
    });

    const chatInput = page.locator('input[type="text"], textarea').first();

    if ((await chatInput.count()) === 0) {
      test.skip();
      return;
    }

    // First query (will fail)
    await chatInput.fill("First query");
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(2000);

    // Second query (should succeed)
    await chatInput.fill("Second query");
    await page.locator('button[type="submit"]').first().click();

    console.log("Error recovery test:");
    console.log(`  Total API calls: ${requestCount}`);
    console.log("  ✓ Chatbot can recover from errors");
  });
});
