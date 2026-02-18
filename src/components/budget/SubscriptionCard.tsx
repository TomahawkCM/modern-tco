"use client";

/**
 * Subscription Card Component
 *
 * Displays individual subscription details with:
 * - Merchant name and category
 * - Cost and billing frequency
 * - Next charge date
 * - Confidence meter
 * - Quick actions (edit, delete, pause, cancel, claim)
 * - Source indicator (manual, auto-detected, merged)
 */

import type { SubscriptionPattern } from "@/lib/subscription-detector";
import type { Subscription } from "@/types/budget";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import { useTranslations } from "next-intl";
import {
  Calendar,
  TrendingUp,
  DollarSign,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Clock,
  Edit,
  Trash2,
  Pause,
  Play,
  XCircle,
  XOctagon,
  Sparkles,
  MoreVertical,
  Bell,
  BellOff,
  Link as LinkIcon,
} from "lucide-react";
import { useState } from "react";

interface SubscriptionCardProps {
  subscription: SubscriptionPattern;
  source?: "manual" | "auto-detected" | "merged";
  manualSubscription?: Subscription;
  onViewTransactions?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPauseResume?: () => void;
  onCancel?: () => void;
  onClaim?: () => void; // Convert auto-detected to manual
  onDismiss?: () => void; // Dismiss auto-detected (not a subscription)
  onToggleReminder?: () => void; // Toggle reminder on/off
}

