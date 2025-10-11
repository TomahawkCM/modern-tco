"use client";

import { useState, memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Clock, BookOpen } from "lucide-react";
import type { Question } from "@/types/exam";
import { cn, getDifficultyColor } from "@/lib/utils";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer?: string;
  showResult?: boolean;
  showExplanation?: boolean;
  showCorrectAnswer?: boolean;
  onAnswerSelect: (answerId: string) => void;
  onSubmit?: () => void;
  isSubmitted?: boolean;
  mode?: string;
  disabled?: boolean;
}

export const QuestionCard = memo(function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  showResult = false,
  showExplanation = false,
  showCorrectAnswer = false,
  onAnswerSelect,
  onSubmit,
  isSubmitted = false,
  mode,
  disabled = false,
}: QuestionCardProps) {
  const [localAnswer, setLocalAnswer] = useState(selectedAnswer ?? "");

  const handleAnswerChange = (value: string) => {
    setLocalAnswer(value);
    onAnswerSelect(value);
  };

  const isCorrect = showResult && selectedAnswer === question.correctAnswerId;
  const isIncorrect = showResult && selectedAnswer !== question.correctAnswerId && selectedAnswer;

  // Memoize choices to prevent re-renders
  const memoizedChoices = useMemo(() => question.choices, [question.choices]);

  return (
    <Card className="question-card mx-auto w-full max-w-4xl">
      <CardHeader>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm">
              Question {questionNumber} of {totalQuestions}
            </Badge>
            <div className="flex items-center gap-1">
              <Badge variant="secondary">{question.domain}</Badge>
            </div>
            <div className="flex items-center gap-1">
              <Badge
                variant="outline"
                className={cn("text-sm", getDifficultyColor(question.difficulty))}
              >
                {question.difficulty}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>2 min</span>
          </div>
        </div>

        <CardTitle className="text-xl leading-relaxed text-foreground">
          {question.question}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Select your answer:</span>
        </div>

        <div className="space-y-4" role="radiogroup">
          {memoizedChoices.map((choice) => {
            const isSelected = localAnswer === choice.id;
            const isCorrectChoice = showResult && choice.id === question.correctAnswerId;
            const isIncorrectChoice =
              showResult && isSelected && choice.id !== question.correctAnswerId;

            return (
              <div
                key={`choice-${choice.id}-${question.id}`}
                className={cn(
                  "flex items-center space-x-3 rounded-lg border p-4 transition-all",
                  "cursor-pointer hover:bg-accent/50",
                  isSelected && !showResult && "border-primary bg-accent",
                  isCorrectChoice &&
                    "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20",
                  isIncorrectChoice &&
                    "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                )}
                onClick={() => !isSubmitted && !disabled && handleAnswerChange(choice.id)}
              >
                <div className="relative">
                  <input
                    type="radio"
                    id={`${choice.id}-${question.id}`}
                    name={`question-${question.id}`}
                    value={choice.id}
                    checked={isSelected}
                    onChange={() => handleAnswerChange(choice.id)}
                    disabled={isSubmitted ?? disabled}
                    className={cn("sr-only")}
                  />
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all",
                      isSelected ? "border-primary bg-primary" : "border-muted-foreground",
                      isCorrectChoice && "border-green-600 bg-[#22c55e]",
                      isIncorrectChoice && "border-red-600 bg-red-600",
                      (isSubmitted ?? disabled) && "opacity-50"
                    )}
                  >
                    {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <label
                  htmlFor={`${choice.id}-${question.id}`}
                  className="flex-1 cursor-pointer text-base leading-relaxed"
                >
                  {choice.text}
                </label>
                {showResult && isCorrectChoice && (
                  <CheckCircle className="h-5 w-5 text-[#22c55e]" />
                )}
                {showResult && isIncorrectChoice && <XCircle className="h-5 w-5 text-red-600" />}
              </div>
            );
          })}
        </div>

        {showResult && question.explanation && (
          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-muted-foreground">
              <strong>Explanation:</strong> {question.explanation}
            </AlertDescription>
          </Alert>
        )}

        {!showResult && onSubmit && (
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              {localAnswer ? "Answer selected" : "Select an answer to continue"}
            </div>
            <Button
              onClick={onSubmit}
              disabled={!localAnswer || isSubmitted}
              className="bg-tanium-accent hover:bg-blue-600"
            >
              {isSubmitted ? "Submitting..." : "Submit Answer"}
            </Button>
          </div>
        )}

        {showResult && (
          <div className="flex items-center justify-center pt-4">
            <div
              className={cn(
                "flex items-center gap-2 text-lg font-medium",
                isCorrect ? "text-[#22c55e]" : "text-red-600"
              )}
            >
              {isCorrect ? (
                <>
                  <CheckCircle className="h-6 w-6" />
                  Correct!
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6" />
                  Incorrect
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
