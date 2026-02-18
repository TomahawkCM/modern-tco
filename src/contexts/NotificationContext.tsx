"use client";

/**
 * Notification Context
 * Manages notification state, CRUD operations, and permission tracking
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import type {
  InAppNotification,
  NotificationSettings,
  NotificationType,
  NotificationPriority,
  NotificationSourceType,
  SnoozeDuration,
  SNOOZE_DURATIONS,
} from "@/types/notifications";
import {
  addNotification as dbAddNotification,
  getNotifications as dbGetNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead as dbMarkAsRead,
  markAllNotificationsAsRead as dbMarkAllAsRead,
  snoozeNotification as dbSnooze,
  dismissNotification as dbDismiss,
  deleteNotification as dbDelete,
  clearAllNotifications as dbClearAll,
  wakeUpSnoozedNotifications,
} from "@/lib/budget-db";
import {
  getNotificationSettings,
  saveNotificationSettings,
  subscribeToSettingsChanges,
  shouldDeliverNotification,
  getPushPermissionState,
  requestPushPermission,
} from "@/lib/notifications/notification-settings";

// ========================
// Types
// ========================

interface NotificationContextState {
  /** All notifications */
  notifications: InAppNotification[];
  /** Unread notification count */
  unreadCount: number;
  /** Current notification settings */
  settings: NotificationSettings;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
}

interface NotificationContextType extends NotificationContextState {
  /** Add a new notification */
  addNotification: (notification: CreateNotificationInput) => Promise<string | null>;
  /** Mark a notification as read */
  markAsRead: (id: string) => Promise<void>;
  /** Mark all notifications as read */
  markAllAsRead: () => Promise<void>;
  /** Snooze a notification */
  snooze: (id: string, duration: SnoozeDuration) => Promise<void>;
  /** Dismiss a notification */
  dismiss: (id: string) => Promise<void>;
  /** Delete a notification */
  deleteNotification: (id: string) => Promise<void>;
  /** Clear all notifications */
  clearAll: () => Promise<void>;
  /** Refresh notifications from database */
  refresh: () => Promise<void>;
  /** Update notification settings */
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  /** Request push notification permission */
  requestPermission: () => Promise<void>;
  /** Send a test notification */
  sendTestNotification: () => Promise<void>;
}

interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  body: string;
  priority?: NotificationPriority;
  sourceType?: NotificationSourceType;
  sourceId?: string;
  actionUrl?: string;
  icon?: string;
  amount?: number;
  currency?: string;
}

