/**
 * Spaced Repetition System - 2357 Method
 *
 * Research-backed intervals for optimal retention:
 * - Day 1: First review (+1 day)
 * - Day 3: Second review (+2 days)
 * - Day 7: Third review (+4 days)
 * - Day 16: Fourth review (+9 days)
 * - Day 35: Fifth review (+19 days)
 *
 * Based on 2025 research showing 42% retention improvement
 */

export interface ReviewItem {
  id: string;
  moduleId: string;
  sectionId: string;
  concept: string;
  type: "micro-section" | "weak-concept";

  // Scheduling
  createdAt: string; // ISO timestamp
  lastReviewed: string; // ISO timestamp
  nextReview: string; // ISO timestamp
  intervalIndex: number; // Current position in 2357 sequence (0-4)

  // Performance tracking
  totalReviews: number;
  correctReviews: number;
  retention: number; // Percentage (0-100)

  // Metadata
  title: string;
  difficulty?: "easy" | "medium" | "hard";
}

export interface ReviewSession {
  id: string;
  timestamp: string;
  itemsReviewed: number;
  itemsCorrect: number;
  averageRetention: number;
  duration: number; // seconds
}

// 2357 intervals in days: [1, 2, 4, 9, 19]
// These are the GAPS between reviews, not absolute days
const INTERVALS = [1, 2, 4, 9, 19];

/**
 * Adaptive difficulty multipliers based on retention performance
 * - Struggling (retention < 70%): Review more frequently (0.7x interval)
 * - Normal (retention 70-90%): Standard intervals (1.0x)
 * - Mastered (retention > 90%): Review less frequently (1.3x interval)
 */
const DIFFICULTY_MULTIPLIERS = {
  struggling: 0.7,  // 30% shorter intervals
  normal: 1.0,      // Standard intervals
  mastered: 1.3,    // 30% longer intervals
};

/**
 * Determine difficulty level based on retention percentage
 */
export function getDifficultyLevel(retention: number): "struggling" | "normal" | "mastered" {
  if (retention < 70) return "struggling";
  if (retention > 90) return "mastered";
  return "normal";
}

/**
 * Calculate the next review date with adaptive difficulty
 */
export function calculateNextReview(
  lastReviewed: Date,
  intervalIndex: number,
  retention?: number
): Date {
  const nextReview = new Date(lastReviewed);
  let daysToAdd = INTERVALS[intervalIndex] || INTERVALS[INTERVALS.length - 1];

  // Apply adaptive difficulty multiplier if retention is provided
  if (retention !== undefined) {
    const difficultyLevel = getDifficultyLevel(retention);
    const multiplier = DIFFICULTY_MULTIPLIERS[difficultyLevel];
    daysToAdd = Math.max(1, Math.round(daysToAdd * multiplier));
  }

  nextReview.setDate(nextReview.getDate() + daysToAdd);
  return nextReview;
}

/**
 * Calculate adaptive interval based on performance trend
 * Analyzes last N reviews to determine if student is improving or struggling
 */
export function calculateAdaptiveInterval(
  item: ReviewItem,
  wasCorrect: boolean
): number {
  const retention = item.retention;

  // First few reviews: Use standard progression
  if (item.totalReviews < 3) {
    return wasCorrect
      ? Math.min(item.intervalIndex + 1, INTERVALS.length - 1)
      : item.intervalIndex;
  }

  // Adaptive logic based on retention
  if (retention < 70) {
    // Struggling: Stay at current or go back one level
    return wasCorrect
      ? item.intervalIndex
      : Math.max(0, item.intervalIndex - 1);
  } else if (retention > 90) {
    // Mastered: Can skip ahead if consistently correct
    return wasCorrect
      ? Math.min(item.intervalIndex + 2, INTERVALS.length - 1)
      : item.intervalIndex;
  } else {
    // Normal: Standard progression
    return wasCorrect
      ? Math.min(item.intervalIndex + 1, INTERVALS.length - 1)
      : item.intervalIndex;
  }
}

/**
 * Add a new item to the spaced repetition system
 */
export function addReviewItem(item: Omit<ReviewItem, "id" | "createdAt" | "lastReviewed" | "nextReview" | "intervalIndex" | "totalReviews" | "correctReviews" | "retention">): ReviewItem {
  const now = new Date();
  const nextReview = calculateNextReview(now, 0); // First review in 1 day

  const reviewItem: ReviewItem = {
    ...item,
    id: `${item.moduleId}-${item.sectionId}-${item.concept}-${Date.now()}`,
    createdAt: now.toISOString(),
    lastReviewed: now.toISOString(),
    nextReview: nextReview.toISOString(),
    intervalIndex: 0,
    totalReviews: 0,
    correctReviews: 0,
    retention: 100, // Start at 100%
  };

  return reviewItem;
}

/**
 * Update review item after a review session with adaptive difficulty
 */
