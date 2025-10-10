/**
 * Mock Exam Configuration Templates
 *
 * Defines 6 progressive mock exams for TCO certification preparation.
 * These templates are used to dynamically generate exams from the question bank.
 *
 * INTEGRATION NOTES:
 * - Exam attempts are tracked in existing 'exam_sessions' table
 * - Questions are selected dynamically from 'questions' table based on criteria
 * - No database tables needed - templates stored in code for flexibility
 */

import { TCODomain } from '@/types/exam';

// =====================================================
// TYPES
// =====================================================

/**
 * Mock exam difficulty levels
 */
export type MockExamDifficulty =
  | 'diagnostic'
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'pre_exam'
  | 'final_challenge';

/**
 * Question difficulty distribution
 */
export interface DifficultyDistribution {
  easy: number; // Percentage
  medium: number; // Percentage
  hard: number; // Percentage
}

/**
 * TCO domain distribution (aligned with exam blueprint)
 */
export interface DomainDistribution {
  asking_questions: number; // Percentage (22% in actual exam)
  refining_targeting: number; // Percentage (23% in actual exam)
  taking_action: number; // Percentage (15% in actual exam)
  navigation: number; // Percentage (23% in actual exam)
  reporting: number; // Percentage (17% in actual exam)
}

/**
 * Mock exam template configuration
 */
export interface MockExamTemplate {
  id: string;
  name: string;
  description: string;

  // Exam specifications
  totalQuestions: number;
  timeLimitMinutes: number;
  passingScorePercentage: number;

  // Difficulty
  difficultyLevel: MockExamDifficulty;
  difficultyDistribution: DifficultyDistribution;

  // Domain alignment (TCO blueprint)
  domainDistribution: DomainDistribution;

  // Metadata
  orderIndex: number; // Recommended order for students
  isActive: boolean;

  // Recommendations
  recommendedWhen?: string; // When students should take this exam
  prerequisites?: string[]; // IDs of exams that should be completed first
}

// =====================================================
// TCO EXAM BLUEPRINT CONSTANTS
// =====================================================

/**
 * Official TCO exam blueprint domain weights
 * Source: Tanium TAN-1000 Certification Guide
 */
export const TCO_BLUEPRINT_WEIGHTS: DomainDistribution = {
  asking_questions: 22,
  refining_targeting: 23,
  taking_action: 15,
  navigation: 23,
  reporting: 17,
};

/**
 * Standard TCO exam specifications
 */
export const TCO_EXAM_SPECS = {
  TOTAL_QUESTIONS: 75,
  TIME_LIMIT_MINUTES: 105,
  PASSING_SCORE: 70,
} as const;

// =====================================================
// MOCK EXAM TEMPLATES
// =====================================================

/**
 * Mock Exam 1: Diagnostic Assessment
 * Purpose: Establish baseline knowledge
 * Difficulty: 60% easy, 30% medium, 10% hard
 */
export const MOCK_EXAM_1_DIAGNOSTIC: MockExamTemplate = {
  id: 'mock-exam-1-diagnostic',
  name: 'Mock Exam 1: Diagnostic Assessment',
  description:
    'Diagnostic exam to establish baseline knowledge. Focuses on fundamentals with mostly easier questions. Take this first to identify your strengths and weaknesses.',

  totalQuestions: TCO_EXAM_SPECS.TOTAL_QUESTIONS,
  timeLimitMinutes: TCO_EXAM_SPECS.TIME_LIMIT_MINUTES,
  passingScorePercentage: TCO_EXAM_SPECS.PASSING_SCORE,

  difficultyLevel: 'diagnostic',
  difficultyDistribution: {
    easy: 60,
    medium: 30,
    hard: 10,
  },

  domainDistribution: TCO_BLUEPRINT_WEIGHTS,

  orderIndex: 1,
  isActive: true,

  recommendedWhen: 'Start of your study journey (Day 1-3)',
  prerequisites: [],
};

/**
 * Mock Exam 2: Foundation Builder
 * Purpose: Build foundational knowledge
 * Difficulty: 50% easy, 40% medium, 10% hard
 */
export const MOCK_EXAM_2_FOUNDATION: MockExamTemplate = {
  id: 'mock-exam-2-foundation',
  name: 'Mock Exam 2: Foundation Builder',
  description:
    'Build foundational knowledge across all TCO domains. Balanced mix of easy and medium questions to reinforce core concepts.',

  totalQuestions: TCO_EXAM_SPECS.TOTAL_QUESTIONS,
  timeLimitMinutes: TCO_EXAM_SPECS.TIME_LIMIT_MINUTES,
  passingScorePercentage: TCO_EXAM_SPECS.PASSING_SCORE,

  difficultyLevel: 'beginner',
  difficultyDistribution: {
    easy: 50,
    medium: 40,
    hard: 10,
  },

  domainDistribution: TCO_BLUEPRINT_WEIGHTS,

  orderIndex: 2,
  isActive: true,

  recommendedWhen: 'After completing 30% of study material (Day 5-7)',
  prerequisites: ['mock-exam-1-diagnostic'],
};

