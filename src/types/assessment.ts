import { Difficulty, QuestionCategory, TCODomain } from "./exam";
import type { Question } from "./exam";

// Re-export runtime values and types that components/tests expect
export { Difficulty, QuestionCategory, TCODomain };
export const QuestionDifficulty = Difficulty; // runtime alias used in some tests
export type QuestionDifficulty = typeof Difficulty[keyof typeof Difficulty];
export type { Question };

// Assessment Types - Updated to match component usage
export type AssessmentType =
  | "practice"
  | "mock-exam"
  | "domain-specific"
  | "adaptive"
  | "domain-test"
  | "module-quiz"
  | "practice-test";

// Assessment Session Types
export interface AssessmentSession {
  id: string;
  moduleId?: string;
  domain?: TCODomain;
  questions: Question[];
  // runtime code treats responses as map/object or array in different places
  responses?: any;
  startTime: Date;
  endTime?: Date;
  status: "in_progress" | "completed" | "abandoned" | "paused";
  timeLimit?: number; // minutes - Added missing property
  config?: AssessmentConfig;
  // Add missing property that tests expect
  type?: string;
  // Backwards-compatible fields used in several hooks/components
  assessmentId?: string;
  userId?: string;
  answers?: AssessmentResponse[]; // alias for responses
  currentQuestionIndex?: number;
  score?: number | null;
  passed?: boolean | null;
  completedAt?: Date | null;
  // Legacy-friendly summary fields sometimes expected in tests/components
  overallScore?: number;
  totalQuestions?: number;
  correctAnswers?: number;
  timeSpent?: number;
}

export interface AssessmentSessionData {
  id: string;
  moduleId?: string;
  domain: TCODomain;
  questions: Question[];
  responses: any;
  startTime: Date;
  endTime?: Date;
  status: "in_progress" | "completed" | "abandoned" | "paused";
  timeLimit?: number;
  config: AssessmentConfig;
  // Compatibility aliases
  sessionId?: string;
  answers?: AssessmentResponse[];
}

export interface AssessmentConfig {
  type?:
    | "practice"
    | "mock-exam"
    | "domain-specific"
    | "adaptive"
    | "domain-test"
    | "module-quiz"
    | "practice-test";
  moduleId?: string;
  domainFilter?: string[];
  questionCount: number;
  timeLimit?: number; // minutes
  userId?: string; // For tracking and analytics
  assessmentId?: string; // For session management
  passingScore?: number; // 0.0 to 1.0
  passThreshold?: number; // 0.0-1.0 (e.g., 0.8 = 80%) - legacy
  allowReview?: boolean;
  showExplanations?: boolean;
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  adaptiveDifficulty?: boolean;
  enableAnalytics?: boolean;
  difficulty?: QuestionDifficulty; // Added missing property
  assessmentType?: string; // Add for backward compatibility
  // Flags used by tests/components
  showFeedback?: boolean;
  shuffleQuestions?: boolean;
  shuffleAnswers?: boolean;
}

export interface AssessmentResponse {
  questionId: string;
  selectedAnswer: string | string[]; // string for single choice, array for multiple
  // Backwards/legacy field used in some callers
  selectedAnswers?: string | string[];
  // Track attempt count when multiple submissions allowed
  attempts?: number;
  isCorrect: boolean;
  timeSpent: number; // seconds
  timestamp: Date;
  confidence?: 1 | 2 | 3 | 4 | 5; // Optional confidence rating
}

// Legacy alias that components expect
export type QuestionResponse = AssessmentResponse;
export type QuestionAnswer = AssessmentResponse;

// Assessment Results and Scoring
export interface AssessmentResult {
  sessionId: string;
  moduleId?: string;
  domain?: TCODomain;
  score?: AssessmentScore;
  overallScore: number; // Overall percentage score
  performance?: PerformanceMetrics;
  remediation: RemediationPlan;
  passed: boolean;
  completedAt: Date;
  passingScore?: number;
  averageTimePerQuestion?: number; // Added for analytics
  // Optional identifiers and analytics used in tests
  userId?: string;
  assessmentId?: string;
  // Optional alias fields used by some UI components
  totalTime?: number; // Add this property
  correctAnswers?: number; // Ensure this is consistently typed as number
  incorrectAnswers?: number;
  totalQuestions?: number;
  timeSpent?: number;
  assessmentType?: string;
  domainBreakdown?: Record<string, { score: number; correct: number; total: number }>;
  objectiveBreakdown?: Record<string, { score?: number; correct: number; total: number }>;
  assessment?: { type: string };
  remediationPlan?: RemediationPlan;
  // analytics object used in some tests and telemetry
  analytics?: AssessmentAnalytics;
  // per-question detailed results used by some reporting code
  questionResults?: Array<{ questionId: string; isCorrect: boolean; selectedAnswer?: string | string[] }>;
  // Add missing property that tests expect
  performanceMetrics?: {
    timeEfficiency: number;
    difficultyConsistency: number;
    confidenceAlignment: number;
  };
}

