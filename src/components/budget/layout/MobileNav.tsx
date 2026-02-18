"use client";

import { cn } from "@/lib/utils";
import { Home, List, MoreHorizontal, PieChart, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const tabs = [
  { href: "/budget-app", icon: Home, labelKey: "home" },
  { href: "/budget-app/budgets", icon: PieChart, labelKey: "budget" },
  { href: "/budget-app/accounts", icon: Wallet, labelKey: "accounts" },
  { href: "/budget-app/transactions", icon: List, labelKey: "activity" },
  { href: "/budget-app/more", icon: MoreHorizontal, labelKey: "more" },
] as const;

/** Prefixes owned by the first 4 tabs — anything else belongs to "More" */
const primaryTabPrefixes = [
  "/budget-app/budgets",
  "/budget-app/accounts",
  "/budget-app/transactions",
];

export function MobileNav() {
  const pathname = usePathname();
  const t = useTranslations("mobileNav");
  const tAria = useTranslations("aria");

  return (
    <nav
      aria-label={tAria("mobileNavigation")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex h-14 items-center justify-around">
        {tabs.map(({ href, icon: Icon, labelKey }) => {
          let isActive: boolean;
          if (href === "/budget-app") {
            isActive = pathname === href;
          } else if (href === "/budget-app/more") {
            // "More" is active when on /budget-app/more OR any route not covered by other tabs
            isActive =
              pathname !== "/budget-app" &&
              !primaryTabPrefixes.some((p) => pathname?.startsWith(p)) &&
              (pathname?.startsWith("/budget-app/") ?? false);
          } else {
            isActive = pathname?.startsWith(href) ?? false;
          }
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-touch-comfortable min-w-[64px] flex-col items-center justify-center gap-0.5",
                "text-xs transition-colors",
                isActive ? "font-medium text-teal-400" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span>{t(labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
