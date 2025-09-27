"use client";

import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Listen for changes to localStorage from other tabs/windows
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  return [storedValue, setValue] as const;
}

export function useSessionStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

// Hook for persisting exam session data
export function usePersistentExamSession() {
  return useSessionStorage("tco-exam-session", null);
}

// Hook for user preferences
export function useUserPreferences() {
  const defaultPreferences = {
    theme: "dark",
    soundEnabled: true,
    notifications: true,
    practiceMode: "adaptive",
    showExplanations: true,
    timerVisible: true,
    autoAdvance: false,
    studyReminders: true,
    examSimulation: true,
    strictTiming: true,
    randomizeQuestions: true,
    randomizeAnswers: true,
    trackProgress: true,
    shareAnonymous: false,
    detailedStats: true,
    highContrast: false,
    largeText: false,
    screenReader: false,
    keyboardNav: true,
  };

  return useLocalStorage("tco-user-preferences", defaultPreferences);
}

// Hook for study analytics
export function useStudyAnalytics() {
  const defaultAnalytics = {
    sessionsCompleted: 0,
    totalTimeStudied: 0,
    questionsAnswered: 0,
    averageScore: 0,
    lastStudyDate: null,
    studyStreak: 0,
    domainProgress: {},
    weeklyGoal: 5,
    achievements: [],
  };

  return useLocalStorage("tco-study-analytics", defaultAnalytics);
}
