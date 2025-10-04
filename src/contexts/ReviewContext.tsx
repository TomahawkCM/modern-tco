"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { reviewService } from "@/services/reviewService";
import { questionReviewService } from "@/services/questionReviewService";
import { flashcardService } from "@/services/flashcardService";
import { analytics } from "@/lib/analytics";
import type {
  ReviewQueueItem,
  ReviewSession,
  ReviewSessionType,
  DailyReviewStats,
  ReviewStreak,
  StudySessionState,
  DueCardsBadgeData,
} from "@/types/review";
import type { SRRating } from "@/lib/sr";

// ==================== CONTEXT TYPE ====================

interface ReviewContextType {
  // State
  stats: DailyReviewStats | null;
  streak: ReviewStreak | null;
  queue: ReviewQueueItem[];
  dueCounts: DueCardsBadgeData | null;
  activeSession: StudySessionState | null;
  isLoading: boolean;
  error: string | null;

  // Queue Management
  loadQueue: (type: ReviewSessionType, limit?: number) => Promise<void>;
  refreshQueue: () => Promise<void>;
  clearQueue: () => void;

  // Session Management
  startSession: (type: ReviewSessionType, targetMinutes?: number) => Promise<ReviewSession | null>;
  completeSession: () => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;

  // Review Actions
  reviewFlashcard: (flashcardId: string, rating: SRRating, timeSpent: number) => Promise<void>;
  reviewQuestion: (questionId: string, isCorrect: boolean, timeSpent: number) => Promise<void>;
  nextItem: () => void;

  // Statistics
  refreshStats: () => Promise<void>;
  refreshStreak: () => Promise<void>;
  refreshDueCounts: () => Promise<void>;

