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

const DEV_USER_ID = '5e244287-40af-4cad-aa90-5a7be354940a'; // Development mode user ID (actual dev user in database)
const IS_DEV_MODE = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEV_MODE === 'true';

export default function FlashcardDashboard({ moduleId }: FlashcardDashboardProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<FlashcardStats | null>(null);
  const [activeTab, setActiveTab] = useState("review");
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Always use dev user ID as fallback when no authenticated user (no auth required)
  const effectiveUserId = user?.id || DEV_USER_ID;

  useEffect(() => {
    loadStats();
  }, [effectiveUserId]);

  const loadStats = async () => {
    if (!effectiveUserId) return;

    setIsLoading(true);
    try {
      const data = await flashcardService.getFlashcardStats(effectiveUserId);
      setStats(data);

      // Auto-seed if user has no flashcards
      if (data.totalCards === 0) {
        await autoSeedFlashcards();
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const autoSeedFlashcards = async () => {
    if (!effectiveUserId || isSeeding) return;

    setIsSeeding(true);
    setError(null);

    try {
      console.log('🔄 Attempting to auto-seed flashcards...');
      if (IS_DEV_MODE && !user) {
        console.log('📝 Development mode: Using dev user ID', DEV_USER_ID);
      }

      const response = await fetch('/api/flashcards/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: effectiveUserId }),
      });

      const data = await response.json();

      if (response.ok) {
        const seededCount = typeof data?.count === "number" ? data.count : 0;

        if (seededCount > 0) {
          console.log(`✅ Auto-seeded ${seededCount} flashcards`, data);
          const newStats = await flashcardService.getFlashcardStats(effectiveUserId);
          setStats(newStats);
        } else if (data?.alreadySeeded) {
          console.log("ℹ️ Flashcards already seeded");
        } else {
          console.info("ℹ️ No flashcards were seeded automatically", data);
        }
      } else {
        const errorMsg = data?.details || data?.error || response.statusText || "Unknown error";
        console.error("❌ Failed to auto-seed flashcards:", data);
        setError(
          `Failed to load flashcards: ${errorMsg}${
            data?.suggestion ? ` (${data.suggestion})` : ""
          }`
        );
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Error auto-seeding flashcards:', err);
      setError(`Network error: ${errorMsg}`);
    } finally {
      setIsSeeding(false);
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

  if (isLoading || isSeeding) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        {isSeeding && (
          <p className="text-sm text-muted-foreground">
            Loading your 331 TCO flashcards...
          </p>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">⚠️ Error Loading Flashcards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{error}</p>
          <div className="flex gap-2">
            <Button onClick={() => { setError(null); loadStats(); }}>
              Retry
            </Button>
            <Button variant="outline" onClick={() => window.open('/api/flashcards/debug', '_blank')}>
              View Debug Info
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Development Mode Banner */}
      {IS_DEV_MODE && !user && (
        <Card className="border-yellow-500 bg-yellow-500/10">
          <CardContent className="py-3">
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              ⚠️ <strong>Development Mode</strong> - Using mock user ID ({DEV_USER_ID}). Real authentication not required.
            </p>
          </CardContent>
        </Card>
      )}

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
            totalCards={stats?.totalCards || 0}
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
