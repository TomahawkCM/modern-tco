"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Brain, Target, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface DueCardsBadgeProps {
  totalDue: number;
  flashcardsDue?: number;
  questionsDue?: number;
  highPriorityCount?: number;
  className?: string;
  variant?: "compact" | "detailed";
}

export default function DueCardsBadge({
  totalDue,
  flashcardsDue = 0,
  questionsDue = 0,
  highPriorityCount = 0,
  className,
  variant = "compact",
}: DueCardsBadgeProps) {
  if (totalDue === 0) {
    return null; // Hide badge when nothing is due
  }

  const hasHighPriority = highPriorityCount > 5;
  const isUrgent = totalDue >= 30 || hasHighPriority;

  // Compact variant - for top navigation
  if (variant === "compact") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/review">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "relative gap-2 h-9",
                  className
                )}
                aria-label={`${totalDue} items due for review`}
              >
                <Clock className={cn(
                  "h-4 w-4",
                  isUrgent && "text-orange-500 animate-pulse"
                )} />

                <Badge
                  variant={isUrgent ? "destructive" : "secondary"}
                  className={cn(
                    "h-5 min-w-[20px] px-1.5 text-xs font-semibold",
                    !isUrgent && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
                  )}
                >
                  {totalDue > 99 ? "99+" : totalDue}
                </Badge>

                {hasHighPriority && (
                  <AlertCircle className="absolute -top-1 -right-1 h-3 w-3 text-red-500 fill-red-500" />
                )}
              </Button>
            </Link>
          </TooltipTrigger>

          <TooltipContent side="bottom" className="p-3">
            <div className="space-y-2">
              <p className="font-semibold text-sm">
                {totalDue} item{totalDue > 1 ? "s" : ""} due for review
              </p>

              {(flashcardsDue > 0 || questionsDue > 0) && (
                <div className="space-y-1 text-xs text-muted-foreground">
                  {flashcardsDue > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Brain className="h-3 w-3" />
                      <span>{flashcardsDue} flashcard{flashcardsDue > 1 ? "s" : ""}</span>
                    </div>
                  )}
                  {questionsDue > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Target className="h-3 w-3" />
                      <span>{questionsDue} question{questionsDue > 1 ? "s" : ""}</span>
                    </div>
                  )}
                </div>
              )}

              {hasHighPriority && (
                <div className="flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400 pt-1 border-t">
                  <AlertCircle className="h-3 w-3" />
                  <span className="font-semibold">{highPriorityCount} urgent items</span>
                </div>
              )}

              <p className="text-xs text-muted-foreground pt-1">
                Click to start reviewing
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Detailed variant - for sidebar or dashboard
  return (
    <Link href="/review">
      <div
        className={cn(
          "flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-muted/50",
          isUrgent
            ? "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900"
            : "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            isUrgent
              ? "bg-orange-100 dark:bg-orange-900/30"
              : "bg-blue-100 dark:bg-blue-900/30"
          )}>
            <Clock className={cn(
              "h-5 w-5",
              isUrgent
                ? "text-orange-600 dark:text-orange-400"
                : "text-blue-600 dark:text-primary"
            )} />
          </div>

          <div>
            <p className="text-sm font-semibold">
              {totalDue} Due for Review
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {flashcardsDue > 0 && (
                <span className="flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  {flashcardsDue}
                </span>
              )}
              {questionsDue > 0 && (
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {questionsDue}
                </span>
              )}
            </div>
          </div>
        </div>

        {hasHighPriority && (
          <Badge variant="destructive" className="gap-1 text-xs">
            <AlertCircle className="h-3 w-3" />
            {highPriorityCount}
          </Badge>
        )}
      </div>
    </Link>
  );
}
