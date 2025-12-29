/**
 * Widget Configuration Storage
 *
 * LocalStorage utilities for persisting dashboard widget configurations
 * Supabase sync will be added in Task 11
 */

import type { DashboardConfig } from './types';
import type { DeviceClass } from '@/lib/breakpoints';
import { getDefaultPreset } from './presets';

const STORAGE_KEY = 'budget_app_widget_config';
const CONFIG_VERSION = 1;

/**
 * Get widget configuration from localStorage
 * If no config exists, returns default preset based on device class
 */
export function getWidgetConfig(deviceClass: DeviceClass): DashboardConfig {
  if (typeof window === 'undefined') {
    return getDefaultPreset(deviceClass);
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // First visit - return device-appropriate preset
      return getDefaultPreset(deviceClass);
    }

    const config: DashboardConfig = JSON.parse(stored);

    // Version check - migrate if needed
    if (config.version !== CONFIG_VERSION) {
      console.warn(
        `Widget config version mismatch (stored: ${config.version}, current: ${CONFIG_VERSION})`
      );
      // For now, return default preset if version mismatch
      // Future: implement migration logic
      return getDefaultPreset(deviceClass);
    }

    // Validate required fields
    if (!config.widgets || !Array.isArray(config.widgets)) {
      console.error('Invalid widget config structure');
      return getDefaultPreset(deviceClass);
    }

    return config;
  } catch (error) {
    console.error('Error loading widget config from localStorage:', error);
    return getDefaultPreset(deviceClass);
  }
}

/**
 * Save widget configuration to localStorage
 * Dispatches custom event for cross-component synchronization
 */
export function setWidgetConfig(config: DashboardConfig): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Update timestamp
    const updatedConfig: DashboardConfig = {
      ...config,
      updatedAt: Date.now(),
      version: CONFIG_VERSION,
    };

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));

    // Dispatch custom event for cross-component sync
    const event = new CustomEvent('widgetConfigChanged', {
      detail: updatedConfig,
    });
    window.dispatchEvent(event);

    console.log('Widget config saved to localStorage');
  } catch (error) {
    console.error('Error saving widget config to localStorage:', error);
    throw error;
  }
}

/**
 * Reset widget configuration to default preset
 */
export function resetWidgetConfig(deviceClass: DeviceClass): void {
  const defaultConfig = getDefaultPreset(deviceClass);
  setWidgetConfig(defaultConfig);
}

/**
 * Clear widget configuration from localStorage
 */
export function clearWidgetConfig(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Widget config cleared from localStorage');
  } catch (error) {
    console.error('Error clearing widget config from localStorage:', error);
  }
}

/**
 * Check if widget configuration exists in localStorage
 */
export function hasWidgetConfig(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch (error) {
    console.error('Error checking widget config existence:', error);
    return false;
  }
}

/**
 * Get widget configuration timestamp
 */
export function getWidgetConfigTimestamp(): number | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const config: DashboardConfig = JSON.parse(stored);
    return config.updatedAt || null;
  } catch (error) {
    console.error('Error getting widget config timestamp:', error);
    return null;
  }
}

/**
 * Export widget configuration as JSON string
 * Useful for backup or sharing
 */
export function exportWidgetConfig(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    // Pretty print for readability
    const config = JSON.parse(stored);
    return JSON.stringify(config, null, 2);
  } catch (error) {
    console.error('Error exporting widget config:', error);
    return null;
  }
}

/**
 * Import widget configuration from JSON string
 */
export function importWidgetConfig(jsonString: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const config: DashboardConfig = JSON.parse(jsonString);

    // Basic validation
    if (!config.widgets || !Array.isArray(config.widgets)) {
      console.error('Invalid widget config format');
      return false;
    }

    setWidgetConfig(config);
    return true;
  } catch (error) {
    console.error('Error importing widget config:', error);
    return false;
  }
}
