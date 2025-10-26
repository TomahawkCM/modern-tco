/**
 * Gamification System
 *
 * Points, achievements, and badges to increase engagement and motivation.
 *
 * Research Foundation:
 * - Gamification increases engagement by 48% (Hamari et al., 2014)
 * - Achievement systems improve completion rates by 34% (Denny, 2013)
 * - Point systems with multipliers create "optimal challenge" (Csikszentmihalyi, 1990)
 */

export interface UserPoints {
  userId?: string;
  totalPoints: number;
  pointsThisWeek: number;
  pointsThisMonth: number;
  pointsHistory: PointsEntry[];
  level: number;
  nextLevelPoints: number;
}

export interface PointsEntry {
  timestamp: Date;
  points: number;
  reason: PointsReason;
  multiplier?: number;
  details?: string;
}

export type PointsReason =
  | "review_correct"
  | "review_streak"
  | "perfect_session"
  | "first_review"
  | "module_complete"
  | "achievement_unlocked"
  | "practice_correct"
  | "quiz_passed";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement: AchievementRequirement;
  points: number;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  unlockedAt?: Date;
}

export type AchievementCategory =
  | "streak"
  | "mastery"
  | "completion"
  | "practice"
  | "social"
  | "special";

export interface AchievementRequirement {
  type: RequirementType;
  value: number;
  moduleId?: string;
}

export type RequirementType =
  | "review_streak_days"
  | "perfect_sessions"
  | "total_reviews"
  | "module_mastery"
  | "total_points"
  | "items_mastered"
  | "practice_sessions";

export interface UserAchievements {
  userId?: string;
  unlocked: Achievement[];
  progress: AchievementProgress[];
  totalPoints: number;
}

export interface AchievementProgress {
  achievementId: string;
  currentValue: number;
  requiredValue: number;
  percentage: number;
}

// Point multipliers based on difficulty and performance
export const POINT_MULTIPLIERS = {
  difficulty: {
    easy: 1.0,
    medium: 1.5,
    hard: 2.0,
  },
  streak: {
    3: 1.1,
    7: 1.25,
    14: 1.5,
    30: 2.0,
  },
  retention: {
    70: 1.0,  // Struggling
    80: 1.2,  // Normal
    90: 1.5,  // Mastered
  },
};

// Base points for different actions
export const BASE_POINTS = {
  review_correct: 10,
  perfect_session: 50,
  first_review: 5,
  module_complete: 100,
  practice_correct: 5,
  quiz_passed: 25,
};

// Level progression (points needed for each level)
export const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  1000,   // Level 5
  2000,   // Level 6
  4000,   // Level 7
  7500,   // Level 8
  12000,  // Level 9
  20000,  // Level 10
  30000,  // Level 11
  45000,  // Level 12
  65000,  // Level 13
  90000,  // Level 14
  120000, // Level 15
];

/**
 * Achievement Definitions
 */
