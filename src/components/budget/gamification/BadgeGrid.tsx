"use client";

import { Lock, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/budget/ui/GlassCard";
import type { BudgetAchievement } from "@/types/budget";

interface BadgeGridProps {
  achievements: BudgetAchievement[];
  className?: string;
}

const RARITY_COLORS: Record<string, string> = {
  common: "border-slate-500/30 bg-slate-500/10",
  uncommon: "border-green-500/30 bg-green-500/10",
  rare: "border-blue-500/30 bg-blue-500/10",
  epic: "border-purple-500/30 bg-purple-500/10",
  legendary: "border-amber-500/30 bg-amber-500/10",
};

const RARITY_TEXT: Record<string, string> = {
  common: "text-slate-400",
  uncommon: "text-green-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-amber-400",
};

export function BadgeGrid({ achievements, className }: BadgeGridProps) {
  const t = useTranslations("budget.gamification");

  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4", className)}>
      {achievements.map((achievement, i) => (
        <motion.div
          key={achievement.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <GlassCard
            className={cn(
              "flex flex-col items-center gap-2 p-4 text-center transition-all",
              achievement.unlockedAt
                ? RARITY_COLORS[achievement.rarity]
                : "border-slate-700/30 bg-slate-800/30 opacity-60"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                achievement.unlockedAt ? "bg-amber-500/20" : "bg-slate-700/50"
              )}
            >
              {achievement.unlockedAt ? (
                <Trophy className={cn("h-5 w-5", RARITY_TEXT[achievement.rarity])} />
              ) : (
                <Lock className="h-4 w-4 text-slate-500" />
              )}
            </div>
            <p
              className={cn(
                "text-xs font-semibold",
                achievement.unlockedAt ? "text-white" : "text-slate-500"
              )}
            >
              {achievement.name}
            </p>
            <p className="line-clamp-2 text-[10px] text-slate-400">{achievement.description}</p>
            <span className={cn("text-[10px] font-medium", RARITY_TEXT[achievement.rarity])}>
              {achievement.rarity} · {achievement.points}pts
            </span>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}
