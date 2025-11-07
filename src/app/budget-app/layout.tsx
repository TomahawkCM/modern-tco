/**
 * Budget App Layout
 * Standalone household budget management with mobile-responsive collapsible sidebar
 * Phase 3 Task 3.1.1: Implemented collapsible sidebar for screens <768px
 */

'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Home,
  Receipt,
  PieChart,
  Target,
  TrendingUp,
  BarChart3,
  Settings,
  Download,
  Upload,
  Tags,
  Menu,
  Wallet
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ShortcutsModal } from '@/components/budget/ShortcutsModal';
import { OnboardingTour } from '@/components/budget/OnboardingTour';
import { ToastProvider } from '@/components/budget/Toast';
import { PWAInstallPrompt } from '@/components/budget/PWAInstallPrompt';
import { usePWA } from '@/hooks/usePWA';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/budget-app', icon: Home },
  { name: 'Transactions', href: '/budget-app/transactions', icon: Receipt },
  { name: 'Categories', href: '/budget-app/categories', icon: Tags },
  { name: 'Budgets', href: '/budget-app/budgets', icon: PieChart },
  { name: 'Investments', href: '/budget-app/investments', icon: Wallet },
  { name: 'Future Plans', href: '/budget-app/planning/future', icon: Target },
  { name: 'Retirement', href: '/budget-app/planning/retirement', icon: TrendingUp },
  { name: 'Reports', href: '/budget-app/reports', icon: BarChart3 },
];

export default function BudgetAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // PWA functionality - Phase 3.2
  usePWA(); // Register service worker

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewTransaction: () => {
      // This will be handled by parent page if they provide the handler
      // For now, we'll navigate to transactions page
      void router.push('/budget-app/transactions');
      setShowNewTransactionModal(true);
    },
    onSearch: () => {
      // Focus search input if it exists on the current page
      const searchInput = document.querySelector<HTMLInputElement>('input[type="search"], input[placeholder*="Search"]');
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

  // Sidebar content component to reuse in both desktop and mobile views
  const SidebarContent = () => (
    <>
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Budget App</h1>
        <p className="text-sm text-gray-500 mt-2">Household Finance Manager</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-4 px-4 py-2 min-h-[44px] text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            <item.icon className="w-6 h-6" />
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Link
          href="/budget-app/import"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-4 px-4 py-2 min-h-[44px] text-gray-700 rounded-lg hover:bg-gray-100 transition-colors w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          <Upload className="w-6 h-6" />
          <span className="font-medium">Import CSV</span>
        </Link>
        <Link
          href="/budget-app/export"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-4 px-4 py-2 min-h-[44px] text-gray-700 rounded-lg hover:bg-gray-100 transition-colors w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          <Download className="w-6 h-6" />
          <span className="font-medium">Export Data</span>
        </Link>
        <Link
          href="/budget-app/settings"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-4 px-4 py-2 min-h-[44px] text-gray-700 rounded-lg hover:bg-gray-100 transition-colors w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          <Settings className="w-6 h-6" />
          <span className="font-medium">Settings</span>
        </Link>

        {/* Keyboard Shortcuts Help */}
        <button
          onClick={() => {
            setShowShortcutsModal(true);
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-4 px-4 py-2 min-h-[44px] text-gray-700 rounded-lg hover:bg-gray-100 transition-colors w-full text-left focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          <span className="text-xs font-mono font-semibold w-6 h-6 flex items-center justify-center">?</span>
          <span className="font-medium text-sm">Keyboard Shortcuts</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar - hidden on mobile (<768px) */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full w-full">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-white">
          <div className="flex flex-col h-full">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header with Hamburger Menu - visible only on mobile */}
        <header className="md:hidden bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-bold text-gray-900">Budget App</h1>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            <ToastProvider>
              {children}
            </ToastProvider>
          </div>
        </main>

        {/* Bottom Navigation Bar - Mobile Only */}
        {/* Phase 3 Task 3.1.2: Bottom navigation for quick access to main features */}
        {/* Phase 3 Task 3.1.3: Touch targets ≥44px for accessibility */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-40">
          <div className="flex justify-around items-center">
            {/* Dashboard */}
            <Link
              href="/budget-app"
              className="flex flex-col items-center gap-2 px-4 py-2 text-gray-600 hover:text-teal-500 transition-colors min-w-[64px] min-h-[44px] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <Home className="w-6 h-6" />
              <span className="text-xs font-medium">Home</span>
            </Link>

            {/* Transactions */}
            <Link
              href="/budget-app/transactions"
              className="flex flex-col items-center gap-2 px-4 py-2 text-gray-600 hover:text-teal-500 transition-colors min-w-[64px] min-h-[44px] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <Receipt className="w-6 h-6" />
              <span className="text-xs font-medium">Transactions</span>
            </Link>

            {/* Categories */}
            <Link
              href="/budget-app/categories"
              className="flex flex-col items-center gap-2 px-4 py-2 text-gray-600 hover:text-teal-500 transition-colors min-w-[64px] min-h-[44px] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <Tags className="w-6 h-6" />
              <span className="text-xs font-medium">Categories</span>
            </Link>

            {/* Budgets */}
            <Link
              href="/budget-app/budgets"
              className="flex flex-col items-center gap-2 px-4 py-2 text-gray-600 hover:text-teal-500 transition-colors min-w-[64px] min-h-[44px] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <PieChart className="w-6 h-6" />
              <span className="text-xs font-medium">Budgets</span>
            </Link>

            {/* More Menu */}
            <Button
              variant="ghost"
              onClick={() => setMobileMenuOpen(true)}
              className="flex flex-col items-center gap-2 px-4 py-2 text-gray-600 hover:text-teal-500 transition-colors h-auto min-w-[64px] min-h-[44px]"
              aria-label="More options"
            >
              <Menu className="w-6 h-6" />
              <span className="text-xs font-medium">More</span>
            </Button>
          </div>
        </nav>
      </div>

      {/* Shortcuts Help Modal */}
      {showShortcutsModal && (
        <ShortcutsModal onClose={() => setShowShortcutsModal(false)} />
      )}

      {/* Onboarding Tour */}
      <OnboardingTour />

      {/* PWA Install Prompt - Phase 3.2.3 */}
      <PWAInstallPrompt />
    </div>
  );
}
