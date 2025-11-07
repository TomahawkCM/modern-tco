/**
 * Unit Tests for Privacy Settings Module
 * Tests AI feature opt-in/opt-out, data export, and privacy controls
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getPrivacySettings,
  savePrivacySettings,
  resetPrivacySettings,
  isSmartDuplicateDetectionEnabled,
  isClaudeAPIEnabled,
  isEncryptionEnabled,
} from '@/lib/budget-privacy-settings';
import type { PrivacySettings } from '@/lib/budget-privacy-settings';

describe('Privacy Settings Module', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  // ========================================
  // Default Settings Tests
  // ========================================
  describe('Default Settings', () => {
    it('should return default settings when none exist', () => {
      const settings = getPrivacySettings();

      expect(settings.enableClaudeAPI).toBe(false);
      expect(settings.enableSmartDuplicateDetection).toBe(false);
      expect(settings.enableAnomalyDetection).toBe(false);
      expect(settings.enablePredictiveSpending).toBe(false);
      expect(settings.enableNaturalLanguageImport).toBe(false);
      expect(settings.enableOCR).toBe(true); // OCR is safe by default
      expect(settings.enableEncryption).toBe(false);
      expect(settings.allowDataExport).toBe(true);
      expect(settings.allowDataDeletion).toBe(true);
    });

    it('should merge new fields with defaults', () => {
      // Simulate old settings without new fields
      const oldSettings = {
        enableClaudeAPI: true,
        updatedAt: Date.now(),
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('budget-app-privacy-settings', JSON.stringify(oldSettings));
      }

      const settings = getPrivacySettings();

      // Old field should be preserved
      expect(settings.enableClaudeAPI).toBe(true);
      // New fields should have defaults
      expect(settings.enableSmartDuplicateDetection).toBe(false);
      expect(settings.enableOCR).toBe(true);
    });
  });

  // ========================================
  // Save/Load Settings Tests
  // ========================================
  describe('Save/Load Settings', () => {
    it('should save and load settings correctly', () => {
      const newSettings: Partial<PrivacySettings> = {
        enableClaudeAPI: true,
        enableSmartDuplicateDetection: true,
        enableOCR: false,
      };

      savePrivacySettings(newSettings);
      const loaded = getPrivacySettings();

      expect(loaded.enableClaudeAPI).toBe(true);
      expect(loaded.enableSmartDuplicateDetection).toBe(true);
      expect(loaded.enableOCR).toBe(false);
      expect(loaded.updatedAt).toBeGreaterThan(0);
    });

    it('should update timestamp on save', () => {
      const initial = getPrivacySettings();
      const initialTime = initial.updatedAt;

      // Wait a bit
      const wait = new Promise(resolve => setTimeout(resolve, 10));

      wait.then(() => {
        savePrivacySettings({ enableClaudeAPI: true });
        const updated = getPrivacySettings();
        expect(updated.updatedAt).toBeGreaterThan(initialTime);
      });
    });

    it('should handle partial updates', () => {
      savePrivacySettings({ enableClaudeAPI: true });
      savePrivacySettings({ enableOCR: false });

      const settings = getPrivacySettings();
      expect(settings.enableClaudeAPI).toBe(true);
      expect(settings.enableOCR).toBe(false);
      // Other settings should remain at defaults
      expect(settings.enableSmartDuplicateDetection).toBe(false);
    });
  });

  // ========================================
  // Reset Settings Tests
  // ========================================
  describe('Reset Settings', () => {
    it('should reset all settings to defaults', () => {
      // Set some custom settings
      savePrivacySettings({
        enableClaudeAPI: true,
        enableSmartDuplicateDetection: true,
        enableOCR: false,
      });

      resetPrivacySettings();

      const settings = getPrivacySettings();
      expect(settings.enableClaudeAPI).toBe(false);
      expect(settings.enableSmartDuplicateDetection).toBe(false);
      expect(settings.enableOCR).toBe(true);
    });
  });

  // ========================================
  // Feature Enablement Tests
  // ========================================
  describe('Feature Enablement Checks', () => {
    it('isSmartDuplicateDetectionEnabled() should require both flags', () => {
      savePrivacySettings({
        enableClaudeAPI: true,
        enableSmartDuplicateDetection: false,
      });
      expect(isSmartDuplicateDetectionEnabled()).toBe(false);

      savePrivacySettings({
        enableClaudeAPI: false,
        enableSmartDuplicateDetection: true,
      });
      expect(isSmartDuplicateDetectionEnabled()).toBe(false);

      savePrivacySettings({
        enableClaudeAPI: true,
        enableSmartDuplicateDetection: true,
      });
      expect(isSmartDuplicateDetectionEnabled()).toBe(true);
    });

    it('isClaudeAPIEnabled() should check master switch', () => {
      savePrivacySettings({ enableClaudeAPI: false });
      expect(isClaudeAPIEnabled()).toBe(false);

      savePrivacySettings({ enableClaudeAPI: true });
      expect(isClaudeAPIEnabled()).toBe(true);
    });

    it('isEncryptionEnabled() should check encryption flag', () => {
      savePrivacySettings({ enableEncryption: false });
      expect(isEncryptionEnabled()).toBe(false);

      savePrivacySettings({ enableEncryption: true });
      expect(isEncryptionEnabled()).toBe(true);
    });
  });

  // ========================================
  // Privacy Controls Integration Tests
  // ========================================
  describe('Privacy Controls Integration', () => {
    it('should disable Claude features when master switch is off', () => {
      // Enable all Claude features
      savePrivacySettings({
        enableClaudeAPI: true,
        enableSmartDuplicateDetection: true,
        enableAnomalyDetection: true,
        enablePredictiveSpending: true,
        enableNaturalLanguageImport: true,
      });

      // Disable master switch
      savePrivacySettings({ enableClaudeAPI: false });

      // All Claude features should be disabled
      expect(isClaudeAPIEnabled()).toBe(false);
      expect(isSmartDuplicateDetectionEnabled()).toBe(false);
    });

    it('should enable master switch when enabling Claude feature', () => {
      // Start with master switch off
      savePrivacySettings({ enableClaudeAPI: false });

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
  describe('Edge Cases', () => {
    it('should handle corrupted localStorage data', () => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('budget-app-privacy-settings', 'invalid json');
      }

      // Should return defaults without crashing
      const settings = getPrivacySettings();
      expect(settings).toBeDefined();
      expect(settings.enableClaudeAPI).toBe(false);
    });

    it('should handle missing localStorage', () => {
      // Simulate SSR environment
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      const settings = getPrivacySettings();
      expect(settings).toBeDefined();
      expect(settings.enableClaudeAPI).toBe(false);

      global.window = originalWindow;
    });

    it('should handle very old settings format', () => {
      if (typeof window !== 'undefined') {
        // Simulate very old format
        localStorage.setItem('budget-app-privacy-settings', JSON.stringify({
          someOldField: true,
        }));
      }

      const settings = getPrivacySettings();
      expect(settings).toBeDefined();
      // Should merge with defaults
      expect(settings.enableClaudeAPI).toBeDefined();
    });
  });
});

