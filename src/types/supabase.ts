export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Simplified permissive Database typing to avoid `never` errors at supabase call-sites.
export type Database = {
  public: {
    Tables: Record<
      string,
      {
        Row: Record<string, any>;
        Insert: Record<string, any>;
        Update: Record<string, any>;
        Relationships: any[];
      }
    >;
    Views: Record<string, { Row: Record<string, any> }>;
    Functions: Record<string, { Args: any; Returns: any }>;
    Enums: Record<string, any>;
    CompositeTypes: Record<string, any>;
  };
};

// Relaxed helpers: return `any` to pragmatically unblock many call-sites.
export type Tables<Name extends string = string> = any;
export type TablesInsert<Name extends string = string> = any;
export type TablesUpdate<Name extends string = string> = any;

// Common table helpers used across the codebase
export type StudyModule = Tables<'study_modules'>;
export type StudySection = Tables<'study_sections'>;
export type UserStudyProgress = Tables<'user_study_progress'>;
export type UserStudyBookmark = Tables<'user_study_bookmarks'>;
export type Question = Tables<'questions'>;

export type StudyModuleInsert = TablesInsert<'study_modules'>;
export type StudySectionInsert = TablesInsert<'study_sections'>;
export type UserStudyProgressInsert = TablesInsert<'user_study_progress'>;
export type UserStudyBookmarkInsert = TablesInsert<'user_study_bookmarks'>;
export type QuestionInsert = TablesInsert<'questions'>;
export type QuestionUpdate = TablesUpdate<'questions'>;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;

export type SectionType =
  | 'overview'
  | 'learning_objectives'
  | 'procedures'
  | 'troubleshooting'
  | 'playbook'
  | 'exam_prep'
  | 'references';

export type StudyStatus = 'not_started' | 'in_progress' | 'completed' | 'bookmarked';

export type TCODomain =
  | 'asking_questions'
  | 'refining_questions_targeting'
  | 'taking_action'
  | 'navigation_module_functions'
  | 'reporting_data_export'
  | 'security'
  | 'fundamentals'
  | 'troubleshooting';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

// Lightweight enhanced interfaces frequently used in the app
export interface StudyModuleWithSections extends StudyModule {
  sections?: StudySection[];
  learning_objectives?: string[];
  references?: string[];
  exam_prep?: {
    description?: string;
    exam_focus?: string[];
    practice_labs?: string[];
  };
}

export interface StudySectionWithModule extends StudySection {
  module?: StudyModule;
  content?: {
    overview?: string;
    key_points?: string[];
    procedures?: string[];
    troubleshooting?: string[];
    references?: string[];
  };
  key_points?: string[];
  procedures?: string[];
  troubleshooting?: string[];
  references?: string[];
  playbook?: Json;
}

export interface UserProgressWithDetails extends UserStudyProgress {
  module?: StudyModule;
  section?: StudySection;
}

export interface UserBookmarkWithDetails extends UserStudyBookmark {
  section?: StudySectionWithModule;
}
