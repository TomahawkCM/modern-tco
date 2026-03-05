"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Home, PieChart, Landmark, Receipt, MoreHorizontal } from "lucide-react";

const tabs = [
  { href: "/dashboard", icon: Home, labelKey: "home" },
  { href: "/budgets", icon: PieChart, labelKey: "budgets" },
  { href: "/accounts", icon: Landmark, labelKey: "accounts" },
  { href: "/transactions", icon: Receipt, labelKey: "transactions" },
  { href: "/more", icon: MoreHorizontal, labelKey: "more" },
] as const;

const primaryTabPrefixes = ["/budgets", "/accounts", "/transactions"];

export function MobileNav() {
  const pathname = usePathname();
  const t = useTranslations("mobileNav");

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex h-14 items-center justify-around">
        {tabs.map(({ href, icon: Icon, labelKey }) => {
          let isActive: boolean;
          if (href === "/dashboard") {
            isActive = pathname === "/dashboard";
          } else if (href === "/more") {
            isActive =
              pathname !== "/dashboard" &&
              !primaryTabPrefixes.some((p) => pathname?.startsWith(p)) &&
              (pathname?.startsWith("/") ?? false);
          } else {
            isActive = pathname?.startsWith(href) ?? false;
          }

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-w-[64px] flex-col items-center justify-center gap-0.5",
                "text-xs transition-colors",
                isActive
                  ? "font-medium text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.5} />
              <span>{t(labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
