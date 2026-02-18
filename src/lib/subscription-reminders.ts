/**
 * Subscription Reminders Service
 *
 * Provides reminder functionality for subscription billing:
 * - Browser notification support
 * - Upcoming charge calculations
 * - Reminder scheduling
 */

import type { Subscription } from "@/types/budget";
import { differenceInDays, addDays, format } from "date-fns";
import { getAllSubscriptions } from "./budget-db";
import { sendBillReminderEmail } from "./email/email-reminder-service";

export interface UpcomingReminder {
  subscription: Subscription;
  daysUntilBilling: number;
  reminderDate: Date;
  billingDate: Date;
  amount: number;
}

/**
 * Check if browser notifications are supported
 */
export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

/**
 * Request notification permission from the user
 * @returns Promise<NotificationPermission>
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    return "denied";
  }

  return await Notification.requestPermission();
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isNotificationSupported()) {
    return "unsupported";
  }
  return Notification.permission;
}

/**
 * Show a browser notification for a subscription
 */
export function showSubscriptionNotification(
  subscription: Subscription,
  daysUntilBilling: number
): void {
  if (!isNotificationSupported() || Notification.permission !== "granted") {
    return;
  }

  const title =
    daysUntilBilling === 0
      ? `${subscription.name} billing today!`
      : `${subscription.name} billing in ${daysUntilBilling} day${daysUntilBilling !== 1 ? "s" : ""}`;

  const body = `$${subscription.amount.toFixed(2)} ${subscription.billingCycle} charge`;

  const icon = "/icons/icon-192x192.png"; // PWA icon

  try {
    const notification = new Notification(title, {
      body,
      icon,
      tag: `subscription-${subscription.id}`,
      requireInteraction: daysUntilBilling === 0,
    });

    notification.onclick = () => {
      window.focus();
      window.location.href = "/budget-app/subscriptions";
      notification.close();
    };

    // Auto-close after 10 seconds (unless it's billing day)
    if (daysUntilBilling > 0) {
      setTimeout(() => notification.close(), 10000);
    }
  } catch (error) {
    console.error("Failed to show notification:", error);
  }
}

/**
 * Get subscriptions that need reminders based on their settings
 * @returns Promise<UpcomingReminder[]>
 */
export async function getSubscriptionsNeedingReminders(): Promise<UpcomingReminder[]> {
  const subscriptions = await getAllSubscriptions();
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Normalize to start of day

  const reminders: UpcomingReminder[] = [];

  for (const sub of subscriptions) {
    // Skip if reminders disabled or not active
    if (!sub.reminderEnabled) continue;
    if (sub.status !== "active" && sub.status !== "trial") continue;

    const billingDate = new Date(sub.nextBillingDate);
    billingDate.setHours(0, 0, 0, 0);

    const daysUntilBilling = differenceInDays(billingDate, now);

    // Check if we should remind today
    if (daysUntilBilling >= 0 && daysUntilBilling <= sub.reminderDaysBefore) {
      reminders.push({
        subscription: sub,
        daysUntilBilling,
        reminderDate: now,
        billingDate,
        amount: sub.amount,
      });
    }
  }

  // Sort by billing date (soonest first)
  return reminders.sort((a, b) => a.daysUntilBilling - b.daysUntilBilling);
}

/**
 * Get all upcoming subscriptions within a specified number of days
 * @param daysAhead Number of days to look ahead (default: 30)
 */
export async function getUpcomingSubscriptions(
  daysAhead: number = 30
): Promise<UpcomingReminder[]> {
  const subscriptions = await getAllSubscriptions();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const futureDate = addDays(now, daysAhead);

  const upcoming: UpcomingReminder[] = [];

  for (const sub of subscriptions) {
    if (sub.status !== "active" && sub.status !== "trial") continue;

    const billingDate = new Date(sub.nextBillingDate);
    billingDate.setHours(0, 0, 0, 0);

    if (billingDate >= now && billingDate <= futureDate) {
      upcoming.push({
        subscription: sub,
        daysUntilBilling: differenceInDays(billingDate, now),
        reminderDate: addDays(billingDate, -sub.reminderDaysBefore),
        billingDate,
        amount: sub.amount,
      });
    }
  }

  return upcoming.sort((a, b) => a.daysUntilBilling - b.daysUntilBilling);
}

/**
 * Check and trigger reminders for today
 * Should be called on app load and periodically
 */
