import { ExamOnlyProviders } from "@/app/heavy-providers";

/**
 * Mock Exam Route Layout
 *
 * Wraps mock exam pages with ExamOnlyProviders to load necessary contexts:
 * - DatabaseProvider, QuestionsProvider, ExamProvider, AssessmentProvider
 *
 * This layout ensures contexts are only loaded for exam routes,
 * improving performance for other pages.
 */
export default function MockExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ExamOnlyProviders>{children}</ExamOnlyProviders>;
}
