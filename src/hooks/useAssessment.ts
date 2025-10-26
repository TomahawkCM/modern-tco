import { useState, useCallback, useEffect } from "react";
import { AssessmentEngine } from "../lib/assessment/assessment-engine";
import { ProgressService } from "../lib/services/progress-service";
import { AnalyticsService } from "../lib/services/analytics-service";
import type {
  AssessmentConfig,
  AssessmentSession,
  AssessmentResult,
  QuestionAnswer,
  AnalyticsEvent,
} from "../types/assessment";

export interface UseAssessmentReturn {
  currentSession: AssessmentSession | null;
  currentResult: AssessmentResult | null;
  isLoading: boolean;
  error: string | null;

  // Assessment lifecycle
  startAssessment: (config: AssessmentConfig) => Promise<void>;
  submitAnswer: (questionId: string, answer: QuestionAnswer) => Promise<void>;
  submitAssessment: () => Promise<AssessmentResult>;
  cancelAssessment: () => void;

  // Progress tracking
  updateProgress: (progress: any) => Promise<void>;
  getProgress: (userId: string, moduleId?: string) => Promise<any>;

  // Analytics
  trackEvent: (event: AnalyticsEvent) => Promise<void>;
  getAnalytics: (userId: string, timeRange?: string) => Promise<any>;
}

