'use client';

import { AssessmentProvider } from '@/contexts/AssessmentContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { DatabaseProvider } from '@/contexts/DatabaseContext';
import { ExamProvider } from '@/contexts/ExamContext';
import { GlobalNavProvider } from '@/contexts/GlobalNavContext';
import { IncorrectAnswersProvider } from '@/contexts/IncorrectAnswersContext';
import { ModuleProvider } from '@/contexts/ModuleContext';
import { PracticeProvider } from '@/contexts/PracticeContext';
import { ProgressProvider } from '@/contexts/ProgressContext';
import { QuestionsProvider } from '@/contexts/QuestionsContext';
import { SearchProvider } from '@/contexts/SearchContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { initClientMonitoring } from '@/lib/monitoring';

export function Providers({ children }: { children: React.ReactNode }) {
  // Initialize client-side monitoring once
  if (typeof window !== 'undefined') {
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
