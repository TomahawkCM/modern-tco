"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Trophy,
  TrendingUp,
  Clock,
  RotateCcw,
  Lightbulb,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  updateReviewItem,
  saveReviewItems,
  saveReviewSession,
  type ReviewItem,
} from "@/lib/spacedRepetition";
import { getQuestionsForReview, type Question } from "@/lib/questionBank";
import {
  calculateReviewPoints,
  addPoints,
  checkAchievements,
  getUserPoints,
} from "@/lib/gamification";
import { notifyAchievementUnlocked } from "@/components/gamification/AchievementNotification";

interface ReviewSessionProps {
  /** Items to review */
  items: ReviewItem[];
  /** Callback when session completes */
  onComplete?: (results: SessionResults) => void;
  /** Callback to exit session */
  onExit?: () => void;
}

interface SessionResults {
  itemsReviewed: number;
  itemsCorrect: number;
  averageRetention: number;
  duration: number;
}

interface ReviewAnswer {
  itemId: string;
  correct: boolean;
  timestamp: string;
}

export function ReviewSession({ items, onComplete, onExit }: ReviewSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<ReviewAnswer[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<boolean | null>(null);
  const [sessionStartTime] = useState(Date.now());
  const [showFinalResults, setShowFinalResults] = useState(false);

  // Question bank integration
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [useQuestions, setUseQuestions] = useState(true);

  // Gamification
  const [pointsEarned, setPointsEarned] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0);
  const [pointsBreakdown, setPointsBreakdown] = useState<string[]>([]);

  const currentItem = items[currentIndex];
  const isLastItem = currentIndex === items.length - 1;
  const progress = ((currentIndex + 1) / items.length) * 100;

  // Load question for current item
  useEffect(() => {
    if (useQuestions && currentItem) {
      const questions = getQuestionsForReview(
        currentItem.moduleId,
        currentItem.sectionId,
        currentItem.concept,
        currentItem.difficulty || "medium",
        1
      );

      if (questions.length > 0) {
        setCurrentQuestion(questions[0]);
      } else {
        setCurrentQuestion(null);
      }
    }

    setSelectedAnswer(null);
  }, [currentIndex, currentItem, useQuestions]);

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion || !selectedAnswer) return;

    const correct = selectedAnswer === currentQuestion.correctAnswer;
    handleAnswer(correct);
  };

  const handleAnswer = (correct: boolean) => {
    setCurrentAnswer(correct);
    setShowResult(true);

    // Record answer
    const answer: ReviewAnswer = {
      itemId: currentItem.id,
      correct,
      timestamp: new Date().toISOString(),
    };

    setAnswers([...answers, answer]);

    // Calculate and award points for correct answers
    if (correct) {
      const userPoints = getUserPoints();
      const streakDays = userPoints.pointsHistory.filter(entry =>
        entry.reason === "review_correct"
      ).length > 0 ? 1 : 0; // Simplified streak calculation

      const difficulty = currentQuestion?.difficulty || currentItem.difficulty || "medium";
      const retention = currentItem.retention;

      const pointsResult = calculateReviewPoints(
        correct,
        difficulty,
        streakDays,
        retention
      );

      // Award points
      addPoints(
        pointsResult.points,
        "review_correct",
        pointsResult.multiplier,
        `Reviewed: ${currentItem.concept}`
      );

      setPointsEarned(pointsResult.points);
      setSessionPoints(prev => prev + pointsResult.points);
      setPointsBreakdown(pointsResult.breakdown);
    } else {
      setPointsEarned(0);
      setPointsBreakdown(["Incorrect answer: 0 points"]);
    }
  };

  const handleNext = () => {
    if (isLastItem) {
      // Session complete
      completeSession();
    } else {
      // Next item
      setCurrentIndex(currentIndex + 1);
      setShowResult(false);
      setCurrentAnswer(null);
    }
  };

  const completeSession = () => {
    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);

    // Update all review items based on performance
    const itemsByModule: Record<string, ReviewItem[]> = {};

    items.forEach((item, idx) => {
      const answer = answers[idx];
      const wasCorrect = answer ? answer.correct : false;

      // Update item
      const updatedItem = updateReviewItem(item, wasCorrect);

      // Group by module
      if (!itemsByModule[item.moduleId]) {
        itemsByModule[item.moduleId] = [];
      }
      itemsByModule[item.moduleId].push(updatedItem);
    });

    // Save updated items to localStorage
    Object.entries(itemsByModule).forEach(([moduleId, moduleItems]) => {
      // Get all items for this module
      const allModuleItems = getAllModuleItems(moduleId);

      // Replace updated items
      const updatedAllItems = allModuleItems.map(item => {
        const updated = moduleItems.find(u => u.id === item.id);
        return updated || item;
      });

      saveReviewItems(moduleId, updatedAllItems);
    });

    // Calculate results
    const itemsCorrect = answers.filter(a => a.correct).length;
    const totalRetention = items.reduce((sum, item) => {
      const answer = answers.find(a => a.itemId === item.id);
      return sum + (answer?.correct ? 100 : 0);
    }, 0);
    const averageRetention = Math.round(totalRetention / items.length);

    const results: SessionResults = {
      itemsReviewed: items.length,
      itemsCorrect,
      averageRetention,
      duration: sessionDuration,
    };

    // Save session
    saveReviewSession(results);

    // Award perfect session bonus
    if (itemsCorrect === items.length && items.length > 0) {
      addPoints(50, "perfect_session", 1.0, "Perfect session!");
      setSessionPoints(prev => prev + 50);
    }

    // Check for achievements
    const userPoints = getUserPoints();
    const allItems = getAllModuleItems(items[0]?.moduleId || "");
    const itemsMastered = allItems.filter(item => item.retention > 90).length;

    const newAchievements = checkAchievements({
      streakDays: 1, // TODO: Calculate actual streak
      perfectSessions: itemsCorrect === items.length ? 1 : 0,
      totalReviews: answers.length,
      totalPoints: userPoints.totalPoints,
      itemsMastered,
      practiceSessions: 0,
    });

    // Notify about new achievements
    newAchievements.forEach(achievement => {
      notifyAchievementUnlocked(achievement);
    });

    setShowFinalResults(true);

    if (onComplete) {
      onComplete(results);
    }
  };

  const getAllModuleItems = (moduleId: string): ReviewItem[] => {
    if (typeof window === "undefined") return [];
    const key = `spaced-repetition-${moduleId}`;
    const data = localStorage.getItem(key);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  };

  const handleRetry = () => {
    setShowResult(false);
    setCurrentAnswer(null);
  };

  // Final results view
  if (showFinalResults) {
    const itemsCorrect = answers.filter(a => a.correct).length;
    const scorePercentage = Math.round((itemsCorrect / items.length) * 100);
    const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
    const minutes = Math.floor(sessionDuration / 60);
    const seconds = sessionDuration % 60;

    return (
      <Card className="border-2 border-[#22c55e]/30 bg-[#22c55e]/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#22c55e]">
            <Trophy className="h-6 w-6 text-[#f97316]" />
            Review Session Complete!
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="text-center">
            <div className="mb-4">
              <div className="mb-2 text-5xl font-bold text-foreground">{scorePercentage}%</div>
              <p className="text-sm text-muted-foreground">
                {itemsCorrect} of {items.length} correct
              </p>
            </div>

            <Progress value={scorePercentage} className="h-3 bg-green-900/30" />
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-4 text-center">
                <Clock className="mx-auto mb-2 h-6 w-6 text-primary" />
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-lg font-bold text-foreground">
                  {minutes}m {seconds}s
                </p>
              </CardContent>
            </Card>

            <Card className="border-[#22c55e]/20 bg-[#22c55e]/5">
              <CardContent className="pt-4 text-center">
                <TrendingUp className="mx-auto mb-2 h-6 w-6 text-[#22c55e]" />
                <p className="text-sm text-muted-foreground">Items Reviewed</p>
                <p className="text-lg font-bold text-foreground">{items.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Next Review Schedule */}
          <Card className="border-accent/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="text-sm text-accent-foreground">Next Review Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {items.map((item, idx) => {
                  const answer = answers[idx];
                  if (!answer) return null;

                  const updatedItem = updateReviewItem(item, answer.correct);
                  const nextReviewDate = new Date(updatedItem.nextReview);
                  const daysUntil = Math.ceil(
                    (nextReviewDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded border border-gray-700 p-2"
                    >
                      <div className="flex items-center gap-2">
                        {answer.correct ? (
                          <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-muted-foreground">{item.title}</span>
                      </div>
                      <Badge variant="outline" className="text-xs border-accent/30 text-accent-foreground">
                        {daysUntil} day{daysUntil !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onExit}
              variant="outline"
              className="flex-1"
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Review in progress
  return (
    <Card className="border-accent/20 bg-accent/5">
      <CardHeader>
        <div className="mb-2 flex items-center justify-between">
          <CardTitle className="text-sm text-accent-foreground">Review Session</CardTitle>
          <Badge variant="outline" className="border-accent/30 text-accent-foreground">
            {currentIndex + 1} of {items.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Item */}
        <div>
          <div className="mb-4">
            <Badge variant="outline" className="mb-2 text-xs border-primary/30 text-primary">
              {currentItem.type === "micro-section" ? "Micro-Section" : "Weak Concept"}
            </Badge>
            <h3 className="text-lg font-semibold text-foreground">{currentItem.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">Concept: {currentItem.concept}</p>
          </div>

          {/* Review Prompt */}
          {!showResult && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-6">
                {currentQuestion ? (
                  /* Question Bank Mode */
                  <div className="space-y-4">
                    <div className="mb-4">
                      <div className="mb-2 flex items-center justify-between">
                        <Badge variant="outline" className="text-xs border-accent/30 text-accent-foreground">
                          {currentQuestion.type === "true-false" ? "True/False" : "Multiple Choice"}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-[#f97316]/30 text-[#f97316]">
                          Difficulty: {currentQuestion.difficulty}
                        </Badge>
                      </div>
                      <p className="text-base font-medium text-foreground">{currentQuestion.question}</p>
                    </div>

                    <div className="space-y-2">
                      {currentQuestion.type === "true-false" ? (
                        /* True/False Options */
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleSelectAnswer("True")}
                            className={cn(
                              "flex-1 rounded-lg border-2 p-4 text-center transition-all",
                              selectedAnswer === "True"
                                ? "border-purple-500 bg-accent/20 text-foreground"
                                : "border-gray-700 bg-card/50 text-muted-foreground hover:border-purple-500/50 hover:bg-accent/10"
                            )}
                          >
                            <CheckCircle2 className="mx-auto mb-1 h-6 w-6" />
                            <span className="font-medium">True</span>
                          </button>
                          <button
                            onClick={() => handleSelectAnswer("False")}
                            className={cn(
                              "flex-1 rounded-lg border-2 p-4 text-center transition-all",
                              selectedAnswer === "False"
                                ? "border-purple-500 bg-accent/20 text-foreground"
                                : "border-gray-700 bg-card/50 text-muted-foreground hover:border-purple-500/50 hover:bg-accent/10"
                            )}
                          >
                            <XCircle className="mx-auto mb-1 h-6 w-6" />
                            <span className="font-medium">False</span>
                          </button>
                        </div>
                      ) : (
                        /* Multiple Choice Options */
                        currentQuestion.options?.map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSelectAnswer(option)}
                            className={cn(
                              "w-full rounded-lg border-2 p-4 text-left transition-all",
                              selectedAnswer === option
                                ? "border-purple-500 bg-accent/20 text-foreground"
                                : "border-gray-700 bg-card/50 text-muted-foreground hover:border-purple-500/50 hover:bg-accent/10"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-bold",
                                  selectedAnswer === option
                                    ? "border-purple-400 bg-accent text-foreground"
                                    : "border-gray-600 text-muted-foreground"
                                )}
                              >
                                {String.fromCharCode(65 + idx)}
                              </div>
                              <span>{option}</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>

                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={!selectedAnswer}
                      className="w-full bg-accent hover:bg-purple-700 disabled:bg-muted disabled:cursor-not-allowed"
                    >
                      Submit Answer
                    </Button>
                  </div>
                ) : (
                  /* Fallback: Generic Active Recall */
                  <div className="text-center">
                    <p className="mb-6 text-foreground">
                      Can you recall the key points about <strong>{currentItem.concept}</strong>?
                    </p>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleAnswer(false)}
                        variant="outline"
                        className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Need Review
                      </Button>
                      <Button
                        onClick={() => handleAnswer(true)}
                        className="flex-1 bg-[#22c55e] hover:bg-green-700"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Remembered
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Result Feedback */}
          {showResult && currentAnswer !== null && (
            <Card className={cn(
              "border-2",
              currentAnswer
                ? "border-[#22c55e]/30 bg-[#22c55e]/5"
                : "border-orange-500/30 bg-orange-500/5"
            )}>
              <CardContent className="py-6">
                <div className="mb-4 text-center">
                  {currentAnswer ? (
                    <>
                      <CheckCircle2 className="mx-auto mb-2 h-12 w-12 text-[#22c55e]" />
                      <h4 className="text-lg font-semibold text-[#22c55e]">Great Job! 🎉</h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        You'll see this again in {getNextIntervalDays(currentItem.intervalIndex + 1)} days
                      </p>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="mx-auto mb-2 h-12 w-12 text-orange-500" />
                      <h4 className="text-lg font-semibold text-orange-300">Review Needed</h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        You'll see this again at the same interval for more practice
                      </p>
                    </>
                  )}
                </div>

                {/* Points Earned */}
                {pointsEarned > 0 && (
                  <div className="mb-4 rounded-lg border border-[#f97316]/20 bg-yellow-500/5 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-[#f97316]" />
                        <span className="font-semibold text-[#f97316]">
                          +{pointsEarned} Points
                        </span>
                      </div>
                      <Badge variant="outline" className="text-[#f97316]">
                        Total: {sessionPoints}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      {pointsBreakdown.map((line, idx) => (
                        <div key={idx}>{line}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Question Explanation (if question was used) */}
                {currentQuestion && (
                  <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="mb-3">
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {currentItem.concept}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {currentQuestion.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {currentQuestion.question}
                      </p>
                    </div>

                    <div className="mb-3 rounded bg-[#22c55e]/10 px-3 py-2">
                      <div className="mb-1 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                        <span className="text-xs font-semibold text-[#22c55e]">Correct Answer:</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{currentQuestion.correctAnswer}</p>
                    </div>

                    {selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer && (
                      <div className="mb-3 rounded bg-orange-500/10 px-3 py-2">
                        <div className="mb-1 flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-orange-500" />
                          <span className="text-xs font-semibold text-orange-400">Your Answer:</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{selectedAnswer}</p>
                      </div>
                    )}

                    <div className="rounded bg-primary/10 px-3 py-2">
                      <div className="mb-1 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span className="text-xs font-semibold text-primary">Explanation:</span>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <Button
                    onClick={handleNext}
                    className="w-full bg-accent hover:bg-purple-700"
                  >
                    {isLastItem ? "Complete Session" : "Next Item"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Progress Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Current retention: {currentItem.retention}%
          </span>
          <span>
            {currentItem.totalReviews} previous reviews
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function
function getNextIntervalDays(intervalIndex: number): number {
  const intervals = [1, 2, 4, 9, 19];
  return intervals[intervalIndex] || intervals[intervals.length - 1];
}

export default ReviewSession;
