"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useDatabase as useDBHook, useRealtimeSubscription } from "@/hooks/useDatabase";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/supabase";

interface DatabaseContextType {
  // Direct access to supabase client
  supabase: typeof supabase;

  // Database operations from useDatabase hook
  insertExamSession: ReturnType<typeof useDBHook>["insertExamSession"];
  updateExamSession: ReturnType<typeof useDBHook>["updateExamSession"];
  insertUserProgress: ReturnType<typeof useDBHook>["insertUserProgress"];
  getUserStatistics: ReturnType<typeof useDBHook>["getUserStatistics"];
  upsertUserStatistics: ReturnType<typeof useDBHook>["upsertUserStatistics"];
  getQuestions: ReturnType<typeof useDBHook>["getQuestions"];
  getExamSessions: ReturnType<typeof useDBHook>["getExamSessions"];
  getUserProgress: ReturnType<typeof useDBHook>["getUserProgress"];

  // Module progress helpers
  getModuleProgress: ReturnType<typeof useDBHook>["getModuleProgress"];
  upsertModuleProgress: ReturnType<typeof useDBHook>["upsertModuleProgress"];

  // Study progress helpers
  getStudyNeedsReviewMap: ReturnType<typeof useDBHook>["getStudyNeedsReviewMap"];
  getLastViewedSectionsMap: ReturnType<typeof useDBHook>["getLastViewedSectionsMap"];
  getUserStudyProgress: ReturnType<typeof useDBHook>["getUserStudyProgress"];
  upsertUserStudyProgress: ReturnType<typeof useDBHook>["upsertUserStudyProgress"];

  // Real-time subscription helper
  useRealtimeSubscription: typeof useRealtimeSubscription;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
}

interface DatabaseProviderProps {
  children: ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  // Get user from AuthContext and pass to database hook
  const { user } = useAuth();
  const dbOperations = useDBHook(user);

  const contextValue: DatabaseContextType = {
    supabase,
    ...dbOperations,
    useRealtimeSubscription,
  };

  return <DatabaseContext.Provider value={contextValue}>{children}</DatabaseContext.Provider>;
}

export type { DatabaseContextType };
