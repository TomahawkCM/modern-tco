// Review System Types - Unified Spaced Repetition for Flashcards & Questions
// Part of Phase 2: Unified Review Dashboard

import type { SRRating } from "@/lib/sr";
import type { Flashcard } from "./flashcard";
import type { Question } from "./assessment";

// ==================== QUESTION REVIEWS ====================

export interface QuestionReview {
  id: string;
  user_id: string;
  question_id: string;

  // SRS state (matches flashcard pattern)
  srs_due: string; // ISO timestamp
  srs_interval: number; // days
  srs_ease: number;
  srs_reps: number;
  srs_lapses: number;

  // Performance tracking
  total_attempts: number;
  correct_attempts: number;
  average_time_seconds?: number;
  mastery_level: number; // 0.0 to 1.0 (computed)

  // Metadata
  created_at: string;
  updated_at: string;
  last_reviewed_at?: string;
}

export interface QuestionReviewAttempt {
  id: string;
  review_id: string;
  user_id: string;
  question_id: string;

  // Attempt details
  is_correct: boolean;
  time_spent_seconds: number;
  rating: SRRating;

  // SRS state snapshots
  srs_interval_before?: number;
  srs_interval_after?: number;
  srs_ease_before?: number;
  srs_ease_after?: number;

  attempted_at: string;
}

// ==================== REVIEW SESSIONS ====================

export type ReviewSessionType = 'flashcards' | 'questions' | 'mixed';

export interface ReviewSession {
  id: string;
  user_id: string;

  // Session configuration
  session_type: ReviewSessionType;
  target_duration_minutes?: number; // NULL for untimed
  actual_duration_seconds?: number;

  // Content reviewed
  flashcards_reviewed: number;
  questions_reviewed: number;
  correct_count: number;
  total_count: number;

  // Computed accuracy (0.0 to 1.0)
  accuracy: number;

  // Session timing
  started_at: string;
  completed_at?: string;
  is_completed: boolean;
}

// ==================== UNIFIED QUEUE ====================

export type ReviewItemType = 'flashcard' | 'question';

export interface ReviewQueueItem {
  // Item identification
  itemType: ReviewItemType;
  itemId: string; // flashcard.id or review.id
  contentId: string; // flashcard.id or question.id

  // SRS state
  dueDate: Date;
  intervalDays: number;
  easeFactor: number;
  mastery: number; // 0.0 to 1.0

  // Priority calculation
  priorityScore: number; // Higher = review sooner

  // Content references (one will be populated based on itemType)
  flashcard?: Flashcard;
  questionReview?: QuestionReview;
  question?: Question;
}

// ==================== STATISTICS ====================

export interface DailyReviewStats {
  // Due counts
  flashcardsDue: number;
  questionsDue: number;
  totalDue: number;

  // Totals
  flashcardsTotal: number;
  questionsTotal: number;

  // Performance
  avgFlashcardRetention: number; // 0-100
  avgQuestionMastery: number; // 0-100

  // Engagement
  currentStreak: number; // consecutive days
  reviewsToday: number;
  reviewsThisWeek: number;
}

export interface ReviewStreak {
  current: number; // current consecutive days
  longest: number; // best streak ever
  lastReviewDate: string | null; // ISO date (YYYY-MM-DD)
  reviewDates: string[]; // array of ISO dates for calendar
}

export interface QuestionReviewStats {
  totalQuestions: number;
  dueToday: number;
  newQuestions: number; // never reviewed
  learningQuestions: number; // srs_reps < 2
  masteredQuestions: number; // srs_reps >= 2 && mastery >= 0.8
  avgMasteryLevel: number; // 0-100

  questionsByDomain: Record<string, {
    total: number;
    due: number;
    avgMastery: number; // 0-100
  }>;
}

// ==================== UI STATE ====================

export interface ReviewDashboardState {
  stats: DailyReviewStats | null;
  streak: ReviewStreak | null;
  queue: ReviewQueueItem[];
  activeTab: ReviewSessionType;
  isLoading: boolean;
  error: string | null;
}

export interface StudySessionState {
  session: ReviewSession | null;
  queue: ReviewQueueItem[];
  currentIndex: number;
  startTime: Date | null;
  elapsedSeconds: number;
  isActive: boolean;
  isPaused: boolean;

