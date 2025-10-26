import { HeavyProviders } from "@/app/heavy-providers";

/**
 * Test DB Route Layout
 *
 * Wraps test-db page with HeavyProviders to load all contexts:
 * - DatabaseProvider, ProgressProvider, ModuleProvider
 * - QuestionsProvider, ExamProvider, AssessmentProvider
 * - PracticeProvider, SearchProvider
 *
 * This is a development/testing route that needs access to all contexts.
 */
export default function TestDbLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HeavyProviders>{children}</HeavyProviders>;
}
