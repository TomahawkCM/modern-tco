/**
 * Budget App Layout
 * Standalone household budget management with mobile-responsive collapsible sidebar
 * Phase 3 Task 3.1.1: Implemented collapsible sidebar for screens <768px
 */

"use client";

import { AccessibilityQuickToggle } from "@/components/budget/AccessibilityQuickToggle";
import { BudgetAccessibilityInitializer } from "@/components/budget/BudgetAccessibilityInitializer";
import { CommandPalette } from "@/components/budget/CommandPalette";
import { IOSInstallBanner } from "@/components/budget/IOSInstallBanner";
import { OnboardingTour } from "@/components/budget/OnboardingTour";
import { PWAInstallPrompt } from "@/components/budget/PWAInstallPrompt";
import { ShortcutsModal } from "@/components/budget/ShortcutsModal";
import { ToastProvider } from "@/components/budget/Toast";
import { TrialStatusBanner } from "@/components/budget/TrialStatusBanner";
import { ChatbotWidget } from "@/components/budget/chatbot/ChatbotWidget";
import { FloatingActionButton } from "@/components/budget/layout/FloatingActionButton";
import { MobileNav } from "@/components/budget/layout/MobileNav";
import { Sidebar } from "@/components/budget/layout/Sidebar";
import { WelcomeBanner } from "@/components/budget/onboarding";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ChatbotProvider } from "@/contexts/ChatbotContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { PrivacyProvider } from "@/contexts/PrivacyContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { SeniorsModeProvider } from "@/contexts/SeniorsModeContext";
import { useIOSStatePreservation } from "@/hooks/useIOSStatePreservation";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { usePWA } from "@/hooks/usePWA";
import { Menu, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Breadcrumb } from "@/components/budget/Breadcrumb";
import { ClientI18nProvider } from "@/components/budget/ClientI18nProvider";

