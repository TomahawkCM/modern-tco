import { HeavyProviders } from "@/app/heavy-providers";

/**
 * Search Route Layout
 *
 * Wraps search pages with HeavyProviders to load all necessary contexts:
 * - DatabaseProvider, ProgressProvider, ModuleProvider
 * - QuestionsProvider, PracticeProvider
 * - SearchProvider (required for search functionality)
 *
 * Search needs access to all content types, so it uses HeavyProviders.
 */
export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <HeavyProviders>{children}</HeavyProviders>;
}
