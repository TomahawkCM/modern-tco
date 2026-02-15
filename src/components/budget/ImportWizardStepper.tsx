/**
 * Import Wizard Step Indicator
 * Visual progress indicator for multi-step import process
 */

import { Check } from "lucide-react";

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "current" | "complete";
}

interface ImportWizardStepperProps {
  steps: WizardStep[];
  currentStep: number;
}

export function ImportWizardStepper({ steps, currentStep }: ImportWizardStepperProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center justify-between">
        {steps.map((step, stepIdx) => (
          <li
            key={step.id}
            className={`relative ${stepIdx !== steps.length - 1 ? "flex-1 pr-8 sm:pr-20" : ""}`}
          >
            {/* Connector Line */}
            {stepIdx !== steps.length - 1 && (
              <div className="absolute left-4 top-4 h-0.5 w-full" aria-hidden="true">
                <div
                  className={`h-full transition-all duration-500 ${
                    stepIdx < currentStep ? "bg-teal-600" : "bg-gray-200"
                  }`}
                />
              </div>
            )}

            {/* Step Circle */}
            <div className="group relative flex items-start">
              <span className="flex h-9 items-center">
                {step.status === "complete" ? (
                  <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 transition-colors group-hover:bg-teal-700">
                    <Check className="h-5 w-5 text-white" aria-hidden="true" />
                  </span>
                ) : step.status === "current" ? (
                  <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-teal-600 bg-white">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-teal-600" />
                  </span>
                ) : (
                  <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white group-hover:border-gray-400">
                    <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" />
                  </span>
                )}
              </span>

              {/* Step Labels */}
              <span className="ml-4 flex min-w-0 flex-col">
                <span
                  className={`text-sm font-medium ${
                    step.status === "complete"
                      ? "text-teal-600"
                      : step.status === "current"
                        ? "text-teal-600"
                        : "text-gray-500"
                  }`}
                >
                  {step.title}
                </span>
                <span className="hidden text-xs text-gray-500 sm:block">{step.description}</span>
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
