// Flashcard types for Active Recall & Spaced Repetition System
// Implements SM-2 algorithm with multi-format card support

import type { SRCardState, SRRating } from "@/lib/sr";

export type FlashcardType = 'basic' | 'cloze' | 'concept' | 'diagram' | 'code';
export type FlashcardSource = 'manual' | 'auto_generated' | 'quiz_failure' | 'video_concept';

export interface Flashcard {
  id: string;
  user_id: string;

  // Content
  front_text: string;
  back_text: string;
  card_type: FlashcardType;

  // Source tracking
  source: FlashcardSource;
  module_id?: string;
  section_id?: string;
  question_id?: string;

  // Additional content
  hint?: string;
  explanation?: string;
  image_url?: string;
  tags: string[];

  // SRS (Spaced Repetition System) state
  srs_due: string; // ISO timestamp
  srs_interval: number; // days
  srs_ease: number;
  srs_reps: number;
  srs_lapses: number;

  // Metadata
  created_at: string;
  updated_at: string;
  last_reviewed_at?: string;

  // Performance tracking
  total_reviews: number;
  correct_reviews: number;
  average_recall_time_seconds?: number;
}

export interface FlashcardReview {
  id: string;
  flashcard_id: string;
  user_id: string;

  // Review details
  rating: SRRating; // 'again', 'hard', 'good', 'easy'
  time_spent_seconds: number;
  reviewed_at: string;

  // SRS state snapshots
  srs_interval_before?: number;
  srs_interval_after?: number;
  srs_ease_before?: number;
  srs_ease_after?: number;
}

export interface FlashcardDeck {
  id: string;
  user_id: string;

  // Deck details
  name: string;
  description?: string;
  domain?: string; // TCO domain

  // Settings
  daily_new_cards_limit: number;
  daily_review_limit: number;
  is_active: boolean;

  created_at: string;
  updated_at: string;
}

export interface FlashcardDeckCard {
  id: string;
  deck_id: string;
  flashcard_id: string;
  added_at: string;
}

// UI/UX types
export interface FlashcardReviewSession {
  sessionId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  cardsReviewed: number;
  cardsCorrect: number;
  avgTimePerCard: number;
  deckId?: string;
}

export interface FlashcardStats {
  totalCards: number;
  dueToday: number;
  newCards: number;
  learningCards: number; // cards with srs_reps < 2
  matureCards: number; // cards with srs_reps >= 2
  avgRetentionRate: number; // correct_reviews / total_reviews
  longestStreak: number;
  currentStreak: number;
}

// Auto-generation helpers
export interface FlashcardTemplate {
  front: string;
  back: string;
  type: FlashcardType;
  hint?: string;
  explanation?: string;
}

export interface AutoGenerateOptions {
  moduleId?: string;
  sectionId?: string;
  learningObjectives?: string[];
  keyTerms?: Array<{ term: string; definition: string }>;
  codeExamples?: Array<{ code: string; explanation: string }>;
}

// SRS scheduling helpers
export interface SRSSchedule {
  nextReviewDate: Date;
  intervalDays: number;
  ease: number;
  isNew: boolean;
  isLearning: boolean;
  isMature: boolean;
}

// Convert between database and UI formats
export function toSRCardState(flashcard: Flashcard): SRCardState {
  return {
    id: flashcard.id,
    due: new Date(flashcard.srs_due).getTime(),
    interval: flashcard.srs_interval,
    ease: flashcard.srs_ease,
    reps: flashcard.srs_reps,
    lapses: flashcard.srs_lapses,
  };
}

export function fromSRCardState(flashcard: Flashcard, state: SRCardState): Partial<Flashcard> {
  return {
    srs_due: new Date(state.due).toISOString(),
    srs_interval: state.interval,
    srs_ease: state.ease,
    srs_reps: state.reps,
    srs_lapses: state.lapses,
  };
}
