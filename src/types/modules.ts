import { TCODomain } from "./exam";

/**
 * Learning Module System Types
 * Comprehensive module system for TCO certification preparation
 */

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  estimatedTime: string;
  domain: TCODomain;
  prerequisites: string[];
  objectives: LearningObjective[];
  sections: ModuleSection[];
  assessment: ModuleAssessment;
  resources: ModuleResource[];
  tags: string[];
  difficulty: ModuleDifficulty;
  order: number;
  isRequired: boolean;
}

export interface LearningObjective {
  id: string;
  description: string;
  bloomsLevel: BloomsLevel;
  assessmentCriteria: string[];
  estimatedTime: number;
  skills: string[];
}

export interface ModuleSection {
  id: string;
  title: string;
  content: string;
  type: SectionType;
  estimatedTime: number;
  keyPoints: string[];
  examples?: SectionExample[];
  checkpoints?: InteractiveCheckpoint[];
  quiz?: SectionQuiz;
  practicalExercise?: PracticalExercise;
}

export interface SectionExample {
  id: string;
  title: string;
  description: string;
  code?: string;
  screenshot?: string;
  steps?: string[];
  outcome: string;
}

export interface InteractiveCheckpoint {
  id: string;
  type: CheckpointType;
  question: string;
  feedback: CheckpointFeedback;
  requiredForProgress: boolean;
}

export interface CheckpointFeedback {
  correct: string;
  incorrect: string;
  hint?: string;
}

export interface SectionQuiz {
  id: string;
  questions: QuizQuestion[];
  passingScore: number;
  maxAttempts: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  choices: QuizChoice[];
  correctId: string;
  explanation: string;
  points: number;
}

export interface QuizChoice {
  id: string;
  text: string;
}

export interface PracticalExercise {
  id: string;
  title: string;
  description: string;
  instructions: ExerciseStep[];
  expectedOutcome: string;
  validationCriteria: ValidationCriteria[];
  resources: string[];
}

export interface ExerciseStep {
  id: string;
  instruction: string;
  expectedAction: string;
  screenshot?: string;
  verification?: string;
}

export interface ValidationCriteria {
  id: string;
  description: string;
  validationType: ValidationType;
  expectedValue?: string;
  tolerance?: number;
}

export interface ModuleAssessment {
  id: string;
  type: AssessmentType;
  questionCount: number;
  passingScore: number;
  timeLimit?: number;
  retakePolicy: RetakePolicy;
  questions: string[]; // Question IDs from question bank
}

export interface ModuleResource {
  id: string;
  title: string;
  type: ResourceType;
  url: string;
  description: string;
  isExternal: boolean;
  tags: string[];
}

export interface ModuleProgress {
  moduleId: string;
  status: ModuleStatus;
  completionPercentage: number;
  timeSpent: number;
  masteryScore: number;
  objectivesCompleted: string[];
  sectionsCompleted: string[];
  lastAccessed: string;
  attempts: number;
  bestScore?: number;
  certificates: ModuleCertificate[];
}

export interface ModuleCertificate {
  id: string;
  moduleId: string;
  earnedDate: string;
  score: number;
  validUntil?: string;
  credentialUrl?: string;
}

export interface StudyPath {
  id: string;
  name: string;
  description: string;
  modules: string[];
  estimatedDuration: string;
  difficulty: PathDifficulty;
  prerequisites: string[];
  outcomes: string[];
}

// Enums and Types
export enum ModuleDifficulty {
  FOUNDATION = "Foundation",
  INTERMEDIATE = "Intermediate",
  ADVANCED = "Advanced",
  EXPERT = "Expert",
}

export enum SectionType {
  OVERVIEW = "overview",
  CONCEPT = "concept",
  PROCEDURE = "procedure",
  PRACTICAL = "practical",
  REVIEW = "review",
  ASSESSMENT = "assessment",
}

export enum CheckpointType {
  KNOWLEDGE_CHECK = "knowledge-check",
  PRACTICAL_DEMO = "practical-demo",
  SELF_REFLECTION = "self-reflection",
  PEER_DISCUSSION = "peer-discussion",
}

export enum AssessmentType {
  KNOWLEDGE_CHECK = "knowledge-check",
  PRACTICAL_ASSESSMENT = "practical-assessment",
  COMPREHENSIVE_EXAM = "comprehensive-exam",
  PEER_REVIEW = "peer-review",
}

export enum ValidationType {
  EXACT_MATCH = "exact-match",
  CONTAINS = "contains",
  NUMERIC_RANGE = "numeric-range",
  REGEX = "regex",
  CUSTOM = "custom",
}

export enum ModuleStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  MASTERED = "mastered",
  NEEDS_REVIEW = "needs_review",
}

export enum ResourceType {
  ARTICLE = "article",
  VIDEO = "video",
  DOCUMENTATION = "documentation",
  INTERACTIVE = "interactive",
  DOWNLOADABLE = "downloadable",
  EXTERNAL_LINK = "external-link",
}

export enum BloomsLevel {
  REMEMBER = "remember",
  UNDERSTAND = "understand",
  APPLY = "apply",
  ANALYZE = "analyze",
  EVALUATE = "evaluate",
  CREATE = "create",
}

export enum PathDifficulty {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
}

export enum RetakePolicy {
  UNLIMITED = "unlimited",
  LIMITED_ATTEMPTS = "limited-attempts",
  COOLDOWN_PERIOD = "cooldown-period",
  NO_RETAKES = "no-retakes",
}

// Domain to Module Mapping
export const DOMAIN_MODULE_MAPPING: Record<TCODomain, string[]> = {
  [TCODomain.ASKING_QUESTIONS]: ["platform_basics", "interact"],
  [TCODomain.REFINING_QUESTIONS]: ["targeting_groups"],
  [TCODomain.REFINING_TARGETING]: ["targeting_groups"],
  [TCODomain.TAKING_ACTION]: ["packages_actions", "deploy_patch"],
  [TCODomain.NAVIGATION_MODULES]: ["content_management", "troubleshooting"],
  [TCODomain.REPORTING_EXPORT]: ["reporting_export"],
  [TCODomain.SECURITY]: ["security", "compliance"],
  [TCODomain.FUNDAMENTALS]: ["basics", "fundamentals"],
  [TCODomain.TROUBLESHOOTING]: ["troubleshooting", "debugging"],
};

// Module to Domain Mapping (reverse)
export const MODULE_DOMAIN_MAPPING: Record<string, TCODomain> = {
  platform_basics: TCODomain.ASKING_QUESTIONS,
  interact: TCODomain.ASKING_QUESTIONS,
  targeting_groups: TCODomain.REFINING_QUESTIONS,
  packages_actions: TCODomain.TAKING_ACTION,
  deploy_patch: TCODomain.TAKING_ACTION,
  content_management: TCODomain.NAVIGATION_MODULES,
  troubleshooting: TCODomain.NAVIGATION_MODULES,
  reporting_export: TCODomain.REPORTING_EXPORT,
  exam_strategy: TCODomain.ASKING_QUESTIONS, // Cross-cutting concerns
};

export default {
  DOMAIN_MODULE_MAPPING,
  MODULE_DOMAIN_MAPPING,
};
