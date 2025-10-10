/**
 * Mock Exam Builder
 *
 * Dynamically generates mock exams from question bank based on template criteria.
 * Uses existing exam_sessions table for tracking attempts.
 *
 * INTEGRATION:
 * - Templates: src/data/mock-exam-configs.ts
 * - Questions: Supabase 'questions' table
 * - Tracking: Supabase 'exam_sessions' table
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  MockExamTemplate,
  getMockExamTemplate,
  calculateDomainQuestionCounts,
  calculateDifficultyQuestionCounts,
} from '@/data/mock-exam-configs';
import { Question, TCODomain } from '@/types/exam';

// =====================================================
// TYPES
// =====================================================

/**
 * Mock exam session data
 */
export interface MockExamSession {
  id: string;
  userId: string;
  templateId: string;
  template: MockExamTemplate;

  // Questions
  questions: Question[];
  totalQuestions: number;

  // Timing
  timeLimitMinutes: number;
  startedAt: string;
  expiresAt: string; // startedAt + timeLimitMinutes

  // Status
  status: 'active' | 'completed' | 'expired';

  // Metadata stored in exam_sessions.config JSONB
  config: {
    templateId: string;
    templateName: string;
    difficultyLevel: string;
    difficultyDistribution: Record<string, number>;
    domainDistribution: Record<string, number>;
  };
}

/**
 * Mock exam result (for completion)
 */
export interface MockExamResult {
  sessionId: string;
  userId: string;
  templateId: string;

  // Scoring
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  passed: boolean;

  // Domain breakdown
  domainScores: Record<TCODomain, { correct: number; total: number; percentage: number }>;

  // Timing
  startedAt: string;
  completedAt: string;
  timeTakenMinutes: number;

  // Answers (for review)
  answers: Array<{
    questionId: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    domain: TCODomain;
  }>;
}

/**
 * Question selection criteria
 */
interface QuestionSelectionCriteria {
  domain: TCODomain;
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
}

// =====================================================
// MAIN FUNCTIONS
// =====================================================

/**
 * Create a new mock exam session
 * Selects questions based on template criteria and creates exam_session record
 */
export async function createMockExamSession(
  templateId: string,
  userId: string
): Promise<MockExamSession | null> {
  const supabase = createClientComponentClient();

  // Get template
  const template = getMockExamTemplate(templateId);
  if (!template) {
    console.error(`Mock exam template not found: ${templateId}`);
    return null;
  }

  // Calculate question distribution
  const domainCounts = calculateDomainQuestionCounts(template);
  const difficultyCounts = calculateDifficultyQuestionCounts(template);

  // Build selection criteria (stratified sampling)
  const criteria = buildSelectionCriteria(domainCounts, difficultyCounts, template);

  // Select questions from database
  const questions = await selectQuestions(supabase, criteria);

  if (questions.length < template.totalQuestions) {
    console.warn(
      `Only ${questions.length} questions available for template requiring ${template.totalQuestions}`
    );
  }

  // Shuffle questions
  const shuffledQuestions = shuffleArray(questions);

  // Create exam session
  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + template.timeLimitMinutes * 60 * 1000);

  const { data: session, error } = await supabase
    .from('exam_sessions')
    .insert({
      user_id: userId,
      started_at: startedAt.toISOString(),
      status: 'active',
      total_questions: shuffledQuestions.length,
      config: {
        templateId: template.id,
        templateName: template.name,
        difficultyLevel: template.difficultyLevel,
        difficultyDistribution: template.difficultyDistribution,
        domainDistribution: template.domainDistribution,
        timeLimitMinutes: template.timeLimitMinutes,
        passingScorePercentage: template.passingScorePercentage,
        questionIds: shuffledQuestions.map((q) => q.id),
      },
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating mock exam session:', error);
    return null;
  }

  return {
    id: session.id,
    userId,
    templateId: template.id,
    template,
    questions: shuffledQuestions,
    totalQuestions: shuffledQuestions.length,
    timeLimitMinutes: template.timeLimitMinutes,
    startedAt: startedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: 'active',
    config: session.config,
  };
}

/**
 * Complete a mock exam session and calculate results
 */
