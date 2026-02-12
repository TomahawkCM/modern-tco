'use client';

import { Trophy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { BudgetAchievement } from '@/types/budget';

interface AchievementToastProps {
  achievement: BudgetAchievement | null;
  onDismiss: () => void;
  className?: string;
}

export function AchievementToast({ achievement, onDismiss, className }: AchievementToastProps) {
  const t = useTranslations('budget.gamification');

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={cn(
            'fixed bottom-6 start-1/2 z-50 -translate-x-1/2',
            'flex items-center gap-3 rounded-xl border border-amber-500/30 bg-slate-900/95 px-5 py-3 shadow-2xl backdrop-blur-sm',
            className
          )}
          onClick={onDismiss}
          role="alert"
        >
          <div className="rounded-lg bg-amber-500/20 p-2">
            <Trophy className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-amber-400">{t('achievementUnlocked')}</p>
            <p className="text-sm font-semibold text-white">{achievement.name}</p>
            <p className="text-xs text-slate-400">{achievement.description}</p>
          </div>
          <div className="ms-3 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-300">
            +{achievement.points}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
