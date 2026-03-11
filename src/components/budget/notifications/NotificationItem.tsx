"use client";

/**
 * NotificationItem Component
 * Individual notification row in the notification center
 */

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, Target, AlertCircle, X, ExternalLink, Clock } from "lucide-react";
import { SnoozeMenu } from "./SnoozeMenu";
import type { InAppNotification, SnoozeDuration } from "@/types/notifications";
import { useTranslations, useLocale } from "next-intl";
import { formatRelativeTime } from "@/i18n/utils/formatDate";
import type { SupportedLocale } from "@/i18n/config";
import Link from "next/link";

interface NotificationItemProps {
  notification: InAppNotification;
  onMarkAsRead: (id: string) => void;
  onSnooze: (id: string, duration: SnoozeDuration) => void;
  onDismiss: (id: string) => void;
}

const typeIcons = {
  bill_reminder: Calendar,
  budget_alert: AlertCircle,
  goal_milestone: Target,
  system: Bell,
};

const priorityColors = {
  low: "border-s-slate-400",
  medium: "border-s-blue-500",
  high: "border-s-orange-500",
  urgent: "border-s-red-500",
};

export function NotificationItem({
  notification,
  onMarkAsRead,
  onSnooze,
  onDismiss,
}: NotificationItemProps) {
  const t = useTranslations("notifications");
  const tAria = useTranslations("aria");
  const locale = useLocale();
  const Icon = typeIcons[notification.type] || Bell;
  const isUnread = notification.status === "unread";
  const isSnoozed = notification.status === "snoozed";

  const handleClick = () => {
    if (isUnread) {
      onMarkAsRead(notification.id);
    }
  };

  const handleSnooze = (duration: SnoozeDuration) => {
    onSnooze(notification.id, duration);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDismiss(notification.id);
  };

  const content = (
    <div
      className={cn(
        "group relative flex items-start gap-3 rounded-lg border-s-4 p-4 transition-colors",
        priorityColors[notification.priority],
        isUnread ? "bg-white/10 hover:bg-white/15" : "bg-white/5 hover:bg-white/10",
        isSnoozed && "opacity-60"
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
      aria-label={tAria("notificationDescription", {
        title: notification.title,
        body: notification.body,
      })}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          isUnread
            ? "bg-gradient-to-br from-teal-500/20 to-blue-500/20 text-teal-400"
            : "bg-slate-700/50 text-slate-400"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "truncate text-sm font-medium",
                isUnread ? "text-white" : "text-slate-300"
              )}
            >
              {notification.title}
              {isUnread && <span className="ms-2 inline-block h-2 w-2 rounded-full bg-teal-400" />}
            </p>
            <p className="mt-0.5 line-clamp-2 text-sm text-slate-400">{notification.body}</p>
          </div>

          {/* Dismiss button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={handleDismiss}
            aria-label={t("dismiss")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Amount (for bill reminders) */}
        {notification.amount !== undefined && (
          <p className="mt-1 text-sm font-medium text-teal-400">
            {notification.currency || "$"}
            {notification.amount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        )}

        {/* Footer */}
        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
          <span>
            {formatRelativeTime(new Date(notification.createdAt), locale as SupportedLocale)}
          </span>

          {isSnoozed && notification.snoozedUntil && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {t("snoozedUntil", {
                time: formatRelativeTime(
                  new Date(notification.snoozedUntil),
                  locale as SupportedLocale
                ),
              })}
            </span>
          )}

          {/* Actions */}
          <div className="ms-auto flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {!isSnoozed && <SnoozeMenu onSnooze={handleSnooze} iconOnly />}
            {notification.actionUrl && (
              <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                <Link href={notification.actionUrl}>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Wrap in Link if there's an action URL
  if (notification.actionUrl) {
    return (
      <Link href={notification.actionUrl} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
