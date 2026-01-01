"use client";

import { cn } from "@/lib/utils";
import { useSeniorsMode } from "@/hooks/useSeniorsMode";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Camera,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Home,
  MoreHorizontal,
  PieChart,
  Receipt,
  Repeat,
  Search,
  Settings,
  Sparkles,
  Tags,
  Target,
  TrendingUp,
  Upload,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslations } from 'next-intl';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /** If true, this item appears in simplified (Seniors Mode) navigation */
  essential?: boolean;
}

const navigation: NavItem[] = [
  { name: "dashboard", href: "/budget-app", icon: Home, essential: true },
  { name: "transactions", href: "/budget-app/transactions", icon: Receipt, essential: true },
  { name: "scanReceipt", href: "/budget-app/ocr", icon: Camera },
  { name: "categories", href: "/budget-app/categories", icon: Tags, essential: true },
  { name: "budgets", href: "/budget-app/budgets", icon: PieChart, essential: true },
  { name: "subscriptions", href: "/budget-app/subscriptions", icon: Repeat },
  { name: "loans", href: "/budget-app/loans", icon: CreditCard },
  { name: "investments", href: "/budget-app/investments", icon: Wallet },
  { name: "futurePlans", href: "/budget-app/planning/future", icon: Target },
  { name: "retirement", href: "/budget-app/planning/retirement", icon: TrendingUp },
  { name: "reports", href: "/budget-app/reports", icon: BarChart3, essential: true },
];

// Simplified navigation for Seniors Mode - only essential items
const simplifiedNavigation = navigation.filter(item => item.essential);

interface SidebarProps {
  onSearch?: () => void;
  onShowShortcuts?: () => void;
  className?: string;
  isMobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ onSearch, onShowShortcuts, className, isMobile, onClose }: SidebarProps) {
  const t = useTranslations('sidebar');
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);
  const { isSeniorsMode, settings } = useSeniorsMode();

  // Use simplified navigation in Seniors Mode (unless user wants all items)
  const useSimplifiedNav = isSeniorsMode && settings.simplifiedMode && !showAllItems;
  const activeNavigation = useSimplifiedNav ? simplifiedNavigation : navigation;

  // Always expanded on mobile, never collapsed in Seniors Mode
  const width = isMobile ? "100%" : (isCollapsed && !isSeniorsMode) ? 80 : 288;

  return (
    <motion.aside
      initial={false}
      animate={{ width }}
      aria-label="Main sidebar"
      className={cn(
        "relative flex h-full flex-col border-r border-white/10 bg-slate-950/80 backdrop-blur-xl",
        !isMobile && "hidden md:flex",
        className
      )}
    >
      {/* Toggle Button - Desktop Only */}
      {!isMobile && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -end-3 top-8 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-slate-900 text-slate-400 shadow-lg transition-colors hover:text-white"
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      )}

      {/* Logo/Header */}
      <div className="flex h-20 items-center border-b border-white/5 px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 shadow-lg shadow-teal-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <h1 className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-lg font-bold text-transparent">
                  {t('appTitle')}
                </h1>
                <p className="text-[10px] text-slate-500">{t('appSubtitle')}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Search Trigger */}
      <div className="p-4">
        <button
          onClick={onSearch}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3 text-sm text-slate-400 transition-all hover:border-white/10 hover:bg-white/10 hover:text-white",
            isCollapsed ? "justify-center px-2" : "px-4"
          )}
        >
          <Search className="h-4 w-4" />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">{t('search')}</span>
              <kbd className="rounded border border-white/10 bg-black/20 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                ⌘K
              </kbd>
            </>
          )}
        </button>
      </div>

      {/* Navigation - Uses simplified nav in Seniors Mode */}
      <nav aria-label="Primary navigation" className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {activeNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={isMobile ? onClose : undefined}
              className={cn(
                "group relative flex items-center gap-3 overflow-hidden rounded-xl transition-all duration-200",
                // Larger touch targets in Seniors Mode (52px min)
                isSeniorsMode ? "px-4 py-3.5 min-h-[52px]" : "px-3 py-2.5",
                isActive
                  ? "bg-gradient-to-r from-teal-500/10 to-blue-500/10 text-teal-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
                isCollapsed && !isSeniorsMode && "justify-center"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 border-s-2 border-teal-500 bg-white/5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
              <item.icon
                className={cn(
                  "relative z-10 transition-transform group-hover:scale-110",
                  // Larger icons in Seniors Mode
                  isSeniorsMode ? "h-6 w-6" : "h-5 w-5",
                  isActive ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300"
                )}
              />
              {(!isCollapsed || isSeniorsMode) && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "relative z-10 truncate font-medium",
                    // Larger text in Seniors Mode
                    isSeniorsMode ? "text-base" : "text-sm"
                  )}
                >
                  {t(`navigation.${item.name}`)}
                </motion.span>
              )}
            </Link>
          );
        })}

        {/* Show All Items toggle - Seniors Mode only */}
        {isSeniorsMode && settings.simplifiedMode && !isCollapsed && (
          <button
            onClick={() => setShowAllItems(!showAllItems)}
            className="mx-3 mt-2 flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-expanded={showAllItems}
            aria-label={showAllItems ? "Show simplified menu" : "Show all menu items"}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span>{showAllItems ? t('actions.showLess') : t('actions.showAllItems')}</span>
          </button>
        )}
      </nav>

      {/* Footer Actions */}
      <div className="border-t border-white/5 bg-black/20 p-3">
        <div className="space-y-1">
          <Link
            href="/budget-app/import"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white",
              isCollapsed && "justify-center"
            )}
          >
            <Upload className="h-5 w-5" />
            {!isCollapsed && <span>{t('actions.importCsv')}</span>}
          </Link>
          <Link
            href="/budget-app/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white",
              isCollapsed && "justify-center"
            )}
          >
            <Settings className="h-5 w-5" />
            {!isCollapsed && <span>{t('actions.settings')}</span>}
          </Link>
          <button
            onClick={onShowShortcuts}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white",
              isCollapsed && "justify-center"
            )}
          >
            <div className="flex h-5 w-5 items-center justify-center rounded border border-slate-600 font-mono text-xs">
              ?
            </div>
            {!isCollapsed && <span>{t('shortcuts')}</span>}
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
