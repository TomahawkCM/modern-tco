/**
 * ICS Calendar File Generation API
 *
 * GET /api/calendar/ics
 * Generates ICS files on-demand from query parameters for email links
 *
 * Query params:
 * - name: Bill/subscription name (required)
 * - amount: Payment amount (required)
 * - currency: Currency code (default: USD)
 * - date: Due date as ISO string (required)
 * - cycle: Billing cycle for recurrence (optional)
 */

import { type NextRequest, NextResponse } from 'next/server';
import type { BillingCycle } from '@/types/budget';

// ========================
// ICS Generation Helpers
// ========================

const ICS_LINE_MAX = 75;

function formatICSDate(date: Date, allDay = false): string {
  if (allDay) {
    return date.toISOString().slice(0, 10).replace(/-/g, '');
  }
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function formatICSDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function foldLine(line: string): string {
  if (line.length <= ICS_LINE_MAX) {
    return line;
  }

  const lines: string[] = [];
  let remaining = line;

  lines.push(remaining.slice(0, ICS_LINE_MAX));
  remaining = remaining.slice(ICS_LINE_MAX);

  while (remaining.length > 0) {
    lines.push(` ${  remaining.slice(0, ICS_LINE_MAX - 1)}`);
    remaining = remaining.slice(ICS_LINE_MAX - 1);
  }

  return lines.join('\r\n');
}

function generateUID(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}@budget-app`;
}

interface RRULEOptions {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval?: number;
}

function billingCycleToRRULE(cycle: BillingCycle): RRULEOptions {
  switch (cycle) {
    case 'weekly':
      return { frequency: 'WEEKLY' };
    case 'bi-weekly':
      return { frequency: 'WEEKLY', interval: 2 };
    case 'monthly':
      return { frequency: 'MONTHLY' };
    case 'quarterly':
      return { frequency: 'MONTHLY', interval: 3 };
    case 'annual':
      return { frequency: 'YEARLY' };
    default:
      return { frequency: 'MONTHLY' };
  }
}

function buildRRULE(options: RRULEOptions): string {
  const parts: string[] = [`FREQ=${options.frequency}`];

  if (options.interval && options.interval > 1) {
    parts.push(`INTERVAL=${options.interval}`);
  }

  return parts.join(';');
}

function buildVALARM(minutesBefore: number, title: string): string {
  const trigger = minutesBefore > 0 ? `-PT${minutesBefore}M` : 'PT0M';

  return [
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    foldLine(`DESCRIPTION:${escapeICSText(title)}`),
    `TRIGGER:${trigger}`,
    'END:VALARM',
  ].join('\r\n');
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(amount);
}

// ========================
// API Handler
// ========================

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);

  // Extract and validate parameters
  const name = searchParams.get('name');
  const amountStr = searchParams.get('amount');
  const currency = searchParams.get('currency') || 'USD';
  const dateStr = searchParams.get('date');
  const cycle = searchParams.get('cycle') as BillingCycle | null;

  // Validate required params
  if (!name || !amountStr || !dateStr) {
    return NextResponse.json(
      { error: 'Missing required parameters: name, amount, date' },
      { status: 400 }
    );
  }

  const amount = parseFloat(amountStr);
  if (isNaN(amount)) {
    return NextResponse.json(
      { error: 'Invalid amount parameter' },
      { status: 400 }
    );
  }

  const dueDate = new Date(dateStr);
  if (isNaN(dueDate.getTime())) {
    return NextResponse.json(
      { error: 'Invalid date parameter' },
      { status: 400 }
    );
  }

  // Build the ICS content
  const uid = generateUID();
  const now = new Date();
  const formattedAmount = formatCurrency(amount, currency);
  const title = `Bill Due: ${name}`;
  const description = `${name} - ${formattedAmount}${cycle ? ` (${cycle})` : ''}\\n\\nManage your subscriptions at Budget App`;

  // Add one day for all-day event end date
  const endDate = new Date(dueDate);
  endDate.setDate(endDate.getDate() + 1);

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Budget App//Bill Reminders//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Budget App - Bill Reminder',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART;VALUE=DATE:${formatICSDateOnly(dueDate)}`,
    `DTEND;VALUE=DATE:${formatICSDateOnly(endDate)}`,
    foldLine(`SUMMARY:${escapeICSText(title)}`),
    foldLine(`DESCRIPTION:${escapeICSText(description)}`),
  ];

  // Add recurrence if billing cycle provided
  if (cycle) {
    const rrule = billingCycleToRRULE(cycle);
    lines.push(`RRULE:${buildRRULE(rrule)}`);
  }

  // Add reminder (1 day before)
  lines.push(buildVALARM(60 * 24, title));

  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  const icsContent = lines.join('\r\n');

  // Generate filename
  const safeFilename = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const filename = `${safeFilename}_reminder.ics`;

  // Return as downloadable ICS file
  return new NextResponse(icsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
