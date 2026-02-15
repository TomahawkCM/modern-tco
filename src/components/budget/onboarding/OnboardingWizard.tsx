/**
 * Onboarding Wizard Container
 * Enhanced "First 15 Minutes" flow for offline budget app
 *
 * Flow:
 * 1. Welcome - "Your budget lives on YOUR device"
 * 2. Vault Setup - Configure encryption
 * 3. Accessibility - Choose viewing preferences
 * 4. Import Data - Guided import wizard
 * 5. Category Mapping - Bulk categorization
 * 6. First Budget - Create budget with spending averages
 * 7. Bill Reminders - Detect recurring transactions
 */

"use client";

import { cn } from "@/lib/utils";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AccessibilityStep } from "./AccessibilityStep";
import { BillRemindersStep } from "./BillRemindersStep";
import { CategoryMappingStep } from "./CategoryMappingStep";
import { FirstBudgetStep } from "./FirstBudgetStep";
import { ImportStep } from "./ImportStep";
import { VaultSetupStep } from "./VaultSetupStep";
import { WelcomeStep } from "./WelcomeStep";

const STORAGE_KEY = "budget-app-onboarding";

interface OnboardingState {
  completed: boolean;
  currentStep: number;
  stepsCompleted: boolean[];
  skipped: boolean;
  importedTransactions: number;
  categorizedTransactions: number;
  budgetsCreated: number;
  billsDetected: number;
}

const defaultState: OnboardingState = {
  completed: false,
  currentStep: 0,
  stepsCompleted: [false, false, false, false, false, false, false],
  skipped: false,
  importedTransactions: 0,
  categorizedTransactions: 0,
  budgetsCreated: 0,
  billsDetected: 0,
};

export interface StepProps {
  onComplete: (data?: Record<string, unknown>) => void;
  onSkip: () => void;
  isActive: boolean;
}

const STEPS = [
  { id: "welcome", title: "Welcome", component: WelcomeStep },
  { id: "vault", title: "Security", component: VaultSetupStep },
  { id: "accessibility", title: "Accessibility", component: AccessibilityStep },
  { id: "import", title: "Import Data", component: ImportStep },
  { id: "categories", title: "Categories", component: CategoryMappingStep },
  { id: "budget", title: "First Budget", component: FirstBudgetStep },
  { id: "bills", title: "Bill Reminders", component: BillRemindersStep },
];

interface OnboardingWizardProps {
  /** Force show wizard even if completed */
  forceShow?: boolean;
  /** Callback when wizard is completed */
  onComplete?: () => void;
  /** Callback when wizard is dismissed */
  onDismiss?: () => void;
}

