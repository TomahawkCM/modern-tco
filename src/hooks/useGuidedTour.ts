/**
 * useGuidedTour Hook
 * Manages the Driver.js spotlight tour for the Budget App
 * Provides non-blocking, interactive guided tour experience
 */

"use client";

import { MOBILE_TOUR_STEPS, TOUR_STEPS } from "@/components/budget/tour/tourSteps";
import { driver, type Config, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { useCallback, useEffect, useRef, useState } from "react";

const TOUR_STORAGE_KEY = "budget-app-tour-progress";

interface TourProgress {
  completed: boolean;
  currentStep: number;
  startedAt?: number;
  completedAt?: number;
}

const defaultProgress: TourProgress = {
  completed: false,
  currentStep: 0,
};

/**
 * Hook to manage the guided tour experience
 * @returns Tour control functions and state
 */
export function useGuidedTour() {
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);
  const [progress, setProgress] = useState<TourProgress>(defaultProgress);
  const [isActive, setIsActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const currentStepRef = useRef(0);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(TOUR_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as TourProgress;
        setProgress(parsed);
      }
    } catch (error) {
      console.error("Failed to load tour progress:", error);
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = useCallback(
    (newProgress: TourProgress | ((prev: TourProgress) => TourProgress)) => {
      setProgress((prev) => {
        const nextProgress = typeof newProgress === "function" ? newProgress(prev) : newProgress;
        try {
          localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(nextProgress));
        } catch (error) {
          console.error("Failed to save tour progress:", error);
        }
        return nextProgress;
      });
    },
    []
  );

  const resolveSteps = useCallback((steps: DriveStep[]) => {
    return steps.filter((step) => {
      if (!step.element) {
        return true;
      }
      if (typeof step.element === "string") {
        return Boolean(document.querySelector(step.element));
      }
      return true;
    });
  }, []);

  // Start the tour
  const startTour = useCallback(() => {
    // Safety: Destroy any existing driver instance to prevent duplicates/zombies
    if (driverRef.current) {
      driverRef.current.destroy();
      driverRef.current = null;
    }

    // Use mobile or desktop steps based on viewport
    const rawSteps = isMobile ? MOBILE_TOUR_STEPS : TOUR_STEPS;
    const steps = resolveSteps(rawSteps);
    if (steps.length === 0) {
      setIsActive(false);
      return;
    }
    currentStepRef.current = 0;
    const lastStepIndex = steps.length - 1;

    const config: Config = {
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      animate: true,
      allowClose: true,
      stagePadding: 10,
      stageRadius: 8,
      popoverClass: "tour-popover-glassmorphism",
      progressText: "{{current}} of {{total}}",
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Done",
      steps,
      onHighlightStarted: (_element, step) => {
        // Track step progression
        const stepIndex = steps.findIndex((s) => s === step);
        if (stepIndex >= 0) {
          currentStepRef.current = stepIndex;
          saveProgress((prev) => ({
            ...prev,
            currentStep: stepIndex,
            startedAt: prev.startedAt || Date.now(),
          }));
        }
      },
      onDestroyStarted: () => {
        // Tour is being closed (completed or dismissed)
        setIsActive(false);
        driverRef.current = null;
      },
      onDestroyed: () => {
        // Mark as completed only if last step was reached
        saveProgress((prev) => {
          const completed = currentStepRef.current >= lastStepIndex;
          return {
            ...prev,
            currentStep: currentStepRef.current,
            completed,
            completedAt: completed ? Date.now() : prev.completedAt,
          };
        });
        setIsActive(false);
        driverRef.current = null;
      },
    };

    driverRef.current = driver(config);
    setIsActive(true);

    // Small delay to ensure DOM elements are ready
    setTimeout(() => {
      driverRef.current?.drive();
    }, 100);
  }, [isMobile, resolveSteps, saveProgress]);

  // Stop the tour manually
  const stopTour = useCallback(() => {
    driverRef.current?.destroy();
    setIsActive(false);
  }, []);

  useEffect(() => {
    if (!isActive) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        stopTour();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive, stopTour]);

  useEffect(() => {
    return () => {
      driverRef.current?.destroy();
      driverRef.current = null;
    };
  }, []);

  // Reset tour progress (for "Take Tour Again" functionality)
  const resetTour = useCallback(() => {
    saveProgress(defaultProgress);
    localStorage.removeItem(TOUR_STORAGE_KEY);
  }, [saveProgress]);

  // Highlight a specific element without starting full tour
  const highlightElement = useCallback(
    (selector: string, options?: { title?: string; description?: string }) => {
      const tempDriver = driver({
        animate: true,
        allowClose: true,
        stagePadding: 10,
        stageRadius: 8,
        popoverClass: "tour-popover-glassmorphism",
      });

      tempDriver.highlight({
        element: selector,
        popover: {
          title: options?.title || "Feature",
          description: options?.description || "",
          side: "bottom",
          align: "center",
        },
      });

      return () => tempDriver.destroy();
    },
    []
  );

  return {
    startTour,
    stopTour,
    resetTour,
    highlightElement,
    progress,
    isActive,
    isCompleted: progress.completed,
    isMobile,
  };
}

/**
 * Reset the tour progress (utility function)
 */
export function resetTourProgress(): void {
  localStorage.removeItem(TOUR_STORAGE_KEY);
}

/**
 * Check if tour has been completed
 */
export function isTourCompleted(): boolean {
  try {
    const saved = localStorage.getItem(TOUR_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as TourProgress;
      return parsed.completed;
    }
  } catch {
    // Ignore errors
  }
  return false;
}

export default useGuidedTour;
