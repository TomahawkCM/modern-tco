/**
 * Smart Recommendations Engine
 *
 * AI-powered recommendation system that analyzes student performance and generates
 * personalized "next best action" recommendations.
 *
 * Features:
 * - Performance analysis across all domains
 * - Priority-based recommendation generation
 * - Context-aware suggestions (study schedule, weak domains, resources)
 * - Intervention trigger detection
 * - Weekly study plan generation
 */

import { supabase } from '@/lib/supabase';
import Anthropic from '@anthropic-ai/sdk';
import { gatherPerformanceData, type PerformanceData } from './adaptiveLearningPath';

// ==================== TYPES ====================

export interface Recommendation {
  id: string;
  userId: string;
  recommendationType: 'next_action' | 'weak_domain' | 'study_schedule' | 'resource' | 'strategy' | 'intervention';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  generatedBy: string;
  confidenceScore: number;
  reasoning?: string;
  suggestedActions?: any;
  estimatedImpact?: string;
  relatedDomain?: string;
  relatedModuleId?: string;
  relatedContentId?: string;
  status: 'active' | 'dismissed' | 'completed' | 'expired';
  viewedAt?: Date;
  actionedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

export interface RecommendationContext {
  userId: string;
  performance: PerformanceData;
  currentPath?: any;
  recentActivity?: {
    lastStudyDate?: Date;
    daysSinceLastStudy?: number;
    recentQuizScores?: number[];
    recentSessionDuration?: number;
  };
  goals?: {
    targetExamDate?: Date;
    daysUntilExam?: number;
    targetScore?: number;
    hoursPerWeek?: number;
  };
  studyStreak?: number;
}

export interface WeeklyStudyPlan {
  weekStartDate: Date;
  totalHoursAllocated: number;
  dailyPlans: {
    date: Date;
    dayOfWeek: string;
    plannedHours: number;
    sessions: {
      time: string; // e.g., "morning", "afternoon", "evening"
      duration: number; // minutes
      activity: string;
      contentId?: string;
      priority: 'high' | 'medium' | 'low';
    }[];
  }[];
  focusAreas: string[];
  milestones: string[];
}

// ==================== CONSTANTS ====================

const TCO_DOMAINS = [
  'asking_questions',
  'refining_questions',
  'taking_action',
  'navigation_basic_functions',
  'report_generation_export',
] as const;

const DOMAIN_WEIGHTS = {
  asking_questions: 0.22,
  refining_questions: 0.23,
  taking_action: 0.15,
  navigation_basic_functions: 0.23,
  report_generation_export: 0.17,
} as const;

const DOMAIN_NAMES = {
  asking_questions: 'Asking Questions',
  refining_questions: 'Refining Questions & Targeting',
  taking_action: 'Taking Action',
  navigation_basic_functions: 'Navigation & Basic Modules',
  report_generation_export: 'Report Generation & Export',
} as const;

// ==================== AI CLIENT ====================

let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

// ==================== CONTEXT GATHERING ====================

export async function gatherRecommendationContext(userId: string): Promise<RecommendationContext> {
  // Get performance data
  const performance = await gatherPerformanceData(userId);

  // Get current learning path
  const { data: pathData } = await supabase
    .from('adaptive_learning_paths')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // Get recent activity
  const { data: recentSessions } = await supabase
    .from('exam_sessions')
    .select('completed_at, score, created_at, updated_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  const lastStudyDate = recentSessions?.[0]?.completed_at
    ? new Date(recentSessions[0].completed_at)
    : undefined;
  const daysSinceLastStudy = lastStudyDate
    ? Math.floor((Date.now() - lastStudyDate.getTime()) / (1000 * 60 * 60 * 24))
    : undefined;

  const recentQuizScores = recentSessions
    ?.filter((s: any) => s.score !== null)
    .map((s: any) => s.score || 0) || [];

  // Get study goals
  const { data: goalData } = await supabase
    .from('student_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const daysUntilExam = goalData?.target_exam_date
    ? Math.ceil((new Date(goalData.target_exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : undefined;

  // Calculate study streak
  const { data: streakData } = await supabase.rpc('calculate_review_streak', { p_user_id: userId });
  const studyStreak = streakData || 0;

  return {
    userId,
    performance,
    currentPath: pathData,
    recentActivity: {
      lastStudyDate,
      daysSinceLastStudy,
      recentQuizScores,
    },
    goals: {
      targetExamDate: goalData?.target_exam_date ? new Date(goalData.target_exam_date) : undefined,
      daysUntilExam,
      targetScore: goalData?.target_pass_score,
      hoursPerWeek: goalData?.study_hours_per_week,
    },
    studyStreak,
  };
}

// ==================== RECOMMENDATION GENERATION ====================

export async function generateRecommendations(context: RecommendationContext): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  // 1. Check for intervention needs (CRITICAL)
  const interventionRecs = await generateInterventionRecommendations(context);
  recommendations.push(...interventionRecs);

  // 2. Generate next action recommendation (HIGH)
  const nextActionRec = await generateNextActionRecommendation(context);
  if (nextActionRec) recommendations.push(nextActionRec);

  // 3. Identify weak domain recommendations (HIGH)
  const weakDomainRecs = await generateWeakDomainRecommendations(context);
  recommendations.push(...weakDomainRecs);

  // 4. Study schedule optimization (MEDIUM)
  const scheduleRec = await generateStudyScheduleRecommendation(context);
  if (scheduleRec) recommendations.push(scheduleRec);

  // 5. Resource recommendations (MEDIUM)
  const resourceRecs = await generateResourceRecommendations(context);
  recommendations.push(...resourceRecs);

  // 6. Strategy recommendations (LOW-MEDIUM)
  const strategyRecs = await generateStrategyRecommendations(context);
  recommendations.push(...strategyRecs);

  // Save all recommendations to database
  await saveRecommendations(recommendations);

  return recommendations;
}

// ==================== INTERVENTION DETECTION ====================

async function generateInterventionRecommendations(context: RecommendationContext): Promise<Recommendation[]> {
  const interventions: Recommendation[] = [];

  // Check 1: Low engagement (no study in 7+ days)
  if (context.recentActivity?.daysSinceLastStudy && context.recentActivity.daysSinceLastStudy >= 7) {
    interventions.push({
      id: `intervention-engagement-${Date.now()}`,
      userId: context.userId,
      recommendationType: 'intervention',
      title: '⚠️ Study Break Detected',
      description: `You haven't studied in ${context.recentActivity.daysSinceLastStudy} days. Getting back on track is crucial for exam success.`,
      priority: 'critical',
      generatedBy: 'rule-based',
      confidenceScore: 0.95,
      reasoning: 'Extended study gap detected',
      suggestedActions: [
        'Start with a 15-minute review session',
        'Complete one practice quiz to warm up',
        'Review your weak areas from last session',
      ],
      estimatedImpact: 'Prevents knowledge decay and maintains momentum',
      status: 'active',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date(),
    });
  }

  // Check 2: Declining performance (recent quiz scores trending down)
  if (context.recentActivity?.recentQuizScores && context.recentActivity.recentQuizScores.length >= 3) {
    const scores = context.recentActivity.recentQuizScores;
    const recentAvg = (scores[0] + scores[1]) / 2;
    const olderAvg = scores.slice(2).reduce((a, b) => a + b, 0) / scores.slice(2).length;

    if (recentAvg < olderAvg - 10) {
      interventions.push({
        id: `intervention-declining-${Date.now()}`,
        userId: context.userId,
        recommendationType: 'intervention',
        title: '📉 Performance Decline Detected',
        description: `Your recent quiz scores (${recentAvg.toFixed(1)}%) are lower than your previous average (${olderAvg.toFixed(1)}%). Let's get you back on track.`,
        priority: 'high',
        generatedBy: 'rule-based',
        confidenceScore: 0.90,
        reasoning: 'Negative performance trend',
        suggestedActions: [
          'Review fundamentals in your weak domains',
          'Take a break if feeling overwhelmed',
          'Schedule shorter, focused study sessions',
          'Talk to AI tutor about challenges',
        ],
        estimatedImpact: 'Reverses negative trend, prevents burnout',
        status: 'active',
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      });
    }
  }

  // Check 3: Exam unready (< 30 days and < 70% readiness)
  if (context.goals?.daysUntilExam && context.goals.daysUntilExam < 30) {
    const readiness = context.performance.overallAccuracy;
    if (readiness < 70) {
      interventions.push({
        id: `intervention-unready-${Date.now()}`,
        userId: context.userId,
        recommendationType: 'intervention',
        title: '🚨 Exam Readiness Alert',
        description: `You have ${context.goals.daysUntilExam} days until your exam, but your readiness is only ${readiness.toFixed(1)}%. Intensive preparation needed.`,
        priority: 'critical',
        generatedBy: 'rule-based',
        confidenceScore: 0.98,
        reasoning: 'Insufficient preparation time remaining',
        suggestedActions: [
          'Increase study hours to 15-20/week',
          'Focus exclusively on weak domains',
          'Complete 2 full mock exams immediately',
          'Consider postponing exam if score doesn\'t improve',
        ],
        estimatedImpact: 'Critical for exam success',
        relatedDomain: context.performance.weakDomains[0],
        status: 'active',
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      });
    }
  }

  // Check 4: Burnout risk (studying too much without breaks)
  if (context.studyStreak && context.studyStreak > 21 && context.performance.learningVelocity > 3.5) {
    interventions.push({
      id: `intervention-burnout-${Date.now()}`,
      userId: context.userId,
      recommendationType: 'intervention',
      title: '😴 Burnout Risk Detected',
      description: `You've studied for ${context.studyStreak} days straight with high intensity. Taking strategic breaks improves retention.`,
      priority: 'warning',
      generatedBy: 'rule-based',
      confidenceScore: 0.85,
      reasoning: 'Extended study streak without rest days',
      suggestedActions: [
        'Schedule 1 rest day this week',
        'Reduce daily study hours by 25%',
        'Switch to lighter review activities',
        'Ensure 7-8 hours sleep nightly',
      ],
      estimatedImpact: 'Prevents burnout, improves long-term retention',
      status: 'active',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    });
  }

  return interventions;
}

// ==================== NEXT ACTION RECOMMENDATION ====================

async function generateNextActionRecommendation(context: RecommendationContext): Promise<Recommendation | null> {
  // If student has active learning path, recommend next step
  if (context.currentPath) {
    const { data: nextStep } = await supabase
      .from('learning_path_steps')
      .select('*')
      .eq('path_id', context.currentPath.id)
      .eq('step_index', context.currentPath.current_step_index)
      .single();

    if (nextStep) {
      return {
        id: `next-action-${Date.now()}`,
        userId: context.userId,
        recommendationType: 'next_action',
        title: `📖 Continue Your Learning Path`,
        description: `Your next step: ${nextStep.title}`,
        priority: 'high',
        generatedBy: 'learning-path',
        confidenceScore: 0.95,
        suggestedActions: [
          {
            type: nextStep.step_type,
            contentId: nextStep.content_id,
            estimatedMinutes: nextStep.estimated_minutes,
          },
        ],
        estimatedImpact: 'Maintains structured progress toward exam',
        relatedDomain: nextStep.content_domain,
        relatedContentId: nextStep.content_id,
        status: 'active',
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      };
    }
  }

  // Otherwise, recommend based on weak domains
  if (context.performance.weakDomains.length > 0) {
    const weakestDomain = context.performance.weakDomains[0];
    return {
      id: `next-action-weak-${Date.now()}`,
      userId: context.userId,
      recommendationType: 'next_action',
      title: `🎯 Focus on ${DOMAIN_NAMES[weakestDomain as keyof typeof DOMAIN_NAMES]}`,
      description: `This is currently your weakest area. Improving here will have the biggest impact on your exam score.`,
      priority: 'high',
      generatedBy: 'performance-analysis',
      confidenceScore: 0.88,
      reasoning: `Lowest domain score: ${context.performance.domainScores[weakestDomain]?.toFixed(1) || 0}%`,
      suggestedActions: [
        `Study ${DOMAIN_NAMES[weakestDomain as keyof typeof DOMAIN_NAMES]} module`,
        `Complete 10 practice questions`,
        `Watch related video content`,
      ],
      estimatedImpact: `+${(DOMAIN_WEIGHTS[weakestDomain as keyof typeof DOMAIN_WEIGHTS] * 100).toFixed(0)}% exam weight coverage`,
      relatedDomain: weakestDomain,
      status: 'active',
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };
  }

  return null;
}

// ==================== WEAK DOMAIN RECOMMENDATIONS ====================

async function generateWeakDomainRecommendations(context: RecommendationContext): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  // Get top 2 weak domains
  const weakDomains = context.performance.weakDomains.slice(0, 2);

  for (const domain of weakDomains) {
    const score = context.performance.domainScores[domain] || 0;
    const weight = DOMAIN_WEIGHTS[domain as keyof typeof DOMAIN_WEIGHTS];
    const domainName = DOMAIN_NAMES[domain as keyof typeof DOMAIN_NAMES];

    recommendations.push({
      id: `weak-domain-${domain}-${Date.now()}`,
      userId: context.userId,
      recommendationType: 'weak_domain',
      title: `📚 Strengthen ${domainName}`,
      description: `Current score: ${score.toFixed(1)}%. This domain represents ${(weight * 100).toFixed(0)}% of the exam.`,
      priority: weight > 0.20 ? 'high' : 'medium',
      generatedBy: 'performance-analysis',
      confidenceScore: 0.92,
      reasoning: `Below target threshold, high exam weight (${(weight * 100).toFixed(0)}%)`,
      suggestedActions: [
        `Review ${domainName} study module`,
        `Complete 15-20 practice questions`,
        `Watch tutorial videos`,
        `Complete hands-on lab exercises`,
      ],
      estimatedImpact: `Could improve overall score by ${(weight * 15).toFixed(1)}%`,
      relatedDomain: domain,
      status: 'active',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    });
  }

  return recommendations;
}

// ==================== STUDY SCHEDULE RECOMMENDATION ====================

async function generateStudyScheduleRecommendation(context: RecommendationContext): Promise<Recommendation | null> {
  if (!context.goals?.hoursPerWeek || !context.goals.daysUntilExam) return null;

  const currentPace = context.performance.studyHoursCompleted / Math.max(context.performance.modulesCompleted, 1);
  const optimalPace = 2.0; // 2 hours per module average

  if (Math.abs(currentPace - optimalPace) > 0.5) {
    const isTooFast = currentPace < optimalPace;

    return {
      id: `schedule-${Date.now()}`,
      userId: context.userId,
      recommendationType: 'study_schedule',
      title: isTooFast ? '⚡ Slow Down for Better Retention' : '🐌 Speed Up Your Progress',
      description: isTooFast
        ? `You're moving quickly (${currentPace.toFixed(1)}h/module). Research shows optimal pace is ~2h/module for retention.`
        : `You're spending ${currentPace.toFixed(1)}h/module. Try to complete modules in ~2 hours for better momentum.`,
      priority: 'medium',
      generatedBy: 'pace-analysis',
      confidenceScore: 0.80,
      reasoning: `Current pace: ${currentPace.toFixed(1)}h/module vs optimal 2h/module`,
      suggestedActions: isTooFast
        ? [
            'Add 10-15 minute review breaks',
            'Complete more practice questions per module',
            'Take detailed notes for spaced repetition',
          ]
        : [
            'Set 2-hour time blocks per module',
            'Focus on core concepts first',
            'Skip optional deep-dives initially',
          ],
      estimatedImpact: isTooFast ? 'Improves long-term retention by 25%' : 'Maintains motivation and momentum',
      status: 'active',
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };
  }

  return null;
}

// ==================== RESOURCE RECOMMENDATIONS ====================

async function generateResourceRecommendations(context: RecommendationContext): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  // Recommend mock exams if ready (>70% accuracy, studied >10 hours)
  if (context.performance.overallAccuracy >= 70 && context.performance.studyHoursCompleted >= 10) {
    const mockExamsTaken = context.performance.mockExamScores.length;

    if (mockExamsTaken < 3) {
      recommendations.push({
        id: `resource-mock-${Date.now()}`,
        userId: context.userId,
        recommendationType: 'resource',
        title: '🎯 Take a Mock Exam',
        description: `You've built solid knowledge (${context.performance.overallAccuracy.toFixed(1)}%). Mock exams will reveal readiness gaps.`,
        priority: 'high',
        generatedBy: 'readiness-analysis',
        confidenceScore: 0.90,
        reasoning: 'Strong fundamentals, ready for full assessment',
        suggestedActions: [
          'Take 75-question full mock exam',
          'Simulate real exam conditions (105 minutes)',
          'Review all incorrect answers thoroughly',
        ],
        estimatedImpact: 'Identifies final prep areas, +25% pass confidence',
        relatedContentId: 'mock-exam',
        status: 'active',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      });
    }
  }

  // Recommend video content if learning style is visual
  const { data: goalData } = await supabase
    .from('student_goals')
    .select('learning_style')
    .eq('user_id', context.userId)
    .single();

  if (goalData?.learning_style === 'visual' || goalData?.learning_style === 'mixed') {
    recommendations.push({
      id: `resource-video-${Date.now()}`,
      userId: context.userId,
      recommendationType: 'resource',
      title: '🎥 Watch Tutorial Videos',
      description: 'Visual learning matches your style. Our video library reinforces key TCO concepts.',
      priority: 'medium',
      generatedBy: 'learning-style-match',
      confidenceScore: 0.85,
      suggestedActions: [
        'Watch Mastering Interact series (40 min)',
        'Review Navigation tutorial (37 min)',
        'Take notes during videos',
      ],
      estimatedImpact: 'Reinforces concepts, +60% engagement for visual learners',
      status: 'active',
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    });
  }

  return recommendations;
}

// ==================== STRATEGY RECOMMENDATIONS ====================

async function generateStrategyRecommendations(context: RecommendationContext): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  // Recommend spaced repetition if not using it regularly
  const { count: reviewCount } = await supabase
    .from('review_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', context.userId)
    .gte('started_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  if ((reviewCount || 0) < 3) {
    recommendations.push({
      id: `strategy-spaced-${Date.now()}`,
      userId: context.userId,
      recommendationType: 'strategy',
      title: '🔄 Use Spaced Repetition',
      description: 'You haven\'t reviewed this week. Spaced repetition improves retention by 42%.',
      priority: 'medium',
      generatedBy: 'usage-analysis',
      confidenceScore: 0.88,
      reasoning: 'Low review activity detected',
      suggestedActions: [
        'Review flashcards daily (10-15 min)',
        'Revisit missed quiz questions',
        'Use daily review dashboard',
      ],
      estimatedImpact: '+42% long-term retention (research-proven)',
      status: 'active',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    });
  }

  return recommendations;
}

// ==================== WEEKLY STUDY PLAN GENERATION ====================

export async function generateWeeklyStudyPlan(
  userId: string,
  hoursPerWeek: number,
  preferredTimes: string[] = ['morning', 'evening']
): Promise<WeeklyStudyPlan> {
  const context = await gatherRecommendationContext(userId);
  const client = getAnthropicClient();

  const prompt = `Generate a detailed weekly study plan for a Tanium TCO student.

**Student Profile:**
- Available Hours: ${hoursPerWeek} hours/week
- Preferred Study Times: ${preferredTimes.join(', ')}
- Current Progress: ${context.performance.modulesCompleted}/6 modules
- Overall Accuracy: ${context.performance.overallAccuracy.toFixed(1)}%
- Weak Domains: ${context.performance.weakDomains.join(', ')}
- Days Until Exam: ${context.goals?.daysUntilExam || 'Not set'}

Generate a JSON study plan:
{
  "totalHoursAllocated": ${hoursPerWeek},
  "dailyPlans": [
    {
      "dayOfWeek": "Monday",
      "plannedHours": 2.0,
      "sessions": [
        {
          "time": "morning",
          "duration": 60,
          "activity": "Study Module 1: Asking Questions",
          "contentId": "01-asking-questions",
          "priority": "high"
        }
      ]
    }
  ],
  "focusAreas": ["weak domain 1", "weak domain 2"],
  "milestones": ["Complete module X", "Score 80%+ on practice exam"]
}

Return ONLY valid JSON.`;

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '{}';
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  const plan = jsonMatch ? JSON.parse(jsonMatch[0]) : getFallbackWeeklyPlan(hoursPerWeek);

  return {
    weekStartDate: getNextMonday(),
    totalHoursAllocated: hoursPerWeek,
    dailyPlans: plan.dailyPlans || [],
    focusAreas: plan.focusAreas || context.performance.weakDomains,
    milestones: plan.milestones || [],
  };
}

function getNextMonday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday;
}

function getFallbackWeeklyPlan(hoursPerWeek: number): any {
  const hoursPerDay = hoursPerWeek / 5; // Spread across 5 days
  return {
    totalHoursAllocated: hoursPerWeek,
    dailyPlans: [
      {
        dayOfWeek: 'Monday',
        plannedHours: hoursPerDay,
        sessions: [
          {
            time: 'evening',
            duration: hoursPerDay * 60,
            activity: 'Study TCO modules',
            priority: 'high',
          },
        ],
      },
    ],
    focusAreas: ['asking_questions', 'navigation_basic_functions'],
    milestones: ['Complete 1 module this week', 'Practice 50 questions'],
  };
}

// ==================== DATABASE OPERATIONS ====================

async function saveRecommendations(recommendations: Recommendation[]): Promise<void> {
  if (recommendations.length === 0) return;

  const recsToInsert = recommendations.map((rec) => ({
    user_id: rec.userId,
    recommendation_type: rec.recommendationType,
    title: rec.title,
    description: rec.description,
    priority: rec.priority,
    generated_by: rec.generatedBy,
    confidence_score: rec.confidenceScore,
    reasoning: rec.reasoning,
    suggested_actions: rec.suggestedActions,
    estimated_impact: rec.estimatedImpact,
    related_domain: rec.relatedDomain,
    related_module_id: rec.relatedModuleId,
    related_content_id: rec.relatedContentId,
    status: rec.status,
    expires_at: rec.expiresAt?.toISOString(),
  }));

  const { error } = await supabase.from('study_recommendations').insert(recsToInsert);

  if (error) throw error;
}

export async function getActiveRecommendations(userId: string): Promise<Recommendation[]> {
  const { data, error } = await supabase
    .from('study_recommendations')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('priority', { ascending: true }) // critical first
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(camelCaseKeys) as Recommendation[];
}

export async function dismissRecommendation(recommendationId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('study_recommendations')
    .update({ status: 'dismissed' })
    .eq('id', recommendationId)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function completeRecommendation(recommendationId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('study_recommendations')
    .update({
      status: 'completed',
      actioned_at: new Date().toISOString(),
    })
    .eq('id', recommendationId)
    .eq('user_id', userId);

  if (error) throw error;
}

// ==================== UTILITY ====================

function camelCaseKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(camelCaseKeys);
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      result[camelKey] = camelCaseKeys(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

export default {
  gatherRecommendationContext,
  generateRecommendations,
  generateWeeklyStudyPlan,
  getActiveRecommendations,
  dismissRecommendation,
  completeRecommendation,
};
