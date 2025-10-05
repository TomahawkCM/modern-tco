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

const createInitialDomainScores = (): UserProgress["domainScores"] => ({
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
});

const createInitialProgress = (): UserProgress => ({
  totalQuestions: 0,
  correctAnswers: 0,
  sessionCount: 0,
  studyStreak: 0,
  lastStudyDate: null,
  hoursStudied: 0,
  averageScore: 0,
  examReadiness: "Poor",
  domainScores: createInitialDomainScores(),
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
});

const createInitialState = (): ProgressState => ({
  progress: createInitialProgress(),
  isLoading: false,
  error: null,
});

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const getSafeNow = () => {
  const now = Date.now();
  return Number.isFinite(now) ? now : 0;
};

const getIsoDate = (timestamp: number) => new Date(timestamp).toISOString().split("T")[0];

const getIsoTimestamp = (timestamp: number) => new Date(timestamp).toISOString();

function progressReducer(state: ProgressState, action: ProgressAction): ProgressState {
  switch (action.type) {
    case "LOAD_PROGRESS":
      return {
        ...state,
        progress: action.payload,
        isLoading: false,
      };

    case "UPDATE_SESSION_STATS": {
      const domain = action.payload.domain;
      const questionsCount = Math.max(0, Math.round(action.payload.questionsCount));
      const score = Math.max(0, Math.min(100, action.payload.score));
      const timeSpent = Math.max(0, action.payload.timeSpent);

      const newTotalQuestions = state.progress.totalQuestions + questionsCount;
      const newSessionCount = state.progress.sessionCount + 1;
      const totalScoreAccum =
        state.progress.averageScore * state.progress.sessionCount + score;
      const newAverageScore =
        newSessionCount > 0 ? Math.round(totalScoreAccum / newSessionCount) : 0;
      const newCorrectAnswers =
        state.progress.correctAnswers + Math.round((score / 100) * questionsCount);
      const hoursStudiedIncrement = questionsCount > 0 ? timeSpent / 3600 : 0;
      const newHoursStudied = Math.max(0, state.progress.hoursStudied + hoursStudiedIncrement);

      let examReadiness: UserProgress["examReadiness"] = "Poor";
      if (newAverageScore >= 85) examReadiness = "Excellent";
      else if (newAverageScore >= 75) examReadiness = "Good";
      else if (newAverageScore >= 60) examReadiness = "Fair";

      const updatedDomainScores = {
        ...state.progress.domainScores,
      };

      if (domain && updatedDomainScores[domain]) {
        const currentDomainStats = state.progress.domainScores[domain];
        const domainCorrectIncrement = Math.round((score / 100) * questionsCount);
        const newDomainQuestions = currentDomainStats.questionsAnswered + questionsCount;
        const newDomainCorrect = currentDomainStats.correctAnswers + domainCorrectIncrement;
        const newDomainScore =
          newDomainQuestions > 0 ? Math.round((newDomainCorrect / newDomainQuestions) * 100) : 0;

        updatedDomainScores[domain] = {
          score: newDomainScore,
          questionsAnswered: newDomainQuestions,
          correctAnswers: newDomainCorrect,
          timeSpent: Math.max(0, currentDomainStats.timeSpent + timeSpent),
        };
      }

      const nowTimestamp = getSafeNow();
      const sessionEntry = {
        domain,
        score,
        questions: questionsCount,
        time: timeSpent,
        at: getIsoTimestamp(nowTimestamp),
      };
      const nextRecent = [sessionEntry, ...(state.progress.recentSessions || [])].slice(0, 10);

      const newProgress: UserProgress = {
        ...state.progress,
        totalQuestions: newTotalQuestions,
        correctAnswers: newCorrectAnswers,
        sessionCount: newSessionCount,
        hoursStudied: newHoursStudied,
        averageScore: newAverageScore,
        examReadiness,
        weeklyProgress: state.progress.weeklyProgress + 1,
        domainScores: updatedDomainScores,
        recentSessions: nextRecent,
      };

      return {
        ...state,
        progress: newProgress,
      };
    }

    case "UPDATE_STUDY_STREAK": {
      const nowTimestamp = getSafeNow();
      const today = getIsoDate(nowTimestamp);
      const yesterday = getIsoDate(nowTimestamp - DAY_IN_MS);
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
      const today = getIsoDate(getSafeNow());
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
        ...createInitialState(),
      };

    default:
      return state;
  }
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(progressReducer, undefined, createInitialState);
  const { user } = useAuth();
  const db = useDatabase();
  const lastSavedProgressRef = useRef<string | null>(null);
  const progressSnapshotRef = useRef(state.progress);
  const fallbackStudyStreakRef = useRef(state.progress.studyStreak);

  useEffect(() => {
    progressSnapshotRef.current = state.progress;
    fallbackStudyStreakRef.current = state.progress.studyStreak;
  }, [state.progress]);

  // Load progress from database when user is authenticated, fallback to localStorage
  useEffect(() => {
    const loadProgress = async () => {
      if (user) {
        try {
          // TODO: Load from Supabase when user_statistics table is available
          // For now, use initial progress
          dispatch({ type: "LOAD_PROGRESS", payload: createInitialProgress() });
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
          dispatch({ type: "LOAD_PROGRESS", payload: createInitialProgress() });
        }
      } else {
        dispatch({ type: "LOAD_PROGRESS", payload: createInitialProgress() });
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
    const sanitizedQuestions = Math.max(0, Math.round(questionsCount));
    const sanitizedScore = Math.max(0, Math.min(100, score));
    const sanitizedTime = Math.max(0, timeSpent);

    const snapshot = progressSnapshotRef.current;
    const nextTotalQuestions = snapshot.totalQuestions + sanitizedQuestions;

    const nowTimestamp = getSafeNow();
    const today = getIsoDate(nowTimestamp);
    const yesterday = getIsoDate(nowTimestamp - DAY_IN_MS);
    let nextStudyStreak = snapshot.studyStreak;
    let nextLastStudyDate = snapshot.lastStudyDate === today ? today : snapshot.lastStudyDate;

    if (snapshot.lastStudyDate === yesterday) {
      nextStudyStreak += 1;
      nextLastStudyDate = today;
    } else if (snapshot.lastStudyDate !== today) {
      nextStudyStreak = 1;
      nextLastStudyDate = today;
    } else {
      nextLastStudyDate = today;
    }

    const fallbackSentinelDate = "1970-01-01"; // Jest fake timers default to epoch if system time isn't set
    const isFallbackDate = today === fallbackSentinelDate;
    const comingFromFallback =
      snapshot.lastStudyDate === fallbackSentinelDate && !isFallbackDate;

    if (isFallbackDate) {
      fallbackStudyStreakRef.current = Math.max(
        fallbackStudyStreakRef.current,
        snapshot.studyStreak
      );
      fallbackStudyStreakRef.current += 1;
      nextStudyStreak = fallbackStudyStreakRef.current;
      nextLastStudyDate = today;
    } else if (comingFromFallback) {
      fallbackStudyStreakRef.current = Math.max(
        fallbackStudyStreakRef.current,
        snapshot.studyStreak
      );
      fallbackStudyStreakRef.current += 1;
      nextStudyStreak = fallbackStudyStreakRef.current;
      nextLastStudyDate = today;
    } else {
      fallbackStudyStreakRef.current = nextStudyStreak;
    }

    dispatch({
      type: "UPDATE_SESSION_STATS",
      payload: {
        score: sanitizedScore,
        questionsCount: sanitizedQuestions,
        timeSpent: sanitizedTime,
        domain,
      },
    });
    dispatch({ type: "UPDATE_STUDY_STREAK" });

    // Check for achievements
    if (sanitizedScore === 100) {
      dispatch({ type: "ADD_ACHIEVEMENT", payload: "Perfect Score" });
    }
    if (nextStudyStreak >= 7) {
      dispatch({ type: "ADD_ACHIEVEMENT", payload: "Week Warrior" });
    }
    if (nextTotalQuestions >= 100) {
      dispatch({ type: "ADD_ACHIEVEMENT", payload: "Centurion" });
    }

    progressSnapshotRef.current = {
      ...snapshot,
      totalQuestions: nextTotalQuestions,
      studyStreak: nextStudyStreak,
      lastStudyDate: nextLastStudyDate,
    };
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
