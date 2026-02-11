'use client';

import { GlassCard } from '@/components/budget/ui/GlassCard';
import { db } from '@/lib/budget-db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import { CalendarDays, TrendingDown, TrendingUp } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import NextLink from 'next/link';
import { useMemo } from 'react';
import type { WidgetConfig } from '../types';

interface WeeklyRecapWidgetProps {
  config: WidgetConfig;
}

export function WeeklyRecapWidget({ config }: WeeklyRecapWidgetProps) {
  const t = useTranslations('dashboard.widgets.weeklyRecap');
  const format = useFormatter();
  const currency = useDefaultCurrency();

  const transactions = useLiveQuery(async () => {
    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const startOfPrevWeek = new Date(startOfWeek);
      startOfPrevWeek.setDate(startOfPrevWeek.getDate() - 7);

      const allTxs = await db.transactions.toArray();
      const thisWeek = allTxs.filter(tx => {
        if (tx.isSplit || tx.amount >= 0) return false;
        return new Date(tx.date) >= startOfWeek;
      });
      const lastWeek = allTxs.filter(tx => {
        if (tx.isSplit || tx.amount >= 0) return false;
        const d = new Date(tx.date);
        return d >= startOfPrevWeek && d < startOfWeek;
      });
      return { thisWeek, lastWeek };
    } catch {
      return { thisWeek: [], lastWeek: [] };
    }
  }) || { thisWeek: [], lastWeek: [] };

  const stats = useMemo(() => {
    const thisWeekTotal = transactions.thisWeek.reduce((s, tx) => s + Math.abs(tx.amount), 0);
    const lastWeekTotal = transactions.lastWeek.reduce((s, tx) => s + Math.abs(tx.amount), 0);
    const change = lastWeekTotal > 0 ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100 : 0;

    // Top 3 categories
    const catMap = new Map<string, number>();
    transactions.thisWeek.forEach(tx => {
      const cat = tx.category || 'Uncategorized';
      catMap.set(cat, (catMap.get(cat) || 0) + Math.abs(tx.amount));
    });
    const topCategories = Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, amount]) => ({ name, amount }));

    return { thisWeekTotal, lastWeekTotal, change, topCategories };
  }, [transactions]);

  const spanClass =
    config.size === 'large' ? 'md:col-span-2 lg:col-span-4'
    : config.size === 'medium' ? 'md:col-span-2' : '';

  const isDown = stats.change <= 0;

  return (
    <div className={spanClass}>
      <GlassCard className="flex h-full flex-col p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-violet-500/20 p-2">
              <CalendarDays className="h-5 w-5 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">{t('title')}</h3>
          </div>
          <NextLink
            href="/budget-app/friday-review"
            className="text-xs text-slate-400 transition-colors hover:text-white"
          >
            {t('viewFull')}
          </NextLink>
        </div>

        <div className="mb-4 flex items-end gap-2">
          <span className="text-2xl font-bold text-white">
            {format.number(stats.thisWeekTotal, { style: 'currency', currency })}
          </span>
          <div className={`flex items-center gap-0.5 text-xs ${isDown ? 'text-emerald-400' : 'text-red-400'}`}>
            {isDown ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
            <span>{Math.abs(Math.round(stats.change))}%</span>
          </div>
        </div>

        {stats.topCategories.length > 0 && (
          <div className="space-y-2">
            {stats.topCategories.map(cat => {
              const pct = stats.thisWeekTotal > 0 ? (cat.amount / stats.thisWeekTotal) * 100 : 0;
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">{cat.name}</span>
                    <span className="text-slate-400">
                      {format.number(cat.amount, { style: 'currency', currency })}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-700">
                    <div
                      className="h-full rounded-full bg-violet-500 transition-all duration-500"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
