import { LearningProviders } from "@/app/heavy-providers";

/**
 * Welcome Route Layout
 *
 * Wraps welcome page with LearningProviders to provide:
 * - DatabaseProvider (for progress data)
 * - ProgressProvider (used by HomePage component)
 * - ModuleProvider (for module information)
 *
 * This ensures the welcome/home page has access to user progress data.
 */
export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LearningProviders>{children}</LearningProviders>;
}
