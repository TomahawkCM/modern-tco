// src/types/settings.ts
export type AccessibilitySettings = {
  high_contrast?: boolean;
  large_text?: boolean;
  screen_reader?: boolean;
  keyboard_nav?: boolean;
};

export type ExamSettings = {
  strict_timing?: boolean;
  time_limit_minutes?: number | null;
  randomize_questions?: boolean;
  randomize_answers?: boolean;
  show_explanations?: boolean;
  timer_visible?: boolean;
  auto_advance?: boolean;
};

export type NotificationSettings = {
  sound_enabled?: boolean;
  notifications?: boolean;
  study_reminders?: boolean;
};

export type StudySettings = {
  track_progress?: boolean;
  share_anonymous?: boolean;
  detailed_stats?: boolean;
  questions_per_session?: number | null;
  difficulty_progression?: "static" | "adaptive";
  pause_on_incorrect?: boolean;
};

export type UserSettings = {
  theme?: "light" | "dark" | "system";
  language?: string;
  time_zone?: string;
  session_timeout?: number | null;
  accessibility?: AccessibilitySettings;
  exam?: ExamSettings;
  study?: StudySettings;
};
