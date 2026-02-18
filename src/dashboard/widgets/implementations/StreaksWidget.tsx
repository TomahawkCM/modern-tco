"use client";

import { GlassCard } from "@/components/budget/ui/GlassCard";
import {
  calculateStreak,
  calculateTotalPoints,
  getAllAchievements,
} from "@/lib/budget-gamification";
import { Flame, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { WidgetConfig } from "../types";

interface StreaksWidgetProps {
  config: WidgetConfig;
}

export function StreaksWidget({ config }: StreaksWidgetProps) {
  const t = useTranslations("dashboard.widgets.streaks");
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0, lastActiveDate: "" });
  const [points, setPoints] = useState(0);
  const [unlockedCount, setUnlockedCount] = useState(0);

  useEffect(() => {
    async function load() {
      const s = await calculateStreak();
      setStreak(s);
      setPoints(calculateTotalPoints());
      const all = getAllAchievements();
      setUnlockedCount(all.filter((a) => a.unlockedAt).length);
    }
    load();
  }, []);

  const spanClass =
    config.size === "large"
      ? "md:col-span-2 lg:col-span-4"
      : config.size === "medium"
        ? "md:col-span-2"
        : "";

  return (
    <div className={spanClass}>
      <GlassCard className="flex h-full flex-col p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-orange-500/20 p-2">
              <Flame className="h-5 w-5 text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">{t("title")}</h3>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-around">
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-400">{streak.currentStreak}</p>
            <p className="text-xs text-slate-400">{t("dayStreak")}</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-400">{points}</p>
            <p className="text-xs text-slate-400">{t("points")}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Trophy className="h-4 w-4 text-emerald-400" />
              <p className="text-3xl font-bold text-emerald-400">{unlockedCount}</p>
            </div>
            <p className="text-xs text-slate-400">{t("badges")}</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
