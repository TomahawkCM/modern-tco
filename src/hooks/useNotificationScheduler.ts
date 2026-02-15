'use client';

import { useEffect, useRef } from 'react';
import { useNotificationsOptional } from '@/contexts/NotificationContext';
import { checkNotificationSources } from '@/lib/notifications/notification-scheduler';

const CHECK_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Hook that periodically checks notification sources and fires notifications.
 * Should be used inside NotificationProvider.
 */
export function useNotificationScheduler() {
  const notifications = useNotificationsOptional();
  const lastCheckRef = useRef<number>(0);

  useEffect(() => {
    if (!notifications) return;

    async function runCheck() {
      try {
        const pending = await checkNotificationSources();
        for (const notif of pending) {
          await notifications!.addNotification(notif);
        }
        lastCheckRef.current = Date.now();
      } catch (error) {
        console.error('[NotificationScheduler] Check failed:', error);
      }
    }

    // Run initial check after a short delay (let app settle)
    const initialTimer = setTimeout(() => {
      void runCheck();
    }, 5000);

    // Run periodically
    const interval = setInterval(() => {
      void runCheck();
    }, CHECK_INTERVAL_MS);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [notifications]);
}
