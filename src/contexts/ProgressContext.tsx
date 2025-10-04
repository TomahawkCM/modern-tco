"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/hooks/useDatabase";
import { TCODomain } from "@/types/exam";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from "react";

interface UserProgress {
  totalQuestions: number;
  correctAnswers: number;
  sessionCount: number;
  studyStreak: number;
  lastStudyDate: string | null;
  hoursStudied: number;
  averageScore: number;
  examReadiness: "Poor" | "Fair" | "Good" | "Excellent";
  domainScores: Record<
    TCODomain,
    {
      score: number;
      questionsAnswered: number;
      correctAnswers: number;
      timeSpent: number;
    }
  >;
  achievements: string[];
  weeklyGoal: number;
  weeklyProgress: number;
  timeSpent?: number; // Total time spent studying in minutes
  // Review-specific streak tracking (Phase 2)
  reviewStreak: number;
  lastReviewDate: string | null; // ISO date (YYYY-MM-DD)
  longestReviewStreak: number;
  // Additional properties that components expect
  moduleProgress?: Record<
    string,
    {
      questionsAttempted: number;
      questionsCorrect: number;
      accuracy: number;
      lastAttempt: Date;
    }
  >;
  assessmentScores?: Record<string, number>;
  streak?: number;
  recentSessions?: Array<{
    domain?: TCODomain;
    score: number; // 0-100
    questions: number;
    time: number; // seconds
    at: string; // iso
  }>;
}

interface ProgressState {
  progress: UserProgress;
  isLoading: boolean;
  error: string | null;
}

