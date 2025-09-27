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
  useState,
  type ReactNode,
} from "react";
// import type { Tables } from "@/types/database.types";

interface IncorrectAnswer {
  id: string;
  questionId: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  domain: TCODomain;
  timestamp: Date;
  sessionId: string;
  reviewed: boolean;
  reviewCount: number;
  explanation?: string;
}

interface IncorrectAnswersState {
  answers: IncorrectAnswer[];
  isLoading: boolean;
  error: string | null;
}

type IncorrectAnswersAction =
  | { type: "LOAD_ANSWERS"; payload: IncorrectAnswer[] }
  | {
      type: "ADD_INCORRECT_ANSWER";
      payload: Omit<IncorrectAnswer, "id" | "timestamp" | "reviewed" | "reviewCount">;
    }
  | { type: "MARK_REVIEWED"; payload: string }
  | { type: "CLEAR_ANSWERS" }
  | { type: "REMOVE_ANSWER"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

interface IncorrectAnswersContextType {
  state: IncorrectAnswersState;
  addIncorrectAnswer: (
    answer: Omit<IncorrectAnswer, "id" | "timestamp" | "reviewed" | "reviewCount">
  ) => void;
  markAsReviewed: (answerId: string) => void;
  getAnswersByDomain: (domain: TCODomain) => IncorrectAnswer[];
  getUnreviewedCount: () => number;
  getRecentIncorrectAnswers: (limit?: number) => IncorrectAnswer[];
  clearAllAnswers: () => void;
  removeAnswer: (answerId: string) => void;
  getTotalIncorrectCount: () => number;
  getDomainStats: () => Record<TCODomain, { count: number; reviewed: number }>;
}

const MAX_INCORRECT_ANSWERS = 100;

const initialState: IncorrectAnswersState = {
  answers: [],
  isLoading: false,
  error: null,
};

function incorrectAnswersReducer(
  state: IncorrectAnswersState,
  action: IncorrectAnswersAction
): IncorrectAnswersState {
  switch (action.type) {
    case "LOAD_ANSWERS":
      return {
        ...state,
        answers: action.payload,
        isLoading: false,
      };

    case "ADD_INCORRECT_ANSWER": {
      const newAnswer: IncorrectAnswer = {
        ...action.payload,
        id: `incorrect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        reviewed: false,
        reviewCount: 0,
      };

      // Implement FIFO queue - keep only the most recent MAX_INCORRECT_ANSWERS
      let updatedAnswers = [newAnswer, ...state.answers];
      if (updatedAnswers.length > MAX_INCORRECT_ANSWERS) {
        updatedAnswers = updatedAnswers.slice(0, MAX_INCORRECT_ANSWERS);
      }

      return {
        ...state,
        answers: updatedAnswers,
      };
    }

    case "MARK_REVIEWED": {
      return {
        ...state,
        answers: state.answers.map((answer) =>
          answer.id === action.payload
            ? { ...answer, reviewed: true, reviewCount: answer.reviewCount + 1 }
            : answer
        ),
      };
    }

    case "REMOVE_ANSWER": {
      return {
        ...state,
        answers: state.answers.filter((answer) => answer.id !== action.payload),
      };
    }

    case "CLEAR_ANSWERS":
      return {
        ...state,
        answers: [],
      };

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

    default:
      return state;
  }
}

const IncorrectAnswersContext = createContext<IncorrectAnswersContextType | undefined>(undefined);

export function IncorrectAnswersProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(incorrectAnswersReducer, initialState);
  const { user } = useAuth();
  const db = useDatabase(user);
  const [dbInitialized, setDbInitialized] = useState(false);

  // Load incorrect answers from database or localStorage on mount
  useEffect(() => {
    // Simple localStorage loading for now - debug server startup issues
    dispatch({ type: "SET_LOADING", payload: true });
    
    try {
      const savedAnswers = localStorage.getItem("tco-incorrect-answers");
      console.log("Loading from localStorage:", savedAnswers ? `${JSON.parse(savedAnswers).length} answers` : "no data");
      
      if (savedAnswers) {
        const answers = JSON.parse(savedAnswers).map((answer: any) => ({
          ...answer,
          timestamp: new Date(answer.timestamp),
        }));
        console.log("Parsed answers:", answers.length);
        dispatch({ type: "LOAD_ANSWERS", payload: answers });
      } else {
        console.log("No saved answers found");
        dispatch({ type: "LOAD_ANSWERS", payload: [] });
      }
    } catch (error) {
      console.error("Failed to load incorrect answers from localStorage:", error);
      dispatch({ type: "LOAD_ANSWERS", payload: [] });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Save incorrect answers to localStorage whenever they change (fallback only)
  useEffect(() => {
    if (!state.isLoading && !user) {
      // Simple debounced save to prevent excessive localStorage writes
      const timeoutId = setTimeout(() => {
        localStorage.setItem("tco-incorrect-answers", JSON.stringify(state.answers));
      }, 200);

      return () => clearTimeout(timeoutId);
    }
  }, [state.answers, state.isLoading, user]);

  const addIncorrectAnswer = useCallback(
    async (answer: Omit<IncorrectAnswer, "id" | "timestamp" | "reviewed" | "reviewCount">) => {
      const newAnswer: IncorrectAnswer = {
        ...answer,
        id: `incorrect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        reviewed: false,
        reviewCount: 0,
      };

      // Add to local state immediately
      dispatch({ type: "ADD_INCORRECT_ANSWER", payload: answer });

      // Save to database if authenticated
      if (user) {
        try {
          // TODO: Implement incorrect answers database insert when table is available
          // const { error } = await db.supabase.from("incorrect_answers").insert({...});
          const error = null; // Placeholder

          if (error) {
            console.error("Failed to save incorrect answer to database:", error);
            // Still keep in local state even if database save fails
          }
        } catch (error) {
          console.error("Error saving incorrect answer:", error);
        }
      } else {
        // Save to localStorage if not authenticated
        localStorage.setItem("tco-incorrect-answers", JSON.stringify(state.answers));
      }
    },
    [user?.id]
  );

  const markAsReviewed = useCallback(
    async (answerId: string) => {
      dispatch({ type: "MARK_REVIEWED", payload: answerId });

      // Update in database if authenticated
      if (user) {
        try {
          // TODO: Implement incorrect answers database update when table is available
          // const { error } = await db.supabase.from("incorrect_answers").update({...});
          const error = null; // Placeholder

          if (error) {
            console.error("Failed to update review status in database:", error);
          }
        } catch (error) {
          console.error("Error updating review status:", error);
        }
      }
    },
    [user?.id]
  );

  const getAnswersByDomain = (domain: TCODomain): IncorrectAnswer[] => {
    return state.answers.filter((answer) => answer.domain === domain);
  };

  const getUnreviewedCount = (): number => {
    return state.answers.filter((answer) => !answer.reviewed).length;
  };

  const getRecentIncorrectAnswers = useCallback(
    (limit: number = 10): IncorrectAnswer[] => {
      return state.answers
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
    },
    [state.answers]
  );

  const clearAllAnswers = useCallback(async () => {
    dispatch({ type: "CLEAR_ANSWERS" });

    if (user) {
      try {
        // TODO: Implement incorrect answers database delete when table is available
        // const { error } = await db.supabase.from("incorrect_answers").delete().eq("user_id", user.id);
        const error = null; // Placeholder

        if (error) {
          console.error("Failed to clear incorrect answers from database:", error);
        }
      } catch (error) {
        console.error("Error clearing incorrect answers:", error);
      }
    } else {
      localStorage.removeItem("tco-incorrect-answers");
    }
  }, [user?.id]);

  const removeAnswer = useCallback(
    async (answerId: string) => {
      dispatch({ type: "REMOVE_ANSWER", payload: answerId });

      if (user) {
        try {
          // TODO: Implement incorrect answers database delete when table is available
          // const { error } = await db.supabase.from("incorrect_answers").delete().eq("id", answerId).eq("user_id", user.id);
          const error = null; // Placeholder

          if (error) {
            console.error("Failed to remove incorrect answer from database:", error);
          }
        } catch (error) {
          console.error("Error removing incorrect answer:", error);
        }
      } else {
        // Update localStorage if not authenticated
        localStorage.setItem("tco-incorrect-answers", JSON.stringify(state.answers));
      }
    },
    [user?.id]
  );

  const getTotalIncorrectCount = (): number => {
    return state.answers.length;
  };

  const getDomainStats = (): Record<TCODomain, { count: number; reviewed: number }> => {
    const stats = {} as Record<TCODomain, { count: number; reviewed: number }>;

    // Initialize all domains
    Object.values(TCODomain).forEach((domain) => {
      stats[domain] = { count: 0, reviewed: 0 };
    });

    // Count answers by domain
    state.answers.forEach((answer) => {
      stats[answer.domain].count++;
      if (answer.reviewed) {
        stats[answer.domain].reviewed++;
      }
    });

    return stats;
  };

  return (
    <IncorrectAnswersContext.Provider
      value={{
        state,
        addIncorrectAnswer,
        markAsReviewed,
        getAnswersByDomain,
        getUnreviewedCount,
        getRecentIncorrectAnswers,
        clearAllAnswers,
        removeAnswer,
        getTotalIncorrectCount,
        getDomainStats,
      }}
    >
      {children}
    </IncorrectAnswersContext.Provider>
  );
}

export function useIncorrectAnswers() {
  const context = useContext(IncorrectAnswersContext);
  if (context === undefined) {
    throw new Error("useIncorrectAnswers must be used within an IncorrectAnswersProvider");
  }
  return context;
}
