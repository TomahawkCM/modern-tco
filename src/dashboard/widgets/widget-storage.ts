/**
 * Widget Configuration Storage
 *
 * LocalStorage utilities for persisting dashboard widget configurations
 *
 * Strategy: localStorage-first with Supabase sync (Task 11)
 * - Writes to localStorage immediately (synchronous)
 * - Syncs to Supabase on change (debounced, 1 second)
 * - On app init, checks Supabase for newer data and merges if needed
 */

import type { DashboardConfig } from "./types";
import type { DeviceClass } from "@/lib/breakpoints";
import { getDefaultPreset } from "./presets";
import {
  syncWidgetConfigToSupabase,
  loadWidgetConfigFromSupabase,
} from "@/lib/supabase/user-preferences";

const STORAGE_KEY = "budget_app_widget_config";
const CONFIG_VERSION = 1;

/**
 * Get widget configuration from localStorage
 * If no config exists, returns default preset based on device class
 */
export function getWidgetConfig(deviceClass: DeviceClass): DashboardConfig {
  if (typeof window === "undefined") {
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
      console.error("Invalid widget config structure");
      return getDefaultPreset(deviceClass);
    }

    return config;
  } catch (error) {
    console.error("Error loading widget config from localStorage:", error);
    return getDefaultPreset(deviceClass);
  }
}

/**
 * Save widget configuration to localStorage
 * Dispatches custom event for cross-component synchronization
 * Syncs to Supabase (debounced, 1 second)
 */
export function setWidgetConfig(config: DashboardConfig): void {
  if (typeof window === "undefined") {
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

    // Sync to Supabase (debounced, fire-and-forget)
    syncWidgetConfigToSupabase(updatedConfig);

    // Dispatch custom event for cross-component sync
    const event = new CustomEvent("widgetConfigChanged", {
      detail: updatedConfig,
    });
    window.dispatchEvent(event);

    console.log("Widget config saved to localStorage");
  } catch (error) {
    console.error("Error saving widget config to localStorage:", error);
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
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log("Widget config cleared from localStorage");
  } catch (error) {
    console.error("Error clearing widget config from localStorage:", error);
  }
}

/**
 * Check if widget configuration exists in localStorage
 */
export function hasWidgetConfig(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch (error) {
    console.error("Error checking widget config existence:", error);
    return false;
  }
}

/**
 * Get widget configuration timestamp
 */
export function getWidgetConfigTimestamp(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const config: DashboardConfig = JSON.parse(stored);
    return config.updatedAt || null;
  } catch (error) {
    console.error("Error getting widget config timestamp:", error);
    return null;
  }
}

/**
 * Export widget configuration as JSON string
 * Useful for backup or sharing
 */
export function exportWidgetConfig(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    // Pretty print for readability
    const config = JSON.parse(stored);
    return JSON.stringify(config, null, 2);
  } catch (error) {
    console.error("Error exporting widget config:", error);
    return null;
  }
}

/**
 * Import widget configuration from JSON string
 */
export function importWidgetConfig(jsonString: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const config: DashboardConfig = JSON.parse(jsonString);

    // Basic validation
    if (!config.widgets || !Array.isArray(config.widgets)) {
      console.error("Invalid widget config format");
      return false;
    }

    setWidgetConfig(config);
    return true;
  } catch (error) {
    console.error("Error importing widget config:", error);
    return false;
  }
}

/**
 * Initialize widget configuration from Supabase on app startup
 * Call this once during app initialization (e.g., in useEffect on mount)
 *
 * Conflict Resolution:
 * - If localStorage was recently updated (last 5 minutes), keep localStorage
 * - Otherwise, use Supabase data if it's newer
 * - If no local config exists, use Supabase or fall back to default preset
 *
 * @param deviceClass - Current device class for default preset fallback
 */
export async function initializeWidgetConfig(deviceClass: DeviceClass): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const localConfig = stored ? (JSON.parse(stored) as DashboardConfig) : null;

    const supabaseConfig = await loadWidgetConfigFromSupabase(localConfig);

    if (supabaseConfig) {
      // Supabase has newer data - update localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(supabaseConfig));

      // Dispatch event to notify components
      window.dispatchEvent(
        new CustomEvent("widgetConfigChanged", {
          detail: supabaseConfig,
        })
      );

      console.log("Widget config initialized from Supabase");
    } else {
      console.log("Widget config: using local data");
    }
  } catch (error) {
    console.error("Error initializing widget config:", error);
    // Continue with localStorage data on error
  }
}
