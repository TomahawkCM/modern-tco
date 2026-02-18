/**
 * Email Calendar URL Builders
 *
 * Server-side functions to generate calendar URLs for email templates.
 * These links allow users to add bill reminders to their calendars directly from emails.
 */

import type { BillingCycle } from "@/types/budget";

// ========================
// Types
// ========================

export interface BillCalendarEvent {
  /** Bill/subscription name */
  name: string;
  /** Payment amount */
  amount: number;
  /** Currency code (e.g., USD) */
  currency: string;
  /** Due date */
  dueDate: Date;
  /** Billing cycle for recurrence */
  billingCycle?: BillingCycle;
}

// ========================
// Helpers
// ========================

/**
 * Format a Date for Google Calendar URL (YYYYMMDD for all-day events)
 */
function formatGoogleDate(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

/**
 * Format currency amount
 */
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(amount);
}

/**
 * Convert billing cycle to RRULE for Google Calendar
 */
function billingCycleToGoogleRRULE(cycle: BillingCycle): string {
  switch (cycle) {
    case "weekly":
      return "RRULE:FREQ=WEEKLY";
    case "bi-weekly":
      return "RRULE:FREQ=WEEKLY;INTERVAL=2";
    case "monthly":
      return "RRULE:FREQ=MONTHLY";
    case "quarterly":
      return "RRULE:FREQ=MONTHLY;INTERVAL=3";
    case "annual":
      return "RRULE:FREQ=YEARLY";
    default:
      return "RRULE:FREQ=MONTHLY";
  }
}

// ========================
// URL Builders
// ========================

/**
 * Build a Google Calendar URL for a bill reminder
 */
export function buildEmailGoogleCalendarUrl(bill: BillCalendarEvent, baseUrl: string): string {
  const url = new URL("https://calendar.google.com/calendar/render");
  const params = url.searchParams;

  const formattedAmount = formatCurrency(bill.amount, bill.currency);
  const title = `Bill Due: ${bill.name}`;
  const description = `${bill.name} - ${formattedAmount}${bill.billingCycle ? ` (${bill.billingCycle})` : ""}\n\nManage your subscriptions at: ${baseUrl}/budget-app/subscriptions`;

  params.set("action", "TEMPLATE");
  params.set("text", title);

  // For all-day events, Google expects end date to be the next day
  const startDate = formatGoogleDate(new Date(bill.dueDate));
  const endDate = new Date(bill.dueDate);
  endDate.setDate(endDate.getDate() + 1);
  params.set("dates", `${startDate}/${formatGoogleDate(endDate)}`);

  params.set("details", description);

  // Add recurrence if billing cycle is provided
  if (bill.billingCycle) {
    params.set("recur", billingCycleToGoogleRRULE(bill.billingCycle));
  }

  return url.toString();
}

/**
 * Build an Outlook Calendar URL for a bill reminder
 */
export function buildEmailOutlookCalendarUrl(bill: BillCalendarEvent, baseUrl: string): string {
  const url = new URL("https://outlook.live.com/calendar/0/deeplink/compose");
  const params = url.searchParams;

  const formattedAmount = formatCurrency(bill.amount, bill.currency);
  const title = `Bill Due: ${bill.name}`;
  const description = `${bill.name} - ${formattedAmount}${bill.billingCycle ? ` (${bill.billingCycle})` : ""}\n\nManage your subscriptions at: ${baseUrl}/budget-app/subscriptions`;

  params.set("path", "/calendar/action/compose");
  params.set("rru", "addevent");
  params.set("subject", title);
  params.set("body", description);

  // Outlook uses ISO format for dates
  const dueDate = new Date(bill.dueDate);
  params.set("startdt", dueDate.toISOString());

  // End date is next day for all-day event
  const endDate = new Date(dueDate);
  endDate.setDate(endDate.getDate() + 1);
  params.set("enddt", endDate.toISOString());

  params.set("allday", "true");

  return url.toString();
}

/**
 * Build an ICS download URL for a bill reminder
 * Points to the /api/calendar/ics endpoint
 */
export function buildEmailIcsUrl(bill: BillCalendarEvent, baseUrl: string): string {
  const url = new URL(`${baseUrl}/api/calendar/ics`);
  const params = url.searchParams;

  params.set("name", bill.name);
  params.set("amount", bill.amount.toString());
  params.set("currency", bill.currency);
  params.set("date", new Date(bill.dueDate).toISOString());

  if (bill.billingCycle) {
    params.set("cycle", bill.billingCycle);
  }

  return url.toString();
}

/**
 * Generate all calendar URLs for a bill reminder
 */
export function generateCalendarUrls(
  bill: BillCalendarEvent,
  baseUrl: string
): {
  google: string;
  outlook: string;
  ics: string;
} {
  return {
    google: buildEmailGoogleCalendarUrl(bill, baseUrl),
    outlook: buildEmailOutlookCalendarUrl(bill, baseUrl),
    ics: buildEmailIcsUrl(bill, baseUrl),
  };
}
