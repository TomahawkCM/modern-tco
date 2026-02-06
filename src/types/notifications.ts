/**
 * Notification Types for Budget App
 * Supports in-app notifications, push notifications, and calendar export
 */

// ========================
// Notification Settings
// ========================

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export interface NotificationSettings {
  /** Master toggle for all notifications */
  masterEnabled: boolean;
  /** Current push notification permission state */
  pushPermissionState: NotificationPermissionState;
  /** Enable bill/subscription reminders */
  billReminders: boolean;
  /** Enable budget threshold alerts */
  budgetAlerts: boolean;
  /** Enable goal milestone notifications */
  goalMilestones: boolean;
  /** Enable quiet hours (no notifications during this window) */
  quietHoursEnabled: boolean;
  /** Quiet hours start time (24h format, e.g., "22:00") */
  quietHoursStart: string;
  /** Quiet hours end time (24h format, e.g., "08:00") */
  quietHoursEnd: string;
  /** Default reminder days before bill is due */
  defaultReminderDays: number;

  // Email notification settings
  /** Master toggle for email notifications */
  emailEnabled: boolean;
  /** User's email address for notifications */
  emailAddress: string;
  /** Enable email bill reminders */
  emailBillReminders: boolean;
  /** Enable email budget alerts */
  emailBudgetAlerts: boolean;
  /** Enable email goal milestones */
  emailGoalMilestones: boolean;
  /** Unique token for email unsubscribe (RFC 8058) */
  emailUnsubscribeToken: string;
}

// ========================
// In-App Notifications
// ========================

export type NotificationType =
  | 'bill_reminder'
  | 'budget_alert'
  | 'goal_milestone'
  | 'system';

export type NotificationStatus = 'unread' | 'read' | 'snoozed' | 'dismissed';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationSourceType = 'subscription' | 'budget' | 'goal' | 'loan';

export interface InAppNotification {
  /** Unique notification ID */
  id: string;
  /** Type of notification */
  type: NotificationType;
  /** Notification title */
  title: string;
  /** Notification body/message */
  body: string;
  /** Current status */
  status: NotificationStatus;
  /** If snoozed, when to show again */
  snoozedUntil?: Date;
  /** Source entity type (for deep linking) */
  sourceType?: NotificationSourceType;
  /** Source entity ID (for deep linking) */
  sourceId?: string;
  /** URL to navigate to when clicked */
  actionUrl?: string;
  /** Notification priority */
  priority: NotificationPriority;
  /** When the notification was created */
  createdAt: Date;
  /** When the notification was read */
  readAt?: Date;
  /** Optional icon name */
  icon?: string;
  /** Optional amount (for bill reminders) */
  amount?: number;
  /** Optional currency */
  currency?: string;
}

// ========================
// Push Subscription
// ========================

export interface PushSubscriptionKeys {
  /** Public key for encryption */
  p256dh: string;
  /** Authentication secret */
  auth: string;
}

export interface PushSubscriptionRecord {
  /** Unique subscription ID */
  id: string;
  /** Web Push endpoint URL */
  endpoint: string;
  /** Encryption keys */
  keys: PushSubscriptionKeys;
  /** Device fingerprint for deduplication */
  deviceFingerprint: string;
  /** Whether subscription is active */
  isActive: boolean;
  /** Number of consecutive failures */
  failureCount: number;
  /** When the subscription was created */
  createdAt: Date;
  /** When the subscription was last used successfully */
  lastSuccessAt?: Date;
  /** User agent string for debugging */
  userAgent?: string;
}

// ========================
// Reminder Queue
// ========================

export type ReminderStatus = 'pending' | 'sent' | 'failed' | 'cancelled';

export interface SubscriptionReminderQueue {
  /** Unique queue entry ID */
  id: string;
  /** Reference to push subscription */
  pushSubscriptionId: string;
  /** Encrypted notification payload */
  encryptedPayload: string;
  /** When to send the notification */
  scheduledFor: Date;
  /** Current status */
  status: ReminderStatus;
  /** Number of send attempts */
  attempts: number;
  /** Last attempt timestamp */
  lastAttemptAt?: Date;
  /** Error message if failed */
  errorMessage?: string;
  /** Related subscription ID */
  subscriptionId?: string;
}

// ========================
// Calendar Export Types
// ========================

export type CalendarProvider = 'ics' | 'google' | 'outlook' | 'apple';

export interface CalendarEventOptions {
  /** Event title */
  title: string;
  /** Event description */
  description?: string;
  /** Start date/time */
  startDate: Date;
  /** End date/time (optional, defaults to 1 hour after start) */
  endDate?: Date;
  /** All-day event */
  allDay?: boolean;
  /** Location */
  location?: string;
  /** Recurrence rule (RRULE format) */
  recurrence?: CalendarRecurrence;
  /** Reminder minutes before event */
  reminderMinutes?: number;
  /** Calendar to add to (for Google) */
  calendarId?: string;
}

export interface CalendarRecurrence {
  /** Frequency: DAILY, WEEKLY, MONTHLY, YEARLY */
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  /** Interval (e.g., every 2 weeks) */
  interval?: number;
  /** Number of occurrences */
  count?: number;
  /** End date */
  until?: Date;
  /** Days of week (for WEEKLY) */
  byDay?: string[];
  /** Day of month (for MONTHLY) */
  byMonthDay?: number;
}

// ========================
// Snooze Options
// ========================

export type SnoozeDuration =
  | '1_hour'
  | '3_hours'
  | '1_day'
  | '3_days'
  | '1_week';

export const SNOOZE_DURATIONS: Record<SnoozeDuration, { label: string; ms: number }> = {
  '1_hour': { label: '1 hour', ms: 60 * 60 * 1000 },
  '3_hours': { label: '3 hours', ms: 3 * 60 * 60 * 1000 },
  '1_day': { label: '1 day', ms: 24 * 60 * 60 * 1000 },
  '3_days': { label: '3 days', ms: 3 * 24 * 60 * 60 * 1000 },
  '1_week': { label: '1 week', ms: 7 * 24 * 60 * 60 * 1000 },
};

// ========================
// Default Settings
// ========================

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  masterEnabled: true,
  pushPermissionState: 'default',
  billReminders: true,
  budgetAlerts: true,
  goalMilestones: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  defaultReminderDays: 3,
  // Email settings (disabled by default until user enables)
  emailEnabled: false,
  emailAddress: '',
  emailBillReminders: true,
  emailBudgetAlerts: true,
  emailGoalMilestones: true,
  emailUnsubscribeToken: '',
};
