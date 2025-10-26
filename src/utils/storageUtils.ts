/**
 * Enhanced Storage Utilities with Validation and Error Recovery
 * Provides robust localStorage/sessionStorage operations with corruption prevention
 */

export interface StorageOptions<TValue = unknown> {
  fallback?: TValue;
  validate?: (data: unknown) => data is TValue;
  sanitize?: (data: unknown) => TValue;
  maxRetries?: number;
  backupKey?: string;
}

export class StorageError extends Error {
  constructor(
    public key: string,
    public operation: "get" | "set" | "remove",
    public originalError?: unknown
  ) {
    super(`Storage operation failed: ${operation} ${key}`);
    this.name = "StorageError";
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const isString = (value: unknown): value is string => typeof value === "string";

const isNumber = (value: unknown): value is number => {
  return typeof value === "number" && !Number.isNaN(value);
};

const isBoolean = (value: unknown): value is boolean => typeof value === "boolean";

const isStringArray = (value: unknown): value is string[] => {
  return Array.isArray(value) && value.every(isString);
};

const parseJson = (raw: string): unknown => {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
};

const isQuotaExceededError = (error: unknown): boolean => {
  return (
    error instanceof DOMException &&
    (error.code === 22 ||
      error.name === "QuotaExceededError" ||
      error.name === "NS_ERROR_DOM_QUOTA_REACHED")
  );
};

const clampNumber = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value));
};

/**
 * Enhanced localStorage operations with validation and error recovery
 */
