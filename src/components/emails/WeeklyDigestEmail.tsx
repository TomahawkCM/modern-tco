/**
 * Weekly Digest Email Template
 *
 * A weekly summary of the user's financial activity:
 * income vs expenses, top spending categories, at-risk budgets, and upcoming bills.
 */

import { Link, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout, emailStyles } from "./components/EmailLayout";
import type { WeeklyDigestEmailProps } from "@/types/email";
import { getUnsubscribeUrl } from "@/lib/email/resend-client";

function getProgressBarColor(percentUsed: number): string {
  if (percentUsed >= 100) return "#f87171"; // red
  if (percentUsed >= 80) return "#fbbf24"; // yellow
  return "#2dd4bf"; // teal
}

export function WeeklyDigestEmail({
  currency,
  weekLabel,
  categorySpending,
  totalIncome,
  totalExpenses,
  netSavings,
  weekOverWeekChange,
  atRiskCategories,
  upcomingBills,
  dashboardUrl,
  unsubscribeToken,
  baseUrl,
}: WeeklyDigestEmailProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(value);

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  const unsubscribeUrl = getUnsubscribeUrl(baseUrl, unsubscribeToken, "weekly_digest");

  const previewText =
    weekOverWeekChange !== null
      ? `Week of ${weekLabel}: ${formatCurrency(totalExpenses)} spent (${formatChange(weekOverWeekChange)} vs last week)`
      : `Week of ${weekLabel}: ${formatCurrency(totalExpenses)} spent`;

  return (
    <EmailLayout
      preview={previewText}
      unsubscribeUrl={unsubscribeUrl}
      baseUrl={baseUrl}
      footerText="You received this email because you enabled weekly digest in Budget App."
    >
      {/* Header */}
      <Text style={emailStyles.heading}>Your Week in Review</Text>
      <Text style={emailStyles.muted}>{weekLabel}</Text>

      {/* Income vs Expenses Card */}
      <Section style={emailStyles.card}>
        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
          <tr>
            <td style={{ width: "33%", textAlign: "center" as const, padding: "0 4px" }}>
              <Text style={emailStyles.amountLabel}>Income</Text>
              <Text style={{ ...amountStyle, color: "#4ade80" }}>
                {formatCurrency(totalIncome)}
              </Text>
            </td>
            <td style={{ width: "33%", textAlign: "center" as const, padding: "0 4px" }}>
              <Text style={emailStyles.amountLabel}>Expenses</Text>
              <Text style={{ ...amountStyle, color: "#f87171" }}>
                {formatCurrency(totalExpenses)}
              </Text>
            </td>
            <td style={{ width: "33%", textAlign: "center" as const, padding: "0 4px" }}>
              <Text style={emailStyles.amountLabel}>Net</Text>
              <Text style={{ ...amountStyle, color: netSavings >= 0 ? "#2dd4bf" : "#f87171" }}>
                {formatCurrency(netSavings)}
              </Text>
            </td>
          </tr>
        </table>

        {/* Week-over-week insight */}
        {weekOverWeekChange !== null && (
          <>
            <div style={emailStyles.divider} />
            <Text style={{ ...emailStyles.paragraph, textAlign: "center" as const, margin: 0 }}>
              {weekOverWeekChange > 0 ? (
                <>
                  You spent{" "}
                  <strong style={emailStyles.warning}>
                    {Math.abs(weekOverWeekChange).toFixed(1)}% more
                  </strong>{" "}
                  than last week.
                </>
              ) : weekOverWeekChange < 0 ? (
                <>
                  You spent{" "}
                  <strong style={emailStyles.success}>
                    {Math.abs(weekOverWeekChange).toFixed(1)}% less
                  </strong>{" "}
                  than last week.
                </>
              ) : (
                <>Spending was the same as last week.</>
              )}
            </Text>
          </>
        )}
      </Section>

      {/* Spending by Category */}
      {categorySpending.length > 0 && (
        <Section style={{ marginTop: "24px" }}>
          <Text style={emailStyles.subheading}>Spending by Category</Text>
          {categorySpending.slice(0, 6).map((cat) => (
            <div key={cat.categoryName} style={{ marginBottom: "16px" }}>
              <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
                <tr>
                  <td>
                    <Text
                      style={{ ...emailStyles.paragraph, margin: "0 0 4px", fontWeight: "500" }}
                    >
                      {cat.categoryName}
                    </Text>
                  </td>
                  <td style={{ textAlign: "right" as const }}>
                    <Text style={{ ...emailStyles.muted, margin: 0 }}>
                      {formatCurrency(cat.spent)} / {formatCurrency(cat.budgeted)}
                    </Text>
                  </td>
                </tr>
              </table>
              <div style={emailStyles.progressBar}>
                <div
                  style={emailStyles.progressFill(
                    cat.percentUsed,
                    getProgressBarColor(cat.percentUsed)
                  )}
                />
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* At-Risk Budgets (conditional) */}
      {atRiskCategories.length > 0 && (
        <Section style={warningCard}>
          <Text style={{ ...emailStyles.subheading, color: "#fbbf24", margin: "0 0 12px" }}>
            At-Risk Budgets
          </Text>
          {atRiskCategories.map((cat) => (
            <div key={cat.categoryName} style={{ marginBottom: "8px" }}>
              <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
                <tr>
                  <td>
                    <Text style={{ ...emailStyles.paragraph, margin: 0 }}>
                      {cat.status === "exceeded" ? "\u26A0\uFE0F " : "\u23F3 "}
                      {cat.categoryName}
                    </Text>
                  </td>
                  <td style={{ textAlign: "right" as const }}>
                    <Text
                      style={{
                        ...emailStyles.paragraph,
                        margin: 0,
                        color: cat.status === "exceeded" ? "#f87171" : "#fbbf24",
                        fontWeight: "600",
                      }}
                    >
                      {cat.percentUsed}%
                    </Text>
                  </td>
                </tr>
              </table>
            </div>
          ))}
        </Section>
      )}

      {/* Upcoming Bills (conditional) */}
      {upcomingBills.length > 0 && (
        <Section style={{ marginTop: "24px" }}>
          <Text style={emailStyles.subheading}>Upcoming Bills</Text>
          <Section style={emailStyles.card}>
            <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
              <tr>
                <td style={tableHeader}>Name</td>
                <td style={{ ...tableHeader, textAlign: "right" as const }}>Amount</td>
                <td style={{ ...tableHeader, textAlign: "right" as const }}>Due</td>
              </tr>
              {upcomingBills.map((bill) => (
                <tr key={bill.name}>
                  <td style={tableCell}>
                    <Text style={{ ...emailStyles.paragraph, margin: 0 }}>{bill.name}</Text>
                  </td>
                  <td style={{ ...tableCell, textAlign: "right" as const }}>
                    <Text style={{ ...emailStyles.paragraph, margin: 0 }}>
                      {formatCurrency(bill.amount)}
                    </Text>
                  </td>
                  <td style={{ ...tableCell, textAlign: "right" as const }}>
                    <Text
                      style={{
                        ...emailStyles.paragraph,
                        margin: 0,
                        color:
                          bill.daysUntilDue <= 1
                            ? "#f87171"
                            : bill.daysUntilDue <= 3
                              ? "#fbbf24"
                              : "#cbd5e1",
                      }}
                    >
                      {bill.daysUntilDue === 0
                        ? "Today"
                        : bill.daysUntilDue === 1
                          ? "Tomorrow"
                          : `${bill.daysUntilDue} days`}
                    </Text>
                  </td>
                </tr>
              ))}
            </table>
          </Section>
        </Section>
      )}

      {/* CTA Button */}
      <Section style={{ textAlign: "center" as const, marginTop: "32px" }}>
        <Link href={dashboardUrl} style={emailStyles.button}>
          View Dashboard
        </Link>
      </Section>
    </EmailLayout>
  );
}

// Local styles
const amountStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: "700",
  lineHeight: "28px",
  margin: "0",
};

const warningCard: React.CSSProperties = {
  backgroundColor: "#422006",
  borderRadius: "12px",
  border: "1px solid #854d0e",
  padding: "24px",
  marginTop: "24px",
};

const tableHeader: React.CSSProperties = {
  color: "#64748b",
  fontSize: "11px",
  fontWeight: "500",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  padding: "0 0 8px",
  borderBottom: "1px solid #334155",
};

const tableCell: React.CSSProperties = {
  padding: "8px 0",
  borderBottom: "1px solid #1e293b",
};

export default WeeklyDigestEmail;
