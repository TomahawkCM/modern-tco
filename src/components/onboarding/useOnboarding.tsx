"use client";

import { useState, useEffect } from "react";

interface UseOnboardingReturn {
  /** Whether user has completed onboarding */
  hasCompletedOnboarding: boolean;
  /** Open the onboarding flow */
  startOnboarding: () => void;
  /** Mark onboarding as completed */
  completeOnboarding: () => void;
  /** Reset onboarding (for testing or re-tutorial) */
  resetOnboarding: () => void;
}

/**
 * useOnboarding Hook
 *
 * Manages onboarding state and provides methods to control the onboarding flow.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { hasCompletedOnboarding, startOnboarding } = useOnboarding();
 *
 *   if (!hasCompletedOnboarding) {
 *     return <OnboardingFlow open={true} onComplete={completeOnboarding} />;
 *   }
 *
 *   return <div>Welcome back!</div>;
 * }
 * ```
 */
export function useOnboarding(): UseOnboardingReturn {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true); // Start as true to avoid flash

  useEffect(() => {
    // Check localStorage on mount
    const completed = localStorage.getItem("onboarding_completed");
    setHasCompletedOnboarding(completed === "true");
  }, []);

  const startOnboarding = () => {
    setHasCompletedOnboarding(false);
    localStorage.removeItem("onboarding_completed");
  };

  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
    localStorage.setItem("onboarding_completed", "true");
  };

  const resetOnboarding = () => {
    setHasCompletedOnboarding(false);
    localStorage.removeItem("onboarding_completed");
  };

  return {
    hasCompletedOnboarding,
    startOnboarding,
    completeOnboarding,
    resetOnboarding,
  };
}
