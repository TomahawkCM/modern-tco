/**
 * Budget App Layout
 * Standalone household budget management with mobile-responsive collapsible sidebar
 * Phase 3 Task 3.1.1: Implemented collapsible sidebar for screens <768px
 */

"use client";

import { BudgetAccessibilityInitializer } from "@/components/budget/BudgetAccessibilityInitializer";
import { OnboardingTour } from "@/components/budget/OnboardingTour";
import { PWAInstallPrompt } from "@/components/budget/PWAInstallPrompt";
import { ShortcutsModal } from "@/components/budget/ShortcutsModal";
import { ToastProvider } from "@/components/budget/Toast";
import { ChatbotWidget } from "@/components/budget/chatbot/ChatbotWidget";
import { MobileNav } from "@/components/budget/layout/MobileNav";
import { Sidebar } from "@/components/budget/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ChatbotProvider } from "@/contexts/ChatbotContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { usePWA } from "@/hooks/usePWA";
import { Menu, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function BudgetAppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false);

  // PWA functionality - Phase 3.2
  usePWA(); // Register service worker

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewTransaction: () => {
      void router.push("/budget-app/transactions");
      setShowNewTransactionModal(true);
    },
    onSearch: () => {
      const searchInput = document.querySelector<HTMLInputElement>(
        'input[type="search"], input[placeholder*="Search"]'
      );
      if (searchInput) {
        searchInput.focus();
      }
    },
    onShowHelp: () => {
      setShowShortcutsModal(true);
    },
    onCloseModal: () => {
      setShowShortcutsModal(false);
      setMobileMenuOpen(false);
    },
  });

  return (
    <ChatbotProvider>
      <BudgetAccessibilityInitializer />
      {/* Global Background - Dark Mesh Gradient */}
      <div className="fixed inset-0 -z-20 bg-slate-950" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('/grid.svg')] bg-center opacity-20 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      {/* Ambient Glows */}
      <div className="pointer-events-none fixed left-0 top-0 -z-10 h-full w-full overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-teal-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="flex min-h-screen text-slate-200">
        {/* Desktop Sidebar */}
        <Sidebar
          onSearch={() => {
            /* Implement search logic */
          }}
          onShowShortcuts={() => setShowShortcutsModal(true)}
        />

        {/* Mobile Sidebar Sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-72 border-r-0 bg-transparent p-0 shadow-2xl">
            <Sidebar
              isMobile
              onClose={() => setMobileMenuOpen(false)}
              onShowShortcuts={() => setShowShortcutsModal(true)}
            />
          </SheetContent>
        </Sheet>

        {/* Main Content Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile Header */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-md md:hidden">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 p-1.5">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-white">Budget App</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-x-hidden pb-24 md:pb-8">
            <div className="mx-auto max-w-7xl p-4 md:p-8">
              <ToastProvider>{children}</ToastProvider>
            </div>
          </main>

          {/* Mobile Bottom Navigation */}
          <MobileNav onOpenMenu={() => setMobileMenuOpen(true)} />
        </div>

        {/* Shortcuts Help Modal */}
        {showShortcutsModal && <ShortcutsModal onClose={() => setShowShortcutsModal(false)} />}

        {/* Onboarding Tour */}
        <OnboardingTour />

        {/* PWA Install Prompt */}
        <PWAInstallPrompt />

        {/* AI Chatbot Widget */}
        <ChatbotWidget />
      </div>
    </ChatbotProvider>
  );
}
