/**
 * Widget Layout Presets
 *
 * Predefined dashboard configurations optimized for different devices and user profiles
 */

import type { DashboardConfig, WidgetConfig, PresetName, GridConfig } from "./types";
import type { DeviceClass } from "@/lib/breakpoints";

/**
 * Phone Default Preset
 * Optimized for small screens - essential widgets only, single column
 */
export const PHONE_DEFAULT: DashboardConfig = {
  widgets: [
    {
      id: "widget_1",
      type: "account-balances",
      order: 0,
      size: "small",
      visible: true,
    },
    {
      id: "widget_2",
      type: "spending-by-category",
      order: 1,
      size: "medium",
      visible: true,
    },
    {
      id: "widget_3",
      type: "recent-transactions",
      order: 2,
      size: "large",
      visible: true,
    },
  ],
  updatedAt: Date.now(),
  version: 1,
};

/**
 * Tablet Default Preset
 * Optimized for medium screens - balanced layout with 2 columns
 */
export const TABLET_DEFAULT: DashboardConfig = {
  widgets: [
    {
      id: "widget_1",
      type: "account-balances",
      order: 0,
      size: "small",
      visible: true,
    },
    {
      id: "widget_2",
      type: "budget-progress",
      order: 1,
      size: "small",
      visible: true,
    },
    {
      id: "widget_3",
      type: "spending-by-category",
      order: 2,
      size: "medium",
      visible: true,
    },
    {
      id: "widget_4",
      type: "income-vs-expenses",
      order: 3,
      size: "medium",
      visible: true,
    },
    {
      id: "widget_5",
      type: "recent-transactions",
      order: 4,
      size: "large",
      visible: true,
    },
  ],
  updatedAt: Date.now(),
  version: 1,
};

/**
 * Desktop Default Preset
 * Optimized for large screens - comprehensive dashboard with 3-4 columns
 */
export const DESKTOP_DEFAULT: DashboardConfig = {
  widgets: [
    {
      id: "widget_1",
      type: "account-balances",
      order: 0,
      size: "small",
      visible: true,
    },
    {
      id: "widget_2",
      type: "budget-progress",
      order: 1,
      size: "small",
      visible: true,
    },
    {
      id: "widget_3",
      type: "upcoming-bills",
      order: 2,
      size: "small",
      visible: true,
    },
    {
      id: "widget_4",
      type: "spending-by-category",
      order: 3,
      size: "medium",
      visible: true,
    },
    {
      id: "widget_5",
      type: "income-vs-expenses",
      order: 4,
      size: "medium",
      visible: true,
    },
    {
      id: "widget_6",
      type: "monthly-trends",
      order: 5,
      size: "large",
      visible: true,
    },
    {
      id: "widget_7",
      type: "recent-transactions",
      order: 6,
      size: "large",
      visible: true,
    },
    {
      id: "widget_8",
      type: "safe-to-spend",
      order: 7,
      size: "medium",
      visible: true,
    },
    {
      id: "widget_9",
      type: "net-worth-mini",
      order: 8,
      size: "small",
      visible: true,
    },
    {
      id: "widget_10",
      type: "weekly-recap",
      order: 9,
      size: "medium",
      visible: true,
    },
  ],
  updatedAt: Date.now(),
  version: 1,
};

/**
 * Seniors Simplified Preset
 * Large text, fewer widgets, essential information only
 */
export const SENIORS_SIMPLIFIED: DashboardConfig = {
  widgets: [
    {
      id: "widget_1",
      type: "account-balances",
      order: 0,
      size: "large",
      visible: true,
      settings: {
        fontSize: "large",
        highContrast: true,
      },
    },
    {
      id: "widget_2",
      type: "recent-transactions",
      order: 1,
      size: "large",
      visible: true,
      settings: {
        fontSize: "large",
        highContrast: true,
        maxItems: 5,
      },
    },
    {
      id: "widget_3",
      type: "upcoming-bills",
      order: 2,
      size: "large",
      visible: true,
      settings: {
        fontSize: "large",
        highContrast: true,
      },
    },
  ],
  updatedAt: Date.now(),
  version: 1,
};