  // Session stats (accumulate during session)
  reviewed: number;
  correct: number;
  flashcardsReviewed: number;
  questionsReviewed: number;
}

export interface StreakCalendarDay {
  date: string; // YYYY-MM-DD
  hasReview: boolean;
  reviewCount: number;
  isToday: boolean;
  isFuture: boolean;
}

// ==================== SESSION EVENTS ====================

export interface ReviewSessionStartEvent {
  sessionType: ReviewSessionType;
  targetDuration?: number;
  queueSize: number;
}

export interface ReviewSessionCompleteEvent {
  sessionId: string;
  sessionType: ReviewSessionType;
  duration: number; // seconds
  itemsReviewed: number;
  accuracy: number; // 0-100
  flashcardsReviewed: number;
  questionsReviewed: number;
}

export interface ReviewItemCompleteEvent {
  itemType: ReviewItemType;
  itemId: string;
  rating: SRRating;
  timeSpent: number; // seconds
  wasCorrect: boolean; // for questions
  newInterval: number; // days
  newMastery: number; // 0.0 to 1.0
}

export interface StreakMilestoneEvent {
  milestone: 7 | 30 | 100 | 365;
  currentStreak: number;
  date: string;
}

// ==================== NOTIFICATIONS ====================

export interface ReviewNotification {
  id: string;
  type: 'daily_reminder' | 'streak_risk' | 'milestone' | 'due_items';
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  expiresAt?: Date;
  isDismissed: boolean;
}

export interface DueCardsBadgeData {
  totalDue: number;
  flashcardsDue: number;
  questionsDue: number;
  highPriorityCount: number; // items with priority score > threshold
}

// ==================== SETTINGS ====================

export interface ReviewSettings {
  // Session preferences
  defaultSessionType: ReviewSessionType;
  defaultDurationMinutes: number;
  maxDailyReviews: number;

  // Queue preferences
  newCardsPerDay: number;
  maxReviewQueueSize: number;
  prioritizeWeakContent: boolean;

  // Notifications
  enableDailyReminders: boolean;
  reminderTime: string; // HH:MM format
  enableStreakAlerts: boolean;

  // Advanced
  autoAdvanceDelay: number; // ms delay between cards
  showDetailedStats: boolean;
  enableSoundEffects: boolean;
}

// ==================== HELPERS ====================

/**
 * Type guard for ReviewQueueItem
 */
export function isFlashcardItem(item: ReviewQueueItem): item is ReviewQueueItem & { flashcard: Flashcard } {
  return item.itemType === 'flashcard' && item.flashcard !== undefined;
}

export function isQuestionItem(item: ReviewQueueItem): item is ReviewQueueItem & { question: Question } {
  return item.itemType === 'question' && item.question !== undefined;
}

/**
 * Get mastery level label
 */
export function getMasteryLabel(mastery: number): string {
  if (mastery >= 0.9) return 'Mastered';
  if (mastery >= 0.7) return 'Proficient';
  if (mastery >= 0.5) return 'Learning';
  if (mastery >= 0.3) return 'Struggling';
  return 'New';
}

/**
 * Get mastery level color
 */
export function getMasteryColor(mastery: number): string {
  if (mastery >= 0.9) return 'text-green-600';
  if (mastery >= 0.7) return 'text-blue-600';
  if (mastery >= 0.5) return 'text-yellow-600';
  if (mastery >= 0.3) return 'text-orange-600';
  return 'text-gray-400';
}

/**
 * Format streak display
 */
export function formatStreak(streak: number): string {
  if (streak === 0) return 'No streak';
  if (streak === 1) return '1 day';
  return `${streak} days`;
}

/**
 * Calculate session progress percentage
 */
export function calculateSessionProgress(
  currentIndex: number,
  totalItems: number
): number {
  if (totalItems === 0) return 0;
  return Math.round((currentIndex / totalItems) * 100);
}

/**
 * Format time remaining
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get next review interval label
 */
export function getIntervalLabel(days: number): string {
  if (days === 0) return 'Now';
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.floor(days / 7)} weeks`;
  if (days < 365) return `${Math.floor(days / 30)} months`;
  return `${Math.floor(days / 365)} years`;
}
