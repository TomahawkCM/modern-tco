"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useQuestions } from "@/contexts/QuestionsContext";
import { useModule } from "@/contexts/ModuleContext";
import { useAuth } from "@/contexts/AuthContext";
import { PracticeQuestion } from "./PracticeQuestion";
import { PracticeSessionSummary } from "./PracticeSessionSummary";
import { PracticeSessionManager } from "@/lib/practice-session-manager";
import {
  type PracticeSession,
  type PracticeSessionConfig,
  PracticeSessionState,
  type PracticeSessionSummary as SessionSummary,
} from "@/types/practice-session";
import { type TCODomain, Difficulty } from "@/types/exam";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Play, RotateCcw, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface PracticeSessionContainerProps {
  moduleId: string;
  domain?: TCODomain;
  className?: string;
  onSessionComplete?: (summary: SessionSummary) => void;
  onPassingScoreAchieved?: () => void;
}

const DEFAULT_CONFIG: Omit<PracticeSessionConfig, "moduleId"> = {
  questionCount: 10,
  passingScore: 70, // 70% needed to unlock assessment
  timeLimit: undefined, // No time limit for practice
};

export function PracticeSessionContainer({
  moduleId,
  domain,
  className,
  onSessionComplete,
  onPassingScoreAchieved,
}: PracticeSessionContainerProps) {
  const {
    getQuestionsWithFilters,
    getQuestionsByDomain,
    loading: questionsLoading,
  } = useQuestions();
  const { user } = useAuth();

  const [sessionManager] = useState(() => new PracticeSessionManager());
  const [currentSession, setCurrentSession] = useState<PracticeSession | null>(null);
  const [sessionState, setSessionState] = useState<PracticeSessionState>(
    PracticeSessionState.NOT_STARTED
  );
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | undefined>();

  // Setup session manager callbacks
  useEffect(() => {
    sessionManager.setProgressCallback((progress: any) => {
      console.log("Practice progress updated:", progress);
    });

    sessionManager.setCompleteCallback((summary: any) => {
      setSessionSummary(summary);
      setSessionState(PracticeSessionState.COMPLETED);

      // Check if passing score achieved
      if (summary.passed && onPassingScoreAchieved) {
        onPassingScoreAchieved();
      }

      // Notify parent
      if (onSessionComplete) {
        onSessionComplete(summary);
      }
    });
  }, [sessionManager, onSessionComplete, onPassingScoreAchieved]);

  // Timer management
  useEffect(() => {
    if (!currentSession?.config.timeLimit || sessionState !== PracticeSessionState.IN_PROGRESS) {
      return;
    }

    const startTime = currentSession.startedAt.getTime();
    const timeLimitMs = currentSession.config.timeLimit * 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.floor((timeLimitMs - elapsed) / 1000));

      setTimeRemaining(remaining);

      if (remaining === 0) {
        // Auto-complete session when time expires
        handleCompleteSession();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSession, sessionState]);

  const startPracticeSession = useCallback(async () => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get questions for this module/domain
      const questions = domain
        ? await getQuestionsByDomain(domain)
        : await getQuestionsWithFilters({
            tags: [moduleId],
            limit: 50, // Get larger pool for randomization
          });

      if (questions.length === 0) {
        throw new Error("No questions available for practice");
      }

      // Create session config
      const config: PracticeSessionConfig = {
        ...DEFAULT_CONFIG,
        moduleId,
        domain,
      };

      // Start the session
      const session = await sessionManager.startSession(config, user.id, questions);
      setCurrentSession(session);
      setSessionState(PracticeSessionState.IN_PROGRESS);
      setSessionSummary(null);
    } catch (err) {
      console.error("Failed to start practice session:", err);
      setError(err instanceof Error ? err.message : "Failed to start practice session");
    } finally {
      setLoading(false);
    }
  }, [moduleId, domain, user, getQuestionsByDomain, getQuestionsWithFilters, sessionManager]);

  const handleAnswer = useCallback(
    (questionId: string, choiceId: string) => {
      const isCorrect = sessionManager.answerQuestion(questionId, choiceId);
      const updatedSession = sessionManager.getCurrentSession();

      if (updatedSession) {
        setCurrentSession({ ...updatedSession });
      }

      return isCorrect;
    },
    [sessionManager]
  );

  const handleNextQuestion = useCallback(() => {
    const nextQuestion = sessionManager.nextQuestion();
    const updatedSession = sessionManager.getCurrentSession();

    if (updatedSession) {
      setCurrentSession({ ...updatedSession });
    }

    if (!nextQuestion) {
      // Session completed
      setSessionState(PracticeSessionState.COMPLETED);
    }
  }, [sessionManager]);

  const handlePreviousQuestion = useCallback(() => {
    const prevQuestion = sessionManager.previousQuestion();
    const updatedSession = sessionManager.getCurrentSession();

    if (updatedSession) {
      setCurrentSession({ ...updatedSession });
    }
  }, [sessionManager]);

  const handleCompleteSession = useCallback(() => {
    // Force complete the current session
    const session = sessionManager.getCurrentSession();
    if (session && !session.completedAt) {
      // Complete remaining questions as unanswered
      while (sessionManager.nextQuestion() !== null) {
        // This will trigger completion when all questions are processed
      }
    }
  }, [sessionManager]);

  const handleRestartSession = useCallback(() => {
    sessionManager.resetSession();
    setCurrentSession(null);
    setSessionState(PracticeSessionState.NOT_STARTED);
    setSessionSummary(null);
    setTimeRemaining(undefined);
    setError(null);
  }, [sessionManager]);

  // Loading state
  if (questionsLoading || loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn("border-destructive", className)}>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
            <div className="space-y-2">
              <p className="font-medium text-destructive">Practice Session Error</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={() => setError(null)}>
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Session completed - show summary
  if (sessionState === PracticeSessionState.COMPLETED && sessionSummary) {
    return (
      <div className={cn("space-y-6", className)}>
        <PracticeSessionSummary session={currentSession as any} onRestart={handleRestartSession} />
      </div>
    );
  }

  // Session in progress - show current question
  if (sessionState === PracticeSessionState.IN_PROGRESS && currentSession) {
    const currentQuestion = sessionManager.getCurrentQuestion();

    if (!currentQuestion) {
      return (
        <div className={className}>
          <Card>
            <CardContent className="p-6 text-center">
              <p>No questions available</p>
              <Button onClick={handleRestartSession} className="mt-4">
                Restart Session
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className={className}>
        <PracticeQuestion
          question={currentQuestion}
          questionNumber={currentSession.currentQuestionIndex + 1}
          totalQuestions={currentSession.totalQuestions}
          onAnswer={handleAnswer}
          onNext={handleNextQuestion}
          onPrevious={handlePreviousQuestion}
          canGoNext={sessionManager.canGoToNext()}
          canGoPrevious={sessionManager.canGoToPrevious()}
          timeRemaining={timeRemaining}
        />
      </div>
    );
  }

  // Not started - show start screen
  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>Practice Session</CardTitle>
            {domain && <Badge variant="secondary">{domain}</Badge>}
          </div>
          <CardDescription>
            Test your understanding with practice questions. You need to score{" "}
            {DEFAULT_CONFIG.passingScore}% or higher to unlock the assessment.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Questions:</span>
              <span className="ml-2 text-muted-foreground">{DEFAULT_CONFIG.questionCount}</span>
            </div>
            <div>
              <span className="font-medium">Passing Score:</span>
              <span className="ml-2 text-muted-foreground">{DEFAULT_CONFIG.passingScore}%</span>
            </div>
            <div>
              <span className="font-medium">Time Limit:</span>
              <span className="ml-2 text-muted-foreground">
                {DEFAULT_CONFIG.timeLimit ? `${DEFAULT_CONFIG.timeLimit / 60} minutes` : "None"}
              </span>
            </div>
            <div>
              <span className="font-medium">Domain:</span>
              <span className="ml-2 text-muted-foreground">{domain || "Mixed"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Button onClick={startPracticeSession} disabled={loading}>
              <Play className="mr-2 h-4 w-4" />
              Start Practice
            </Button>

            {currentSession && (
              <Button variant="outline" onClick={handleRestartSession}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