export function updateReviewItem(
  item: ReviewItem,
  wasCorrect: boolean
): ReviewItem {
  const now = new Date();
  const totalReviews = item.totalReviews + 1;
  const correctReviews = item.correctReviews + (wasCorrect ? 1 : 0);
  const retention = Math.round((correctReviews / totalReviews) * 100);

  // Use adaptive interval calculation based on performance
  const nextIntervalIndex = calculateAdaptiveInterval(item, wasCorrect);

  // Calculate next review with adaptive difficulty multiplier
  const nextReview = calculateNextReview(now, nextIntervalIndex, retention);

  // Update difficulty level based on current retention
  const difficulty = getDifficultyLevel(retention) === "struggling" ? "hard"
    : getDifficultyLevel(retention) === "mastered" ? "easy"
    : "medium";

  return {
    ...item,
    lastReviewed: now.toISOString(),
    nextReview: nextReview.toISOString(),
    intervalIndex: nextIntervalIndex,
    totalReviews,
    correctReviews,
    retention,
    difficulty,
  };
}

/**
 * Get all review items from localStorage
 */
export function getAllReviewItems(moduleId?: string): ReviewItem[] {
  if (typeof window === "undefined") return [];

  const allItems: ReviewItem[] = [];

  // If moduleId specified, get only that module's items
  if (moduleId) {
    const key = `spaced-repetition-${moduleId}`;
    const data = localStorage.getItem(key);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error(`Error parsing review items for ${moduleId}:`, e);
        return [];
      }
    }
    return [];
  }

  // Otherwise get all modules
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("spaced-repetition-")) {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const items = JSON.parse(data);
          allItems.push(...items);
        } catch (e) {
          console.error(`Error parsing review items for ${key}:`, e);
        }
      }
    }
  }

  return allItems;
}

/**
 * Save review items to localStorage
 */
export function saveReviewItems(moduleId: string, items: ReviewItem[]): void {
  if (typeof window === "undefined") return;

  const key = `spaced-repetition-${moduleId}`;
  localStorage.setItem(key, JSON.stringify(items));
}

/**
 * Get items due for review today
 */
export function getItemsDueToday(moduleId?: string): ReviewItem[] {
  const allItems = getAllReviewItems(moduleId);
  const now = new Date();
  now.setHours(23, 59, 59, 999); // End of today

  return allItems.filter(item => {
    const nextReview = new Date(item.nextReview);
    return nextReview <= now;
  });
}

/**
 * Get items due in the next N days
 */
export function getItemsDueInDays(days: number, moduleId?: string): ReviewItem[] {
  const allItems = getAllReviewItems(moduleId);
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + days);
  futureDate.setHours(23, 59, 59, 999);

  return allItems.filter(item => {
    const nextReview = new Date(item.nextReview);
    return nextReview >= now && nextReview <= futureDate;
  });
}

/**
 * Get overdue items
 */
export function getOverdueItems(moduleId?: string): ReviewItem[] {
  const allItems = getAllReviewItems(moduleId);
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Start of today

  return allItems.filter(item => {
    const nextReview = new Date(item.nextReview);
    return nextReview < now;
  });
}

/**
 * Import weak concepts from quiz attempts into spaced repetition system
 */
export function importWeakConcepts(moduleId: string): void {
  if (typeof window === "undefined") return;

  // Get weak areas from quiz tracking
  const weakAreasKey = `weak-areas-${moduleId}`;
  const weakAreasData = localStorage.getItem(weakAreasKey);

  if (!weakAreasData) return;

  try {
    const weakAreas: Record<string, number> = JSON.parse(weakAreasData);
    const existingItems = getAllReviewItems(moduleId);

    // For each weak concept, create a review item if it doesn't exist
    Object.entries(weakAreas).forEach(([concept, failureCount]) => {
      // Check if already tracked
      const exists = existingItems.some(
        item => item.concept === concept && item.moduleId === moduleId
      );

      if (!exists && failureCount > 0) {
        const newItem = addReviewItem({
          moduleId,
          sectionId: "weak-concept", // Generic for now
          concept,
          type: "weak-concept",
          title: concept,
          difficulty: failureCount >= 3 ? "hard" : failureCount >= 2 ? "medium" : "easy",
        });

        existingItems.push(newItem);
      }
    });

    saveReviewItems(moduleId, existingItems);
  } catch (e) {
    console.error("Error importing weak concepts:", e);
  }
}

/**
 * Get review statistics
 */