export async function checkAndTriggerReminders(): Promise<number> {
  const reminders = await getSubscriptionsNeedingReminders();
  const shown: string[] = [];

  // Get already shown reminders today from localStorage
  const todayKey = `reminders_shown_${format(new Date(), "yyyy-MM-dd")}`;
  const alreadyShown = new Set(JSON.parse(localStorage.getItem(todayKey) || "[]") as string[]);

  for (const reminder of reminders) {
    const key = `${reminder.subscription.id}_${reminder.daysUntilBilling}`;

    // Skip if already shown today
    if (alreadyShown.has(key)) continue;

    // Show browser notification
    showSubscriptionNotification(reminder.subscription, reminder.daysUntilBilling);

    // Also send email notification (fire and forget - don't block on email)
    sendBillReminderEmail(reminder.subscription, reminder.daysUntilBilling)
      .then((result) => {
        if (result.success) {
          console.warn(`Email reminder sent for ${reminder.subscription.name}`);
        }
      })
      .catch((err) => {
        console.error(`Failed to send email for ${reminder.subscription.name}:`, err);
      });

    shown.push(key);
  }

  // Save shown reminders
  if (shown.length > 0) {
    const allShown = [...alreadyShown, ...shown];
    localStorage.setItem(todayKey, JSON.stringify(allShown));

    // Clean up old reminder tracking (keep last 7 days)
    cleanupOldReminderTracking();
  }

  return shown.length;
}

/**
 * Clean up old reminder tracking from localStorage
 */
function cleanupOldReminderTracking(): void {
  const now = new Date();
  const keys: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("reminders_shown_")) {
      keys.push(key);
    }
  }

  // Keep only last 7 days
  const cutoffDate = addDays(now, -7);
  const cutoffKey = `reminders_shown_${format(cutoffDate, "yyyy-MM-dd")}`;

  for (const key of keys) {
    if (key < cutoffKey) {
      localStorage.removeItem(key);
    }
  }
}

/**
 * Calculate total upcoming charges for a period
 * @param daysAhead Number of days to look ahead
 */
export async function calculateUpcomingCharges(daysAhead: number = 30): Promise<{
  total: number;
  count: number;
  byWeek: { week: number; total: number; subscriptions: Subscription[] }[];
}> {
  const upcoming = await getUpcomingSubscriptions(daysAhead);

  const total = upcoming.reduce((sum, r) => sum + r.amount, 0);

  // Group by week
  const byWeek: Map<number, { total: number; subscriptions: Subscription[] }> = new Map();

  for (const reminder of upcoming) {
    const weekNum = Math.floor(reminder.daysUntilBilling / 7);
    const week = byWeek.get(weekNum) || { total: 0, subscriptions: [] };
    week.total += reminder.amount;
    week.subscriptions.push(reminder.subscription);
    byWeek.set(weekNum, week);
  }

  return {
    total,
    count: upcoming.length,
    byWeek: Array.from(byWeek.entries())
      .map(([week, data]) => ({ week, ...data }))
      .sort((a, b) => a.week - b.week),
  };
}

/**
 * Get subscriptions billing on a specific date
 */
export async function getSubscriptionsBillingOn(date: Date): Promise<Subscription[]> {
  const subscriptions = await getAllSubscriptions();
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  return subscriptions.filter((sub) => {
    if (sub.status !== "active" && sub.status !== "trial") return false;

    const billingDate = new Date(sub.nextBillingDate);
    billingDate.setHours(0, 0, 0, 0);

    return billingDate.getTime() === targetDate.getTime();
  });
}

/**
 * Format reminder message for display
 */
export function formatReminderMessage(reminder: UpcomingReminder): string {
  const { subscription, daysUntilBilling, amount } = reminder;

  if (daysUntilBilling === 0) {
    return `${subscription.name} ($${amount.toFixed(2)}) is billing today!`;
  } else if (daysUntilBilling === 1) {
    return `${subscription.name} ($${amount.toFixed(2)}) is billing tomorrow`;
  } else {
    return `${subscription.name} ($${amount.toFixed(2)}) is billing in ${daysUntilBilling} days`;
  }
}

/**
 * Initialize reminder system on app load
 */
export async function initializeReminders(): Promise<void> {
  // Request permission if not already granted
  if (isNotificationSupported() && Notification.permission === "default") {
    // Don't auto-request, let the UI handle this
    console.warn("Notification permission not yet granted. User can enable in settings.");
  }

  // Check for reminders on load
  if (Notification.permission === "granted") {
    const shown = await checkAndTriggerReminders();
    if (shown > 0) {
      console.warn(`Showed ${shown} subscription reminder(s)`);
    }
  }

  // Set up periodic check (every hour)
  if (typeof window !== "undefined") {
    setInterval(
      () => {
        if (Notification.permission === "granted") {
          void checkAndTriggerReminders();
        }
      },
      60 * 60 * 1000
    ); // 1 hour
  }
}