export async function completeMockExamSession(
  sessionId: string,
  userId: string,
  answers: Record<string, string> // questionId -> selectedAnswerId
): Promise<MockExamResult | null> {
  const supabase = createClientComponentClient();

  // Get exam session
  const { data: session, error: sessionError } = await supabase
    .from('exam_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single();

  if (sessionError || !session) {
    console.error('Error fetching exam session:', sessionError);
    return null;
  }

  // Get questions
  const questionIds = session.config.questionIds || [];
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .in('id', questionIds);

  if (questionsError || !questions) {
    console.error('Error fetching questions:', questionsError);
    return null;
  }

  // Calculate scores
  let correctAnswers = 0;
  const answerDetails: MockExamResult['answers'] = [];
  const domainScores: Record<
    TCODomain,
    { correct: number; total: number; percentage: number }
  > = {
    asking_questions: { correct: 0, total: 0, percentage: 0 },
    refining_targeting: { correct: 0, total: 0, percentage: 0 },
    taking_action: { correct: 0, total: 0, percentage: 0 },
    navigation: { correct: 0, total: 0, percentage: 0 },
    reporting: { correct: 0, total: 0, percentage: 0 },
  };

  questions.forEach((question) => {
    const selectedAnswer = answers[question.id];
    const correctAnswer = question.correct_answer;
    const isCorrect = selectedAnswer === correctAnswer;

    if (isCorrect) {
      correctAnswers++;
    }

    const domain = question.domain as TCODomain;
    if (domain && domainScores[domain]) {
      domainScores[domain].total++;
      if (isCorrect) {
        domainScores[domain].correct++;
      }
    }

    answerDetails.push({
      questionId: question.id,
      selectedAnswer: selectedAnswer || '',
      correctAnswer: correctAnswer || '',
      isCorrect,
      domain: domain || 'asking_questions',
    });
  });

  // Calculate domain percentages
  Object.keys(domainScores).forEach((domain) => {
    const key = domain as TCODomain;
    const { correct, total } = domainScores[key];
    domainScores[key].percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  });

  const scorePercentage = Math.round((correctAnswers / questions.length) * 100);
  const passingScore = session.config.passingScorePercentage || 70;
  const passed = scorePercentage >= passingScore;

  const completedAt = new Date();
  const startedAt = new Date(session.started_at);
  const timeTakenMinutes = Math.round((completedAt.getTime() - startedAt.getTime()) / 60000);

  // Update exam session
  const { error: updateError } = await supabase
    .from('exam_sessions')
    .update({
      completed_at: completedAt.toISOString(),
      status: 'completed',
      correct_answers: correctAnswers,
      score: scorePercentage,
    })
    .eq('id', sessionId);

  if (updateError) {
    console.error('Error updating exam session:', updateError);
  }

  return {
    sessionId,
    userId,
    templateId: session.config.templateId,
    totalQuestions: questions.length,
    correctAnswers,
    scorePercentage,
    passed,
    domainScores,
    startedAt: session.started_at,
    completedAt: completedAt.toISOString(),
    timeTakenMinutes,
    answers: answerDetails,
  };
}

/**
 * Get user's mock exam history
 */
export async function getMockExamHistory(
  userId: string
): Promise<
  Array<{
    sessionId: string;
    templateId: string;
    templateName: string;
    scorePercentage: number;
    passed: boolean;
    completedAt: string;
    timeTakenMinutes: number;
  }>
> {
  const supabase = createClientComponentClient();

  const { data: sessions, error } = await supabase
    .from('exam_sessions')
    .select('*')
    .eq('user_id', userId)
    .not('config->templateId', 'is', null) // Only mock exams
    .eq('status', 'completed')
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('Error fetching mock exam history:', error);
    return [];
  }

  return (
    sessions?.map((session) => {
      const startedAt = new Date(session.started_at);
      const completedAt = new Date(session.completed_at || session.started_at);
      const timeTakenMinutes = Math.round(
        (completedAt.getTime() - startedAt.getTime()) / 60000
      );

      return {
        sessionId: session.id,
        templateId: session.config.templateId,
        templateName: session.config.templateName,
        scorePercentage: session.score || 0,
        passed: (session.score || 0) >= (session.config.passingScorePercentage || 70),
        completedAt: session.completed_at || session.started_at,
        timeTakenMinutes,
      };
    }) || []
  );
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Build stratified question selection criteria
 * Distributes questions across domains and difficulty levels
 */
function buildSelectionCriteria(
  domainCounts: Record<TCODomain, number>,
  difficultyCounts: Record<'easy' | 'medium' | 'hard', number>,
  template: MockExamTemplate
): QuestionSelectionCriteria[] {
  const criteria: QuestionSelectionCriteria[] = [];
  const domains: TCODomain[] = [
    'asking_questions',
    'refining_targeting',
    'taking_action',
    'navigation',
    'reporting',
  ];
  const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];

  // For each domain
  domains.forEach((domain) => {
    const domainTotal = domainCounts[domain];
    if (domainTotal === 0) return;

    // Distribute difficulty within domain
    difficulties.forEach((difficulty) => {
      const difficultyPct = template.difficultyDistribution[difficulty] / 100;
      const count = Math.round(domainTotal * difficultyPct);

      if (count > 0) {
        criteria.push({ domain, difficulty, count });
      }
    });
  });

  return criteria;
}

/**
 * Select questions from database based on criteria
 */
async function selectQuestions(
  supabase: any,
  criteria: QuestionSelectionCriteria[]
): Promise<Question[]> {
  const allQuestions: Question[] = [];

  for (const criterion of criteria) {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('domain', criterion.domain)
      .eq('difficulty', criterion.difficulty)
      .limit(criterion.count);

    if (error) {
      console.error(`Error selecting questions for ${criterion.domain}:`, error);
      continue;
    }

    if (data) {
      allQuestions.push(...data);
    }
  }

  return allQuestions;
}

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Check if exam session is expired
 */
export function isExamExpired(startedAt: string, timeLimitMinutes: number): boolean {
  const started = new Date(startedAt);
  const expires = new Date(started.getTime() + timeLimitMinutes * 60 * 1000);
  return new Date() > expires;
}

/**
 * Get remaining time in seconds
 */
export function getRemainingTimeSeconds(startedAt: string, timeLimitMinutes: number): number {
  const started = new Date(startedAt);
  const expires = new Date(started.getTime() + timeLimitMinutes * 60 * 1000);
  const remaining = Math.max(0, expires.getTime() - new Date().getTime());
  return Math.floor(remaining / 1000);
}