/**
 * Mock Exam 3: Intermediate Challenge
 * Purpose: Test growing knowledge with complex scenarios
 * Difficulty: 40% easy, 45% medium, 15% hard
 */
export const MOCK_EXAM_3_INTERMEDIATE: MockExamTemplate = {
  id: 'mock-exam-3-intermediate',
  name: 'Mock Exam 3: Intermediate Challenge',
  description:
    'Test your growing knowledge with more complex scenarios. Increased difficulty to push your understanding beyond basics.',

  totalQuestions: TCO_EXAM_SPECS.TOTAL_QUESTIONS,
  timeLimitMinutes: TCO_EXAM_SPECS.TIME_LIMIT_MINUTES,
  passingScorePercentage: TCO_EXAM_SPECS.PASSING_SCORE,

  difficultyLevel: 'intermediate',
  difficultyDistribution: {
    easy: 40,
    medium: 45,
    hard: 15,
  },

  domainDistribution: TCO_BLUEPRINT_WEIGHTS,

  orderIndex: 3,
  isActive: true,

  recommendedWhen: 'After completing 50% of study material (Day 10-12)',
  prerequisites: ['mock-exam-2-foundation'],
};

/**
 * Mock Exam 4: Advanced Practice
 * Purpose: Deep understanding and troubleshooting
 * Difficulty: 30% easy, 50% medium, 20% hard
 */
export const MOCK_EXAM_4_ADVANCED: MockExamTemplate = {
  id: 'mock-exam-4-advanced',
  name: 'Mock Exam 4: Advanced Practice',
  description:
    'Advanced scenarios testing deep understanding and troubleshooting skills. Focuses on real-world application and edge cases.',

  totalQuestions: TCO_EXAM_SPECS.TOTAL_QUESTIONS,
  timeLimitMinutes: TCO_EXAM_SPECS.TIME_LIMIT_MINUTES,
  passingScorePercentage: TCO_EXAM_SPECS.PASSING_SCORE,

  difficultyLevel: 'advanced',
  difficultyDistribution: {
    easy: 30,
    medium: 50,
    hard: 20,
  },

  domainDistribution: TCO_BLUEPRINT_WEIGHTS,

  orderIndex: 4,
  isActive: true,

  recommendedWhen: 'After completing 75% of study material (Day 14-16)',
  prerequisites: ['mock-exam-3-intermediate'],
};

/**
 * Mock Exam 5: Pre-Exam Simulation
 * Purpose: Realistic exam simulation
 * Difficulty: 25% easy, 50% medium, 25% hard
 */
export const MOCK_EXAM_5_PRE_EXAM: MockExamTemplate = {
  id: 'mock-exam-5-pre-exam',
  name: 'Mock Exam 5: Pre-Exam Simulation',
  description:
    'Realistic exam simulation 1-2 weeks before your actual TCO exam. Full difficulty range matching real exam distribution.',

  totalQuestions: TCO_EXAM_SPECS.TOTAL_QUESTIONS,
  timeLimitMinutes: TCO_EXAM_SPECS.TIME_LIMIT_MINUTES,
  passingScorePercentage: TCO_EXAM_SPECS.PASSING_SCORE,

  difficultyLevel: 'pre_exam',
  difficultyDistribution: {
    easy: 25,
    medium: 50,
    hard: 25,
  },

  domainDistribution: TCO_BLUEPRINT_WEIGHTS,

  orderIndex: 5,
  isActive: true,

  recommendedWhen: '1-2 weeks before your scheduled TCO exam (Day 18-20)',
  prerequisites: ['mock-exam-4-advanced'],
};

/**
 * Mock Exam 6: Final Challenge
 * Purpose: Ultimate readiness test
 * Difficulty: 20% easy, 50% medium, 30% hard
 */
export const MOCK_EXAM_6_FINAL: MockExamTemplate = {
  id: 'mock-exam-6-final',
  name: 'Mock Exam 6: Final Challenge',
  description:
    'Most challenging mock exam. Tests mastery with complex, scenario-based questions. Pass this and you\'re exam-ready!',

  totalQuestions: TCO_EXAM_SPECS.TOTAL_QUESTIONS,
  timeLimitMinutes: TCO_EXAM_SPECS.TIME_LIMIT_MINUTES,
  passingScorePercentage: TCO_EXAM_SPECS.PASSING_SCORE,

  difficultyLevel: 'final_challenge',
  difficultyDistribution: {
    easy: 20,
    medium: 50,
    hard: 30,
  },

  domainDistribution: TCO_BLUEPRINT_WEIGHTS,

  orderIndex: 6,
  isActive: true,

  recommendedWhen: '2-3 days before your TCO exam (final confidence check)',
  prerequisites: ['mock-exam-5-pre-exam'],
};

