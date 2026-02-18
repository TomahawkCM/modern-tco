/**
 * Bill Reminder Email Template
 *
 * Sent to remind users about upcoming subscription/bill payments
 */

import { Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, emailStyles } from "./components/EmailLayout";
import type { BillReminderEmailProps } from "@/types/email";
import { format } from "date-fns";
import { getUnsubscribeUrl } from "@/lib/email/resend-client";
import { generateCalendarUrls } from "@/lib/email/calendar-links";
import type { BillingCycle } from "@/types/budget";

export function BillReminderEmail({
  billName,
  amount,
  currency,
  dueDate,
  daysUntilDue,
  billingCycle,
  subscriptionUrl,
  unsubscribeToken,
  baseUrl,
}: BillReminderEmailProps) {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(amount);

  const formattedDate = format(new Date(dueDate), "EEEE, MMMM d, yyyy");

  const getPreviewText = () => {
    if (daysUntilDue === 0) {
      return `${billName} (${formattedAmount}) is due today!`;
    } else if (daysUntilDue === 1) {
      return `${billName} (${formattedAmount}) is due tomorrow`;
    } else {
      return `${billName} (${formattedAmount}) is due in ${daysUntilDue} days`;
    }
  };

  const getHeadingText = () => {
    if (daysUntilDue === 0) {
      return "Payment Due Today";
    } else if (daysUntilDue === 1) {
      return "Payment Due Tomorrow";
    } else {
      return "Upcoming Payment";
    }
  };

  const getHeadingColor = () => {
    if (daysUntilDue === 0) {
      return emailStyles.danger.color;
    } else if (daysUntilDue <= 2) {
      return emailStyles.warning.color;
    }
    return emailStyles.heading.color;
  };

  const unsubscribeUrl = getUnsubscribeUrl(baseUrl, unsubscribeToken, "bill_reminder");

  // Generate calendar URLs
  const calendarUrls = generateCalendarUrls(
    {
      name: billName,
      amount,
      currency: currency || "USD",
      dueDate: new Date(dueDate),
      billingCycle: billingCycle as BillingCycle,
    },
    baseUrl
  );

  return (
    <EmailLayout
      preview={getPreviewText()}
      unsubscribeUrl={unsubscribeUrl}
      baseUrl={baseUrl}
      footerText="You received this email because you enabled bill reminders in Budget App."
    >
      {/* Header */}
      <Text style={{ ...emailStyles.heading, color: getHeadingColor() }}>{getHeadingText()}</Text>

      {/* Bill Card */}
      <Section style={emailStyles.card}>
        {/* Bill Name */}
        <Text style={emailStyles.subheading}>{billName}</Text>

        {/* Amount */}
        <Text style={emailStyles.amountLabel}>Amount Due</Text>
        <Text style={emailStyles.amount}>{formattedAmount}</Text>

        {/* Due Date */}
        <div style={emailStyles.divider} />
        <Text style={emailStyles.paragraph}>
          <strong>Due Date:</strong> {formattedDate}
        </Text>

        {/* Billing Cycle */}
        <Text style={emailStyles.muted}>
          {billingCycle.charAt(0).toUpperCase() + billingCycle.slice(1)} subscription
        </Text>
      </Section>

      {/* Countdown */}
      {daysUntilDue > 0 && (
        <Text style={{ ...emailStyles.paragraph, textAlign: "center" as const }}>
          {daysUntilDue === 1
            ? "You have 1 day to prepare for this payment."
            : `You have ${daysUntilDue} days to prepare for this payment.`}
        </Text>
      )}

      {/* Add to Calendar Section */}
      <Section style={calendarSection}>
        <Text style={calendarTitle}>Add to Calendar</Text>
        <div style={calendarButtonsContainer}>
          <Link href={calendarUrls.google} style={calendarButton}>
            Google
          </Link>
          <Link href={calendarUrls.outlook} style={calendarButtonSecondary}>
            Outlook
          </Link>
          <Link href={calendarUrls.ics} style={calendarButtonSecondary}>
            Apple / .ics
          </Link>
        </div>
      </Section>

      {/* CTA Button */}
      {subscriptionUrl && (
        <Section style={{ textAlign: "center" as const, marginTop: "24px" }}>
          <Link href={subscriptionUrl} style={emailStyles.button}>
            View Subscription
          </Link>
        </Section>
      )}

      {/* View All Link */}
      <Section style={{ textAlign: "center" as const, marginTop: "16px" }}>
        <Link href={`${baseUrl}/budget-app/subscriptions`} style={emailStyles.secondaryButton}>
          View All Subscriptions
        </Link>
      </Section>
    </EmailLayout>
  );
}

// Calendar section styles
const calendarSection: React.CSSProperties = {
  backgroundColor: "#1e293b",
  borderRadius: "8px",
  padding: "16px",
  marginTop: "24px",
  textAlign: "center" as const,
};

const calendarTitle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "12px",
  fontWeight: "500",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  margin: "0 0 12px",
};

const calendarButtonsContainer: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: "8px",
};

const calendarButton: React.CSSProperties = {
  backgroundColor: "#2dd4bf",
  borderRadius: "6px",
  color: "#0f172a",
  display: "inline-block",
  fontSize: "12px",
  fontWeight: "600",
  lineHeight: "1",
  padding: "8px 12px",
  textDecoration: "none",
  textAlign: "center" as const,
};

const calendarButtonSecondary: React.CSSProperties = {
  backgroundColor: "transparent",
  border: "1px solid #334155",
  borderRadius: "6px",
  color: "#e2e8f0",
  display: "inline-block",
  fontSize: "12px",
  fontWeight: "500",
  lineHeight: "1",
  padding: "8px 12px",
  textDecoration: "none",
  textAlign: "center" as const,
};

export default BillReminderEmail;
