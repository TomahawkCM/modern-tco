'use client';

/**
 * Onboarding Tour Component (Phase 5)
 * Task 5.1.2: Create 5-step onboarding tour
 * 
 * Custom lightweight tour without external dependencies
 */

import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface TourStepKey {
  key: string;
  targetPage?: string;
  highlight?: string;
}

const TOUR_STEP_KEYS: TourStepKey[] = [
  {
    key: 'welcome',
  },
  {
    key: 'import',
    targetPage: '/budget-app/import',
    highlight: 'import-section',
  },
  {
    key: 'categorize',
    targetPage: '/budget-app/transactions',
    highlight: 'categorize-section',
  },
  {
    key: 'budgets',
    targetPage: '/budget-app/budgets',
    highlight: 'budget-section',
  },
  {
    key: 'reports',
    targetPage: '/budget-app',
    highlight: 'dashboard-section',
  },
];

export function OnboardingTour() {
  const t = useTranslations('onboarding');
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has completed the tour
    const hasCompletedTour = localStorage.getItem('budget-app-tour-completed');
    const visitCount = parseInt(localStorage.getItem('budget-app-visit-count') || '0');

    if (!hasCompletedTour && visitCount < 3) {
      // Show tour on first visit
      if (visitCount === 0) {
        setIsVisible(true);
      }
      localStorage.setItem('budget-app-visit-count', (visitCount + 1).toString());
    }
  }, []);

  // Handle Escape key to close tour (Task 2.2.3)
  useEffect(() => {
    if (!isVisible) return;

    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        localStorage.setItem('budget-app-tour-completed', 'true');
        setIsVisible(false);
      }
    }

    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isVisible]);

  function handleNext() {
    if (currentStep < TOUR_STEP_KEYS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);

      // Navigate to target page if specified
      const step = TOUR_STEP_KEYS[nextStep];
      if (step.targetPage) {
        void router.push(step.targetPage);
      }
    } else {
      completeTour();
    }
  }

  function handlePrevious() {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);

      // Navigate to target page if specified
      const step = TOUR_STEP_KEYS[prevStep];
      if (step.targetPage) {
        void router.push(step.targetPage);
      }
    }
  }

  function completeTour() {
    localStorage.setItem('budget-app-tour-completed', 'true');
    setIsVisible(false);
  }

  function skipTour() {
    completeTour();
  }

  if (!isVisible) return null;

  const stepKey = TOUR_STEP_KEYS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEP_KEYS.length - 1;
  const progress = ((currentStep + 1) / TOUR_STEP_KEYS.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-200">
          <div
            className="h-full bg-teal-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step Counter */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">
              {t('stepCounter', { current: currentStep + 1, total: TOUR_STEP_KEYS.length })}
            </span>
            <button
              onClick={skipTour}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              {t('skipTour')}
            </button>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t(`steps.${stepKey.key}.title`)}
          </h2>

          {/* Description */}
          <p className="text-gray-700 leading-relaxed mb-6">
            {t(`steps.${stepKey.key}.description`)}
          </p>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            {!isFirstStep && (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('navigation.previous')}
              </button>
            )}

            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors font-medium"
            >
              {isLastStep ? (
                <>
                  <Check className="w-4 h-4" />
                  {t('navigation.getStarted')}
                </>
              ) : isFirstStep ? (
                <>
                  {t('navigation.startTour')}
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  {t('navigation.next')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Don't Show Again */}
          {isLastStep && (
            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="dont-show-again"
                defaultChecked
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <label htmlFor="dont-show-again" className="text-sm text-gray-600">
                {t('dontShowAgain')}
              </label>
            </div>
          )}
        </div>

        {/* Feature Highlights */}
        {!isFirstStep && !isLastStep && (
          <div className="px-8 pb-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-900 font-medium mb-2">{t('quickTip')}</p>
              <p className="text-sm text-gray-700">
                {t(`tips.${stepKey.key}`)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Restart the onboarding tour
 */
export function restartTour() {
  localStorage.removeItem('budget-app-tour-completed');
  localStorage.setItem('budget-app-visit-count', '0');
  window.location.reload();
}

