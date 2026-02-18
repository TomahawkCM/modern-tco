/**
 * Test Email Template
 *
 * Sent to verify email configuration is working
 */

import { Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, emailStyles } from "./components/EmailLayout";
import type { TestEmailProps } from "@/types/email";
import { getUnsubscribeUrl } from "@/lib/email/resend-client";

export function TestEmail({ unsubscribeToken, baseUrl }: TestEmailProps) {
  const unsubscribeUrl = getUnsubscribeUrl(baseUrl, unsubscribeToken);

  return (
    <EmailLayout
      preview="This is a test notification from Budget App"
      unsubscribeUrl={unsubscribeUrl}
      baseUrl={baseUrl}
      footerText="This is a test email to verify your notification settings."
    >
      {/* Header */}
      <Text style={{ ...emailStyles.heading, textAlign: "center" as const }}>
        Test Notification
      </Text>

      {/* Success Icon */}
      <Text style={{ fontSize: "48px", textAlign: "center" as const, margin: "0 0 24px" }}>✅</Text>

      {/* Message */}
      <Section style={emailStyles.card}>
        <Text style={{ ...emailStyles.paragraph, textAlign: "center" as const, margin: 0 }}>
          Your email notifications are working correctly!
        </Text>
      </Section>

      {/* Info */}
      <Text style={{ ...emailStyles.paragraph, textAlign: "center" as const }}>
        You can now receive notifications for:
      </Text>

      <Section style={{ ...emailStyles.card, padding: "16px 24px" }}>
        <table width="100%" cellPadding="8" cellSpacing="0" role="presentation">
          <tr>
            <td style={{ width: "32px", textAlign: "center" as const }}>📅</td>
            <td>
              <Text style={{ ...emailStyles.paragraph, margin: 0 }}>
                <strong>Bill Reminders</strong> - Get notified before bills are due
              </Text>
            </td>
          </tr>
          <tr>
            <td style={{ width: "32px", textAlign: "center" as const }}>💰</td>
            <td>
              <Text style={{ ...emailStyles.paragraph, margin: 0 }}>
                <strong>Budget Alerts</strong> - Warnings when approaching budget limits
              </Text>
            </td>
          </tr>
          <tr>
            <td style={{ width: "32px", textAlign: "center" as const }}>🎯</td>
            <td>
              <Text style={{ ...emailStyles.paragraph, margin: 0 }}>
                <strong>Goal Milestones</strong> - Celebrate your savings progress
              </Text>
            </td>
          </tr>
        </table>
      </Section>

      <Text style={{ ...emailStyles.muted, textAlign: "center" as const }}>
        You can manage your notification preferences in Budget App Settings.
      </Text>
    </EmailLayout>
  );
}

export default TestEmail;
