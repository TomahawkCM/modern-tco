"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useDatabase } from "@/hooks/useDatabase";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from "react";

export interface UserSettings {
  theme: "light" | "dark" | "system";
  soundEnabled: boolean;
  notifications: boolean;
  practiceMode: "adaptive" | "random" | "sequential";
  showExplanations: boolean;
  timerVisible: boolean;
  autoAdvance: boolean;
  studyReminders: boolean;
  examSimulation: boolean;
  strictTiming: boolean;
  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
  trackProgress: boolean;
  shareAnonymous: boolean;
  detailedStats: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNav: boolean;
  language: "en" | "es" | "fr" | "de";
  timeZone: string;
  sessionTimeout: number; // minutes
  questionsPerSession: number;
  difficultyProgression: boolean;
  pauseOnIncorrect: boolean;
}

interface SettingsState {
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;
}

type SettingsAction =
  | { type: "LOAD_SETTINGS"; payload: UserSettings }
  | { type: "UPDATE_SETTING"; payload: { key: keyof UserSettings; value: any } }
  | { type: "UPDATE_SETTINGS"; payload: Partial<UserSettings> }
  | { type: "RESET_SETTINGS" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

interface SettingsContextType {
  state: SettingsState;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetSettings: () => void;
  getSetting: <K extends keyof UserSettings>(key: K) => UserSettings[K];
  exportSettings: () => UserSettings;
  importSettings: (settings: UserSettings) => void;
}

const defaultSettings: UserSettings = {
  theme: "dark",
  soundEnabled: true,
  notifications: true,
  practiceMode: "adaptive",
  showExplanations: true,
  timerVisible: true,
  autoAdvance: false,
  studyReminders: true,
  examSimulation: true,
  strictTiming: false,
  randomizeQuestions: true,
  randomizeAnswers: true,
  trackProgress: true,
  shareAnonymous: false,
  detailedStats: true,
  highContrast: false,
  largeText: false,
  screenReader: false,
  keyboardNav: true,
  language: "en",
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  sessionTimeout: 30,
  questionsPerSession: 20,
  difficultyProgression: true,
  pauseOnIncorrect: false,
};

const initialState: SettingsState = {
  settings: defaultSettings,
  isLoading: false,
  error: null,
};

function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case "LOAD_SETTINGS":
      return {
        ...state,
        settings: action.payload,
        isLoading: false,
        error: null,
      };

    case "UPDATE_SETTING":
      return {
        ...state,
        settings: {
          ...state.settings,
          [action.payload.key]: action.payload.value,
        },
      };

    case "UPDATE_SETTINGS":
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };

    case "RESET_SETTINGS":
      return {
        ...state,
        settings: { ...defaultSettings },
      };

    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    default:
      return state;
  }
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(settingsReducer, initialState);
  const { user } = useAuth();
  const db = useDatabase();
  const dbInitialized = useRef(false);
  const saveTimeout = useRef<NodeJS.Timeout>();

  // Load settings from database or localStorage on mount
  useEffect(() => {
    const loadSettings = async () => {
      dispatch({ type: "SET_LOADING", payload: true });

      // TODO: Load from Supabase when user_settings table is available
      // For now, skip database loading

      // Fallback to localStorage
      const savedSettings = localStorage.getItem("tco-settings");
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          const loadedSettings = { ...defaultSettings, ...settings };
          dispatch({ type: "LOAD_SETTINGS", payload: loadedSettings });
        } catch (error) {
          console.error("Failed to load settings from localStorage:", error);
          dispatch({ type: "LOAD_SETTINGS", payload: defaultSettings });
        }
      } else {
        dispatch({ type: "LOAD_SETTINGS", payload: defaultSettings });
      }

      dispatch({ type: "SET_LOADING", payload: false });
      dbInitialized.current = true;
    };

    loadSettings();
  }, [user?.id]);

  // Save settings to database and localStorage whenever they change
  useEffect(() => {
    if (!state.isLoading && dbInitialized.current) {
      // Clear any existing timeout
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }

      // Debounced save to prevent excessive localStorage writes
      saveTimeout.current = setTimeout(() => {
        // Always save to localStorage for offline support
        localStorage.setItem("tco-settings", JSON.stringify(state.settings));

        // TODO: Save to database when user_settings table is available
        // if (user && db) {
        //   // Database save logic here
        // }
      }, 300); // Debounce for 300ms
    }
  }, [state.settings, state.isLoading]);

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    dispatch({ type: "UPDATE_SETTING", payload: { key, value } });
  };

  const updateSettings = (settings: Partial<UserSettings>) => {
    dispatch({ type: "UPDATE_SETTINGS", payload: settings });
  };

  const resetSettings = useCallback(async () => {
    localStorage.removeItem("tco-settings");
    dispatch({ type: "RESET_SETTINGS" });

    // TODO: Delete from database when user_settings table is available
    // if (user && db) {
    //   try {
    //     const { error } = await supabase.from("user_settings").delete().eq("user_id", user.id);
    //     if (error) {
    //       console.error("Failed to delete settings from database:", error);
    //     }
    //   } catch (error) {
    //     console.error("Error deleting settings from database:", error);
    //   }
    // }
  }, [user?.id, db]);

  const getSetting = <K extends keyof UserSettings>(key: K): UserSettings[K] => {
    return state.settings[key];
  };

  const exportSettings = (): UserSettings => {
    return { ...state.settings };
  };

  const importSettings = (settings: UserSettings) => {
    dispatch({ type: "LOAD_SETTINGS", payload: settings });
  };

  return (
    <SettingsContext.Provider
      value={{
        state,
        updateSetting,
        updateSettings,
        resetSettings,
        getSetting,
        exportSettings,
        importSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
