'use client';

import { GlassCard } from '@/components/budget/ui/GlassCard';
import { getActiveEvents, calculateProgress } from '@/lib/event-budgets/event-budget-engine';
import { getRelevantTemplates } from '@/lib/event-budgets/seasonal-templates';
import { useDefaultCurrency } from '@/hooks/useDefaultCurrency';
import { CardSkeleton } from '@/components/budget/LoadingSkeleton';
import { PartyPopper, Plus, Calendar, Sparkles } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import type { EventBudget, EventBudgetCategory } from '@/types/budget';

interface EventWithProgress {
  event: EventBudget;
  total: number;
  spent: number;
  remaining: number;
  byCategory: EventBudgetCategory[];
}

export function ClientEvents() {
  const t = useTranslations('budget.events');
  const format = useFormatter();
  const currency = useDefaultCurrency();
  const [events, setEvents] = useState<EventWithProgress[]>([]);
  const [templates, setTemplates] = useState<ReturnType<typeof getRelevantTemplates>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const active = await getActiveEvents();
        const withProgress = await Promise.all(
          active.map(async (event) => {
            const progress = await calculateProgress(event.id);
            return { event, ...progress };
          })
        );
        setEvents(withProgress);
        setTemplates(getRelevantTemplates(new Date().getMonth() + 1));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const fmtCurrency = (v: number) => format.number(v, { style: 'currency', currency });

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-700" />
        <div className="grid gap-4 sm:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PartyPopper className="h-7 w-7 text-pink-400" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pink-500">
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t('createEvent')}
        </button>
      </div>

      {/* Seasonal Templates Suggestion */}
      {templates.length > 0 && (
        <GlassCard className="border-pink-500/20 bg-pink-500/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-pink-400" aria-hidden="true" />
            <span className="text-sm font-medium text-pink-300">{t('suggestedTemplates')}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {templates.map(tmpl => (
              <button
                key={tmpl.id}
                aria-label={`${t('createEvent')}: ${tmpl.name}`}
                className="rounded-lg border border-pink-500/20 bg-pink-500/10 px-3 py-1.5 text-xs text-pink-200 transition-colors hover:bg-pink-500/20"
              >
                {tmpl.name}
              </button>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Active Events */}
      {events.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center p-12 text-center">
          <Calendar className="mb-4 h-16 w-16 text-slate-600" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-slate-300">{t('noEvents')}</h2>
          <p className="mt-2 text-sm text-slate-500">{t('noEventsDescription')}</p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {events.map(({ event, total, spent, remaining, byCategory }) => {
            const pct = total > 0 ? (spent / total) * 100 : 0;
            const daysLeft = Math.max(0, Math.ceil((new Date(event.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

            return (
              <GlassCard key={event.id} className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-white">{event.name}</h3>
                    {event.description && (
                      <p className="text-xs text-slate-400">{event.description}</p>
                    )}
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    event.status === 'active' ? 'bg-emerald-500/20 text-emerald-300'
                    : event.status === 'completed' ? 'bg-blue-500/20 text-blue-300'
                    : 'bg-slate-500/20 text-slate-300'
                  }`}>
                    {event.status}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-slate-400">{fmtCurrency(spent)} / {fmtCurrency(total)}</span>
                    <span className="text-slate-400">{Math.round(pct)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-pink-500'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-xs text-slate-400">
                  <span>{t('remaining')}: {fmtCurrency(remaining)}</span>
                  <span>{t('daysLeft', { count: daysLeft })}</span>
                </div>

                {byCategory.length > 0 && (
                  <div className="mt-3 space-y-1 border-t border-slate-700/50 pt-3">
                    {byCategory.slice(0, 3).map(cat => (
                      <div key={cat.id} className="flex justify-between text-xs">
                        <span className="text-slate-400">{cat.categoryName}</span>
                        <span className="text-slate-300">{fmtCurrency(cat.spent)} / {fmtCurrency(cat.budgeted)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
