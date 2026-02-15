/**
 * Notification Scheduler
 *
 * Periodically checks for conditions that should trigger notifications:
 * - Bill reminders (from recurring transaction detection)
 * - Budget alerts (from overspending detector)
 * - Streak reminders (from gamification system)
 * - Goal milestones (from future purchases)
 */

import { db } from '@/lib/budget-db';
import { detectOverspending } from '@/lib/analytics/overspending-detector';
import {
  detectRecurringTransactions,
  getUpcomingRecurring,
} from '@/lib/analytics/recurring-detector';
import { calculateStreak } from '@/lib/budget-gamification';
import { shouldDeliverNotification } from '@/lib/notifications/notification-settings';
import type { NotificationType } from '@/types/notifications';

interface NotificationInput {
  type: NotificationType;
  title: string;
  body: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  sourceType?: 'subscription' | 'budget' | 'goal' | 'loan';
  sourceId?: string;
  actionUrl?: string;
  amount?: number;
  currency?: string;
}

/**
 * Check all notification sources and return notifications that should be fired.
 * Does NOT persist — caller is responsible for calling addNotification().
 */
export async function checkNotificationSources(): Promise<NotificationInput[]> {
  const notifications: NotificationInput[] = [];

  try {
    const [billNotifs, budgetNotifs, streakNotifs, goalNotifs] =
      await Promise.allSettled([
        checkBillReminders(),
        checkBudgetAlerts(),
        checkStreakReminders(),
        checkGoalMilestones(),
      ]);

    if (billNotifs.status === 'fulfilled') notifications.push(...billNotifs.value);
    if (budgetNotifs.status === 'fulfilled') notifications.push(...budgetNotifs.value);
    if (streakNotifs.status === 'fulfilled') notifications.push(...streakNotifs.value);
    if (goalNotifs.status === 'fulfilled') notifications.push(...goalNotifs.value);
  } catch (error) {
    console.error('[NotificationScheduler] Error checking sources:', error);
  }

  return notifications;
}

/**
 * Check for upcoming bills that need reminders.
 */
