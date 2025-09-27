/**
 * Comprehensive Types Index
 * Centralized export for all application types to resolve import issues
 */

// Import types for use within this file
import type { AssessmentConfig } from "./assessment";
import type {
  Difficulty,
  Question,
  QuestionCategory,
  QuestionFilter,
  TCODomain,
  UserProgress,
} from "./exam";
import type { LearningFlowContext } from "./learning-flow";
import type { ModuleProgress } from "./module";
import type { PracticeSession } from "./practice-session";
import type { StudyModule } from "./study";

// Core Exam Types
export { Difficulty, ExamMode, QuestionCategory, TCODomain, TCO_DOMAIN_WEIGHTS } from "./exam";
export type {
  Choice,
  DomainScore,
  ExamSession,
  PracticeTargeting,
  Question,
  QuestionFilter,
  QuestionPool,
  UserProgress,
} from "./exam";

// Assessment Types
export { QuestionDifficulty } from "./assessment";
export type {
  AnalyticsMetrics,
  ApplicationGap,
  AssessmentAnalytics,
  AssessmentConfig,
  AssessmentEvent,
  AssessmentResponse,
  AssessmentResult,
  AssessmentScore,
  AssessmentSession,
  AssessmentType,
  ConceptGap,
  ContentAnalytics,
  DifficultyAnalysis,
  DomainScoreBreakdown,
  EngagementMetrics,
  FrustrationIndicator,
  ImprovementArea,
  KnowledgeGapAnalysis,
  LearningCurveData,
  MotivationFactor,
  ObjectiveRemediation,
  ObjectiveScoreBreakdown,
  PerformanceMetrics,
  ProceduralGap,
  QuestionResponse,
  RemediationAction,
  RemediationPlan,
  ResponsePatternAnalysis,
  RetakeEligibility,
  ReviewProgress,
  ReviewQuestion,
  ReviewSession,
  StudyPlanItem,
  StudyResource,
  UserAnalytics,
} from "./assessment";

// Study Content Types
export {
  DEFAULT_STUDY_CONFIG,
  DOMAIN_FILE_MAPPING,
  LEGACY_DOMAIN_MAPPING,
  PlaybookCategory,
  ReferenceType,
  ScenarioDifficulty,
  SkillLevel,
  StudyProgressStatus,
  StudySectionType,
} from "./study";
export type {
  ConsoleProcedure,
  ExamPrepSection,
  LearningObjective,
  OperatorPlaybook,
  PlaybookItem,
  PracticeScenario,
  ProcedureStep,
  StudyBookmark,
  StudyModeConfig,
  StudyModule,
  StudyReference,
  StudySection,
  TroubleshootingGuide,
  UserStudyProgress,
} from "./study";

// Module Types
export type { ModuleProgress, ModuleSection } from "./module";

// Define missing module types
export interface Module {
  id: string;
  title: string;
  description: string;
  domain: TCODomain;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: number;
  objectives: ModuleObjective[];
  sections: Array<{ id: string; title: string }>;
  prerequisites?: string[];
  resources?: string[];
}

export interface ModuleObjective {
  id: string;
  description: string;
  completed?: boolean;
}

// Context Types - Define here to resolve import issues
export interface ModuleContextType {
  modules: Module[];
  moduleProgress: Record<string, ModuleProgress>;
  currentModule: Module | null;
  user?: UserProgress; // Add user property that components expect

  // Study guides compatibility
  state?: {
    studyGuides: StudyModule[];
  };
  loadStudyGuides?: (guides: StudyModule[]) => void;
  setCurrentGuide?: (guide: StudyModule) => void;
  updateGuideProgress?: (guideId: string, progress: ModuleProgress) => void;

  // Module management
  startModule: (moduleId: string) => void;
  completeModule: (moduleId: string) => void;
  updateModuleProgress: (moduleId: string, progress: ModuleProgress) => void;
  completeObjective: (moduleId: string, objectiveId: string) => void;
  uncompleteObjective: (moduleId: string, objectiveId: string) => void;

  // Navigation
  setCurrentModule: (module: Module | null) => void;
  getNextModule: (currentModuleId: string) => Module | null;
  getPreviousModule: (currentModuleId: string) => Module | null;

  // Filtering
  getModulesByDomain: (domain: TCODomain) => Module[];
  getModulesByDifficulty: (difficulty: Difficulty) => Module[];
  getCompletedModules: () => Module[];
  getInProgressModules: () => Module[];
  getNotStartedModules: () => Module[];

