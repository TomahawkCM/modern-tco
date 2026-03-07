"use client";

import { Button } from "@/components/ui/button";
import { isBudgetOffline } from "@/config/app-target";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { APP_PRICE } from "@/lib/subscriptionService";
import { AlertCircle, Clock, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";

// Trial status banner is not shown in offline mode (no subscriptions)
const isOfflineMode = isBudgetOffline;

interface TrialStatusBannerProps {
  /** Only show banner when trial has 3 or fewer days remaining */
  showOnlyWhenUrgent?: boolean;
  /** Callback when banner is dismissed */
  onDismiss?: () => void;
}

/**
 * Persistent banner showing trial status
 * - Green: Trial with 4+ days remaining
 * - Yellow: Trial with 1-3 days remaining
 * - Red: Trial expired (read-only mode)
 */
export function TrialStatusBanner({
  showOnlyWhenUrgent = false,
  onDismiss,
}: TrialStatusBannerProps) {
  const { loading, isTrial, isExpired, daysRemaining, isActive, status } = useTrialStatus();
  const [isDismissed, setIsDismissed] = useState(false);
  const t = useTranslations("trialBanner");
  const tAria = useTranslations("aria");

  // Don't show in offline mode - no subscription/trial system
  if (isOfflineMode) {
    return null;
  }

  // Don't show if dismissed, loading, or user has active paid subscription
  if (isDismissed || loading) {
    return null;
  }

  // Don't show for active paid users
  if (status === "active" && !isTrial) {
    return null;
  }

  // If showOnlyWhenUrgent, only show when 3 or fewer days remaining or expired
  if (showOnlyWhenUrgent && daysRemaining > 3 && !isExpired) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  // Expired state - most critical
  if (isExpired) {
    return (
      <div className="relative border-b border-rose-500/20 bg-rose-500/10 px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
            <div>
              <p className="text-sm font-medium text-rose-300">{t("expired")}</p>
              <p className="text-xs text-rose-400/80">{t("expiredDescription")}</p>
            </div>
          </div>
          <Link href="/budget-app/auth/upgrade">
            <Button size="sm" className="shrink-0 bg-rose-500 text-white hover:bg-rose-400">
              <Sparkles className="me-2 h-4 w-4" />
              {t("upgradeNow", { price: `$${APP_PRICE}` })}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Urgent trial state (1-3 days remaining)
  if (isTrial && daysRemaining <= 3) {
    return (
      <div className="relative border-b border-amber-500/20 bg-amber-500/10 px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 shrink-0 text-amber-400" />
            <div>
              <p className="text-sm font-medium text-amber-300">
                {t("daysLeft", { count: daysRemaining })}
              </p>
              <p className="text-xs text-amber-400/80">{t("upgradePrompt")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/budget-app/auth/upgrade">
              <Button size="sm" className="shrink-0 bg-amber-500 text-slate-900 hover:bg-amber-400">
                <Sparkles className="me-2 h-4 w-4" />
                {t("upgrade", { price: `$${APP_PRICE}` })}
              </Button>
            </Link>
            <button
              onClick={handleDismiss}
              className="p-1 text-amber-400/60 transition-colors hover:text-amber-400"
              aria-label={tAria("dismiss")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal trial state (4+ days remaining)
  if (isTrial && isActive) {
    return (
      <div className="relative border-b border-teal-500/20 bg-teal-500/10 px-4 py-2">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-4 w-4 shrink-0 text-teal-400" />
            <p className="text-sm text-teal-300">{t("daysRemaining", { count: daysRemaining })}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/budget-app/auth/upgrade"
              className="text-xs text-teal-400 transition-colors hover:text-teal-300"
            >
              {t("viewPricing")}
            </Link>
            <button
              onClick={handleDismiss}
              className="p-1 text-teal-400/60 transition-colors hover:text-teal-400"
              aria-label={tAria("dismiss")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Unknown state - don't render
  return null;
}