export default function BudgetAppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [_showNewTransactionModal, setShowNewTransactionModal] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Routes that should NOT have the sidebar/app shell
  const isPublicRoute =
    pathname?.startsWith("/budget-app/landing") ||
    pathname?.startsWith("/budget-app/auth") ||
    pathname?.startsWith("/budget-app/admin");

  const isOnboardingRoute = pathname === "/budget-app/onboarding";

  // Check for onboarding completion
  useEffect(() => {
    // Skip check for public routes or if we're already on onboarding
    if (isPublicRoute || isOnboardingRoute) return;

    const isOnboarded = localStorage.getItem("budget_app_onboarding_completed");

    if (!isOnboarded) {
      router.push("/budget-app/onboarding");
    }
  }, [pathname, isPublicRoute, isOnboardingRoute, router]);

  // PWA functionality - Phase 3.2
  usePWA(); // Register service worker

  // iOS PWA state preservation (scroll position + route on background/resume)
  useIOSStatePreservation();

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewTransaction: () => {
      void router.push("/budget-app/transactions");
      setShowNewTransactionModal(true);
    },
    onSearch: () => {
      setCommandPaletteOpen(true);
    },
    onShowHelp: () => {
      setShowShortcutsModal(true);
    },
    onCloseModal: () => {
      setShowShortcutsModal(false);
      setMobileMenuOpen(false);
      setCommandPaletteOpen(false);
    },
  });

  // Render simplified layout for public/auth/admin routes
  if (isPublicRoute || isOnboardingRoute) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <SeniorsModeProvider>
          <PrivacyProvider>
            <ProfileProvider>
              <ChatbotProvider>
                <NotificationProvider>
                  <ClientI18nProvider>
                    <ToastProvider>{children}</ToastProvider>
                  </ClientI18nProvider>
                </NotificationProvider>
              </ChatbotProvider>
            </ProfileProvider>
          </PrivacyProvider>
        </SeniorsModeProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <SeniorsModeProvider>
        <PrivacyProvider>
          <ProfileProvider>
            <ChatbotProvider>
              <NotificationProvider>
                <ClientI18nProvider>
                  <BudgetAccessibilityInitializer />

                  {/* Skip Link - WCAG 2.4.1 Bypass Blocks */}
                  <a
                    href="#main-content"
                    className="sr-only transition-all focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-6 focus:py-3 focus:font-semibold focus:text-teal-700 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  >
                    Skip to main content
                  </a>

                  {/* Global Background - Dark Mesh Gradient */}
                  <div className="fixed inset-0 -z-20 bg-slate-950" />
                  <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black" />
                  <div className="fixed inset-0 -z-10 bg-[url('/grid.svg')] bg-center opacity-20 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

                  {/* Ambient Glows */}
                  <div className="pointer-events-none fixed left-0 top-0 -z-10 h-full w-full overflow-hidden">
                    <div className="absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-teal-500/10 blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
                  </div>

                  {/* Trial Status Banner - shows for trial users */}
                  <TrialStatusBanner showOnlyWhenUrgent={false} />

                  {/* Premium Welcome Wizard (Glassmorphism) */}
                  <OnboardingTour />

                  <div className="flex min-h-screen text-slate-200">
                    {/* Desktop/Tablet Sidebar — hidden on mobile, icon-only on md, full on lg */}
                    <Sidebar
                      onSearch={() => setCommandPaletteOpen(true)}
                      onShowShortcuts={() => setShowShortcutsModal(true)}
                    />

                    {/* Mobile Sidebar Sheet */}
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                      <SheetContent
                        side="left"
                        className="w-72 border-r-0 bg-transparent p-0 shadow-2xl"
                      >
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <SheetDescription className="sr-only">
                          Main navigation menu for the Budget App
                        </SheetDescription>
                        <Sidebar
                          isMobile
                          onClose={() => setMobileMenuOpen(false)}
                          onSearch={() => setCommandPaletteOpen(true)}
                          onShowShortcuts={() => setShowShortcutsModal(true)}
                        />
                      </SheetContent>
                    </Sheet>

                    {/* Main Content Area */}
                    <div className="flex min-w-0 flex-1 flex-col">
                      {/* Mobile Header */}
                      <header
                        className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-md md:hidden"
                        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)" }}
                      >
                        <Link
                          href="/budget-app/landing"
                          className="flex items-center gap-3 transition-opacity hover:opacity-80"
                        >
                          <div className="rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 p-1.5">
                            <Sparkles className="h-5 w-5 text-white" />
                          </div>
                          <h1 className="text-lg font-bold text-white">Budget App</h1>
                        </Link>
                        <div className="flex items-center gap-2">
                          {/* Accessibility Quick Toggle - Prominent placement per plan */}
                          <AccessibilityQuickToggle compact />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMobileMenuOpen(true)}
                            className="text-slate-400 hover:bg-white/10 hover:text-white"
                          >
                            <Menu className="h-6 w-6" />
                          </Button>
                        </div>
                      </header>

                      {/* Main Content */}
                      <main
                        id="main-content"
                        className="flex-1 overflow-x-hidden pb-16 md:pb-0"
                        tabIndex={0}
                        aria-label="Main content"
                        role="main"
                      >
                        {/* Non-blocking Welcome Banner - at top of content */}
                        <WelcomeBanner />

                        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
                          {/* Breadcrumbs for deep pages (depth > 2 past /budget-app/) */}
                          {pathname && pathname.split("/").filter(Boolean).length > 2 && (
                            <Breadcrumb className="mb-2" />
                          )}
                          <ToastProvider>{children}</ToastProvider>
                        </div>
                      </main>

                      {/* Mobile Bottom Tab Bar — fixed at bottom, visible below md */}
                      <MobileNav />

                      {/* FAB — mobile only, for quick transaction entry */}
                      <FloatingActionButton
                        onClick={() => {
                          void router.push("/budget-app/transactions");
                          setShowNewTransactionModal(true);
                        }}
                      />
                    </div>

                    {/* Shortcuts Help Modal */}
                    {showShortcutsModal && (
                      <ShortcutsModal onClose={() => setShowShortcutsModal(false)} />
                    )}

                    {/* PWA Install Prompts — Android/Desktop + iOS */}
                    <PWAInstallPrompt />
                    <IOSInstallBanner />

                    {/* AI Chatbot Widget */}
                    <ChatbotWidget />

                    {/* Command Palette */}
                    <CommandPalette
                      open={commandPaletteOpen}
                      onOpenChange={setCommandPaletteOpen}
                    />
                  </div>
                </ClientI18nProvider>
              </NotificationProvider>
            </ChatbotProvider>
          </ProfileProvider>
        </PrivacyProvider>
      </SeniorsModeProvider>
    </ThemeProvider>
  );
}