export interface AssessmentScore {
  correct: number;
  total: number;
  percentage: number;
  weightedScore: number; // Considers question weights/difficulty
  domainBreakdown: DomainScoreBreakdown[];
  objectiveBreakdown: ObjectiveScoreBreakdown[];
}

export interface DomainScoreBreakdown {
  domain: TCODomain;
  correct: number;
  total: number;
  percentage: number;
}

export interface ObjectiveScoreBreakdown {
  objectiveId: string;
  objectiveName: string;
  correct: number;
  total: number;
  percentage: number;
  mastery: "poor" | "developing" | "proficient" | "mastery";
}

export interface PerformanceMetrics {
  totalTime: number; // seconds
  averageTimePerQuestion: number;
  fastestQuestion: number;
  slowestQuestion: number;
  confidenceAlignment: number; // Correlation between confidence and correctness
  difficultyProgression: DifficultyAnalysis;
}

export interface DifficultyAnalysis {
  beginnerAccuracy: number;
  intermediateAccuracy: number;
  advancedAccuracy: number;
  suggestedLevel: QuestionDifficulty;
}

// Remediation System
export interface RemediationPlan {
  overallRecommendation: string | RemediationAction;
  objectiveRemediation: ObjectiveRemediation[];
  studyPlan: StudyPlanItem[];
  retakeEligibility: RetakeEligibility | boolean;
  // Optional convenience structure used by UI variants
  priorityObjectives?: Array<{
    objectiveId: string;
    gap?: string;
    recommendation?: string;
    priority?: "high" | "medium" | "low";
    reasoning?: string;
    resources?: string[];
    estimatedStudyTime?: number; // hours
  }>;
  estimatedStudyTime?: number; // hours
  canRetake?: boolean;
  // Add properties that tests expect
  weakAreas?: string[];
  recommendedStudyTime?: number;
  suggestedResources?: Array<{
    type: string;
    title: string;
    url: string;
    estimatedTime: number;
  }>;
  // Allow authoring code to include next steps without strict rejection
  nextSteps?: Array<string | { title: string; description?: string; link?: string }>;
    // Optional target date suggested for retake planning
    targetRetakeDate?: Date;
}

export interface RemediationAction {
  type: "review_content" | "practice_more" | "retake_assessment" | "seek_help" | "continue";
  priority: "low" | "medium" | "high" | "critical";
  description: string;
  estimatedTime: number; // minutes
}

export interface ObjectiveRemediation {
  objectiveId: string;
  objectiveName: string;
  status: "mastered" | "needs_review" | "needs_practice" | "critical_gap";
  recommendedActions: RemediationAction[];
  resourceLinks: StudyResource[];
  practiceQuestionCount: number;
}

export interface StudyResource {
  type: "module_section" | "external_link" | "lab_exercise" | "video" | "documentation";
  title: string;
  url: string;
  estimatedTime: number;
  priority: "high" | "medium" | "low";
}

export interface StudyPlanItem {
  order: number;
  title: string;
  description: string;
  type: "review" | "practice" | "lab" | "assessment";
  estimatedTime?: number;
  moduleId?: string;
  objectiveIds?: string[];
  completed?: boolean;
  // Add missing property that tests expect
  day?: number;
  activities?: Array<{
    type: string;
    content: string;
    duration: number;
  }>;
  domain?: TCODomain; // Add domain property
  priority?: "high" | "medium" | "low"; // Add priority property
  // Optional study resources and suggested practice items
  resources?: string[];
  practiceQuestions?: string[];
}

export interface RetakeEligibility {
  eligible: boolean;
  waitPeriod: number; // hours before retake allowed
  maxAttempts: number;
  currentAttempt: number;
  nextRetakeTime?: Date;
}

// Review Mode
export interface ReviewSession {
  assessmentSessionId: string;
  questions: ReviewQuestion[];
  mode: "explanation" | "interactive" | "focused_review";
  progressTracking: ReviewProgress;
}

export interface ReviewQuestion {
  question: Question;
  response: AssessmentResponse;
  showExplanation: boolean;
  showReferences: boolean;
  notes?: string;
  bookmarked?: boolean;
  understood?: boolean;
}

