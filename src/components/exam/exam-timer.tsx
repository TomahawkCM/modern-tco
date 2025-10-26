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

        // Warning thresholds
        const warningThreshold = totalTimeMinutes * 60 * 0.25; // 25% remaining
        const criticalThreshold = totalTimeMinutes * 60 * 0.1; // 10% remaining

        if (newValue <= criticalThreshold && !isCritical) {
          setIsCritical(true);
          onWarning?.(Math.floor(newValue / 60));
        } else if (newValue <= warningThreshold && !isWarning) {
          setIsWarning(true);
          onWarning?.(Math.floor(newValue / 60));
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
    return "default";
  };

  const getTimerColor = () => {
    if (isCritical) return "text-red-600 dark:text-red-400";
    if (isWarning) return "text-amber-600 dark:text-amber-400";
    return "text-foreground";
  };

  const getProgressColor = () => {
    if (isCritical) return "bg-red-600";
    if (isWarning) return "bg-amber-600";
    return "bg-primary";
  };

  return (
    <Card className={cn("glass border-white/10", className)}>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className={cn("h-4 w-4", getTimerColor())} />
            <span className="text-sm font-medium text-muted-foreground">Time Remaining</span>
            <ExamTooltip
              type="time"
              context={`${Math.floor(remainingSeconds / 60)} minutes remaining`}
            />
          </div>

          {(isWarning || isCritical) && (
            <Badge
              variant={isCritical ? "destructive" : "default"}
              className="flex items-center space-x-1"
            >
              <AlertTriangle className="h-3 w-3" />
              <span>{isCritical ? "Critical" : "Warning"}</span>
            </Badge>
          )}
        </div>

        <div className="mb-3 text-center">
          <div className={cn("font-mono text-2xl font-bold", getTimerColor())}>
            {formatTime(remainingSeconds)}
          </div>
          <div className="text-xs text-muted-foreground">
            {Math.floor(remainingSeconds / 60)} minutes left
          </div>
        </div>

        <Progress
          value={getProgressPercentage()}
          className="h-2"
          style={
            {
              "--progress-background": getProgressColor(),
            } as any
          }
        />

        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>Started</span>
          <span>Ends at {new Date(Date.now() + remainingSeconds * 1000).toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
