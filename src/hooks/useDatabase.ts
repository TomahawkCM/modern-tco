import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database.types";
import type { User } from "@supabase/supabase-js";

type Tables = Database["public"]["Tables"];
type ExamSession = Tables["exam_sessions"]["Row"];
type UserProgress = Tables["user_progress"]["Row"];
type UserStatistics = Tables["user_statistics"]["Row"];
type Question = Tables["questions"]["Row"];

// Generic database hook for common operations
export function useDatabase(user?: User | null) {
  const userId = user?.id;

  const insertExamSession = useCallback(
    async (sessionData: Omit<Tables["exam_sessions"]["Insert"], "user_id">) => {
      if (!user) throw new Error("User not authenticated");

      const res: any = await supabase
        .from("exam_sessions")
        .insert({
          ...sessionData,
          user_id: user.id,
        } as any)
        .select()
        .single();

      const { data, error } = res;
      if (error) throw error;
      return data ?? null;
    },
    [userId, user]
  );

  const updateExamSession = useCallback(
    async (sessionId: string, updates: Tables["exam_sessions"]["Update"]) => {
      if (!user) throw new Error("User not authenticated");

      const res: any = await (supabase as any)
        .from("exam_sessions")
        .update(updates as any)
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .select()
        .single();

      const { data, error } = res;
      if (error) throw error;
      return data ?? null;
    },
    [userId, user]
  );

  const insertUserProgress = useCallback(
    async (progressData: Omit<Tables["user_progress"]["Insert"], "user_id">) => {
      if (!user) throw new Error("User not authenticated");

      const res: any = await supabase
        .from("user_progress")
        .insert({
          ...progressData,
          user_id: user.id,
        } as any)
        .select()
        .single();

      const { data, error } = res;
      if (error) throw error;
      return data ?? null;
    },
    [userId, user]
  );

  const getUserStatistics = useCallback(async () => {
    if (!user) throw new Error("User not authenticated");

    const res: any = await supabase
      .from("user_statistics")
      .select("*")
      .eq("user_id", user.id);

    const { data, error } = res;
    if (error) throw error;
    return data ?? [];
  }, [userId, user]);

  const upsertUserStatistics = useCallback(
    async (statsData: Omit<Tables["user_statistics"]["Insert"], "user_id">) => {
      if (!user) throw new Error("User not authenticated");

      const res: any = await supabase
        .from("user_statistics")
        .upsert({
          ...statsData,
          user_id: user.id,
        } as any)
        .select()
        .single();

      const { data, error } = res;
      if (error) throw error;
      return data ?? null;
    },
    [userId, user]
  );

  const getQuestions = useCallback(
    async (filters?: {
      category?: string;
      difficulty?: "beginner" | "intermediate" | "advanced";
      tags?: string[];
      limit?: number;
    }) => {
  let query: any = supabase.from("questions").select("*");

      if (filters?.category) {
        query = query.eq("category", filters.category);
      }

      if (filters?.difficulty) {
        query = query.eq("difficulty", filters.difficulty);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains("tags", filters.tags);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

  const res: any = await query;
  const { data, error } = res;
  if (error) throw error;
  return data ?? [];
    },
    []
  );

  const getExamSessions = useCallback(async () => {
    if (!user) throw new Error("User not authenticated");

    const res: any = await supabase
      .from("exam_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false });

    const { data, error } = res;
    if (error) throw error;
    return data ?? [];
  }, [userId, user]);

  const getUserProgress = useCallback(
    async (examSessionId?: string) => {
      if (!user) throw new Error("User not authenticated");

      let query: any = supabase
        .from("user_progress")
        .select(
          `
        *,
        questions (
          id,
          question,
          options,
          correct_answer,
          explanation,
          category,
          difficulty
        )
      `
        )
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });

      if (examSessionId) {
        query = query.eq("exam_session_id", examSessionId);
      }

  const res: any = await query;
  const { data, error } = res;
  if (error) throw error;
  return data ?? [];
    },
    [userId, user]
  );

  return {
    insertExamSession,
    updateExamSession,
    insertUserProgress,
    getUserStatistics,
    upsertUserStatistics,
    getQuestions,
    getExamSessions,
    getUserProgress,
    getModuleProgress: async (moduleIds: string[] = []) => {
      if (!user) throw new Error("User not authenticated");
      let query: any = supabase
        .from("user_module_progress")
        .select("*")
        .eq("user_id", user.id);

      if (moduleIds.length > 0) {
        query = query.in("module_id", moduleIds);
      }

      const res: any = await query;
      const { data, error } = res;
      if (error) throw error;
      return data ?? [];
    },
    getStudyNeedsReviewMap: async (moduleIds: string[] = []) => {
      if (!user) throw new Error("User not authenticated");
      let query: any = supabase
        .from("user_study_progress")
        .select("module_id,status")
        .eq("user_id", user.id)
        .eq("status", "needs_review");
      if (moduleIds.length > 0) query = query.in("module_id", moduleIds);
      const res: any = await query;
      const { data, error } = res;
      if (error) throw error;
      const map: Record<string, number> = {};
      for (const row of (data ?? []) as any[]) {
        const id = row.module_id as string;
        map[id] = (map[id] || 0) + 1;
      }
      return map;
    },
    getLastViewedSectionsMap: async (moduleIds: string[] = []) => {
      if (!user) throw new Error("User not authenticated");
      let query: any = supabase
        .from("user_study_progress")
        .select("module_id,section_id,updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (moduleIds.length > 0) query = query.in("module_id", moduleIds);
      const res: any = await query;
      const { data, error } = res;
      if (error) throw error;
      const map: Record<string, string> = {};
      for (const row of (data ?? []) as any[]) {
        const mid = row.module_id as string;
        const sid = row.section_id as string | null;
        if (sid && !map[mid]) map[mid] = sid;
      }
      return map;
    },
    getUserStudyProgress: async (moduleId?: string) => {
      if (!user) throw new Error("User not authenticated");
      let query: any = supabase
        .from("user_study_progress")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (moduleId) query = query.eq("module_id", moduleId);
      const res: any = await query;
      const { data, error } = res;
      if (error) throw error;
      return data ?? [];
    },
    upsertUserStudyProgress: async (p: {
      module_id: string;
      section_id?: string | null;
      status: "not_started" | "in_progress" | "completed" | "needs_review";
      time_spent_minutes?: number;
      notes?: string | null;
    }) => {
      if (!user) throw new Error("User not authenticated");
      const row: any = {
        user_id: user.id,
        module_id: p.module_id,
        section_id: p.section_id ?? null,
        status: p.status,
        time_spent_minutes: p.time_spent_minutes ?? 0,
        notes: p.notes ?? null,
        completed_at: p.status === 'completed' ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const res: any = await supabase.from("user_study_progress").insert(row).select().single();
      const { data, error } = res;
      if (error) throw error;
      return data ?? null;
    },
    upsertModuleProgress: async (
      progress: {
        module_id: string;
        completed_sections?: number;
        total_sections?: number;
        status?: "not_started" | "in_progress" | "completed" | "bookmarked";
      }
    ) => {
      if (!user) throw new Error("User not authenticated");

      const res: any = await supabase
        .from("user_module_progress")
        .upsert({
          user_id: user.id,
          module_id: progress.module_id,
          completed_sections: progress.completed_sections ?? null,
          total_sections: progress.total_sections ?? null,
          status: progress.status ?? null,
          last_updated: new Date().toISOString(),
        } as any)
        .select()
        .single();

      const { data, error } = res;
      if (error) throw error;
      return data ?? null;
    },
  };
}

// Hook for real-time subscriptions
export function useRealtimeSubscription<T = any>(
  table: keyof Database["public"]["Tables"],
  filter?: string,
  callback?: (payload: any) => void
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let subscription: any;

    const setupSubscription = async () => {
      try {
        // Initial data fetch
        let query = supabase.from(table).select("*");

        if (filter) {
          // Parse filter - expecting format like "user_id=eq.{userId}"
          const [column, operator, value] = filter.split(/[=.]/);
          if (operator === "eq") {
            query = query.eq(column, value);
          }
        }

        const { data: initialData, error: fetchError } = await query;

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setData(((initialData ?? []) as unknown) as T[]);
        }

        // Set up real-time subscription
        subscription = supabase
          .channel(`${table}_changes`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: table as string,
              filter,
            },
            (payload) => {
              if (callback) {
                callback(payload);
              }

              // Update local data based on event type
              setData((current) => {
                switch (payload.eventType) {
                  case "INSERT":
                    return [...current, (payload.new as unknown) as T];
                  case "UPDATE":
                    return current.map((item) =>
                      (item as any).id === (payload.new as any).id
                        ? ((payload.new as unknown) as T)
                        : item
                    );
                  case "DELETE":
                    return current.filter((item) => (item as any).id !== (payload.old as any).id);
                  default:
                    return current;
                }
              });
            }
          )
          .subscribe();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    void setupSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [table, filter, callback]);

  return { data, loading, error };
}
