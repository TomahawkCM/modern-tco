// Review Service - Unified Spaced Repetition Queue
// Aggregates flashcards and questions with intelligent priority sorting

import { supabase } from "@/lib/supabase";
import { flashcardService } from "./flashcardService";
import { questionReviewService } from "./questionReviewService";
import type { Flashcard } from "@/types/flashcard";
import type { QuestionReview } from "./questionReviewService";
import type { Question } from "@/types/assessment";

// ==================== TYPES ====================

export type ReviewItemType = 'flashcard' | 'question';

export interface ReviewQueueItem {
  itemType: ReviewItemType;
  itemId: string; // flashcard.id or review.id
  contentId: string; // flashcard.id or question.id
  dueDate: Date;
  intervalDays: number;
  easeFactor: number;
  mastery: number; // 0.0 to 1.0
  priorityScore: number; // calculated priority

  // Additional metadata (filled based on itemType)
  flashcard?: Flashcard;
  questionReview?: QuestionReview;
  question?: Question;
}

export interface ReviewSession {
  id: string;
  user_id: string;
  session_type: 'flashcards' | 'questions' | 'mixed';
  target_duration_minutes?: number;
  actual_duration_seconds?: number;
  flashcards_reviewed: number;
  questions_reviewed: number;
  correct_count: number;
  total_count: number;
  accuracy: number; // computed
  started_at: string;
  completed_at?: string;
  is_completed: boolean;
}

export interface DailyReviewStats {
  flashcardsDue: number;
  questionsDue: number;
  totalDue: number;
  currentStreak: number;
  flashcardsTotal: number;
  questionsTotal: number;
  avgFlashcardRetention: number; // 0-100
  avgQuestionMastery: number; // 0-100
  reviewsToday: number;
  reviewsThisWeek: number;
}

export interface ReviewStreak {
  current: number;
  longest: number;
  lastReviewDate: string | null;
  reviewDates: string[]; // ISO dates for calendar visualization
}

// ==================== SERVICE ====================

class ReviewService {
  // ==================== UNIFIED QUEUE ====================

  /**
   * Get unified review queue using optimized materialized view (RECOMMENDED)
   * 10-20x faster than real-time calculation
   * Falls back to getUnifiedReviewQueue() if materialized view query fails
   */
  async getUnifiedReviewQueueFast(userId: string, limit: number = 50): Promise<ReviewQueueItem[]> {
    // TODO: Re-enable when get_unified_review_queue_fast function is available in database
    // For now, use the regular unified queue
    return this.getUnifiedReviewQueue(userId, limit);
  }

