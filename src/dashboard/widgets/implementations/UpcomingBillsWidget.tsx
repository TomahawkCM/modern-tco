"use client";

/**
 * Upcoming Bills Widget
 *
 * Displays subscriptions with billing dates in the next 14 days
 */

import { EmptyState } from "@/components/budget/states/EmptyState";
import { GlassCard } from "@/components/budget/ui/GlassCard";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";
import { db } from "@/lib/budget-db";
import type { Subscription } from "@/types/budget";
import { useLiveQuery } from "dexie-react-hooks";
import { Calendar, CreditCard } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import NextLink from "next/link";
import { useMemo } from "react";
import type { WidgetConfig } from "../types";

interface UpcomingBillsWidgetProps {
  config: WidgetConfig;
}

export function UpcomingBillsWidget({ config }: UpcomingBillsWidgetProps) {
  const t = useTranslations("dashboard.widgets.upcomingBills");
  const format = useFormatter();
  const currency = useDefaultCurrency();

  // Fetch active/trial subscriptions
  const subscriptions =
    useLiveQuery(async () => {
      try {
        return await db.subscriptions.where("status").anyOf(["active", "trial"]).toArray();
      } catch {
        return [];
      }
    }) || [];

  // Filter to next 14 days and sort by date
  const upcomingBills = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const twoWeeksOut = new Date();
    twoWeeksOut.setDate(twoWeeksOut.getDate() + 14);
    twoWeeksOut.setHours(23, 59, 59, 999);

    return subscriptions
      .filter((sub) => {
        const nextBilling = new Date(sub.nextBillingDate);
        return nextBilling >= now && nextBilling <= twoWeeksOut;
      })
      .sort(
        (a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime()
      );
  }, [subscriptions]);

  // Calculate days until due
  const getDaysUntil = (date: Date | string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(date);
    dueDate.setHours(0, 0, 0, 0);
    return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getDueDateLabel = (date: Date | string) => {
    const days = getDaysUntil(date);
    if (days === 0) return t("dueToday");
    if (days === 1) return t("dueTomorrow");
    return t("dueIn", { days });
  };

  // Size-based span class
  const spanClass =
    config.size === "large"
      ? "md:col-span-2 lg:col-span-4"
      : config.size === "medium"
        ? "md:col-span-2"
        : "";

  return (
    <div className={spanClass}>
      <GlassCard className="flex h-full flex-col p-5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-orange-500/20 p-2">
              <Calendar className="h-5 w-5 text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">{t("title")}</h3>
          </div>
          <NextLink
            href="/budget-app/subscriptions"
            className="text-xs text-slate-400 transition-colors hover:text-white"
          >
            {t("viewAll")}
          </NextLink>
        </div>

        {/* Content */}
        {upcomingBills.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title={t("noBills")}
            description={t("addSubscription")}
            actionLabel={t("addSubscription")}
            onAction={() => (window.location.href = "/budget-app/subscriptions")}
            className="min-h-[200px] border-none bg-transparent p-0"
          />
        ) : (
          <div className="custom-scrollbar max-h-[250px] space-y-2 overflow-y-auto pr-1">
            {upcomingBills.map((bill) => (
              <BillItem
                key={bill.id}
                bill={bill}
                dueLabel={getDueDateLabel(bill.nextBillingDate)}
                daysUntil={getDaysUntil(bill.nextBillingDate)}
                format={format}
                currency={currency}
              />
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

interface BillItemProps {
  bill: Subscription;
  dueLabel: string;
  daysUntil: number;
  format: ReturnType<typeof useFormatter>;
  currency: string;
}

function BillItem({ bill, dueLabel, daysUntil, format, currency }: BillItemProps) {
  const urgencyClass =
    daysUntil === 0 ? "text-red-400" : daysUntil <= 3 ? "text-amber-400" : "text-slate-400";

  return (
    <div className="group flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-white/5">
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-slate-800 p-2 text-slate-400 transition-colors group-hover:text-orange-400">
          <CreditCard className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-200">{bill.name}</p>
          <p className={`text-xs ${urgencyClass}`}>{dueLabel}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-white">
          {format.number(bill.amount, { style: "currency", currency })}
        </p>
        <p className="text-xs capitalize text-slate-500">{bill.billingCycle}</p>
      </div>
    </div>
  );
}
