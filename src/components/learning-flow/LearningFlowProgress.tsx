"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, Circle, AlertCircle } from "lucide-react";
import { LearningFlowState, type LearningFlowContext } from "@/types/learning-flow";
import { cn } from "@/lib/utils";

interface LearningFlowProgressProps {
  flowContext: LearningFlowContext;
  className?: string;
  showTimeSpent?: boolean;
  showAttempts?: boolean;
}

const STATE_CONFIG = {
  [LearningFlowState.LEARN]: {
    label: "Learn",
    color: "bg-primary",
    icon: Circle,
    description: "Study the material",
  },
  [LearningFlowState.PRACTICE]: {
    label: "Practice",
    color: "bg-amber-500",
    icon: AlertCircle,
    description: "Practice with questions",
  },
  [LearningFlowState.ASSESS]: {
    label: "Assess",
    color: "bg-cyan-500",
    icon: CheckCircle,
    description: "Take the assessment",
  },
  [LearningFlowState.COMPLETED]: {
    label: "Completed",
    color: "bg-[#22c55e]",
    icon: CheckCircle,
    description: "Module completed",
  },
};

export function LearningFlowProgress({
  flowContext,
  className,
  showTimeSpent = true,
  showAttempts = true,
}: LearningFlowProgressProps) {
  const states = Object.values(LearningFlowState);
  const currentStateIndex = states.indexOf(flowContext.currentState);
  const progressPercentage = ((currentStateIndex + 1) / states.length) * 100;

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Learning Progress</CardTitle>
          <Badge
            variant={
              flowContext.currentState === LearningFlowState.COMPLETED ? "default" : "secondary"
            }
            className={cn("text-foreground", STATE_CONFIG[flowContext.currentState].color)}
          >
            {STATE_CONFIG[flowContext.currentState].label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Overall Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Flow Steps */}
        <div className="space-y-2">
          {states.map((state, index) => {
            const config = STATE_CONFIG[state];
            const Icon = config.icon;
            const isActive = state === flowContext.currentState;
            const isCompleted = index < currentStateIndex;
            const isPending = index > currentStateIndex;

            return (
              <div
                key={state}
                className={cn(
                  "flex items-center gap-3 rounded-lg p-2 transition-colors",
                  isActive && "bg-muted/50",
                  isCompleted && "opacity-75"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-foreground",
                    isCompleted ? "bg-[#22c55e]" : isActive ? config.color : "bg-muted",
                    isPending && "border-2 border-dashed border-muted-foreground/30 bg-muted"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Icon
                      className={cn("h-4 w-4", isPending ? "text-muted-foreground" : "text-foreground")}
                    />
                  )}
                </div>

                <div className="flex-1">
                  <div
                    className={cn(
                      "font-medium",
                      isActive && "text-foreground",
                      isCompleted && "text-muted-foreground line-through",
                      isPending && "text-muted-foreground"
                    )}
                  >
                    {config.label}
                  </div>
                  <div className="text-xs text-muted-foreground">{config.description}</div>
                </div>

                {isActive && <Badge variant="outline">Active</Badge>}
                {isCompleted && (
                  <Badge variant="outline" className="border-green-600 text-[#22c55e]">
                    Done
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        {/* Metadata */}
        {(showTimeSpent || showAttempts) && (
          <div className="flex gap-4 border-t pt-2">
            {showTimeSpent && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatTime(flowContext.timeSpent)}</span>
              </div>
            )}

            {showAttempts && flowContext.attempts > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>
                  {flowContext.attempts} attempt{flowContext.attempts !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
