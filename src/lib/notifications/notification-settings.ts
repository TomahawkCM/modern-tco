/**
 * Notification Settings Storage
 * Manages notification preferences in localStorage with cross-component sync
 */

import {
  type NotificationSettings,
  type NotificationPermissionState,
  DEFAULT_NOTIFICATION_SETTINGS,
} from '@/types/notifications';

// ========================
// Constants
// ========================

const STORAGE_KEY = 'budget-app-notification-settings';
const SETTINGS_CHANGE_EVENT = 'budget-notification-settings-change';

// ========================
// Storage Functions
// ========================

/**
 * Get notification settings from localStorage
 * Returns default settings if none exist
 */
export function getNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_NOTIFICATION_SETTINGS;
    }

    const parsed = JSON.parse(stored);
    // Merge with defaults to handle new fields
    return {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...parsed,
    };
  } catch (error) {
    console.error('Error reading notification settings:', error);
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

/**
 * Save notification settings to localStorage
 * Dispatches a CustomEvent for cross-component sync
 */
export function saveNotificationSettings(settings: NotificationSettings): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

    // Dispatch event for cross-component sync
    window.dispatchEvent(
      new CustomEvent(SETTINGS_CHANGE_EVENT, {
        detail: settings,
      })
    );
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
}

/**
 * Update a single notification setting
 */
export function updateNotificationSetting<K extends keyof NotificationSettings>(
  key: K,
  value: NotificationSettings[K]
): void {
  const settings = getNotificationSettings();
  settings[key] = value;
  saveNotificationSettings(settings);
}

/**
 * Reset notification settings to defaults
 */
export function resetNotificationSettings(): void {
  saveNotificationSettings(DEFAULT_NOTIFICATION_SETTINGS);
}

// ========================
// Cross-Component Sync
// ========================

/**
 * Subscribe to notification settings changes
 * Returns an unsubscribe function
 */
export function subscribeToSettingsChanges(
  callback: (settings: NotificationSettings) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<NotificationSettings>;
    callback(customEvent.detail);
  };

  window.addEventListener(SETTINGS_CHANGE_EVENT, handler);

  // Also listen for storage events (for cross-tab sync)
  const storageHandler = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const settings = JSON.parse(event.newValue);
        callback({
          ...DEFAULT_NOTIFICATION_SETTINGS,
          ...settings,
        });
      } catch (error) {
        console.error('Error parsing storage event:', error);
      }
    }
  };

  window.addEventListener('storage', storageHandler);

  return () => {
    window.removeEventListener(SETTINGS_CHANGE_EVENT, handler);
    window.removeEventListener('storage', storageHandler);
  };
}

// ========================
// Push Notification Permission
// ========================

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Get current push notification permission state
 */
export function getPushPermissionState(): NotificationPermissionState {
  if (!isPushSupported()) {
    return 'unsupported';
  }

  const {permission} = Notification;
  return permission as NotificationPermissionState;
}

/**
 * Request push notification permission
 * Returns the new permission state
 */
export async function requestPushPermission(): Promise<NotificationPermissionState> {
  if (!isPushSupported()) {
    return 'unsupported';
  }

  try {
    const result = await Notification.requestPermission();
    const state = result as NotificationPermissionState;

    // Update stored settings with new permission state
    updateNotificationSetting('pushPermissionState', state);

    return state;
  } catch (error) {
    console.error('Error requesting push permission:', error);
    return 'denied';
  }
}

// ========================
// Quiet Hours
// ========================

/**
 * Check if current time is within quiet hours
 */
export function isWithinQuietHours(settings?: NotificationSettings): boolean {
  const s = settings || getNotificationSettings();

  if (!s.quietHoursEnabled) {
    return false;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Parse start and end times
  const [startHour, startMin] = s.quietHoursStart.split(':').map(Number);
  const [endHour, endMin] = s.quietHoursEnd.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  // Handle overnight quiet hours (e.g., 22:00 - 08:00)
  if (startMinutes > endMinutes) {
    // Quiet hours span midnight
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  } else {
    // Quiet hours within same day
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
}

/**
 * Get minutes until quiet hours end
 * Returns 0 if not in quiet hours
 */
export function getMinutesUntilQuietHoursEnd(settings?: NotificationSettings): number {
  const s = settings || getNotificationSettings();

  if (!isWithinQuietHours(s)) {
    return 0;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [endHour, endMin] = s.quietHoursEnd.split(':').map(Number);
  const endMinutes = endHour * 60 + endMin;

  // Handle overnight case
  if (currentMinutes > endMinutes) {
    // We're after midnight, so end time is "today"
    return endMinutes + (24 * 60 - currentMinutes);
  } else {
    return endMinutes - currentMinutes;
  }
}

// ========================
// Notification Type Checks
// ========================

/**
 * Check if a specific notification type is enabled
 */
export function isNotificationTypeEnabled(
  type: 'bill_reminder' | 'budget_alert' | 'goal_milestone' | 'system',
  settings?: NotificationSettings
): boolean {
  const s = settings || getNotificationSettings();

  if (!s.masterEnabled) {
    return false;
  }

  switch (type) {
    case 'bill_reminder':
      return s.billReminders;
    case 'budget_alert':
      return s.budgetAlerts;
    case 'goal_milestone':
      return s.goalMilestones;
    case 'system':
      return true; // System notifications are always enabled if master is on
    default:
      return false;
  }
}

/**
 * Check if notifications should be delivered now
 * Considers master toggle and quiet hours
 */
export function shouldDeliverNotification(
  type: 'bill_reminder' | 'budget_alert' | 'goal_milestone' | 'system',
  settings?: NotificationSettings
): boolean {
  const s = settings || getNotificationSettings();

  // Check if type is enabled
  if (!isNotificationTypeEnabled(type, s)) {
    return false;
  }

  // Check quiet hours
  if (isWithinQuietHours(s)) {
    return false;
  }

  return true;
}