export function SubscriptionCard({
  subscription,
  source = "auto-detected",
  manualSubscription,
  onViewTransactions,
  onEdit,
  onDelete,
  onPauseResume,
  onCancel,
  onClaim,
  onDismiss,
  onToggleReminder,
}: SubscriptionCardProps) {
  const t = useTranslations("subscriptionCard");
  const [showMenu, setShowMenu] = useState(false);

  const intervalLabel = t(`interval.${subscription.interval_type}`);

  const confidenceColor =
    subscription.confidence >= 0.9
      ? "text-green-600 dark:text-green-400"
      : subscription.confidence >= 0.7
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-orange-600 dark:text-orange-400";

  const confidenceLevel =
    subscription.confidence >= 0.9 ? "high" : subscription.confidence >= 0.7 ? "medium" : "low";
  const confidenceLabel = t(`confidence.${confidenceLevel}`);

  const isAiDetected = subscription.is_subscription_merchant;
  const isPaused = manualSubscription?.status === "paused";
  const isCancelled = manualSubscription?.status === "cancelled" || !subscription.is_active;
  const isTrial = manualSubscription?.status === "trial";

  // Calculate days until next billing
  const daysUntilBilling = subscription.next_expected_charge
    ? differenceInDays(new Date(subscription.next_expected_charge), new Date())
    : null;

  // Trial countdown
  const trialDaysLeft = manualSubscription?.trialEndDate
    ? differenceInDays(new Date(manualSubscription.trialEndDate), new Date())
    : null;

  const sourceColors = {
    manual:
      "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800",
    "auto-detected":
      "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
    merged:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  };
  const sourceLabel = {
    text: t(`source.${source}`),
    color: sourceColors[source],
  };

  return (
    <div
      className={`relative rounded-lg border bg-card p-6 transition-all hover:shadow-md ${
        isCancelled
          ? "border-border opacity-60"
          : isPaused
            ? "border-yellow-300 dark:border-yellow-700"
            : isTrial
              ? "border-blue-300 dark:border-blue-700"
              : "border-border"
      }`}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">{subscription.merchant_name}</h3>

            {/* Source Badge */}
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${sourceLabel.color}`}
            >
              {source === "auto-detected" && <Sparkles className="h-3 w-3" />}
              {source === "manual" && <Edit className="h-3 w-3" />}
              {source === "merged" && <LinkIcon className="h-3 w-3" />}
              {sourceLabel.text}
            </span>

            {isAiDetected && source === "auto-detected" && (
              <span className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300">
                <CheckCircle className="h-3 w-3" />
                {t("badges.aiVerified")}
              </span>
            )}

            {/* Status Badges */}
            {isPaused && (
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                {t("badges.paused")}
              </span>
            )}
            {isCancelled && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900 dark:text-red-300">
                {t("badges.cancelled")}
              </span>
            )}
            {isTrial && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                {t("badges.trial")}
              </span>
            )}
          </div>
          {subscription.category && (
            <p className="text-sm text-muted-foreground">
              {subscription.category}
              {subscription.subcategory && ` → ${subscription.subcategory}`}
            </p>
          )}
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-border bg-card py-1 shadow-lg">
                {onViewTransactions && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onViewTransactions();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-muted"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {t("menu.viewTransactions")}
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-muted"
                  >
                    <Edit className="h-4 w-4" />
                    {t("menu.edit")}
                  </button>
                )}
                {onPauseResume && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onPauseResume();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-muted"
                  >
                    {isPaused ? (
                      <>
                        <Play className="h-4 w-4" />
                        {t("menu.resume")}
                      </>
                    ) : (
                      <>
                        <Pause className="h-4 w-4" />
                        {t("menu.pause")}
                      </>
                    )}
                  </button>
                )}
                {onCancel && !isCancelled && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onCancel();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-muted"
                  >
                    <XCircle className="h-4 w-4" />
                    {t("menu.cancelSubscription")}
                  </button>
                )}
                {onClaim && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onClaim();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-teal-600 hover:bg-muted"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {t("menu.claimManage")}
                  </button>
                )}
                {onDismiss && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDismiss();
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
                  >
                    <XOctagon className="h-4 w-4" />
                    {t("menu.notSubscription")}
                  </button>
                )}
                {onDelete && (
                  <>
                    <div className="my-1 border-t border-border" />
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t("menu.delete")}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confidence (only for auto-detected) */}
      {source === "auto-detected" && (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-muted/50 p-2">
          <span className="text-xs text-muted-foreground">{t("confidence.label")}</span>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${confidenceColor}`}>
              {confidenceLabel} ({(subscription.confidence * 100).toFixed(0)}%)
            </span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full ${
                    i < Math.round(subscription.confidence * 5)
                      ? "bg-teal-500"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trial Countdown */}
      {isTrial && trialDaysLeft !== null && trialDaysLeft > 0 && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">
              {t("trial.daysLeft", { count: trialDaysLeft })}
            </span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        {/* Amount */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-50 dark:bg-green-950">
            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("stats.amount")}</p>
            <p className="text-base font-semibold text-foreground">
              ${subscription.average_amount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Frequency */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("stats.frequency")}</p>
            <p className="text-base font-semibold text-foreground">{intervalLabel}</p>
          </div>
        </div>

        {/* Next Charge */}
        {subscription.next_expected_charge && !isCancelled && (
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                daysUntilBilling !== null && daysUntilBilling <= 3
                  ? "bg-red-50 dark:bg-red-950"
                  : daysUntilBilling !== null && daysUntilBilling <= 7
                    ? "bg-yellow-50 dark:bg-yellow-950"
                    : "bg-purple-50 dark:bg-purple-950"
              }`}
            >
              <Calendar
                className={`h-5 w-5 ${
                  daysUntilBilling !== null && daysUntilBilling <= 3
                    ? "text-red-600 dark:text-red-400"
                    : daysUntilBilling !== null && daysUntilBilling <= 7
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-purple-600 dark:text-purple-400"
                }`}
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t("stats.nextCharge")}</p>
              <p className="text-sm font-medium text-foreground">
                {format(new Date(subscription.next_expected_charge), "MMM d")}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(subscription.next_expected_charge), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        )}

        {/* Total Spent / Annual Cost */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-950">
            <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {source === "auto-detected" ? t("stats.totalSpent") : t("stats.annualCost")}
            </p>
            <p className="text-base font-semibold text-foreground">
              $
              {(source === "auto-detected"
                ? subscription.total_spent
                : subscription.annual_cost_estimate
              ).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 border-t border-border pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {source === "auto-detected" ? t("details.occurrences") : t("stats.annualCost")}:
          </span>
          <span className="font-medium text-foreground">
            {source === "auto-detected"
              ? t("details.charges", { count: subscription.occurrence_count })
              : `$${subscription.annual_cost_estimate.toFixed(2)}`}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t("details.firstCharge")}:</span>
          <span className="font-medium text-foreground">
            {format(new Date(subscription.first_charge), "MMM d, yyyy")}
          </span>
        </div>
        {subscription.last_charge && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("details.lastCharge")}:</span>
            <span className="font-medium text-foreground">
              {format(new Date(subscription.last_charge), "MMM d, yyyy")}
            </span>
          </div>
        )}

        {/* Reminder toggle for manual subscriptions */}
        {manualSubscription && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              {manualSubscription.reminderEnabled ? (
                <Bell className="h-3 w-3" />
              ) : (
                <BellOff className="h-3 w-3" />
              )}
              {t("details.reminder")}:
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleReminder?.();
              }}
              className={`rounded px-2 py-0.5 font-medium transition-colors ${
                manualSubscription.reminderEnabled
                  ? "text-teal-600 hover:bg-teal-500/10"
                  : "text-muted-foreground hover:bg-muted"
              }`}
              title={manualSubscription.reminderEnabled ? "Disable reminder" : "Enable reminder"}
            >
              {manualSubscription.reminderEnabled
                ? t("details.daysBefore", { count: manualSubscription.reminderDaysBefore })
                : "Off"}
            </button>
          </div>
        )}

        {/* Payment method for manual subscriptions */}
        {manualSubscription?.paymentMethod && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("details.payment")}:</span>
            <span className="font-medium text-foreground">{manualSubscription.paymentMethod}</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex gap-2 border-t border-border pt-4">
        {onViewTransactions && (
          <button
            onClick={onViewTransactions}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-teal-200 px-4 py-2 text-sm font-medium text-teal-600 transition-colors hover:bg-teal-50 dark:border-teal-800 dark:text-teal-400 dark:hover:bg-teal-950"
          >
            <ExternalLink className="h-4 w-4" />
            {t("buttons.transactions")}
          </button>
        )}
        {onClaim && (
          <button
            onClick={onClaim}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-600"
          >
            <CheckCircle className="h-4 w-4" />
            {t("buttons.claimManage")}
          </button>
        )}
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Edit className="h-4 w-4" />
            {t("buttons.edit")}
          </button>
        )}
      </div>

      {/* Warning for Low Confidence */}
      {subscription.confidence < 0.7 && source === "auto-detected" && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            {t("lowConfidenceWarning")}
          </p>
        </div>
      )}
    </div>
  );
}
