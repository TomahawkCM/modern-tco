/**
 * Accessibility Quick Toggle
 * Compact header button with dropdown for quick accessibility settings
 *
 * Features:
 * - Prominent accessibility icon in header/nav
 * - Quick toggle for Seniors Mode
 * - High contrast and text size controls
 * - WCAG 2.2 AA compliant
 */

"use client";

import { useSeniorsMode } from "@/contexts/SeniorsModeContext";
import { cn } from "@/lib/utils";
import { Accessibility, Check, ChevronDown, Minus, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

interface AccessibilityQuickToggleProps {
  /** Additional className */
  className?: string;
  /** Compact mode for mobile header */
  compact?: boolean;
}

/**
 * Quick accessibility toggle for header/navigation
 * Provides fast access to key accessibility settings
 */
export function AccessibilityQuickToggle({
  className,
  compact = false,
}: AccessibilityQuickToggleProps) {
  const { settings, isSeniorsMode, toggleSeniorsMode, updateSetting } = useSeniorsMode();
  const tAria = useTranslations("aria");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleFontSizeChange = useCallback(
    (direction: "increase" | "decrease") => {
      const sizes: Array<1.0 | 1.25 | 1.5> = [1.0, 1.25, 1.5];
      const currentIndex = sizes.indexOf(settings.fontSizeMultiplier);
      const newIndex =
        direction === "increase"
          ? Math.min(currentIndex + 1, sizes.length - 1)
          : Math.max(currentIndex - 1, 0);
      updateSetting("fontSizeMultiplier", sizes[newIndex]);
    },
    [settings.fontSizeMultiplier, updateSetting]
  );

  // Show indicator if any accessibility feature is active
  const hasActiveFeatures =
    isSeniorsMode ||
    settings.highContrast ||
    settings.reduceMotion ||
    settings.fontSizeMultiplier > 1.0;

  return (
    <div id="accessibility-toggle" ref={containerRef} className={cn("relative", className)}>
      {/* Toggle Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Accessibility settings${hasActiveFeatures ? " (active)" : ""}`}
        className={cn(
          "relative flex items-center justify-center rounded-lg transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
          compact ? "h-10 w-10 p-2" : "h-10 gap-1.5 px-3 py-2",
          hasActiveFeatures
            ? "bg-teal-500/20 text-teal-400 hover:bg-teal-500/30"
            : "text-slate-400 hover:bg-white/10 hover:text-white"
        )}
      >
        <Accessibility className={cn(compact ? "h-5 w-5" : "h-4 w-4")} aria-hidden="true" />
        {!compact && (
          <>
            <span className="text-sm font-medium">A11y</span>
            <ChevronDown
              className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")}
              aria-hidden="true"
            />
          </>
        )}
        {/* Active indicator dot */}
        {hasActiveFeatures && (
          <span
            className="absolute -end-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-teal-400"
            aria-hidden="true"
          />
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          role="menu"
          aria-label={tAria("accessibilitySettings")}
          className={cn(
            "absolute end-0 top-full z-50 mt-2 w-72 rounded-xl",
            "border border-white/10 bg-slate-900/95 backdrop-blur-lg",
            "shadow-xl shadow-black/20",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
            "p-4"
          )}
        >
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Accessibility</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded p-1 text-slate-400 transition-colors hover:text-white"
              aria-label={tAria("closeAccessibilityMenu")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            {/* Seniors Mode Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label
                  htmlFor="seniors-mode-toggle"
                  className="block cursor-pointer text-sm font-medium text-white"
                >
                  Large Text Mode
                </label>
                <p className="text-xs text-slate-400">Bigger text & touch targets</p>
              </div>
              <button
                id="seniors-mode-toggle"
                type="button"
                role="switch"
                aria-checked={isSeniorsMode}
                onClick={toggleSeniorsMode}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                  isSeniorsMode ? "bg-teal-500" : "bg-slate-600"
                )}
              >
                <span
                  className={cn(
                    "block h-5 w-5 rounded-full bg-white shadow transition-transform",
                    isSeniorsMode ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>

            {/* High Contrast Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label
                  htmlFor="high-contrast-toggle"
                  className="block cursor-pointer text-sm font-medium text-white"
                >
                  High Contrast
                </label>
                <p className="text-xs text-slate-400">Enhanced color contrast</p>
              </div>
              <button
                id="high-contrast-toggle"
                type="button"
                role="switch"
                aria-checked={settings.highContrast}
                onClick={() => updateSetting("highContrast", !settings.highContrast)}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                  settings.highContrast ? "bg-teal-500" : "bg-slate-600"
                )}
              >
                <span
                  className={cn(
                    "block h-5 w-5 rounded-full bg-white shadow transition-transform",
                    settings.highContrast ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>

            {/* Reduce Motion Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label
                  htmlFor="reduce-motion-toggle"
                  className="block cursor-pointer text-sm font-medium text-white"
                >
                  Reduce Motion
                </label>
                <p className="text-xs text-slate-400">Minimize animations</p>
              </div>
              <button
                id="reduce-motion-toggle"
                type="button"
                role="switch"
                aria-checked={settings.reduceMotion}
                onClick={() => updateSetting("reduceMotion", !settings.reduceMotion)}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                  settings.reduceMotion ? "bg-teal-500" : "bg-slate-600"
                )}
              >
                <span
                  className={cn(
                    "block h-5 w-5 rounded-full bg-white shadow transition-transform",
                    settings.reduceMotion ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>

            {/* Text Size Controls */}
            <div className="border-t border-white/10 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">Text Size</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleFontSizeChange("decrease")}
                    disabled={settings.fontSizeMultiplier === 1.0}
                    aria-label={tAria("decreaseTextSize")}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                      settings.fontSizeMultiplier === 1.0
                        ? "cursor-not-allowed text-slate-600"
                        : "text-slate-300 hover:bg-white/10"
                    )}
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <span className="w-16 text-center text-sm text-slate-300">
                    {settings.fontSizeMultiplier === 1.0
                      ? "Normal"
                      : settings.fontSizeMultiplier === 1.25
                        ? "Large"
                        : "X-Large"}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleFontSizeChange("increase")}
                    disabled={settings.fontSizeMultiplier === 1.5}
                    aria-label={tAria("increaseTextSize")}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                      settings.fontSizeMultiplier === 1.5
                        ? "cursor-not-allowed text-slate-600"
                        : "text-slate-300 hover:bg-white/10"
                    )}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Size indicators */}
              <div className="mt-2 flex justify-center gap-2">
                {[1.0, 1.25, 1.5].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => updateSetting("fontSizeMultiplier", size as 1.0 | 1.25 | 1.5)}
                    aria-label={`Set text size to ${size === 1.0 ? "normal" : size === 1.25 ? "large" : "extra large"}`}
                    aria-pressed={settings.fontSizeMultiplier === size}
                    className={cn(
                      "h-2 w-8 rounded-full transition-colors",
                      settings.fontSizeMultiplier === size
                        ? "bg-teal-500"
                        : "bg-slate-600 hover:bg-slate-500"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Active features summary */}
          {hasActiveFeatures && (
            <div className="mt-4 border-t border-white/10 pt-3">
              <div className="flex items-center gap-2 text-xs text-teal-400">
                <Check className="h-3 w-3" />
                <span>Accessibility features active</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AccessibilityQuickToggle;
