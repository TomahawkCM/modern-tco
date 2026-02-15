"use client";

import { cn } from "@/lib/utils";
import { useSeniorsMode } from "@/hooks/useSeniorsMode";
import { motion } from "framer-motion";
import {
  BarChart3,
  Bell,
  Building2,
  Calculator,
  Camera,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FlaskConical,
  Home,
  Landmark,
  MoreHorizontal,
  PartyPopper,
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
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { PrivacyToggle } from "@/components/budget/PrivacyToggle";
import { ProfileSelector } from "@/components/budget/profile/ProfileSelector";
import { NotificationCenter } from "@/components/budget/notifications";

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
  { name: "accounts", href: "/budget-app/accounts", icon: Landmark, essential: true },
  { name: "scanReceipt", href: "/budget-app/ocr", icon: Camera },
  { name: "categories", href: "/budget-app/categories", icon: Tags, essential: true },
  { name: "budgets", href: "/budget-app/budgets", icon: PieChart, essential: true },
  { name: "subscriptions", href: "/budget-app/subscriptions", icon: Repeat },
  { name: "reminders", href: "/budget-app/settings?tab=notifications", icon: Bell },
  { name: "loans", href: "/budget-app/loans", icon: CreditCard },
  { name: "investments", href: "/budget-app/investments", icon: Wallet },
  { name: "calculators", href: "/budget-app/calculators", icon: Calculator },
  { name: "futurePlans", href: "/budget-app/planning/future", icon: Target },
  { name: "retirement", href: "/budget-app/planning/retirement", icon: TrendingUp },
  { name: "reports", href: "/budget-app/reports", icon: BarChart3, essential: true },
  { name: "netWorth", href: "/budget-app/net-worth", icon: TrendingUp },
  { name: "properties", href: "/budget-app/properties", icon: Building2 },
  { name: "events", href: "/budget-app/events", icon: PartyPopper },
  { name: "scenarios", href: "/budget-app/scenarios", icon: FlaskConical },
];

// Simplified navigation for Seniors Mode - only essential items
const simplifiedNavigation = navigation.filter((item) => item.essential);

