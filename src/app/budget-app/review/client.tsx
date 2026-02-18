"use client";

import { GlassCard } from "@/components/budget/ui/GlassCard";
import { db } from "@/lib/budget-db";
import { useLiveQuery } from "dexie-react-hooks";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";
import { CardSkeleton } from "@/components/budget/LoadingSkeleton";
import { CheckCircle2, XCircle, ArrowLeft, ArrowRight, Inbox } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Transaction } from "@/types/budget";

export function ClientReview() {
  const t = useTranslations("budget.review");
  const format = useFormatter();
  const currency = useDefaultCurrency();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  const rawUncategorized = useLiveQuery(async () => {
    try {
      const txs = await db.transactions.toArray();
      return txs.filter((tx) => !tx.isSplit && (!tx.category || tx.category === ""));
    } catch {
      return [];
    }
  });

  const allUncategorized = rawUncategorized ?? [];

  const pending = useMemo(
    () => allUncategorized.filter((tx) => !reviewedIds.has(tx.id)),
    [allUncategorized, reviewedIds]
  );

  const currentTx = pending[0] || null;
  const totalCount = allUncategorized.length;
  const reviewedCount = reviewedIds.size;

  const handleApprove = useCallback(async () => {
    if (!currentTx) return;
    // Mark as reviewed (could also apply suggested category)
    setReviewedIds((prev) => new Set(prev).add(currentTx.id));
  }, [currentTx]);

  const handleSkip = useCallback(() => {
    if (!currentTx) return;
    setReviewedIds((prev) => new Set(prev).add(currentTx.id));
  }, [currentTx]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "a") handleApprove();
      if (e.key === "ArrowLeft" || e.key === "f") handleSkip();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleApprove, handleSkip]);

  const fmtCurrency = (v: number) => format.number(Math.abs(v), { style: "currency", currency });

  if (rawUncategorized === undefined) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-md">
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 p-4 md:p-6"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
        <p className="mt-1 text-sm text-slate-400">{t("subtitle")}</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-md">
        <div className="mb-1 flex justify-between text-xs text-slate-400">
          <span>{t("progress", { reviewed: reviewedCount, total: totalCount })}</span>
          <span>{totalCount > 0 ? Math.round((reviewedCount / totalCount) * 100) : 0}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-700">
          <div
            className="h-full rounded-full bg-violet-500 transition-all duration-500"
            style={{ width: `${totalCount > 0 ? (reviewedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Card Stack */}
      <div className="relative h-64 w-full max-w-md" aria-live="polite">
        <AnimatePresence mode="popLayout">
          {currentTx ? (
            <motion.div
              key={currentTx.id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 200 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <GlassCard className="flex h-full flex-col items-center justify-center p-6 text-center">
                <p className="mb-2 text-2xl font-bold text-white">
                  {fmtCurrency(currentTx.amount)}
                </p>
                <p className="text-base text-slate-300">
                  {currentTx.description || t("noDescription")}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {format.dateTime(new Date(currentTx.date), {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-full flex-col items-center justify-center"
            >
              <Inbox className="mb-4 h-16 w-16 text-emerald-400" />
              <p className="text-lg font-semibold text-white">{t("allDone")}</p>
              <p className="mt-1 text-sm text-slate-400">{t("allDoneDescription")}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      {currentTx && (
        <div className="flex items-center gap-6">
          <button
            onClick={handleSkip}
            className="flex h-14 w-14 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400 transition-all hover:bg-red-500/20"
            aria-label={t("skip")}
          >
            <XCircle className="h-7 w-7" />
          </button>
          <button
            onClick={handleApprove}
            className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 transition-all hover:bg-emerald-500/20"
            aria-label={t("approve")}
          >
            <CheckCircle2 className="h-8 w-8" />
          </button>
        </div>
      )}

      {/* Keyboard shortcuts hint */}
      <div className="flex gap-4 text-xs text-slate-600">
        <span>
          <ArrowLeft className="inline h-3 w-3" aria-hidden="true" /> {t("skipKey")}
        </span>
        <span>
          <ArrowRight className="inline h-3 w-3" aria-hidden="true" /> {t("approveKey")}
        </span>
      </div>
    </div>
  );
}
