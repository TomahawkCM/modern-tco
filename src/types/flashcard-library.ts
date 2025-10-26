/**
 * Flashcard Library Types
 *
 * Type definitions for the curated flashcard library system.
 * This is SEPARATE from the user-created flashcards system (see flashcard.ts).
 *
 * HYBRID MODEL:
 * - flashcard_library: Shared curated content (500+ cards)
 * - flashcard_library_progress: User-specific progress on library cards
 * - flashcards (existing): User-created personal flashcards
 */

// =====================================================
// ENUMS & CONSTANTS
// =====================================================

/**
 * TCO exam domains aligned with certification blueprint
 */
export type FlashcardLibraryDomain =
  | 'asking_questions'
  | 'refining_targeting'
  | 'taking_action'
  | 'navigation'
  | 'reporting'
  | 'troubleshooting';

/**
 * Flashcard content categories
 */
export type FlashcardLibraryCategory =
  | 'terminology'
  | 'syntax'
  | 'best_practices'
  | 'troubleshooting'
  | 'exam_focused';

/**
 * Difficulty levels for flashcards
 */
export type FlashcardLibraryDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Source of flashcard content
 */
export type FlashcardLibrarySource =
  | 'ai_generated'
  | 'manual'
  | 'imported'
  | 'expert_curated';

/**
 * SuperMemo2 quality rating scale (0-5)
 * - 0: Complete blackout
 * - 1: Incorrect, but familiar
 * - 2: Incorrect, but almost correct
 * - 3: Correct with difficulty
 * - 4: Correct after hesitation
 * - 5: Perfect recall
 */
export type QualityRating = 0 | 1 | 2 | 3 | 4 | 5;

// =====================================================
// CORE INTERFACES
// =====================================================

/**
 * Flashcard Library Card
 * Represents a single card in the curated library (shared across all users)
 */
export interface FlashcardLibraryCard {
  id: string;

  // Content
  front: string;
  back: string;
  hint?: string | null;

  // Classification
  domain: FlashcardLibraryDomain;
  category?: FlashcardLibraryCategory | null;
  difficulty?: FlashcardLibraryDifficulty | null;

  // Metadata
  tags: string[];
  study_guide_ref?: string | null;
  source?: FlashcardLibrarySource | null;

  // Global Stats (aggregated across all users)
  total_reviews: number;
  total_correct: number;
  average_ease_factor: number;

  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * User's progress on a library flashcard
 * Tracks individual learning state using SuperMemo2 algorithm
 */
export interface FlashcardLibraryProgress {
  id: string;
  user_id: string;
  flashcard_library_id: string;

  // SuperMemo2 Algorithm Fields
  ease_factor: number; // >= 1.30
  interval_days: number; // >= 0
  repetition_number: number; // >= 0

  // Scheduling
  next_review_date: string; // ISO date string (YYYY-MM-DD)
  last_reviewed_at?: string | null; // ISO datetime string

  // Performance Tracking
  review_count: number;
  correct_count: number;
  streak: number; // Current correct streak
  longest_streak: number;

  // Quality Ratings History (0-5 scale)
  recent_ratings: QualityRating[]; // Last 10 ratings

  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Combined flashcard with progress data
 * Used for review sessions and UI display
 */
export interface FlashcardLibraryWithProgress {
  card: FlashcardLibraryCard;
  progress?: FlashcardLibraryProgress;

  // Computed fields
  isNew: boolean; // No progress record exists
  isDue: boolean; // Due for review today or overdue
  daysUntilReview?: number; // Negative if overdue
  accuracy?: number; // Percentage (0-100)
}

// =====================================================
// REVIEW SESSION TYPES
// =====================================================

/**
 * Review session configuration
 */
export interface LibraryReviewSessionConfig {
  userId: string;

  // Filters
  domains?: FlashcardLibraryDomain[];
  difficulty?: FlashcardLibraryDifficulty[];
  includeNew?: boolean; // Include cards never studied before

  // Limits
  maxCards?: number; // Default: 20
  maxNewCards?: number; // Default: 5

  // Sort order
  sortBy?: 'due_date' | 'difficulty' | 'random';
}

/**
 * Review session state
 */
export interface LibraryReviewSession {
  id: string;
  config: LibraryReviewSessionConfig;

  // Cards in session
  cards: FlashcardLibraryWithProgress[];
  currentIndex: number;

  // Session stats
  startedAt: string;
  completedAt?: string;
  totalCards: number;
  cardsReviewed: number;
  cardsCorrect: number;

