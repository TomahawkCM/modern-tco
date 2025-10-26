import { HeavyProviders } from "@/app/heavy-providers";

/**
 * Practice Route Layout
 *
 * Wraps practice pages with HeavyProviders to load necessary contexts:
 * - DatabaseProvider, ProgressProvider, QuestionsProvider
 * - PracticeProvider, ExamProvider, SearchProvider, etc.
 *
 * This layout ensures contexts are only loaded for practice routes,
 * improving performance for other pages.
 */
export default function PracticeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HeavyProviders>{children}</HeavyProviders>;
}
