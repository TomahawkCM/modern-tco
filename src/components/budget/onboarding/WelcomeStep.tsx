/**
 * Welcome Step - Onboarding Wizard
 * "Your budget lives on YOUR device" - Privacy-first messaging
 */

"use client";

import { cn } from "@/lib/utils";
import {
  ArrowRight,
  HardDrive,
  Lock,
  ShieldCheck,
  Sparkles,
  Wifi,
  WifiOff,
} from "lucide-react";
import type { StepProps } from "./OnboardingWizard";

const PRIVACY_FEATURES = [
  {
    icon: HardDrive,
    title: "Your Data, Your Device",
    description: "All financial data is stored locally on your device. No cloud servers, no third-party access.",
  },
  {
    icon: Lock,
    title: "Bank-Grade Encryption",
    description: "AES-256 encryption protects your data. Only you have the key—it never leaves your device.",
  },
  {
    icon: WifiOff,
    title: "Works Offline",
    description: "Full functionality without internet. Perfect for privacy-conscious users.",
  },
  {
    icon: ShieldCheck,
    title: "Zero Tracking",
    description: "No analytics, no telemetry, no data collection. Your finances are nobody's business.",
  },
];

export function WelcomeStep({ onComplete, onSkip }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Hero Message */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 mb-4">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Your Budget Lives on YOUR Device
        </h3>
        <p className="text-slate-400 max-w-md mx-auto">
          Welcome to the most private budget app ever. No accounts, no cloud, no compromise.
        </p>
      </div>

      {/* Privacy Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PRIVACY_FEATURES.map((feature) => (
          <div
            key={feature.title}
            className={cn(
              "flex gap-4 p-4 rounded-xl",
              "bg-slate-800/50 border border-white/5",
              "hover:border-white/10 transition-colors"
            )}
          >
            <div className="shrink-0">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                <feature.icon className="h-5 w-5 text-teal-400" />
              </div>
            </div>
            <div>
              <h4 className="font-medium text-white text-sm mb-1">
                {feature.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* What's Next */}
      <div className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 rounded-xl p-4 border border-teal-500/20">
        <h4 className="font-medium text-white mb-2">What&apos;s Next?</h4>
        <p className="text-sm text-slate-300 mb-3">
          In the next few minutes, we&apos;ll help you:
        </p>
        <ul className="space-y-2 text-sm text-slate-400">
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 text-xs flex items-center justify-center font-medium">1</span>
            Import your existing transactions (bank CSV, OFX, or manual)
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 text-xs flex items-center justify-center font-medium">2</span>
            Automatically categorize your spending
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 text-xs flex items-center justify-center font-medium">3</span>
            Create your first budget based on actual spending
          </li>
          <li className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 text-xs flex items-center justify-center font-medium">4</span>
            Set up bill reminders so you never miss a payment
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
            "text-white font-semibold rounded-xl",
            "hover:opacity-90 transition-opacity",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          )}
        >
          Let&apos;s Get Started
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default WelcomeStep;
