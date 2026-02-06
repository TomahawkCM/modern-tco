/**
 * Email Reminder Service
 *
 * Sends email notifications for subscriptions, budget alerts, and goal milestones
 * This service is called client-side and makes API requests to the email send endpoint
 */

import type { Subscription } from '@/types/budget';
import type { NotificationSettings } from '@/types/notifications';
import type { EmailType } from '@/types/email';
import { getNotificationSettings } from '@/lib/notifications/notification-settings';

interface EmailReminderResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Check if email notifications should be sent for a given type
 */
function shouldSendEmailForType(
  type: EmailType,
  settings: NotificationSettings
): boolean {
  if (!settings.emailEnabled || !settings.emailAddress) {
    return false;
  }

  switch (type) {
    case 'bill_reminder':
      return settings.emailBillReminders;
    case 'budget_alert':
      return settings.emailBudgetAlerts;
    case 'goal_milestone':
      return settings.emailGoalMilestones;
    case 'test':
      return true;
    default:
      return false;
  }
}

/**
 * Send a bill reminder email for a subscription
 */
export async function sendBillReminderEmail(
  subscription: Subscription,
  daysUntilBilling: number
): Promise<EmailReminderResult> {
  const settings = getNotificationSettings();

  if (!shouldSendEmailForType('bill_reminder', settings)) {
    return { success: false, error: 'Email bill reminders disabled' };
  }

  if (subscription.reminderEnabled === false) {
    return { success: false, error: 'Reminder disabled for this subscription' };
  }

  try {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'bill_reminder',
        props: {
          to: settings.emailAddress,
          billName: subscription.name,
          amount: subscription.amount,
          currency: subscription.currency || 'USD',
          dueDate: new Date(subscription.nextBillingDate),
          daysUntilDue: daysUntilBilling,
          billingCycle: subscription.billingCycle,
          subscriptionUrl: `${window.location.origin}/budget-app/subscriptions?id=${subscription.id}`,
          unsubscribeToken: settings.emailUnsubscribeToken,
          baseUrl: window.location.origin,
        },
      }),
    });

    const data = await response.json();
    return {
      success: data.success,
      messageId: data.messageId,
      error: data.error,
    };
  } catch (error) {
    console.error('Failed to send bill reminder email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send a budget alert email
 */
export async function sendBudgetAlertEmail(
  categoryName: string,
  budgetLimit: number,
  currentSpent: number,
  currency: string = 'USD',
  alertType: 'warning' | 'exceeded'
): Promise<EmailReminderResult> {
  const settings = getNotificationSettings();

  if (!shouldSendEmailForType('budget_alert', settings)) {
    return { success: false, error: 'Email budget alerts disabled' };
  }

  const percentUsed = Math.round((currentSpent / budgetLimit) * 100);

  try {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'budget_alert',
        props: {
          to: settings.emailAddress,
          categoryName,
          budgetLimit,
          currentSpent,
          percentUsed,
          currency,
          alertType,
          budgetUrl: `${window.location.origin}/budget-app/budgets`,
          unsubscribeToken: settings.emailUnsubscribeToken,
          baseUrl: window.location.origin,
        },
      }),
    });

    const data = await response.json();
    return {
      success: data.success,
      messageId: data.messageId,
      error: data.error,
    };
  } catch (error) {
    console.error('Failed to send budget alert email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send a goal milestone email
 */
export async function sendGoalMilestoneEmail(
  goalName: string,
  targetAmount: number,
  currentAmount: number,
  currency: string = 'USD',
  milestone: 25 | 50 | 75 | 100,
  goalId?: string
): Promise<EmailReminderResult> {
  const settings = getNotificationSettings();

  if (!shouldSendEmailForType('goal_milestone', settings)) {
    return { success: false, error: 'Email goal milestones disabled' };
  }

  try {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'goal_milestone',
        props: {
          to: settings.emailAddress,
          goalName,
          targetAmount,
          currentAmount,
          currency,
          milestone,
          goalUrl: goalId
            ? `${window.location.origin}/budget-app/goals?id=${goalId}`
            : `${window.location.origin}/budget-app/goals`,
          unsubscribeToken: settings.emailUnsubscribeToken,
          baseUrl: window.location.origin,
        },
      }),
    });

    const data = await response.json();
    return {
      success: data.success,
      messageId: data.messageId,
      error: data.error,
    };
  } catch (error) {
    console.error('Failed to send goal milestone email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send a test email
 */
export async function sendTestEmail(
  emailAddress: string,
  unsubscribeToken: string
): Promise<EmailReminderResult> {
  try {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'test',
        props: {
          to: emailAddress,
          unsubscribeToken,
          baseUrl: window.location.origin,
        },
      }),
    });

    const data = await response.json();
    return {
      success: data.success,
      messageId: data.messageId,
      error: data.error,
    };
  } catch (error) {
    console.error('Failed to send test email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
