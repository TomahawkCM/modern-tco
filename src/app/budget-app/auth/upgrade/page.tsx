"use client";

import { Button } from "@/components/ui/button";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { APP_PRICE, TRIAL_DURATION_DAYS } from "@/lib/subscriptionService";
import { Check, CreditCard, Lock, Shield, Sparkles, Zap } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { getCurrencySymbol } from "@/i18n/utils/formatCurrency";
import { useDefaultCurrency } from "@/hooks/useDefaultCurrency";
import type { SupportedLocale } from "@/i18n/config";
import Link from "next/link";

const featureIcons = [Zap, Shield, Lock, CreditCard];
const featureKeys = [
  "unlimitedTransactions",
  "aiInsights",
  "bankSecurity",
  "subscriptionTracking",
] as const;

export default function UpgradePage() {
  const { isExpired, daysRemaining, isTrial, loading } = useTrialStatus();
  const t = useTranslations("auth");
  const locale = useLocale();
  const currency = useDefaultCurrency();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-blue-500">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">
          {isExpired ? t("upgrade.trialEndedTitle") : t("upgrade.title")}
        </h1>
        <p className="mt-2 text-slate-400">
          {isExpired
            ? t("upgrade.trialEndedSubtitle")
            : isTrial
              ? t("upgrade.daysLeft", { daysRemaining })
              : t("upgrade.lifetimeAccess")}
        </p>
      </div>

      {/* Pricing Card */}
      <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-6">
        <div className="text-center">
          <div className="mb-2 text-sm font-medium text-teal-400">
            {t("upgrade.lifetimeAccessBadge")}
          </div>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-white">
              {getCurrencySymbol(currency, locale as SupportedLocale)}
              {APP_PRICE}
            </span>
            <span className="text-slate-400">{t("upgrade.oneTime")}</span>
          </div>
          <p className="mt-2 text-sm text-slate-400">{t("upgrade.payOnce")}</p>
        </div>

        <div className="my-6 border-t border-white/10" />

        {/* Features */}
        <ul className="space-y-3">
          {featureKeys.map((key, index) => {
            const Icon = featureIcons[index];
            return (
              <li key={key} className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500/20">
                  <Check className="h-4 w-4 text-teal-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">
                    {t(`upgrade.features.${key}.title`)}
                  </div>
                  <div className="text-xs text-slate-400">
                    {t(`upgrade.features.${key}.description`)}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* CTA Button */}
      <Button
        className="w-full bg-gradient-to-r from-teal-500 to-blue-500 py-6 text-lg font-semibold text-white hover:from-teal-400 hover:to-blue-400"
        disabled={loading}
      >
        <CreditCard className="mr-2 h-5 w-5" />
        {t("upgrade.upgradeNow", { price: APP_PRICE })}
      </Button>

      <p className="text-center text-xs text-slate-500">{t("upgrade.securePayment")}</p>

      {/* Back to App Link */}
      {!isExpired && (
        <div className="text-center">
          <Link
            href="/budget-app"
            className="text-sm text-slate-400 transition-colors hover:text-white"
          >
            {t("upgrade.continueFreeTrial", { daysRemaining })}
          </Link>
        </div>
      )}

      {/* Trial Info */}
      {isExpired && (
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 text-center">
          <p className="text-sm text-rose-300">
            {t("upgrade.trialEndedMessage", { days: TRIAL_DURATION_DAYS })}
          </p>
        </div>
      )}
    </div>
  );
}
