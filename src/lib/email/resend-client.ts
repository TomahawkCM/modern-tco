/**
 * Resend Client Wrapper
 *
 * Provides a configured Resend client for sending emails
 * Server-side only - never expose to client
 */

import { Resend } from "resend";
import type {
  EmailType,
  SendEmailResponse,
  BillReminderEmailProps,
  BudgetAlertEmailProps,
  GoalMilestoneEmailProps,
  WeeklyDigestEmailProps,
  TestEmailProps,
} from "@/types/email";

// Server-side only check
if (typeof window !== "undefined") {
  throw new Error("resend-client.ts should only be imported on the server");
}

// Environment validation
const { RESEND_API_KEY } = process.env;
const EMAIL_FROM = process.env.EMAIL_FROM || "Budget App <onboarding@resend.dev>";
const EMAIL_ENABLED = process.env.NEXT_PUBLIC_EMAIL_NOTIFICATIONS_ENABLED === "true";

// Lazy initialization to avoid issues during build
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    resendClient = new Resend(RESEND_API_KEY);
  }
  return resendClient;
}

/**
 * Check if email sending is enabled and configured
 */
export function isEmailEnabled(): boolean {
  return EMAIL_ENABLED && !!RESEND_API_KEY;
}

/**
 * Get the configured sender email
 */
export function getFromEmail(): string {
  return EMAIL_FROM;
}

/**
 * Send an email using Resend
 *
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param react - React component to render as email body
 * @returns SendEmailResponse
 */
export async function sendEmail(
  to: string,
  subject: string,
  react: React.ReactElement
): Promise<SendEmailResponse> {
  if (!isEmailEnabled()) {
    return {
      success: false,
      error: "Email notifications are not enabled",
    };
  }

  try {
    const resend = getResendClient();

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      react,
    });

    if (error) {
      console.error("Resend error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (err) {
    console.error("Failed to send email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

/**
 * Generate email subject based on type and props
 */
export function getEmailSubject(
  type: EmailType,
  props:
    | BillReminderEmailProps
    | BudgetAlertEmailProps
    | GoalMilestoneEmailProps
    | WeeklyDigestEmailProps
    | TestEmailProps
): string {
  switch (type) {
    case "bill_reminder": {
      const p = props as BillReminderEmailProps;
      if (p.daysUntilDue === 0) {
        return `${p.billName} is due today!`;
      } else if (p.daysUntilDue === 1) {
        return `${p.billName} is due tomorrow`;
      } else {
        return `${p.billName} is due in ${p.daysUntilDue} days`;
      }
    }
    case "budget_alert": {
      const p = props as BudgetAlertEmailProps;
      if (p.alertType === "exceeded") {
        return `Budget exceeded for ${p.categoryName}`;
      } else {
        return `Budget warning: ${p.categoryName} at ${p.percentUsed}%`;
      }
    }
    case "goal_milestone": {
      const p = props as GoalMilestoneEmailProps;
      if (p.milestone === 100) {
        return `Congratulations! You've reached your ${p.goalName} goal!`;
      } else {
        return `Milestone reached: ${p.milestone}% of ${p.goalName}`;
      }
    }
    case "weekly_digest": {
      const p = props as WeeklyDigestEmailProps;
      return `Your Weekly Budget Digest — ${p.weekLabel}`;
    }
    case "test":
      return "Test notification from Budget App";
    default:
      return "Notification from Budget App";
  }
}

/**
 * Generate unsubscribe URL for one-click unsubscribe (RFC 8058)
 */
export function getUnsubscribeUrl(baseUrl: string, token: string, type?: EmailType): string {
  const url = new URL("/api/email/unsubscribe", baseUrl);
  url.searchParams.set("token", token);
  if (type) {
    url.searchParams.set("type", type);
  }
  return url.toString();
}

/**
 * Generate List-Unsubscribe header for email (RFC 8058)
 */
export function getListUnsubscribeHeader(baseUrl: string, token: string, type?: EmailType): string {
  const unsubscribeUrl = getUnsubscribeUrl(baseUrl, token, type);
  return `<${unsubscribeUrl}>`;
}

/**
 * Send email with proper headers including List-Unsubscribe
 */
export async function sendEmailWithHeaders(
  to: string,
  subject: string,
  react: React.ReactElement,
  unsubscribeToken: string,
  baseUrl: string,
  type?: EmailType
): Promise<SendEmailResponse> {
  if (!isEmailEnabled()) {
    return {
      success: false,
      error: "Email notifications are not enabled",
    };
  }

  try {
    const resend = getResendClient();
    const unsubscribeUrl = getUnsubscribeUrl(baseUrl, unsubscribeToken, type);

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject,
      react,
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    if (error) {
      console.error("Resend error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (err) {
    console.error("Failed to send email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

// Re-export types for convenience
export type { SendEmailResponse };
