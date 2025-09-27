"use client";

import { type ModuleProgress } from "@/types/module";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
// import { modules } from "@/data/modules";
import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/hooks/useDatabase";
import { supabase } from "@/lib/supabase";
import { TCODomain } from "@/types/exam";

// Simple modules array for ModuleContext
// This is a placeholder until proper module definitions are created
interface Module {
  id: string;
  title: string;
  description: string;
  domain: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: number;
  objectives: Array<{ id: string; description: string }>;
  sections: Array<{ id: string; title: string }>;
}

const modules: Module[] = [
  {
    id: "platform-basics",
    title: "Platform Basics",
    description: "Learn the fundamentals of the Tanium platform",
    domain: "Asking Questions",
    difficulty: "Beginner",
    estimatedTime: 30,
    objectives: [
      { id: "obj-1", description: "Understand platform architecture" },
      { id: "obj-2", description: "Navigate the console interface" },
    ],
    sections: [
      { id: "sec-1", title: "Introduction" },
      { id: "sec-2", title: "Console Overview" },
    ],
  },
  {
    id: "interact-module",
    title: "Interact Module",
    description: "Master the Interact module for querying",
    domain: "Asking Questions",
    difficulty: "Beginner",
    estimatedTime: 45,
    objectives: [
      { id: "obj-3", description: "Create basic queries" },
      { id: "obj-4", description: "Use sensor library" },
    ],
    sections: [
      { id: "sec-3", title: "Query Basics" },
      { id: "sec-4", title: "Sensor Library" },
    ],
  },
];
// import type { Tables } from "@/types/database.types";
import {
  LearningFlowFactory as FactoryImpl,
  LearningFlowStateMachine as StateMachineImpl,
} from "@/lib/learning-flow-state-machine";
import { defaultFlowPersistence } from "@/lib/supabase-flow-persistence";

export interface ModuleContextType {
  modules: Module[];
  moduleProgress: Record<string, ModuleProgress>;
  currentModule: Module | null;

  // Study guides state (for compatibility with guides page)
  state?: {
    studyGuides: any[];
  };
  loadStudyGuides?: (guides: any[]) => void;
  setCurrentGuide?: (guide: any) => void;
  updateGuideProgress?: (guideId: string, progress: any) => void;

  // Module Management
  startModule: (moduleId: string) => void;
  completeModule: (moduleId: string) => void;
  updateModuleProgress: (moduleId: string, progress: Partial<ModuleProgress>) => void;
  completeObjective: (moduleId: string, objectiveId: string) => void;
  uncompleteObjective: (moduleId: string, objectiveId: string) => void;

  // Navigation
  setCurrentModule: (module: Module | null) => void;
  getNextModule: (currentModuleId: string) => Module | null;
  getPreviousModule: (currentModuleId: string) => Module | null;

  // Filtering & Search
  getModulesByDomain: (domain: TCODomain) => Module[];
  getModulesByDifficulty: (difficulty: "Beginner" | "Intermediate" | "Advanced") => Module[];
  getCompletedModules: () => Module[];
  getInProgressModules: () => Module[];
  getNotStartedModules: () => Module[];

  // Statistics
  getOverallProgress: () => {
    totalModules: number;
    completedModules: number;
    inProgressModules: number;
    totalTimeSpent: number;
    averageCompletion: number;
    domainProgress: Record<TCODomain, { completed: number; total: number }>;
  };

  // Persistence
  exportProgress: () => string;
  importProgress: (data: string) => boolean;
  resetProgress: () => void;

  // p5: Learn → Practice → Assess Flow Integration
  learningFlows: Record<string, StateMachineImpl>;
  startLearningFlow: (moduleId: string) => Promise<StateMachineImpl>;
  getLearningFlow: (moduleId: string) => Promise<StateMachineImpl | null>;
  updateLearningFlow: (moduleId: string, flowState: StateMachineImpl) => Promise<void>;
  resetLearningFlow: (moduleId: string) => Promise<void>;
}

interface ModuleState {
  modules: Module[];
  moduleProgress: Record<string, ModuleProgress>;
  currentModule: Module | null;
  learningFlows: Record<string, StateMachineImpl>;
}

