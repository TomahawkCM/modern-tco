/**
 * Unit Tests for Privacy Settings Module
 * Tests AI feature opt-in/opt-out, data export, and privacy controls
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getPrivacySettings,
  savePrivacySettings,
  resetPrivacySettings,
  isSmartDuplicateDetectionEnabled,
  isClaudeAPIEnabled,
  isEncryptionEnabled,
} from "@/lib/budget-privacy-settings";
import type { PrivacySettings } from "@/lib/budget-privacy-settings";

// Mock isOnlineMode so isClaudeAPIEnabled (which delegates to isAIFeaturesEnabled)
// can return true when AI features are enabled. In the real codebase APP_MODE is
// hardcoded to "standalone", which forces isAIFeaturesEnabled to always return false.
vi.mock("@/config/features", () => ({
  isOnlineMode: () => true,
}));

describe("Privacy Settings Module", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  });

  // ========================================
  // Default Settings Tests
  // ========================================
  describe("Default Settings", () => {
    it("should return default settings when none exist", () => {
      const settings = getPrivacySettings();

      // The actual source uses enableAIFeatures (not enableClaudeAPI)
      // Defaults for the offline-first app:
      expect(settings.enableAIFeatures).toBe(true);
      expect(settings.enableSmartDuplicateDetection).toBe(true);
      expect(settings.enableAnomalyDetection).toBe(true);
      expect(settings.enablePredictiveSpending).toBe(true);
      expect(settings.enableNaturalLanguageImport).toBe(true);
      expect(settings.enableOCR).toBe(true); // OCR is safe by default
      expect(settings.enableEncryption).toBe(true); // Encryption ON by default
      expect(settings.allowDataExport).toBe(true);
      expect(settings.allowDataDeletion).toBe(true);
    });

    it("should merge new fields with defaults", () => {
      // Simulate old settings without new fields
      const oldSettings = {
        enableAIFeatures: false,
        updatedAt: Date.now(),
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("budget-app-privacy-settings", JSON.stringify(oldSettings));
      }

      const settings = getPrivacySettings();

      // Old field should be preserved
      expect(settings.enableAIFeatures).toBe(false);
      // New fields should have defaults
      expect(settings.enableSmartDuplicateDetection).toBe(true);
      expect(settings.enableOCR).toBe(true);
    });
  });

  // ========================================
  // Save/Load Settings Tests
  // ========================================
  describe("Save/Load Settings", () => {
    it("should save and load settings correctly", () => {
      const newSettings: Partial<PrivacySettings> = {
        enableAIFeatures: false,
        enableSmartDuplicateDetection: false,
        enableOCR: false,
      };

      savePrivacySettings(newSettings);
      const loaded = getPrivacySettings();

      expect(loaded.enableAIFeatures).toBe(false);
      expect(loaded.enableSmartDuplicateDetection).toBe(false);
      expect(loaded.enableOCR).toBe(false);
      expect(loaded.updatedAt).toBeGreaterThan(0);
    });

    it("should update timestamp on save", async () => {
      const initial = getPrivacySettings();
      const initialTime = initial.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      savePrivacySettings({ enableAIFeatures: false });
      const updated = getPrivacySettings();
      expect(updated.updatedAt).toBeGreaterThanOrEqual(initialTime);
    });

    it("should handle partial updates", () => {
      savePrivacySettings({ enableAIFeatures: false });
      savePrivacySettings({ enableOCR: false });

      const settings = getPrivacySettings();
      expect(settings.enableAIFeatures).toBe(false);
      expect(settings.enableOCR).toBe(false);
      // Other settings should remain at defaults
      expect(settings.enableSmartDuplicateDetection).toBe(true);
    });
  });

  // ========================================
  // Reset Settings Tests
  // ========================================
  describe("Reset Settings", () => {
    it("should reset all settings to defaults", () => {
      // Set some custom settings
      savePrivacySettings({
        enableAIFeatures: false,
        enableSmartDuplicateDetection: false,
        enableOCR: false,
      });

      resetPrivacySettings();

      const settings = getPrivacySettings();
      expect(settings.enableAIFeatures).toBe(true);
      expect(settings.enableSmartDuplicateDetection).toBe(true);
      expect(settings.enableOCR).toBe(true);
    });
  });

  // ========================================
  // Feature Enablement Tests
  // ========================================
  describe("Feature Enablement Checks", () => {
    it("isSmartDuplicateDetectionEnabled() should require both flags", () => {
      savePrivacySettings({
        enableAIFeatures: true,
        enableSmartDuplicateDetection: false,
      });
      expect(isSmartDuplicateDetectionEnabled()).toBe(false);

      savePrivacySettings({
        enableAIFeatures: false,
        enableSmartDuplicateDetection: true,
      });
      expect(isSmartDuplicateDetectionEnabled()).toBe(false);

      savePrivacySettings({
        enableAIFeatures: true,
        enableSmartDuplicateDetection: true,
      });
      expect(isSmartDuplicateDetectionEnabled()).toBe(true);
    });

    it("isClaudeAPIEnabled() should check master switch", () => {
      // isClaudeAPIEnabled delegates to isAIFeaturesEnabled which checks
      // isOnlineMode() (mocked to true) AND settings.enableAIFeatures
      savePrivacySettings({ enableAIFeatures: false });
      expect(isClaudeAPIEnabled()).toBe(false);

      savePrivacySettings({ enableAIFeatures: true });
      expect(isClaudeAPIEnabled()).toBe(true);
    });

    it("isEncryptionEnabled() should check encryption flag", () => {
      savePrivacySettings({ enableEncryption: false });
      expect(isEncryptionEnabled()).toBe(false);

      savePrivacySettings({ enableEncryption: true });
      expect(isEncryptionEnabled()).toBe(true);
    });
  });

  // ========================================
  // Privacy Controls Integration Tests
  // ========================================
  describe("Privacy Controls Integration", () => {
    it("should disable Claude features when master switch is off", () => {
      // Enable all Claude features
      savePrivacySettings({
        enableAIFeatures: true,
        enableSmartDuplicateDetection: true,
        enableAnomalyDetection: true,
        enablePredictiveSpending: true,
        enableNaturalLanguageImport: true,
      });

      // Disable master switch
      savePrivacySettings({ enableAIFeatures: false });

      // All Claude features should be disabled
      expect(isClaudeAPIEnabled()).toBe(false);
      expect(isSmartDuplicateDetectionEnabled()).toBe(false);
    });

    it("should enable master switch when enabling Claude feature", () => {
      // Start with master switch off
      savePrivacySettings({ enableAIFeatures: false });

      // Enable a Claude feature (simulating UI behavior)
      savePrivacySettings({ enableSmartDuplicateDetection: true });

      // Master switch should be enabled (UI should handle this)
      // But for this test, we verify the feature requires master switch
      expect(isSmartDuplicateDetectionEnabled()).toBe(false);
    });
  });

  // ========================================
  // Edge Cases
  // ========================================
  describe("Edge Cases", () => {
    it("should handle corrupted localStorage data", () => {
      if (typeof window !== "undefined") {
        localStorage.setItem("budget-app-privacy-settings", "invalid json");
      }

      // Should return defaults without crashing
      const settings = getPrivacySettings();
      expect(settings).toBeDefined();
      expect(settings.enableAIFeatures).toBe(true);
    });

    it("should handle missing localStorage", () => {
      // Simulate SSR environment
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const settings = getPrivacySettings();
      expect(settings).toBeDefined();
      expect(settings.enableAIFeatures).toBe(true);

      global.window = originalWindow;
    });

    it("should handle very old settings format", () => {
      if (typeof window !== "undefined") {
        // Simulate very old format
        localStorage.setItem(
          "budget-app-privacy-settings",
          JSON.stringify({
            someOldField: true,
          })
        );
      }

      const settings = getPrivacySettings();
      expect(settings).toBeDefined();
      // Should merge with defaults
      expect(settings.enableAIFeatures).toBeDefined();
    });
  });
});
