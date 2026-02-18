"use client";

import { GlassCard } from "@/components/budget/ui/GlassCard";
import { getAllRules, deleteRule } from "@/lib/merchant-rules";
import { Skeleton } from "@/components/budget/LoadingSkeleton";
import { ArrowLeft, Settings, Trash2, Tag } from "lucide-react";
import { useTranslations } from "next-intl";
import NextLink from "next/link";
import { useEffect, useState, useCallback } from "react";
import type { MerchantRule } from "@/types/budget";

export function ClientMerchantRules() {
  const t = useTranslations("budget.merchantRules");
  const [rules, setRules] = useState<MerchantRule[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRules = useCallback(async () => {
    try {
      const allRules = await getAllRules();
      setRules(allRules);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const handleDelete = async (ruleId: string) => {
    await deleteRule(ruleId);
    await loadRules();
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-700" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex gap-4 rounded-lg border border-white/10 bg-slate-900/50 p-4"
            >
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="ml-auto h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <NextLink
          href="/budget-app/settings"
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          aria-label="Back to settings"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </NextLink>
        <Settings className="h-6 w-6 text-blue-400" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
      </div>
      <p className="text-sm text-slate-400">{t("description")}</p>

      {rules.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center p-12 text-center">
          <Tag className="mb-4 h-16 w-16 text-slate-600" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-slate-300">{t("noRules")}</h2>
          <p className="mt-2 text-sm text-slate-500">{t("noRulesDescription")}</p>
        </GlassCard>
      ) : (
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase text-slate-400">
                    {t("merchant")}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-medium uppercase text-slate-400">
                    {t("category")}
                  </th>
                  <th className="px-4 py-3 text-end text-xs font-medium uppercase text-slate-400">
                    {t("applied", { count: 0 }).replace("0", "#")}
                  </th>
                  <th className="px-4 py-3 text-end text-xs font-medium uppercase text-slate-400" />
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr
                    key={rule.id}
                    className="border-b border-white/5 transition-colors hover:bg-white/5"
                  >
                    <td className="px-4 py-3 font-medium text-white">{rule.merchantDisplayName}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
                        {rule.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-end text-slate-400">
                      {t("applied", { count: rule.applyCount })}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        aria-label={t("deleteRule")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