export interface ReviewProgress {
  questionsReviewed: number;
  totalQuestions: number;
  incorrectQuestionsReviewed: number;
  totalIncorrectQuestions: number;
  timeSpent: number;
  notesCreated: number;
}

// Assessment Analytics
export interface AssessmentAnalytics {
  sessionId?: string;
  userId?: string;
  events?: AssessmentEvent[];
  performance?: AnalyticsMetrics;
  averageTimePerQuestion?: number;
  fastestQuestion?: number;
  slowestQuestion?: number;
  difficultyProgression?: number[];
  confidenceScore?: number;
  guessedAnswers?: number;
  engagement?: EngagementMetrics;
}

export interface AssessmentEvent {
  // Use a free-form string type for event types to reduce strict mismatches
  type: string;
  timestamp: Date;
  questionId?: string;
  data?: Record<string, any>;
}

export interface AnalyticsEvent extends AssessmentEvent {
  // Define AnalyticsEvent extending AssessmentEvent - make DB fields optional
  event_id?: string;
  user_id?: string;
  // Allow callers to use camelCase userId/sessionId as well
  userId?: string;
  session_id?: string;
  sessionId?: string;
  created_at?: Date;
  event_data?: Record<string, any>;
}

export interface AnalyticsMetrics {
  responsePatterns: ResponsePatternAnalysis;
  learningCurve: LearningCurveData;
  knowledgeGaps: KnowledgeGapAnalysis;
  improvementAreas: ImprovementArea[];
}

export interface ResponsePatternAnalysis {
  quickAnswers: number; // Answers given very quickly (may indicate guessing)
  thoughtfulAnswers: number; // Answers with appropriate time consideration
  revisedAnswers: number; // Answers that were changed before submission
  confidenceMisalignment: number; // Cases where confidence doesn't match correctness
}

export interface LearningCurveData {
  initialScore: number;
  progressionRate: number; // Score improvement per session
  plateauDetection: boolean; // Whether learning has plateaued
  recommendedInterventions: string[];
}

export interface KnowledgeGapAnalysis {
  conceptualGaps: ConceptGap[];
  proceduralGaps: ProceduralGap[];
  applicationGaps: ApplicationGap[];
}

export interface ConceptGap {
  concept: string;
  severity: "minor" | "moderate" | "major";
  relatedObjectives: string[];
  remediationStrategy: string;
}

export interface ProceduralGap {
  procedure: string;
  stepsMissed: string[];
  commonErrors: string[];
  practiceRecommendations: string[];
}

export interface ApplicationGap {
  scenario: string;
  difficulty: QuestionDifficulty;
  skillsRequired: string[];
  recommendedExercises: string[];
}

export interface ImprovementArea {
  area: string;
  currentLevel: number; // 0-100
  targetLevel: number;
  actionItems: string[];
  timeline: number; // days to improvement
}

export interface EngagementMetrics {
  attentionScore: number; // Based on time patterns and interactions
  effortLevel: "low" | "medium" | "high";
  frustrationIndicators: FrustrationIndicator[];
  motivationFactors: MotivationFactor[];
}

export interface FrustrationIndicator {
  type: "rapid_clicking" | "long_pauses" | "answer_cycling" | "help_seeking";
  frequency: number;
  contextualFactors: string[];
}

export interface MotivationFactor {
  type: "achievement" | "progress" | "challenge" | "social";
  strength: number; // 0-100
  triggers: string[];
}

// User Analytics Types
export interface UserAnalytics {
  userId: string;
  totalAssessments: number;
  averageScore: number;
  timeSpent: number; // total time in minutes
  lastActivity?: Date;
  completionRate?: number;
  domainScores?: Record<TCODomain, number>;
  learningVelocity?: number; // improvement rate over time
  consistency?: number; // how regularly they study
}

// Content Analytics Types
export interface ContentAnalytics {
  contentId: string;
  contentType: "module" | "section" | "assessment" | "question";
  engagementMetrics: {
    views: number;
    totalQuestions?: number;
    correctAnswers?: number;
  domainScores?: Record<TCODomain, any>;
    streak?: number;
    lastSession?: Date;
    averageScore?: number;
    difficultySuitability: number;
    moduleProgress?: Record<
      string,
      {
        questionsAttempted?: number;
        questionsCorrect?: number;
        accuracy?: number;
        lastAttempt?: Date;
      }
    >;
    assessmentScores?: Record<string, number>;
    studyStreak?: number;
    sessionCount?: number;
    achievements?: string[];

    };
  };

