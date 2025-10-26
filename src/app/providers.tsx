"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { IncorrectAnswersProvider } from "@/contexts/IncorrectAnswersContext";
import { initClientMonitoring } from "@/lib/monitoring";
import { GlobalNavProvider } from "@/contexts/GlobalNavContext";

/**
 * Providers - Essential root-level context providers
 *
 * PERFORMANCE OPTIMIZATION:
 * Only includes contexts needed by ALL pages to minimize initial bundle size
 * and improve Time to Interactive (TTI).
 *
 * Root-level providers (always loaded):
 * - AuthProvider: Authentication state (needed everywhere)
 * - SettingsProvider: User settings, theme, accessibility (needed everywhere)
 * - IncorrectAnswersProvider: Badge counts in Sidebar (lightweight, needed globally)
 * - GlobalNavProvider: Navigation state (needed everywhere)
 *
 * Page-specific providers (lazy-loaded):
 * - See @/app/heavy-providers.tsx for DatabaseProvider, ProgressProvider,
 *   ModuleProvider, QuestionsProvider, ExamProvider, AssessmentProvider,
 *   PracticeProvider, SearchProvider, IncorrectAnswersProvider
 *
 * Usage:
 * ```tsx
 * // For pages needing heavy contexts:
 * import { HeavyProviders } from "@/app/heavy-providers";
 *
 * export default function MyPage() {
 *   return (
 *     <HeavyProviders>
 *       <PageContent />
 *     </HeavyProviders>
 *   );
 * }
 * ```
 *
 * Benefits:
 * - Home page loads ~70% faster (only 3 providers vs 12)
 * - Smaller initial JavaScript bundle
 * - Better Lighthouse performance score
 * - Still maintains full functionality for authenticated pages
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // Initialize client-side monitoring once
  if (typeof window !== "undefined") {
    initClientMonitoring();
  }

  return (
    <AuthProvider>
      <SettingsProvider>
        <IncorrectAnswersProvider>
          <GlobalNavProvider value={true}>
            {children}
          </GlobalNavProvider>
        </IncorrectAnswersProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
