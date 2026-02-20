import { EmptyState } from "@/components/budget/states/EmptyState";
import { GlassCard } from "@/components/budget/ui/GlassCard";
import { db } from "@/lib/budget-db";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowRight, Receipt } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import NextLink from "next/link";
import type { WidgetConfig } from "../types";

interface RecentTransactionsWidgetProps {
  config: WidgetConfig;
}

export function RecentTransactionsWidget({ config }: RecentTransactionsWidgetProps) {
  const t = useTranslations("dashboard.widgets.recentTransactions");
  const format = useFormatter();

  // Fetch recent 5 transactions
  const transactions =
    useLiveQuery(() => db.transactions.orderBy("date").reverse().limit(5).toArray()) || [];

  return (
    <div className={`md:col-span-2 ${config.size === "large" ? "lg:col-span-4" : ""}`}>
      <GlassCard className="flex h-full flex-col p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-purple-500/20 p-2">
              <Receipt className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">{t("title")}</h3>
          </div>
          <NextLink
            href="/budget-app/transactions"
            className="flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-white"
          >
            {t("viewAll")}
            <ArrowRight className="h-3 w-3" />
          </NextLink>
        </div>

        <div className="custom-scrollbar space-y-1 overflow-y-auto">
          {transactions.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title={t("noTransactions")}
              description={t("addTransaction")}
              actionLabel={t("addTransaction")}
              onAction={() => (window.location.href = "/budget-app/transactions")}
              className="min-h-[200px] border-none bg-transparent p-0"
            />
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="group flex items-center justify-between rounded-lg border border-transparent p-3 transition-colors hover:border-white/5 hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-slate-800 text-xs font-medium text-slate-400">
                    <span className="text-[10px] uppercase">
                      {format.dateTime(transaction.date, { month: "short" })}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {format.dateTime(transaction.date, { day: "numeric" })}
                    </span>
                  </div>
                  <div>
                    <p className="line-clamp-1 text-sm font-medium text-slate-200">
                      {transaction.description}
                    </p>
                    <p className="line-clamp-1 text-xs text-slate-500">
                      {transaction.category || t("uncategorized")}
                    </p>
                  </div>
                </div>
                <div
                  className={`whitespace-nowrap text-sm font-semibold ${transaction.amount < 0 ? "text-slate-200" : "text-emerald-400"}`}
                >
                  {format.number(transaction.amount, { style: "currency", currency: "USD" })}
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
}
