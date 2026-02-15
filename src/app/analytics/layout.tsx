import { LearningProviders } from "@/app/heavy-providers";

/**
 * Analytics Route Layout
 *
 * Wraps analytics pages with LearningProviders to load necessary contexts:
 * - DatabaseProvider (for data access)
 * - ProgressProvider (for progress tracking and analytics)
 * - ModuleProvider (for module information)
 *
 * This ensures analytics have access to progress and module data.
 */
export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <LearningProviders>{children}</LearningProviders>;
}
