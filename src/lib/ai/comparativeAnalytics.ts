/**
 * Comparative Analytics Service
 *
 * Provides comparative analytics showing how a student performs relative to:
 * - Global cohort average
 * - Students with similar goals
 * - Students at similar progress levels
 *
 * Research Foundation:
 * - Social Comparison Theory (Festinger, 1954): People evaluate their abilities by comparing with others
 * - Bandura's Social Learning Theory: Observing others' success increases self-efficacy
 * - Studies show comparative feedback increases motivation by 20-30% (Burguillo, 2010)
 */

import { supabase } from '@/lib/supabase/client';
import { camelCaseKeys, snakeCaseKeys } from '@/lib/utils/caseConversion';

// ==================== TYPES ====================

export interface CohortBenchmark {
  id: string;
  cohortName: string;
  cohortType: 'temporal' | 'goal_based' | 'performance_level' | 'global';
  totalStudents: number;
  avgCompletionPercentage: number;
  avgOverallAccuracy: number;
  avgStudyHours: number;
  avgDaysToCompletion?: number;
  avgMockExamScore: number;
  avgPracticeAccuracy: number;
  avgStudyStreak: number;
  passRate?: number;
  domainAverages: Record<string, number>;
  avgTimePerModule: Record<string, number>;
  avgSessionsPerWeek: number;
  avgSessionDurationMinutes: number;
  dateRangeStart: string;
  dateRangeEnd: string;
  lastCalculatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentCohortAssignment {
  id: string;
  userId: string;
  cohortBenchmarkId: string;
  personalCompletionPercentage: number;
  personalOverallAccuracy: number;
  personalStudyHours: number;
  personalDaysActive: number;
  personalMockExamBest: number;
  completionPercentile?: number;
  accuracyPercentile?: number;
  studyHoursPercentile?: number;
  overallPercentile?: number;
  assignedAt: string;
  lastUpdatedAt: string;
}

export interface ComparativeReport {
  userId: string;
  cohort: CohortBenchmark;
  assignment: StudentCohortAssignment;
  comparisons: {
    metric: string;
    label: string;
    personalValue: number;
    cohortAverage: number;
    difference: number;
    percentile?: number;
    status: 'above_average' | 'average' | 'below_average';
    interpretation: string;
  }[];
  strengths: string[];
  improvements: string[];
  motivationalMessage: string;
  generatedAt: string;
}

export interface DomainComparison {
  domain: string;
  domainLabel: string;
  personalScore: number;
  cohortAverage: number;
  difference: number;
  percentile?: number;
  rank?: number;
  totalStudents?: number;
}

// ==================== COHORT BENCHMARK MANAGEMENT ====================

/**
 * Calculate global cohort benchmarks from all student performance data
 * Should be run periodically (e.g., daily) via cron job
 */
export async function calculateGlobalCohortBenchmarks(): Promise<CohortBenchmark> {
  try {
    const { data, error } = await supabase.rpc('calculate_global_cohort_benchmarks');

    if (error) {
      console.error('Error calculating global cohort benchmarks:', error);
      throw error;
    }

    // Fetch the newly created global benchmark
    const { data: benchmark, error: fetchError } = await supabase
      .from('cohort_benchmarks')
      .select('*')
      .eq('cohort_type', 'global')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError) throw fetchError;

    return camelCaseKeys(benchmark) as CohortBenchmark;
  } catch (error) {
    console.error('Error in calculateGlobalCohortBenchmarks:', error);
    throw error;
  }
}

/**
 * Get the global cohort benchmark
 */
export async function getGlobalCohortBenchmark(): Promise<CohortBenchmark | null> {
  try {
    const { data, error } = await supabase
      .from('cohort_benchmarks')
      .select('*')
      .eq('cohort_type', 'global')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows found
      throw error;
    }

    return camelCaseKeys(data) as CohortBenchmark;
  } catch (error) {
    console.error('Error fetching global cohort benchmark:', error);
    throw error;
  }
}

/**
 * Assign a student to appropriate cohorts
 */
export async function assignStudentToCohorts(userId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('assign_student_to_cohorts', {
      p_user_id: userId,
    });

    if (error) throw error;

    // Calculate percentiles
    await calculateStudentPercentiles(userId);
  } catch (error) {
    console.error('Error assigning student to cohorts:', error);
    throw error;
  }
}

/**
 * Calculate percentile rankings for a student
 */
