'use client';

import React from 'react';
import { createContext, useContext, useState } from 'react';

interface StepsContextType {
  currentStep: number;
  incrementStep: () => number;
}

const StepsContext = createContext<StepsContextType | null>(null);

interface StepsProps {
  children: React.ReactNode;
}

interface StepProps {
  title: string;
  children: React.ReactNode;
}

function StepsRoot({ children }: StepsProps) {
  const [stepCounter, setStepCounter] = useState(0);

  const incrementStep = () => {
    const newStep = stepCounter + 1;
    setStepCounter(newStep);
    return newStep;
  };

  return (
    <StepsContext.Provider value={{ currentStep: stepCounter, incrementStep }}>
      <div className="steps-container my-6 space-y-4">
        <style jsx>{`
          .steps-container {
            counter-reset: step-counter;
          }
          .steps-container :global(.step-item) {
            counter-increment: step-counter;
          }
          .steps-container :global(.step-number)::before {
            content: counter(step-counter);
          }
          .steps-container :global(.step-item:last-child .step-connector) {
            display: none;
          }
        `}</style>
        {children}
      </div>
    </StepsContext.Provider>
  );
}

function Step({ title, children }: StepProps) {
  const context = useContext(StepsContext);
  if (!context) {
    throw new Error('Steps.Step must be used within a Steps component');
  }

  // Get step number on first render
  const [stepNumber] = useState(() => context.incrementStep());
  const isLastStep = false; // We'll keep it simple - always show connector line

  return (
    <div className="flex gap-4">
      {/* Step number indicator */}
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-sm font-semibold text-primary">
          {stepNumber}
        </div>
        {/* Connecting line */}
        {!isLastStep && <div className="mt-1 h-full w-0.5 bg-border" />}
      </div>

      {/* Step content */}
      <div className="flex-1 pb-6">
        <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
        <div className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Object.assign(StepsRoot, { Step });
