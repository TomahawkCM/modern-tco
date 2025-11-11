"use client";

/**
 * Review Screen Component
 * Pre-submit confirmation screen for mock exams
 * Shows unanswered questions, marked questions, and summary statistics
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  CheckCircle,
  FileText,
  Flag,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { useExam } from "@/contexts/ExamContext";
import { cn } from "@/lib/utils";

interface ReviewScreenProps {
  onBack: () => void;
  onSubmit: () => void;
  onJumpToQuestion: (questionIndex: number) => void;
}

export function ReviewScreen({ onBack, onSubmit, onJumpToQuestion }: ReviewScreenProps) {
  const { state, getCurrentQuestion, getProgress } = useExam();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  if (!state.currentSession) {
    return null;
  }

  const { questions, answers } = state.currentSession;
  const progress = getProgress();

  // Calculate statistics
  const answeredQuestions = Object.keys(answers).filter(
    (qId) => answers[qId] !== undefined && answers[qId] !== ""
  );
  const unansweredQuestions = questions.filter(
    (q) => !answers[q.id] || answers[q.id] === ""
  );
  const answeredCount = answeredQuestions.length;
  const unansweredCount = unansweredQuestions.length;

  // Placeholder for marked questions (will be implemented in task 9264888d)
  const markedQuestions: any[] = [];
  const markedCount = markedQuestions.length;

  const handleSubmitClick = () => {
    if (unansweredCount > 0) {
      setShowConfirmDialog(true);
    } else {
      onSubmit();
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirmDialog(false);
    onSubmit();
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Review Your Exam</h1>
        <p className="text-muted-foreground">
          Review your answers before final submission
        </p>
      </div>

      {/* Summary Statistics Card */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-foreground">
            <FileText className="h-6 w-6 text-tanium-accent" />
            Exam Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-tanium-accent">
                {progress.total}
              </div>
              <div className="text-sm text-muted-foreground">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold text-green-500">
                {answeredCount}
              </div>
              <div className="text-sm text-muted-foreground">Answered</div>
            </div>
            <div className="text-center">
              <div
                className={cn(
                  "mb-2 text-4xl font-bold",
                  unansweredCount > 0 ? "text-red-500" : "text-green-500"
                )}
              >
                {unansweredCount}
              </div>
              <div className="text-sm text-muted-foreground">Unanswered</div>
            </div>
          </div>

          {/* Warning banner if unanswered questions */}
          {unansweredCount > 0 && (
            <div className="mt-6 rounded-lg border-2 border-red-500 bg-red-900/20 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
                <div>
                  <p className="font-semibold text-red-400">
                    You have {unansweredCount} unanswered question
                    {unansweredCount !== 1 ? "s" : ""}
                  </p>
                  <p className="mt-1 text-sm text-red-400/80">
                    Review the questions below and provide answers before submitting.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success banner if all answered */}
          {unansweredCount === 0 && (
            <div className="mt-6 rounded-lg border-2 border-green-500 bg-green-900/20 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-green-500" />
                <div>
                  <p className="font-semibold text-green-400">All questions answered!</p>
                  <p className="mt-1 text-sm text-green-400/80">
                    You&apos;re ready to submit your exam.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unanswered Questions Section */}
      {unansweredCount > 0 && (
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-foreground">
              <AlertCircle className="h-6 w-6 text-red-500" />
              Unanswered Questions ({unansweredCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3 pr-4">
                {unansweredQuestions.map((question, idx) => {
                  const questionNumber =
                    questions.findIndex((q) => q.id === question.id) + 1;
                  return (
                    <div
                      key={question.id}
                      className="flex items-start justify-between gap-4 rounded-lg border border-red-500/30 bg-red-900/10 p-4"
                    >
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="outline" className="border-red-500 text-red-400">
                            Question {questionNumber}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {question.domain}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-sm text-foreground">
                          {question.question}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onJumpToQuestion(questionNumber - 1)}
                        className="shrink-0 border-red-500 text-red-400 hover:bg-red-900/20"
                      >
                        Answer
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Marked Questions Section (placeholder for future feature) */}
      {markedCount > 0 && (
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-foreground">
              <Flag className="h-6 w-6 text-amber-500" />
              Marked for Review ({markedCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3 pr-4">
                {markedQuestions.map((question: any, idx: number) => {
                  const questionNumber =
                    questions.findIndex((q) => q.id === question.id) + 1;
                  return (
                    <div
                      key={question.id}
                      className="flex items-start justify-between gap-4 rounded-lg border border-amber-500/30 bg-amber-900/10 p-4"
                    >
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant="outline" className="border-amber-500 text-amber-400">
                            Question {questionNumber}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {question.domain}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-sm text-foreground">
                          {question.question}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onJumpToQuestion(questionNumber - 1)}
                        className="shrink-0 border-amber-500 text-amber-400 hover:bg-amber-900/20"
                      >
                        Review
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="border-white/20 text-foreground hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Exam
        </Button>

        <Button
          onClick={handleSubmitClick}
          size="lg"
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="mr-2 h-5 w-5" />
          Submit Exam
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="glass border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-foreground">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              Submit with Unanswered Questions?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              You have <span className="font-semibold text-red-400">{unansweredCount}</span>{" "}
              unanswered question{unansweredCount !== 1 ? "s" : ""}. Unanswered questions
              will be marked as incorrect.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 rounded-lg border border-red-500/50 bg-red-900/20 p-4">
            <p className="text-sm text-red-400">
              Are you sure you want to submit your exam with {unansweredCount} unanswered
              question{unansweredCount !== 1 ? "s" : ""}?
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="border-white/20 text-foreground hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSubmit}
              className="bg-red-600 hover:bg-red-700"
            >
              Submit Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