type ModuleAction =
  | { type: "SET_CURRENT_MODULE"; payload: Module | null }
  | { type: "START_MODULE"; payload: string }
  | { type: "COMPLETE_MODULE"; payload: string }
  | { type: "UPDATE_PROGRESS"; payload: { moduleId: string; progress: Partial<ModuleProgress> } }
  | { type: "COMPLETE_OBJECTIVE"; payload: { moduleId: string; objectiveId: string } }
  | { type: "UNCOMPLETE_OBJECTIVE"; payload: { moduleId: string; objectiveId: string } }
  | { type: "LOAD_PROGRESS"; payload: Record<string, ModuleProgress> }
  | { type: "RESET_PROGRESS" }
  | { type: "SET_LEARNING_FLOW"; payload: { moduleId: string; flow: StateMachineImpl } }
  | { type: "REMOVE_LEARNING_FLOW"; payload: string };

const createInitialProgress = (userId: string = "anonymous"): Record<string, ModuleProgress> => {
  const progress: Record<string, ModuleProgress> = {};
  modules.forEach((module) => {
    progress[module.id] = {
      moduleId: module.id,
      userId: userId,
      startedAt: new Date(),
      lastAccessedAt: new Date(),
      totalTimeSpent: 0,
      sectionsCompleted: [],
      overallProgress: 0,
      quiz_scores: {},
      currentSection: "",
      bookmarks: [],
    };
  });
  return progress;
};

const moduleReducer = (state: ModuleState, action: ModuleAction): ModuleState => {
  switch (action.type) {
    case "SET_CURRENT_MODULE":
      return {
        ...state,
        currentModule: action.payload,
      };

    case "START_MODULE": {
      const moduleId = action.payload;
      const now = new Date().toISOString();
      return {
        ...state,
        moduleProgress: {
          ...state.moduleProgress,
          [moduleId]: {
            ...state.moduleProgress[moduleId],
            startedAt: state.moduleProgress[moduleId]?.startedAt || new Date(),
            lastAccessedAt: new Date(),
          },
        },
      };
    }

    case "COMPLETE_MODULE": {
      const moduleId = action.payload;
      const now = new Date().toISOString();
      const module = state.modules.find((m) => m.id === moduleId);

      return {
        ...state,
        moduleProgress: {
          ...state.moduleProgress,
          [moduleId]: {
            ...state.moduleProgress[moduleId],
            completedAt: new Date(),
            lastAccessedAt: new Date(),
            overallProgress: 100,
          },
        },
      };
    }

    case "UPDATE_PROGRESS": {
      const { moduleId, progress } = action.payload;
      return {
        ...state,
        moduleProgress: {
          ...state.moduleProgress,
          [moduleId]: {
            ...state.moduleProgress[moduleId],
            ...progress,
            lastAccessedAt: new Date(),
          },
        },
      };
    }

    case "COMPLETE_OBJECTIVE": {
      const { moduleId, objectiveId } = action.payload;
      const currentProgress = state.moduleProgress[moduleId] || createInitialProgress()[moduleId];
      return {
        ...state,
        moduleProgress: {
          ...state.moduleProgress,
          [moduleId]: {
            ...currentProgress,
            lastAccessedAt: new Date(),
          },
        },
      };
    }

    case "UNCOMPLETE_OBJECTIVE": {
      const { moduleId, objectiveId } = action.payload;
      const currentProgress = state.moduleProgress[moduleId] || createInitialProgress()[moduleId];
      return {
        ...state,
        moduleProgress: {
          ...state.moduleProgress,
          [moduleId]: {
            ...currentProgress,
            lastAccessedAt: new Date(),
          },
        },
      };
    }

    case "LOAD_PROGRESS":
      return {
        ...state,
        moduleProgress: action.payload,
      };

    case "RESET_PROGRESS":
      return {
        ...state,
        moduleProgress: createInitialProgress("anonymous"), // Will be updated when user is available
        currentModule: null,
        learningFlows: {},
      };

    case "SET_LEARNING_FLOW":
      return {
        ...state,
        learningFlows: {
          ...state.learningFlows,
          [action.payload.moduleId]: action.payload.flow,
        },
      };

    case "REMOVE_LEARNING_FLOW":
      const { [action.payload]: removed, ...remainingFlows } = state.learningFlows;
      return {
        ...state,
        learningFlows: remainingFlows,
      };

    default:
      return state;
  }
};

const ModuleContext = createContext<ModuleContextType | null>(null);

const STORAGE_KEY = "tco-module-progress";