export function OnboardingWizard({
  forceShow = false,
  onComplete,
  onDismiss,
}: OnboardingWizardProps) {
  const [state, setState] = useState<OnboardingState>(defaultState);
  const [isVisible, setIsVisible] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as OnboardingState;
        setState(parsed);
        // Show wizard if not completed and not skipped
        if (!parsed.completed && !parsed.skipped) {
          setIsVisible(true);
        }
      } else {
        // First visit - show wizard
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
      setState((prev) => ({ ...prev, currentStep: 0, completed: false, skipped: false }));
    }
  }, [forceShow, isHydrated]);

  // Save state to localStorage
  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error("Failed to save onboarding state:", error);
      }
    }
  }, [state, isHydrated]);

  // Handle Escape key
  useEffect(() => {
    if (!isVisible) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleSkipWizard();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isVisible]);

  const handleStepComplete = useCallback((data?: Record<string, unknown>) => {
    setState((prev) => {
      const newStepsCompleted = [...prev.stepsCompleted];
      newStepsCompleted[prev.currentStep] = true;

      // Update metrics based on step data
      const updates: Partial<OnboardingState> = {};
      if (data?.importedTransactions) {
        updates.importedTransactions = data.importedTransactions as number;
      }
      if (data?.categorizedTransactions) {
        updates.categorizedTransactions = data.categorizedTransactions as number;
      }
      if (data?.budgetsCreated) {
        updates.budgetsCreated = data.budgetsCreated as number;
      }
      if (data?.billsDetected) {
        updates.billsDetected = data.billsDetected as number;
      }

      // Move to next step or complete
      const isLastStep = prev.currentStep >= STEPS.length - 1;
      if (isLastStep) {
        return {
          ...prev,
          ...updates,
          stepsCompleted: newStepsCompleted,
          completed: true,
        };
      }

      return {
        ...prev,
        ...updates,
        stepsCompleted: newStepsCompleted,
        currentStep: prev.currentStep + 1,
      };
    });
  }, []);

  const handleStepSkip = useCallback(() => {
    setState((prev) => {
      const isLastStep = prev.currentStep >= STEPS.length - 1;
      if (isLastStep) {
        return { ...prev, completed: true };
      }
      return { ...prev, currentStep: prev.currentStep + 1 };
    });
  }, []);

  const handlePrevious = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
    }));
  }, []);

  const handleSkipWizard = useCallback(() => {
    setState((prev) => ({ ...prev, skipped: true }));
    setIsVisible(false);
    onDismiss?.();
  }, [onDismiss]);

  const handleCompleteWizard = useCallback(() => {
    setState((prev) => ({ ...prev, completed: true }));
    setIsVisible(false);
    onComplete?.();
  }, [onComplete]);

  // Close when completed
  useEffect(() => {
    if (state.completed && isVisible) {
      // Small delay for animation
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.completed, isVisible, onComplete]);

  if (!isHydrated || !isVisible) {
    return null;
  }

  const currentStep = STEPS[state.currentStep];
  const StepComponent = currentStep.component;
  const progress = ((state.currentStep + 1) / STEPS.length) * 100;
  const isFirstStep = state.currentStep === 0;
  const isLastStep = state.currentStep === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        {/* Progress Bar */}
        <div className="h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          {/* Step Indicators */}
          <div className="flex items-center gap-2">
            {STEPS.map((step, index) => (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (index < state.currentStep || state.stepsCompleted[index]) {
                    setState((prev) => ({ ...prev, currentStep: index }));
                  }
                }}
                disabled={index > state.currentStep && !state.stepsCompleted[index]}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all",
                  index === state.currentStep
                    ? "scale-110 bg-teal-500 text-white"
                    : state.stepsCompleted[index]
                      ? "cursor-pointer bg-teal-500/20 text-teal-400 hover:bg-teal-500/30"
                      : "cursor-not-allowed bg-slate-800 text-slate-500"
                )}
                aria-label={`Step ${index + 1}: ${step.title}`}
                aria-current={index === state.currentStep ? "step" : undefined}
              >
                {state.stepsCompleted[index] ? <Check className="h-4 w-4" /> : index + 1}
              </button>
            ))}
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={handleSkipWizard}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close onboarding wizard"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Title */}
        <div className="px-6 pt-6">
          <p className="mb-1 text-sm text-slate-400">
            Step {state.currentStep + 1} of {STEPS.length}
          </p>
          <h2 id="onboarding-title" className="text-2xl font-bold text-white">
            {currentStep.title}
          </h2>
        </div>

        {/* Step Content */}
        <div className="min-h-[300px] px-6 py-6">
          <StepComponent onComplete={handleStepComplete} onSkip={handleStepSkip} isActive={true} />
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between border-t border-white/10 bg-slate-900/50 px-6 py-4">
          <div>
            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrevious}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleStepSkip}
              className="px-4 py-2 text-slate-400 transition-colors hover:text-white"
            >
              {isLastStep ? "Skip & Finish" : "Skip"}
            </button>

            {isLastStep && (
              <button
                type="button"
                onClick={handleCompleteWizard}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-blue-500 px-6 py-2 font-medium text-white transition-opacity hover:opacity-90"
              >
                <Check className="h-4 w-4" />
                Complete Setup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Restart the onboarding wizard
 */
export function restartOnboarding(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
}

/**
 * Check if onboarding is completed
 */
export function isOnboardingCompleted(): boolean {
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

export default OnboardingWizard;