  // Performance
  averageRating: number;
  timeSpentSeconds: number;
}

/**
 * Review card result (for submitting to database)
 */
export interface LibraryReviewResult {
  flashcard_library_id: string;
  quality_rating: QualityRating;
  time_spent_seconds: number;
}

// =====================================================
// API RESPONSE TYPES
// =====================================================

/**
 * SuperMemo2 algorithm response
 * Returned when updating flashcard progress
 */
export interface SM2UpdateResponse {
  next_review_date: string;
  new_interval_days: number;
  new_ease_factor: number;
}

/**
 * Due cards response
 * Returned from get_library_flashcards_due_for_review function
 */
export interface DueLibraryCard {
  flashcard_library_id: string;
  front: string;
  back: string;
  hint?: string | null;
  domain: FlashcardLibraryDomain;
  difficulty?: FlashcardLibraryDifficulty | null;
  next_review_date?: string | null;
  streak?: number | null;
}

// =====================================================
// STATISTICS & ANALYTICS
// =====================================================

/**
 * User's library flashcard statistics
 */
export interface LibraryFlashcardStats {
  userId: string;

  // Overall progress
  totalLibraryCards: number;
  cardsStarted: number; // Has progress record
  cardsCompleted: number; // Interval >= 21 days (mastered)
  cardsNotStarted: number;

  // Due today
  cardsDueToday: number;
  newCardsDueToday: number;

  // Performance
  overallAccuracy: number; // Percentage
  averageEaseFactor: number;
  currentStreak: number;
  longestStreak: number;

  // By domain
  domainStats: {
    domain: FlashcardLibraryDomain;
    total: number;
    started: number;
    accuracy: number;
  }[];

  // By difficulty
  difficultyStats: {
    difficulty: FlashcardLibraryDifficulty;
    total: number;
    started: number;
    accuracy: number;
  }[];
}

/**
 * Library flashcard leaderboard entry
 */
export interface LibraryLeaderboardEntry {
  userId: string;
  userName: string;

  // Metrics
  totalCardsReviewed: number;
  overallAccuracy: number;
  currentStreak: number;
  longestStreak: number;

  // Ranking
  rank: number;
}

// =====================================================
// FILTERS & SEARCH
// =====================================================

/**
 * Flashcard library search/filter options
 */
export interface LibraryFlashcardFilters {
  // Text search
  searchQuery?: string; // Searches front, back, tags

  // Classification filters
  domains?: FlashcardLibraryDomain[];
  categories?: FlashcardLibraryCategory[];
  difficulty?: FlashcardLibraryDifficulty[];

  // Content filters
  tags?: string[];
  source?: FlashcardLibrarySource[];

  // Progress filters (requires userId)
  userId?: string;
  showOnlyDue?: boolean;
  showOnlyNew?: boolean;
  showOnlyMastered?: boolean; // Interval >= 21 days

  // Sorting
  sortBy?: 'created_at' | 'difficulty' | 'domain' | 'total_reviews';
  sortOrder?: 'asc' | 'desc';

  // Pagination
  limit?: number;
  offset?: number;
}

/**
 * Paginated flashcard library response
 */
export interface PaginatedLibraryCards {
  cards: FlashcardLibraryCard[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// =====================================================
// CONTENT IMPORT TYPES
// =====================================================

/**
 * Bulk flashcard import data
 */
export interface BulkFlashcardImport {
  cards: Omit<FlashcardLibraryCard, 'id' | 'created_at' | 'updated_at' | 'total_reviews' | 'total_correct' | 'average_ease_factor'>[];
  source: FlashcardLibrarySource;
  sourceDescription?: string;
}

/**
 * Import result
 */
export interface FlashcardImportResult {
  success: boolean;
  totalItems: number;
  successfulItems: number;
  failedItems: number;
  importedIds: string[];
  errors?: Array<{
    index: number;
    error: string;
  }>;
}

// =====================================================
// UTILITY TYPES
// =====================================================

/**
 * Create flashcard library card (for insertion)
 */
export type CreateFlashcardLibraryCard = Omit<
  FlashcardLibraryCard,
  'id' | 'created_at' | 'updated_at' | 'total_reviews' | 'total_correct' | 'average_ease_factor'
>;

/**
 * Update flashcard library card (for updates)
 */
export type UpdateFlashcardLibraryCard = Partial<CreateFlashcardLibraryCard>;

/**
 * Flashcard library domain info with metadata
 */
export interface LibraryDomainInfo {
  domain: FlashcardLibraryDomain;
  name: string;
  description: string;
  examWeight: number; // Percentage in TCO exam (22%, 23%, etc.)
  totalCards: number;
  averageDifficulty: number; // 1-3 scale
}
