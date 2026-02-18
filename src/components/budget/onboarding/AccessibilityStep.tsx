/**
 * Accessibility Step - Onboarding Wizard
 * Configure accessibility preferences for the budget app
 */

"use client";

import { useSeniorsMode } from "@/contexts/SeniorsModeContext";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, Eye, Hand, Moon, Sparkles, Type, Volume2, Zap } from "lucide-react";
import { useCallback, useState } from "react";
import type { StepProps } from "./OnboardingWizard";

interface AccessibilityPreset {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  settings: {
    fontSizeMultiplier: 1.0 | 1.25 | 1.5;
    touchTargetSize: 44 | 52;
    highContrast: boolean;
    reduceMotion: boolean;
    simplifiedMode: boolean;
    increasedSpacing: boolean;
  };
}

const PRESETS: AccessibilityPreset[] = [
  {
    id: "default",
    name: "Standard",
    description: "Default settings optimized for most users",
    icon: Zap,
    settings: {
      fontSizeMultiplier: 1.0,
      touchTargetSize: 44,
      highContrast: false,
      reduceMotion: false,
      simplifiedMode: false,
      increasedSpacing: false,
    },
  },
  {
    id: "comfortable",
    name: "Comfortable",
    description: "Slightly larger text and touch targets",
    icon: Eye,
    settings: {
      fontSizeMultiplier: 1.25,
      touchTargetSize: 52,
      highContrast: false,
      reduceMotion: false,
      simplifiedMode: false,
      increasedSpacing: true,
    },
  },
  {
    id: "seniors",
    name: "Easy Read",
    description: "Large text, high contrast, gentle animations",
    icon: Type,
    settings: {
      fontSizeMultiplier: 1.5,
      touchTargetSize: 52,
      highContrast: true,
      reduceMotion: true,
      simplifiedMode: true,
      increasedSpacing: true,
    },
  },
  {
    id: "low-vision",
    name: "High Contrast",
    description: "Maximum contrast for better visibility",
    icon: Moon,
    settings: {
      fontSizeMultiplier: 1.25,
      touchTargetSize: 52,
      highContrast: true,
      reduceMotion: false,
      simplifiedMode: false,
      increasedSpacing: true,
    },
  },
];