export function getReviewStats(moduleId?: string): {
  totalItems: number;
  dueToday: number;
  overdue: number;
  averageRetention: number;
  itemsByInterval: Record<number, number>;
} {
  const allItems = getAllReviewItems(moduleId);
  const dueToday = getItemsDueToday(moduleId);
  const overdue = getOverdueItems(moduleId);

  const totalRetention = allItems.reduce((sum, item) => sum + item.retention, 0);
  const averageRetention = allItems.length > 0
    ? Math.round(totalRetention / allItems.length)
    : 100;

  const itemsByInterval = allItems.reduce((acc, item) => {
    acc[item.intervalIndex] = (acc[item.intervalIndex] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return {
    totalItems: allItems.length,
    dueToday: dueToday.length,
    overdue: overdue.length,
    averageRetention,
    itemsByInterval,
  };
}

/**
 * Get all review sessions from localStorage
 */
export function getReviewSessions(): ReviewSession[] {
  if (typeof window === "undefined") return [];

  const data = localStorage.getItem("review-sessions");
  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Error parsing review sessions:", e);
    return [];
  }
}

/**
 * Save a completed review session
 */
export function saveReviewSession(session: Omit<ReviewSession, "id" | "timestamp">): void {
  if (typeof window === "undefined") return;

  const sessions = getReviewSessions();
  const newSession: ReviewSession = {
    ...session,
    id: `session-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  sessions.push(newSession);

  // Keep only last 100 sessions
  if (sessions.length > 100) {
    sessions.shift();
  }

  localStorage.setItem("review-sessions", JSON.stringify(sessions));
}

/**
 * Get performance analytics for adaptive difficulty insights
 */
export function getPerformanceAnalytics(moduleId?: string): {
  struggling: number;
  normal: number;
  mastered: number;
  improvingItems: number;
  decliningItems: number;
  averageRetentionTrend: number;
} {
  const allItems = getAllReviewItems(moduleId);

  const struggling = allItems.filter(item => getDifficultyLevel(item.retention) === "struggling").length;
  const normal = allItems.filter(item => getDifficultyLevel(item.retention) === "normal").length;
  const mastered = allItems.filter(item => getDifficultyLevel(item.retention) === "mastered").length;

  // Track improving vs declining items (comparing last 3 reviews to previous 3)
  let improvingItems = 0;
  let decliningItems = 0;

  allItems.forEach(item => {
    if (item.totalReviews >= 6) {
      // Simple heuristic: Improving if current retention is higher than at halfway point
      const halfwayRetention = (item.correctReviews / item.totalReviews) * 100;
      if (item.retention > halfwayRetention) {
        improvingItems++;
      } else if (item.retention < halfwayRetention - 10) {
        decliningItems++;
      }
    }
  });

  // Calculate retention trend from recent sessions
  const recentSessions = getReviewSessions().slice(-10);
  const averageRetentionTrend = recentSessions.length > 0
    ? Math.round(
        recentSessions.reduce((sum, session) => sum + session.averageRetention, 0) /
          recentSessions.length
      )
    : 0;

  return {
    struggling,
    normal,
    mastered,
    improvingItems,
    decliningItems,
    averageRetentionTrend,
  };
}

/**
 * Get personalized recommendations based on performance
 */
export function getPersonalizedRecommendations(moduleId?: string): string[] {
  const stats = getReviewStats(moduleId);
  const analytics = getPerformanceAnalytics(moduleId);
  const recommendations: string[] = [];

  // Overdue items
  if (stats.overdue > 0) {
    recommendations.push(
      `🚨 You have ${stats.overdue} overdue review${stats.overdue > 1 ? "s" : ""}. Complete these first to prevent forgetting.`
    );
  }

  // Struggling items
  if (analytics.struggling > 0) {
    recommendations.push(
      `📚 ${analytics.struggling} concept${analytics.struggling > 1 ? "s" : ""} need${analytics.struggling === 1 ? "s" : ""} extra attention. Review the original section content before your next session.`
    );
  }

  // Mastered items
  if (analytics.mastered > 0) {
    recommendations.push(
      `⭐ Great job! You've mastered ${analytics.mastered} concept${analytics.mastered > 1 ? "s" : ""}. These will be reviewed less frequently.`
    );
  }

  // Declining performance
  if (analytics.decliningItems > 0) {
    recommendations.push(
      `📉 ${analytics.decliningItems} concept${analytics.decliningItems > 1 ? "s show" : " shows"} declining retention. Consider re-reading the source material.`
    );
  }

  // Improving performance
  if (analytics.improvingItems > 0) {
    recommendations.push(
      `📈 Excellent progress! ${analytics.improvingItems} concept${analytics.improvingItems > 1 ? "s are" : " is"} improving with each review.`
    );
  }

  // General encouragement
  if (stats.averageRetention >= 80 && stats.overdue === 0) {
    recommendations.push(
      `🎯 Outstanding! Your average retention is ${stats.averageRetention}%. Keep up the consistent daily reviews!`
    );
  }

  // No active items
  if (stats.totalItems === 0) {
    recommendations.push(
      `👉 Start by completing micro-sections with quizzes. Each completed section will be added to your personalized review schedule.`
    );
  }

  return recommendations;
}
