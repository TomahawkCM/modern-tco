/**
 * Email Types for Budget App
 * Supports email notifications via Resend
 */

// ========================
// Email Configuration
// ========================

export interface EmailConfig {
  /** Sender email address */
  from: string;
  /** Resend API key */
  apiKey: string;
  /** Whether email notifications are enabled globally */
  enabled: boolean;
}

// ========================
// Email Types
// ========================

export type EmailType =
  | "bill_reminder"
  | "budget_alert"
  | "goal_milestone"
  | "weekly_digest"
  | "test";

export type EmailStatus = "pending" | "sent" | "failed" | "bounced";

// ========================
// Email Preferences
// ========================

export interface EmailPreferences {
  /** Master toggle for email notifications */
  emailEnabled: boolean;
  /** User's email address for notifications */
  emailAddress: string;
  /** Receive bill/subscription reminders via email */
  billReminders: boolean;
  /** Receive budget threshold alerts via email */
  budgetAlerts: boolean;
  /** Receive goal milestone notifications via email */
  goalMilestones: boolean;
  /** Days before due date to send reminders */
  reminderDaysBefore: number;
  /** Unique token for one-click unsubscribe (RFC 8058) */
  unsubscribeToken: string;
  /** When preferences were last updated */
  updatedAt: Date;
}

export const DEFAULT_EMAIL_PREFERENCES: EmailPreferences = {
  emailEnabled: false,
  emailAddress: "",
  billReminders: true,
  budgetAlerts: true,
  goalMilestones: true,
  reminderDaysBefore: 3,
  unsubscribeToken: "",
  updatedAt: new Date(),
};

// ========================
// Email Templates
// ========================

export interface BillReminderEmailProps {
  /** Recipient email address */
  to: string;
  /** Subscription/bill name */
  billName: string;
  /** Amount due */
  amount: number;
  /** Currency code (e.g., USD) */
  currency: string;
  /** Due date */
  dueDate: Date;
  /** Days until due */
  daysUntilDue: number;
  /** Billing cycle (monthly, yearly, etc.) */
  billingCycle: string;
  /** Direct link to manage subscription */
  subscriptionUrl?: string;
  /** Unsubscribe token for one-click unsubscribe */
  unsubscribeToken: string;
  /** App base URL */
  baseUrl: string;
}

export interface BudgetAlertEmailProps {
  /** Recipient email address */
  to: string;
  /** Budget category name */
  categoryName: string;
  /** Budget limit amount */
  budgetLimit: number;
  /** Current spent amount */
  currentSpent: number;
  /** Percentage of budget used */
  percentUsed: number;
  /** Currency code */
  currency: string;
  /** Alert type: warning (80%) or exceeded (100%) */
  alertType: "warning" | "exceeded";
  /** Direct link to budget details */
  budgetUrl?: string;
  /** Unsubscribe token */
  unsubscribeToken: string;
  /** App base URL */
  baseUrl: string;
}

export interface GoalMilestoneEmailProps {
  /** Recipient email address */
  to: string;
  /** Goal name */
  goalName: string;
  /** Target amount */
  targetAmount: number;
  /** Current saved amount */
  currentAmount: number;
  /** Currency code */
  currency: string;
  /** Milestone reached (25%, 50%, 75%, 100%) */
  milestone: 25 | 50 | 75 | 100;
  /** Direct link to goal details */
  goalUrl?: string;
  /** Unsubscribe token */
  unsubscribeToken: string;
  /** App base URL */
  baseUrl: string;
}

export interface WeeklyDigestEmailProps {
  /** Recipient email address */
  to: string;
  /** Currency code (e.g., USD) */
  currency: string;
  /** Week date range label (e.g. "Feb 24 – Mar 2, 2026") */
  weekLabel: string;
  /** Top categories with spending vs budget */
  categorySpending: {
    categoryName: string;
    spent: number;
    budgeted: number;
    percentUsed: number;
  }[];
  /** Total income for the week */
  totalIncome: number;
  /** Total expenses for the week */
  totalExpenses: number;
  /** Net savings (income - expenses) */
  netSavings: number;
  /** Week-over-week expense change percentage (null = no prior week data) */
  weekOverWeekChange: number | null;
  /** Categories at 80%+ budget usage */
  atRiskCategories: {
    categoryName: string;
    spent: number;
    budgeted: number;
    percentUsed: number;
    status: "warning" | "exceeded";
  }[];
  /** Bills due in the next 7 days */
  upcomingBills: {
    name: string;
    amount: number;
    dueDate: string;
    daysUntilDue: number;
  }[];
  /** Link to the dashboard */
  dashboardUrl: string;
  /** Unsubscribe token */
  unsubscribeToken: string;
  /** App base URL */
  baseUrl: string;
}

export interface TestEmailProps {
  /** Recipient email address */
  to: string;
  /** Unsubscribe token */
  unsubscribeToken: string;
  /** App base URL */
  baseUrl: string;
}

// ========================
// API Request/Response
// ========================

export interface SendEmailRequest {
  type: EmailType;
  props:
    | BillReminderEmailProps
    | BudgetAlertEmailProps
    | GoalMilestoneEmailProps
    | WeeklyDigestEmailProps
    | TestEmailProps;
}

export interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface UnsubscribeRequest {
  token: string;
  type?: EmailType; // Optional: unsubscribe from specific type, or all if not provided
}

export interface UnsubscribeResponse {
  success: boolean;
  message: string;
}

// ========================
// Email Queue (for batch sends)
// ========================

export interface QueuedEmail {
  id: string;
  type: EmailType;
  to: string;
  props: Record<string, unknown>;
  status: EmailStatus;
  scheduledFor: Date;
  attempts: number;
  lastAttemptAt?: Date;
  sentAt?: Date;
  errorMessage?: string;
  createdAt: Date;
}

// ========================
// Email Analytics
// ========================

export interface EmailAnalytics {
  totalSent: number;
  totalFailed: number;
  totalBounced: number;
  byType: Record<EmailType, number>;
  lastSentAt?: Date;
}
