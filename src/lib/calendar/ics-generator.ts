/**
 * ICS Calendar File Generator
 * Creates valid ICS format files for calendar export
 * Supports recurring events (RRULE) and reminders (VALARM)
 */

import type {
  CalendarEventOptions,
  CalendarRecurrence,
} from '@/types/notifications';
import type { Subscription, BillingCycle } from '@/types/budget';

// ========================
// Constants
// ========================

const ICS_LINE_MAX = 75; // RFC 5545 max line length

// ========================
// Helpers
// ========================

/**
 * Format a Date to ICS datetime format (YYYYMMDDTHHMMSSZ)
 */
function formatICSDate(date: Date, allDay = false): string {
  if (allDay) {
    return date.toISOString().slice(0, 10).replace(/-/g, '');
  }
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Format a Date to ICS date format (YYYYMMDD)
 */
function formatICSDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

/**
 * Escape special characters in ICS text fields
 * Per RFC 5545: backslash, semicolon, comma, and newline need escaping
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Fold long lines per RFC 5545 (max 75 chars, continuation with space)
 */
function foldLine(line: string): string {
  if (line.length <= ICS_LINE_MAX) {
    return line;
  }

  const lines: string[] = [];
  let remaining = line;

  // First line can be full length
  lines.push(remaining.slice(0, ICS_LINE_MAX));
  remaining = remaining.slice(ICS_LINE_MAX);

  // Continuation lines start with a space
  while (remaining.length > 0) {
    lines.push(` ${  remaining.slice(0, ICS_LINE_MAX - 1)}`);
    remaining = remaining.slice(ICS_LINE_MAX - 1);
  }

  return lines.join('\r\n');
}

/**
 * Generate a unique UID for an event
 */
function generateUID(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}@budget-app`;
}

/**
 * Convert billing cycle to RRULE frequency
 */
function billingCycleToRRULE(cycle: BillingCycle): CalendarRecurrence {
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

// ========================
// RRULE Builder
// ========================

/**
 * Build an RRULE string from recurrence options
 */
function buildRRULE(recurrence: CalendarRecurrence): string {
  const parts: string[] = [`FREQ=${recurrence.frequency}`];

  if (recurrence.interval && recurrence.interval > 1) {
    parts.push(`INTERVAL=${recurrence.interval}`);
  }

  if (recurrence.count) {
    parts.push(`COUNT=${recurrence.count}`);
  }

  if (recurrence.until) {
    parts.push(`UNTIL=${formatICSDateOnly(recurrence.until)}`);
  }

  if (recurrence.byDay && recurrence.byDay.length > 0) {
    parts.push(`BYDAY=${recurrence.byDay.join(',')}`);
  }

  if (recurrence.byMonthDay) {
    parts.push(`BYMONTHDAY=${recurrence.byMonthDay}`);
  }

  return parts.join(';');
}

// ========================
// VALARM Builder
// ========================

/**
 * Build a VALARM component for reminders
 */
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

// ========================
// Event Builder
// ========================

/**
 * Build a VEVENT component
 */
function buildVEVENT(options: CalendarEventOptions): string {
  const uid = generateUID();
  const now = new Date();
  const endDate = options.endDate || new Date(options.startDate.getTime() + 60 * 60 * 1000);

  const lines: string[] = [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(now)}`,
  ];

  // Start and end dates
  if (options.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${formatICSDateOnly(options.startDate)}`);
    lines.push(`DTEND;VALUE=DATE:${formatICSDateOnly(endDate)}`);
  } else {
    lines.push(`DTSTART:${formatICSDate(options.startDate)}`);
    lines.push(`DTEND:${formatICSDate(endDate)}`);
  }

  // Summary (title)
  lines.push(foldLine(`SUMMARY:${escapeICSText(options.title)}`));

  // Description
  if (options.description) {
    lines.push(foldLine(`DESCRIPTION:${escapeICSText(options.description)}`));
  }

  // Location
  if (options.location) {
    lines.push(foldLine(`LOCATION:${escapeICSText(options.location)}`));
  }

  // Recurrence
  if (options.recurrence) {
    lines.push(`RRULE:${buildRRULE(options.recurrence)}`);
  }

  // Reminder
  if (options.reminderMinutes !== undefined && options.reminderMinutes >= 0) {
    lines.push(buildVALARM(options.reminderMinutes, options.title));
  }

  lines.push('END:VEVENT');

  return lines.join('\r\n');
}

// ========================
// Calendar Builder
// ========================

/**
 * Build a complete VCALENDAR with events
 */
function buildVCALENDAR(events: CalendarEventOptions[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Budget App//Bill Reminders//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Budget App - Bill Reminders',
  ];

  for (const event of events) {
    lines.push(buildVEVENT(event));
  }

  lines.push('END:VCALENDAR');

  // ICS requires CRLF line endings
  return lines.join('\r\n');
}

// ========================
// Public API
// ========================

/**
 * Generate ICS content for a single subscription
 */
export function generateSubscriptionICS(
  subscription: Subscription,
  reminderMinutes = 60 * 24 // Default: 1 day before
): string {
  const event: CalendarEventOptions = {
    title: `Bill Due: ${subscription.name}`,
    description: `${subscription.name} - ${subscription.currency || '$'}${subscription.amount.toFixed(2)} ${subscription.billingCycle}`,
    startDate: new Date(subscription.nextBillingDate),
    allDay: true,
    recurrence: billingCycleToRRULE(subscription.billingCycle),
    reminderMinutes,
  };

  return buildVCALENDAR([event]);
}

/**
 * Generate ICS content for multiple subscriptions
 */
export function generateMultipleSubscriptionsICS(
  subscriptions: Subscription[],
  reminderMinutes = 60 * 24
): string {
  const events: CalendarEventOptions[] = subscriptions.map((sub) => ({
    title: `Bill Due: ${sub.name}`,
    description: `${sub.name} - ${sub.currency || '$'}${sub.amount.toFixed(2)} ${sub.billingCycle}`,
    startDate: new Date(sub.nextBillingDate),
    allDay: true,
    recurrence: billingCycleToRRULE(sub.billingCycle),
    reminderMinutes,
  }));

  return buildVCALENDAR(events);
}

/**
 * Generate ICS content for a custom event
 */
export function generateCustomEventICS(options: CalendarEventOptions): string {
  return buildVCALENDAR([options]);
}

/**
 * Download an ICS file
 */
export function downloadICS(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Download ICS for a single subscription
 */
export function downloadSubscriptionICS(
  subscription: Subscription,
  reminderMinutes?: number
): void {
  const content = generateSubscriptionICS(subscription, reminderMinutes);
  const filename = `${subscription.name.replace(/[^a-z0-9]/gi, '_')}_reminder.ics`;
  downloadICS(content, filename);
}

/**
 * Download ICS for multiple subscriptions
 */
export function downloadMultipleSubscriptionsICS(
  subscriptions: Subscription[],
  reminderMinutes?: number
): void {
  const content = generateMultipleSubscriptionsICS(subscriptions, reminderMinutes);
  const filename = `budget_app_bill_reminders.ics`;
  downloadICS(content, filename);
}
