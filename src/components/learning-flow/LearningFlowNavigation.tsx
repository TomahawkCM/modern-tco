"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowRight, ArrowLeft, Play, RotateCcw, CheckCircle, AlertTriangle } from "lucide-react";
import {
  LearningFlowState,
  LearningFlowEvent,
  type LearningFlowContext,
} from "@/types/learning-flow";
import { cn } from "@/lib/utils";

interface LearningFlowNavigationProps {
  flowContext: LearningFlowContext;
  canProceed: boolean;
  onStateChange: (event: LearningFlowEvent) => void;
  onReset?: () => void;
  className?: string;
  disabled?: boolean;
}

const NAVIGATION_CONFIG = {
  [LearningFlowState.LEARN]: {
    title: "Study the Material",
    description: "Review the learning content and understand the concepts",
    nextLabel: "Start Practice",
    nextEvent: LearningFlowEvent.COMPLETE_LEARN,
    color: "bg-blue-500",
    canGoBack: false,
  },
  [LearningFlowState.PRACTICE]: {
    title: "Practice Questions",
    description: "Test your understanding with practice questions",
    nextLabel: "Start Assessment",
    nextEvent: LearningFlowEvent.COMPLETE_PRACTICE,
    prevLabel: undefined,
    prevEvent: undefined,
    color: "bg-amber-500",
    canGoBack: false,
  },
  [LearningFlowState.ASSESS]: {
    title: "Take Assessment",
    description: "Complete the formal assessment to finish this module",
    nextLabel: "Complete Assessment",
    nextEvent: LearningFlowEvent.COMPLETE_ASSESS,
    prevLabel: undefined,
    prevEvent: undefined,
    color: "bg-cyan-500",
    canGoBack: false,
  },
  [LearningFlowState.COMPLETED]: {
    title: "Module Completed",
    description: "Congratulations! You have successfully completed this module",
    nextLabel: null,
    nextEvent: null,
    prevLabel: undefined,
    prevEvent: undefined,
    color: "bg-green-500",
    canGoBack: false,
  },
};

export function LearningFlowNavigation({
  flowContext,
  canProceed,
  onStateChange,
  onReset,
  className,
  disabled = false,
}: LearningFlowNavigationProps) {
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  const config = NAVIGATION_CONFIG[flowContext.currentState];
  const isCompleted = flowContext.currentState === LearningFlowState.COMPLETED;

  const handleNext = () => {
    if (config.nextEvent && canProceed) {
      onStateChange(config.nextEvent);
    }
  };

  const handlePrev = () => {
    // Back navigation disabled in this simplified flow
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
      setIsConfirmingReset(false);
    }
  };

  const canAdvance = canProceed && config.nextEvent && !disabled;
  const canGoBack = false;
  const showReset = onReset && flowContext.currentState !== LearningFlowState.LEARN && !disabled;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{config.title}</CardTitle>
              <Badge className={cn("text-white", config.color)} variant="secondary">
                {flowContext.currentState.charAt(0).toUpperCase() +
                  flowContext.currentState.slice(1)}
              </Badge>
            </div>
            <CardDescription>{config.description}</CardDescription>
          </div>

          {isCompleted && <CheckCircle className="h-8 w-8 text-green-500" />}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Readiness Check */}
          {!canProceed && config.nextEvent && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
              <div className="flex-1 text-sm">
                <p className="font-medium text-amber-800">Prerequisites not met</p>
                <p className="text-amber-700">
                  {flowContext.currentState === LearningFlowState.LEARN &&
                    "Complete the learning content to proceed to practice."}
                  {flowContext.currentState === LearningFlowState.PRACTICE &&
                    "Answer enough practice questions correctly to proceed to assessment."}
                  {flowContext.currentState === LearningFlowState.ASSESS &&
                    "Complete the assessment to finish this module."}
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2">
              {canGoBack && (
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={disabled}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              )}

              {showReset && (
                <AlertDialog open={isConfirmingReset} onOpenChange={setIsConfirmingReset}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={disabled}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset Progress
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset Learning Progress?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will reset your progress for this module and return you to the learning
                        phase. All practice attempts and assessment results will be lost. This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleReset}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Reset Progress
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {config.nextEvent && (
              <Button
                onClick={handleNext}
                disabled={!canAdvance}
                className={cn(
                  "flex min-w-fit items-center gap-2",
                  isCompleted ? "bg-green-600 hover:bg-green-700" : ""
                )}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Module Complete
                  </>
                ) : (
                  <>
                    {config.nextLabel}
                    {flowContext.currentState === LearningFlowState.LEARN ? (
                      <Play className="h-4 w-4" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Progress Hint */}
          {flowContext.currentState !== LearningFlowState.COMPLETED && (
            <div className="text-sm text-muted-foreground">
              {flowContext.currentState === LearningFlowState.LEARN &&
                "Take your time to understand the concepts before moving to practice."}
              {flowContext.currentState === LearningFlowState.PRACTICE &&
                "Practice helps reinforce your learning. Complete enough questions to unlock the assessment."}
              {flowContext.currentState === LearningFlowState.ASSESS &&
                "This is your chance to demonstrate your mastery of the material."}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
