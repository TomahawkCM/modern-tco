"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { schedule, type SRRating } from "@/lib/sr";
import { Check, X, Clock, Brain, TrendingUp } from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: Array<{ id: string; text: string }>;
  correct_answer: number;
  explanation: string;
  domain: string | null;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  tags?: string[];
  created_at?: string | null;
  updated_at?: string | null;
  created_by?: string | null;
  section_tags?: string[];
  module_id?: string | null;
}

interface QuestionReview {
  id: string;
  question_id: string;
  user_id: string;
  srs_due: string;
  srs_interval: number;
  srs_ease: number;
  srs_reps: number;
  srs_lapses: number;
  total_attempts: number;
  correct_attempts: number;
  mastery_level: number | null;
  average_time_seconds?: number | null;
  created_at?: string;
  updated_at?: string;
  last_reviewed_at?: string | null;
}

interface QuestionReviewProps {
  onComplete?: () => void;
}

export default function QuestionReview({ onComplete }: QuestionReviewProps) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [reviews, setReviews] = useState<QuestionReview[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    correct: 0,
    startTime: Date.now(),
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDueQuestions();
  }, [user?.id]);

  const loadDueQuestions = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Get due question reviews
      const { data: reviewData, error: reviewError } = await supabase
        .from("question_reviews")
        .select("*")
        .eq("user_id", user.id)
        .lte("srs_due", new Date().toISOString())
        .order("srs_due", { ascending: true })
        .limit(20);

      if (reviewError) throw reviewError;

      if (!reviewData || reviewData.length === 0) {
        // No reviews yet - create some from random questions
        const { data: randomQuestions } = await supabase
          .from("questions")
          .select("*")
          .limit(10);

        if (randomQuestions) {
          setQuestions(randomQuestions as Question[]);
          setReviews([]);
        }
      } else {
        // Get the actual questions
        const questionIds = reviewData.map((r) => r.question_id);
        const { data: questionData } = await supabase
          .from("questions")
          .select("*")
          .in("id", questionIds);

        if (questionData) {
          setQuestions(questionData as Question[]);
          setReviews(reviewData as QuestionReview[]);
        }
      }
    } catch (error) {
      console.error("Error loading questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return; // Already answered
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
  };

  const handleRating = async (rating: SRRating) => {
    if (!user?.id || selectedAnswer === null) return;

    const currentQuestion = questions[currentIndex];
    const currentReview = reviews[currentIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;

    // Update session stats
    setSessionStats((prev) => ({
      ...prev,
      total: prev.total + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
    }));

    try {
      // Get or create review record
      let reviewId: string | undefined = currentReview?.id;
      const srsState = currentReview
        ? {
            id: currentReview.id,
            due: new Date(currentReview.srs_due).getTime(),
            interval: currentReview.srs_interval,
            ease: currentReview.srs_ease,
            reps: currentReview.srs_reps,
            lapses: currentReview.srs_lapses,
          }
        : {
            id: "",
            due: Date.now(),
            interval: 0,
            ease: 2.5,
            reps: 0,
            lapses: 0,
          };

      // Calculate new SRS state
      const newState = schedule(srsState, rating, new Date());

      // Calculate time spent (simplified)
      const timeSpent = Math.floor((Date.now() - sessionStats.startTime) / 1000);

      if (!reviewId) {
        // Create new review record
        const { data: newReview } = await supabase
          .from("question_reviews")
          .insert({
            user_id: user.id,
            question_id: currentQuestion.id,
            srs_due: new Date(newState.due).toISOString(),
            srs_interval: newState.interval,
            srs_ease: newState.ease,
            srs_reps: newState.reps,
            srs_lapses: newState.lapses,
            total_attempts: 1,
            correct_attempts: isCorrect ? 1 : 0,
            average_time_seconds: timeSpent,
          })
          .select()
          .single();

        reviewId = newReview?.id;
      } else {
        // Update existing review
        await supabase
          .from("question_reviews")
          .update({
            srs_due: new Date(newState.due).toISOString(),
            srs_interval: newState.interval,
            srs_ease: newState.ease,
            srs_reps: newState.reps,
            srs_lapses: newState.lapses,
            total_attempts: currentReview.total_attempts + 1,
            correct_attempts: currentReview.correct_attempts + (isCorrect ? 1 : 0),
            last_reviewed_at: new Date().toISOString(),
          })
          .eq("id", reviewId);
      }

      // Record attempt in history
      if (reviewId) {
        await supabase.from("question_review_attempts").insert({
          review_id: reviewId as string,
          user_id: user.id,
          question_id: currentQuestion.id,
          is_correct: isCorrect,
          time_spent_seconds: timeSpent,
          rating,
          srs_interval_before: srsState.interval,
          srs_interval_after: newState.interval,
          srs_ease_before: srsState.ease,
          srs_ease_after: newState.ease,
        });
      }
    } catch (error) {
      console.error("Error updating review:", error);
    }

    // Move to next question
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setSessionStats((prev) => ({ ...prev, startTime: Date.now() }));
    } else {
      // Session complete
      if (onComplete) {
        onComplete();
      }
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading questions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Questions Due</h3>
          <p className="text-muted-foreground">All caught up! Check back tomorrow.</p>
          <Button onClick={onComplete} className="mt-4">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedAnswer === currentQuestion.correct_answer;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="font-medium">
            {sessionStats.correct}/{sessionStats.total} correct
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">{currentQuestion.domain || "General"}</Badge>
            <Badge variant="secondary">{currentQuestion.difficulty}</Badge>
          </div>
          <CardTitle className="text-xl mt-4">{currentQuestion.question}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Answer Options */}
          <RadioGroup
            value={selectedAnswer?.toString()}
            onValueChange={(value) => handleAnswerSelect(parseInt(value))}
            disabled={showResult}
          >
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrectOption = idx === currentQuestion.correct_answer;
                const showCorrect = showResult && isCorrectOption;
                const showIncorrect = showResult && isSelected && !isCorrectOption;

                return (
                  <div
                    key={option.id}
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors ${
                      showCorrect
                        ? "border-green-500 bg-green-500/10"
                        : showIncorrect
                        ? "border-red-500 bg-red-500/10"
                        : isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                    <Label
                      htmlFor={`option-${idx}`}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      {option.text}
                    </Label>
                    {showCorrect && <Check className="h-5 w-5 text-green-500" />}
                    {showIncorrect && <X className="h-5 w-5 text-red-500" />}
                  </div>
                );
              })}
            </div>
          </RadioGroup>

          {/* Submit Button */}
          {!showResult && (
            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="w-full"
              size="lg"
            >
              Submit Answer
            </Button>
          )}

          {/* Explanation & Rating */}
          {showResult && (
            <div className="space-y-4">
              <Card className={isCorrect ? "border-green-500/50" : "border-red-500/50"}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-3">
                    {isCorrect ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="h-5 w-5" />
                        <span className="font-semibold">Correct!</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600">
                        <X className="h-5 w-5" />
                        <span className="font-semibold">Incorrect</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <p className="text-sm font-medium">How well did you know this?</p>
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    onClick={() => handleRating("again")}
                    variant="outline"
                    className="border-red-500 hover:bg-red-500/10"
                  >
                    Again
                  </Button>
                  <Button
                    onClick={() => handleRating("hard")}
                    variant="outline"
                    className="border-orange-500 hover:bg-orange-500/10"
                  >
                    Hard
                  </Button>
                  <Button
                    onClick={() => handleRating("good")}
                    variant="outline"
                    className="border-blue-500 hover:bg-blue-500/10"
                  >
                    Good
                  </Button>
                  <Button
                    onClick={() => handleRating("easy")}
                    variant="outline"
                    className="border-green-500 hover:bg-green-500/10"
                  >
                    Easy
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