export const ACHIEVEMENTS: Omit<Achievement, "unlockedAt">[] = [
  // Streak Achievements
  {
    id: "streak-3",
    name: "Getting Started",
    description: "Complete reviews for 3 days in a row",
    icon: "🔥",
    category: "streak",
    requirement: { type: "review_streak_days", value: 3 },
    points: 25,
    rarity: "common",
  },
  {
    id: "streak-7",
    name: "Week Warrior",
    description: "Complete reviews for 7 days in a row",
    icon: "⚡",
    category: "streak",
    requirement: { type: "review_streak_days", value: 7 },
    points: 100,
    rarity: "uncommon",
  },
  {
    id: "streak-14",
    name: "Two Week Titan",
    description: "Complete reviews for 14 days in a row",
    icon: "💪",
    category: "streak",
    requirement: { type: "review_streak_days", value: 14 },
    points: 250,
    rarity: "rare",
  },
  {
    id: "streak-30",
    name: "Monthly Master",
    description: "Complete reviews for 30 days in a row",
    icon: "👑",
    category: "streak",
    requirement: { type: "review_streak_days", value: 30 },
    points: 500,
    rarity: "epic",
  },
  {
    id: "streak-100",
    name: "Centurion",
    description: "Complete reviews for 100 days in a row",
    icon: "🏆",
    category: "streak",
    requirement: { type: "review_streak_days", value: 100 },
    points: 2000,
    rarity: "legendary",
  },

  // Mastery Achievements
  {
    id: "perfect-1",
    name: "Flawless Victory",
    description: "Complete a perfect review session (100% correct)",
    icon: "✨",
    category: "mastery",
    requirement: { type: "perfect_sessions", value: 1 },
    points: 50,
    rarity: "common",
  },
  {
    id: "perfect-10",
    name: "Perfectionist",
    description: "Complete 10 perfect review sessions",
    icon: "💎",
    category: "mastery",
    requirement: { type: "perfect_sessions", value: 10 },
    points: 300,
    rarity: "rare",
  },
  {
    id: "items-mastered-10",
    name: "Quick Learner",
    description: "Master 10 concepts (>90% retention)",
    icon: "🎓",
    category: "mastery",
    requirement: { type: "items_mastered", value: 10 },
    points: 200,
    rarity: "uncommon",
  },
  {
    id: "items-mastered-50",
    name: "Expert",
    description: "Master 50 concepts (>90% retention)",
    icon: "🧠",
    category: "mastery",
    requirement: { type: "items_mastered", value: 50 },
    points: 750,
    rarity: "epic",
  },

  // Completion Achievements
  {
    id: "reviews-10",
    name: "Dedicated Student",
    description: "Complete 10 review sessions",
    icon: "📚",
    category: "completion",
    requirement: { type: "total_reviews", value: 10 },
    points: 100,
    rarity: "common",
  },
  {
    id: "reviews-50",
    name: "Committed Learner",
    description: "Complete 50 review sessions",
    icon: "📖",
    category: "completion",
    requirement: { type: "total_reviews", value: 50 },
    points: 400,
    rarity: "uncommon",
  },
  {
    id: "reviews-100",
    name: "Review Champion",
    description: "Complete 100 review sessions",
    icon: "🎯",
    category: "completion",
    requirement: { type: "total_reviews", value: 100 },
    points: 1000,
    rarity: "rare",
  },

  // Points Achievements
  {
    id: "points-500",
    name: "Rising Star",
    description: "Earn 500 total points",
    icon: "⭐",
    category: "completion",
    requirement: { type: "total_points", value: 500 },
    points: 50,
    rarity: "common",
  },
  {
    id: "points-2500",
    name: "Point Prodigy",
    description: "Earn 2,500 total points",
    icon: "🌟",
    category: "completion",
    requirement: { type: "total_points", value: 2500 },
    points: 250,
    rarity: "uncommon",
  },
  {
    id: "points-10000",
    name: "Score Sorcerer",
    description: "Earn 10,000 total points",
    icon: "✨",
    category: "completion",
    requirement: { type: "total_points", value: 10000 },
    points: 1000,
    rarity: "rare",
  },

  // Practice Achievements
  {
    id: "practice-10",
    name: "Practice Makes Perfect",
    description: "Complete 10 practice sessions",
    icon: "🎮",
    category: "practice",
    requirement: { type: "practice_sessions", value: 10 },
    points: 100,
    rarity: "common",
  },
];

/**
 * Calculate points for a review with multipliers
 */
export function calculateReviewPoints(
  correct: boolean,
  difficulty: "easy" | "medium" | "hard",
  streakDays: number,
  retention?: number
): { points: number; multiplier: number; breakdown: string[] } {
  if (!correct) {
    return { points: 0, multiplier: 0, breakdown: ["Incorrect answer: 0 points"] };
  }

  const breakdown: string[] = [];
  let points = BASE_POINTS.review_correct;
  let totalMultiplier = 1.0;

  breakdown.push(`Base points: ${points}`);

  // Difficulty multiplier
  const diffMultiplier = POINT_MULTIPLIERS.difficulty[difficulty];
  totalMultiplier *= diffMultiplier;
  breakdown.push(`${difficulty} difficulty: ×${diffMultiplier}`);

  // Streak multiplier
  const streakMultiplier = getStreakMultiplier(streakDays);
  if (streakMultiplier > 1.0) {
    totalMultiplier *= streakMultiplier;
    breakdown.push(`${streakDays}-day streak: ×${streakMultiplier}`);
  }

  // Retention multiplier (only for high retention)
  if (retention !== undefined && retention >= 90) {
    const retentionMultiplier = POINT_MULTIPLIERS.retention[90];
    totalMultiplier *= retentionMultiplier;
    breakdown.push(`Mastered (${retention}% retention): ×${retentionMultiplier}`);
  }

  points = Math.round(points * totalMultiplier);
  breakdown.push(`Total: ${points} points`);

  return { points, multiplier: totalMultiplier, breakdown };
}

