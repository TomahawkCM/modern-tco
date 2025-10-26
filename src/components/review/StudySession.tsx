"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useReview } from "@/contexts/ReviewContext";
import { flashcardService } from "@/services/flashcardService";
import { questionReviewService } from "@/services/questionReviewService";
import type { ReviewQueueItem } from "@/types/review";
import type { SRRating } from "@/lib/sr";
import { isFlashcardItem, isQuestionItem, formatTimeRemaining } from "@/types/review";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Brain,
  Target,
  Pause,
  Play,
  X,
  TrendingUp,
} from "lucide-react";

interface StudySessionProps {
  onComplete?: () => void;
  onExit?: () => void;
}

export default function StudySession({ onComplete, onExit }: StudySessionProps) {
  const {
    queue,
    activeSession,
    reviewFlashcard,
    reviewQuestion,
    nextItem,
    completeSession,
    pauseSession,
    resumeSession,
    trackReviewEvent,
  } = useReview();

  const [currentItem, setCurrentItem] = useState<ReviewQueueItem | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [itemStartTime, setItemStartTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer for session duration
  useEffect(() => {
    if (!activeSession?.isActive || activeSession.isPaused) return;

    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - (activeSession.startTime?.getTime() || 0)) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession?.isActive, activeSession?.isPaused, activeSession?.startTime]);

  // Load current item
  useEffect(() => {
    if (queue && activeSession) {
      const item = queue[activeSession.currentIndex];
      setCurrentItem(item || null);
      setShowAnswer(false);
      setSelectedAnswer("");
      setItemStartTime(Date.now());
    }
  }, [queue, activeSession?.currentIndex]);

  const handleFlashcardRating = useCallback(async (rating: SRRating) => {
    if (!currentItem || !isFlashcardItem(currentItem)) return;

    const timeSpent = Math.floor((Date.now() - itemStartTime) / 1000);
    await reviewFlashcard(currentItem.flashcard.id, rating, timeSpent);

    // Move to next item
    setShowAnswer(false);
    nextItem();
  }, [currentItem, itemStartTime, reviewFlashcard, nextItem]);

  const handleQuestionSubmit = useCallback(async () => {
    if (!currentItem || !isQuestionItem(currentItem) || !selectedAnswer) return;

    const timeSpent = Math.floor((Date.now() - itemStartTime) / 1000);
    const isCorrect = selectedAnswer === currentItem.question?.correctAnswerId;

    await reviewQuestion(currentItem.question.id, isCorrect, timeSpent);

    // Move to next item
    setShowAnswer(false);
    setSelectedAnswer("");
    nextItem();
  }, [currentItem, selectedAnswer, itemStartTime, reviewQuestion, nextItem]);

  const handleSessionComplete = useCallback(async () => {
    await completeSession();
    trackReviewEvent('review_session_completed_ui', {
      itemsReviewed: activeSession?.reviewed,
      accuracy: activeSession?.reviewed ? (activeSession.correct / activeSession.reviewed) * 100 : 0,
    });
    onComplete?.();
  }, [completeSession, trackReviewEvent, activeSession, onComplete]);

  const handlePause = useCallback(() => {
    pauseSession();
  }, [pauseSession]);

  const handleResume = useCallback(() => {
    resumeSession();
  }, [resumeSession]);

  const handleExit = useCallback(() => {
    if (confirm("Are you sure you want to exit? Your progress will be lost.")) {
      onExit?.();
    }
  }, [onExit]);

  if (!activeSession || !currentItem) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No active review session</p>
      </div>
    );
  }

  const progress = activeSession.reviewed > 0
    ? (activeSession.reviewed / (queue?.length || 1)) * 100
    : 0;
  const accuracy = activeSession.reviewed > 0
    ? (activeSession.correct / activeSession.reviewed) * 100
    : 0;

  const isComplete = activeSession.currentIndex >= (queue?.length || 0);
  const targetDuration = activeSession.session?.target_duration_minutes;
  const remainingTime = targetDuration
    ? Math.max(0, targetDuration * 60 - elapsedTime)
    : null;

  // Session complete screen
  if (isComplete) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="text-center">
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-[#22c55e]" />
            <CardTitle className="text-2xl">Session Complete!</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold">{activeSession.reviewed}</p>
              <p className="text-sm text-muted-foreground">Items Reviewed</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold">{Math.round(accuracy)}%</p>
              <p className="text-sm text-muted-foreground">Accuracy</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold">{activeSession.flashcardsReviewed}</p>
              <p className="text-sm text-muted-foreground">Flashcards</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-3xl font-bold">{activeSession.questionsReviewed}</p>
              <p className="text-sm text-muted-foreground">Questions</p>
            </div>
          </div>

          {/* Time */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Session Duration</p>
            <p className="text-lg font-semibold">{formatTimeRemaining(elapsedTime)}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleSessionComplete}>
              Complete Session
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-2">
            {currentItem.itemType === 'flashcard' ? (
              <>
                <Brain className="h-3 w-3" />
                Flashcard
              </>
            ) : (
              <>
                <Target className="h-3 w-3" />
                Question
              </>
            )}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {activeSession.currentIndex + 1} of {queue?.length || 0}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {remainingTime !== null && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span className={remainingTime < 60 ? "text-orange-500 font-semibold" : ""}>
                {formatTimeRemaining(remainingTime)}
              </span>
            </div>
          )}

          {activeSession.isPaused ? (
            <Button size="sm" variant="outline" onClick={handleResume}>
              <Play className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={handlePause}>
              <Pause className="h-4 w-4" />
            </Button>
          )}

          <Button size="sm" variant="ghost" onClick={handleExit}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{Math.round(progress)}% Complete</span>
          <span>{Math.round(accuracy)}% Accuracy</span>
        </div>
      </div>

      {/* Pause Overlay */}
      {activeSession.isPaused && (
        <Card className="bg-muted/50 backdrop-blur">
          <CardContent className="text-center py-12">
            <Pause className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold mb-2">Session Paused</p>
            <p className="text-sm text-muted-foreground mb-4">
              Take a break. Resume when you're ready.
            </p>
            <Button onClick={handleResume}>
              <Play className="h-4 w-4 mr-2" />
              Resume Review
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Flashcard Review */}
      {!activeSession.isPaused && isFlashcardItem(currentItem) && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <Badge variant="secondary">
                {currentItem.flashcard.srs_reps === 0 ? "New Card" : `Review #${currentItem.flashcard.srs_reps + 1}`}
              </Badge>
              <Badge variant="outline">
                Mastery: {Math.round(currentItem.mastery * 100)}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question */}
            <div className="min-h-[200px] flex items-center justify-center">
              <p className="text-2xl text-center font-semibold">
                {currentItem.flashcard.front_text}
              </p>
            </div>

            {/* Answer (revealed) */}
            {showAnswer && (
              <div className="border-t pt-6 space-y-4">
                <div className="bg-muted p-6 rounded-lg">
                  <p className="text-lg">{currentItem.flashcard.back_text}</p>
                </div>

                {currentItem.flashcard.explanation && (
                  <div className="text-sm text-muted-foreground">
                    <p className="font-semibold mb-1">Explanation:</p>
                    <p>{currentItem.flashcard.explanation}</p>
                  </div>
                )}

                {/* Rating Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    variant="outline"
                    className="flex-col h-auto py-4 border-red-200 hover:bg-red-50"
                    onClick={() => handleFlashcardRating('again')}
                  >
                    <span className="font-semibold">Again</span>
                    <span className="text-xs text-muted-foreground">&lt;1d</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-col h-auto py-4 border-orange-200 hover:bg-orange-50"
                    onClick={() => handleFlashcardRating('hard')}
                  >
                    <span className="font-semibold">Hard</span>
                    <span className="text-xs text-muted-foreground">~3d</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-col h-auto py-4 border-blue-200 hover:bg-blue-50"
                    onClick={() => handleFlashcardRating('good')}
                  >
                    <span className="font-semibold">Good</span>
                    <span className="text-xs text-muted-foreground">{currentItem.intervalDays}d</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-col h-auto py-4 border-green-200 hover:bg-green-50"
                    onClick={() => handleFlashcardRating('easy')}
                  >
                    <span className="font-semibold">Easy</span>
                    <span className="text-xs text-muted-foreground">&gt;{currentItem.intervalDays}d</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Show Answer Button */}
            {!showAnswer && (
              <Button className="w-full" size="lg" onClick={() => setShowAnswer(true)}>
                Show Answer
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Question Review */}
      {!activeSession.isPaused && isQuestionItem(currentItem) && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <Badge variant="secondary">
                {currentItem.questionReview?.srs_reps === 0 ? "New Question" : `Attempt #${currentItem.questionReview?.total_attempts || 0 + 1}`}
              </Badge>
              <Badge variant="outline">
                Mastery: {Math.round(currentItem.mastery * 100)}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question Text */}
            <div>
              <p className="text-lg font-semibold mb-4">{currentItem.question?.question}</p>
            </div>

            {/* Answer Options */}
            <div className="space-y-2">
              {currentItem.question?.choices.map((choice) => (
                <Button
                  key={choice.id}
                  variant={selectedAnswer === choice.id ? "default" : "outline"}
                  className="w-full justify-start text-left h-auto py-3"
                  onClick={() => setSelectedAnswer(choice.id)}
                  disabled={showAnswer}
                >
                  <span className="flex-1">{choice.text}</span>
                  {showAnswer && choice.id === currentItem.question?.correctAnswerId && (
                    <CheckCircle2 className="h-5 w-5 text-[#22c55e]" />
                  )}
                  {showAnswer && selectedAnswer === choice.id && choice.id !== currentItem.question?.correctAnswerId && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </Button>
              ))}
            </div>

            {/* Explanation (after submission) */}
            {showAnswer && currentItem.question?.explanation && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-semibold mb-2">Explanation:</p>
                <p className="text-sm">{currentItem.question.explanation}</p>
              </div>
            )}

            {/* Submit/Next Button */}
            {!showAnswer ? (
              <Button
                className="w-full"
                size="lg"
                onClick={() => setShowAnswer(true)}
                disabled={!selectedAnswer}
              >
                Submit Answer
              </Button>
            ) : (
              <Button
                className="w-full"
                size="lg"
                onClick={handleQuestionSubmit}
              >
                Next Question
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
