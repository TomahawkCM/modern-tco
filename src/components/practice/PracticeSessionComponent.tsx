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
  Clock,
  BookOpen,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type PracticeSession,
  type PracticeQuestion,
  getPracticeQuestions,
  answerPracticeQuestion,
  completePracticeSession,
} from "@/lib/practiceMode";
import type { Question } from "@/lib/questionBank";

interface PracticeSessionComponentProps {
  /** Practice session */
  session: PracticeSession;
  /** Callback when session completes */
  onComplete?: (session: PracticeSession) => void;
  /** Callback to exit session */
  onExit?: () => void;
}

/**
 * Practice Session Component
 *
 * Interactive practice session with immediate feedback
 */
export function PracticeSessionComponent({
  session,
  onComplete,
  onExit,
}: PracticeSessionComponentProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showFinalResults, setShowFinalResults] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // Load practice questions
  useEffect(() => {
    const practiceQuestions = getPracticeQuestions(session);
    setQuestions(practiceQuestions);

    // Initialize session questions
    session.questions = practiceQuestions.map((q, idx) => ({
      questionId: `${session.id}-q${idx}`,
      question: q,
      timeSpent: 0,
      timestamp: new Date(),
    }));
  }, [session]);

  // Reset timer when question changes
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentIndex]);

  const handleSelectAnswer = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion || !selectedAnswer) return;

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const questionId = session.questions[currentIndex].questionId;

    const result = answerPracticeQuestion(
      session,
      questionId,
      selectedAnswer,
      timeSpent
    );

    setIsCorrect(result.correct);
    setShowResult(true);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Session complete
      const completedSession = completePracticeSession(session);
      setShowFinalResults(true);

      if (onComplete) {
        onComplete(completedSession);
      }
    } else {
      // Next question
      setCurrentIndex(currentIndex + 1);
      setShowResult(false);
      setSelectedAnswer(null);
    }
  };

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading practice questions...</p>
        </CardContent>
      </Card>
    );
  }

  if (showFinalResults) {
    const accuracy = (session.score / session.questions.length) * 100;

    return (
      <Card className="border-accent/20 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-[#f97316]" />
            Practice Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score */}
          <div className="text-center">
            <div className="mb-2 text-5xl font-bold text-accent-foreground">
              {Math.round(accuracy)}%
            </div>
            <p className="text-muted-foreground">
              {session.score} / {session.questions.length} correct
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Accuracy</span>
              </div>
              <div className="text-2xl font-bold text-primary">
                {Math.round(accuracy)}%
              </div>
            </div>

            <div className="rounded-lg border border-[#22c55e]/20 bg-[#22c55e]/5 p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                <span className="text-sm text-muted-foreground">Correct</span>
              </div>
              <div className="text-2xl font-bold text-[#22c55e]">
                {session.score}
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div className="rounded-lg border border-gray-700 bg-card/30 p-4">
            <p className="text-sm text-muted-foreground">
              {accuracy >= 90
                ? "🎉 Excellent work! You're ready for harder challenges."
                : accuracy >= 70
                ? "👍 Good job! Keep practicing to improve further."
                : "📚 Keep studying! Review the concepts and try again."}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => {
                if (onExit) onExit();
              }}
              variant="outline"
              className="flex-1"
            >
              Exit
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="flex-1 bg-accent hover:bg-purple-700"
            >
              Practice Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" />
            Practice Session
          </CardTitle>
          <Badge variant="outline">
            Question {currentIndex + 1} / {questions.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Score */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Score: {session.score} / {currentIndex}
          </span>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {Math.floor((Date.now() - questionStartTime) / 1000)}s
          </Badge>
        </div>

        {/* Question */}
        {!showResult && currentQuestion && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="py-6">
              <div className="space-y-4">
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant="outline">
                      {currentQuestion.type === "true-false" ? "True/False" : "Multiple Choice"}
                    </Badge>
                    <Badge variant="outline">
                      Difficulty: {currentQuestion.difficulty}
                    </Badge>
                  </div>
                  <p className="text-base font-medium text-foreground">{currentQuestion.question}</p>
                </div>

                <div className="space-y-2">
                  {currentQuestion.type === "true-false" ? (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleSelectAnswer("True")}
                        className={cn(
                          "flex-1 rounded-lg border-2 p-4 transition-colors",
                          selectedAnswer === "True"
                            ? "border-green-500 bg-[#22c55e]/20"
                            : "border-gray-700 hover:border-gray-600"
                        )}
                      >
                        <CheckCircle2 className="mx-auto mb-2 h-6 w-6" />
                        <span>True</span>
                      </button>
                      <button
                        onClick={() => handleSelectAnswer("False")}
                        className={cn(
                          "flex-1 rounded-lg border-2 p-4 transition-colors",
                          selectedAnswer === "False"
                            ? "border-red-500 bg-red-500/20"
                            : "border-gray-700 hover:border-gray-600"
                        )}
                      >
                        <XCircle className="mx-auto mb-2 h-6 w-6" />
                        <span>False</span>
                      </button>
                    </div>
                  ) : (
                    currentQuestion.options?.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectAnswer(option)}
                        className={cn(
                          "w-full rounded-lg border-2 p-4 text-left transition-colors",
                          selectedAnswer === option
                            ? "border-purple-500 bg-accent/20"
                            : "border-gray-700 hover:border-gray-600"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full border border-gray-600 text-xs">
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className="flex-1">{option}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer}
                  className="w-full bg-accent hover:bg-purple-700"
                >
                  Submit Answer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Result */}
        {showResult && currentQuestion && (
          <Card
            className={cn(
              "border-2",
              isCorrect ? "border-[#22c55e]/30 bg-[#22c55e]/5" : "border-orange-500/30 bg-orange-500/5"
            )}
          >
            <CardContent className="py-6">
              <div className="mb-4 text-center">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="mx-auto mb-2 h-12 w-12 text-[#22c55e]" />
                    <h4 className="text-lg font-semibold text-[#22c55e]">Correct! ✓</h4>
                  </>
                ) : (
                  <>
                    <XCircle className="mx-auto mb-2 h-12 w-12 text-orange-500" />
                    <h4 className="text-lg font-semibold text-orange-300">Incorrect</h4>
                  </>
                )}
              </div>

              <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="mb-3">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {currentQuestion.concept}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">{currentQuestion.question}</p>
                </div>

                <div className="mb-3 rounded bg-[#22c55e]/10 px-3 py-2">
                  <div className="mb-1 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#22c55e]" />
                    <span className="text-xs font-semibold text-[#22c55e]">Correct Answer:</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{currentQuestion.correctAnswer}</p>
                </div>

                {!isCorrect && selectedAnswer && (
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
                  <p className="text-sm leading-relaxed text-muted-foreground">{currentQuestion.explanation}</p>
                </div>
              </div>

              <Button onClick={handleNext} className="w-full bg-accent hover:bg-purple-700">
                {isLastQuestion ? "Complete Session" : "Next Question"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

export default PracticeSessionComponent;