export function useAssessment(): UseAssessmentReturn {
  const [currentSession, setCurrentSession] = useState<AssessmentSession | null>(null);
  const [currentResult, setCurrentResult] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Assessment lifecycle methods
  const startAssessment = useCallback(async (config: AssessmentConfig) => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize assessment session
      const sessionData = await AssessmentEngine.initializeSession(config);

      const session: AssessmentSession = {
        id: sessionData.sessionId,
        assessmentId: config.assessmentId,
        userId: config.userId,
        moduleId: config.moduleId,
        type: config.assessmentType,
        status: "in_progress",
        startTime: new Date(),
        timeLimit: config.timeLimit,
        questions: sessionData.questions,
        answers: [],
        currentQuestionIndex: 0,
        score: null,
        passed: null,
        completedAt: null,
      };

      setCurrentSession(session);

      // Track assessment start
      await AnalyticsService.track({
        type: "assessment_started",
        userId: config.userId ?? "",
        data: {
          assessmentId: config.assessmentId,
          assessmentType: config.assessmentType,
          moduleId: config.moduleId,
          questionCount: sessionData.questions.length,
          timeLimit: config.timeLimit,
        },
        timestamp: new Date(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start assessment");
      console.error("Error starting assessment:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitAnswer = useCallback(
    async (questionId: string, answer: QuestionAnswer) => {
      if (!currentSession) {
        throw new Error("No active assessment session");
      }

      try {
        setError(null);

        // Update session with answer
  const updatedAnswers = Array.isArray(currentSession.answers) ? [...currentSession.answers] : [];
        const existingAnswerIndex = updatedAnswers.findIndex((a) => a.questionId === questionId);

        if (existingAnswerIndex >= 0) {
          updatedAnswers[existingAnswerIndex] = answer;
        } else {
          updatedAnswers.push(answer);
        }

        const updatedSession = {
          ...currentSession,
          answers: updatedAnswers,
        };

        setCurrentSession(updatedSession);

        // Update assessment engine
        await AssessmentEngine.updateSession(currentSession.id, {
          answers: updatedAnswers,
        });

        // Track answer submission (provide normalized 'selectedAnswers' and keep 'answer' for compatibility)
        await AnalyticsService.track({
          type: "question_answered",
          userId: currentSession.userId ?? "",
          sessionId: currentSession.id,
          data: {
            sessionId: currentSession.id,
            questionId,
            selectedAnswers: ((answer as any).selectedAnswers ?? (
              Array.isArray((answer as any).selectedAnswer)
                ? (answer as any).selectedAnswer
                : [(answer as any).selectedAnswer]
            )).filter(Boolean),
            // Backward compatible alias
            answer: (answer as any).selectedAnswers ?? (answer as any).selectedAnswer,
            timeSpent: (answer as any).timeSpent ?? 0,
            attempts: (answer as any).attempts ?? 1,
            confidence: (answer as any).confidence ?? null,
          },
          timestamp: new Date(),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit answer");
        console.error("Error submitting answer:", err);
      }
    },
    [currentSession]
  );

  const submitAssessment = useCallback(async (): Promise<AssessmentResult> => {
    if (!currentSession) {
      throw new Error("No active assessment session");
    }

    try {
      setIsLoading(true);
      setError(null);

      // Calculate results using assessment engine
      const result = await AssessmentEngine.calculateResults(currentSession);

      // Update session status
      const completedSession = {
        ...currentSession,
        status: "completed" as const,
        completedAt: new Date(),
        score: result.overallScore,
        passed: result.passed,
      };

      setCurrentSession(completedSession);
      setCurrentResult(result);

      // Update progress tracking (keys aligned with tests)
      await ProgressService.updateAssessmentProgress({
        userId: (currentSession.userId ?? "") as any,
        moduleId: currentSession.moduleId as any,
        assessmentId: currentSession.assessmentId as any,
        score: (result).overallScore,
        passed: (result).passed,
        completedAt: (result).completedAt,
        timeSpent: (result).timeSpent ?? (result).totalTime ?? 0,
        correctAnswers: (result).correctAnswers ?? 0,
        incorrectAnswers: (result).incorrectAnswers ?? 0,
        totalQuestions: (result).totalQuestions ?? 0,
        domainBreakdown: (result).domainBreakdown,
      } as any);

      // Track assessment completion
      await AnalyticsService.track({
        type: "assessment_completed",
        userId: currentSession.userId ?? "",
        sessionId: currentSession.id,
        data: {
          sessionId: currentSession.id,
          score: result.overallScore,
          passed: result.passed,
          timeSpent: result.timeSpent,
          correctAnswers: result.correctAnswers,
          totalQuestions: result.totalQuestions,
          domainBreakdown: (result).domainBreakdown,
        },
        timestamp: new Date(),
      });

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit assessment");
      console.error("Error submitting assessment:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentSession]);

  const cancelAssessment = useCallback(() => {
    if (currentSession) {
      // Track assessment cancellation
      AnalyticsService.track({
        type: "assessment_cancelled",
        userId: currentSession.userId,
        sessionId: currentSession.id,
        data: {
          sessionId: currentSession.id,
          questionsAnswered: Array.isArray(currentSession.answers) ? currentSession.answers.length : 0,
          totalQuestions: currentSession.questions.length,
          timeSpent: Date.now() - currentSession.startTime.getTime(),
        },
        timestamp: new Date(),
      });

      // Clear session
      setCurrentSession(null);
      setCurrentResult(null);
    }
    setError(null);
  }, [currentSession]);

  const updateProgress = useCallback(async (progress: any) => {
    try {
      await ProgressService.updateQuestionProgress(progress);
    } catch (err) {
      console.error("Error updating progress:", err);
    }
  }, []);

  const getProgress = useCallback(async (userId: string, moduleId?: string) => {
    try {
      return await ProgressService.getUserProgress(userId, moduleId);
    } catch (err) {
      console.error("Error getting progress:", err);
      return null;
    }
  }, []);

  const trackEvent = useCallback(async (event: AnalyticsEvent) => {
    try {
      await AnalyticsService.track(event);
    } catch (err) {
      console.error("Error tracking event:", err);
    }
  }, []);

  const getAnalytics = useCallback(async (userId: string, timeRange?: string) => {
    try {
      return await AnalyticsService.getUserAnalytics(userId, timeRange);
    } catch (err) {
      console.error("Error getting analytics:", err);
      return null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentSession && currentSession.status === "in_progress") {
        cancelAssessment();
      }
    };
  }, []);

  return {
    currentSession,
    currentResult,
    isLoading,
    error,
    startAssessment,
    submitAnswer,
    submitAssessment,
    cancelAssessment,
    updateProgress,
    getProgress,
    trackEvent,
    getAnalytics,
  };
}
