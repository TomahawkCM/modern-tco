"use client";

/**
 * NotificationBadge Component
 * Displays an unread notification count badge
 */

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number;
  className?: string;
  /** Maximum count to display (shows "99+" if exceeded) */
  maxCount?: number;
}

export function NotificationBadge({ count, className, maxCount = 99 }: NotificationBadgeProps) {
  const tAria = useTranslations("aria");

  if (count <= 0) {
    return null;
  }

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <span
      className={cn(
        "absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white",
        "duration-200 animate-in zoom-in-50",
        className
      )}
      aria-label={tAria("unreadNotifications", { count })}
    >
      {displayCount}
    </span>
  );
}
