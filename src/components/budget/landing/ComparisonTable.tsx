"use client";

import { Check, X } from "lucide-react";
import { LandingCard } from "./LandingCard";
import { useTranslations } from "next-intl";

export function ComparisonTable() {
  const t = useTranslations("landing.comparison");

  const rows = [
    {
      feature: t("dataPrivacy.feature"),
      local: t("dataPrivacy.local"),
      sync: t("dataPrivacy.sync"),
      cloud: t("dataPrivacy.cloud"),
    },
    {
      feature: t("cost.feature"),
      local: t("cost.local"),
      sync: t("cost.sync"),
      cloud: t("cost.cloud"),
    },
    {
      feature: t("offlineMode.feature"),
      local: true,
      sync: true,
      cloud: false,
    },
    {
      feature: t("bankConnections.feature"),
      local: t("bankConnections.local"),
      sync: t("bankConnections.sync"),
      cloud: t("bankConnections.cloud"),
    },
    {
      feature: t("storageLocation.feature"),
      local: t("storageLocation.local"),
      sync: t("storageLocation.sync"),
      cloud: t("storageLocation.cloud"),
    },
  ];

  function renderValue(val: string | boolean) {
    if (val === true) return <Check className="mx-auto h-5 w-5 text-teal-400" />;
    if (val === false) return <X className="mx-auto h-5 w-5 text-rose-400" />;
    return <span className="text-sm">{val}</span>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        <div className="grid grid-cols-4 gap-4 border-b border-white/10 pb-4 text-center text-sm font-bold text-white">
          <div className="pl-4 text-left">{t("headers.feature")}</div>
          <div className="text-teal-300">{t("headers.local")}</div>
          <div className="text-indigo-300">{t("headers.sync")}</div>
          <div className="text-slate-500">{t("headers.cloud")}</div>
        </div>
        <div className="space-y-4 pt-4">
          {rows.map((row) => (
            <LandingCard
              key={row.feature}
              className="grid grid-cols-4 items-center gap-4 p-4 text-center"
            >
              <div className="text-left text-sm font-medium text-slate-200">{row.feature}</div>
              <div className="text-slate-200">{renderValue(row.local)}</div>
              <div className="text-slate-200">{renderValue(row.sync)}</div>
              <div className="text-slate-400">{renderValue(row.cloud)}</div>
            </LandingCard>
          ))}
        </div>
      </div>
    </div>
  );
}
