"use client";

import { usePrivacy } from "@/contexts/PrivacyContext";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

interface PrivacyToggleProps {
  compact?: boolean;
  className?: string;
}

/**
 * PrivacyToggle
 * A toggle button that switches privacy mode on/off.
 * - compact: icon-only (for mobile header or collapsed sidebar)
 * - full: icon + "Privacy Mode" label (for expanded sidebar)
 */
export function PrivacyToggle({ compact, className }: PrivacyToggleProps) {
  const { isPrivacyMode, togglePrivacyMode } = usePrivacy();
  const t = useTranslations("budget.privacy");

  const Icon = isPrivacyMode ? EyeOff : Eye;

  if (compact) {
    return (
      <button
        onClick={togglePrivacyMode}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
          isPrivacyMode
            ? "bg-teal-500/20 text-teal-400"
            : "text-slate-400 hover:bg-white/10 hover:text-white",
          className
        )}
        aria-label={t("toggle")}
        aria-pressed={isPrivacyMode}
        title={isPrivacyMode ? t("enabled") : t("disabled")}
      >
        <Icon className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={togglePrivacyMode}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isPrivacyMode
          ? "bg-teal-500/10 text-teal-300"
          : "text-slate-400 hover:bg-white/5 hover:text-white",
        className
      )}
      aria-label={t("toggle")}
      aria-pressed={isPrivacyMode}
      title={isPrivacyMode ? t("enabled") : t("disabled")}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{t("toggle")}</span>
      <kbd className="ml-auto rounded border border-white/10 bg-black/20 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
        {t("shortcut")}
      </kbd>
    </button>
  );
}
