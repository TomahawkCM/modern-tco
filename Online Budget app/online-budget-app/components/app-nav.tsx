"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  MessageCircle,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/budgets", label: "Budgets", icon: Wallet },
  { href: "/chat", label: "AI Chat", icon: MessageCircle },
];

export function AppNav({ signOutAction }: { signOutAction: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-14 items-center gap-1 border-b px-4">
      <span className="mr-4 text-sm font-semibold">Budget</span>
      {navItems.map((item) => (
        <Button
          key={item.href}
          variant={pathname === item.href ? "secondary" : "ghost"}
          size="sm"
          asChild
        >
          <Link href={item.href}>
            <item.icon className="mr-1.5 h-4 w-4" />
            {item.label}
          </Link>
        </Button>
      ))}
      <form className="ml-auto" action={signOutAction}>
        <Button variant="ghost" size="sm" type="submit">
          <LogOut className="mr-1.5 h-4 w-4" />
          Sign Out
        </Button>
      </form>
    </nav>
  );
}
