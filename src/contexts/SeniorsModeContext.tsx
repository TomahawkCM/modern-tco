"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * Seniors Mode Configuration
 * WCAG 2.2 AA compliant accessibility settings
 */
export interface SeniorsModeSettings {
  /** Master toggle for Seniors Mode */
  enabled: boolean;

  /** Font size multiplier (1.0 = normal, 1.25 = large, 1.5 = extra large) */
  fontSizeMultiplier: 1.0 | 1.25 | 1.5;

  /** Touch target size in pixels (44 = AA minimum, 52 = enhanced) */
  touchTargetSize: 44 | 52;

  /** Simplified mode - reduces visual complexity */
  simplifiedMode: boolean;

  /** High contrast mode for better visibility */
  highContrast: boolean;

  /** Reduce motion for vestibular disorders */
  reduceMotion: boolean;

  /** Larger spacing between interactive elements */
  increasedSpacing: boolean;
}

interface SeniorsModeContextType {
  /** Current settings */
  settings: SeniorsModeSettings;

  /** Quick access - is Seniors Mode enabled */
  isSeniorsMode: boolean;

  /** Toggle Seniors Mode on/off */
  toggleSeniorsMode: () => void;

  /** Enable Seniors Mode with optional custom settings */
  enableSeniorsMode: (customSettings?: Partial<SeniorsModeSettings>) => void;

  /** Disable Seniors Mode (reset to defaults) */
  disableSeniorsMode: () => void;

  /** Update a specific setting */
  updateSetting: <K extends keyof SeniorsModeSettings>(
    key: K,
    value: SeniorsModeSettings[K]
  ) => void;

  /** Update multiple settings at once */
  updateSettings: (settings: Partial<SeniorsModeSettings>) => void;

  /** Reset to defaults */
  resetToDefaults: () => void;

  /** CSS class name for font size */
  fontSizeClass: string;

  /** CSS class name for touch targets */
  touchTargetClass: string;
}

const STORAGE_KEY = "budget-app-seniors-mode";

const defaultSettings: SeniorsModeSettings = {
  enabled: false,
  fontSizeMultiplier: 1.0,
  touchTargetSize: 44,
  simplifiedMode: false,
  highContrast: false,
  reduceMotion: false,
  increasedSpacing: false,
};

const seniorsEnabledSettings: SeniorsModeSettings = {
  enabled: true,
  fontSizeMultiplier: 1.25,
  touchTargetSize: 52,
  simplifiedMode: true,
  highContrast: false,
  reduceMotion: true,
  increasedSpacing: true,
};

const SeniorsModeContext = createContext<SeniorsModeContextType | undefined>(undefined);

export function SeniorsModeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SeniorsModeSettings>(defaultSettings);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      }

      // Check for system preference for reduced motion
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setSettings(prev => ({ ...prev, reduceMotion: true }));
      }

      // Check for system preference for high contrast
      if (window.matchMedia("(prefers-contrast: more)").matches) {
        setSettings(prev => ({ ...prev, highContrast: true }));
      }
    } catch (error) {
      console.error("Failed to load Seniors Mode settings:", error);
    }
    setIsHydrated(true);
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        // Note: storage events automatically fire in OTHER tabs when localStorage changes
        // Do NOT manually dispatch StorageEvent here - it causes infinite loops
      } catch (error) {
        console.error("Failed to save Seniors Mode settings:", error);
      }
    }
  }, [settings, isHydrated]);

  // Listen for changes from other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          const newSettings = JSON.parse(event.newValue);
          setSettings({ ...defaultSettings, ...newSettings });
        } catch (error) {
          console.error("Failed to sync Seniors Mode settings:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Apply settings to document
  useEffect(() => {
    if (!isHydrated) return;

    const root = document.documentElement;

    // Font size
    root.style.setProperty(
      "--seniors-font-multiplier",
      String(settings.fontSizeMultiplier)
    );

    // Touch target size
    root.style.setProperty(
      "--seniors-touch-target",
      `${settings.touchTargetSize}px`
    );

    // CSS classes on body
    const body = document.body;
    body.classList.toggle("seniors-mode", settings.enabled);
    body.classList.toggle("seniors-simplified", settings.simplifiedMode);
    body.classList.toggle("seniors-high-contrast", settings.highContrast);
    body.classList.toggle("seniors-reduce-motion", settings.reduceMotion);
    body.classList.toggle("seniors-increased-spacing", settings.increasedSpacing);

    // Data attribute for CSS targeting
    body.dataset.seniorsMode = settings.enabled ? "true" : "false";
    body.dataset.fontScale = String(settings.fontSizeMultiplier);

  }, [settings, isHydrated]);

  const toggleSeniorsMode = useCallback(() => {
    setSettings(prev =>
      prev.enabled
        ? { ...defaultSettings }
        : { ...seniorsEnabledSettings }
    );
  }, []);

  const enableSeniorsMode = useCallback((customSettings?: Partial<SeniorsModeSettings>) => {
    setSettings({
      ...seniorsEnabledSettings,
      ...customSettings,
      enabled: true,
    });
  }, []);

  const disableSeniorsMode = useCallback(() => {
    setSettings(defaultSettings);
  }, []);

  const updateSetting = useCallback(<K extends keyof SeniorsModeSettings>(
    key: K,
    value: SeniorsModeSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateSettings = useCallback((newSettings: Partial<SeniorsModeSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setSettings(defaultSettings);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to remove Seniors Mode settings:", error);
    }
  }, []);

  // Computed CSS classes
  const fontSizeClass = settings.fontSizeMultiplier === 1.5
    ? "text-xl"
    : settings.fontSizeMultiplier === 1.25
      ? "text-lg"
      : "text-base";

  const touchTargetClass = settings.touchTargetSize === 52
    ? "min-h-[52px] min-w-[52px]"
    : "min-h-[44px] min-w-[44px]";

  const value: SeniorsModeContextType = {
    settings,
    isSeniorsMode: settings.enabled,
    toggleSeniorsMode,
    enableSeniorsMode,
    disableSeniorsMode,
    updateSetting,
    updateSettings,
    resetToDefaults,
    fontSizeClass,
    touchTargetClass,
  };

  return (
    <SeniorsModeContext.Provider value={value}>
      {children}
    </SeniorsModeContext.Provider>
  );
}

/**
 * Hook to access Seniors Mode context
 * @throws Error if used outside of SeniorsModeProvider
 */
export function useSeniorsMode(): SeniorsModeContextType {
  const context = useContext(SeniorsModeContext);
  if (context === undefined) {
    throw new Error("useSeniorsMode must be used within a SeniorsModeProvider");
  }
  return context;
}

/**
 * Hook for components that should degrade gracefully
 * Returns default values if used outside provider
 */
export function useSeniorsModeOptional(): SeniorsModeContextType | null {
  return useContext(SeniorsModeContext) ?? null;
}
