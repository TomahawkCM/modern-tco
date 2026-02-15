"use client";

import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

interface RolloverToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

export function RolloverToggle({ enabled, onToggle, className }: RolloverToggleProps) {
  const t = useTranslations("budget.rollover");

  return (
    <label className={cn("flex cursor-pointer items-center gap-2 text-sm", className)}>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={() => onToggle(!enabled)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors",
          enabled ? "bg-teal-500" : "bg-slate-600"
        )}
      >
        <span
          className={cn(
            "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg transition-transform",
            enabled ? "translate-x-4 rtl:-translate-x-4" : "translate-x-0"
          )}
        />
      </button>
      <RefreshCw className={cn("h-3.5 w-3.5", enabled ? "text-teal-400" : "text-slate-500")} />
      <span className={cn("text-xs", enabled ? "text-slate-200" : "text-slate-500")}>
        {t("toggle")}
      </span>
    </label>
  );
}
