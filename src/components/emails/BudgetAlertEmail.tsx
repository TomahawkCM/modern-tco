/**
 * Budget Alert Email Template
 *
 * Sent when a budget category reaches warning threshold (80%) or is exceeded (100%)
 */

import { Link, Section, Text } from '@react-email/components';
import * as React from 'react';
import { EmailLayout, emailStyles } from './components/EmailLayout';
import type { BudgetAlertEmailProps } from '@/types/email';
import { getUnsubscribeUrl } from '@/lib/email/resend-client';

export function BudgetAlertEmail({
  categoryName,
  budgetLimit,
  currentSpent,
  percentUsed,
  currency,
  alertType,
  budgetUrl,
  unsubscribeToken,
  baseUrl,
}: BudgetAlertEmailProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(value);

  const remaining = budgetLimit - currentSpent;
  const isOverBudget = remaining < 0;

  const getPreviewText = () => {
    if (alertType === 'exceeded') {
      return `Budget exceeded! ${categoryName} is over by ${formatCurrency(Math.abs(remaining))}`;
    }
    return `Budget warning: ${categoryName} is at ${percentUsed}% (${formatCurrency(remaining)} remaining)`;
  };

  const getHeadingText = () => {
    if (alertType === 'exceeded') {
      return 'Budget Exceeded';
    }
    return 'Budget Warning';
  };

  const getHeadingColor = () => {
    return alertType === 'exceeded' ? emailStyles.danger.color : emailStyles.warning.color;
  };

  const getProgressBarColor = () => {
    if (percentUsed >= 100) return '#f87171'; // red
    if (percentUsed >= 80) return '#fbbf24'; // yellow
    return '#2dd4bf'; // teal
  };

  const unsubscribeUrl = getUnsubscribeUrl(baseUrl, unsubscribeToken, 'budget_alert');

  return (
    <EmailLayout
      preview={getPreviewText()}
      unsubscribeUrl={unsubscribeUrl}
      baseUrl={baseUrl}
      footerText="You received this email because you enabled budget alerts in Budget App."
    >
      {/* Header */}
      <Text style={{ ...emailStyles.heading, color: getHeadingColor() }}>
        {getHeadingText()}
      </Text>

      {/* Alert Message */}
      <Text style={emailStyles.paragraph}>
        {alertType === 'exceeded' ? (
          <>
            Your <strong>{categoryName}</strong> budget has been exceeded. You&apos;ve spent{' '}
            <strong style={emailStyles.danger}>{formatCurrency(Math.abs(remaining))}</strong>{' '}
            more than planned.
          </>
        ) : (
          <>
            Your <strong>{categoryName}</strong> budget is at{' '}
            <strong style={emailStyles.warning}>{percentUsed}%</strong>. You have{' '}
            <strong>{formatCurrency(remaining)}</strong> remaining this month.
          </>
        )}
      </Text>

      {/* Budget Card */}
      <Section style={emailStyles.card}>
        {/* Category Name */}
        <Text style={emailStyles.subheading}>{categoryName}</Text>

        {/* Progress Bar */}
        <div style={emailStyles.progressBar}>
          <div style={emailStyles.progressFill(percentUsed, getProgressBarColor())} />
        </div>

        {/* Stats */}
        <div style={{ marginTop: '16px' }}>
          <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
            <tr>
              <td style={{ width: '50%' }}>
                <Text style={emailStyles.amountLabel}>Spent</Text>
                <Text style={{ ...emailStyles.paragraph, fontWeight: '600', margin: 0 }}>
                  {formatCurrency(currentSpent)}
                </Text>
              </td>
              <td style={{ width: '50%', textAlign: 'right' as const }}>
                <Text style={emailStyles.amountLabel}>Budget</Text>
                <Text style={{ ...emailStyles.paragraph, fontWeight: '600', margin: 0 }}>
                  {formatCurrency(budgetLimit)}
                </Text>
              </td>
            </tr>
          </table>
        </div>

        {/* Remaining/Over */}
        <div style={emailStyles.divider} />
        <Text style={{ ...emailStyles.amountLabel, textAlign: 'center' as const }}>
          {isOverBudget ? 'Over Budget' : 'Remaining'}
        </Text>
        <Text
          style={{
            ...emailStyles.amount,
            textAlign: 'center' as const,
            color: isOverBudget ? '#f87171' : '#4ade80',
          }}
        >
          {isOverBudget ? '-' : ''}
          {formatCurrency(Math.abs(remaining))}
        </Text>
      </Section>

      {/* Tips */}
      <Text style={emailStyles.paragraph}>
        {alertType === 'exceeded' ? (
          <>
            Consider reviewing your recent transactions in this category to identify areas where
            you can cut back next month.
          </>
        ) : (
          <>
            You&apos;re approaching your budget limit. Try to limit spending in this category for
            the rest of the month.
          </>
        )}
      </Text>

      {/* CTA Button */}
      {budgetUrl && (
        <Section style={{ textAlign: 'center' as const, marginTop: '24px' }}>
          <Link href={budgetUrl} style={emailStyles.button}>
            View Budget Details
          </Link>
        </Section>
      )}

      {/* View All Link */}
      <Section style={{ textAlign: 'center' as const, marginTop: '16px' }}>
        <Link href={`${baseUrl}/budget-app/budgets`} style={emailStyles.secondaryButton}>
          View All Budgets
        </Link>
      </Section>
    </EmailLayout>
  );
}

export default BudgetAlertEmail;
