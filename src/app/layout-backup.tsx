import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SkipLinks } from "@/components/accessibility/skip-links";
import { AuthProvider } from "@/contexts/AuthContext";
import { DatabaseProvider } from "@/contexts/DatabaseContext";
import { QuestionsProvider } from "@/contexts/QuestionsContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { ExamProvider } from "@/contexts/ExamContext";
import { ProgressProvider } from "@/contexts/ProgressContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { IncorrectAnswersProvider } from "@/contexts/IncorrectAnswersContext";
import { ModuleProvider } from "@/contexts/ModuleContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tanium Certified Operator - Exam Preparation",
  description: "Modern exam preparation system for Tanium Certified Operator certification",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#1a365d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <TooltipProvider>
            <AuthProvider>
              <DatabaseProvider>
                <SettingsProvider>
                  <QuestionsProvider>
                    <SearchProvider>
                      <ProgressProvider>
                        <IncorrectAnswersProvider>
                          <ModuleProvider>
                            <ExamProvider>
                              <SkipLinks />
                              <div className="min-h-screen bg-gradient-to-br from-tanium-dark via-tanium-secondary to-tanium-primary">
                                {children}
                              </div>
                              <Toaster />
                            </ExamProvider>
                          </ModuleProvider>
                        </IncorrectAnswersProvider>
                      </ProgressProvider>
                    </SearchProvider>
                  </QuestionsProvider>
                </SettingsProvider>
              </DatabaseProvider>
            </AuthProvider>
          </TooltipProvider>

          {/* Screen reader only content */}
          <div id="screen-reader-status" className="sr-only" aria-live="polite" aria-atomic="true">
            {/* Dynamic status updates will be announced here */}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}