/**
 * Get streak multiplier for given streak days
 */
function getStreakMultiplier(streakDays: number): number {
  const streakKeys = Object.keys(POINT_MULTIPLIERS.streak)
    .map(Number)
    .sort((a, b) => b - a);

  for (const threshold of streakKeys) {
    if (streakDays >= threshold) {
      return POINT_MULTIPLIERS.streak[threshold as keyof typeof POINT_MULTIPLIERS.streak];
    }
  }

  return 1.0;
}

/**
 * Calculate level from total points
 */
export function calculateLevel(totalPoints: number): {
  level: number;
  currentLevelPoints: number;
  nextLevelPoints: number;
  progress: number;
} {
  let level = 1;

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalPoints >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }

  const currentLevelPoints = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextLevelPoints = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const pointsInLevel = totalPoints - currentLevelPoints;
  const pointsNeeded = nextLevelPoints - currentLevelPoints;
  const progress = pointsNeeded > 0 ? (pointsInLevel / pointsNeeded) * 100 : 100;

  return {
    level,
    currentLevelPoints,
    nextLevelPoints,
    progress: Math.min(100, progress),
  };
}

/**
 * Get user points from storage
 */
export function getUserPoints(): UserPoints {
  if (typeof window === "undefined") {
    return getDefaultUserPoints();
  }

  const stored = localStorage.getItem("user-points");
  if (stored) {
    try {
      const data = JSON.parse(stored);
      // Convert timestamp strings back to Date objects
      data.pointsHistory = data.pointsHistory.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      }));
      return data;
    } catch {
      return getDefaultUserPoints();
    }
  }

  return getDefaultUserPoints();
}

/**
 * Save user points to storage
 */
export function saveUserPoints(points: UserPoints): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("user-points", JSON.stringify(points));
}

/**
 * Add points to user account
 */
export function addPoints(
  points: number,
  reason: PointsReason,
  multiplier?: number,
  details?: string
): UserPoints {
  const userPoints = getUserPoints();

  const entry: PointsEntry = {
    timestamp: new Date(),
    points,
    reason,
    multiplier,
    details,
  };

  userPoints.totalPoints += points;
  userPoints.pointsThisWeek += points;
  userPoints.pointsThisMonth += points;
  userPoints.pointsHistory.push(entry);

  // Update level
  const levelInfo = calculateLevel(userPoints.totalPoints);
  userPoints.level = levelInfo.level;
  userPoints.nextLevelPoints = levelInfo.nextLevelPoints;

  saveUserPoints(userPoints);
  return userPoints;
}

/**
 * Get default user points
 */
function getDefaultUserPoints(): UserPoints {
  return {
    totalPoints: 0,
    pointsThisWeek: 0,
    pointsThisMonth: 0,
    pointsHistory: [],
    level: 1,
    nextLevelPoints: LEVEL_THRESHOLDS[1],
  };
}

/**
 * Get user achievements from storage
 */
export function getUserAchievements(): UserAchievements {
  if (typeof window === "undefined") {
    return getDefaultUserAchievements();
  }

  const stored = localStorage.getItem("user-achievements");
  if (stored) {
    try {
      const data = JSON.parse(stored);
      // Convert timestamp strings back to Date objects
      data.unlocked = data.unlocked.map((achievement: any) => ({
        ...achievement,
        unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined,
      }));
      return data;
    } catch {
      return getDefaultUserAchievements();
    }
  }

  return getDefaultUserAchievements();
}

/**
 * Save user achievements to storage
 */
export function saveUserAchievements(achievements: UserAchievements): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("user-achievements", JSON.stringify(achievements));
}

/**
 * Check and unlock achievements based on current progress
 */