export const safeLocalStorage = {
  /**
   * Get item with comprehensive error handling
   */
  getItem<TValue = unknown>(key: string, options: StorageOptions<TValue> = {}): TValue | null {
    const { validate, sanitize, maxRetries = 1, backupKey, fallback } = options;
    const fallbackValue = fallback ?? null;

    for (let attempt = 0; attempt < maxRetries; attempt += 1) {
      try {
        if (typeof window === "undefined") {
          return fallbackValue;
        }

        const storage = window.localStorage;
        const rawValue = storage.getItem(key);
        if (rawValue === null) {
          return fallbackValue;
        }

        let parsedValue = parseJson(rawValue);

        if (parsedValue === null && backupKey && attempt === 0) {
          const backupRaw = storage.getItem(backupKey);
          parsedValue = backupRaw !== null ? parseJson(backupRaw) : null;
        }

        if (parsedValue === null) {
          throw new StorageError(key, "get");
        }

        if (validate && !validate(parsedValue)) {
          safeLocalStorage.removeItem(key);
          if (backupKey) {
            safeLocalStorage.removeItem(backupKey);
          }
          return fallbackValue;
        }

        const result = sanitize ? sanitize(parsedValue) : (parsedValue as TValue);
        return result ?? fallbackValue;
      } catch (error) {
        if (attempt === maxRetries - 1) {
          try {
            safeLocalStorage.removeItem(key);
            if (backupKey) {
              safeLocalStorage.removeItem(backupKey);
            }
          } catch {
            // ignore cleanup failure
          }

          if (error instanceof StorageError && error.originalError) {
            // Swallow error but preserve context for debugging
            console.warn(error);
          }

          return fallbackValue;
        }
      }
    }

    return fallbackValue;
  },

  /**
   * Set item with validation and backup creation
   */
  setItem<TValue = unknown>(key: string, value: TValue, options: StorageOptions<TValue> = {}): boolean {
    const { validate, sanitize, backupKey } = options;

    try {
      if (typeof window === "undefined") {
        return false;
      }

      const storage = window.localStorage;
      const candidate: unknown = value;

      if (validate && !validate(candidate)) {
        return false;
      }

      const sanitizedValue = sanitize ? sanitize(candidate) : candidate;
      const serialized = JSON.stringify(sanitizedValue);

      if (backupKey) {
        const existing = storage.getItem(key);
        if (existing !== null) {
          try {
            storage.setItem(backupKey, existing);
          } catch {
            // ignore backup failure
          }
        }
      }

      storage.setItem(key, serialized);
      return true;
    } catch (error) {
      if (isQuotaExceededError(error)) {
        this.cleanup();
        try {
          if (typeof window === "undefined") {
            return false;
          }
          window.localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch {
          return false;
        }
      }

      return false;
    }
  },

  /**
   * Remove item with error handling
   */
  removeItem(key: string): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Check if key exists and has valid data
   */
  hasValidItem(key: string, validate?: (data: unknown) => data is unknown): boolean {
    try {
      const item = this.getItem(key, { validate });
      return item !== null;
    } catch {
      return false;
    }
  },

  /**
   * Clean up corrupted or old data
   */
  cleanup(): void {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const storage = window.localStorage;
      const keysToRemove: string[] = [];
      const now = Date.now();
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (!key) {
          continue;
        }

        const rawValue = storage.getItem(key);
        if (rawValue === null) {
          keysToRemove.push(key);
          continue;
        }

        const parsedValue = parseJson(rawValue);
        if (!isRecord(parsedValue)) {
          keysToRemove.push(key);
          continue;
        }

        if (key.includes("-timestamp") || key.includes("-backup")) {
          const { timestamp } = parsedValue as { timestamp?: unknown };
          if (isNumber(timestamp) && now - timestamp > maxAge) {
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach((key) => {
        try {
          storage.removeItem(key);
        } catch {
          // ignore removal failure
        }
      });
    } catch {
      // ignore cleanup failure
    }
  },

  /**
   * Get storage usage statistics
   */
  getUsageStats(): { used: number; total: number; percentage: number } {
    if (typeof window === "undefined") {
      return { used: 0, total: 0, percentage: 0 };
    }

    try {
      const storage = window.localStorage;
      let used = 0;

      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (!key) {
          continue;
        }

        const rawValue = storage.getItem(key);
        if (rawValue !== null) {
          used += key.length + rawValue.length;
        }
      }

      const estimated = 5 * 1024 * 1024; // 5MB estimate
      return {
        used,
        total: estimated,
        percentage: estimated === 0 ? 0 : Math.round((used / estimated) * 100),
      };
    } catch {
      return { used: 0, total: 0, percentage: 0 };
    }
  },
};

/**
 * Enhanced sessionStorage operations with same safety features
 */
export const safeSessionStorage = {
  getItem<TValue = unknown>(key: string, options: StorageOptions<TValue> = {}): TValue | null {
    const { validate, sanitize, fallback } = options;
    const fallbackValue = fallback ?? null;

    try {
      if (typeof window === "undefined") {
        return fallbackValue;
      }

      const storage = window.sessionStorage;
      const rawValue = storage.getItem(key);
      if (rawValue === null) {
        return fallbackValue;
      }

      const parsedValue = parseJson(rawValue);
      if (parsedValue === null) {
        this.removeItem(key);
        return fallbackValue;
      }

      if (validate && !validate(parsedValue)) {
        this.removeItem(key);
        return fallbackValue;
      }

      const result = sanitize ? sanitize(parsedValue) : (parsedValue as TValue);
      return result ?? fallbackValue;
    } catch {
      this.removeItem(key);
      return fallbackValue;
    }
  },

  setItem<TValue = unknown>(key: string, value: TValue, options: StorageOptions<TValue> = {}): boolean {
    const { validate, sanitize } = options;

    try {
      if (typeof window === "undefined") {
        return false;
      }

      const candidate: unknown = value;
      if (validate && !validate(candidate)) {
        return false;
      }

      const sanitizedValue = sanitize ? sanitize(candidate) : candidate;
      window.sessionStorage.setItem(key, JSON.stringify(sanitizedValue));
      return true;
    } catch {
      return false;
    }
  },

  removeItem(key: string): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    try {
      window.sessionStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};

/**
 * Data validators for common TCO application data structures
 */
export const validators = {
  examSession: (data: unknown): data is Record<string, unknown> => {
    if (!isRecord(data)) {
      return false;
    }

    const { questions, answers, startTime } = data as {
      questions?: unknown;
      answers?: unknown;
      startTime?: unknown;
    };

    return (
      isString(data.id) &&
      isString(data.mode) &&
      Array.isArray(questions) &&
      isNumber(data.currentIndex) &&
      isRecord(answers) &&
      (startTime instanceof Date || isString(startTime) || isNumber(startTime)) &&
      ("completed" in data ? isBoolean(data.completed) : true)
    );
  },

  settings: (data: unknown): data is Record<string, unknown> => {
    if (!isRecord(data)) {
      return false;
    }

    return (
      isString(data.theme) &&
      isString(data.language) &&
      isString(data.difficulty)
    );
  },

  progress: (data: unknown): data is Record<string, unknown> => {
    if (!isRecord(data)) {
      return false;
    }

    return (
      isNumber(data.totalQuestions) &&
      isNumber(data.correctAnswers) &&
      isNumber(data.averageScore) &&
      isRecord(data.domainScores)
    );
  },

  searchHistory: (data: unknown): data is string[] => {
    return isStringArray(data);
  },
};

/**
 * Data sanitizers for cleaning corrupted data
 */
export const sanitizers = {
  examSession: (data: unknown): Record<string, unknown> => {
    const record = isRecord(data) ? data : {};
    const {
      id: rawId,
      mode: rawMode,
      questions: rawQuestions,
      currentIndex: rawCurrentIndex,
      answers: rawAnswers,
      startTime: rawStartTime,
      score: rawScore,
      completed: rawCompleted,
    } = record as {
      id?: unknown;
      mode?: unknown;
      questions?: unknown;
      currentIndex?: unknown;
      answers?: unknown;
      startTime?: unknown;
      score?: unknown;
      completed?: unknown;
    };

    const id = isString(rawId) ? rawId : `session-${Date.now()}`;
    const mode = isString(rawMode) ? rawMode : "practice";
    const questions = Array.isArray(rawQuestions) ? rawQuestions : [];
    const currentIndex = isNumber(rawCurrentIndex) ? Math.max(0, rawCurrentIndex) : 0;
    const answers = isRecord(rawAnswers) ? rawAnswers : {};

    const startValue = rawStartTime;
    let startTime: Date;
    if (startValue instanceof Date && !Number.isNaN(startValue.getTime())) {
      startTime = startValue;
    } else if (isString(startValue) || isNumber(startValue)) {
      const parsedDate = new Date(startValue);
      startTime = Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    } else {
      startTime = new Date();
    }

    const scoreValue = isNumber(rawScore) ? rawScore : 0;
    const normalizedScore = clampNumber(scoreValue, 0, 100);

    return {
      id,
      mode,
      questions,
      currentIndex,
      answers,
      startTime,
      completed: rawCompleted === true,
      score: normalizedScore,
    };
  },

  settings: (data: unknown): Record<string, unknown> => {
    const record = isRecord(data) ? data : {};
    const {
      theme: rawTheme,
      difficulty: rawDifficulty,
      language: rawLanguage,
      notifications: rawNotifications,
      autoSave: rawAutoSave,
    } = record as {
      theme?: unknown;
      difficulty?: unknown;
      language?: unknown;
      notifications?: unknown;
      autoSave?: unknown;
    };

    const allowedThemes = new Set(["light", "dark"]);
    const theme = isString(rawTheme) && allowedThemes.has(rawTheme)
      ? rawTheme
      : "light";

    const allowedDifficulty = new Set(["easy", "medium", "hard"]);
    const difficulty = isString(rawDifficulty) && allowedDifficulty.has(rawDifficulty)
      ? rawDifficulty
      : "medium";

    const language = isString(rawLanguage) ? rawLanguage : "en";

    return {
      theme,
      language,
      difficulty,
      notifications: isBoolean(rawNotifications)
        ? rawNotifications
        : Boolean(rawNotifications),
      autoSave: isBoolean(rawAutoSave) ? rawAutoSave : Boolean(rawAutoSave),
    };
  },
};
