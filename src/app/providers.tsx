"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { DatabaseProvider } from "@/contexts/DatabaseContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ProgressProvider } from "@/contexts/ProgressContext";
import { ModuleProvider } from "@/contexts/ModuleContext";
import { QuestionsProvider } from "@/contexts/QuestionsContext";
import { ExamProvider } from "@/contexts/ExamContext";
import { AssessmentProvider } from "@/contexts/AssessmentContext";
import { PracticeProvider } from "@/contexts/PracticeContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { IncorrectAnswersProvider } from "@/contexts/IncorrectAnswersContext";
import { initClientMonitoring } from "@/lib/monitoring";
import { GlobalNavProvider } from "@/contexts/GlobalNavContext";

export function Providers({ children }: { children: React.ReactNode }) {
  // Initialize client-side monitoring once
  if (typeof window !== "undefined") {
    initClientMonitoring();
  }
  return (
    <AuthProvider>
      <DatabaseProvider>
        <SettingsProvider>
          <ProgressProvider>
            <ModuleProvider>
              <QuestionsProvider>
                <IncorrectAnswersProvider>
                  <ExamProvider>
                    <AssessmentProvider>
                      <PracticeProvider>
                        <SearchProvider>
                          <GlobalNavProvider value={true}>{children}</GlobalNavProvider>
                        </SearchProvider>
                      </PracticeProvider>
                    </AssessmentProvider>
                  </ExamProvider>
                </IncorrectAnswersProvider>
              </QuestionsProvider>
            </ModuleProvider>
          </ProgressProvider>
        </SettingsProvider>
      </DatabaseProvider>
    </AuthProvider>
  );
}
