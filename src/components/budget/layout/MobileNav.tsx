"use client";

import { cn } from "@/lib/utils";
import {
  Home,
  List,
  MoreHorizontal,
  PieChart,
  Wallet,
} from "lucide-react";
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

export function MobileNav() {
  const pathname = usePathname();
  const t = useTranslations("mobileNav");

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-slate-950/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-14">
        {tabs.map(({ href, icon: Icon, labelKey }) => {
          const isActive =
            href === "/budget-app"
              ? pathname === href
              : pathname?.startsWith(href) ?? false;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center min-w-[64px] min-h-touch gap-0.5",
                "text-xs transition-colors",
                isActive
                  ? "text-teal-400 font-medium"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span>{t(labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
