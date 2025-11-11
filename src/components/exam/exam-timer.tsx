"use client";

import { useState, useEffect } from "react";
import { useExam } from "@/contexts/ExamContext";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle } from "lucide-react";
import { ExamTooltip } from "@/components/ui/help-tooltip";
import { cn } from "@/lib/utils";

interface ExamTimerProps {
  totalTimeMinutes: number;
  onTimeUp?: () => void;
  onWarning?: (remainingMinutes: number) => void;
  className?: string;
}

export function ExamTimer({ totalTimeMinutes, onTimeUp, onWarning, className }: ExamTimerProps) {
  const { state, updateTimer, timeUp } = useExam();
  const [remainingSeconds, setRemainingSeconds] = useState(totalTimeMinutes * 60);
  const [isWarning, setIsWarning] = useState(false);
  const [isCritical, setIsCritical] = useState(false);
  const [warningsShown, setWarningsShown] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (remainingSeconds <= 0) {
      onTimeUp?.();
      timeUp();
      return;
    }

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        const newValue = prev - 1;

        // Ensure we don't go below 0
        if (newValue < 0) {
          return 0;
        }

        // Fixed time thresholds (in seconds)
        const THRESHOLD_30_MIN = 30 * 60;  // Green > 30min
        const THRESHOLD_10_MIN = 10 * 60;  // Yellow 10-30min
        // Red < 10min

        // Update color states based on fixed time thresholds
        if (newValue < THRESHOLD_10_MIN && !isCritical) {
          setIsCritical(true);
        } else if (newValue < THRESHOLD_30_MIN && newValue >= THRESHOLD_10_MIN && !isWarning) {
          setIsWarning(true);
        }

        // Trigger specific warning alerts at 30min, 10min, 5min
        const warningMinutes = Math.floor(newValue / 60);
        if ((warningMinutes === 30 || warningMinutes === 10 || warningMinutes === 5) &&
            newValue % 60 === 0 &&
            !warningsShown.has(warningMinutes)) {
          onWarning?.(warningMinutes);
          setWarningsShown(prev => new Set(prev).add(warningMinutes));
        }

        // Update context with remaining time - ensure updateTimer is available
        if (updateTimer && typeof updateTimer === "function") {
          updateTimer(newValue);
        }

        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    remainingSeconds,
    totalTimeMinutes,
    onTimeUp,
    onWarning,
    isWarning,
    isCritical,
    warningsShown,
    updateTimer,
    timeUp,
  ]);

  const formatTime = (seconds: number) => {
    // Handle edge cases for invalid seconds
    if (isNaN(seconds) || seconds < 0) {
      return "0:00";
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = () => {
    const totalSeconds = totalTimeMinutes * 60;
    if (totalSeconds === 0 || isNaN(remainingSeconds)) {
      return 0;
    }
    return Math.max(0, Math.min(100, ((totalSeconds - remainingSeconds) / totalSeconds) * 100));
  };

  const getTimerVariant = () => {
    if (isCritical) return "critical";
    if (isWarning) return "warning";
    return "success";
  };

  const getTimerColor = () => {
    if (isCritical) return "text-red-600 dark:text-red-400";
    if (isWarning) return "text-amber-600 dark:text-amber-400";
    return "text-green-600 dark:text-green-400";  // Green for >30min
  };

  const getProgressColor = () => {
    if (isCritical) return "bg-red-600";
    if (isWarning) return "bg-amber-600";
    return "bg-green-600";  // Green for >30min
  };

  const getBgColor = () => {
    if (isCritical) return "bg-red-50 dark:bg-red-900/20";
    if (isWarning) return "bg-amber-50 dark:bg-amber-900/20";
    return "bg-green-50 dark:bg-green-900/20";  // Green background for >30min
  };

  return (
    <Card className={cn("glass border-white/10", getBgColor(), className)}>
      <CardContent className="p-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className={cn("h-5 w-5", getTimerColor())} />
            <span className="text-sm font-semibold text-muted-foreground">Time Remaining</span>
            <ExamTooltip
              type="time"
              context={`${Math.floor(remainingSeconds / 60)} minutes remaining`}
            />
          </div>

          {(isWarning || isCritical) && (
            <Badge
              variant={isCritical ? "destructive" : "default"}
              className="flex items-center space-x-1 animate-pulse"
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="font-semibold">{isCritical ? "Critical" : "Warning"}</span>
            </Badge>
          )}
        </div>

        <div className="mb-4 text-center">
          <div className={cn("font-mono text-5xl font-extrabold tracking-tight", getTimerColor())}>
            {formatTime(remainingSeconds)}
          </div>
          <div className="mt-2 text-sm font-medium text-muted-foreground">
            {Math.floor(remainingSeconds / 60)} minutes remaining
          </div>
        </div>

        <Progress
          value={getProgressPercentage()}
          className="h-3"
          style={
            {
              "--progress-background": getProgressColor(),
            } as any
          }
        />

        <div className="mt-3 flex justify-between text-xs text-muted-foreground">
          <span>Started</span>
          <span>Ends at {new Date(Date.now() + remainingSeconds * 1000).toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
