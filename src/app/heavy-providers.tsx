"use client";

import { DatabaseProvider } from "@/contexts/DatabaseContext";
import { ProgressProvider } from "@/contexts/ProgressContext";
import { ModuleProvider } from "@/contexts/ModuleContext";
import { QuestionsProvider } from "@/contexts/QuestionsContext";
import { ExamProvider } from "@/contexts/ExamContext";
import { AssessmentProvider } from "@/contexts/AssessmentContext";
import { PracticeProvider } from "@/contexts/PracticeContext";
import { SearchProvider } from "@/contexts/SearchContext";

/**
 * HeavyProviders - Page-specific context providers
 *
 * These providers are NOT loaded at root level to improve initial page load performance.
 * Only import this component on pages that actually need these contexts.
 *
 * Use cases:
 * - Learning pages: ModuleProvider, ProgressProvider
 * - Practice pages: PracticeProvider, QuestionsProvider
 * - Exam pages: ExamProvider, AssessmentProvider
 * - Review pages: (IncorrectAnswersProvider is at root level)
 * - Search functionality: SearchProvider
 *
 * Note: IncorrectAnswersProvider is now at root level because Sidebar needs it globally.
 *
 * @example
 * ```tsx
 * // In a learning module page
 * import { HeavyProviders } from "@/app/heavy-providers";
 *
 * export default function ModulePage() {
 *   return (
 *     <HeavyProviders>
 *       <ModuleContent />
 *     </HeavyProviders>
 *   );
 * }
 * ```
 */
export function HeavyProviders({ children }: { children: React.ReactNode }) {
  return (
    <DatabaseProvider>
      <ProgressProvider>
        <ModuleProvider>
          <QuestionsProvider>
            <ExamProvider>
              <AssessmentProvider>
                <PracticeProvider>
                  <SearchProvider>
                    {children}
                  </SearchProvider>
                </PracticeProvider>
              </AssessmentProvider>
            </ExamProvider>
          </QuestionsProvider>
        </ModuleProvider>
      </ProgressProvider>
    </DatabaseProvider>
  );
}

/**
 * LearningProviders - Subset for learning/module pages
 * Lighter than HeavyProviders, only includes contexts needed for learning
 */
export function LearningProviders({ children }: { children: React.ReactNode }) {
  return (
    <DatabaseProvider>
      <ProgressProvider>
        <ModuleProvider>
          {children}
        </ModuleProvider>
      </ProgressProvider>
    </DatabaseProvider>
  );
}

/**
 * PracticeOnlyProviders - Subset for practice pages
 * Includes practice, questions, and progress tracking
 * Note: IncorrectAnswersProvider already at root level
 */
export function PracticeOnlyProviders({ children }: { children: React.ReactNode }) {
  return (
    <DatabaseProvider>
      <ProgressProvider>
        <QuestionsProvider>
          <PracticeProvider>
            {children}
          </PracticeProvider>
        </QuestionsProvider>
      </ProgressProvider>
    </DatabaseProvider>
  );
}

/**
 * ExamOnlyProviders - Subset for exam/assessment pages
 * Includes exam, assessment, and questions contexts
 */
export function ExamOnlyProviders({ children }: { children: React.ReactNode }) {
  return (
    <DatabaseProvider>
      <QuestionsProvider>
        <ExamProvider>
          <AssessmentProvider>
            {children}
          </AssessmentProvider>
        </ExamProvider>
      </QuestionsProvider>
    </DatabaseProvider>
  );
}
