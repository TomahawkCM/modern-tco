"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Search,
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Lightbulb,
  Terminal,
  Clock,
} from "lucide-react";
import { useSearch } from "@/contexts/SearchContext";
import type { Question } from "@/types/exam";
import { cn } from "@/lib/utils";

interface QuestionResultCardProps {
  question: Question;
  relevanceScore: number;
  matchedFields: string[];
  isSelected: boolean;
  onToggleSelection: () => void;
  searchQuery: string;
}

function QuestionResultCard({
  question,
  relevanceScore,
  matchedFields,
  isSelected,
  onToggleSelection,
  searchQuery,
}: QuestionResultCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-500";
      case "Intermediate":
        return "bg-yellow-500";
      case "Advanced":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="rounded bg-tanium-accent/30 px-1 text-tanium-accent">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <Card className="glass border-white/10 transition-all duration-200 hover:border-white/20">
      <div className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-start gap-4">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelection}
            className="mt-1 border-white/20 data-[state=checked]:bg-tanium-accent"
          />

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className={cn("text-xs text-white", getDifficultyColor(question.difficulty))}
              >
                {question.difficulty}
              </Badge>

              <Badge variant="outline" className="border-white/20 text-xs text-gray-300">
                {question.domain}
              </Badge>

              <Badge variant="outline" className="border-white/20 text-xs text-gray-300">
                {question.category}
              </Badge>

              {/* Relevance Score */}
              {relevanceScore > 1 && (
                <Badge
                  variant="secondary"
                  className="bg-tanium-accent/20 text-xs text-tanium-accent"
                >
                  {Math.round(relevanceScore * 10)}% match
                </Badge>
              )}
            </div>

            {/* Question Text */}
            <h3 className="mb-3 font-medium leading-relaxed text-white">
              {highlightText(question.question, searchQuery)}
            </h3>

            {/* Matched Fields */}
            {matchedFields.length > 0 && (
              <div className="mb-3 flex items-center gap-1">
                <span className="text-xs text-gray-400">Matches in:</span>
                {matchedFields.map((field, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="border-tanium-accent/50 text-xs text-tanium-accent"
                  >
                    {field}
                  </Badge>
                ))}
              </div>
            )}

            {/* Features */}
            <div className="flex items-center gap-4 text-xs text-gray-400">
              {question.explanation && (
                <div className="flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" />
                  <span>Detailed explanation</span>
                </div>
              )}

              {question.consoleSteps && question.consoleSteps.length > 0 && (
                <div className="flex items-center gap-1">
                  <Terminal className="h-3 w-3" />
                  <span>Console steps</span>
                </div>
              )}

              {question.studyGuideRef && (
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  <span>Study guide</span>
                </div>
              )}
            </div>
          </div>

          {/* Expand/Select Actions */}
          <div className="flex items-center gap-2">
            {isSelected ? (
              <Button
                onClick={onToggleSelection}
                size="sm"
                className="bg-tanium-accent text-white hover:bg-blue-600"
              >
                <Check className="mr-1 h-4 w-4" />
                Selected
              </Button>
            ) : (
              <Button
                onClick={onToggleSelection}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Plus className="mr-1 h-4 w-4" />
                Select
              </Button>
            )}

            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              size="sm"
              className="p-2 text-gray-400 hover:text-white"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Expanded Content */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-4">
            {/* Answer Choices */}
            <div className="border-t border-white/10 pt-4">
              <h4 className="mb-3 text-sm font-medium text-white">Answer Choices:</h4>
              <div className="space-y-2">
                {question.choices.map((choice, index) => (
                  <div
                    key={choice.id}
                    className={cn(
                      "rounded-lg border p-3 transition-colors",
                      choice.id === question.correctAnswerId
                        ? "border-green-500/50 bg-green-500/10"
                        : "border-white/10 bg-white/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-1 text-sm font-medium text-gray-400">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span className="flex-1 text-sm text-gray-300">
                        {highlightText(choice.text, searchQuery)}
                      </span>
                      {choice.id === question.correctAnswerId && (
                        <Badge variant="secondary" className="bg-green-500 text-xs text-white">
                          Correct
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation */}
            {question.explanation && (
              <div className="border-t border-white/10 pt-4">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                  <Lightbulb className="h-4 w-4" />
                  Explanation:
                </h4>
                <p className="text-sm leading-relaxed text-gray-300">
                  {highlightText(question.explanation, searchQuery)}
                </p>
              </div>
            )}

            {/* Console Steps */}
            {question.consoleSteps && question.consoleSteps.length > 0 && (
              <div className="border-t border-white/10 pt-4">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                  <Terminal className="h-4 w-4" />
                  Console Steps:
                </h4>
                <div className="space-y-2">
                  {question.consoleSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3 rounded bg-slate-800/50 p-2">
                      <span className="mt-1 font-mono text-xs text-gray-400">{index + 1}.</span>
                      <code className="flex-1 font-mono text-xs text-green-400">{step}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Study References */}
            {(question.studyGuideRef || question.officialRef) && (
              <div className="border-t border-white/10 pt-4">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                  <BookOpen className="h-4 w-4" />
                  References:
                </h4>
                <div className="space-y-1">
                  {question.studyGuideRef && (
                    <p className="text-xs text-gray-400">
                      Study Guide:{" "}
                      <span className="text-tanium-accent">{question.studyGuideRef}</span>
                    </p>
                  )}
                  {question.officialRef && (
                    <p className="text-xs text-gray-400">
                      Official Docs:{" "}
                      <span className="text-tanium-accent">{question.officialRef}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
}

export function SearchResults() {
  const { state, addToSelection, removeFromSelection, setPage } = useSearch();
  const [selectAll, setSelectAll] = useState(false);

  const handleToggleSelection = (question: Question) => {
    const isSelected = state.selectedQuestions.some((q) => q.id === question.id);
    if (isSelected) {
      removeFromSelection(question.id);
    } else {
      addToSelection(question);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      // Clear all selections
      state.selectedQuestions.forEach((q) => removeFromSelection(q.id));
    } else {
      // Select all current results
      state.results.forEach((result) => {
        if (!state.selectedQuestions.some((q) => q.id === result.question.id)) {
          addToSelection(result.question);
        }
      });
    }
    setSelectAll(!selectAll);
  };

  // Calculate pagination
  const { currentPage, itemsPerPage, totalResults } = state;
  const totalPages = Math.ceil(totalResults / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedResults = state.results.slice(startIndex, endIndex);

  if (state.isSearching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-gray-300">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-tanium-accent"></div>
          <span>Searching questions...</span>
        </div>
      </div>
    );
  }

  if (
    !state.isSearching &&
    state.results.length === 0 &&
    !state.query &&
    Object.values(state.filters).every((v) => !v || (Array.isArray(v) && v.length === 0))
  ) {
    return (
      <div className="py-12 text-center">
        <Card className="glass mx-auto max-w-md border-white/10">
          <div className="p-8">
            <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-white">Ready to Search</h3>
            <p className="text-sm text-gray-300">
              Enter keywords or apply filters to find specific questions from the TCO exam bank.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (!state.isSearching && state.results.length === 0) {
    return (
      <div className="py-12 text-center">
        <Card className="glass mx-auto max-w-md border-white/10">
          <div className="p-8">
            <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-white">No questions found</h3>
            <p className="mb-4 text-sm text-gray-300">
              Try different keywords or adjust your filters to find more results.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={selectAll}
            onCheckedChange={handleSelectAll}
            className="border-white/20 data-[state=checked]:bg-tanium-accent"
          />
          <span className="text-sm text-gray-300">
            Select all ({paginatedResults.length} questions)
          </span>
        </div>

        {/* Results Info */}
        <div className="text-sm text-gray-400">
          Showing {startIndex + 1}-{Math.min(endIndex, totalResults)} of {totalResults}
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {paginatedResults.map((result) => (
          <QuestionResultCard
            key={result.question.id}
            question={result.question}
            relevanceScore={result.relevanceScore}
            matchedFields={result.matchedFields}
            isSelected={state.selectedQuestions.some((q) => q.id === result.question.id)}
            onToggleSelection={() => handleToggleSelection(result.question)}
            searchQuery={state.query}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage <= 1}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
          >
            Previous
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              const isActive = page === currentPage;

              return (
                <Button
                  key={page}
                  onClick={() => setPage(page)}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    isActive
                      ? "bg-tanium-accent hover:bg-blue-600"
                      : "border-white/20 text-white hover:bg-white/10"
                  )}
                >
                  {page}
                </Button>
              );
            })}

            {totalPages > 5 && (
              <>
                <span className="px-2 text-gray-400">...</span>
                <Button
                  onClick={() => setPage(totalPages)}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
