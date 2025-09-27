/**
 * Module system types for TCO Learning Management System
 * Defines structure for learning modules, study guides, and progress tracking
 */

import type { TCODomain } from "./exam";

// Base module interfaces
export interface ModuleSection {
  id: string;
  title: string;
  content: string;
  type: "text" | "video" | "interactive" | "quiz" | "checklist";
  estimatedMinutes: number;
  completed?: boolean;
  score?: number;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  domain: TCODomain;
  estimatedMinutes: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  prerequisites: string[];
  learningObjectives: string[];
  sections: ModuleSection[];
  resources: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Study guide interfaces
export interface StudyGuide {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  content: string; // Markdown content
  sections: StudyGuideSection[];
  checkpoints: StudyCheckpoint[];
  estimatedReadingTime: number;
  lastUpdated: Date;
}

export interface StudyGuideSection {
  id: string;
  title: string;
  level: number; // heading level (1-6)
  content: string;
  completed?: boolean;
}

export interface StudyCheckpoint {
  id: string;
  sectionId: string;
  type: "knowledge-check" | "hands-on" | "reflection";
  question: string;
  answer?: string;
  completed?: boolean;
  score?: number;
}

// Progress tracking interfaces
export interface ModuleProgress {
  moduleId: string;
  userId: string;
  startedAt: Date;
  lastAccessedAt: Date;
  completedAt?: Date;
  totalTimeSpent: number; // minutes
  sectionsCompleted: string[];
  overallProgress: number; // 0-100
  quiz_scores: Record<string, number>;
  currentSection: string;
  bookmarks: string[];
}

export interface StudyGuideProgress {
  guideId: string;
  userId: string;
  sectionsRead: string[];
  checkpointsCompleted: string[];
  notes: Record<string, string>;
  readingProgress: number; // 0-100
  lastPosition: string; // section ID
  totalReadingTime: number; // minutes
}

// Module system state management
export interface ModuleContextState {
  modules: LearningModule[];
  studyGuides: StudyGuide[];
  moduleProgress: Record<string, ModuleProgress>;
  guideProgress: Record<string, StudyGuideProgress>;
  currentModule: string | null;
  currentGuide: string | null;
  isLoading: boolean;
  error: string | null;
}

export type ModuleContextAction =
  | { type: "LOAD_MODULES"; payload: LearningModule[] }
  | { type: "LOAD_STUDY_GUIDES"; payload: StudyGuide[] }
  | { type: "SET_CURRENT_MODULE"; payload: string | null }
  | { type: "SET_CURRENT_GUIDE"; payload: string | null }
  | {
      type: "UPDATE_MODULE_PROGRESS";
      payload: { moduleId: string; progress: Partial<ModuleProgress> };
    }
  | {
      type: "UPDATE_GUIDE_PROGRESS";
      payload: { guideId: string; progress: Partial<StudyGuideProgress> };
    }
  | { type: "COMPLETE_SECTION"; payload: { moduleId: string; sectionId: string } }
  | { type: "ADD_BOOKMARK"; payload: { moduleId: string; sectionId: string } }
  | { type: "REMOVE_BOOKMARK"; payload: { moduleId: string; sectionId: string } }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET_PROGRESS"; payload: string };

// Legacy module definition (from /js/modules.js)
export interface LegacyModuleDefinition {
  id: string;
  title: string;
  description: string;
  estimatedTime: number;
  sections: {
    title: string;
    content: string;
    type?: string;
    duration?: number;
  }[];
  objectives: string[];
  resources?: string[];
}

// Utility types
export type ModuleStatus = "not_started" | "in_progress" | "completed";
export type ModuleCategory = "core" | "advanced" | "specialty" | "assessment";
export type ContentType = "theory" | "practical" | "mixed";

// Module filtering and search
export interface ModuleFilters {
  domain?: TCODomain;
  difficulty?: "beginner" | "intermediate" | "advanced";
  status?: ModuleStatus;
  category?: ModuleCategory;
  estimatedTime?: {
    min?: number;
    max?: number;
  };
}

export interface ModuleSearchParams {
  query?: string;
  filters?: ModuleFilters;
  sortBy?: "title" | "difficulty" | "duration" | "progress";
  sortOrder?: "asc" | "desc";
}