interface SidebarProps {
  onSearch?: () => void;
  onShowShortcuts?: () => void;
  className?: string;
  isMobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ onSearch, onShowShortcuts, className, isMobile, onClose }: SidebarProps) {
  const t = useTranslations("sidebar");
  const pathname = usePathname();
  const router = useRouter();
  const [isManuallyCollapsed, setIsManuallyCollapsed] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);
  const { isSeniorsMode, settings } = useSeniorsMode();

  // Use simplified navigation in Seniors Mode (unless user wants all items)
  const useSimplifiedNav = isSeniorsMode && settings.simplifiedMode && !showAllItems;
  const activeNavigation = useSimplifiedNav ? simplifiedNavigation : navigation;

  // Responsive sidebar:
  // - Mobile sheet: full width, always expanded
  // - md (tablet): icon-only at 72px (w-18) — can't be expanded at this breakpoint
  // - lg+ (desktop): full 240px (w-60) — can be collapsed to 72px manually
  // - Seniors Mode: never collapsed
  const isCollapsed = !isMobile && !isSeniorsMode && isManuallyCollapsed;

  return (
    <aside
      aria-label="Main sidebar"
      className={cn(
        "relative flex h-full flex-col border-e border-white/10 bg-slate-950/80 backdrop-blur-xl transition-all duration-200",
        !isMobile && "hidden md:flex md:w-18 lg:w-60",
        !isMobile && isManuallyCollapsed && !isSeniorsMode && "lg:w-18",
        isMobile && "w-full",
        className
      )}
    >
      {/* Collapse Toggle — desktop (lg+) only */}
      {!isMobile && (
        <button
          onClick={() => setIsManuallyCollapsed(!isManuallyCollapsed)}
          className="absolute -end-3 top-8 z-50 hidden h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-slate-900 text-slate-400 shadow-lg transition-colors hover:text-white lg:flex"
          aria-label={isCollapsed ? t("actions.expandSidebar") : t("actions.collapseSidebar")}
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      )}

      {/* Logo/Header */}
      <div className="flex h-20 items-center border-b border-white/5 px-6 md:justify-center md:px-3 lg:justify-start lg:px-6">
        <Link
          href="/budget-app/landing"
          className={cn(
            "flex items-center gap-3 rounded-lg transition-opacity hover:opacity-80",
            !isMobile && isCollapsed && "lg:gap-0"
          )}
          title={t("actions.backToHome")}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 shadow-lg shadow-teal-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          {/* Show text: always on mobile, hidden on md (icon-only), shown on lg+ unless manually collapsed */}
          <div
            className={cn(
              "overflow-hidden whitespace-nowrap transition-all duration-200",
              isMobile ? "w-auto opacity-100" : "hidden lg:block",
              !isMobile && isCollapsed && "lg:hidden"
            )}
          >
            <h1 className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-lg font-bold text-transparent">
              {t("appTitle")}
            </h1>
            <p className="text-[10px] text-slate-500">{t("appSubtitle")}</p>
          </div>
        </Link>
      </div>

      {/* Profile Selector & Notifications */}
      <div
        className={cn(
          "border-b border-white/5 px-3 py-3",
          !isMobile && "md:flex md:flex-col md:items-center md:gap-2 lg:block",
          !isMobile && isCollapsed && "lg:flex lg:flex-col lg:items-center lg:gap-2"
        )}
      >
        <div
          className={cn(
            "flex w-full items-center gap-2",
            !isMobile && "md:justify-center lg:justify-start",
            !isMobile && isCollapsed && "lg:justify-center"
          )}
        >
          <ProfileSelector
            className={cn(
              "flex-1 justify-start bg-white/5 text-slate-300 hover:bg-white/10",
              !isMobile && "md:w-auto md:flex-none md:px-2 lg:flex-1 lg:px-3",
              !isMobile && isCollapsed && "lg:w-auto lg:flex-none lg:px-2"
            )}
            compact={!isMobile && !isSeniorsMode}
            showSettings
            onSettingsClick={() => {
              router.push("/budget-app/settings?tab=profile");
              if (isMobile && onClose) onClose();
            }}
          />
          {/* Show notification center: on mobile always, on lg+ when not collapsed */}
          <div
            className={cn(!isMobile && "hidden lg:block", !isMobile && isCollapsed && "lg:hidden")}
          >
            <NotificationCenter compact />
          </div>
        </div>
        {/* When icon-only (md or collapsed lg), show notification below profile */}
        {!isMobile && (
          <div className={cn("md:block lg:hidden", isCollapsed && "lg:block")}>
            <NotificationCenter compact />
          </div>
        )}
      </div>

      {/* Search Trigger */}
      <div className="p-4 md:p-2 lg:p-4">
        <button
          onClick={onSearch}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/5 p-3 text-sm text-slate-400 transition-all hover:border-white/10 hover:bg-white/10 hover:text-white",
            !isMobile && "md:justify-center md:px-2 lg:justify-start lg:px-4",
            !isMobile && isCollapsed && "lg:justify-center lg:px-2"
          )}
        >
          <Search className="h-4 w-4 shrink-0" />
          {/* Label: shown on mobile, hidden on md, shown on lg unless collapsed */}
          <span
            className={cn(
              "flex-1 text-start",
              !isMobile && "hidden lg:inline",
              !isMobile && isCollapsed && "lg:hidden"
            )}
          >
            {t("search")}
          </span>
          <kbd
            className={cn(
              "rounded border border-white/10 bg-black/20 px-1.5 py-0.5 font-mono text-[10px] text-slate-500",
              !isMobile && "hidden lg:inline",
              !isMobile && isCollapsed && "lg:hidden"
            )}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav
        id="sidebar-nav"
        aria-label="Primary navigation"
        className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-2 md:px-2 lg:px-3"
      >
        {activeNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              id={`sidebar-${item.name}`}
              href={item.href}
              onClick={isMobile ? onClose : undefined}
              title={t(`navigation.${item.name}`)}
              className={cn(
                "group relative flex items-center gap-3 overflow-hidden rounded-xl transition-all duration-200",
                // Larger touch targets in Seniors Mode (52px min)
                isSeniorsMode ? "min-h-[52px] px-4 py-3.5" : "px-3 py-2.5",
                isActive
                  ? "bg-gradient-to-r from-teal-500/10 to-blue-500/10 text-teal-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
                // Icon-only centering on md, or when manually collapsed on lg
                !isMobile && "md:justify-center lg:justify-start",
                !isMobile && isCollapsed && "lg:justify-center"
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
                  "relative z-10 shrink-0 transition-transform group-hover:scale-110",
                  isSeniorsMode ? "h-6 w-6" : "h-5 w-5",
                  isActive ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300"
                )}
              />
              {/* Label: always on mobile, hidden on md, shown on lg unless collapsed */}
              <span
                className={cn(
                  "relative z-10 truncate font-medium",
                  isSeniorsMode ? "text-base" : "text-sm",
                  !isMobile && "hidden lg:inline",
                  !isMobile && isCollapsed && "lg:hidden"
                )}
              >
                {t(`navigation.${item.name}`)}
              </span>
            </Link>
          );
        })}

        {/* Show All Items toggle - Seniors Mode only */}
        {isSeniorsMode && settings.simplifiedMode && (
          <button
            onClick={() => setShowAllItems(!showAllItems)}
            className={cn(
              "mx-1 mt-2 flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white",
              !isMobile && "md:justify-center lg:justify-start"
            )}
            aria-expanded={showAllItems}
            aria-label={showAllItems ? "Show simplified menu" : "Show all menu items"}
          >
            <MoreHorizontal className="h-4 w-4 shrink-0" />
            <span className={cn(!isMobile && "hidden lg:inline")}>
              {showAllItems ? t("actions.showLess") : t("actions.showAllItems")}
            </span>
          </button>
        )}
      </nav>

      {/* Footer Actions */}
      <div className="border-t border-white/5 bg-black/20 p-3 md:p-2 lg:p-3">
        <div className="space-y-1">
          <Link
            href="/budget-app/import"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white",
              !isMobile && "md:justify-center lg:justify-start",
              !isMobile && isCollapsed && "lg:justify-center"
            )}
            title={t("actions.importCsv")}
          >
            <Upload className="h-5 w-5 shrink-0" />
            <span
              className={cn(
                !isMobile && "hidden lg:inline",
                !isMobile && isCollapsed && "lg:hidden"
              )}
            >
              {t("actions.importCsv")}
            </span>
          </Link>
          {/* Privacy Mode Toggle */}
          {isMobile ? (
            <PrivacyToggle compact={false} />
          ) : (
            <>
              {/* Icon-only on md, full on lg (unless collapsed) */}
              <div className={cn("md:flex md:justify-center lg:hidden", isCollapsed && "lg:flex")}>
                <PrivacyToggle compact />
              </div>
              <div className={cn("hidden lg:block", isCollapsed && "lg:hidden")}>
                <PrivacyToggle compact={false} />
              </div>
            </>
          )}
          <Link
            id="sidebar-settings"
            href="/budget-app/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white",
              !isMobile && "md:justify-center lg:justify-start",
              !isMobile && isCollapsed && "lg:justify-center"
            )}
            title={t("actions.settings")}
          >
            <Settings className="h-5 w-5 shrink-0" />
            <span
              className={cn(
                !isMobile && "hidden lg:inline",
                !isMobile && isCollapsed && "lg:hidden"
              )}
            >
              {t("actions.settings")}
            </span>
          </Link>
          <button
            onClick={onShowShortcuts}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white",
              !isMobile && "md:justify-center lg:justify-start",
              !isMobile && isCollapsed && "lg:justify-center"
            )}
            title={t("shortcuts")}
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-slate-600 font-mono text-xs">
              ?
            </div>
            <span
              className={cn(
                !isMobile && "hidden lg:inline",
                !isMobile && isCollapsed && "lg:hidden"
              )}
            >
              {t("shortcuts")}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