/**
 * Power User Preset
 * All widgets enabled, maximum information density
 */
export const POWER_USER: DashboardConfig = {
  widgets: [
    {
      id: "widget_1",
      type: "account-balances",
      order: 0,
      size: "small",
      visible: true,
    },
    {
      id: "widget_2",
      type: "budget-progress",
      order: 1,
      size: "small",
      visible: true,
    },
    {
      id: "widget_3",
      type: "upcoming-bills",
      order: 2,
      size: "small",
      visible: true,
    },
    {
      id: "widget_4",
      type: "spending-by-category",
      order: 3,
      size: "medium",
      visible: true,
    },
    {
      id: "widget_5",
      type: "income-vs-expenses",
      order: 4,
      size: "medium",
      visible: true,
    },
    {
      id: "widget_6",
      type: "monthly-trends",
      order: 5,
      size: "large",
      visible: true,
    },
    {
      id: "widget_7",
      type: "recent-transactions",
      order: 6,
      size: "large",
      visible: true,
    },
    {
      id: "widget_8",
      type: "safe-to-spend",
      order: 7,
      size: "medium",
      visible: true,
    },
    {
      id: "widget_9",
      type: "streaks",
      order: 8,
      size: "small",
      visible: true,
    },
    {
      id: "widget_10",
      type: "weekly-recap",
      order: 9,
      size: "medium",
      visible: true,
    },
    {
      id: "widget_11",
      type: "net-worth-mini",
      order: 10,
      size: "small",
      visible: true,
    },
    {
      id: "widget_12",
      type: "event-budget",
      order: 11,
      size: "small",
      visible: true,
    },
  ],
  updatedAt: Date.now(),
  version: 1,
};

/**
 * Get default preset based on device class
 */
export function getDefaultPreset(deviceClass: DeviceClass): DashboardConfig {
  switch (deviceClass) {
    case "phone":
      return PHONE_DEFAULT;
    case "tablet":
      return TABLET_DEFAULT;
    case "desktop":
      return DESKTOP_DEFAULT;
    default:
      return TABLET_DEFAULT;
  }
}

/**
 * Get preset by name
 */
export function getPresetByName(name: PresetName): DashboardConfig {
  switch (name) {
    case "phone-default":
      return PHONE_DEFAULT;
    case "tablet-default":
      return TABLET_DEFAULT;
    case "desktop-default":
      return DESKTOP_DEFAULT;
    case "seniors-simplified":
      return SENIORS_SIMPLIFIED;
    case "power-user":
      return POWER_USER;
    default:
      return DESKTOP_DEFAULT;
  }
}

/**
 * Get grid configuration for device class
 */
export function getGridConfig(deviceClass: DeviceClass): GridConfig {
  switch (deviceClass) {
    case "phone":
      return {
        columns: 1,
        gap: "gap-4",
        showBorders: true,
      };
    case "tablet":
      return {
        columns: 2,
        gap: "gap-6",
        showBorders: true,
      };
    case "desktop":
      return {
        columns: 4,
        gap: "gap-6",
        showBorders: false,
      };
    default:
      return {
        columns: 2,
        gap: "gap-6",
        showBorders: true,
      };
  }
}

/**
 * Get all available presets with metadata
 */
export function getAllPresets(): Array<{ name: PresetName; label: string; description: string }> {
  return [
    {
      name: "phone-default",
      label: "Phone Default",
      description: "Optimized for mobile devices - essential widgets only",
    },
    {
      name: "tablet-default",
      label: "Tablet Default",
      description: "Balanced layout for medium screens",
    },
    {
      name: "desktop-default",
      label: "Desktop Default",
      description: "Comprehensive dashboard for large screens",
    },
    {
      name: "seniors-simplified",
      label: "Seniors Simplified",
      description: "Large text, fewer widgets, high contrast",
    },
    {
      name: "power-user",
      label: "Power User",
      description: "All widgets enabled, maximum information",
    },
  ];
}
