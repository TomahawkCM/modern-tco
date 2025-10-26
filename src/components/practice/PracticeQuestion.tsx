"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, XCircle, AlertCircle, BookOpen } from "lucide-react";
import type { PracticeQuestion as PracticeQuestionType } from "@/types/practice-session";
import { TCODomain, Difficulty } from "@/types/exam";
import { cn } from "@/lib/utils";

interface PracticeQuestionProps {
  question: PracticeQuestionType;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (questionId: string, choiceId: string) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  showFeedback?: boolean;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  timeRemaining?: number;
  className?: string;
}

const DOMAIN_COLORS: Record<TCODomain, string> = {
  [TCODomain.ASKING_QUESTIONS]: "bg-blue-100 text-blue-700 border-blue-200",
  [TCODomain.REFINING_QUESTIONS]: "bg-green-100 text-green-700 border-green-200",
  [TCODomain.REFINING_TARGETING]: "bg-green-100 text-green-700 border-green-200", // Alias uses same color
  [TCODomain.TAKING_ACTION]: "bg-orange-100 text-orange-700 border-orange-200",
  [TCODomain.NAVIGATION_MODULES]: "bg-cyan-100 text-cyan-700 border-cyan-200",
  [TCODomain.REPORTING_EXPORT]: "bg-teal-100 text-teal-700 border-teal-200",
  // Additional domain colors
  [TCODomain.SECURITY]: "bg-red-100 text-red-700 border-red-200",
  [TCODomain.FUNDAMENTALS]: "bg-sky-100 text-sky-700 border-sky-200",
  [TCODomain.TROUBLESHOOTING]: "bg-pink-100 text-pink-700 border-pink-200",
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  [Difficulty.BEGINNER]: "bg-gray-100 text-gray-600",
  [Difficulty.INTERMEDIATE]: "bg-yellow-100 text-yellow-700",
  [Difficulty.ADVANCED]: "bg-red-100 text-red-700",
  [Difficulty.EXPERT]: "bg-black text-foreground",
};

export function PracticeQuestion({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onNext,
  onPrevious,
  showFeedback = false,
  canGoNext = false,
  canGoPrevious = false,
  timeRemaining,
  className,
}: PracticeQuestionProps) {
  const [selectedChoice, setSelectedChoice] = useState<string>(question.userAnswer ?? "");
  const [questionStartTime] = useState<number>(Date.now());
  const [timeSpent, setTimeSpent] = useState<number>(0);

  // Track time spent on current question
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - questionStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [questionStartTime]);

  const handleChoiceSelect = (choiceId: string) => {
    setSelectedChoice(choiceId);
    onAnswer(question.id, choiceId);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getChoiceIcon = (choiceId: string) => {
    if (!showFeedback || !question.userAnswer) return null;

    if (choiceId === question.correctAnswerId) {
      return <CheckCircle className="h-4 w-4 text-[#22c55e]" />;
    } else if (choiceId === question.userAnswer && choiceId !== question.correctAnswerId) {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }

    return null;
  };

  const getChoiceStyle = (choiceId: string) => {
    if (!showFeedback || !question.userAnswer) {
      return selectedChoice === choiceId
        ? "border-primary bg-primary/5"
        : "border-muted hover:border-muted-foreground/50";
    }

    if (choiceId === question.correctAnswerId) {
      return "border-green-500 bg-green-50";
    } else if (choiceId === question.userAnswer && choiceId !== question.correctAnswerId) {
      return "border-red-500 bg-red-50";
    }

    return "border-muted opacity-60";
  };

  const progressPercentage = (questionNumber / totalQuestions) * 100;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Question {questionNumber} of {totalQuestions}
            </span>
            <Progress value={progressPercentage} className="h-2 w-32" />
          </div>

          <div className="flex items-center gap-4">
            {timeRemaining !== undefined && (
              <div className="flex items-center gap-1 text-sm">
                <Clock className="h-4 w-4" />
                <span
                  className={cn(
                    timeRemaining < 60 ? "font-medium text-red-600" : "text-muted-foreground"
                  )}
                >
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeSpent)}</span>
            </div>
          </div>
        </div>

        {/* Question Metadata */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={DOMAIN_COLORS[question.domain]}>
            {question.domain}
          </Badge>
          <Badge variant="outline" className={DIFFICULTY_COLORS[question.difficulty]}>
            {question.difficulty}
          </Badge>
          {question.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl leading-relaxed">{question.question}</CardTitle>
          {question.category && <CardDescription>Category: {question.category}</CardDescription>}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Choices */}
          <RadioGroup
            value={selectedChoice}
            onValueChange={handleChoiceSelect}
            disabled={showFeedback}
            className="space-y-3"
          >
            {question.choices.map((choice) => (
              <div
                key={choice.id}
                className={cn(
                  "flex items-center space-x-3 rounded-lg border-2 p-4 transition-colors",
                  getChoiceStyle(choice.id)
                )}
              >
                <RadioGroupItem value={choice.id} id={choice.id} disabled={showFeedback} />
                <Label htmlFor={choice.id} className="flex-1 cursor-pointer leading-relaxed">
                  {choice.text}
                </Label>
                {getChoiceIcon(choice.id)}
              </div>
            ))}
          </RadioGroup>

          {/* Feedback */}
          {showFeedback && question.userAnswer && (
            <div className="space-y-4 border-t pt-4">
              <div
                className={cn(
                  "flex items-start gap-3 rounded-lg p-4",
                  question.isCorrect
                    ? "border border-green-200 bg-green-50"
                    : "border border-red-200 bg-red-50"
                )}
              >
                {question.isCorrect ? (
                  <CheckCircle className="mt-0.5 h-5 w-5 text-[#22c55e]" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
                )}
                <div>
                  <p
                    className={cn(
                      "font-medium",
                      question.isCorrect ? "text-green-800" : "text-red-800"
                    )}
                  >
                    {question.isCorrect ? "Correct!" : "Incorrect"}
                  </p>
                  {question.explanation && (
                    <p
                      className={cn(
                        "mt-1 text-sm",
                        question.isCorrect ? "text-green-700" : "text-red-700"
                      )}
                    >
                      {question.explanation}
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Resources */}
              {(question.studyGuideRef ?? question.officialRef) && (
                <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <BookOpen className="mt-0.5 h-5 w-5 text-blue-600" />
                  <div className="space-y-1">
                    <p className="font-medium text-blue-800">Additional Resources</p>
                    {question.studyGuideRef && (
                      <p className="text-sm text-blue-700">Study Guide: {question.studyGuideRef}</p>
                    )}
                    {question.officialRef && (
                      <p className="text-sm text-blue-700">Official Docs: {question.officialRef}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="flex items-center gap-2"
        >
          ← Previous
        </Button>

        <div className="flex items-center gap-2">
          {!selectedChoice && (
            <div className="flex items-center gap-1 text-sm text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span>Please select an answer</span>
            </div>
          )}
        </div>

        <Button onClick={onNext} disabled={!canGoNext} className="flex items-center gap-2">
          Next →
        </Button>
      </div>
    </div>
  );
}
