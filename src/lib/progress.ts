import { ProgressService } from "@/lib/services/progress-service";
import { supabase } from "@/lib/supabase";
import type { ModuleProgress } from "@/types/progress";

/**
 * Fetch per-module progress for a specific user.
 * Falls back to 0% if no data is available yet.
 */
export async function getModuleProgress(
  userId: string,
  moduleId: string
): Promise<ModuleProgress> {
  try {
    // Prefer direct Supabase read for per-module progress
    const res: any = await (supabase as any)
      .from("user_module_progress")
      .select("completed_sections,total_sections,last_updated")
      .eq("user_id", userId)
      .eq("module_id", moduleId)
      .limit(1);

    const { data, error } = res;
    if (error) throw error;
    const row = (Array.isArray(data) ? data[0] : data) as
      | { completed_sections?: number | null; total_sections?: number | null; last_updated?: string | null }
      | null;

    if (row) {
      const completed = Number(row.completed_sections ?? 0);
      const total = Number(row.total_sections ?? 0);
      const percentage = total > 0 ? clamp01(completed / total) : 0;
      return {
        moduleId,
        percentage,
        completed,
        total,
        updatedAt: row.last_updated ? new Date(row.last_updated) : undefined,
      };
    }

    // Fallback to any alternate provider if available
    const svc = await ProgressService.getUserProgress(userId, moduleId);
    const percentage = normalizeToPercentage(svc);
    return {
      moduleId,
      percentage,
      completed: (svc as any)?.completedQuestions ?? undefined,
      total: (svc as any)?.totalQuestions ?? undefined,
      updatedAt: (svc as any)?.lastActivity ?? undefined,
    };
  } catch (error) {
    return { moduleId, percentage: 0 };
  }
}

function normalizeToPercentage(data: any): number {
  if (!data) return 0;
  if (typeof data.averageScore === "number") {
    // averageScore is typically 0.0 – 1.0
    return clamp01(data.averageScore);
  }
  const completed = Number(data.completedQuestions ?? data.questionsCompleted ?? 0);
  const total = Number(data.totalQuestions ?? data.questionsTotal ?? data.questionsAttempted ?? 0);
  if (total > 0) {
    return clamp01(completed / total);
  }
  return 0;
}

function clamp01(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

// Attempt history (lightweight placeholder wired to ProgressService)
export interface AttemptRecord {
  id: string;
  date: Date;
  type: string; // practice-test | mock-exam | module-quiz
  score?: number;
  questions?: number;
  durationSec?: number;
}

export async function getAttemptHistory(userId: string, limit: number = 10): Promise<AttemptRecord[]> {
  try {
    // Hook for future data: derive history from ProgressService analytics
    const analytics = await ProgressService.getLearningAnalytics(userId);
    // Placeholder: return empty until backend persists attempts
    void analytics; // silence unused
    return [];
  } catch (error) {
    return [];
  }
}
