/**
 * Learn → Practice → Assess Flow State Machine Types
 * p5: Core types and state definitions for educational flow
 */

import { ModuleProgress } from "./modules";

/**
 * Learning Flow State Machine
 * Three-phase educational progression with gating and telemetry
 */
export enum LearningFlowState {
  LEARN = "learn",
  PRACTICE = "practice",
  ASSESS = "assess",
  COMPLETED = "completed",
}

export enum LearningFlowEvent {
  START_LEARN = "start_learn",
  COMPLETE_LEARN = "complete_learn",
  START_PRACTICE = "start_practice",
  COMPLETE_PRACTICE = "complete_practice",
  START_ASSESS = "start_assess",
  COMPLETE_ASSESS = "complete_assess",
  FAIL_ASSESS = "fail_assess",
  RESET_FLOW = "reset_flow",
  RESUME_FLOW = "resume_flow",
}

export interface LearningFlowContext {
  moduleId: string;
  userId: string;
  currentState: LearningFlowState;
  startedAt: Date;
  completedAt?: Date;
  timeSpent: number;
  attempts: number;
  canProceed: boolean;
  metadata: LearningFlowMetadata;
}

export interface LearningFlowMetadata {
  learnProgress: LearnPhaseProgress;
  practiceProgress: PracticePhaseProgress;
  assessProgress: AssessPhaseProgress;
  telemetry: FlowTelemetry[];
}

export interface LearnPhaseProgress {
  sectionsViewed: string[];
  totalSections: number;
  timeSpent: number;
  completedAt?: Date;
  checkpointsPassed: string[];
  keyPointsReviewed: string[];
}

export interface PracticePhaseProgress {
  questionsAttempted: number;
  questionsCorrect: number;
  timeSpent: number;
  completedAt?: Date;
  topics: TopicMastery[];
  hintsUsed: number;
}

export interface AssessPhaseProgress {
  attempts: number;
  bestScore: number;
  lastScore: number;
  timeSpent: number;
  completedAt?: Date;
  passed: boolean;
  remediation?: RemediationPlan;
}

export interface TopicMastery {
  topicId: string;
  correct: number;
  incorrect: number;
  masteryLevel: MasteryLevel;
  confidence: number;
}

export interface RemediationPlan {
  weakAreas: string[];
  recommendedSections: string[];
  suggestedPractice: string[];
  estimatedTime: number;
}

export interface FlowTelemetry {
  event: LearningFlowEvent;
  timestamp: Date;
  state: LearningFlowState;
  metadata?: Record<string, any>;
  duration?: number;
}

export enum MasteryLevel {
  NOVICE = "novice",
  DEVELOPING = "developing",
  PROFICIENT = "proficient",
  ADVANCED = "advanced",
}

/**
 * State Machine Configuration
 */
export interface FlowStateMachine {
  currentState: LearningFlowState;
  context: LearningFlowContext;

  // State transition methods
  canTransition(event: LearningFlowEvent): boolean;
  transition(event: LearningFlowEvent): FlowStateMachine;

  // Gating rules
  canProceedToLearn(): boolean;
  canProceedToPractice(): boolean;
  canProceedToAssess(): boolean;

  // Resume functionality
  save(): Promise<void>;
  resume(): Promise<FlowStateMachine>;

  // Telemetry
  recordEvent(event: LearningFlowEvent, metadata?: Record<string, any>): void;
}

/**
 * State Transition Rules
 */
export const STATE_TRANSITIONS: Record<LearningFlowState, LearningFlowEvent[]> = {
  [LearningFlowState.LEARN]: [LearningFlowEvent.COMPLETE_LEARN, LearningFlowEvent.RESET_FLOW],
  [LearningFlowState.PRACTICE]: [LearningFlowEvent.COMPLETE_PRACTICE, LearningFlowEvent.RESET_FLOW],
  [LearningFlowState.ASSESS]: [
    LearningFlowEvent.COMPLETE_ASSESS,
    LearningFlowEvent.FAIL_ASSESS,
    LearningFlowEvent.RESET_FLOW,
  ],
  [LearningFlowState.COMPLETED]: [LearningFlowEvent.RESET_FLOW, LearningFlowEvent.RESUME_FLOW],
};

/**
 * Gating Rules Configuration
 */
export interface GatingRules {
  learnTopractice: {
    minSectionsViewed: number;
    minTimeSpent: number;
    requireAllCheckpoints: boolean;
  };
  practiceToAssess: {
    minQuestionsAttempted: number;
    minAccuracy: number;
    minTimeSpent: number;
    requiredTopics: string[];
  };
  assessToComplete: {
    minScore: number;
    maxAttempts: number;
  };
}

export const DEFAULT_GATING_RULES: GatingRules = {
  learnTopractice: {
    minSectionsViewed: 3,
    minTimeSpent: 10 * 60, // 10 minutes
    requireAllCheckpoints: true,
  },
  practiceToAssess: {
    minQuestionsAttempted: 5,
    minAccuracy: 0.7,
    minTimeSpent: 5 * 60, // 5 minutes
    requiredTopics: [],
  },
  assessToComplete: {
    minScore: 0.8,
    maxAttempts: 3,
  },
};

/**
 * Validation and Safety Types
 */
export interface FlowValidation {
  isValid: boolean;
  errors: FlowValidationError[];
  warnings: FlowValidationWarning[];
}

export interface FlowValidationError {
  code: string;
  message: string;
  severity: "error" | "warning";
  field?: string;
}

export interface FlowValidationWarning {
  code: string;
  message: string;
  suggestion?: string;
}

/**
 * Boundary Navigation Safety
 */
export interface BoundaryNavigationGuard {
  allowNavigation(
    currentState: LearningFlowState,
    targetState: LearningFlowState,
    context: LearningFlowContext
  ): boolean;

  getNavigationWarning(
    currentState: LearningFlowState,
    targetState: LearningFlowState
  ): string | null;

  canForceNavigation(userId: string): boolean;
}

/**
 * Progress Persistence
 */
export interface FlowProgressPersistence {
  save(context: LearningFlowContext): Promise<void>;
  load(moduleId: string, userId: string): Promise<LearningFlowContext | null>;
  delete(moduleId: string, userId: string): Promise<void>;

  // Offline queue
  queueForSync(context: LearningFlowContext): void;
  syncPendingProgress(): Promise<void>;
}
