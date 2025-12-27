'use client';

/**
 * Friday Money Review Page
 * Task F-020: Main page for the weekly ritual experience
 *
 * A step-by-step review of the week's finances with celebration at completion.
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  X,
  Home,
  Sparkles,
  TrendingUp,
  PieChart,
  Target,
  Calendar,
  PartyPopper,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSeniorsMode } from '@/hooks/useSeniorsMode';
import { cn } from '@/lib/utils';

// Step definitions
const STEPS = [
  { id: 'welcome', title: 'Welcome', icon: Sparkles },
  { id: 'spending', title: 'Spending Recap', icon: TrendingUp },
  { id: 'budgets', title: 'Budget Check', icon: PieChart },
  { id: 'goals', title: 'Goal Progress', icon: Target },
  { id: 'upcoming', title: 'Upcoming Bills', icon: Calendar },
  { id: 'celebration', title: 'Celebration', icon: PartyPopper },
] as const;

type StepId = (typeof STEPS)[number]['id'];

// Animation variants
const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

const pageTransition = {
  type: 'tween' as const,
  ease: 'easeInOut' as const,
  duration: 0.3,
};

export default function FridayReviewPage() {
  const router = useRouter();
  const { isSeniorsMode } = useSeniorsMode();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Simulated data loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < STEPS.length) {
      setDirection(stepIndex > currentStep ? 1 : -1);
      setCurrentStep(stepIndex);
    }
  }, [currentStep]);

  const nextStep = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      goToStep(currentStep + 1);
    }
  }, [currentStep, goToStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  const handleClose = useCallback(() => {
    router.push('/budget-app');
  }, [router]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        prevStep();
      } else if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextStep, prevStep, handleClose]);

  const currentStepData = STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEPS.length - 1;

  if (isLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
          <p className="text-slate-400">Loading your weekly review...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[80vh] flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/10 pb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="gap-2 text-slate-400 hover:text-white"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Dashboard</span>
        </Button>

        <h1 className="text-lg font-semibold text-white">Friday Review</h1>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="text-slate-400 hover:text-white"
          aria-label="Close review"
        >
          <X className="h-5 w-5" />
        </Button>
      </header>

      {/* Step Progress Indicator */}
      <div className="flex items-center justify-center gap-2 py-6">
        {STEPS.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const StepIcon = step.icon;

          return (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={cn(
                'group relative flex items-center justify-center transition-all',
                isActive ? 'scale-110' : 'scale-100',
                isSeniorsMode ? 'h-12 w-12' : 'h-8 w-8'
              )}
              aria-label={`Go to ${step.title}`}
              aria-current={isActive ? 'step' : undefined}
            >
              {/* Circle background */}
              <div
                className={cn(
                  'absolute inset-0 rounded-full transition-all',
                  isActive
                    ? 'bg-teal-500 shadow-lg shadow-teal-500/30'
                    : isCompleted
                      ? 'bg-teal-500/30'
                      : 'bg-white/10'
                )}
              />

              {/* Icon */}
              <StepIcon
                className={cn(
                  'relative z-10 transition-colors',
                  isSeniorsMode ? 'h-5 w-5' : 'h-4 w-4',
                  isActive
                    ? 'text-white'
                    : isCompleted
                      ? 'text-teal-300'
                      : 'text-slate-500'
                )}
              />

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'absolute left-full top-1/2 h-0.5 w-4 -translate-y-1/2',
                    index < currentStep ? 'bg-teal-500/50' : 'bg-white/10'
                  )}
                />
              )}

              {/* Tooltip */}
              <span
                className={cn(
                  'absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100',
                  isActive && 'opacity-100'
                )}
              >
                {step.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Live region for screen readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        Step {currentStep + 1} of {STEPS.length}: {currentStepData.title}
      </div>

      {/* Main Content Area */}
      <main
        className="relative flex-1 overflow-hidden"
        aria-label={`Step ${currentStep + 1}: ${currentStepData.title}`}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            className="flex h-full flex-col items-center justify-center px-4 py-8"
          >
            {/* Step Content - Placeholder for now */}
            <StepContent stepId={currentStepData.id} />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation Buttons */}
      <footer className="flex items-center justify-between border-t border-white/10 pt-4">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={isFirstStep}
          className={cn(
            'gap-2 border-white/20 text-slate-300 hover:bg-white/10',
            isFirstStep && 'invisible'
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <span className="text-sm text-slate-500">
          Step {currentStep + 1} of {STEPS.length}
        </span>

        <Button
          onClick={isLastStep ? handleClose : nextStep}
          className={cn(
            'gap-2',
            isLastStep
              ? 'bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600'
              : 'bg-teal-500 hover:bg-teal-600'
          )}
        >
          {isLastStep ? (
            <>
              Done
              <PartyPopper className="h-4 w-4" />
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </footer>
    </div>
  );
}

// Placeholder step content component
function StepContent({ stepId }: { stepId: StepId }) {
  const content: Record<StepId, { emoji: string; title: string; subtitle: string }> = {
    welcome: {
      emoji: '👋',
      title: 'Happy Friday!',
      subtitle: "Let's check in on your week.",
    },
    spending: {
      emoji: '💰',
      title: 'Spending Recap',
      subtitle: "Here's where your money went this week.",
    },
    budgets: {
      emoji: '📊',
      title: 'Budget Check',
      subtitle: 'How are your budgets doing?',
    },
    goals: {
      emoji: '🎯',
      title: 'Goal Progress',
      subtitle: "You're making progress on your goals!",
    },
    upcoming: {
      emoji: '📅',
      title: 'Upcoming Bills',
      subtitle: "Heads up for next week.",
    },
    celebration: {
      emoji: '🎉',
      title: 'Great job this week!',
      subtitle: 'See you next Friday!',
    },
  };

  const step = content[stepId];

  return (
    <div className="flex max-w-lg flex-col items-center text-center">
      <span className="mb-6 text-6xl" role="img" aria-hidden="true">
        {step.emoji}
      </span>
      <h2 className="mb-2 text-3xl font-bold text-white">{step.title}</h2>
      <p className="text-lg text-slate-400">{step.subtitle}</p>

      {/* Placeholder card */}
      <div className="mt-8 w-full rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-slate-400">
          Step content will be implemented in subsequent tasks (F-021 through F-025).
        </p>
      </div>
    </div>
  );
}
