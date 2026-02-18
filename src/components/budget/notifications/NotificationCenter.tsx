"use client";

/**
 * NotificationCenter Component
 * Bell icon with dropdown panel showing notifications
 */

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check, Trash2, BellOff, Inbox } from "lucide-react";
import { NotificationBadge } from "./NotificationBadge";
import { NotificationItem } from "./NotificationItem";
import { useNotificationsOptional } from "@/contexts/NotificationContext";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import type { InAppNotification, SnoozeDuration } from "@/types/notifications";

type FilterTab = "all" | "unread" | "snoozed";

interface NotificationCenterProps {
  className?: string;
  /** Compact mode (icon only, no text) */
  compact?: boolean;
}

export function NotificationCenter({ className, compact = false }: NotificationCenterProps) {
  const t = useTranslations("notifications");
  const context = useNotificationsOptional();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        panelRef.current &&
        buttonRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Don't render if context is not available
  if (!context) {
    // Debug: show that component mounted but context missing
    console.warn(
      "[NotificationCenter] Context not available - NotificationProvider may be missing"
    );
    return null;
  }

  const { notifications, unreadCount, markAsRead, markAllAsRead, snooze, dismiss, clearAll } =
    context;

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return n.status === "unread";
    if (activeTab === "snoozed") return n.status === "snoozed";
    // 'all' tab shows everything except dismissed
    return n.status !== "dismissed";
  });

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleSnooze = (id: string, duration: SnoozeDuration) => {
    snooze(id, duration);
  };

  const handleDismiss = (id: string) => {
    dismiss(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    clearAll();
  };

  return (
    <div className={cn("relative", className)}>
      {/* Bell Button */}
      <Button
        ref={buttonRef}
        variant="ghost"
        size={compact ? "icon" : "sm"}
        className={cn("relative", compact ? "h-9 w-9" : "gap-2")}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t("title")}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className={cn("h-5 w-5", isOpen && "text-teal-400")} />
        {!compact && <span>{t("title")}</span>}
        <NotificationBadge count={unreadCount} />
      </Button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute end-0 top-full z-50 mt-2",
              "max-h-[500px] w-[380px] overflow-hidden",
              "rounded-xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl",
              "flex flex-col"
            )}
            role="dialog"
            aria-label={t("title")}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h2 className="text-sm font-semibold text-white">{t("title")}</h2>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleMarkAllAsRead}
                  >
                    <Check className="me-1 h-3 w-3" />
                    {t("markAllRead")}
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-slate-400 hover:text-red-400"
                    onClick={handleClearAll}
                  >
                    <Trash2 className="me-1 h-3 w-3" />
                    {t("clearAll")}
                  </Button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-white/10 px-4 py-2">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
                <TabsList className="grid w-full grid-cols-3 bg-white/5">
                  <TabsTrigger value="all" className="text-xs">
                    {t("tabs.all")}
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="text-xs">
                    {t("tabs.unread")}
                    {unreadCount > 0 && (
                      <span className="ms-1 text-[10px] text-teal-400">({unreadCount})</span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="snoozed" className="text-xs">
                    {t("tabs.snoozed")}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Notifications List */}
            <div className="custom-scrollbar flex-1 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">
                    {activeTab === "unread" ? (
                      <Check className="h-6 w-6 text-slate-500" />
                    ) : activeTab === "snoozed" ? (
                      <BellOff className="h-6 w-6 text-slate-500" />
                    ) : (
                      <Inbox className="h-6 w-6 text-slate-500" />
                    )}
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-400">{t("empty")}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {activeTab === "unread"
                      ? t("emptyUnread")
                      : activeTab === "snoozed"
                        ? t("emptySnoozed")
                        : t("emptyAll")}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5 p-2">
                  {filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onSnooze={handleSnooze}
                      onDismiss={handleDismiss}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
