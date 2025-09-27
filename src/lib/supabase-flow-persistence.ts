/**
 * Supabase Flow Progress Persistence Implementation
 * p5: Database persistence for Learn → Practice → Assess flow state
 */

import { supabase } from "@/lib/supabase";
import type {
  FlowProgressPersistence,
  LearningFlowContext,
  LearningFlowMetadata,
  LearningFlowState,
} from "@/types/learning-flow";
import type { StudyStatus, Tables, UserStudyProgressInsert } from "@/types/supabase"; // Import Tables

export class SupabaseFlowProgressPersistence implements FlowProgressPersistence {
  private offlineQueue: LearningFlowContext[] = [];
  private isOnline = typeof window !== "undefined" ? navigator.onLine : true;

  constructor() {
    if (typeof window !== "undefined") {
      // Listen for online/offline events
      window.addEventListener("online", this.handleOnline.bind(this));
      window.addEventListener("offline", this.handleOffline.bind(this));
    }
  }

  /**
   * Save learning flow context to Supabase
   */
  async save(context: LearningFlowContext): Promise<void> {
    if (!this.isOnline) {
      this.queueForSync(context);
      return;
    }

    try {
      const { error } = await supabase
        .from("user_study_progress")
        .upsert({
          user_id: context.userId,
          module_id: context.moduleId,
          status: context.currentState as StudyStatus, // Map LearningFlowState to StudyStatus
          created_at: context.startedAt.toISOString(),
          completed_at: context.completedAt?.toISOString() || null,
          time_spent_minutes: context.timeSpent, // Assuming timeSpent is in minutes
          // attempts, canProceed, and metadata are stringified into notes
          notes: JSON.stringify({
            attempts: context.attempts,
            canProceed: context.canProceed,
            metadata: context.metadata,
          }),
          updated_at: new Date().toISOString(),
        } as any)
        .eq("user_id", context.userId)
        .eq("module_id", context.moduleId);

      if (error) {
        this.queueForSync(context);
        throw new Error(`Failed to save learning flow progress: ${error.message}`);
      }
    } catch (error) {
      this.queueForSync(context);
      throw error;
    }
  }

  /**
   * Load learning flow context from Supabase
   */
  async load(moduleId: string, userId: string): Promise<LearningFlowContext | null> {
    if (!this.isOnline) {
      return this.loadFromOfflineQueue(moduleId, userId);
    }

    try {
      const { data, error } = await supabase
        .from("user_study_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("module_id", moduleId)
        .single();

      if (error) {
        if (error.code === "PGRST116" || error.details?.includes("0 rows")) {
          // No rows found - this is expected for new flows
          return null;
        }
        throw new Error(`Failed to load learning flow progress: ${error.message}`);
      }

      if (!data) return null; // Should be handled by PGRST116, but for safety

      const typedData = data as Tables<"user_study_progress">; // Explicitly cast data
      if (!typedData) {
        throw new Error("No user study progress found.");
      }

      // Parse notes back into attempts, canProceed, and metadata
      let parsedNotes: {
        attempts?: number;
        canProceed?: boolean;
        metadata?: LearningFlowMetadata;
      } = {};
      if (typedData.notes) {
        try {
          parsedNotes = JSON.parse(typedData.notes);
        } catch (parseError) {
          console.error("Failed to parse learning flow notes:", parseError);
        }
      }

      return {
        moduleId: typedData.module_id,
        userId: typedData.user_id,
        currentState: typedData.status as LearningFlowState, // Map StudyStatus to LearningFlowState
        startedAt: new Date(typedData.created_at),
        completedAt: typedData.completed_at ? new Date(typedData.completed_at) : undefined,
        timeSpent: typedData.time_spent_minutes || 0,
        attempts: parsedNotes.attempts || 0,
        canProceed: parsedNotes.canProceed || false,
        metadata: parsedNotes.metadata || {
          learnProgress: {
            sectionsViewed: [],
            totalSections: 0,
            timeSpent: 0,
            checkpointsPassed: [],
            keyPointsReviewed: [],
          },
          practiceProgress: {
            questionsAttempted: 0,
            questionsCorrect: 0,
            timeSpent: 0,
            topics: [],
            hintsUsed: 0,
          },
          assessProgress: { attempts: 0, bestScore: 0, lastScore: 0, timeSpent: 0, passed: false },
          telemetry: [],
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete learning flow context from Supabase
   */
  async delete(moduleId: string, userId: string): Promise<void> {
    if (!this.isOnline) {
      // Remove from offline queue if exists
      this.offlineQueue = this.offlineQueue.filter(
        (context) => !(context.moduleId === moduleId && context.userId === userId)
      );
      return;
    }

    try {
      const { error } = await supabase
        .from("user_study_progress")
        .delete()
        .eq("user_id", userId)
        .eq("module_id", moduleId);

      if (error) {
        throw new Error(`Failed to delete learning flow progress: ${error.message}`);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Queue context for offline sync
   */
  queueForSync(context: LearningFlowContext): void {
    // Remove existing entry for same module/user if exists
    this.offlineQueue = this.offlineQueue.filter(
      (queued) => !(queued.moduleId === context.moduleId && queued.userId === context.userId)
    );

    // Add to queue
    this.offlineQueue.push(context);

    // Persist to localStorage
    try {
      localStorage.setItem(
        "learning-flow-offline-queue",
        JSON.stringify(
          this.offlineQueue.map((ctx) => ({
            ...ctx,
            startedAt: ctx.startedAt.toISOString(),
            completedAt: ctx.completedAt?.toISOString(),
          }))
        )
      );
    } catch (error) {
      // Silently handle localStorage errors in production
    }
  }

  /**
   * Sync all pending offline progress
   */
  async syncPendingProgress(): Promise<void> {
    if (!this.isOnline || this.offlineQueue.length === 0) {
      return;
    }

    const pendingContexts = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const context of pendingContexts) {
      try {
        await this.save(context);
      } catch (error) {
        // Re-queue failed items
        this.queueForSync(context);
      }
    }

    // Clear localStorage queue on successful sync
    try {
      localStorage.removeItem("learning-flow-offline-queue");
    } catch (error) {
      // Silently handle localStorage errors in production
    }
  }

  /**
   * Load offline queue from localStorage on initialization
   */
  loadOfflineQueue(): void {
    try {
      const stored = localStorage.getItem("learning-flow-offline-queue");
      if (stored) {
        const parsed = JSON.parse(stored);
        this.offlineQueue = parsed.map((ctx: any) => ({
          ...ctx,
          startedAt: new Date(ctx.startedAt),
          completedAt: ctx.completedAt ? new Date(ctx.completedAt) : undefined,
        }));
      }
    } catch (error) {
      // Silently handle localStorage errors in production
    }
  }

  /**
   * Private helper methods
   */
  private handleOnline(): void {
    this.isOnline = true;
    // Attempt to sync pending progress
    this.syncPendingProgress().catch(() => {
      // Silently handle sync errors in production
    });
  }

  private handleOffline(): void {
    this.isOnline = false;
  }

  private loadFromOfflineQueue(moduleId: string, userId: string): LearningFlowContext | null {
    const queued = this.offlineQueue.find(
      (context) => context.moduleId === moduleId && context.userId === userId
    );
    return queued || null;
  }
}

/**
 * Default instance for use throughout the application
 */
export const defaultFlowPersistence = new SupabaseFlowProgressPersistence();

// Load offline queue on module initialization
if (typeof window !== "undefined") {
  defaultFlowPersistence.loadOfflineQueue();
}