export function AccessibilityStep({ onComplete, onSkip }: StepProps) {
  const { updateSettings, enableSeniorsMode } = useSeniorsMode();
  const [selectedPreset, setSelectedPreset] = useState<string>("default");
  const [customizing, setCustomizing] = useState(false);
  const [customSettings, setCustomSettings] = useState<AccessibilityPreset["settings"]>({
    fontSizeMultiplier: 1.0,
    touchTargetSize: 44,
    highContrast: false,
    reduceMotion: false,
    simplifiedMode: false,
    increasedSpacing: false,
  });

  const handlePresetSelect = useCallback((preset: AccessibilityPreset) => {
    setSelectedPreset(preset.id);
    setCustomSettings(preset.settings);
  }, []);

  const handleCustomToggle = useCallback(
    (setting: "highContrast" | "reduceMotion" | "simplifiedMode" | "increasedSpacing") => {
      setCustomSettings((prev) => ({
        ...prev,
        [setting]: !prev[setting],
      }));
      setSelectedPreset("custom");
    },
    []
  );

  const handleFontSizeChange = useCallback((value: 1.0 | 1.25 | 1.5) => {
    setCustomSettings((prev) => ({
      ...prev,
      fontSizeMultiplier: value,
      touchTargetSize: value > 1.0 ? 52 : 44,
    }));
    setSelectedPreset("custom");
  }, []);

  const handleComplete = useCallback(() => {
    // Apply settings to SeniorsModeContext
    if (selectedPreset === "seniors") {
      // Use enableSeniorsMode for full seniors mode
      enableSeniorsMode({
        fontSizeMultiplier: customSettings.fontSizeMultiplier,
        touchTargetSize: customSettings.touchTargetSize,
        highContrast: customSettings.highContrast,
        reduceMotion: customSettings.reduceMotion,
        simplifiedMode: customSettings.simplifiedMode,
        increasedSpacing: customSettings.increasedSpacing,
      });
    } else if (selectedPreset !== "default") {
      // Apply individual settings without enabling full seniors mode
      updateSettings({
        fontSizeMultiplier: customSettings.fontSizeMultiplier,
        touchTargetSize: customSettings.touchTargetSize,
        highContrast: customSettings.highContrast,
        reduceMotion: customSettings.reduceMotion,
        simplifiedMode: customSettings.simplifiedMode,
        increasedSpacing: customSettings.increasedSpacing,
      });
    }

    onComplete({
      accessibilityPreset: selectedPreset,
      accessibilitySettings: customSettings,
    });
  }, [customSettings, selectedPreset, updateSettings, enableSeniorsMode, onComplete]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-purple-500/10 p-4">
        <div className="rounded-lg bg-violet-500/20 p-2">
          <Hand className="h-6 w-6 text-violet-400" />
        </div>
        <div>
          <p className="font-medium text-white">Designed for Everyone</p>
          <p className="text-sm text-slate-400">Choose your preferred viewing experience</p>
        </div>
      </div>

      {/* Preset Selection */}
      <div className="grid grid-cols-2 gap-3">
        {PRESETS.map((preset) => {
          const Icon = preset.icon;
          const isSelected = selectedPreset === preset.id;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetSelect(preset)}
              className={cn(
                "flex flex-col items-start gap-2 rounded-xl border p-4 text-start transition-all",
                isSelected
                  ? "border-violet-500/50 bg-violet-500/10"
                  : "border-white/10 bg-slate-800/50 hover:border-white/20"
              )}
            >
              <div className="flex w-full items-center justify-between">
                <div
                  className={cn(
                    "rounded-lg p-2",
                    isSelected ? "bg-violet-500/20" : "bg-slate-700/50"
                  )}
                >
                  <Icon
                    className={cn("h-5 w-5", isSelected ? "text-violet-400" : "text-slate-400")}
                  />
                </div>
                {isSelected && (
                  <div className="rounded-full bg-violet-500 p-1">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-white">{preset.name}</p>
                <p className="mt-0.5 text-xs text-slate-400">{preset.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Customize Toggle */}
      <button
        type="button"
        onClick={() => setCustomizing(!customizing)}
        className={cn(
          "flex w-full items-center justify-between rounded-lg p-3",
          "border border-white/10 bg-slate-800/30",
          "text-sm text-slate-400 hover:border-white/20 hover:text-white",
          "transition-colors"
        )}
      >
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Customize settings
        </span>
        <span className="text-xs">{customizing ? "Hide" : "Show"}</span>
      </button>

      {/* Custom Settings */}
      {customizing && (
        <div className="space-y-3 rounded-xl border border-white/10 bg-slate-800/30 p-4">
          {/* High Contrast Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-sm text-white">High Contrast</p>
                <p className="text-xs text-slate-500">7:1+ contrast ratio</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={customSettings.highContrast}
              onClick={() => handleCustomToggle("highContrast")}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                customSettings.highContrast ? "bg-violet-500" : "bg-slate-600"
              )}
            >
              <span
                className={cn(
                  "block h-5 w-5 rounded-full bg-white shadow transition-transform",
                  customSettings.highContrast ? "translate-x-5" : "translate-x-0.5"
                )}
              />
            </button>
          </div>

          {/* Reduce Motion Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-sm text-white">Reduce Motion</p>
                <p className="text-xs text-slate-500">Minimal animations</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={customSettings.reduceMotion}
              onClick={() => handleCustomToggle("reduceMotion")}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                customSettings.reduceMotion ? "bg-violet-500" : "bg-slate-600"
              )}
            >
              <span
                className={cn(
                  "block h-5 w-5 rounded-full bg-white shadow transition-transform",
                  customSettings.reduceMotion ? "translate-x-5" : "translate-x-0.5"
                )}
              />
            </button>
          </div>

          {/* Increased Spacing Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Hand className="h-4 w-4 text-slate-400" />
              <div>
                <p className="text-sm text-white">Increased Spacing</p>
                <p className="text-xs text-slate-500">Larger touch targets</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={customSettings.increasedSpacing}
              onClick={() => handleCustomToggle("increasedSpacing")}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                customSettings.increasedSpacing ? "bg-violet-500" : "bg-slate-600"
              )}
            >
              <span
                className={cn(
                  "block h-5 w-5 rounded-full bg-white shadow transition-transform",
                  customSettings.increasedSpacing ? "translate-x-5" : "translate-x-0.5"
                )}
              />
            </button>
          </div>

          {/* Font Size Selector */}
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Type className="h-4 w-4 text-slate-400" />
                <p className="text-sm text-white">Text Size</p>
              </div>
              <span className="text-sm font-medium text-violet-400">
                {customSettings.fontSizeMultiplier === 1.0
                  ? "Normal"
                  : customSettings.fontSizeMultiplier === 1.25
                    ? "Large"
                    : "Extra Large"}
              </span>
            </div>
            <div className="flex gap-2">
              {([1.0, 1.25, 1.5] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleFontSizeChange(size)}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    customSettings.fontSizeMultiplier === size
                      ? "bg-violet-500 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  )}
                >
                  {size === 1.0 ? "Normal" : size === 1.25 ? "Large" : "XL"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview */}
      <div className="rounded-xl border border-white/10 bg-slate-800/30 p-4">
        <p className="mb-2 text-xs text-slate-400">Preview</p>
        <div
          className={cn(
            "rounded-lg p-3 transition-all",
            customSettings.highContrast
              ? "border border-white bg-black text-white"
              : "bg-slate-900 text-slate-200"
          )}
          style={{ fontSize: `${customSettings.fontSizeMultiplier * 14}px` }}
        >
          <p className={cn(customSettings.fontSizeMultiplier > 1.0 && "font-semibold")}>
            Your monthly budget: $2,450.00
          </p>
          <p
            className={cn("mt-1", customSettings.highContrast ? "text-white" : "text-slate-400")}
            style={{ fontSize: `${customSettings.fontSizeMultiplier * 12}px` }}
          >
            Remaining this month: $850.00
          </p>
        </div>
      </div>

      {/* Features List */}
      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Check className="h-3 w-3 text-teal-400" />
          Screen reader support
        </span>
        <span className="flex items-center gap-1">
          <Check className="h-3 w-3 text-teal-400" />
          Keyboard navigation
        </span>
        <span className="flex items-center gap-1">
          <Check className="h-3 w-3 text-teal-400" />
          WCAG AA compliant
        </span>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleComplete}
          className={cn(
            "flex items-center gap-2 rounded-lg px-6 py-2 font-medium",
            "bg-gradient-to-r from-violet-500 to-purple-500 text-white",
            "transition-opacity hover:opacity-90"
          )}
        >
          Save Preferences
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default AccessibilityStep;
