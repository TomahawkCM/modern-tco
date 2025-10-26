"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useIncorrectAnswers } from "@/contexts/IncorrectAnswersContext";
import { useDatabase } from "@/hooks/useDatabase";
import {
  getAllAvailableQuestions,
  getDatabaseWeightedQuestions,
  getMockExamQuestions,
  getPracticeQuestions,
} from "@/lib/examLogic";
import { ExamMode, type ExamSession, type Question } from "@/types/exam";
import React, { createContext, useContext, useEffect, useReducer, useState } from "react";

interface ExamState {
  currentSession: ExamSession | null;
  isLoading: boolean;
  error: string | null;
}

type ExamAction =
  | { type: "START_EXAM"; mode: ExamMode; questions: Question[] }
  | { type: "ANSWER_QUESTION"; questionId: string; answerId: string }
  | { type: "NEXT_QUESTION" }
  | { type: "PREVIOUS_QUESTION" }
  | { type: "FINISH_EXAM" }
  | { type: "RESET_EXAM" }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error: string }
  | { type: "LOAD_SESSION"; session: ExamSession };

const examReducer = (state: ExamState, action: ExamAction): ExamState => {
  switch (action.type) {
    case "START_EXAM":
      const newSession: ExamSession = {
        id: `session-${Date.now()}`,
        mode: action.mode,
        questions: action.questions,
        currentIndex: 0,
        answers: {},
        startTime: new Date(),
        completed: false,
      };
      return {
        ...state,
        currentSession: newSession,
        isLoading: false,
        error: null,
      };

    case "ANSWER_QUESTION":
      if (!state.currentSession) return state;

      const updatedSession = {
        ...state.currentSession,
        answers: {
          ...state.currentSession.answers,
          [action.questionId]: action.answerId,
        },
      };

      return {
        ...state,
        currentSession: updatedSession,
      };

    case "NEXT_QUESTION":
      if (!state.currentSession) return state;

      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          currentIndex: Math.min(
            state.currentSession.currentIndex + 1,
            state.currentSession.questions.length - 1
          ),
        },
      };

    case "PREVIOUS_QUESTION":
      if (!state.currentSession) return state;

      return {
        ...state,
        currentSession: {
          ...state.currentSession,
          currentIndex: Math.max(state.currentSession.currentIndex - 1, 0),
        },
      };

    case "FINISH_EXAM":
      if (!state.currentSession) return state;

      // Calculate score
      const correctAnswers = state.currentSession.questions.filter(
        (q) => state.currentSession!.answers[q.id] === q.correctAnswerId
      ).length;

      const score = Math.round((correctAnswers / state.currentSession.questions.length) * 100);

      const completedSession = {
        ...state.currentSession,
        endTime: new Date(),
        score,
        completed: true,
      };

      return {
        ...state,
        currentSession: completedSession,
      };

    case "RESET_EXAM":
      return {
        ...state,
        currentSession: null,
        isLoading: false,
        error: null,
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.loading,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.error,
        isLoading: false,
      };

    case "LOAD_SESSION":
      return {
        ...state,
        currentSession: action.session,
        isLoading: false,
      };

    default:
      return state;
  }
};

interface ExamContextValue {
  state: ExamState;
  startExam: (mode: ExamMode, customQuestions?: Question[]) => Promise<void>;
  answerQuestion: (questionId: string, answerId: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  finishExam: () => void;
  resetExam: () => void;
  getCurrentQuestion: () => Question | null;
  getProgress: () => { current: number; total: number; percentage: number };
  getScore: () => number;
  updateTimer: (remainingSeconds: number) => void;
  timeUp: () => void;
}

const ExamContext = createContext<ExamContextValue | null>(null);

const initialState: ExamState = {
  currentSession: null,
  isLoading: false,
  error: null,
};

export function ExamProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(examReducer, initialState);
  const { user } = useAuth();
  const db = useDatabase(user);
  const { addIncorrectAnswer } = useIncorrectAnswers();
  const [currentDbSessionId, setCurrentDbSessionId] = useState<string | null>(null);

