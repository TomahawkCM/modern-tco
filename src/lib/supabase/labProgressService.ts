/**
 * Supabase Lab Progress Service
 * Handles lab completion tracking, progress analytics, and achievement system
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for lab progress tracking
export interface LabProgress {
  id: string;
  user_id: string;
  lab_id: string;
  lab_title: string;
  domain: string;
  started_at: string;
  completed_at?: string;
  current_step: number;
  total_steps: number;
  completion_time_seconds?: number;
  score?: number;
  attempts: number;
  hints_used: number;
  validation_failures: number;
  created_at: string;
  updated_at: string;
}

export interface LabStep {
  id: string;
  lab_progress_id: string;
  step_number: number;
  step_title: string;
  completed_at?: string;
  validation_attempts: number;
  hint_used: boolean;
  user_input?: string;
  created_at: string;
}

export interface LabAchievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_title: string;
  description: string;
  earned_at: string;
  lab_id?: string;
  metadata: Record<string, any>;
}

class LabProgressService {
  /**
   * Start a new lab session
   */
  async startLab(
    userId: string,
    labId: string,
    labTitle: string,
    domain: string,
    totalSteps: number
  ): Promise<LabProgress> {
    const { data, error } = await (supabase as any)
      .from("lab_progress")
      .insert({
        user_id: userId,
        lab_id: labId,
        lab_title: labTitle,
        domain,
        started_at: new Date().toISOString(),
        current_step: 0,
        total_steps: totalSteps,
        attempts: 1,
        hints_used: 0,
        validation_failures: 0,
      } as any)
      .select()
      .single();

    if (error) {
      console.error("Error starting lab:", error);
      throw error;
    }

    return data;
  }

  /**
   * Update lab progress when a step is completed
   */
  async completeStep(
    labProgressId: string,
    stepNumber: number,
    stepTitle: string,
    validationAttempts: number = 1,
    hintUsed: boolean = false,
    userInput?: string
  ): Promise<void> {
    try {
      // Create step record
      const { error: stepError } = await (supabase as any).from("lab_steps").insert({
        lab_progress_id: labProgressId,
        step_number: stepNumber,
        step_title: stepTitle,
        completed_at: new Date().toISOString(),
        validation_attempts: validationAttempts,
        hint_used: hintUsed,
        user_input: userInput,
      } as any);

      if (stepError) {
        console.error("Error creating step record:", stepError);
        throw stepError;
      }

      // Fetch current lab progress to perform atomic increment
      const { data: currentProgress, error: fetchError } = await (supabase as any)
        .from("lab_progress")
        .select("hints_used, validation_failures")
        .eq("id", labProgressId)
        .single();

      if (fetchError) {
        console.error("Error fetching current lab progress:", fetchError);
        throw fetchError;
      }

      const newHintsUsed = currentProgress.hints_used + (hintUsed ? 1 : 0);
      const newValidationFailures =
        currentProgress.validation_failures + (validationAttempts > 1 ? validationAttempts - 1 : 0);

      // Update lab progress
      const { error: progressError } = await (supabase as any)
        .from("lab_progress")
        .update({
          current_step: stepNumber + 1,
          hints_used: newHintsUsed,
          validation_failures: newValidationFailures,
          updated_at: new Date().toISOString(),
        } as any)
        .eq("id", labProgressId);

      if (progressError) {
        console.error("Error updating lab progress:", progressError);
        throw progressError;
      }
    } catch (error) {
      console.error("Error completing step:", error);
      throw error;
    }
  }

  /**
   * Complete entire lab session
   */
  async completeLab(
    labProgressId: string,
    score: number,
    completionTimeSeconds: number
  ): Promise<void> {
    const { data, error } = await (supabase as any)
      .from("lab_progress")
      .update({
        completed_at: new Date().toISOString(),
        score,
        completion_time_seconds: completionTimeSeconds,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("id", labProgressId)
      .select()
      .single();

    if (error) {
      console.error("Error completing lab:", error);
      throw error;
    }

    // Check for achievements
    await this.checkAndAwardAchievements(data);
  }

  /**
   * Get user's lab progress history
   */
  async getUserLabHistory(userId: string): Promise<LabProgress[]> {
    const { data, error } = await supabase
      .from("lab_progress")
      .select("*")
      .eq("user_id", userId)
      .order("started_at", { ascending: false });

    if (error) {
      console.error("Error fetching lab history:", error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get lab statistics for analytics
   */
  async getLabStatistics(userId: string): Promise<{
    totalLabs: number;
    completedLabs: number;
    averageScore: number;
    averageCompletionTime: number;
    totalHintsUsed: number;
    domainStats: Record<string, any>;
  }> {
    const { data, error } = await supabase.from("lab_progress").select("*").eq("user_id", userId);

    if (error) {
      console.error("Error fetching lab statistics:", error);
      throw error;
    }

    const labs = data || [];
    const completedLabs = labs.filter((lab) => lab.completed_at);

    const statistics = {
      totalLabs: labs.length,
      completedLabs: completedLabs.length,
      averageScore:
        completedLabs.length > 0
          ? completedLabs.reduce((sum, lab) => sum + (lab.score || 0), 0) / completedLabs.length
          : 0,
      averageCompletionTime:
        completedLabs.length > 0
          ? completedLabs.reduce((sum, lab) => sum + (lab.completion_time_seconds || 0), 0) /
            completedLabs.length
          : 0,
      totalHintsUsed: labs.reduce((sum, lab) => sum + (lab.hints_used || 0), 0),
      domainStats: this.calculateDomainStats(labs),
    };

    return statistics;
  }

  /**
   * Calculate domain-specific statistics
   */
  private calculateDomainStats(labs: LabProgress[]): Record<string, any> {
    const domainGroups = labs.reduce(
      (acc, lab) => {
        if (!acc[lab.domain]) {
          acc[lab.domain] = [];
        }
        acc[lab.domain].push(lab);
        return acc;
      },
      {} as Record<string, LabProgress[]>
    );

    const domainStats: Record<string, any> = {};

    for (const [domain, domainLabs] of Object.entries(domainGroups)) {
      const completed = domainLabs.filter((lab) => lab.completed_at);
      domainStats[domain] = {
        total: domainLabs.length,
        completed: completed.length,
        completionRate: domainLabs.length > 0 ? completed.length / domainLabs.length : 0,
        averageScore:
          completed.length > 0
            ? completed.reduce((sum, lab) => sum + (lab.score || 0), 0) / completed.length
            : 0,
        averageTime:
          completed.length > 0
            ? completed.reduce((sum, lab) => sum + (lab.completion_time_seconds || 0), 0) /
              completed.length
            : 0,
      };
    }

    return domainStats;
  }

  /**
   * Check for and award achievements
   */
  private async checkAndAwardAchievements(labProgress: LabProgress): Promise<void> {
    const userId = labProgress.user_id;
    const achievements: Partial<LabAchievement>[] = [];

    // Perfect Score Achievement
    if (labProgress.score === 100) {
      achievements.push({
        user_id: userId,
        achievement_type: "perfect_score",
        achievement_title: "Perfect Lab Execution",
        description: `Completed ${labProgress.lab_title} with 100% accuracy`,
        lab_id: labProgress.lab_id,
        metadata: {
          labTitle: labProgress.lab_title,
          domain: labProgress.domain,
          completionTime: labProgress.completion_time_seconds,
        },
      });
    }

    // Speed Demon Achievement (completed in under estimated time)
    const estimatedTimes = {
      "LAB-AQ-001": 12 * 60, // 12 minutes in seconds
      "LAB-RQ-001": 15 * 60, // 15 minutes in seconds
      // Add more lab time estimates
    };

    const estimatedTime = estimatedTimes[labProgress.lab_id as keyof typeof estimatedTimes];
    if (
      estimatedTime &&
      labProgress.completion_time_seconds &&
      labProgress.completion_time_seconds < estimatedTime
    ) {
      achievements.push({
        user_id: userId,
        achievement_type: "speed_demon",
        achievement_title: "Speed Demon",
        description: `Completed ${labProgress.lab_title} faster than estimated time`,
        lab_id: labProgress.lab_id,
        metadata: {
          estimatedTime,
          actualTime: labProgress.completion_time_seconds,
          timeSaved: estimatedTime - labProgress.completion_time_seconds,
        },
      });
    }

    // No Hints Achievement
    if (labProgress.hints_used === 0) {
      achievements.push({
        user_id: userId,
        achievement_type: "no_hints",
        achievement_title: "Independent Learner",
        description: `Completed ${labProgress.lab_title} without using any hints`,
        lab_id: labProgress.lab_id,
        metadata: {
          labTitle: labProgress.lab_title,
          domain: labProgress.domain,
        },
      });
    }

    // Insert achievements
    if (achievements.length > 0) {
      const achievementsWithTimestamp = achievements.map((achievement) => ({
        ...achievement,
        earned_at: new Date().toISOString(),
      }));

  const { error } = await (supabase as any).from("lab_achievements").insert(achievementsWithTimestamp as any);

      if (error) {
        console.error("Error awarding achievements:", error);
        // Don't throw error for achievements - lab completion should still succeed
      }
    }
  }

  /**
   * Get user achievements
   */
  async getUserAchievements(userId: string): Promise<LabAchievement[]> {
    const { data, error } = await supabase
      .from("lab_achievements")
      .select("*")
      .eq("user_id", userId)
      .order("earned_at", { ascending: false });

    if (error) {
      console.error("Error fetching achievements:", error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get leaderboard data
   */
  async getLabLeaderboard(labId?: string, limit: number = 10): Promise<any[]> {
    let query = supabase
      .from("lab_progress")
      .select(
        `
        *,
        profiles:user_id (
          username,
          display_name
        )
      `
      )
      .not("completed_at", "is", null)
      .order("score", { ascending: false })
      .order("completion_time_seconds", { ascending: true })
      .limit(limit);

    if (labId) {
      query = query.eq("lab_id", labId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching leaderboard:", error);
      throw error;
    }

    return data || [];
  }
}

export const labProgressService = new LabProgressService();
