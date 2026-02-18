import { LearningProviders } from "@/app/heavy-providers";

/**
 * Modules Route Layout
 *
 * Wraps module pages with LearningProviders to load necessary contexts:
 * - DatabaseProvider, ProgressProvider, ModuleProvider
 *
 * This layout ensures contexts are only loaded for module/learning routes,
 * improving performance for other pages.
 */
export default function ModulesLayout({ children }: { children: React.ReactNode }) {
  return <LearningProviders>{children}</LearningProviders>;
}
