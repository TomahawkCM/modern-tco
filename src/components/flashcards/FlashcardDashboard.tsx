"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { flashcardService } from "@/services/flashcardService";
import type { FlashcardStats } from "@/types/flashcard";
import FlashcardReview from "./FlashcardReview";
import FlashcardGenerator from "./FlashcardGenerator";
import { Brain, TrendingUp, Clock, Flame, Target, BookOpen } from "lucide-react";

interface FlashcardDashboardProps {
  moduleId?: string;
}

export default function FlashcardDashboard({ moduleId }: FlashcardDashboardProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<FlashcardStats | null>(null);
  const [activeTab, setActiveTab] = useState("review");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user?.id]);

  const loadStats = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const data = await flashcardService.getFlashcardStats(user.id);
      setStats(data);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewComplete = (reviewStats: any) => {
    // Reload stats after review session
    loadStats();
    // Show completion modal or navigate
  };

  const handleCardCreated = () => {
    // Reload stats after card creation
    loadStats();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Brain className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats?.totalCards || 0}</p>
            <p className="text-xs text-muted-foreground">Total Cards</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold">{stats?.dueToday || 0}</p>
            <p className="text-xs text-muted-foreground">Due Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Target className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{stats?.newCards || 0}</p>
            <p className="text-xs text-muted-foreground">New Cards</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{stats?.learningCards || 0}</p>
            <p className="text-xs text-muted-foreground">Learning</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{stats?.avgRetentionRate || 0}%</p>
            <p className="text-xs text-muted-foreground">Retention</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Flame className="h-6 w-6 mx-auto mb-2 text-red-500" />
            <p className="text-2xl font-bold">{stats?.currentStreak || 0}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="review">
            <Brain className="h-4 w-4 mr-2" />
            Review Cards
          </TabsTrigger>
          <TabsTrigger value="create">
            <Target className="h-4 w-4 mr-2" />
            Create Cards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="mt-6">
          <FlashcardReview
            moduleId={moduleId}
            onComplete={handleReviewComplete}
          />
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <FlashcardGenerator
            moduleId={moduleId}
            onCardCreated={handleCardCreated}
          />
        </TabsContent>
      </Tabs>

      {/* Study Tips */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">💡 Study Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>• <strong>Daily consistency</strong> beats marathon sessions - review for 10-15 minutes daily</p>
          <p>• <strong>Don't peek!</strong> Try to recall the answer before revealing it for maximum retention</p>
          <p>• <strong>Be honest</strong> with your ratings - the algorithm adapts to your actual performance</p>
          <p>• <strong>Create cards</strong> from mistakes - add failed quiz questions to reinforce weak areas</p>
        </CardContent>
      </Card>
    </div>
  );
}
