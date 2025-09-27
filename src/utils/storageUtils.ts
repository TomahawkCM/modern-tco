/**
 * Enhanced Storage Utilities with Validation and Error Recovery
 * Provides robust localStorage/sessionStorage operations with corruption prevention
 */

export interface StorageOptions {
  fallback?: unknown;
  validate?: (data: unknown) => boolean;
  sanitize?: (data: unknown) => unknown;
  maxRetries?: number;
  backupKey?: string;
}

export class StorageError extends Error {
  constructor(
    public key: string,
    public operation: "get" | "set" | "remove",
    public originalError?: Error
  ) {
    super(`Storage operation failed: ${operation} ${key}`);
    this.name = "StorageError";
  }
}

/**
 * Enhanced localStorage operations with validation and error recovery
 */
export const safeLocalStorage = {
  /**
   * Get item with comprehensive error handling
   */
  getItem<T = unknown>(key: string, options: StorageOptions = {}): T | null {
    const { validate, sanitize, maxRetries = 1, backupKey } = options;
    const fallbackValue = (options.fallback as T | null) ?? null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Check if localStorage is available
        if (typeof window === "undefined" || !window.localStorage) {
          return fallbackValue;
        }

        const item = window.localStorage.getItem(key);
        if (item === null) {
          return fallbackValue;
        }

        let parsedData: T;
        try {
          parsedData = JSON.parse(item);
        } catch (parseError) {
          // Try backup key if available
          if (backupKey && attempt === 0) {
            const backupItem = window.localStorage.getItem(backupKey);
            if (backupItem) {
              parsedData = JSON.parse(backupItem);
            } else {
              throw parseError;
            }
          } else {
            throw parseError;
          }
        }

        // Validate data structure if validator provided
        if (validate && !validate(parsedData)) {
          this.removeItem(key); // Remove corrupted data
          return fallbackValue;
        }

        // Sanitize data if sanitizer provided
        if (sanitize) {
          parsedData = sanitize(parsedData) as T;
        }

        return parsedData;
      } catch {
        if (attempt === maxRetries - 1) {
          // Final attempt failed, clean up corrupted data
          try {
            this.removeItem(key);
            if (backupKey) {
              this.removeItem(backupKey);
            }
          } catch {
            // Silently handle cleanup errors in production
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
  setItem<T = unknown>(key: string, value: T, options: StorageOptions = {}): boolean {
    const { validate, sanitize, backupKey } = options;

    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return false;
      }

      let dataToStore = value;

      // Validate data before storing
      if (validate && !validate(dataToStore)) {
        return false;
      }

      // Sanitize data if sanitizer provided
      if (sanitize) {
        dataToStore = sanitize(dataToStore) as T;
      }

      const serializedData = JSON.stringify(dataToStore);

      // Create backup before overwriting if backup key provided
      if (backupKey) {
        const existingData = window.localStorage.getItem(key);
        if (existingData) {
          try {
            window.localStorage.setItem(backupKey, existingData);
          } catch {
            // Silently handle backup errors in production
          }
        }
      }

      window.localStorage.setItem(key, serializedData);
      return true;
    } catch (error) {
      // If quota exceeded, try to free up space
      if (error instanceof DOMException && error.code === 22) {
        this.cleanup();

        // Retry once after cleanup
        try {
          window.localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch {
          // Silently handle retry errors in production
        }
      }

      return false;
    }
  },

  /**
   * Remove item with error handling
   */
  removeItem(key: string): boolean {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return false;
      }

      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Check if key exists and has valid data
   */
  hasValidItem(key: string, validate?: (data: unknown) => boolean): boolean {
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
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return;
      }

      const keysToRemove: string[] = [];
      const now = Date.now();
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (!key) continue;

        try {
          const item = window.localStorage.getItem(key);
          if (!item) {
            keysToRemove.push(key);
            continue;
          }

          // Try to parse to check if corrupted
          JSON.parse(item);

          // Check if it's a timestamped item and too old
          if (key.includes("-timestamp") || key.includes("-backup")) {
            const data = JSON.parse(item);
            if (typeof data === "object" && data.timestamp && now - data.timestamp > maxAge) {
              keysToRemove.push(key);
            }
          }
        } catch {
          // Corrupted data, mark for removal
          keysToRemove.push(key);
        }
      }

      // Remove identified items
      keysToRemove.forEach((key) => {
        try {
          window.localStorage.removeItem(key);
        } catch {
          // Silently handle removal errors in production
        }
      });
    } catch {
      // Silently handle cleanup errors in production
    }
  },

  /**
   * Get storage usage statistics
   */
  getUsageStats(): { used: number; total: number; percentage: number } {
    try {
      if (typeof window === "undefined" || !window.localStorage) {
        return { used: 0, total: 0, percentage: 0 };
      }

      let used = 0;
      for (const key in window.localStorage) {
        if (window.localStorage.hasOwnProperty(key)) {
          used += window.localStorage[key].length + key.length;
        }
      }

      // Most browsers have 5-10MB localStorage limit
      const estimated = 5 * 1024 * 1024; // 5MB estimate
      return {
        used,
        total: estimated,
        percentage: Math.round((used / estimated) * 100),
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
  getItem<T = unknown>(key: string, options: StorageOptions = {}): T | null {
    const { validate, sanitize } = options;
    const fallbackValue = (options.fallback as T | null) ?? null;

    try {
      if (typeof window === "undefined" || !window.sessionStorage) {
        return fallbackValue;
      }

      const item = window.sessionStorage.getItem(key);
      if (item === null) {
        return fallbackValue;
      }

      let parsedData: T = JSON.parse(item);

      if (validate && !validate(parsedData)) {
        this.removeItem(key);
        return fallbackValue;
      }

      if (sanitize) {
        parsedData = sanitize(parsedData) as T;
      }

      return parsedData;
    } catch {
      this.removeItem(key);
      return fallbackValue;
    }
  },

  setItem<T = unknown>(key: string, value: T): boolean {
    try {
      if (typeof window === "undefined" || !window.sessionStorage) {
        return false;
      }

      window.sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  removeItem(key: string): boolean {
    try {
      if (typeof window === "undefined" || !window.sessionStorage) {
        return false;
      }

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
    return (
      data !== null &&
      typeof data === "object" &&
      data !== null &&
      typeof (data as Record<string, unknown>).id === "string" &&
      typeof (data as Record<string, unknown>).mode === "string" &&
      Array.isArray((data as Record<string, unknown>).questions) &&
      typeof (data as Record<string, unknown>).currentIndex === "number" &&
      typeof (data as Record<string, unknown>).answers === "object" &&
      Boolean((data as Record<string, unknown>).startTime)
    );
  },

  settings: (data: unknown): data is Record<string, unknown> => {
    return (
      data !== null &&
      typeof data === "object" &&
      typeof (data as Record<string, unknown>).theme === "string" &&
      typeof (data as Record<string, unknown>).language === "string" &&
      typeof (data as Record<string, unknown>).difficulty === "string"
    );
  },

  progress: (data: unknown): data is Record<string, unknown> => {
    return (
      data !== null &&
      typeof data === "object" &&
      typeof (data as Record<string, unknown>).totalQuestions === "number" &&
      typeof (data as Record<string, unknown>).correctAnswers === "number" &&
      typeof (data as Record<string, unknown>).averageScore === "number" &&
      typeof (data as Record<string, unknown>).domainScores === "object"
    );
  },

  searchHistory: (data: unknown): data is string[] => {
    return Array.isArray(data) && data.every((item) => typeof item === "string");
  },
};

/**
 * Data sanitizers for cleaning corrupted data
 */
export const sanitizers = {
  examSession: (data: unknown): Record<string, unknown> => {
    const obj = data as Record<string, unknown>;
    return {
      id: (typeof obj?.id === "string" ? obj.id : null) ?? `session-${Date.now()}`,
      mode: (typeof obj?.mode === "string" ? obj.mode : null) ?? "practice",
      questions: Array.isArray(obj?.questions) ? obj.questions : [],
      currentIndex: Math.max(0, (typeof obj?.currentIndex === "number" ? obj.currentIndex : null) ?? 0),
      answers: (typeof obj?.answers === "object" && obj?.answers !== null ? obj.answers : null) ?? {},
      startTime: obj?.startTime ? new Date(obj.startTime as string | number | Date) : new Date(),
      completed: Boolean(obj?.completed),
      score: Math.max(0, Math.min(100, (typeof obj?.score === "number" ? obj.score : null) ?? 0)),
    };
  },

  settings: (data: unknown): Record<string, unknown> => {
    const obj = data as Record<string, unknown>;
    const theme = typeof obj?.theme === "string" ? obj.theme : "light";
    const difficulty = typeof obj?.difficulty === "string" ? obj.difficulty : "medium";
    
    return {
      theme: ["light", "dark"].includes(theme as string) ? theme : "light",
      language: typeof obj?.language === "string" ? obj.language : "en",
      difficulty: ["easy", "medium", "hard"].includes(difficulty as string) ? difficulty : "medium",
      notifications: Boolean(obj?.notifications),
      autoSave: Boolean(obj?.autoSave),
    };
  },
};