  // Analytics
  trackReviewEvent: (eventType: string, data?: Record<string, any>) => void;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

// ==================== PROVIDER ====================

export function ReviewProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // State
  const [stats, setStats] = useState<DailyReviewStats | null>(null);
  const [streak, setStreak] = useState<ReviewStreak | null>(null);
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);
  const [dueCounts, setDueCounts] = useState<DueCardsBadgeData | null>(null);
  const [activeSession, setActiveSession] = useState<StudySessionState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentSessionType, setCurrentSessionType] = useState<ReviewSessionType>('mixed');

  // ==================== QUEUE MANAGEMENT ====================

  const loadQueue = useCallback(async (type: ReviewSessionType, limit: number = 40) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      let queueItems: ReviewQueueItem[];

      switch (type) {
        case 'flashcards':
          queueItems = await reviewService.getFlashcardQueue(user.id, limit);
          break;
        case 'questions':
          queueItems = await reviewService.getQuestionQueue(user.id, limit);
          break;
        case 'mixed':
          queueItems = await reviewService.getMixedQueue(user.id, limit);
          break;
        default:
          queueItems = await reviewService.getUnifiedReviewQueue(user.id, limit);
      }

      setQueue(queueItems);
      setCurrentSessionType(type);
    } catch (err) {
      console.error("Error loading review queue:", err);
      setError("Failed to load review queue");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const refreshQueue = useCallback(async () => {
    await loadQueue(currentSessionType);
  }, [loadQueue, currentSessionType]);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  // ==================== SESSION MANAGEMENT ====================

  const startSession = useCallback(async (
    type: ReviewSessionType,
    targetMinutes?: number
  ): Promise<ReviewSession | null> => {
    if (!user) return null;

    setIsLoading(true);
    setError(null);

    try {
      // Start session in database
      const session = await reviewService.startSession(user.id, type, targetMinutes);
      if (!session) throw new Error("Failed to create session");

      // Load queue
      await loadQueue(type);

      // Initialize session state
      setActiveSession({
        session,
        queue: [],
        currentIndex: 0,
        startTime: new Date(),
        elapsedSeconds: 0,
        isActive: true,
        isPaused: false,
        reviewed: 0,
        correct: 0,
        flashcardsReviewed: 0,
        questionsReviewed: 0,
      });

      // Track analytics
      trackReviewEvent('review_session_started', {
        sessionType: type,
        targetDuration: targetMinutes,
        queueSize: queue.length,
      });

      return session;
    } catch (err) {
      console.error("Error starting session:", err);
      setError("Failed to start review session");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, queue.length, loadQueue]);

  const completeSession = useCallback(async () => {
    if (!activeSession || !activeSession.session) return;

    try {
      const duration = Math.floor(
        ((new Date().getTime() - (activeSession.startTime?.getTime() || 0)) / 1000)
      );

      await reviewService.completeSession(activeSession.session.id, {
        flashcardsReviewed: activeSession.flashcardsReviewed,
        questionsReviewed: activeSession.questionsReviewed,
        correctCount: activeSession.correct,
        totalCount: activeSession.reviewed,
        actualDurationSeconds: duration,
      });

      // Track analytics
      trackReviewEvent('review_session_completed', {
        sessionId: activeSession.session.id,
        sessionType: activeSession.session.session_type,
        duration,
        itemsReviewed: activeSession.reviewed,
        accuracy: activeSession.reviewed > 0 ? (activeSession.correct / activeSession.reviewed) * 100 : 0,
        flashcardsReviewed: activeSession.flashcardsReviewed,
        questionsReviewed: activeSession.questionsReviewed,
      });

      // Refresh stats and streak
      await Promise.all([
        refreshStats(),
        refreshStreak(),
        refreshDueCounts(),
      ]);

      // Clear session
      setActiveSession(null);
      clearQueue();
    } catch (err) {
      console.error("Error completing session:", err);
      setError("Failed to complete session");
    }
  }, [activeSession]);

  const pauseSession = useCallback(() => {
    if (!activeSession) return;
    setActiveSession({
      ...activeSession,
      isPaused: true,
      isActive: false,
    });
  }, [activeSession]);

  const resumeSession = useCallback(() => {
    if (!activeSession) return;
    setActiveSession({
      ...activeSession,
      isPaused: false,
      isActive: true,
    });
  }, [activeSession]);

  // ==================== REVIEW ACTIONS ====================

  const reviewFlashcard = useCallback(async (
    flashcardId: string,
    rating: SRRating,
    timeSpent: number
  ) => {
    if (!user) return;

    try {
      const result = await flashcardService.reviewFlashcard(
        flashcardId,
        user.id,
        rating,
        timeSpent
      );

      if (result && activeSession) {
        const isCorrect = rating === 'good' || rating === 'easy';
        setActiveSession({
          ...activeSession,
          reviewed: activeSession.reviewed + 1,
          correct: activeSession.correct + (isCorrect ? 1 : 0),
          flashcardsReviewed: activeSession.flashcardsReviewed + 1,
          currentIndex: activeSession.currentIndex + 1,
        });

        // Track analytics
        trackReviewEvent('flashcard_reviewed', {
          flashcardId,
          rating,
          timeSpent,
          newInterval: result.flashcard.srs_interval,
        });
      }
    } catch (err) {
      console.error("Error reviewing flashcard:", err);
      setError("Failed to review flashcard");
    }
  }, [user, activeSession]);

  const reviewQuestion = useCallback(async (
    questionId: string,
    isCorrect: boolean,
    timeSpent: number
  ) => {
    if (!user) return;

    try {
      const result = await questionReviewService.reviewQuestion(
        questionId,
        user.id,
        isCorrect,
        timeSpent
      );

      if (result && activeSession) {
        setActiveSession({
          ...activeSession,
          reviewed: activeSession.reviewed + 1,
          correct: activeSession.correct + (isCorrect ? 1 : 0),
          questionsReviewed: activeSession.questionsReviewed + 1,
          currentIndex: activeSession.currentIndex + 1,
        });

        // Track analytics
        trackReviewEvent('question_reviewed', {
          questionId,
          isCorrect,
          timeSpent,
          masteryLevel: result.review.mastery_level,
          newInterval: result.review.srs_interval,
        });
      }
    } catch (err) {
      console.error("Error reviewing question:", err);
      setError("Failed to review question");
    }
  }, [user, activeSession]);

  const nextItem = useCallback(() => {
    if (!activeSession) return;
    setActiveSession({
      ...activeSession,
      currentIndex: activeSession.currentIndex + 1,
    });
  }, [activeSession]);

  // ==================== STATISTICS ====================

  const refreshStats = useCallback(async () => {
    if (!user) return;

    try {
      const newStats = await reviewService.getDailyReviewStats(user.id);
      setStats(newStats);
    } catch (err) {
      console.error("Error refreshing stats:", err);
    }
  }, [user]);

  const refreshStreak = useCallback(async () => {
    if (!user) return;

    try {
      const newStreak = await reviewService.getReviewStreak(user.id);
      setStreak(newStreak);
    } catch (err) {
      console.error("Error refreshing streak:", err);
    }
  }, [user]);

  const refreshDueCounts = useCallback(async () => {
    if (!user) return;

    try {
      const counts = await reviewService.getDueCounts(user.id);

      // Calculate high priority count (top 20% of queue)
      const queue = await reviewService.getUnifiedReviewQueue(user.id, 50);
      const highPriorityThreshold = queue.length > 0
        ? queue[Math.floor(queue.length * 0.2)]?.priorityScore || 0
        : 0;
      const highPriorityCount = queue.filter(item => item.priorityScore >= highPriorityThreshold).length;

      setDueCounts({
        totalDue: counts.total,
        flashcardsDue: counts.flashcards,
        questionsDue: counts.questions,
        highPriorityCount,
      });
    } catch (err) {
      console.error("Error refreshing due counts:", err);
    }
  }, [user]);

  // ==================== ANALYTICS ====================

  const trackReviewEvent = useCallback((eventType: string, data?: Record<string, any>) => {
    analytics.capture(eventType, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }, []);

  // ==================== INITIAL LOAD ====================

  useEffect(() => {
    if (user) {
      refreshStats();
      refreshStreak();
      refreshDueCounts();
    }
  }, [user, refreshStats, refreshStreak, refreshDueCounts]);

  // ==================== CONTEXT VALUE ====================

  const value: ReviewContextType = {
    // State
    stats,
    streak,
    queue,
    dueCounts,
    activeSession,
    isLoading,
    error,

    // Queue Management
    loadQueue,
    refreshQueue,
    clearQueue,

    // Session Management
    startSession,
    completeSession,
    pauseSession,
    resumeSession,

    // Review Actions
    reviewFlashcard,
    reviewQuestion,
    nextItem,

    // Statistics
    refreshStats,
    refreshStreak,
    refreshDueCounts,

    // Analytics
    trackReviewEvent,
  };

  return <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>;
}

// ==================== HOOK ====================

export function useReview() {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error("useReview must be used within a ReviewProvider");
  }
  return context;
}
