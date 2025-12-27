"use client";

import { Button } from "@/components/ui/button";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { APP_PRICE, TRIAL_DURATION_DAYS } from "@/lib/subscriptionService";
import { Check, CreditCard, Lock, Shield, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Zap,
    title: "Unlimited Transactions",
    description: "Import and track as many transactions as you need",
  },
  {
    icon: Shield,
    title: "AI-Powered Insights",
    description: "Smart categorization and spending analysis",
  },
  {
    icon: Lock,
    title: "Bank-Level Security",
    description: "Your data is encrypted and never shared",
  },
  {
    icon: CreditCard,
    title: "Subscription Tracking",
    description: "Never miss a recurring charge again",
  },
];

export default function UpgradePage() {
  const { isExpired, daysRemaining, isTrial, loading } = useTrialStatus();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-blue-500">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">
          {isExpired ? "Your Trial Has Ended" : "Upgrade to Premium"}
        </h1>
        <p className="mt-2 text-slate-400">
          {isExpired
            ? "Upgrade now to regain full access to your budget data"
            : isTrial
            ? `${daysRemaining} days left in your free trial`
            : "Get lifetime access to all features"}
        </p>
      </div>

      {/* Pricing Card */}
      <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-6">
        <div className="text-center">
          <div className="mb-2 text-sm font-medium text-teal-400">
            LIFETIME ACCESS
          </div>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-white">${APP_PRICE}</span>
            <span className="text-slate-400">one-time</span>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Pay once, use forever. No subscriptions.
          </p>
        </div>

        <div className="my-6 border-t border-white/10" />

        {/* Features */}
        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature.title} className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-500/20">
                <Check className="h-4 w-4 text-teal-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">
                  {feature.title}
                </div>
                <div className="text-xs text-slate-400">
                  {feature.description}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button */}
      <Button
        className="w-full bg-gradient-to-r from-teal-500 to-blue-500 py-6 text-lg font-semibold text-white hover:from-teal-400 hover:to-blue-400"
        disabled={loading}
      >
        <CreditCard className="mr-2 h-5 w-5" />
        Upgrade Now - ${APP_PRICE}
      </Button>

      <p className="text-center text-xs text-slate-500">
        Secure payment powered by Stripe. 30-day money-back guarantee.
      </p>

      {/* Back to App Link */}
      {!isExpired && (
        <div className="text-center">
          <Link
            href="/budget-app"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Continue with free trial ({daysRemaining} days left)
          </Link>
        </div>
      )}

      {/* Trial Info */}
      {isExpired && (
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-4 text-center">
          <p className="text-sm text-rose-300">
            Your {TRIAL_DURATION_DAYS}-day trial has ended. Upgrade to regain
            access to adding transactions, imports, and other features.
          </p>
        </div>
      )}
    </div>
  );
}
