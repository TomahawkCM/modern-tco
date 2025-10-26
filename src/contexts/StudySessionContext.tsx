"use client";

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";

// Section shape matching ModuleRenderer
export interface StudySection {
  id: string;
  title: string;
  completed: boolean;
  needsReview: boolean;
  etaMin?: number;
}

export type SectionStatus = 'not_started' | 'in_progress' | 'completed' | 'needs_review';

interface StudySessionContextType {
  // Current module being studied
  moduleId: string | null;
  sections: StudySection[];
  activeId: string | null;
  lastViewed: string | null;
  activeTab: 'content' | 'review';

  // Actions
  markSection: (id: string, status: SectionStatus) => Promise<void>;
  setLastViewed: (id: string) => void;
  setActiveId: (id: string) => void;
  setActiveTab: (tab: 'content' | 'review') => void;
  markAllComplete: () => Promise<void>;
  clearAllReview: () => Promise<void>;
  resetProgress: () => Promise<void>;
}

const StudySessionContext = createContext<StudySessionContextType | null>(null);

interface StudySessionProviderProps {
  children: ReactNode;
  moduleId: string;
  sections: StudySection[];
  activeId: string | null;
  lastViewed: string | null;
  activeTab?: 'content' | 'review';
  onMarkSection: (id: string, status: SectionStatus) => Promise<void>;
  onSetLastViewed: (id: string) => void;
  onSetActiveId: (id: string) => void;
  onSetActiveTab?: (tab: 'content' | 'review') => void;
  onMarkAllComplete: () => Promise<void>;
  onClearAllReview: () => Promise<void>;
  onResetProgress: () => Promise<void>;
}

export function StudySessionProvider({
  children,
  moduleId,
  sections,
  activeId,
  lastViewed,
  activeTab = 'content',
  onMarkSection,
  onSetLastViewed,
  onSetActiveId,
  onSetActiveTab,
  onMarkAllComplete,
  onClearAllReview,
  onResetProgress,
}: StudySessionProviderProps) {
  const [currentTab, setCurrentTab] = useState<'content' | 'review'>(activeTab);

  const handleSetActiveTab = useCallback((tab: 'content' | 'review') => {
    setCurrentTab(tab);
    onSetActiveTab?.(tab);
  }, [onSetActiveTab]);

  const value: StudySessionContextType = {
    moduleId,
    sections,
    activeId,
    lastViewed,
    activeTab: currentTab,
    markSection: onMarkSection,
    setLastViewed: onSetLastViewed,
    setActiveId: onSetActiveId,
    setActiveTab: handleSetActiveTab,
    markAllComplete: onMarkAllComplete,
    clearAllReview: onClearAllReview,
    resetProgress: onResetProgress,
  };

  return (
    <StudySessionContext.Provider value={value}>
      {children}
    </StudySessionContext.Provider>
  );
}

export function useStudySession(): StudySessionContextType | null {
  return useContext(StudySessionContext);
}

// Hook with error throwing for components that require study session
export function useRequiredStudySession(): StudySessionContextType {
  const context = useContext(StudySessionContext);
  if (!context) {
    throw new Error("useRequiredStudySession must be used within a StudySessionProvider");
  }
  return context;
}
