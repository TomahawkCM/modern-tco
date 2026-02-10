"use client";

import { useState, useEffect } from "react";
import { Share, X } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * iOS-specific install education banner.
 * iOS has no `beforeinstallprompt` event, so we show an educational
 * banner explaining how to Add to Home Screen via the Share menu.
 *
 * Shows after 2+ sessions, not already installed, not dismissed recently (30 days).
 */
export function IOSInstallBanner() {
  const [show, setShow] = useState(false);
  const t = useTranslations("pwaInstall");

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    const dismissedAt = localStorage.getItem("ios-install-dismissed");
    const sessions = parseInt(
      localStorage.getItem("budget-app-visits") || "0",
      10
    );

    // Show after 2+ sessions, not already installed, not dismissed within 30 days
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const recentlyDismissed =
      dismissedAt && Date.now() - parseInt(dismissedAt) < THIRTY_DAYS;

    if (isIOS && !isStandalone && sessions >= 2 && !recentlyDismissed) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const dismiss = () => {
    setShow(false);
    localStorage.setItem("ios-install-dismissed", Date.now().toString());
  };

  return (
    <div className="fixed bottom-[4.5rem] inset-x-4 z-40 md:hidden animate-in slide-in-from-bottom-4">
      <div className="relative rounded-xl border border-white/10 bg-slate-900/95 p-4 shadow-lg backdrop-blur-xl">
        <button
          onClick={dismiss}
          className="absolute end-2 top-2 p-1 text-slate-500 hover:text-white"
          aria-label={t("close")}
        >
          <X size={16} />
        </button>
        <p className="text-sm font-medium text-white mb-1">
          {t("iosTitle")}
        </p>
        <p className="text-xs text-slate-400">
          {t("iosTap")}{" "}
          <Share size={14} className="inline mx-0.5 text-teal-400" />{" "}
          {t("iosThen")}{" "}
          <strong className="text-white">{t("iosAddToHome")}</strong>{" "}
          {t("iosForFullExperience")}
        </p>
      </div>
    </div>
  );
}
