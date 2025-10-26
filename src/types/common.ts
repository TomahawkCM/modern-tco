/**
 * Common type definitions for type-safe operations
 * Addresses @typescript-eslint/no-unsafe-* operations
 */

// Generic utility types
export type SafeRecord<K extends string | number | symbol, V> = Record<K, V>;
export type SafeAny = Record<string, unknown>;
export type SafeJson = string | number | boolean | null | SafeJson[] | { [key: string]: SafeJson };

// Database entity base types
export interface BaseEntity {
  id: string | number;
  created_at?: string;
  updated_at?: string;
}

export interface TimestampedEntity extends BaseEntity {
  created_at: string;
  updated_at: string;
}

// User study progress types
export interface SafeUserProgress {
  user_id: string;
  section_id: string;
  module_id: string;
  status: "not_started" | "in_progress" | "completed" | "bookmarked";
  completion_percentage: number;
  last_accessed: string;
  completed_at?: string;
}

// Study module types with proper typing
export interface SafeStudyModule extends BaseEntity {
  title: string;
  description: string;
  domain: string;
  order_index: number;
  learning_objectives: string[];
  references: string[];
  exam_prep: {
    description: string;
    exam_focus: string[];
    practice_labs: string[];
  };
  sections?: SafeStudySection[];
}

export interface SafeStudySection extends BaseEntity {
  module_id: string;
  title: string;
  description: string;
  section_type: string;
  order_index: number;
  content: {
    overview: string;
    key_points: string[];
    procedures: string[];
    troubleshooting: string[];
    references: string[];
  };
  key_points: string[];
  procedures: string[];
  troubleshooting: string[];
  references: string[];
  playbook?: SafeJson;
  module?: SafeStudyModule;
}

// Bookmark types
export interface SafeBookmark extends BaseEntity {
  user_id: string;
  section_id: string;
  module_id: string;
  notes?: string;
  section?: SafeStudySection;
  module?: SafeStudyModule;
}

// Question and exam types
export interface SafeChoice {
  id: string;
  text: string;
}

export interface SafeQuestion extends BaseEntity {
  question: string;
  choices: SafeChoice[];
  correctAnswerId: string;
  domain: string;
  difficulty: string;
  category: string;
  explanation?: string;
  tags?: string[];
  moduleId?: string;
  objectiveIds?: string[];
}

export interface SafeExamSession extends BaseEntity {
  mode: "practice" | "mock" | "review";
  questions: SafeQuestion[];
  currentIndex: number;
  answers: SafeRecord<string, string>;
  startTime: Date;
  endTime?: Date;
  score?: number;
  completed: boolean;
}

// Progress and statistics types
export interface SafeModuleProgress {
  completed: number;
  total: number;
  percentage: number;
}

export interface SafeProgressStats {
  totalSections: number;
  completedSections: number;
  inProgressSections: number;
  totalBookmarks: number;
  progressByModule: SafeRecord<string, SafeModuleProgress>;
}

export interface SafeOverallStats {
  total: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  completionRate: number;
}

// API response types
export interface SafeApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface SafePaginatedResponse<T> extends SafeApiResponse<T[]> {
  page: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Form and input types
export interface SafeFormData {
  [key: string]: string | number | boolean | string[] | undefined;
}

export interface SafeValidationError {
  field: string;
  message: string;
}

export interface SafeFormState {
  data: SafeFormData;
  errors: SafeValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// Study guide types
export interface SafeStudyGuideSection {
  id: string;
  title: string;
  level: number;
  content: string;
  completed: boolean;
}

export interface SafeStudyGuideCheckpoint {
  id: string;
  sectionId: string;
  type: "knowledge-check" | "hands-on";
  question: string;
  completed: boolean;
}

export interface SafeStudyGuide extends BaseEntity {
  moduleId: string;
  title: string;
  description: string;
  content: string;
  sections: SafeStudyGuideSection[];
  checkpoints: SafeStudyGuideCheckpoint[];
  estimatedReadingTime: number;
  lastUpdated: Date;
}

export interface SafeGuideProgress {
  readingProgress: number;
  sectionsRead: string[];
  checkpointsCompleted: string[];
  notes: SafeRecord<string, string>;
  lastPosition: string;
  totalReadingTime: number;
}

// KB (Knowledge Base) types
export interface SafeKbModule extends BaseEntity {
  title: string;
  domain: string;
  metadata: {
    lessons: unknown[];
  };
}

export interface SafeKbSummary {
  hasKbTables: boolean;
  modulesCount: number;
  questionsCount: number;
  byDomain: SafeRecord<string, number>;
}

// Navigation and route types
export interface SafeRouteParams {
  [key: string]: string | string[] | undefined;
}

export interface SafeSearchParams {
  [key: string]: string | string[] | undefined;
}

// Component prop types
export interface SafeComponentProps {
  children?: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}

// Async operation types
export interface SafeAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface SafeAsyncActions<T> {
  execute: (...args: unknown[]) => Promise<T>;
  reset: () => void;
  setData: (data: T) => void;
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
}

// Event handler types
export type SafeEventHandler<T = Event> = (event: T) => void;
export type SafeAsyncEventHandler<T = Event> = (event: T) => Promise<void>;
export type SafeClickHandler = SafeEventHandler<React.MouseEvent>;
export type SafeChangeHandler = SafeEventHandler<React.ChangeEvent<HTMLInputElement>>;
export type SafeSubmitHandler = SafeEventHandler<React.FormEvent>;

// Utility type helpers
export type SafePartial<T> = {
  [P in keyof T]?: T[P];
};

export type SafeRequired<T> = {
  [P in keyof T]-?: T[P];
};

export type SafeNonNull<T> = T extends null | undefined ? never : T;

export type SafeKeysOf<T> = keyof T;

export type SafeValuesOf<T> = T[keyof T];

// Function types
export type SafeFunction = (...args: unknown[]) => unknown;
export type SafeAsyncFunction = (...args: unknown[]) => Promise<unknown>;
export type SafeVoidFunction = () => void;
export type SafeAsyncVoidFunction = () => Promise<void>;

// Error types
export interface SafeError {
  message: string;
  code?: string | number;
  details?: SafeRecord<string, unknown>;
  stack?: string;
}

export interface SafeValidationErrors {
  [field: string]: string[];
}

export interface SafeApiError extends SafeError {
  status?: number;
  statusText?: string;
  url?: string;
}
