"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { flashcardService } from "@/services/flashcardService";
import type { Flashcard } from "@/types/flashcard";
import type { SRRating } from "@/lib/sr";
import { Brain, Check, X, AlertCircle, Clock, TrendingUp } from "lucide-react";

interface FlashcardReviewProps {
  moduleId?: string; // Filter by module
  deckId?: string; // Filter by deck
  onComplete?: (stats: ReviewStats) => void;
}

interface ReviewStats {
  totalReviewed: number;
  correct: number;
  avgTimePerCard: number;
  newCardsLearned: number;
}

export default function FlashcardReview({ moduleId, deckId, onComplete }: FlashcardReviewProps) {
  const { user } = useAuth();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewStartTime, setReviewStartTime] = useState<number>(Date.now());
  const [sessionStats, setSessionStats] = useState<ReviewStats>({
    totalReviewed: 0,
    correct: 0,
    avgTimePerCard: 0,
    newCardsLearned: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCards();
  }, [user?.id, moduleId, deckId]);

  const loadCards = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      let dueCards: Flashcard[] = [];

      if (moduleId) {
        // Get all cards for module and filter by due date
        const moduleCards = await flashcardService.getFlashcardsByModule(user.id, moduleId);
        dueCards = moduleCards.filter(c => new Date(c.srs_due) <= new Date());
      } else if (deckId) {
        // Get deck cards and filter by due date
        const deckCards = await flashcardService.getDeckCards(deckId);
        dueCards = deckCards.filter(c => new Date(c.srs_due) <= new Date());
      } else {
        // Get all due cards
        dueCards = await flashcardService.getDueFlashcards(user.id, 20);
      }

      // Mix in some new cards (20% of queue)
      const newCards = await flashcardService.getNewFlashcards(user.id, Math.max(1, Math.floor(dueCards.length * 0.2)));
      const allCards = [...dueCards, ...newCards];

      setCards(allCards);
    } catch (error) {
      console.error("Error loading flashcards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRating = async (rating: SRRating) => {
    if (!user?.id || !currentCard) return;

    const timeSpent = Math.floor((Date.now() - reviewStartTime) / 1000);
    const isCorrect = rating === 'good' || rating === 'easy';

    // Update card with SRS algorithm
    await flashcardService.reviewFlashcard(currentCard.id, user.id, rating, timeSpent);

    // Update session stats
    const newStats = {
      ...sessionStats,
      totalReviewed: sessionStats.totalReviewed + 1,
      correct: sessionStats.correct + (isCorrect ? 1 : 0),
      avgTimePerCard: Math.floor((sessionStats.avgTimePerCard * sessionStats.totalReviewed + timeSpent) / (sessionStats.totalReviewed + 1)),
      newCardsLearned: sessionStats.newCardsLearned + (currentCard.srs_reps === 0 ? 1 : 0),
    };
    setSessionStats(newStats);

    // Move to next card
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setReviewStartTime(Date.now());
    } else {
      // Session complete
      onComplete?.(newStats);
    }
  };

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Loading flashcards...</span>
        </CardContent>
      </Card>
    );
  }

  if (cards.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <Check className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-2xl font-bold mb-2">All Caught Up!</h3>
          <p className="text-muted-foreground mb-6">
            No flashcards are due for review right now. Great work staying on top of your studies!
          </p>
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Cards Reviewed Today</p>
              <p className="text-2xl font-bold">{sessionStats.totalReviewed}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Accuracy</p>
              <p className="text-2xl font-bold">
                {sessionStats.totalReviewed > 0
                  ? Math.round((sessionStats.correct / sessionStats.totalReviewed) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentCard) return null;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Progress Bar */}
      <div className="flex items-center gap-3">
        <Progress value={progress} className="flex-1" />
        <span className="text-sm font-medium whitespace-nowrap">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="p-3 bg-muted rounded-md text-center">
          <Brain className="h-4 w-4 mx-auto mb-1 text-primary" />
          <p className="text-xs text-muted-foreground">Reviewed</p>
          <p className="text-sm font-bold">{sessionStats.totalReviewed}</p>
        </div>
        <div className="p-3 bg-muted rounded-md text-center">
          <Check className="h-4 w-4 mx-auto mb-1 text-green-500" />
          <p className="text-xs text-muted-foreground">Correct</p>
          <p className="text-sm font-bold">{sessionStats.correct}</p>
        </div>
        <div className="p-3 bg-muted rounded-md text-center">
          <TrendingUp className="h-4 w-4 mx-auto mb-1 text-blue-500" />
          <p className="text-xs text-muted-foreground">Accuracy</p>
          <p className="text-sm font-bold">
            {sessionStats.totalReviewed > 0
              ? Math.round((sessionStats.correct / sessionStats.totalReviewed) * 100)
              : 0}%
          </p>
        </div>
        <div className="p-3 bg-muted rounded-md text-center">
          <Clock className="h-4 w-4 mx-auto mb-1 text-orange-500" />
          <p className="text-xs text-muted-foreground">Avg Time</p>
          <p className="text-sm font-bold">{sessionStats.avgTimePerCard}s</p>
        </div>
      </div>

      {/* Main Flashcard */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={currentCard.srs_reps === 0 ? "default" : "secondary"}>
                {currentCard.srs_reps === 0 ? "New" : `Review ${currentCard.total_reviews}`}
              </Badge>
              <Badge variant="outline">{currentCard.card_type}</Badge>
            </div>
            {currentCard.hint && !showAnswer && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => alert(currentCard.hint)}
              >
                <AlertCircle className="h-4 w-4 mr-1" />
                Hint
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="min-h-[300px] flex flex-col justify-center">
          {/* Front of card */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-2">Question:</p>
            <h2 className="text-2xl font-bold">{currentCard.front_text}</h2>
            {currentCard.image_url && (
              <img
                src={currentCard.image_url}
                alt="Flashcard visual"
                className="mt-4 rounded-lg max-h-48 object-contain"
              />
            )}
          </div>

          {/* Back of card (revealed) */}
          {showAnswer && (
            <div className="border-t pt-6 animate-in fade-in-50 duration-300">
              <p className="text-sm text-muted-foreground mb-2">Answer:</p>
              <p className="text-lg">{currentCard.back_text}</p>
              {currentCard.explanation && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium mb-1">Explanation:</p>
                  <p className="text-sm text-muted-foreground">{currentCard.explanation}</p>
                </div>
              )}
            </div>
          )}

          {/* Show Answer Button */}
          {!showAnswer && (
            <Button
              onClick={() => setShowAnswer(true)}
              size="lg"
              className="w-full mt-4"
            >
              Show Answer
            </Button>
          )}

          {/* Rating Buttons (SM-2 Algorithm) */}
          {showAnswer && (
            <div className="grid grid-cols-4 gap-2 mt-6">
              <Button
                variant="destructive"
                onClick={() => handleRating('again')}
                className="flex flex-col h-auto py-3"
              >
                <X className="h-5 w-5 mb-1" />
                <span className="text-xs">Again</span>
                <span className="text-xs opacity-70">&lt;1d</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleRating('hard')}
                className="flex flex-col h-auto py-3"
              >
                <AlertCircle className="h-5 w-5 mb-1" />
                <span className="text-xs">Hard</span>
                <span className="text-xs opacity-70">~3d</span>
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleRating('good')}
                className="flex flex-col h-auto py-3"
              >
                <Check className="h-5 w-5 mb-1" />
                <span className="text-xs">Good</span>
                <span className="text-xs opacity-70">
                  ~{currentCard.srs_reps === 0 ? 1 : currentCard.srs_reps === 1 ? 6 : Math.round(currentCard.srs_interval * currentCard.srs_ease)}d
                </span>
              </Button>
              <Button
                variant="default"
                onClick={() => handleRating('easy')}
                className="flex flex-col h-auto py-3"
              >
                <TrendingUp className="h-5 w-5 mb-1" />
                <span className="text-xs">Easy</span>
                <span className="text-xs opacity-70">
                  ~{currentCard.srs_reps === 0 ? 3 : Math.round(currentCard.srs_interval * currentCard.srs_ease * 1.3)}d
                </span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card Tags */}
      {currentCard.tags && currentCard.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {currentCard.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
