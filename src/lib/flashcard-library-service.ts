/**
 * Flashcard Library Service
 *
 * Service layer for curated flashcard library (500+ cards).
 * Provides CRUD operations, progress tracking, and SuperMemo2 scheduling.
 *
 * HYBRID MODEL INTEGRATION:
 * - This service: flashcard_library + flashcard_library_progress tables
 * - Existing system: flashcards table (user-created cards)
 * - Unified review queue: Combines both sources
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  FlashcardLibraryCard,
  FlashcardLibraryProgress,
  FlashcardLibraryWithProgress,
  LibraryFlashcardStats,
  LibraryFlashcardFilters,
  PaginatedLibraryCards,
  QualityRating,
  SM2UpdateResponse,
  DueLibraryCard,
  FlashcardLibraryDomain,
  BulkFlashcardImport,
  FlashcardImportResult,
  CreateFlashcardLibraryCard,
} from '@/types/flashcard-library';

// =====================================================
// FLASHCARD LIBRARY CRUD
// =====================================================

/**
 * Get all flashcard library cards with optional filters
 */
export async function getLibraryFlashcards(
  filters?: LibraryFlashcardFilters
): Promise<PaginatedLibraryCards> {
  const supabase = createClientComponentClient();

  let query = supabase.from('flashcard_library').select('*', { count: 'exact' });

  // Apply filters
  if (filters?.domains?.length) {
    query = query.in('domain', filters.domains);
  }
  if (filters?.categories?.length) {
    query = query.in('category', filters.categories);
  }
  if (filters?.difficulty?.length) {
    query = query.in('difficulty', filters.difficulty);
  }
  if (filters?.source?.length) {
    query = query.in('source', filters.source);
  }
  if (filters?.tags?.length) {
    query = query.overlaps('tags', filters.tags);
  }
  if (filters?.searchQuery) {
    query = query.or(
      `front.ilike.%${filters.searchQuery}%,back.ilike.%${filters.searchQuery}%`
    );
  }

  // Sorting
  const sortBy = filters?.sortBy || 'created_at';
  const sortOrder = filters?.sortOrder || 'desc';
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Pagination
  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching library flashcards:', error);
    return {
      cards: [],
      total: 0,
      limit,
      offset,
      hasMore: false,
    };
  }

  return {
    cards: data || [],
    total: count || 0,
    limit,
    offset,
    hasMore: (count || 0) > offset + limit,
  };
}

/**
 * Get single flashcard by ID
 */
export async function getLibraryFlashcard(id: string): Promise<FlashcardLibraryCard | null> {
  const supabase = createClientComponentClient();

  const { data, error } = await supabase
    .from('flashcard_library')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching library flashcard:', error);
    return null;
  }

  return data;
}

/**
 * Create new library flashcard (admin/curator only)
 */
