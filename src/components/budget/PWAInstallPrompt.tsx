/**
 * PWA Install Prompt Component (Android / Desktop)
 * Shows a prompt to install the Budget App when the browser fires beforeinstallprompt.
 *
 * - Appears after 3 visits
 * - Can be dismissed for 7 days
 * - Only shows if app is installable and not already installed
 * - Styled for dark theme, positioned above bottom tab bar on mobile
 */

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWA } from "@/hooks/usePWA";

export function PWAInstallPrompt() {
  const t = useTranslations("pwaInstall");
  const { shouldShowPrompt, promptInstall, dismissPrompt } = usePWA();
  const [isVisible, setIsVisible] = useState(true);

  if (!shouldShowPrompt || !isVisible) {
    return null;
  }

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    dismissPrompt();
    setIsVisible(false);
  };

  return (
    <div className="fixed inset-x-4 bottom-[4.5rem] z-50 animate-in slide-in-from-bottom-5 md:inset-x-auto md:bottom-4 md:end-4 md:max-w-sm">
      <div className="relative rounded-xl border border-white/10 bg-slate-900/95 p-4 shadow-lg backdrop-blur-xl">
        <button
          onClick={handleDismiss}
          className="absolute end-2 top-2 p-1 text-slate-500 hover:text-white"
          aria-label={t("close")}
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/15">
            <Download className="h-5 w-5 text-teal-400" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white">{t("title")}</p>
            <p className="mt-0.5 text-xs text-slate-400">{t("description")}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Button size="sm" onClick={handleInstall} className="flex-1">
            {t("buttons.install")}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white"
          >
            {t("buttons.notNow")}
          </Button>
        </div>

        {/* Feature pills */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-slate-400">
            <span className="text-teal-400">✓</span> {t("features.offline")}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-slate-400">
            <span className="text-teal-400">✓</span> {t("features.fastSecure")}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] text-slate-400">
            <span className="text-teal-400">✓</span> {t("features.noAppStore")}
          </span>
        </div>
      </div>
    </div>
  );
}
