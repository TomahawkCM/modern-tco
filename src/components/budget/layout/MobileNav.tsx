"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Home, Menu, PieChart, Receipt, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileNavProps {
  onOpenMenu: () => void;
}

export function MobileNav({ onOpenMenu }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Mobile navigation" className="safe-area-pb fixed bottom-6 left-4 right-4 z-40 md:hidden">
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-slate-950/90 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
        <div className="flex items-center justify-around">
          <Link
            href="/budget-app"
            className={cn(
              "relative flex flex-col items-center gap-1 rounded-xl p-2 transition-colors",
              pathname === "/budget-app" ? "text-teal-400" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <Home className="h-6 w-6" />
            {pathname === "/budget-app" && (
              <motion.div
                layoutId="mobileNavIndicator"
                className="absolute -bottom-1 h-1 w-1 rounded-full bg-teal-400"
              />
            )}
          </Link>

          <Link
            href="/budget-app/transactions"
            className={cn(
              "relative flex flex-col items-center gap-1 rounded-xl p-2 transition-colors",
              pathname === "/budget-app/transactions"
                ? "text-teal-400"
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            <Receipt className="h-6 w-6" />
            {pathname === "/budget-app/transactions" && (
              <motion.div
                layoutId="mobileNavIndicator"
                className="absolute -bottom-1 h-1 w-1 rounded-full bg-teal-400"
              />
            )}
          </Link>

          {/* Quick Action FAB */}
          <div className="relative -top-8">
            <Link
              href="/budget-app/transactions" // Or a quick add modal trigger
              className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-blue-600 text-white shadow-lg shadow-teal-500/30 transition-transform active:scale-95"
            >
              <Sparkles className="h-6 w-6" />
            </Link>
          </div>

          <Link
            href="/budget-app/budgets"
            className={cn(
              "relative flex flex-col items-center gap-1 rounded-xl p-2 transition-colors",
              pathname === "/budget-app/budgets"
                ? "text-teal-400"
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            <PieChart className="h-6 w-6" />
            {pathname === "/budget-app/budgets" && (
              <motion.div
                layoutId="mobileNavIndicator"
                className="absolute -bottom-1 h-1 w-1 rounded-full bg-teal-400"
              />
            )}
          </Link>

          <button
            onClick={onOpenMenu}
            className="flex flex-col items-center gap-1 rounded-xl p-2 text-slate-500 transition-colors hover:text-slate-300"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}
