'use client';

/**
 * Smart Recommendations Panel
 *
 * Displays AI-generated personalized recommendations for next best actions.
 * Shows priority-sorted recommendations with action buttons.
 */

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  Calendar,
  BookOpen,
  Lightbulb,
  Bell,
  X,
  CheckCircle,
  ChevronRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import {
  getActiveRecommendations,
  dismissRecommendation,
  completeRecommendation,
  generateRecommendations,
  gatherRecommendationContext,
  type Recommendation,
} from '@/lib/ai/smartRecommendations';

interface SmartRecommendationsPanelProps {
  userId: string;
  autoRefresh?: boolean; // Refresh recommendations periodically
  refreshIntervalMs?: number; // Default: 5 minutes
  compact?: boolean; // Show condensed view
  maxRecommendations?: number; // Limit displayed recommendations
}

export function SmartRecommendationsPanel({
  userId,
  autoRefresh = false,
  refreshIntervalMs = 5 * 60 * 1000, // 5 minutes
  compact = false,
  maxRecommendations = 5,
}: SmartRecommendationsPanelProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load recommendations
  useEffect(() => {
    loadRecommendations();
  }, [userId]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadRecommendations();
    }, refreshIntervalMs);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshIntervalMs]);

  const loadRecommendations = async () => {
    try {
      const recs = await getActiveRecommendations(userId);
      setRecommendations(recs.slice(0, maxRecommendations));
    } catch (error) {
      console.error('Error loading recommendations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load recommendations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateNew = async () => {
    setIsGenerating(true);
    try {
      const context = await gatherRecommendationContext(userId);
      const newRecs = await generateRecommendations(context);

      toast({
        title: 'Success',
        description: `Generated ${newRecs.length} new recommendations`,
      });

      await loadRecommendations();
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate recommendations',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDismiss = async (recId: string) => {
    try {
      await dismissRecommendation(recId, userId);
      setRecommendations(recommendations.filter((r) => r.id !== recId));
      toast({
        title: 'Dismissed',
        description: 'Recommendation dismissed',
      });
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
      toast({
        title: 'Error',
        description: 'Failed to dismiss recommendation',
        variant: 'destructive',
      });
    }
  };

  const handleComplete = async (recId: string) => {
    try {
      await completeRecommendation(recId, userId);
      setRecommendations(recommendations.filter((r) => r.id !== recId));
      toast({
        title: 'Completed!',
        description: 'Great job following through on the recommendation',
      });
    } catch (error) {
      console.error('Error completing recommendation:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark recommendation as complete',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Smart Recommendations</CardTitle>
          <CardDescription>Loading personalized recommendations...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Smart Recommendations</CardTitle>
          <CardDescription>No active recommendations at the moment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              We analyze your progress to provide personalized study recommendations
            </p>
            <Button onClick={handleGenerateNew} disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Generate Recommendations'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Smart Recommendations</CardTitle>
            <CardDescription>
              AI-powered suggestions based on your progress
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateNew}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec) => (
          <RecommendationCard
            key={rec.id}
            recommendation={rec}
            onDismiss={handleDismiss}
            onComplete={handleComplete}
            compact={compact}
          />
        ))}
      </CardContent>
    </Card>
  );
}

// ==================== INDIVIDUAL RECOMMENDATION CARD ====================

interface RecommendationCardProps {
  recommendation: Recommendation;
  onDismiss: (id: string) => void;
  onComplete: (id: string) => void;
  compact?: boolean;
}

function RecommendationCard({
  recommendation,
  onDismiss,
  onComplete,
  compact = false,
}: RecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);

  const getIcon = () => {
    switch (recommendation.recommendationType) {
      case 'intervention':
        return <AlertTriangle className="w-5 h-5" />;
      case 'next_action':
        return <TrendingUp className="w-5 h-5" />;
      case 'study_schedule':
        return <Calendar className="w-5 h-5" />;
      case 'weak_domain':
        return <BookOpen className="w-5 h-5" />;
      case 'resource':
        return <BookOpen className="w-5 h-5" />;
      case 'strategy':
        return <Lightbulb className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getPriorityColor = () => {
    switch (recommendation.priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getPriorityBgColor = () => {
    switch (recommendation.priority) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
      case 'high':
        return 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800';
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800';
      case 'low':
        return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${getPriorityBgColor()}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-0.5">{getIcon()}</div>

          <div className="flex-1 space-y-2">
            {/* Header */}
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">{recommendation.title}</h4>
              <Badge variant={getPriorityColor() as any} className="text-xs">
                {recommendation.priority}
              </Badge>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground">{recommendation.description}</p>

            {/* Expanded details */}
            {isExpanded && (
              <>
                {/* Suggested Actions */}
                {recommendation.suggestedActions &&
                  Array.isArray(recommendation.suggestedActions) &&
                  recommendation.suggestedActions.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold mb-2">Suggested Actions:</p>
                      <ul className="space-y-1">
                        {recommendation.suggestedActions.map((action: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-xs">
                            <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Estimated Impact */}
                {recommendation.estimatedImpact && (
                  <div className="mt-2 p-2 bg-background/50 rounded text-xs">
                    <span className="font-semibold">Expected Impact:</span>{' '}
                    {recommendation.estimatedImpact}
                  </div>
                )}

                {/* Reasoning */}
                {recommendation.reasoning && (
                  <div className="mt-2 text-xs text-muted-foreground italic">
                    {recommendation.reasoning}
                  </div>
                )}
              </>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-3">
              {compact && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs"
                >
                  {isExpanded ? 'Show Less' : 'Show More'}
                </Button>
              )}
              <Button
                variant="default"
                size="sm"
                onClick={() => onComplete(recommendation.id)}
                className="text-xs"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Mark Complete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(recommendation.id)}
                className="text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SmartRecommendationsPanel;
