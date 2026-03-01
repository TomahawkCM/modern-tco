"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Receipt,
  Landmark,
  Tags,
  PieChart,
  Repeat,
  CreditCard,
  Wallet,
  Building2,
  TrendingUp,
  BarChart3,
  Lightbulb,
  Calculator,
  Target,
  FlaskConical,
  Upload,
  Settings,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  labelKey: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  labelKey: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    labelKey: "core",
    items: [
      { labelKey: "dashboard", href: "/dashboard", icon: LayoutDashboard },
      { labelKey: "transactions", href: "/transactions", icon: Receipt },
      { labelKey: "accounts", href: "/accounts", icon: Landmark },
      { labelKey: "categories", href: "/categories", icon: Tags },
    ],
  },
  {
    labelKey: "planning",
    items: [
      { labelKey: "budgets", href: "/budgets", icon: PieChart },
      { labelKey: "subscriptions", href: "/subscriptions", icon: Repeat },
      { labelKey: "loans", href: "/loans", icon: CreditCard },
    ],
  },
  {
    labelKey: "wealth",
    items: [
      { labelKey: "investments", href: "/investments", icon: Wallet },
      { labelKey: "properties", href: "/properties", icon: Building2 },
      { labelKey: "netWorth", href: "/net-worth", icon: TrendingUp },
    ],
  },
  {
    labelKey: "analysis",
    items: [
      { labelKey: "reports", href: "/reports", icon: BarChart3 },
      { labelKey: "insights", href: "/insights", icon: Lightbulb },
      { labelKey: "calculators", href: "/calculators", icon: Calculator },
    ],
  },
  {
    labelKey: "tools",
    items: [
      { labelKey: "futurePlans", href: "/planning/future", icon: Target },
      { labelKey: "scenarios", href: "/scenarios", icon: FlaskConical },
    ],
  },
];

const footerItems: NavItem[] = [
  { labelKey: "import", href: "/import", icon: Upload },
  { labelKey: "settings", href: "/settings", icon: Settings },
  { labelKey: "chat", href: "/chat", icon: MessageCircle },
];

export function AppSidebar() {
  const pathname = usePathname();
  const t = useTranslations("sidebar");
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r bg-muted/40 transition-all duration-200",
        collapsed ? "w-16" : "lg:w-60 w-16"
      )}
    >
      {/* Brand */}
      <div className="flex h-14 items-center border-b px-4">
        {!collapsed && (
          <span className="hidden lg:block text-sm font-semibold">
            {t("brand")}
          </span>
        )}
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navGroups.map((group) => (
          <div key={group.labelKey} className="mb-2">
            {!collapsed && (
              <p className="hidden lg:block px-4 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {t(`groups.${group.labelKey}`)}
              </p>
            )}
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 text-sm transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive(item.href)
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground"
                )}
                title={collapsed ? t(item.labelKey) : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <span className="hidden lg:block truncate">
                    {t(item.labelKey)}
                  </span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer items */}
      <div className="border-t py-2">
        {footerItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-2 text-sm transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              isActive(item.href)
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground"
            )}
            title={collapsed ? t(item.labelKey) : undefined}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <span className="hidden lg:block truncate">
                {t(item.labelKey)}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Collapse toggle — desktop lg+ only */}
      <div className="hidden lg:flex border-t p-2 justify-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? t("expand") : t("collapse")}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
