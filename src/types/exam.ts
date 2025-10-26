// Core exam system types
export interface Question {
  id: string;
  question: string;
  choices: Choice[];
  options?: Choice[]; // Alias for choices - components expect this
  correctAnswerId: string;
  correctAnswer?: string; // Legacy property some components expect
  domain: TCODomain;
  difficulty: Difficulty;
  category: QuestionCategory;
  explanation?: string;
  tags?: string[];
  studyGuideRef?: string;
  officialRef?: string;
  reference?: string; // Additional reference property
  consoleSteps?: string[];
  context?: string; // Additional context property that components expect
  createdAt?: Date; // Add createdAt property
  updatedAt?: Date; // Add updatedAt property
  points?: number; // Add points property

  // p6: Module-specific targeting tags
  moduleId?: string;
  objectiveIds?: string[];
  objectiveId?: string; // Add this for backward compatibility
  practiceWeight?: number; // For balanced question distribution
  conceptLevel?: "fundamental" | "intermediate" | "advanced"; // Granular difficulty

  // Review functionality
  userAnswer?: string;
  timestamp?: Date;
  reviewed?: boolean;
}

export interface Choice {
  id: string;
  text: string;
}

// Core TCO Domain enum - only the values actually used in the codebase
export const TCODomain = {
  // Short codes (legacy import scripts and data refer to these)
  AQ: "Asking Questions",
  RQ: "Refining Questions & Targeting",
  TA: "Taking Action",
  NB: "Navigation and Basic Module Functions",
  RD: "Report Generation and Data Export",
  // Long-form keys for readability
  ASKING_QUESTIONS: "Asking Questions",
  REFINING_QUESTIONS: "Refining Questions",
  REFINING_TARGETING: "Refining Questions & Targeting",
  TAKING_ACTION: "Taking Action",
  NAVIGATION_MODULES: "Navigation and Basic Module Functions",
  // Backwards-compatible alias used in older data files and imports
  NAVIGATION_BASIC_MODULE_FUNCTIONS: "Navigation and Basic Module Functions",
  REPORTING_EXPORT: "Report Generation and Data Export",
  // Alternate legacy key used in some imports
  REPORTING_DATA_EXPORT: "Report Generation and Data Export",
  SECURITY: "Security",
  FUNDAMENTALS: "Fundamentals",
  TROUBLESHOOTING: "Troubleshooting",
} as const;

export type TCODomain = typeof TCODomain[keyof typeof TCODomain];

/**
 * Database domain format (snake_case) aligned with content population schema
 * Used by: flashcard_library, questions (with domain field), mock exam builder
 */
export type DatabaseDomain =
  | 'asking_questions'
  | 'refining_targeting'
  | 'taking_action'
  | 'navigation'
  | 'reporting'
  | 'troubleshooting';

// Official TCO Exam Domain Weightings - using core enum only
export const TCO_DOMAIN_WEIGHTS: Record<TCODomain, number> = {
  [TCODomain.ASKING_QUESTIONS]: 22,
  [TCODomain.REFINING_QUESTIONS]: 23,
  [TCODomain.REFINING_TARGETING]: 23,
  [TCODomain.TAKING_ACTION]: 15,
  [TCODomain.NAVIGATION_MODULES]: 23,
  [TCODomain.REPORTING_EXPORT]: 17,
  [TCODomain.SECURITY]: 10, // Example weight, adjust as needed
  [TCODomain.FUNDAMENTALS]: 15, // Example weight, adjust as needed
  [TCODomain.TROUBLESHOOTING]: 12, // Example weight, adjust as needed
};

// Question categories for better organization
export const QuestionCategory = {
  PLATFORM_FUNDAMENTALS: "Platform Fundamentals",
  CONSOLE_PROCEDURES: "Console Procedures",
  TROUBLESHOOTING: "Troubleshooting",
  PRACTICAL_SCENARIOS: "Practical Scenarios",
  LINEAR_CHAIN: "Linear Chain Architecture",
} as const;

export type QuestionCategory = typeof QuestionCategory[keyof typeof QuestionCategory];

export const Difficulty = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
  // lowercase aliases for backward-compatible code that expects 'beginner' etc.
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
} as const;

export type Difficulty = typeof Difficulty[keyof typeof Difficulty];

// Backwards-compatible alias
export type QuestionDifficulty = Difficulty;

export enum ExamMode {
  PRACTICE = "practice",
  MOCK = "mock",
  REVIEW = "review",
}

export interface ExamSession {
  id: string;
  mode: ExamMode;
  questions: Question[];
  currentIndex: number;
  answers: Record<string, string>;
  startTime: Date;
  endTime?: Date;
  score?: number;
  completed: boolean;
}

export interface UserProgress {
  totalQuestions?: number;
  correctAnswers?: number;
  domainScores?: Record<TCODomain, DomainScore>;
  streak?: number;
  lastSession?: Date;
  averageScore?: number;
  // Additional properties that components expect
  moduleProgress?: Record<
    string,
    {
      questionsAttempted: number;
      questionsCorrect: number;
      accuracy: number;
      lastAttempt: Date;
    }
  >;
  assessmentScores?: Record<string, number>;
  studyStreak?: number;
  sessionCount?: number;
  achievements?: string[];
}

// p6: Question filtering and targeting types
export interface QuestionFilter {
  domains?: TCODomain[];
  difficulties?: Difficulty[];
  categories?: QuestionCategory[];
  tags?: string[];
  moduleIds?: string[];
  objectiveIds?: string[];
  conceptLevels?: Array<"fundamental" | "intermediate" | "advanced">;
  limit?: number;
  maintainDistribution?: boolean;
}

export interface QuestionPool {
  questions: Question[];
  totalCount: number;
  domainDistribution: Record<string, number>;
  difficultyDistribution: Record<string, number>;
  isEmpty: boolean;
  hasMinimumQuestions: boolean;
  recommendedFallback?: "expand-criteria" | "use-similar-modules" | "mixed-content";
}

export interface PracticeTargeting {
  moduleId: string;
  primaryDomain: TCODomain;
  targetObjectives: string[];
  requiredTags: string[];
  optionalTags: string[];
  minQuestions: number;
  idealQuestions: number;
  fallbackStrategy: "expand-domain" | "reduce-specificity" | "mixed-content";
}

export interface DomainScore {
  total: number;
  correct: number;
  percentage: number;
  lastPracticed: Date;

  // p6: Enhanced domain tracking for module integration
  moduleProgress?: Record<
    string,
    {
      questionsAttempted: number;
      questionsCorrect: number;
      accuracy: number;
      lastAttempt: Date;
    }
  >;
}
