/**
 * Welcome Banner - Non-blocking Onboarding
 * Replaces the full-screen modal wizard with a dismissible banner
 * that doesn't block app usage
 */

"use client";

import { Button } from "@/components/ui/button";
import { useGuidedTour } from "@/hooks/useGuidedTour";
import { cn } from "@/lib/utils";
import { HardDrive, Lock, Sparkles, WifiOff, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const STORAGE_KEY = "budget-app-onboarding";

interface OnboardingState {
  completed: boolean;
  skipped: boolean;
}

const defaultState: OnboardingState = {
  completed: false,
  skipped: false,
};

interface WelcomeBannerProps {
  /** Force show banner even if dismissed */
  forceShow?: boolean;
}

export function WelcomeBanner({ forceShow = false }: WelcomeBannerProps) {
  const tAria = useTranslations("aria");
  const { startTour } = useGuidedTour();
  const [state, setState] = useState<OnboardingState>(defaultState);
  const [isVisible, setIsVisible] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as OnboardingState;
        setState(parsed);
        // Show banner if not completed and not skipped
        if (!parsed.completed && !parsed.skipped) {
          setIsVisible(true);
        }
      } else {
        // First visit - show banner
        setIsVisible(true);
      }
    } catch (error) {
      console.error("Failed to load onboarding state:", error);
      setIsVisible(true);
    }
    setIsHydrated(true);
  }, []);

  // Force show if prop is set
  useEffect(() => {
    if (forceShow && isHydrated) {
      setIsVisible(true);
      setState({ completed: false, skipped: false });
    }
  }, [forceShow, isHydrated]);

  // Save state to localStorage
  const saveState = useCallback((newState: OnboardingState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error("Failed to save onboarding state:", error);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    const newState = { ...state, skipped: true };
    setState(newState);
    saveState(newState);
    setIsVisible(false);
  }, [state, saveState]);

  const handleStartTour = useCallback(() => {
    // Start the Driver.js spotlight tour
    startTour();
    // Dismiss the banner when tour starts
    handleDismiss();
  }, [startTour, handleDismiss]);

  const handleComplete = useCallback(() => {
    const newState = { ...state, completed: true };
    setState(newState);
    saveState(newState);
    setIsVisible(false);
  }, [state, saveState]);

  if (!isHydrated || !isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative z-40 border-b transition-all duration-300",
        "bg-gradient-to-r from-teal-500/10 via-slate-900/95 to-blue-500/10",
        "border-teal-500/20 backdrop-blur-sm"
      )}
      role="banner"
      aria-label={tAria("welcomeBudgetApp")}
    >
      {/* Main Banner Content */}
      <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: Icon + Text */}
          <div className="flex items-start gap-4 sm:items-center">
            <div className="shrink-0 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 p-2.5">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-white">Welcome to Budget App!</h2>
              <p className="text-sm text-slate-400">
                Your finances, your device. No cloud, no compromise.
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 sm:shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-400 hover:text-white"
            >
              {isExpanded ? "Show Less" : "Learn More"}
            </Button>
            <Button
              size="sm"
              onClick={handleStartTour}
              className="bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:opacity-90"
            >
              Take a Tour
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-8 w-8 text-slate-400 hover:bg-white/10 hover:text-white"
              aria-label={tAria("dismissWelcome")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Expanded Content - Privacy Features */}
        {isExpanded && (
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-white/10 pt-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-3">
              <HardDrive className="h-5 w-5 shrink-0 text-teal-400" />
              <div>
                <p className="text-sm font-medium text-white">Local Storage</p>
                <p className="text-xs text-slate-400">Your data stays on your device</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-3">
              <Lock className="h-5 w-5 shrink-0 text-teal-400" />
              <div>
                <p className="text-sm font-medium text-white">Encrypted</p>
                <p className="text-xs text-slate-400">AES-256 bank-grade security</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-3">
              <WifiOff className="h-5 w-5 shrink-0 text-teal-400" />
              <div>
                <p className="text-sm font-medium text-white">Works Offline</p>
                <p className="text-xs text-slate-400">No internet required</p>
              </div>
            </div>

            {/* Got it Button */}
            <div className="col-span-full flex justify-end pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleComplete}
                className="border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
              >
                Got it, thanks!
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Reset the onboarding banner state
 */
export function resetWelcomeBanner(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if onboarding/welcome has been completed or dismissed
 */
export function isWelcomeCompleted(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as OnboardingState;
      return parsed.completed || parsed.skipped;
    }
  } catch {
    // Ignore errors
  }
  return false;
}

export default WelcomeBanner;
