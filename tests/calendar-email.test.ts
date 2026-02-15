/**
 * Calendar Export & Email System Tests
 */

import { describe, it, expect } from "vitest";
import {
  generateSubscriptionICS,
  generateMultipleSubscriptionsICS,
} from "@/lib/calendar/ics-generator";
import {
  buildGoogleCalendarURL,
  buildOutlookCalendarURL,
  buildSubscriptionGoogleCalendarURL,
} from "@/lib/calendar/google-calendar-url";
import type { Subscription } from "@/types/budget";
import type { CalendarEventOptions } from "@/types/notifications";

// Mock subscription for testing
const mockSubscription: Subscription = {
  id: "test-sub-1",
  name: "Netflix",
  amount: 15.99,
  currency: "USD",
  billingCycle: "monthly",
  category: "Entertainment",
  nextBillingDate: new Date("2024-02-15").toISOString(),
  status: "active",
  reminderEnabled: true,
  reminderDaysBefore: 3,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockSubscription2: Subscription = {
  id: "test-sub-2",
  name: "Spotify",
  amount: 9.99,
  currency: "USD",
  billingCycle: "monthly",
  category: "Entertainment",
  nextBillingDate: new Date("2024-02-20").toISOString(),
  status: "active",
  reminderEnabled: true,
  reminderDaysBefore: 3,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("ICS Generator", () => {
  it("generates valid ICS for single subscription", () => {
    const ics = generateSubscriptionICS(mockSubscription);

    // Check ICS structure
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("END:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("END:VEVENT");

    // Check event details
    expect(ics).toContain("SUMMARY:Bill Due: Netflix");
    expect(ics).toContain("Netflix - USD15.99 monthly");

    // Check recurrence rule for monthly
    expect(ics).toContain("RRULE:FREQ=MONTHLY");

    // Check alarm
    expect(ics).toContain("BEGIN:VALARM");
    expect(ics).toContain("END:VALARM");
  });

  it("generates valid ICS for multiple subscriptions", () => {
    const ics = generateMultipleSubscriptionsICS([mockSubscription, mockSubscription2]);

    // Should have two events
    const eventCount = (ics.match(/BEGIN:VEVENT/g) || []).length;
    expect(eventCount).toBe(2);

    // Check both subscriptions are included
    expect(ics).toContain("SUMMARY:Bill Due: Netflix");
    expect(ics).toContain("SUMMARY:Bill Due: Spotify");
  });

  it("handles different billing cycles", () => {
    const weeklySubscription: Subscription = {
      ...mockSubscription,
      billingCycle: "weekly",
    };
    const ics = generateSubscriptionICS(weeklySubscription);
    expect(ics).toContain("RRULE:FREQ=WEEKLY");

    const annualSubscription: Subscription = {
      ...mockSubscription,
      billingCycle: "annual",
    };
    const icsAnnual = generateSubscriptionICS(annualSubscription);
    expect(icsAnnual).toContain("RRULE:FREQ=YEARLY");

    const quarterlySubscription: Subscription = {
      ...mockSubscription,
      billingCycle: "quarterly",
    };
    const icsQuarterly = generateSubscriptionICS(quarterlySubscription);
    expect(icsQuarterly).toContain("RRULE:FREQ=MONTHLY;INTERVAL=3");
  });
});

describe("Google Calendar URL Builder", () => {
  it("builds valid Google Calendar URL", () => {
    const options: CalendarEventOptions = {
      title: "Test Event",
      description: "Test Description",
      startDate: new Date("2024-02-15T10:00:00Z"),
      allDay: false,
    };

    const url = buildGoogleCalendarURL(options);

    expect(url).toContain("calendar.google.com");
    expect(url).toContain("action=TEMPLATE");
    expect(url).toContain("text=Test+Event");
    expect(url).toContain("details=Test+Description");
  });

  it("builds URL for subscription", () => {
    const url = buildSubscriptionGoogleCalendarURL(mockSubscription);

    expect(url).toContain("calendar.google.com");
    expect(url).toContain("text=Bill+Due");
    expect(url).toContain("Netflix");
    expect(url).toContain("recur=RRULE");
  });

  it("handles all-day events correctly", () => {
    const options: CalendarEventOptions = {
      title: "All Day Event",
      startDate: new Date("2024-02-15"),
      allDay: true,
    };

    const url = buildGoogleCalendarURL(options);
    // All-day events use date format YYYYMMDD
    expect(url).toContain("20240215");
  });
});

describe("Outlook Calendar URL Builder", () => {
  it("builds valid Outlook Calendar URL", () => {
    const options: CalendarEventOptions = {
      title: "Test Event",
      description: "Test Description",
      startDate: new Date("2024-02-15T10:00:00Z"),
      allDay: false,
    };

    const url = buildOutlookCalendarURL(options);

    expect(url).toContain("outlook.live.com");
    expect(url).toContain("subject=Test+Event");
    expect(url).toContain("body=Test+Description");
  });

  it("handles all-day events", () => {
    const options: CalendarEventOptions = {
      title: "All Day Event",
      startDate: new Date("2024-02-15"),
      allDay: true,
    };

    const url = buildOutlookCalendarURL(options);
    expect(url).toContain("allday=true");
  });
});

describe("Email Types", () => {
  it("has correct default notification settings", async () => {
    const { DEFAULT_NOTIFICATION_SETTINGS } = await import("@/types/notifications");

    // Check email settings exist
    expect(DEFAULT_NOTIFICATION_SETTINGS.emailEnabled).toBe(false);
    expect(DEFAULT_NOTIFICATION_SETTINGS.emailAddress).toBe("");
    expect(DEFAULT_NOTIFICATION_SETTINGS.emailBillReminders).toBe(true);
    expect(DEFAULT_NOTIFICATION_SETTINGS.emailBudgetAlerts).toBe(true);
    expect(DEFAULT_NOTIFICATION_SETTINGS.emailGoalMilestones).toBe(true);
  });
});
