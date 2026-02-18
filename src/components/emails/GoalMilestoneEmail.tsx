/**
 * Goal Milestone Email Template
 *
 * Sent when a savings goal reaches a milestone (25%, 50%, 75%, 100%)
 */

import { Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, emailStyles } from "./components/EmailLayout";
import type { GoalMilestoneEmailProps } from "@/types/email";
import { getUnsubscribeUrl } from "@/lib/email/resend-client";

export function GoalMilestoneEmail({
  goalName,
  targetAmount,
  currentAmount,
  currency,
  milestone,
  goalUrl,
  unsubscribeToken,
  baseUrl,
}: GoalMilestoneEmailProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(value);

  const remaining = targetAmount - currentAmount;
  const isComplete = milestone === 100;

  const getPreviewText = () => {
    if (isComplete) {
      return `Congratulations! You've reached your ${goalName} goal of ${formatCurrency(targetAmount)}!`;
    }
    return `Milestone reached: ${milestone}% of your ${goalName} goal!`;
  };

  const getHeadingText = () => {
    if (isComplete) {
      return "Goal Achieved!";
    }
    return `${milestone}% Milestone Reached!`;
  };

  const getEmoji = () => {
    switch (milestone) {
      case 25:
        return "🌱";
      case 50:
        return "🚀";
      case 75:
        return "🔥";
      case 100:
        return "🎉";
      default:
        return "⭐";
    }
  };

  const getMessage = () => {
    switch (milestone) {
      case 25:
        return "You're off to a great start! Keep the momentum going.";
      case 50:
        return "Halfway there! You're making excellent progress.";
      case 75:
        return "Almost there! The finish line is in sight.";
      case 100:
        return "Incredible work! You did it!";
      default:
        return "Great progress on your savings goal!";
    }
  };

  const unsubscribeUrl = getUnsubscribeUrl(baseUrl, unsubscribeToken, "goal_milestone");

  return (
    <EmailLayout
      preview={getPreviewText()}
      unsubscribeUrl={unsubscribeUrl}
      baseUrl={baseUrl}
      footerText="You received this email because you enabled goal milestone notifications in Budget App."
    >
      {/* Celebration Emoji */}
      <Text style={{ fontSize: "48px", textAlign: "center" as const, margin: "0 0 16px" }}>
        {getEmoji()}
      </Text>

      {/* Header */}
      <Text
        style={{
          ...emailStyles.heading,
          color: isComplete ? emailStyles.success.color : "#2dd4bf",
          textAlign: "center" as const,
        }}
      >
        {getHeadingText()}
      </Text>

      {/* Goal Name */}
      <Text style={{ ...emailStyles.paragraph, textAlign: "center" as const }}>
        <strong>{goalName}</strong>
      </Text>

      {/* Progress Card */}
      <Section style={emailStyles.card}>
        {/* Progress Bar */}
        <div style={emailStyles.progressBar}>
          <div style={emailStyles.progressFill(milestone, isComplete ? "#4ade80" : "#2dd4bf")} />
        </div>

        {/* Current Amount */}
        <div style={{ marginTop: "24px", textAlign: "center" as const }}>
          <Text style={emailStyles.amountLabel}>You&apos;ve Saved</Text>
          <Text
            style={{
              ...emailStyles.amount,
              color: isComplete ? "#4ade80" : "#2dd4bf",
            }}
          >
            {formatCurrency(currentAmount)}
          </Text>
        </div>

        {/* Stats */}
        <div style={emailStyles.divider} />
        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
          <tr>
            <td style={{ width: "50%" }}>
              <Text style={emailStyles.amountLabel}>Goal</Text>
              <Text style={{ ...emailStyles.paragraph, fontWeight: "600", margin: 0 }}>
                {formatCurrency(targetAmount)}
              </Text>
            </td>
            <td style={{ width: "50%", textAlign: "right" as const }}>
              <Text style={emailStyles.amountLabel}>{isComplete ? "Completed" : "Remaining"}</Text>
              <Text
                style={{
                  ...emailStyles.paragraph,
                  fontWeight: "600",
                  margin: 0,
                  color: isComplete ? "#4ade80" : undefined,
                }}
              >
                {isComplete ? "100%" : formatCurrency(remaining)}
              </Text>
            </td>
          </tr>
        </table>
      </Section>

      {/* Motivational Message */}
      <Text style={{ ...emailStyles.paragraph, textAlign: "center" as const }}>{getMessage()}</Text>

      {/* CTA Button */}
      {goalUrl && (
        <Section style={{ textAlign: "center" as const, marginTop: "24px" }}>
          <Link href={goalUrl} style={emailStyles.button}>
            View Goal
          </Link>
        </Section>
      )}

      {/* View All Link */}
      <Section style={{ textAlign: "center" as const, marginTop: "16px" }}>
        <Link href={`${baseUrl}/budget-app/goals`} style={emailStyles.secondaryButton}>
          View All Goals
        </Link>
      </Section>
    </EmailLayout>
  );
}

export default GoalMilestoneEmail;