  // Save session to database when user is authenticated, fallback to localStorage
  useEffect(() => {
    const saveSession = async () => {
      if (!state.currentSession) return;

      if (user) {
        try {
          // Save to Supabase
          if (!currentDbSessionId && !state.currentSession.completed) {
            // Create new session in database
            const dbSession = await db.insertExamSession({
              session_type:
                state.currentSession.mode === ExamMode.PRACTICE
                  ? "practice"
                  : state.currentSession.mode === ExamMode.MOCK
                    ? "mock"
                    : "timed",
              started_at: state.currentSession.startTime.toISOString(),
              total_questions: state.currentSession.questions.length,
              correct_answers: 0,
              time_spent: 0,
            });
            setCurrentDbSessionId(dbSession.id);
          } else if (currentDbSessionId && state.currentSession.completed) {
            // Update completed session
            const correctAnswers = state.currentSession.questions.filter(
              (q) => state.currentSession!.answers[q.id] === q.correctAnswerId
            ).length;

            const timeSpent = state.currentSession.endTime
              ? Math.floor(
                  (state.currentSession.endTime.getTime() -
                    state.currentSession.startTime.getTime()) /
                    1000
                )
              : 0;

            const score = Math.round(
              (correctAnswers / state.currentSession.questions.length) * 100
            );

            await db.updateExamSession(currentDbSessionId, {
              completed_at: state.currentSession.endTime?.toISOString(),
              score,
              correct_answers: correctAnswers,
              time_spent: timeSpent,
              is_passed: score >= 70,
            });

            // Save individual question progress and track incorrect answers
            for (const [questionId, answerId] of Object.entries(state.currentSession.answers)) {
              const question = state.currentSession.questions.find((q) => q.id === questionId);
              if (question) {
                const isCorrect = answerId === question.correctAnswerId;

                await db.insertUserProgress({
                  question_id: questionId,
                  is_correct: isCorrect,
                  selected_answer: Number(answerId),
                  time_taken: 0, // Could be enhanced to track individual question time
                  exam_session_id: currentDbSessionId,
                });

                // Track incorrect answers for review functionality
                if (!isCorrect) {
                  addIncorrectAnswer({
                    questionId,
                    questionText: question.question,
                    userAnswer: question.choices[parseInt(answerId)]?.text || '',
                    correctAnswer: question.choices[parseInt(question.correctAnswerId)]?.text || '',
                    domain: question.domain,
                    sessionId: currentDbSessionId,
                  });
                }
              }
            }
          }
        } catch (error) {
          console.error("Failed to save session to database:", error);
          // Fallback to localStorage
          localStorage.setItem("tco-exam-session", JSON.stringify(state.currentSession));
        }
      } else {
        // Not authenticated, save to localStorage
        localStorage.setItem("tco-exam-session", JSON.stringify(state.currentSession));

        // Track incorrect answers for review functionality when session is completed
        if (state.currentSession.completed && addIncorrectAnswer) {
          for (const [questionId, answerId] of Object.entries(state.currentSession.answers)) {
            const question = state.currentSession.questions.find((q) => q.id === questionId);
            if (question && answerId !== question.correctAnswerId) {
              addIncorrectAnswer({
                questionId,
                questionText: question.question,
                userAnswer: question.choices[parseInt(answerId)]?.text || '',
                correctAnswer: question.choices[parseInt(question.correctAnswerId)]?.text || '',
                domain: question.domain,
                sessionId: state.currentSession.id,
              });
            }
          }
        }
      }
    };

    if (state.currentSession) {
      // Debounced save to prevent excessive localStorage writes
      const timeoutId = setTimeout(() => {
        saveSession();
      }, 200);

      return () => clearTimeout(timeoutId);
    } else {
      // Clear both database session ID and localStorage
      setCurrentDbSessionId(null);
      localStorage.removeItem("tco-exam-session");
    }
  }, [state.currentSession, user?.id, currentDbSessionId, db, addIncorrectAnswer]);

  // Load session from database or localStorage on mount
  useEffect(() => {
    const loadSession = async () => {
      if (user) {
        try {
          // Try to load from database first
          const sessions = await db.getExamSessions();
          const incompleteSession = sessions.find((s: any) => !s.completed_at);

          if (incompleteSession) {
            // Convert database session back to ExamSession format
            // Note: This would need question data to be fully functional
            // For now, we'll still fall back to localStorage for incomplete sessions
            console.log("Found incomplete database session:", incompleteSession.id);
            setCurrentDbSessionId(incompleteSession.id);
          }
        } catch (error) {
          console.error("Failed to load session from database:", error);
        }
      }

      // Load from localStorage as fallback
      const safeLoadSession = () => {
        try {
          if (typeof window === "undefined") return;

          const savedSession = localStorage.getItem("tco-exam-session");
          if (!savedSession) return;

          const session = JSON.parse(savedSession) as ExamSession;

          // Validate session structure
          if (!session.id || !session.mode || !Array.isArray(session.questions)) {
            console.warn("Invalid session structure, removing corrupted data");
            localStorage.removeItem("tco-exam-session");
            return;
          }

          // Convert date strings back to Date objects with validation
          try {
            session.startTime = new Date(session.startTime);
            if (session.endTime) {
              session.endTime = new Date(session.endTime);
            }

            // Validate dates
            if (isNaN(session.startTime.getTime())) {
              throw new Error("Invalid start time");
            }

            if (session.endTime && isNaN(session.endTime.getTime())) {
              throw new Error("Invalid end time");
            }
          } catch (dateError) {
            console.warn("Invalid date in session, resetting dates:", dateError);
            session.startTime = new Date();
            session.endTime = undefined;
          }

          dispatch({ type: "LOAD_SESSION", session });
        } catch (error) {
          console.error("Failed to load saved session:", error);
          // Clean up corrupted data
          try {
            localStorage.removeItem("tco-exam-session");
          } catch (cleanupError) {
            console.error("Failed to cleanup corrupted session:", cleanupError);
          }
        }
      };

      safeLoadSession();
    };

    loadSession();
  }, [user?.id]);

