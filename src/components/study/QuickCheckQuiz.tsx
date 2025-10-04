"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trophy,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  concept: string;
}

interface QuickCheckQuizProps {
  /** Unique quiz identifier for progress tracking */
  quizId: string;
  /** Module ID for grouping */
  moduleId: string;
  /** Section ID for tracking weak areas */
  sectionId: string;
  /** Section title for display */
  sectionTitle: string;
  /** Array of quiz questions */
  questions: QuizQuestion[];
  /** Pass threshold percentage (default 80%) */
  passThreshold?: number;
  /** Callback when quiz is passed */
  onPass?: () => void;
  /** Callback when quiz is failed */
  onFail?: () => void;
}

export function QuickCheckQuiz({
  quizId,
  moduleId,
  sectionId,
  sectionTitle,
  questions,
  passThreshold = 80,
  onPass,
  onFail,
}: QuickCheckQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [isPassed, setIsPassed] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  // Check if quiz was already passed
  useEffect(() => {
    const storageKey = `quiz-passed-${moduleId}-${sectionId}`;
    const passed = localStorage.getItem(storageKey) === "true";
    if (passed) {
      setQuizComplete(true);
      setIsPassed(true);
    }
  }, [moduleId, sectionId]);

  const handleSelectAnswer = (answer: string) => {
    if (quizComplete) return;

    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.id]: answer,
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Last question - show results
      calculateAndShowResults();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateAndShowResults = () => {
    let correctCount = 0;
    const weakConcepts: string[] = [];

    questions.forEach((question) => {
      const userAnswer = selectedAnswers[question.id];
      if (userAnswer === question.correctAnswer) {
        correctCount++;
      } else {
        weakConcepts.push(question.concept);
      }
    });

    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    setScore(scorePercentage);
    setShowResults(true);

    const passed = scorePercentage >= passThreshold;
    setIsPassed(passed);

    if (passed) {
      // Mark quiz as passed in localStorage
      const storageKey = `quiz-passed-${moduleId}-${sectionId}`;
      localStorage.setItem(storageKey, "true");
      setQuizComplete(true);

      // Track successful completion
      trackQuizCompletion(true, scorePercentage, weakConcepts);

      if (onPass) onPass();
    } else {
      // Track weak areas for spaced repetition
      trackQuizCompletion(false, scorePercentage, weakConcepts);

      if (onFail) onFail();
    }
  };

  const trackQuizCompletion = (
    passed: boolean,
    scorePercentage: number,
    weakConcepts: string[]
  ) => {
    // Store quiz attempt
    const attemptKey = `quiz-attempt-${moduleId}-${sectionId}`;
    const attempts = JSON.parse(localStorage.getItem(attemptKey) || "[]");

    attempts.push({
      timestamp: new Date().toISOString(),
      score: scorePercentage,
      passed,
      weakConcepts,
    });

    localStorage.setItem(attemptKey, JSON.stringify(attempts));

    // Track weak areas for spaced repetition (Week 2 feature)
    if (weakConcepts.length > 0) {
      const weakAreasKey = `weak-areas-${moduleId}`;
      const weakAreas = JSON.parse(localStorage.getItem(weakAreasKey) || "{}");

      weakConcepts.forEach((concept) => {
        weakAreas[concept] = (weakAreas[concept] || 0) + 1;
      });

      localStorage.setItem(weakAreasKey, JSON.stringify(weakAreas));
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setScore(0);
  };

  const isAnswerCorrect = (questionId: string, answer: string): boolean => {
    const question = questions.find((q) => q.id === questionId);
    return question ? answer === question.correctAnswer : false;
  };

  const currentAnswer = selectedAnswers[currentQuestion.id];
  const hasAnswered = !!currentAnswer;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // Results view
  if (showResults) {
    return (
      <Card
        className={cn(
          "border-2",
          isPassed
            ? "border-green-500/30 bg-green-500/5"
            : "border-orange-500/30 bg-orange-500/5"
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isPassed ? (
              <Trophy className="h-6 w-6 text-yellow-500" />
            ) : (
              <AlertCircle className="h-6 w-6 text-orange-500" />
            )}
            <span className={isPassed ? "text-green-300" : "text-orange-300"}>
              Quick Check Results
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="text-center">
            <div className="mb-4">
              <div className="mb-2 text-5xl font-bold text-white">{score}%</div>
              <p className="text-sm text-gray-400">
                {questions.filter((q) => isAnswerCorrect(q.id, selectedAnswers[q.id])).length} of{" "}
                {totalQuestions} correct
              </p>
            </div>

            <Progress
              value={score}
              className={cn("h-3", isPassed ? "bg-green-900/30" : "bg-orange-900/30")}
            />

            <div className="mt-4">
              {isPassed ? (
                <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                  <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-green-500" />
                  <p className="font-bold text-green-300">Excellent Work! 🎉</p>
                  <p className="text-sm text-green-400 mt-1">
                    You've demonstrated strong understanding of this section. You can now mark it
                    complete and continue to the next section.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4">
                  <AlertCircle className="mx-auto mb-2 h-8 w-8 text-orange-500" />
                  <p className="font-bold text-orange-300">
                    Score below {passThreshold}% - Review and Retry
                  </p>
                  <p className="text-sm text-orange-400 mt-1">
                    Don't worry! Review the explanations below, re-read the section content, and
                    try again. Learning takes practice.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Question Review */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Detailed Review:</h3>
            {questions.map((question, idx) => {
              const userAnswer = selectedAnswers[question.id];
              const correct = isAnswerCorrect(question.id, userAnswer);

              return (
                <Card
                  key={question.id}
                  className={cn(
                    "border",
                    correct ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
                  )}
                >
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      {correct ? (
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-500 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white mb-2">
                          Question {idx + 1}: {question.question}
                        </p>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-400">
                            <span className="font-medium">Your answer:</span>{" "}
                            <span className={correct ? "text-green-400" : "text-red-400"}>
                              {userAnswer || "Not answered"}
                            </span>
                          </p>
                          {!correct && (
                            <p className="text-gray-400">
                              <span className="font-medium">Correct answer:</span>{" "}
                              <span className="text-green-400">{question.correctAnswer}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
                      <p className="text-xs font-medium text-blue-300 mb-1">Explanation:</p>
                      <p className="text-sm text-gray-300">{question.explanation}</p>
                      <Badge variant="outline" className="mt-2 text-xs border-blue-500/30 text-blue-400">
                        Concept: {question.concept}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isPassed && (
              <Button onClick={handleRetry} variant="outline" className="flex-1">
                <RotateCcw className="mr-2 h-4 w-4" />
                Retry Quiz
              </Button>
            )}
            {isPassed && (
              <Button className="flex-1 bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Continue to Next Section
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Quiz in progress
  return (
    <Card className="border-purple-500/20 bg-purple-500/5">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-sm text-purple-300">Quick Check Quiz</CardTitle>
          <Badge variant="outline" className="border-purple-500/30 text-purple-400">
            {currentQuestionIndex + 1} of {totalQuestions}
          </Badge>
        </div>
        <Progress
          value={((currentQuestionIndex + 1) / totalQuestions) * 100}
          className="h-2"
        />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Question */}
        <div className="space-y-4">
          <p className="font-medium text-white">{currentQuestion.question}</p>

          <div className="space-y-2">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(option)}
                disabled={quizComplete}
                className={cn(
                  "w-full rounded-lg border-2 p-4 text-left transition-all",
                  currentAnswer === option
                    ? "border-purple-500 bg-purple-500/20 text-white"
                    : "border-gray-700 bg-gray-800/50 text-gray-300 hover:border-purple-500/50 hover:bg-purple-500/10",
                  quizComplete && "cursor-not-allowed opacity-60"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-bold",
                      currentAnswer === option
                        ? "border-purple-400 bg-purple-500 text-white"
                        : "border-gray-600 text-gray-500"
                    )}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            className="flex-1"
          >
            Previous
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={handleNextQuestion}
              disabled={!hasAnswered}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              disabled={!hasAnswered}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              Next Question
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        <p className="text-center text-xs text-gray-500">
          Pass threshold: {passThreshold}% ({Math.ceil((passThreshold / 100) * totalQuestions)}/
          {totalQuestions} correct)
        </p>
      </CardContent>
    </Card>
  );
}

export default QuickCheckQuiz;
