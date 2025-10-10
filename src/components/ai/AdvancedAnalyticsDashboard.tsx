'use client';

/**
 * Advanced Analytics Dashboard
 *
 * Comprehensive analytics showing:
 * - Comparative analytics (vs cohort)
 * - Performance heatmaps
 * - Time-to-mastery predictions
 *
 * Provides students with deep insights into their learning progress and actionable recommendations.
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock,
  Target,
  Users,
  Award,
  AlertCircle,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';

import {
  getComparativeAnalytics,
  getDomainComparisons,
  type ComparativeReport,
  type DomainComparison,
} from '@/lib/ai/comparativeAnalytics';
import {
  getOrGenerateHeatmap,
  getHeatmapColor,
  type PerformanceHeatmap,
} from '@/lib/ai/performanceHeatmaps';
import {
  predictAllDomains,
  generateMasteryPlan,
  type MasteryPrediction,
  type MasteryPlan,
} from '@/lib/ai/masteryPredictions';

interface AdvancedAnalyticsDashboardProps {
  userId: string;
}

export function AdvancedAnalyticsDashboard({ userId }: AdvancedAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'comparative' | 'heatmaps' | 'mastery'>('comparative');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Comparative Analytics State
  const [comparativeReport, setComparativeReport] = useState<ComparativeReport | null>(null);
  const [domainComparisons, setDomainComparisons] = useState<DomainComparison[]>([]);

  // Heatmaps State
  const [domainWeekHeatmap, setDomainWeekHeatmap] = useState<PerformanceHeatmap | null>(null);
  const [topicDifficultyHeatmap, setTopicDifficultyHeatmap] = useState<PerformanceHeatmap | null>(
    null
  );

  // Mastery Predictions State
  const [masteryPredictions, setMasteryPredictions] = useState<MasteryPrediction[]>([]);
  const [selectedMasteryPlan, setSelectedMasteryPlan] = useState<MasteryPlan | null>(null);

  useEffect(() => {
    loadAllAnalytics();
  }, [userId]);

  const loadAllAnalytics = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadComparativeAnalytics(), loadHeatmaps(), loadMasteryPredictions()]);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadComparativeAnalytics = async () => {
    try {
      const report = await getComparativeAnalytics(userId);
      setComparativeReport(report);

      const comparisons = await getDomainComparisons(userId);
      setDomainComparisons(comparisons);
    } catch (error) {
      console.error('Error loading comparative analytics:', error);
    }
  };

  const loadHeatmaps = async () => {
    try {
      const [domainWeek, topicDifficulty] = await Promise.all([
        getOrGenerateHeatmap(userId, 'domain_by_week'),
        getOrGenerateHeatmap(userId, 'topic_by_difficulty'),
      ]);
      setDomainWeekHeatmap(domainWeek);
      setTopicDifficultyHeatmap(topicDifficulty);
    } catch (error) {
      console.error('Error loading heatmaps:', error);
    }
  };

  const loadMasteryPredictions = async () => {
    try {
      const predictions = await predictAllDomains(userId);
      setMasteryPredictions(predictions);
    } catch (error) {
      console.error('Error loading mastery predictions:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (activeTab === 'comparative') {
        await loadComparativeAnalytics();
      } else if (activeTab === 'heatmaps') {
        await loadHeatmaps();
      } else if (activeTab === 'mastery') {
        await loadMasteryPredictions();
      }
      toast({
        title: 'Refreshed',
        description: 'Analytics data updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh analytics',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewMasteryPlan = async (domain: string) => {
    try {
      const plan = await generateMasteryPlan(userId, domain);
      setSelectedMasteryPlan(plan);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate mastery plan',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Advanced Analytics</CardTitle>
          <CardDescription>Loading comprehensive analytics...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Advanced Analytics</CardTitle>
            <CardDescription>Deep insights into your learning progress</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="comparative">
              <Users className="w-4 h-4 mr-2" />
              Comparative
            </TabsTrigger>
            <TabsTrigger value="heatmaps">
              <BarChart3 className="w-4 h-4 mr-2" />
              Heatmaps
            </TabsTrigger>
            <TabsTrigger value="mastery">
              <Target className="w-4 h-4 mr-2" />
              Mastery
            </TabsTrigger>
          </TabsList>

          {/* Comparative Analytics Tab */}
          <TabsContent value="comparative" className="space-y-6 mt-6">
            {comparativeReport && (
              <>
                {/* Overall Performance vs Cohort */}
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Your Performance vs Cohort Average</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {comparativeReport.motivationalMessage}
                  </p>
                  <div className="text-2xl font-bold">
                    {comparativeReport.assignment.overallPercentile || 50}th Percentile
                  </div>
                </div>

                {/* Metric Comparisons */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Performance Metrics</h4>
                  {comparativeReport.comparisons.map((comp, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{comp.label}</span>
                        <Badge
                          variant={
                            comp.status === 'above_average'
                              ? 'default'
                              : comp.status === 'below_average'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {comp.status === 'above_average' && <TrendingUp className="w-3 h-3 mr-1" />}
                          {comp.status === 'below_average' && <TrendingDown className="w-3 h-3 mr-1" />}
                          {comp.percentile ? `${comp.percentile}th` : comp.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                          <p className="text-sm text-muted-foreground">You</p>
                          <p className="text-xl font-bold">{comp.personalValue.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Cohort Avg</p>
                          <p className="text-xl">{comp.cohortAverage.toFixed(1)}%</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{comp.interpretation}</p>
                    </div>
                  ))}
                </div>

                {/* Domain-Level Comparisons */}
                {domainComparisons.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Domain-Level Comparisons</h4>
                    {domainComparisons.map((domain, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{domain.domainLabel}</span>
                          <span
                            className={`font-semibold ${
                              domain.difference > 0 ? 'text-green-600' : domain.difference < 0 ? 'text-red-600' : ''
                            }`}
                          >
                            {domain.personalScore.toFixed(1)}% (
                            {domain.difference > 0 ? '+' : ''}
                            {domain.difference.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Progress value={domain.personalScore} className="flex-1" />
                          <Progress value={domain.cohortAverage} className="flex-1 opacity-50" />
                        </div>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground mt-2">
                      Left bar: Your score | Right bar (faded): Cohort average
                    </p>
                  </div>
                )}

                {/* Strengths & Improvements */}
                <div className="grid md:grid-cols-2 gap-4">
                  {comparativeReport.strengths.length > 0 && (
                    <div className="border border-green-200 bg-green-50 dark:bg-green-950 rounded-lg p-4">
                      <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                        Your Strengths
                      </h4>
                      <ul className="space-y-1">
                        {comparativeReport.strengths.map((strength, idx) => (
                          <li key={idx} className="text-sm">
                            • {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {comparativeReport.improvements.length > 0 && (
                    <div className="border border-orange-200 bg-orange-50 dark:bg-orange-950 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-2">
                        Areas for Improvement
                      </h4>
                      <ul className="space-y-1">
                        {comparativeReport.improvements.map((improvement, idx) => (
                          <li key={idx} className="text-sm">
                            • {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          {/* Heatmaps Tab */}
          <TabsContent value="heatmaps" className="space-y-6 mt-6">
            {/* Domain × Week Heatmap */}
            {domainWeekHeatmap && (
              <div>
                <h4 className="font-semibold mb-3">Performance Trends Over Time</h4>
                <HeatmapVisualization heatmap={domainWeekHeatmap} />
              </div>
            )}

            {/* Topic × Difficulty Heatmap */}
            {topicDifficultyHeatmap && (
              <div>
                <h4 className="font-semibold mb-3">Performance by Difficulty Level</h4>
                <HeatmapVisualization heatmap={topicDifficultyHeatmap} />
              </div>
            )}
          </TabsContent>

          {/* Time-to-Mastery Tab */}
          <TabsContent value="mastery" className="space-y-6 mt-6">
            {selectedMasteryPlan ? (
              <MasteryPlanView
                plan={selectedMasteryPlan}
                onBack={() => setSelectedMasteryPlan(null)}
              />
            ) : (
              <>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm">
                    AI-powered predictions showing how long it will take to master each TCO domain at
                    80% proficiency.
                  </p>
                </div>

                <div className="space-y-3">
                  {masteryPredictions.map((prediction, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold capitalize">
                          {prediction.domain.replace(/_/g, ' ')}
                        </h4>
                        <Badge
                          variant={
                            prediction.currentMasteryLevel >= 80
                              ? 'default'
                              : prediction.currentMasteryLevel >= 60
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {prediction.currentMasteryLevel.toFixed(0)}% Current
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Est. Time</p>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-primary" />
                            <p className="font-semibold">
                              {prediction.predictedDaysToMastery} days
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Study Hours</p>
                          <p className="font-semibold">
                            {prediction.predictedStudyHoursNeeded.toFixed(1)}h
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Questions</p>
                          <p className="font-semibold">
                            {prediction.predictedPracticeQuestionsNeeded}
                          </p>
                        </div>
                      </div>

                      <div className="bg-muted p-3 rounded text-sm mb-3">
                        <p className="font-semibold mb-1">Recommended Schedule:</p>
                        <p>
                          {prediction.recommendedDailyMinutes} min/day, {prediction.recommendedWeeklySessions} days/week
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewMasteryPlan(prediction.domain)}
                        className="w-full"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        View Weekly Plan
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ==================== HEATMAP VISUALIZATION COMPONENT ====================

interface HeatmapVisualizationProps {
  heatmap: PerformanceHeatmap;
}

function HeatmapVisualization({ heatmap }: HeatmapVisualizationProps) {
  const data = heatmap.data as any;
  const minValue = data.metadata?.minValue || 0;
  const maxValue = data.metadata?.maxValue || 100;

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Column Headers */}
        <div className="flex">
          <div className="w-40" /> {/* Spacer for row labels */}
          {data.columns.map((col: string, idx: number) => (
            <div key={idx} className="w-20 text-center text-xs font-medium p-2">
              {col}
            </div>
          ))}
        </div>

        {/* Heatmap Rows */}
        {data.rows.map((row: string, rowIdx: number) => (
          <div key={rowIdx} className="flex items-center">
            {/* Row Label */}
            <div className="w-40 text-sm font-medium p-2 truncate" title={row}>
              {row}
            </div>

            {/* Cells */}
            {data.matrix[rowIdx].map((value: number, colIdx: number) => {
              const color = getHeatmapColor(value, minValue, maxValue);
              return (
                <div
                  key={colIdx}
                  className="w-20 h-12 flex items-center justify-center text-xs font-semibold border"
                  style={{
                    backgroundColor: color,
                    color: value > 60 ? '#fff' : '#000',
                  }}
                  title={`${row} - ${data.columns[colIdx]}: ${value.toFixed(1)}%`}
                >
                  {value > 0 ? value.toFixed(0) : '-'}
                </div>
              );
            })}
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-xs text-muted-foreground">Scale:</span>
          <div className="flex items-center">
            <div className="w-8 h-4" style={{ backgroundColor: '#ef4444' }} />
            <span className="text-xs mx-2">Low (0-60%)</span>
            <div className="w-8 h-4" style={{ backgroundColor: '#f59e0b' }} />
            <span className="text-xs mx-2">Medium (60-80%)</span>
            <div className="w-8 h-4" style={{ backgroundColor: '#10b981' }} />
            <span className="text-xs ml-2">High (80%+)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== MASTERY PLAN VIEW COMPONENT ====================

interface MasteryPlanViewProps {
  plan: MasteryPlan;
  onBack: () => void;
}

function MasteryPlanView({ plan, onBack }: MasteryPlanViewProps) {
  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack}>
        ← Back to All Domains
      </Button>

      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-2 capitalize">
          {plan.domain.replace(/_/g, ' ')} Mastery Plan
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Level</p>
            <p className="text-2xl font-bold">{plan.currentLevel.toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Target Level</p>
            <p className="text-2xl font-bold text-green-600">{plan.targetLevel.toFixed(0)}%</p>
          </div>
        </div>
      </div>

      {/* Weekly Plan */}
      <div className="space-y-3">
        <h4 className="font-semibold">Weekly Milestones</h4>
        {plan.weeklyPlan.map((week, idx) => (
          <div key={idx} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-semibold">Week {week.week}</h5>
              <Badge variant="outline">
                {week.startDate} to {week.endDate}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
              <div>
                <p className="text-muted-foreground">Study Hours</p>
                <p className="font-semibold">{week.recommendedHours}h</p>
              </div>
              <div>
                <p className="text-muted-foreground">Questions</p>
                <p className="font-semibold">{week.recommendedQuestions}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Target Mastery</p>
                <p className="font-semibold">{week.expectedMasteryLevel}%</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold">Milestones:</p>
              {week.milestones.map((milestone, mIdx) => (
                <p key={mIdx} className="text-xs text-muted-foreground">
                  • {milestone}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Success Factors */}
      <div className="border border-green-200 bg-green-50 dark:bg-green-950 rounded-lg p-4">
        <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">
          Critical Success Factors
        </h4>
        <ul className="space-y-1">
          {plan.criticalSuccessFactors.map((factor, idx) => (
            <li key={idx} className="text-sm">
              • {factor}
            </li>
          ))}
        </ul>
      </div>

      {/* Risks */}
      {plan.potentialRisks.length > 0 && (
        <div className="border border-orange-200 bg-orange-50 dark:bg-orange-950 rounded-lg p-4">
          <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Potential Risks
          </h4>
          <ul className="space-y-1">
            {plan.potentialRisks.map((risk, idx) => (
              <li key={idx} className="text-sm">
                • {risk}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default AdvancedAnalyticsDashboard;
