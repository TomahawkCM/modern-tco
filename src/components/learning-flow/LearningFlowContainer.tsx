"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useModule } from "@/contexts/ModuleContext";
import { useAuth } from "@/contexts/AuthContext";
import { LearningFlowProgress } from "./LearningFlowProgress";
import { LearningFlowNavigation } from "./LearningFlowNavigation";
import type { LearningFlowStateMachine } from "@/lib/learning-flow-state-machine";
import {
  LearningFlowState,
  LearningFlowEvent,
  type LearningFlowContext,
} from "@/types/learning-flow";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface LearningFlowContainerProps {
  moduleId: string;
  className?: string;
  onStateChange?: (newState: LearningFlowState, context: LearningFlowContext) => void;
  children?: React.ReactNode;
}

export function LearningFlowContainer({
  moduleId,
  className,
  onStateChange,
  children,
}: LearningFlowContainerProps) {
  const { startLearningFlow, getLearningFlow, updateLearningFlow, resetLearningFlow } = useModule();
  const { user } = useAuth();

  const [flowStateMachine, setFlowStateMachine] = useState<LearningFlowStateMachine | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize or load existing learning flow
  useEffect(() => {
    const initializeFlow = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to get existing flow first
        let flow = await getLearningFlow(moduleId);

        // If no existing flow, start a new one
        if (!flow) {
          flow = await startLearningFlow(moduleId);
        }

        setFlowStateMachine(flow);
      } catch (err) {
        console.error("Failed to initialize learning flow:", err);
        setError(err instanceof Error ? err.message : "Failed to initialize learning flow");
      } finally {
        setIsLoading(false);
      }
    };

    if (moduleId && user) {
      initializeFlow();
    }
  }, [moduleId, user, getLearningFlow, startLearningFlow]);

  const handleStateChange = useCallback(
    async (event: LearningFlowEvent) => {
      if (!flowStateMachine) return;

      try {
        const success = flowStateMachine.transition(event);
        if (success) {
          // Update the local state
          setFlowStateMachine(flowStateMachine);

          // Persist to context and database
          await updateLearningFlow(moduleId, flowStateMachine);

          // Notify parent component
          if (onStateChange) {
            onStateChange(flowStateMachine.currentState, flowStateMachine.context);
          }
        } else {
          console.warn(`Invalid transition: ${event} from ${flowStateMachine.currentState}`);
        }
      } catch (err) {
        console.error("Failed to update learning flow:", err);
        setError(err instanceof Error ? err.message : "Failed to update learning flow");
      }
    },
    [flowStateMachine, moduleId, updateLearningFlow, onStateChange]
  );

  const handleReset = useCallback(async () => {
    try {
      setError(null);
      await resetLearningFlow(moduleId);

      // Start fresh flow
      const newFlow = await startLearningFlow(moduleId);
      setFlowStateMachine(newFlow);

      // Notify parent component
      if (onStateChange) {
        onStateChange(newFlow.currentState, newFlow.context);
      }
    } catch (err) {
      console.error("Failed to reset learning flow:", err);
      setError(err instanceof Error ? err.message : "Failed to reset learning flow");
    }
  }, [moduleId, resetLearningFlow, startLearningFlow, onStateChange]);

  // Check if user can proceed based on current state and conditions
  const canProceed = useCallback(() => {
    if (!flowStateMachine) return false;

    // Use the state machine's built-in logic to determine if transitions are allowed
    const { currentState } = flowStateMachine;

    switch (currentState) {
      case LearningFlowState.LEARN:
        return flowStateMachine.canTransition(LearningFlowEvent.COMPLETE_LEARN);
      case LearningFlowState.PRACTICE:
        return flowStateMachine.canTransition(LearningFlowEvent.COMPLETE_PRACTICE);
      case LearningFlowState.ASSESS:
        return flowStateMachine.canTransition(LearningFlowEvent.COMPLETE_ASSESS);
      case LearningFlowState.COMPLETED:
        return true; // Always allow navigation within completed state
      default:
        return false;
    }
  }, [flowStateMachine]);

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full max-w-md" />
              <div className="flex justify-between">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className={cn("border-destructive", className)}>
        <CardContent className="p-6">
          <div className="space-y-2 text-center">
            <p className="font-medium text-destructive">Failed to load learning flow</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-primary hover:underline"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!flowStateMachine || !user) {
    return null;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress Display */}
      <LearningFlowProgress
        flowContext={flowStateMachine.context}
        showTimeSpent={true}
        showAttempts={true}
      />

      {/* Main Content Area - This is where phase-specific content would be rendered */}
      {children && <div className="min-h-96">{children}</div>}

      {/* Navigation Controls */}
      <LearningFlowNavigation
        flowContext={flowStateMachine.context}
        canProceed={canProceed()}
        onStateChange={handleStateChange}
        onReset={handleReset}
      />
    </div>
  );
}
