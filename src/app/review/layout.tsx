import { LearningProviders } from "@/app/heavy-providers";

/**
 * Review Route Layout
 *
 * Wraps review pages with LearningProviders to load necessary contexts:
 * - DatabaseProvider (for data access)
 * - ProgressProvider (for progress tracking)
 * - ModuleProvider (for module information - required by review components)
 *
 * Note: IncorrectAnswersProvider is at root level
 *
 * This layout ensures contexts are only loaded for review routes,
 * improving performance for other pages.
 */
export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  return <LearningProviders>{children}</LearningProviders>;
}
