"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CheckCircle, Circle, AlertCircle, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionStatus {
  questionId: string;
  status: "answered" | "unanswered" | "marked";
}

interface QuestionNavigatorProps {
  totalQuestions: number;
  currentQuestionIndex: number;
  questionStatuses: QuestionStatus[];
  onNavigateToQuestion: (index: number) => void;
  className?: string;
}

export function QuestionNavigator({
  totalQuestions,
  currentQuestionIndex,
  questionStatuses,
  onNavigateToQuestion,
  className,
}: QuestionNavigatorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Calculate grid dimensions (7 columns for 105 questions: 7×15 = 105)
  const columns = 7;
  const rows = Math.ceil(totalQuestions / columns);

  const getQuestionStatus = (index: number): "answered" | "unanswered" | "marked" => {
    const status = questionStatuses.find((s) => s.questionId === `q-${index}`);
    return status?.status || "unanswered";
  };

  const getStatusIcon = (status: "answered" | "unanswered" | "marked") => {
    switch (status) {
      case "answered":
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case "marked":
        return <AlertCircle className="h-3 w-3 text-amber-500" />;
      case "unanswered":
        return <Circle className="h-3 w-3 text-gray-400" />;
    }
  };

  const getStatusColor = (
    status: "answered" | "unanswered" | "marked",
    isCurrent: boolean
  ): string => {
    if (isCurrent) {
      return "border-primary bg-primary text-primary-foreground";
    }
    switch (status) {
      case "answered":
        return "border-green-200 bg-green-50 text-green-800 hover:bg-green-100 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "marked":
        return "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300";
      case "unanswered":
        return "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const renderGrid = () => (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-green-600" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1">
          <Circle className="h-3 w-3 text-gray-400" />
          <span>Unanswered</span>
        </div>
        <div className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3 text-amber-500" />
          <span>Marked</span>
        </div>
      </div>

      {/* Question Grid */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: totalQuestions }, (_, i) => {
          const questionIndex = i;
          const questionNumber = i + 1;
          const status = getQuestionStatus(questionIndex);
          const isCurrent = questionIndex === currentQuestionIndex;

          return (
            <Button
              key={questionIndex}
              variant="outline"
              size="sm"
              className={cn(
                "relative h-12 w-full transition-all",
                getStatusColor(status, isCurrent)
              )}
              onClick={() => {
                onNavigateToQuestion(questionIndex);
                setIsOpen(false); // Close mobile overlay after navigation
              }}
              aria-label={`Navigate to question ${questionNumber} - ${status}${isCurrent ? " (current)" : ""}`}
            >
              <div className="flex flex-col items-center justify-center gap-1">
                <span className="text-xs font-semibold">{questionNumber}</span>
                {getStatusIcon(status)}
              </div>
            </Button>
          );
        })}
      </div>

      {/* Summary Statistics */}
      <div className="border-t pt-4 text-sm">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Answered:</span>
            <span className="font-semibold text-green-600">
              {questionStatuses.filter((s) => s.status === "answered").length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Unanswered:</span>
            <span className="font-semibold text-gray-600">
              {questionStatuses.filter((s) => s.status === "unanswered").length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Marked for Review:</span>
            <span className="font-semibold text-amber-600">
              {questionStatuses.filter((s) => s.status === "marked").length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: Fixed Sidebar */}
      <div className={cn("hidden lg:block", className)}>
        <div className="sticky top-4 space-y-4">
          <h3 className="text-lg font-semibold">Questions</h3>
          {renderGrid()}
        </div>
      </div>

      {/* Mobile: Collapsible Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full shadow-lg lg:hidden"
            aria-label="Open question navigator"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[90vw] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Question Navigator</SheetTitle>
          </SheetHeader>
          <div className="mt-6">{renderGrid()}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}
