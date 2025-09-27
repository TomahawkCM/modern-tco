"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from "react";
import { AssessmentEngine } from "@/lib/assessment-engine";
import { useQuestions } from "@/contexts/QuestionsContext";
import type {
  AssessmentSession,
  AssessmentResult,
  AssessmentType,
  Question,
  QuestionResponse,
  RemediationPlan,
} from "@/types/assessment";

/* ----------------------------- Public API ----------------------------- */

interface AssessmentContextType {
  currentAssessment: AssessmentSession | null;
  currentResult: AssessmentResult | null;
  currentQuestionIndex: number;
  timeRemaining: number;

  startAssessment: (config: AssessmentConfig) => Promise<void>;
  submitAssessment: () => Promise<AssessmentResult>;
  pauseAssessment: () => void;
  resumeAssessment: () => void;
  exitAssessment: () => void;

  answerQuestion: (questionId: string, answer: string) => void;
  navigateToQuestion: (questionIndex: number) => void;
  getCurrentQuestion: () => Question | null;

  getProgress: () => AssessmentProgress;
  getAssessmentHistory: () => AssessmentResult[];
  startRemediation: (plan: RemediationPlan) => Promise<void>;

  recordAnalytics: (event: AnalyticsEvent) => void;
}

interface AssessmentConfig {
  type: AssessmentType;
  moduleId?: string;
  /** Upstream may send a single value or array; we normalize to one */
  domainFilter?: string | string[];
  questionCount?: number;
  timeLimit?: number;
}

interface AssessmentProgress {
  total: number;
  answered: number;
  percent: number;
}

interface AnalyticsEvent {
  type: "question_viewed" | "answer_selected" | "answer_changed" | "navigation" | "time_warning";
  data: Record<string, any>;
  timestamp: Date;
}

/* ----------------------------- Internals ------------------------------ */

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

/** Normalize AssessmentType (enum or string union) to lowercase key */
function assessmentTypeKey(type: AssessmentType): string {
  return String(type).toLowerCase();
}

const DEFAULT_COUNTS: Record<string, number> = {
  quiz: 20,
  mock_exam: 60,
};

const DEFAULT_TIME_LIMITS: Record<string, number> = {
  quiz: 20,
  mock_exam: 90,
};

