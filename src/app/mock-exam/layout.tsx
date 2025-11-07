import { HeavyProviders } from "@/app/heavy-providers";

/**
 * Mock Exam Route Layout
 *
 * Wraps mock exam pages with HeavyProviders to load necessary contexts:
 * - DatabaseProvider, ProgressProvider, QuestionsProvider
 * - ExamProvider, AssessmentProvider, PracticeProvider
 *
 * This layout ensures ProgressProvider is available for the mock exam page,
 * fixing the "useProgress must be used within a ProgressProvider" error.
 *
 * Note: Uses HeavyProviders instead of ExamOnlyProviders to include ProgressProvider.
 */
export default function MockExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HeavyProviders>{children}</HeavyProviders>;
}
