"use client";

import {
  useSeniorsMode as useSeniorsModeContext,
  useSeniorsModeOptional,
  type SeniorsModeSettings,
} from "@/contexts/SeniorsModeContext";
import { useCallback, useMemo } from "react";

/**
 * Re-export the main hook for convenience
 */
export { useSeniorsModeContext as useSeniorsMode };

/**
 * Hook for components that need to gracefully handle being outside the provider
 * Returns safe defaults when not in a provider
 */
export function useSeniorsModeWithDefaults() {
  const context = useSeniorsModeOptional();

  const defaults: ReturnType<typeof useSeniorsModeContext> = useMemo(
    () => ({
      settings: {
        enabled: false,
        fontSizeMultiplier: 1.0 as const,
        touchTargetSize: 44 as const,
        simplifiedMode: false,
        highContrast: false,
        reduceMotion: false,
        increasedSpacing: false,
      },
      isSeniorsMode: false,
      toggleSeniorsMode: () => {
        console.warn("SeniorsModeProvider not found, toggle has no effect");
      },
      enableSeniorsMode: () => {
        console.warn("SeniorsModeProvider not found, enable has no effect");
      },
      disableSeniorsMode: () => {
        console.warn("SeniorsModeProvider not found, disable has no effect");
      },
      updateSetting: () => {
        console.warn("SeniorsModeProvider not found, update has no effect");
      },
      updateSettings: () => {
        console.warn("SeniorsModeProvider not found, update has no effect");
      },
      resetToDefaults: () => {
        console.warn("SeniorsModeProvider not found, reset has no effect");
      },
      fontSizeClass: "text-base",
      touchTargetClass: "min-h-[44px] min-w-[44px]",
    }),
    []
  );

  return context ?? defaults;
}

/**
 * Hook that provides computed styles based on Seniors Mode settings
 */
export function useSeniorsModeStyles() {
  const { settings, isSeniorsMode } = useSeniorsModeWithDefaults();

  const styles = useMemo(() => {
    const base = {
      "--font-scale": settings.fontSizeMultiplier,
      "--touch-target": `${settings.touchTargetSize}px`,
    } as React.CSSProperties;

    if (!isSeniorsMode) {
      return base;
    }

    return {
      ...base,
      // Enhanced letter spacing for readability
      letterSpacing: settings.fontSizeMultiplier > 1 ? "0.01em" : undefined,
      // Increased line height for readability
      lineHeight: settings.fontSizeMultiplier > 1 ? "1.6" : undefined,
    };
  }, [settings, isSeniorsMode]);

  return styles;
}

/**
 * Hook that provides Tailwind classes based on Seniors Mode settings
 */
export function useSeniorsModeClasses() {
  const { settings, isSeniorsMode, fontSizeClass, touchTargetClass } = useSeniorsModeWithDefaults();

  const classes = useMemo(() => {
    const baseClasses: string[] = [];

    if (isSeniorsMode) {
      baseClasses.push("seniors-mode");

      if (settings.simplifiedMode) {
        baseClasses.push("seniors-simplified");
      }

      if (settings.highContrast) {
        baseClasses.push("seniors-high-contrast");
      }

      if (settings.reduceMotion) {
        baseClasses.push("seniors-reduce-motion", "motion-reduce");
      }

      if (settings.increasedSpacing) {
        baseClasses.push("seniors-increased-spacing");
      }
    }

    return {
      container: baseClasses.join(" "),
      text: fontSizeClass,
      touchTarget: touchTargetClass,
      button: isSeniorsMode ? `${touchTargetClass} ${fontSizeClass} font-medium` : "",
      input: isSeniorsMode ? `${touchTargetClass} ${fontSizeClass}` : "",
      link: isSeniorsMode ? `${fontSizeClass} underline-offset-4` : "",
    };
  }, [settings, isSeniorsMode, fontSizeClass, touchTargetClass]);

  return classes;
}

/**
 * Hook for checking if animations should be reduced
 */
export function useShouldReduceMotion(): boolean {
  const { settings } = useSeniorsModeWithDefaults();

  // Check both Seniors Mode setting and system preference
  const systemPrefers = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  return settings.reduceMotion || systemPrefers;
}