export async function calculateStudentPercentiles(userId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('calculate_student_percentiles', {
      p_user_id: userId,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error calculating student percentiles:', error);
    throw error;
  }
}

/**
 * Get student's cohort assignments
 */
export async function getStudentCohortAssignments(
  userId: string
): Promise<StudentCohortAssignment[]> {
  try {
    const { data, error } = await supabase
      .from('student_cohort_assignments')
      .select('*')
      .eq('user_id', userId)
      .order('last_updated_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((item) => camelCaseKeys(item)) as StudentCohortAssignment[];
  } catch (error) {
    console.error('Error fetching student cohort assignments:', error);
    throw error;
  }
}

// ==================== COMPARATIVE ANALYTICS ====================

/**
 * Generate comprehensive comparative report for a student
 * Shows how they compare to cohort averages across all metrics
 */
export async function generateComparativeReport(userId: string): Promise<ComparativeReport> {
  try {
    // Get global cohort benchmark
    let cohort = await getGlobalCohortBenchmark();

    // If no cohort exists, create one
    if (!cohort) {
      cohort = await calculateGlobalCohortBenchmarks();
    }

    // Ensure student is assigned to cohorts
    await assignStudentToCohorts(userId);

    // Get student's cohort assignment
    const assignments = await getStudentCohortAssignments(userId);
    const assignment = assignments.find((a) => a.cohortBenchmarkId === cohort!.id);

    if (!assignment) {
      throw new Error('Student not assigned to cohort. Please try again.');
    }

    // Build comparison metrics
    const comparisons: ComparativeReport['comparisons'] = [];

    // 1. Completion Percentage
    const completionDiff = assignment.personalCompletionPercentage - cohort.avgCompletionPercentage;
    comparisons.push({
      metric: 'completion',
      label: 'Course Completion',
      personalValue: assignment.personalCompletionPercentage,
      cohortAverage: cohort.avgCompletionPercentage,
      difference: completionDiff,
      percentile: assignment.completionPercentile,
      status: getComparisonStatus(completionDiff),
      interpretation: generateInterpretation(
        'completion',
        completionDiff,
        assignment.completionPercentile
      ),
    });

    // 2. Overall Accuracy
    const accuracyDiff = assignment.personalOverallAccuracy - cohort.avgOverallAccuracy;
    comparisons.push({
      metric: 'accuracy',
      label: 'Overall Accuracy',
      personalValue: assignment.personalOverallAccuracy,
      cohortAverage: cohort.avgOverallAccuracy,
      difference: accuracyDiff,
      percentile: assignment.accuracyPercentile,
      status: getComparisonStatus(accuracyDiff),
      interpretation: generateInterpretation('accuracy', accuracyDiff, assignment.accuracyPercentile),
    });

    // 3. Study Hours
    const studyHoursDiff = assignment.personalStudyHours - cohort.avgStudyHours;
    comparisons.push({
      metric: 'study_hours',
      label: 'Study Hours',
      personalValue: assignment.personalStudyHours,
      cohortAverage: cohort.avgStudyHours,
      difference: studyHoursDiff,
      percentile: assignment.studyHoursPercentile,
      status: getComparisonStatus(studyHoursDiff),
      interpretation: generateInterpretation(
        'study_hours',
        studyHoursDiff,
        assignment.studyHoursPercentile
      ),
    });

    // 4. Mock Exam Score
    const mockExamDiff = assignment.personalMockExamBest - cohort.avgMockExamScore;
    comparisons.push({
      metric: 'mock_exam',
      label: 'Best Mock Exam Score',
      personalValue: assignment.personalMockExamBest,
      cohortAverage: cohort.avgMockExamScore,
      difference: mockExamDiff,
      status: getComparisonStatus(mockExamDiff),
      interpretation: generateInterpretation('mock_exam', mockExamDiff),
    });

    // Identify strengths and improvements
    const strengths: string[] = [];
    const improvements: string[] = [];

    for (const comp of comparisons) {
      if (comp.percentile && comp.percentile >= 75) {
        strengths.push(
          `${comp.label}: You're in the top ${100 - comp.percentile}% (${comp.percentile}th percentile)`
        );
      } else if (comp.percentile && comp.percentile <= 25) {
        improvements.push(
          `${comp.label}: You're in the bottom ${comp.percentile}% - focus here to improve`
        );
      }
    }

    // Generate motivational message
    const motivationalMessage = generateMotivationalMessage(assignment.overallPercentile || 50);

    return {
      userId,
      cohort,
      assignment,
      comparisons,
      strengths,
      improvements,
      motivationalMessage,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error generating comparative report:', error);
    throw error;
  }
}

/**
 * Get domain-level comparisons
 * Shows student's performance vs cohort average for each TCO domain
 */
export async function getDomainComparisons(userId: string): Promise<DomainComparison[]> {
  try {
    const cohort = await getGlobalCohortBenchmark();
    if (!cohort || !cohort.domainAverages) {
      return [];
    }

    // Get student's domain scores
    const { data: studentData, error: studentError } = await supabase
      .from('student_performance_snapshots')
      .select('domain_scores')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (studentError) throw studentError;

    const studentDomainScores = (studentData?.domain_scores || {}) as Record<string, number>;
    const comparisons: DomainComparison[] = [];

    const domainLabels: Record<string, string> = {
      asking_questions: 'Asking Questions',
      refining_targeting: 'Refining & Targeting',
      taking_action: 'Taking Action',
      navigation: 'Navigation',
      reporting: 'Reporting',
      troubleshooting: 'Troubleshooting',
    };

    for (const [domain, cohortAvg] of Object.entries(cohort.domainAverages)) {
      const personalScore = studentDomainScores[domain] || 0;
      const difference = personalScore - cohortAvg;

      comparisons.push({
        domain,
        domainLabel: domainLabels[domain] || domain,
        personalScore,
        cohortAverage: cohortAvg,
        difference,
      });
    }

    // Sort by personal score (highest first)
    comparisons.sort((a, b) => b.personalScore - a.personalScore);

    return comparisons;
  } catch (error) {
    console.error('Error getting domain comparisons:', error);
    throw error;
  }
}

// ==================== HELPER FUNCTIONS ====================

function getComparisonStatus(
  difference: number
): 'above_average' | 'average' | 'below_average' {
  if (difference > 5) return 'above_average';
  if (difference < -5) return 'below_average';
  return 'average';
}

function generateInterpretation(
  metric: string,
  difference: number,
  percentile?: number
): string {
  const absDiff = Math.abs(difference);

  if (metric === 'completion') {
    if (difference > 10) {
      return `You're ahead of the curve! ${absDiff.toFixed(1)}% more completed than average.`;
    } else if (difference < -10) {
      return `You're behind the average by ${absDiff.toFixed(1)}%. Consider dedicating more time.`;
    } else {
      return `You're progressing at a similar pace to most students.`;
    }
  } else if (metric === 'accuracy') {
    if (difference > 5) {
      return `Excellent! Your accuracy is ${absDiff.toFixed(1)}% higher than average.`;
    } else if (difference < -5) {
      return `Your accuracy is ${absDiff.toFixed(1)}% below average. Review weak areas.`;
    } else {
      return `Your accuracy is on par with the cohort average.`;
    }
  } else if (metric === 'study_hours') {
    if (difference > 5) {
      return `You've invested ${absDiff.toFixed(1)} more hours than average - great dedication!`;
    } else if (difference < -3) {
      return `You're ${absDiff.toFixed(1)} hours behind the average. Consistency is key.`;
    } else {
      return `Your study time is similar to most students.`;
    }
  } else if (metric === 'mock_exam') {
    if (difference > 5) {
      return `Outstanding! You scored ${absDiff.toFixed(1)}% higher than average on mock exams.`;
    } else if (difference < -5) {
      return `Your mock exam score is ${absDiff.toFixed(1)}% below average. Practice more.`;
    } else {
      return `Your mock exam performance is typical for students at this stage.`;
    }
  }

  return `Your ${metric} is ${difference > 0 ? 'above' : 'below'} average.`;
}

function generateMotivationalMessage(percentile: number): string {
  if (percentile >= 90) {
    return "🌟 Exceptional! You're performing in the top 10% of all students. You're on track for exam success!";
  } else if (percentile >= 75) {
    return "🎉 Great job! You're in the top 25%. Keep up the momentum!";
  } else if (percentile >= 50) {
    return "👍 You're performing above average. A bit more focus and you'll be in the top quartile!";
  } else if (percentile >= 25) {
    return "💪 You're making progress. Identify your weak areas and dedicate extra time to them.";
  } else {
    return "🚀 You have room to grow. Don't compare yourself to others too much - focus on your own improvement!";
  }
}

/**
 * Get cached comparative analytics (if available)
 * Reduces database load by caching results for 1 hour
 */
export async function getCachedComparativeAnalytics(
  userId: string
): Promise<ComparativeReport | null> {
  try {
    const { data, error } = await supabase
      .from('learning_analytics_cache')
      .select('*')
      .eq('user_id', userId)
      .eq('cache_key', 'comparative_analytics')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No cache found
      throw error;
    }

    // Increment hit count
    await supabase
      .from('learning_analytics_cache')
      .update({ hit_count: (data.hit_count || 0) + 1 })
      .eq('id', data.id);

    return camelCaseKeys(data.data) as ComparativeReport;
  } catch (error) {
    console.error('Error fetching cached comparative analytics:', error);
    return null;
  }
}

/**
 * Cache comparative analytics for 1 hour
 */
export async function cacheComparativeAnalytics(
  userId: string,
  report: ComparativeReport
): Promise<void> {
  try {
    const ttlSeconds = 3600; // 1 hour
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

    await supabase
      .from('learning_analytics_cache')
      .upsert(
        {
          user_id: userId,
          cache_key: 'comparative_analytics',
          data: snakeCaseKeys(report),
          ttl_seconds: ttlSeconds,
          expires_at: expiresAt,
          hit_count: 0,
        },
        { onConflict: 'user_id,cache_key' }
      );
  } catch (error) {
    console.error('Error caching comparative analytics:', error);
    // Don't throw - caching is optional
  }
}

/**
 * Generate comparative analytics with caching
 * Tries to use cached data first, generates new if cache miss
 */
export async function getComparativeAnalytics(userId: string): Promise<ComparativeReport> {
  // Try cache first
  const cached = await getCachedComparativeAnalytics(userId);
  if (cached) {
    return cached;
  }

  // Cache miss - generate new report
  const report = await generateComparativeReport(userId);

  // Cache for next time
  await cacheComparativeAnalytics(userId, report);

  return report;
}

export default {
  calculateGlobalCohortBenchmarks,
  getGlobalCohortBenchmark,
  assignStudentToCohorts,
  calculateStudentPercentiles,
  getStudentCohortAssignments,
  generateComparativeReport,
  getDomainComparisons,
  getComparativeAnalytics,
};