// =====================================================
// MOCK EXAM COLLECTION
// =====================================================

/**
 * All mock exam templates in recommended order
 */
export const MOCK_EXAM_TEMPLATES: MockExamTemplate[] = [
  MOCK_EXAM_1_DIAGNOSTIC,
  MOCK_EXAM_2_FOUNDATION,
  MOCK_EXAM_3_INTERMEDIATE,
  MOCK_EXAM_4_ADVANCED,
  MOCK_EXAM_5_PRE_EXAM,
  MOCK_EXAM_6_FINAL,
];

/**
 * Get mock exam template by ID
 */
export function getMockExamTemplate(id: string): MockExamTemplate | undefined {
  return MOCK_EXAM_TEMPLATES.find((template) => template.id === id);
}

/**
 * Get next recommended mock exam based on completed exams
 */
export function getNextRecommendedExam(
  completedExamIds: string[]
): MockExamTemplate | null {
  // Find first exam that hasn't been completed
  for (const template of MOCK_EXAM_TEMPLATES) {
    if (!completedExamIds.includes(template.id)) {
      // Check if prerequisites are met
      const prereqsMet = template.prerequisites?.every((prereqId) =>
        completedExamIds.includes(prereqId)
      );
      if (prereqsMet || !template.prerequisites?.length) {
        return template;
      }
    }
  }
  return null; // All exams completed
}

/**
 * Calculate question count per domain based on distribution
 */
export function calculateDomainQuestionCounts(
  template: MockExamTemplate
): Record<TCODomain, number> {
  const { totalQuestions, domainDistribution } = template;

  return {
    asking_questions: Math.round(
      (domainDistribution.asking_questions / 100) * totalQuestions
    ),
    refining_targeting: Math.round(
      (domainDistribution.refining_targeting / 100) * totalQuestions
    ),
    taking_action: Math.round((domainDistribution.taking_action / 100) * totalQuestions),
    navigation: Math.round((domainDistribution.navigation / 100) * totalQuestions),
    reporting: Math.round((domainDistribution.reporting / 100) * totalQuestions),
  };
}

/**
 * Calculate question count per difficulty based on distribution
 */
export function calculateDifficultyQuestionCounts(
  template: MockExamTemplate
): Record<'easy' | 'medium' | 'hard', number> {
  const { totalQuestions, difficultyDistribution } = template;

  return {
    easy: Math.round((difficultyDistribution.easy / 100) * totalQuestions),
    medium: Math.round((difficultyDistribution.medium / 100) * totalQuestions),
    hard: Math.round((difficultyDistribution.hard / 100) * totalQuestions),
  };
}

/**
 * Get exam readiness recommendation based on score
 */
export function getReadinessRecommendation(
  examId: string,
  scorePercentage: number
): {
  message: string;
  nextAction: string;
  isReady: boolean;
} {
  const template = getMockExamTemplate(examId);
  if (!template) {
    return {
      message: 'Unknown exam',
      nextAction: 'Continue studying',
      isReady: false,
    };
  }

  // Final exam readiness check
  if (template.difficultyLevel === 'final_challenge') {
    if (scorePercentage >= 85) {
      return {
        message: '🎉 Excellent! You\'re fully prepared for the TCO exam!',
        nextAction: 'Schedule your certification exam with confidence',
        isReady: true,
      };
    } else if (scorePercentage >= 75) {
      return {
        message: 'Good score! You\'re nearly ready for the TCO exam.',
        nextAction: 'Review weak areas and retake this exam',
        isReady: true,
      };
    } else {
      return {
        message: 'You need more preparation before the actual exam.',
        nextAction: 'Review missed questions and retake Mock Exam 4-5',
        isReady: false,
      };
    }
  }

  // Progressive exam recommendations
  if (scorePercentage >= 80) {
    return {
      message: `Great job on ${template.name}! You're ready to progress.`,
      nextAction: 'Move to the next mock exam',
      isReady: true,
    };
  } else if (scorePercentage >= 70) {
    return {
      message: `You passed ${template.name}, but there's room for improvement.`,
      nextAction: 'Review weak areas, then proceed to next exam',
      isReady: true,
    };
  } else {
    return {
      message: `You didn't pass ${template.name}. Don't worry - this is a learning opportunity!`,
      nextAction: 'Review missed questions and retake this exam',
      isReady: false,
    };
  }
}
