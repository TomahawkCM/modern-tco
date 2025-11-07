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

interface TourStep {
  title: string;
  description: string;
  targetPage?: string;
  highlight?: string;
  action?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: '👋 Welcome to Budget App!',
    description: "Let's take a quick tour to help you get started with managing your household finances. This won't take long!",
    action: 'Start Tour',
  },
  {
    title: '📥 Import Your Transactions',
    description: 'Start by importing your bank transactions from a CSV file. We support BMO, Home Trust, and many other banks. The app will automatically categorize your transactions!',
    targetPage: '/budget-app/import',
    highlight: 'import-section',
  },
  {
    title: '🏷️ Categorize & Organize',
    description: 'Review and adjust transaction categories. Our smart categorization learns from your corrections to improve over time. Use bulk actions to categorize multiple transactions at once!',
    targetPage: '/budget-app/transactions',
    highlight: 'categorize-section',
  },
  {
    title: '🎯 Set Your Budgets',
    description: 'Create budgets for different spending categories. Track your progress throughout the month and get alerts when you\'re approaching your limits.',
    targetPage: '/budget-app/budgets',
    highlight: 'budget-section',
  },
  {
    title: '📊 View Reports & Insights',
    description: 'Visualize your spending patterns, track your net worth, and make informed financial decisions. Your dashboard updates automatically with every transaction!',
    targetPage: '/budget-app',
    highlight: 'dashboard-section',
  },
];

export function OnboardingTour() {
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

  function handleNext() {
    if (currentStep < TOUR_STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Navigate to target page if specified
      const step = TOUR_STEPS[nextStep];
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
      const step = TOUR_STEPS[prevStep];
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
    if (confirm('Skip the tour? You can restart it anytime from Settings.')) {
      completeTour();
    }
  }

  if (!isVisible) return null;

  const step = TOUR_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

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
              Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
            <button
              onClick={skipTour}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Skip tour
            </button>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {step.title}
          </h2>

          {/* Description */}
          <p className="text-gray-700 leading-relaxed mb-6">
            {step.description}
          </p>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            {!isFirstStep && (
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
            )}
            
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
            >
              {isLastStep ? (
                <>
                  <Check className="w-4 h-4" />
                  Get Started
                </>
              ) : (
                <>
                  {step.action || 'Next'}
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
                Don't show this tour again
              </label>
            </div>
          )}
        </div>

        {/* Feature Highlights */}
        {!isFirstStep && !isLastStep && (
          <div className="px-8 pb-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-900 font-medium mb-2">💡 Quick Tip</p>
              <p className="text-sm text-gray-700">
                {currentStep === 1 && 'Drag & drop your CSV file or click to browse. We auto-detect BMO and Home Trust formats!'}
                {currentStep === 2 && 'Use the quick categorize button or select multiple transactions for bulk categorization.'}
                {currentStep === 3 && 'Set realistic budgets and we\'ll alert you if you\'re on track to overspend.'}
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