/* ============================= Provider =============================== */

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const { getAssessmentQuestions } = useQuestions();

  const [currentAssessment, setCurrentAssessment] = useState<AssessmentSession | null>(null);
  const [currentResult, setCurrentResult] = useState<AssessmentResult | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [history, setHistory] = useState<AssessmentResult[]>([]);

  // Values not present on AssessmentSession (per your type)
  const [currentType, setCurrentType] = useState<AssessmentType | null>(null);
  const [currentDomain, setCurrentDomain] = useState<string | undefined>();
  const [currentModuleId, setCurrentModuleId] = useState<string | undefined>();

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const getDefaultQuestionCount = (type: AssessmentType) =>
    DEFAULT_COUNTS[assessmentTypeKey(type)] ?? 20;

  const getDefaultTimeLimit = (type: AssessmentType) =>
    DEFAULT_TIME_LIMITS[assessmentTypeKey(type)] ?? 20;

  const startAssessment = useCallback(
    async (config: AssessmentConfig) => {
      // Normalize domain to a single value (for now)
      const normalizedDomain = Array.isArray(config.domainFilter)
        ? config.domainFilter[0]
        : config.domainFilter;

      // End any existing session
      if (currentAssessment) {
        clearTimer();
        setCurrentAssessment(null);
        setCurrentResult(null);
        setCurrentQuestionIndex(0);
        setTimeRemaining(0);
      }

      // Track values not on AssessmentSession
      setCurrentType(config.type);
      setCurrentDomain(normalizedDomain);
      setCurrentModuleId(config.moduleId);

      // Fetch questions
      const questions = await getAssessmentQuestions({
        type: config.type,
        moduleId: config.moduleId,
        domainFilter: normalizedDomain as any,
        count: config.questionCount ?? getDefaultQuestionCount(config.type),
      });
      if (!questions || questions.length === 0) {
        throw new Error("No questions available for the selected configuration.");
      }

      // Build session (align to your AssessmentSession type)
      const session: AssessmentSession = {
        id: `assessment-${Date.now()}`,
        questions,
        responses: [] as any, // array model
        startTime: new Date(),
        timeLimit: config.timeLimit ?? getDefaultTimeLimit(config.type),
        status: "in_progress",

        // Required by your AssessmentSession type:
        domain: normalizedDomain as any,
        config: {
          type: config.type as any,
          moduleId: config.moduleId,
          questionCount: config.questionCount ?? getDefaultQuestionCount(config.type),
          timeLimit: config.timeLimit ?? getDefaultTimeLimit(config.type),
        } as any,
      };

      setCurrentAssessment(session);
      setCurrentResult(null);
      setCurrentQuestionIndex(0);

      // Start countdown
      if (session.timeLimit === undefined) {
        throw new Error("Assessment time limit is not defined.");
      }
      const totalSeconds = session.timeLimit * 60;
      setTimeRemaining(totalSeconds);
      clearTimer();
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearTimer();
            submitAssessment().catch(() => {});
            return 0;
          }
          if (prev === 5 * 60) {
            recordAnalytics({
              type: "time_warning",
              data: { remaining: prev },
              timestamp: new Date(),
            });
          }
          return prev - 1;
        });
      }, 1000);
    },
    [currentAssessment, getAssessmentQuestions]
  );

  /** Upsert a QuestionResponse by questionId into an array */
  const upsertResponse = (arr: QuestionResponse[], next: QuestionResponse): QuestionResponse[] => {
    const idx = arr.findIndex((r) => r.questionId === next.questionId);
    if (idx >= 0) {
      const copy = arr.slice();
      copy[idx] = next;
      return copy;
    }
    return [...arr, next];
  };

  const answerQuestion = useCallback((questionId: string, answer: string) => {
    setCurrentAssessment((prev) => {
      if (!prev) return prev;
      // Find the question to determine correctness
      const question = prev.questions.find((q) => q.id === questionId);
      if (!question) return prev;
      const isCorrect = Array.isArray(answer)
        ? Array.isArray(question.correctAnswerId)
          ? JSON.stringify(answer.sort()) ===
            JSON.stringify((question.correctAnswerId as string[]).sort())
          : false
        : answer === question.correctAnswerId;
      const response: QuestionResponse = {
        questionId,
        selectedAnswer: answer,
        isCorrect,
        timeSpent: 0,
        timestamp: new Date(),
      };
      const updatedResponses = upsertResponse(
        (prev.responses as unknown as QuestionResponse[]) ?? [],
        response
      );
      return { ...prev, responses: updatedResponses as any };
    });
    recordAnalytics({
      type: "answer_selected",
      data: { questionId, answer },
      timestamp: new Date(),
    });
  }, []);

  const navigateToQuestion = useCallback(
    (questionIndex: number) => {
      setCurrentQuestionIndex((idx) => {
        const maxIdx = (currentAssessment?.questions.length ?? 1) - 1;
        const next = Math.max(0, Math.min(questionIndex, maxIdx));
        if (next !== idx) {
          recordAnalytics({
            type: "navigation",
            data: { from: idx, to: next },
            timestamp: new Date(),
          });
        }
        return next;
      });
    },
    [currentAssessment?.questions.length]
  );

  const getCurrentQuestion = useCallback((): Question | null => {
    if (!currentAssessment) return null;
    return currentAssessment.questions[currentQuestionIndex] ?? null;
  }, [currentAssessment, currentQuestionIndex]);

  const getProgress = useCallback((): AssessmentProgress => {
    const total = currentAssessment?.questions.length ?? 0;
    const answered = currentAssessment
      ? ((currentAssessment.responses as unknown as QuestionResponse[]) ?? []).length
      : 0;
    const percent = total ? Math.round((answered / total) * 100) : 0;
    return { total, answered, percent };
  }, [currentAssessment]);

  const submitAssessment = useCallback(async (): Promise<AssessmentResult> => {
    if (!currentAssessment) throw new Error("No active assessment to submit.");
    clearTimer();

    // Use AssessmentEngine.completeAssessment instead of missing evaluate
    const engine = new AssessmentEngine();
    const result = engine.completeAssessment({
      ...currentAssessment,
      endTime: new Date(),
      status: "completed",
    });

    setCurrentResult(result);
    setHistory((prev) => [result, ...prev]);
    setCurrentAssessment((prev) => (prev ? { ...prev, status: "completed" } : prev));
    return result;
  }, [currentAssessment]);

  const pauseAssessment = useCallback(() => {
    clearTimer();
    setCurrentAssessment((prev) => (prev ? { ...prev, status: "paused" } : prev));
  }, []);

  const resumeAssessment = useCallback(() => {
    if (!currentAssessment) return;
    if (currentAssessment.status !== "paused") return;
    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          submitAssessment().catch(() => {});
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setCurrentAssessment((prev) => (prev ? { ...prev, status: "in_progress" } : prev));
  }, [currentAssessment, submitAssessment]);

  const exitAssessment = useCallback(() => {
    clearTimer();
    setCurrentAssessment(null);
    setCurrentResult(null);
    setCurrentQuestionIndex(0);
    setTimeRemaining(0);
    setCurrentType(null);
    setCurrentDomain(undefined);
    setCurrentModuleId(undefined);
  }, []);

  const getAssessmentHistory = useCallback(() => history, [history]);

  const startRemediation = useCallback(async (_plan: RemediationPlan) => {
    // Hook up when remediation flow is defined
    return;
  }, []);

  const recordAnalytics = useCallback((event: AnalyticsEvent) => {
    // Replace with your telemetry pipeline
     
    console.debug("[Assessment Analytics]", event.type, event.data);
  }, []);

  const value = useMemo<AssessmentContextType>(
    () => ({
      currentAssessment,
      currentResult,
      currentQuestionIndex,
      timeRemaining,
      startAssessment,
      submitAssessment,
      pauseAssessment,
      resumeAssessment,
      exitAssessment,
      answerQuestion,
      navigateToQuestion,
      getCurrentQuestion,
      getProgress,
      getAssessmentHistory,
      startRemediation,
      recordAnalytics,
    }),
    [
      currentAssessment,
      currentResult,
      currentQuestionIndex,
      timeRemaining,
      startAssessment,
      submitAssessment,
      pauseAssessment,
      resumeAssessment,
      exitAssessment,
      answerQuestion,
      navigateToQuestion,
      getCurrentQuestion,
      getProgress,
      getAssessmentHistory,
      startRemediation,
      recordAnalytics,
    ]
  );

  return <AssessmentContext.Provider value={value}>{children}</AssessmentContext.Provider>;
}

/* ------------------------------ Hook ---------------------------------- */

export function useAssessment(): AssessmentContextType {
  const ctx = useContext(AssessmentContext);
  if (!ctx) {
    throw new Error("useAssessment must be used within an AssessmentProvider");
  }
  return ctx;
}