type ProgressAction =
  | { type: "LOAD_PROGRESS"; payload: UserProgress }
  | {
      type: "UPDATE_SESSION_STATS";
      payload: { score: number; questionsCount: number; timeSpent: number; domain?: TCODomain };
    }
  | { type: "UPDATE_STUDY_STREAK" }
  | { type: "UPDATE_REVIEW_STREAK"; payload: { current: number; longest: number } }
  | { type: "SET_WEEKLY_GOAL"; payload: number }
  | { type: "ADD_ACHIEVEMENT"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET_PROGRESS" };

interface ProgressContextType {
  state: ProgressState;
  updateSessionStats: (
    score: number,
    questionsCount: number,
    timeSpent: number,
    domain?: TCODomain
  ) => void;
  updateReviewStreak: (current: number, longest: number) => void;
  setWeeklyGoal: (goal: number) => void;
  getOverallStats: () => {
    totalQuestions: number;
    averageScore: number;
    studyStreak: number;
    hoursStudied: number;
    readinessLevel: string;
  };
  getDomainStats: () => Array<{
    domain: TCODomain;
    score: number;
    questionsAnswered: number;
    correctAnswers: number;
    timeSpent: number;
    percentage: number;
  }>;
  getWeeklyProgress: () => { current: number; goal: number; percentage: number };
  resetProgress: () => void;
}

const initialProgress: UserProgress = {
  totalQuestions: 0,
  correctAnswers: 0,
  sessionCount: 0,
  studyStreak: 0,
  lastStudyDate: null,
  hoursStudied: 0,
  averageScore: 0,
  examReadiness: "Poor",
  domainScores: {
    [TCODomain.ASKING_QUESTIONS]: {
      score: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      timeSpent: 0,
    },
    [TCODomain.REFINING_QUESTIONS]: {
      score: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      timeSpent: 0,
    },
    [TCODomain.REFINING_TARGETING]: {
      score: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      timeSpent: 0,
    },
    [TCODomain.TAKING_ACTION]: {
      score: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      timeSpent: 0,
    },
    [TCODomain.NAVIGATION_MODULES]: {
      score: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      timeSpent: 0,
    },
    [TCODomain.REPORTING_EXPORT]: {
      score: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      timeSpent: 0,
    },
    [TCODomain.SECURITY]: {
      score: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      timeSpent: 0,
    },
    [TCODomain.FUNDAMENTALS]: {
      score: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      timeSpent: 0,
    },
    [TCODomain.TROUBLESHOOTING]: {
      score: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      timeSpent: 0,
    },
  },
  achievements: [],
  weeklyGoal: 5,
  weeklyProgress: 0,
  timeSpent: 0,
  reviewStreak: 0,
  lastReviewDate: null,
  longestReviewStreak: 0,
  moduleProgress: {},
  assessmentScores: {},
  streak: 0,
  recentSessions: [],
};

const initialState: ProgressState = {
  progress: initialProgress,
  isLoading: false,
  error: null,
};

function progressReducer(state: ProgressState, action: ProgressAction): ProgressState {
  switch (action.type) {
    case "LOAD_PROGRESS":
      return {
        ...state,
        progress: action.payload,
        isLoading: false,
      };

    case "UPDATE_SESSION_STATS": {
      const { score, questionsCount, timeSpent, domain } = action.payload;
      const newTotalQuestions = state.progress.totalQuestions + questionsCount;
      const newCorrectAnswers =
        state.progress.correctAnswers + Math.round((score / 100) * questionsCount);
      const newAverageScore = Math.round((newCorrectAnswers / newTotalQuestions) * 100);
      const newHoursStudied = state.progress.hoursStudied + timeSpent / 3600; // Convert seconds to hours

      // Determine exam readiness based on average score
      let examReadiness: UserProgress["examReadiness"] = "Poor";
      if (newAverageScore >= 85) examReadiness = "Excellent";
      else if (newAverageScore >= 75) examReadiness = "Good";
      else if (newAverageScore >= 60) examReadiness = "Fair";

      const newProgress: UserProgress = {
        ...state.progress,
        totalQuestions: newTotalQuestions,
        correctAnswers: newCorrectAnswers,
        sessionCount: state.progress.sessionCount + 1,
        hoursStudied: newHoursStudied,
        averageScore: newAverageScore,
        examReadiness,
        weeklyProgress: state.progress.weeklyProgress + 1,
      };

      // Update domain-specific stats if domain is provided
      if (domain) {
        const currentDomainStats = state.progress.domainScores[domain];
        const domainCorrect = Math.round((score / 100) * questionsCount);
        const newDomainQuestions = currentDomainStats.questionsAnswered + questionsCount;
        const newDomainCorrect = currentDomainStats.correctAnswers + domainCorrect;
        const newDomainScore = Math.round((newDomainCorrect / newDomainQuestions) * 100);

        newProgress.domainScores[domain] = {
          score: newDomainScore,
          questionsAnswered: newDomainQuestions,
          correctAnswers: newDomainCorrect,
          timeSpent: currentDomainStats.timeSpent + timeSpent,
        };
      }

      // Track recent sessions (last 10)
      const sessionEntry = {
        domain,
        score,
        questions: questionsCount,
        time: timeSpent,
        at: new Date().toISOString(),
      };
      const nextRecent = [sessionEntry, ...(state.progress.recentSessions || [])].slice(0, 10);
      newProgress.recentSessions = nextRecent;

      return {
        ...state,
        progress: newProgress,
      };
    }

    case "UPDATE_STUDY_STREAK": {
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const { lastStudyDate } = state.progress;

      let newStreak = state.progress.studyStreak;

      if (lastStudyDate === yesterday) {
        newStreak += 1;
      } else if (lastStudyDate !== today) {
        newStreak = 1;
      }

      return {
        ...state,
        progress: {
          ...state.progress,
          studyStreak: newStreak,
          lastStudyDate: today,
        },
      };
    }

    case "UPDATE_REVIEW_STREAK": {
      const today = new Date().toISOString().split("T")[0];
      const { current, longest } = action.payload;

      return {
        ...state,
        progress: {
          ...state.progress,
          reviewStreak: current,
          longestReviewStreak: Math.max(state.progress.longestReviewStreak, longest),
          lastReviewDate: today,
        },
      };
    }

    case "SET_WEEKLY_GOAL":
      return {
        ...state,
        progress: {
          ...state.progress,
          weeklyGoal: action.payload,
        },
      };

    case "ADD_ACHIEVEMENT": {
      const achievements = [...state.progress.achievements];
      if (!achievements.includes(action.payload)) {
        achievements.push(action.payload);
      }

      return {
        ...state,
        progress: {
          ...state.progress,
          achievements,
        },
      };
    }

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case "RESET_PROGRESS":
      return {
        ...initialState,
        progress: { ...initialProgress },
      };

    default:
      return state;
  }
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(progressReducer, initialState);
  const { user } = useAuth();
  const db = useDatabase();
  const lastSavedProgressRef = useRef<string | null>(null);

  // Load progress from database when user is authenticated, fallback to localStorage
  useEffect(() => {
    const loadProgress = async () => {
      if (user) {
        try {
          // TODO: Load from Supabase when user_statistics table is available
          // For now, use initial progress
          dispatch({ type: "LOAD_PROGRESS", payload: initialProgress });
        } catch (error) {
          console.error("Failed to load progress from database:", error);
          // Fallback to localStorage
          loadFromLocalStorage();
        }
      } else {
        // Not authenticated, load from localStorage
        loadFromLocalStorage();
      }
    };

    const loadFromLocalStorage = () => {
      const savedProgress = localStorage.getItem("tco-progress");
      if (savedProgress) {
        try {
          const progress = JSON.parse(savedProgress);
          dispatch({ type: "LOAD_PROGRESS", payload: progress });
        } catch (error) {
          console.error("Failed to load progress from localStorage:", error);
          dispatch({ type: "LOAD_PROGRESS", payload: initialProgress });
        }
      } else {
        dispatch({ type: "LOAD_PROGRESS", payload: initialProgress });
      }
    };

    loadProgress();
  }, [user?.id]);

  // Save progress function with useCallback to prevent infinite loops
  const saveProgress = useCallback(
    async (progress: UserProgress) => {
      if (!state.isLoading && progress.totalQuestions > 0) {
        const progressString = JSON.stringify(progress);

        // Only save if progress has actually changed
        if (lastSavedProgressRef.current !== progressString) {
          lastSavedProgressRef.current = progressString;

          if (user) {
            try {
              // Save domain-specific statistics to database
              const domainEntries = Object.entries(progress.domainScores);

              for (const [domain, stats] of domainEntries) {
                if (stats.questionsAnswered > 0) {
                  await db.upsertUserStatistics({
                    category: domain,
                    total_questions: stats.questionsAnswered,
                    correct_answers: stats.correctAnswers,
                    accuracy_rate: stats.score,
                    average_time:
                      stats.questionsAnswered > 0 ? stats.timeSpent / stats.questionsAnswered : 0,
                  });
                }
              }
            } catch (error) {
              console.error("Failed to save progress to database:", error);
              // Fallback to localStorage
              localStorage.setItem("tco-progress", progressString);
            }
          } else {
            // Not authenticated, save to localStorage
            localStorage.setItem("tco-progress", progressString);
          }
        }
      }
    },
    [user?.id, db] // Added db to dependencies
  );

  // Save progress when specific values change - saveProgress excluded from dependencies (already memoized)
  useEffect(() => {
    saveProgress(state.progress);
  }, [
    state.progress.totalQuestions,
    state.progress.correctAnswers,
    state.progress.sessionCount,
    state.progress.studyStreak,
    state.progress.hoursStudied,
    state.progress.averageScore,
    state.progress.weeklyProgress,
    state.progress.achievements.length,
    state.progress.reviewStreak,
    state.progress.longestReviewStreak,
  ]);

  const updateSessionStats = (
    score: number,
    questionsCount: number,
    timeSpent: number,
    domain?: TCODomain
  ) => {
    dispatch({
      type: "UPDATE_SESSION_STATS",
      payload: { score, questionsCount, timeSpent, domain },
    });
    dispatch({ type: "UPDATE_STUDY_STREAK" });

    // Check for achievements
    if (score === 100) {
      dispatch({ type: "ADD_ACHIEVEMENT", payload: "Perfect Score" });
    }
    if (state.progress.studyStreak >= 7) {
      dispatch({ type: "ADD_ACHIEVEMENT", payload: "Week Warrior" });
    }
    if (state.progress.totalQuestions >= 100) {
      dispatch({ type: "ADD_ACHIEVEMENT", payload: "Centurion" });
    }
  };

  const setWeeklyGoal = (goal: number) => {
    dispatch({ type: "SET_WEEKLY_GOAL", payload: goal });
  };

  const updateReviewStreak = (current: number, longest: number) => {
    dispatch({ type: "UPDATE_REVIEW_STREAK", payload: { current, longest } });

    // Check for review streak achievements
    if (current >= 7) {
      dispatch({ type: "ADD_ACHIEVEMENT", payload: "Review Warrior - 7 Day Streak" });
    }
    if (current >= 30) {
      dispatch({ type: "ADD_ACHIEVEMENT", payload: "Review Master - 30 Day Streak" });
    }
    if (current >= 100) {
      dispatch({ type: "ADD_ACHIEVEMENT", payload: "Review Legend - 100 Day Streak" });
    }
  };

  const getOverallStats = useCallback(
    () => ({
      totalQuestions: state.progress.totalQuestions,
      averageScore: state.progress.averageScore,
      studyStreak: state.progress.studyStreak,
      hoursStudied: Math.round(state.progress.hoursStudied * 10) / 10,
      readinessLevel: state.progress.examReadiness,
    }),
    [
      state.progress.totalQuestions,
      state.progress.averageScore,
      state.progress.studyStreak,
      state.progress.hoursStudied,
      state.progress.examReadiness,
    ]
  );

  const getDomainStats = useCallback(() => {
    return Object.entries(state.progress.domainScores).map(([domain, stats]) => ({
      domain: domain as TCODomain,
      score: stats.score,
      questionsAnswered: stats.questionsAnswered,
      correctAnswers: stats.correctAnswers,
      timeSpent: stats.timeSpent,
      percentage:
        stats.questionsAnswered > 0
          ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100)
          : 0,
    }));
  }, [state.progress.domainScores]);

  const getWeeklyProgress = useCallback(
    () => ({
      current: state.progress.weeklyProgress,
      goal: state.progress.weeklyGoal,
      percentage: Math.round((state.progress.weeklyProgress / state.progress.weeklyGoal) * 100),
    }),
    [state.progress.weeklyProgress, state.progress.weeklyGoal]
  );

  const resetProgress = () => {
    localStorage.removeItem("tco-progress");
    lastSavedProgressRef.current = null;
    dispatch({ type: "RESET_PROGRESS" });
  };

  return (
    <ProgressContext.Provider
      value={{
        state,
        updateSessionStats,
        updateReviewStreak,
        setWeeklyGoal,
        getOverallStats,
        getDomainStats,
        getWeeklyProgress,
        resetProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextType {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
}
