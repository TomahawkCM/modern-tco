"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, AlertCircle, Circle, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExamSummaryPanelProps {
  // Timer
  timeRemaining: number; // seconds
  totalTime: number; // seconds

  // Statistics
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  markedCount: number;

  // Actions
  onSubmitExam: () => void;
  onShowUnanswered?: () => void;
  onShowMarked?: () => void;

  // State
  className?: string;
}

export function ExamSummaryPanel({
  timeRemaining,
  totalTime,
  totalQuestions,
  answeredCount,
  unansweredCount,
  markedCount,
  onSubmitExam,
  onShowUnanswered,
  onShowMarked,
  className,
}: ExamSummaryPanelProps) {
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Color-coded warnings based on time remaining
  const getTimerColor = () => {
    const percentRemaining = (timeRemaining / totalTime) * 100;

    if (percentRemaining <= 10) {
      return "text-red-500 dark:text-red-400";
    } else if (percentRemaining <= 25) {
      return "text-orange-500 dark:text-orange-400";
    } else {
      return "text-foreground";
    }
  };

  const getTimerBgColor = () => {
    const percentRemaining = (timeRemaining / totalTime) * 100;

    if (percentRemaining <= 10) {
      return "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900";
    } else if (percentRemaining <= 25) {
      return "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900";
    } else {
      return "bg-card border-border";
    }
  };

  return (
    <div className={cn("hidden xl:block", className)}>
      <div className="sticky top-4 w-[200px] space-y-4">
        {/* Timer Card */}
        <Card className={cn("p-4 transition-colors", getTimerBgColor())}>
          <div className="mb-2 flex items-center justify-center gap-2">
            <Clock className={cn("h-4 w-4", getTimerColor())} />
            <span className="text-xs font-medium text-muted-foreground">Time Remaining</span>
          </div>
          <div className={cn("text-center text-2xl font-bold tabular-nums", getTimerColor())}>
            {formatTime(timeRemaining)}
          </div>
        </Card>

        {/* Statistics Card */}
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold">Progress</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-muted-foreground">Answered</span>
              </div>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              >
                {answeredCount}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-gray-400" />
                <span className="text-muted-foreground">Unanswered</span>
              </div>
              <Badge
                variant="secondary"
                className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
              >
                {unansweredCount}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-muted-foreground">Marked</span>
              </div>
              <Badge
                variant="secondary"
                className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
              >
                {markedCount}
              </Badge>
            </div>
          </div>

          <Separator className="my-3" />

          <div className="text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">{totalQuestions}</span>
            </div>
          </div>
        </Card>

        {/* Quick Filters Card (if enabled) */}
        {(onShowUnanswered || onShowMarked) && (
          <Card className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Quick Filters</h3>
            </div>

            <div className="space-y-2">
              {onShowUnanswered && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={onShowUnanswered}
                >
                  <Circle className="mr-2 h-3 w-3 text-gray-400" />
                  Show Unanswered
                </Button>
              )}

              {onShowMarked && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={onShowMarked}
                >
                  <AlertCircle className="mr-2 h-3 w-3 text-amber-500" />
                  Show Marked
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Submit Button - Always Visible */}
        <Button
          onClick={onSubmitExam}
          className="w-full bg-green-600 font-semibold text-white hover:bg-green-700"
          size="lg"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Submit Exam
        </Button>
      </div>
    </div>
  );
}
