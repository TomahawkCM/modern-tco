import { supabase, supabaseAdmin } from "./supabase";
import type { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  created_at: string | null;
  last_login: string | null;
  trial_start: string | null;
  subscription_status: "trial" | "active" | "expired" | "cancelled" | null;
}

export interface UserStats {
  studyStreak: number;
  totalScore: number;
  questionsCompleted: number;
  studyTimeHours: number;
  lastStudyDate: string | null;
}

export interface Achievement {
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
}

/**
 * Fetch user profile from Supabase users table
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, name, created_at, last_login, trial_start, subscription_status")
    .eq("id", userId)
    .single();

  if (error) {
    // Only log non-RLS errors (RLS errors are empty objects {})
    // RLS blocks are expected when session isn't established and are handled gracefully
    if (error.message && error.message !== "") {
      console.error("Error fetching user profile:", error);
    }
    return null;
  }

  // Cast to UserProfile - database types may not include trial_start/subscription_status
  return data as unknown as UserProfile;
}

/**
 * Calculate user statistics from progress and exam sessions
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  // Fetch user progress
  const { data: progressData, error: progressError } = await supabase
    .from("user_progress")
    .select("is_correct, time_taken, completed_at")
    .eq("user_id", userId);

  if (progressError) {
    console.error("Error fetching user progress:", progressError);
  }

  // Fetch exam sessions
  const { data: sessionData, error: sessionError } = await supabase
    .from("exam_sessions")
    .select("score, started_at, completed_at, time_spent")
    .eq("user_id", userId)
    .order("started_at", { ascending: false });

  if (sessionError) {
    console.error("Error fetching exam sessions:", sessionError);
  }

  // Calculate statistics
  const progress = progressData || [];
  const sessions = sessionData || [];

  // Questions completed
  const questionsCompleted = progress.length;

  // Average score across all sessions
  const completedSessions = sessions.filter((s) => s.completed_at);
  const totalScore =
    completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.score || 0), 0) / completedSessions.length
      : 0;

  // Total study time in hours
  const totalTimeSeconds = sessions.reduce((sum, s) => sum + (s.time_spent || 0), 0);
  const studyTimeHours = Math.round((totalTimeSeconds / 3600) * 10) / 10;

  // Calculate study streak (filter out null dates)
  const studyStreak = calculateStudyStreak(
    sessions.map((s) => s.started_at).filter((date): date is string => date !== null)
  );

  // Get last study date
  const lastStudyDate = sessions.length > 0 ? sessions[0].started_at : null;

  return {
    studyStreak,
    totalScore: Math.round(totalScore),
    questionsCompleted,
    studyTimeHours,
    lastStudyDate,
  };
}

/**
 * Calculate consecutive days of study activity
 */
function calculateStudyStreak(studyDates: string[]): number {
  if (studyDates.length === 0) return 0;

  // Sort dates in descending order
  const sortedDates = studyDates.map((d) => new Date(d)).sort((a, b) => b.getTime() - a.getTime());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  const currentDate = new Date(today);

  for (const studyDate of sortedDates) {
    const study = new Date(studyDate);
    study.setHours(0, 0, 0, 0);

    // Check if this study date matches the current date in our streak
    if (study.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (study.getTime() < currentDate.getTime()) {
      // Gap in streak, stop counting
      break;
    }
  }

  return streak;
}

/**
 * Get user achievements based on their progress
 */
export async function getUserAchievements(userId: string): Promise<Achievement[]> {
  const stats = await getUserStats(userId);

  const achievements: Achievement[] = [
    {
      name: "First Steps",
      description: "Completed first practice session",
      icon: "Trophy",
      earned: stats.questionsCompleted > 0,
    },
    {
      name: "Week Warrior",
      description: "7-day study streak",
      icon: "Calendar",
      earned: stats.studyStreak >= 7,
    },
    {
      name: "Question Master",
      description: "Answered 100+ questions",
      icon: "Target",
      earned: stats.questionsCompleted >= 100,
    },
    {
      name: "Domain Expert",
      description: "Mastered a certification domain",
      icon: "Award",
      earned: false, // TODO: Implement domain mastery logic
    },
    {
      name: "Mock Master",
      description: "Passed a mock exam",
      icon: "BookOpen",
      earned: stats.totalScore >= 75, // Assuming 75% is passing
    },
  ];

  return achievements;
}

/**
 * Update user profile information
 */
export async function updateUserProfile(
  userId: string,
  updates: { name?: string; bio?: string }
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("users")
    .update({
      name: updates.name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user profile:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Update user's last login timestamp
 */
export async function updateLastLogin(userId: string): Promise<void> {
  const { error } = await supabase
    .from("users")
    .update({ last_login: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    console.error("Error updating last login:", error);
  }
}

/**
 * Create or update user profile with trial initialization
 * Uses service role to bypass RLS for initial profile creation
 */
export async function createUserProfile(
  user: User
): Promise<{ success: boolean; error?: string }> {
  // Use admin client to bypass RLS for profile creation
  const client = supabaseAdmin || supabase;

  const now = new Date().toISOString();
  const fullName = user.user_metadata?.full_name ||
                   user.user_metadata?.name ||
                   user.email?.split("@")[0] ||
                   null;

  const { error } = await client
    .from("users")
    .upsert({
      id: user.id,
      email: user.email || "",
      name: fullName,
      trial_start: now,
      subscription_status: "trial",
      created_at: now,
      last_login: now,
    }, {
      onConflict: "id",
      ignoreDuplicates: false,
    });

  if (error) {
    console.error("Error creating user profile:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
