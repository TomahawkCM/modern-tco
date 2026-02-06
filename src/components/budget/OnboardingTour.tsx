"use client";

/**
 * Onboarding Tour Component
 * Premium "World Class" Welcome Wizard
 *
 * Features:
 * - Glassmorphism UI
 * - Smooth Framer Motion animations
 * - Seamless integration with Driver.js spotlight tour
 */

import { useGuidedTour } from "@/hooks/useGuidedTour";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileSpreadsheet,
  LayoutDashboard,
  PieChart,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface TourStepKey {
  key: string;
  icon: React.ElementType;
  targetPage?: string;
}

const TOUR_STEPS: TourStepKey[] = [
  {
    key: "welcome",
    icon: Sparkles,
  },
  {
    key: "import",
    icon: FileSpreadsheet,
    targetPage: "/budget-app/import",
  },
  {
    key: "categorize",
    icon: PieChart,
    targetPage: "/budget-app/transactions",
  },
  {
    key: "budgets",
    icon: Wallet,
    targetPage: "/budget-app/budgets",
  },
  {
    key: "reports",
    icon: LayoutDashboard,
    targetPage: "/budget-app",
  },
];

export function OnboardingTour() {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { startTour } = useGuidedTour();

  useEffect(() => {
    // Check if user has completed the wizard
    const hasCompletedWizard = localStorage.getItem("budget-app-wizard-completed");
    // We strictly use a separate key for this wizard vs the driver.js tour

    // Optional: Only show if we haven't seen it
    if (!hasCompletedWizard) {
      // Minimal delay for smooth entry without blocking navigation
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle Escape key
  useEffect(() => {
    if (!isVisible) return;

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        dismissWizard();
      }
    }

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [isVisible]);

  function handleNext() {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);

      // Optional: Navigate to target page as we go?
      // For a "Wizard" that sits on top, maybe we don't force navigation until the end
      // or we just let it be a static wizard that explains things.
      // Let's stick to the previous logic of staying put or navigating if desired.
      // Actually, for a pure Welcome Wizard, it's often nicer if it stays on the dashboard
      // OR navigates to show context. Let's keep navigation for context.
      const nextStepIdx = currentStep + 1;
      const step = TOUR_STEPS[nextStepIdx];
      if (step.targetPage) {
        void router.push(step.targetPage);
      }
    } else {
      completeWizard();
    }
  }

  function handlePrevious() {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);

      const prevStepIdx = currentStep - 1;
      const step = TOUR_STEPS[prevStepIdx];
      if (step.targetPage) {
        void router.push(step.targetPage);
      }
    }
  }

  function dismissWizard() {
    localStorage.setItem("budget-app-wizard-completed", "true");
    setIsVisible(false);
  }

  const isCompletingRef = useRef(false);

  function completeWizard() {
    if (isCompletingRef.current) return;
    isCompletingRef.current = true;

    localStorage.setItem("budget-app-wizard-completed", "true");
    setIsVisible(false);

    // Seamlessly start the spotlight tour
    // Give a simplified small delay for the modal to exit
    setTimeout(() => {
      startTour();
      // Reset ref after tour starts
      isCompletingRef.current = false;
    }, 600);
  }

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/20 bg-gray-900/90 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl dark:bg-gray-950/90"
          >
            {/* Background decorative gradients */}
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

            {/* Content Container */}
            <div className="relative flex flex-col items-center p-8 text-center sm:p-10">
              {/* Close Button */}
              <button
                onClick={dismissWizard}
                className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label={t("skipTour")}
              >
                <X className="h-5 w-5" />
              </button>

              {/* Animated Icon */}
              <motion.div
                key={`${step.key  }-icon`}
                initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-500/5 shadow-inner ring-1 ring-white/10"
              >
                <Icon className="h-10 w-10 text-teal-400" />
              </motion.div>

              {/* Step Key for AnimatePresence Text Swapping */}
              <div className="relative min-h-[140px] w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step.key}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 flex flex-col items-center"
                  >
                    <h2 className="mb-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      {t(`steps.${step.key}.title`)}
                    </h2>
                    <p className="max-w-md text-base leading-relaxed text-gray-300">
                      {t(`steps.${step.key}.description`)}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Progress Bar */}
              <div className="mb-8 mt-4 h-1 w-full max-w-xs overflow-hidden rounded-full bg-gray-800">
                <motion.div
                  className="h-full bg-teal-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>

              {/* Navigation Buttons */}
              <div className="flex w-full items-center justify-between gap-4">
                <button
                  onClick={handlePrevious}
                  disabled={isFirstStep}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isFirstStep
                      ? "cursor-not-allowed text-gray-600"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("navigation.previous")}
                </button>

                <button
                  onClick={handleNext}
                  className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-teal-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-teal-400 hover:shadow-teal-500/25 active:scale-95"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isLastStep ? t("navigation.getStarted") : t("navigation.next")}
                    {isLastStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                  </span>
                  {/* Sheen effect */}
                  <div className="group-hover:animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Restart the onboarding tour
 */
export function restartTour() {
  localStorage.removeItem("budget-app-wizard-completed");
  // Also reset the driver.js tour
  localStorage.removeItem("budget-app-tour-progress");
  window.location.reload();
}
