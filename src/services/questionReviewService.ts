// Question Review Service - Spaced Repetition for Practice Exam Questions
// Extends SM-2 algorithm from flashcards to assessment questions

import { supabase } from "@/lib/supabase";
import { schedule, type SRRating } from "@/lib/sr";
import type { Question } from "@/types/assessment";

// ==================== TYPES ====================

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
    avgMastery: number;
  }>;
}

// Convert between database and SM-2 algorithm
function toSRCardState(review: QuestionReview) {
  return {
    id: review.id,
    due: new Date(review.srs_due).getTime(),
    interval: review.srs_interval,
    ease: review.srs_ease,
    reps: review.srs_reps,
    lapses: review.srs_lapses,
  };
}

function fromSRCardState(state: ReturnType<typeof schedule>): Partial<QuestionReview> {
  return {
    srs_due: new Date(state.due).toISOString(),
    srs_interval: state.interval,
    srs_ease: state.ease,
    srs_reps: state.reps,
    srs_lapses: state.lapses,
  };
}

class QuestionReviewService {
  // ==================== REVIEW CRUD ====================

  /**
   * Get or create a review record for a question
   * (Questions start with a review record on first encounter)
   */
  async getOrCreateReview(userId: string, questionId: string): Promise<QuestionReview | null> {
    // Try to get existing review
    const { data: existing, error: getError } = await supabase
      .from("question_reviews")
      .select()
      .eq("user_id", userId)
      .eq("question_id", questionId)
      .single();

    if (existing && !getError) return existing as QuestionReview;

    // Create new review record
    const { data: newReview, error: createError } = await supabase
      .from("question_reviews")
      .insert({
        user_id: userId,
        question_id: questionId,
        // Defaults: srs_due = NOW(), interval = 0, ease = 2.5, reps = 0
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating question review:", createError);
      return null;
    }

    return newReview as QuestionReview;
  }

  async getReview(reviewId: string): Promise<QuestionReview | null> {
    const { data, error } = await supabase
      .from("question_reviews")
      .select()
      .eq("id", reviewId)
      .single();

    if (error || !data) return null;
    return data as QuestionReview;
  }

  async getUserReviews(userId: string): Promise<QuestionReview[]> {
    const { data, error } = await supabase
      .from("question_reviews")
      .select()
      .eq("user_id", userId)
      .order("last_reviewed_at", { ascending: false, nullsFirst: false });

    if (error || !data) return [];
    return data as QuestionReview[];
  }

  // ==================== SRS (SPACED REPETITION) ====================

  /**
   * Get questions due for review
   */
  async getDueQuestions(userId: string, limit: number = 20): Promise<QuestionReview[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("question_reviews")
      .select()
      .eq("user_id", userId)
      .lte("srs_due", now)
      .order("srs_due", { ascending: true })
      .limit(limit);

    if (error || !data) return [];
    return data as QuestionReview[];
  }

  /**
   * Record a question review attempt and update SRS scheduling
   */
  async reviewQuestion(
    questionId: string,
    userId: string,
    isCorrect: boolean,
    timeSpentSeconds: number
  ): Promise<{ review: QuestionReview; attempt: QuestionReviewAttempt } | null> {
    // Get or create review record
    const review = await this.getOrCreateReview(userId, questionId);
    if (!review) return null;

    // Calculate rating based on correctness and performance history
    const rating = this.calculateRating(isCorrect, review.mastery_level, review.srs_reps);

    // Convert to SRS state and schedule next review
    const currentState = toSRCardState(review);
    const newState = schedule(currentState, rating, new Date());

    // Calculate new SRS values
    const srsUpdates = fromSRCardState(newState);

    // Update performance metrics
    const newTotalAttempts = review.total_attempts + 1;
    const newCorrectAttempts = review.correct_attempts + (isCorrect ? 1 : 0);

    // Update average time (weighted average)
    const avgTime = review.average_time_seconds || 0;
    const newAvgTime = Math.round(
      (avgTime * review.total_attempts + timeSpentSeconds) / newTotalAttempts
    );

    // Update review in database
    const { data: updatedReview, error: updateError } = await supabase
      .from("question_reviews")
      .update({
        ...srsUpdates,
        total_attempts: newTotalAttempts,
        correct_attempts: newCorrectAttempts,
        average_time_seconds: newAvgTime,
        last_reviewed_at: new Date().toISOString(),
      })
      .eq("id", review.id)
      .select()
      .single();

    if (updateError || !updatedReview) {
      console.error("Error updating question review:", updateError);
      return null;
    }

    // Record attempt in history
    const { data: attempt, error: attemptError } = await supabase
      .from("question_review_attempts")
      .insert({
        review_id: review.id,
        user_id: userId,
        question_id: questionId,
        is_correct: isCorrect,
        time_spent_seconds: timeSpentSeconds,
        rating,
        srs_interval_before: review.srs_interval,
        srs_interval_after: srsUpdates.srs_interval,
        srs_ease_before: review.srs_ease,
        srs_ease_after: srsUpdates.srs_ease,
      })
      .select()
      .single();

    if (attemptError) {
      console.error("Error creating review attempt:", attemptError);
    }

    return {
      review: updatedReview as QuestionReview,
      attempt: attempt as QuestionReviewAttempt,
    };
  }

  /**
   * Calculate SM-2 rating based on correctness and mastery
   */
  private calculateRating(
    isCorrect: boolean,
    masteryLevel: number,
    currentReps: number
  ): SRRating {
    if (!isCorrect) {
      return 'again'; // Wrong answer = reset interval
    }

    // Correct answer - determine difficulty
    if (currentReps === 0) {
      // First time correct = 'good'
      return 'good';
    }

    if (masteryLevel >= 0.9) {
      // High mastery + correct = 'easy'
      return 'easy';
    } else if (masteryLevel >= 0.7) {
      // Good mastery + correct = 'good'
      return 'good';
    } else {
      // Struggling but correct = 'hard'
      return 'hard';
    }
  }

  /**
   * Get new questions (never reviewed)
   */
  async getNewQuestions(userId: string, limit: number = 10): Promise<QuestionReview[]> {
    const { data, error } = await supabase
      .from("question_reviews")
      .select()
      .eq("user_id", userId)
      .eq("srs_reps", 0)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as QuestionReview[];
  }

  /**
   * Get mastery level for a specific question
   */
  async getMasteryLevel(userId: string, questionId: string): Promise<number> {
    const review = await this.getOrCreateReview(userId, questionId);
    if (!review) return 0;
    return review.mastery_level;
  }

  /**
   * Get questions below mastery threshold (for targeted practice)
   */
  async getWeakQuestions(
    userId: string,
    masteryThreshold: number = 0.7,
    limit: number = 20
  ): Promise<QuestionReview[]> {
    const { data, error } = await supabase
      .from("question_reviews")
      .select()
      .eq("user_id", userId)
      .lt("mastery_level", masteryThreshold)
      .order("mastery_level", { ascending: true })
      .limit(limit);

    if (error || !data) return [];
    return data as QuestionReview[];
  }

  // ==================== STATISTICS ====================

  /**
   * Get comprehensive question review statistics
   */
  async getQuestionStats(userId: string): Promise<QuestionReviewStats> {
    const { data: allReviews } = await supabase
      .from("question_reviews")
      .select()
      .eq("user_id", userId);

    if (!allReviews || allReviews.length === 0) {
      return {
        totalQuestions: 0,
        dueToday: 0,
        newQuestions: 0,
        learningQuestions: 0,
        masteredQuestions: 0,
        avgMasteryLevel: 0,
        questionsByDomain: {},
      };
    }

    const reviews = allReviews as QuestionReview[];
    const now = new Date().toISOString();

    const totalQuestions = reviews.length;
    const dueToday = reviews.filter(r => r.srs_due <= now).length;
    const newQuestions = reviews.filter(r => r.srs_reps === 0).length;
    const learningQuestions = reviews.filter(r => r.srs_reps > 0 && r.srs_reps < 2).length;
    const masteredQuestions = reviews.filter(r => r.srs_reps >= 2 && r.mastery_level >= 0.8).length;

    const totalMastery = reviews.reduce((sum, r) => sum + r.mastery_level, 0);
    const avgMasteryLevel = (totalMastery / totalQuestions) * 100;

    // Get question domains for breakdown
    const { data: questions } = await supabase
      .from("questions")
      .select("id, domain")
      .in("id", reviews.map(r => r.question_id));

    const questionDomainMap = new Map(
      (questions || []).map((q: any) => [q.id, q.domain])
    );

    const questionsByDomain: Record<string, {
      total: number;
      due: number;
      avgMastery: number;
    }> = {};

    for (const review of reviews) {
      const domain = questionDomainMap.get(review.question_id) || 'Unknown';
      if (!questionsByDomain[domain]) {
        questionsByDomain[domain] = { total: 0, due: 0, avgMastery: 0 };
      }

      questionsByDomain[domain].total++;
      if (review.srs_due <= now) {
        questionsByDomain[domain].due++;
      }
      questionsByDomain[domain].avgMastery += review.mastery_level;
    }

    // Calculate average mastery per domain
    for (const domain in questionsByDomain) {
      questionsByDomain[domain].avgMastery =
        (questionsByDomain[domain].avgMastery / questionsByDomain[domain].total) * 100;
    }

    return {
      totalQuestions,
      dueToday,
      newQuestions,
      learningQuestions,
      masteredQuestions,
      avgMasteryLevel: Math.round(avgMasteryLevel),
      questionsByDomain,
    };
  }

  /**
   * Get review attempts for a specific question
   */
  async getQuestionAttempts(questionId: string, userId: string): Promise<QuestionReviewAttempt[]> {
    const { data, error } = await supabase
      .from("question_review_attempts")
      .select()
      .eq("user_id", userId)
      .eq("question_id", questionId)
      .order("attempted_at", { ascending: false });

    if (error || !data) return [];
    return data as QuestionReviewAttempt[];
  }

  /**
   * Get due count (lightweight query for badges/notifications)
   */
  async getDueCount(userId: string): Promise<number> {
    const now = new Date().toISOString();
    const { count, error } = await supabase
      .from("question_reviews")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .lte("srs_due", now);

    if (error) return 0;
    return count || 0;
  }
}

export const questionReviewService = new QuestionReviewService();
