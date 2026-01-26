"use client";

import { Button } from "@/components/ui/button";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { APP_PRICE } from "@/lib/subscriptionService";
import { AlertCircle, Clock, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Trial status banner is not shown in offline mode (no subscriptions)
const isOfflineMode = process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true';

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
      <div className="relative bg-rose-500/10 border-b border-rose-500/20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-rose-300">
                Your trial has expired
              </p>
              <p className="text-xs text-rose-400/80">
                App is in read-only mode. Upgrade to continue managing your finances.
              </p>
            </div>
          </div>
          <Link href="/budget-app/auth/upgrade">
            <Button
              size="sm"
              className="bg-rose-500 hover:bg-rose-400 text-white shrink-0"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Upgrade Now - ${APP_PRICE}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Urgent trial state (1-3 days remaining)
  if (isTrial && daysRemaining <= 3) {
    return (
      <div className="relative bg-amber-500/10 border-b border-amber-500/20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-300">
                {daysRemaining === 0
                  ? "Your trial ends today!"
                  : daysRemaining === 1
                  ? "Only 1 day left in your trial"
                  : `${daysRemaining} days left in your trial`}
              </p>
              <p className="text-xs text-amber-400/80">
                Upgrade now to keep full access to your budget data.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/budget-app/auth/upgrade">
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-400 text-slate-900 shrink-0"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade - ${APP_PRICE}
              </Button>
            </Link>
            <button
              onClick={handleDismiss}
              className="p-1 text-amber-400/60 hover:text-amber-400 transition-colors"
              aria-label="Dismiss"
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
      <div className="relative bg-teal-500/10 border-b border-teal-500/20 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-teal-400 shrink-0" />
            <p className="text-sm text-teal-300">
              <span className="font-medium">{daysRemaining} days</span> remaining in your free trial
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/budget-app/auth/upgrade"
              className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
            >
              View pricing
            </Link>
            <button
              onClick={handleDismiss}
              className="p-1 text-teal-400/60 hover:text-teal-400 transition-colors"
              aria-label="Dismiss"
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
