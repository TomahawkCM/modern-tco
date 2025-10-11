"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { X, Brain, Target, Clock, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ReviewNotificationProps {
  totalDue: number;
  flashcardsDue: number;
  questionsDue: number;
  currentStreak: number;
  highPriorityCount?: number;
  onDismiss?: () => void;
  className?: string;
}

export default function ReviewNotification({
  totalDue,
  flashcardsDue,
  questionsDue,
  currentStreak,
  highPriorityCount = 0,
  onDismiss,
  className,
}: ReviewNotificationProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Auto-dismiss check: only show if items are due
  useEffect(() => {
    if (totalDue === 0) {
      setIsDismissed(true);
    }
  }, [totalDue]);

  // Restore notification when new items become due
  useEffect(() => {
    if (totalDue > 0 && isDismissed) {
      setIsDismissed(false);
    }
  }, [totalDue]);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed || totalDue === 0) {
    return null;
  }

  // Determine urgency level
  const getUrgencyLevel = (): "low" | "medium" | "high" => {
    if (highPriorityCount >= 10) return "high";
    if (totalDue >= 20) return "medium";
    return "low";
  };

  const urgency = getUrgencyLevel();

  // Urgency-based styling
  const urgencyStyles = {
    low: {
      bgClass: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900",
      textClass: "text-blue-900 dark:text-blue-100",
      iconClass: "text-blue-600 dark:text-primary",
      buttonVariant: "default" as const,
    },
    medium: {
      bgClass: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900",
      textClass: "text-orange-900 dark:text-orange-100",
      iconClass: "text-orange-600 dark:text-orange-400",
      buttonVariant: "default" as const,
    },
    high: {
      bgClass: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900",
      textClass: "text-red-900 dark:text-red-100",
      iconClass: "text-red-600 dark:text-red-400",
      buttonVariant: "destructive" as const,
    },
  };

  const style = urgencyStyles[urgency];

  // Motivational messages
  const getMessage = (): string => {
    if (currentStreak > 0 && totalDue > 0) {
      return `🔥 Keep your ${currentStreak}-day streak alive! ${totalDue} items ready to review.`;
    }
    if (highPriorityCount > 5) {
      return `⚡ ${highPriorityCount} high-priority items need attention to maintain your progress.`;
    }
    if (totalDue >= 30) {
      return `📚 You have ${totalDue} items due. Break them down with a quick 10-minute session.`;
    }
    if (totalDue >= 10) {
      return `✨ ${totalDue} items are ready for review. Spaced repetition works best when you stay consistent!`;
    }
    return `🎯 ${totalDue} item${totalDue > 1 ? "s" : ""} ready for review. Perfect time for a quick session!`;
  };

  return (
    <Alert
      className={cn(
        "relative",
        style.bgClass,
        style.textClass,
        className
      )}
    >
      {/* Dismiss Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="pr-8">
        <AlertDescription className="space-y-3">
          {/* Message */}
          <p className="font-medium">{getMessage()}</p>

          {/* Stats Grid */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {flashcardsDue > 0 && (
              <div className="flex items-center gap-1.5">
                <Brain className={cn("h-4 w-4", style.iconClass)} />
                <span>
                  <span className="font-semibold">{flashcardsDue}</span> flashcard{flashcardsDue > 1 ? "s" : ""}
                </span>
              </div>
            )}

            {questionsDue > 0 && (
              <div className="flex items-center gap-1.5">
                <Target className={cn("h-4 w-4", style.iconClass)} />
                <span>
                  <span className="font-semibold">{questionsDue}</span> question{questionsDue > 1 ? "s" : ""}
                </span>
              </div>
            )}

            {currentStreak > 0 && (
              <div className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-orange-500" />
                <span>
                  <span className="font-semibold">{currentStreak}</span> day streak
                </span>
              </div>
            )}

            {highPriorityCount > 0 && (
              <Badge
                variant="secondary"
                className={cn(
                  "gap-1",
                  urgency === "high" && "bg-red-600 text-foreground dark:bg-red-700"
                )}
              >
                <Clock className="h-3 w-3" />
                {highPriorityCount} urgent
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            <Link href="/review">
              <Button
                variant={style.buttonVariant}
                size="sm"
                className="gap-2"
              >
                <Clock className="h-4 w-4" />
                Start Review
              </Button>
            </Link>

            <Link href="/review">
              <Button
                variant="outline"
                size="sm"
                className={style.textClass}
              >
                View Dashboard
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </div>
    </Alert>
  );
}
