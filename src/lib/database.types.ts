export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      adaptive_learning_paths: {
        Row: {
          completed_at: string | null
          completed_steps: number | null
          confidence_score: number | null
          created_at: string
          current_step_index: number | null
          estimated_completion_hours: number | null
          generated_by: string | null
          generation_prompt: string | null
          goal_id: string | null
          id: string
          path_name: string
          path_type: string | null
          predicted_completion_date: string | null
          predicted_pass_probability: number | null
          started_at: string | null
          status: string | null
          total_steps: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_steps?: number | null
          confidence_score?: number | null
          created_at?: string
          current_step_index?: number | null
          estimated_completion_hours?: number | null
          generated_by?: string | null
          generation_prompt?: string | null
          goal_id?: string | null
          id?: string
          path_name: string
          path_type?: string | null
          predicted_completion_date?: string | null
          predicted_pass_probability?: number | null
          started_at?: string | null
          status?: string | null
          total_steps?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_steps?: number | null
          confidence_score?: number | null
          created_at?: string
          current_step_index?: number | null
          estimated_completion_hours?: number | null
          generated_by?: string | null
          generation_prompt?: string | null
          goal_id?: string | null
          id?: string
          path_name?: string
          path_type?: string | null
          predicted_completion_date?: string | null
          predicted_pass_probability?: number | null
          started_at?: string | null
          status?: string | null
          total_steps?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "adaptive_learning_paths_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "student_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tutor_conversations: {
        Row: {
          ai_model: string | null
          conversation_type: string | null
          created_at: string
          id: string
          last_message_at: string | null
          message_count: number | null
          related_domain: string | null
          related_module_id: string | null
          related_section_id: string | null
          status: string | null
          system_prompt: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_model?: string | null
          conversation_type?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          related_domain?: string | null
          related_module_id?: string | null
          related_section_id?: string | null
          status?: string | null
          system_prompt?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_model?: string | null
          conversation_type?: string | null
          created_at?: string
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          related_domain?: string | null
          related_module_id?: string | null
          related_section_id?: string | null
          status?: string | null
          system_prompt?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_tutor_messages: {
        Row: {
          code_snippets: Json | null
          confidence_score: number | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          model: string | null
          processing_time_ms: number | null
          referenced_content: Json | null
          role: string
          tokens_used: number | null
          user_feedback: string | null
          was_helpful: boolean | null
        }
        Insert: {
          code_snippets?: Json | null
          confidence_score?: number | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          model?: string | null
          processing_time_ms?: number | null
          referenced_content?: Json | null
          role: string
          tokens_used?: number | null
          user_feedback?: string | null
          was_helpful?: boolean | null
        }
        Update: {
          code_snippets?: Json | null
          confidence_score?: number | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          model?: string | null
          processing_time_ms?: number | null
          referenced_content?: Json | null
          role?: string
          tokens_used?: number | null
          user_feedback?: string | null
          was_helpful?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_tutor_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_tutor_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_id: string
          event_timestamp: string
          event_type: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_id?: string
          event_timestamp?: string
          event_type: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_id?: string
          event_timestamp?: string
          event_type?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      cohort_benchmarks: {
        Row: {
          avg_completion_percentage: number | null
          avg_days_to_completion: number | null
          avg_mock_exam_score: number | null
          avg_overall_accuracy: number | null
          avg_practice_accuracy: number | null
          avg_session_duration_minutes: number | null
          avg_sessions_per_week: number | null
          avg_study_hours: number | null
          avg_study_streak: number | null
          avg_time_per_module: Json | null
          cohort_name: string
          cohort_type: string
          created_at: string
          date_range_end: string
          date_range_start: string
          domain_averages: Json | null
          id: string
          last_calculated_at: string
          pass_rate: number | null
          total_students: number
          updated_at: string
        }
        Insert: {
          avg_completion_percentage?: number | null
          avg_days_to_completion?: number | null
          avg_mock_exam_score?: number | null
          avg_overall_accuracy?: number | null
          avg_practice_accuracy?: number | null
          avg_session_duration_minutes?: number | null
          avg_sessions_per_week?: number | null
          avg_study_hours?: number | null
          avg_study_streak?: number | null
          avg_time_per_module?: Json | null
          cohort_name: string
          cohort_type: string
          created_at?: string
          date_range_end: string
          date_range_start: string
          domain_averages?: Json | null
          id?: string
          last_calculated_at?: string
          pass_rate?: number | null
          total_students?: number
          updated_at?: string
        }
        Update: {
          avg_completion_percentage?: number | null
          avg_days_to_completion?: number | null
          avg_mock_exam_score?: number | null
          avg_overall_accuracy?: number | null
          avg_practice_accuracy?: number | null
          avg_session_duration_minutes?: number | null
          avg_sessions_per_week?: number | null
          avg_study_hours?: number | null
          avg_study_streak?: number | null
          avg_time_per_module?: Json | null
          cohort_name?: string
          cohort_type?: string
          created_at?: string
          date_range_end?: string
          date_range_start?: string
          domain_averages?: Json | null
          id?: string
          last_calculated_at?: string
          pass_rate?: number | null
          total_students?: number
          updated_at?: string
        }
        Relationships: []
      }
      command_validation_results: {
        Row: {
          command_text: string
          command_type: string
          doc_file_path: string
          error_message: string | null
          id: string
          tested_at: string | null
          tested_by: string | null
          validation_result: string
        }
        Insert: {
          command_text: string
          command_type: string
          doc_file_path: string
          error_message?: string | null
          id?: string
          tested_at?: string | null
          tested_by?: string | null
          validation_result: string
        }
        Update: {
          command_text?: string
          command_type?: string
          doc_file_path?: string
          error_message?: string | null
          id?: string
          tested_at?: string | null
          tested_by?: string | null
          validation_result?: string
        }
        Relationships: []
      }
      content_import_logs: {
        Row: {
          content_type: string
          created_at: string
          error_log: Json | null
          failed_items: number
          id: string
          import_method: string
          imported_by: string | null
          imported_ids: string[] | null
          source_description: string | null
          source_file: string | null
          successful_items: number
          total_items: number
        }
        Insert: {
          content_type: string
          created_at?: string
          error_log?: Json | null
          failed_items?: number
          id?: string
          import_method: string
          imported_by?: string | null
          imported_ids?: string[] | null
          source_description?: string | null
          source_file?: string | null
          successful_items?: number
          total_items?: number
        }
        Update: {
          content_type?: string
          created_at?: string
          error_log?: Json | null
          failed_items?: number
          id?: string
          import_method?: string
          imported_by?: string | null
          imported_ids?: string[] | null
          source_description?: string | null
          source_file?: string | null
          successful_items?: number
          total_items?: number
        }
        Relationships: []
      }
      doc_conversion_progress: {
        Row: {
          assigned_agent: string | null
          created_at: string | null
          file_path: string
          id: string
          notes: string | null
          phase: number
          powershell_commands_added: number | null
          status: string | null
          unix_commands_found: number | null
          updated_at: string | null
          validation_status: string | null
        }
        Insert: {
          assigned_agent?: string | null
          created_at?: string | null
          file_path: string
          id?: string
          notes?: string | null
          phase: number
          powershell_commands_added?: number | null
          status?: string | null
          unix_commands_found?: number | null
          updated_at?: string | null
          validation_status?: string | null
        }
        Update: {
          assigned_agent?: string | null
          created_at?: string | null
          file_path?: string
          id?: string
          notes?: string | null
          phase?: number
          powershell_commands_added?: number | null
          status?: string | null
          unix_commands_found?: number | null
          updated_at?: string | null
          validation_status?: string | null
        }
        Relationships: []
      }
      exam_sessions: {
        Row: {
          completed_at: string | null
          config: Json | null
          correct_answers: number | null
          created_at: string | null
          id: string
          is_passed: boolean | null
          last_activity: string | null
          score: number | null
          session_type: Database["public"]["Enums"]["session_type"]
          started_at: string | null
          status: string | null
          time_spent: number | null
          total_questions: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          config?: Json | null
          correct_answers?: number | null
          created_at?: string | null
          id?: string
          is_passed?: boolean | null
          last_activity?: string | null
          score?: number | null
          session_type: Database["public"]["Enums"]["session_type"]
          started_at?: string | null
          status?: string | null
          time_spent?: number | null
          total_questions?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          config?: Json | null
          correct_answers?: number | null
          created_at?: string | null
          id?: string
          is_passed?: boolean | null
          last_activity?: string | null
          score?: number | null
          session_type?: Database["public"]["Enums"]["session_type"]
          started_at?: string | null
          status?: string | null
          time_spent?: number | null
          total_questions?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_deck_cards: {
        Row: {
          added_at: string
          deck_id: string
          flashcard_id: string
          id: string
        }
        Insert: {
          added_at?: string
          deck_id: string
          flashcard_id: string
          id?: string
        }
        Update: {
          added_at?: string
          deck_id?: string
          flashcard_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_deck_cards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "flashcard_decks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcard_deck_cards_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_decks: {
        Row: {
          created_at: string
          daily_new_cards_limit: number
          daily_review_limit: number
          description: string | null
          domain: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_new_cards_limit?: number
          daily_review_limit?: number
          description?: string | null
          domain?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_new_cards_limit?: number
          daily_review_limit?: number
          description?: string | null
          domain?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      flashcard_library: {
        Row: {
          average_ease_factor: number | null
          back: string
          category: string | null
          created_at: string
          difficulty: string | null
          domain: string
          front: string
          hint: string | null
          id: string
          source: string | null
          study_guide_ref: string | null
          tags: string[] | null
          total_correct: number | null
          total_reviews: number | null
          updated_at: string
        }
        Insert: {
          average_ease_factor?: number | null
          back: string
          category?: string | null
          created_at?: string
          difficulty?: string | null
          domain: string
          front: string
          hint?: string | null
          id?: string
          source?: string | null
          study_guide_ref?: string | null
          tags?: string[] | null
          total_correct?: number | null
          total_reviews?: number | null
          updated_at?: string
        }
        Update: {
          average_ease_factor?: number | null
          back?: string
          category?: string | null
          created_at?: string
          difficulty?: string | null
          domain?: string
          front?: string
          hint?: string | null
          id?: string
          source?: string | null
          study_guide_ref?: string | null
          tags?: string[] | null
          total_correct?: number | null
          total_reviews?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      flashcard_library_progress: {
        Row: {
          correct_count: number
          created_at: string
          ease_factor: number
          flashcard_library_id: string
          id: string
          interval_days: number
          last_reviewed_at: string | null
          longest_streak: number
          next_review_date: string
          recent_ratings: number[] | null
          repetition_number: number
          review_count: number
          streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          correct_count?: number
          created_at?: string
          ease_factor?: number
          flashcard_library_id: string
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          longest_streak?: number
          next_review_date: string
          recent_ratings?: number[] | null
          repetition_number?: number
          review_count?: number
          streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          correct_count?: number
          created_at?: string
          ease_factor?: number
          flashcard_library_id?: string
          id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          longest_streak?: number
          next_review_date?: string
          recent_ratings?: number[] | null
          repetition_number?: number
          review_count?: number
          streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_library_progress_flashcard_library_id_fkey"
            columns: ["flashcard_library_id"]
            isOneToOne: false
            referencedRelation: "flashcard_library"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_reviews: {
        Row: {
          flashcard_id: string
          id: string
          rating: string
          reviewed_at: string
          srs_ease_after: number | null
          srs_ease_before: number | null
          srs_interval_after: number | null
          srs_interval_before: number | null
          time_spent_seconds: number
          user_id: string
        }
        Insert: {
          flashcard_id: string
          id?: string
          rating: string
          reviewed_at?: string
          srs_ease_after?: number | null
          srs_ease_before?: number | null
          srs_interval_after?: number | null
          srs_interval_before?: number | null
          time_spent_seconds?: number
          user_id: string
        }
        Update: {
          flashcard_id?: string
          id?: string
          rating?: string
          reviewed_at?: string
          srs_ease_after?: number | null
          srs_ease_before?: number | null
          srs_interval_after?: number | null
          srs_interval_before?: number | null
          time_spent_seconds?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_reviews_flashcard_id_fkey"
            columns: ["flashcard_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcards: {
        Row: {
          average_recall_time_seconds: number | null
          back_text: string
          card_type: Database["public"]["Enums"]["flashcard_type"]
          correct_reviews: number
          created_at: string
          explanation: string | null
          front_text: string
          hint: string | null
          id: string
          image_url: string | null
          last_reviewed_at: string | null
          module_id: string | null
          question_id: string | null
          section_id: string | null
          source: Database["public"]["Enums"]["flashcard_source"]
          srs_due: string
          srs_ease: number
          srs_interval: number
          srs_lapses: number
          srs_reps: number
          tags: string[] | null
          total_reviews: number
          updated_at: string
          user_id: string
        }
        Insert: {
          average_recall_time_seconds?: number | null
          back_text: string
          card_type?: Database["public"]["Enums"]["flashcard_type"]
          correct_reviews?: number
          created_at?: string
          explanation?: string | null
          front_text: string
          hint?: string | null
          id?: string
          image_url?: string | null
          last_reviewed_at?: string | null
          module_id?: string | null
          question_id?: string | null
          section_id?: string | null
          source?: Database["public"]["Enums"]["flashcard_source"]
          srs_due?: string
          srs_ease?: number
          srs_interval?: number
          srs_lapses?: number
          srs_reps?: number
          tags?: string[] | null
          total_reviews?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          average_recall_time_seconds?: number | null
          back_text?: string
          card_type?: Database["public"]["Enums"]["flashcard_type"]
          correct_reviews?: number
          created_at?: string
          explanation?: string | null
          front_text?: string
          hint?: string | null
          id?: string
          image_url?: string | null
          last_reviewed_at?: string | null
          module_id?: string | null
          question_id?: string | null
          section_id?: string | null
          source?: Database["public"]["Enums"]["flashcard_source"]
          srs_due?: string
          srs_ease?: number
          srs_interval?: number
          srs_lapses?: number
          srs_reps?: number
          tags?: string[] | null
          total_reviews?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "study_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcards_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcards_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "study_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      intervention_alerts: {
        Row: {
          acknowledged_at: string | null
          alert_type: string
          created_at: string
          follow_up_date: string | null
          follow_up_required: boolean | null
          id: string
          message: string
          resolved_at: string | null
          severity: string | null
          status: string | null
          suggested_actions: Json | null
          support_resources: Json | null
          threshold_values: Json | null
          title: string
          triggered_by: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          alert_type: string
          created_at?: string
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          message: string
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          suggested_actions?: Json | null
          support_resources?: Json | null
          threshold_values?: Json | null
          title: string
          triggered_by?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          alert_type?: string
          created_at?: string
          follow_up_date?: string | null
          follow_up_required?: boolean | null
          id?: string
          message?: string
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          suggested_actions?: Json | null
          support_resources?: Json | null
          threshold_values?: Json | null
          title?: string
          triggered_by?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      kb_articles: {
        Row: {
          module_id: string
          path: string
          title: string
          updated_at: string | null
        }
        Insert: {
          module_id: string
          path: string
          title: string
          updated_at?: string | null
        }
        Update: {
          module_id?: string
          path?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kb_articles_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "kb_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_labs: {
        Row: {
          module_id: string
          path: string
          title: string
          updated_at: string | null
        }
        Insert: {
          module_id: string
          path: string
          title: string
          updated_at?: string | null
        }
        Update: {
          module_id?: string
          path?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kb_labs_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "kb_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_lessons: {
        Row: {
          content: string | null
          contributors: string[] | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          module_id: string | null
          skill_level: string | null
          slug: string
          status: string | null
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          contributors?: string[] | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          module_id?: string | null
          skill_level?: string | null
          slug: string
          status?: string | null
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          contributors?: string[] | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          module_id?: string | null
          skill_level?: string | null
          slug?: string
          status?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kb_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "kb_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_modules: {
        Row: {
          created_at: string | null
          domain: string
          exam_weight: number | null
          id: string
          metadata: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          exam_weight?: number | null
          id: string
          metadata?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          exam_weight?: number | null
          id?: string
          metadata?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      kb_objectives: {
        Row: {
          id: string
          module_id: string
          text: string
        }
        Insert: {
          id: string
          module_id: string
          text: string
        }
        Update: {
          id?: string
          module_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_objectives_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "kb_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_pitfalls: {
        Row: {
          module_id: string
          path: string
        }
        Insert: {
          module_id: string
          path: string
        }
        Update: {
          module_id?: string
          path?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_pitfalls_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "kb_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_question_objectives: {
        Row: {
          objective_id: string
          question_id: string
        }
        Insert: {
          objective_id: string
          question_id: string
        }
        Update: {
          objective_id?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_question_objectives_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "kb_objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kb_question_objectives_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "kb_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_question_remediation: {
        Row: {
          question_id: string
          remediation: Json
        }
        Insert: {
          question_id: string
          remediation: Json
        }
        Update: {
          question_id?: string
          remediation?: Json
        }
        Relationships: [
          {
            foreignKeyName: "kb_question_remediation_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: true
            referencedRelation: "kb_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_questions: {
        Row: {
          answer: string
          choices: Json
          cognitive: string
          difficulty: number
          domain: string
          explanation: string | null
          id: string
          module_id: string | null
          stem: string
        }
        Insert: {
          answer: string
          choices: Json
          cognitive: string
          difficulty: number
          domain: string
          explanation?: string | null
          id: string
          module_id?: string | null
          stem: string
        }
        Update: {
          answer?: string
          choices?: Json
          cognitive?: string
          difficulty?: number
          domain?: string
          explanation?: string | null
          id?: string
          module_id?: string | null
          stem?: string
        }
        Relationships: [
          {
            foreignKeyName: "kb_questions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "kb_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_videos: {
        Row: {
          module_id: string
          path: string
          title: string
          updated_at: string | null
          youtube_ids: string[] | null
        }
        Insert: {
          module_id: string
          path: string
          title: string
          updated_at?: string | null
          youtube_ids?: string[] | null
        }
        Update: {
          module_id?: string
          path?: string
          title?: string
          updated_at?: string | null
          youtube_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "kb_videos_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "kb_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_achievements: {
        Row: {
          achievement_title: string
          achievement_type: string
          description: string | null
          earned_at: string
          id: string
          lab_id: string | null
          metadata: Json
          user_id: string
        }
        Insert: {
          achievement_title: string
          achievement_type: string
          description?: string | null
          earned_at?: string
          id?: string
          lab_id?: string | null
          metadata?: Json
          user_id: string
        }
        Update: {
          achievement_title?: string
          achievement_type?: string
          description?: string | null
          earned_at?: string
          id?: string
          lab_id?: string | null
          metadata?: Json
          user_id?: string
        }
        Relationships: []
      }
      lab_progress: {
        Row: {
          attempts: number
          completed_at: string | null
          completion_time_seconds: number | null
          created_at: string
          current_step: number
          domain: string | null
          hints_used: number
          id: string
          lab_id: string
          lab_title: string | null
          score: number | null
          started_at: string
          total_steps: number
          updated_at: string
          user_id: string | null
          validation_failures: number
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          completion_time_seconds?: number | null
          created_at?: string
          current_step?: number
          domain?: string | null
          hints_used?: number
          id?: string
          lab_id: string
          lab_title?: string | null
          score?: number | null
          started_at?: string
          total_steps?: number
          updated_at?: string
          user_id?: string | null
          validation_failures?: number
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          completion_time_seconds?: number | null
          created_at?: string
          current_step?: number
          domain?: string | null
          hints_used?: number
          id?: string
          lab_id?: string
          lab_title?: string | null
          score?: number | null
          started_at?: string
          total_steps?: number
          updated_at?: string
          user_id?: string | null
          validation_failures?: number
        }
        Relationships: []
      }
      lab_steps: {
        Row: {
          completed_at: string | null
          created_at: string
          hint_used: boolean
          id: string
          lab_progress_id: string
          step_number: number
          step_title: string | null
          user_input: string | null
          validation_attempts: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          hint_used?: boolean
          id?: string
          lab_progress_id: string
          step_number: number
          step_title?: string | null
          user_input?: string | null
          validation_attempts?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          hint_used?: boolean
          id?: string
          lab_progress_id?: string
          step_number?: number
          step_title?: string | null
          user_input?: string | null
          validation_attempts?: number
        }
        Relationships: [
          {
            foreignKeyName: "lab_steps_lab_progress_id_fkey"
            columns: ["lab_progress_id"]
            isOneToOne: false
            referencedRelation: "lab_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_analytics_cache: {
        Row: {
          cache_key: string
          created_at: string
          data: Json
          expires_at: string
          hit_count: number
          id: string
          ttl_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cache_key: string
          created_at?: string
          data?: Json
          expires_at: string
          hit_count?: number
          id?: string
          ttl_seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cache_key?: string
          created_at?: string
          data?: Json
          expires_at?: string
          hit_count?: number
          id?: string
          ttl_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_path_steps: {
        Row: {
          actual_minutes: number | null
          attempts: number | null
          completed_at: string | null
          content_domain: string | null
          content_id: string | null
          created_at: string
          description: string | null
          difficulty_adjustment: number | null
          estimated_minutes: number | null
          id: string
          path_id: string
          prerequisite_step_ids: string[] | null
          recommended_resources: Json | null
          score: number | null
          started_at: string | null
          status: string | null
          step_index: number
          step_type: string
          title: string
          updated_at: string
        }
        Insert: {
          actual_minutes?: number | null
          attempts?: number | null
          completed_at?: string | null
          content_domain?: string | null
          content_id?: string | null
          created_at?: string
          description?: string | null
          difficulty_adjustment?: number | null
          estimated_minutes?: number | null
          id?: string
          path_id: string
          prerequisite_step_ids?: string[] | null
          recommended_resources?: Json | null
          score?: number | null
          started_at?: string | null
          status?: string | null
          step_index: number
          step_type: string
          title: string
          updated_at?: string
        }
        Update: {
          actual_minutes?: number | null
          attempts?: number | null
          completed_at?: string | null
          content_domain?: string | null
          content_id?: string | null
          created_at?: string
          description?: string | null
          difficulty_adjustment?: number | null
          estimated_minutes?: number | null
          id?: string
          path_id?: string
          prerequisite_step_ids?: string[] | null
          recommended_resources?: Json | null
          score?: number | null
          started_at?: string | null
          status?: string | null
          step_index?: number
          step_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_steps_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "adaptive_learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      mastery_predictions: {
        Row: {
          achieved_at: string | null
          actual_days_to_mastery: number | null
          actual_study_hours_spent: number | null
          confidence_interval_lower: number | null
          confidence_interval_upper: number | null
          created_at: string
          current_learning_velocity: number | null
          current_mastery_level: number
          domain: string
          features_used: Json | null
          id: string
          model_version: string
          predicted_days_to_mastery: number | null
          predicted_practice_questions_needed: number | null
          predicted_study_hours_needed: number | null
          prediction_confidence: number | null
          prediction_error: number | null
          prediction_method: string
          recommended_daily_minutes: number | null
          recommended_weekly_sessions: number | null
          target_mastery_level: number
          updated_at: string
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          actual_days_to_mastery?: number | null
          actual_study_hours_spent?: number | null
          confidence_interval_lower?: number | null
          confidence_interval_upper?: number | null
          created_at?: string
          current_learning_velocity?: number | null
          current_mastery_level: number
          domain: string
          features_used?: Json | null
          id?: string
          model_version?: string
          predicted_days_to_mastery?: number | null
          predicted_practice_questions_needed?: number | null
          predicted_study_hours_needed?: number | null
          prediction_confidence?: number | null
          prediction_error?: number | null
          prediction_method?: string
          recommended_daily_minutes?: number | null
          recommended_weekly_sessions?: number | null
          target_mastery_level?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          actual_days_to_mastery?: number | null
          actual_study_hours_spent?: number | null
          confidence_interval_lower?: number | null
          confidence_interval_upper?: number | null
          created_at?: string
          current_learning_velocity?: number | null
          current_mastery_level?: number
          domain?: string
          features_used?: Json | null
          id?: string
          model_version?: string
          predicted_days_to_mastery?: number | null
          predicted_practice_questions_needed?: number | null
          predicted_study_hours_needed?: number | null
          prediction_confidence?: number | null
          prediction_error?: number | null
          prediction_method?: string
          recommended_daily_minutes?: number | null
          recommended_weekly_sessions?: number | null
          target_mastery_level?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mv_refresh_log: {
        Row: {
          completed_at: string | null
          error_message: string | null
          id: string
          started_at: string | null
          status: string | null
          view_name: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          view_name: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          view_name?: string
        }
        Relationships: []
      }
      pass_probability_predictions: {
        Row: {
          confidence_interval: number | null
          created_at: string
          days_until_exam: number | null
          domain_scores: Json | null
          estimated_study_hours_needed: number | null
          features_used: Json | null
          id: string
          model_version: string | null
          predicted_probability: number
          prediction_for_date: string | null
          prediction_method: string | null
          recommended_actions: Json | null
          risk_factors: string[] | null
          strengths: Json | null
          user_id: string
          weaknesses: Json | null
        }
        Insert: {
          confidence_interval?: number | null
          created_at?: string
          days_until_exam?: number | null
          domain_scores?: Json | null
          estimated_study_hours_needed?: number | null
          features_used?: Json | null
          id?: string
          model_version?: string | null
          predicted_probability: number
          prediction_for_date?: string | null
          prediction_method?: string | null
          recommended_actions?: Json | null
          risk_factors?: string[] | null
          strengths?: Json | null
          user_id: string
          weaknesses?: Json | null
        }
        Update: {
          confidence_interval?: number | null
          created_at?: string
          days_until_exam?: number | null
          domain_scores?: Json | null
          estimated_study_hours_needed?: number | null
          features_used?: Json | null
          id?: string
          model_version?: string | null
          predicted_probability?: number
          prediction_for_date?: string | null
          prediction_method?: string | null
          recommended_actions?: Json | null
          risk_factors?: string[] | null
          strengths?: Json | null
          user_id?: string
          weaknesses?: Json | null
        }
        Relationships: []
      }
      performance_heatmaps: {
        Row: {
          created_at: string
          data: Json
          generated_at: string
          heatmap_type: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          generated_at?: string
          heatmap_type: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          generated_at?: string
          heatmap_type?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      powershell_command_reference: {
        Row: {
          command_category: string | null
          created_at: string | null
          id: string
          powershell_equivalent: string
          unix_command: string
          usage_context: string | null
          validation_status: string | null
        }
        Insert: {
          command_category?: string | null
          created_at?: string | null
          id?: string
          powershell_equivalent: string
          unix_command: string
          usage_context?: string | null
          validation_status?: string | null
        }
        Update: {
          command_category?: string | null
          created_at?: string | null
          id?: string
          powershell_equivalent?: string
          unix_command?: string
          usage_context?: string | null
          validation_status?: string | null
        }
        Relationships: []
      }
      question_review_attempts: {
        Row: {
          attempted_at: string
          id: string
          is_correct: boolean
          question_id: string
          rating: string
          review_id: string
          srs_ease_after: number | null
          srs_ease_before: number | null
          srs_interval_after: number | null
          srs_interval_before: number | null
          time_spent_seconds: number
          user_id: string
        }
        Insert: {
          attempted_at?: string
          id?: string
          is_correct: boolean
          question_id: string
          rating: string
          review_id: string
          srs_ease_after?: number | null
          srs_ease_before?: number | null
          srs_interval_after?: number | null
          srs_interval_before?: number | null
          time_spent_seconds?: number
          user_id: string
        }
        Update: {
          attempted_at?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          rating?: string
          review_id?: string
          srs_ease_after?: number | null
          srs_ease_before?: number | null
          srs_interval_after?: number | null
          srs_interval_before?: number | null
          time_spent_seconds?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_review_attempts_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_review_attempts_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "question_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      question_reviews: {
        Row: {
          average_time_seconds: number | null
          correct_attempts: number
          created_at: string
          id: string
          last_reviewed_at: string | null
          mastery_level: number | null
          question_id: string
          srs_due: string
          srs_ease: number
          srs_interval: number
          srs_lapses: number
          srs_reps: number
          total_attempts: number
          updated_at: string
          user_id: string
        }
        Insert: {
          average_time_seconds?: number | null
          correct_attempts?: number
          created_at?: string
          id?: string
          last_reviewed_at?: string | null
          mastery_level?: number | null
          question_id: string
          srs_due?: string
          srs_ease?: number
          srs_interval?: number
          srs_lapses?: number
          srs_reps?: number
          total_attempts?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          average_time_seconds?: number | null
          correct_attempts?: number
          created_at?: string
          id?: string
          last_reviewed_at?: string | null
          mastery_level?: number | null
          question_id?: string
          srs_due?: string
          srs_ease?: number
          srs_interval?: number
          srs_lapses?: number
          srs_reps?: number
          total_attempts?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_reviews_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          category: string
          correct_answer: number
          created_at: string | null
          created_by: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          domain: string
          explanation: string
          id: string
          module_id: string | null
          official_ref: string | null
          options: Json
          question: string
          section_tags: string[] | null
          study_guide_ref: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          category: string
          correct_answer: number
          created_at?: string | null
          created_by?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          domain: string
          explanation: string
          id?: string
          module_id?: string | null
          official_ref?: string | null
          options?: Json
          question: string
          section_tags?: string[] | null
          study_guide_ref?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          correct_answer?: number
          created_at?: string | null
          created_by?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          domain?: string
          explanation?: string
          id?: string
          module_id?: string | null
          official_ref?: string | null
          options?: Json
          question?: string
          section_tags?: string[] | null
          study_guide_ref?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "study_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      review_sessions: {
        Row: {
          accuracy: number | null
          actual_duration_seconds: number | null
          completed_at: string | null
          correct_count: number
          flashcards_reviewed: number
          id: string
          is_completed: boolean
          questions_reviewed: number
          session_type: string
          started_at: string
          target_duration_minutes: number | null
          total_count: number
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          actual_duration_seconds?: number | null
          completed_at?: string | null
          correct_count?: number
          flashcards_reviewed?: number
          id?: string
          is_completed?: boolean
          questions_reviewed?: number
          session_type: string
          started_at?: string
          target_duration_minutes?: number | null
          total_count?: number
          user_id: string
        }
        Update: {
          accuracy?: number | null
          actual_duration_seconds?: number | null
          completed_at?: string | null
          correct_count?: number
          flashcards_reviewed?: number
          id?: string
          is_completed?: boolean
          questions_reviewed?: number
          session_type?: string
          started_at?: string
          target_duration_minutes?: number | null
          total_count?: number
          user_id?: string
        }
        Relationships: []
      }
      student_cohort_assignments: {
        Row: {
          accuracy_percentile: number | null
          assigned_at: string
          cohort_benchmark_id: string
          completion_percentile: number | null
          id: string
          last_updated_at: string
          overall_percentile: number | null
          personal_completion_percentage: number | null
          personal_days_active: number | null
          personal_mock_exam_best: number | null
          personal_overall_accuracy: number | null
          personal_study_hours: number | null
          study_hours_percentile: number | null
          user_id: string
        }
        Insert: {
          accuracy_percentile?: number | null
          assigned_at?: string
          cohort_benchmark_id: string
          completion_percentile?: number | null
          id?: string
          last_updated_at?: string
          overall_percentile?: number | null
          personal_completion_percentage?: number | null
          personal_days_active?: number | null
          personal_mock_exam_best?: number | null
          personal_overall_accuracy?: number | null
          personal_study_hours?: number | null
          study_hours_percentile?: number | null
          user_id: string
        }
        Update: {
          accuracy_percentile?: number | null
          assigned_at?: string
          cohort_benchmark_id?: string
          completion_percentile?: number | null
          id?: string
          last_updated_at?: string
          overall_percentile?: number | null
          personal_completion_percentage?: number | null
          personal_days_active?: number | null
          personal_mock_exam_best?: number | null
          personal_overall_accuracy?: number | null
          personal_study_hours?: number | null
          study_hours_percentile?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_cohort_assignments_cohort_benchmark_id_fkey"
            columns: ["cohort_benchmark_id"]
            isOneToOne: false
            referencedRelation: "cohort_benchmarks"
            referencedColumns: ["id"]
          },
        ]
      }
      student_goals: {
        Row: {
          created_at: string
          difficulty_preference: string | null
          enable_adaptive_path: boolean | null
          enable_ai_recommendations: boolean | null
          enable_intervention_alerts: boolean | null
          id: string
          learning_style: string | null
          preferred_content_types: string[] | null
          preferred_study_times: string[] | null
          priority_domains: string[] | null
          study_hours_per_week: number | null
          target_exam_date: string | null
          target_pass_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          difficulty_preference?: string | null
          enable_adaptive_path?: boolean | null
          enable_ai_recommendations?: boolean | null
          enable_intervention_alerts?: boolean | null
          id?: string
          learning_style?: string | null
          preferred_content_types?: string[] | null
          preferred_study_times?: string[] | null
          priority_domains?: string[] | null
          study_hours_per_week?: number | null
          target_exam_date?: string | null
          target_pass_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          difficulty_preference?: string | null
          enable_adaptive_path?: boolean | null
          enable_ai_recommendations?: boolean | null
          enable_intervention_alerts?: boolean | null
          id?: string
          learning_style?: string | null
          preferred_content_types?: string[] | null
          preferred_study_times?: string[] | null
          priority_domains?: string[] | null
          study_hours_per_week?: number | null
          target_exam_date?: string | null
          target_pass_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      student_performance_snapshots: {
        Row: {
          accuracy_trend: number | null
          best_mock_exam_score: number | null
          completion_trend: number | null
          created_at: string
          current_pass_probability: number | null
          daily_active_days: number | null
          days_until_ready: number | null
          domain_confidence: Json | null
          domain_scores: Json | null
          domain_time_spent: Json | null
          flashcards_mastered: number | null
          id: string
          items_due_for_review: number | null
          latest_mock_exam_score: number | null
          mock_exams_taken: number | null
          modules_completed: number | null
          modules_total: number | null
          overall_accuracy: number | null
          overall_completion_percentage: number | null
          pass_probability_trend: number | null
          practice_sessions_completed: number | null
          questions_mastered: number | null
          snapshot_date: string
          snapshot_type: string | null
          streak_days: number | null
          total_questions_answered: number | null
          total_study_hours: number | null
          user_id: string
          weekly_active_days: number | null
        }
        Insert: {
          accuracy_trend?: number | null
          best_mock_exam_score?: number | null
          completion_trend?: number | null
          created_at?: string
          current_pass_probability?: number | null
          daily_active_days?: number | null
          days_until_ready?: number | null
          domain_confidence?: Json | null
          domain_scores?: Json | null
          domain_time_spent?: Json | null
          flashcards_mastered?: number | null
          id?: string
          items_due_for_review?: number | null
          latest_mock_exam_score?: number | null
          mock_exams_taken?: number | null
          modules_completed?: number | null
          modules_total?: number | null
          overall_accuracy?: number | null
          overall_completion_percentage?: number | null
          pass_probability_trend?: number | null
          practice_sessions_completed?: number | null
          questions_mastered?: number | null
          snapshot_date?: string
          snapshot_type?: string | null
          streak_days?: number | null
          total_questions_answered?: number | null
          total_study_hours?: number | null
          user_id: string
          weekly_active_days?: number | null
        }
        Update: {
          accuracy_trend?: number | null
          best_mock_exam_score?: number | null
          completion_trend?: number | null
          created_at?: string
          current_pass_probability?: number | null
          daily_active_days?: number | null
          days_until_ready?: number | null
          domain_confidence?: Json | null
          domain_scores?: Json | null
          domain_time_spent?: Json | null
          flashcards_mastered?: number | null
          id?: string
          items_due_for_review?: number | null
          latest_mock_exam_score?: number | null
          mock_exams_taken?: number | null
          modules_completed?: number | null
          modules_total?: number | null
          overall_accuracy?: number | null
          overall_completion_percentage?: number | null
          pass_probability_trend?: number | null
          practice_sessions_completed?: number | null
          questions_mastered?: number | null
          snapshot_date?: string
          snapshot_type?: string | null
          streak_days?: number | null
          total_questions_answered?: number | null
          total_study_hours?: number | null
          user_id?: string
          weekly_active_days?: number | null
        }
        Relationships: []
      }
      study_modules: {
        Row: {
          created_at: string
          description: string | null
          domain: string
          estimated_time_minutes: number
          exam_prep: Json
          exam_weight: number
          id: string
          learning_objectives: Json
          mdx_id: string | null
          order_index: number
          references: Json
          title: string
          updated_at: string
          version: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain: string
          estimated_time_minutes?: number
          exam_prep?: Json
          exam_weight: number
          id?: string
          learning_objectives?: Json
          mdx_id?: string | null
          order_index?: number
          references?: Json
          title: string
          updated_at?: string
          version?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          domain?: string
          estimated_time_minutes?: number
          exam_prep?: Json
          exam_weight?: number
          id?: string
          learning_objectives?: Json
          mdx_id?: string | null
          order_index?: number
          references?: Json
          title?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      study_recommendations: {
        Row: {
          actioned_at: string | null
          confidence_score: number | null
          created_at: string
          description: string
          estimated_impact: string | null
          expires_at: string | null
          generated_by: string | null
          id: string
          priority: string | null
          reasoning: string | null
          recommendation_type: string
          related_content_id: string | null
          related_domain: string | null
          related_module_id: string | null
          status: string | null
          suggested_actions: Json | null
          title: string
          updated_at: string
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          actioned_at?: string | null
          confidence_score?: number | null
          created_at?: string
          description: string
          estimated_impact?: string | null
          expires_at?: string | null
          generated_by?: string | null
          id?: string
          priority?: string | null
          reasoning?: string | null
          recommendation_type: string
          related_content_id?: string | null
          related_domain?: string | null
          related_module_id?: string | null
          status?: string | null
          suggested_actions?: Json | null
          title: string
          updated_at?: string
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          actioned_at?: string | null
          confidence_score?: number | null
          created_at?: string
          description?: string
          estimated_impact?: string | null
          expires_at?: string | null
          generated_by?: string | null
          id?: string
          priority?: string | null
          reasoning?: string | null
          recommendation_type?: string
          related_content_id?: string | null
          related_domain?: string | null
          related_module_id?: string | null
          status?: string | null
          suggested_actions?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: []
      }
      study_sections: {
        Row: {
          content: string
          created_at: string
          estimated_time_minutes: number
          id: string
          key_points: Json
          module_id: string
          order_index: number
          playbook: Json | null
          procedures: Json
          references: Json
          section_type: string
          title: string
          troubleshooting: Json
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          estimated_time_minutes?: number
          id?: string
          key_points?: Json
          module_id: string
          order_index: number
          playbook?: Json | null
          procedures?: Json
          references?: Json
          section_type: string
          title: string
          troubleshooting?: Json
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          estimated_time_minutes?: number
          id?: string
          key_points?: Json
          module_id?: string
          order_index?: number
          playbook?: Json | null
          procedures?: Json
          references?: Json
          section_type?: string
          title?: string
          troubleshooting?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sections_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "study_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_module_progress: {
        Row: {
          completed_sections: number | null
          created_at: string
          id: string
          last_updated: string
          module_id: string
          status: string | null
          total_sections: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_sections?: number | null
          created_at?: string
          id?: string
          last_updated?: string
          module_id: string
          status?: string | null
          total_sections?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_sections?: number | null
          created_at?: string
          id?: string
          last_updated?: string
          module_id?: string
          status?: string | null
          total_sections?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_module_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "study_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          exam_session_id: string | null
          id: string
          is_correct: boolean
          metadata: Json | null
          question_id: string
          selected_answer: number
          time_spent_seconds: number | null
          time_taken: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          exam_session_id?: string | null
          id?: string
          is_correct: boolean
          metadata?: Json | null
          question_id: string
          selected_answer: number
          time_spent_seconds?: number | null
          time_taken?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          exam_session_id?: string | null
          id?: string
          is_correct?: boolean
          metadata?: Json | null
          question_id?: string
          selected_answer?: number
          time_spent_seconds?: number | null
          time_taken?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_exam_session_id_fkey"
            columns: ["exam_session_id"]
            isOneToOne: false
            referencedRelation: "exam_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_statistics: {
        Row: {
          accuracy_rate: number | null
          average_time: number | null
          category: string
          correct_answers: number | null
          id: string
          last_updated: string | null
          total_questions: number | null
          user_id: string
        }
        Insert: {
          accuracy_rate?: number | null
          average_time?: number | null
          category: string
          correct_answers?: number | null
          id?: string
          last_updated?: string | null
          total_questions?: number | null
          user_id: string
        }
        Update: {
          accuracy_rate?: number | null
          average_time?: number | null
          category?: string
          correct_answers?: number | null
          id?: string
          last_updated?: string | null
          total_questions?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_statistics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_study_bookmarks: {
        Row: {
          created_at: string
          id: string
          note: string | null
          position: number
          section_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          position?: number
          section_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          position?: number
          section_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_study_bookmarks_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "study_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      user_study_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          module_id: string
          notes: string | null
          section_id: string | null
          status: string
          time_spent_minutes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          module_id: string
          notes?: string | null
          section_id?: string | null
          status?: string
          time_spent_minutes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          module_id?: string
          notes?: string | null
          section_id?: string | null
          status?: string
          time_spent_minutes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_study_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "study_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_study_progress_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "study_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          last_login: string | null
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          last_login?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          last_login?: string | null
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      mv_unified_review_queue: {
        Row: {
          content_id: string | null
          days_overdue: number | null
          domain_id: string | null
          item_type: string | null
          mastery: number | null
          priority_score: number | null
          review_id: string | null
          srs_due: string | null
          srs_ease: number | null
          srs_interval: number | null
          user_id: string | null
        }
        Relationships: []
      }
      question_statistics: {
        Row: {
          advanced_count: number | null
          beginner_count: number | null
          domain: string | null
          intermediate_count: number | null
          percentage: number | null
          question_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      assign_student_to_cohorts: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      auto_generate_flashcards_for_module: {
        Args: { p_module_id: string; p_user_id: string }
        Returns: number
      }
      calculate_global_cohort_benchmarks: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_review_streak: {
        Args: { p_user_id: string }
        Returns: number
      }
      calculate_student_percentiles: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      get_active_learning_path: {
        Args: { p_user_id: string }
        Returns: {
          completed_steps: number
          current_step_index: number
          next_step_id: string
          next_step_title: string
          next_step_type: string
          path_id: string
          path_name: string
          predicted_pass_probability: number
          total_steps: number
        }[]
      }
      get_due_flashcards: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          back_text: string
          card_type: Database["public"]["Enums"]["flashcard_type"]
          front_text: string
          hint: string
          id: string
          srs_due: string
          srs_ease: number
          srs_interval: number
          total_reviews: number
        }[]
      }
      get_due_questions: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          correct_attempts: number
          mastery_level: number
          question_id: string
          review_id: string
          srs_due: string
          srs_ease: number
          srs_interval: number
          total_attempts: number
        }[]
      }
      get_latest_pass_probability: {
        Args: { p_user_id: string }
        Returns: {
          confidence_interval: number
          created_at: string
          probability: number
          recommended_actions: Json
          strengths: Json
          weaknesses: Json
        }[]
      }
      get_library_flashcards_due_for_review: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          back: string
          difficulty: string
          domain: string
          flashcard_library_id: string
          front: string
          hint: string
          next_review_date: string
          streak: number
        }[]
      }
      get_next_recommendation: {
        Args: { p_user_id: string }
        Returns: {
          description: string
          priority: string
          recommendation_id: string
          recommendation_type: string
          suggested_actions: Json
          title: string
        }[]
      }
      get_review_stats: {
        Args: { p_user_id: string }
        Returns: {
          avg_flashcard_retention: number
          avg_question_mastery: number
          current_streak: number
          flashcards_due: number
          flashcards_total: number
          questions_due: number
          questions_total: number
          reviews_this_week: number
          reviews_today: number
          total_due: number
        }[]
      }
      get_review_stats_fast: {
        Args: { p_user_id: string }
        Returns: {
          avg_flashcard_retention: number
          avg_question_mastery: number
          current_streak: number
          flashcards_due: number
          flashcards_total: number
          questions_due: number
          questions_total: number
          reviews_this_week: number
          reviews_today: number
          total_due: number
        }[]
      }
      get_unified_review_queue: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          content_id: string
          due_date: string
          ease_factor: number
          interval_days: number
          item_id: string
          item_type: string
          mastery: number
          priority_score: number
        }[]
      }
      get_unified_review_queue_fast: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          content_id: string
          days_overdue: number
          item_type: string
          mastery: number
          priority_score: number
          review_id: string
          srs_due: string
          srs_ease: number
          srs_interval: number
        }[]
      }
      get_weighted_random_questions: {
        Args: { question_count: number }
        Returns: {
          question_data: Json
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      log_mv_refresh_complete: {
        Args: { p_error?: string; p_log_id: string; p_status: string }
        Returns: undefined
      }
      log_mv_refresh_start: {
        Args: { p_view_name: string }
        Returns: string
      }
      refresh_review_queue: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      update_flashcard_library_progress: {
        Args: {
          p_flashcard_library_id: string
          p_quality_rating: number
          p_user_id: string
        }
        Returns: {
          new_ease_factor: number
          new_interval_days: number
          next_review_date: string
        }[]
      }
    }
    Enums: {
      difficulty_level: "beginner" | "intermediate" | "advanced"
      flashcard_source:
        | "manual"
        | "auto_generated"
        | "quiz_failure"
        | "video_concept"
      flashcard_type: "basic" | "cloze" | "concept" | "diagram" | "code"
      session_type: "practice" | "mock" | "timed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      difficulty_level: ["beginner", "intermediate", "advanced"],
      flashcard_source: [
        "manual",
        "auto_generated",
        "quiz_failure",
        "video_concept",
      ],
      flashcard_type: ["basic", "cloze", "concept", "diagram", "code"],
      session_type: ["practice", "mock", "timed"],
    },
  },
} as const
