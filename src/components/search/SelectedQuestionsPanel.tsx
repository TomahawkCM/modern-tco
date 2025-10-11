"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  X,
  Play,
  FileText,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useSearch } from "@/contexts/SearchContext";
import { useExam } from "@/contexts/ExamContext";
import { useRouter } from "next/navigation";
import { ExamMode, TCODomain } from "@/types/exam";
import { cn } from "@/lib/utils";

export function SelectedQuestionsPanel() {
  const router = useRouter();
  const { state, removeFromSelection, clearSelection } = useSearch();
  const { startExam } = useExam();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStartPractice = () => {
    if (state.selectedQuestions.length === 0) return;

    void startExam(ExamMode.PRACTICE, state.selectedQuestions);
    clearSelection();
    router.push("/practice");
  };

  const handleCreateMockExam = () => {
    if (state.selectedQuestions.length === 0) return;

    void startExam(ExamMode.MOCK, state.selectedQuestions);
    clearSelection();
    router.push("/mock");
  };

  // Calculate domain distribution
  const domainStats = Object.values(TCODomain)
    .map((domain) => {
      const count = state.selectedQuestions.filter((q) => q.domain === domain).length;
      const percentage = count > 0 ? Math.round((count / state.selectedQuestions.length) * 100) : 0;
      return { domain, count, percentage };
    })
    .filter((stat) => stat.count > 0);

  // Calculate difficulty distribution
  const difficultyStats = ["Beginner", "Intermediate", "Advanced"]
    .map((difficulty) => {
      const count = state.selectedQuestions.filter((q) => q.difficulty === difficulty).length;
      const percentage = count > 0 ? Math.round((count / state.selectedQuestions.length) * 100) : 0;
      return { difficulty, count, percentage };
    })
    .filter((stat) => stat.count > 0);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "text-[#22c55e]";
      case "Intermediate":
        return "text-[#f97316]";
      case "Advanced":
        return "text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  const getRecommendation = () => {
    const count = state.selectedQuestions.length;
    if (count === 0) return null;
    if (count < 5)
      return { type: "warning", message: "Consider adding more questions for better practice" };
    if (count > 50)
      return {
        type: "warning",
        message: "Large selection - consider breaking into smaller sessions",
      };
    if (count >= 5 && count <= 20)
      return { type: "success", message: "Good selection size for focused practice" };
    if (count >= 21 && count <= 50)
      return { type: "success", message: "Excellent size for comprehensive practice" };
    return null;
  };

  const recommendation = getRecommendation();

  if (state.selectedQuestions.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
          <CheckCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-sm font-medium text-foreground">No questions selected</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Select questions from the search results to create a custom practice session or mock exam.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selected Count & Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground">
            {state.selectedQuestions.length} Question
            {state.selectedQuestions.length !== 1 ? "s" : ""}
          </h3>
          <Button
            onClick={clearSelection}
            variant="ghost"
            size="sm"
            className="h-auto p-1 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>

        {/* Recommendation */}
        {recommendation && (
          <div
            className={cn(
              "flex items-start gap-2 rounded-lg p-3 text-xs",
              recommendation.type === "success"
                ? "border border-[#22c55e]/20 bg-[#22c55e]/10"
                : "border border-[#f97316]/20 bg-[#f97316]/10"
            )}
          >
            {recommendation.type === "success" ? (
              <CheckCircle className="mt-0.5 h-3 w-3 shrink-0 text-[#22c55e]" />
            ) : (
              <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-[#f97316]" />
            )}
            <span
              className={recommendation.type === "success" ? "text-[#22c55e]" : "text-[#f97316]"}
            >
              {recommendation.message}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-2">
          <Button
            onClick={handleStartPractice}
            className="justify-center bg-tanium-accent text-foreground hover:bg-blue-600"
            disabled={state.selectedQuestions.length === 0}
          >
            <Play className="mr-2 h-4 w-4" />
            Start Practice
          </Button>

          <Button
            onClick={handleCreateMockExam}
            variant="outline"
            className="justify-center border-white/20 text-foreground hover:bg-white/10"
            disabled={state.selectedQuestions.length === 0}
          >
            <FileText className="mr-2 h-4 w-4" />
            Mock Exam
          </Button>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Statistics */}
      <div className="space-y-4">
        {/* Domain Distribution */}
        {domainStats.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-medium text-muted-foreground">Domain Coverage</h4>
            <div className="space-y-2">
              {domainStats.map(({ domain, count, percentage }) => (
                <div key={domain} className="flex items-center justify-between text-xs">
                  <span className="mr-2 flex-1 truncate text-muted-foreground">
                    {domain.length > 20 ? `${domain.substring(0, 17)}...` : domain}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-foreground">{count}</span>
                    <span className="text-muted-foreground">({percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Difficulty Distribution */}
        {difficultyStats.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-medium text-muted-foreground">Difficulty Mix</h4>
            <div className="space-y-2">
              {difficultyStats.map(({ difficulty, count, percentage }) => (
                <div key={difficulty} className="flex items-center justify-between text-xs">
                  <span className={cn("font-medium", getDifficultyColor(difficulty))}>
                    {difficulty}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-foreground">{count}</span>
                    <span className="text-muted-foreground">({percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Separator className="bg-white/10" />

      {/* Questions List */}
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <span>Selected Questions</span>
          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {isExpanded && (
          <ScrollArea className="mt-2 h-64">
            <div className="space-y-2">
              {state.selectedQuestions.map((question, index) => (
                <Card key={question.id} className="border-white/10 bg-white/5 p-3">
                  <div className="flex items-start gap-2">
                    <span className="mt-1 shrink-0 text-xs text-muted-foreground">{index + 1}.</span>
                    <div className="min-w-0 flex-1">
                      <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {question.question}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "px-1 py-0 text-xs",
                              question.difficulty === "Beginner" &&
                                "bg-[#22c55e]/20 text-[#22c55e]",
                              question.difficulty === "Intermediate" &&
                                "bg-[#f97316]/20 text-[#f97316]",
                              question.difficulty === "Advanced" && "bg-red-500/20 text-red-300"
                            )}
                          >
                            {question.difficulty.substring(0, 3)}
                          </Badge>
                        </div>
                        <Button
                          onClick={() => removeFromSelection(question.id)}
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 text-muted-foreground hover:text-red-400"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
