"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, Clock, Trophy, BookOpen, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  // Mock notifications - TODO: Replace with real data from Supabase
  const notifications = [
    {
      id: 1,
      type: "achievement",
      title: "New Achievement Unlocked!",
      message: "You've earned the 'Week Warrior' badge for maintaining a 7-day study streak.",
      timestamp: "2 hours ago",
      read: false,
      icon: Trophy,
      color: "text-yellow-400",
    },
    {
      id: 2,
      type: "reminder",
      title: "Daily Study Reminder",
      message: "Don't break your streak! Complete today's practice session.",
      timestamp: "5 hours ago",
      read: false,
      icon: Clock,
      color: "text-primary",
    },
    {
      id: 3,
      type: "progress",
      title: "Module Completed",
      message: "You've completed 'Refining Questions & Targeting'. Great job!",
      timestamp: "1 day ago",
      read: true,
      icon: BookOpen,
      color: "text-green-400",
    },
    {
      id: 4,
      type: "milestone",
      title: "Milestone Reached",
      message: "You've answered 100+ practice questions!",
      timestamp: "2 days ago",
      read: true,
      icon: Target,
      color: "text-purple-400",
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    console.log("Mark all as read - TODO: Implement");
  };

  const handleMarkRead = (id: number) => {
    console.log(`Mark notification ${id} as read - TODO: Implement`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
            <Bell className="h-8 w-8" />
            Notifications
          </h1>
          <p className="mt-2 text-muted-foreground">
            Stay updated on your learning progress and achievements
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="border-white/20 text-foreground hover:bg-white/10"
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications Count */}
      {unreadCount > 0 && (
        <Card className="glass border-primary/30 bg-primary/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span className="font-medium text-foreground">
                You have {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notification) => {
          const IconComponent = notification.icon;
          return (
            <Card
              key={notification.id}
              className={cn(
                "glass border-white/10 transition-all hover:border-white/20",
                !notification.read && "border-primary/30 bg-white/5"
              )}
            >
              <CardContent className="flex items-start gap-4 p-4">
                {/* Icon */}
                <div
                  className={cn(
                    "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
                    notification.read ? "bg-white/5" : "bg-primary/10"
                  )}
                >
                  <IconComponent className={cn("h-5 w-5", notification.color)} aria-hidden="true" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className={cn(
                        "font-medium",
                        notification.read ? "text-muted-foreground" : "text-foreground"
                      )}
                    >
                      {notification.title}
                    </h3>
                    {!notification.read && (
                      <Badge
                        variant="default"
                        className="border-primary/30 bg-primary/20 text-primary"
                      >
                        New
                      </Badge>
                    )}
                  </div>
                  <p
                    className={cn(
                      "mt-1 text-sm",
                      notification.read ? "text-muted-foreground/70" : "text-muted-foreground"
                    )}
                  >
                    {notification.message}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-xs text-muted-foreground/60">
                      {notification.timestamp}
                    </span>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkRead(notification.id)}
                        className="h-auto px-2 py-1 text-xs text-primary hover:text-primary/80"
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State (if no notifications) */}
      {notifications.length === 0 && (
        <Card className="glass border-white/10">
          <CardContent className="py-12 text-center">
            <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium text-foreground">No notifications yet</h3>
            <p className="text-muted-foreground">
              We'll notify you about important updates, achievements, and milestones
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
