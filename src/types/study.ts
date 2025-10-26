import { TCODomain } from "./exam";

/**
 * Study Content Types for TCO Certification Preparation
 * Defines the structure for comprehensive study materials migrated from legacy content
 */

export interface StudyModule {
  id: string;
  domain: TCODomain;
  title: string;
  description: string;
  examWeight: number; // Percentage weight in TCO exam
  estimatedTime: string; // e.g., "4-5 hours"
  learningObjectives: LearningObjective[];
  sections: StudySection[];
  references: StudyReference[];
  examPrep: ExamPrepSection;
  createdAt: string;
  updatedAt: string;
  version: string;
}

export interface LearningObjective {
  id: string;
  description: string;
  skillLevel: SkillLevel;
  assessmentCriteria: string[];
}

export interface StudySection {
  id: string;
  moduleId: string;
  title: string;
  content: string; // Markdown content
  sectionType: StudySectionType;
  orderIndex: number;
  estimatedTime: number; // minutes
  keyPoints: string[];
  procedures?: ConsoleProcedure[];
  troubleshooting?: TroubleshootingGuide[];
  playbook?: OperatorPlaybook;
  references: StudyReference[];
}

export interface ConsoleProcedure {
  id: string;
  title: string;
  steps: ProcedureStep[];
  consolePath: string;
  validation: string;
  commonIssues?: string[];
}

export interface ProcedureStep {
  stepNumber: number;
  instruction: string;
  expectedAction: string;
  screenshot?: string;
  notes?: string;
}

export interface TroubleshootingGuide {
  id: string;
  issue: string;
  symptoms: string[];
  diagnosticSteps: string[];
  solutions: string[];
  prevention?: string[];
}

export interface OperatorPlaybook {
  id: string;
  title: string;
  checklist: PlaybookItem[];
  category: PlaybookCategory;
}

export interface PlaybookItem {
  id: string;
  task: string;
  completed: boolean;
  notes?: string;
}

export interface StudyReference {
  id: string;
  title: string;
  type: ReferenceType;
  url: string;
  description: string;
  isOfficial: boolean;
}

export interface ExamPrepSection {
  commonPitfalls: string[];
  timeManagementTips: string[];
  practiceScenarios: PracticeScenario[];
  keyMemoryAids: string[];
}

export interface PracticeScenario {
  id: string;
  title: string;
  description: string;
  difficulty: ScenarioDifficulty;
  estimatedTime: number;
  skills: string[];
}

export interface UserStudyProgress {
  id: string;
  userId: string;
  moduleId: string;
  sectionId?: string;
  status: StudyProgressStatus;
  timeSpent: number; // minutes
  completedAt?: string;
  notes?: string;
  bookmarks: StudyBookmark[];
}

export interface StudyBookmark {
  id: string;
  sectionId: string;
  position: number; // Character position in content
  note?: string;
  createdAt: string;
}

// Legacy to Modern Domain Mapping
export const LEGACY_DOMAIN_MAPPING: Record<string, TCODomain> = {
  "Asking Questions": TCODomain.ASKING_QUESTIONS,
  "Refining Questions and Targeting": TCODomain.REFINING_QUESTIONS,
  "Taking Action - Packages and Actions": TCODomain.TAKING_ACTION,
  "Navigation and Basic Module Functions": TCODomain.NAVIGATION_MODULES,
  "Reporting and Data Export": TCODomain.REPORTING_EXPORT,
};

// Modern Domain to Legacy File Mapping
export const DOMAIN_FILE_MAPPING: Record<TCODomain, string> = {
  [TCODomain.ASKING_QUESTIONS]: "01-Asking_Questions.md",
  [TCODomain.REFINING_QUESTIONS]: "02-Refining_Questions_and_Targeting.md",
  [TCODomain.REFINING_TARGETING]: "02-Refining_Questions_and_Targeting.md",
  [TCODomain.TAKING_ACTION]: "03-Taking_Action_Packages_and_Actions.md",
  [TCODomain.NAVIGATION_MODULES]: "04-Navigation_and_Basic_Module_Functions.md",
  [TCODomain.REPORTING_EXPORT]: "05-Reporting_and_Data_Export.md",
  [TCODomain.SECURITY]: "06-Security.md",
  [TCODomain.FUNDAMENTALS]: "07-Fundamentals.md",
  [TCODomain.TROUBLESHOOTING]: "08-Troubleshooting.md",
};

// Enums
export enum StudySectionType {
  OVERVIEW = "overview",
  LEARNING_OBJECTIVES = "learning_objectives",
  PROCEDURES = "procedures",
  TROUBLESHOOTING = "troubleshooting",
  PLAYBOOK = "playbook",
  EXAM_PREP = "exam_prep",
  REFERENCES = "references",
}

export enum SkillLevel {
  FOUNDATION = "foundation",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
  EXPERT = "expert",
}

export enum ReferenceType {
  OFFICIAL_DOCS = "official_docs",
  COMMUNITY = "community",
  RELATED_MODULE = "related_module",
  EXTERNAL = "external",
  VIDEO = "video",
  HANDS_ON_LAB = "hands_on_lab",
}

export enum PlaybookCategory {
  PRE_OPERATION = "pre_operation",
  EXECUTION = "execution",
  POST_OPERATION = "post_operation",
  EMERGENCY = "emergency",
}

export enum ScenarioDifficulty {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
}

export enum StudyProgressStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  NEEDS_REVIEW = "needs_review",
}

// Study Mode Configuration
export interface StudyModeConfig {
  enableProgressTracking: boolean;
  enableBookmarks: boolean;
  enableNotes: boolean;
  autoSaveInterval: number; // seconds
  showEstimatedTimes: boolean;
  enableOfflineMode: boolean;
}

// Default configuration
export const DEFAULT_STUDY_CONFIG: StudyModeConfig = {
  enableProgressTracking: true,
  enableBookmarks: true,
  enableNotes: true,
  autoSaveInterval: 30,
  showEstimatedTimes: true,
  enableOfflineMode: false,
};

// Study content utilities
export const getStudyModuleByDomain = (
  domain: TCODomain,
  modules: StudyModule[]
): StudyModule | undefined => {
  return modules.find((module) => module.domain === domain);
};

export const calculateModuleProgress = (progress: UserStudyProgress[]): number => {
  if (progress.length === 0) return 0;
  const completed = progress.filter((p) => p.status === StudyProgressStatus.COMPLETED).length;
  return (completed / progress.length) * 100;
};

export const getTotalStudyTime = (modules: StudyModule[]): number => {
  return modules.reduce((total, module) => {
    return (
      total +
      module.sections.reduce((sectionTotal, section) => {
        return sectionTotal + section.estimatedTime;
      }, 0)
    );
  }, 0);
};

export default {
  LEGACY_DOMAIN_MAPPING,
  DOMAIN_FILE_MAPPING,
  DEFAULT_STUDY_CONFIG,
  getStudyModuleByDomain,
  calculateModuleProgress,
  getTotalStudyTime,
};