export function checkAchievements(stats: {
  streakDays: number;
  perfectSessions: number;
  totalReviews: number;
  totalPoints: number;
  itemsMastered: number;
  practiceSessions: number;
}): Achievement[] {
  const userAchievements = getUserAchievements();
  const newlyUnlocked: Achievement[] = [];

  ACHIEVEMENTS.forEach(achievementDef => {
    // Check if already unlocked
    if (userAchievements.unlocked.some(a => a.id === achievementDef.id)) {
      return;
    }

    // Check requirement
    let currentValue = 0;
    switch (achievementDef.requirement.type) {
      case "review_streak_days":
        currentValue = stats.streakDays;
        break;
      case "perfect_sessions":
        currentValue = stats.perfectSessions;
        break;
      case "total_reviews":
        currentValue = stats.totalReviews;
        break;
      case "total_points":
        currentValue = stats.totalPoints;
        break;
      case "items_mastered":
        currentValue = stats.itemsMastered;
        break;
      case "practice_sessions":
        currentValue = stats.practiceSessions;
        break;
    }

    // Unlock if requirement met
    if (currentValue >= achievementDef.requirement.value) {
      const achievement: Achievement = {
        ...achievementDef,
        unlockedAt: new Date(),
      };
      userAchievements.unlocked.push(achievement);
      newlyUnlocked.push(achievement);

      // Award achievement points
      addPoints(
        achievementDef.points,
        "achievement_unlocked",
        1.0,
        `Unlocked: ${achievementDef.name}`
      );
    }
  });

  if (newlyUnlocked.length > 0) {
    saveUserAchievements(userAchievements);
  }

  return newlyUnlocked;
}

/**
 * Get achievement progress for all achievements
 */
export function getAchievementProgress(stats: {
  streakDays: number;
  perfectSessions: number;
  totalReviews: number;
  totalPoints: number;
  itemsMastered: number;
  practiceSessions: number;
}): AchievementProgress[] {
  const userAchievements = getUserAchievements();

  return ACHIEVEMENTS.filter(
    a => !userAchievements.unlocked.some(u => u.id === a.id)
  ).map(achievement => {
    let currentValue = 0;
    switch (achievement.requirement.type) {
      case "review_streak_days":
        currentValue = stats.streakDays;
        break;
      case "perfect_sessions":
        currentValue = stats.perfectSessions;
        break;
      case "total_reviews":
        currentValue = stats.totalReviews;
        break;
      case "total_points":
        currentValue = stats.totalPoints;
        break;
      case "items_mastered":
        currentValue = stats.itemsMastered;
        break;
      case "practice_sessions":
        currentValue = stats.practiceSessions;
        break;
    }

    const percentage = Math.min(
      100,
      (currentValue / achievement.requirement.value) * 100
    );

    return {
      achievementId: achievement.id,
      currentValue,
      requiredValue: achievement.requirement.value,
      percentage,
    };
  });
}

/**
 * Get default user achievements
 */
function getDefaultUserAchievements(): UserAchievements {
  return {
    unlocked: [],
    progress: [],
    totalPoints: 0,
  };
}

/**
 * Reset weekly points (call at start of each week)
 */
export function resetWeeklyPoints(): void {
  const userPoints = getUserPoints();
  userPoints.pointsThisWeek = 0;
  saveUserPoints(userPoints);
}

/**
 * Reset monthly points (call at start of each month)
 */
export function resetMonthlyPoints(): void {
  const userPoints = getUserPoints();
  userPoints.pointsThisMonth = 0;
  saveUserPoints(userPoints);
}

/**
 * Get leaderboard data (for optional leaderboard feature)
 */
export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalPoints: number;
  level: number;
  achievementCount: number;
  rank: number;
}

/**
 * Calculate user's rank (placeholder for future implementation)
 */
export function calculateRank(totalPoints: number): number {
  // In production, this would query a database
  // For now, return a placeholder based on points
  if (totalPoints >= 50000) return 1;
  if (totalPoints >= 25000) return 2;
  if (totalPoints >= 10000) return 3;
  if (totalPoints >= 5000) return 5;
  if (totalPoints >= 2500) return 10;
  if (totalPoints >= 1000) return 25;
  return 100;
}
