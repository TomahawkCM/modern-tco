"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Brain,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
  PlayCircle,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getItemsDueToday,
  getOverdueItems,
  getItemsDueInDays,
  getReviewStats,
  importWeakConcepts,
  type ReviewItem,
} from "@/lib/spacedRepetition";
import PerformanceAnalytics from "./PerformanceAnalytics";

interface DailyReviewProps {
  /** Optional: Filter by specific module */
  moduleId?: string;
  /** Callback when review session starts */
  onStartReview?: (items: ReviewItem[]) => void;
}

export function DailyReview({ moduleId, onStartReview }: DailyReviewProps) {
  const [activeTab, setActiveTab] = useState<"review" | "analytics">("review");
  const [dueToday, setDueToday] = useState<ReviewItem[]>([]);
  const [overdue, setOverdue] = useState<ReviewItem[]>([]);
  const [upcoming, setUpcoming] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    dueToday: 0,
    overdue: 0,
    averageRetention: 100,
    itemsByInterval: {} as Record<number, number>,
  });

  // Load review data
  useEffect(() => {
    loadReviewData();
  }, [moduleId]);

  const loadReviewData = () => {
    const dueTodayItems = getItemsDueToday(moduleId);
    const overdueItems = getOverdueItems(moduleId);
    const upcomingItems = getItemsDueInDays(7, moduleId);
    const reviewStats = getReviewStats(moduleId);

    setDueToday(dueTodayItems);
    setOverdue(overdueItems);
    setUpcoming(upcomingItems);
    setStats(reviewStats);
  };

  const handleImportWeakConcepts = () => {
    if (!moduleId) {
      alert("Please select a specific module to import weak concepts");
      return;
    }

    importWeakConcepts(moduleId);
    loadReviewData();
  };

  const handleStartReview = () => {
    const itemsToReview = [...overdue, ...dueToday];
    if (itemsToReview.length === 0) {
      alert("No items due for review!");
      return;
    }

    if (onStartReview) {
      onStartReview(itemsToReview);
    }
  };

  const totalDue = overdue.length + dueToday.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-purple-500/20 bg-purple-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-300">
            <Brain className="h-6 w-6" />
            Daily Review - Spaced Repetition
          </CardTitle>
          <p className="text-sm text-gray-400">
            Research-backed 2357 method with adaptive difficulty (42% improvement)
          </p>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          onClick={() => setActiveTab("review")}
          variant={activeTab === "review" ? "default" : "outline"}
          className={cn(
            "flex-1",
            activeTab === "review"
              ? "bg-purple-600 hover:bg-purple-700"
              : "border-gray-700 text-gray-300 hover:bg-gray-800"
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Daily Review
        </Button>
        <Button
          onClick={() => setActiveTab("analytics")}
          variant={activeTab === "analytics" ? "default" : "outline"}
          className={cn(
            "flex-1",
            activeTab === "analytics"
              ? "bg-blue-600 hover:bg-blue-700"
              : "border-gray-700 text-gray-300 hover:bg-gray-800"
          )}
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Performance Analytics
        </Button>
      </div>

      {/* Review Tab Content */}
      {activeTab === "review" && (
        <>
          {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Due Today */}
        <Card className={cn(
          "border-2",
          totalDue > 0
            ? "border-orange-500/30 bg-orange-500/5"
            : "border-green-500/30 bg-green-500/5"
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Due Today</p>
                <p className="text-3xl font-bold text-white">{totalDue}</p>
              </div>
              <Calendar className={cn(
                "h-8 w-8",
                totalDue > 0 ? "text-orange-500" : "text-green-500"
              )} />
            </div>
            {overdue.length > 0 && (
              <Badge variant="outline" className="mt-2 border-red-500/30 text-red-400">
                {overdue.length} overdue
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Total Items */}
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Items</p>
                <p className="text-3xl font-bold text-white">{stats.totalItems}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Being tracked for review
            </p>
          </CardContent>
        </Card>

        {/* Average Retention */}
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Avg Retention</p>
                <p className="text-3xl font-bold text-white">{stats.averageRetention}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <Progress
              value={stats.averageRetention}
              className="mt-2 h-2 bg-green-900/30"
            />
          </CardContent>
        </Card>

        {/* Upcoming (Next 7 Days) */}
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Next 7 Days</p>
                <p className="text-3xl font-bold text-white">{upcoming.length}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Items coming up for review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleStartReview}
          disabled={totalDue === 0}
          className={cn(
            "flex-1",
            totalDue > 0
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-gray-600 cursor-not-allowed"
          )}
        >
          <PlayCircle className="mr-2 h-4 w-4" />
          Start Review Session ({totalDue} items)
        </Button>

        {moduleId && (
          <Button
            onClick={handleImportWeakConcepts}
            variant="outline"
            className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Import Weak Concepts
          </Button>
        )}
      </div>

      {/* Items Due Today */}
      {totalDue > 0 && (
        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardHeader>
            <CardTitle className="text-sm text-orange-300">
              Items Due for Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Overdue Items */}
              {overdue.length > 0 && (
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    Overdue ({overdue.length})
                  </h4>
                  <div className="space-y-2">
                    {overdue.slice(0, 5).map((item) => (
                      <ReviewItemCard key={item.id} item={item} isOverdue={true} />
                    ))}
                    {overdue.length > 5 && (
                      <p className="text-xs text-gray-500">
                        +{overdue.length - 5} more overdue items
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Due Today */}
              {dueToday.length > 0 && (
                <div>
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-orange-400">
                    <Calendar className="h-4 w-4" />
                    Due Today ({dueToday.length})
                  </h4>
                  <div className="space-y-2">
                    {dueToday.slice(0, 5).map((item) => (
                      <ReviewItemCard key={item.id} item={item} />
                    ))}
                    {dueToday.length > 5 && (
                      <p className="text-xs text-gray-500">
                        +{dueToday.length - 5} more items due today
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Items Due */}
      {totalDue === 0 && stats.totalItems > 0 && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="py-8 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-500" />
            <h3 className="mb-2 text-lg font-semibold text-green-300">
              All Caught Up! 🎉
            </h3>
            <p className="text-sm text-gray-400">
              No reviews due today. Next review: {upcoming.length > 0 ? "in the next 7 days" : "TBD"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {stats.totalItems === 0 && (
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="py-8 text-center">
            <Brain className="mx-auto mb-3 h-12 w-12 text-blue-500" />
            <h3 className="mb-2 text-lg font-semibold text-blue-300">
              Start Building Your Review Queue
            </h3>
            <p className="mb-4 text-sm text-gray-400">
              Complete micro-sections and quizzes to add items to your spaced repetition schedule.
            </p>
            {moduleId && (
              <Button
                onClick={handleImportWeakConcepts}
                variant="outline"
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Import Weak Concepts from Quizzes
              </Button>
            )}
          </CardContent>
        </Card>
      )}
        </>
      )}

      {/* Analytics Tab Content */}
      {activeTab === "analytics" && (
        <PerformanceAnalytics moduleId={moduleId} />
      )}
    </div>
  );
}

// Individual review item card
function ReviewItemCard({ item, isOverdue }: { item: ReviewItem; isOverdue?: boolean }) {
  const intervalNames = ["Day 1", "Day 3", "Day 7", "Day 16", "Day 35+"];
  const daysOverdue = isOverdue
    ? Math.floor((Date.now() - new Date(item.nextReview).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className={cn(
      "flex items-center justify-between rounded-lg border p-3",
      isOverdue
        ? "border-red-500/30 bg-red-500/5"
        : "border-orange-500/20 bg-orange-500/5"
    )}>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{item.title}</p>
        <div className="mt-1 flex items-center gap-2">
          <Badge variant="outline" className="text-xs border-gray-700 text-gray-400">
            {intervalNames[item.intervalIndex] || "Complete"}
          </Badge>
          <span className="text-xs text-gray-500">
            {item.totalReviews} reviews • {item.retention}% retention
          </span>
        </div>
      </div>
      {isOverdue && (
        <Badge className="bg-red-600 text-white">
          {daysOverdue}d overdue
        </Badge>
      )}
    </div>
  );
}

export default DailyReview;
