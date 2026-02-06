/**
 * Notification System Tests
 * Tests for the notification types, settings, and calendar export
 */

import {
  type NotificationSettings,
  type InAppNotification,
  DEFAULT_NOTIFICATION_SETTINGS,
  SNOOZE_DURATIONS,
} from '@/types/notifications';
import { generateSubscriptionICS } from '@/lib/calendar/ics-generator';
import { buildGoogleCalendarURL } from '@/lib/calendar/google-calendar-url';

describe('Notification Types', () => {
  describe('DEFAULT_NOTIFICATION_SETTINGS', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_NOTIFICATION_SETTINGS.masterEnabled).toBe(true);
      expect(DEFAULT_NOTIFICATION_SETTINGS.pushPermissionState).toBe('default');
      expect(DEFAULT_NOTIFICATION_SETTINGS.billReminders).toBe(true);
      expect(DEFAULT_NOTIFICATION_SETTINGS.budgetAlerts).toBe(true);
      expect(DEFAULT_NOTIFICATION_SETTINGS.goalMilestones).toBe(true);
      expect(DEFAULT_NOTIFICATION_SETTINGS.quietHoursEnabled).toBe(false);
      expect(DEFAULT_NOTIFICATION_SETTINGS.quietHoursStart).toBe('22:00');
      expect(DEFAULT_NOTIFICATION_SETTINGS.quietHoursEnd).toBe('08:00');
      expect(DEFAULT_NOTIFICATION_SETTINGS.defaultReminderDays).toBe(3);
    });
  });

  describe('SNOOZE_DURATIONS', () => {
    it('should have correct duration values', () => {
      expect(SNOOZE_DURATIONS['1_hour'].ms).toBe(60 * 60 * 1000);
      expect(SNOOZE_DURATIONS['3_hours'].ms).toBe(3 * 60 * 60 * 1000);
      expect(SNOOZE_DURATIONS['1_day'].ms).toBe(24 * 60 * 60 * 1000);
      expect(SNOOZE_DURATIONS['3_days'].ms).toBe(3 * 24 * 60 * 60 * 1000);
      expect(SNOOZE_DURATIONS['1_week'].ms).toBe(7 * 24 * 60 * 60 * 1000);
    });

    it('should have labels for all durations', () => {
      expect(SNOOZE_DURATIONS['1_hour'].label).toBe('1 hour');
      expect(SNOOZE_DURATIONS['3_hours'].label).toBe('3 hours');
      expect(SNOOZE_DURATIONS['1_day'].label).toBe('1 day');
      expect(SNOOZE_DURATIONS['3_days'].label).toBe('3 days');
      expect(SNOOZE_DURATIONS['1_week'].label).toBe('1 week');
    });
  });

  describe('InAppNotification type', () => {
    it('should allow creating valid notification objects', () => {
      const notification: InAppNotification = {
        id: 'notif_123',
        type: 'bill_reminder',
        title: 'Netflix Due',
        body: 'Your Netflix subscription is due tomorrow',
        status: 'unread',
        priority: 'medium',
        sourceType: 'subscription',
        sourceId: 'sub_456',
        actionUrl: '/budget-app/subscriptions',
        createdAt: new Date(),
      };

      expect(notification.id).toBe('notif_123');
      expect(notification.type).toBe('bill_reminder');
      expect(notification.status).toBe('unread');
    });

    it('should support all notification types', () => {
      const types: InAppNotification['type'][] = [
        'bill_reminder',
        'budget_alert',
        'goal_milestone',
        'system',
      ];

      types.forEach((type) => {
        const notification: InAppNotification = {
          id: `notif_${type}`,
          type,
          title: 'Test',
          body: 'Test body',
          status: 'unread',
          priority: 'medium',
          createdAt: new Date(),
        };
        expect(notification.type).toBe(type);
      });
    });

    it('should support all status values', () => {
      const statuses: InAppNotification['status'][] = [
        'unread',
        'read',
        'snoozed',
        'dismissed',
      ];

      statuses.forEach((status) => {
        const notification: InAppNotification = {
          id: `notif_${status}`,
          type: 'system',
          title: 'Test',
          body: 'Test body',
          status,
          priority: 'medium',
          createdAt: new Date(),
        };
        expect(notification.status).toBe(status);
      });
    });

    it('should support optional amount and currency for bill reminders', () => {
      const notification: InAppNotification = {
        id: 'notif_bill',
        type: 'bill_reminder',
        title: 'Netflix Due',
        body: 'Due tomorrow',
        status: 'unread',
        priority: 'high',
        amount: 15.99,
        currency: '$',
        createdAt: new Date(),
      };

      expect(notification.amount).toBe(15.99);
      expect(notification.currency).toBe('$');
    });
  });
});

describe('Calendar Export', () => {
  // These tests verify the calendar export functionality
  // Note: Full integration tests would require mocking the subscription data

  describe('ICS Generator', () => {
    it('should generate valid ICS content structure', () => {
      const mockSubscription = {
        id: 'sub_123',
        name: 'Netflix',
        amount: 15.99,
        currency: '$',
        billingCycle: 'monthly' as const,
        nextBillingDate: new Date('2025-02-15'),
        status: 'active' as const,
      };

      const ics = generateSubscriptionICS(mockSubscription);

      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('END:VCALENDAR');
      expect(ics).toContain('BEGIN:VEVENT');
      expect(ics).toContain('END:VEVENT');
      expect(ics).toContain('Bill Due: Netflix');
      expect(ics).toContain('RRULE:FREQ=MONTHLY');
    });

    it('should include VALARM for reminders', () => {
      const mockSubscription = {
        id: 'sub_123',
        name: 'Test',
        amount: 10,
        billingCycle: 'monthly' as const,
        nextBillingDate: new Date('2025-02-15'),
        status: 'active' as const,
      };

      const ics = generateSubscriptionICS(mockSubscription, 60); // 1 hour reminder

      expect(ics).toContain('BEGIN:VALARM');
      expect(ics).toContain('END:VALARM');
      expect(ics).toContain('TRIGGER:-PT60M');
    });
  });

  describe('Google Calendar URL Builder', () => {
    it('should generate valid Google Calendar URL', () => {
      const options = {
        title: 'Test Event',
        startDate: new Date('2025-02-15T10:00:00Z'),
        allDay: true,
      };

      const url = buildGoogleCalendarURL(options);

      expect(url).toContain('calendar.google.com');
      expect(url).toContain('action=TEMPLATE');
      // URL encoding uses + for spaces in query strings
      expect(url).toMatch(/text=Test[\+%20]Event/);
    });
  });
});
