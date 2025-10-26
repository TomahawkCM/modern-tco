// Import generated types from production database schema
import { Database as GeneratedDatabase, Json as GeneratedJson } from './supabase-generated';

// Re-export the generated types
export type Database = GeneratedDatabase;
export type Json = GeneratedJson;

// Type-safe table helpers
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

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
export type StudyModuleWithSections = Omit<StudyModule, 'exam_prep' | 'learning_objectives' | 'references'> & {
  sections?: StudySection[];
  learning_objectives?: string[] | Json;
  references?: string[] | Json;
  exam_prep?: {
    description?: string;
    exam_focus?: string[];
    practice_labs?: string[];
  } | Json;
};

export type StudySectionWithModule = Omit<StudySection, 'content' | 'key_points' | 'procedures' | 'troubleshooting' | 'references' | 'playbook'> & {
  module?: StudyModule;
  content?: {
    overview?: string;
    key_points?: string[];
    procedures?: string[];
    troubleshooting?: string[];
    references?: string[];
  } | string;
  key_points?: string[] | Json;
  procedures?: string[] | Json;
  troubleshooting?: string[] | Json;
  references?: string[] | Json;
  playbook?: Json;
};

export interface UserProgressWithDetails extends UserStudyProgress {
  module?: StudyModule;
  section?: StudySection;
}

export interface UserBookmarkWithDetails extends UserStudyBookmark {
  section?: StudySectionWithModule;
}