async function checkBillReminders(): Promise<NotificationInput[]> {
  if (!shouldDeliverNotification('bill_reminder')) return [];

  const notifications: NotificationInput[] = [];
  const transactions = await db.transactions.toArray();
  const patterns = detectRecurringTransactions(transactions);
  const upcoming = getUpcomingRecurring(patterns);

  const now = new Date();

  for (const pattern of upcoming) {
    const nextDate = new Date(pattern.nextExpectedDate);
    const daysUntilDue = Math.ceil(
      (nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Only remind for bills due in 1-7 days
    if (daysUntilDue < 1 || daysUntilDue > 7) continue;

    // Check if we already sent a notification for this bill recently
    const recentNotifs = await db.inAppNotifications
      .where('sourceId')
      .equals(`bill_${pattern.merchant}`)
      .and((n) => {
        const createdAt = new Date(n.createdAt);
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        return createdAt > threeDaysAgo;
      })
      .count();

    if (recentNotifs > 0) continue;

    notifications.push({
      type: 'bill_reminder',
      title:
        daysUntilDue === 1
          ? `${pattern.merchant} due tomorrow`
          : `${pattern.merchant} due in ${daysUntilDue} days`,
      body: `Expected amount: $${Math.abs(pattern.averageAmount).toFixed(2)}`,
      priority: daysUntilDue <= 2 ? 'urgent' : 'high',
      sourceType: 'subscription',
      sourceId: `bill_${pattern.merchant}`,
      actionUrl: '/budget-app/subscriptions',
      amount: Math.abs(pattern.averageAmount),
    });
  }

  return notifications;
}

/**
 * Check for budget threshold alerts.
 */
async function checkBudgetAlerts(): Promise<NotificationInput[]> {
  if (!shouldDeliverNotification('budget_alert')) return [];

  const notifications: NotificationInput[] = [];
  const [transactions, budgets, categories] = await Promise.all([
    db.transactions.toArray(),
    db.budgets.toArray(),
    db.categories.toArray(),
  ]);

  const alerts = detectOverspending(transactions, budgets, categories);
  const now = new Date();

  for (const alert of alerts) {
    // Only fire for danger-level alerts or first warning
    if (alert.severity !== 'danger' && alert.currentSpent / alert.budgetAmount < alert.threshold) {
      continue;
    }

    // Check if we already notified about this category today
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const recentNotifs = await db.inAppNotifications
      .where('sourceId')
      .equals(`budget_${alert.categoryId}`)
      .and((n) => new Date(n.createdAt) > todayStart)
      .count();

    if (recentNotifs > 0) continue;

    const percentUsed = Math.round((alert.currentSpent / alert.budgetAmount) * 100);

    notifications.push({
      type: 'budget_alert',
      title:
        alert.severity === 'danger'
          ? `${alert.categoryName} is over budget`
          : `${alert.categoryName} at ${percentUsed}%`,
      body:
        alert.severity === 'danger'
          ? `Spent $${alert.currentSpent.toFixed(2)} of $${alert.budgetAmount.toFixed(2)} budget`
          : `$${(alert.budgetAmount - alert.currentSpent).toFixed(2)} remaining this month`,
      priority: alert.severity === 'danger' ? 'high' : 'medium',
      sourceType: 'budget',
      sourceId: `budget_${alert.categoryId}`,
      actionUrl: '/budget-app/budgets',
    });
  }

  return notifications;
}

/**
 * Check if user needs a streak reminder.
 */
async function checkStreakReminders(): Promise<NotificationInput[]> {
  if (!shouldDeliverNotification('system')) return [];

  const notifications: NotificationInput[] = [];

  const streak = await calculateStreak();

  // Only remind if user has an active streak (3+ days) and hasn't logged today
  if (streak.currentStreak < 3) return [];

  const today = new Date().toISOString().split('T')[0];
  if (streak.lastActiveDate === today) return [];

  // Check if we already sent a streak reminder today
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const recentNotifs = await db.inAppNotifications
    .where('sourceId')
    .equals('streak_reminder')
    .and((n) => new Date(n.createdAt) > todayStart)
    .count();

  if (recentNotifs > 0) return [];

  // Only remind in the evening (after 6pm local time)
  if (now.getHours() < 18) return [];

  notifications.push({
    type: 'system',
    title: `${streak.currentStreak}-day streak!`,
    body: 'Log a transaction or review your budget to keep your streak going.',
    priority: 'medium',
    sourceType: 'goal',
    sourceId: 'streak_reminder',
    actionUrl: '/budget-app/transactions',
  });

  return notifications;
}

/**
 * Check for goal milestone achievements.
 */
async function checkGoalMilestones(): Promise<NotificationInput[]> {
  if (!shouldDeliverNotification('goal_milestone')) return [];

  const notifications: NotificationInput[] = [];
  const goals = await db.futurePurchases.where('isCompleted').equals(0).toArray();

  for (const goal of goals) {
    if (goal.targetAmount <= 0) continue;

    const progress = goal.currentSavings / goal.targetAmount;
    const milestones = [0.25, 0.5, 0.75, 1.0];

    for (const milestone of milestones) {
      if (progress < milestone) break;

      const milestoneKey = `goal_${goal.id}_${Math.round(milestone * 100)}`;

      // Check if we already notified for this milestone
      const existing = await db.inAppNotifications
        .where('sourceId')
        .equals(milestoneKey)
        .count();

      if (existing > 0) continue;

      const percentLabel = `${Math.round(milestone * 100)}%`;
      notifications.push({
        type: 'goal_milestone',
        title:
          milestone >= 1.0
            ? `Goal reached: ${goal.name}!`
            : `${goal.name} is ${percentLabel} funded`,
        body:
          milestone >= 1.0
            ? `You saved $${goal.currentSavings.toFixed(2)} for ${goal.name}!`
            : `$${goal.currentSavings.toFixed(2)} of $${goal.targetAmount.toFixed(2)} saved`,
        priority: milestone >= 1.0 ? 'high' : 'medium',
        sourceType: 'goal',
        sourceId: milestoneKey,
        actionUrl: '/budget-app/planning/future',
      });
    }
  }

  return notifications;
}
