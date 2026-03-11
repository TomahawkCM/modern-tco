/**
 * Welcome Step - Onboarding Wizard
 * "Your budget lives on YOUR device" - Privacy-first messaging
 */

"use client";

import { cn } from "@/lib/utils";
import { ArrowRight, HardDrive, Lock, ShieldCheck, Sparkles, Wifi, WifiOff } from "lucide-react";
import { useTranslations } from "next-intl";
import type { StepProps } from "./OnboardingWizard";

const PRIVACY_FEATURES = [
  {
    icon: HardDrive,
    titleKey: "welcome.features.yourDataTitle",
    descKey: "welcome.features.yourDataDescription",
  },
  {
    icon: Lock,
    titleKey: "welcome.features.encryptionTitle",
    descKey: "welcome.features.encryptionDescription",
  },
  {
    icon: WifiOff,
    titleKey: "welcome.features.offlineTitle",
    descKey: "welcome.features.offlineDescription",
  },
  {
    icon: ShieldCheck,
    titleKey: "welcome.features.zeroTrackingTitle",
    descKey: "welcome.features.zeroTrackingDescription",
  },
];

export function WelcomeStep({ onComplete, onSkip }: StepProps) {
  const t = useTranslations("onboardingPage");
  return (
    <div className="space-y-6">
      {/* Hero Message */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-white">{t("welcome.heroTitle")}</h3>
        <p className="mx-auto max-w-md text-slate-400">{t("welcome.heroSubtitle")}</p>
      </div>

      {/* Privacy Features Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PRIVACY_FEATURES.map((feature) => (
          <div
            key={feature.titleKey}
            className={cn(
              "flex gap-4 rounded-xl p-4",
              "border border-white/5 bg-slate-800/50",
              "transition-colors hover:border-white/10"
            )}
          >
            <div className="shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10">
                <feature.icon className="h-5 w-5 text-teal-400" />
              </div>
            </div>
            <div>
              <h4 className="mb-1 text-sm font-medium text-white">{t(feature.titleKey)}</h4>
              <p className="text-xs leading-relaxed text-slate-400">{t(feature.descKey)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* What's Next */}
      <div className="rounded-xl border border-teal-500/20 bg-gradient-to-r from-teal-500/10 to-blue-500/10 p-4">
        <h4 className="mb-2 font-medium text-white">{t("welcome.whatsNext")}</h4>
        <p className="mb-3 text-sm text-slate-300">{t("welcome.whatsNextIntro")}</p>
        <ul className="space-y-2 text-sm text-slate-400">
          <li className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500/20 text-xs font-medium text-teal-400">
              1
            </span>
            {t("welcome.step1")}
          </li>
          <li className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500/20 text-xs font-medium text-teal-400">
              2
            </span>
            {t("welcome.step2")}
          </li>
          <li className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500/20 text-xs font-medium text-teal-400">
              3
            </span>
            {t("welcome.step3")}
          </li>
          <li className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500/20 text-xs font-medium text-teal-400">
              4
            </span>
            {t("welcome.step4")}
          </li>
        </ul>
      </div>

      {/* Get Started Button */}
      <div className="flex justify-center pt-4">
        <button
          type="button"
          onClick={() => onComplete()}
          className={cn(
            "flex items-center gap-2 px-8 py-3",
            "bg-gradient-to-r from-teal-500 to-blue-500",
            "rounded-xl font-semibold text-white",
            "transition-opacity hover:opacity-90",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          )}
        >
          {t("welcome.getStarted")}
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default WelcomeStep;
