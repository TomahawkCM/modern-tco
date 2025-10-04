"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { flashcardService } from "@/services/flashcardService";
import { CheckCircle2, XCircle, HelpCircle, Sparkles, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MicroQuizProps {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  moduleId?: string;
  sectionId?: string;
  concept?: string; // The main concept being tested
}

export default function MicroQuiz({
  question,
  options,
  correctAnswer,
  explanation,
  moduleId,
  sectionId,
  concept,
}: MicroQuizProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [flashcardCreated, setFlashcardCreated] = useState(false);

  const handleSubmit = () => {
    if (!selectedAnswer) {
      toast({
        title: "No answer selected",
        description: "Please select an answer before checking.",
        variant: "destructive",
      });
      return;
    }

    const correct = selectedAnswer === correctAnswer;
    setIsCorrect(correct);
    setIsSubmitted(true);

    // Track analytics (PostHog integration point)
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('micro_quiz_answered', {
        question,
        correct,
        moduleId,
        sectionId,
        concept,
      });
    }
  };

  const handleCreateFlashcard = async () => {
    if (!user?.id || flashcardCreated) return;

    try {
      // Create flashcard from failed quiz question
      await flashcardService.createFlashcard(
        user.id,
        question,
        correctAnswer,
        {
          type: 'basic',
          source: 'quiz_failure',
          moduleId,
          sectionId,
          explanation: explanation || undefined,
          tags: concept ? [concept, 'micro-quiz', 'needs-review'] : ['micro-quiz', 'needs-review'],
        }
      );

      setFlashcardCreated(true);
      toast({
        title: "Flashcard created!",
        description: "This question has been added to your review queue for spaced repetition.",
      });

      // Track flashcard creation
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture('flashcard_created_from_micro_quiz', {
          question,
          moduleId,
          concept,
        });
      }
    } catch (error) {
      console.error("Error creating flashcard:", error);
      toast({
        title: "Error",
        description: "Failed to create flashcard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setSelectedAnswer("");
    setIsSubmitted(false);
    setIsCorrect(null);
    setFlashcardCreated(false);
  };

  return (
    <Card className="my-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <HelpCircle className="h-5 w-5 text-primary" />
            Quick Knowledge Check
            {concept && (
              <Badge variant="outline" className="ml-2">
                {concept}
              </Badge>
            )}
          </CardTitle>
          {isSubmitted && (
            <Badge
              variant={isCorrect ? "default" : "destructive"}
              className={isCorrect ? "bg-green-600" : ""}
            >
              {isCorrect ? (
                <>
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Correct
                </>
              ) : (
                <>
                  <XCircle className="mr-1 h-3 w-3" />
                  Incorrect
                </>
              )}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-medium text-foreground">{question}</p>

        <RadioGroup
          value={selectedAnswer}
          onValueChange={setSelectedAnswer}
          disabled={isSubmitted}
          className="space-y-3"
        >
          {options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = option === correctAnswer;
            const showCorrect = isSubmitted && isCorrectOption;
            const showIncorrect = isSubmitted && isSelected && !isCorrect;

            return (
              <div
                key={index}
                className={`flex items-center space-x-3 rounded-lg border-2 p-3 transition-all ${
                  showCorrect
                    ? "border-green-500 bg-green-500/10"
                    : showIncorrect
                      ? "border-red-500 bg-red-500/10"
                      : isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                }`}
              >
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer font-normal"
                >
                  {option}
                  {showCorrect && (
                    <CheckCircle2 className="ml-2 inline h-4 w-4 text-green-600" />
                  )}
                  {showIncorrect && (
                    <XCircle className="ml-2 inline h-4 w-4 text-red-600" />
                  )}
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        {/* Explanation (shown after submission) */}
        {isSubmitted && explanation && (
          <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
              <AlertCircle className="h-4 w-4" />
              Explanation
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400">{explanation}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {!isSubmitted ? (
            <Button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
              className="flex-1"
            >
              Check Answer
            </Button>
          ) : (
            <>
              <Button onClick={handleReset} variant="outline" className="flex-1">
                Try Again
              </Button>
              {!isCorrect && user?.id && (
                <Button
                  onClick={handleCreateFlashcard}
                  disabled={flashcardCreated}
                  variant="secondary"
                  className="flex-1"
                >
                  {flashcardCreated ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Flashcard Added
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create Flashcard
                    </>
                  )}
                </Button>
              )}
            </>
          )}
        </div>

        {/* Helpful hint for users */}
        {!isSubmitted && (
          <p className="text-xs text-muted-foreground">
            💡 This quick check helps reinforce what you just learned. Take your time!
          </p>
        )}

        {isSubmitted && !isCorrect && !flashcardCreated && user?.id && (
          <p className="text-xs text-muted-foreground">
            💡 Create a flashcard to review this concept with spaced repetition for better retention!
          </p>
        )}
      </CardContent>
    </Card>
  );
}
