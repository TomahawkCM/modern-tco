/**
 * Comprehensive Lab Exercise Type Definitions
 * Enhanced for Interactive Console Simulation Framework
 */

import { TCODomain } from "./exam";
import type React from 'react';

// Core lab exercise types
export interface LabExercise {
  id: string;
  title: string;
  domain: TCODomain;
  estimatedTime: number; // minutes
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  learningObjectives: string[];
  prerequisites?: string[];
  steps: LabStep[];
  consoleSimulation: ConsoleSimulation;
  validation: LabValidation;
  achievements: LabAchievement[];
  metadata: LabMetadata;
}

// Individual lab step definition
export interface LabStep {
  id: string;
  stepNumber: number;
  title: string;
  instruction: string;
  expectedResult: string;
  consoleActions: ConsoleAction[];
  validation: StepValidation;
  hints: Hint[];
  timeLimit?: number; // seconds
  isRequired: boolean;
  dependencies?: string[]; // step IDs that must be completed first
}

// Console simulation configuration
export interface ConsoleSimulation {
  simulationType: "tanium-console" | "command-line" | "mixed";
  initialState: ConsoleState;
  modules: TaniumModule[];
  permissions: UserPermissions;
  environment: EnvironmentConfig;
}

// Console state management
export interface ConsoleState {
  currentModule: string;
  currentView: string;
  sessionData: Record<string, any>;
  queries: SavedQuery[];
  computerGroups: ComputerGroup[];
  packages: Package[];
  actions: ActionHistory[];
  activityLog?: ActionHistory[]; // Make optional to be backwards-compatible
}

// Tanium platform modules
export interface TaniumModule {
  id: string;
  name: "Interact" | "Deploy" | "Asset" | "Patch" | "Threat Response" | "Administration";
  enabled: boolean;
  features: ModuleFeature[];
  permissions: string[];
}

export interface ModuleFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  configuration: Record<string, any>;
}

// Console actions that users can perform
export interface ConsoleAction {
  id: string;
  type: "navigate" | "input" | "click" | "wait" | "validate";
  target: string;
  value?: string;
  description: string;
  validation?: ActionValidation;
  timeout?: number;
  isOptional: boolean;
}

// Action validation rules
export interface ActionValidation {
  type: "exact" | "regex" | "contains" | "exists" | "custom";
  pattern: string;
  errorMessage: string;
  successMessage: string;
  retryable: boolean;
  maxAttempts?: number;
}

// Step validation configuration
export interface StepValidation {
  type: "automatic" | "manual" | "hybrid";
  criteria: ValidationCriteria[];
  feedback: ValidationFeedback;
  scoring: StepScoring;
  passingScore: number; // Removed optional '?'
}

export interface ValidationCriteria {
  id: string;
  type:
    | "console-state"
    | "user-input"
    | "result-data"
    | "time-limit"
    | "action-sequence"
    | "time-based"; // Added 'time-based'
  condition: string; // Added this
  weight: number; // 0-100
  required: boolean;
  description: string;
  target?: string; // Added this
  value?: string | number | string[]; // Added this
}

export type ValidationFeedback =
  | string
  | {
      success?: FeedbackMessage;
      failure?: FeedbackMessage;
      partial?: FeedbackMessage;
      hints?: FeedbackMessage[];
    };

export interface FeedbackMessage {
  title: string;
  content: string;
  type: "success" | "error" | "warning" | "info";
  actionable?: boolean;
  nextSteps?: string[];
}

// Scoring system
export interface StepScoring {
  basePoints: number;
  timeBonus: number; // points per second saved
  hintPenalty: number; // points deducted per hint used
  attemptPenalty: number; // points deducted per failed attempt
  perfectBonus: number; // bonus for no hints/failures
}

// Hint system
export interface Hint {
  id: string;
  level: "gentle" | "specific" | "detailed" | "solution";
  trigger: HintTrigger;
  content: string;
  penaltyPoints: number;
  unlockDelay?: number; // seconds
  prerequisites?: string[]; // hint IDs
}

export interface HintTrigger {
  type: "time-based" | "failure-count" | "user-request" | "stuck-detection";
  threshold: number;
  condition?: string;
}

// Lab validation and completion
export interface LabValidation {
  passingScore: number; // 0-100
  requiredSteps: string[]; // step IDs that must be completed
  timeLimit?: number; // minutes
  maxAttempts?: number;
  certificateEligible: boolean;
}

// Achievement system
export interface LabAchievement {
  id: string;
  title: string;
  description: string;
  type: "completion" | "performance" | "efficiency" | "mastery" | "special";
  criteria: AchievementCriteria;
  reward: AchievementReward;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
}

export interface AchievementCriteria {
  type: "score" | "time" | "attempts" | "hints" | "streak" | "custom";
  threshold: number;
  comparison: "greater" | "less" | "equal" | "range";
  condition?: string;
}

export interface AchievementReward {
  points: number;
  badge: string;
  title?: string;
  unlock?: string; // unlock additional content
}