  // Statistics
  getOverallProgress: () => UserProgress;

  // Persistence
  exportProgress: () => string;
  importProgress: (data: string) => boolean;
  resetProgress: () => void;

  // Learning flows
  learningFlows?: Record<string, LearningFlowContext>;
  startLearningFlow?: (moduleId: string) => Promise<LearningFlowContext>;
  getLearningFlow?: (moduleId: string) => Promise<LearningFlowContext | null>;
  updateLearningFlow?: (moduleId: string, flowState: LearningFlowContext) => Promise<void>;
  resetLearningFlow?: (moduleId: string) => Promise<void>;
}

export interface QuestionsContextType {
  questions: Question[];
  loading: boolean;
  error: string | null;
  totalQuestions: number;

  // Fetch methods
  refreshQuestions: (forceRefresh?: boolean) => Promise<void>;
  getQuestionsByDomain: (domain: TCODomain) => Promise<Question[]>;
  getQuestionsByDifficulty: (difficulty: Difficulty) => Promise<Question[]>;
  getQuestionsByCategory: (category: QuestionCategory) => Promise<Question[]>;
  getQuestionsWithFilters: (filters: QuestionFilter) => Promise<Question[]>;
  searchQuestionsByText: (searchText: string) => Promise<Question[]>;
  getAssessmentQuestions?: (config: AssessmentConfig) => Promise<Question[]>; // Add missing method

  // Utility methods
  getRandomQuestions: (count: number, filters?: QuestionFilter) => Question[];
  getQuestionById: (id: string) => Question | undefined;

  // Statistics
  domainDistribution: Record<TCODomain, number>;
  difficultyDistribution: Record<Difficulty, number>;
  categoryDistribution: Record<QuestionCategory, number>;
}

// Practice Session Types
export { PracticeSessionState } from "./practice-session";
export type {
  PracticeProgress,
  PracticeSession,
  PracticeSessionConfig,
  PracticeSessionSummary,
} from "./practice-session";

// Learning Flow Types
export {
  DEFAULT_GATING_RULES,
  LearningFlowEvent,
  MasteryLevel,
  STATE_TRANSITIONS,
} from "./learning-flow";
export type {
  AssessPhaseProgress,
  BoundaryNavigationGuard,
  FlowProgressPersistence,
  FlowStateMachine,
  FlowTelemetry,
  FlowValidation,
  FlowValidationError,
  FlowValidationWarning,
  LearnPhaseProgress,
  LearningFlowContext,
  LearningFlowMetadata,
  LearningFlowState,
  PracticePhaseProgress,
  TopicMastery,
} from "./learning-flow";

// Database Types
export type { Database } from "./database.types";

// Supabase Types
export type { Database as SupabaseDatabase } from "./supabase";

// Module-specific exports
export type {
  BloomsLevel,
  CheckpointFeedback,
  CheckpointType,
  DOMAIN_MODULE_MAPPING,
  ExerciseStep,
  InteractiveCheckpoint,
  LearningModule,
  MODULE_DOMAIN_MAPPING,
  ModuleAssessment,
  ModuleCertificate,
  ModuleDifficulty,
  ModuleResource,
  PathDifficulty,
  PracticalExercise,
  QuizChoice,
  QuizQuestion,
  ResourceType,
  RetakePolicy,
  SectionExample,
  SectionQuiz,
  SectionType,
  StudyPath,
  ValidationCriteria,
  ValidationType,
} from "./modules";

// Add missing enum values that components expect
export enum Status {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  PAUSED = "paused",
  ABANDONED = "abandoned",
}

// Add missing difficulty enum that includes EXPERT
export enum DifficultyLevel {
  BEGINNER = "Beginner",
  INTERMEDIATE = "Intermediate",
  ADVANCED = "Advanced",
  EXPERT = "Expert",
}

// Component Props Types (commonly used)
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface BadgeProps extends BaseComponentProps {
  variant?: "default" | "secondary" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
}

export interface TooltipProps extends BaseComponentProps {
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

// Practice Session Summary Props
export interface PracticeSessionSummaryProps {
  session: PracticeSession;
  onRestart?: () => void;
  onClose?: () => void;
}

// Re-export commonly used types with aliases for backward compatibility
export type QuestionType = Question;
export type AssessmentStatus = Status;
export type ModuleStatus = Status;
