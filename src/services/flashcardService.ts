// Flashcard Service - Active Recall & Spaced Repetition
// Integrates SM-2 algorithm with Supabase storage

import { supabase } from "@/lib/supabase";
import { schedule, type SRRating } from "@/lib/sr";
import type {
  Flashcard,
  FlashcardReview,
  FlashcardDeck,
  FlashcardStats,
  FlashcardType,
  FlashcardSource,
  AutoGenerateOptions,
  toSRCardState,
  fromSRCardState,
} from "@/types/flashcard";
import { toSRCardState as convertToSRS, fromSRCardState as convertFromSRS } from "@/types/flashcard";

class FlashcardService {
  // ==================== FLASHCARD CRUD ====================

  async createFlashcard(
    userId: string,
    front: string,
    back: string,
    options?: {
      type?: FlashcardType;
      source?: FlashcardSource;
      moduleId?: string;
      sectionId?: string;
      questionId?: string;
      hint?: string;
      explanation?: string;
      imageUrl?: string;
      tags?: string[];
    }
  ): Promise<Flashcard | null> {
    const { data, error } = await supabase
      .from("flashcards")
      .insert({
        user_id: userId,
        front_text: front,
        back_text: back,
        card_type: options?.type || 'basic',
        source: options?.source || 'manual',
        module_id: options?.moduleId,
        section_id: options?.sectionId,
        question_id: options?.questionId,
        hint: options?.hint,
        explanation: options?.explanation,
        image_url: options?.imageUrl,
        tags: options?.tags || [],
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating flashcard:", error);
      return null;
    }

    return data as Flashcard;
  }

  async getFlashcard(flashcardId: string): Promise<Flashcard | null> {
    const { data, error } = await supabase
      .from("flashcards")
      .select()
      .eq("id", flashcardId)
      .single();

    if (error || !data) return null;
    return data as Flashcard;
  }

  async getUserFlashcards(userId: string): Promise<Flashcard[]> {
    const { data, error } = await supabase
      .from("flashcards")
      .select()
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as Flashcard[];
  }

  async getFlashcardsByModule(userId: string, moduleId: string): Promise<Flashcard[]> {
    const { data, error } = await supabase
      .from("flashcards")
      .select()
      .eq("user_id", userId)
      .eq("module_id", moduleId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as Flashcard[];
  }

  async updateFlashcard(flashcardId: string, updates: Partial<Flashcard>): Promise<boolean> {
    const { error } = await supabase
      .from("flashcards")
      .update(updates)
      .eq("id", flashcardId);

    return !error;
  }

  async deleteFlashcard(flashcardId: string): Promise<boolean> {
    const { error } = await supabase
      .from("flashcards")
      .delete()
      .eq("id", flashcardId);

    return !error;
  }

  // ==================== SRS (SPACED REPETITION) ====================

  async getDueFlashcards(userId: string, limit: number = 20): Promise<Flashcard[]> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("flashcards")
      .select()
      .eq("user_id", userId)
      .lte("srs_due", now)
      .order("srs_due", { ascending: true })
      .limit(limit);

    if (error || !data) return [];
    return data as Flashcard[];
  }

  async reviewFlashcard(
    flashcardId: string,
    userId: string,
    rating: SRRating,
    timeSpentSeconds: number
  ): Promise<{ flashcard: Flashcard; review: FlashcardReview } | null> {
    // Get current flashcard
    const flashcard = await this.getFlashcard(flashcardId);
    if (!flashcard || flashcard.user_id !== userId) return null;

    // Convert to SRS state and schedule next review
    const currentState = convertToSRS(flashcard);
    const newState = schedule(currentState, rating, new Date());

    // Calculate new SRS values
    const srsUpdates = convertFromSRS(flashcard, newState);

    // Update performance metrics
    const isCorrect = rating === 'good' || rating === 'easy';
    const newTotalReviews = flashcard.total_reviews + 1;
    const newCorrectReviews = flashcard.correct_reviews + (isCorrect ? 1 : 0);

    // Update average recall time (weighted average)
    const avgTime = flashcard.average_recall_time_seconds || 0;
    const newAvgTime = Math.round(
      (avgTime * flashcard.total_reviews + timeSpentSeconds) / newTotalReviews
    );

    // Update flashcard in database
    const { data: updatedFlashcard, error: updateError } = await supabase
      .from("flashcards")
      .update({
        ...srsUpdates,
        total_reviews: newTotalReviews,
        correct_reviews: newCorrectReviews,
        average_recall_time_seconds: newAvgTime,
        last_reviewed_at: new Date().toISOString(),
      })
      .eq("id", flashcardId)
      .select()
      .single();

    if (updateError || !updatedFlashcard) {
      console.error("Error updating flashcard:", updateError);
      return null;
    }

    // Record review in history
    const { data: review, error: reviewError } = await supabase
      .from("flashcard_reviews")
      .insert({
        flashcard_id: flashcardId,
        user_id: userId,
        rating,
        time_spent_seconds: timeSpentSeconds,
        srs_interval_before: flashcard.srs_interval,
        srs_interval_after: srsUpdates.srs_interval,
        srs_ease_before: flashcard.srs_ease,
        srs_ease_after: srsUpdates.srs_ease,
      })
      .select()
      .single();

    if (reviewError) {
      console.error("Error creating review:", reviewError);
    }

    return {
      flashcard: updatedFlashcard as Flashcard,
      review: review as FlashcardReview,
    };
  }

  async getNewFlashcards(userId: string, limit: number = 5): Promise<Flashcard[]> {
    const { data, error } = await supabase
      .from("flashcards")
      .select()
      .eq("user_id", userId)
      .eq("srs_reps", 0)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as Flashcard[];
  }

  async getFlashcardStats(userId: string): Promise<FlashcardStats> {
    const { data: allCards } = await supabase
      .from("flashcards")
      .select()
      .eq("user_id", userId);

    if (!allCards || allCards.length === 0) {
      return {
        totalCards: 0,
        dueToday: 0,
        newCards: 0,
        learningCards: 0,
        matureCards: 0,
        avgRetentionRate: 0,
        longestStreak: 0,
        currentStreak: 0,
      };
    }

    const cards = allCards as Flashcard[];
    const now = new Date().toISOString();

    const totalCards = cards.length;
    const dueToday = cards.filter(c => c.srs_due <= now).length;
    const newCards = cards.filter(c => c.srs_reps === 0).length;
    const learningCards = cards.filter(c => c.srs_reps > 0 && c.srs_reps < 2).length;
    const matureCards = cards.filter(c => c.srs_reps >= 2).length;

    const totalReviews = cards.reduce((sum, c) => sum + c.total_reviews, 0);
    const totalCorrect = cards.reduce((sum, c) => sum + c.correct_reviews, 0);
    const avgRetentionRate = totalReviews > 0 ? (totalCorrect / totalReviews) * 100 : 0;

    // Get streak info from review history
    const { data: reviews } = await supabase
      .from("flashcard_reviews")
      .select("reviewed_at")
      .eq("user_id", userId)
      .order("reviewed_at", { ascending: false });

    const streaks = this.calculateStreaks(reviews?.map(r => r.reviewed_at) || []);

    return {
      totalCards,
      dueToday,
      newCards,
      learningCards,
      matureCards,
      avgRetentionRate: Math.round(avgRetentionRate),
      longestStreak: streaks.longest,
      currentStreak: streaks.current,
    };
  }

  // ==================== DECK MANAGEMENT ====================

  async createDeck(
    userId: string,
    name: string,
    options?: {
      description?: string;
      domain?: string;
      dailyNewLimit?: number;
      dailyReviewLimit?: number;
    }
  ): Promise<FlashcardDeck | null> {
    const { data, error } = await supabase
      .from("flashcard_decks")
      .insert({
        user_id: userId,
        name,
        description: options?.description,
        domain: options?.domain,
        daily_new_cards_limit: options?.dailyNewLimit || 20,
        daily_review_limit: options?.dailyReviewLimit || 100,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating deck:", error);
      return null;
    }

    return data as FlashcardDeck;
  }

  async addCardToDeck(deckId: string, flashcardId: string): Promise<boolean> {
    const { error } = await supabase
      .from("flashcard_deck_cards")
      .insert({
        deck_id: deckId,
        flashcard_id: flashcardId,
      });

    return !error;
  }

  async getDecks(userId: string): Promise<FlashcardDeck[]> {
    const { data, error } = await supabase
      .from("flashcard_decks")
      .select()
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as FlashcardDeck[];
  }

  async getDeckCards(deckId: string): Promise<Flashcard[]> {
    const { data, error } = await supabase
      .from("flashcard_deck_cards")
      .select(`
        flashcard_id,
        flashcards(*)
      `)
      .eq("deck_id", deckId);

    if (error || !data) return [];
    return data.map((item: any) => item.flashcards).filter(Boolean) as Flashcard[];
  }

  // ==================== AUTO-GENERATION ====================

  async autoGenerateFromModule(userId: string, moduleId: string): Promise<Flashcard[]> {
    // Get module learning objectives
    const { data: module } = await supabase
      .from("study_modules")
      .select("learning_objectives, title, domain")
      .eq("id", moduleId)
      .single();

    if (!module || !module.learning_objectives) return [];

    const objectives = Array.isArray(module.learning_objectives)
      ? module.learning_objectives
      : [];

    const createdCards: Flashcard[] = [];

    for (const objective of objectives) {
      const card = await this.createFlashcard(
        userId,
        `Explain: ${objective}`,
        `Review the "${module.title}" module for details on this learning objective.`,
        {
          type: 'concept',
          source: 'auto_generated',
          moduleId,
          tags: [module.domain, 'learning-objective'],
        }
      );

      if (card) createdCards.push(card);
    }

    return createdCards;
  }

  async generateFromQuizFailure(
    userId: string,
    questionId: string,
    question: string,
    correctAnswer: string,
    explanation?: string
  ): Promise<Flashcard | null> {
    return this.createFlashcard(
      userId,
      question,
      correctAnswer,
      {
        type: 'basic',
        source: 'quiz_failure',
        questionId,
        explanation,
        tags: ['quiz-remediation'],
      }
    );
  }

  // ==================== HELPER METHODS ====================

  private calculateStreaks(reviewDates: string[]): { longest: number; current: number } {
    if (reviewDates.length === 0) return { longest: 0, current: 0 };

    // Group reviews by day
    const reviewDays = new Set(
      reviewDates.map(date => new Date(date).toDateString())
    );

    const sortedDays = Array.from(reviewDays).sort((a, b) =>
      new Date(b).getTime() - new Date(a).getTime()
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let streakCount = 0;
    let prevDate = new Date(sortedDays[0]);

    for (const dayStr of sortedDays) {
      const day = new Date(dayStr);
      const diffDays = Math.floor(
        (prevDate.getTime() - day.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays <= 1) {
        streakCount++;
        longestStreak = Math.max(longestStreak, streakCount);
      } else {
        streakCount = 1;
      }

      prevDate = day;
    }

    // Calculate current streak
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (sortedDays[0] === today || sortedDays[0] === yesterday) {
      currentStreak = 1;
      for (let i = 1; i < sortedDays.length; i++) {
        const prevDay = new Date(sortedDays[i - 1]);
        const currDay = new Date(sortedDays[i]);
        const diff = Math.floor(
          (prevDay.getTime() - currDay.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diff === 1) currentStreak++;
        else break;
      }
    }

    return { longest: longestStreak, current: currentStreak };
  }
}

export const flashcardService = new FlashcardService();
