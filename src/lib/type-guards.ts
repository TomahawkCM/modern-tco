/**
 * Shared type guards and safe access helpers for the Tanium TCO project.
 */

export type UnknownRecord = Record<string, unknown>;

export const isString = (value: unknown): value is string => typeof value === "string";

export const isNumber = (value: unknown): value is number => {
  return typeof value === "number" && !Number.isNaN(value);
};

export const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";

export const isObject = (value: unknown): value is UnknownRecord => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

export const isArray = (value: unknown): value is unknown[] => Array.isArray(value);

export const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every(isString);
};

export const isNotNull = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};

export const hasId = (obj: unknown): obj is { id: string | number } => {
  if (!isObject(obj) || !("id" in obj)) {
    return false;
  }

  const { id } = obj;
  return isString(id) || isNumber(id);
};

export const hasTitle = (obj: unknown): obj is { title: string } => {
  return isObject(obj) && "title" in obj && isString(obj.title);
};

export interface StudyModuleLike {
  id: string | number;
  title: string;
  domain?: string;
  sections?: unknown[];
}

export const isStudyModule = (value: unknown): value is StudyModuleLike => {
  if (!isObject(value) || !hasId(value) || !hasTitle(value)) {
    return false;
  }

  if ("domain" in value && value.domain !== null && !isString(value.domain)) {
    return false;
  }

  if ("sections" in value && value.sections !== null && !isArray(value.sections)) {
    return false;
  }

  return true;
};

export interface StudySectionLike {
  id: string | number;
  title: string;
  module_id: string | number;
  content?: unknown;
}

export const isStudySection = (value: unknown): value is StudySectionLike => {
  if (!isObject(value) || !hasId(value) || !hasTitle(value)) {
    return false;
  }

  if (!("module_id" in value) || (!isString(value.module_id) && !isNumber(value.module_id))) {
    return false;
  }

  return true;
};

export interface BookmarkLike {
  id: string | number;
  section_id: string | number;
  module_id: string | number;
  notes?: string | null;
  section?: unknown;
  module?: unknown;
}

export const isBookmark = (value: unknown): value is BookmarkLike => {
  if (!isObject(value) || !hasId(value)) {
    return false;
  }

  const { section_id, module_id, notes } = value as BookmarkLike;
  if (!isString(section_id) && !isNumber(section_id)) {
    return false;
  }

  if (!isString(module_id) && !isNumber(module_id)) {
    return false;
  }

  if (notes !== undefined && notes !== null && !isString(notes)) {
    return false;
  }

  return true;
};

export interface ProgressRecordLike {
  completed: number;
  total: number;
}

export const isProgressRecord = (value: unknown): value is ProgressRecordLike => {
  if (!isObject(value)) {
    return false;
  }

  const record = value;
  const { completed, total } = record as unknown as ProgressRecordLike;
  return isNumber(completed) && isNumber(total);
};

export interface QuestionLike {
  id: string;
  question: string;
  choices: unknown[];
  correctAnswerId: string;
}

export const isQuestion = (value: unknown): value is QuestionLike => {
  if (!isObject(value)) {
    return false;
  }

  const record = value;
  const { id, question, choices, correctAnswerId } = record as unknown as QuestionLike;
  return isString(id) && isString(question) && Array.isArray(choices) && isString(correctAnswerId);
};

export interface ChoiceLike {
  id: string;
  text: string;
}

export const isChoice = (value: unknown): value is ChoiceLike => {
  if (!isObject(value)) {
    return false;
  }

  const record = value;
  const { id, text } = record as unknown as ChoiceLike;
  return isString(id) && isString(text);
};

export interface ExamSessionLike {
  id: string;
  mode: string;
  questions: unknown[];
  currentIndex: number;
  answers: UnknownRecord;
  startTime: Date | string | number;
  completed: boolean;
}

export const isExamSession = (value: unknown): value is ExamSessionLike => {
  if (!isObject(value)) {
    return false;
  }

  const record = value;
  const { id, mode, questions, currentIndex, answers, startTime, completed } = record as unknown as ExamSessionLike;
  return (
    isString(id) &&
    isString(mode) &&
    Array.isArray(questions) &&
    isNumber(currentIndex) &&
    isObject(answers) &&
    ((startTime instanceof Date && !Number.isNaN(startTime.getTime())) || isString(startTime) || isNumber(startTime)) &&
    isBoolean(completed)
  );
};

export const safeStringAccess = (obj: unknown, key: string): string => {
  if (isObject(obj) && key in obj && isString(obj[key])) {
    return obj[key];
  }
  return "";
};

export const safeNumberAccess = (obj: unknown, key: string): number => {
  if (isObject(obj) && key in obj && isNumber(obj[key])) {
    return obj[key];
  }
  return 0;
};

export const safeBooleanAccess = (obj: unknown, key: string): boolean => {
  if (isObject(obj) && key in obj && isBoolean(obj[key])) {
    return obj[key];
  }
  return false;
};

export const safeArrayAccess = (obj: unknown, key: string): unknown[] => {
  if (isObject(obj) && key in obj && Array.isArray(obj[key])) {
    return obj[key] as unknown[];
  }
  return [];
};

export const safeStringArrayAccess = (obj: unknown, key: string): string[] => {
  if (isObject(obj) && key in obj && isStringArray(obj[key])) {
    return obj[key];
  }
  return [];
};

export const safeDate = (value: unknown): Date => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (isString(value) || isNumber(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return new Date();
};

export const safeJsonParse = <T>(value: string, fallback: T): T => {
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    return fallback;
  }
};

export const safeArrayIndex = <T>(array: T[], index: number): T | null => {
  if (Array.isArray(array) && index >= 0 && index < array.length) {
    return array[index] ?? null;
  }
  return null;
};