// ========================
// Context
// ========================

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// ========================
// Provider
// ========================

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  // State
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interval refs
  const snoozeCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ========================
  // Initialization
  // ========================

  useEffect(() => {
    async function initialize() {
      try {
        setIsLoading(true);
        setError(null);

        // Load notifications
        const allNotifications = await dbGetNotifications();
        setNotifications(allNotifications);

        // Get unread count
        const count = await getUnreadNotificationCount();
        setUnreadCount(count);

        // Load settings
        const currentSettings = getNotificationSettings();
        setSettings(currentSettings);

        // Wake up any due snoozed notifications
        const wokeUp = await wakeUpSnoozedNotifications();
        if (wokeUp > 0) {
          // Refresh if any were woken up
          const refreshed = await dbGetNotifications();
          setNotifications(refreshed);
          const newCount = await getUnreadNotificationCount();
          setUnreadCount(newCount);
        }
      } catch (err) {
        console.error("[NotificationContext] Initialization error:", err);
        setError("Failed to load notifications");
      } finally {
        setIsLoading(false);
      }
    }

    initialize();

    // Subscribe to settings changes
    const unsubscribe = subscribeToSettingsChanges((newSettings) => {
      setSettings(newSettings);
    });

    // Check for snoozed notifications every minute
    snoozeCheckIntervalRef.current = setInterval(async () => {
      const wokeUp = await wakeUpSnoozedNotifications();
      if (wokeUp > 0) {
        const refreshed = await dbGetNotifications();
        setNotifications(refreshed);
        const newCount = await getUnreadNotificationCount();
        setUnreadCount(newCount);
      }
    }, 60000);

    return () => {
      unsubscribe();
      if (snoozeCheckIntervalRef.current) {
        clearInterval(snoozeCheckIntervalRef.current);
      }
    };
  }, []);

  // ========================
  // Actions
  // ========================

  const refresh = useCallback(async () => {
    try {
      const allNotifications = await dbGetNotifications();
      setNotifications(allNotifications);
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (err) {
      console.error("[NotificationContext] Refresh error:", err);
    }
  }, []);

  const addNotification = useCallback(
    async (input: CreateNotificationInput): Promise<string | null> => {
      // Check if this type of notification should be delivered
      if (!shouldDeliverNotification(input.type, settings)) {
        console.log("[NotificationContext] Notification blocked by settings:", input.type);
        return null;
      }

      try {
        const id = await dbAddNotification({
          type: input.type,
          title: input.title,
          body: input.body,
          status: "unread",
          priority: input.priority || "medium",
          sourceType: input.sourceType,
          sourceId: input.sourceId,
          actionUrl: input.actionUrl,
          icon: input.icon,
          amount: input.amount,
          currency: input.currency,
        });

        await refresh();
        return id;
      } catch (err) {
        console.error("[NotificationContext] Add notification error:", err);
        return null;
      }
    },
    [settings, refresh]
  );

  const markAsRead = useCallback(
    async (id: string) => {
      try {
        await dbMarkAsRead(id);
        await refresh();
      } catch (err) {
        console.error("[NotificationContext] Mark as read error:", err);
      }
    },
    [refresh]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await dbMarkAllAsRead();
      await refresh();
    } catch (err) {
      console.error("[NotificationContext] Mark all as read error:", err);
    }
  }, [refresh]);

  const snooze = useCallback(
    async (id: string, duration: SnoozeDuration) => {
      try {
        const { SNOOZE_DURATIONS } = await import("@/types/notifications");
        const snoozedUntil = new Date(Date.now() + SNOOZE_DURATIONS[duration].ms);
        await dbSnooze(id, snoozedUntil);
        await refresh();
      } catch (err) {
        console.error("[NotificationContext] Snooze error:", err);
      }
    },
    [refresh]
  );

  const dismiss = useCallback(
    async (id: string) => {
      try {
        await dbDismiss(id);
        await refresh();
      } catch (err) {
        console.error("[NotificationContext] Dismiss error:", err);
      }
    },
    [refresh]
  );

  const deleteNotification = useCallback(
    async (id: string) => {
      try {
        await dbDelete(id);
        await refresh();
      } catch (err) {
        console.error("[NotificationContext] Delete error:", err);
      }
    },
    [refresh]
  );

  const clearAll = useCallback(async () => {
    try {
      await dbClearAll();
      await refresh();
    } catch (err) {
      console.error("[NotificationContext] Clear all error:", err);
    }
  }, [refresh]);

  const updateSettings = useCallback(
    (updates: Partial<NotificationSettings>) => {
      const newSettings = {
        ...settings,
        ...updates,
      };
      saveNotificationSettings(newSettings);
      setSettings(newSettings);
    },
    [settings]
  );

  const requestPermission = useCallback(async () => {
    const result = await requestPushPermission();
    updateSettings({ pushPermissionState: result });
  }, [updateSettings]);

  const sendTestNotification = useCallback(async () => {
    await addNotification({
      type: "system",
      title: "Test Notification",
      body: "This is a test notification to verify your settings are working correctly.",
      priority: "medium",
    });
  }, [addNotification]);

  // ========================
  // Context Value
  // ========================

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    settings,
    isLoading,
    error,
    addNotification,
    markAsRead,
    markAllAsRead,
    snooze,
    dismiss,
    deleteNotification,
    clearAll,
    refresh,
    updateSettings,
    requestPermission,
    sendTestNotification,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

// ========================
// Hook
// ========================

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

// ========================
// Optional Hook (doesn't throw)
// ========================

export function useNotificationsOptional(): NotificationContextType | null {
  const context = useContext(NotificationContext);
  return context ?? null;
}
