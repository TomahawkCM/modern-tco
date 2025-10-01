"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePersistentState } from "@/lib/usePersistentState";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
// Lazy-load QuestionCard to reduce initial JS on Review
const QuestionCard = dynamic(
  () => import("@/components/exam/question-card").then((m) => m.QuestionCard),
  { ssr: false, loading: () => null }
);
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BookOpen,
  Filter,
  RotateCcw,
  Eye,
  Target,
  TrendingUp,
} from "lucide-react";
import { useIncorrectAnswers } from "@/contexts/IncorrectAnswersContext";
import { type Question, TCODomain, Difficulty, QuestionCategory } from "@/types/exam";
import { cn } from "@/lib/utils";
import { ReviewAnalyticsTable } from "@/components/review/ReviewAnalyticsTable";

export default function ReviewPage() {
  const { user } = useAuth();
  const scope = user?.id ? `:u:${user.id}` : "";
  const router = useRouter();
  const { getRecentIncorrectAnswers, getTotalIncorrectCount, markAsReviewed, getDomainStats } =
    useIncorrectAnswers();

  // Get real incorrect answers from context and convert to Question format
  // Memoize to prevent infinite re-renders from context function calls
  const incorrectAnswersRaw = useMemo(() => getRecentIncorrectAnswers(100), [getRecentIncorrectAnswers]);

  // Convert IncorrectAnswer to Question format for compatibility with QuestionCard
  // Use useMemo to prevent infinite re-renders
  const incorrectAnswers = useMemo(
    () =>
      incorrectAnswersRaw.map((answer) => ({
        id: answer.questionId,
        question: answer.questionText,
        choices: [
          { id: "user", text: answer.userAnswer },
          { id: "correct", text: answer.correctAnswer },
        ],
        correctAnswerId: "correct",
        domain: answer.domain,
        difficulty: Difficulty.INTERMEDIATE,
        category: QuestionCategory.PRACTICAL_SCENARIOS,
        explanation:
          answer.explanation ?? "Review the correct answer and study the related concepts.",
        userAnswer: "user", // Reference to the choice that was selected
        timestamp: answer.timestamp,
        reviewed: answer.reviewed,
      })),
    [incorrectAnswersRaw]
  );

  // Removed filteredQuestions state - using computed value directly to prevent infinite loops
  const [currentQuestionIndex, setCurrentQuestionIndex] = usePersistentState<number>(`tco:review:currentIndex${scope}`, 0);
  const [selectedFilters, setSelectedFilters] = usePersistentState<{ domain: string; difficulty: string; recent: string }>(
    `tco:review:filters${scope}`,
    { domain: "all", difficulty: "all", recent: "all" }
  );
  const [activeTab, setActiveTab] = usePersistentState<string>(`tco:review:activeTab${scope}`, "questions");

  // Apply filters - use useMemo instead of useEffect to prevent infinite re-renders
  const filteredQuestionsComputed = useMemo(() => {
    let filtered = [...incorrectAnswers];

    if (selectedFilters.domain !== "all") {
      filtered = filtered.filter((q) => q.domain === selectedFilters.domain);
    }

    if (selectedFilters.difficulty !== "all") {
      filtered = filtered.filter((q) => q.difficulty === selectedFilters.difficulty);
    }

    if (selectedFilters.recent !== "all") {
      const daysAgo = parseInt(selectedFilters.recent);
      const cutoffDate = new Date(Date.now() - daysAgo * 24 * 60 * 1000);
      filtered = filtered.filter((q) => q.timestamp > cutoffDate);
    }

    return filtered;
  }, [selectedFilters, incorrectAnswers]);

  // Define currentQuestion after filteredQuestionsComputed to avoid reference errors
  const currentQuestion = filteredQuestionsComputed[currentQuestionIndex];

  // Reset current question index when filters change to stay within bounds
  useEffect(() => {
    setCurrentQuestionIndex(0);
  }, [selectedFilters]);

  const handlePrevious = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentQuestionIndex((prev) => Math.min(filteredQuestionsComputed.length - 1, prev + 1));
  };

  // Memoize stats calculations to prevent recalculation on every render
  const localDomainStats = useMemo(() => {
    if (incorrectAnswersRaw.length === 0) return [];

    const stats = incorrectAnswersRaw.reduce(
      (acc, question) => {
        acc[question.domain] = (acc[question.domain] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(stats).map(([domain, count]) => ({
      domain,
      count,
      percentage: Math.round((count / incorrectAnswersRaw.length) * 100),
    }));
  }, [incorrectAnswersRaw]);

  const difficultyStats = useMemo(() => {
    if (incorrectAnswersRaw.length === 0) return [];

    const stats = incorrectAnswersRaw.reduce(
      (acc, question) => {
        // Map IncorrectAnswer to Question type for difficulty access
        const difficulty = "Intermediate"; // Default since IncorrectAnswer doesn't have difficulty
        acc[difficulty] = (acc[difficulty] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(stats).map(([difficulty, count]) => ({
      difficulty,
      count,
      percentage: Math.round((count / incorrectAnswersRaw.length) * 100),
    }));
  }, [incorrectAnswersRaw]);

  // Mark current question as reviewed when viewing
  const handleQuestionViewed = (questionId: string) => {
    const answer = incorrectAnswersRaw.find((a) => a.questionId === questionId);
    if (answer && !answer.reviewed) {
      markAsReviewed(answer.id);
    }
  };

  if (incorrectAnswersRaw.length === 0) {
  return (
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-white">Review</h1>
            <p className="mb-8 text-xl text-gray-200">
              Review your incorrect answers and learn from mistakes
            </p>
          </div>

          <Card className="glass border-white/10">
            <CardContent className="py-12 text-center">
              <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-400" />
              <h2 className="mb-2 text-2xl font-bold text-white">Great job!</h2>
              <p className="mb-6 text-gray-300">
                You don&rsquo;t have any incorrect answers to review yet. Take some practice tests
                to see questions here.
              </p>
              <div className="space-x-4">
                <Button
                  onClick={() => router.push("/practice")}
                  className="bg-tanium-accent hover:bg-blue-600"
                >
                  <Target className="mr-2 h-4 w-4" />
                  Start Practice
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/mock")}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Take Mock Exam
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      
  );
  }

  return (
    
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">Review Center</h1>
          <p className="mb-6 text-xl text-gray-200">
            Learn from your mistakes and improve your performance
          </p>
        </div>

        <div className="space-y-6">
          {/* Custom Tabs Header */}
          <div className="glass grid w-full grid-cols-2 rounded-lg border border-white/10 p-1">
            <button
              onClick={() => setActiveTab("questions")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
                "text-white hover:bg-white/10",
                activeTab === "questions" ? "bg-tanium-accent" : "bg-transparent"
              )}
            >
              <Eye className="h-4 w-4" />
              Review Questions
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
                "text-white hover:bg-white/10",
                activeTab === "analytics" ? "bg-tanium-accent" : "bg-transparent"
              )}
            >
              <TrendingUp className="h-4 w-4" />
              Performance Analytics
            </button>
          </div>

          {/* Questions Tab Content */}
          {activeTab === "questions" && (
            <div className="space-y-6">
              {/* Filters */}
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Filter className="h-5 w-5" />
                    Filter Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm text-gray-300">Domain</label>
                      <select
                        value={selectedFilters.domain}
                        onChange={(e) =>
                          setSelectedFilters((prev) => ({ ...prev, domain: e.target.value }))
                        }
                        className="h-10 w-full rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Domains</option>
                        <option value={TCODomain.ASKING_QUESTIONS}>Asking Questions</option>
                        <option value={TCODomain.REFINING_TARGETING}>Refining Questions</option>
                        <option value={TCODomain.TAKING_ACTION}>Taking Action</option>
                        <option value={TCODomain.NAVIGATION_MODULES}>
                          Navigation and Basic Module Functions
                        </option>
                        <option value={TCODomain.REPORTING_EXPORT}>
                          Report Generation and Data Export
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-gray-300">Difficulty</label>
                      <select
                        value={selectedFilters.difficulty}
                        onChange={(e) =>
                          setSelectedFilters((prev) => ({ ...prev, difficulty: e.target.value }))
                        }
                        className="h-10 w-full rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Levels</option>
                        <option value={Difficulty.BEGINNER}>Beginner</option>
                        <option value={Difficulty.INTERMEDIATE}>Intermediate</option>
                        <option value={Difficulty.ADVANCED}>Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-gray-300">Time Period</label>
                      <select
                        value={selectedFilters.recent}
                        onChange={(e) =>
                          setSelectedFilters((prev) => ({ ...prev, recent: e.target.value }))
                        }
                        className="h-10 w-full rounded-md border border-white/20 bg-black/40 px-3 py-2 text-sm text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Time</option>
                        <option value="1">Last 24 hours</option>
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-300">
                      Showing {filteredQuestionsComputed.length} of {incorrectAnswersRaw.length} incorrect
                      answers
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSelectedFilters({ domain: "all", difficulty: "all", recent: "all" })
                      }
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {filteredQuestionsComputed.length > 0 ? (
                <>
                  {/* Current question display */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Question {currentQuestionIndex + 1} of {filteredQuestionsComputed.length}
                      </h2>
                      <p className="text-gray-300">Review and understand the correct answer</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="destructive"
                        className="border-red-400 bg-red-900/20 text-red-400"
                      >
                        <XCircle className="mr-1 h-3 w-3" />
                        Incorrect
                      </Badge>
                      <Badge variant="outline" className="border-white/20 text-white">
                        {currentQuestion?.domain}
                      </Badge>
                    </div>
                  </div>

                  {/* Question card with explanation */}
                  {currentQuestion && (
                    <div className="space-y-4">
                      <QuestionCard
                        question={currentQuestion}
                        questionNumber={currentQuestionIndex + 1}
                        totalQuestions={filteredQuestionsComputed.length}
                        selectedAnswer={currentQuestion.userAnswer}
                        showCorrectAnswer={true}
                        showExplanation={true}
                        mode="review"
                        disabled={true}
                        onAnswerSelect={() => {}} // No-op handler for review mode
                      />

                      {/* Additional info */}
                      <Alert className="border-blue-200 bg-blue-50/10 dark:border-blue-800 dark:bg-blue-900/20">
                        <AlertTriangle className="h-4 w-4 text-blue-400" />
                        <AlertDescription className="text-blue-200">
                          <strong>Study Tip:</strong> Re-read the question carefully and note the
                          key concepts mentioned in the explanation above.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0}
                      className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>

                    <Button
                      onClick={() => router.push("/practice")}
                      className="bg-tanium-accent hover:bg-blue-600"
                    >
                      <Target className="mr-2 h-4 w-4" />
                      Practice More
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleNext}
                      disabled={currentQuestionIndex === filteredQuestionsComputed.length - 1}
                      className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
                    >
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <Card className="glass border-white/10">
                  <CardContent className="py-12 text-center">
                    <Filter className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-xl font-bold text-white">
                      No questions match your filters
                    </h3>
                    <p className="mb-4 text-gray-300">
                      Try adjusting your filter criteria to see more questions.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setSelectedFilters({ domain: "all", difficulty: "all", recent: "all" })
                      }
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Analytics Tab Content */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* New Analytics Table */}
              <ReviewAnalyticsTable
                incorrectAnswers={incorrectAnswersRaw.map((answer) => ({
                  questionId: answer.questionId,
                  domain: answer.domain,
                  difficulty: Difficulty.INTERMEDIATE, // Default since IncorrectAnswer doesn't have difficulty
                  reviewed: answer.reviewed,
                  timestamp: answer.timestamp,
                }))}
                onDomainFilter={(domain) => {
                  if (domain !== "all") {
                    setSelectedFilters((prev) => ({ ...prev, domain }));
                    setActiveTab("questions");
                  }
                }}
              />

              <div className="grid gap-6 md:grid-cols-2">
                {/* Domain breakdown */}
                <Card className="glass border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Incorrect by Domain</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {localDomainStats.map(({ domain, count, percentage }) => (
                      <div key={domain} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-200">{domain}</span>
                          <span className="text-white">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-700">
                          <div
                            className="h-2 rounded-full bg-red-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Difficulty breakdown */}
                <Card className="glass border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Incorrect by Difficulty</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {difficultyStats.map(({ difficulty, count, percentage }) => (
                      <div key={difficulty} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-200">{difficulty}</span>
                          <span className="text-white">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-700">
                          <div
                            className="h-2 rounded-full bg-yellow-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Study Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {localDomainStats
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 3)
                      .map(({ domain, count }) => (
                        <Alert
                          key={domain}
                          className="border-yellow-200 bg-yellow-50/10 dark:bg-yellow-900/20"
                        >
                          <BookOpen className="h-4 w-4 text-yellow-400" />
                          <AlertDescription className="text-yellow-200">
                            <strong>Focus on {domain}</strong>
                            <br />
                            You missed {count} questions in this domain. Consider additional study.
                          </AlertDescription>
                        </Alert>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    
  );
}
