"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { flashcardService } from "@/services/flashcardService";
import { Brain, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import FlashcardReview from "@/components/flashcards/FlashcardReview";

interface ModuleFlashcardPromptProps {
  moduleId: string;
  sectionId?: string;
  sectionTitle?: string;
}

export default function ModuleFlashcardPrompt({
  moduleId,
  sectionId,
  sectionTitle
}: ModuleFlashcardPromptProps) {
  const { user } = useAuth();
  const [dueCount, setDueCount] = useState<number>(0);
  const [totalCards, setTotalCards] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadModuleFlashcardStats();
  }, [user?.id, moduleId]);

  const loadModuleFlashcardStats = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Get all flashcards for this module
      const moduleCards = await flashcardService.getFlashcardsByModule(user.id, moduleId);
      const dueCards = moduleCards.filter(c => new Date(c.srs_due) <= new Date());

      setTotalCards(moduleCards.length);
      setDueCount(dueCards.length);
    } catch (error) {
      console.error("Error loading flashcard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoGenerate = async () => {
    if (!user?.id) return;

    setIsGenerating(true);
    try {
      await flashcardService.autoGenerateFromModule(user.id, moduleId);
      await loadModuleFlashcardStats();
    } catch (error) {
      console.error("Error generating flashcards:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReviewComplete = () => {
    setShowReview(false);
    loadModuleFlashcardStats();
  };

  if (showReview) {
    return (
      <div className="my-8">
        <Button
          variant="ghost"
          onClick={() => setShowReview(false)}
          className="mb-4"
        >
          ← Back to Module
        </Button>
        <FlashcardReview
          moduleId={moduleId}
          onComplete={handleReviewComplete}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <Card className="my-8 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          <span>Loading flashcards...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="my-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Brain className="h-5 w-5 text-primary" />
              Active Recall Practice
              {dueCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {dueCount} Due
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-2">
              {sectionTitle
                ? `Review flashcards for "${sectionTitle}"`
                : "Reinforce your learning with active recall"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalCards === 0 ? (
          // No flashcards exist - prompt to generate
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              No flashcards created yet for this module. Auto-generate flashcards from the learning objectives to start practicing.
            </p>
            <Button
              onClick={handleAutoGenerate}
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Flashcards...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Auto-Generate Flashcards
                </>
              )}
            </Button>
          </div>
        ) : dueCount > 0 ? (
          // Cards are due - prompt to review
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-background rounded-lg">
              <div>
                <p className="font-medium">Ready to review</p>
                <p className="text-sm text-muted-foreground">
                  {dueCount} card{dueCount !== 1 ? 's' : ''} due now • {totalCards} total
                </p>
              </div>
              <Button
                onClick={() => setShowReview(true)}
                size="lg"
              >
                Start Review
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              💡 Regular review sessions improve long-term retention by 50%+
            </p>
          </div>
        ) : (
          // All caught up
          <div className="space-y-3">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
              <p className="font-medium text-green-600 dark:text-green-400">
                ✅ All caught up!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {totalCards} card{totalCards !== 1 ? 's' : ''} in this module • Next review coming soon
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowReview(true)}
              className="w-full"
            >
              <Brain className="mr-2 h-4 w-4" />
              Practice Anyway
            </Button>
          </div>
        )}

        {/* Quick tip for first-time users */}
        {totalCards > 0 && totalCards < 5 && (
          <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-md">
            <strong>Pro tip:</strong> Create custom flashcards for concepts you find challenging.
            Manual cards often stick better than auto-generated ones!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
