'use client';

/**
 * Pass Probability Dashboard
 *
 * Visual dashboard showing ML-predicted exam pass probability with actionable insights.
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
  BarChart3,
  Lightbulb,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import {
  predictPassProbability,
  getLatestPrediction,
  type PassProbability,
} from '@/lib/ai/passProbabilityPredictor';

interface PassProbabilityDashboardProps {
  userId: string;
  autoRefresh?: boolean;
}

export function PassProbabilityDashboard({
  userId,
  autoRefresh = false,
}: PassProbabilityDashboardProps) {
  const [prediction, setPrediction] = useState<PassProbability | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadPrediction();
  }, [userId]);

  const loadPrediction = async () => {
    setIsLoading(true);
    try {
      const latest = await getLatestPrediction(userId);
      setPrediction(latest);
    } catch (error) {
      console.error('Error loading prediction:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pass probability',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const newPrediction = await predictPassProbability(userId);
      setPrediction(newPrediction);
      toast({
        title: 'Success',
        description: 'Pass probability updated',
      });
    } catch (error) {
      console.error('Error generating prediction:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate prediction',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Exam Readiness Assessment</CardTitle>
          <CardDescription>Loading prediction...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!prediction) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Exam Readiness Assessment</CardTitle>
          <CardDescription>Generate your personalized pass probability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              Get an AI-powered prediction of your exam success based on your current performance
            </p>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? 'Analyzing...' : 'Generate Prediction'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const probabilityColor = getProbabilityColor(prediction.predictedProbability);
  const probabilityLabel = getProbabilityLabel(prediction.predictedProbability);

  return (
    <div className="space-y-6">
      {/* Main Probability Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Exam Readiness Assessment</CardTitle>
              <CardDescription>
                ML-powered prediction based on your current performance
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? 'Updating...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Probability Gauge */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <svg width="240" height="120" className="mx-auto">
                {/* Background arc */}
                <path
                  d="M 20 100 A 100 100 0 0 1 220 100"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="20"
                />
                {/* Probability arc */}
                <path
                  d={describeArc(
                    120,
                    100,
                    100,
                    180,
                    180 + (prediction.predictedProbability / 100) * 180
                  )}
                  fill="none"
                  stroke={probabilityColor}
                  strokeWidth="20"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center mt-4">
                <span className="text-5xl font-bold" style={{ color: probabilityColor }}>
                  {prediction.predictedProbability.toFixed(1)}%
                </span>
                <span className="text-sm text-muted-foreground mt-1">
                  ± {prediction.confidenceInterval.toFixed(1)}%
                </span>
              </div>
            </div>

            <Badge
              variant={probabilityLabel.variant as any}
              className="mt-4 text-base px-4 py-1"
            >
              {probabilityLabel.text}
            </Badge>

            {prediction.daysUntilExam && (
              <p className="text-sm text-muted-foreground mt-2">
                <Clock className="w-4 h-4 inline mr-1" />
                {prediction.daysUntilExam} days until exam
              </p>
            )}
          </div>

          {/* Study Hours Needed */}
          {prediction.estimatedStudyHoursNeeded > 0 && (
            <div className="bg-muted p-4 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="font-semibold">Recommended Study Time</span>
              </div>
              <p className="text-2xl font-bold">
                {prediction.estimatedStudyHoursNeeded} hours
              </p>
              <p className="text-sm text-muted-foreground">
                Additional study time to reach 80% pass probability
              </p>
            </div>
          )}

          {/* Domain Breakdown */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Domain-Level Predictions
            </h4>
            {Object.entries(prediction.domainScores).map(([domain, score]) => (
              <div key={domain} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize">{domain.replace(/_/g, ' ')}</span>
                  <span className="font-semibold">{score.toFixed(1)}%</span>
                </div>
                <Progress
                  value={score}
                  className="h-2"
                  // @ts-ignore
                  indicatorClassName={score >= 75 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Strengths */}
        {prediction.strengths.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                Your Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {prediction.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <span className="font-semibold">{strength.domain}</span>
                      <span className="text-muted-foreground ml-2">
                        ({strength.score.toFixed(1)}%)
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Weaknesses */}
        {prediction.weaknesses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <AlertCircle className="w-5 h-5" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {prediction.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <span className="font-semibold">{weakness.domain}</span>
                      <span className="text-muted-foreground ml-2">
                        ({weakness.score.toFixed(1)}%, +{weakness.gap.toFixed(1)}% needed)
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Risk Factors */}
      {prediction.riskFactors.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <AlertCircle className="w-5 h-5" />
              Risk Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {prediction.riskFactors.map((risk, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-orange-600 dark:text-orange-400">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommended Actions */}
      {prediction.recommendedActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              Recommended Actions
            </CardTitle>
            <CardDescription>
              Prioritized actions to improve your pass probability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {prediction.recommendedActions.map((action, idx) => (
                <li
                  key={idx}
                  className={`p-3 rounded-lg border-2 ${
                    action.priority === 'high'
                      ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                      : action.priority === 'medium'
                      ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800'
                      : 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Badge
                      variant={
                        action.priority === 'high'
                          ? 'destructive'
                          : action.priority === 'medium'
                          ? 'default'
                          : 'secondary'
                      }
                      className="mt-0.5"
                    >
                      {action.priority}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-1">{action.action}</p>
                      <p className="text-xs text-muted-foreground">
                        Impact: {action.estimatedImpact}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <div className="text-xs text-muted-foreground text-center">
        Last updated: {new Date(prediction.createdAt).toLocaleString()} •
        Model: {prediction.modelVersion} ({prediction.predictionMethod})
      </div>
    </div>
  );
}

// ==================== HELPER FUNCTIONS ====================

function getProbabilityColor(probability: number): string {
  if (probability >= 80) return '#10b981'; // green
  if (probability >= 70) return '#f59e0b'; // yellow
  if (probability >= 60) return '#f97316'; // orange
  return '#ef4444'; // red
}

function getProbabilityLabel(probability: number): {
  text: string;
  variant: string;
} {
  if (probability >= 85)
    return { text: 'Excellent - Exam Ready!', variant: 'default' };
  if (probability >= 75)
    return { text: 'Good - Nearly Ready', variant: 'default' };
  if (probability >= 65)
    return { text: 'Fair - More Prep Needed', variant: 'secondary' };
  if (probability >= 55)
    return { text: 'At Risk - Significant Prep Required', variant: 'destructive' };
  return { text: 'High Risk - Consider Delaying Exam', variant: 'destructive' };
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(' ');
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

export default PassProbabilityDashboard;
