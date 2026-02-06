/**
 * Email Send API Route
 *
 * POST /api/email/send
 * Sends emails using Resend with React Email templates
 */

import { type NextRequest, NextResponse } from 'next/server';
import {
  sendEmailWithHeaders,
  getEmailSubject,
  isEmailEnabled,
} from '@/lib/email/resend-client';
import {
  BillReminderEmail,
  BudgetAlertEmail,
  GoalMilestoneEmail,
  TestEmail,
} from '@/components/emails';
import type {
  SendEmailRequest,
  SendEmailResponse,
  BillReminderEmailProps,
  BudgetAlertEmailProps,
  GoalMilestoneEmailProps,
  TestEmailProps,
} from '@/types/email';

export async function POST(request: NextRequest): Promise<NextResponse<SendEmailResponse>> {
  // Check if email is enabled
  if (!isEmailEnabled()) {
    return NextResponse.json(
      {
        success: false,
        error: 'Email notifications are not configured',
      },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as SendEmailRequest;
    const { type, props } = body;

    // Validate required fields
    if (!type || !props) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: type and props',
        },
        { status: 400 }
      );
    }

    // Get email properties
    const {to} = (props as { to: string });
    const {unsubscribeToken} = (props as { unsubscribeToken: string });
    const {baseUrl} = (props as { baseUrl: string });

    if (!to || !unsubscribeToken || !baseUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: to, unsubscribeToken, or baseUrl',
        },
        { status: 400 }
      );
    }

    // Generate subject
    const subject = getEmailSubject(type, props);

    // Render the appropriate email template
    let emailComponent: React.ReactElement;

    switch (type) {
      case 'bill_reminder':
        emailComponent = BillReminderEmail(props as BillReminderEmailProps);
        break;
      case 'budget_alert':
        emailComponent = BudgetAlertEmail(props as BudgetAlertEmailProps);
        break;
      case 'goal_milestone':
        emailComponent = GoalMilestoneEmail(props as GoalMilestoneEmailProps);
        break;
      case 'test':
        emailComponent = TestEmail(props as TestEmailProps);
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            error: `Unknown email type: ${type}`,
          },
          { status: 400 }
        );
    }

    // Send email
    const result = await sendEmailWithHeaders(
      to,
      subject,
      emailComponent,
      unsubscribeToken,
      baseUrl,
      type
    );

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Email send error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

// Health check
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    enabled: isEmailEnabled(),
    status: isEmailEnabled() ? 'ready' : 'not_configured',
  });
}
