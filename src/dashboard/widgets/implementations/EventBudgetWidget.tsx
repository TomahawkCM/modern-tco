"use client";

import { GlassCard } from "@/components/budget/ui/GlassCard";
import { getActiveEvents, calculateProgress } from "@/lib/event-budgets/event-budget-engine";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";
import { PartyPopper, Calendar } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import NextLink from "next/link";
import { useEffect, useState } from "react";
import type { WidgetConfig } from "../types";
import type { EventBudget } from "@/types/budget";

interface EventBudgetWidgetProps {
  config: WidgetConfig;
}

interface EventWithProgress {
  event: EventBudget;
  spent: number;
  remaining: number;
  percentUsed: number;
}

export function EventBudgetWidget({ config }: EventBudgetWidgetProps) {
  const t = useTranslations("dashboard.widgets.eventBudget");
  const format = useFormatter();
  const currency = useDefaultCurrency();
  const [events, setEvents] = useState<EventWithProgress[]>([]);

  useEffect(() => {
    async function load() {
      const active = await getActiveEvents();
      const withProgress = await Promise.all(
        active.slice(0, 3).map(async (event) => {
          const progress = await calculateProgress(event.id);
          return {
            event,
            spent: progress.spent,
            remaining: progress.remaining,
            percentUsed: progress.total > 0 ? (progress.spent / progress.total) * 100 : 0,
          };
        })
      );
      setEvents(withProgress);
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
            <div className="rounded-lg bg-pink-500/20 p-2">
              <PartyPopper className="h-5 w-5 text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">{t("title")}</h3>
          </div>
          <NextLink
            href="/budget-app/events"
            className="text-xs text-slate-400 transition-colors hover:text-white"
          >
            {t("viewAll")}
          </NextLink>
        </div>

        {events.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-4 text-center">
            <Calendar className="mb-2 h-10 w-10 text-slate-600" />
            <p className="text-sm text-slate-500">{t("noEvents")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map(({ event, spent, percentUsed }) => (
              <div key={event.id} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-200">{event.name}</span>
                  <span className="text-slate-400">
                    {format.number(spent, { style: "currency", currency })}
                    {" / "}
                    {format.number(event.totalBudget, { style: "currency", currency })}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentUsed > 90
                        ? "bg-red-500"
                        : percentUsed > 70
                          ? "bg-amber-500"
                          : "bg-pink-500"
                    }`}
                    style={{ width: `${Math.min(percentUsed, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
