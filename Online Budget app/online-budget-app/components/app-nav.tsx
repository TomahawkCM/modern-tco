"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Lightbulb,
  MessageCircle,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

const navItems: { href: string; labelKey: string; icon: LucideIcon }[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/transactions", labelKey: "transactions", icon: ArrowLeftRight },
  { href: "/budgets", labelKey: "budgets", icon: Wallet },
  { href: "/insights", labelKey: "insights", icon: Lightbulb },
  { href: "/chat", labelKey: "chat", icon: MessageCircle },
];

export function AppNav({ signOutAction }: { signOutAction: () => void }) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav className="flex h-14 items-center gap-1 border-b px-4">
      <span className="mr-4 text-sm font-semibold">{t("brand")}</span>
      {navItems.map((item) => (
        <Button
          key={item.href}
          variant={pathname === item.href ? "secondary" : "ghost"}
          size="sm"
          asChild
        >
          <Link href={item.href}>
            <item.icon className="mr-1.5 h-4 w-4" />
            {t(item.labelKey)}
          </Link>
        </Button>
      ))}
      <form className="ml-auto" action={signOutAction}>
        <Button variant="ghost" size="sm" type="submit">
          <LogOut className="mr-1.5 h-4 w-4" />
          {t("signOut")}
        </Button>
      </form>
    </nav>
  );
}
