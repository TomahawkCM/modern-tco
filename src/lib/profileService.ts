import type { User } from "@supabase/supabase-js";
import { supabase, supabaseAdmin } from "./supabase";

// Offline mode check - skip Supabase queries for local users
const isOfflineMode = process.env.NEXT_PUBLIC_OFFLINE_MODE === "true";
const LOCAL_USER_ID = "local-user-offline";
const LOCAL_USER_PREFIX = "local-user";

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
 * In offline mode, returns a mock profile for local users
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  // In offline mode or for local user ID, return a mock profile
  // Use startsWith for robust matching of any local-user-* IDs
  if (isOfflineMode || userId === LOCAL_USER_ID || userId.startsWith(LOCAL_USER_PREFIX)) {
    return {
      id: LOCAL_USER_ID,
      email: "local@budgetapp.local",
      name: "Local User",
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      trial_start: new Date().toISOString(),
      subscription_status: "active", // Local users have full access
    };
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, email, name, created_at, last_login, trial_start, subscription_status")
    .eq("id", userId)
    // IMPORTANT: RLS or a not-yet-created profile can result in 0 rows.
    // `.maybeSingle()` treats "0 rows" as `data: null` (no error), which avoids noisy console errors
    // in places like `useTrialStatus` that intentionally fall back to trial defaults.
    .maybeSingle();

  if (error) {
    // Prefer a lightweight log here: callers (like `useTrialStatus`) intentionally fall back to
    // safe defaults when profile fetch fails.
    const { message } = error as { message?: string };
    if (message) {
      console.warn("Error fetching user profile:", message);
    }
    return null;
  }

  // Cast to UserProfile - database types may not include trial_start/subscription_status
  return data as unknown as UserProfile;
}

/**
 * Calculate user statistics from progress and exam sessions
 * In offline mode, returns default stats for local users
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  // In offline mode or for local user ID, return default stats
  if (isOfflineMode || userId === LOCAL_USER_ID || userId.startsWith(LOCAL_USER_PREFIX)) {
    return {
      studyStreak: 0,
      totalScore: 0,
      questionsCompleted: 0,
      studyTimeHours: 0,
      lastStudyDate: null,
    };
  }

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
 * In offline mode, returns success without Supabase query
 */
export async function updateUserProfile(
  userId: string,
  updates: { name?: string; bio?: string }
): Promise<{ success: boolean; error?: string }> {
  // In offline mode or for local user ID, skip Supabase
  if (isOfflineMode || userId === LOCAL_USER_ID || userId.startsWith(LOCAL_USER_PREFIX)) {
    return { success: true };
  }

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
 * In offline mode, does nothing
 */
export async function updateLastLogin(userId: string): Promise<void> {
  // In offline mode or for local user ID, skip Supabase
  if (isOfflineMode || userId === LOCAL_USER_ID || userId.startsWith(LOCAL_USER_PREFIX)) {
    return;
  }

  const { error } = await supabase
    .from("users")
    .update({ last_login: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    console.error("Error updating last login:", error);
  }
}

/**
 * Wait for user profile to be created by database trigger
 * The database has a trigger (handle_new_user) that automatically creates
 * profiles when auth.users receives a new user. This function polls until
 * the profile is created.
 * In offline mode, returns success immediately.
 */
export async function createUserProfile(user: User): Promise<{ success: boolean; error?: string }> {
  // In offline mode or for local user ID, skip Supabase
  if (isOfflineMode || user.id === LOCAL_USER_ID || user.id.startsWith(LOCAL_USER_PREFIX)) {
    return { success: true };
  }

  // Wait for database trigger to create the profile
  // Retry up to 10 times with 500ms delay (5 seconds total)
  for (let i = 0; i < 10; i++) {
    const profile = await getUserProfile(user.id);

    if (profile) {
      console.log("[Profile] Profile created by database trigger");
      return { success: true };
    }

    // Wait 500ms before next attempt
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // If profile still doesn't exist after 5 seconds, log error
  console.warn("[Profile] Timeout waiting for database trigger to create profile");
  console.warn("[Profile] This suggests the handle_new_user() trigger may not be installed");
  console.warn("[Profile] Run: supabase db push to apply migration 20251012000002");

  return {
    success: false,
    error: "Profile creation timeout - database trigger may not be installed",
  };
}