export function ModuleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(moduleReducer, {
    modules,
    moduleProgress: createInitialProgress(user?.id || "anonymous"),
    currentModule: null,
    learningFlows: {},
  });
  const db = useDatabase();
  const [dbInitialized, setDbInitialized] = useState(false);
  const hasLoadedRef = useRef(false);

  // Load progress from database or localStorage on mount (only once)
  useEffect(() => {
    // Prevent multiple loads
    if (hasLoadedRef.current) return;

    const loadProgress = async () => {
      hasLoadedRef.current = true;

      if (user && db) {
        try {
          // Load from database
          const { data, error } = await (supabase as any)
            .from("user_study_progress")
            .select("*")
            .eq("user_id", user.id);

          if (error) throw error;

          // Convert database records to progress format
          const progressMap: Record<string, ModuleProgress> = {};
              (data as any[]).forEach((record: any) => {
            progressMap[record.module_id] = {
              moduleId: record.module_id,
              userId: record.user_id || user?.id || "anonymous",
              startedAt: record.started_at ? new Date(record.started_at) : new Date(),
              lastAccessedAt: record.last_accessed_at
                ? new Date(record.last_accessed_at)
                : new Date(),
              completedAt: record.completed_at ? new Date(record.completed_at) : undefined,
              totalTimeSpent: record.time_spent || 0,
              sectionsCompleted: record.sections_completed || [],
              overallProgress: record.overall_progress || 0,
              quiz_scores: record.quiz_scores || {},
              currentSection: record.current_section || "",
              bookmarks: record.bookmarks || [],
            };
          });

          // Merge with initial progress to ensure all modules have entries
          const mergedProgress = {
            ...createInitialProgress(user?.id || "anonymous"),
            ...progressMap,
          };
          dispatch({ type: "LOAD_PROGRESS", payload: mergedProgress });
          setDbInitialized(true);
        } catch (error) {
          console.error("Failed to load module progress from database:", error);
          // Fall back to localStorage
          loadFromLocalStorage();
        }
      } else {
        // Load from localStorage if not authenticated
        loadFromLocalStorage();
      }
    };

    const loadFromLocalStorage = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const progressData = JSON.parse(stored);
          dispatch({ type: "LOAD_PROGRESS", payload: progressData });
        }
      } catch (error) {
        console.warn("Failed to load module progress from localStorage:", error);
      }
    };

    loadProgress();
  }, []); // Empty dependency array - only run once on mount

  // Save progress to database or localStorage whenever it changes (debounced)
  useEffect(() => {
    const saveProgress = async () => {
      if (!dbInitialized && user) return; // Don't save until we've loaded from DB

      if (user && db) {
        // Save to database for each changed module
              for (const [moduleId, progress] of Object.entries(state.moduleProgress)) {
          if (progress.startedAt || progress.completedAt) {
            try {
              const { error } = await supabase
                .from("user_study_progress")
                .upsert({
                  user_id: user.id,
                  module_id: moduleId,
                  time_spent_minutes: progress.totalTimeSpent || 0,
                  completed_at: progress.completedAt?.toISOString() || null,
                  status: progress.completedAt ? "completed" : "in_progress",
                  notes: null,
                  section_id: null,
                } as any)
                .eq("user_id", user.id)
                .eq("module_id", moduleId);

              if (error) {
                console.error(`Failed to save progress for module ${moduleId}:`, error);
              }
            } catch (error) {
              console.error(`Error saving module progress for ${moduleId}:`, error);
            }
          }
        }
      } else {
        // Save to localStorage if not authenticated
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state.moduleProgress));
        } catch (error) {
          console.warn("Failed to save module progress to localStorage:", error);
        }
      }
    };

    // Debounce the save operation to prevent excessive calls
    const timeoutId = setTimeout(() => {
      saveProgress();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [state.moduleProgress, user, db, dbInitialized]);

  const startModule = (moduleId: string) => {
    dispatch({ type: "START_MODULE", payload: moduleId });
  };

  const completeModule = (moduleId: string) => {
    dispatch({ type: "COMPLETE_MODULE", payload: moduleId });
  };

  const updateModuleProgress = (moduleId: string, progress: Partial<ModuleProgress>) => {
    dispatch({ type: "UPDATE_PROGRESS", payload: { moduleId, progress } });
  };

  const completeObjective = (moduleId: string, objectiveId: string) => {
    dispatch({ type: "COMPLETE_OBJECTIVE", payload: { moduleId, objectiveId } });
  };

  const uncompleteObjective = (moduleId: string, objectiveId: string) => {
    dispatch({ type: "UNCOMPLETE_OBJECTIVE", payload: { moduleId, objectiveId } });
  };

  const setCurrentModule = (module: Module | null) => {
    dispatch({ type: "SET_CURRENT_MODULE", payload: module });
  };

  const getNextModule = (currentModuleId: string): Module | null => {
    const currentIndex = state.modules.findIndex((m) => m.id === currentModuleId);
    if (currentIndex >= 0 && currentIndex < state.modules.length - 1) {
      return state.modules[currentIndex + 1];
    }
    return null;
  };

  const getPreviousModule = (currentModuleId: string): Module | null => {
    const currentIndex = state.modules.findIndex((m) => m.id === currentModuleId);
    if (currentIndex > 0) {
      return state.modules[currentIndex - 1];
    }
    return null;
  };

  const getModulesByDomain = (domain: TCODomain): Module[] => {
    return state.modules.filter((module) => module.domain === domain);
  };

  const getModulesByDifficulty = (
    difficulty: "Beginner" | "Intermediate" | "Advanced"
  ): Module[] => {
    return state.modules.filter((module) => module.difficulty === difficulty);
  };

  const getCompletedModules = (): Module[] => {
    return state.modules.filter((module) => state.moduleProgress[module.id]?.completedAt);
  };

  const getInProgressModules = (): Module[] => {
    return state.modules.filter((module) => {
      const progress = state.moduleProgress[module.id];
      return progress?.startedAt && !progress.completedAt;
    });
  };

  const getNotStartedModules = (): Module[] => {
    return state.modules.filter((module) => !state.moduleProgress[module.id]?.startedAt);
  };

  const getOverallProgress = () => {
    const completed = getCompletedModules();
    const inProgress = getInProgressModules();

    const totalTimeSpent = Object.values(state.moduleProgress).reduce((total, progress) => {
      // Add null/undefined check for progress and totalTimeSpent
      if (!progress || typeof progress.totalTimeSpent !== "number") {
        return total;
      }
      return total + progress.totalTimeSpent;
    }, 0);

    const averageCompletion =
      state.modules.length > 0 ? (completed.length / state.modules.length) * 100 : 0;

    // Calculate domain-specific progress with error handling
    const domainProgress: Record<TCODomain, { completed: number; total: number }> = {
      [TCODomain.ASKING_QUESTIONS]: { completed: 0, total: 0 },
      [TCODomain.REFINING_QUESTIONS]: { completed: 0, total: 0 },
      [TCODomain.REFINING_TARGETING]: { completed: 0, total: 0 },
      [TCODomain.TAKING_ACTION]: { completed: 0, total: 0 },
      [TCODomain.NAVIGATION_MODULES]: { completed: 0, total: 0 },
      [TCODomain.REPORTING_EXPORT]: { completed: 0, total: 0 },
      [TCODomain.SECURITY]: { completed: 0, total: 0 },
      [TCODomain.FUNDAMENTALS]: { completed: 0, total: 0 },
      [TCODomain.TROUBLESHOOTING]: { completed: 0, total: 0 },
    };

    state.modules.forEach((module) => {
      // Add safety check for module and domain
      if (!module?.domain || !domainProgress[module.domain as TCODomain]) {
        return;
      }

      domainProgress[module.domain as TCODomain].total++;

      const progress = state.moduleProgress[module.id];
      if (progress && progress.completedAt) {
        domainProgress[module.domain as TCODomain].completed++;
      }
    });

    return {
      totalModules: state.modules.length,
      completedModules: completed.length,
      inProgressModules: inProgress.length,
      totalTimeSpent,
      averageCompletion,
      domainProgress,
    };
  };

  const exportProgress = (): string => {
    const exportData = {
      moduleProgress: state.moduleProgress,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };
    return JSON.stringify(exportData, null, 2);
  };

  const importProgress = (data: string): boolean => {
    try {
      const importData = JSON.parse(data);
      if (importData.moduleProgress && typeof importData.moduleProgress === "object") {
        dispatch({ type: "LOAD_PROGRESS", payload: importData.moduleProgress });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to import progress:", error);
      return false;
    }
  };

  const resetProgress = useCallback(async () => {
    dispatch({ type: "RESET_PROGRESS" });

    if (user && db) {
      try {
        // Delete all module progress from database
        const { error } = await supabase
          .from("user_study_progress")
          .delete()
          .eq("user_id", user.id);

        if (error) {
          console.error("Failed to reset module progress in database:", error);
        }

        // Also reset learning flows
        // Note: learning_flow_progress table doesn't exist in current schema
        // const { error: flowError } = await supabase
        //   .from("learning_flow_progress")
        //   .delete()
        //   .eq("user_id", user.id);

        // if (flowError) {
        //   console.error("Failed to reset learning flow progress in database:", flowError);
        // }
      } catch (error) {
        console.error("Error resetting module progress:", error);
      }
    } else {
      // Clear from localStorage if not authenticated
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user?.id, db]);

  // p5: Learning Flow Management Functions
  const startLearningFlow = useCallback(
    async (moduleId: string): Promise<StateMachineImpl> => {
      if (!user?.id) {
        throw new Error("User must be authenticated to start learning flow");
      }

      // Check if flow already exists
      const existingFlow = state.learningFlows[moduleId];
      if (existingFlow) {
        return existingFlow;
      }

      // Create new flow
      const flow = FactoryImpl.createNewFlow(moduleId, user.id);

      // Set persistence
      const flowWithPersistence = new StateMachineImpl(
        flow.currentState,
        flow.context,
        undefined, // Use default gating rules
        undefined, // Use default navigation guard
        defaultFlowPersistence
      );

      // Save to state
      dispatch({
        type: "SET_LEARNING_FLOW",
        payload: { moduleId, flow: flowWithPersistence },
      });

      // Persist to database
      await flowWithPersistence.save();

      return flowWithPersistence;
    },
    [user?.id, state.learningFlows]
  );

  const getLearningFlow = useCallback(
    async (moduleId: string): Promise<StateMachineImpl | null> => {
      if (!user?.id) {
        return null;
      }

      // Check in-memory cache first
      const cachedFlow = state.learningFlows[moduleId];
      if (cachedFlow) {
        return cachedFlow;
      }

      // Try to load from persistence
      const savedContext = await defaultFlowPersistence.load(moduleId, user.id);
      if (savedContext) {
        const flow = new StateMachineImpl(
          savedContext.currentState,
          savedContext,
          undefined,
          undefined,
          defaultFlowPersistence
        );

        // Cache in state
        dispatch({
          type: "SET_LEARNING_FLOW",
          payload: { moduleId, flow },
        });

        return flow;
      }

      return null;
    },
    [user?.id, state.learningFlows]
  );

  const updateLearningFlow = useCallback(
    async (moduleId: string, flowState: StateMachineImpl): Promise<void> => {
      // Update in-memory state
      dispatch({
        type: "SET_LEARNING_FLOW",
        payload: { moduleId, flow: flowState },
      });

      // Persist to database
      await flowState.save();
    },
    []
  );

  const resetLearningFlow = useCallback(
    async (moduleId: string): Promise<void> => {
      if (!user?.id) {
        return;
      }

      // Remove from state
      dispatch({ type: "REMOVE_LEARNING_FLOW", payload: moduleId });

      // Delete from database
      await defaultFlowPersistence.delete(moduleId, user.id);
    },
    [user?.id]
  );

  const value: ModuleContextType = {
    modules: state.modules,
    moduleProgress: state.moduleProgress,
    currentModule: state.currentModule,

    startModule,
    completeModule,
    updateModuleProgress,
    completeObjective,
    uncompleteObjective,

    setCurrentModule,
    getNextModule,
    getPreviousModule,

    getModulesByDomain,
    getModulesByDifficulty,
    getCompletedModules,
    getInProgressModules,
    getNotStartedModules,

    getOverallProgress,

    exportProgress,
    importProgress,
    resetProgress,

    // p5: Learning Flow Integration
    learningFlows: state.learningFlows,
    startLearningFlow,
    getLearningFlow,
    updateLearningFlow,
    resetLearningFlow,
  };

  return <ModuleContext.Provider value={value}>{children}</ModuleContext.Provider>;
}

export function useModules(): ModuleContextType {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error("useModules must be used within a ModuleProvider");
  }
  return context;
}

// Export useModule as an alias for compatibility
export const useModule = useModules;