// Lab metadata and configuration
export interface LabMetadata {
  version: string;
  author: string;
  created: string;
  updated: string;
  tags: string[];
  category: string;
  certification: "TAN-1000" | "TAN-2000" | "Custom";
  officialRef?: string;
  studyGuideRef?: string;
  relatedLabs?: string[];
}

// User permissions and RBAC simulation
export interface UserPermissions {
  role: "operator" | "administrator" | "readonly" | "custom";
  modules: Record<string, ModulePermission>;
  actions: string[];
  restrictions: string[];
}

export interface ModulePermission {
  read: boolean;
  write: boolean;
  execute: boolean;
  admin: boolean;
  customRules?: string[];
}

// Environment configuration
export interface EnvironmentConfig {
  platformVersion: string;
  endpoints: number;
  computerGroups: number;
  sensors: string[];
  packages: string[];
  networkLatency: number; // ms
  simulateErrors: boolean;
  dataScale: "small" | "medium" | "large" | "enterprise";
}

// Tanium-specific data types
export interface SavedQuery {
  id: string;
  name: string;
  question: string;
  sensors: string[];
  targeting: TargetingRule;
  results?: QueryResult[];
  lastExecuted?: string;
  shared: boolean;
}

export interface TargetingRule {
  type: "all-computers" | "computer-group" | "custom-filter";
  target?: string;
  filters?: FilterRule[];
}

export interface FilterRule {
  sensor: string;
  operator: "equals" | "contains" | "not-equals" | "regex" | "exists";
  value: string;
  logicalOperator?: "AND" | "OR";
}

export interface QueryResult {
  computerId: string;
  computerName: string;
  data: Record<string, any>;
  timestamp: string;
  columns?: any[]; // Keep this here for direct access if needed, but the error refers to lastQuery.results.columns
}

export interface ComputerGroup {
  id: string;
  name: string;
  type: "static" | "dynamic";
  description: string;
  rules?: FilterRule[];
  memberCount: number;
  lastUpdated: string;
}

export interface Package {
  id: string;
  name: string;
  displayName: string;
  command: string;
  parameters: PackageParameter[];
  category: string;
  verified: boolean;
  lastModified: string;
}

export interface PackageParameter {
  name: string;
  type: "string" | "number" | "boolean" | "file" | "list";
  required: boolean;
  defaultValue?: string;
  validation?: string;
  description: string;
}

export interface ActionHistory {
  id: string;
  type: "package-deployment" | "saved-action" | "live-action" | "module_navigation"; // Added 'module_navigation' for filter
  name: string;
  package?: string;
  targeting?: TargetingRule;
  status?: "pending" | "running" | "completed" | "failed" | "stopped";
  progress?: number; // 0-100
  results?: ActionResult[];
  startTime: string;
  endTime?: string;
  action: string; // Added this
  details?: string; // Added this
  module?: string; // Added this
}

export interface ActionResult {
  computerId: string;
  computerName: string;
  status: "success" | "failure" | "timeout" | "pending";
  exitCode?: number;
  output?: string;
  timestamp: string;
}

// Progress tracking types
export interface LabProgress {
  labId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  currentStep: number;
  completedSteps: string[];
  score: number;
  attempts: number;
  hintsUsed: number;
  validationFailures: number;
  timeSpent: number; // seconds
  status: "not-started" | "in-progress" | "completed" | "failed" | "timeout";
  checkpoints: ProgressCheckpoint[];
}

export interface ProgressCheckpoint {
  stepId: string;
  timestamp: string;
  score: number;
  timeSpent: number;
  hintsUsed: number;
  attempts: number;
  validation: ValidationResult;
}

export interface ValidationResult {
  // allow objects that use `success` (back-compat) so this can be optional
  passed?: boolean;
  score: number;
  // components sometimes pass strings or React nodes; accept both
  feedback: ValidationFeedback | string | React.ReactNode;
  criteriaResults?: CriteriaResult[]; // Primary canonical name (optional for compat)
  // Backwards-compatible alias: some code uses `criteria`
  criteria?: CriteriaResult[];
  // Some code expects `success` instead of `passed`
  success?: boolean;
  suggestions?: string[];
}

export interface CriteriaResult {
  id: string;
  passed: boolean;
  score: number;
  feedback?: ValidationFeedback;
  details?: string; // Make optional to accept legacy objects without details
}

// Real-time events and notifications
export interface LabEvent {
  id: string;
  type:
    | "step-completed"
    | "validation-failed"
    | "hint-used"
    | "achievement-earned"
    | "time-warning";
  timestamp: string;
  data: Record<string, any>;
  broadcast: boolean;
}

// Export comprehensive lab definitions
export interface LabCatalog {
  version: string;
  labs: LabExercise[];
  categories: LabCategory[];
  progressionPaths: LearningPath[];
}

export interface LabCategory {
  id: string;
  name: string;
  description: string;
  prerequisites?: string[];
  labs: string[]; // lab IDs
  order: number;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  domain: TCODomain;
  labs: PathLab[];
  estimatedDuration: number; // hours
  certification: string;
}

export interface PathLab {
  labId: string;
  order: number;
  required: boolean;
  prerequisites?: string[];
}