  /**
   * Get unified review queue with intelligent priority sorting (REAL-TIME)
   * Use getUnifiedReviewQueueFast() for better performance in production
   * Combines flashcards and questions, prioritizing struggling content
   */
  async getUnifiedReviewQueue(userId: string, limit: number = 50): Promise<ReviewQueueItem[]> {
    const now = new Date();

    // Fetch due flashcards and questions in parallel
    const [flashcards, questionReviews] = await Promise.all([
      flashcardService.getDueFlashcards(userId, limit),
      questionReviewService.getDueQuestions(userId, limit),
    ]);

    // Convert flashcards to review queue items
    const flashcardItems: ReviewQueueItem[] = flashcards.map(f => {
      const mastery = f.total_reviews > 0
        ? f.correct_reviews / f.total_reviews
        : 0;

      const daysOverdue = Math.max(
        1,
        (now.getTime() - new Date(f.srs_due).getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        itemType: 'flashcard' as ReviewItemType,
        itemId: f.id,
        contentId: f.id,
        dueDate: new Date(f.srs_due),
        intervalDays: f.srs_interval,
        easeFactor: f.srs_ease,
        mastery,
        priorityScore: this.calculatePriority(mastery, daysOverdue, 1.0),
        flashcard: f,
      };
    });

    // Fetch full question data for question reviews
    const questionIds = questionReviews.map(qr => qr.question_id);
    const { data: questions } = await supabase
      .from("questions")
      .select()
      .in("id", questionIds);

    const questionMap = new Map((questions || []).map((q: any) => [q.id, q]));

    // Convert question reviews to review queue items
    const questionItems: ReviewQueueItem[] = questionReviews.map(qr => {
      const daysOverdue = Math.max(
        1,
        (now.getTime() - new Date(qr.srs_due).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Questions have higher priority weight (1.2x) since they're exam-relevant
      return {
        itemType: 'question' as ReviewItemType,
        itemId: qr.id,
        contentId: qr.question_id,
        dueDate: new Date(qr.srs_due),
        intervalDays: qr.srs_interval,
        easeFactor: qr.srs_ease,
        mastery: qr.mastery_level,
        priorityScore: this.calculatePriority(qr.mastery_level, daysOverdue, 1.2),
        questionReview: qr,
        question: questionMap.get(qr.question_id),
      };
    });

    // Combine and sort by priority (high to low)
    const allItems = [...flashcardItems, ...questionItems]
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, limit);

    return allItems;
  }

  /**
   * Calculate priority score for review items
   * Lower mastery + more overdue + higher importance = higher priority
   */
  private calculatePriority(
    mastery: number,
    daysOverdue: number,
    importanceWeight: number = 1.0
  ): number {
    // Inverse mastery (struggling = high priority)
    const masteryFactor = 1.0 - mastery;

    // Logarithmic overdue penalty (diminishing returns)
    const overdueFactor = Math.log10(daysOverdue + 1) + 1;

    return masteryFactor * overdueFactor * importanceWeight * 100;
  }

  /**
   * Get filtered queue by content type
   */
  async getFlashcardQueue(userId: string, limit: number = 30): Promise<ReviewQueueItem[]> {
    const queue = await this.getUnifiedReviewQueue(userId, limit * 2);
    return queue.filter(item => item.itemType === 'flashcard').slice(0, limit);
  }

  async getQuestionQueue(userId: string, limit: number = 30): Promise<ReviewQueueItem[]> {
    const queue = await this.getUnifiedReviewQueue(userId, limit * 2);
    return queue.filter(item => item.itemType === 'question').slice(0, limit);
  }

  /**
   * Get balanced mixed queue (50/50 flashcards and questions)
   */
  async getMixedQueue(userId: string, limit: number = 40): Promise<ReviewQueueItem[]> {
    const halfLimit = Math.floor(limit / 2);
    const [flashcardQueue, questionQueue] = await Promise.all([
      this.getFlashcardQueue(userId, halfLimit),
      this.getQuestionQueue(userId, halfLimit),
    ]);

    // Interleave flashcards and questions
    const mixed: ReviewQueueItem[] = [];
    const maxLength = Math.max(flashcardQueue.length, questionQueue.length);

    for (let i = 0; i < maxLength; i++) {
      if (i < flashcardQueue.length) mixed.push(flashcardQueue[i]);
      if (i < questionQueue.length) mixed.push(questionQueue[i]);
    }

    return mixed.slice(0, limit);
  }

  // ==================== SESSION MANAGEMENT ====================

  /**
   * Start a new review session
   */
  async startSession(
    userId: string,
    sessionType: 'flashcards' | 'questions' | 'mixed',
    targetDurationMinutes?: number
  ): Promise<ReviewSession | null> {
    const { data, error } = await supabase
      .from("review_sessions")
      .insert({
        user_id: userId,
        session_type: sessionType,
        target_duration_minutes: targetDurationMinutes,
      })
      .select()
      .single();

    if (error) {
      console.error("Error starting review session:", error);
      return null;
    }

    return data as ReviewSession;
  }

  /**
   * Complete a review session
   */
  async completeSession(
    sessionId: string,
    stats: {
      flashcardsReviewed: number;
      questionsReviewed: number;
      correctCount: number;
      totalCount: number;
      actualDurationSeconds: number;
    }
  ): Promise<ReviewSession | null> {
    const { data, error } = await supabase
      .from("review_sessions")
      .update({
        flashcards_reviewed: stats.flashcardsReviewed,
        questions_reviewed: stats.questionsReviewed,
        correct_count: stats.correctCount,
        total_count: stats.totalCount,
        actual_duration_seconds: stats.actualDurationSeconds,
        completed_at: new Date().toISOString(),
        is_completed: true,
      })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) {
      console.error("Error completing review session:", error);
      return null;
    }

    return data as ReviewSession;
  }

  /**
   * Get user's review sessions
   */
  async getUserSessions(
    userId: string,
    limit: number = 10
  ): Promise<ReviewSession[]> {
    const { data, error } = await supabase
      .from("review_sessions")
      .select()
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as ReviewSession[];
  }

  // ==================== STATISTICS ====================

  /**
   * Get comprehensive daily review statistics
   */
  async getDailyReviewStats(userId: string): Promise<DailyReviewStats> {
    // Use database function for efficiency
    const { data, error } = await supabase
      .rpc("get_review_stats", { p_user_id: userId })
      .single();

    if (error || !data) {
      console.error("Error fetching review stats:", error);
      return {
        flashcardsDue: 0,
        questionsDue: 0,
        totalDue: 0,
        currentStreak: 0,
        flashcardsTotal: 0,
        questionsTotal: 0,
        avgFlashcardRetention: 0,
        avgQuestionMastery: 0,
        reviewsToday: 0,
        reviewsThisWeek: 0,
      };
    }

    return {
      flashcardsDue: data.flashcards_due,
      questionsDue: data.questions_due,
      totalDue: data.total_due,
      currentStreak: data.current_streak,
      flashcardsTotal: data.flashcards_total,
      questionsTotal: data.questions_total,
      avgFlashcardRetention: Math.round(data.avg_flashcard_retention * 100),
      avgQuestionMastery: Math.round(data.avg_question_mastery * 100),
      reviewsToday: data.reviews_today,
      reviewsThisWeek: data.reviews_this_week,
    };
  }

  /**
   * Get review streak information
   */
  async getReviewStreak(userId: string): Promise<ReviewStreak> {
    // Get all review session dates
    const { data: sessions } = await supabase
      .from("review_sessions")
      .select("started_at")
      .eq("user_id", userId)
      .eq("is_completed", true)
      .order("started_at", { ascending: false });

    if (!sessions || sessions.length === 0) {
      return {
        current: 0,
        longest: 0,
        lastReviewDate: null,
        reviewDates: [],
      };
    }

    // Extract unique dates
    const reviewDates = Array.from(
      new Set(
        sessions.map(s => new Date(s.started_at).toISOString().split('T')[0])
      )
    ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let streakCount = 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Current streak (must include today or yesterday)
    if (reviewDates[0] === today || reviewDates[0] === yesterday) {
      currentStreak = 1;
      for (let i = 1; i < reviewDates.length; i++) {
        const prevDate = new Date(reviewDates[i - 1]);
        const currDate = new Date(reviewDates[i]);
        const diffDays = Math.floor(
          (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Longest streak
    streakCount = 1;
    longestStreak = 1;

    for (let i = 1; i < reviewDates.length; i++) {
      const prevDate = new Date(reviewDates[i - 1]);
      const currDate = new Date(reviewDates[i]);
      const diffDays = Math.floor(
        (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        streakCount++;
        longestStreak = Math.max(longestStreak, streakCount);
      } else {
        streakCount = 1;
      }
    }

    return {
      current: currentStreak,
      longest: longestStreak,
      lastReviewDate: reviewDates[0] || null,
      reviewDates,
    };
  }

  /**
   * Update review streak after completing a session
   */
  async updateReviewStreak(userId: string): Promise<number> {
    const streak = await this.getReviewStreak(userId);
    return streak.current;
  }

  /**
   * Get lightweight due counts for notifications/badges
   */
  async getDueCounts(userId: string): Promise<{
    flashcards: number;
    questions: number;
    total: number;
  }> {
    const [flashcards, questions] = await Promise.all([
      this.getFlashcardDueCount(userId),
      this.getQuestionDueCount(userId),
    ]);

    return {
      flashcards,
      questions,
      total: flashcards + questions,
    };
  }

  private async getFlashcardDueCount(userId: string): Promise<number> {
    const now = new Date().toISOString();
    const { count } = await supabase
      .from("flashcards")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .lte("srs_due", now);

    return count || 0;
  }

  private async getQuestionDueCount(userId: string): Promise<number> {
    return questionReviewService.getDueCount(userId);
  }
}

export const reviewService = new ReviewService();
