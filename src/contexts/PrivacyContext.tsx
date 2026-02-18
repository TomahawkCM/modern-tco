"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * Privacy Mode Context
 * Allows users to blur all financial values for screen-sharing or public use.
 * Keyboard shortcut: Cmd+Shift+P (Mac) / Ctrl+Shift+P (Windows/Linux)
 */

interface PrivacyContextType {
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
  setPrivacyMode: (enabled: boolean) => void;
}

const STORAGE_KEY = "budget-privacy-mode";

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        setIsPrivacyMode(JSON.parse(saved) === true);
      }
    } catch (error) {
      console.error("Failed to load privacy mode setting:", error);
    }
    setIsHydrated(true);
  }, []);

  // Persist to localStorage when value changes
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(isPrivacyMode));
      } catch (error) {
        console.error("Failed to save privacy mode setting:", error);
      }
    }
  }, [isPrivacyMode, isHydrated]);

  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue !== null) {
        try {
          setIsPrivacyMode(JSON.parse(event.newValue) === true);
        } catch (error) {
          console.error("Failed to sync privacy mode setting:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Keyboard shortcut: Cmd+Shift+P / Ctrl+Shift+P
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "p") {
        event.preventDefault();
        setIsPrivacyMode((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const togglePrivacyMode = useCallback(() => {
    setIsPrivacyMode((prev) => !prev);
  }, []);

  const setPrivacyMode = useCallback((enabled: boolean) => {
    setIsPrivacyMode(enabled);
  }, []);

  const value: PrivacyContextType = {
    isPrivacyMode,
    togglePrivacyMode,
    setPrivacyMode,
  };

  return <PrivacyContext.Provider value={value}>{children}</PrivacyContext.Provider>;
}

/**
 * Hook to access Privacy Mode context
 * @throws Error if used outside of PrivacyProvider
 */
export function usePrivacy(): PrivacyContextType {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error("usePrivacy must be used within a PrivacyProvider");
  }
  return context;
}