export async function createLibraryFlashcard(
  card: CreateFlashcardLibraryCard
): Promise<FlashcardLibraryCard | null> {
  const supabase = createClientComponentClient();

  const { data, error } = await supabase
    .from('flashcard_library')
    .insert({
      ...card,
      tags: card.tags || [],
      total_reviews: 0,
      total_correct: 0,
      average_ease_factor: 2.5,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating library flashcard:', error);
    return null;
  }

  return data;
}

/**
 * Bulk import flashcards
 */
export async function bulkImportFlashcards(
  importData: BulkFlashcardImport
): Promise<FlashcardImportResult> {
  const supabase = createClientComponentClient();

  const errors: Array<{ index: number; error: string }> = [];
  const importedIds: string[] = [];

  for (let i = 0; i < importData.cards.length; i++) {
    const card = importData.cards[i];
    const { data, error } = await supabase
      .from('flashcard_library')
      .insert({
        ...card,
        source: importData.source,
        tags: card.tags || [],
        total_reviews: 0,
        total_correct: 0,
        average_ease_factor: 2.5,
      })
      .select()
      .single();

    if (error) {
      errors.push({ index: i, error: error.message });
    } else if (data) {
      importedIds.push(data.id);
    }
  }

  // Log import to content_import_logs
  await supabase.from('content_import_logs').insert({
    content_type: 'flashcards',
    import_method: importData.source === 'ai_generated' ? 'ai_generated' : 'bulk_api',
    source_description: importData.sourceDescription,
    total_items: importData.cards.length,
    successful_items: importedIds.length,
    failed_items: errors.length,
    imported_ids: importedIds,
    error_log: errors.length > 0 ? { errors } : null,
  });

  return {
    success: errors.length === 0,
    totalItems: importData.cards.length,
    successfulItems: importedIds.length,
    failedItems: errors.length,
    importedIds,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// =====================================================
// PROGRESS TRACKING
// =====================================================

/**
 * Get user's progress on a specific library flashcard
 */
export async function getLibraryFlashcardProgress(
  userId: string,
  flashcardLibraryId: string
): Promise<FlashcardLibraryProgress | null> {
  const supabase = createClientComponentClient();

  const { data, error } = await supabase
    .from('flashcard_library_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('flashcard_library_id', flashcardLibraryId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned (expected for new cards)
    console.error('Error fetching library flashcard progress:', error);
    return null;
  }

  return data || null;
}

/**
 * Update flashcard progress using SuperMemo2 algorithm
 * Calls database function update_flashcard_library_progress
 */
export async function updateLibraryFlashcardProgress(
  userId: string,
  flashcardLibraryId: string,
  qualityRating: QualityRating
): Promise<SM2UpdateResponse | null> {
  const supabase = createClientComponentClient();

  const { data, error } = await supabase.rpc('update_flashcard_library_progress', {
    p_user_id: userId,
    p_flashcard_library_id: flashcardLibraryId,
    p_quality_rating: qualityRating,
  });

  if (error) {
    console.error('Error updating library flashcard progress:', error);
    return null;
  }

  return data?.[0] || null;
}

/**
 * Get flashcards due for review
 * Calls database function get_library_flashcards_due_for_review
 */
export async function getDueLibraryFlashcards(
  userId: string,
  limit: number = 20
): Promise<DueLibraryCard[]> {
  const supabase = createClientComponentClient();

  const { data, error } = await supabase.rpc('get_library_flashcards_due_for_review', {
    p_user_id: userId,
    p_limit: limit,
  });

  if (error) {
    console.error('Error fetching due library flashcards:', error);
    return [];
  }

  return data || [];
}

/**
 * Get library flashcards with user progress
 */
export async function getLibraryFlashcardsWithProgress(
  userId: string,
  filters?: LibraryFlashcardFilters
): Promise<FlashcardLibraryWithProgress[]> {
  const supabase = createClientComponentClient();

  // Get flashcards
  const { cards } = await getLibraryFlashcards(filters);

  // Get user's progress for these cards
  const cardIds = cards.map((c) => c.id);
  const { data: progressData } = await supabase
    .from('flashcard_library_progress')
    .select('*')
    .eq('user_id', userId)
    .in('flashcard_library_id', cardIds);

  const progressMap = new Map(
    progressData?.map((p) => [p.flashcard_library_id, p]) || []
  );

  // Combine cards with progress
  const today = new Date().toISOString().split('T')[0];

  return cards.map((card) => {
    const progress = progressMap.get(card.id);
    const isNew = !progress;
    const isDue = progress ? progress.next_review_date <= today : true;
    const daysUntilReview = progress
      ? Math.ceil(
          (new Date(progress.next_review_date).getTime() - new Date(today).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;
    const accuracy =
      progress && progress.review_count > 0
        ? Math.round((progress.correct_count / progress.review_count) * 100)
        : undefined;

    return {
      card,
      progress,
      isNew,
      isDue,
      daysUntilReview: isNew ? 0 : daysUntilReview,
      accuracy,
    };
  });
}

// =====================================================
// STATISTICS & ANALYTICS
// =====================================================

/**
 * Get user's library flashcard statistics
 */
export async function getLibraryFlashcardStats(
  userId: string
): Promise<LibraryFlashcardStats | null> {
  const supabase = createClientComponentClient();

  // Total library cards
  const { count: totalLibraryCards } = await supabase
    .from('flashcard_library')
    .select('*', { count: 'exact', head: true });

  // User's progress
  const { data: progressData } = await supabase
    .from('flashcard_library_progress')
    .select('*')
    .eq('user_id', userId);

  const cardsStarted = progressData?.length || 0;
  const cardsCompleted = progressData?.filter((p) => p.interval_days >= 21).length || 0;
  const cardsNotStarted = (totalLibraryCards || 0) - cardsStarted;

  // Due today
  const today = new Date().toISOString().split('T')[0];
  const cardsDueToday =
    progressData?.filter((p) => p.next_review_date <= today).length || 0;

  // Get new cards (not started) count
  const { count: newCardsCount } = await supabase
    .from('flashcard_library')
    .select('*', { count: 'exact', head: true })
    .not('id', 'in', `(${progressData?.map((p) => p.flashcard_library_id).join(',') || 'null'})`);

  const newCardsDueToday = Math.min(newCardsCount || 0, 5); // Limit new cards per day

  // Performance metrics
  const totalReviews = progressData?.reduce((sum, p) => sum + p.review_count, 0) || 0;
  const totalCorrect = progressData?.reduce((sum, p) => sum + p.correct_count, 0) || 0;
  const overallAccuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

  const averageEaseFactor =
    cardsStarted > 0
      ? progressData!.reduce((sum, p) => sum + p.ease_factor, 0) / cardsStarted
      : 2.5;

  const currentStreak = Math.max(...(progressData?.map((p) => p.streak) || [0]));
  const longestStreak = Math.max(...(progressData?.map((p) => p.longest_streak) || [0]));

  // Domain stats
  const { data: allCards } = await supabase.from('flashcard_library').select('id, domain');
  const domainStats = calculateDomainStats(allCards || [], progressData || []);

  // Difficulty stats
  const { data: allCardsWithDifficulty } = await supabase
    .from('flashcard_library')
    .select('id, difficulty');
  const difficultyStats = calculateDifficultyStats(
    allCardsWithDifficulty || [],
    progressData || []
  );

  return {
    userId,
    totalLibraryCards: totalLibraryCards || 0,
    cardsStarted,
    cardsCompleted,
    cardsNotStarted,
    cardsDueToday,
    newCardsDueToday,
    overallAccuracy,
    averageEaseFactor,
    currentStreak,
    longestStreak,
    domainStats,
    difficultyStats,
  };
}

// =====================================================
// UNIFIED REVIEW QUEUE
// =====================================================

/**
 * Get unified review queue combining library flashcards and user-created flashcards
 */
export async function getUnifiedReviewQueue(userId: string, limit: number = 20) {
  const supabase = createClientComponentClient();

  // Get library flashcards due
  const libraryCards = await getDueLibraryFlashcards(userId, limit / 2);

  // Get user-created flashcards due (from existing flashcards table)
  const today = new Date().toISOString();
  const { data: userCards } = await supabase
    .from('flashcards')
    .select('*')
    .eq('user_id', userId)
    .lte('srs_due', today)
    .limit(limit / 2);

  // Combine and shuffle
  const combinedQueue = [
    ...libraryCards.map((card) => ({
      ...card,
      source: 'library' as const,
      id: card.flashcard_library_id,
    })),
    ...((userCards || []).map((card) => ({
      ...card,
      source: 'user_created' as const,
      front: card.front_text,
      back: card.back_text,
    })) || []),
  ];

  return shuffleArray(combinedQueue).slice(0, limit);
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Calculate domain statistics
 */
function calculateDomainStats(
  allCards: Array<{ id: string; domain: FlashcardLibraryDomain }>,
  progressData: FlashcardLibraryProgress[]
) {
  const domains: FlashcardLibraryDomain[] = [
    'asking_questions',
    'refining_targeting',
    'taking_action',
    'navigation',
    'reporting',
  ];

  return domains.map((domain) => {
    const domainCards = allCards.filter((c) => c.domain === domain);
    const domainProgress = progressData.filter((p) =>
      domainCards.some((c) => c.id === p.flashcard_library_id)
    );

    const total = domainCards.length;
    const started = domainProgress.length;
    const totalReviews = domainProgress.reduce((sum, p) => sum + p.review_count, 0);
    const totalCorrect = domainProgress.reduce((sum, p) => sum + p.correct_count, 0);
    const accuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

    return { domain, total, started, accuracy };
  });
}

/**
 * Calculate difficulty statistics
 */
function calculateDifficultyStats(
  allCards: Array<{ id: string; difficulty: string | null }>,
  progressData: FlashcardLibraryProgress[]
) {
  const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];

  return difficulties.map((difficulty) => {
    const difficultyCards = allCards.filter((c) => c.difficulty === difficulty);
    const difficultyProgress = progressData.filter((p) =>
      difficultyCards.some((c) => c.id === p.flashcard_library_id)
    );

    const total = difficultyCards.length;
    const started = difficultyProgress.length;
    const totalReviews = difficultyProgress.reduce((sum, p) => sum + p.review_count, 0);
    const totalCorrect = difficultyProgress.reduce((sum, p) => sum + p.correct_count, 0);
    const accuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

    return { difficulty, total, started, accuracy };
  });
}

/**
 * Shuffle array (Fisher-Yates)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
