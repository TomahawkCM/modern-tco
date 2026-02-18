/**
 * Debug Test for Chatbot Rendering Investigation
 * Captures console logs and DOM state to diagnose why chatbot doesn't render
 */

import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3001";

test.describe("Chatbot Debug - Console Logging", () => {
  test("should log chatbot rendering status", async ({ page }) => {
    // Collect console logs
    const consoleLogs: string[] = [];
    page.on("console", (msg) => {
      const text = msg.text();
      console.log("[BROWSER CONSOLE]", text);
      consoleLogs.push(text);
    });

    // Set localStorage BEFORE page loads
    await page.addInitScript(() => {
      localStorage.setItem(
        "budget-app-privacy-settings",
        JSON.stringify({
          enableChatbot: true,
          enableAIFeatures: true,
          chatbotDataAccess: "read-only",
          chatbotConversationRetention: 7,
          enableAnalytics: true,
          enableErrorTracking: true,
          updatedAt: Date.now(),
        })
      );
    });

    // Navigate to budget app
    await page.goto(`${BASE_URL}/budget-app`);
    await page.waitForLoadState("networkidle");

    // Wait a bit for useEffect to run
    await page.waitForTimeout(2000);

    // Check localStorage in the browser
    const localStorageValue = await page.evaluate(() => {
      return localStorage.getItem("budget-app-privacy-settings");
    });

    console.log("\n=== DEBUG INFO ===");
    console.log("localStorage value:", localStorageValue);

    // Check if ChatbotWidget is in the DOM
    const widgetExists = await page.evaluate(() => {
      const widget = document.querySelector('[class*="chatbot"]');
      const button = document.querySelector('button[class*="chatbot"]');
      return {
        widgetFound: !!widget,
        buttonFound: !!button,
        widgetHTML: widget?.outerHTML || "NOT FOUND",
        buttonHTML: button?.outerHTML || "NOT FOUND",
        bodyHTML: document.body.innerHTML.substring(0, 500),
      };
    });

    console.log("Widget exists:", widgetExists.widgetFound);
    console.log("Button exists:", widgetExists.buttonFound);
    console.log("Widget HTML:", widgetExists.widgetHTML);
    console.log("Button HTML:", widgetExists.buttonHTML);
    console.log("Body HTML (first 500 chars):", widgetExists.bodyHTML);

    // Print all console logs
    console.log("\n=== CONSOLE LOGS ===");
    consoleLogs.forEach((log) => console.log(log));

    // Check for our debug logs
    const chatbotLogs = consoleLogs.filter(
      (log) => log.includes("[ChatbotWidget]") || log.includes("[ChatbotContext]")
    );

    console.log("\n=== CHATBOT DEBUG LOGS ===");
    chatbotLogs.forEach((log) => console.log(log));

    if (chatbotLogs.length === 0) {
      console.log("❌ NO CHATBOT DEBUG LOGS FOUND - Component may not be rendering at all");
    }

    // Take a screenshot for manual inspection
    await page.screenshot({ path: "test-results/chatbot-debug-screenshot.png", fullPage: true });
    console.log("\n✅ Screenshot saved to test-results/chatbot-debug-screenshot.png");
  });
});
