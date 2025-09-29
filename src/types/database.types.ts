// Database types generated from Supabase schema
// This file provides TypeScript types for all database tables and their relationships

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      questions: {
        Row: {
          id: string;
          question: string;
          options: Json;
          correct_answer: string | null;
          explanation: string | null;
          difficulty: string | null;
          category: string | null;
          tags: string[] | null;
          domain: string | null;
          module_id: string | null;
          study_guide_ref: string | null;
          created_at: string | null;
          updated_at: string | null;
          created_by?: string | null;
        };
        Insert: {
          id: string;
          question: string;
          options?: Json;
          correct_answer?: string | null;
          explanation?: string | null;
          difficulty?: string | null;
          category?: string | null;
          tags?: string[] | null;
          domain?: string | null;
          module_id?: string | null;
          study_guide_ref?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          question?: string;
          options?: Json;
          correct_answer?: string | null;
          explanation?: string | null;
          difficulty?: string | null;
          category?: string | null;
          tags?: string[] | null;
          domain?: string | null;
          module_id?: string | null;
          study_guide_ref?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
          created_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "questions_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "study_modules";
            referencedColumns: ["id"];
          }
        ];
      };
      exam_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_type: string | null;
          started_at: string | null;
          completed_at: string | null;
          score: number | null;
          total_questions: number | null;
          correct_answers: number | null;
          time_spent: number | null;
          is_passed: boolean | null;
          last_activity: string | null;
          status: string | null;
          config: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_type?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          score?: number | null;
          total_questions?: number | null;
          correct_answers?: number | null;
          time_spent?: number | null;
          is_passed?: boolean | null;
          last_activity?: string | null;
          status?: string | null;
          config?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_type?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          score?: number | null;
          total_questions?: number | null;
          correct_answers?: number | null;
          time_spent?: number | null;
          is_passed?: boolean | null;
          last_activity?: string | null;
          status?: string | null;
          config?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          question_id: string | null;
          is_correct: boolean | null;
          selected_answer: string | null;
          time_taken: number | null;
          completed_at: string | null;
          exam_session_id: string | null;
          time_spent_seconds: number | null;
          metadata: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          question_id?: string | null;
          is_correct?: boolean | null;
          selected_answer?: string | null;
          time_taken?: number | null;
          completed_at?: string | null;
          exam_session_id?: string | null;
          time_spent_seconds?: number | null;
          metadata?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          question_id?: string | null;
          is_correct?: boolean | null;
          selected_answer?: string | null;
          time_taken?: number | null;
          completed_at?: string | null;
          exam_session_id?: string | null;
          time_spent_seconds?: number | null;
          metadata?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_progress_exam_session_id_fkey";
            columns: ["exam_session_id"];
            isOneToOne: false;
            referencedRelation: "exam_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_progress_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          }
        ];
      };
      user_statistics: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          total_questions: number | null;
          correct_answers: number | null;
          accuracy_rate: number | null;
          average_time: number | null;
          last_updated: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          total_questions?: number | null;
          correct_answers?: number | null;
          accuracy_rate?: number | null;
          average_time?: number | null;
          last_updated?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          total_questions?: number | null;
          correct_answers?: number | null;
          accuracy_rate?: number | null;
          average_time?: number | null;
          last_updated?: string | null;
        };
        Relationships: [];
      };
      user_module_progress: {
        Row: {
          id: string;
          user_id: string;
          module_id: string;
          completed_sections: number | null;
          total_sections: number | null;
          status: string | null;
          last_updated: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          module_id: string;
          completed_sections?: number | null;
          total_sections?: number | null;
          status?: string | null;
          last_updated?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          module_id?: string;
          completed_sections?: number | null;
          total_sections?: number | null;
          status?: string | null;
          last_updated?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_module_progress_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "study_modules";
            referencedColumns: ["id"];
          }
        ];
      };
      study_modules: {
        Row: {
          id: string;
          domain: string;
          title: string;
          description: string | null;
          exam_weight: number;
          estimated_time_minutes: number;
          learning_objectives: Json;
          references: Json;
          exam_prep: Json;
          version: string;
          mdx_id?: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          domain: string;
          title: string;
          description?: string | null;
          exam_weight: number;
          estimated_time_minutes?: number;
          learning_objectives?: Json;
          references?: Json;
          exam_prep?: Json;
          version?: string;
          mdx_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          domain?: string;
          title?: string;
          description?: string | null;
          exam_weight?: number;
          estimated_time_minutes?: number;
          learning_objectives?: Json;
          references?: Json;
          exam_prep?: Json;
          version?: string;
          mdx_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      study_sections: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          content: string;
          section_type:
            | "overview"
            | "learning_objectives"
            | "procedures"
            | "troubleshooting"
            | "playbook"
            | "exam_prep"
            | "references";
          order_index: number;
          estimated_time_minutes: number;
          key_points: Json;
          procedures: Json;
          troubleshooting: Json;
          playbook: Json | null;
          references: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          title: string;
          content: string;
          section_type:
            | "overview"
            | "learning_objectives"
            | "procedures"
            | "troubleshooting"
            | "playbook"
            | "exam_prep"
            | "references";
          order_index: number;
          estimated_time_minutes?: number;
          key_points?: Json;
          procedures?: Json;
          troubleshooting?: Json;
          playbook?: Json | null;
          references?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string;
          title?: string;
          content?: string;
          section_type?:
            | "overview"
            | "learning_objectives"
            | "procedures"
            | "troubleshooting"
            | "playbook"
            | "exam_prep"
            | "references";
          order_index?: number;
          estimated_time_minutes?: number;
          key_points?: Json;
          procedures?: Json;
          troubleshooting?: Json;
          playbook?: Json | null;
          references?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "study_sections_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "study_modules";
            referencedColumns: ["id"];
          },
        ];
      };
      user_study_progress: {
        Row: {
          id: string;
          user_id: string;
          module_id: string;
          section_id: string | null;
          status: "not_started" | "in_progress" | "completed" | "needs_review";
          time_spent_minutes: number;
          completed_at: string | null;
          notes: string | null;
          last_viewed_section_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          module_id: string;
          section_id?: string | null;
          status?: "not_started" | "in_progress" | "completed" | "needs_review";
          time_spent_minutes?: number;
          completed_at?: string | null;
          notes?: string | null;
          last_viewed_section_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          module_id?: string;
          section_id?: string | null;
          status?: "not_started" | "in_progress" | "completed" | "needs_review";
          time_spent_minutes?: number;
          completed_at?: string | null;
          notes?: string | null;
          last_viewed_section_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_study_progress_module_id_fkey";
            columns: ["module_id"];
            isOneToOne: false;
            referencedRelation: "study_modules";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_study_progress_section_id_fkey";
            columns: ["section_id"];
            isOneToOne: false;
            referencedRelation: "study_sections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_study_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_study_bookmarks: {
        Row: {
          id: string;
          user_id: string;
          section_id: string;
          position: number;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          section_id: string;
          position?: number;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          section_id?: string;
          position?: number;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_study_bookmarks_section_id_fkey";
            columns: ["section_id"];
            isOneToOne: false;
            referencedRelation: "study_sections";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_study_bookmarks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      analytics_events: {
        Row: {
          event_id: string;
          user_id: string | null;
          session_id: string | null;
          event_type: string;
          event_timestamp: string;
          event_data: Json | null;
          created_at: string | null;
        };
        Insert: {
          event_id?: string;
          user_id?: string | null;
          session_id?: string | null;
          event_type: string;
          event_timestamp?: string;
          event_data?: Json | null;
          created_at?: string | null;
        };
        Update: {
          event_id?: string;
          user_id?: string | null;
          session_id?: string | null;
          event_type?: string;
          event_timestamp?: string;
          event_data?: Json | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      lab_progress: {
        Row: {
          id: string;
          user_id: string | null;
          lab_id: string;
          lab_title: string | null;
          domain: string | null;
          started_at: string | null;
          completed_at: string | null;
          current_step: number;
          total_steps: number;
          completion_time_seconds: number | null;
          score: number | null;
          attempts: number;
          hints_used: number;
          validation_failures: number;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["lab_progress"]["Row"]> & { lab_id: string };
        Update: Partial<Database["public"]["Tables"]["lab_progress"]["Row"]>;
        Relationships: [];
      };
      lab_steps: {
        Row: {
          id: string;
          lab_progress_id: string;
          step_number: number;
          step_title: string | null;
          completed_at: string | null;
          validation_attempts: number;
          hint_used: boolean;
          user_input: string | null;
          created_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["lab_steps"]["Row"]> & {
          lab_progress_id: string;
          step_number: number;
        };
        Update: Partial<Database["public"]["Tables"]["lab_steps"]["Row"]>;
        Relationships: [];
      };
      lab_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_type: string;
          achievement_title: string;
          description: string | null;
          earned_at: string;
          lab_id: string | null;
          metadata: Json;
        };
        Insert: Partial<Database["public"]["Tables"]["lab_achievements"]["Row"]> & {
          user_id: string;
          achievement_type: string;
          achievement_title: string;
          earned_at?: string;
          metadata: Json;
        };
        Update: Partial<Database["public"]["Tables"]["lab_achievements"]["Row"]>;
        Relationships: [];
      };
      kb_modules: {
        Row: {
          id: string;
          title: string;
          domain: string;
          description: string | null;
          status: string | null;
          order_index: number | null;
          metadata: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["kb_modules"]["Row"]> & {
          id: string;
          title: string;
          domain: string;
        };
        Update: Partial<Database["public"]["Tables"]["kb_modules"]["Row"]>;
        Relationships: [];
      };
      kb_lessons: {
        Row: {
          id: string;
          module_id: string | null;
          slug: string;
          title: string;
          summary: string | null;
          duration_minutes: number | null;
          content: string | null;
          tags: string[] | null;
          contributors: string[] | null;
          status: string | null;
          skill_level: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["kb_lessons"]["Row"]> & {
          slug: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["kb_lessons"]["Row"]>;
        Relationships: [];
      };
      kb_questions: {
        Row: {
          id: string;
          module_id: string | null;
          domain: string;
          question: string;
          answer: string | null;
          choices: Json | null;
          difficulty: string | null;
          tags: string[] | null;
          metadata: Json | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["kb_questions"]["Row"]> & {
          id: string;
          domain: string;
          question: string;
        };
        Update: Partial<Database["public"]["Tables"]["kb_questions"]["Row"]>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      handle_updated_at: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      validate_study_content_integrity: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Convenience type exports
export type StudyModule = Database["public"]["Tables"]["study_modules"]["Row"];
export type StudySection = Database["public"]["Tables"]["study_sections"]["Row"];
export type UserStudyProgress = Database["public"]["Tables"]["user_study_progress"]["Row"];
export type UserStudyBookmark = Database["public"]["Tables"]["user_study_bookmarks"]["Row"];

export type StudyModuleInsert = Database["public"]["Tables"]["study_modules"]["Insert"];
export type StudySectionInsert = Database["public"]["Tables"]["study_sections"]["Insert"];
export type UserStudyProgressInsert = Database["public"]["Tables"]["user_study_progress"]["Insert"];
export type UserStudyBookmarkInsert =
  Database["public"]["Tables"]["user_study_bookmarks"]["Insert"];

export type StudyModuleUpdate = Database["public"]["Tables"]["study_modules"]["Update"];
export type StudySectionUpdate = Database["public"]["Tables"]["study_sections"]["Update"];
export type UserStudyProgressUpdate = Database["public"]["Tables"]["user_study_progress"]["Update"];
export type UserStudyBookmarkUpdate =
  Database["public"]["Tables"]["user_study_bookmarks"]["Update"];

// Enum types for better type safety
export type SectionType =
  | "overview"
  | "learning_objectives"
  | "procedures"
  | "troubleshooting"
  | "playbook"
  | "exam_prep"
  | "references";
export type ProgressStatus = "not_started" | "in_progress" | "completed" | "needs_review";
