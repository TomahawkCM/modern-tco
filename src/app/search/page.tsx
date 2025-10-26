"use client";

import { useState } from "react";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchResults } from "@/components/search/SearchResults";
import { SearchHeader } from "@/components/search/SearchHeader";
import { SelectedQuestionsPanel } from "@/components/search/SelectedQuestionsPanel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Filter, Search, BookOpen, Play, FileText } from "lucide-react";
import { useSearch } from "@/contexts/SearchContext";
import { useRouter } from "next/navigation";
import { useExam } from "@/contexts/ExamContext";
import { ExamMode } from "@/types/exam";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";

export default function SearchPage() {
  const router = useRouter();
  const { state, clearSelection, resetSearch } = useSearch();
  const { startExam } = useExam();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const handleStartPractice = () => {
    if (state.selectedQuestions.length === 0) return;

    // Start practice with selected questions
    void startExam(ExamMode.PRACTICE, state.selectedQuestions);
    void analytics.capture("search_practice_start", { count: state.selectedQuestions.length });
    clearSelection();
    router.push("/practice");
  };

  const handleCreateMockExam = () => {
    if (state.selectedQuestions.length === 0) return;

    // Start mock exam with selected questions
    void startExam(ExamMode.MOCK, state.selectedQuestions);
    void analytics.capture("search_mock_start", { count: state.selectedQuestions.length });
    clearSelection();
    router.push("/mock");
  };

  const activeFilterCount =
    [...state.filters.domains, ...state.filters.difficulties, ...state.filters.categories].length +
    (state.filters.hasExplanation !== undefined ? 1 : 0) +
    (state.filters.hasConsoleSteps !== undefined ? 1 : 0);

  return (
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Search Questions</h1>
            <p className="mt-1 text-muted-foreground">
              Find specific topics and create custom practice sessions
            </p>
          </div>

          {/* Mobile filter toggle */}
          <div className="md:hidden">
            <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="border-white/20 text-foreground">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 border-white/10 bg-card">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-foreground">
                    <Filter className="h-5 w-5" />
                    Search Filters
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <SearchFilters />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Search Header */}
        <SearchHeader />

        <div className="grid gap-6 md:grid-cols-[280px,1fr] lg:grid-cols-[320px,1fr,280px]">
          {/* Desktop Filters Sidebar */}
          <div className="hidden md:block">
            <Card className="glass sticky top-6 border-white/10">
              <div className="p-6">
                <div className="mb-6 flex items-center gap-2">
                  <Filter className="h-5 w-5 text-tanium-accent" />
                  <h3 className="font-semibold text-foreground">Filters</h3>
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </div>
                <SearchFilters />
              </div>
            </Card>
          </div>

          {/* Main Search Results */}
          <div className="min-h-[400px]">
            <SearchResults />
          </div>

          {/* Selected Questions Panel (Desktop) */}
          <div className="hidden lg:block">
            <Card className="glass sticky top-6 border-white/10">
              <div className="p-6">
                <div className="mb-6 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-tanium-accent" />
                  <h3 className="font-semibold text-foreground">Selected</h3>
                  {state.selectedQuestions.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {state.selectedQuestions.length}
                    </Badge>
                  )}
                </div>
                <SelectedQuestionsPanel />
              </div>
            </Card>
          </div>
        </div>

        {/* Mobile Selected Questions Panel */}
        {state.selectedQuestions.length > 0 && (
          <div className="lg:hidden">
            <Card className="glass border-white/10">
              <div className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-tanium-accent" />
                  <h3 className="font-semibold text-foreground">Selected Questions</h3>
                  <Badge variant="secondary" className="text-xs">
                    {state.selectedQuestions.length}
                  </Badge>
                </div>
                <SelectedQuestionsPanel />
              </div>
            </Card>
          </div>
        )}

        {/* Floating Action Bar */}
        {state.selectedQuestions.length > 0 && (
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform">
            <Card className="glass border-white/10 bg-card/95 backdrop-blur-md">
              <div className="p-4">
                <div className="flex items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{state.selectedQuestions.length}</span>{" "}
                    question{state.selectedQuestions.length !== 1 ? "s" : ""} selected
                  </div>
                  <Separator orientation="vertical" className="h-6 bg-white/20" />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleStartPractice}
                      size="sm"
                      className="bg-tanium-accent hover:bg-blue-600"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Practice
                    </Button>
                    <Button
                      onClick={handleCreateMockExam}
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-foreground hover:bg-white/10"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Mock Exam
                    </Button>
                    <Button
                      onClick={clearSelection}
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:bg-white/10 hover:text-foreground"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!state.isSearching && state.results.length === 0 && state.query && (
          <div className="py-12 text-center">
            <Card className="glass mx-auto max-w-md border-white/10">
              <div className="p-8">
                <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-medium text-foreground">No questions found</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Try adjusting your search query or filters to find more results.
                </p>
                <Button
                  onClick={() => {
                    // Clear search and show all questions
                    resetSearch();
                  }}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-foreground hover:bg-white/10"
                >
                  Show All Questions
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
  );
}