  const startExam = async (mode: ExamMode, customQuestions?: Question[]) => {
    console.log("ExamContext startExam called with mode:", mode);
    console.log("Custom questions provided:", customQuestions?.length || 0);

    dispatch({ type: "SET_LOADING", loading: true });

    try {
      // Use custom questions if provided, otherwise get questions from centralized question system
      let examQuestions: Question[];
      if (customQuestions) {
        // No cap: use exactly what the caller provided
        examQuestions = customQuestions;
        console.log("Using custom questions:", examQuestions.length);
      } else {
        // Use centralized question system based on exam mode
        if (mode === ExamMode.MOCK) {
          try {
            const { questionService } = await import("@/lib/questionService");
            examQuestions = await questionService.getMockExamQuestions(); // 105
            console.log("Generated mock exam questions from DB (105)", examQuestions.length);
          } catch (e) {
            // Fallback to static weighted questions
            const { getWeightedRandomQuestions } = await import("@/lib/questionLoader");
            examQuestions = getWeightedRandomQuestions(105);
            console.warn("Fallback to static weighted questions (105)");
          }
        } else {
          const questionCount = mode === ExamMode.PRACTICE ? 25 : 20; // Default practice count is 25
          try {
            const { questionService } = await import("@/lib/questionService");
            examQuestions = await questionService.getRandomQuestions(questionCount);
            console.log("Generated practice questions from DB:", examQuestions.length);
          } catch (e) {
            const { getWeightedRandomQuestions } = await import("@/lib/questionLoader");
            examQuestions = getWeightedRandomQuestions(questionCount);
            console.warn("Fallback practice questions from static loader:", examQuestions.length);
          }
        }
      }

      // Validate we have questions
      if (!examQuestions || examQuestions.length === 0) {
        console.warn("No questions available, falling back to all available questions");
        examQuestions = getAllAvailableQuestions().slice(0, mode === ExamMode.MOCK ? 105 : 25);
      }

      console.log("Final exam questions for session:", examQuestions.length);

      setTimeout(() => {
        dispatch({ type: "START_EXAM", mode, questions: examQuestions });
      }, 500); // Small delay for better UX
    } catch (error) {
      console.error("Error starting exam:", error);
      dispatch({ type: "SET_ERROR", error: "Failed to start exam. Please try again." });
    }
  };

  const answerQuestion = (questionId: string, answerId: string) => {
    dispatch({ type: "ANSWER_QUESTION", questionId, answerId });
  };

  const nextQuestion = () => {
    dispatch({ type: "NEXT_QUESTION" });
  };

  const previousQuestion = () => {
    dispatch({ type: "PREVIOUS_QUESTION" });
  };

  const finishExam = () => {
    dispatch({ type: "FINISH_EXAM" });
  };

  const resetExam = () => {
    dispatch({ type: "RESET_EXAM" });
  };

  const getCurrentQuestion = (): Question | null => {
    if (!state.currentSession) return null;
    return state.currentSession.questions[state.currentSession.currentIndex] || null;
  };

  const getProgress = () => {
    if (!state.currentSession) {
      return { current: 0, total: 0, percentage: 0 };
    }

    const current = state.currentSession.currentIndex + 1;
    const total = state.currentSession.questions.length;
    const percentage = Math.round((current / total) * 100);

    return { current, total, percentage };
  };

  const getScore = (): number => {
    if (!state.currentSession) return 0;

    const answeredQuestions = Object.keys(state.currentSession.answers);
    if (answeredQuestions.length === 0) return 0;

    const correctAnswers = answeredQuestions.filter((questionId) => {
      const question = state.currentSession!.questions.find((q) => q.id === questionId);
      return question && state.currentSession!.answers[questionId] === question.correctAnswerId;
    }).length;

    return Math.round((correctAnswers / answeredQuestions.length) * 100);
  };

  const updateTimer = (remainingSeconds: number) => {
    // Update timer state - could be used for analytics or state tracking
    if (state.currentSession) {
      // Timer updates could be stored in session state if needed
      console.log(`Timer updated: ${remainingSeconds} seconds remaining`);
    }
  };

  const timeUp = () => {
    // Auto-finish exam when time is up
    if (state.currentSession && !state.currentSession.completed) {
      dispatch({ type: "FINISH_EXAM" });
    }
  };

  const value: ExamContextValue = {
    state,
    startExam,
    answerQuestion,
    nextQuestion,
    previousQuestion,
    finishExam,
    resetExam,
    getCurrentQuestion,
    getProgress,
    getScore,
    updateTimer,
    timeUp,
  };

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

export function useExam() {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error("useExam must be used within an ExamProvider");
  }
  return context;
}
