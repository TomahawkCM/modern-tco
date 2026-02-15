"use client";

import { Flame } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  className?: string;
}

export function StreakCounter({ currentStreak, longestStreak, className }: StreakCounterProps) {
  const t = useTranslations("budget.gamification");

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <motion.div
        animate={currentStreak > 0 ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        className="flex items-center gap-1.5"
      >
        <Flame
          className={cn("h-5 w-5", currentStreak > 0 ? "text-orange-400" : "text-slate-500")}
        />
        <span className="text-lg font-bold text-white">{currentStreak}</span>
      </motion.div>
      <div className="text-xs text-slate-400">
        <p>{t("currentStreak")}</p>
        <p>{t("longestStreak", { count: longestStreak })}</p>
      </div>
    </div>
  );
}