/**
 * Hook for checking if high contrast is needed
 */
export function useShouldHighContrast(): boolean {
  const { settings } = useSeniorsModeWithDefaults();

  // Check both Seniors Mode setting and system preference
  const systemPrefers = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-contrast: more)").matches;
  }, []);

  return settings.highContrast || systemPrefers;
}

/**
 * Hook for getting accessible button props
 */
export function useSeniorsModeButtonProps(label?: string) {
  const { isSeniorsMode, touchTargetClass, fontSizeClass } = useSeniorsModeWithDefaults();

  const props = useMemo(
    () => ({
      className: isSeniorsMode ? `${touchTargetClass} ${fontSizeClass} px-4 py-2` : "",
      "aria-label": label,
      // Enhanced focus for seniors
      style: isSeniorsMode
        ? {
            outlineOffset: "3px",
          }
        : undefined,
    }),
    [isSeniorsMode, touchTargetClass, fontSizeClass, label]
  );

  return props;
}

/**
 * Hook for getting accessible input props
 */
export function useSeniorsModeInputProps(label?: string) {
  const { isSeniorsMode, touchTargetClass, fontSizeClass } = useSeniorsModeWithDefaults();

  const props = useMemo(
    () => ({
      className: isSeniorsMode ? `${touchTargetClass} ${fontSizeClass} px-3 py-2` : "",
      "aria-label": label,
      style: isSeniorsMode
        ? {
            fontSize: "1rem",
          }
        : undefined,
    }),
    [isSeniorsMode, touchTargetClass, fontSizeClass, label]
  );

  return props;
}

/**
 * Hook for preset configurations
 */
export function useSeniorsModePresets() {
  const context = useSeniorsModeWithDefaults();

  const applyPreset = useCallback(
    (preset: "off" | "mild" | "moderate" | "full") => {
      switch (preset) {
        case "off":
          context.disableSeniorsMode();
          break;
        case "mild":
          context.updateSettings({
            enabled: true,
            fontSizeMultiplier: 1.0,
            touchTargetSize: 44,
            simplifiedMode: false,
            highContrast: false,
            reduceMotion: false,
            increasedSpacing: false,
          });
          break;
        case "moderate":
          context.updateSettings({
            enabled: true,
            fontSizeMultiplier: 1.25,
            touchTargetSize: 44,
            simplifiedMode: false,
            highContrast: false,
            reduceMotion: true,
            increasedSpacing: true,
          });
          break;
        case "full":
          context.updateSettings({
            enabled: true,
            fontSizeMultiplier: 1.5,
            touchTargetSize: 52,
            simplifiedMode: true,
            highContrast: true,
            reduceMotion: true,
            increasedSpacing: true,
          });
          break;
      }
    },
    [context]
  );

  const getCurrentPreset = useCallback((): "off" | "mild" | "moderate" | "full" | "custom" => {
    const { settings } = context;

    if (!settings.enabled) return "off";

    // Check for exact preset matches
    if (
      settings.fontSizeMultiplier === 1.0 &&
      settings.touchTargetSize === 44 &&
      !settings.simplifiedMode &&
      !settings.highContrast &&
      !settings.reduceMotion &&
      !settings.increasedSpacing
    ) {
      return "mild";
    }

    if (
      settings.fontSizeMultiplier === 1.25 &&
      settings.touchTargetSize === 44 &&
      !settings.simplifiedMode &&
      !settings.highContrast &&
      settings.reduceMotion &&
      settings.increasedSpacing
    ) {
      return "moderate";
    }

    if (
      settings.fontSizeMultiplier === 1.5 &&
      settings.touchTargetSize === 52 &&
      settings.simplifiedMode &&
      settings.highContrast &&
      settings.reduceMotion &&
      settings.increasedSpacing
    ) {
      return "full";
    }

    return "custom";
  }, [context]);

  return {
    applyPreset,
    getCurrentPreset,
    presets: ["off", "mild", "moderate", "full"] as const,
  };
}

// Type exports for convenience
export type { SeniorsModeSettings };
