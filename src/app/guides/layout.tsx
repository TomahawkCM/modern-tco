import { LearningProviders } from "@/app/heavy-providers";

/**
 * Guides Route Layout
 *
 * Wraps guides pages with LearningProviders to load necessary contexts:
 * - DatabaseProvider (for data access)
 * - ProgressProvider (for progress tracking)
 * - ModuleProvider (for module information)
 *
 * This ensures guides have access to module and progress data.
 */
export default function GuidesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LearningProviders>{children}</LearningProviders>;
}
