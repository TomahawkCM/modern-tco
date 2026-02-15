/**
 * Google Calendar URL Builder
 * Creates direct add-event URLs for Google Calendar
 */

import type { CalendarEventOptions, CalendarRecurrence } from "@/types/notifications";
import type { Subscription, BillingCycle } from "@/types/budget";

// ========================
// Constants
// ========================

const GOOGLE_CALENDAR_BASE_URL = "https://calendar.google.com/calendar/render";

// ========================
// Helpers
// ========================

/**
 * Format a Date for Google Calendar URL (YYYYMMDD or YYYYMMDDTHHMMSSZ)
 */
function formatGoogleDate(date: Date, allDay = false): string {
  if (allDay) {
    return date.toISOString().slice(0, 10).replace(/-/g, "");
  }
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
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

/**
 * Build RRULE string from recurrence options
 */
function buildGoogleRRULE(recurrence: CalendarRecurrence): string {
  const parts: string[] = [`FREQ=${recurrence.frequency}`];

  if (recurrence.interval && recurrence.interval > 1) {
    parts.push(`INTERVAL=${recurrence.interval}`);
  }

  if (recurrence.count) {
    parts.push(`COUNT=${recurrence.count}`);
  }

  if (recurrence.until) {
    parts.push(`UNTIL=${formatGoogleDate(recurrence.until, true)}`);
  }

  if (recurrence.byDay && recurrence.byDay.length > 0) {
    parts.push(`BYDAY=${recurrence.byDay.join(",")}`);
  }

  if (recurrence.byMonthDay) {
    parts.push(`BYMONTHDAY=${recurrence.byMonthDay}`);
  }

  return `RRULE:${parts.join(";")}`;
}

// ========================
// URL Builders
// ========================

/**
 * Build a Google Calendar add event URL
 */
export function buildGoogleCalendarURL(options: CalendarEventOptions): string {
  const url = new URL(GOOGLE_CALENDAR_BASE_URL);
  const params = url.searchParams;

  // Required: action
  params.set("action", "TEMPLATE");

  // Title
  params.set("text", options.title);

  // Dates
  const { startDate } = options;
  const endDate = options.endDate || new Date(startDate.getTime() + 60 * 60 * 1000);

  if (options.allDay) {
    // For all-day events, use date format
    const start = formatGoogleDate(startDate, true);
    // Google expects end date to be the day after for all-day events
    const nextDay = new Date(endDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const end = formatGoogleDate(nextDay, true);
    params.set("dates", `${start}/${end}`);
  } else {
    const start = formatGoogleDate(startDate);
    const end = formatGoogleDate(endDate);
    params.set("dates", `${start}/${end}`);
  }

  // Description
  if (options.description) {
    params.set("details", options.description);
  }

  // Location
  if (options.location) {
    params.set("location", options.location);
  }

  // Recurrence
  if (options.recurrence) {
    params.set("recur", buildGoogleRRULE(options.recurrence));
  }

  // Calendar ID (optional)
  if (options.calendarId) {
    params.set("ctz", options.calendarId);
  }

  return url.toString();
}

/**
 * Build a Google Calendar URL for a subscription
 */
export function buildSubscriptionGoogleCalendarURL(
  subscription: Subscription,
  includeRecurrence = true
): string {
  const options: CalendarEventOptions = {
    title: `Bill Due: ${subscription.name}`,
    description: `${subscription.name} - ${subscription.currency || "$"}${subscription.amount.toFixed(2)} ${subscription.billingCycle}\n\nManage your subscriptions at: /budget-app/subscriptions`,
    startDate: new Date(subscription.nextBillingDate),
    allDay: true,
  };

  if (includeRecurrence) {
    options.recurrence = {
      frequency: billingCycleToFrequency(subscription.billingCycle),
      interval: billingCycleToInterval(subscription.billingCycle),
    };
  }

  return buildGoogleCalendarURL(options);
}

/**
 * Convert billing cycle to frequency
 */
function billingCycleToFrequency(cycle: BillingCycle): CalendarRecurrence["frequency"] {
  switch (cycle) {
    case "weekly":
    case "bi-weekly":
      return "WEEKLY";
    case "monthly":
    case "quarterly":
      return "MONTHLY";
    case "annual":
      return "YEARLY";
    default:
      return "MONTHLY";
  }
}

/**
 * Convert billing cycle to interval
 */
function billingCycleToInterval(cycle: BillingCycle): number | undefined {
  switch (cycle) {
    case "bi-weekly":
      return 2;
    case "quarterly":
      return 3;
    default:
      return undefined;
  }
}

/**
 * Open Google Calendar in a new tab with the event
 */
export function openGoogleCalendar(options: CalendarEventOptions): void {
  const url = buildGoogleCalendarURL(options);
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Open Google Calendar for a subscription
 */
export function openSubscriptionGoogleCalendar(
  subscription: Subscription,
  includeRecurrence = true
): void {
  const url = buildSubscriptionGoogleCalendarURL(subscription, includeRecurrence);
  window.open(url, "_blank", "noopener,noreferrer");
}

// ========================
// Outlook/Office 365 Support
// ========================

const OUTLOOK_CALENDAR_BASE_URL = "https://outlook.live.com/calendar/0/deeplink/compose";

/**
 * Build an Outlook Calendar URL
 */
export function buildOutlookCalendarURL(options: CalendarEventOptions): string {
  const url = new URL(OUTLOOK_CALENDAR_BASE_URL);
  const params = url.searchParams;

  params.set("path", "/calendar/action/compose");
  params.set("rru", "addevent");

  // Title
  params.set("subject", options.title);

  // Dates
  const { startDate } = options;
  const endDate = options.endDate || new Date(startDate.getTime() + 60 * 60 * 1000);

  params.set("startdt", startDate.toISOString());
  params.set("enddt", endDate.toISOString());

  if (options.allDay) {
    params.set("allday", "true");
  }

  // Description
  if (options.description) {
    params.set("body", options.description);
  }

  // Location
  if (options.location) {
    params.set("location", options.location);
  }

  return url.toString();
}

/**
 * Open Outlook Calendar in a new tab
 */
export function openOutlookCalendar(options: CalendarEventOptions): void {
  const url = buildOutlookCalendarURL(options);
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Open Outlook Calendar for a subscription
 */
export function openSubscriptionOutlookCalendar(subscription: Subscription): void {
  const options: CalendarEventOptions = {
    title: `Bill Due: ${subscription.name}`,
    description: `${subscription.name} - ${subscription.currency || "$"}${subscription.amount.toFixed(2)} ${subscription.billingCycle}`,
    startDate: new Date(subscription.nextBillingDate),
    allDay: true,
  };

  openOutlookCalendar(options);
}
