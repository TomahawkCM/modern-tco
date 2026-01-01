'use client';

import { Button } from "@/components/ui/button";
import { useLandingContent } from "@/components/budget/landing/content";
import { AuroraBackground } from "@/components/budget/landing/AuroraBackground";
import { LogoMarquee } from "@/components/budget/landing/LogoMarquee";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';

type PreviewMode = "insights" | "budgets" | "subscriptions";

function ProductPreview() {
  const [mode, setMode] = useState<PreviewMode>("insights");
  const t = useTranslations('landing.heroSection');

  const modes: Array<{ id: PreviewMode; label: string }> = [
    { id: "insights", label: t('modes.insights') },
    { id: "budgets", label: t('modes.budgets') },
    { id: "subscriptions", label: t('modes.subscriptions') },
  ];

  const headerLabel =
    mode === "insights" ? t('modes.dashboard') : mode === "budgets" ? t('modes.budgets') : t('modes.subscriptions');

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/50">
      <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_20%_0%,rgba(99,102,241,0.12),transparent_60%),radial-gradient(900px_520px_at_100%_30%,rgba(20,184,166,0.18),transparent_55%)]" />

      <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="relative h-9 w-9 rounded-2xl bg-white/5">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-400/50 via-cyan-400/15 to-indigo-500/35" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-semibold text-white">{headerLabel}</div>
            <div className="text-xs text-slate-400">{t('preview.livePreview')}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1 sm:flex">
            {modes.map((m) => {
              const isActive = m.id === mode;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  aria-pressed={isActive}
                  className={[
                    "rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070A12]",
                    isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5",
                  ].join(" ")}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
          <div className="h-9 w-9 rounded-2xl border border-white/10 bg-white/[0.03]" />
        </div>
      </div>

      <div className="relative p-5">
        {mode === "insights" ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              { label: "Net worth", value: "$24,500", tone: "bg-white/5" },
              { label: "Income", value: "$6,120", tone: "bg-emerald-500/10" },
              { label: "Expenses", value: "$3,980", tone: "bg-rose-500/10" },
            ].map((m) => (
              <div
                key={m.label}
                className={`rounded-2xl border border-white/10 p-4 shadow-lg shadow-black/20 ${m.tone}`}
              >
                <div className="text-xs font-medium text-slate-400">{m.label}</div>
                <div className="mt-2 text-2xl font-bold text-white">{m.value}</div>
                <div className="mt-3 h-2 w-24 rounded bg-white/10" />
              </div>
            ))}
          </div>
        ) : mode === "budgets" ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white">{t('preview.categoryBudgets')}</div>
              <div className="h-8 w-24 rounded-xl bg-white/5" />
            </div>
            <div className="mt-4 space-y-3">
              {[
                { name: "Groceries", used: 72, color: "bg-emerald-400" },
                { name: "Dining", used: 88, color: "bg-amber-300" },
                { name: "Shopping", used: 112, color: "bg-rose-400" },
              ].map((b) => (
                <div key={b.name} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="font-medium text-slate-200">{b.name}</div>
                    <div className="text-slate-400">{b.used}%</div>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className={`h-2 ${b.color}`} style={{ width: `${Math.min(b.used, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white">{t('preview.recurring')}</div>
              <div className="h-8 w-24 rounded-xl bg-white/5" />
            </div>
            <div className="mt-4 space-y-3">
              {[
                { name: "Netflix", meta: "Monthly", amt: "$15.99" },
                { name: "Spotify", meta: "Monthly", amt: "$10.99" },
                { name: "Cloud storage", meta: "Yearly", amt: "$99.00" },
              ].map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-slate-200">{s.name}</div>
                    <div className="text-xs text-slate-500">{s.meta}</div>
                  </div>
                  <div className="ml-4 text-sm font-semibold text-white">{s.amt}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pb-5">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white">{t('preview.recentTransactions')}</div>
            <div className="h-8 w-24 rounded-xl bg-white/5" />
          </div>
          <div className="mt-4 space-y-3">
            {[
              { name: "Grocery Store", meta: "Food • Today", amt: "-$124.50", amtClass: "text-white" },
              { name: "Salary", meta: "Income • Yesterday", amt: "+$4,250.00", amtClass: "text-emerald-400" },
              { name: "Netflix", meta: "Subscription • Oct 24", amt: "-$15.99", amtClass: "text-white" },
            ].map((t) => (
              <div
                key={t.name}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-slate-200">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.meta}</div>
                </div>
                <div className={`ml-4 text-sm font-semibold ${t.amtClass}`}>{t.amt}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const content = useLandingContent();
  const t = useTranslations('landing.heroSection');

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative overflow-hidden pt-12 sm:pt-16">
      <AuroraBackground />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8">
        <motion.div
          className="pb-10"
          initial={false}
          animate={mounted ? { opacity: 1, y: 0 } : { opacity: 1, y: 14 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-slate-100">
            <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-gradient-to-r from-teal-300 to-cyan-300" />
            {content.hero.badge}
          </div>

          <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
            <span className="block">{content.hero.headline}</span>
            <span className="mt-2 block bg-gradient-to-r from-teal-200 via-cyan-200 to-indigo-200 bg-clip-text text-transparent">
              {t('cta.heading')}
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-slate-300 sm:text-lg">
            {content.hero.subhead}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href={content.hero.primaryCta.href}>
              <Button className="h-12 w-full rounded-xl bg-gradient-to-r from-teal-300 to-cyan-300 px-6 text-base font-extrabold text-slate-900 hover:from-teal-200 hover:to-cyan-200 sm:w-auto">
                {content.hero.primaryCta.label}
              </Button>
            </Link>
            <Link
              href={content.pricing.secondary.href}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] px-6 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              {t('cta.viewPricing')}
            </Link>
          </div>

          <p className="mt-4 text-sm text-slate-400">{content.hero.finePrint}</p>

          <div className="mt-8 flex items-center gap-4 text-xs text-slate-400">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{t('badges.noSubscriptions')}</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{t('badges.offlineReady')}</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{t('badges.seniorsMode')}</span>
          </div>
          <div className="mt-8">
            <LogoMarquee />
          </div>
        </motion.div>

        <motion.div
          className="pb-14 lg:pb-16"
          initial={false}
          animate={mounted ? { opacity: 1, y: 0 } : { opacity: 1, y: 18 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.05 }}
        >
          <ProductPreview />
        </motion.div>
      </div>
    </section>
  );
}


